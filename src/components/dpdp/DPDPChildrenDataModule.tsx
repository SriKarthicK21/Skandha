import React, { useState, useMemo } from 'react';
import {
  DPDPChildConsentRecord,
  INITIAL_CHILD_CONSENTS
} from '../../data/dpdpExtendedTypes';
import {
  Baby,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  EyeOff,
  UserCheck,
  FileCheck2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Ban,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const DPDPChildrenDataModule: React.FC = () => {
  const [childConsents, setChildConsents] = useState<DPDPChildConsentRecord[]>(INITIAL_CHILD_CONSENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New VPC Form state
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState<number>(14);
  const [newDob, setNewDob] = useState('2012-05-15');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianRelationship, setNewGuardianRelationship] = useState<'Father' | 'Mother' | 'Legal Guardian appointed by Court'>('Father');
  const [newGuardianEmail, setNewGuardianEmail] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newKycMethod, setNewKycMethod] = useState<'DigiLocker Tokenized KYC' | 'Aadhaar OTP (UIDAI Virtual ID)' | 'Passport / Govt ID Upload' | 'Net Banking 1-Rupee Penny Drop'>('DigiLocker Tokenized KYC');
  const [newPurpose, setNewPurpose] = useState('Interactive Educational Learning & Homework Portal');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredConsents = useMemo(() => {
    return childConsents.filter(item => {
      const matchSearch =
        item.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.childPrincipalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.guardianEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [childConsents, searchTerm, statusFilter]);

  // Statistics
  const totalVerified = childConsents.filter(c => c.guardianKycStatus === 'VERIFIED').length;
  const totalTrackingBlocked = childConsents.filter(c => c.behavioralTrackingDisabled && c.targetedAdvertisingBlocked).length;
  const pendingKycCount = childConsents.filter(c => c.guardianKycStatus === 'PENDING_VERIFICATION').length;

  const handleVerifyKyc = (id: string) => {
    setChildConsents(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            guardianKycStatus: 'VERIFIED',
            guardianKycRef: `DL-KYC-REVERIFY-${Math.floor(100000 + Math.random() * 900000)}`,
            verificationDate: new Date().toISOString().split('T')[0],
            telemetryPurged: true
          };
        }
        return c;
      })
    );
    showToast('Guardian KYC verified successfully via DigiLocker token bridge.');
  };

  const handleRevokeByGuardian = (id: string) => {
    setChildConsents(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'REVOKED_BY_GUARDIAN',
            notes: 'Parent submitted formal withdrawal under DPDP Act Section 9(1).'
          };
        }
        return c;
      })
    );
    showToast('Parental consent revoked. Account suspended and telemetry isolated.');
  };

  const handleCreateVpcRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName || !newGuardianName || !newGuardianEmail) return;

    const newRecord: DPDPChildConsentRecord = {
      id: `chd_${Date.now()}`,
      childPrincipalId: `DP-CHD-${Math.floor(1000 + Math.random() * 9000)}`,
      childName: newChildName,
      childAge: Number(newChildAge),
      dateOfBirth: newDob,
      guardianName: newGuardianName,
      guardianRelationship: newGuardianRelationship,
      guardianEmail: newGuardianEmail,
      guardianPhone: newGuardianPhone || '+91 98000 12345',
      guardianKycMethod: newKycMethod,
      guardianKycStatus: 'VERIFIED',
      guardianKycRef: `VPC-KYC-${Math.floor(100000 + Math.random() * 900000)}`,
      verificationDate: new Date().toISOString().split('T')[0],
      purpose: newPurpose,
      status: 'ACTIVE_AUTHORIZED',
      behavioralTrackingDisabled: true,
      targetedAdvertisingBlocked: true,
      detrimentalProcessingShieldActive: true,
      telemetryPurged: true,
      notes: 'New VPC registered with automated behavioral tracking blocker applied.'
    };

    setChildConsents([newRecord, ...childConsents]);
    setShowAddModal(false);
    showToast(`Registered VPC for ${newChildName} under Guardian ${newGuardianName}.`);
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

      {/* Statutory Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-rose-900/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                <Baby className="w-3 h-3 text-rose-400" />
                Section 9 DPDP Act 2023
              </span>
              <span className="text-xs text-slate-400">Processing of Personal Data of Children (Age &lt; 18)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-900/60">
                Statutory Max Penalty: ₹200 Crores
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Verifiable Parental Consent (VPC) & Minor Protection Hub</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Enforce verifiable consent from the parent/lawful guardian prior to processing any child's data. 
              Under Section 9(2), Data Fiduciaries are strictly prohibited from undertaking behavioral tracking, targeted advertising, or any processing likely to cause detrimental effect on the well-being of a child.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Minor & Guardian KYC</span>
            </button>
          </div>
        </div>

        {/* Safeguard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Child Accounts</span>
            <div className="text-2xl font-bold text-white mt-1">{childConsents.length}</div>
            <span className="text-[10px] text-slate-500">Under 18 Years</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Verified Guardians</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{totalVerified} / {childConsents.length}</div>
            <span className="text-[10px] text-emerald-500/80">DigiLocker / Aadhaar KYC</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Behavioral Tracking Blocked</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">100% Enforced</div>
            <span className="text-[10px] text-indigo-400/80">Zero Ad Profiling (Sec 9.2)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Pending KYC Audits</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{pendingKycCount}</div>
            <span className="text-[10px] text-amber-500/80">Requires DPO Action</span>
          </div>
        </div>
      </div>

      {/* Statutory Prohibition Safeguard Checklist */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 shrink-0 mt-0.5">
            <Ban className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Sec 9(2): Targeted Ads Blocked</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Marketing telemetry and third-party ad attribution SDKs are automatically suppressed on all child accounts.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800 text-indigo-400 shrink-0 mt-0.5">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Sec 9(2): Behavioral Tracking Banned</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No profiling, clickstream analysis, or algorithmic psychographic classification permitted on minors.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Sec 9(1): Detrimental Processing Shield</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated audit flags halt any processing activity posing risk of harm, addiction, or distress to a minor.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search minor or guardian by name, ID, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="All">All Records ({childConsents.length})</option>
            <option value="ACTIVE_AUTHORIZED">Active Authorized</option>
            <option value="REVOKED_BY_GUARDIAN">Revoked by Guardian</option>
          </select>
        </div>
      </div>

      {/* Child Consent Ledger Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Child Principal</th>
                <th className="p-3.5 font-bold">Age / DOB</th>
                <th className="p-3.5 font-bold">Parent / Lawful Guardian</th>
                <th className="p-3.5 font-bold">Guardian KYC Token</th>
                <th className="p-3.5 font-bold">Sec 9 Safeguards</th>
                <th className="p-3.5 font-bold">Status</th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredConsents.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{item.childName}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">{item.childPrincipalId}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.purpose}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 font-bold text-[11px] border border-rose-900/60">
                      {item.childAge} Years Old
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">DOB: {item.dateOfBirth}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-white">{item.guardianName}</div>
                    <div className="text-[10px] text-slate-400">{item.guardianRelationship}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.guardianEmail}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5">
                      {item.guardianKycStatus === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Pending KYC
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{item.guardianKycRef}</div>
                    <div className="text-[10px] text-slate-500">{item.guardianKycMethod}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Tracking Banned</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                        <Ban className="w-3 h-3" />
                        <span>Ads Blocked</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    {item.status === 'ACTIVE_AUTHORIZED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Active Authorized
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Revoked
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-2">
                    {item.guardianKycStatus === 'PENDING_VERIFICATION' && (
                      <button
                        onClick={() => handleVerifyKyc(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                      >
                        Verify KYC
                      </button>
                    )}

                    {item.status === 'ACTIVE_AUTHORIZED' && (
                      <button
                        onClick={() => handleRevokeByGuardian(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-semibold transition"
                      >
                        Guardian Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New VPC Enrollment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Baby className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Enroll Minor with Verifiable Parental Consent</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateVpcRecord} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Child's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newChildName}
                    onChange={e => setNewChildName(e.target.value)}
                    placeholder="e.g. Rohan Gupta"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Child's Age (Strictly &lt; 18) *</label>
                  <input
                    type="number"
                    min={1}
                    max={17}
                    required
                    value={newChildAge}
                    onChange={e => setNewChildAge(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={newDob}
                  onChange={e => setNewDob(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2">Guardian Information</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={newGuardianName}
                      onChange={e => setNewGuardianName(e.target.value)}
                      placeholder="e.g. Priya Gupta"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Relationship *</label>
                    <select
                      value={newGuardianRelationship}
                      onChange={e => setNewGuardianRelationship(e.target.value as any)}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Legal Guardian appointed by Court">Legal Guardian appointed by Court</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Guardian Email *</label>
                    <input
                      type="email"
                      required
                      value={newGuardianEmail}
                      onChange={e => setNewGuardianEmail(e.target.value)}
                      placeholder="guardian@example.com"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Guardian Mobile *</label>
                    <input
                      type="text"
                      value={newGuardianPhone}
                      onChange={e => setNewGuardianPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Verifiable KYC Mechanism *</label>
                <select
                  value={newKycMethod}
                  onChange={e => setNewKycMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="DigiLocker Tokenized KYC">DigiLocker Tokenized KYC (MeitY Approved)</option>
                  <option value="Aadhaar OTP (UIDAI Virtual ID)">Aadhaar OTP (UIDAI Virtual ID Verification)</option>
                  <option value="Passport / Govt ID Upload">Passport / Govt ID Official Upload</option>
                  <option value="Net Banking 1-Rupee Penny Drop">Net Banking 1-Rupee Penny Drop Account Verification</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Processing Purpose *</label>
                <input
                  type="text"
                  required
                  value={newPurpose}
                  onChange={e => setNewPurpose(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/60 text-slate-300 space-y-1">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Mandatory Section 9 Safeguards Auto-Bound</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  By enrolling this minor, our platform guarantees that behavioral tracking, targeted advertising, and marketing telemetry will be permanently disabled for this account.
                </p>
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/20"
                >
                  Confirm & Authorize VPC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
