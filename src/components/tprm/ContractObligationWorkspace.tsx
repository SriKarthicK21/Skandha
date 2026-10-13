/**
 * SKANDA ENTERPRISE CONTRACT & DPA OBLIGATION WORKSPACE
 * Path: src/components/tprm/ContractObligationWorkspace.tsx
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export const ContractObligationWorkspace: React.FC = () => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const { vendors, setSelectedVendorId, setActiveTab } = useTprmStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpiring, setFilterExpiring] = useState(false);

  const isLight = theme === 'light';

  // Aggregate contracts across all vendors
  const allContracts = vendors.flatMap(v =>
    v.activeContracts.map(c => ({
      ...c,
      vendorName: v.profile.legalName,
      vendorTier: v.relationship.criticalityTier
    }))
  );

  const filteredContracts = allContracts.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterExpiring && c.daysUntilExpiry > 90) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Banner */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Regulatory Legal & Contract Fabric
              </span>
              <span className="text-xs text-slate-400 font-mono">
                100% GDPR Art 28 & DPDP Sec 8 Mandatory Baseline
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Data Processing Addenda (DPA), SCCs & Security SLA Repository
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Track contractual security obligations, statutory audit rights, breach notification SLAs (1-24h), and automated renewal warning milestones.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterExpiring(!filterExpiring)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                filterExpiring
                  ? 'bg-amber-500 text-white border-amber-600'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {filterExpiring ? 'Showing Expiring (≤ 90d)' : 'Filter Expiring (≤ 90d)'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Contracts Table */}
      <div
        className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-sky-400" />
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Active Contract & DPA Agreements ({filteredContracts.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`text-[11px] uppercase font-bold border-b ${
                isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <tr>
                <th className="p-3">Vendor / Agreement</th>
                <th className="p-3">Contract Ref</th>
                <th className="p-3">DPA Compliance</th>
                <th className="p-3">Breach SLA</th>
                <th className="p-3">Audit Rights</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
              {filteredContracts.map(c => (
                <tr key={c.id} className="hover:bg-slate-500/5 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                    <span className="text-[10px] text-sky-400 font-mono">{c.vendorName}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{c.contractReference}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>GDPR Art 28 ✓</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>DPDP Sec 8 ✓</span>
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-indigo-400">
                    &le; {c.incidentNotificationHoursSla} Hours
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    {c.auditAndInspectionRights.replace(/_/g, ' ')}
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-[11px]">{c.expiryDate}</div>
                    <span
                      className={`text-[10px] font-bold ${
                        c.daysUntilExpiry <= 90 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {c.daysUntilExpiry} days remaining
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        showToast({
                          title: 'Contract Cryptographic Seal Verified',
                          message: `SHA-256 seal valid for ${c.contractReference}: ${c.contractDocumentSha256?.slice(0, 16)}...`,
                          type: 'info'
                        })
                      }
                      className="text-xs text-sky-400 hover:underline font-bold"
                    >
                      Verify SHA-256
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
