import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Database,
  Plus,
  Search,
  Trash2,
  ShieldAlert,
  FileCheck2,
  Layers,
  Lock
} from 'lucide-react';

interface RopaRecord {
  id: string;
  activityName: string;
  category: string;
  dataSubjects: string;
  personalDataTypes: string;
  lawfulBasis: 'Contractual Obligation' | 'Legitimate Interests' | 'Consent' | 'Legal Obligation';
  retentionPeriod: string;
  securityControls: string;
}

export const DataInfoModule: React.FC = () => {
  const { currentTenant } = useGRC();

  const [records, setRecords] = useState<RopaRecord[]>([
    {
      id: 'ropa_001',
      activityName: 'User Authentication & Multi-Factor Access Logging',
      category: 'Identity & Access',
      dataSubjects: 'Internal Employees & Authorized Contractors',
      personalDataTypes: 'Name, Corporate Email, IP Address, Device Fingerprint',
      lawfulBasis: 'Contractual Obligation',
      retentionPeriod: '365 Days (Rolling Syslog Buffer)',
      securityControls: 'AES-256 GCM at rest, TLS 1.3 in transit, Okta MFA'
    },
    {
      id: 'ropa_002',
      activityName: 'Customer Billing & Subscription Invoicing',
      category: 'Finance & Commercial',
      dataSubjects: 'Client Organization Primary Commercial Contacts',
      personalDataTypes: 'Name, Billing Address, Corporate Credit Card Token',
      lawfulBasis: 'Legal Obligation',
      retentionPeriod: '7 Years (Statutory Tax Requirement)',
      securityControls: 'Stripe Elements PCI-DSS Level 1 tokenized processing'
    },
    {
      id: 'ropa_003',
      activityName: 'Candidate Recruitment & Background Screening',
      category: 'Human Resources',
      dataSubjects: 'Job Applicants & Perspective Personnel',
      personalDataTypes: 'Curriculum Vitae, Employment History, Background Checks',
      lawfulBasis: 'Legitimate Interests',
      retentionPeriod: '6 Months post-decision or consent duration',
      securityControls: 'Role-Based Access Control, Encrypted Greenhouse ATS'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState('Identity & Access');
  const [dataSubjects, setDataSubjects] = useState('Employees');
  const [personalDataTypes, setPersonalDataTypes] = useState('Email, Name');
  const [lawfulBasis, setLawfulBasis] = useState<RopaRecord['lawfulBasis']>('Contractual Obligation');
  const [retentionPeriod, setRetentionPeriod] = useState('365 Days');
  const [securityControls, setSecurityControls] = useState('TLS 1.3 & AES-256');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) return;
    setRecords(prev => [
      ...prev,
      {
        id: `ropa_${Date.now()}`,
        activityName,
        category,
        dataSubjects,
        personalDataTypes,
        lawfulBasis,
        retentionPeriod,
        securityControls
      }
    ]);
    setActivityName('');
    setShowAddModal(false);
  };

  const filtered = records.filter(
    r =>
      r.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer id="data-info-module">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Privacy & Data Governance (GDPR Art. 30 & ISO 27701)
              </span>
              <span className="text-xs text-slate-400">Total Processing Activities: {records.length}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Record of Processing Activities (ROPA)</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Maintain an accurate registry of personal data flows, processing purposes, lawful bases under UK/EU GDPR, and retention schedules.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-900/30 transition-all hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Processing Activity</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search ROPA by activity name or category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* ROPA Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Processing Purpose & Activity</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Data Subjects & Types</th>
                <th className="p-3.5">Lawful Basis</th>
                <th className="p-3.5">Retention Period</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white text-xs">{r.activityName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Controls: {r.securityControls}</div>
                  </td>
                  <td className="p-3.5 text-slate-300">{r.category}</td>
                  <td className="p-3.5">
                    <div className="text-white font-medium">{r.dataSubjects}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.personalDataTypes}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                      {r.lawfulBasis}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{r.retentionPeriod}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setRecords(prev => prev.filter(item => item.id !== r.id))}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add ROPA Processing Activity</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  placeholder="e.g. Employee HR Record Management"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lawful Basis</label>
                  <select
                    value={lawfulBasis}
                    onChange={e => setLawfulBasis(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Contractual Obligation">Contractual Obligation</option>
                    <option value="Legitimate Interests">Legitimate Interests</option>
                    <option value="Consent">Consent</option>
                    <option value="Legal Obligation">Legal Obligation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data Subjects & Types</label>
                <input
                  type="text"
                  required
                  value={personalDataTypes}
                  onChange={e => setPersonalDataTypes(e.target.value)}
                  placeholder="e.g. Names, IP addresses, Home address"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Retention Period</label>
                  <input
                    type="text"
                    required
                    value={retentionPeriod}
                    onChange={e => setRetentionPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Security Controls</label>
                  <input
                    type="text"
                    required
                    value={securityControls}
                    onChange={e => setSecurityControls(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
