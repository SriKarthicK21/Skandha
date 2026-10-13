import React, { useState, useMemo } from 'react';
import {
  DPDPDataProcessorRecord,
  INITIAL_DATA_PROCESSORS
} from '../../data/dpdpExtendedTypes';
import {
  Server,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Filter,
  FileText,
  BadgeAlert,
  Award,
  Layers,
  Building2,
  Shield
} from 'lucide-react';

export const DPDPProcessorDpaModule: React.FC = () => {
  const [processors, setProcessors] = useState<DPDPDataProcessorRecord[]>(INITIAL_DATA_PROCESSORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New DPA form state
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCategory, setNewCategory] = useState<any>('Cloud Hosting & Storage');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newJurisdiction, setNewJurisdiction] = useState('India');
  const [newSlaHours, setNewSlaHours] = useState<number>(2);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredProcessors = useMemo(() => {
    return processors.filter(p => {
      const matchSearch =
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.processorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || p.serviceCategory === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [processors, searchTerm, categoryFilter]);

  // Operational metrics
  const activeDpaCount = processors.filter(p => p.dpaStatus === 'EXECUTED_ACTIVE').length;
  const compliantSlaCount = processors.filter(p => p.breachEscalationSlaHours <= 2).length;
  const avgDueDiligence = Math.round(processors.reduce((acc, p) => acc + p.dueDiligenceScore, 0) / processors.length);

  const handleAddProcessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newContactEmail) return;

    const newRec: DPDPDataProcessorRecord = {
      id: `prc_${Date.now()}`,
      processorCode: `PRC-${newCompanyName.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      companyName: newCompanyName,
      contactPerson: 'Lead Security Officer',
      contactEmail: newContactEmail,
      registeredJurisdiction: newJurisdiction,
      serviceCategory: newCategory,
      dpaStatus: 'EXECUTED_ACTIVE',
      dpaSignedDate: new Date().toISOString().split('T')[0],
      dpaValidUntil: '2028-09-01',
      dpaDocumentRef: `DPA-${newCompanyName.substring(0, 4).toUpperCase()}-2026-v1`,
      hasSubprocessorClause: true,
      subprocessorsCount: 3,
      breachEscalationSlaHours: Number(newSlaHours),
      securityCertifications: ['ISO 27001:2022', 'SOC 2 Type II'],
      lastAuditDate: new Date().toISOString().split('T')[0],
      nextAuditDueDate: '2027-09-01',
      dueDiligenceScore: 90,
      overallRiskLevel: 'LOW'
    };

    setProcessors([newRec, ...processors]);
    setShowAddModal(false);
    showToast(`Registered Data Processor DPA for ${newCompanyName}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 border border-blue-900/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                <Server className="w-3 h-3 text-blue-400" />
                Section 8(1) & 8(2) DPDP Act
              </span>
              <span className="text-xs text-slate-400">Data Processor Due Diligence & Vicarious Liability Register</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Statutory Data Processing Agreements (DPA) & Vendor Oversight</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Under Section 8(1), a Data Fiduciary may engage a Data Processor only under a valid contract. The Data Fiduciary retains full statutory responsibility and vicarious liability before the DPBI for all acts and omissions of its Processors.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Processor DPA</span>
            </button>
          </div>
        </div>

        {/* Oversight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Data Processors</span>
            <div className="text-2xl font-bold text-white mt-1">{processors.length}</div>
            <span className="text-[10px] text-slate-500">Contracted Vendors</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Executed DPAs</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{activeDpaCount} / {processors.length}</div>
            <span className="text-[10px] text-emerald-500/80">100% Contracted</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">2-Hour Breach Escalation SLA</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{compliantSlaCount} / {processors.length}</div>
            <span className="text-[10px] text-indigo-400/80">Meets CERT-In / DPBI SLA</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Avg Due Diligence Score</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{avgDueDiligence}%</div>
            <span className="text-[10px] text-amber-500/80">Audit Readiness</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search processor by name, code, category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Categories ({processors.length})</option>
            <option value="Cloud Hosting & Storage">Cloud Hosting & Storage</option>
            <option value="Payment Gateway">Payment Gateway</option>
            <option value="Analytics & Observability">Analytics & Observability</option>
            <option value="CRM & Customer Support">CRM & Customer Support</option>
          </select>
        </div>
      </div>

      {/* Processors Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Data Processor</th>
                <th className="p-3.5 font-bold">Category & Jurisdiction</th>
                <th className="p-3.5 font-bold">DPA Status & Ref</th>
                <th className="p-3.5 font-bold">Sub-Processors</th>
                <th className="p-3.5 font-bold">Breach Escalation SLA</th>
                <th className="p-3.5 font-bold">Security Certifications</th>
                <th className="p-3.5 font-bold text-right">Audit Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProcessors.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{p.companyName}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.processorCode}</div>
                    <div className="text-[10px] text-slate-500">{p.contactEmail}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 font-semibold text-[10px] border border-blue-900/60">
                      {p.serviceCategory}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{p.registeredJurisdiction}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Active Contract
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{p.dpaDocumentRef}</div>
                    <div className="text-[10px] text-slate-500">Valid until: {p.dpaValidUntil}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-medium text-white">{p.subprocessorsCount} Authorized</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Prior Consent Clause
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span className={p.breachEscalationSlaHours <= 2 ? 'text-emerald-400' : 'text-amber-400'}>
                        {p.breachEscalationSlaHours} Hours Max
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Internal Fiduciary SLA</span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {p.securityCertifications.map((cert, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="text-sm font-bold font-mono text-emerald-400">{p.dueDiligenceScore}%</div>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 text-[10px] font-semibold border border-emerald-900">
                      {p.overallRiskLevel} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Processor DPA Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Register Data Processor DPA (Sec 8(1))</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProcessor} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Processor Entity Name *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Cloudflare India Private Limited"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Service Category *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cloud Hosting & Storage">Cloud Hosting & Storage</option>
                    <option value="Payment Gateway">Payment Gateway</option>
                    <option value="Analytics & Observability">Analytics & Observability</option>
                    <option value="CRM & Customer Support">CRM & Customer Support</option>
                    <option value="HRMS & Payroll">HRMS & Payroll</option>
                    <option value="Identity Verification">Identity Verification</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Jurisdiction *</label>
                  <input
                    type="text"
                    required
                    value={newJurisdiction}
                    onChange={e => setNewJurisdiction(e.target.value)}
                    placeholder="e.g. New Delhi, India"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Security / DPO Email *</label>
                  <input
                    type="email"
                    required
                    value={newContactEmail}
                    onChange={e => setNewContactEmail(e.target.value)}
                    placeholder="compliance@vendor.com"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Breach Escalation SLA (Hours) *</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={newSlaHours}
                    onChange={e => setNewSlaHours(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mandatory Statutory Clauses Enforced</span>
                </div>
                <p>Contract will automatically enforce Section 8(1) sub-processor disclosure and contractual indemnity for DPBI fines.</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/20"
                >
                  Register DPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
