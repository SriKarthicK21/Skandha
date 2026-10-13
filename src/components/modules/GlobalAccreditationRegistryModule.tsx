import React, { useState, useMemo } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  Globe2,
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  ExternalLink,
  Lock,
  Layers,
  FileCheck,
  Check,
  Filter,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Database,
  Fingerprint,
  FileText
} from 'lucide-react';
import {
  GLOBAL_COOPERATION_REGISTRY,
  NATIONAL_AB_REGISTRY,
  CERTIFICATION_BODIES_REGISTRY,
  ISO_STANDARDS_REGISTRY,
  IAF_SECTOR_CODES
} from '../../data/accreditationMasterData';
import {
  CertificateVerificationRequest,
  CertificateVerificationResult,
  NationalAccreditationBody,
  CertificationBody,
  ISOStandardMaster
} from '../../types/accreditationTypes';
import { verifyCertificate } from '../../utils/certificateVerificationEngine';

export const GlobalAccreditationRegistryModule: React.FC = () => {
  const { currentTenant } = useGRC();
  const [activeTab, setActiveTab] = useState<'verification' | 'accreditation_bodies' | 'certification_bodies' | 'iso_standards' | 'cooperation'>('verification');
  
  // Verification Engine Interactive State
  const [certNumber, setCertNumber] = useState('IS-2024-88492-UK');
  const [orgName, setOrgName] = useState(currentTenant ? currentTenant.name : 'Acme Global Cloud Solutions');
  const [selectedCB, setSelectedCB] = useState('BSI');
  const [selectedAB, setSelectedAB] = useState('UKAS');
  const [selectedStandard, setSelectedStandard] = useState('ISO/IEC 27001:2022');
  const [issueDate, setIssueDate] = useState('2024-04-15');
  const [expiryDate, setExpiryDate] = useState('2027-04-14');
  const [selectedIAF, setSelectedIAF] = useState<number>(33);
  const [country, setCountry] = useState('India');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);

  // Search and filter states
  const [abSearch, setAbSearch] = useState('');
  const [cbSearch, setCbSearch] = useState('');
  const [standardSearch, setStandardSearch] = useState('');
  const [selectedABFilter, setSelectedABFilter] = useState<string>('ALL');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');

  // Selected Detail Modal / Drawer states
  const [selectedABDetail, setSelectedABDetail] = useState<NationalAccreditationBody | null>(null);
  const [selectedCBDetail, setSelectedCBDetail] = useState<CertificationBody | null>(null);

  // Execute Verification
  const handleVerify = async () => {
    setIsVerifying(true);
    const req: CertificateVerificationRequest = {
      certificateNumber: certNumber,
      certifiedOrganization: orgName,
      certificationBodyCode: selectedCB,
      accreditationBodyCode: selectedAB === 'NONE' ? undefined : selectedAB,
      standardNumber: selectedStandard,
      issueDate,
      expiryDate,
      iafCode: selectedIAF ? Number(selectedIAF) : undefined,
      country
    };

    // Small delay to simulate blockchain / AB registry ledger traversal
    setTimeout(async () => {
      const res = await verifyCertificate(req);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 400);
  };

  // Run initial test verification on load
  useMemo(() => {
    if (!verificationResult) {
      handleVerify();
    }
  }, []);

  // Filtered National ABs
  const filteredABs = useMemo(() => {
    return NATIONAL_AB_REGISTRY.filter(ab => {
      const matchesSearch = ab.brandName.toLowerCase().includes(abSearch.toLowerCase()) ||
                            ab.country.toLowerCase().includes(abSearch.toLowerCase()) ||
                            ab.code.toLowerCase().includes(abSearch.toLowerCase());
      const matchesRegion = selectedRegionFilter === 'ALL' || ab.regionalBodyCode === selectedRegionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [abSearch, selectedRegionFilter]);

  // Filtered CBs
  const filteredCBs = useMemo(() => {
    return CERTIFICATION_BODIES_REGISTRY.filter(cb => {
      const matchesSearch = cb.brandName.toLowerCase().includes(cbSearch.toLowerCase()) ||
                            cb.legalName.toLowerCase().includes(cbSearch.toLowerCase()) ||
                            cb.headquartersCountry.toLowerCase().includes(cbSearch.toLowerCase());
      const matchesAB = selectedABFilter === 'ALL' || cb.accreditations.some(a => a.accreditationBodyCode === selectedABFilter);
      return matchesSearch && matchesAB;
    });
  }, [cbSearch, selectedABFilter]);

  // Filtered Standards
  const filteredStandards = useMemo(() => {
    return ISO_STANDARDS_REGISTRY.filter(std => 
      std.standardNumber.toLowerCase().includes(standardSearch.toLowerCase()) ||
      std.title.toLowerCase().includes(standardSearch.toLowerCase()) ||
      std.family.toLowerCase().includes(standardSearch.toLowerCase())
    );
  }, [standardSearch]);

  return (
    <PageContainer id="accreditation-registry-module" className="select-none">
      {/* Module Master Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 items-center justify-center text-indigo-400 shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 flex items-center space-x-1">
                  <Globe2 className="w-3.5 h-3.5 mr-1" />
                  <span>ISO/IEC Master Data • Global Accreditation Registry</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Global ACI / IAF MLA Verified
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Global ISO Accreditation & Certification Authority Registry</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Authoritative registry mapping international recognition arrangements (Global ACI / APAC / EA), National Accreditation Bodies (NABCB, UKAS, ANAB, DAkkS), Conformity Assessment Bodies, ISO standards, and real-time deterministic certificate validation.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleVerify}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Validate Current Scope</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'verification'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Certificate Verification Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('accreditation_bodies')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'accreditation_bodies'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>National Accreditation Bodies ({NATIONAL_AB_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certification_bodies')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'certification_bodies'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Certification Bodies & Scopes ({CERTIFICATION_BODIES_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('iso_standards')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'iso_standards'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>ISO Standards & Certifiability ({ISO_STANDARDS_REGISTRY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cooperation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'cooperation'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Globe2 className="w-4 h-4 text-teal-400" />
          <span>Global & Regional Cooperations ({GLOBAL_COOPERATION_REGISTRY.length})</span>
        </button>
      </div>

      {/* TAB 1: CERTIFICATE VERIFICATION ENGINE */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Certificate Parameters */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">ISO Certificate Verification Query</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Strict Deterministic Logic
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Certified Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certificate Number</label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={e => setCertNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country of Issue</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Certification Body (CB)</label>
                <select
                  value={selectedCB}
                  onChange={e => setSelectedCB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {CERTIFICATION_BODIES_REGISTRY.map(cb => (
                    <option key={cb.id} value={cb.code}>
                      {cb.brandName} — {cb.legalName} ({cb.headquartersCountry})
                    </option>
                  ))}
                  <option value="UNACCREDITED_CORP">Unknown / Unregistered Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Overseeing National Accreditation Body (AB)</label>
                <select
                  value={selectedAB}
                  onChange={e => setSelectedAB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="NONE">Auto-Detect from CB Primary Active Scope</option>
                  {NATIONAL_AB_REGISTRY.map(ab => (
                    <option key={ab.id} value={ab.code}>
                      {ab.code} — {ab.brandName} ({ab.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Normative Standard</label>
                <select
                  value={selectedStandard}
                  onChange={e => setSelectedStandard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {ISO_STANDARDS_REGISTRY.map(std => (
                    <option key={std.id} value={std.standardNumber}>
                      {std.standardNumber} {std.isCertifiable ? '(Certifiable)' : '⚠️ (Guidance Only)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certificate Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certificate Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Industry / IAF Sector Code</label>
                <select
                  value={selectedIAF}
                  onChange={e => setSelectedIAF(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {IAF_SECTOR_CODES.map(iaf => (
                    <option key={iaf.code} value={iaf.code}>
                      IAF Code {iaf.code}: {iaf.name} ({iaf.technicalRiskLevel} Risk)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cross-referencing Global Directories...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Execute Deterministic Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Audit Verification Result & Step Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            {verificationResult && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
                {/* Result Header & Trust Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Accreditation Trust Verdict
                    </span>
                    <div className="flex items-center space-x-2.5 mt-1">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${verificationResult.badgeColor}`}>
                        {verificationResult.trustStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        Trust Score: <span className="text-white font-mono text-sm">{verificationResult.trustScore}%</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Ledger ID: {verificationResult.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate max-w-xs">
                      SHA256: {verificationResult.auditTrailHash.substring(0, 20)}...
                    </span>
                  </div>
                </div>

                {/* Lead Auditor Summary & Recommendation */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <ShieldCheck className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Lead Auditor Assessment</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {verificationResult.auditorSummary}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-sky-300 flex items-start space-x-1.5">
                    <span className="font-bold shrink-0">Actionable Directive:</span>
                    <span>{verificationResult.recommendedAction}</span>
                  </div>
                </div>

                {/* 7-Point Deterministic Verification Checklist */}
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Deterministic Verification Pipeline Checks
                  </h3>
                  <div className="space-y-2.5">
                    {verificationResult.verificationSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs"
                      >
                        <div className="mt-0.5 shrink-0">
                          {step.passed === true ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : step.passed === false ? (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{step.step}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                step.passed === true
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : step.passed === false
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {step.passed === true ? 'VERIFIED' : step.passed === false ? 'FAILED' : 'MANUAL REVIEW'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                          <p className="text-[11px] text-slate-200 mt-1 font-medium bg-slate-900/60 p-2 rounded border border-slate-800/60">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authoritative Sources & Direct Verification Links */}
                {verificationResult.authoritativeSources.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Authoritative Sources & Reference Registries
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {verificationResult.authoritativeSources.map((source, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-1 text-[10px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300"
                        >
                          <Database className="w-3 h-3 text-indigo-400" />
                          <span>{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NATIONAL ACCREDITATION BODIES */}
      {activeTab === 'accreditation_bodies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={abSearch}
                onChange={e => setAbSearch(e.target.value)}
                placeholder="Search Accreditation Body, Country, Code (e.g., NABCB, UKAS, ANAB, DAkkS)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filter Region:</span>
              <select
                value={selectedRegionFilter}
                onChange={e => setSelectedRegionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Regions (Global ACI Signatories)</option>
                <option value="APAC">APAC — Asia Pacific</option>
                <option value="EA">EA — Europe</option>
                <option value="IAAC">IAAC — Americas</option>
                <option value="AFRAC">AFRAC — Africa</option>
                <option value="ARAC">ARAC — Arab Region</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredABs.map(ab => (
              <div
                key={ab.id}
                onClick={() => setSelectedABDetail(ab)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-400 font-mono tracking-wider px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800">
                      {ab.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {ab.recognitionStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 group-hover:text-indigo-300 transition">
                    {ab.brandName}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{ab.legalName}</p>
                  <p className="text-xs text-slate-300 mt-1 flex items-center space-x-1">
                    <span className="font-semibold text-slate-400">Jurisdiction:</span>
                    <span className="text-white font-medium">{ab.country}</span>
                    <span className="text-slate-500 font-mono">({ab.regionalBodyCode})</span>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Accreditation Schemes:</span>
                    <span className="text-slate-200 font-bold font-mono">{ab.accreditedSchemes.slice(0, 4).join(', ')}...</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Peer Review Cycle:</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Next: {ab.nextPeerReviewDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <a
                      href={ab.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-indigo-400 hover:underline flex items-center space-x-1 text-[10px] font-semibold"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <span className="text-xs text-slate-400 group-hover:text-indigo-400 font-bold transition flex items-center">
                      Inspect Scope <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATION BODIES & ACCREDITED SCOPES */}
      {activeTab === 'certification_bodies' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={cbSearch}
                onChange={e => setCbSearch(e.target.value)}
                placeholder="Search Certification Body (BSI, TÜV SÜD, DNV, SGS, STQC, IRCLASS)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Filter by AB:</span>
              <select
                value={selectedABFilter}
                onChange={e => setSelectedABFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Accreditation Bodies</option>
                {NATIONAL_AB_REGISTRY.map(ab => (
                  <option key={ab.id} value={ab.code}>{ab.code} ({ab.country})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCBs.map(cb => (
              <div
                key={cb.id}
                onClick={() => setSelectedCBDetail(cb)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 font-mono tracking-wider px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                      {cb.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {cb.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 group-hover:text-amber-300 transition">
                    {cb.brandName}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{cb.legalName}</p>
                  <p className="text-xs text-slate-300 mt-1">
                    <span className="text-slate-400 font-semibold">Headquarters:</span> {cb.headquartersCity}, {cb.headquartersCountry}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Accrediting ABs:</span>
                    <span className="text-slate-200 font-bold font-mono">
                      {cb.accreditations.map(a => a.accreditationBodyCode).join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Active Scopes:</span>
                    <span className="text-sky-300 font-bold">{cb.accreditations.length} Authorized AB Schedules</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    {cb.verificationPortalUrl ? (
                      <a
                        href={cb.verificationPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-amber-400 hover:underline flex items-center space-x-1 text-[10px] font-semibold"
                      >
                        <span>CB Public Directory</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-500">Directory via AB</span>
                    )}

                    <span className="text-xs text-slate-400 group-hover:text-amber-400 font-bold transition flex items-center">
                      View CB Scope <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ISO STANDARDS & CERTIFIABILITY */}
      {activeTab === 'iso_standards' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={standardSearch}
                onChange={e => setStandardSearch(e.target.value)}
                placeholder="Search ISO Standard (e.g. 27001, 27701, 42001, 9001, 22301)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{filteredStandards.length}</span> Standards
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStandards.map(std => (
              <div
                key={std.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white font-mono">{std.standardNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      std.isCertifiable
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {std.isCertifiable ? 'Certifiable Management System' : 'Guidance / Code of Practice'}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-slate-200">{std.title}</h3>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Family / Domain:</span>
                    <span className="text-slate-200 font-medium">{std.family}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Accreditation Standard:</span>
                    <span className="text-indigo-400 font-mono text-[11px]">{std.applicableAccreditationStandard}</span>
                  </div>
                  {std.schemeSpecificRequirementStandard && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Scheme Sector Spec:</span>
                      <span className="text-sky-300 font-mono text-[11px]">{std.schemeSpecificRequirementStandard}</span>
                    </div>
                  )}
                  {std.controlsCount && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Normative Controls Count:</span>
                      <span className="text-emerald-400 font-bold">{std.controlsCount} Controls</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GLOBAL & REGIONAL COOPERATION ORGANIZATIONS */}
      {activeTab === 'cooperation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h2 className="text-sm font-bold text-white">Global Accreditation Hierarchy & Recognition Framework</h2>
            <p className="text-xs text-slate-400 mt-1">
              International and regional accreditation cooperation agreements ensuring cross-border mutual recognition of conformity assessment certificates under ISO/IEC 17011 and ISO/IEC 17021-1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GLOBAL_COOPERATION_REGISTRY.map(coop => (
              <div
                key={coop.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-400 font-mono tracking-wider px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
                      {coop.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {coop.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">{coop.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    <span className="text-slate-400 font-semibold">Region:</span> {coop.region}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">{coop.notes}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Recognition Treaty:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[160px]">{coop.recognitionArrangementName}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Signatories Count:</span>
                    <span className="text-emerald-400 font-bold">{coop.signatoriesCount} National ABs</span>
                  </div>

                  <div className="pt-1">
                    <a
                      href={coop.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:underline flex items-center space-x-1 text-[11px] font-semibold"
                    >
                      <span>Official MLA Signatories Register</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AB Detail Drawer / Modal */}
      {selectedABDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {selectedABDetail.code} • National Accreditation Body
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedABDetail.brandName}</h2>
                <p className="text-xs text-slate-400">{selectedABDetail.legalName}</p>
              </div>
              <button
                onClick={() => setSelectedABDetail(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold block">Country / Territory</span>
                <span className="text-white font-bold text-sm mt-0.5 block">{selectedABDetail.country}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold block">Global Treaty Signatory Since</span>
                <span className="text-emerald-400 font-mono font-bold text-sm mt-0.5 block">{selectedABDetail.signatorySince}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Accredited Schemes</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedABDetail.accreditedSchemes.map((sch, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[11px] font-bold">
                    {sch}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block uppercase text-[10px] tracking-wider">
                Authoritative Source & Peer Review Evidence
              </span>
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Evaluator:</span> {selectedABDetail.peerEvaluatedBy}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Source Document:</span> {selectedABDetail.sourceReference.documentTitle}
              </p>
              <a
                href={selectedABDetail.officialDirectoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center space-x-1 font-semibold pt-1"
              >
                <span>Access National Accreditation Directory Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              onClick={() => setSelectedABDetail(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* CB Detail Drawer / Modal */}
      {selectedCBDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                  {selectedCBDetail.code} • Accredited Certification Body
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedCBDetail.brandName}</h2>
                <p className="text-xs text-slate-400">{selectedCBDetail.legalName}</p>
              </div>
              <button
                onClick={() => setSelectedCBDetail(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Authorized Accreditation Body Schedules ({selectedCBDetail.accreditations.length})
              </h3>

              <div className="space-y-3">
                {selectedCBDetail.accreditations.map(acc => (
                  <div key={acc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">
                        Accreditation Body: {acc.accreditationBodyCode}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        Accr. No: {acc.accreditationNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Cycle Start:</span>
                        <span className="font-mono">{acc.currentCycleStartDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Valid Until:</span>
                        <span className="font-mono text-emerald-300">{acc.validUntil}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Accredited Standards</span>
                      <div className="flex flex-wrap gap-1">
                        {acc.standardsAccredited.map((std, sidx) => (
                          <span key={sidx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                            {std}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[10px]">
                      <span className="text-slate-500 font-mono truncate max-w-xs">
                        Scope SHA-256: {acc.scopeHashSHA256.substring(0, 24)}...
                      </span>
                      <a
                        href={acc.officialScopeDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <span>Official Scope PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCBDetail(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
