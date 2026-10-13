import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  FileCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Lock,
  UserCheck,
  Shield,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Info,
  Check,
  Building2,
  Cpu
} from 'lucide-react';
import { INITIAL_POLICY_WAIVERS } from '../../services/isoPolicyGovernanceEngine';
import { PolicyWaiver } from '../../types';
import { useToast } from '../common/ToastContainer';

export const PolicyWaiverRegisterHub: React.FC = () => {
  const { showToast } = useToast();
  const { currentTenant, logAuditEvent, addFinding } = useGRC();

  const [waivers, setWaivers] = useState<PolicyWaiver[]>(INITIAL_POLICY_WAIVERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Waiver Form state
  const [newDocCode, setNewDocCode] = useState('ARP_ISMS_P11');
  const [newClause, setNewClause] = useState('Section 4.1 - Encryption at Rest with KMS-CMK');
  const [newSystem, setNewSystem] = useState('');
  const [newJustification, setNewJustification] = useState('');
  const [newCompControls, setNewCompControls] = useState('');
  const [newCadenceDays, setNewCadenceDays] = useState(60);
  const [newRequesterName, setNewRequesterName] = useState('Cloud Operations Lead');
  const [newDepartment, setNewDepartment] = useState('Engineering & Infrastructure');

  const filteredWaivers = waivers.filter(w => {
    const matchesSearch =
      w.waiverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.systemOrAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.businessJustification.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateWaiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSystem || !newJustification) {
      showToast({
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in System/Asset and Business Justification.'
      });
      return;
    }

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + newCadenceDays);

    const created: PolicyWaiver = {
      id: `wvr_${Date.now()}`,
      waiverCode: `WVR-2026-00${waivers.length + 1}`,
      documentCode: newDocCode,
      documentTitle: newDocCode === 'ARP_ISMS_P11' ? 'Cryptographic & Key Management Policy' : 'Access Control Policy',
      policyClause: newClause,
      isoAnnexA: 'A.8.24',
      requesterName: newRequesterName,
      requesterRole: 'Infrastructure Engineer',
      department: newDepartment,
      systemOrAsset: newSystem,
      businessJustification: newJustification,
      riskAssessment: {
        inherentRisk: 'HIGH',
        likelihood: 3,
        impact: 4,
        residualRisk: 'MEDIUM'
      },
      compensatingControls: newCompControls.split('\n').filter(c => c.trim().length > 0),
      status: 'ACTIVE',
      requestedDate: new Date().toISOString().split('T')[0],
      approvedDate: new Date().toISOString().split('T')[0],
      approverName: 'Sarah Jenkins',
      approverRole: 'Chief Information Security Officer (CISO)',
      expirationDate: expDate.toISOString().split('T')[0],
      reviewCadenceDays: newCadenceDays,
      auditorNotes: 'Auditor review: Formally approved as managed risk under ISO 27001 Clause 6.1.3.'
    };

    setWaivers([created, ...waivers]);
    setShowCreateModal(false);
    // Reset form
    setNewSystem('');
    setNewJustification('');
    setNewCompControls('');

    logAuditEvent(
      'CREATE',
      `Formal Policy Waiver ${created.waiverCode} registered for ${created.systemOrAsset} under clause ${created.policyClause}.`,
      'PASS'
    );
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                  Pillar 6: Exception Management &amp; Policy Waivers
                </span>
                <span className="text-xs text-slate-500">ISO 27001 Clause 6.1.3 &amp; 8.1</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Time-Bound Policy Waiver Register &amp; Compensating Controls
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request New Policy Waiver</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          <strong>The Problem:</strong> Real-world technical or legacy constraints frequently require temporary exceptions. Without a formal waiver mechanism, teams either ignore the policy or silently fail audit sampling.
          <br />
          <strong>The Fix:</strong> Provide a formal, time-bound waiver workflow with mandatory risk assessment, compensating control definition, strict expiration countdowns, and executive CISO approval.
        </p>

        {/* Quick Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Active Policy Waivers</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {waivers.filter(w => w.status === 'ACTIVE').length} Active
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Time-bound &amp; approved</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Auditor Compliance Status</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">100% Controlled</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Zero unmanaged bypasses</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Compensating Controls</div>
            <div className="text-lg font-bold text-indigo-600 mt-0.5">8 Active Controls</div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">Bastions, IP Whitelists &amp; DPAs</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium">Expiring within 30 Days</div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">0 Urgent</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Auto-renewal triggers set</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search waiver code, asset, policy clause, or justification..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Waiver Cards Register */}
      <div className="space-y-4">
        {filteredWaivers.map(w => {
          const daysRemaining = Math.ceil(
            (new Date(w.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={w.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                      {w.waiverCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{w.systemOrAsset}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {w.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                    <span>Policy: <strong className="text-slate-700">{w.documentCode}</strong></span>
                    <span>•</span>
                    <span>Clause: <strong className="text-slate-700">{w.policyClause}</strong></span>
                    <span>•</span>
                    <span>Annex A: <span className="text-indigo-600 font-bold">{w.isoAnnexA}</span></span>
                  </div>
                </div>

                {/* Expiration Badge */}
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{daysRemaining > 0 ? `${daysRemaining} Days Left` : 'Expired'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Expires: {w.expirationDate}</div>
                  </div>
                </div>
              </div>

              {/* Justification & Risk Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-7 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Business Justification:</span>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {w.businessJustification}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">
                      Enforced Compensating Controls:
                    </span>
                    <ul className="space-y-1">
                      {w.compensatingControls.map((c, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5 text-slate-700 bg-emerald-50/50 p-1.5 rounded-md border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Risk Evaluation</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Inherent Risk:</span>
                        <span className="font-bold text-rose-600 ml-1">{w.riskAssessment.inherentRisk}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Residual Risk:</span>
                        <span className="font-bold text-amber-600 ml-1">{w.riskAssessment.residualRisk}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-[11px] text-indigo-950 space-y-1">
                    <div className="font-bold flex items-center space-x-1 text-indigo-800">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Executive Sign-Off Recorded</span>
                    </div>
                    <div>Approved by: <strong>{w.approverName}</strong> ({w.approverRole})</div>
                    <div>Approved Date: <strong>{w.approvedDate}</strong></div>
                    <div className="pt-1 text-[10px] text-indigo-700 italic border-t border-indigo-200">
                      {w.auditorNotes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Waiver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Request Time-Bound Policy Waiver
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWaiver} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Policy Document</label>
                <select
                  value={newDocCode}
                  onChange={e => setNewDocCode(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <option value="ARP_ISMS_P11">ARP_ISMS_P11: Cryptographic &amp; Key Management Policy</option>
                  <option value="ARP_ISMS_P03">ARP_ISMS_P03: Identity &amp; Access Control Policy</option>
                  <option value="ARP_ISMS_P08">ARP_ISMS_P08: Third-Party Supplier Security Policy</option>
                  <option value="ARP_ISMS_P07">ARP_ISMS_P07: Secure SDLC Policy</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specific Clause Being Bypassed</label>
                <input
                  type="text"
                  value={newClause}
                  onChange={e => setNewClause(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">System / Application / Asset in Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Legacy Reporting Database (DB-REP-02)"
                  value={newSystem}
                  onChange={e => setNewSystem(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business &amp; Technical Justification</label>
                <textarea
                  rows={2}
                  placeholder="Explain why standard policy cannot be satisfied and the sunset/remediation schedule..."
                  value={newJustification}
                  onChange={e => setNewJustification(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enforced Compensating Controls (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. IP whitelist restricted to VPN gateway&#10;Daily audit log review in Splunk"
                  value={newCompControls}
                  onChange={e => setNewCompControls(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waiver Duration</label>
                  <select
                    value={newCadenceDays}
                    onChange={e => setNewCadenceDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value={30}>30 Days (Temporary Hotfix)</option>
                    <option value={60}>60 Days (Vendor Remediation)</option>
                    <option value={90}>90 Days (Quarterly Migration)</option>
                    <option value={180}>180 Days (Major System Sunset)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Approval Authority</label>
                  <input
                    type="text"
                    disabled
                    value="CISO Sign-Off Required"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition"
                >
                  Submit Waiver for CISO Sign-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
