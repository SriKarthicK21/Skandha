// ============================================================================
// SKANDA ENTERPRISE GRC: 12-STEP TENANT PROVISIONING WIZARD MODAL
// Path: src/components/admin/TenantProvisioningWizardModal.tsx
// ============================================================================

import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Key,
  CreditCard,
  Lock,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import {
  SubscriptionTier,
  BillingCycle,
  CloudResidencyRegion,
  TenantProvisioningDraft
} from '../../types/saasTypes';
import {
  tenantAdministrationService
} from '../../services/saas/tenantAdministrationService';
import {
  CLOUD_REGIONS,
  TIER_ENTITLEMENTS
} from '../../services/saas/enterpriseSaaSService';

export interface TenantProvisioningWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tenantId: string) => void;
}

const AVAILABLE_FRAMEWORKS = [
  { code: 'ISO27001_2022', name: 'ISO/IEC 27001:2022 ISMS' },
  { code: 'MASTRM_2021', name: 'MAS Technology Risk Management (TRM) 2021' },
  { code: 'SOC2_TYPE2', name: 'SOC 2 Type II Security & Confidentiality' },
  { code: 'ISO27701_2019', name: 'ISO/IEC 27701:2019 Privacy Information (PIMS)' },
  { code: 'NIST_CSF_2_0', name: 'NIST Cybersecurity Framework 2.0' },
  { code: 'GDPR_2018', name: 'EU General Data Protection Regulation (GDPR)' },
  { code: 'HIPAA_SECURITY', name: 'US HIPAA Security & Privacy Rule' }
];

const AVAILABLE_CONNECTORS = [
  { id: 'aws-cloudtrail', name: 'AWS CloudTrail & Security Hub', category: 'Cloud' },
  { id: 'azure-monitor', name: 'Azure Monitor & Defender for Cloud', category: 'Cloud' },
  { id: 'gcp-scc', name: 'Google Cloud Security Command Center', category: 'Cloud' },
  { id: 'okta-sso', name: 'Okta SAML 2.0 & SCIM 2.0', category: 'IdP' },
  { id: 'servicenow', name: 'ServiceNow ITSM & Change Management', category: 'ITSM' },
  { id: 'splunk-siem', name: 'Splunk Enterprise SIEM Stream', category: 'SIEM' }
];

