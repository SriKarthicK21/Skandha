import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  Search,
  Hash,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Lock,
  Calendar,
  Check
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { computeSHA256 } from '../../utils/crypto';

interface SmartEvidenceAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetControlCode?: string;
  targetControlTitle?: string;
  onEvidenceLinked?: (evidenceRecord: any) => void;
}

interface AnalysisStep {
  stepNumber: number;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'WARNING';
  detail: string;
}

export const SmartEvidenceAnalyzerModal: React.FC<SmartEvidenceAnalyzerModalProps> = ({
  isOpen,
  onClose,
  targetControlCode = 'A.5.15',
  targetControlTitle = 'Access Control & Privileged Access Rights',
  onEvidenceLinked
}) => {
  const { theme, currentTenant } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const [extractedMetadata, setExtractedMetadata] = useState<{
    docTitle: string;
    documentType: string;
    author: string;
    reviewPeriod: string;
    approvalDate: string;
    expiryDate: string;
    accountsReviewed: number;
    exceptionsFound: number;
    sha256Hash: string;
    validationScore: number;
  } | null>(null);

  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { stepNumber: 1, label: 'Read Document Stream', status: 'PENDING', detail: 'Ingesting binary payload & verifying file integrity' },
    { stepNumber: 2, label: 'OCR & Text Extraction', status: 'PENDING', detail: 'Parsing text layers, tables, and signature stamps' },
    { stepNumber: 3, label: 'Control Requirement Validation', status: 'PENDING', detail: 'Comparing against ISO 27001:2022 A.5.15 & SOC 2 criteria' },
    { stepNumber: 4, label: 'Missing Information Check', status: 'PENDING', detail: 'Checking required signatures, dates, and reviewer sign-offs' },
    { stepNumber: 5, label: 'Determine Validity Period', status: 'PENDING', detail: 'Verifying evidence falls inside 90-day active audit period' },
    { stepNumber: 6, label: 'Check Expiry Date', status: 'PENDING', detail: 'Calculating freshness window & scheduling renewal alert' },
    { stepNumber: 7, label: 'Potential Gap Detection', status: 'PENDING', detail: 'Screening for unmanaged privileged or orphaned accounts' },
    { stepNumber: 8, label: 'Link Evidence to Control', status: 'PENDING', detail: 'Associating artifact with A.5.15, SOC 2 CC6.1, MAS TRM 8.1' },
    { stepNumber: 9, label: 'Maintain Cryptographic Audit Trail', status: 'PENDING', detail: 'Writing SHA-256 hash to immutable WORM ledger' }
  ]);

  if (!isOpen) return null;

  const handleSimulatedFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Compute real hash
    const fakeContent = `${file.name}-${file.size}-${Date.now()}`;
    const fileHash = await computeSHA256(fakeContent);

    // Execute 9-step simulation
    for (let i = 0; i < 9; i++) {
      await new Promise(r => setTimeout(r, 260));
      setAnalysisSteps(prev =>
        prev.map((step, idx) => {
          if (idx < i) return { ...step, status: 'PASSED' };
          if (idx === i) return { ...step, status: 'RUNNING' };
          return step;
        })
      );
    }

    setAnalysisSteps(prev => prev.map(s => ({ ...s, status: 'PASSED' })));
    setIsAnalyzing(false);
    setAnalysisComplete(true);

    const metadata = {
      docTitle: file.name.replace(/\.[^/.]+$/, ''),
      documentType: 'Quarterly Privileged Access Review Sign-Off',
      author: 'Marcus Vance (VP Information Security)',
      reviewPeriod: 'Q2 2026 (Apr 1 - Jun 30, 2026)',
      approvalDate: '2026-07-02',
      expiryDate: '2026-10-02 (Fresh for 84 days)',
      accountsReviewed: 48,
      exceptionsFound: 2,
      sha256Hash: fileHash,
      validationScore: 98
    };

    setExtractedMetadata(metadata);
  };

  const handleConfirmAndLink = () => {
    showToast({
      title: 'Evidence Validated & Linked',
      message: `Artifact linked to ${targetControlCode} with SHA-256 verification.`,
      type: 'success'
    });
    if (onEvidenceLinked && extractedMetadata) {
      onEvidenceLinked(extractedMetadata);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-8 transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Smart Evidence Intelligence
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                  Target: {targetControlCode}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">
                Automated Evidence Verification & Control Linkage
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Required Evidence Specification Checklist */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-blue-50/70 border-blue-200 text-slate-800' : 'bg-blue-950/30 border-blue-900/60 text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4" />
              <span>Required Evidence Checklist for {targetControlCode}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-200/50">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>User access review report</span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-200/50">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Manager approval signature</span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-200/50">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>90-day review cadence</span>
              </div>
              <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-blue-200/50">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Exception & revocation log</span>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          {!uploadedFile && (
            <div
              className={`p-8 border-2 border-dashed rounded-2xl text-center transition cursor-pointer hover:border-blue-500 ${
                isLight ? 'border-slate-300 bg-slate-50/50' : 'border-slate-700 bg-slate-800/30'
              }`}
              onClick={() => {
                // Mock upload file
                const fakeFile = new File(['mock content'], 'Q2_2026_IAM_User_Access_Review_Signed.pdf', {
                  type: 'application/pdf'
                });
                handleSimulatedFileUpload(fakeFile);
              }}
            >
              <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <div className="text-sm font-bold text-[#0F172A] dark:text-white">
                Click to upload evidence file or drag & drop
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Supports PDF, XLSX, CSV, PNG, DOCX up to 50MB. OCR and control validation will run automatically.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  Browse Files (Simulate Upload)
                </button>
              </div>
            </div>
          )}

          {/* 9-Step Verification Progress Pipeline */}
          {uploadedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 font-bold text-slate-700 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{uploadedFile.name}</span>
                </div>
                <span className="font-mono text-slate-500">
                  {isAnalyzing ? 'Analyzing Document Stream...' : 'Verification Completed'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {analysisSteps.map(step => (
                  <div
                    key={step.stepNumber}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      step.status === 'PASSED'
                        ? isLight
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : 'bg-emerald-950/40 border-emerald-900 text-emerald-200'
                        : step.status === 'RUNNING'
                        ? isLight
                          ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20'
                          : 'bg-blue-950/60 border-blue-700 text-blue-200'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-slate-800/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">Step {step.stepNumber}</span>
                      {step.status === 'PASSED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {step.status === 'RUNNING' && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                      {step.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="font-semibold truncate">{step.label}</div>
                    <div className="text-[10px] opacity-80 truncate mt-0.5">{step.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Intelligence & Audit Trail Dossier */}
          {analysisComplete && extractedMetadata && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-sm text-[#0F172A] dark:text-white">
                    Lead Auditor Verification Assessment: PASSED (98%)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Audit Ready
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Document Type</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {extractedMetadata.documentType}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Review Period</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {extractedMetadata.reviewPeriod}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Sign-Off Date</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {extractedMetadata.approvalDate}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Validity & Expiry</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {extractedMetadata.expiryDate}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-slate-500">
                  <span>SHA-256 Tamper-Resistant Fingerprint:</span>
                  <span className="text-[10px] text-emerald-600 font-bold">WORM VERIFIED</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 break-all select-all font-semibold">
                  {extractedMetadata.sha256Hash}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            {analysisComplete ? (
              <button
                type="button"
                onClick={handleConfirmAndLink}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Link Evidence to {targetControlCode}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!uploadedFile || isAnalyzing}
                className="px-4 py-2 rounded-xl bg-slate-300 dark:bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
              >
                Waiting for Analysis...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
