import React, { useState, useEffect } from 'react';
import {
  Workflow,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  FileCheck2,
  FolderCheck,
  Award,
  Calendar,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { useToast } from '../common/ToastContainer';

interface WorkflowTask {
  id: string;
  type: 'EVIDENCE_APPROVAL' | 'RISK_EXCEPTION' | 'CAPA_VERIFICATION' | 'POLICY_RATIFICATION' | 'RISK_ACCEPTANCE';
  title: string;
  module: string;
  initiator: string;
  assignee: string;
  role: string;
  slaHoursRemaining: number;
  dueDate: string;
  status: 'PENDING_APPROVAL' | 'IN_REVIEW' | 'FIELDWORK_VERIFICATION' | 'AWAITING_BOARD_SIGNOFF' | 'APPROVED' | 'REJECTED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export const WorkflowsModule: React.FC = () => {
  const { currentTenant, currentRole, theme, setActiveModule } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [workflows, setWorkflows] = useState<WorkflowTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchWorkflows = () => {
    setLoading(true);
    fetch('/api/v1/workflows', {
      headers: { 'x-tenant-id': currentTenant?.id || 'tenant_skanda' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.workflows) {
          setWorkflows(data.workflows);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkflows();
  }, [currentTenant?.id]);

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    fetch(`/api/v1/workflows/${id}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': currentTenant?.id || 'tenant_skanda'
      },
      body: JSON.stringify({ action, actor: currentRole || 'Lead Auditor' })
    })
      .then(res => res.json())
      .then(() => {
        showToast({
          title: `Workflow ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
          message: `Task ${id} has been processed and recorded in the audit trail.`,
          type: action === 'APPROVE' ? 'success' : 'info'
        });
        setWorkflows(prev =>
          prev.map(w => (w.id === id ? { ...w, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : w))
        );
      });
  };

  const filtered = workflows.filter(w => {
    if (filterType !== 'ALL' && w.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.assignee.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageContainer id="workflows-module">
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Enterprise Workflows & Approvals
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                  SLA Monitored
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Centralized queue for cross-department signoffs, risk approvals, CAPA validations, and evidence reviews.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={fetchWorkflows}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Pending Approvals</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {workflows.filter(w => w.status !== 'APPROVED' && w.status !== 'REJECTED').length}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">SLA &lt; 24h</span>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {workflows.filter(w => w.slaHoursRemaining < 24 && w.status !== 'APPROVED').length}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">Evidence Queue</span>
            <p className="text-2xl font-black text-indigo-400 mt-1">
              {workflows.filter(w => w.type === 'EVIDENCE_APPROVAL').length}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Audit Trail Sign-Offs</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">100% Immutable</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows, assignees..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {['ALL', 'EVIDENCE_APPROVAL', 'RISK_EXCEPTION', 'CAPA_VERIFICATION', 'POLICY_RATIFICATION'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  filterType === t
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Items List */}
        <div className="space-y-3">
          {filtered.map(wf => (
            <div
              key={wf.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isLight
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-800/70 border-slate-700/80 shadow-md'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-400">{wf.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-600 font-semibold uppercase">
                      {wf.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        wf.priority === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {wf.priority}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />
                      {wf.slaHoursRemaining}h SLA
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                    {wf.title}
                  </h3>

                  <div className="flex items-center space-x-4 mt-2 text-xs font-mono text-slate-400">
                    <span>
                      Initiator: <strong className="text-slate-300">{wf.initiator}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Assignee: <strong className="text-slate-300">{wf.assignee}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target Date: <strong className="text-slate-300">{wf.dueDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  {wf.status !== 'APPROVED' && wf.status !== 'REJECTED' ? (
                    <>
                      <button
                        onClick={() => handleAction(wf.id, 'APPROVE')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleAction(wf.id, 'REJECT')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-bold">
                      {wf.status}
                    </span>
                  )}
                  <button
                    onClick={() => setActiveModule(wf.module as any)}
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
                    title="Open Source Module"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
