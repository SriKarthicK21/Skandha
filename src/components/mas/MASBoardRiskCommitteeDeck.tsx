import React, { useState } from 'react';
import {
  Presentation,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Printer,
  Download,
  Calendar,
  Users2,
  Activity,
  Layers,
  Flame,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Server,
  Cloud,
  FileText,
  Scale,
  Award,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { useGRC } from '../../context/GRCContext';
import { INITIAL_BRC_PACK_DATA, BRCReportingPackData } from '../../data/masBRCMasterData';

export const MASBoardRiskCommitteeDeck: React.FC = () => {
  const { currentTenant } = useGRC();
  const [brcData, setBrcData] = useState<BRCReportingPackData>(INITIAL_BRC_PACK_DATA);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [boardApproved, setBoardApproved] = useState<boolean>(false);
  const [minuteRef, setMinuteRef] = useState<string>('BRC-2026-Q3-RES-01');

  const slides = [
    { id: 'slide-0', title: '1. Executive Governance & TRM 15-Domain Compliance' },
    { id: 'slide-1', title: '2. MAS Notice 655 Zero-Tolerance Cyber Hygiene' },
    { id: 'slide-2', title: '3. Critical Information Systems (CIS) Downtime vs 4h Limit' },
    { id: 'slide-3', title: '4. Top 5 Technology & Emerging Risks (KRI Metrics)' },
    { id: 'slide-4', title: '5. Internal IT Audit & MAS Thematic Findings Past SLA' },
    { id: 'slide-5', title: '6. Third-Party Vendor & Cloud Concentration Risk' }
  ];

  const handleNextSlide = () => {
    setCurrentSlideIndex(prev => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleBoardSignoff = () => {
    setBoardApproved(true);
  };

  return (
    <PageContainer id="mas-brc-reporting-deck">
      {/* Top Controls Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-950 border border-slate-800 rounded-xl p-6 print:hidden shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <Presentation className="w-3.5 h-3.5" />
                MAS Section 3.1 Board Risk Committee Reporting Pack
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Statutory Board Oversight
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Quarter: {brcData.reportingQuarter}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Quarterly Board Technology Risk Deck & Executive Memo
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Empowers the Board of Directors and Board Risk Committee (BRC) with executive visibility over MAS TRM 15-domain compliance, Notice 655 zero-tolerance mandates, Critical Systems 4-hour downtime ceilings, Top 5 tech risks, and cloud concentration.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save Board Memo
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-md shadow-rose-900/30 border border-rose-500 transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'Exit Presentation Mode' : 'Present to Board'}
            </button>
          </div>
        </div>

        {/* Slide Deck Thumbnails / Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  currentSlideIndex === idx
                    ? 'bg-rose-600 text-white border-rose-500 font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Deck Canvas */}
      <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-8 overflow-y-auto' : ''}`}>
        {/* Fullscreen Close Toolbar */}
        {isFullscreen && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-white">
                {currentTenant?.name || 'Apex FinTech Solutions Ltd'} — Board Risk Committee Deck
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                {slides[currentSlideIndex].title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 text-xs"
              >
                Prev
              </button>
              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 text-xs"
              >
                Next
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded bg-rose-600 text-white text-xs flex items-center gap-1"
              >
                <Minimize2 className="w-4 h-4" /> Exit
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 0: Overall TRM Compliance & Governance Overview */}
        {currentSlideIndex === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Board Executive Briefing — Slide 1 of 6
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Technology Risk Governance & 15-Domain Compliance Posture
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Board Target Appetite</div>
                  <div className="text-xs font-mono font-bold text-slate-200">
                    &ge; {brcData.overallTargetAppetite}%
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Overall Compliance</div>
                  <div className="text-lg font-mono font-bold text-emerald-400">
                    {brcData.overallComplianceScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* High-Level Board KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs">Statutory Baseline</span>
                <div className="text-xl font-bold text-white">MAS TRM 2021</div>
                <span className="text-[10px] text-emerald-400 block">57-Page Standard Fully Ingested</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs">Notice 655 Hygiene</span>
                <div className="text-xl font-bold text-amber-400">5 / 6 Green</div>
                <span className="text-[10px] text-amber-300 block">1 Active BRC Dispensation</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs">CIS 12-Mo Max Outage</span>
                <div className="text-xl font-bold text-emerald-400">45 mins / 240</div>
                <span className="text-[10px] text-slate-400 block">18.75% Burned (81% Safety)</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs">Active Red Team AASE</span>
                <div className="text-xl font-bold text-sky-400">CREST Pass</div>
                <span className="text-[10px] text-sky-300 block">0 Critical Findings Open</span>
              </div>
            </div>

            {/* 15 Domain RAG Score Grid */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                TRM 15-Domain Compliance Heatmap & Quarterly Trajectory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {brcData.domainScores.map(d => (
                  <div key={d.domainId} className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-rose-400">
                          {d.domainNumber}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[170px]">{d.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        d.status === 'GREEN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        d.status === 'AMBER' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {d.score}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${d.status === 'GREEN' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${d.score}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-400 truncate pt-1">
                      {d.primaryDriver}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: MAS Notice 655 Cyber Hygiene Dashboard */}
        {currentSlideIndex === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Board Executive Briefing — Slide 2 of 6
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  MAS Notice 655 Zero-Tolerance Cyber Hygiene Mandate
                </h2>
              </div>
              <div className="px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                Legally Binding Statutory Requirement
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              Under MAS Notice 655, every licensed financial institution must maintain 100% compliance across all 6 baseline controls. Any shortfall requires an immediate formal <strong>Board Risk Committee Dispensation</strong> and documented compensatory mitigation.
            </p>

            <div className="space-y-3">
              {brcData.cyberHygieneControls.map((ctrl) => (
                <div key={ctrl.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                        {ctrl.id}
                      </span>
                      <h3 className="text-xs font-bold text-white">{ctrl.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                        ctrl.compliancePercentage === 100 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ctrl.compliancePercentage}% Compliant
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        ctrl.status === 'COMPLIANT_GREEN' ? 'bg-emerald-950/60 text-emerald-400' :
                        'bg-amber-950/60 text-amber-400'
                      }`}>
                        {ctrl.status === 'COMPLIANT_GREEN' ? 'Zero Dispensation Needed' : 'Dispensation Active'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    {ctrl.statutoryMandate}
                  </div>

                  {ctrl.boardDispensationActive && ctrl.dispensationDetails && (
                    <div className="mt-2 p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg space-y-1.5 text-xs text-amber-200">
                      <div className="flex items-center justify-between">
                        <strong className="text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Active Board Dispensation: {ctrl.dispensationDetails.approvedBy}
                        </strong>
                        <span className="font-mono text-amber-300 underline font-bold">
                          {ctrl.dispensationDetails.daysRemaining} Days Remaining (Expires {ctrl.dispensationDetails.expiryDate})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Compensatory Mitigation:</span>{' '}
                        {ctrl.dispensationDetails.compensatoryControl}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 2: Critical Information Systems (CIS) Downtime vs 4-Hour Limit */}
        {currentSlideIndex === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Board Executive Briefing — Slide 3 of 6
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Critical Systems Availability vs 4-Hour Statutory Ceiling (Notice 644)
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase block">Regulatory Limit</span>
                <span className="text-sm font-mono font-bold text-rose-400">
                  Max 240 mins (4.0 hrs) / 12 Months
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brcData.cisDowntimeLedger.map((cis) => (
                <div key={cis.systemId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-rose-400">{cis.systemId}</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{cis.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {cis.status}
                    </span>
                  </div>

                  {/* Outage Burn Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">12-Month Outage Incurred:</span>
                      <span className="text-white font-mono font-bold">
                        {cis.accumulatedOutageMins12Mo} mins / 240 mins ({cis.outagePercentageBurned}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          cis.accumulatedOutageMins12Mo > 180 ? 'bg-rose-500' :
                          cis.accumulatedOutageMins12Mo > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(4, cis.outagePercentageBurned)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Safety Buffer Remaining: <strong className="text-emerald-400 font-mono">{cis.safetyBufferRemainingMins} mins</strong></span>
                      <span>Target RTO: &le; {cis.rtoTargetHours}h | RPO: &le; {cis.rpoTargetHours}h</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Last DR Test: <strong className="text-slate-200">{cis.lastDrTestDate}</strong></span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {cis.lastDrTestResult}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 3: Top 5 Technology Risks */}
        {currentSlideIndex === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Board Executive Briefing — Slide 4 of 6
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Top 5 Technology & Emerging Risks (KRI Early Warnings)
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-200">
                Board Risk Appetite Calibration: Active
              </span>
            </div>

            <div className="space-y-3">
              {brcData.top5Risks.map((risk) => (
                <div key={risk.riskId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-rose-400">
                        {risk.riskId}
                      </span>
                      <h3 className="text-xs font-bold text-white">{risk.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                        Inherent: {risk.inherentRating}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Residual: {risk.residualRating}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        risk.appetiteStatus === 'WITHIN_APPETITE' ? 'bg-emerald-950/60 text-emerald-400' :
                        'bg-amber-950/60 text-amber-400'
                      }`}>
                        {risk.appetiteStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">KRI Metric</span>
                      <span className="text-slate-200 font-medium">{risk.kriMetric}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Current Value vs Threshold</span>
                      <span className="font-mono text-emerald-400">{risk.kriValue}</span> <span className="text-slate-500 font-mono">({risk.kriThreshold})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Owner & Target Date</span>
                      <span className="text-slate-200">{risk.actionPlanOwner} ({risk.targetResolutionDate})</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-rose-950/10 p-2 rounded border border-rose-950/40">
                    <span className="font-semibold text-rose-300">Executive Action Required:</span>{' '}
                    {risk.executiveActionRequired}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 4: Internal IT Audit & MAS Findings Past SLA */}
        {currentSlideIndex === 4 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Board Executive Briefing — Slide 5 of 6
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Internal IT Audit & MAS Thematic Findings Past SLA
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                1 Overdue Finding Escalated to BRC
              </span>
            </div>

            <div className="space-y-4">
              {brcData.overdueAuditFindings.map((finding) => (
                <div key={finding.findingId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-rose-400">
                        {finding.findingId}
                      </span>
                      <h3 className="text-xs font-bold text-white">{finding.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                        {finding.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {finding.daysOverdue} Days Past SLA
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Reason for Delay</span>
                      <span className="text-slate-200">{finding.delayReason}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Compensatory Control Active</span>
                      <span className="text-emerald-300">{finding.compensatingControl}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                    <span>Executive Accountable: <strong className="text-white">{finding.responsibleExecutive}</strong></span>
                    <span className="text-amber-400 font-semibold">Action: Formal BRC Extension Required</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 5: Cloud & Third-Party Vendor Concentration */}
        {currentSlideIndex === 5 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Board Executive Briefing — Slide 6 of 6
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Third-Party Cloud Materiality & Hyperscaler Concentration Risk
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                MAS Outsourcing Guidelines Alignment
              </span>
            </div>

            <div className="space-y-3">
              {brcData.cloudConcentration.map((v) => (
                <div key={v.vendorId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{v.vendorId}</span>
                      <h3 className="text-xs font-bold text-white">{v.vendorName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200">
                        Share: {v.concentrationSharePercent}%
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {v.cloudMateriality}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Data Sovereignty (Section 43 MAS Act)</span>
                      <span className="text-emerald-400 font-semibold">{v.dataSovereigntyStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Right to Audit Verification</span>
                      <span className="text-slate-200 font-mono">{v.rightToAuditStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Exit Strategy Testing</span>
                      <span className="text-slate-200">Tested {v.lastExitStrategyTestDate}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-1">
                    <strong className="text-slate-300">Concentration Risk Evaluation:</strong> {v.primaryRisk}
                  </div>
                </div>
              ))}
            </div>

            {/* Board Formal Minute & Sign-off Section */}
            <div className="mt-8 p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-400" />
                  Board Risk Committee Formal Minute & Resolution Recording
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Target: {brcData.boardRiskCommitteeChair.split('(')[0]}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-300">
                    Minute Reference: <input
                      type="text"
                      value={minuteRef}
                      onChange={(e) => setMinuteRef(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 font-mono text-white text-xs ml-1"
                    />
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    CISO Submission: {brcData.cisoSignatory} on {brcData.boardMeetingDate}
                  </div>
                </div>

                <button
                  onClick={handleBoardSignoff}
                  disabled={boardApproved}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    boardApproved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {boardApproved ? 'Board Resolution Recorded' : 'Record Formal BRC Approval'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
