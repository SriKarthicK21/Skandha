import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  FileCheck,
  ShieldCheck,
  Download,
  CheckCircle2,
  Clock,
  Lock,
  KeyRound,
  FileText,
  Printer,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Hash,
  ExternalLink,
  Layers
} from 'lucide-react';
import {
  generateAuditorEvidenceBundle,
  INITIAL_POLICY_WAIVERS,
  INITIAL_COHORT_GROUPS,
  INITIAL_POLICY_DRIFTS
} from '../../services/isoPolicyGovernanceEngine';

export const Clause52And75AuditEvidenceHub: React.FC = () => {
  const { currentTenant, logAuditEvent } = useGRC();

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const docs = currentTenant?.generatedDocs || [];

  const cisoSignature = {
    signer: 'Sarah Jenkins, CISO',
    hash: 'sha256_ciso_9a8b7c6d5e4f3a2b1c0d_signed_20260115',
    timestamp: '2026-01-15T09:30:00.000Z'
  };

  const handleDownloadAuditorPackage = () => {
    setIsExporting(true);
    setTimeout(() => {
      const bundle = generateAuditorEvidenceBundle(
        currentTenant?.name || 'Fintech Horizon Global Pte Ltd',
        docs,
        INITIAL_POLICY_WAIVERS,
        INITIAL_COHORT_GROUPS,
        INITIAL_POLICY_DRIFTS,
        cisoSignature
      );

      // Create downloadable JSON file
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `ISO27001_2022_Clause5_2_and_7_5_Audit_Package_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsExporting(false);
      setExportSuccess(true);
      logAuditEvent(
        'EXPORT',
        `One-click ISO 27001 Clause 5.2 & 7.5 Auditor Evidence Package generated and exported.`,
        'PASS'
      );
      setTimeout(() => setExportSuccess(false), 4000);
    }, 800);
  };

  const handleCopyMasterChecksum = () => {
    navigator.clipboard.writeText(cisoSignature.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                  Pillar 5: Audit Evidence Automation
                </span>
                <span className="text-xs text-slate-500">Clause 5.2 &amp; Clause 7.5 Compliance</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Immutable Audit Trails &amp; One-Click Audit Package Compilation
              </h3>
            </div>
          </div>

          <button
            onClick={handleDownloadAuditorPackage}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Compiling Package...' : exportSuccess ? 'Package Downloaded!' : 'Compile 1-Click Audit Package'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          <strong>The Problem:</strong> Lead auditors scrutinize Clause 5.2 (Policy formulation and leadership commitment) and Clause 7.5 (Documented information version control and integrity). Decentralized Google Docs and un-timestamped PDFs routinely fail audit due to missing approval chains.
          <br />
          <strong>The Fix:</strong> Cryptographically hash all documents (SHA-256), enforce multi-stage digital sign-offs (Author &rarr; Tech &rarr; Legal &rarr; CISO), and compile an auditor-ready bundle with one click.
        </p>
      </div>

      {/* SECTION 1: Clause 5.2 Policy Formulation & Leadership Commitment */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>ISO 27001 Clause 5.2: Top Management Policy Mandate</span>
            </h4>
            <p className="text-xs text-slate-500">
              Formal declaration demonstrating executive leadership commitment, business purpose alignment, and zero-tolerance bypass.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Formally Ratified
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-sans text-xs leading-relaxed text-slate-800">
          <p>
            &ldquo;Top Management and the Board of Directors of <strong>{currentTenant?.name || 'Fintech Horizon Global'}</strong> hereby establish the Information Security Policy suite as the definitive operating baseline for all corporate data processing, cloud infrastructure, and personnel. Information security is recognized not merely as an IT function, but as a strategic enabler of business resilience, customer trust, and regulatory compliance. Deliberate circumvention of security controls is strictly prohibited.&rdquo;
          </p>
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 font-sans text-[11px] text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>CISO Sign-Off: <strong className="text-slate-800">{cisoSignature.signer}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-slate-800">{new Date(cisoSignature.timestamp).toLocaleDateString()}</strong></span>
            </div>
            <div className="flex items-center space-x-1 font-mono">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{cisoSignature.hash.substring(0, 32)}...</span>
              <button
                onClick={handleCopyMasterChecksum}
                className="p-1 text-indigo-600 hover:text-indigo-800"
                title="Copy Signature Hash"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Clause 7.5 Documented Information Ledger */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Clause 7.5 Documented Information &amp; Cryptographic Integrity Ledger</span>
            </h4>
            <p className="text-xs text-slate-500">
              Audit-ready inventory of active policies with SHA-256 checksums, version increments, and authorized approval chains.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {docs.length} Controlled Documents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Document Code &amp; Title</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Owner / Approver</th>
                <th className="py-2.5 px-3">Review Cycle</th>
                <th className="py-2.5 px-3">SHA-256 Content Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{d.title}</div>
                    <span className="font-mono text-[10px] text-indigo-700 font-semibold">{d.docCode}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {d.version || 'v2.0'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {d.status || 'PUBLISHED'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{d.owner}</div>
                    <div className="text-[11px] text-slate-500">{d.approver}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {d.reviewCycle || 'Annual'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                    {d.contentSha256 ? d.contentSha256.substring(0, 24) : `sha256_${d.id.substring(0, 16)}`}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
