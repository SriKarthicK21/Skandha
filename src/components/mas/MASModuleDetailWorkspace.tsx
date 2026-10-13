import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Flame,
  Database,
  Truck,
  Layers,
  Code2,
  SlidersHorizontal,
  Server,
  Lock,
  Key,
  Network,
  Activity,
  Target,
  Globe,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ExternalLink,
  UploadCloud,
  FileText,
  Clock,
  Sparkles,
  Info,
  Calendar,
  AlertOctagon,
  Award
} from 'lucide-react';
import { MAS_TRM_17_MODULES, INITIAL_MAS_CRITICAL_SYSTEMS, INITIAL_MAS_TECH_RISKS } from '../../data/masTrmModulesData';
import { MASModuleMetadata } from '../../types/masTrmFrameworkTypes';
import { useGRC } from '../../context/GRCContext';

interface Props {
  selectedModuleId: string;
  onBackToDashboard: () => void;
  onNavigateToModule?: (moduleId: string) => void;
}

export const MASModuleDetailWorkspace: React.FC<Props> = ({
  selectedModuleId,
  onBackToDashboard,
  onNavigateToModule
}) => {
  const { assets, vendors, evidence, risks, findings } = useGRC();

  const moduleData: MASModuleMetadata =
    MAS_TRM_17_MODULES.find(m => m.id === selectedModuleId || m.moduleKey === selectedModuleId || m.number === selectedModuleId) ||
    MAS_TRM_17_MODULES[0];

  const [activeTab, setActiveTab] = useState<'requirements' | 'assets_systems' | 'risks' | 'evidence'>('requirements');

  // Related risks
  const relatedRisks = INITIAL_MAS_TECH_RISKS.filter(r =>
    r.masTrmSection.toLowerCase().includes(moduleData.trmSection.toLowerCase().replace('section ', ''))
  );

  // Icon selector
  const renderIcon = () => {
    switch (moduleData.icon) {
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-rose-400" />;
      case 'Flame': return <Flame className="w-6 h-6 text-orange-400" />;
      case 'Database': return <Database className="w-6 h-6 text-indigo-400" />;
      case 'Truck': return <Truck className="w-6 h-6 text-blue-400" />;
      case 'Layers': return <Layers className="w-6 h-6 text-purple-400" />;
      case 'Code2': return <Code2 className="w-6 h-6 text-emerald-400" />;
      case 'SlidersHorizontal': return <SlidersHorizontal className="w-6 h-6 text-sky-400" />;
      case 'Server': return <Server className="w-6 h-6 text-rose-400" />;
      case 'Lock': return <Lock className="w-6 h-6 text-amber-400" />;
      case 'Key': return <Key className="w-6 h-6 text-yellow-400" />;
      case 'Network': return <Network className="w-6 h-6 text-cyan-400" />;
      case 'Activity': return <Activity className="w-6 h-6 text-emerald-400" />;
      case 'Target': return <Target className="w-6 h-6 text-rose-400" />;
      case 'Globe': return <Globe className="w-6 h-6 text-sky-400" />;
      case 'FileCheck': return <FileCheck className="w-6 h-6 text-teal-400" />;
      default: return <ShieldCheck className="w-6 h-6 text-rose-400" />;
    }
  };

  return (
    <div id="mas-module-detail-workspace" className="space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/60 px-3.5 py-1.5 rounded-lg border border-slate-700/60"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-rose-400" />
          Back to MAS Compliance Flow Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">FRAMEWORK:</span>
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            MAS TRM Guidelines 2021
          </span>
        </div>
      </div>

      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-rose-300 border border-slate-700">
                  MODULE {moduleData.number}
                </span>
                <span className="text-xs text-slate-400">{moduleData.trmSection}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {moduleData.criticality} CRITICALITY
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{moduleData.title}</h1>
              <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
                {moduleData.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 shrink-0">
            <div className="text-center">
              <span className="text-[11px] text-slate-400 block">Total Requirements</span>
              <strong className="text-xl font-bold text-white">{moduleData.totalRequirements}</strong>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <span className="text-[11px] text-slate-400 block">Implemented</span>
              <strong className="text-xl font-bold text-emerald-400">{moduleData.implementedCount}</strong>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <span className="text-[11px] text-slate-400 block">In Progress</span>
              <strong className="text-xl font-bold text-amber-400">{moduleData.inProgressCount}</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              activeTab === 'requirements'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Statutory Requirements & Controls ({moduleData.totalRequirements})
          </button>
          <button
            onClick={() => setActiveTab('assets_systems')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              activeTab === 'assets_systems'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Bound Assets & Critical Systems ({INITIAL_MAS_CRITICAL_SYSTEMS.length})
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              activeTab === 'risks'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Technology Risk Register ({relatedRisks.length > 0 ? relatedRisks.length : 1})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              activeTab === 'evidence'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            Unified Evidence Vault
          </button>
        </div>
      </div>

      {/* Tab 1: Requirements & Controls */}
      {activeTab === 'requirements' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">MAS TRM 2021 Specific Controls</h3>
              <p className="text-xs text-slate-400">
                Grounding citations, supervisory guidance, and four-eyes evidence requirements.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Status: <strong className="text-emerald-400">82% Verified</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            <div className="p-4 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-rose-300 border border-slate-700">
                      {moduleData.trmSection}.1
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      Mandatory Policy & Procedural Governance Standards
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      COMPLIANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-4xl">
                    Establish comprehensive technology risk standards approved by executive leadership,
                    incorporating zero trust network architecture, defense-in-depth, and annual review cycles.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      Required Evidence: <strong>Approved Security Policy v3.2 (Signed by CISO)</strong>
                    </span>
                    <span className="flex items-center gap-1 text-indigo-300">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Reused in ISO 27001: <strong>Clause 5.2 (Policy)</strong>
                    </span>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white border border-slate-700 shrink-0">
                  Inspect Evidence
                </button>
              </div>
            </div>

            <div className="p-4 hover:bg-slate-800/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-rose-300 border border-slate-700">
                      {moduleData.trmSection}.2
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      Technical Control Implementation & Independent Verification
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      IN PROGRESS (92%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-4xl">
                    Automated technical enforcement across cloud, on-premises, and endpoints with immutable
                    session recording, log retention for 12 months minimum, and four-eyes access reviews.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      Required Evidence: <strong>Technical Configuration Audit Logs & SIEM Ingestion Proof</strong>
                    </span>
                    <span className="flex items-center gap-1 text-indigo-300">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Reused in ISO 27001: <strong>A.8.2 / A.8.16</strong>
                    </span>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white border border-slate-700 shrink-0">
                  Inspect Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assets & Critical Systems */}
      {activeTab === 'assets_systems' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Bound Designated Critical Systems</h3>
            <span className="text-xs text-slate-400">
              {INITIAL_MAS_CRITICAL_SYSTEMS.length} Systems registered under MAS TRM Scope
            </span>
          </div>

          <div className="divide-y divide-slate-800">
            {INITIAL_MAS_CRITICAL_SYSTEMS.slice(0, 4).map(sys => (
              <div key={sys.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-rose-300 border border-slate-700">
                        {sys.id}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{sys.systemName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300">
                        {sys.systemClassification}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-2">Service: {sys.businessService}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span>RTO: <strong className="text-rose-400">&le; {sys.rtoTargetHours} Hours</strong></span>
                      <span>RPO: <strong className="text-amber-400">&le; {sys.rpoTargetHours} Hours</strong></span>
                      <span>Next DR Drill: <strong className="text-white">{sys.nextRecoveryTestDate}</strong></span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sys.testStatus === 'Compliant'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : sys.testStatus === 'Due Soon'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {sys.testStatus}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">
                    {sys.hostingModel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Risk Register */}
      {activeTab === 'risks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">14-Category Technology Risk Register</h3>
            <span className="text-xs text-slate-400">Asset &rarr; Threat &rarr; Vulnerability &rarr; Residual Workflow</span>
          </div>

          <div className="divide-y divide-slate-800">
            {INITIAL_MAS_TECH_RISKS.map(rsk => (
              <div key={rsk.id} className="p-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-rose-300 border border-slate-700">
                        {rsk.riskCode}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{rsk.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300">
                        {rsk.category} Risk
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      <strong>Threat:</strong> {rsk.threatDescription}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <strong>Vulnerability:</strong> {rsk.vulnerabilityDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                      <span className="text-slate-300">
                        Inherent Score: <strong className="text-rose-400">{rsk.inherentScore} / 25</strong>
                      </span>
                      <span className="text-slate-300">
                        Residual Score: <strong className="text-emerald-400">{rsk.residualScore} / 25</strong>
                      </span>
                      <span className="text-slate-300">
                        Owner: <strong className="text-white">{rsk.owner}</strong>
                      </span>
                      <span className="text-slate-300">
                        Target Date: <strong className="text-white">{rsk.targetDate}</strong>
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {rsk.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Unified Evidence Vault */}
      {activeTab === 'evidence' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Unified Multi-Framework Evidence Vault</h3>
              <p className="text-xs text-slate-400">
                Single audit proof satisfying both MAS TRM ({moduleData.trmSection}) and ISO 27001 requirements.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Evidence Artifact
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <strong className="text-sm text-white block">
                  Mandiant_FY26_Production_Penetration_Test_Final.pdf
                </strong>
                <span className="text-xs text-slate-400">
                  Uploaded: 14 Sep 2026 &bull; Size: 4.2 MB &bull; SHA-256: 7f8a...9c2e
                </span>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified & Reused in 3 Frameworks
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
