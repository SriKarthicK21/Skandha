import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  FileText,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Server,
  KeyRound,
  Laptop,
  GitBranch,
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Layers,
  BookOpen,
  ArrowRight,
  ListChecks,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  Iso27001PolicyEngine,
  type StandardTemplateMetadata,
  type StandardStructuralGuideline
} from '../../services/iso27001PolicyEngine';
import { GeneratedDocument } from '../../types';
import { StandardPdfDocumentView } from '../documents/StandardPdfDocumentView';

interface StandardsPolicySynthesisWorkbenchProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const StandardsPolicySynthesisWorkbench: React.FC<StandardsPolicySynthesisWorkbenchProps> = ({
  onClose,
  isEmbedded = false
}) => {
  const { currentTenant, synthesizeStandardsPolicySuite } = useGRC();

  // Active view: 'catalog' | 'guidelines' | 'generator'
  const [activeTab, setActiveTab] = useState<'catalog' | 'guidelines' | 'generator'>('catalog');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [filterMandatoryOnly, setFilterMandatoryOnly] = useState(false);

  // Selection states for generator
  const catalog = useMemo(() => Iso27001PolicyEngine.getCatalog(), []);
  const guidelines = useMemo(() => Iso27001PolicyEngine.getStructuralGuidelines(), []);

  const [selectedCodes, setSelectedCodes] = useState<string[]>(() =>
    catalog.map(t => t.code)
  );

  // Customization parameters
  const [cloudProvider, setCloudProvider] = useState<string>('AWS');
  const [identityProvider, setIdentityProvider] = useState<string>('Okta');
  const [mdmProvider, setMdmProvider] = useState<string>('Jamf Pro');
  const [vulnerabilityTool, setVulnerabilityTool] = useState<string>('Snyk & Trivy');
  const [scmProvider, setScmProvider] = useState<string>('GitHub Enterprise');
  const [cisoName, setCisoName] = useState<string>('Chief Information Security Officer (CISO)');
  const [effectiveDate, setEffectiveDate] = useState<string>('15 January 2026');

  // Synthesis progress states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisSuccess, setSynthesisSuccess] = useState(false);
  const [generatedSuite, setGeneratedSuite] = useState<GeneratedDocument[] | null>(null);

  // Preview document state
  const [previewDoc, setPreviewDoc] = useState<GeneratedDocument | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.isoClauseOrAnnexA.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || t.level.includes(selectedLevel);
      const matchesMandatory = !filterMandatoryOnly || t.isMandatory;
      return matchesSearch && matchesLevel && matchesMandatory;
    });
  }, [catalog, searchQuery, selectedLevel, filterMandatoryOnly]);

  const toggleSelectAll = () => {
    if (selectedCodes.length === catalog.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(catalog.map(t => t.code));
    }
  };

  const toggleSelectCode = (code: string) => {
    setSelectedCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleGenerate = () => {
    if (!currentTenant) return;
    setIsSynthesizing(true);

    setTimeout(() => {
      const suite = synthesizeStandardsPolicySuite({
        companyName: currentTenant.name,
        industry: currentTenant.industryType,
        framework: currentTenant.selectedFrameworks[0] || 'ISO/IEC 27001:2022',
        cloudProvider,
        identityProvider,
        mdmProvider,
        vulnerabilityTool,
        scmProvider,
        cisoName,
        effectiveDate,
        selectedTemplateCodes: selectedCodes
      });

      setGeneratedSuite(suite);
      setIsSynthesizing(false);
      setSynthesisSuccess(true);
      
      if (suite.length > 0) {
        setPreviewDoc(suite[0]);
      }
    }, 1000);
  };

  const handlePreviewTemplate = (meta: StandardTemplateMetadata) => {
    const singleDoc = Iso27001PolicyEngine.generateSuite({
      companyName: organizationService.getOrganizationName(currentTenant),
      industry: currentTenant?.industryType,
      cloudProvider,
      identityProvider,
      mdmProvider,
      vulnerabilityTool,
      scmProvider,
      cisoName,
      effectiveDate,
      selectedTemplateCodes: [meta.code]
    })[0];

    if (singleDoc) {
      setPreviewDoc(singleDoc);
    }
  };

  const handleCopyDocContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadDoc = (doc: GeneratedDocument) => {
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.docCode}_${doc.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-5 font-sans ${isEmbedded ? '' : 'p-4 lg:p-6 max-w-7xl mx-auto'}`}>
      {/* Top Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-slate-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Standards and Training ISO 27001:2022 Synthesis Engine
            </span>
            <span className="text-xs text-slate-400">
              Target Tenant: <strong className="text-slate-200">{currentTenant?.name}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            Audit-Ready Compliance Documentation Engine
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Automatic generation of ISO/IEC 27001:2022 Stage 1 & Stage 2 certifiable documentation adhering to the Standards and Training 4-Tier Documentation Pyramid, 12-section audit-ready anatomy, and anti-shelfware technical parameter binding.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Templates Catalog ({catalog.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>12 Structural Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesis Workbench</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEMPLATES CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search templates by clause, title, code..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {['All', 'Level 1', 'Level 2', 'Level 3'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      selectedLevel === lvl ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFilterMandatoryOnly(!filterMandatoryOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterMandatoryOnly
                    ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filterMandatoryOnly ? 'Mandatory Only (Active)' : 'Show Mandatory Only'}
              </button>

              <button
                onClick={() => setActiveTab('generator')}
                className="ml-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Configure & Synthesize All</span>
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map(template => {
              const isSelected = selectedCodes.includes(template.code);
              return (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    template.isMandatory
                      ? 'bg-gradient-to-b from-rose-50/20 via-white to-white border-rose-200 hover:border-rose-400'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  } shadow-xs hover:shadow-md`}
                >
                  <div className="space-y-2.5">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {template.code}
                        </span>
                        <span className="ml-2 text-[10px] font-semibold text-slate-500 uppercase">
                          {template.level.split(':')[0]}
                        </span>
                      </div>
                      {template.isMandatory ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                          STRICTLY MANDATORY
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          ANNEX A TOPIC
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {template.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {template.summary}
                    </p>

                    {/* Standard Clause */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                      <div className="text-indigo-800 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{template.isoClauseOrAnnexA}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] line-clamp-1">
                        <strong>Auditor Focus:</strong> {template.auditorSamplingFocus}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Full Policy</span>
                    </button>

                    <button
                      onClick={() => toggleSelectCode(template.code)}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 flex items-center gap-1'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Included in Suite</span>
                        </>
                      ) : (
                        <span>+ Include</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 12 STRUCTURAL GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-indigo-900">
                Standards and Training 12-Section Structural Blueprint for ISO 27001 Certification
              </p>
              <p className="text-indigo-800 leading-relaxed">
                Certification auditors from registrars (BSI, TÜV, UKAS, ANAB) strictly reject &quot;shelfware&quot; policies lacking governance metadata, quantifiable SLAs, or tangible evidence trails. Skanda&apos;s policy synthesis engine applies this exact 12-step architectural formula to every generated document.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidelines.map(rule => (
              <div
                key={rule.step}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                    {rule.step}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {rule.isoRequirement.split('(')[0]}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">
                  {rule.sectionTitle}
                </h4>

                <div className="text-xs text-slate-600 space-y-1.5">
                  <p>
                    <strong className="text-slate-800">Standard Formula:</strong> {rule.standardBestPractice}
                  </p>
                  <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                    <strong>Auditor Verification Target:</strong> {rule.auditorVerificationGoal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYNTHESIS WORKBENCH */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Parameter Customization (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Tenant Architecture & Tooling Binding
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inject real technology endpoints to guarantee documents withstand Stage 1 & Stage 2 external audits.
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Anti-Shelfware Guaranteed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Cloud Provider */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-sky-600" />
                    <span>Cloud Hosting Infrastructure</span>
                  </label>
                  <select
                    value={cloudProvider}
                    onChange={e => setCloudProvider(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AWS">AWS (KMS AES-256, VPC Isolation, GuardDuty)</option>
                    <option value="GCP">Google Cloud Platform (Cloud KMS, Armor)</option>
                    <option value="Azure">Microsoft Azure (Key Vault, Sentinel)</option>
                    <option value="Multi-Cloud">Multi-Cloud Enterprise (AWS + GCP)</option>
                  </select>
                </div>

                {/* Identity Provider */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identity Federation & SSO</span>
                  </label>
                  <select
                    value={identityProvider}
                    onChange={e => setIdentityProvider(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Okta">Okta Identity Cloud (FIDO2 Hardware MFA, SCIM)</option>
                    <option value="Microsoft Azure AD (Entra ID)">Microsoft Entra ID / Azure AD (PIM, Conditional)</option>
                    <option value="Google Workspace">Google Workspace Enterprise (Security Keys)</option>
                    <option value="JumpCloud">JumpCloud Directory Platform</option>
                  </select>
                </div>

                {/* MDM Provider */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-purple-600" />
                    <span>Fleet MDM & Endpoint Encryption</span>
                  </label>
                  <select
                    value={mdmProvider}
                    onChange={e => setMdmProvider(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Jamf Pro">Jamf Pro (macOS FileVault 256 & Remote Wipe)</option>
                    <option value="Microsoft Intune">Microsoft Intune (BitLocker, Compliance Gates)</option>
                    <option value="Kandji">Kandji Apple Enterprise MDM</option>
                    <option value="Automox">Automox Endpoint Management</option>
                  </select>
                </div>

                {/* Vulnerability Scanning */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                    <span>Vulnerability & CI/CD Scanner</span>
                  </label>
                  <select
                    value={vulnerabilityTool}
                    onChange={e => setVulnerabilityTool(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Snyk & Trivy">Snyk (SAST/SCA) & Trivy Container Scanner</option>
                    <option value="Wiz & AWS Inspector">Wiz Cloud Security & AWS Inspector</option>
                    <option value="CrowdStrike Falcon">CrowdStrike Falcon Spotlight & Horizon</option>
                    <option value="Qualys">Qualys Cloud Platform</option>
                  </select>
                </div>

                {/* Code Repository */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-amber-600" />
                    <span>Source Code Management (SCM)</span>
                  </label>
                  <select
                    value={scmProvider}
                    onChange={e => setScmProvider(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GitHub Enterprise">GitHub Enterprise (Branch Protection, CODEOWNERS)</option>
                    <option value="GitLab SaaS">GitLab SaaS (Merge Request Gates, Secret Push)</option>
                    <option value="Bitbucket Data Center">Bitbucket Data Center</option>
                  </select>
                </div>

                {/* CISO Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    CISO / Executive Document Approver
                  </label>
                  <input
                    type="text"
                    value={cisoName}
                    onChange={e => setCisoName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                    placeholder="Chief Information Security Officer (CISO)"
                  />
                </div>
              </div>

              {/* Scope Selection Box */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Selected Documents to Synthesize ({selectedCodes.length}/{catalog.length})
                  </span>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {selectedCodes.length === catalog.length ? 'Deselect All' : 'Select All Templates'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {catalog.map(tmpl => {
                    const isChecked = selectedCodes.includes(tmpl.code);
                    return (
                      <label
                        key={tmpl.code}
                        className={`flex items-center space-x-2 p-1.5 rounded text-[11px] cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCode(tmpl.code)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{tmpl.code} - {tmpl.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Synthesize Button */}
              <div className="pt-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Will synthesize into tenant: <strong>{currentTenant?.name}</strong>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isSynthesizing || selectedCodes.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-2 disabled:opacity-50 transition-all"
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Documentation Pack...</span>
                    </>
                  ) : synthesisSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Applied to Tenant Suite!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate & Apply Audit-Ready Suite</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Inspection & Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Document Quick Preview</span>
                </h3>
                {previewDoc && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyDocContent(previewDoc.content)}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs flex items-center gap-1"
                      title="Copy Markdown"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(previewDoc)}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs"
                      title="Download Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {previewDoc ? (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-900">
                      <span>{previewDoc.docCode}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                        {previewDoc.standard}
                      </span>
                    </div>
                    <p className="text-slate-700 font-semibold">{previewDoc.title}</p>
                    <p className="text-slate-500 text-[11px]">Owner: {previewDoc.owner} | Effective: {previewDoc.effectiveDate}</p>
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {previewDoc.content}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Select any template from the catalog or click Synthesize to inspect generated documentation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Document Viewer Modal */}
      {previewDoc && activeTab !== 'generator' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {previewDoc.docCode}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{previewDoc.title}</h3>
                  <p className="text-[11px] text-slate-500">ISO/IEC 27001:2022 Standards & Training Compliant Specification</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyDocContent(previewDoc.content)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body View */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <StandardPdfDocumentView
                document={previewDoc}
                companyName={organizationService.getOrganizationName(currentTenant)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
