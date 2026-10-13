import React from 'react';
import { FindingCAPARecord } from '../../types';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  Printer,
  X,
  FileText,
  Calendar,
  Building,
  UserCheck,
  Hash
} from 'lucide-react';

interface CapaAuditCertificateModalProps {
  finding: FindingCAPARecord;
  companyName: string;
  onClose: () => void;
  theme?: string;
}

export const CapaAuditCertificateModal: React.FC<CapaAuditCertificateModalProps> = ({
  finding,
  companyName,
  onClose,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';
  const val = finding.independentAuditValidation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold tracking-wide uppercase text-white">
              Official CAPA Resolution & Independent Verification Certificate
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs print:p-0 print:text-black">
          {/* Certificate Header Banner */}
          <div className="text-center border-b-2 border-emerald-500/40 pb-6 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>ISO/IEC 27001:2022 Clause 10.2 & ISO 19011:2018 ATTESTATION</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white print:text-black uppercase">
              Corrective & Preventive Action Closure Record
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto text-[11px]">
              This document serves as an immutable, cryptographically verifiable record of nonconformity resolution, 5-Whys root cause elimination, and independent audit effectiveness testing.
            </p>
            <div className="flex justify-center items-center space-x-4 pt-2 font-mono text-[11px] text-slate-400">
              <span>Organization: <strong className="text-slate-200">{companyName}</strong></span>
              <span>•</span>
              <span>Finding Ref: <strong className="text-emerald-400">{finding.findingCode}</strong></span>
              <span>•</span>
              <span>Certificate ID: <strong className="text-sky-400">{val?.validationId || `CERT-${finding.findingCode}-VERIFIED`}</strong></span>
            </div>
          </div>

          {/* Section 1: Nonconformity & Audit Linkage */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-sky-400" />
              <span>1. Nonconformity Identification & Context</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Finding Code</span>
                <span className="font-mono font-bold text-sky-400">{finding.findingCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Audit Source</span>
                <span className="font-semibold text-slate-200">{finding.source.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Classification</span>
                <span className="font-bold text-rose-400">{finding.severity}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Clause / Control</span>
                <span className="font-mono text-slate-200">{finding.clauseOrControl}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Responsible Department</span>
                <span className="text-slate-200">{finding.department}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Remediation Action Owner</span>
                <span className="text-slate-200">{finding.capaPlan.owner}</span>
              </div>
              <div className="col-span-4 pt-1">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Deficiency Observed</span>
                <p className="text-slate-300 leading-relaxed mt-0.5">{finding.description}</p>
              </div>
            </div>
          </div>

          {/* Section 2: 5-Whys Root Cause Analysis */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex items-center space-x-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Root Cause Analysis (5-Whys Methodology)</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              {finding.rootCauseAnalysis.fiveWhysChain && finding.rootCauseAnalysis.fiveWhysChain.length > 0 ? (
                <div className="space-y-1.5">
                  {finding.rootCauseAnalysis.fiveWhysChain.map(w => (
                    <div key={w.whyNumber} className="flex items-start space-x-2 text-[11px]">
                      <span className="font-mono font-bold text-amber-400 shrink-0 w-16">Why #{w.whyNumber}:</span>
                      <div className="flex-1">
                        <span className="text-slate-400 italic">"{w.question}"</span>
                        <div className="text-slate-200 mt-0.5 font-medium">↳ {w.answer}</div>
                      </div>
                      {w.category && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {w.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : finding.rootCauseAnalysis.whys && finding.rootCauseAnalysis.whys.length > 0 ? (
                <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300">
                  {finding.rootCauseAnalysis.whys.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              ) : null}

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-amber-400 block uppercase font-bold">Synthesized Root Cause Statement:</span>
                <p className="text-slate-200 font-semibold mt-0.5 leading-relaxed">
                  {finding.rootCauseAnalysis.rootCauseStatement}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Dual-Track Corrective & Preventive Action */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Corrective & Preventive Action (CAPA) Plan</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                  Corrective Action (Immediate Containment)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {finding.capaPlan.correctiveAction}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Preventive Action (Systemic Recurrence Prevention)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {finding.capaPlan.preventiveAction}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Attached Objective Evidence */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. Attached Objective Evidence & Verification Artifacts</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-[11px] text-slate-300">
                <strong>Evidence Mandate:</strong> {finding.capaPlan.evidenceRequired}
              </div>
              {finding.capaPlan.attachedEvidenceArtifacts && finding.capaPlan.attachedEvidenceArtifacts.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {finding.capaPlan.attachedEvidenceArtifacts.map(art => (
                    <div key={art.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px]">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-slate-200 font-bold truncate">{art.title}</span>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0 text-slate-400">
                        {art.fileSize && <span>{art.fileSize}</span>}
                        {art.hash && <span className="text-slate-500">SHA256:{art.hash.substring(0, 12)}...</span>}
                        <span className="text-emerald-400">VERIFIED</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Artifacts verified directly during auditor retest inspection.
                </p>
              )}
            </div>
          </div>

          {/* Section 5: Independent Audit Validation & Formal Sign-Off Box */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/30 pb-1 flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>5. Independent Audit Validation & Effectiveness Testing (Clause 10.2)</span>
            </h4>

            {val ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border-2 border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>OPERATING EFFECTIVENESS: {val.testOfOperatingEffectiveness}</span>
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      Ref: {val.auditProgramRef}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Validated: {new Date(val.validatedAt || val.validationDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Independent Auditor</span>
                    <span className="text-slate-200 font-semibold">{val.auditorName}</span>
                    <span className="text-slate-400 text-[10px] block">{val.auditorRole}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Sampling Methodology & Size</span>
                    <span className="text-slate-200">{val.samplingMethodology}</span>
                    <span className="text-slate-400 text-[10px] block">Sample Population Inspected: {val.sampleSizeInspected} units</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 text-[11px] space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Auditor Retest Observations:</span>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{val.auditorObservations}"
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 text-[11px] space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Effectiveness Conclusion:</span>
                  <p className="text-emerald-300 font-semibold leading-relaxed">
                    {val.effectivenessConclusion}
                  </p>
                </div>

                {/* Digital Signature Hash Block */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Cryptographic Audit Signature Seal</span>
                    <span className="text-emerald-400 font-bold break-all">{val.digitalSignatureHash}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                      INDEPENDENCE ATTESTED
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-300 text-center">
                <span className="font-bold">Awaiting Independent Audit Validation.</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  This finding cannot be formally closed until an independent audit validation step is executed and signed off.
                </p>
              </div>
            )}
          </div>

          {/* Certificate Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>SKANDA GRC Continuous Compliance & Audit Platform</span>
            <span>Generated on {new Date().toISOString().split('T')[0]}</span>
            <span>Status: {finding.status.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
