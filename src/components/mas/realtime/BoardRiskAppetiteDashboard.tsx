import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Cloud,
  DollarSign,
  Printer,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Activity,
  Check
} from 'lucide-react';

export interface RiskAppetiteDimension {
  id: string;
  dimensionName: string;
  boardApprovedLimit: string;
  currentLiveMetric: string;
  varianceStatus: 'WITHIN_APPETITE' | 'TOLERANCE_WARNING' | 'APPETITE_BREACH';
  masSectionRef: string;
  boardReportingFrequency: string;
  mitigationStrategy: string;
}

export const BoardRiskAppetiteDashboard: React.FC = () => {
  const [dossierExported, setDossierExported] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<'Q3_2026' | 'Q4_2026' | 'Q1_2027'>('Q3_2026');

  const [rasDimensions] = useState<RiskAppetiteDimension[]>([
    {
      id: 'RAS-01',
      dimensionName: 'Critical System Availability & Downtime (Notice 644)',
      boardApprovedLimit: '< 60 mins unscheduled downtime / rolling 12 months',
      currentLiveMetric: '22 mins elapsed (218 mins remaining of 240m statutory cap)',
      varianceStatus: 'WITHIN_APPETITE',
      masSectionRef: 'Notice 644 §4.1',
      boardReportingFrequency: 'Monthly & Immediate if >15m',
      mitigationStrategy: 'Active-Active dual-region automated failover deployed across Changi & Jurong DCs.'
    },
    {
      id: 'RAS-02',
      dimensionName: 'Cyber Hygiene Binding Compliance (Notice 655)',
      boardApprovedLimit: '>= 98.0% across all 6 core controls',
      currentLiveMetric: '97.4% (-0.6% below board tolerance limit)',
      varianceStatus: 'TOLERANCE_WARNING',
      masSectionRef: 'Notice 655 §3-6',
      boardReportingFrequency: 'Quarterly BRC',
      mitigationStrategy: 'Accelerating Qualys critical patch remediation cycle from 16 to 11 days.'
    },
    {
      id: 'RAS-03',
      dimensionName: 'Cloud & Third-Party Concentration Exposure',
      boardApprovedLimit: 'No single cloud provider to exceed 50% critical workload share',
      currentLiveMetric: 'AWS Singapore hosting 48.2% of compute (Near limit)',
      varianceStatus: 'TOLERANCE_WARNING',
      masSectionRef: 'MAS Notice 658 & Outsourcing Guidelines',
      boardReportingFrequency: 'Quarterly BRC',
      mitigationStrategy: 'Migrating backup payment reconciliations to Google Cloud Platform Vertex private cluster.'
    },
    {
      id: 'RAS-04',
      dimensionName: 'Algorithmic Ethics & Model Bias Drift (MAS FEAT)',
      boardApprovedLimit: 'Disparate Impact Ratio >= 0.80 across credit underwriting',
      currentLiveMetric: '0.84 on retail loans; 0.76 on SME Working Capital (Under debiasing)',
      varianceStatus: 'TOLERANCE_WARNING',
      masSectionRef: 'MAS FEAT Principles & TRM §3.4',
      boardReportingFrequency: 'Bi-Annual Board Risk Committee',
      mitigationStrategy: 'Fairlearn pipeline triggered; automated model retrain scheduled for end of month.'
    },
    {
      id: 'RAS-05',
      dimensionName: 'Post-Quantum Cryptography Readiness',
      boardApprovedLimit: '100% of interbank payment signing migrated to hybrid PQC by 2027',
      currentLiveMetric: 'SWIFT Alliance gateway pilot active (ML-DSA Dilithium-3)',
      varianceStatus: 'WITHIN_APPETITE',
      masSectionRef: 'MAS 2024-2026 Quantum Guidance',
      boardReportingFrequency: 'Annual BRC Review',
      mitigationStrategy: 'Thales Luna HSM firmware upgraded to FIPS 203/204 standard.'
    }
  ]);

  const handleExportBRCDossier = () => {
    setDossierExported(true);
    setTimeout(() => setDossierExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                MAS TRM §3 Board & Senior Management Oversight
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                BOARD RISK COMMITTEE (BRC) SUITE
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Board of Directors & C-Suite Risk Appetite (RAS) Dashboard
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
              Executive-level translation of technology risk telemetry into Key Risk Indicators (KRIs) calibrated against
              Board-approved Risk Appetite Statements (RAS). Provides Cyber Value-at-Risk (Cyber VaR) quantification and one-click BRC dossier exports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <select
              value={selectedQuarter}
              onChange={e => setSelectedQuarter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Q3_2026">Q3 2026 Board Dossier</option>
              <option value="Q4_2026">Q4 2026 Projection</option>
              <option value="Q1_2027">Q1 2027 Strategy</option>
            </select>

            <button
              type="button"
              onClick={handleExportBRCDossier}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              {dossierExported ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>BRC Dossier Generated!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export 1-Click BRC Slide Pack (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Board-Level KRI Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* Gauge 1: Notice 644 Downtime */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Notice 644 Downtime Budget</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">90.8%</span>
              <span className="text-xs text-slate-400">Budget Remaining</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              218 of 240 mins available across all 8 Critical Systems
            </p>
          </div>

          {/* Gauge 2: Notice 655 Cyber Hygiene Posture */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Notice 655 Hygiene Posture</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">97.4%</span>
              <span className="text-xs text-slate-400">vs 98.0% Target</span>
            </div>
            <p className="text-[10px] text-amber-400/90 mt-1">
              Within tolerance (-0.6% delta under patch MTTR acceleration)
            </p>
          </div>

          {/* Gauge 3: Concentration Risk */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Cloud Concentration</span>
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-sky-400">48.2%</span>
              <span className="text-xs text-slate-400">Max Single Vendor</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              AWS Singapore hosting (Approved Board Cap: &le; 50%)
            </p>
          </div>

          {/* Gauge 4: Cyber VaR */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Cyber Value-at-Risk (VaR)</span>
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-purple-300">S$ 4.2M</span>
              <span className="text-xs text-emerald-400 font-semibold">(95% 1-Yr)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Fully covered by S$ 25M active Lloyd's cyber insurance policy
            </p>
          </div>
        </div>
      </div>

      {/* Risk Appetite Statement (RAS) Threshold Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Board Risk Appetite Statements (RAS) & Operational Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live traffic-light calibration of enterprise technology risk metrics against Board-mandated risk boundaries
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {rasDimensions.map(dim => (
            <div key={dim.id} className="p-5 hover:bg-slate-800/40 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400">{dim.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <h4 className="text-sm font-bold text-white">{dim.dimensionName}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                      {dim.masSectionRef}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Board Approved Limit:</span>
                      <span className="font-mono text-slate-200 font-semibold">{dim.boardApprovedLimit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Live Telemetry Observation:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{dim.currentLiveMetric}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pt-1">
                    <strong className="text-slate-300">Board Mitigation Strategy:</strong> {dim.mitigationStrategy}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      dim.varianceStatus === 'WITHIN_APPETITE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : dim.varianceStatus === 'TOLERANCE_WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {dim.varianceStatus === 'WITHIN_APPETITE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {dim.varianceStatus === 'TOLERANCE_WARNING' && <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{dim.varianceStatus.replace(/_/g, ' ')}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
