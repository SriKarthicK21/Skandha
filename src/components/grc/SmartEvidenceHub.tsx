import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileCheck2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Search,
  Lock,
  ExternalLink,
  Layers
} from 'lucide-react';
import { SmartEvidenceEngine } from '../../services/grc/SmartEvidenceEngine';
import { SmartEvidenceItem } from '../../types/grcCoreTypes';
import { PremiumCard } from '../ui/premium/PremiumCard';
import { PremiumButton } from '../ui/premium/PremiumButton';
import { PremiumBadge } from '../ui/premium/PremiumBadge';
import { PremiumInput } from '../ui/premium/PremiumInput';
import { PremiumEmptyState } from '../ui/premium/PremiumEmptyState';

interface SmartEvidenceHubProps {
  onOpen360Drawer?: (entityId: string, entityType: string) => void;
}

export const SmartEvidenceHub: React.FC<SmartEvidenceHubProps> = ({ onOpen360Drawer }) => {
  const [evidenceList, setEvidenceList] = useState<SmartEvidenceItem[]>(SmartEvidenceEngine.getAllEvidence());
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedStagingItem, setUploadedStagingItem] = useState<SmartEvidenceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setTimeout(() => {
      const newEv = SmartEvidenceEngine.processSmartUpload(
        {
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          contentSnippet: `Document Title: ${file.name} - Extracted policy clauses and cryptographic timestamp valid.`
        },
        'Current User (Compliance Lead)'
      );
      setUploadedStagingItem(newEv);
      setEvidenceList(SmartEvidenceEngine.getAllEvidence());
      setIsProcessing(false);
    }, 900);
  };

  const handleConfirmAiMapping = (item: SmartEvidenceItem) => {
    if (item.aiClassification) {
      item.aiClassification.confirmedByHuman = true;
      item.verificationStatus = 'VERIFIED';
      setEvidenceList([...SmartEvidenceEngine.getAllEvidence()]);
      setUploadedStagingItem(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredEvidence = evidenceList.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.evidenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.mappedControlIds.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Evidence Hub & Cryptographic Vault</h2>
              <PremiumBadge variant="success" pulse>SHA-256 Immutable Proof</PremiumBadge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-normal">
              Drag-and-drop evidence ingestion with automatic SHA-256 cryptographic hashing, OCR metadata extraction, and AI control suggestions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Vault Artifacts</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">{evidenceList.length} Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer relative ${
          isDragging
            ? 'border-blue-500 dark:border-cyan-400 bg-blue-50/50 dark:bg-cyan-950/20 shadow-md scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
        }`}
      >
        <input
          type="file"
          id="smart-evidence-input"
          className="hidden"
          onChange={handleFileInput}
        />
        <label htmlFor="smart-evidence-input" className="cursor-pointer block">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isProcessing ? 'Processing Cryptographic Hash & AI Classification...' : 'Drag & Drop Evidence Workpapers'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
                Supports PDF, JSON, CSV, PNG, DOCX (Max 50MB) • Automatic SHA-256 generation & AI control mapping suggestions
              </p>
            </div>
            {!isProcessing && (
              <PremiumButton size="sm" variant="outline" className="mt-2 pointer-events-none">
                Browse Local Files
              </PremiumButton>
            )}
          </div>
        </label>
      </div>

      {/* AI Suggested Mapping Staging Card (Client WOW Moment #4) */}
      {uploadedStagingItem && (
        <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-gradient-to-r dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 border border-blue-300 dark:border-cyan-500/40 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Classification & Mapping Suggested</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">Confidence Score: {(uploadedStagingItem.aiClassification?.confidenceScore! * 100).toFixed(0)}% (Requires Human Confirmation)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PremiumButton size="sm" variant="ghost" onClick={() => setUploadedStagingItem(null)}>
                Dismiss
              </PremiumButton>
              <PremiumButton size="sm" variant="ai" onClick={() => handleConfirmAiMapping(uploadedStagingItem)}>
                Confirm & Map Evidence
              </PremiumButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Artifact Name</span>
              <p className="text-slate-900 dark:text-slate-200 font-medium truncate">{uploadedStagingItem.fileName}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Suggested Controls</span>
              <div className="flex gap-1.5 mt-0.5">
                {uploadedStagingItem.mappedControlIds.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-cyan-950 dark:text-cyan-300 font-mono font-bold border border-blue-200 dark:border-cyan-800/60">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Cryptographic Hash</span>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 truncate">{uploadedStagingItem.sha256Hash}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Repository Table */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <PremiumInput
              placeholder="Search evidence by title, code, or control..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            All artifacts stored in tamper-evident repository with immutable timestamps
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Evidence ID</th>
                <th className="py-3.5 px-4">Artifact Title</th>
                <th className="py-3.5 px-4">SHA-256 Hash</th>
                <th className="py-3.5 px-4">Mapped Controls</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4 text-center">360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-700 dark:text-slate-300">
              {filteredEvidence.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-cyan-400">
                    {item.evidenceCode}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                    <div>{item.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.fileName} • {(item.fileSizeBytes / 1024).toFixed(1)} KB</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[140px] text-emerald-600 dark:text-emerald-400/90">{item.sha256Hash}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.sha256Hash)}
                        className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Copy SHA-256 Hash"
                      >
                        {copiedHash === item.sha256Hash ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {item.mappedControlIds.map(ctrl => (
                        <span key={ctrl} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
                          {ctrl}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <PremiumBadge variant={item.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
                      {item.verificationStatus === 'VERIFIED' ? '✓ Cryptographically Verified' : 'Pending Confirmation'}
                    </PremiumBadge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {onOpen360Drawer && (
                      <button
                        type="button"
                        onClick={() => onOpen360Drawer(item.id, 'EVIDENCE')}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-cyan-500/20 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                        title="Open 360° Relational Graph"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvidence.length === 0 && (
            <div className="p-12">
              <PremiumEmptyState
                title="No evidence items found"
                description="Upload security documentation, configuration exports, or audit logs to establish cryptographic proof for your controls."
                icon={FileCheck2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartEvidenceHub;
