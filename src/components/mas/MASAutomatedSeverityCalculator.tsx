import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Clock,
  DollarSign,
  Users,
  Building2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  FileText,
  RotateCcw,
  Sliders,
  Copy,
  Download,
  Info
} from 'lucide-react';
import {
  DetailedSeverityCalculatorInput,
  DetailedSeverityScoreResult,
  calculateDetailedMASIncidentSeverity,
  MAS_SEVERITY_SCENARIO_PRESETS,
  CustomerSegmentType,
  ChannelDisruptionType,
  FundAccessImpactType,
  CyberCompromiseLevel,
  PublicSentimentExposure
} from '../../services/masIncidentSeverityService';

export interface MASAutomatedSeverityCalculatorProps {
  initialInput?: Partial<DetailedSeverityCalculatorInput>;
  onApplyToIncident?: (result: DetailedSeverityScoreResult, input: DetailedSeverityCalculatorInput) => void;
  onNavigateToDispatch?: () => void;
}

const DEFAULT_INPUT: DetailedSeverityCalculatorInput = {
  affectedCustomerCount: 12500,
  customerBasePercentage: 7.5,
  customerSegment: 'RETAIL_CONSUMERS',
  channelDisrupted: 'CORE_PAYMENT_FAST_PAYNOW',
  fundAccessImpact: 'TOTAL_LOCKOUT',
  directFinancialLossSGD: 120000,
  stalledTransactionVolumeSGD: 4500000,
  potentialRegulatoryFinesRisk: true,
  thirdPartyContractualLiability: true,
  isCriticalInformationSystem: true,
  projectedOutageDurationMinutes: 120,
  interbankContagionRisk: true,
  cyberCompromiseLevel: 'NONE_HARDWARE_DEFECT',
  minutesElapsedSinceDiscovery: 24,
  publicSentimentExposure: 'LOCALIZED_SOCIAL_MEDIA'
};

