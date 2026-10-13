import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  X,
  Shield,
  Globe,
  Briefcase,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrganizationCreated?: (newOrg: any) => void;
  theme?: string;
}

const AVAILABLE_FRAMEWORKS = [
  { id: 'ISO/IEC 27001:2022', label: 'ISO/IEC 27001:2022 (ISMS)' },
  { id: 'MAS TRM 2021', label: 'MAS Technology Risk Management 2021' },
  { id: 'SOC 2 Type II', label: 'SOC 2 Type II (Trust Services Criteria)' },
  { id: 'ISO/IEC 42001:2023', label: 'ISO/IEC 42001:2023 (AI Governance)' },
  { id: 'India DPDP Act 2023', label: 'India Digital Personal Data Protection Act' },
  { id: 'EU GDPR', label: 'EU General Data Protection Regulation' },
  { id: 'ISO 27701:2019', label: 'ISO 27701:2019 (Privacy Information Management)' }
];

const JURISDICTIONS = [
  { country: 'Singapore', code: 'SG', defaultRegulator: 'Monetary Authority of Singapore (MAS)' },
  { country: 'United Kingdom', code: 'GB', defaultRegulator: 'Information Commissioner\'s Office (ICO) & FCA' },
  { country: 'United States', code: 'US', defaultRegulator: 'AICPA, HHS (HIPAA), SEC' },
  { country: 'India', code: 'IN', defaultRegulator: 'Data Protection Board of India (DPBI) & CERT-In' },
  { country: 'European Union', code: 'EU', defaultRegulator: 'European Data Protection Board & National DPAs' },
  { country: 'Australia', code: 'AU', defaultRegulator: 'OAIC & APRA' }
];

const INDUSTRIES = [
  'Banking, Financial Services & FinTech',
  'Technology & Software SaaS',
  'Healthcare & Life Sciences',
  'Critical Infrastructure & Energy',
  'E-Commerce & Digital Marketplaces',
  'Professional Services & Legal'
];

export const AddOrganizationModal: React.FC<AddOrganizationModalProps> = ({
  isOpen,
  onClose,
  onOrganizationCreated,
  theme = 'dark'
}) => {
  const { switchTenant, tenants } = useGRC();
  const { showToast } = useToast();

  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('Singapore');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [contactEmail, setContactEmail] = useState('');
  const [scopeStatement, setScopeStatement] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['ISO/IEC 27001:2022']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleFramework = (fId: string) => {
    setSelectedFrameworks(prev =>
      prev.includes(fId)
        ? prev.length > 1 ? prev.filter(f => f !== fId) : prev
        : [...prev, fId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!legalName.trim() || !displayName.trim()) {
      setErrorMessage('Legal Organization Name and Display Name are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        legalName: legalName.trim(),
        displayName: displayName.trim(),
        country,
        industry,
        contactEmail: contactEmail.trim() || `compliance@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        selectedFrameworks,
        scopeStatement: scopeStatement.trim() || `${displayName} Enterprise Cloud Operations and Data Processing Scope`,
        createdBy: 'Authorized Security Officer'
      };

      const res = await fetch('/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create persistent organization record');
      }

      showToast({
        title: 'Organization Registered',
        message: `${displayName} has been added to SKANDA persistent multi-tenant directory with uninitialized baseline.`,
        type: 'success'
      });

      if (data.tenant && data.tenant.id) {
        switchTenant(data.tenant.id);
      }

      if (onOrganizationCreated) {
        onOrganizationCreated(data.organization);
      }

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
              : 'bg-[#0E1726] border-[#1F2B3F] text-[#F8FAFC]'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-[#1F2B3F] bg-[#0A101D]'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Register Enterprise Organization</h3>
                <p className="text-xs text-slate-400">Add an authenticated, persistent organization entity to SKANDA</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SingaTech Global Pte Ltd"
                  value={legalName}
                  onChange={e => {
                    setLegalName(e.target.value);
                    if (!displayName) setDisplayName(e.target.value.replace(/ (Pte Ltd|Ltd|Corp|Inc|LLC)/gi, ''));
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#152033] border-[#22314A] text-slate-100 placeholder-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Display / Trading Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SingaTech"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#152033] border-[#22314A] text-slate-100 placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jurisdiction & Country *
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#152033] border-[#22314A] text-slate-100'
                  }`}
                >
                  {JURISDICTIONS.map(j => (
                    <option key={j.code} value={j.country}>{j.country} ({j.defaultRegulator})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Industry Classification *
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#152033] border-[#22314A] text-slate-100'
                  }`}
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Compliance Contact Email
              </label>
              <input
                type="email"
                placeholder="compliance@yourcompany.com"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#152033] border-[#22314A] text-slate-100 placeholder-slate-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mandated Compliance Frameworks (select at least one)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_FRAMEWORKS.map(fw => {
                  const selected = selectedFrameworks.includes(fw.id);
                  return (
                    <button
                      key={fw.id}
                      type="button"
                      onClick={() => toggleFramework(fw.id)}
                      className={`text-left px-3 py-2 rounded-xl text-xs border transition flex items-center justify-between ${
                        selected
                          ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200 font-semibold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate">{fw.label}</span>
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Operational Scope Statement
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Scope covers cloud-hosted core microservices, customer onboarding portal, and payment API gateway operations."
                value={scopeStatement}
                onChange={e => setScopeStatement(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-[#152033] border-[#22314A] text-slate-100 placeholder-slate-500'
                }`}
              />
            </div>

            {/* Note on Zero Mock Compliance */}
            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              theme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/5 border-amber-500/20 text-amber-300/90'
            }`}>
              <div className="font-semibold flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero Fake Data Protocol</span>
              </div>
              <p className="opacity-90">
                New organizations start in a clean <strong>&quot;Compliance assessment not yet initialized&quot;</strong> state (0% baseline).
                Scores are dynamically derived only as your team locks Statement of Applicability (SoA) and verifies controls.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Organization</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
