// ============================================================================
// SKANDA ENTERPRISE GRC: CUSTOMER ACCOUNT & SUBSCRIPTION PORTAL
// Path: src/components/admin/CustomerAccountPortal.tsx
//
// Customer-facing Account, Subscription, Contract & Usage Billing Cockpit
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  FileText,
  Layers,
  Shield,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  LifeBuoy,
  Zap,
  Lock,
  Globe2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import {
  CanonicalTenant,
  EnterpriseContract,
  CanonicalInvoice,
  CustomerSuccessPlan
} from '../../types/saasTypes';
import {
  tenantAdministrationService
} from '../../services/saas/tenantAdministrationService';
import {
  customerLifecycleService
} from '../../services/saas/customerLifecycleService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface CustomerAccountPortalProps {
  initialTab?: string;
}

export const CustomerAccountPortal: React.FC<CustomerAccountPortalProps> = ({
  initialTab = 'overview'
}) => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [tenant, setTenant] = useState<CanonicalTenant>(() =>
    tenantAdministrationService.getTenant(currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE', 'TENANT_ADMIN')
  );
  const [contract, setContract] = useState<EnterpriseContract | null>(null);
  const [invoices, setInvoices] = useState<CanonicalInvoice[]>([]);
  const [successPlan, setSuccessPlan] = useState<CustomerSuccessPlan | null>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const tid = currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE';
    const t = tenantAdministrationService.getTenant(tid, 'TENANT_ADMIN');
    setTenant(t);
    setContract(customerLifecycleService.getContract(tid, 'TENANT_ADMIN', tid));
    setInvoices(customerLifecycleService.getInvoices(tid, 'TENANT_ADMIN', tid));
    setSuccessPlan(customerLifecycleService.getCustomerSuccessPlan(tid));
  }, [currentTenant?.id]);

  const handleDownloadInvoicePdf = (invNumber: string) => {
    showToast({
      title: 'Downloading Invoice PDF',
      message: `Official PDF for invoice ${invNumber} is being prepared.`,
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Account & Subscription
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {tenant.tier} Tier Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {tenant.displayName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Contract: <span className="text-blue-400 font-mono font-bold">{contract?.contractNumber || 'SKD-MSA-2026'}</span> • Renewal: {contract?.endDate.split('T')[0]} • Region: {tenant.region}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Subscription Overview', icon: Building2 },
          { id: 'contract', label: 'Contract & Commitments', icon: FileText },
          { id: 'usage', label: 'Usage & Quota Radar', icon: Zap },
          { id: 'invoices', label: `Invoices & Billing (${invoices.length})`, icon: CreditCard },
          { id: 'success_plan', label: 'Customer Success Plan', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Active Plan Tier</span>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-blue-400 font-mono">{tenant.tier}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">WORM Evidence Storage</span>
              <div className="text-xl font-bold text-white">
                {tenant.saasProfile.usageMeters.storageUsedGb} <span className="text-xs text-slate-400">/ {tenant.saasProfile.entitlements.storageQuotaGb} GB</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Telemetry Ingestion</span>
              <div className="text-xl font-bold text-white">
                {(tenant.saasProfile.usageMeters.telemetryEventsThisMonth / 1_000_000).toFixed(1)}M <span className="text-xs text-slate-400">/ mo</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Mission-Critical SLA</span>
              <div className="text-xl font-bold text-emerald-400">
                {tenant.saasProfile.entitlements.supportSlaHours <= 0.25 ? '15-Min Response' : `${tenant.saasProfile.entitlements.supportSlaHours} Hours`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACT */}
      {activeTab === 'contract' && contract && (
        <div className="p-6 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div>
              <span className="font-mono text-xs font-bold text-blue-400">{contract.contractNumber}</span>
              <h3 className="text-lg font-bold text-white">Master SaaS Enterprise Agreement</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {contract.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div><span className="text-slate-400 block">Contract Term</span><span className="text-slate-200">{contract.startDate.split('T')[0]} to {contract.endDate.split('T')[0]}</span></div>
            <div><span className="text-slate-400 block">Committed Frameworks</span><span className="text-slate-200">{contract.contractedFrameworksCount} Frameworks</span></div>
            <div><span className="text-slate-400 block">User Seats Licensed</span><span className="text-slate-200">{contract.contractedUsersCount} Seats</span></div>
            <div><span className="text-slate-400 block">Data Protection Addendum</span><span className="text-emerald-400 font-bold">{contract.dpaExecuted ? 'Fully Executed' : 'Pending'}</span></div>
          </div>

          <div className="pt-3 border-t border-slate-700/40 text-xs text-slate-300">
            <span className="font-bold text-slate-200 block mb-1">Contractual Security & Sovereignty Mandate:</span>
            {contract.securityCommitmentsSummary}
          </div>
        </div>
      )}

      {/* TAB 3: USAGE */}
      {activeTab === 'usage' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Real-Time Entitlement & Usage Metering</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>WORM Cryptographic Vault Storage</span>
                <span className="font-mono font-bold">{tenant.saasProfile.usageMeters.storageUsedGb} / {tenant.saasProfile.entitlements.storageQuotaGb} GB</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (tenant.saasProfile.usageMeters.storageUsedGb / tenant.saasProfile.entitlements.storageQuotaGb) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Monthly Cloud Telemetry Stream</span>
                <span className="font-mono font-bold">{(tenant.saasProfile.usageMeters.telemetryEventsThisMonth / 1000).toFixed(0)}k / {(tenant.saasProfile.entitlements.monthlyTelemetryEventsQuota / 1000).toFixed(0)}k</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (tenant.saasProfile.usageMeters.telemetryEventsThisMonth / tenant.saasProfile.entitlements.monthlyTelemetryEventsQuota) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Invoice History & Payment Receipts</h3>
          <div className="space-y-3">
            {invoices.map(inv => (
              <div key={inv.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-blue-400 text-sm">{inv.invoiceNumber}</span>
                  <div className="text-slate-400 mt-0.5">Issued: {inv.issueDate} • {inv.paymentMethod}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-emerald-400 text-base">${inv.totalAmountUsd.toLocaleString()} USD</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {inv.status}
                  </span>
                  <button
                    onClick={() => handleDownloadInvoicePdf(inv.invoiceNumber)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUCCESS PLAN */}
      {activeTab === 'success_plan' && successPlan && (
        <div className="p-6 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white">Customer Success & Audit Readiness Plan</h3>
              <p className="text-xs text-slate-400">Assigned Principal CSM: <span className="text-slate-200 font-bold">{successPlan.assignedCsm}</span></p>
            </div>
            <span className="text-xs font-bold text-blue-400 font-mono">
              Adoption Target: {successPlan.currentAdoptionPercent}% / {successPlan.overallAdoptionTargetPercent}%
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Milestones & Readiness Targets</h4>
            {successPlan.milestones.map(m => (
              <div key={m.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="font-medium text-slate-200">{m.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono text-[11px]">Due: {m.targetDate}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    m.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
