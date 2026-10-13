// ============================================================================
// SKANDA ENTERPRISE GRC: ENTERPRISE TENANT ADMINISTRATION CONSOLE
// Path: src/components/admin/EnterpriseTenantAdminWorkspace.tsx
//
// Authoritative Customer Administrator Workspace for managing organizational users,
// functional teams, framework entitlements, integrations, identity, SLAs & offboarding
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  ShieldCheck,
  Key,
  Globe2,
  Lock,
  Layers,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LifeBuoy,
  Download,
  ExternalLink,
  Zap,
  Clock,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';
import {
  CanonicalTenant,
  TenantUser,
  TenantTeam,
  SupportCase,
  SupportCategory,
  SupportPriority,
  EnterpriseRole
} from '../../types/saasTypes';
import {
  tenantAdministrationService
} from '../../services/saas/tenantAdministrationService';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { TIER_ENTITLEMENTS } from '../../services/saas/enterpriseSaaSService';

export interface EnterpriseTenantAdminWorkspaceProps {
  initialTab?: string;
}

export const EnterpriseTenantAdminWorkspace: React.FC<EnterpriseTenantAdminWorkspaceProps> = ({
  initialTab = 'overview'
}) => {
  const { currentTenant, currentUser } = useGRC();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [tenant, setTenant] = useState<CanonicalTenant>(() =>
    tenantAdministrationService.getTenant(currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE', 'TENANT_ADMIN')
  );

  // Invite User Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<EnterpriseRole>('GRC_MANAGER');

  // Support Case Modal
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState<SupportCategory>('TECHNICAL');
  const [supportPriority, setSupportPriority] = useState<SupportPriority>('MEDIUM');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDescription, setSupportDescription] = useState('');

  // Offboarding state
  const [isOffboardOpen, setIsOffboardOpen] = useState(false);
  const [offboardingReason, setOffboardingReason] = useState('Contract Term Completion');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentTenant?.id) {
      setTenant(tenantAdministrationService.getTenant(currentTenant.id, 'TENANT_ADMIN'));
    }
  }, [currentTenant?.id]);

  const refreshTenant = () => {
    setTenant(tenantAdministrationService.getTenant(tenant.tenantId, 'TENANT_ADMIN'));
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    const result = tenantAdministrationService.inviteUser(
      tenant.tenantId,
      inviteEmail,
      inviteName,
      inviteRole
    );

    if (result.success) {
      showToast({ title: 'Invitation Sent', message: `User invitation sent to ${inviteEmail}`, type: 'success' });
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      refreshTenant();
    } else {
      showToast({ title: 'Invitation Failed', message: `${result.error}`, type: 'error' });
    }
  };

  const handleDeactivateUser = (userId: string) => {
    const result = tenantAdministrationService.deactivateUser(tenant.tenantId, userId);
    if (result.success) {
      showToast({ title: 'User Deactivated', message: 'User deactivated successfully', type: 'info' });
      refreshTenant();
    }
  };

  const handleCreateSupportCase = (e: React.FormEvent) => {
    e.preventDefault();
    tenantAdministrationService.createSupportCase(
      tenant.tenantId,
      supportCategory,
      supportPriority,
      supportSubject,
      supportDescription,
      currentUser?.email || 'admin@acmefintech.io'
    );
    showToast({ title: 'Support Case Created', message: 'Support case submitted. SLA clock started.', type: 'success' });
    setIsSupportOpen(false);
    setSupportSubject('');
    setSupportDescription('');
    refreshTenant();
  };

  const handleRequestOffboarding = () => {
    const result = tenantAdministrationService.requestOffboarding(
      tenant.tenantId,
      offboardingReason,
      currentUser?.email || 'admin@acmefintech.io'
    );
    if (result.success) {
      showToast({ title: 'Offboarding Initiated', message: `Offboarding workflow initiated (${result.offboardingId}). API keys and integrations scheduled for de-provisioning.`, type: 'warning' });
      setIsOffboardOpen(false);
      refreshTenant();
    }
  };

  const handleCompleteOffboarding = () => {
    const result = tenantAdministrationService.completeOffboarding(
      tenant.tenantId,
      currentUser?.email || 'ciso@acmefintech.io'
    );
    if (result.success && result.exitCertificate) {
      showToast({ title: 'Offboarding Complete', message: `Offboarding complete. Customer Exit Certificate ${result.exitCertificate.certificateId} generated.`, type: 'success' });
      refreshTenant();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Tenant Administration
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {tenant.tier} Plan Active
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {tenant.region}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {tenant.displayName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {tenant.legalName} • Jurisdiction: {tenant.dataResidencyJurisdiction} • Status: <span className="text-emerald-400 font-bold">{tenant.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Invite User
          </button>
          <button
            onClick={() => setIsSupportOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4 text-blue-400" /> New Support Ticket
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Tenant 360', icon: Building2 },
          { id: 'users', label: `Users (${tenant.users.length})`, icon: Users },
          { id: 'teams', label: `Teams (${tenant.teams.length})`, icon: Layers },
          { id: 'frameworks', label: `Frameworks (${tenant.enabledFrameworkCodes.length})`, icon: Shield },
          { id: 'integrations', label: `Integrations (${tenant.integrationHealth.length})`, icon: Zap },
          { id: 'support', label: `Support & SLAs (${tenant.supportCases.length})`, icon: LifeBuoy },
          { id: 'offboarding', label: 'Offboarding & Data Export', icon: LogOut }
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

      {/* TAB 1: OVERVIEW & TENANT 360 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Customer Health Status</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-5 h-5" /> {tenant.healthStatus}
                </span>
                <span className="text-xs text-slate-400 font-mono">({tenant.healthScore.overallScore}%)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">WORM Evidence Storage</span>
              <div className="text-lg font-bold text-white">
                {tenant.saasProfile.usageMeters.storageUsedGb} <span className="text-xs text-slate-400 font-normal">/ {tenant.saasProfile.entitlements.storageQuotaGb} GB</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Telemetry Ingestion Rate</span>
              <div className="text-lg font-bold text-white">
                {(tenant.saasProfile.usageMeters.telemetryEventsThisMonth / 1_000_000).toFixed(1)}M <span className="text-xs text-slate-400 font-normal">/ {(tenant.saasProfile.entitlements.monthlyTelemetryEventsQuota / 1_000_000).toFixed(0)}M ev/mo</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Support Plan SLA</span>
              <div className="text-lg font-bold text-blue-400">
                {tenant.saasProfile.entitlements.supportSlaHours <= 0.25 ? '15-Min Mission Critical' : `${tenant.saasProfile.entitlements.supportSlaHours} Hours`}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Tenant Metadata & Identity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span className="text-slate-400 block">Organization ID</span><span className="font-mono text-slate-200">{tenant.organizationId}</span></div>
              <div><span className="text-slate-400 block">Industry</span><span className="text-slate-200">{tenant.industry}</span></div>
              <div><span className="text-slate-400 block">Tenant Administrator</span><span className="text-slate-200">{tenant.tenantAdminEmail}</span></div>
              <div><span className="text-slate-400 block">Provisioned Date</span><span className="text-slate-200">{tenant.createdAt.split('T')[0]}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & ACCESS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Tenant Users ({tenant.users.length} / {tenant.saasProfile.entitlements.maxUsers === -1 ? 'Unlimited' : tenant.saasProfile.entitlements.maxUsers})
            </h3>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Invite New User
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Name & Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Auth Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tenant.users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.authMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {u.lastLoginAt ? u.lastLoginAt.replace('T', ' ').substring(0, 16) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleDeactivateUser(u.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Functional Teams & Asset Ownership</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenant.teams.map(t => (
              <div key={t.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{t.department}</span>
                </div>
                <div className="text-xs text-slate-400">Lead: <span className="text-slate-200">{t.leadEmail}</span></div>
                <div className="text-xs text-slate-400">Members: <span className="text-slate-200">{t.memberEmails.length} Users</span></div>
                {t.ownedControlIds && (
                  <div className="text-[11px] text-blue-400 mt-2 font-mono">
                    Owned Controls: {t.ownedControlIds.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FRAMEWORKS */}
      {activeTab === 'frameworks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Enabled Regulatory Frameworks ({tenant.enabledFrameworkCodes.length} / {tenant.saasProfile.entitlements.maxFrameworks === -1 ? 'Unlimited' : tenant.saasProfile.entitlements.maxFrameworks})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tenant.enabledFrameworkCodes.map(code => (
              <div key={code} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-400">{code}</span>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">Active Enterprise Program</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Telemetry & Security Connector Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenant.integrationHealth.map(conn => (
              <div key={conn.connectorId} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{conn.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {conn.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Last Sync: {conn.lastSyncAt ? conn.lastSyncAt.split('T')[0] : 'Not synced'}</span>
                  <span>Events Ingested: {conn.lastSyncEventsCount?.toLocaleString() || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT & SLAS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Active Support Cases & SLA Tracker</h3>
            <button
              onClick={() => setIsSupportOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Support Ticket
            </button>
          </div>

          <div className="space-y-3">
            {tenant.supportCases.map(c => (
              <div key={c.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{c.id}</span>
                    <span className="font-bold text-white text-sm">{c.subject}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Target SLA: {c.targetSlaHours <= 0.25 ? '15 mins' : `${c.targetSlaHours} hours`}</span>
                  <span>Created: {c.createdAt.split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: OFFBOARDING & EXIT */}
      {activeTab === 'offboarding' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LogOut className="w-5 h-5 text-amber-400" />
              Tenant Offboarding & Sanitized Data Export
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Enterprise customer exit workflow preserving statutory WORM audit ledgers while exporting all operational processes, controls, evidence metadata & generating an immutable SHA-256 Customer Exit Certificate.
            </p>

            {tenant.status === 'ACTIVE' && (
              <button
                onClick={() => setIsOffboardOpen(true)}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Initiate Formal Offboarding Workflow
              </button>
            )}

            {tenant.status === 'OFFBOARDING' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 block">OFFBOARDING IN PROGRESS</span>
                <p className="text-xs text-slate-300">
                  Services scheduled for de-provisioning. Complete the workflow to generate your Customer Exit Certificate.
                </p>
                <button
                  onClick={handleCompleteOffboarding}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Confirm & Generate Customer Exit Certificate
                </button>
              </div>
            )}

            {tenant.status === 'ARCHIVED' && tenant.offboardingRecord?.certificate && (
              <div className="p-4 bg-slate-900 border border-emerald-500/30 rounded-xl space-y-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Customer Offboarding Certificate Issued
                </span>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>Certificate ID: {tenant.offboardingRecord.certificate.certificateId}</div>
                  <div>Master Digest: {tenant.offboardingRecord.certificate.sha256MasterHash}</div>
                  <div>Export Scope: {tenant.offboardingRecord.certificate.dataScope.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Invite User to {tenant.displayName}</h3>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">User Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Assigned Enterprise Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as EnterpriseRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  <option value="CISO">CISO / Security Head</option>
                  <option value="GRC_MANAGER">GRC Manager</option>
                  <option value="CONTROL_OWNER">Control Owner</option>
                  <option value="RISK_OWNER">Risk Owner</option>
                  <option value="PROCESS_OWNER">Process Owner / SME</option>
                  <option value="AUDITOR">External / Internal Auditor</option>
                  <option value="EMPLOYEE">General Employee</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Case Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Mission-Critical Support Ticket</h3>
            <form onSubmit={handleCreateSupportCase} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={supportCategory}
                    onChange={e => setSupportCategory(e.target.value as SupportCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="TECHNICAL">Technical / Telemetry</option>
                    <option value="SECURITY">Security / Vulnerability</option>
                    <option value="IDENTITY">Identity / SAML / SCIM</option>
                    <option value="GRC">GRC / Audit / Frameworks</option>
                    <option value="BILLING">Billing / Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Priority</label>
                  <select
                    value={supportPriority}
                    onChange={e => setSupportPriority(e.target.value as SupportPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="CRITICAL">Critical (P1 Outage)</option>
                    <option value="HIGH">High (P2 Degradation)</option>
                    <option value="MEDIUM">Medium (P3 Question)</option>
                    <option value="LOW">Low (P4 Request)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue..."
                  value={supportSubject}
                  onChange={e => setSupportSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Include reproduction steps, error logs, or affected controls..."
                  value={supportDescription}
                  onChange={e => setSupportDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offboarding Modal */}
      {isOffboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-red-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Request Tenant Offboarding
            </h3>
            <p className="text-xs text-slate-300">
              This will schedule API keys, SCIM tokens, and webhook endpoints for revocation while compiling an immutable data export archive.
            </p>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reason for Offboarding</label>
              <textarea
                value={offboardingReason}
                onChange={e => setOffboardingReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOffboardOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestOffboarding}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
              >
                Initiate Offboarding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
