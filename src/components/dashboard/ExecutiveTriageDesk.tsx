import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  AlertTriangle,
  FolderCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Users,
  Building,
  UploadCloud,
  Wrench,
  Bot,
  Filter,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export type UserViewRole = 'executive' | 'ciso' | 'process_owner' | 'auditor' | 'employee';

interface AttentionTask {
  id: string;
  category: 'EVIDENCE' | 'REMEDIATION' | 'EXPIRY' | 'VENDOR' | 'POLICY' | 'AWARENESS';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  affectedControl: string;
  framework: string;
  dueDate: string;
  owner: string;
  actionLabel: string;
  actionModule: string;
  roles: UserViewRole[];
}

const ATTENTION_QUEUE: AttentionTask[] = [
  {
    id: 'att-1',
    category: 'EVIDENCE',
    severity: 'HIGH',
    title: 'Finance user access review evidence is pending',
    description: 'Quarterly review of ERP, accounting databases, and wire approval users has not been submitted.',
    affectedControl: 'A.5.15 Access Control',
    framework: 'ISO 27001 • SOC 2 CC6.1 • MAS TRM 8.1',
    dueDate: 'In 2 days',
    owner: 'CFO / Finance Lead',
    actionLabel: 'Upload Evidence',
    actionModule: 'evidence_upload',
    roles: ['executive', 'ciso', 'process_owner']
  },
  {
    id: 'att-2',
    category: 'REMEDIATION',
    severity: 'CRITICAL',
    title: '3 high-risk controls require remediation',
    description: 'Staging environment unencrypted databases and missing MFA on administrative consoles exceed risk tolerance.',
    affectedControl: 'A.8.20 Network Security & A.8.24 Crypto',
    framework: 'ISO 27001 • MAS Notice 655 Cl. 4',
    dueDate: 'Overdue by 3 days',
    owner: 'DevOps / SecOps Lead',
    actionLabel: 'Run Remediation',
    actionModule: 'remediation_desk',
    roles: ['executive', 'ciso', 'auditor']
  },
  {
    id: 'att-3',
    category: 'EXPIRY',
    severity: 'HIGH',
    title: 'Access Review evidence expires in 5 days',
    description: 'Q2 Production AWS IAM privileged credentials sign-off reaches 90-day validity window limit.',
    affectedControl: 'A.5.18 Access Rights',
    framework: 'ISO 27001 • SOC 2 CC6.2',
    dueDate: '5 days remaining',
    owner: 'Head of Infrastructure',
    actionLabel: 'Request Renewal',
    actionModule: 'evidence_centre',
    roles: ['ciso', 'process_owner', 'auditor']
  },
  {
    id: 'att-4',
    category: 'VENDOR',
    severity: 'MEDIUM',
    title: 'Vendor assessment is overdue for critical cloud hosting',
    description: 'Annual SOC 2 Type II attestation report collection for AWS and Stripe API gateway is pending.',
    affectedControl: 'A.5.19 Supplier Relationships',
    framework: 'ISO 27001 • MAS TRM 6.1',
    dueDate: 'Overdue by 5 days',
    owner: 'Procurement / Legal',
    actionLabel: 'Send Assessment',
    actionModule: 'vendors',
    roles: ['executive', 'ciso', 'process_owner']
  },
  {
    id: 'att-5',
    category: 'POLICY',
    severity: 'MEDIUM',
    title: 'Annual Information Security Policy acknowledgment pending',
    description: '14 staff members in Engineering have not attested to POL-01 and POL-04 security guidelines.',
    affectedControl: 'A.5.1 Policies for InfoSec',
    framework: 'ISO 27001 • Clause 5.2',
    dueDate: 'In 4 days',
    owner: 'People & HR Lead',
    actionLabel: 'Send Reminders',
    actionModule: 'policies',
    roles: ['ciso', 'process_owner', 'employee']
  }
];

interface Props {
  onNavigateModule: (moduleId: string) => void;
  onOpenAiCopilot?: (prompt?: string) => void;
}

