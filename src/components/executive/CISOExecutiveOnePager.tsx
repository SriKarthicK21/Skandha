import React from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  ShieldCheck,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Printer,
  Download,
  Building,
  Target,
  Users2,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../common/ToastContainer';

export const CISOExecutiveOnePager: React.FC = () => {
  const { currentTenant, controls, evidence, findings, risks } = useGRC();
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const highRisks = risks.filter(r => r.residualScore >= 12);
  const openMajorNCs = findings.filter(f => f.severity === 'Major Non-Conformity' && f.status !== 'Closed Verified');
  const openMinorNCs = findings.filter(f => f.severity === 'Minor Non-Conformity' && f.status !== 'Closed Verified');

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 print:hidden shadow-sm">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-white">
            Executive CISO 1-Page Briefing (Board & Audit Committee)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print 1-Page PDF Brief</span>
          </button>
        </div>
      </div>

      {/* THE 1-PAGE DOCUMENT CONTAINER */}
      <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 space-y-6 print:border-none print:p-0 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                CONFIDENTIAL • BOARD RESTRICTED
              </span>
              <span className="text-xs text-slate-400 font-mono">ISO/IEC 27001:2022 ISMS</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Executive Cybersecurity & Certification Readiness Brief
            </h1>
            <p className="text-xs text-slate-400">
              Prepared for the Board of Directors & Audit Committee • Organization: <strong>{currentTenant?.name || 'Enterprise Group'}</strong>
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <div className="text-slate-400">Reporting Date: <strong className="text-white">September 14, 2026</strong></div>
            <div className="text-slate-400">Auditor Benchmark: <strong className="text-indigo-400">BSI / TÜV SÜD Protocol</strong></div>
          </div>
        </div>

        {/* 4 Core Executive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Overall ISMS Readiness</span>
            <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">94%</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Stage 1 Pass Benchmark: &gt;85%</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Projected Stage 1 Audit</span>
            <div className="text-lg font-bold text-white font-mono mt-2">Oct 12, 2026</div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">On Schedule (28 Days)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Stage 2 Fieldwork Target</span>
            <div className="text-lg font-bold text-white font-mono mt-2">Nov 24, 2026</div>
            <span className="text-[10px] text-indigo-400 mt-0.5 block">Q4 Certification Window</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">CB Auditor Confidence</span>
            <div className="text-3xl font-bold text-sky-400 font-mono mt-1">HIGH</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">0 Major NC Blockers</span>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">CISO Executive Assessment</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Information Security Management System (ISMS) has achieved 94% operational readiness. All mandatory governance documentation—including the ISMS Scope Statement (Cl. 4.3), executive-approved Security Policy (Cl. 5.2), Risk Assessment & Treatment Plan (Cl. 6.1), and Statement of Applicability v2.0 covering all 93 controls—has been formally executed. Internal audit fieldwork (Cl. 9.2) and the annual Management Review Meeting (Cl. 9.3) are finalized with full quorum.
          </p>
        </div>

        {/* Two-Column Section: Risk Posture vs. Critical Path Remediation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Residual Risk Posture vs. Appetite */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Residual Risk vs. Risk Appetite</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Within Appetite
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Total Cataloged Enterprise Risks:</span>
                <span className="font-mono font-bold text-white">{risks.length}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">High Residual Risks (Post-Treatment):</span>
                <span className="font-mono font-bold text-amber-400">{highRisks.length}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Unacceptable Risks (Exceeding Appetite):</span>
                <span className="font-mono font-bold text-emerald-400">0</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Risk Treatment Plan (RTP) Execution:</span>
                <span className="font-mono font-bold text-indigo-300">92% Implemented</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong>Risk Governance Note:</strong> Residual risk reduction across infrastructure and vendor management meets the Board-approved Risk Appetite threshold of &lt;15 on the 5x5 matrix.
            </div>
          </div>

          {/* Column 2: Critical Path Remediation Blockers */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Top Critical Path Action Items</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">DR Tabletop & Failover Simulation</span>
                  <span className="text-[10px] font-mono text-amber-400">ETA: Sep 22</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verify secondary AWS multi-region failover RTO/RPO metrics for A.5.29 / A.5.30.
                </p>
                <div className="text-[10px] text-slate-500">Owner: Infrastructure & DevOps Lead</div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Tier-1 Vendor SOC 2 Re-Collection</span>
                  <span className="text-[10px] font-mono text-amber-400">ETA: Sep 28</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Obtain refreshed SOC 2 Type II reports from 3 cloud hosting vendors for A.5.19.
                </p>
                <div className="text-[10px] text-slate-500">Owner: Procurement & Third-Party Risk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            Certified ISMS Scope: <strong>Global Cloud Infrastructure & SaaS Platform Operations</strong>
          </div>
          <div className="flex items-center space-x-4">
            <span>Alexander Wright, CISO</span>
            <span>•</span>
            <span>Sophia Tremblay, Audit Chair</span>
          </div>
        </div>
      </div>
    </div>
  );
};
