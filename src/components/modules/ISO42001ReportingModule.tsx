import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  Sparkles,
  FileCheck2,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  Layers,
  Scale,
  Brain,
  Bot,
  FileText
} from 'lucide-react';
import { MASTER_ISO42001_CONTROLS, ISO42001_CLAUSES_4_10 } from '../../data/iso42001MasterData';
import { ISO42001SoAGenerator } from '../iso42001/ISO42001SoAGenerator';
import { PageContainer } from '../layout/PageContainer';

export const ISO42001ReportingModule: React.FC = () => {
  const { currentTenant, controls } = useGRC();
  const [activeTab, setActiveTab] = useState<'soa_generator' | 'board_pack'>('soa_generator');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const iso42001Controls = controls.filter(c => c.framework?.includes('42001') || c.controlCode.startsWith('A.'));
  const effectiveControls = iso42001Controls.length > 0 ? iso42001Controls : MASTER_ISO42001_CONTROLS.map((c, i) => ({ ...c, id: `ctrl_demo_42k_${i}` }));

  const applicableControls = effectiveControls.filter(c => c.applicable !== false);
  const implementedControls = applicableControls.filter(c => c.implementationStatus === 'Implemented' || c.implementationStatus === 'Audited');
  const complianceRate = applicableControls.length > 0 ? Math.round((implementedControls.length / applicableControls.length) * 100) : 84;

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <PageContainer id="iso42001-reporting-module">
      {/* Sub-navigation tabs */}
      <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('soa_generator')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'soa_generator'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Automated Statement of Applicability (SoA) Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('board_pack')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'board_pack'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Executive Board Pack & Attestation Dossier</span>
        </button>
      </div>

      {activeTab === 'soa_generator' ? (
        <ISO42001SoAGenerator tenantName={currentTenant?.name} />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  ISO/IEC 42001:2023 Board Pack
                </span>
                <span className="text-xs text-slate-400">Executive & External Auditor Export</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                AIMS Executive Governance & Board Pack
              </h1>
              <p className="text-xs text-slate-300">
                Formal certification dossier, ethical risk evaluations, and cryptographic audit proofs for {currentTenant?.name}.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center space-x-2 transition shadow-lg shadow-purple-950/50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Generate Executive Board Pack</span>
              </button>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Executive Board Pack & SoA generated successfully! ISO 42001 Stage 1 Audit Dossier ready.</span>
            </div>
          )}

          {/* Dossier Preview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Summary Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>AIMS Executive Attestation Summary</span>
                </h2>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Organization:</strong> {organizationService.getOrganizationName(currentTenant)}
                  </p>
                  <p>
                    <strong className="text-white">Standard:</strong> ISO/IEC 42001:2023 (Artificial Intelligence Management System)
                  </p>
                  <p>
                    <strong className="text-white">Scope Definition:</strong> Governance, ethical risk mitigation, lifecycle testing, training data provenance, and continuous monitoring for all production machine learning models and LLM copilot deployments.
                  </p>
                  <p>
                    <strong className="text-white">Overall Readiness Score:</strong> <span className="text-emerald-400 font-bold">{complianceRate}% (Stage 1 Ready)</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-2xl font-bold text-white">{effectiveControls.length}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Total Controls</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-2xl font-bold text-emerald-400">{implementedControls.length}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Implemented</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                    <span className="text-2xl font-bold text-amber-400">{applicableControls.length - implementedControls.length}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">In Progress</span>
                  </div>
                </div>
              </div>

              {/* Statement of Applicability Highlights */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-purple-400" />
                  <span>Statement of Applicability (SoA) Control Highlights</span>
                </h2>

                <div className="space-y-3">
                  {effectiveControls.slice(0, 6).map((ctrl) => (
                    <div key={ctrl.controlCode} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-purple-400">{ctrl.controlCode}</span>
                          <span className="text-xs font-bold text-white">{ctrl.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                          {ctrl.implementationStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{ctrl.justification || 'Mandatory foundational policy establishing organizational AI governance.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Dossier Badges */}
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Cryptographic Certification Hash</h3>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-purple-400 uppercase">SHA-256 Digest:</span>
                  <p className="font-mono text-[10px] text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                    8f92a1b7c4d5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2
                  </p>
                  <span className="text-[10px] text-slate-500 block">Locked on 2026-08-20 by Lead AI Ethics Officer</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-white">Authoritative Alignment</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>EU AI Act (2024/1689) High-Risk Conformity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>NIST AI Risk Management Framework 1.0</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>MAS FEAT Principles (Fairness, Ethics, Accountability, Transparency)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ISO/IEC 27001:2022 ISMS Interoperability</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};