export const ExecutiveTriageDesk: React.FC<Props> = ({
  onNavigateModule,
  onOpenAiCopilot
}) => {
  const { theme, currentRole } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  // Role Perspective: Executive, CISO, Process Owner, Auditor, Employee
  const [selectedRole, setSelectedRole] = useState<UserViewRole>('executive');
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([]);

  const filteredTasks = ATTENTION_QUEUE.filter(
    task => task.roles.includes(selectedRole) && !dismissedTaskIds.includes(task.id)
  );

  const handleExecuteAction = (task: AttentionTask) => {
    showToast({
      title: 'Action Triggered',
      message: `Navigating to ${task.actionModule} to resolve: ${task.title}`,
      type: 'info'
    });
    onNavigateModule(task.actionModule);
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedTaskIds(prev => [...prev, id]);
    showToast({
      title: 'Task Acknowledged',
      message: 'Item deferred to regular review cycle.',
      type: 'info'
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Six Executive Clean KPI Tiles (Section 6 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Compliance Readiness: 82% */}
        <div
          onClick={() => onNavigateModule('frameworks')}
          className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
            isLight
              ? 'bg-white border-slate-200 hover:border-blue-400 shadow-2xs'
              : 'bg-slate-900 border-slate-800 hover:border-blue-500 shadow-sm'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Compliance Readiness
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">82%</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Target: 85% for Stage 1
          </div>
        </div>

        {/* Critical Gaps: 7 */}
        <div
          onClick={() => onNavigateModule('gap_assessment')}
          className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
            isLight
              ? 'bg-white border-slate-200 hover:border-rose-400 shadow-2xs'
              : 'bg-slate-900 border-slate-800 hover:border-rose-500 shadow-sm'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Critical Gaps
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">7</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
              High Priority
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            3 Technical • 4 Governance
          </div>
        </div>

        {/* Open Risks: 14 */}
        <div
          onClick={() => onNavigateModule('risk_assessment')}
          className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
            isLight
              ? 'bg-white border-slate-200 hover:border-amber-400 shadow-2xs'
              : 'bg-slate-900 border-slate-800 hover:border-amber-500 shadow-sm'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Open Risks
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">14</span>
            <span className="text-[10px] text-slate-500">RTP Active</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            2 Exceed Appetite
          </div>
        </div>

        {/* Evidence Pending: 23 */}
        <div
          onClick={() => onNavigateModule('evidence_centre')}
          className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
            isLight
              ? 'bg-white border-slate-200 hover:border-indigo-400 shadow-2xs'
              : 'bg-slate-900 border-slate-800 hover:border-indigo-500 shadow-sm'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Evidence Pending
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">23</span>
            <span className="text-[10px] text-slate-500">of 142 total</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            5 Expiring in 7 days
          </div>
        </div>

        {/* Overdue Actions: 5 */}
        <div
          onClick={() => onNavigateModule('findings_capa')}
          className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
            isLight
              ? 'bg-white border-slate-200 hover:border-red-400 shadow-2xs'
              : 'bg-slate-900 border-slate-800 hover:border-red-500 shadow-sm'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Overdue Actions
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-600 dark:text-red-400">5</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
              SLA Breach
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Requires Escalation
          </div>
        </div>

        {/* Audit Readiness: 76% */}
        <div
          onClick={() => onNavigateModule('readiness_cert')}
          className={`p-3.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
            isLight
              ? 'bg-white border-slate-200 hover:border-emerald-400 shadow-2xs'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-sm'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Audit Readiness
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">76%</span>
            <span className="text-[10px] font-bold text-emerald-600">Stage 1 Pass</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            Stage 2 Target: 85%
          </div>
        </div>
      </div>

      {/* 2. "What Needs My Attention?" Prioritized Action Queue */}
      <div
        className={`p-5 rounded-2xl border ${
          isLight
            ? 'bg-white border-slate-200 shadow-2xs'
            : 'bg-slate-900 border-slate-800 shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                What Needs My Attention?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Action-oriented priority stack sorted by audit impact and regulatory SLA
              </p>
            </div>
          </div>

          {/* Role Perspective Selector Tabs (Section 5 Requirement) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedRole('executive')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedRole === 'executive'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Executive
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('ciso')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedRole === 'ciso'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              CISO
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('process_owner')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedRole === 'process_owner'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Process Owner
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('auditor')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedRole === 'auditor'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Auditor
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('employee')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                selectedRole === 'employee'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Employee
            </button>
          </div>
        </div>

        {/* Priority Action Items */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-semibold">No critical attention items for this role perspective.</div>
              <p className="text-xs text-slate-400 mt-1">All assigned controls and evidence requests are currently within SLA.</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => (
              <div
                key={task.id}
                onClick={() => handleExecuteAction(task)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-white hover:bg-blue-50/40 border-slate-200 hover:border-blue-300'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      task.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                        : task.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          task.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950 dark:border-rose-800'
                            : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950 dark:border-amber-800'
                        }`}
                      >
                        {task.severity}
                      </span>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        • {task.dueDate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {task.description}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>Control: <strong className="text-slate-700 dark:text-slate-300">{task.affectedControl}</strong></span>
                      <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{task.owner}</strong></span>
                      <span className="hidden sm:inline">Frameworks: {task.framework}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {onOpenAiCopilot && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAiCopilot(`How should I resolve this item: "${task.title}" for control ${task.affectedControl}?`);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Ask AI Copilot for solution advice"
                    >
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecuteAction(task);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <span>{task.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
