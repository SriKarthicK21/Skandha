import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  Globe2,
  Server,
  Network,
  Users2,
  Check,
  Printer,
  FileDown,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TenantCompany, ControlItem } from '../../types';
import {
  generateLeadAuditorScopeDossier,
  generateLeadAuditorSoAMatrix,
  generateLeadAuditorISMSManual,
  AUDITOR_GRADE_SOPS,
  LeadAuditorSoARow,
  LeadAuditorSOPDefinition
} from '../../data/leadAuditorStandardEngine';

interface LeadAuditorDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantCompany | null;
  controls: ControlItem[];
  initialTab?: 'scope' | 'soa' | 'manual' | 'sops';
}

export const LeadAuditorDossierModal: React.FC<LeadAuditorDossierModalProps> = ({
  isOpen,
  onClose,
  tenant,
  controls,
  initialTab = 'scope'
}) => {
  const [activeTab, setActiveTab] = useState<'scope' | 'soa' | 'manual' | 'sops'>(initialTab);
  const [selectedSop, setSelectedSop] = useState<LeadAuditorSOPDefinition>(AUDITOR_GRADE_SOPS[0]);
  const [soaThemeFilter, setSoaThemeFilter] = useState<string>('All');
  const [searchSoa, setSearchSoa] = useState<string>('');

  if (!isOpen) return null;

  const scopeDossier = generateLeadAuditorScopeDossier(tenant);
  const soaRows = generateLeadAuditorSoAMatrix(controls, tenant);
  const ismsManual = generateLeadAuditorISMSManual(tenant);

  // Filtered SoA Rows
  const filteredSoaRows = soaRows.filter(row => {
    const matchesTheme = soaThemeFilter === 'All' || row.theme === soaThemeFilter;
    const matchesSearch =
      row.controlCode.toLowerCase().includes(searchSoa.toLowerCase()) ||
      row.title.toLowerCase().includes(searchSoa.toLowerCase()) ||
      row.justification.toLowerCase().includes(searchSoa.toLowerCase()) ||
      row.governingPolicyOrSOP.toLowerCase().includes(searchSoa.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const applicableCount = soaRows.filter(r => r.applicable).length;
  const excludedCount = soaRows.filter(r => !r.applicable).length;
  const implementedCount = soaRows.filter(r => r.implementationStatus === 'Implemented').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl my-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  TÜV / BSI / PECB Lead Auditor Gold-Standard ISMS Dossier
                </h2>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                  UKAS & EGAC Aligned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative compliance architecture conforming to ISO/IEC 27001:2022 & IAF MD Stage 1 / Stage 2 criteria
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition"
              title="Print / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print / Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('scope')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-2 transition border ${
                activeTab === 'scope'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span>1. ISMS Scope Dossier (Clause 4.3)</span>
            </button>

            <button
              onClick={() => setActiveTab('soa')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-2 transition border ${
                activeTab === 'soa'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. 6-Column SoA Lead Register (Clause 6.1.3 d)</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[10px] font-mono border border-slate-700">
                93
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sops')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-2 transition border ${
                activeTab === 'sops'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. Standard Operating Procedures (SOPs)</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800">
                4 Runbooks
              </span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center space-x-2 transition border ${
                activeTab === 'manual'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>4. Executive ISMS Manual (PDCA)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden md:block">
            Accreditation Body: UKAS / EGAC (IAF MLA Signatory)
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: ISMS SCOPE DOCUMENT (CLAUSE 4.3 & PESTLE / 4.2 MATRIX) */}
          {activeTab === 'scope' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      Formal Document Code: DOC-SCP-001 (Rev 3.2)
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Information Security Management System Scope & Boundaries Document
                    </h3>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <div>Issued to: <strong className="text-slate-200">{scopeDossier.companyName}</strong></div>
                    <div className="text-[10px] text-slate-500">Corporate Reg: {scopeDossier.registrationNumber}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 relative">
                  <div className="text-[11px] uppercase font-bold text-slate-400 mb-1 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auditor-Certified Scope Statement (Appearing on Certificate):</span>
                  </div>
                  <p className="text-xs text-slate-200 font-mono leading-relaxed pl-2 border-l-2 border-sky-500">
                    "{scopeDossier.scopeStatement}"
                  </p>
                </div>
              </div>

              {/* Sub-section 1: Clause 4.1 Internal & External Issues (PESTLE Framework) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Globe2 className="w-4 h-4 text-indigo-400" />
                    <span>1. Clause 4.1 Context Analysis: Structured PESTLE Register</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Mandatory External & Internal Factor Mapping</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">PESTLE Pillar</th>
                        <th className="p-3">Context Issue & Threat Horizon</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3">Direct ISMS Risk Impact</th>
                        <th className="p-3">Governing ISMS Safeguard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {scopeDossier.pestleAnalysis.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900">
                          <td className="p-3 font-bold text-indigo-300 flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{item.category}</span>
                          </td>
                          <td className="p-3 text-slate-200">{item.contextIssue}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.internalOrExternal === 'External'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : 'bg-purple-950 text-purple-300 border border-purple-800'
                            }`}>
                              {item.internalOrExternal}
                            </span>
                          </td>
                          <td className="p-3 text-amber-300/90 text-[11px]">{item.riskImpact}</td>
                          <td className="p-3 text-emerald-400 font-mono text-[11px]">{item.governingISMSControl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sub-section 2: Clause 4.2 Interested Parties & Statutory Obligations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Users2 className="w-4 h-4 text-emerald-400" />
                    <span>2. Clause 4.2 Interested Parties & Statutory Obligations Register</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Statutory, Regulatory & Contractual Compliance</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Stakeholder Group</th>
                        <th className="p-3">Party & Authority</th>
                        <th className="p-3">Mandate Ref</th>
                        <th className="p-3">Mandatory Requirement</th>
                        <th className="p-3">ISMS Fulfillment</th>
                        <th className="p-3">Regulatory Consequence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                      {scopeDossier.stakeholderObligations.map((ob, idx) => (
                        <tr key={idx} className="hover:bg-slate-900">
                          <td className="p-3 font-semibold text-white">{ob.stakeholderGroup}</td>
                          <td className="p-3 text-slate-300">{ob.interestedParty}</td>
                          <td className="p-3 font-mono text-[11px] text-sky-400">{ob.mandateReference}</td>
                          <td className="p-3 text-slate-200 text-[11px]">{ob.mandatoryRequirement}</td>
                          <td className="p-3 text-emerald-400 text-[11px] font-mono">{ob.ismsFulfillmentControl}</td>
                          <td className="p-3 text-rose-300 text-[11px]">{ob.penaltiesOrConsequence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sub-section 3: Clause 4.3 Technical & Physical Perimeter Demarcation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Server className="w-4 h-4 text-purple-400" />
                    <span>3. Clause 4.3 Technical, Cloud & Physical Perimeters</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Strict Non-Ambiguous Scoping Boundaries</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cloud VPCs */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <Network className="w-4 h-4 text-sky-400" />
                      <span>In-Scope Cloud Workloads & VPC Network CIDRs:</span>
                    </div>
                    <div className="space-y-2">
                      {scopeDossier.technicalPerimeter.cloudEnvironments.map((env, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                          <div className="font-bold text-sky-300 flex items-center justify-between">
                            <span>{env.provider}</span>
                            <span className="text-[10px] text-slate-400">{env.accountIdOrSubscription}</span>
                          </div>
                          <div className="text-slate-300 text-[11px]">
                            Regions: <span className="text-slate-200 font-mono">{env.primaryRegions.join(', ')}</span>
                          </div>
                          <div className="text-slate-300 text-[11px]">
                            VPC CIDRs: <span className="text-emerald-400 font-mono">{env.vpcNetworkCIDRs.join(', ')}</span>
                          </div>
                          <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                            Data Tier: {env.dataClassificationStored}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Physical Facilities */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <Building className="w-4 h-4 text-indigo-400" />
                      <span>Physical Facilities & Telework Architecture:</span>
                    </div>
                    <div className="space-y-2">
                      {scopeDossier.technicalPerimeter.physicalFacilities.map((fac, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{fac.locationType}</span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              fac.physicalScopeStatus === 'IN_SCOPE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {fac.physicalScopeStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{fac.addressOrModel}</p>
                          <p className="text-[10px] text-slate-400">Controls: {fac.perimeterControls}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-section 4: Permissible Exclusions Rationale */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Clause 4.3 & 6.1.3 d) Permissible Annex A Exclusions Dossier
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-300/80">
                    Auditor-Defensible Statutory Rationales
                  </span>
                </div>

                <div className="space-y-2">
                  {scopeDossier.permissibleExclusions.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-amber-900/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-300">{ex.annexAControl}: {ex.controlTitle}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{ex.theme}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        <strong className="text-amber-200">Justification: </strong>{ex.technicalJustification}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <div>Compensating Control: <span className="text-emerald-400 font-mono">{ex.compensatingControl}</span></div>
                        <div className="text-sky-300 font-medium">Auditor Acceptance: {ex.auditorAcceptanceRationale}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6-COLUMN STATEMENT OF APPLICABILITY (SOA) TABLE */}
          {activeTab === 'soa' && (
            <div className="space-y-4 animate-fadeIn">
              {/* SoA Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Annex A Controls</div>
                  <div className="text-xl font-mono font-bold text-white">{soaRows.length}</div>
                  <div className="text-[10px] text-slate-500">ISO/IEC 27001:2022</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">In-Scope (Applicable)</div>
                  <div className="text-xl font-mono font-bold text-emerald-400">{applicableCount}</div>
                  <div className="text-[10px] text-slate-500">Active safeguards</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Justified Excluded</div>
                  <div className="text-xl font-mono font-bold text-amber-400">{excludedCount}</div>
                  <div className="text-[10px] text-slate-500">Defensible rationales</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Implementation Readiness</div>
                  <div className="text-xl font-mono font-bold text-sky-400">
                    {Math.round((implementedCount / applicableCount) * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-500">{implementedCount} fully verified</div>
                </div>
              </div>

              {/* Theme Selector & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-1">
                  {['All', 'Organizational', 'People', 'Physical', 'Technological'].map(th => (
                    <button
                      key={th}
                      onClick={() => setSoaThemeFilter(th)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        soaThemeFilter === th
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search 93 controls, policies, artifacts..."
                    value={searchSoa}
                    onChange={e => setSearchSoa(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 6-Column Lead Auditor SoA Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">1. Control Code & Title</th>
                      <th className="p-3 text-center">2. Status</th>
                      <th className="p-3 w-1/3">3. Two-Tier Justification & Risk ID</th>
                      <th className="p-3 text-center">4. Maturity</th>
                      <th className="p-3">5. Governing Policy / SOP</th>
                      <th className="p-3">6. Auditable Evidence Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {filteredSoaRows.map(row => (
                      <tr key={row.controlCode} className="hover:bg-slate-900">
                        {/* 1. Control Code & Title */}
                        <td className="p-3 space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                              {row.controlCode}
                            </span>
                            {row.isNewIn2022 && (
                              <span className="text-[9px] font-bold text-purple-300 bg-purple-950 border border-purple-800 px-1 rounded">
                                NEW 2022
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-white text-xs">{row.title}</div>
                          <div className="text-[10px] text-slate-400">{row.theme} Controls</div>
                        </td>

                        {/* 2. Applicability Status */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              row.applicable
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {row.applicable ? 'Applicable' : 'Excluded'}
                          </span>
                        </td>

                        {/* 3. Two-Tier Justification */}
                        <td className="p-3 space-y-1">
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {row.justification}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="text-slate-500">Risks:</span>
                            {row.linkedRiskIds.map(rId => (
                              <span key={rId} className="font-mono text-sky-400 bg-sky-950/80 px-1 rounded border border-sky-800/60">
                                {rId}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* 4. Implementation Status */}
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              row.implementationStatus === 'Implemented'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : row.implementationStatus === 'Partially Implemented'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {row.implementationStatus}
                          </span>
                        </td>

                        {/* 5. Governing Policy / SOP */}
                        <td className="p-3">
                          <span className="font-mono text-[11px] text-indigo-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                            {row.governingPolicyOrSOP}
                          </span>
                        </td>

                        {/* 6. Auditable Evidence Record */}
                        <td className="p-3 space-y-1">
                          <div className="font-mono text-[11px] text-emerald-400 flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[160px]" title={row.auditableEvidenceArtifact}>
                              {row.auditableEvidenceArtifact}
                            </span>
                          </div>
                          <span className="text-[9px] uppercase font-semibold text-slate-400 bg-slate-950 px-1 py-0.2 rounded border border-slate-800">
                            {row.verificationMethod}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STANDARD OPERATING PROCEDURES (SOPS) WITH REAL ACTIONS */}
          {activeTab === 'sops' && (
            <div className="space-y-4 animate-fadeIn">
              {/* SOP Selector Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {AUDITOR_GRADE_SOPS.map(sop => (
                  <button
                    key={sop.sopCode}
                    onClick={() => setSelectedSop(sop)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedSop.sopCode === sop.sopCode
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-mono text-[10px] font-bold text-indigo-400">{sop.sopCode}</div>
                    <div className="font-bold text-xs line-clamp-1 text-white">{sop.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{sop.clauseOrAnnexA.split('&')[0]}</div>
                  </button>
                ))}
              </div>

              {/* Selected SOP Detailed View */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                {/* SOP Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                        {selectedSop.sopCode}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Governing: {selectedSop.clauseOrAnnexA}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{selectedSop.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Process Owner</div>
                      <div className="font-semibold text-white">{selectedSop.processOwner}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Target SLA Duration</div>
                      <div className="font-mono font-bold text-emerald-400">{selectedSop.maxSlaDuration}</div>
                    </div>
                  </div>
                </div>

                {/* Tooling Stack & Triggers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-300 uppercase text-[10px]">Operational Tooling Stack:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedSop.toolingStack.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 text-[11px] font-mono border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 uppercase text-[10px]">Operational Initiation Trigger:</span>
                    <p className="text-slate-300 text-[11px]">{selectedSop.triggerCondition}</p>
                  </div>
                </div>

                {/* Step-by-Step Execution Sequence */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Step-by-Step Operational Runbook & Audit Artifact Sequence
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Mandatory Four-Eyes Gates & Generated Artifacts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedSop.steps.map(step => (
                      <div
                        key={step.stepNumber}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                              {step.stepNumber}
                            </span>
                            <span className="font-bold text-white text-xs">{step.actionName}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              Role: {step.performerRole}
                            </span>
                          </div>

                          {step.dualControlApprovalRequired && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>Dual Control (Four-Eyes Approval Required)</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {step.detailedAction}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Command / Portal Workflow:</span>
                            <div className="font-mono text-sky-300 bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] truncate">
                              {step.toolingCommandsOrPortal}
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] text-emerald-400 uppercase font-semibold">Required Auditor Proof Record:</span>
                            <div className="font-mono text-emerald-300 bg-slate-950 p-1.5 rounded border border-emerald-950/80 text-[10px] flex items-center space-x-1">
                              <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{step.requiredOutputArtifact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Sampling Notice */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div>
                    <strong className="text-slate-300">Auditor Testing Protocol: </strong>
                    {selectedSop.auditSamplingProcedure}
                  </div>
                  <div className="text-[10px] font-mono text-indigo-300 shrink-0 ml-3">
                    Retention: {selectedSop.recordRetentionYears} Years
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ISMS EXECUTIVE MANUAL (CLAUSES 4-10 PDCA) */}
          {activeTab === 'manual' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      Executive Governance Code: {ismsManual.documentCode}
                    </div>
                    <h3 className="text-base font-bold text-white">{ismsManual.title}</h3>
                    <p className="text-xs text-slate-400">{ismsManual.leadAccreditation}</p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {ismsManual.version}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">Approved by: {ismsManual.approvedBy}</div>
                  </div>
                </div>

                {/* PDCA Visual Flow Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-1">
                    <span className="font-bold text-indigo-400 uppercase text-[10px]">PLAN (Clauses 4, 5, 6)</span>
                    <p className="text-[11px] text-slate-300">Context, Objectives, 5x5 Risk Assessment & SoA</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40 space-y-1">
                    <span className="font-bold text-sky-400 uppercase text-[10px]">DO (Clauses 7, 8)</span>
                    <p className="text-[11px] text-slate-300">Operational Runbooks, Awareness, 93 Safeguards</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-1">
                    <span className="font-bold text-amber-400 uppercase text-[10px]">CHECK (Clause 9)</span>
                    <p className="text-[11px] text-slate-300">KPI Monitoring, Multi-Year Audit, Bi-Annual MRM</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-1">
                    <span className="font-bold text-emerald-400 uppercase text-[10px]">ACT (Clause 10)</span>
                    <p className="text-[11px] text-slate-300">CAPA Non-Conformities, 5-Whys, Continual Audit</p>
                  </div>
                </div>

                {/* Detailed Manual Sections */}
                <div className="space-y-3">
                  {ismsManual.sections.map(sec => (
                    <div
                      key={sec.number}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                    >
                      <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs flex items-center justify-center">
                          {sec.number}
                        </span>
                        <span>{sec.title}</span>
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed pl-7">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
