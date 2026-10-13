// Skanda BrandGuard — Automated WIPO UDRP / URS Legal Dispute Dossier Modal
// Chief Cyber Security Architect: ICANN Paragraph 4(a) Prongs & ISO 27037 Forensic Exhibit Pack
import React, { useState } from 'react';
import {
  FileText,
  Scale,
  ShieldAlert,
  Copy,
  Check,
  Download,
  Lock,
  ExternalLink,
  Calendar,
  Building,
  Globe
} from 'lucide-react';
import { BrandFinding, BrandProfile, WipoUdrpDossier } from '../../types/brandguard';
import { BrandGuardWipoService } from '../../services/brandguard/brandguardWipoService';
import { useGRC } from '../../context/GRCContext';

interface Props {
  finding: BrandFinding;
  brandProfile: BrandProfile;
  onClose: () => void;
}

export const BrandGuardWipoDossierModal: React.FC<Props> = ({
  finding,
  brandProfile,
  onClose
}) => {
  const { logAuditEvent } = useGRC();
  const [dossier] = useState<WipoUdrpDossier>(() =>
    BrandGuardWipoService.generateWipoDossier(finding, brandProfile)
  );
  const [copied, setCopied] = useState(false);

  const fullComplaintText = BrandGuardWipoService.generateComplaintText(dossier);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullComplaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    logAuditEvent('EXPORT', 'WIPO UDRP Legal Dossier', `Copied formal WIPO UDRP Complaint for <${finding.targetDomain}> to clipboard.`);
  };

  const handleDownload = () => {
    const blob = new Blob([fullComplaintText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WIPO_UDRP_Complaint_${finding.targetDomain}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAuditEvent('EXPORT', 'WIPO UDRP Download', `Downloaded court-ready WIPO dispute case dossier for <${finding.targetDomain}>.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full my-8 p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">
                  ICANN UDRP / URS COMPLAINT PACK
                </span>
                <span className="text-xs text-slate-400 font-mono">Dossier #{dossier.dossierId}</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">
                WIPO Arbitration & Mediation Center Legal Filing Dossier
              </h2>
              <p className="text-xs text-slate-400">
                Automated dispute package under ICANN Policy Paragraph 4(a) for domain:{' '}
                <span className="text-rose-400 font-bold font-mono">&lt;{finding.targetDomain}&gt;</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-bold"
          >
            ✕
          </button>
        </div>

        {/* 3 Mandatory Prongs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prong 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Prong 1 (Para 4(a)(i))</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                ESTABLISHED
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">Identical or Confusingly Similar</h4>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p>Phonetic Equivalence: <span className="font-bold text-indigo-300">{dossier.prong1_ConfusingSimilarity.phoneticEquivalenceScore}%</span></p>
              <p className="text-[10px] text-slate-400">{dossier.prong1_ConfusingSimilarity.visualCloningEvidenceSummary}</p>
            </div>
          </div>

          {/* Prong 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Prong 2 (Para 4(a)(ii))</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                ESTABLISHED
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">No Legitimate Rights / Interests</h4>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p>License Authorization: <span className="font-bold text-rose-400">NONE</span></p>
              <p className="text-[10px] text-slate-400">{dossier.prong2_LackOfLegitimateRights.findingEvidence}</p>
            </div>
          </div>

          {/* Prong 3 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Prong 3 (Para 4(a)(iii))</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                ESTABLISHED
              </span>
            </div>
            <h4 className="text-xs font-bold text-white">Registered & Used in Bad Faith</h4>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p>Credential Theft: <span className="font-bold text-rose-400">CONFIRMED</span></p>
              <p className="text-[10px] text-slate-400">{dossier.prong3_BadFaithRegistrationAndUse.evidenceNotes}</p>
            </div>
          </div>
        </div>

        {/* ISO 27037 Forensic Chain of Custody Seals */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 font-mono text-[11px] space-y-2">
          <div className="flex items-center space-x-2 text-indigo-300 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>ISO/IEC 27037 Digital Forensics Chain-of-Custody Seals</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500">SHA-256 Digest: </span>
              <span className="text-indigo-300">{dossier.iso27037ChainOfCustody.evidenceSha256Digest.slice(0, 24)}...</span>
            </div>
            <div>
              <span className="text-slate-500">RFC 3161 Token: </span>
              <span className="text-indigo-300">{dossier.iso27037ChainOfCustody.rfc3161TimestampToken}</span>
            </div>
            <div>
              <span className="text-slate-500">Forensics Agent IP: </span>
              <span className="text-slate-200">{dossier.iso27037ChainOfCustody.captureAgentIp}</span>
            </div>
            <div>
              <span className="text-slate-500">TLS Handshake Verified: </span>
              <span className="text-slate-200">{dossier.iso27037ChainOfCustody.tlsCipherSuite}</span>
            </div>
          </div>
        </div>

        {/* Formatted Complaint Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">WIPO Model Complaint Text:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Complaint'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Dossier (.TXT)</span>
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black font-mono text-[11px] text-slate-300 border border-slate-800 max-h-64 overflow-y-auto whitespace-pre">
            {fullComplaintText}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
