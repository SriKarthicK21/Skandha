import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  Building2,
  Mail,
  MapPin,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cloud,
  Database,
  Users,
  Shield,
  Layers
} from 'lucide-react';
import { CompanyRegistrationProfile } from '../../types';

interface Props {
  onComplete: () => void;
}

export const Phase1Registration: React.FC<Props> = ({ onComplete }) => {
  const { currentTenant, masterCategories, masterIndustries, savePhase1Registration } = useGRC();

  const isBlankInitial = !currentTenant ||
    currentTenant.name === 'New Organization Registration' ||
    currentTenant.id === 'tenant_new_reg' ||
    currentTenant.id.startsWith('tenant_reg_');

  // Core Legal Details
  const [companyName, setCompanyName] = useState(isBlankInitial ? '' : (currentTenant?.name || ''));
  const [contactEmail, setContactEmail] = useState(isBlankInitial ? '' : (currentTenant?.contactEmail || ''));
  const [registeredCategory, setRegisteredCategory] = useState(
    currentTenant?.registeredCategory || masterCategories[0]?.name || 'Private Limited Company'
  );
  const [street, setStreet] = useState(isBlankInitial ? '' : (currentTenant?.registeredAddress?.street || ''));
  const [city, setCity] = useState(isBlankInitial ? '' : (currentTenant?.registeredAddress?.city || ''));
  const [state, setState] = useState(isBlankInitial ? '' : (currentTenant?.registeredAddress?.state || ''));
  const [postalCode, setPostalCode] = useState(isBlankInitial ? '' : (currentTenant?.registeredAddress?.postalCode || ''));
  const [country, setCountry] = useState(currentTenant?.registeredAddress?.country || 'Singapore');
  const [industryType, setIndustryType] = useState(
    currentTenant?.industryType || masterIndustries[0]?.name || 'Banking, Financial Services & FinTech'
  );
  const [customIndustry, setCustomIndustry] = useState(currentTenant?.customIndustry || '');

  // Extended Profile for Calibrated ISO Profile
  const existingReg = currentTenant?.companyRegistrationProfile;
  const [showExtended, setShowExtended] = useState(true);
  const [headcount, setHeadcount] = useState(existingReg?.organization?.employeeCount || 85);
  const [primaryCloud, setPrimaryCloud] = useState(existingReg?.technology?.cloudProviders?.[0] || 'AWS (Amazon Web Services)');
  const [handlesPersonalData, setHandlesPersonalData] = useState(
    existingReg?.data?.personalData ?? true
  );
  const [handlesFinancialData, setHandlesFinancialData] = useState(
    existingReg?.data?.financialData ?? true
  );
  const [handlesIntellectualProperty, setHandlesIntellectualProperty] = useState(
    existingReg?.data?.intellectualProperty ?? true
  );
  const [handlesHealthData, setHandlesHealthData] = useState(
    existingReg?.data?.sensitiveData ?? false
  );
  const [usesCriticalThirdParties, setUsesCriticalThirdParties] = useState(
    (existingReg?.thirdParties?.vendorsCount ?? 10) > 5
  );
  const [locationsCount, setLocationsCount] = useState(existingReg?.organization?.locations?.length || 2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const autoFillSampleOrganization = () => {
    setCompanyName('Nexus Payments Global Pte. Ltd.');
    setContactEmail('ciso-compliance@nexuspayments.io');
    setRegisteredCategory('Private Limited Company');
    setStreet('12 Marina Boulevard, Level 28, Marina Bay Financial Centre Tower 3');
    setCity('Singapore');
    setState('Central');
    setPostalCode('018982');
    setCountry('Singapore');
    setIndustryType('Banking, Financial Services & FinTech');
    setHeadcount(120);
    setPrimaryCloud('AWS & Multi-Cloud Hybrid');
    setHandlesPersonalData(true);
    setHandlesFinancialData(true);
    setHandlesIntellectualProperty(true);
    setHandlesHealthData(false);
    setUsesCriticalThirdParties(true);
    setLocationsCount(2);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Please provide the registered legal name of the organization.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setErrorMsg('Please enter a valid business contact email address.');
      return;
    }
    if (!street.trim() || !city.trim() || !country.trim()) {
      setErrorMsg('Please complete the mandatory structured registered address.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const extendedProfile: CompanyRegistrationProfile = {
        organization: {
          legalName: companyName,
          registrationNumber: currentTenant?.companyRegistrationProfile?.organization?.registrationNumber || 'UEN-20230918X',
          website: contactEmail ? `https://${contactEmail.split('@')[1]}` : 'https://example.com',
          industry: industryType,
          businessType: 'B2B SaaS',
          organizationSize: headcount <= 50 ? '1-50' : headcount <= 200 ? '51-200' : headcount <= 500 ? '201-500' : '501-1000',
          employeeCount: headcount,
          locations: [country, 'Global'],
          countriesOfOperation: [country],
          businessDescription: `${companyName} is an enterprise operating in ${industryType}.`
        },
        businessServices: {
          primaryServices: ['Core Enterprise Services', 'API Gateway'],
          criticalServices: ['Production API', 'Data Engine'],
          businessProcesses: ['User Onboarding', 'Core Processing', 'Security Incident Management'],
          customerTypes: ['B2B Enterprise', 'Regulated Entities']
        },
        technology: {
          cloudProviders: [primaryCloud],
          dataCenters: ['AWS ap-southeast-1 (Singapore)'],
          saasApplications: ['Google Workspace', 'Slack', 'GitHub Enterprise', 'Jira Cloud'],
          endpoints: ['macOS', 'Windows 11', 'Linux'],
          servers: ['Ubuntu Linux', 'Kubernetes', 'Serverless'],
          networks: ['Zero Trust / Teleport', 'Corporate SD-WAN'],
          databases: ['PostgreSQL', 'Redis'],
          criticalApplications: ['Customer Web Portal', 'Admin Console'],
          securityTools: ['CrowdStrike EDR', 'Cloudflare WAF', 'Okta SSO', 'HashiCorp Vault']
        },
        data: {
          customerData: true,
          employeeData: true,
          financialData: handlesFinancialData,
          personalData: handlesPersonalData,
          sensitiveData: handlesHealthData,
          intellectualProperty: handlesIntellectualProperty,
          sourceCode: true,
          confidentialInformation: true,
          primaryDataResidency: [country]
        },
        thirdParties: {
          vendorsCount: usesCriticalThirdParties ? 18 : 5,
          cloudProviders: [primaryCloud],
          managedServiceProviders: ['Cloud Managed Services'],
          dataProcessors: ['Analytics', 'Authentication'],
          outsourcingPartners: usesCriticalThirdParties ? ['External DevOps'] : []
        },
        existingCompliance: {
          frameworks: currentTenant?.selectedFrameworks || ['ISO_27001'],
          certificationStatus: {}
        },
        existingSecurity: {
          hasPolicies: true,
          hasRiskAssessment: true,
          hasAssetRegister: true,
          hasVulnerabilityManagement: true,
          hasIncidentManagement: true,
          hasBusinessContinuity: true,
          hasDisasterRecovery: true,
          hasInternalAudit: true,
          hasSecurityMonitoring: true
        }
      };

      await savePhase1Registration({
        companyName,
        contactEmail,
        registeredCategory,
        registeredAddress: {
          street,
          city,
          state,
          postalCode,
          country
        },
        industryType,
        customIndustry: industryType === 'Other' ? customIndustry : undefined,
        profile: extendedProfile
      });
      setIsSubmitting(false);
      onComplete();
    } catch (err) {
      setErrorMsg('An error occurred saving company registration.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome to Skanda Hero (Section 1 Requirement) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white border border-blue-900 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
              Welcome to Skanda GRC
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Compliance Made Simple, Guided & Automatic
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              You do <strong>not</strong> need to be an auditor or compliance specialist to achieve certification. Skanda operates like an experienced Big 4 consultant sitting beside you — guiding your team step-by-step from onboarding to accredited audit readiness.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Plain business questions</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <Sparkles className="w-4 h-4 text-blue-300 shrink-0" />
                <span>Auto-generated policies & SoA</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-xs">
                <Shield className="w-4 h-4 text-amber-300 shrink-0" />
                <span>One control → Multiple standards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Intro Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60">
              Phase 1 of 4 • Stage 1 & 2 ISO Implementation
            </span>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mt-2">Company Registration & Scoping Parameters</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Establish the legal tenant boundary, corporate registry records, cloud architecture, and data sensitivities. These parameters auto-calibrate your ISO 27001:2022 implementation roadmap and Annex A control requirements.
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <button
                type="button"
                onClick={autoFillSampleOrganization}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold transition-all cursor-pointer"
                title="Fill with standard FinTech corporate registration data"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Auto-Fill Sample FinTech Entity</span>
              </button>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Legal Registered Company Name <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Nexus Payments Global Pte. Ltd."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Legal name as recorded in official corporate registry.</p>
          </div>

          {/* Contact Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Primary Compliance Contact Email <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="e.g. compliance@nexuspayments.io"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Primary mailbox for audit notifications and report issuance.</p>
          </div>

          {/* Registered Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Registered Legal Category <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <select
              value={registeredCategory}
              onChange={e => setRegisteredCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            >
              {masterCategories.filter(c => c.active).map(cat => (
                <option key={cat.id} value={cat.name} className="dark:bg-slate-800 dark:text-white">
                  {cat.name} — ({cat.description})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Maintained centrally by Super Admin tier.</p>
          </div>

          {/* Industry Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Industry Sector Classification <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
              <select
                value={industryType}
                onChange={e => setIndustryType(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
              >
                {masterIndustries.filter(i => i.active).map(ind => (
                  <option key={ind.id} value={ind.name} className="dark:bg-slate-800 dark:text-white">
                    {ind.name}
                  </option>
                ))}
                <option value="Other" className="dark:bg-slate-800 dark:text-white">Other (Specify Custom Classification)</option>
              </select>
            </div>
          </div>
        </div>

        {industryType === 'Other' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Specify Custom Industry Classification <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={customIndustry}
              onChange={e => setCustomIndustry(e.target.value)}
              placeholder="e.g. Space Exploration & Satellite Telemetry"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
            />
          </div>
        )}

        {/* Structured Address */}
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Official Registered Address
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                Street Address & Suite / Floor <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="e.g. 12 Marina Boulevard, Level 28"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  City <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Singapore"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  State / Region
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="Central"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Postal Code <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="018982"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Country <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="Singapore"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Extended Scoping Section */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div
            onClick={() => setShowExtended(!showExtended)}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                  Technical Architecture & Data Sensitivity (ISO Profile Calibration)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Defines cloud hosting, headcount, and data classes to calibrate your 24-stage plan.
                </p>
              </div>
            </div>
            {showExtended ? <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
          </div>

          {showExtended && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Headcount */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Total In-Scope Headcount (Employees + Contractors)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={headcount}
                    onChange={e => setHeadcount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Triggers Annex A 6.x HR security controls.</p>
                </div>

                {/* Cloud Stack */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Primary Cloud Hosting Infrastructure
                  </label>
                  <input
                    type="text"
                    value={primaryCloud}
                    onChange={e => setPrimaryCloud(e.target.value)}
                    placeholder="e.g. AWS (ECS, RDS, S3) / Azure / GCP"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-white focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Triggers Annex A 8.23 & 8.24 Cloud & Network controls.</p>
                </div>
              </div>

              {/* Data Sensitivity Checkboxes */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Processed Data Sensitivity Classifications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750">
                    <input
                      type="checkbox"
                      checked={handlesPersonalData}
                      onChange={e => setHandlesPersonalData(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-800 dark:text-slate-200">Customer Personal Data (PII / ISO 27701)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750">
                    <input
                      type="checkbox"
                      checked={handlesFinancialData}
                      onChange={e => setHandlesFinancialData(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-800 dark:text-slate-200">Payment & Financial Data (MAS-TRM / PCI)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750">
                    <input
                      type="checkbox"
                      checked={handlesIntellectualProperty}
                      onChange={e => setHandlesIntellectualProperty(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-800 dark:text-slate-200">Proprietary Source Code & Algorithms</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750">
                    <input
                      type="checkbox"
                      checked={usesCriticalThirdParties}
                      onChange={e => setUsesCriticalThirdParties(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-800 dark:text-slate-200">Critical SaaS & Outsourced Vendors</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Automatically initializes the 24-Stage Workflow & Compliance Profile.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-50"
            id="btn-save-phase1"
          >
            <span>{isSubmitting ? 'Calibrating Tenant...' : 'Save & Proceed to Phase 2'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
};
