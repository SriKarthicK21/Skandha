import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  UserCheck,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronRight,
  ListTodo,
  Plus,
  Trash2,
  Building,
  Target,
  FileCheck,
  AlertCircle,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { ControlItem, RiskRecord } from '../../types';
import {
  ISO27001_2022_93_MASTER,
  ISO27001Control2022Meta
} from '../../data/iso27001_2022_masterControls';
import { getControlPerformanceStatus } from '../../utils/soaPerformanceHelper';

interface RemediationMilestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
  owner?: string;
}

interface SoAControlRemediationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  control: ControlItem | null;
  activeRisks?: RiskRecord[];
  onSave: (controlId: string, updated: Partial<ControlItem>) => void;
}

const COMMON_ROLES = [
  'CISO / Head of Security',
  'DevSecOps Engineering Lead',
  'Cloud Infrastructure Architect',
  'SecOps & Incident Response',
  'Compliance & Risk Officer',
  'Data Protection Officer (DPO)'
];

const DEPARTMENTS = [
  'Information Security',
  'IT & Cloud Infrastructure',
  'Engineering / DevOps',
  'Legal & Regulatory Compliance',
  'People Operations (HR)',
  'Physical Security & Facilities'
];

export const SoAControlRemediationDrawer: React.FC<SoAControlRemediationDrawerProps> = ({
  isOpen,
  onClose,
  control,
  activeRisks = [],
  onSave
}) => {
  if (!isOpen || !control) return null;

  const meta: ISO27001Control2022Meta | undefined = ISO27001_2022_93_MASTER.find(
    m => m.controlCode === control.controlCode
  );

  // Form State
  const [implementationNotes, setImplementationNotes] = useState<string>('');
  const [remediationOwner, setRemediationOwner] = useState<string>('');
  const [responsibleDepartment, setResponsibleDepartment] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [remediationPriority, setRemediationPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [implementationStatus, setImplementationStatus] = useState<ControlItem['implementationStatus']>(
    control.implementationStatus || 'Implemented'
  );
  const [milestones, setMilestones] = useState<RemediationMilestone[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState<string>('');
  const [showGuidance, setShowGuidance] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  // Sync state whenever control changes
  useEffect(() => {
    if (control) {
      setImplementationNotes(
        control.implementationNotes ||
          (control.clientComments ? `[Client Note]: ${control.clientComments}` : '')
      );
      setRemediationOwner(
        control.remediationOwner ||
          meta?.responsibleDepartment === 'Information Security'
            ? 'Sarah Chen (Head of SecOps)'
            : 'Marcus Brody (Cloud Infrastructure Lead)'
      );
      setResponsibleDepartment(
        control.responsibleDepartment || meta?.responsibleDepartment || 'Information Security'
      );
      setTargetDate(
        control.targetDate ||
          new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      setRemediationPriority(control.remediationPriority || 'Medium');
      setImplementationStatus(control.implementationStatus || 'Implemented');

      // Populate default milestones if none exist
      if (control.remediationMilestones && control.remediationMilestones.length > 0) {
        setMilestones(control.remediationMilestones);
      } else {
        const perf = getControlPerformanceStatus(control.implementationStatus);
        if (perf === 'Implemented') {
          setMilestones([
            { id: 'm-1', title: 'Operational control baseline implemented and verified', completed: true },
            { id: 'm-2', title: 'Automated telemetry and monitoring checks configured', completed: true },
            { id: 'm-3', title: 'Annual compliance review and evidence archive updated', completed: true }
          ]);
        } else if (perf === 'Partially Implemented') {
          setMilestones([
            { id: 'm-1', title: 'Technical architecture safeguard design approved', completed: true },
            { id: 'm-2', title: 'Deploy technical safeguard in staging environment', completed: false },
            { id: 'm-3', title: 'Conduct auditor verification and gather operational evidence', completed: false }
          ]);
        } else {
          setMilestones([
            { id: 'm-1', title: 'Formal gap assessment and vendor / tool evaluation', completed: false },
            { id: 'm-2', title: 'Remediation implementation plan sign-off by CISO', completed: false },
            { id: 'm-3', title: 'Production deployment and operational verification', completed: false }
          ]);
        }
      }
      setHasSaved(false);
    }
  }, [control, meta]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Calculate days remaining
  const calculateDaysRemaining = (): { days: number; text: string; color: string } => {
    if (!targetDate) return { days: 0, text: 'No deadline set', color: 'text-slate-400' };
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { days: diffDays, text: `${Math.abs(diffDays)}d overdue`, color: 'text-rose-400 bg-rose-950/80 border-rose-800' };
    } else if (diffDays === 0) {
      return { days: 0, text: 'Due today', color: 'text-amber-300 bg-amber-950/80 border-amber-800' };
    } else if (diffDays <= 14) {
      return { days: diffDays, text: `${diffDays}d remaining (Urgent)`, color: 'text-amber-400 bg-amber-950/80 border-amber-800' };
    } else {
      return { days: diffDays, text: `${diffDays}d remaining`, color: 'text-emerald-400 bg-emerald-950/80 border-emerald-800' };
    }
  };

  const deadlineInfo = calculateDaysRemaining();

  // Quick preset deadline setters
  const setDeadlinePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  const setQuarterPreset = (quarter: 'Q3' | 'Q4') => {
    const year = new Date().getFullYear();
    if (quarter === 'Q3') {
      setTargetDate(`${year}-09-30`);
    } else {
      setTargetDate(`${year}-12-31`);
    }
  };

  // Milestone toggles
  const handleToggleMilestone = (id: string) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    const newM: RemediationMilestone = {
      id: `m-${Date.now()}`,
      title: newMilestoneText.trim(),
      completed: false,
      targetDate: targetDate
    };
    setMilestones(prev => [...prev, newM]);
    setNewMilestoneText('');
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  // Quick template inserters for Implementation Notes
  const handleInsertTemplate = (templateType: 'TECHNICAL' | 'POLICY' | 'GAP' | 'VERIFICATION') => {
    let snippet = '';
    const now = new Date().toISOString().split('T')[0];
    switch (templateType) {
      case 'TECHNICAL':
        snippet = `\n\n[Technical Safeguard Configuration - ${now}]\n- Architecture: Cloud KMS customer managed keys with annual automatic key rotation.\n- Automation: Terraform IaC modules enforce encryption-at-rest across all S3 buckets and RDS clusters.\n- Telemetry: GuardDuty and AWS Config active with hourly compliance evaluation.`;
        break;
      case 'POLICY':
        snippet = `\n\n[Governance & Policy Rollout - ${now}]\n- Standard: Enforced under ISMS-POL-04 (Access Control & Key Management).\n- Training: Annual mandatory security awareness module delivered via LMS with 98% completion rate.\n- Cadence: Bi-annual access privilege review by department heads.`;
        break;
      case 'GAP':
        snippet = `\n\n[Remediation Gap Analysis - ${now}]\n- Identified Gap: Staging environments previously utilized long-lived static API credentials.\n- Corrective Action: Migrated to HashiCorp Vault dynamic ephemeral secrets with 4-hour TTL.\n- Completion Target: Full rollout to legacy microservices scheduled before target deadline.`;
        break;
      case 'VERIFICATION':
        snippet = `\n\n[Audit Verification & Testing - ${now}]\n- Testing Procedure: Penetration testing team performed credential extraction drill.\n- Result: Zero credential leaks detected. Pass criteria fulfilled.\n- Evidence File: Stored under EV-2026-Q3-KMS-ROTATION.pdf`;
        break;
    }
    setImplementationNotes(prev => (prev ? prev + snippet : snippet.trim()));
  };

  // Save changes
  const handleSave = () => {
    onSave(control.id, {
      implementationNotes,
      remediationOwner,
      responsibleDepartment,
      targetDate,
      remediationPriority,
      implementationStatus,
      remediationMilestones: milestones
    });
    setHasSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Milestone completion stats
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div
      id="soa-control-remediation-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="soa-control-remediation-drawer-panel"
          className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* 1. Header */}
          <div className="p-5 sm:p-6 bg-slate-950/90 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2.5 py-1 rounded-lg">
                  {control.controlCode}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded">
                  {control.category}
                </span>
                {meta?.isNewIn2022 && (
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    NEW 2022
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="close-remediation-drawer-btn"
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Close side drawer (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {control.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {control.description}
              </p>
            </div>

            {/* Quick Status & Countdown Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Implementation Status:</span>
                <select
                  id="remediation-status-select"
                  value={implementationStatus}
                  onChange={e => setImplementationStatus(e.target.value as ControlItem['implementationStatus'])}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Implemented">Implemented (Operational)</option>
                  <option value="In Progress">Partially Implemented (In Progress)</option>
                  <option value="Not Started">Planned (Roadmap Target)</option>
                  <option value="Monitored">Monitored (Continuous Telemetry)</option>
                  <option value="Audited">Audited (Verified by Auditor)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border flex items-center space-x-1.5 ${deadlineInfo.color}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{deadlineInfo.text}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* A. Assigned Owners & Department Section */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Remediation Ownership & Accountability
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Cl. 5.3 Org Roles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Remediation Lead Owner */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Remediation Owner / Lead
                  </label>
                  <input
                    id="remediation-owner-input"
                    type="text"
                    value={remediationOwner}
                    onChange={e => setRemediationOwner(e.target.value)}
                    placeholder="e.g. Sarah Chen (Head of SecOps)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Responsible Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Responsible Department
                  </label>
                  <select
                    id="responsible-department-select"
                    value={responsibleDepartment}
                    onChange={e => setResponsibleDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Role Suggestions */}
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                  Quick Assign Role Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRemediationOwner(role)}
                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/80 transition"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* B. Deadlines, Scheduling & Priority */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Remediation Deadline & Priority
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Cl. 6.1.3 Roadmap</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Remediation Deadline
                  </label>
                  <input
                    id="target-date-input"
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Remediation Priority
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => {
                      const isSelected = remediationPriority === p;
                      const colors = {
                        Low: isSelected ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-900 text-slate-400 border-slate-800',
                        Medium: isSelected ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-900 text-slate-400 border-slate-800',
                        High: isSelected ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800',
                        Critical: isSelected ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setRemediationPriority(p)}
                          className={`py-1.5 px-2 rounded-lg text-center text-xs font-bold border transition ${colors[p]}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Deadline Presets */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                  Preset Deadlines:
                </span>
                <button
                  type="button"
                  onClick={() => setDeadlinePreset(30)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-800 hover:border-slate-700"
                >
                  +30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlinePreset(60)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-800 hover:border-slate-700"
                >
                  +60 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlinePreset(90)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-800 hover:border-slate-700"
                >
                  +90 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuarterPreset('Q3')}
                  className="px-2 py-0.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-[10px] font-mono text-indigo-300 border border-indigo-850"
                >
                  End of Q3
                </button>
                <button
                  type="button"
                  onClick={() => setQuarterPreset('Q4')}
                  className="px-2 py-0.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-[10px] font-mono text-indigo-300 border border-indigo-850"
                >
                  End of Q4
                </button>
              </div>
            </div>

            {/* C. Specific Implementation Notes (Rich Textarea & Quick Templates) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Specific Implementation Notes & Safeguard Architecture
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {implementationNotes.length} characters
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Document technical configurations, architectural safeguards, compensating mechanisms, and auditor-facing verification details.
              </p>

              {/* Template Inserter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                  Insert Template:
                </span>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('TECHNICAL')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-300 border border-emerald-900/60 transition"
                >
                  + Technical Safeguards
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('POLICY')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-sky-300 border border-sky-900/60 transition"
                >
                  + Policy & Governance
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('GAP')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-300 border border-amber-900/60 transition"
                >
                  + Gap Analysis
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTemplate('VERIFICATION')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-purple-300 border border-purple-900/60 transition"
                >
                  + Verification Drill
                </button>
              </div>

              <textarea
                id="implementation-notes-textarea"
                value={implementationNotes}
                onChange={e => setImplementationNotes(e.target.value)}
                rows={7}
                placeholder="Write specific technical notes, configuration details, deployed tooling, cloud policies, or operational evidence location..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* D. Remediation Action Items & Milestones Checklist */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ListTodo className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Remediation Milestones ({completedMilestones}/{totalMilestones})
                  </h3>
                </div>

                <span className="text-[11px] font-mono font-bold text-indigo-400">
                  {milestonePercent}% Complete
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>

              {/* Milestone checklist items */}
              <div className="space-y-2">
                {milestones.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => handleToggleMilestone(m.id)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span
                        className={`text-xs ${
                          m.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {m.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Milestone Input */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={newMilestoneText}
                  onChange={e => setNewMilestoneText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMilestone();
                    }
                  }}
                  placeholder="Add remediation milestone or action item..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* E. ISO 27001 Context & Official Verification Expectations */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowGuidance(!showGuidance)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    ISO/IEC 27001:2022 Formal Guidance & Evidence Requirements
                  </span>
                </div>
                <span className="text-xs text-indigo-400 font-mono">
                  {showGuidance ? 'Hide ▲' : 'Show ▼'}
                </span>
              </button>

              {showGuidance && (
                <div className="p-4 pt-1 space-y-3 text-xs border-t border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-300 mb-1">Standard Implementation Guidance:</h4>
                    <p className="text-slate-400 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      {control.guidance || meta?.guidance || 'No specific guidance text.'}
                    </p>
                  </div>

                  {meta?.evidenceRequirements && meta.evidenceRequirements.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-300 mb-1">Expected Audit Evidence Artifacts:</h4>
                      <ul className="list-disc pl-5 space-y-0.5 text-slate-400">
                        {meta.evidenceRequirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meta?.auditorVerificationProcedure && (
                    <div>
                      <h4 className="font-bold text-slate-300 mb-1">Auditor Verification Procedure:</h4>
                      <p className="text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px]">
                        {meta.auditorVerificationProcedure}
                      </p>
                    </div>
                  )}

                  {/* Linked Risks */}
                  {control.mappedRiskCodes && control.mappedRiskCodes.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="font-bold text-slate-300 mr-2">Mapped Risks (Cl. 6.1.2):</span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {control.mappedRiskCodes.map(rCode => (
                          <span
                            key={rCode}
                            className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono text-[10px] font-bold"
                          >
                            {rCode}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Footer Bar */}
          <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-mono">{control.controlCode}</span>
              <span>•</span>
              <span className="font-medium text-slate-300">{remediationOwner || 'Unassigned'}</span>
              <span>•</span>
              <span className={deadlineInfo.color}>{targetDate || 'No date'}</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                id="save-remediation-plan-btn"
                type="button"
                onClick={handleSave}
                disabled={hasSaved}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg transition ${
                  hasSaved
                    ? 'bg-emerald-600 text-white shadow-emerald-950/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
                }`}
              >
                {hasSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Remediation Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
