import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
  Save,
  AlertCircle,
  FileCheck2,
  Lock,
  Globe,
  Server,
  UserCheck
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASRegulatoryProfile } from '../../types/masTrmFrameworkTypes';

interface CompanyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const CompanyRegistrationModal: React.FC<CompanyRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { currentTenant, masRegulatoryProfile, updateMASRegulatoryProfile, logAuditEvent } = useGRC();

  const [companyName, setCompanyName] = useState(currentTenant?.name || 'Apex FinTech Solutions Ltd');
  const [uenNumber, setUenNumber] = useState('202112345K');
  const [entityType, setEntityType] = useState(masRegulatoryProfile?.entityType || 'BANK_FULL_OR_QUALIFYING');
  const [licenceType, setLicenceType] = useState(masRegulatoryProfile?.licenceType || 'Full Banking Licence (Banking Act Cap. 19)');
  const [cisoName, setCisoName] = useState('Alexander Tan, CISSP, CISM');
  const [cisoEmail, setCisoEmail] = useState('ciso@apexfintech.sg');
  const [criticalSystemsCount, setCriticalSystemsCount] = useState<number>(masRegulatoryProfile?.designatedCriticalSystemsCount || 5);
  const [singaporeAddress, setSingaporeAddress] = useState('12 Marina Boulevard, Marina Bay Financial Centre Tower 3, #28-01, Singapore 018982');
  const [cloudJurisdiction, setCloudJurisdiction] = useState(masRegulatoryProfile?.cloudAdoptionModel || 'Commercial Cloud SG');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: MASRegulatoryProfile = {
      ...(masRegulatoryProfile || {
        isSingaporeEntity: true,
        isMasRegulated: true,
        entityType: 'BANK_FULL_OR_QUALIFYING',
        licenceType: 'Full Banking Licence (Banking Act Cap. 19)',
        regulatedActivities: ['Banking Business', 'Payment Services'],
        financialServicesOffered: ['Retail Deposits', 'FAST Payments'],
        applicableRegimes: ['Banking Act', 'MAS Notice 644', 'MAS Notice 655', 'MAS TRM Guidelines 2021'],
        businessModel: 'Banking',
        designatedCriticalSystemsCount: 5,
        criticalBusinessServices: ['Deposit & Lending Operations', 'Real-time Interbank Payments'],
        cloudAdoptionModel: 'Commercial Cloud SG',
        cloudProviders: ['AWS Singapore (ap-southeast-1)'],
        materialOutsourcers: ['Equinix Singapore DC'],
        onlineFinancialServicesOffered: true,
        customerAuthenticationMethods: ['Hardware/Software Token MFA'],
        applicabilityStatus: 'CONFIRMED'
      }),
      isSingaporeEntity: true,
      isMasRegulated: true,
      entityType,
      licenceType,
      designatedCriticalSystemsCount: Number(criticalSystemsCount),
      cloudAdoptionModel: cloudJurisdiction
    };

    updateMASRegulatoryProfile(updatedProfile);
    logAuditEvent?.(
      'UPDATE',
      'COMPANY_REGISTRATION',
      `Updated MAS FI Regulatory Registration for ${companyName} (${uenNumber}). Licence: ${licenceType}`
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onSaved) onSaved();
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                  Step 1 &bull; Statutory Governance
                </span>
                <span className="text-xs text-slate-400">Singapore Entity Registration</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Financial Institution Registration & TRM Profile
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-white block font-semibold">
                MAS Technology Risk Management Mandate (Section 1.0 Scope):
              </strong>
              All Singapore-licensed financial institutions, banks, payment service providers, and capital markets intermediaries must register their regulatory entity category, licensed activities, and designated CISO contact for statutory supervision.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Institution Legal Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Singapore UEN (Registration Number)
              </label>
              <input
                type="text"
                value={uenNumber}
                onChange={e => setUenNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                MAS Financial Institution Category
              </label>
              <select
                value={entityType}
                onChange={e => setEntityType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="BANK_FULL_OR_QUALIFYING">Full Bank / Qualifying Full Bank (QFB)</option>
                <option value="BANK_WHOLESALE_OR_MERCHANT">Wholesale Bank / Merchant Bank</option>
                <option value="MAJOR_PAYMENT_INSTITUTION">Major Payment Institution (PS Act)</option>
                <option value="STANDARD_PAYMENT_INSTITUTION">Standard Payment Institution</option>
                <option value="CAPITAL_MARKETS_SERVICES">Capital Markets Services (CMS) Licensee</option>
                <option value="DIRECT_INSURER_LIFE_GENERAL">Direct Insurer (Life / General)</option>
                <option value="FINANCE_COMPANY">Finance Company (Finance Companies Act)</option>
                <option value="DIGITAL_TOKEN_SERVICE">Digital Payment Token (DPT) Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                MAS Statutory Licence Reference
              </label>
              <input
                type="text"
                value={licenceType}
                onChange={e => setLicenceType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Designated CISO / Head of Tech Risk
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cisoName}
                  onChange={e => setCisoName(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                CISO Regulatory Contact Email
              </label>
              <input
                type="email"
                value={cisoEmail}
                onChange={e => setCisoEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Designated Critical Systems (Notice 644)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={criticalSystemsCount}
                  onChange={e => setCriticalSystemsCount(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                  required
                />
                <Server className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Primary Cloud Deployment Model
              </label>
              <div className="relative">
                <select
                  value={cloudJurisdiction}
                  onChange={e => setCloudJurisdiction(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Commercial Cloud SG">Commercial Public Cloud (Singapore Region)</option>
                  <option value="Hybrid Multi-Cloud SG">Hybrid Multi-Cloud (On-prem DC + SG Cloud)</option>
                  <option value="Dedicated Sovereign On-Premises">Dedicated Sovereign Data Centre (Singapore)</option>
                  <option value="Community Financial Cloud">Community Financial Services Cloud</option>
                </select>
                <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Registered Singapore Operating Address
            </label>
            <input
              type="text"
              value={singaporeAddress}
              onChange={e => setSingaporeAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Immutable cryptographic tenant isolation enabled</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 flex items-center gap-1.5 transition-all"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Saved Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Regulatory Registration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
