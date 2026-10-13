// Skanda BrandGuard — Signed Cryptographic Bundle (ZIP) Export Modal
// Compiles court-admissible signed forensic packages for WIPO UDRP / URS complaints and US ACPA litigation.
// Conforms to ISO/IEC 27037:2012, NIST SP 800-86, and Federal Rules of Evidence Rule 902(13)/(14).

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  FileArchive,
  Scale,
  Camera,
  Network,
  Globe,
  FileText,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Terminal,
  RefreshCw,
  FolderArchive,
  AlertTriangle,
  ArrowRight,
  Eye
} from 'lucide-react';
import {
  BrandFinding,
  CryptographicEvidenceBundle,
  BrandProfile
} from '../../types/brandguard';
import {
  BrandGuardZipExportService,
  ZipExportProgress,
  ZipExportResult
} from '../../services/brandguard/brandguardZipExportService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Single bundle mode
  bundle?: CryptographicEvidenceBundle | null;
  finding?: BrandFinding | null;
  // Batch bundle mode
  bundles?: CryptographicEvidenceBundle[];
  findings?: BrandFinding[];
  brandProfile?: BrandProfile | null;
  isBatch?: boolean;
}

export const BrandGuardZipExportModal: React.FC<BrandGuardZipExportModalProps> = ({
  isOpen,
  onClose,
  bundle,
  finding,
  bundles = [],
  findings = [],
  brandProfile,
  isBatch = false
}) => {
  const { theme, logAuditEvent } = useGRC();

  // Export process state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ZipExportProgress>({
    stage: 'INITIALIZING',
    progressPercent: 0,
    currentFile: '',
    message: 'Ready to package signed cryptographic bundle'
  });
  const [exportResult, setExportResult] = useState<ZipExportResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Configuration options
  const [includeScreenshots, setIncludeScreenshots] = useState<boolean>(true);
  const [includeHarLogs, setIncludeHarLogs] = useState<boolean>(true);
  const [includeDnsRecords, setIncludeDnsRecords] = useState<boolean>(true);
  const [includeLegalAffidavit, setIncludeLegalAffidavit] = useState<boolean>(true);
  const [includeSha256Sums, setIncludeSha256Sums] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setExportResult(null);
      setIsExporting(false);
      setProgress({
        stage: 'INITIALIZING',
        progressPercent: 0,
        currentFile: '',
        message: 'Ready to package signed cryptographic bundle'
      });
    }
  }, [isOpen, bundle, isBatch]);

  if (!isOpen) return null;

  const targetDomain = isBatch
    ? `${bundles.length} Flagged Domains (Consolidated)`
    : bundle?.targetDomain || 'target-domain.com';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      if (isBatch && bundles.length > 0) {
        const result = await BrandGuardZipExportService.buildBatchSignedEvidenceZipBundle(
          bundles,
          findings,
          brandProfile,
          setProgress
        );
        setExportResult(result);
        BrandGuardZipExportService.triggerBrowserDownload(result.blob, result.fileName);

        logAuditEvent(
          'EXPORT',
          'Batch Legal Evidence ZIP',
          `Generated and downloaded consolidated legal filing ZIP for ${bundles.length} domains. SHA-256: ${result.sha256Checksum}`
        );
      } else if (bundle) {
        const result = await BrandGuardZipExportService.buildSignedEvidenceZipBundle(
          bundle,
          finding,
          brandProfile,
          setProgress
        );
        setExportResult(result);
        BrandGuardZipExportService.triggerBrowserDownload(result.blob, result.fileName);

        logAuditEvent(
          'EXPORT',
          'Legal Evidence ZIP Bundle',
          `Generated and downloaded signed legal evidence ZIP for ${bundle.targetDomain}. SHA-256: ${result.sha256Checksum}`
        );
      }
    } catch (err) {
      console.error('Failed to generate ZIP bundle:', err);
      setProgress({
        stage: 'INITIALIZING',
        progressPercent: 0,
        currentFile: 'Error',
        message: 'Failed to generate cryptographic bundle. Please retry.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReDownload = () => {
    if (exportResult) {
      BrandGuardZipExportService.triggerBrowserDownload(exportResult.blob, exportResult.fileName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-5 border-b flex items-start justify-between ${
            theme === 'light'
              ? 'bg-gradient-to-r from-amber-50/70 via-indigo-50/40 to-white border-slate-200'
              : 'bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 border-slate-800'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <FileArchive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Download Signed Cryptographic Bundle (ZIP)</span>
                </h3>
                <p className="text-xs text-amber-300 font-mono mt-0.5">
                  Formal Legal UDRP / URS & ACPA Court-Admissible Exhibit Package
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>ISO/IEC 27037:2012</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                FRE RULE 902(14) SELF-AUTHENTICATING
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                WIPO UDRP ¶ 4(a) & 15 U.S.C. § 1125(d) ACPA
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Target Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  {isBatch ? 'Consolidated Litigation Target' : 'Disputed Infringing Domain'}
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">{targetDomain}</span>
              </div>
              {!isBatch && bundle && (
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Bundle Identifier</span>
                  <span className="text-xs text-amber-400 font-bold">{bundle.bundleId}</span>
                </div>
              )}
            </div>

            {!isBatch && bundle && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500 block">SHA-256 Merkle Master Root:</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-amber-300 truncate max-w-[240px]" title={bundle.sha256BundleDigest}>
                      {bundle.sha256BundleDigest}
                    </span>
                    <button
                      onClick={() => handleCopy(bundle.sha256BundleDigest, 'root_hash')}
                      className="text-slate-400 hover:text-white"
                      title="Copy Merkle Root"
                    >
                      {copiedKey === 'root_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Capture Timestamp (UTC):</span>
                  <span className="text-slate-200 mt-0.5 block">{new Date(bundle.capturedAtIso).toUTCString()}</span>
                </div>
              </div>
            )}

            {isBatch && (
              <div className="text-[11px] text-slate-300">
                Packaging <strong className="text-amber-300 font-bold">{bundles.length} independent domains</strong> into a structured multi-folder ZIP container with master UDRP arbitration exhibit catalog.
              </div>
            )}
          </div>

          {/* Bundle Contents & Forensic Artifact Manifest */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-2 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Court-Admissible Package Manifest (Included in ZIP)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
              {/* Screenshot Artifact Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>1. Captured Viewport Screenshots</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  High-resolution 1920x1080 PNG rendered with embedded evidentiary watermark stamp (RFC 3161 timestamp, egress IP, SHA-256 hash) and rendering metadata.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Path: /screenshots/evidence_screenshot_fullpage.png
                </div>
              </div>

              {/* HAR Network Trace Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                  <Network className="w-4 h-4 text-indigo-400" />
                  <span>2. Full HTTP Archive (HAR v1.2)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Standard HAR archive containing all HTTP/2 socket requests, headers, cookies, timings, and dedicated credential harvest POST exfiltration analysis.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Path: /network_har/network_traffic_capture.har
                </div>
              </div>

              {/* Authoritative DNS Records Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>3. Authoritative DNS Records</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  RFC 1035 BIND 9 zone configuration file, recursive root-to-leaf query delegation tree, DNSSEC status, and tabular CSV for judicial workpapers.
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Path: /dns_records/authoritative_zone_file.bind
                </div>
              </div>

              {/* Legal Affidavits & Pleadings Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>4. UDRP & ACPA Legal Pleadings</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  WIPO UDRP Policy ¶ 4(a) 3-prong analysis, ACPA 15 U.S.C. § 1125(d) claims, and verified Custodian Declaration executed under penalty of perjury (FRE 902(14)).
                </p>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Path: /00_LEGAL_FILING_DOSSIER_FRE902_UDRP.md
                </div>
              </div>
            </div>

            {/* Cryptographic Manifest Note */}
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-indigo-200 leading-relaxed">
                Includes <code className="text-amber-300 font-mono">SHA256SUMS.txt</code> containing SHA-256 hashes of every individual file inside the ZIP. Legal counsel and courts can verify complete non-repudiation using standard terminal verification: <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">sha256sum -c SHA256SUMS.txt</code>.
              </div>
            </div>
          </div>

          {/* Progress / Status Display during generation */}
          {isExporting && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>{progress.message}</span>
                </div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{progress.progressPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>

              <div className="text-[10px] font-mono text-slate-400 truncate">
                Processing: {progress.currentFile}
              </div>
            </div>
          )}

          {/* Completed Success Result Card */}
          {exportResult && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm">Cryptographic ZIP Bundle Successfully Downloaded!</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  SEALED & READY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-[11px] pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">FILE NAME</span>
                  <span className="text-white truncate block font-bold mt-0.5" title={exportResult.fileName}>
                    {exportResult.fileName}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">TOTAL EXHIBITS</span>
                  <span className="text-white font-bold mt-0.5 block">{exportResult.fileCount} Files</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">PACKAGE SIZE</span>
                  <span className="text-white font-bold mt-0.5 block">
                    {(exportResult.blob.size / 1024).toFixed(1)} KB (Deflate)
                  </span>
                </div>
              </div>

              {/* SHA-256 Checksum Copy Box */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>ZIP CONTAINER SHA-256 HASH:</span>
                  <button
                    onClick={() => handleCopy(exportResult.sha256Checksum, 'zip_hash')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    {copiedKey === 'zip_hash' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Checksum</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-amber-300 break-all">{exportResult.sha256Checksum}</div>
              </div>

              {/* Terminal Verification Snippet */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="flex items-center space-x-1">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    <span>LEGAL WORKPAPERS VERIFICATION COMMAND:</span>
                  </span>
                  <button
                    onClick={() => handleCopy('sha256sum -c SHA256SUMS.txt', 'cmd_verify')}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === 'cmd_verify' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-emerald-400 bg-black/50 p-1.5 rounded">
                  $ unzip {exportResult.fileName} && sha256sum -c SHA256SUMS.txt
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for formal submission to WIPO Arbitration & Courts</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              {exportResult ? 'Close' : 'Cancel'}
            </button>

            {exportResult ? (
              <button
                onClick={handleReDownload}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-2 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Re-Download ZIP Bundle</span>
              </button>
            ) : (
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white flex items-center space-x-2 transition-all shadow-md"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Packaging Legal Evidence...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4 text-amber-300" />
                    <span>Generate & Download Signed ZIP Bundle</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
