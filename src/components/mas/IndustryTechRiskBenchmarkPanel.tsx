import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  BarChart3,
  Layers,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Clock,
  ExternalLink,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Info,
  Server,
  Lock,
  Globe,
  Database,
  Smartphone,
  Cpu
} from 'lucide-react';
import {
  INDUSTRY_BENCHMARK_REPORTED_ISSUES,
  SIX_GROUPED_IMPACT_AREAS,
  COMPLIANCE_PROGRAM_STEPS,
  SUPERVISORY_CASE_STUDIES,
  INDUSTRY_COST_IMPACT_MATRIX,
  STATUTORY_FI_DEFINITIONS,
  GroupedImpactArea,
  SupervisoryCaseStudy
} from '../../data/industryTechRiskMasterData';

export const IndustryTechRiskBenchmarkPanel: React.FC<{
  onSelectDomainFilter?: (domainName: string) => void;
  compactMode?: boolean;
}> = ({ onSelectDomainFilter, compactMode = false }) => {
  const [activeTab, setActiveTab] = useState<
    'benchmarking' | 'impact_areas' | 'methodology' | 'case_studies' | 'cost_matrix' | 'fi_scope'
  >('benchmarking');

  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string>(SUPERVISORY_CASE_STUDIES[0].id);

  const activeArea = SIX_GROUPED_IMPACT_AREAS.find(a => a.id === selectedAreaId) || SIX_GROUPED_IMPACT_AREAS[0];
  const activeCaseStudy = SUPERVISORY_CASE_STUDIES.find(c => c.id === selectedCaseStudyId) || SUPERVISORY_CASE_STUDIES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-200">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/30 border-b border-slate-800 p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Industry Technology Risk Advisory & Supervisory Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Issue 1 • Industry Benchmarks & Practice Precedents
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MAS Notice & TRM Guidelines Aligned
              </span>
            </div>

            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Managing Technology Risk is a Business Priority</span>
              </h2>
              <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
                Authoritative regulatory impact analysis, real-world supervisory deficiency distributions across Banking vs. Insurance, 6 grouped business impact domains, and empirical remediation case studies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right space-y-0.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Highest Risk Area</div>
              <div className="text-sm font-bold text-rose-400">Infra Security (27%–31%)</div>
              <div className="text-[10px] text-amber-300 font-medium">Most Common: Outsourcing (7%)</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-5 mt-2 border-t border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => setActiveTab('benchmarking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'benchmarking'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Banking vs Insurance Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('impact_areas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'impact_areas'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>The 6 Grouped Impact Areas</span>
          </button>

          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'methodology'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>4-Step Program</span>
          </button>

          <button
            onClick={() => setActiveTab('case_studies')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'case_studies'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Onshore & Offshore Case Studies</span>
          </button>

          <button
            onClick={() => setActiveTab('cost_matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cost_matrix'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Impact & Cost Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('fi_scope')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'fi_scope'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>MAS Act Sec 27A(6) FI Scope</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 lg:p-6 space-y-6">
        {/* TAB 1: BANKING VS INSURANCE BENCHMARK */}
        {activeTab === 'benchmarking' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>Reported Issues by Domain: Banking vs. Insurance Institutions</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Empirical supervisory deficiency statistics compiled across regulated financial institutions in Singapore. Shows actual percentage of audit findings attributed to each technology domain.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-slate-300 font-semibold">Banking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-sky-400" />
                  <span className="text-slate-300 font-semibold">Insurance</span>
                </div>
              </div>
            </div>

            {/* Benchmark Bars Grid */}
            <div className="space-y-3">
              {INDUSTRY_BENCHMARK_REPORTED_ISSUES.map(item => (
                <div
                  key={item.domain}
                  className={`p-4 rounded-xl border transition-all ${
                    item.isHighestIssueArea
                      ? 'bg-rose-950/20 border-rose-900/50 shadow-md shadow-rose-950/20'
                      : item.isMostPopularIssueArea
                      ? 'bg-amber-950/20 border-amber-900/50'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">{item.domain}</span>
                      {item.isHighestIssueArea && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Highest Volume of Issues
                        </span>
                      )}
                      {item.isMostPopularIssueArea && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Single Most Popular Issue
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                      <span className="text-amber-400 font-bold">Bank: {item.bankingPercentage}%</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-sky-300 font-bold">Ins: {item.insurancePercentage}%</span>
                    </div>
                  </div>

                  {/* Comparative Progress Bars */}
                  <div className="space-y-1.5">
                    {/* Banking Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 w-12 text-right">Bank</span>
                      <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                          style={{ width: `${(item.bankingPercentage / 35) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 w-8">{item.bankingPercentage}%</span>
                    </div>

                    {/* Insurance Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 w-12 text-right">Ins</span>
                      <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-400 transition-all duration-500"
                          style={{ width: `${(item.insurancePercentage / 35) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-sky-300 w-8">{item.insurancePercentage}%</span>
                    </div>
                  </div>

                  {/* Description & Audit Takeaway */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    <div className="md:col-span-7 text-slate-300 leading-relaxed">
                      {item.description}
                    </div>
                    <div className="md:col-span-5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-amber-200/90 leading-relaxed text-[11px]">
                      <span className="font-semibold text-amber-400 mr-1">Auditor Takeaway:</span>
                      {item.auditTakeaway}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: THE 6 GROUPED IMPACT AREAS */}
        {activeTab === 'impact_areas' && (
          <div className="space-y-6">
            {/* Area Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SIX_GROUPED_IMPACT_AREAS.map(area => (
                <button
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedAreaId === area.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center justify-center border border-amber-500/30">
                      {area.id}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      area.costImpact === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {area.costImpact}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate">{area.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{area.badge}</div>
                </button>
              ))}
            </div>

            {/* Selected Area Deep Dive Card */}
            <div className="p-5 lg:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                      Area {activeArea.id}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {activeArea.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeArea.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {activeArea.businessImpactSummary}
                  </p>
                </div>

                {/* Impact Scope Badges */}
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] ${
                    activeArea.frameworkImpact ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    Framework {activeArea.frameworkImpact ? '✓' : '—'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] ${
                    activeArea.processImpact ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    Process {activeArea.processImpact ? '✓' : '—'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg border font-semibold text-[11px] ${
                    activeArea.systemsImpact ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    Systems {activeArea.systemsImpact ? '✓' : '—'}
                  </span>
                </div>
              </div>

              {/* Consultation Paper Baseline vs. Final TRM Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prior Consultation Paper Proposal</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeArea.consultationPaperBaseline}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enacted MAS TRM Guidelines & Notice Mandate</span>
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed">
                    {activeArea.trmGuidelinesRequirement}
                  </p>
                </div>
              </div>

              {/* Key Requirements & Key Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Key Operational Requirements</span>
                  </h4>
                  <div className="space-y-2">
                    {activeArea.keyRequirements.map((req, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-200 leading-relaxed">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>What You Need to Consider (Board & CISO)</span>
                  </h4>
                  <div className="space-y-2">
                    {activeArea.keyQuestionsToConsider.map((q, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-900/40 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          ?
                        </span>
                        <span className="text-xs text-sky-100/90 leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 4-STEP COMPLIANCE PROGRAM */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>4-Step MAS TRM Compliance Program Lifecycle</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                Structured four-phase execution model for achieving, validating, and sustaining compliance against MAS TRM Notices and Guidelines, from initial gap assessment to on-going regulatory monitoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMPLIANCE_PROGRAM_STEPS.map(step => (
                <div
                  key={step.stepNumber}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/40">
                          {step.stepNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{step.name}</h4>
                          <span className="text-[10px] text-amber-300 font-medium">{step.phaseLabel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Core Activities
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                        {step.activities.map((act, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Tangible Deliverables
                      </div>
                      <ul className="space-y-1 text-xs text-emerald-200/90 leading-relaxed">
                        {step.deliverables.map((del, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-amber-200/90 leading-relaxed mt-2">
                    <span className="font-semibold text-amber-300 mr-1">Executive Focus:</span>
                    {step.executiveFocus}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CASE STUDIES (ONSHORE VS OFFSHORE BANK) */}
        {activeTab === 'case_studies' && (
          <div className="space-y-6">
            {/* Case Study Switcher */}
            <div className="flex flex-wrap gap-2">
              {SUPERVISORY_CASE_STUDIES.map(cs => (
                <button
                  key={cs.id}
                  onClick={() => setSelectedCaseStudyId(cs.id)}
                  className={`px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCaseStudyId === cs.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{cs.title}</div>
                  <div className="text-[10px] text-amber-300 font-medium mt-0.5">{cs.institutionType}</div>
                </button>
              ))}
            </div>

            {/* Active Case Study Detail */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeCaseStudy.institutionType}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {activeCaseStudy.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="font-semibold text-amber-400 mr-1">Inspection Background:</span>
                  {activeCaseStudy.inspectionContext}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Identified Issues */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2.5">
                  <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Issues / Findings</span>
                  </div>
                  <ul className="space-y-2 text-xs text-rose-100/90 leading-relaxed">
                    {activeCaseStudy.identifiedIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Supervisory Remediation Action */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Supervisory Remediation Actions</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200 leading-relaxed">
                    {activeCaseStudy.supervisoryRemediationActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-sky-400 font-bold">✓</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Business & Regulatory Impact */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2.5">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Business & Regulatory Impact</span>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-100/90 leading-relaxed">
                    {activeCaseStudy.businessAndRegulatoryImpact.map((impact, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Key Lessons Learned */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Key Supervisory Lessons Learned for Singapore FIs</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeCaseStudy.keyLessonsLearned.map((lesson, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                      {lesson}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STATUTORY COST & IMPACT MATRIX */}
        {activeTab === 'cost_matrix' && (
          <div className="space-y-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                <span>Statutory Impact & Cost Matrix for Critical Systems</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                Analysis of organizational impact across Governance Framework, Operational Processes, IT Systems, and Capital Expenditure required to fulfill mandatory MAS TRM requirements.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Action Required</th>
                    <th className="p-3.5 text-center">Framework</th>
                    <th className="p-3.5 text-center">Processes</th>
                    <th className="p-3.5 text-center">Systems</th>
                    <th className="p-3.5 text-center">Cost Level</th>
                    <th className="p-3.5">Cost & Implementation Drivers</th>
                    <th className="p-3.5">Statutory Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {INDUSTRY_COST_IMPACT_MATRIX.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-semibold text-white">
                        {row.actionRequired}
                      </td>
                      <td className="p-3.5 text-center">
                        {row.frameworkImpact ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" title="Framework Impact" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {row.processImpact ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" title="Process Impact" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {row.systemsImpact ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" title="Systems Impact" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          row.costLevel === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : row.costLevel === 'MEDIUM_TO_HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {row.costLevel}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs">
                        {row.costDescription}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-sky-300 whitespace-nowrap">
                        {row.statutoryRef}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MAS ACT SEC 27A(6) STATUTORY SCOPE */}
        {activeTab === 'fi_scope' && (
          <div className="space-y-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>Statutory Scope: Definition of Financial Institution under MAS Act (Cap. 186) Sec 27A(6)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                The MAS TRM Notices are legally binding statutory instruments issued under Section 27A of the Monetary Authority of Singapore Act and individual sectoral legislation, legally binding all designated classes of financial institutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STATUTORY_FI_DEFINITIONS.map(fi => (
                <div key={fi.code} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{fi.category}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {fi.enablingAct}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {fi.scopeNotes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
