import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Check,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import { SamplingRationaleData } from '../../types/samplingRationale';
import {
  exportSamplingRationalePdf,
  exportSamplingRationaleMarkdown,
  generateSamplingRationaleMarkdown
} from '../../utils/iso19011SamplingRationaleExporter';
import { useToast } from '../common/ToastContainer';

interface SamplingRationaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SamplingRationaleData;
}

export const SamplingRationaleModal: React.FC<SamplingRationaleModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'risk_factors' | 'statistical' | 'ledger'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExportPdf = () => {
    try {
      exportSamplingRationalePdf(data);
      showToast({
        title: 'PDF Exported',
        message: 'Formal ISO 19011 audit sampling rationale document exported as PDF.',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Export Error',
        message: err?.message || 'Failed to generate PDF document.',
        type: 'error'
      });
    }
  };

  const handleExportMarkdown = () => {
    try {
      exportSamplingRationaleMarkdown(data);
      showToast({
        title: 'Markdown Exported',
        message: 'Audit sampling working paper saved as Markdown.',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Export Error',
        message: err?.message || 'Failed to export Markdown.',
        type: 'error'
      });
    }
  };

  const handleCopyText = async () => {
    try {
      const text = generateSamplingRationaleMarkdown(data);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({
        title: 'Copied to Clipboard',
        message: 'Full ISO 19011 sampling rationale working paper copied.',
        type: 'success'
      });
    } catch {
      showToast({
        title: 'Copy Failed',
        message: 'Unable to copy text to clipboard.',
        type: 'error'
      });
    }
  };

  const riskBadgeColor =
    data.riskAssessment.riskTier === 'CRITICAL'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : data.riskAssessment.riskTier === 'HIGH'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : data.riskAssessment.riskTier === 'MODERATE'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {data.documentId}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${riskBadgeColor}`}>
                  {data.riskAssessment.overallRiskScore}/100 • {data.riskAssessment.riskTier} RISK
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ISO 19011:2018 §B.3
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Audit Sampling Rationale Working Paper
              </h2>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Markdown</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700 flex items-center"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800/80 bg-slate-950/50 flex space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Executive Rationale & Mandate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('risk_factors')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'risk_factors'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Population Risk Score ({data.riskAssessment.overallRiskScore}/100)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statistical')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'statistical'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Statistical Model (Cochran Formula)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'ledger'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Working Paper Ledger ({data.samples.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* TAB 1: OVERVIEW & MANDATE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Context Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Target Control</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.targetControl.code}
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {data.targetControl.name}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Total Population (N)</span>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {data.population.populationSize} items
                  </div>
                  <span className="text-[10px] text-indigo-400 block">
                    {data.population.artifactType}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Sample Drawn (n)</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {data.statisticalParameters.calculatedSampleSize} items ({data.statisticalParameters.sampleFractionPercentage.toFixed(1)}%)
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {data.statisticalParameters.confidenceLevel}% Conf. / ±{data.statisticalParameters.marginOfError}% Error
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Control Audit Verdict</span>
                  <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">
                    {data.fieldworkResults.auditVerdict}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {data.fieldworkResults.passedCount} Pass / {data.fieldworkResults.failedCount} Fail
                  </span>
                </div>
              </div>

              {/* Rationale Narrative */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  ISO 19011:2018 §6.4.4 & §B.3 Sampling Mandate & Rationale
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full 100% census verification of all {data.population.populationSize} artifacts is economically and operationally disproportionate. Statistical sampling provides an objective, repeatable, and mathematically defensible evidentiary basis to evaluate whether operational controls are operating with effective design and consistency.
                </p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-white block mb-1">Risk-Derived Determination:</strong>
                  {data.riskAssessment.rationaleSummary}
                </div>
              </div>

              {/* Fieldwork Verification Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Fieldwork Verification & Error Upper Bound Estimation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Observed Sample Error Rate</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">
                      {data.fieldworkResults.sampleErrorRatePct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Tolerable ceiling: {data.fieldworkResults.tolerableErrorRatePct}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Estimated Upper Error Limit (UEL)</span>
                    <span className="text-lg font-bold font-mono text-indigo-400 mt-1 block">
                      {data.fieldworkResults.upperErrorLimitEstimatePct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      At {data.statisticalParameters.confidenceLevel}% confidence boundary
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Tamper-Evident SHA-256 Seal</span>
                    <span className="text-[11px] font-mono text-emerald-400 mt-1 block truncate">
                      {data.sha256IntegritySeal}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Immutable working paper hash
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic">
                  <strong>Auditor Observation:</strong> {data.fieldworkResults.auditorObservation}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RISK FACTORS */}
          {activeTab === 'risk_factors' && (
            <div className="space-y-6">
              {/* Risk Score Highlight Card */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Calculated Inherent Population Risk
                  </span>
                  <div className="flex items-baseline space-x-3">
                    <span className="text-4xl font-extrabold font-mono text-white">
                      {data.riskAssessment.overallRiskScore}
                    </span>
                    <span className="text-slate-400 text-sm">/ 100</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadgeColor}`}>
                      {data.riskAssessment.riskTier} RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Weighted across 5 ISO 19011 §B.3 risk dimensions. Higher scores mandate increased sample sizing, tighter tolerable error bounds, and stratified sampling.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5 shrink-0 text-slate-300">
                  <div><strong>Evaluator:</strong> {data.leadAuditor.name}</div>
                  <div><strong>Assessment Date:</strong> {data.riskAssessment.evaluatedAt}</div>
                  <div><strong>High-Risk Stratum:</strong> {data.riskAssessment.highRiskStratumDescription}</div>
                </div>
              </div>

              {/* Factors Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Risk Dimension</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Score (1-10)</th>
                      <th className="py-2.5 px-4">Auditor Justification & Impact Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.riskAssessment.factors.map(f => (
                      <tr key={f.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{f.name}</div>
                          <div className="text-[11px] text-slate-400">{f.description}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-300">
                          {(f.weight * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            f.score >= 8
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : f.score >= 6
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {f.score}/10
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs leading-relaxed">
                          {f.justification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STATISTICAL METHODOLOGY */}
          {activeTab === 'statistical' && (
            <div className="space-y-6">
              {/* Formula Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <h4 className="font-sans font-bold text-indigo-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  Cochran Finite Population Formula Formulation
                </h4>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-indigo-300 space-y-1">
                  <div>Initial Size (n₀) = [Z² · p · (1 - p)] / e²</div>
                  <div>Finite Correction (n) = n₀ / [1 + (n₀ - 1) / N]</div>
                </div>
                <div className="text-slate-300 text-xs font-sans space-y-1">
                  <p>• <strong>Population Size (N):</strong> {data.population.populationSize}</p>
                  <p>• <strong>Z-Score:</strong> {data.statisticalParameters.zScore} (for {data.statisticalParameters.confidenceLevel}% Confidence Level)</p>
                  <p>• <strong>Tolerable Margin of Error (e):</strong> {data.statisticalParameters.marginOfError}% (0.0{data.statisticalParameters.marginOfError})</p>
                  <p>• <strong>Anticipated Deviation Rate (p):</strong> {(data.statisticalParameters.expectedErrorRate * 100).toFixed(1)}%</p>
                  <p>• <strong>Calculated Sample Size (n):</strong> <strong className="text-emerald-400">{data.statisticalParameters.calculatedSampleSize} items</strong></p>
                </div>
              </div>

              {/* Sampling Risk Analysis */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider">
                  Sampling Risk Mitigation (ISO 19011:2018 §B.3.3)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-amber-300 block">Type I Error (Alpha Risk)</span>
                    <p className="text-slate-300 leading-relaxed">
                      {data.samplingRiskAnalysis.alphaRiskDescription}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-rose-300 block">Type II Error (Beta Risk)</span>
                    <p className="text-slate-300 leading-relaxed">
                      {data.samplingRiskAnalysis.betaRiskDescription}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      Acceptable Beta Ceiling: <strong>{data.samplingRiskAnalysis.acceptableBetaRiskLevel}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stratification Strategy */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider">
                  Population Stratification & Disproportionate Allocation
                </h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Stratum</th>
                        <th className="p-2.5">Population</th>
                        <th className="p-2.5">Sample Size</th>
                        <th className="p-2.5">Sampling Ratio</th>
                        <th className="p-2.5">Allocation Basis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.stratificationAllocation.map(st => (
                        <tr key={st.stratum} className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-bold text-white">{st.stratum}</td>
                          <td className="p-2.5 font-mono">{st.populationCount}</td>
                          <td className="p-2.5 font-mono font-bold text-indigo-300">{st.sampleCount}</td>
                          <td className="p-2.5 font-mono">{st.samplingRatioPct.toFixed(1)}%</td>
                          <td className="p-2.5 text-slate-400">{st.allocationBasis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLE LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Working Paper Ledger: <strong>{data.samples.length} Samples</strong></span>
                <span className="font-mono text-[11px]">Audit Subject: {data.population.artifactType}</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-mono">Sample ID</th>
                      <th className="py-2.5 px-3">Artifact Reference</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Risk Stratum</th>
                      <th className="py-2.5 px-3">Test Status</th>
                      <th className="py-2.5 px-3">Working Paper Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.samples.map(s => (
                      <tr key={s.id} className="hover:bg-slate-950/40 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{s.id}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-300">{s.itemRef}</td>
                        <td className="py-2.5 px-3 text-slate-300">{s.department}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.riskTier === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            s.riskTier === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {s.riskTier}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            s.status === 'Pass' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            s.status === 'Fail' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-sm truncate">{s.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>ISO 19011:2018 Clause 4 Conformance Verified • Lead Auditor: {data.leadAuditor.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Rationale</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
