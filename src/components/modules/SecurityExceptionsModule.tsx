import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  ShieldAlert,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Lock,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Flame,
  CheckSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import { useToast } from '../common/ToastContainer';

interface SecurityException {
  id: string;
  exceptionCode: string;
  title: string;
  controlCode: string;
  framework: string;
  riskRating: 'Critical' | 'High' | 'Medium' | 'Low';
  businessJustification: string;
  compensatingControls: string;
  requestedBy: string;
  approvedBy: string | null;
  approvalDate: string | null;
  expiryDate: string;
  status: 'Pending Approval' | 'Approved' | 'Expired' | 'Revoked';
  reviewNotes: string;
}

export const SecurityExceptionsModule: React.FC = () => {
  const { currentTenant, currentRole, theme, setActiveModule } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [exceptions, setExceptions] = useState<SecurityException[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newControlCode, setNewControlCode] = useState('A.5.15 Access Control');
  const [newFramework, setNewFramework] = useState('ISO/IEC 27001:2022');
  const [newRiskRating, setNewRiskRating] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [newJustification, setNewJustification] = useState('');
  const [newCompensatingControls, setNewCompensatingControls] = useState('');
  const [newExpiryDays, setNewExpiryDays] = useState('90');

  const fetchExceptions = () => {
    setLoading(true);
    fetch('/api/v1/exceptions', {
      headers: { 'x-tenant-id': currentTenant?.id || 'tenant_skanda' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.exceptions) {
          setExceptions(data.exceptions);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExceptions();
  }, [currentTenant?.id]);

  const handleCreateException = (e: React.FormEvent) => {
    e.preventDefault();
    const expiry = new Date(Date.now() + parseInt(newExpiryDays, 10) * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0];

    fetch('/api/v1/exceptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': currentTenant?.id || 'tenant_skanda'
      },
      body: JSON.stringify({
        title: newTitle,
        controlCode: newControlCode,
        framework: newFramework,
        riskRating: newRiskRating,
        businessJustification: newJustification,
        compensatingControls: newCompensatingControls,
        expiryDate: expiry,
        requestedBy: currentRole || 'Lead Security Architect'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast({
            title: 'Exception Waiver Requested',
            message: `Waiver ${data.exception.exceptionCode} submitted for CISO review`,
            type: 'success'
          });
          setShowCreateModal(false);
          setNewTitle('');
          setNewJustification('');
          setNewCompensatingControls('');
          fetchExceptions();
        }
      })
      .catch(err => {
        showToast({ title: 'Error', message: err.message, type: 'error' });
      });
  };

  const handleApproveException = (id: string) => {
    fetch(`/api/v1/exceptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': currentTenant?.id || 'tenant_skanda'
      },
      body: JSON.stringify({
        status: 'Approved',
        approvedBy: 'Marcus Aurelius (CISO)',
        approvalDate: new Date().toISOString().split('T')[0]
      })
    })
      .then(res => res.json())
      .then(() => {
        showToast({
          title: 'Exception Approved',
          message: 'Security exception approved with active compensating controls',
          type: 'success'
        });
        fetchExceptions();
      });
  };

  const handleRevokeException = (id: string) => {
    fetch(`/api/v1/exceptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': currentTenant?.id || 'tenant_skanda'
      },
      body: JSON.stringify({
        status: 'Revoked',
        reviewNotes: 'Exception revoked by CISO Risk Committee'
      })
    })
      .then(res => res.json())
      .then(() => {
        showToast({
          title: 'Exception Revoked',
          message: 'Security exception revoked; control returned to active enforcement',
          type: 'info'
        });
        fetchExceptions();
      });
  };

  const filtered = exceptions.filter(exc => {
    if (statusFilter !== 'ALL' && exc.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        exc.title.toLowerCase().includes(q) ||
        exc.controlCode.toLowerCase().includes(q) ||
        exc.exceptionCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageContainer id="security-exceptions-module">
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Security Exceptions & Waivers
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase">
                  Lifecycle Governed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Formal risk acceptance, compensating controls verification, and time-bounded exception governance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={fetchExceptions}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Exception Waiver</span>
            </button>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Exceptions</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{exceptions.length}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Pending CISO Approval</span>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {exceptions.filter(e => e.status === 'Pending Approval').length}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Active Approved Waivers</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {exceptions.filter(e => e.status === 'Approved').length}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
            <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Compensating Controls</span>
            <p className="text-2xl font-black text-indigo-400 mt-1">100% Verified</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exceptions or controls..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {['ALL', 'Pending Approval', 'Approved', 'Expired', 'Revoked'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Exceptions Grid / List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center border rounded-2xl border-dashed border-slate-700 text-slate-400">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">No Security Exceptions Found</p>
              <p className="text-xs text-slate-500 mt-1">
                Zero active exceptions indicates full adherence to standard baseline controls.
              </p>
            </div>
          ) : (
            filtered.map(exc => (
              <div
                key={exc.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-800/70 border-slate-700/80 shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-slate-200 dark:border-slate-700/60">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-black text-amber-500">
                        {exc.exceptionCode}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          exc.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : exc.status === 'Pending Approval'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {exc.status}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-600 font-semibold">
                        Risk: {exc.riskRating}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {exc.title}
                    </h3>

                    <div className="text-xs font-mono text-slate-400 mt-1">
                      Target Control: <strong className="text-sky-400">{exc.controlCode}</strong> • {exc.framework}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {exc.status === 'Pending Approval' && (
                      <button
                        onClick={() => handleApproveException(exc.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Waiver</span>
                      </button>
                    )}
                    {exc.status === 'Approved' && (
                      <button
                        onClick={() => handleRevokeException(exc.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Revoke Waiver</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Justification & Compensating Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-700/50 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Business Justification
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">{exc.businessJustification}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Mandatory Compensating Controls
                    </span>
                    <p className="text-emerald-200 leading-relaxed font-sans">{exc.compensatingControls}</p>
                  </div>
                </div>

                {/* Metadata Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/40 text-xs text-slate-400 font-mono">
                  <div>
                    Requested by: <strong className="text-slate-200">{exc.requestedBy}</strong>
                  </div>
                  <div>
                    Approved by: <strong className="text-slate-200">{exc.approvedBy || 'Pending CISO'}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Clock className="w-3 h-3" />
                    Expires: {exc.expiryDate}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Exception Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4 text-white shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold">Request Security Exception Waiver</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateException} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1">
                    Exception Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Legacy SFTP Service Account MFA Exemption"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1">
                      Control Code
                    </label>
                    <input
                      type="text"
                      required
                      value={newControlCode}
                      onChange={e => setNewControlCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1">
                      Inherent Risk
                    </label>
                    <select
                      value={newRiskRating}
                      onChange={e => setNewRiskRating(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1">
                    Business Justification
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Explain why standard control cannot be applied and the business necessity..."
                    value={newJustification}
                    onChange={e => setNewJustification(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1">
                    Compensating Controls
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detail specific mitigating technical or organizational measures..."
                    value={newCompensatingControls}
                    onChange={e => setNewCompensatingControls(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono uppercase text-[10px] mb-1">
                    Requested Duration
                  </label>
                  <select
                    value={newExpiryDays}
                    onChange={e => setNewExpiryDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days (Standard Maximum)</option>
                    <option value="180">180 Days (Requires Board Review)</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
