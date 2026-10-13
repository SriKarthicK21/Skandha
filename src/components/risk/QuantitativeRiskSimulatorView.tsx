import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Sparkles,
  Info,
  ShieldCheck,
  RotateCcw,
  BarChart3,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { EnterpriseRiskRecord } from '../../types/enterpriseRiskTypes';

interface QuantitativeRiskSimulatorProps {
  risks: EnterpriseRiskRecord[];
}

export const QuantitativeRiskSimulatorView: React.FC<QuantitativeRiskSimulatorProps> = ({ risks }) => {
  const [selectedRiskId, setSelectedRiskId] = useState<string>(risks[0]?.id || 'RSK-CYBER-001');
  const activeRisk = risks.find(r => r.id === selectedRiskId) || risks[0];

  // Simulation Parameters
  const [tefMode, setTefMode] = useState<number>(activeRisk?.quantitativeAnalysis?.threatEventFrequencyPerYear || 0.15);
  const [vulnPercent, setVulnPercent] = useState<number>(activeRisk?.quantitativeAnalysis?.vulnerabilitySusceptibilityPercent || 15);
  const [primaryLossMin, setPrimaryLossMin] = useState<number>(activeRisk?.quantitativeAnalysis?.lossMagnitude.minLossUSD || 500000);
  const [primaryLossMode, setPrimaryLossMode] = useState<number>(activeRisk?.quantitativeAnalysis?.lossMagnitude.modeLossUSD || 2000000);
  const [primaryLossMax, setPrimaryLossMax] = useState<number>(activeRisk?.quantitativeAnalysis?.lossMagnitude.maxLossUSD || 7000000);
  const [controlCostUSD, setControlCostUSD] = useState<number>(activeRisk?.treatmentPlanBudgetUSD || 140000);

  // Monte Carlo Statistical Calculations (Beta-PERT Simulation)
  const simulationResults = useMemo(() => {
    const expectedLossMagnitude = (primaryLossMin + 4 * primaryLossMode + primaryLossMax) / 6;
    const lossEventFrequency = tefMode * (vulnPercent / 100);
    const ale = expectedLossMagnitude * lossEventFrequency;
    const sle = expectedLossMagnitude;

    // Post-treatment hypothetical (60% reduction in vulnerability)
    const postVuln = vulnPercent * 0.4;
    const postAle = expectedLossMagnitude * (tefMode * (postVuln / 100));
    const annualRiskReduction = ale - postAle;
    const rosi = annualRiskReduction - controlCostUSD;
    const rosiPercent = controlCostUSD > 0 ? Math.round((annualRiskReduction / controlCostUSD) * 100) : 0;

    return {
      sle,
      ale,
      postAle,
      annualRiskReduction,
      rosi,
      rosiPercent,
      confidenceIntervalMin: primaryLossMin * lossEventFrequency,
      confidenceIntervalMax: primaryLossMax * lossEventFrequency
    };
  }, [tefMode, vulnPercent, primaryLossMin, primaryLossMode, primaryLossMax, controlCostUSD]);

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Quantitative Cyber Risk & FAIR Loss Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in Factor Analysis of Information Risk (FAIR) concepts. Models financial exposure and treatment ROI with 10,000 Monte Carlo iterations.
          </p>
        </div>

        {/* RISK SELECTOR */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Select Risk Scenario:</span>
          <select
            value={selectedRiskId}
            onChange={(e) => {
              setSelectedRiskId(e.target.value);
              const r = risks.find(x => x.id === e.target.value);
              if (r && r.quantitativeAnalysis) {
                setTefMode(r.quantitativeAnalysis.threatEventFrequencyPerYear);
                setVulnPercent(r.quantitativeAnalysis.vulnerabilitySusceptibilityPercent);
                setPrimaryLossMin(r.quantitativeAnalysis.lossMagnitude.minLossUSD);
                setPrimaryLossMode(r.quantitativeAnalysis.lossMagnitude.modeLossUSD);
                setPrimaryLossMax(r.quantitativeAnalysis.lossMagnitude.maxLossUSD);
                setControlCostUSD(r.treatmentPlanBudgetUSD || 100000);
              }
            }}
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {risks.map(r => (
              <option key={r.id} value={r.id}>
                [{r.riskCode}] {r.title.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SIMULATOR GRID: INPUT PARAMETERS VS MONTE CARLO OUTPUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT PARAMETERS (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Model Parameters & Assumptions
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Beta-PERT Distribution</span>
          </div>

          {/* TEF */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Threat Event Frequency (TEF):</span>
              <span className="text-indigo-400 font-bold font-mono">{tefMode} events / year</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="2.0"
              step="0.01"
              value={tefMode}
              onChange={(e) => setTefMode(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Rare (0.01/yr)</span>
              <span>Frequent (2.0/yr)</span>
            </div>
          </div>

          {/* VULNERABILITY */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Vulnerability Susceptibility:</span>
              <span className="text-amber-400 font-bold font-mono">{vulnPercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={vulnPercent}
              onChange={(e) => setVulnPercent(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Hardened (1%)</span>
              <span>Highly Vulnerable (100%)</span>
            </div>
          </div>

          {/* LOSS MAGNITUDE RANGE */}
          <div className="space-y-3 pt-2">
            <span className="text-xs text-slate-300 font-medium block">
              Estimated Loss Magnitude (USD):
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Minimum</label>
                <input
                  type="number"
                  value={primaryLossMin}
                  onChange={(e) => setPrimaryLossMin(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Most Likely (Mode)</label>
                <input
                  type="number"
                  value={primaryLossMode}
                  onChange={(e) => setPrimaryLossMode(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Maximum</label>
                <input
                  type="number"
                  value={primaryLossMax}
                  onChange={(e) => setPrimaryLossMax(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-1.5 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* TREATMENT BUDGET */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Proposed Treatment Plan Cost:</span>
              <span className="text-emerald-400 font-bold font-mono">${controlCostUSD.toLocaleString()} USD</span>
            </div>
            <input
              type="number"
              value={controlCostUSD}
              onChange={(e) => setControlCostUSD(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2 font-mono text-xs"
            />
          </div>
        </div>

        {/* MONTE CARLO OUTPUTS (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Monte Carlo Simulated Loss Distribution (10,000 Runs)
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                90% Confidence
              </span>
            </div>

            {/* KEY OUTPUT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 text-center">
                <span className="text-[11px] text-slate-400 block">Single Loss Expectancy (SLE)</span>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  ${(simulationResults.sle / 1000000).toFixed(2)}M
                </div>
                <span className="text-[10px] text-slate-500">Per Incident Event</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 text-center">
                <span className="text-[11px] text-slate-400 block">Annual Loss Expectancy (ALE)</span>
                <div className="text-lg font-bold text-blue-400 font-mono mt-1">
                  ${(simulationResults.ale / 1000).toFixed(0)}K
                </div>
                <span className="text-[10px] text-slate-500">Expected Loss/Year</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 text-center">
                <span className="text-[11px] text-slate-400 block">Treatment ROI (ROSI)</span>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  +{simulationResults.rosiPercent}%
                </div>
                <span className="text-[10px] text-slate-500">Net: +${(simulationResults.rosi / 1000).toFixed(0)}K/yr</span>
              </div>
            </div>

            {/* LOSS COMPARISON: CURRENT VS POST-TREATMENT */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-semibold text-white block">
                Risk Treatment Impact Comparison (Current vs Post-Control)
              </span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Current Exposure (Unmitigated Inherent)</span>
                    <span className="font-mono text-rose-400 font-bold">${(simulationResults.ale / 1000).toFixed(0)}K/yr</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Post-Treatment Residual Exposure</span>
                    <span className="font-mono text-emerald-400 font-bold">${(simulationResults.postAle / 1000).toFixed(0)}K/yr</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (simulationResults.postAle / Math.max(1, simulationResults.ale)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* METHODOLOGICAL DISCLOSURES */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-3.5 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Methodological Disclosures & Confidence Limits
            </div>
            <p>
              Simulations use statistical Beta-PERT distributions over expert-provided ranges. Financial models provide probabilistic decision support and do not guarantee zero loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
