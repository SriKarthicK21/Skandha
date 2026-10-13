// ============================================================================
// SKANDA ENTERPRISE GRC: CUSTOMER SUCCESS COMMAND CENTRE (INTERNAL OPS)
// Path: src/components/admin/CustomerSuccessCommandCentre.tsx
//
// Internal SKANDA Operations & SuperAdmin Cockpit for managing multi-tenant
// portfolio health, ARR, contract renewals, churn risks & platform incidents
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Shield,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Layers,
  HeartPulse,
  Radio,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  tenantAdministrationService
} from '../../services/saas/tenantAdministrationService';
import {
  CanonicalTenant,
  CustomerHealthStatus,
  RenewalStatus
} from '../../types/saasTypes';
import { TenantProvisioningWizardModal } from './TenantProvisioningWizardModal';

export const CustomerSuccessCommandCentre: React.FC = () => {
  const [tenants, setTenants] = useState<CanonicalTenant[]>([]);
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProvisioningOpen, setIsProvisioningOpen] = useState<boolean>(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const loadTenants = () => {
    try {
      const list = tenantAdministrationService.getAllTenants('SKANDA_PLATFORM_ADMIN');
      setTenants(list);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const metrics = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'ACTIVE').length;
    const atRiskTenants = tenants.filter(t => t.healthStatus === 'AT_RISK' || t.healthStatus === 'CRITICAL').length;
    const totalArr = tenants.reduce((acc, t) => acc + (t.renewal?.annualRecurringRevenueUsd || 0), 0);
    const totalExpansion = tenants.reduce((acc, t) => acc + (t.renewal?.expansionPotentialUsd || 0), 0);

    return { totalTenants, activeTenants, atRiskTenants, totalArr, totalExpansion };
  }, [tenants]);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchSearch =
        searchQuery === '' ||
        t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.industry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchHealth = selectedHealthFilter === 'ALL' || t.healthStatus === selectedHealthFilter;
      return matchSearch && matchHealth;
    });
  }, [tenants, searchQuery, selectedHealthFilter]);

  const getHealthBadge = (status: CustomerHealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Healthy</span>;
      case 'WATCH':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Watch</span>;
      case 'AT_RISK':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> At Risk</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Critical</span>;
    }
  };

  const getRenewalBadge = (status: RenewalStatus) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="text-xs text-blue-400 font-medium">Upcoming (90d)</span>;
      case 'RENEWED':
        return <span className="text-xs text-emerald-400 font-medium">Renewed</span>;
      case 'CHURN_RISK':
        return <span className="text-xs text-red-400 font-medium font-semibold">Churn Risk</span>;
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Internal SKANDA SuperAdmin Plane
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Telemetry Linked
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Customer Success & Multi-Tenant Operating System
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Centralized intelligence monitor tracking enterprise tenant adoption, contract renewals, telemetry quotas, customer health scores & ARR expansion.
          </p>
        </div>

        <button
          onClick={() => setIsProvisioningOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Provision New Enterprise Tenant
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Total Enterprise Tenants</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{metrics.totalTenants}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Active</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Total Portfolio ARR</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">${(metrics.totalArr / 1000).toFixed(0)}k</span>
            <span className="text-xs text-slate-400">Annual Run-Rate</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Expansion Potential</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-400">+${(metrics.totalExpansion / 1000).toFixed(0)}k</span>
            <span className="text-xs text-blue-400/80 font-medium">Add-on Pipeline</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">At-Risk Accounts</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black ${metrics.atRiskTenants > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {metrics.atRiskTenants}
            </span>
            <span className="text-xs text-amber-400/80 font-medium">Requires CSM Action</span>
          </div>
        </div>

        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
          <span className="text-xs text-slate-400 block mb-1">Avg Health Score</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-400">76 / 100</span>
            <span className="text-xs text-purple-400/80 font-medium">11-Factor Metric</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tenant by name, ID, or industry..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'HEALTHY', 'WATCH', 'AT_RISK', 'CRITICAL'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedHealthFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedHealthFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Tenant & Organization</th>
                <th className="px-4 py-3">Plan Tier</th>
                <th className="px-4 py-3">Residency Region</th>
                <th className="px-4 py-3">ARR</th>
                <th className="px-4 py-3">Customer Health</th>
                <th className="px-4 py-3">Open Issues</th>
                <th className="px-4 py-3">Renewal Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTenants.map(t => (
                <tr key={t.tenantId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{t.displayName}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.tenantId} • {t.industry}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold text-[11px]">
                      {t.tier}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-slate-300 font-medium">{t.region}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{t.dataResidencyJurisdiction}</div>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-slate-200">
                    ${t.renewal?.annualRecurringRevenueUsd.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {getHealthBadge(t.healthStatus)}
                      <span className="font-mono text-slate-400">{t.healthScore.overallScore}%</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {t.healthScore.breakdown.openCriticalIssuesCount > 0 ? (
                      <span className="text-amber-400 font-bold">{t.healthScore.breakdown.openCriticalIssuesCount} Critical</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">0 Issues</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {getRenewalBadge(t.renewal?.status || 'UPCOMING')}
                    <div className="text-[10px] text-slate-500 mt-0.5">Exp: {t.renewal?.contractEndDate}</div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedTenantId(t.tenantId)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs inline-flex items-center gap-1 transition-all"
                    >
                      Inspect 360 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant 360 Deep-Dive Drawer/Modal */}
      {selectedTenantId && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tenant 360 Deep Dive: {tenants.find(t => t.tenantId === selectedTenantId)?.displayName}
              </h3>
              <p className="text-xs text-slate-400">
                Full 360-degree synthesis of GRC operations, active teams, users, quota consumption & health reasons.
              </p>
            </div>
            <button
              onClick={() => setSelectedTenantId(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
            >
              Close
            </button>
          </div>

          {(() => {
            const focused = tenants.find(t => t.tenantId === selectedTenantId);
            if (!focused) return null;
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-800/40 rounded-xl space-y-2 border border-slate-700/60">
                  <h4 className="font-bold text-slate-200">Customer Health Factors</h4>
                  <ul className="space-y-1 text-slate-400">
                    {focused.healthScore.reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-400">•</span> {r}
                      </li>
                    ))}
                  </ul>
                  {focused.healthScore.internalSuccessNotes && (
                    <div className="mt-3 p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-indigo-300">
                      <span className="font-bold block text-[10px] uppercase tracking-wider text-indigo-400">Internal CSM Notes:</span>
                      {focused.healthScore.internalSuccessNotes}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl space-y-2 border border-slate-700/60">
                  <h4 className="font-bold text-slate-200">Live Quota Meters</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>WORM Storage</span>
                        <span>{focused.saasProfile.usageMeters.storageUsedGb} / {focused.saasProfile.entitlements.storageQuotaGb} GB</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (focused.saasProfile.usageMeters.storageUsedGb / focused.saasProfile.entitlements.storageQuotaGb) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Telemetry Events</span>
                        <span>{(focused.saasProfile.usageMeters.telemetryEventsThisMonth / 1000).toFixed(0)}k / {(focused.saasProfile.entitlements.monthlyTelemetryEventsQuota / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (focused.saasProfile.usageMeters.telemetryEventsThisMonth / focused.saasProfile.entitlements.monthlyTelemetryEventsQuota) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl space-y-2 border border-slate-700/60">
                  <h4 className="font-bold text-slate-200">Active Teams & Users</h4>
                  <div className="text-slate-400 space-y-1">
                    <div>• Active Teams: {focused.teams.length}</div>
                    <div>• Registered Users: {focused.users.length}</div>
                    <div>• Enabled Frameworks: {focused.enabledFrameworkCodes.join(', ')}</div>
                    <div>• Assigned CSM: {focused.renewal.assignedCustomerSuccessManager}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Provisioning Wizard Modal */}
      <TenantProvisioningWizardModal
        isOpen={isProvisioningOpen}
        onClose={() => setIsProvisioningOpen(false)}
        onSuccess={() => {
          loadTenants();
        }}
      />
    </div>
  );
};