export const MASAutomatedSeverityCalculator: React.FC<MASAutomatedSeverityCalculatorProps> = ({
  initialInput,
  onApplyToIncident,
  onNavigateToDispatch
}) => {
  const [calculatorInput, setCalculatorInput] = useState<DetailedSeverityCalculatorInput>(() => ({
    ...DEFAULT_INPUT,
    ...initialInput
  }));

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showSensitivityAnalysis, setShowSensitivityAnalysis] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Compute live severity score
  const scoreResult: DetailedSeverityScoreResult = useMemo(() => {
    return calculateDetailedMASIncidentSeverity(calculatorInput);
  }, [calculatorInput]);

  // Handle Preset Loading
  const handleLoadPreset = (presetId: string) => {
    const preset = MAS_SEVERITY_SCENARIO_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setCalculatorInput({ ...preset.input });
      setActivePresetId(preset.id);
    }
  };

  const handleReset = () => {
    setCalculatorInput({ ...DEFAULT_INPUT });
    setActivePresetId(null);
  };

  // Copy evaluation dossier to clipboard
  const handleCopyDossier = () => {
    const markdown = `# MAS TRM STATUTORY SEVERITY EVALUATION DOSSIER
**Evaluation Generated**: ${new Date().toISOString()}
**Derived Statutory Classification**: ${scoreResult.severityLabel}
**Composite Severity Score**: ${scoreResult.compositeScore} / 100
**Statutory 1-Hour Notice Required**: ${scoreResult.isStatutory1HourNoticeMandatory ? 'YES (MANDATORY UNDER NOTICE 644/655)' : 'NO (DISCRETIONARY / INTERNAL)'}
**Minutes Remaining in Statutory Window**: ${scoreResult.statutoryDeadlineMinutesRemaining} minutes

## FACTOR BREAKDOWN
- Customer Impact Sub-Score: ${scoreResult.customerImpactScore} / 30 (${scoreResult.customerImpactLevel})
  * Affected Customers: ${calculatorInput.affectedCustomerCount.toLocaleString()} (${calculatorInput.customerBasePercentage}% of base)
  * Segment: ${calculatorInput.customerSegment}
  * Disrupted Channel: ${calculatorInput.channelDisrupted}
  * Fund Access State: ${calculatorInput.fundAccessImpact}

- Financial Loss Sub-Score: ${scoreResult.financialLossScore} / 30 (${scoreResult.financialLossLevel})
  * Direct Financial Loss: SGD ${calculatorInput.directFinancialLossSGD.toLocaleString()}
  * Stalled Transaction Volume: SGD ${calculatorInput.stalledTransactionVolumeSGD.toLocaleString()}
  * Regulatory Fine Exposure Flagged: ${calculatorInput.potentialRegulatoryFinesRisk ? 'YES' : 'NO'}
  * Counterparty Liquidated Damages Flagged: ${calculatorInput.thirdPartyContractualLiability ? 'YES' : 'NO'}

- Regulatory Reporting Urgency Sub-Score: ${scoreResult.regulatoryUrgencyScore} / 40 (${scoreResult.regulatoryUrgencyLevel})
  * Designated Critical Information System (CIS): ${calculatorInput.isCriticalInformationSystem ? 'YES' : 'NO'}
  * Projected Outage Duration: ${calculatorInput.projectedOutageDurationMinutes} minutes (MAS Cap: 240 mins)
  * Interbank Contagion Risk: ${calculatorInput.interbankContagionRisk ? 'YES' : 'NO'}
  * Cyber Exfiltration Status: ${calculatorInput.cyberCompromiseLevel}
  * Elapsed Discovery Time: ${calculatorInput.minutesElapsedSinceDiscovery} mins

## STATUTORY NOTICE RATIONALE
${scoreResult.statutoryNoticeReason}

## STATUTORY PENALTY EXPOSURE
${scoreResult.statutoryPenaltiesRiskSummary}

## RECOMMENDED REGULATORY ACTIONS
${scoreResult.recommendedActions.map(action => `- ${action}`).join('\n')}
`;

    navigator.clipboard.writeText(markdown);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Scenario Presets */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-400" />
                MAS Notice 644/655 Automated Severity Engine
              </span>
              <span className="text-xs text-slate-400">Section 8 & Cl. 9 Statutory Algorithms</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Automated Severity Scoring Calculator
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Dynamically evaluates multi-dimensional incident severity across <strong>Customer Impact</strong>, <strong>Financial Loss Exposure</strong>, and <strong>Statutory Regulatory Urgency</strong>. Automatically computes mandatory 1-hour filing obligations to the MAS Technology Risk Supervision Department.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyDossier}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Dossier Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Evaluation Dossier</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset inputs to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Preset Scenarios Selector */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Load Standard Industry Incident Scenarios:
            </span>
            <span className="text-[11px] text-slate-400">Click any preset to auto-populate the calculator</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {MAS_SEVERITY_SCENARIO_PRESETS.map(preset => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {preset.category}
                      </span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{preset.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-medium text-indigo-300 flex items-center gap-1">
                    <span>Simulate Preset</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Calculator Inputs (Left) & Real-time Live Scorecard (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: Interactive Scoring Factors (7 Cols) */}
        <div className="xl:col-span-7 space-y-5">
          {/* DIMENSION 1: CUSTOMER IMPACT ASSESSMENT */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Dimension 1: Customer Impact & Service Degradation
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      {scoreResult.customerImpactScore} / 30 pts
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Accounts affected, customer segment priority, and fund liquidity access
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                Level: <strong className="text-blue-300">{scoreResult.customerImpactLevel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Affected Customer Count Slider & Input */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300 flex items-center gap-1">
                    Estimated Affected Customer Accounts:
                    <span className="text-[10px] text-slate-400">(Directly unable to transact)</span>
                  </label>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {calculatorInput.affectedCustomerCount.toLocaleString()} users
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={calculatorInput.affectedCustomerCount}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      affectedCustomerCount: parseInt(e.target.value) || 0
                    }))
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 (Internal)</span>
                  <span>1,000 (Local)</span>
                  <span>10,000 (Major)</span>
                  <span>50,000+ (Systemic)</span>
                </div>
              </div>

              {/* Percentage of Active Customer Base */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  % of Active Customer Base Impacted:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={calculatorInput.customerBasePercentage}
                    onChange={e =>
                      setCalculatorInput(prev => ({
                        ...prev,
                        customerBasePercentage: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">%</span>
                </div>
              </div>

              {/* Customer Segment Priority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Primary Customer Segment Impacted:
                </label>
                <select
                  value={calculatorInput.customerSegment}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      customerSegment: e.target.value as CustomerSegmentType
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="INSTITUTIONAL_CLEARING">Institutional / Interbank Clearing Members (+5 pts)</option>
                  <option value="CORPORATE_TREASURY">Corporate Treasury & Commercial Payroll (+4 pts)</option>
                  <option value="RETAIL_CONSUMERS">Mass Retail Banking Consumers (+4 pts)</option>
                  <option value="WEALTH_HNW">High Net Worth / Private Wealth (+3 pts)</option>
                  <option value="INTERNAL_OPERATIONS">Internal Employees Only (+1 pt)</option>
                </select>
              </div>

              {/* Disrupted Service Channel */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Disrupted Service Channel:
                </label>
                <select
                  value={calculatorInput.channelDisrupted}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      channelDisrupted: e.target.value as ChannelDisruptionType
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="CORE_PAYMENT_FAST_PAYNOW">FAST / PayNow / Real-Time Rails (+2 pts + Statutory Trigger)</option>
                  <option value="INTERNET_MOBILE_BANKING">Retail Mobile & Web Portal (+2 pts)</option>
                  <option value="API_GATEWAY_INTEGRATIONS">B2B Open Banking API Gateways (+1 pt)</option>
                  <option value="BRANCH_ATM_NETWORK">ATM & Physical Branch Network (+1 pt)</option>
                  <option value="INTERNAL_BACKOFFICE">Internal Reconciliation / Analytics (0 pts)</option>
                </select>
              </div>

              {/* Customer Fund Access Impact */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Customer Fund Access & Liquidity Impact:
                </label>
                <select
                  value={calculatorInput.fundAccessImpact}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      fundAccessImpact: e.target.value as FundAccessImpactType
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="TOTAL_LOCKOUT">Total Lockout: No transactions or withdrawals (+5 pts)</option>
                  <option value="DEGRADED_LATENCY">Degraded Latency: Intermittent transaction timeouts (+3 pts)</option>
                  <option value="READ_ONLY_BALANCE">Read-Only: Balances visible, transfers halted (+2 pts)</option>
                  <option value="NO_TRANSACTION_IMPACT">No Direct Monetary Impact: Informational glitch (0 pts)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DIMENSION 2: FINANCIAL LOSS & TRANSACTION EXPOSURE */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Dimension 2: Financial Loss & Transaction Volume
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {scoreResult.financialLossScore} / 30 pts
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Direct institutional losses, stalled clearing volume, and statutory liability
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                Exposure: <strong className="text-emerald-300">{scoreResult.financialLossLevel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Direct Financial Loss in SGD */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300">
                    Direct Financial Loss (SGD):
                  </label>
                  <span className="font-mono font-bold text-emerald-400">
                    SGD {calculatorInput.directFinancialLossSGD.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={calculatorInput.directFinancialLossSGD}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      directFinancialLossSGD: Math.max(0, parseFloat(e.target.value) || 0)
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 150000"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  {[10000, 50000, 250000, 1000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setCalculatorInput(prev => ({ ...prev, directFinancialLossSGD: val }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono cursor-pointer"
                    >
                      ${val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stalled Transaction Volume in SGD */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300">
                    Stalled / Interrupted Transaction Volume (SGD):
                  </label>
                  <span className="font-mono font-bold text-emerald-400">
                    SGD {calculatorInput.stalledTransactionVolumeSGD.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={calculatorInput.stalledTransactionVolumeSGD}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      stalledTransactionVolumeSGD: Math.max(0, parseFloat(e.target.value) || 0)
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 4500000"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  {[250000, 1000000, 5000000, 10000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() =>
                        setCalculatorInput(prev => ({ ...prev, stalledTransactionVolumeSGD: val }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono cursor-pointer"
                    >
                      ${val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regulatory Penalty Risk Checkbox */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="regPenaltiesRisk"
                  checked={calculatorInput.potentialRegulatoryFinesRisk}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      potentialRegulatoryFinesRisk: e.target.checked
                    }))
                  }
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="regPenaltiesRisk" className="text-xs font-semibold text-white cursor-pointer">
                    Statutory Fine / Regulatory Sanction Exposure (+5 pts)
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Default poses potential fines under Section 55 Banking Act / Section 23 PS Act (up to SGD 100k + 10k/day).
                  </p>
                </div>
              </div>

              {/* Third-Party Contractual Liability Checkbox */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="thirdPartyLiability"
                  checked={calculatorInput.thirdPartyContractualLiability}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      thirdPartyContractualLiability: e.target.checked
                    }))
                  }
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="thirdPartyLiability" className="text-xs font-semibold text-white cursor-pointer">
                    Third-Party Liquidated Damages / Counterparty SLA (+5 pts)
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Breach of contractual uptime covenants with partner banks, merchant acquirers, or payment gateways.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DIMENSION 3: REGULATORY REPORTING URGENCY */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Dimension 3: Regulatory Reporting Urgency & Statutory Thresholds
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                      {scoreResult.regulatoryUrgencyScore} / 40 pts
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    CIS designation, MAS 4-hour downtime cap, cyber exfiltration, and 60-minute SLA clock
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                Urgency: <strong className="text-rose-300">{scoreResult.regulatoryUrgencyLevel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Critical Information System Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="isCISBox"
                  checked={calculatorInput.isCriticalInformationSystem}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      isCriticalInformationSystem: e.target.checked
                    }))
                  }
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <label htmlFor="isCISBox" className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                    System is Designated Critical Information System (CIS) (+8 pts)
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      MAS TRM Guidelines Section 4
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Under MAS TRM Guidelines, failure of a CIS has direct potential to compromise financial stability or public confidence. Disruption to a CIS automatically elevates incident to mandatory statutory 1-hour notice.
                  </p>
                </div>
              </div>

              {/* Projected Outage Duration vs 4-Hour Cap */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    Projected Outage Duration / MTTR:
                    {calculatorInput.projectedOutageDurationMinutes >= 240 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">
                        BREACHES 4-HOUR ANNUAL DOWNTIME CAP (Cl. 5.3)
                      </span>
                    )}
                  </label>
                  <span className="font-mono font-bold text-rose-400">
                    {calculatorInput.projectedOutageDurationMinutes} minutes (
                    {(calculatorInput.projectedOutageDurationMinutes / 60).toFixed(1)} hrs)
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="360"
                  step="5"
                  value={calculatorInput.projectedOutageDurationMinutes}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      projectedOutageDurationMinutes: parseInt(e.target.value) || 5
                    }))
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>30m</span>
                  <span>60m (1h)</span>
                  <span>120m (2h)</span>
                  <span className="text-amber-400 font-bold">240m (MAS 4h Statutory Cap)</span>
                  <span>360m (6h)</span>
                </div>
              </div>

              {/* Interbank Contagion Risk */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="contagionRisk"
                  checked={calculatorInput.interbankContagionRisk}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      interbankContagionRisk: e.target.checked
                    }))
                  }
                  className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-rose-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="contagionRisk" className="text-xs font-semibold text-white cursor-pointer">
                    Interbank Contagion / Settlement Spillover (+6 pts)
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Impact ripples to other financial institutions via FAST, PayNow, MEPS+, or SGX settlement rails.
                  </p>
                </div>
              </div>

              {/* Cyber Exfiltration / Compromise Level */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Cyber Attack & Data Confidentiality Breach:
                </label>
                <select
                  value={calculatorInput.cyberCompromiseLevel}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      cyberCompromiseLevel: e.target.value as CyberCompromiseLevel
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE_EXFILTRATION_RANSOMWARE">Active Ransomware / PII Exfiltration (+6 pts + Severity 1)</option>
                  <option value="ADMIN_CREDENTIAL_COMPROMISED">Privileged Admin Credential Breach (+4 pts)</option>
                  <option value="DDOS_PERIMETER_SURGE">Volumetric DDoS / Perimeter Surge (+2 pts)</option>
                  <option value="NONE_HARDWARE_DEFECT">No Cyber Compromise (Infrastructure / Code Defect) (0 pts)</option>
                </select>
              </div>

              {/* Discovery Clock Elapsed Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Minutes Elapsed Since Incident Discovery:
                  </label>
                  <span className="font-mono font-bold text-amber-400">
                    {calculatorInput.minutesElapsedSinceDiscovery} mins elapsed
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={calculatorInput.minutesElapsedSinceDiscovery}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      minutesElapsedSinceDiscovery: parseInt(e.target.value) || 0
                    }))
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0m (Just Discovered)</span>
                  <span>30m (Halfway)</span>
                  <span className="text-red-400 font-bold">60m (Statutory Cutoff)</span>
                </div>
              </div>

              {/* Public Media Exposure */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Public Media & Press Exposure:
                </label>
                <select
                  value={calculatorInput.publicSentimentExposure}
                  onChange={e =>
                    setCalculatorInput(prev => ({
                      ...prev,
                      publicSentimentExposure: e.target.value as PublicSentimentExposure
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value="VIRAL_NATIONAL_PRESS">Viral National Press (Straits Times, CNA) (+2 pts)</option>
                  <option value="LOCALIZED_SOCIAL_MEDIA">Spiking Social Complaints (Reddit / Telegram) (+1 pt)</option>
                  <option value="NONE_CONTAINED">Contained / Zero Public Visibility (0 pts)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Dynamic Scorecard & Statutory Recommendations (5 Cols) */}
        <div className="xl:col-span-5 space-y-5 sticky top-6">
          {/* Main Severity Scorecard Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Composite Severity Score
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                0 - 100 Algorithmic Scale
              </span>
            </div>

            {/* Circular / Score Gauge Layout */}
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-700 ${
                      scoreResult.compositeScore >= 70
                        ? 'stroke-rose-500'
                        : scoreResult.compositeScore >= 45
                        ? 'stroke-amber-400'
                        : scoreResult.compositeScore >= 25
                        ? 'stroke-yellow-400'
                        : 'stroke-blue-400'
                    }`}
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * scoreResult.compositeScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono font-extrabold text-white">
                    {scoreResult.compositeScore}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Score
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${scoreResult.badgeColor}`}>
                  {scoreResult.severityLabel}
                </span>
                <p className="text-xs text-slate-300 leading-snug">
                  {scoreResult.isStatutory1HourNoticeMandatory
                    ? '⚠️ 1-Hour Statutory Notice to MAS is strictly mandated.'
                    : 'ℹ️ Discretionary notice. Internal logging and 24h monitoring.'}
                </p>
                <div className="text-[11px] font-mono text-slate-400 pt-1">
                  Statutory SLA Time Remaining:
                  <strong className={`ml-1 ${scoreResult.statutoryDeadlineMinutesRemaining <= 15 ? 'text-rose-400 font-bold' : 'text-emerald-300'}`}>
                    {scoreResult.statutoryDeadlineMinutesRemaining} minutes
                  </strong>
                </div>
              </div>
            </div>

            {/* Statutory Urgency Banner */}
            {scoreResult.isStatutory1HourNoticeMandatory ? (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/80 text-rose-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wide">
                  <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
                  MANDATORY 1-HOUR MAS NOTIFICATION REQUIRED
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  {scoreResult.statutoryNoticeReason}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs space-y-1">
                <div className="flex items-center gap-2 text-blue-300 font-bold uppercase tracking-wide">
                  <Info className="w-4 h-4 text-blue-400" />
                  INTERNAL RESOLUTION & WATCHLIST TIER
                </div>
                <p className="text-[11px] text-blue-200/90 leading-relaxed">
                  {scoreResult.statutoryNoticeReason}
                </p>
              </div>
            )}

            {/* Tri-Factor Normalized Breakdown Bars */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Multi-Factor Contribution Breakdown
              </h4>

              {/* Customer Impact Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Customer Impact
                  </span>
                  <span className="font-mono text-blue-300 font-semibold">
                    {scoreResult.customerImpactScore} / 30 pts ({scoreResult.radarBreakdown.customerImpactPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${scoreResult.radarBreakdown.customerImpactPercent}%` }}
                  />
                </div>
              </div>

              {/* Financial Loss Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    Financial Loss
                  </span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    {scoreResult.financialLossScore} / 30 pts ({scoreResult.radarBreakdown.financialLossPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${scoreResult.radarBreakdown.financialLossPercent}%` }}
                  />
                </div>
              </div>

              {/* Regulatory Urgency Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Regulatory Reporting Urgency
                  </span>
                  <span className="font-mono text-rose-300 font-semibold">
                    {scoreResult.regulatoryUrgencyScore} / 40 pts ({scoreResult.radarBreakdown.regulatoryUrgencyPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${scoreResult.radarBreakdown.regulatoryUrgencyPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommended Statutory Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Statutory Next Actions:
              </h4>
              <ul className="space-y-1.5">
                {scoreResult.recommendedActions.map((action, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="font-mono text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                    <span className="leading-snug">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Statutory Sanctions Legal Warning */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-300 block mb-1">Statutory Penalties Under Singapore Law:</strong>
              {scoreResult.statutoryPenaltiesRiskSummary}
            </div>

            {/* Action Buttons: Apply to Incident / Navigate to Dispatch */}
            <div className="space-y-2 pt-2">
              {onApplyToIncident && (
                <button
                  onClick={() => onApplyToIncident(scoreResult, calculatorInput)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Apply Score & Pre-fill Notice 644/655 Form</span>
                </button>
              )}

              {onNavigateToDispatch && (
                <button
                  onClick={onNavigateToDispatch}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Open 1-Hour Statutory Dispatch Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setShowSensitivityAnalysis(!showSensitivityAnalysis)}
                className="w-full py-1.5 text-center text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
              >
                {showSensitivityAnalysis ? '▲ Hide Sensitivity Matrix' : '▼ View "What-If" Sensitivity Matrix'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SENSITIVITY "WHAT-IF" ANALYSIS MATRIX */}
      {showSensitivityAnalysis && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Sensitivity "What-If" Regulatory Threshold Simulation
              </h3>
              <p className="text-xs text-slate-300">
                Evaluates how escalation in affected customer volume and financial loss shifts your statutory obligations under MAS Notice 644/655.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Sensitivity Matrix
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Customer Scale</th>
                  <th className="p-3">Direct Financial Loss</th>
                  <th className="p-3">System Criticality</th>
                  <th className="p-3">Simulated Score</th>
                  <th className="p-3">Statutory Classification</th>
                  <th className="p-3">Mandatory 1-Hour Filing?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                <tr className={calculatorInput.affectedCustomerCount < 1000 ? 'bg-indigo-950/40' : ''}>
                  <td className="p-3">500 customers</td>
                  <td className="p-3">SGD 15,000</td>
                  <td className="p-3 text-slate-400">Non-CIS Secondary</td>
                  <td className="p-3 font-bold text-blue-300">18 / 100</td>
                  <td className="p-3">Severity 4: Minor</td>
                  <td className="p-3 text-slate-400">No (Internal Logging)</td>
                </tr>
                <tr className={calculatorInput.affectedCustomerCount >= 1000 && calculatorInput.affectedCustomerCount < 10000 ? 'bg-indigo-950/40' : ''}>
                  <td className="p-3">5,000 customers</td>
                  <td className="p-3">SGD 45,000</td>
                  <td className="p-3 text-yellow-300">Internal High-Priority</td>
                  <td className="p-3 font-bold text-yellow-400">38 / 100</td>
                  <td className="p-3">Severity 3: Moderate</td>
                  <td className="p-3 text-yellow-300">Discretionary Watchlist</td>
                </tr>
                <tr className={calculatorInput.affectedCustomerCount >= 10000 && calculatorInput.affectedCustomerCount < 50000 ? 'bg-indigo-950/40' : ''}>
                  <td className="p-3">25,000 customers</td>
                  <td className="p-3">SGD 250,000</td>
                  <td className="p-3 text-amber-300">Designated CIS</td>
                  <td className="p-3 font-bold text-amber-400">62 / 100</td>
                  <td className="p-3 text-amber-300">Severity 2: Major</td>
                  <td className="p-3 text-rose-400 font-bold">YES (MANDATORY 1-HOUR)</td>
                </tr>
                <tr className={calculatorInput.affectedCustomerCount >= 50000 ? 'bg-indigo-950/40' : ''}>
                  <td className="p-3">75,000 customers</td>
                  <td className="p-3">SGD 1,500,000</td>
                  <td className="p-3 text-rose-400">Core CIS Rail (FAST)</td>
                  <td className="p-3 font-bold text-rose-400">89 / 100</td>
                  <td className="p-3 text-rose-300 font-bold">Severity 1: Critical</td>
                  <td className="p-3 text-rose-400 font-bold animate-pulse">YES (IMMEDIATE MANDATORY)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
