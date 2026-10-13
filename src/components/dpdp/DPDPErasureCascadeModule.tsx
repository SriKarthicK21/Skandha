import React, { useState, useMemo } from 'react';
import {
  DPDPErasureCascadeRecord,
  INITIAL_ERASURE_REQUESTS
} from '../../data/dpdpExtendedTypes';
import { fallbackHash } from '../../utils/crypto';
import {
  Trash2,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  Download,
  Printer,
  ChevronRight,
  ShieldAlert,
  Server,
  FileText,
  Search,
  Filter
} from 'lucide-react';

export const DPDPErasureCascadeModule: React.FC = () => {
  const [erasureRequests, setErasureRequests] = useState<DPDPErasureCascadeRecord[]>(INITIAL_ERASURE_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCertificate, setSelectedCertificate] = useState<DPDPErasureCascadeRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const filteredRequests = useMemo(() => {
    return erasureRequests.filter(item => {
      const matchSearch =
        item.erasureCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dataPrincipalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.principalEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [erasureRequests, searchTerm, statusFilter]);

  // Statistics
  const certifiedCount = erasureRequests.filter(e => e.status === 'FULLY_ERASED_CERTIFIED').length;
  const legalHoldCount = erasureRequests.filter(e => e.status === 'LEGAL_HOLD_APPLIED').length;
  const inProgressCount = erasureRequests.filter(e => e.status === 'CASCADE_DISPATCHED' || e.status === 'PENDING_EVALUATION').length;

  // Dispatch Downstream Erasure Cascade
  const handleDispatchCascade = (id: string) => {
    setErasureRequests(prev =>
      prev.map(r => {
        if (r.id === id) {
          const nowIso = new Date().toISOString();
          const certId = `DPBI-DEL-CERT-2026-${Math.floor(100 + Math.random() * 900)}`;
          const hash = fallbackHash(r.dataPrincipalId + r.erasureCode + nowIso);

          return {
            ...r,
            status: 'FULLY_ERASED_CERTIFIED',
            completedDate: nowIso,
            affectedProcessors: r.affectedProcessors.map(p => ({
              ...p,
              dispatchStatus: 'CONFIRMED_DELETED',
              acknowledgedAt: nowIso,
              processorAckToken: `${p.processorName.substring(0, 3).toUpperCase()}-PURGE-${Math.floor(10000 + Math.random() * 90000)}`
            })),
            deletionCertificate: {
              certificateId: certId,
              sha256ProofHash: hash,
              recordsPurgedCount: 18,
              witnessedByDpo: 'Elena Rostova (Lead DPO)',
              certifiedAt: nowIso
            }
          };
        }
        return r;
      })
    );
    showToast(`Dispatched erasure cascade to downstream processors and minted cryptographic deletion certificate.`);
  };

  // Override Legal Hold (with formal DPO authorization)
  const handleOverrideLegalHold = (id: string) => {
    setErasureRequests(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            status: 'CASCADE_DISPATCHED',
            legalHoldAssessment: {
              ...r.legalHoldAssessment,
              hasLegalHold: false,
              holdJustification: 'Legal hold released following compliance audit and conclusion of retention period.'
            }
          };
        }
        return r;
      })
    );
    showToast('Legal hold cleared by DPO. Request queued for downstream processor cascade.');
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-900/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                <Trash2 className="w-3 h-3 text-amber-400" />
                Section 8(7) & Section 12(3) DPDP Act
              </span>
              <span className="text-xs text-slate-400">Automated Data Erasure & Statutory Retention Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Downstream Processor Erasure Cascade & Legal Hold Resolver</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              When a Data Principal withdraws consent or the processing purpose expires, Section 8(7) mandates immediate erasure of personal data and notification to all downstream Data Processors, <em>unless retention is required by other statutory laws</em> (Section 8(7)(b)).
            </p>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Erasure Requests</span>
            <div className="text-2xl font-bold text-white mt-1">{erasureRequests.length}</div>
            <span className="text-[10px] text-slate-500">All Triggers</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Certified Erased</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{certifiedCount}</div>
            <span className="text-[10px] text-emerald-500/80">SHA-256 Proof Minted</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Statutory Legal Holds</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{legalHoldCount}</div>
            <span className="text-[10px] text-amber-500/80">PMLA / Tax Retention</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Cascade in Progress</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{inProgressCount}</div>
            <span className="text-[10px] text-indigo-400/80">Processors Queued</span>
          </div>
        </div>
      </div>

      {/* Statutory Retention vs DPDP Erasure Guide */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start justify-between gap-4 text-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Section 8(7)(b) Harmonization: How Legal Holds Overrule Erasure</span>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-3xl">
              Under Indian jurisprudence, Section 8(7) does <strong>not</strong> require deletion if other enactments mandate preservation (e.g., Section 12 of PMLA requires 5-year preservation of financial transactions; Section 44AA of Income Tax Act mandates 7-year accounting record retention). Our engine automatically isolates data, restricts processing to preservation only, and prevents illegal premature destruction.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by code, principal name, or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Filter:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses ({erasureRequests.length})</option>
            <option value="FULLY_ERASED_CERTIFIED">Fully Erased & Certified</option>
            <option value="LEGAL_HOLD_APPLIED">Legal Hold Applied</option>
            <option value="CASCADE_DISPATCHED">Cascade Dispatched</option>
          </select>
        </div>
      </div>

      {/* Erasure Requests & Processor Cascade Table */}
      <div className="space-y-4">
        {filteredRequests.map(req => (
          <div
            key={req.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                  {req.erasureCode}
                </span>
                <span className="font-bold text-white text-sm">{req.principalName}</span>
                <span className="text-slate-400 font-mono text-xs">({req.dataPrincipalId})</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  Trigger: {req.triggerType.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {req.status === 'FULLY_ERASED_CERTIFIED' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Certified Purged
                  </span>
                )}
                {req.status === 'LEGAL_HOLD_APPLIED' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Statutory Legal Hold
                  </span>
                )}
                {req.status === 'CASCADE_DISPATCHED' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Processor Cascade Active
                  </span>
                )}
              </div>
            </div>

            {/* Legal Hold Information Box */}
            {req.legalHoldAssessment.hasLegalHold && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Statutory Retention Override: {req.legalHoldAssessment.applicableLaw}</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400">Preserve Until: {req.legalHoldAssessment.holdExpiryDate}</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed text-[11px]">
                  {req.legalHoldAssessment.holdJustification}
                </p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Signed off by: <strong className="text-slate-300">{req.legalHoldAssessment.dpoApprovalOfficer}</strong>
                </div>
              </div>
            )}

            {/* Downstream Processor Cascade Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Downstream Processor Deletion Dispatch Ledger (Section 8(7))</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {req.affectedProcessors.map((proc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{proc.processorName}</span>
                        {proc.dispatchStatus === 'CONFIRMED_DELETED' && (
                          <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Purged
                          </span>
                        )}
                        {proc.dispatchStatus === 'QUEUED' && (
                          <span className="text-amber-400 text-[10px] font-bold">Queued</span>
                        )}
                        {proc.dispatchStatus === 'NOT_SENT' && (
                          <span className="text-slate-500 text-[10px]">Held</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{proc.serviceType}</div>
                    </div>

                    {proc.processorAckToken && (
                      <div className="pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Ack: {proc.processorAckToken}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Certificate Footer */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {req.deletionCertificate ? (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <FileCheck2 className="w-4 h-4 shrink-0" />
                  <span className="text-[11px]">
                    Certificate <strong>{req.deletionCertificate.certificateId}</strong> issued with cryptographic proof.
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Deletion certificate pending full processor cascade confirmation.
                </div>
              )}

              <div className="flex items-center space-x-2">
                {req.deletionCertificate && (
                  <button
                    onClick={() => setSelectedCertificate(req)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Deletion Certificate</span>
                  </button>
                )}

                {req.status === 'CASCADE_DISPATCHED' && (
                  <button
                    onClick={() => handleDispatchCascade(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Cascade & Issue Certificate</span>
                  </button>
                )}

                {req.status === 'LEGAL_HOLD_APPLIED' && (
                  <button
                    onClick={() => handleOverrideLegalHold(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/60 font-semibold text-xs transition"
                  >
                    Release Legal Hold
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deletion Certificate Modal */}
      {selectedCertificate && selectedCertificate.deletionCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">DPBI Statutory Deletion Certificate</h3>
                  <div className="text-[11px] text-slate-400">Digital Personal Data Protection Act, 2023 • Section 8(7)</div>
                </div>
              </div>
              <button onClick={() => setSelectedCertificate(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Certificate Number</span>
                  <span className="font-bold text-white">{selectedCertificate.deletionCertificate.certificateId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Certification Date</span>
                  <span className="text-white">{selectedCertificate.deletionCertificate.certifiedAt}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Data Principal</span>
                  <span className="text-white">{selectedCertificate.principalName} ({selectedCertificate.dataPrincipalId})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Records Purged</span>
                  <span className="text-emerald-400 font-bold">{selectedCertificate.deletionCertificate.recordsPurgedCount} Databases & Buckets</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">SHA-256 Cryptographic Digest Proof</span>
                <span className="text-amber-400 font-mono text-[11px] break-all">
                  {selectedCertificate.deletionCertificate.sha256ProofHash}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Witnessed and signed by: <strong className="text-white">{selectedCertificate.deletionCertificate.witnessedByDpo}</strong>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed">
              This statutory certificate serves as conclusive evidence under Section 8(7) of the DPDP Act 2023 that all personal data categories held by the Data Fiduciary and downstream processors have been permanently destroyed.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
