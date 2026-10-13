// ============================================================================
// SKANDA ENTERPRISE GRC: HIGH-END SAAS SUBSCRIPTION & PLATFORM HUB
// Path: src/components/saas/EnterpriseSaaSHub.tsx
//
// World-class Multi-Tenant SaaS Cockpit managing Subscription Tiers, Usage Meters,
// SAML/SCIM Directory Sync, API Tokens, Regional Data Residency & Cloud SLAs
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  CreditCard,
  Key,
  Globe2,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Download,
  Copy,
  Check,
  Server,
  Database,
  Building2,
  Clock,
  Radio,
  ExternalLink,
  Users,
  HardDrive,
  Cpu,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  FileText
} from 'lucide-react';
import {
  enterpriseSaaSService,
  TIER_ENTITLEMENTS,
  CLOUD_REGIONS,
  SAAS_ADD_ONS
} from '../../services/saas/enterpriseSaaSService';
import {
  SubscriptionTier,
  BillingCycle,
  CloudResidencyRegion,
  TenantSaaSProfile,
  SaaSApiKey
} from '../../types/saasTypes';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface EnterpriseSaaSHubProps {
  initialTab?: string;
}

export const EnterpriseSaaSHub: React.FC<EnterpriseSaaSHubProps> = ({
  initialTab = 'overview'
}) => {
  const { currentTenant } = useGRC();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [profile, setProfile] = useState<TenantSaaSProfile>(() =>
    enterpriseSaaSService.getProfile(currentTenant?.id)
  );
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New API Key form modal
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('SIEM Log Ingestion Pipeline');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['telemetry:ingest', 'controls:evaluate']);

  // SSO Edit state
  const [ssoIssuer, setSsoIssuer] = useState(profile.ssoConfig.idpIssuerUrl);
  const [ssoLoginUrl, setSsoLoginUrl] = useState(profile.ssoConfig.ssoLoginUrl);
  const [ssoEnforced, setSsoEnforced] = useState(profile.ssoConfig.enforceSsoForDomain);

  // Branding Edit state
  const [customDomain, setCustomDomain] = useState(profile.customBranding.customDomain);
  const [watermark, setWatermark] = useState(profile.customBranding.reportWatermarkText || '');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (currentTenant?.id) {
      enterpriseSaaSService.setTenantId(currentTenant.id);
      setProfile(enterpriseSaaSService.getProfile(currentTenant.id));
    }
  }, [currentTenant?.id]);

  const activeRegion = CLOUD_REGIONS.find(r => r.id === profile.cloudRegion) || CLOUD_REGIONS[0];
  const slaHealth = enterpriseSaaSService.getSlaHealth();

  const handleUpgradeTier = (tier: SubscriptionTier) => {
    const updated = enterpriseSaaSService.upgradeTier(tier, profile.billingCycle);
    setProfile({ ...updated });
    showToast({
      title: `Plan Upgraded: ${tier}`,
      message: `Your enterprise environment is now unlocked with ${tier} entitlements & quotas.`,
      type: 'success'
    });
  };

  const handleSwitchRegion = (regionId: CloudResidencyRegion) => {
    const updated = enterpriseSaaSService.switchCloudRegion(regionId);
    setProfile({ ...updated });
    showToast({
      title: `Data Residency Switched`,
      message: `Primary compliance database routing updated to ${regionId}.`,
      type: 'info'
    });
  };

  const handleToggleAddon = (addonId: string) => {
    const updated = enterpriseSaaSService.toggleAddOn(addonId);
    setProfile({ ...updated });
    const addon = updated.addOns.find(a => a.id === addonId);
    showToast({
      title: addon?.enabled ? `Add-On Activated: ${addon.name}` : `Add-On Deactivated`,
      message: addon?.enabled
        ? `Monthly billing updated (+$${addon.priceMonthlyUsd}/mo). Feature unlocked.`
        : `Add-on disabled.`,
      type: 'success'
    });
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    enterpriseSaaSService.createApiKey(newKeyName, newKeyScopes);
    setProfile({ ...enterpriseSaaSService.getProfile() });
    setShowNewKeyModal(false);
    showToast({
      title: `API Key Generated`,
      message: `New scoped token created successfully. Store secret securely.`,
      type: 'success'
    });
  };

  const handleRevokeApiKey = (keyId: string) => {
    enterpriseSaaSService.revokeApiKey(keyId);
    setProfile({ ...enterpriseSaaSService.getProfile() });
    showToast({
      title: `API Key Revoked`,
      message: `Token has been immediately invalidated across all gateway endpoints.`,
      type: 'info'
    });
  };

  const handleSaveSso = () => {
    const updatedSso = enterpriseSaaSService.saveSsoConfig({
      idpIssuerUrl: ssoIssuer,
      ssoLoginUrl,
      enforceSsoForDomain: ssoEnforced
    });
    setProfile({ ...profile, ssoConfig: updatedSso });
    showToast({
      title: `SSO / SCIM Configuration Saved`,
      message: `SAML 2.0 identity federation parameters verified and active.`,
      type: 'success'
    });
  };

  const handleSaveBranding = () => {
    const updatedBranding = enterpriseSaaSService.saveCustomBranding({
      customDomain,
      reportWatermarkText: watermark
    });
    setProfile({ ...profile, customBranding: updatedBranding });
    showToast({
      title: `Custom Branding Updated`,
      message: `Custom CNAME and report watermarks updated across all workspaces.`,
      type: 'success'
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">
      {/* Top Banner & High-End Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Enterprise SaaS & Subscription Hub
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-500/40 shadow-xs">
                  {profile.tier.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {slaHealth.systemUptimePercentage}% SLA
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Multi-Tenant Licensing, Real-Time Usage Meters, SAML 2.0 / SCIM 2.0 Sync, Regional Data Residency & Dedicated KMS
              </p>
            </div>
          </div>
        </div>

        {/* Global Region & Quick Upgrade CTA */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <span className="text-base">{activeRegion.flag}</span>
            <div>
              <div className="font-semibold text-white">{activeRegion.name}</div>
              <div className="text-[10px] text-slate-400">{activeRegion.latencyMs}ms Latency · {activeRegion.provider}</div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('plans')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            Change Plan / Add-Ons
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-800 text-sm">
        {[
          { id: 'overview', label: 'Usage & Quota Cockpit', icon: Layers },
          { id: 'plans', label: 'Subscription Plans & Matrix', icon: Sparkles },
          { id: 'addons', label: 'Add-on Marketplace', icon: Zap, badge: `${profile.addOns.filter(a => a.enabled).length} Active` },
          { id: 'billing', label: 'Invoices & Corporate Billing', icon: CreditCard },
          { id: 'sso_scim', label: 'SSO (SAML 2.0) & SCIM Sync', icon: Users, badge: profile.ssoConfig.enabled ? 'Live' : 'Off' },
          { id: 'api_keys', label: 'API Keys & Webhooks', icon: Key, badge: `${profile.apiKeys.length} Keys` },
          { id: 'branding', label: 'Custom Branding & Domain', icon: Globe2 },
          { id: 'data_residency', label: 'Cloud Residency & SLAs', icon: Server, badge: activeRegion.flag }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & USAGE COCKPIT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Plan Overview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/40 to-slate-900 border border-slate-700/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Active Enterprise Subscription
                </span>
                <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {profile.status}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {profile.tier.replace('_', ' ')} TIER
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Annual billing cycle active. Next scheduled renewal on <span className="text-slate-200 font-semibold">2026-12-31</span>.
                Includes 24/7 mission-critical SLA (15 min response time) and multi-region continuous audit cleanroom.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('billing')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                View Latest Invoice ($48,000)
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/20 transition"
              >
                Manage Entitlements
              </button>
            </div>
          </div>

          {/* 6 Real-Time Quota vs Usage Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Storage Meter */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Evidence Storage Vault</span>
                <HardDrive className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {(profile.usageMeters.storageUsedGb / 1000).toFixed(2)} TB
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {profile.entitlements.storageQuotaGb / 1000} TB Quota
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${(profile.usageMeters.storageUsedGb / profile.entitlements.storageQuotaGb) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{Math.round((profile.usageMeters.storageUsedGb / profile.entitlements.storageQuotaGb) * 100)}% Utilized</span>
                <span className="text-emerald-400 font-medium">8.58 TB Free</span>
              </div>
            </div>

            {/* Telemetry Stream Meter */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Monthly Telemetry Ingestion</span>
                <Radio className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {(profile.usageMeters.telemetryEventsThisMonth / 1_000_000).toFixed(2)}M
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {profile.entitlements.monthlyTelemetryEventsQuota / 1_000_000}M Events
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${(profile.usageMeters.telemetryEventsThisMonth / profile.entitlements.monthlyTelemetryEventsQuota) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Rate: ~165 events/sec</span>
                <span className="text-emerald-400 font-medium">Within Limit</span>
              </div>
            </div>

            {/* AI Studio Tokens */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">AI Discovery & Doc Tokens</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {(profile.usageMeters.aiTokensUsedThisMonth / 1_000_000).toFixed(2)}M
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {profile.entitlements.aiStudioMonthlyTokens / 1_000_000}M Tokens
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${(profile.usageMeters.aiTokensUsedThisMonth / profile.entitlements.aiStudioMonthlyTokens) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>SME Interviews + Drafting</span>
                <span className="text-emerald-400 font-medium">81.55M Available</span>
              </div>
            </div>

            {/* Active Monitored Controls */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Monitored Controls</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {profile.usageMeters.activeControlsMonitored}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  Unlimited Allocation
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>ISO 27001, MAS TRM, SOC 2</span>
                <span className="text-slate-300">Continuous Evaluation</span>
              </div>
            </div>

            {/* Active Users */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Users & Roles</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {profile.usageMeters.activeUsersCount}
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  Unlimited Seats
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-full" />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>SCIM 2.0 Synced with Okta</span>
                <span className="text-slate-300">12 Auditor Cleanroom Seats</span>
              </div>
            </div>

            {/* API Requests */}
            <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">API Ingress & Webhooks</span>
                <Key className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {(profile.usageMeters.apiCallsThisMonth / 1000).toFixed(0)}k
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Requests this month
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full w-3/4" />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Avg Latency: 18ms</span>
                <span className="text-emerald-400 font-medium">99.99% Success</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANS & ENTITLEMENTS MATRIX */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Enterprise Tier Entitlements & Pricing Matrix</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select or upgrade subscription tier. Feature unlocks are applied instantly across all tenant workspaces.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Current: {profile.tier}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                tier: 'STARTER' as SubscriptionTier,
                name: 'Growth & Mid-Market',
                price: '$1,200',
                period: '/month billed annually',
                desc: 'Single-framework compliance for early-stage and high-growth startups.',
                highlights: ['1 Framework (ISO or SOC 2)', '15 Users & 2 Auditor Seats', '50 GB WORM Vault', '100k Telemetry Events/mo', 'Standard 24h Support SLA']
              },
              {
                tier: 'GROWTH' as SubscriptionTier,
                name: 'Multi-Framework Scale',
                price: '$2,400',
                period: '/month billed annually',
                desc: 'Multi-compliance for scaling mid-market companies with automated evidence harvesting.',
                highlights: ['3 Frameworks', '50 Users & 5 Auditor Seats', '250 GB WORM Vault', '1M Telemetry Events/mo', 'AI Autonomous Interviews', '8h Business Support SLA']
              },
              {
                tier: 'ENTERPRISE' as SubscriptionTier,
                name: 'Enterprise GRC',
                price: '$3,600',
                period: '/month billed annually',
                desc: 'Full regulatory compliance, cross-framework harmonization, and WORM ledger assurance.',
                highlights: ['10 Frameworks (MAS, ISO, DPDP)', '500 Users & 20 Auditor Seats', '2 TB WORM Vault', '10M Telemetry Events/mo', 'SAML 2.0 & SCIM 2.0', 'Custom White-labeling', '4h Priority SLA']
              },
              {
                tier: 'APEX_GLOBAL' as SubscriptionTier,
                name: 'Apex Global Financial',
                price: '$4,800',
                period: '/month billed annually',
                desc: 'Mission-critical Tier 1 financial institutions, bring-your-own-KMS, and dedicated VPC.',
                popular: true,
                highlights: ['Unlimited Frameworks & Users', 'Unlimited Auditor Seats', '10 TB WORM Vault', '100M Telemetry Events/mo', 'Bring-Your-Own-KMS (CloudHSM)', 'Post-Quantum Crypto Ledger', '15-Minute Mission-Critical SLA']
              }
            ].map(card => {
              const isCurrent = profile.tier === card.tier;
              return (
                <div
                  key={card.tier}
                  className={`p-6 rounded-2xl flex flex-col justify-between relative transition-all ${
                    card.popular
                      ? 'bg-gradient-to-b from-indigo-950/60 via-slate-800/80 to-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-800/60 border border-slate-700/80'
                  }`}
                >
                  {card.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-indigo-500 text-white shadow-md">
                      Most Selected Enterprise
                    </span>
                  )}

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">{card.name}</div>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-black text-white">{card.price}</span>
                      <span className="text-[11px] text-slate-400">{card.period}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{card.desc}</p>

                    <div className="space-y-2 pt-4 border-t border-slate-700/80 text-xs text-slate-300">
                      {card.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider rounded-xl cursor-default flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Active Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgradeTier(card.tier)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/20 transition"
                      >
                        Select {card.tier}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ADD-ON MARKETPLACE */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Modular Enterprise Power-Ups & Add-Ons</h3>
              <p className="text-xs text-slate-400 mt-1">
                Activate advanced capabilities on demand. Monthly fees are consolidated into your single corporate invoice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.addOns.map(addon => (
              <div
                key={addon.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  addon.enabled
                    ? 'bg-slate-800/80 border-indigo-500/60 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-800/40 border-slate-700/60 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-400">{addon.code}</span>
                      {addon.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {addon.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-white">
                      +${addon.priceMonthlyUsd}/mo
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-white">{addon.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{addon.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Status: <span className={addon.enabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{addon.enabled ? 'Active' : 'Disabled'}</span>
                  </span>
                  <button
                    onClick={() => handleToggleAddon(addon.id)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                      addon.enabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                    }`}
                  >
                    {addon.enabled ? 'Deactivate' : 'Activate Add-On'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INVOICES & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Payment Method Card */}
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Corporate Wire / JPMorgan Chase (****4190)</div>
                <div className="text-xs text-slate-400 mt-0.5">Tax ID: US-EIN 94-8192038 • GST Exempt Ref: SG-GST-99214</div>
              </div>
            </div>
            <button
              onClick={() => showToast({ title: 'Billing Updated', message: 'Corporate payment contact updated.', type: 'info' })}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              Update Payment Details
            </button>
          </div>

          {/* Invoice History Table */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden">
            <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Tax Invoices & Payment Ledger</h3>
              <span className="text-xs text-slate-400">Auditable GST / VAT compliant invoices</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Invoice ID</th>
                  <th className="p-3.5">Issue Date</th>
                  <th className="p-3.5">Billing Period</th>
                  <th className="p-3.5">Plan & Scope</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {profile.invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-300">{inv.issueDate}</td>
                    <td className="p-3.5 text-slate-400">{inv.billingPeriod}</td>
                    <td className="p-3.5 font-medium text-slate-100">{inv.planName}</td>
                    <td className="p-3.5 font-bold text-white">${inv.amount.toLocaleString()} {inv.currency}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => showToast({ title: 'Downloading Invoice PDF', message: `Signed receipt for ${inv.invoiceNumber} ready.`, type: 'success' })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs inline-flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SSO & SCIM DIRECTORY SYNC */}
      {activeTab === 'sso_scim' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">SAML 2.0 Single Sign-On (SSO)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect your enterprise Identity Provider (Okta, Microsoft Entra ID / Azure AD, PingFederate, Google Workspace).
                </p>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IdP: {profile.ssoConfig.provider}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Identity Provider Issuer URL</label>
                <input
                  type="text"
                  value={ssoIssuer}
                  onChange={e => setSsoIssuer(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Single Sign-On Login Redirect URL</label>
                <input
                  type="text"
                  value={ssoLoginUrl}
                  onChange={e => setSsoLoginUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">SKANDA Assertion Consumer Service (ACS) URL:</div>
                <div className="font-mono text-indigo-400">https://api.skanda.enterprise.com/saml/v2/SKANDA-DEMO-ENTERPRISE/acs</div>
                <div className="font-semibold text-slate-300 pt-1">Entity ID (Audience URI):</div>
                <div className="font-mono text-indigo-400">urn:skanda:sp:SKANDA-DEMO-ENTERPRISE</div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enforceSso"
                  checked={ssoEnforced}
                  onChange={e => setSsoEnforced(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                />
                <label htmlFor="enforceSso" className="text-slate-300 font-medium">
                  Enforce SSO for all users on corporate domains (@acmefintech.io)
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={handleSaveSso}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
              >
                Save SAML Configuration
              </button>
            </div>
          </div>

          {/* SCIM 2.0 Directory Sync */}
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">SCIM 2.0 User Provisioning & Deprovisioning</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automate joiner account creation and instant 4-hour leaver deprovisioning from your HRIS / Okta.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400">SCIM Active</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
              <div>
                <span className="text-slate-400 block mb-1">SCIM Base Endpoint:</span>
                <span className="font-mono text-indigo-400">{profile.ssoConfig.scimEndpointUrl}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">SCIM Bearer Token:</span>
                <span className="font-mono text-slate-300">{profile.ssoConfig.scimBearerToken.slice(0, 16)}****************</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: API KEYS & WEBHOOKS */}
      {activeTab === 'api_keys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Scoped Enterprise API Tokens</h3>
              <p className="text-xs text-slate-400 mt-1">
                Programmatic tokens for CI/CD security pipelines, EventBridge telemetry, and SIEM feeds.
              </p>
            </div>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow"
            >
              <Plus className="w-4 h-4" /> Generate API Key
            </button>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-slate-700/60 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Key Name</th>
                  <th className="p-3.5">Token Prefix</th>
                  <th className="p-3.5">Scopes</th>
                  <th className="p-3.5">Last Used</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {profile.apiKeys.map(k => (
                  <tr key={k.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-medium text-white">{k.name}</td>
                    <td className="p-3.5 font-mono text-blue-400">{k.maskedSecret}</td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map(s => (
                          <span key={s} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-700 text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${k.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {k.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeApiKey(k.id)}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded"
                        >
                          Revoke
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

      {/* TAB 7: CUSTOM BRANDING & DOMAIN */}
      {activeTab === 'branding' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-4">
            <h3 className="text-base font-semibold text-white">White-Labeling & Custom Domain</h3>
            <p className="text-xs text-slate-400">
              Host SKANDA on your own corporate subdomain with verified SSL certificates and custom report watermarks.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Custom Corporate Domain</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    placeholder="grc.yourcompany.com"
                    className="flex-1 p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                  <span className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {profile.customBranding.customDomainStatus}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="text-slate-300 font-semibold">DNS CNAME Record Target:</div>
                <div className="text-indigo-400 font-bold">{profile.customBranding.cnameTarget}</div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Auditor Report Watermark</label>
                <input
                  type="text"
                  value={watermark}
                  onChange={e => setWatermark(e.target.value)}
                  placeholder="CONFIDENTIAL - FOR AUTHORIZED AUDITORS ONLY"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={handleSaveBranding}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow"
              >
                Save Branding Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: CLOUD RESIDENCY & SLA SENTINEL */}
      {activeTab === 'data_residency' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Global Cloud Data Residency & Statutory Sovereign Nodes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose where your encrypted tenant databases and WORM evidence ledgers are physically stored.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CLOUD_REGIONS.map(reg => {
              const isSelected = profile.cloudRegion === reg.id;
              return (
                <div
                  key={reg.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{reg.flag}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{reg.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{reg.id}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300">
                        {reg.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{reg.dataResidencyLaw}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {reg.complianceBadges.map(b => (
                        <span key={b} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Ping: <span className="text-emerald-400 font-mono font-bold">{reg.latencyMs}ms</span>
                    </span>
                    {isSelected ? (
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Active Sovereign Node
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSwitchRegion(reg.id)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Switch Region
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW API KEY MODAL */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Generate Enterprise API Token</h3>
              <button onClick={() => setShowNewKeyModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateApiKey} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Key Description / Integration Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-400 mb-1">Select Scopes</label>
                {['telemetry:ingest', 'controls:evaluate', 'evidence:upload', 'findings:query'].map(scope => (
                  <label key={scope} className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={newKeyScopes.includes(scope)}
                      onChange={e => {
                        if (e.target.checked) setNewKeyScopes([...newKeyScopes, scope]);
                        else setNewKeyScopes(newKeyScopes.filter(s => s !== scope));
                      }}
                      className="rounded border-slate-700 bg-slate-950 text-blue-600"
                    />
                    <span className="font-mono text-[11px]">{scope}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded shadow"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
