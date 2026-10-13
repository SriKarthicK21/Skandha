import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  AlertTriangle,
  Cpu,
  Layers,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Scale,
  Users,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Database,
  BarChart3,
  Bot,
  ArrowRightLeft,
  FileText,
  Compass
} from 'lucide-react';
import { MASTER_ISO42001_CONTROLS, ISO42001_CLAUSES_4_10 } from '../../data/iso42001MasterData';
import { PageContainer } from '../layout/PageContainer';

export const ISO42001DashboardModule: React.FC = () => {
  const { controls, currentTenant, setActiveModule, evidence, findings, tasks } = useGRC();
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  // Filter ISO 42001 controls for current tenant
  const iso42001Controls = controls.filter(c => c.framework?.includes('42001') || c.controlCode.startsWith('A.'));
  const effectiveControls = iso42001Controls.length > 0 ? iso42001Controls : MASTER_ISO42001_CONTROLS.map((c, i) => ({ ...c, id: `ctrl_demo_42k_${i}` }));

  const totalControls = effectiveControls.length;
  const applicableControls = effectiveControls.filter(c => c.applicable !== false);
  const implementedControls = applicableControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited');
  const inProgressControls = applicableControls.filter(c => c.implementationStatus === 'In Progress');
  const complianceScore = applicableControls.length > 0 ? Math.round((implementedControls.length / applicableControls.length) * 100) : 78;

  // Domain groupings for ISO 42001 (A.2 through A.10)
  const domains = [
    { code: 'A.2', name: 'AI Policies', count: 4, implemented: 4, icon: FileCheck2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { code: 'A.3', name: 'Internal Organization', count: 3, implemented: 3, icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { code: 'A.4', name: 'Resources for AI Systems', count: 3, implemented: 2, icon: Cpu, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { code: 'A.5', name: 'AI System Impact Assessment', count: 4, implemented: 3, icon: Scale, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { code: 'A.6', name: 'AI System Lifecycle', count: 7, implemented: 5, icon: SlidersHorizontal, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { code: 'A.7', name: 'Data for AI Systems', count: 5, implemented: 4, icon: Database, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { code: 'A.8', name: 'Information for Interested Parties', count: 3, implemented: 2, icon: Eye, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
    { code: 'A.9', name: 'Use of AI Systems', count: 4, implemented: 3, icon: Bot, color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
    { code: 'A.10', name: 'Third-Party & Suppliers', count: 5, implemented: 4, icon: ShieldCheck, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  ];

  // In-Scope AI Models & Systems
  const aiSystems = [
    {
      id: 'ai-sys-01',
      name: 'Underwriting Risk Scorer v3.2',
      type: 'Supervised ML / XGBoost',
      riskTier: 'HIGH_RISK',
      deployment: 'Production (Live API)',
      impactAssessment: 'Completed (Approved)',
      fairnessScore: '0.94 Disparate Impact',
      driftAlerts: 'Normal (0.02 Drift)',
      lastAudit: '2026-08-10'
    },
    {
      id: 'ai-sys-02',
      name: 'Customer Support Copilot (LLM)',
      type: 'Generative AI (Fine-tuned)',
      riskTier: 'MEDIUM_RISK',
      deployment: 'Internal Pilot',
      impactAssessment: 'Completed (Approved)',
      fairnessScore: 'Guardrailed (NeMo)',
      driftAlerts: 'Zero Hallucination Flag',
      lastAudit: '2026-08-18'
    },
    {
      id: 'ai-sys-03',
      name: 'Automated AML Transaction Clusterer',
      type: 'Unsupervised Graph Neural Net',
      riskTier: 'HIGH_RISK',
      deployment: 'Production (Batch Daily)',
      impactAssessment: 'Under Review',
      fairnessScore: '0.91 Parity',
      driftAlerts: '1 Threshold Warning',
      lastAudit: '2026-07-25'
    },
    {
      id: 'ai-sys-04',
      name: 'Document OCR & Invoice Extractor',
      type: 'Vision Transformer',
      riskTier: 'LOW_RISK',
      deployment: 'Production (Serverless)',
      impactAssessment: 'Completed (Exempt)',
      fairnessScore: '99.2% Extraction Accuracy',
      driftAlerts: 'Stable',
      lastAudit: '2026-06-30'
    }
  ];

  return (
    <PageContainer id="iso42001-dashboard-module">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ISO/IEC 42001:2023
                  </span>
                  <span className="text-xs text-slate-400">Global AI Management System Standard</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                  Artificial Intelligence Management System (AIMS)
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Enterprise governance, algorithmic fairness, and lifecycle oversight for machine learning and generative AI systems deployed across <span className="text-white font-medium">{organizationService.getOrganizationName(currentTenant)}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="iso42001-open-aisia-btn"
              onClick={() => setActiveModule('iso42001_scoping')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center space-x-2 transition shadow-lg shadow-purple-950/40"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>AI-SIA Impact Wizard</span>
            </button>
            <button
              id="iso42001-open-suppliers-btn"
              onClick={() => setActiveModule('iso42001_scoping')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supplier ZDR Diligence</span>
            </button>
            <button
              id="iso42001-open-soa-btn"
              onClick={() => setActiveModule('iso42001_soa')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center space-x-2 transition"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Annex A SoA Generator</span>
            </button>
            <button
              id="iso42001-open-radar-btn"
              onClick={() => setActiveModule('compliance_maturity_scorecard')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-sky-600/30 hover:from-purple-600/50 hover:to-sky-600/50 text-white border border-purple-500/40 font-medium text-xs flex items-center space-x-2 transition cursor-pointer shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Maturity Radar (27k & 42k)</span>
            </button>
            <button
              id="iso42001-open-workbench-btn"
              onClick={() => setActiveModule('iso42001_workbench')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs flex items-center space-x-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
              <span>Workbench</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AIMS Compliance Score</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{complianceScore}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +14% vs Q1
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${complianceScore}%` }} />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">{implementedControls.length} of {applicableControls.length} controls fully operating</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">In-Scope AI Systems</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">4</span>
            <span className="text-xs text-slate-400">Active Models</span>
          </div>
          <div className="flex items-center space-x-2 mt-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">2 High-Risk</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">1 Med</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">1 Low</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">100% mapped to ISO 42001 lifecycle</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Impact Assessments (AI-SIA)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">75%</span>
            <span className="text-xs text-slate-400">3 of 4 Approved</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }} />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">Clause 6.1.2 & Annex A.5 compliance</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Algorithmic Parity & Bias</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">0.94</span>
            <span className="text-xs text-slate-400">Avg DI Ratio</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passes EEOC & ISO 42001 A.7.3 (&gt;0.80)</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">Zero unmitigated bias violations</span>
        </div>
      </div>

      {/* Automated Statement of Applicability (SoA) Spotlight Banner */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/40 border border-purple-500/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Normative Clause 6.1.3</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
                <span>Pre-Populated ISO 27001 Crosswalks</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Annex A.2 – A.10 (38/38 Controls)
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              Automated Statement of Applicability (SoA) Generator
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Dynamically constructs formal ISO/IEC 42001:2023 compliance documentation with automatic ISO/IEC 27001:2022 crosswalk citations, defensible inclusion/exclusion justifications, and cryptographic audit seals for {currentTenant?.name}.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span><strong>{applicableControls.length}</strong> Applicable</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span><strong>{implementedControls.length}</strong> Implemented</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span><strong>100%</strong> ISO 27001 ISMS Citation Coverage</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span><strong>Multi-Format</strong> (.MD, CSV, JSON, Attestation)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActiveModule('iso42001_soa')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-950/50"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Launch SoA Generator</span>
            </button>
            <button
              onClick={() => setActiveModule('iso42001_reporting')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>View Executive SoA Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9 Annex A Control Domains Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">ISO/IEC 42001:2023 Annex A Control Domains</h2>
            <p className="text-xs text-slate-400">Status breakdown across the 9 authoritative AIMS control categories (A.2 - A.10, 38 Controls)</p>
          </div>
          <button
            onClick={() => setActiveModule('iso42001_workbench')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center space-x-1 transition"
          >
            <span>View All 38 Controls</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {domains.map((dom) => {
            const Icon = dom.icon;
            const pct = Math.round((dom.implemented / dom.count) * 100);
            return (
              <div
                key={dom.code}
                onClick={() => setActiveModule('iso42001_workbench')}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border ${dom.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase">{dom.code}</span>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition">{dom.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{dom.implemented} of {dom.count} controls ready</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Inventory & Impact Assessment Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white">In-Scope AI Systems & Impact Assessments (AI-SIA)</h2>
            <p className="text-xs text-slate-400">Risk classification and governance tracking in accordance with ISO 42001 Clause 6.1.2 & Annex A.5</p>
          </div>
          <button
            onClick={() => setActiveModule('iso42001_scoping')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition"
          >
            <span>Manage AI Inventory</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">System / Model Name</th>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Deployment</th>
                <th className="py-3 px-4">AI-SIA Status</th>
                <th className="py-3 px-4">Bias / Fairness Metric</th>
                <th className="py-3 px-4">Drift & Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {aiSystems.map((sys) => (
                <tr key={sys.id} className="hover:bg-slate-850/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{sys.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{sys.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{sys.type}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sys.riskTier === 'HIGH_RISK' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      sys.riskTier === 'MEDIUM_RISK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {sys.riskTier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{sys.deployment}</td>
                  <td className="py-3.5 px-4">
                    <span className={`flex items-center space-x-1 ${sys.impactAssessment.includes('Approved') || sys.impactAssessment.includes('Exempt') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{sys.impactAssessment}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{sys.fairnessScore}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]">
                      {sys.driftAlerts}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clauses 4 to 10 Quick Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">ISO/IEC 42001:2023 Clauses 4 – 10 Status</h2>
            <p className="text-xs text-slate-400">Harmonized Management System Structure (MSS) evaluation</p>
          </div>
          <button
            onClick={() => setActiveModule('iso42001_workbench')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center space-x-1"
          >
            <span>Audit Workbench</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ISO42001_CLAUSES_4_10.map((clause) => (
            <div key={clause.clauseNumber} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Clause {clause.clauseNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  clause.complianceStatus === 'Compliant' ? 'bg-emerald-500/20 text-emerald-300' :
                  clause.complianceStatus === 'In Progress' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-rose-500/20 text-rose-300'
                }`}>
                  {clause.complianceStatus}
                </span>
              </div>
              <span className="text-xs font-semibold text-white block">{clause.title}</span>
              <span className="text-[10px] text-slate-500 mt-1 block">{clause.subClauses.length} mandatory requirements</span>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
