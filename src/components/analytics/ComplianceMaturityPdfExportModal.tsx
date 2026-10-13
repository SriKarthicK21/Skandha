import React, { useState } from 'react';
import {
  FileDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Layers,
  TrendingUp,
  ShieldCheck,
  Brain,
  Award,
  Sparkles
} from 'lucide-react';
import { DomainMaturityItem } from './ComplianceMaturityScorecard';
import { exportComplianceMaturityPDF } from '../../utils/complianceMaturityPdfExporter';

export interface ComplianceMaturityPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
  viewLens: 'domains' | 'clauses';
  overallIso27001: number;
  overallIso42001: number;
  harmonizationSynergyPct: number;
  activeDataset: DomainMaturityItem[];
  historicalTrend?: Array<{
    month: string;
    overall: number;
    iso27001: number;
    iso42001: number;
    evidenceVerificationRate: number;
    openFindings: number;
    keyMilestone: string;
  }>;
  chartElementId?: string;
}

export const ComplianceMaturityPdfExportModal: React.FC<ComplianceMaturityPdfExportModalProps> = ({
  isOpen,
  onClose,
  tenantName,
  viewLens,
  overallIso27001,
  overallIso42001,
  harmonizationSynergyPct,
  activeDataset,
  historicalTrend,
  chartElementId = 'compliance-maturity-radar-container'
}) => {
  const [includeRadar, setIncludeRadar] = useState(true);
  const [includeProgressBars, setIncludeProgressBars] = useState(true);
  const [includeTrajectory, setIncludeTrajectory] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeAttestation, setIncludeAttestation] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      await exportComplianceMaturityPDF({
        tenantName,
        viewLens,
        overallIso27001,
        overallIso42001,
        harmonizationSynergyPct,
        benchmarkThreshold: 85,
        activeDataset,
        historicalTrend,
        chartElementId: includeRadar ? chartElementId : undefined,
        includeHistoricalProgress: includeTrajectory,
        reportingPeriod: 'Q3 2026 Audit Window'
      });

      setExportSuccess(true);
      setTimeout(() => {
        setIsExporting(false);
        onClose();
        setExportSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      setExportError(err?.message || 'Failed to generate PDF document. Please try again.');
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Export Compliance Maturity Scorecard
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Formatted PDF
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate an audit-ready executive dossier with progress charts and recommendations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Target Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Target Organization:</span>
              <span className="font-semibold text-white">{tenantName || 'Enterprise Client'}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Assessment Lens:</span>
              <span className="font-mono text-sky-400 font-semibold uppercase">
                {viewLens === 'domains' ? '8 Operational Domains' : 'MSS Clauses (4-10)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400 font-semibold">ISO 27001</div>
                <div className="text-sm font-bold text-emerald-300">{overallIso27001}%</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-[10px] text-purple-400 font-semibold">ISO 42001</div>
                <div className="text-sm font-bold text-purple-300">{overallIso42001}%</div>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <div className="text-[10px] text-sky-400 font-semibold">Synergy</div>
                <div className="text-sm font-bold text-sky-300">{harmonizationSynergyPct}%</div>
              </div>
            </div>
          </div>

          {/* Section Inclusion Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Dossier Content & Deliverable Sections:
            </label>

            <div className="space-y-2">
              {/* Option 1: Radar Chart */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRadar}
                  onChange={(e) => setIncludeRadar(e.target.checked)}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Multi-Axial Dual-Framework Radar Spider Chart
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    High-resolution polar rendering comparing ISMS and AIMS coverage against the 85% benchmark
                  </div>
                </div>
              </label>

              {/* Option 2: Progress Bars & Dimension Breakdown */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProgressBars}
                  onChange={(e) => setIncludeProgressBars(e.target.checked)}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Comparative Dimensional Adherence Matrix & Progress Bars
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Full control breakdown across {activeDataset.length} dimensions with evidence freshness and CMMI levels
                  </div>
                </div>
              </label>

              {/* Option 3: Historical Progress Trajectory */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTrajectory}
                  onChange={(e) => setIncludeTrajectory(e.target.checked)}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    6-Month Historical Progress Trajectory & Audit Velocity
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Month-over-month trajectory ledger (Apr - Sep 2026) documenting testing milestones and CAPA closures
                  </div>
                </div>
              </label>

              {/* Option 4: Actionable Recommendations */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRecommendations}
                  onChange={(e) => setIncludeRecommendations(e.target.checked)}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-400" />
                    Actionable Strategic & Tactical Recommendations
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Prioritized 0-30 day, 30-90 day, and cross-framework harmonization remediation roadmaps
                  </div>
                </div>
              </label>

              {/* Option 5: Auditor Sign-off */}
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800/70 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAttestation}
                  onChange={(e) => setIncludeAttestation(e.target.checked)}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900"
                />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-sky-400" />
                    Lead Auditor & CISO Attestation Sign-off Docket
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Formal tripartite sign-off with SHA-256 cryptographic verification seal
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Feedback & Error Notifications */}
          {exportError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PDF generated successfully! Download starting...</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Document Format: <span className="text-white font-mono">ISO 216 A4 (Portrait, 3 Pages)</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Rendering PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Formatted PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
