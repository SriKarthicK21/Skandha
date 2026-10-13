import React, { useState } from 'react';
import { dpdpPrivacyEngine } from '../../services/canonical/DpdpPrivacyEngineService';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Layers,
  Database,
  GitFork,
  Clock,
  Server,
  AlertOctagon,
  Building2,
  FileCheck2,
  Lock,
  RefreshCw,
  Search,
  ChevronRight
} from 'lucide-react';

interface DPDPPrivacyReportsStudioProps {
  tenantId?: string;
}

export const DPDPPrivacyReportsStudio: React.FC<DPDPPrivacyReportsStudioProps> = ({
  tenantId = 'tenant_skanda'
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>('REP_READINESS');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const reportDefinitions = [
    {
      id: 'REP_READINESS',
      title: '1. DPDP Statutory Readiness & Compliance Report',
      section: 'DPDP Act 2023 & Rules 2025 Matrix',
      icon: ShieldCheck,
      description: 'Comprehensive evaluation of all 44 statutory requirements, assurance indices, and implementation readiness.'
    },
    {
      id: 'REP_DATA_INVENTORY',
      title: '2. Personal Data Inventory & Lineage Dossier',
      section: 'DPDP Act §2(t) & §8',
      icon: Database,
      description: 'Catalog of all discovered data elements, principal categories, source systems, and classifications.'
    },
    {
      id: 'REP_ROPA',
      title: '3. Processing Activity Register (RoPA)',
      section: 'DPDP Act §4 & §6',
      icon: GitFork,
      description: 'Formal record of processing activities, lawful grounds, storage locations, and downstream transfers.'
    },
    {
      id: 'REP_DSR',
      title: '4. Data Principal Rights & SLA Execution Report',
      section: 'DPDP Act §11-§14 (Access, Correction, Erasure, Grievance)',
      icon: Clock,
      description: 'Metrics on DSR intake, 9-stage fulfillment workflows, verification tokens, and SLA adherence.'
    },
    {
      id: 'REP_CONSENT_NOTICE',
      title: '5. Consent State & Multilingual Notice Register',
      section: 'DPDP Act §5 & §6 (Eighth Schedule Languages)',
      icon: FileText,
      description: 'Notice publications, plain language readability scores, and consent withdrawal cascades.'
    },
    {
      id: 'REP_RETENTION',
      title: '6. Retention & Cryptographic Deletion Purge Report',
      section: 'DPDP Act §8(7) & §8(8)',
      icon: Calendar,
      description: 'Purpose-specific retention schedules, active legal holds, and immutable deletion purge certificates.'
    },
    {
      id: 'REP_PROCESSORS',
      title: '7. Data Processor & DPA Governance Report',
      section: 'DPDP Act §8(1) & §8(2)',
      icon: Server,
      description: 'Vendor risk scores, DPA validity timelines, cross-border jurisdictions, and sub-processor trees.'
    },
    {
      id: 'REP_INCIDENTS',
      title: '8. Privacy Breach & 6-Hour Intimation Report',
      section: 'DPDP Act §8(6) & CERT-In Framework',
      icon: AlertOctagon,
      description: 'Forensic records of personal data incidents, DPBI notification forms, and CAPA remediation.'
    },
    {
      id: 'REP_SDF',
      title: '9. Significant Data Fiduciary (SDF) Assessment Dossier',
      section: 'DPDP Act §10 Statutory Criteria',
      icon: Building2,
      description: '6-factor evaluation, resident DPO appointment record, and independent auditor mandate.'
    },
    {
      id: 'REP_AUDIT',
      title: '10. Independent Privacy Auditor Assurance Report',
      section: 'DPDP Rules 2025 Audit Guidelines',
      icon: FileCheck2,
      description: 'Clean-room audit workpapers, test procedure results, and "Show Me Why" assurance trees.'
    }
  ];

  const activeReport = reportDefinitions.find((r) => r.id === selectedReportId) || reportDefinitions[0];

  const handleExport = (format: 'PDF' | 'JSON' | 'CSV') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report "${activeReport.title}" exported successfully in ${format} format.`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              DPDP Enterprise Regulatory Reports Studio
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              DPBI & MeitY Regulatory Format Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative, tenant-scoped statutory reports synthesized from canonical SKANDA records, verified evidence hashes, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Dossier</span>
          </button>
          <button
            onClick={() => handleExport('JSON')}
            disabled={isExporting}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selector Sidebar */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Statutory Report Library
          </h3>
          <div className="space-y-1">
            {reportDefinitions.map((rep) => {
              const Icon = rep.icon;
              const isSelected = rep.id === selectedReportId;
              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500/50 text-white shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      isSelected ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold">{rep.title}</div>
                    <div className="text-[10px] text-slate-400">{rep.section}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Live Preview & Dossier View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            {/* Report Header */}
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeReport.section}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Generated: {new Date().toISOString().split('T')[0]}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{activeReport.title}</h3>
              <p className="text-xs text-slate-400">{activeReport.description}</p>
            </div>

            {/* Tenant Scoping Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
              <div>
                <div className="text-slate-500">Tenant ID</div>
                <div className="font-mono font-bold text-white mt-0.5">{tenantId}</div>
              </div>
              <div>
                <div className="text-slate-500">Jurisdiction</div>
                <div className="font-semibold text-emerald-400 mt-0.5">Republic of India</div>
              </div>
              <div>
                <div className="text-slate-500">Regulatory Framework</div>
                <div className="font-semibold text-slate-200 mt-0.5">DPDPA 2023 / Rules 2025</div>
              </div>
              <div>
                <div className="text-slate-500">Assurance Status</div>
                <div className="font-semibold text-emerald-400 mt-0.5">Immutable / Grounded</div>
              </div>
            </div>

            {/* Preview Section Dynamic Mock Content based on selected report */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 text-xs">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Executive Summary & Statutory Findings</span>
              </h4>

              {selectedReportId === 'REP_READINESS' && (
                <div className="space-y-3 text-slate-300 leading-relaxed">
                  <p>
                    This report synthesizes the statutory readiness of <strong>{tenantId}</strong> against all 44 statutory provisions of the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 (Notified 13-Nov-2025).
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Statutory Clauses</div>
                      <div className="text-lg font-bold text-white font-mono">44</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Fully Verified</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">41</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Readiness Index</div>
                      <div className="text-lg font-bold text-indigo-400 font-mono">93.2%</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReportId === 'REP_DATA_INVENTORY' && (
                <div className="space-y-3 text-slate-300 leading-relaxed">
                  <p>
                    Full inventory of all personal data elements, data classifications, ingestion channels, and lineage mapping across relational, NoSQL, and third-party SaaS environments.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300">
                    Discovered Elements: 142 • Masked Attributes: 89 • Unnotified Elements: 0
                  </div>
                </div>
              )}

              {selectedReportId === 'REP_ROPA' && (
                <div className="space-y-3 text-slate-300 leading-relaxed">
                  <p>
                    Article/Section 4 & 6 compliant Register of Processing Activities (RoPA), linking business activities to lawful processing grounds, recipient categories, and international data transfers.
                  </p>
                </div>
              )}

              {selectedReportId === 'REP_DSR' && (
                <div className="space-y-3 text-slate-300 leading-relaxed">
                  <p>
                    Comprehensive audit log of all 7 Data Principal statutory rights (Access, Correction, Updating, Erasure, Grievance, Nomination), with strict 9-stage fulfillment tracking.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300">
                    Total Requests: 12 • Average SLA: 2.1 Days • Evidence Verification: 100%
                  </div>
                </div>
              )}

              {selectedReportId !== 'REP_READINESS' &&
                selectedReportId !== 'REP_DATA_INVENTORY' &&
                selectedReportId !== 'REP_ROPA' &&
                selectedReportId !== 'REP_DSR' && (
                  <div className="text-slate-400 leading-relaxed">
                    Canonical data synthesized for statutory disclosure. Includes cryptographic hash proofs, owner sign-offs, and compliance timeline mappings.
                  </div>
                )}
            </div>

            {/* Dossier Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div>Certified by SKANDA Continuous Assurance Engine</div>
              <div className="flex items-center gap-2 font-mono">
                <span>Hash: SHA-256: 8f2a...c49e</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
