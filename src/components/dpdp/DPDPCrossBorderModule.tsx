import React, { useState, useMemo } from 'react';
import {
  DPDPCrossBorderFlowRecord,
  INITIAL_CROSS_BORDER_FLOWS
} from '../../data/dpdpExtendedTypes';
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ExternalLink,
  Plus,
  Search,
  Filter,
  FileCheck2,
  ShieldAlert,
  Server,
  Cloud
} from 'lucide-react';

export const DPDPCrossBorderModule: React.FC = () => {
  const [flows, setFlows] = useState<DPDPCrossBorderFlowRecord[]>(INITIAL_CROSS_BORDER_FLOWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [newTransferName, setNewTransferName] = useState('');
  const [newDestinationCountry, setNewDestinationCountry] = useState('Ireland');
  const [newDestinationRegion, setNewDestinationRegion] = useState('AWS eu-west-1 Dublin');
  const [newRecipientEntity, setNewRecipientEntity] = useState('');
  const [newPurpose, setNewPurpose] = useState('Global Microservices API Routing & Threat Detection');
  const [newMechanism, setNewMechanism] = useState<any>('Standard Contractual Clauses (SCC) with Technical Safeguards');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredFlows = useMemo(() => {
    return flows.filter(f => {
      const matchSearch =
        f.transferName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.recipientEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.flowCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDest = destinationFilter === 'All' || f.destinationCountry === destinationFilter;
      return matchSearch && matchDest;
    });
  }, [flows, searchTerm, destinationFilter]);

  // Statistics
  const clearedCount = flows.filter(f => f.dpoClearanceStatus === 'CLEARED').length;
  const encryptedCount = flows.filter(f => f.encryptionInTransitAndRest).length;

  const handleAddFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransferName || !newRecipientEntity) return;

    const newFlow: DPDPCrossBorderFlowRecord = {
      id: `xfer_${Date.now()}`,
      flowCode: `XFER-${newDestinationCountry.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      transferName: newTransferName,
      sourceRegion: 'India (AWS ap-south-1 Mumbai)',
      destinationCountry: newDestinationCountry,
      destinationCloudRegion: newDestinationRegion,
      recipientEntity: newRecipientEntity,
      dataCategoriesTransferred: ['Encrypted Master Records', 'Pseudonymized User Hash'],
      purposeOfTransfer: newPurpose,
      statutoryTransferMechanism: newMechanism,
      centralGovNotificationStatus: 'PERMITTED_NO_RESTRICTION',
      encryptionInTransitAndRest: true,
      volumeCategory: 'Medium (10k-500k/mo)',
      lastAssessedDate: new Date().toISOString().split('T')[0],
      dpoClearanceStatus: 'CLEARED'
    };

    setFlows([newFlow, ...flows]);
    setShowAddModal(false);
    showToast(`Registered cross-border data transfer to ${newDestinationCountry}.`);
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-900/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                Section 16 DPDP Act 2023
              </span>
              <span className="text-xs text-slate-400">Transfer of Personal Data Outside India</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Cross-Border Data Residency & Whitelist Ledger</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Section 16 adopts a "negative list" model: cross-border transfer of personal data is permitted to countries unless explicitly restricted by Central Government notification. In addition, sector-specific data localization laws (RBI, IRDAI, SEBI) continue to operate in harmony.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Cross-Border Flow</span>
            </button>
          </div>
        </div>

        {/* Residency Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Outbound Flows</span>
            <div className="text-2xl font-bold text-white mt-1">{flows.length}</div>
            <span className="text-[10px] text-slate-500">Cross-Border Channels</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">DPO Cleared</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{clearedCount} / {flows.length}</div>
            <span className="text-[10px] text-emerald-500/80">Statutory Safeguards Active</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Transit & Rest Encryption</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">100% (AES-256)</div>
            <span className="text-[10px] text-indigo-400/80">TLS 1.3 / mTLS Enforced</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Restricted Countries Alert</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">0 Blacklisted</div>
            <span className="text-[10px] text-emerald-500/80">Compliant with Gazette</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search transfer by name, destination, recipient..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Destination:</span>
          <select
            value={destinationFilter}
            onChange={e => setDestinationFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Destinations ({flows.length})</option>
            <option value="Germany">Germany</option>
            <option value="United States">United States</option>
            <option value="Singapore">Singapore</option>
          </select>
        </div>
      </div>

      {/* Data Flows List */}
      <div className="space-y-4">
        {filteredFlows.map(flow => (
          <div
            key={flow.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                  {flow.flowCode}
                </span>
                <span className="font-bold text-white text-sm">{flow.transferName}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  MeitY Notification: Permitted
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  DPO Cleared
                </span>
              </div>
            </div>

            {/* Geographical Flow Route */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">{flow.sourceRegion}</div>
                  <div className="text-[10px] text-slate-400">Primary Indian Custody</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-emerald-400">
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  TLS 1.3 / AES-256
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">{flow.destinationCountry} ({flow.destinationCloudRegion})</div>
                  <div className="text-[10px] text-slate-400">{flow.recipientEntity}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Transfer Mechanism</span>
                <span className="font-medium text-white">{flow.statutoryTransferMechanism}</span>
                <p className="text-[11px] text-slate-400 mt-1">{flow.purposeOfTransfer}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Categories of Personal Data</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {flow.dataCategoriesTransferred.map((cat, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Cross-Border Flow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Register Cross-Border Data Flow (Sec 16)</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddFlow} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Flow Name / System Identifier *</label>
                <input
                  type="text"
                  required
                  value={newTransferName}
                  onChange={e => setNewTransferName(e.target.value)}
                  placeholder="e.g. EU Analytics Lakehouse Replication"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Destination Country *</label>
                  <input
                    type="text"
                    required
                    value={newDestinationCountry}
                    onChange={e => setNewDestinationCountry(e.target.value)}
                    placeholder="e.g. United Kingdom"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Destination Cloud Region *</label>
                  <input
                    type="text"
                    required
                    value={newDestinationRegion}
                    onChange={e => setNewDestinationRegion(e.target.value)}
                    placeholder="e.g. AWS eu-west-2 London"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Foreign Recipient Legal Entity *</label>
                <input
                  type="text"
                  required
                  value={newRecipientEntity}
                  onChange={e => setNewRecipientEntity(e.target.value)}
                  placeholder="e.g. Enterprise Analytics UK Ltd"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Transfer Mechanism *</label>
                <select
                  value={newMechanism}
                  onChange={e => setNewMechanism(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Standard Contractual Clauses (SCC) with Technical Safeguards">Standard Contractual Clauses (SCC) with Technical Safeguards</option>
                  <option value="Central Government Whitelisted Territory">Central Government Whitelisted Territory</option>
                  <option value="Intra-Group Binding Corporate Rules">Intra-Group Binding Corporate Rules</option>
                  <option value="Explicit Statutory Consent Derogation">Explicit Statutory Consent Derogation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Transfer Purpose *</label>
                <input
                  type="text"
                  required
                  value={newPurpose}
                  onChange={e => setNewPurpose(e.target.value)}
                  placeholder="e.g. Analytics query computation and model training"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
                >
                  Confirm & Register Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
