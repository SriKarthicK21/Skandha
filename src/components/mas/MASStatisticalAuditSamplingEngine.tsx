import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Award,
  Clock,
  Printer,
  Download,
  Eye,
  Check,
  X,
  AlertOctagon,
  ChevronDown,
  Info,
  Sliders,
  UserCheck,
  Database,
  Sparkles
} from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { useGRC } from '../../context/GRCContext';
import {
  AUDIT_POPULATION_REGISTRY,
  AuditPopulationProfile,
  AuditPopulationItem,
  CALCULATE_AUDIT_SAMPLE_SIZE
} from '../../data/masSamplingMasterData';

export const MASStatisticalAuditSamplingEngine: React.FC = () => {
  const { currentTenant } = useGRC();

  // Selected population profile
  const [selectedProfileId, setSelectedProfileId] = useState<string>('POP-CAB-CHANGES');
  const [confidenceLevel, setConfidenceLevel] = useState<90 | 95 | 99>(95);
  const [tolerableDeviationRate, setTolerableDeviationRate] = useState<number>(5);
  const [auditSeed, setAuditSeed] = useState<number>(2026);
  const [samplingMethod, setSamplingMethod] = useState<'RANDOM_PRNG' | 'STRATIFIED_RISK'>('RANDOM_PRNG');

  // Working state for samples and testing
  const [testedItemsMap, setTestedItemsMap] = useState<Record<string, {
    status: 'TESTED_PASS' | 'EXCEPTION_FOUND' | 'UNTESTED';
    inquiryNotes?: string;
    observationNotes?: string;
    inspectionArtifactRef?: string;
    reperformanceOutcome?: 'RE_PERFORMED_CORRECT' | 'RE_PERFORMANCE_FAILED';
    reperformanceNotes?: string;
    auditorRemarks?: string;
  }>>({});

  const [activeTestingSampleId, setActiveTestingSampleId] = useState<string | null>(null);
  const [activeModeTab, setActiveModeTab] = useState<'INQUIRY' | 'OBSERVATION' | 'INSPECTION' | 'REPERFORMANCE'>('INSPECTION');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const activeProfile: AuditPopulationProfile = useMemo(() => {
    return AUDIT_POPULATION_REGISTRY.find(p => p.id === selectedProfileId) || AUDIT_POPULATION_REGISTRY[0];
  }, [selectedProfileId]);

  // Calculate required sample size based on AICPA / IIA standards
  const sampleSizeCalc = useMemo(() => {
    return CALCULATE_AUDIT_SAMPLE_SIZE(activeProfile.controlFrequency, confidenceLevel, tolerableDeviationRate);
  }, [activeProfile.controlFrequency, confidenceLevel, tolerableDeviationRate]);

  // Deterministic seeded random sample selector
  const selectedSamples: AuditPopulationItem[] = useMemo(() => {
    const population = [...activeProfile.sampleItems];
    const n = Math.min(population.length, sampleSizeCalc.standardSampleSize);

    if (samplingMethod === 'STRATIFIED_RISK') {
      // Stratified: Sort by Critical / High first, then take samples
      const sorted = [...population].sort((a, b) => {
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return order[a.riskTier] - order[b.riskTier];
      });
      return sorted.slice(0, n);
    }

    // Seeded pseudo-random selection (LCG algorithm for audit reproducibility)
    let seed = auditSeed;
    const lcg = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const sampled: AuditPopulationItem[] = [];
    const pool = [...population];
    for (let i = 0; i < n && pool.length > 0; i++) {
      const idx = Math.floor(lcg() * pool.length);
      sampled.push(pool.splice(idx, 1)[0]);
    }
    return sampled;
  }, [activeProfile, sampleSizeCalc.standardSampleSize, auditSeed, samplingMethod]);

  // Testing statistics
  const testStats = useMemo(() => {
    let passed = 0;
    let exceptions = 0;
    let untested = 0;

    selectedSamples.forEach(sample => {
      const state = testedItemsMap[sample.id]?.status || 'UNTESTED';
      if (state === 'TESTED_PASS') passed++;
      else if (state === 'EXCEPTION_FOUND') exceptions++;
      else untested++;
    });

    const completed = passed + exceptions;
    const deviationRate = completed > 0 ? (exceptions / completed) * 100 : 0;
    const isControlEffective = completed === selectedSamples.length && deviationRate <= tolerableDeviationRate;

    return {
      totalSamples: selectedSamples.length,
      passed,
      exceptions,
      untested,
      completed,
      deviationRate,
      isControlEffective
    };
  }, [selectedSamples, testedItemsMap, tolerableDeviationRate]);

  const activeSampleItem = useMemo(() => {
    if (!activeTestingSampleId) return selectedSamples[0];
    return selectedSamples.find(s => s.id === activeTestingSampleId) || selectedSamples[0];
  }, [activeTestingSampleId, selectedSamples]);

  const handleUpdateTestStatus = (sampleId: string, status: 'TESTED_PASS' | 'EXCEPTION_FOUND') => {
    setTestedItemsMap(prev => ({
      ...prev,
      [sampleId]: {
        ...prev[sampleId],
        status,
        auditorRemarks: prev[sampleId]?.auditorRemarks || (status === 'TESTED_PASS' ? 'Control executed in accordance with criteria.' : 'Audit exception noted: control deviation.')
      }
    }));
  };

  const handleUpdateModeField = (sampleId: string, field: string, value: string) => {
    setTestedItemsMap(prev => ({
      ...prev,
      [sampleId]: {
        ...prev[sampleId],
        status: prev[sampleId]?.status || 'TESTED_PASS',
        [field]: value
      }
    }));
  };

  const handleExportCSV = () => {
    const headers = [
      'Sample ID', 'Record Ref', 'Timestamp', 'Actor', 'Asset', 'Risk Tier',
      'Test Status', 'Inquiry', 'Observation', 'Inspection Ref', 'Re-performance', 'Auditor Remarks'
    ];
    const rows = selectedSamples.map(s => {
      const test = testedItemsMap[s.id];
      return [
        s.id,
        s.recordIdentifier,
        s.timestamp,
        s.primaryActor,
        s.systemOrAsset,
        s.riskTier,
        test?.status || 'UNTESTED',
        `"${test?.inquiryNotes || ''}"`,
        `"${test?.observationNotes || ''}"`,
        `"${test?.inspectionArtifactRef || ''}"`,
        `"${test?.reperformanceOutcome || ''}"`,
        `"${test?.auditorRemarks || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MAS_Audit_Sampling_Workpaper_${activeProfile.controlId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer id="mas-statistical-audit-sampling-engine">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-950 border border-slate-800 rounded-xl p-6 print:hidden shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                MAS Section 15 Independent IT Audit Methodology
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <Award className="w-3 h-3" />
                AICPA / IIA / ISACA Sampling Standard
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Four Verification Modes
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Statistical Evidence Sampling & Testing Engine
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Eliminate self-selected evidence vulnerability during MAS inspections. Calculate mathematically defensible sample sizes across total operational populations, extract pseudo-random audit samples, and execute multi-modal control testing (Inquiry, Observation, Inspection, Re-performance).
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Workpaper
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-2 shadow-md shadow-sky-900/30 border border-sky-500 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Workpaper (CSV)
            </button>
          </div>
        </div>

        {/* Population Profile Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select Audit Population Pool:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AUDIT_POPULATION_REGISTRY.map(profile => (
              <button
                key={profile.id}
                onClick={() => {
                  setSelectedProfileId(profile.id);
                  setActiveTestingSampleId(null);
                }}
                className={`p-3 rounded-lg text-left transition-all border ${
                  selectedProfileId === profile.id
                    ? 'bg-sky-950/40 border-sky-500 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400">{profile.controlId}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                    N = {profile.totalPopulationCount}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-1 truncate">{profile.name}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{profile.controlTitle}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Profile & Sampling Calculator Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Control Context & Sampling Parameters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                  {activeProfile.masChapterRef}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeProfile.controlTitle}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-200 border border-slate-700 self-start sm:self-auto">
                Frequency: {activeProfile.controlFrequency}
              </span>
            </div>

            {/* Sampling Formula Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Confidence Level (1 - α)
                </label>
                <select
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value) as 90 | 95 | 99)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                >
                  <option value={90}>90% (Low Supervisory Scrutiny)</option>
                  <option value={95}>95% (Standard MAS Statutory)</option>
                  <option value={99}>99% (High-Risk Critical System)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">AICPA standard default is 95%.</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Tolerable Deviation Rate (TDR)
                </label>
                <select
                  value={tolerableDeviationRate}
                  onChange={(e) => setTolerableDeviationRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                >
                  <option value={3}>3% (Zero-Tolerance Controls)</option>
                  <option value={5}>5% (Standard Internal Audit)</option>
                  <option value={10}>10% (Non-Critical Operational)</option>
                </select>
                <span className="text-[10px] text-slate-500 block">Maximum acceptable error rate.</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Selection Strategy & Seed
                </label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={samplingMethod}
                    onChange={(e) => setSamplingMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="RANDOM_PRNG">Random PRNG</option>
                    <option value="STRATIFIED_RISK">Stratified (Risk Tier)</option>
                  </select>
                  <button
                    onClick={() => setAuditSeed(prev => prev + 1)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
                    title="Generate new repeatable audit seed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block">Seed: #{auditSeed}</span>
              </div>
            </div>

            {/* Methodological Guidance Box */}
            <div className="p-3 bg-sky-950/30 border border-sky-900/40 rounded-lg text-xs text-sky-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Auditor Methodology Note:</strong>{' '}
                {sampleSizeCalc.guidanceText} Testing sample size:{' '}
                <strong className="text-white font-mono underline">{sampleSizeCalc.standardSampleSize} items</strong> drawn from total population of{' '}
                <strong className="text-white font-mono">{activeProfile.totalPopulationCount} records</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Test Execution Progress & Verdict */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Auditor Testing Verdict
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                {testStats.completed} / {testStats.totalSamples} Completed
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Testing Completion</span>
                  <span className="text-white font-mono">
                    {Math.round((testStats.completed / testStats.totalSamples) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${(testStats.passed / testStats.totalSamples) * 100}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{ width: `${(testStats.exceptions / testStats.totalSamples) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-emerald-400 font-semibold">Passed</div>
                  <div className="text-base font-bold text-white font-mono">{testStats.passed}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-rose-400 font-semibold">Exceptions</div>
                  <div className="text-base font-bold text-rose-300 font-mono">{testStats.exceptions}</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold">Untested</div>
                  <div className="text-base font-bold text-slate-400 font-mono">{testStats.untested}</div>
                </div>
              </div>

              {/* Deviation Rate vs Tolerable Rate */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sample Deviation Rate:</span>
                  <span className={`font-mono font-bold ${testStats.deviationRate > tolerableDeviationRate ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {testStats.deviationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tolerable Limit (TDR):</span>
                  <span className="font-mono text-slate-300">{tolerableDeviationRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Lead Auditor Sign-off Verdict */}
          <div className="pt-3 border-t border-slate-800">
            {testStats.completed < testStats.totalSamples ? (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded text-center text-xs text-amber-300">
                Testing in progress: {testStats.untested} samples remaining.
              </div>
            ) : testStats.isControlEffective ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded text-center space-y-1">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  CONTROL EFFECTIVE (PASS)
                </div>
                <div className="text-[11px] text-slate-300">
                  Statistically sound assurance for MAS Section 15 audit defense.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-center space-y-1">
                <div className="text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  CONTROL DEFICIENT (FAIL)
                </div>
                <div className="text-[11px] text-slate-300">
                  Deviation rate exceeded tolerable threshold. CAPA required.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Workbench: Selected Sample List (Left) & Four Verification Modes Testing (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sample List (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm flex flex-col h-[650px]">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Sampled Items ({selectedSamples.length})
            </h4>
            <div className="flex items-center gap-2">
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-200"
              >
                <option value="ALL">All Risks</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search reference ID, actor, asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Scrollable Sample Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {selectedSamples
              .filter(s => filterRisk === 'ALL' || s.riskTier === filterRisk)
              .filter(s => !searchQuery || s.recordIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) || s.primaryActor.toLowerCase().includes(searchQuery.toLowerCase()) || s.systemOrAsset.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(sample => {
                const testState = testedItemsMap[sample.id]?.status || 'UNTESTED';
                const isSelected = (activeTestingSampleId || selectedSamples[0].id) === sample.id;

                return (
                  <button
                    key={sample.id}
                    onClick={() => setActiveTestingSampleId(sample.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{sample.recordIdentifier}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          sample.riskTier === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          sample.riskTier === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {sample.riskTier}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          testState === 'TESTED_PASS' ? 'bg-emerald-400' :
                          testState === 'EXCEPTION_FOUND' ? 'bg-rose-500' :
                          'bg-slate-600'
                        }`} />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 truncate">
                      {sample.summary}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                      <span className="truncate">{sample.primaryActor}</span>
                      <span className="font-mono">{sample.timestamp.slice(0, 10)}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Auditor Verification Modes Workbench (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col h-[650px] overflow-y-auto">
          {activeSampleItem ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-sky-400">
                      {activeSampleItem.recordIdentifier}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
                      Target: {activeSampleItem.systemOrAsset}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {activeSampleItem.summary}
                  </p>
                </div>

                {/* Quick Pass/Fail Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleUpdateTestStatus(activeSampleItem.id, 'TESTED_PASS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      testedItemsMap[activeSampleItem.id]?.status === 'TESTED_PASS'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Pass Sample
                  </button>
                  <button
                    onClick={() => handleUpdateTestStatus(activeSampleItem.id, 'EXCEPTION_FOUND')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      testedItemsMap[activeSampleItem.id]?.status === 'EXCEPTION_FOUND'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Record Exception
                  </button>
                </div>
              </div>

              {/* Control Expectation */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Mandatory MAS Control Expectation:
                </span>
                <span className="text-slate-200">
                  {activeSampleItem.controlExpectation}
                </span>
              </div>

              {/* The Four Verification Modes Tabs */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveModeTab('INQUIRY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      activeModeTab === 'INQUIRY'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    1. Inquiry
                  </button>
                  <button
                    onClick={() => setActiveModeTab('OBSERVATION')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      activeModeTab === 'OBSERVATION'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    2. Observation
                  </button>
                  <button
                    onClick={() => setActiveModeTab('INSPECTION')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      activeModeTab === 'INSPECTION'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    3. Inspection
                  </button>
                  <button
                    onClick={() => setActiveModeTab('REPERFORMANCE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      activeModeTab === 'REPERFORMANCE'
                        ? 'bg-sky-600 text-white border-sky-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    4. Re-performance
                  </button>
                </div>

                {/* Mode 1: Inquiry */}
                {activeModeTab === 'INQUIRY' && (
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <label className="font-semibold text-slate-300 block">
                      Auditor Inquiry Records & Interviewee Confirmation
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Inquired with primary actor and CAB coordinator; confirmed emergency deployment followed approved bypass protocol."
                      value={testedItemsMap[activeSampleItem.id]?.inquiryNotes || ''}
                      onChange={(e) => handleUpdateModeField(activeSampleItem.id, 'inquiryNotes', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                {/* Mode 2: Observation */}
                {activeModeTab === 'OBSERVATION' && (
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <label className="font-semibold text-slate-300 block">
                      Direct Visual / System Observation Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Observed live CI/CD pipeline gate console. Verified deployment failed automatically if test coverage was below 85%."
                      value={testedItemsMap[activeSampleItem.id]?.observationNotes || ''}
                      onChange={(e) => handleUpdateModeField(activeSampleItem.id, 'observationNotes', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                {/* Mode 3: Inspection */}
                {activeModeTab === 'INSPECTION' && (
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <label className="font-semibold text-slate-300 block">
                      Artifact Evidence & Ticket Inspection Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Jira Ticket #REL-2026-8834; Git Commit SHA 7f83b16a; CAB Approval PDF signed by SecOps Lead."
                      value={testedItemsMap[activeSampleItem.id]?.inspectionArtifactRef || ''}
                      onChange={(e) => handleUpdateModeField(activeSampleItem.id, 'inspectionArtifactRef', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                {/* Mode 4: Re-performance */}
                {activeModeTab === 'REPERFORMANCE' && (
                  <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-3 text-xs">
                    <label className="font-semibold text-slate-300 block">
                      Independent Auditor Control Re-performance
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reperf"
                          checked={testedItemsMap[activeSampleItem.id]?.reperformanceOutcome === 'RE_PERFORMED_CORRECT'}
                          onChange={() => handleUpdateModeField(activeSampleItem.id, 'reperformanceOutcome', 'RE_PERFORMED_CORRECT')}
                          className="text-sky-500"
                        />
                        <span className="text-emerald-300 font-semibold">Re-performance Succeeded (0 Deviation)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="reperf"
                          checked={testedItemsMap[activeSampleItem.id]?.reperformanceOutcome === 'RE_PERFORMANCE_FAILED'}
                          onChange={() => handleUpdateModeField(activeSampleItem.id, 'reperformanceOutcome', 'RE_PERFORMANCE_FAILED')}
                          className="text-rose-500"
                        />
                        <span className="text-rose-300 font-semibold">Re-performance Failed (Deviation Detected)</span>
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="e.g., Re-queried Active Directory LDAP log independently; confirmed account disabled timestamp matched HR departure record within 2.4 hours."
                      value={testedItemsMap[activeSampleItem.id]?.reperformanceNotes || ''}
                      onChange={(e) => handleUpdateModeField(activeSampleItem.id, 'reperformanceNotes', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}
              </div>

              {/* Auditor Final Remarks */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-400 block text-[10px] uppercase">
                  Lead Auditor Workpaper Conclusions & Sample Sign-off
                </label>
                <input
                  type="text"
                  placeholder="Record formal auditor conclusion for this individual sample..."
                  value={testedItemsMap[activeSampleItem.id]?.auditorRemarks || ''}
                  onChange={(e) => handleUpdateModeField(activeSampleItem.id, 'auditorRemarks', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a sample from the list to begin audit verification.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