export const TenantProvisioningWizardModal: React.FC<TenantProvisioningWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<number>(1);
  const [tenantId, setTenantId] = useState(`TENANT-${Date.now().toString(36).toUpperCase()}`);
  const [orgName, setOrgName] = useState('SingaGlobal WealthTech');
  const [legalName, setLegalName] = useState('SingaGlobal WealthTech Pte. Ltd.');
  const [industry, setIndustry] = useState('WealthTech / Asset Management');
  const [country, setCountry] = useState('Singapore');
  const [region, setRegion] = useState<CloudResidencyRegion>('AWS_AP_SOUTHEAST_1');
  const [tier, setTier] = useState<SubscriptionTier>('ENTERPRISE');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('ANNUAL');
  const [adminEmail, setAdminEmail] = useState('ciso@singaglobal.io');
  const [adminName, setAdminName] = useState('David Tan (CISO)');
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [scimEnabled, setScimEnabled] = useState(true);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['ISO27001_2022', 'MASTRM_2021', 'SOC2_TYPE2']);
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>(['aws-cloudtrail', 'okta-sso', 'servicenow']);
  const [brandColor, setBrandColor] = useState('#0ea5e9');
  const [customDomain, setCustomDomain] = useState('grc.singaglobal.io');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEntitlement = TIER_ENTITLEMENTS[tier];
  const maxFrameworksAllowed = currentEntitlement.maxFrameworks;

  const toggleFramework = (code: string) => {
    if (selectedFrameworks.includes(code)) {
      setSelectedFrameworks(selectedFrameworks.filter(c => c !== code));
    } else {
      if (maxFrameworksAllowed !== -1 && selectedFrameworks.length >= maxFrameworksAllowed) {
        setErrorMessage(`Selected plan (${tier}) allows maximum ${maxFrameworksAllowed} frameworks. Please deselect one or upgrade plan.`);
        return;
      }
      setErrorMessage(null);
      setSelectedFrameworks([...selectedFrameworks, code]);
    }
  };

  const toggleConnector = (id: string) => {
    if (selectedConnectors.includes(id)) {
      setSelectedConnectors(selectedConnectors.filter(c => c !== id));
    } else {
      setSelectedConnectors([...selectedConnectors, id]);
    }
  };

  const handleCompleteActivation = () => {
    setErrorMessage(null);
    const draft: TenantProvisioningDraft = {
      tenantId,
      currentStep: 12,
      completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      organization: {
        name: orgName,
        orgId: `ORG-${tenantId}`,
        legalName,
        industry,
        country,
        timezone: 'Asia/Singapore',
        locale: 'en-SG'
      },
      cloudRegion: region,
      dataResidency: {
        primaryRegion: region,
        backupRegion: region === 'AWS_AP_SOUTHEAST_1' ? 'GCP_ASIA_SOUTH_1' : 'AWS_EU_CENTRAL_1',
        legalJurisdiction: 'Singapore MAS TRM & PDPA Strict Data Sovereignty',
        enforceLocalWormOnly: true
      },
      subscription: {
        tier,
        billingCycle
      },
      tenantAdmin: {
        email: adminEmail,
        name: adminName,
        title: 'Chief Information Security Officer'
      },
      identity: {
        ssoEnabled,
        idpType: 'OKTA',
        scimEnabled
      },
      frameworkCodes: selectedFrameworks,
      branding: {
        brandPrimaryColor: brandColor,
        customDomain
      },
      integrations: {
        enabledConnectors: selectedConnectors
      },
      validationState: {
        isValid: true,
        blockers: []
      },
      updatedAt: new Date().toISOString()
    };

    tenantAdministrationService.saveProvisioningDraft(draft);
    const result = tenantAdministrationService.activateTenant(tenantId, 'SKANDA_PLATFORM_ADMIN');

    if (result.success) {
      onSuccess(tenantId);
      onClose();
    } else {
      setErrorMessage(result.error || 'Activation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Enterprise Tenant Provisioning Wizard
                <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono">
                  12-Step Activation
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure legal entity, regional data residency, subscription entitlements, identity & initial GRC programs.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="bg-slate-950/50 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { n: 1, title: 'Organization' },
            { n: 2, title: 'Region & Sovereignty' },
            { n: 3, title: 'Subscription' },
            { n: 4, title: 'Admin & Identity' },
            { n: 5, title: 'Frameworks' },
            { n: 6, title: 'Activation Summary' }
          ].map(s => (
            <div
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                step === s.n
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30'
                  : step > s.n
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-700/80 flex items-center justify-center text-[10px]">
                {s.n}
              </span>
              <span>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Step 1: Legal Entity & Organization Profile
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Unique Tenant ID</label>
                  <input
                    type="text"
                    value={tenantId}
                    onChange={e => setTenantId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Registered Legal Name</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={e => setLegalName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Industry Vertical</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REGIONAL DATA RESIDENCY */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-400" />
                Step 2: Sovereign Regional Data Residency
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CLOUD_REGIONS.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setRegion(r.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      region === r.id
                        ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{r.flag}</span>
                        <span className="text-sm font-bold text-slate-200">{r.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {r.latencyMs}ms
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{r.dataResidencyLaw}</p>
                    <div className="flex flex-wrap gap-1">
                      {r.complianceBadges.map(b => (
                        <span key={b} className="text-[10px] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SUBSCRIPTION */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Step 3: Subscription Tier & Entitlement Model
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['STARTER', 'GROWTH', 'ENTERPRISE', 'APEX_GLOBAL'] as SubscriptionTier[]).map(t => {
                  const ent = TIER_ENTITLEMENTS[t];
                  return (
                    <div
                      key={t}
                      onClick={() => setTier(t)}
                      className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between ${
                        tier === t
                          ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t}</span>
                        <h4 className="text-base font-bold text-white mt-1">
                          {t === 'APEX_GLOBAL' ? '$48k/yr' : t === 'ENTERPRISE' ? '$36k/yr' : t === 'GROWTH' ? '$24k/yr' : '$12k/yr'}
                        </h4>
                        <ul className="text-[11px] text-slate-400 space-y-1.5 mt-3">
                          <li>• Frameworks: {ent.maxFrameworks === -1 ? 'Unlimited' : ent.maxFrameworks}</li>
                          <li>• User Seats: {ent.maxUsers === -1 ? 'Unlimited' : ent.maxUsers}</li>
                          <li>• Vault Storage: {ent.storageQuotaGb} GB</li>
                          <li>• SLA: {ent.supportSlaHours}h</li>
                        </ul>
                      </div>
                      {tier === t && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected Tier
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: ADMIN & IDENTITY */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                Step 4: Primary Administrator & Identity Federation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Admin Email Address</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Admin Full Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-slate-300">Enterprise Identity Federation</h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ssoEnabled}
                      onChange={e => setSsoEnabled(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 bg-slate-800"
                    />
                    Enable SAML 2.0 Single Sign-On (Okta / Entra ID)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scimEnabled}
                      onChange={e => setScimEnabled(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 bg-slate-800"
                    />
                    Enable SCIM 2.0 Directory Sync
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FRAMEWORKS & CONNECTORS */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Step 5: Enabled Frameworks (Selected: {selectedFrameworks.length} / {maxFrameworksAllowed === -1 ? 'Unlimited' : maxFrameworksAllowed})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_FRAMEWORKS.map(f => {
                  const isSelected = selectedFrameworks.includes(f.code);
                  return (
                    <div
                      key={f.code}
                      onClick={() => toggleFramework(f.code)}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 text-slate-100'
                          : 'bg-slate-800/30 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400">{f.code}</span>
                        <span className="text-xs font-medium">{f.name}</span>
                      </div>
                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-slate-500">+ Enable</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: ACTIVATION SUMMARY */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Step 6: Final Verification & Tenant Activation
              </h3>
              <div className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-400">Tenant ID:</span> <span className="font-mono text-white font-bold">{tenantId}</span></div>
                  <div><span className="text-slate-400">Organization:</span> <span className="text-white font-bold">{orgName}</span></div>
                  <div><span className="text-slate-400">Subscription Tier:</span> <span className="text-blue-400 font-bold">{tier} ({billingCycle})</span></div>
                  <div><span className="text-slate-400">Sovereign Cloud Region:</span> <span className="text-white font-bold">{region}</span></div>
                  <div><span className="text-slate-400">Tenant Administrator:</span> <span className="text-white">{adminName} ({adminEmail})</span></div>
                  <div><span className="text-slate-400">SAML / SCIM:</span> <span className="text-emerald-400 font-bold">{ssoEnabled ? 'Configured' : 'Local Auth'}</span></div>
                  <div><span className="text-slate-400">Enabled Frameworks:</span> <span className="text-white">{selectedFrameworks.join(', ')}</span></div>
                  <div><span className="text-slate-400">Data Residency:</span> <span className="text-white font-bold">Strict Local Sovereignty</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteActivation}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Activate Enterprise Tenant
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
