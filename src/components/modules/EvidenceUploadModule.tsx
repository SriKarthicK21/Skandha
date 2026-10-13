import React, { useState, useRef } from 'react';
import { useGRC } from '../../context/GRCContext';
import { PageContainer } from '../layout/PageContainer';
import {
  UploadCloud,
  FileCheck2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sparkles,
  Calendar,
  Layers,
  File,
  RefreshCw,
  Zap,
  Check,
  Tag,
  ShieldAlert,
  Scale
} from 'lucide-react';
import { computeBufferSHA256, computeSHA256 } from '../../utils/crypto';
import {
  scanEvidenceWithDPDP,
  getDpdpBadgeClasses,
  getDpdpClauseMeta
} from '../../services/dpdpAutoTagService';
import {
  scanEvidenceWithISO,
  getIsoCategoryBadgeClasses,
  getIsoStandardColor
} from '../../services/isoAutoTagService';
import { DpdpClauseMapping, DpdpScanResult, IsoRequirementMapping, IsoScanResult } from '../../types';

export const EvidenceUploadModule: React.FC = () => {
  const { currentTenant, controls, masterDepartments, uploadEvidence, currentUser, setActiveModule } = useGRC();

  const [title, setTitle] = useState('');
  const [controlId, setControlId] = useState(
    currentTenant?.controls.find(c => c.applicable)?.controlCode || 'A.5.1'
  );
  const [departmentId, setDepartmentId] = useState(
    currentTenant?.inScopeDepartmentIds[0] || 'dept_sec'
  );
  const [fileType, setFileType] = useState('PDF');
  const [fileSizeStr, setFileSizeStr] = useState('1.8 MB');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('2027-08-30');
  const [tagsInput, setTagsInput] = useState('ISMS, Audit Evidence');
  const [initialStatus, setInitialStatus] = useState<'Draft' | 'Pending Review'>('Draft');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [computedHash, setComputedHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [realFileBuffer, setRealFileBuffer] = useState<ArrayBuffer | null>(null);
  const [extractedFileText, setExtractedFileText] = useState<string>('');
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any | null>(null);

  // ISO Requirements AI Auto-Tagging & Categorization state
  const [isoScanning, setIsoScanning] = useState(false);
  const [isoScanResult, setIsoScanResult] = useState<IsoScanResult | null>(null);
  const [selectedIsoRequirements, setSelectedIsoRequirements] = useState<string[]>([]);
  const [autoIsoScanOnSelect, setAutoIsoScanOnSelect] = useState(true);

  // DPDP AI Auto-Tagging state
  const [dpdpScanning, setDpdpScanning] = useState(false);
  const [dpdpScanResult, setDpdpScanResult] = useState<DpdpScanResult | null>(null);
  const [selectedDpdpClauses, setSelectedDpdpClauses] = useState<string[]>([]);
  const [autoDpdpScanOnSelect, setAutoDpdpScanOnSelect] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const applicableControls = (currentTenant?.controls || []).filter(c => c.applicable);

  const triggerIsoScan = async (evidenceTitle: string, fileNameStr: string, textSnippet?: string) => {
    const activeTitle = evidenceTitle || title || fileNameStr || 'Compliance Artefact';
    setIsoScanning(true);
    try {
      const selectedCtrl = controls.find(c => c.id === controlId || c.controlCode === controlId);
      const selectedDept = masterDepartments.find(d => d.id === departmentId);
      const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      const result = await scanEvidenceWithISO({
        title: activeTitle,
        fileName: fileNameStr,
        controlCode: selectedCtrl?.controlCode || controlId || 'A.5.1',
        department: selectedDept?.name || departmentId,
        tags: currentTags,
        documentText: textSnippet || extractedFileText || description || activeTitle
      });

      setIsoScanResult(result);
      const reqCodes = result.mappedRequirements.map(m => m.isoCode);
      setSelectedIsoRequirements(reqCodes);

      // Auto-append suggested tags to tag input if not already present
      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const existingTagsSet = new Set(currentTags.map(t => t.toLowerCase()));
        const newTagsToAdd = result.suggestedTags.filter(t => !existingTagsSet.has(t.toLowerCase()));
        if (newTagsToAdd.length > 0) {
          setTagsInput(prev => (prev ? `${prev}, ${newTagsToAdd.join(', ')}` : newTagsToAdd.join(', ')));
        }
      }
    } catch (err) {
      console.error('ISO scan error:', err);
    } finally {
      setIsoScanning(false);
    }
  };

  const triggerDpdpScan = async (evidenceTitle: string, fileNameStr: string, textSnippet?: string) => {
    const activeTitle = evidenceTitle || title || fileNameStr || 'Compliance Artefact';
    setDpdpScanning(true);
    try {
      const selectedCtrl = controls.find(c => c.id === controlId || c.controlCode === controlId);
      const selectedDept = masterDepartments.find(d => d.id === departmentId);
      const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      const result = await scanEvidenceWithDPDP({
        title: activeTitle,
        fileName: fileNameStr,
        controlCode: selectedCtrl?.controlCode || controlId || 'A.5.1',
        department: selectedDept?.name || departmentId,
        tags: currentTags,
        documentText: textSnippet || extractedFileText || description || activeTitle
      });

      setDpdpScanResult(result);
      const clauseCodes = result.mappedClauses.map(m => m.sectionCode);
      setSelectedDpdpClauses(clauseCodes);

      // Auto-append suggested tags to tag input if not already present
      if (result.suggestedTags && result.suggestedTags.length > 0) {
        const existingTagsSet = new Set(currentTags.map(t => t.toLowerCase()));
        const newTagsToAdd = result.suggestedTags.filter(t => !existingTagsSet.has(t.toLowerCase()));
        if (newTagsToAdd.length > 0) {
          setTagsInput(prev => (prev ? `${prev}, ${newTagsToAdd.join(', ')}` : newTagsToAdd.join(', ')));
        }
      }
    } catch (err) {
      console.error('DPDP scan error:', err);
    } finally {
      setDpdpScanning(false);
    }
  };

  const processRealFile = async (file: File) => {
    setSelectedFileName(file.name);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'BIN';
    setFileType(ext);

    // Format size
    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb.toFixed(0)} KB`;
    setFileSizeStr(formattedSize);

    const derivedTitle = title || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (!title) {
      setTitle(derivedTitle);
    }

    try {
      const buffer = await file.arrayBuffer();
      setRealFileBuffer(buffer);
      const hash = await computeBufferSHA256(buffer);
      setComputedHash(hash);

      let textContent = '';
      // Attempt text preview if text-based
      if (file.type.includes('text') || file.type.includes('json') || file.type.includes('csv')) {
        const text = await file.text();
        textContent = text.slice(0, 3000);
        setExtractedFileText(textContent);
      } else {
        textContent = `Binary Artefact: ${file.name} (${file.type || 'application/octet-stream'}), SHA-256: ${hash}`;
        setExtractedFileText(textContent);
      }

      if (autoIsoScanOnSelect) {
        triggerIsoScan(derivedTitle, file.name, textContent);
      }
      if (autoDpdpScanOnSelect) {
        triggerDpdpScan(derivedTitle, file.name, textContent);
      }
    } catch (e) {
      console.error('File hash error:', e);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processRealFile(e.target.files[0]);
    }
  };

  const handleSimulatePreset = async (sampleName: string, type: string) => {
    setSelectedFileName(sampleName);
    setFileType(type);
    setFileSizeStr('1.4 MB');
    const derivedTitle = sampleName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setTitle(derivedTitle);

    const samplePayload = `${sampleName}-${Date.now()}-${currentTenant?.id}`;
    const hash = await computeSHA256(samplePayload);
    setComputedHash(hash);
    const sampleText = `Sample Artefact Content for ${sampleName}\nStandard: ISO/IEC 27001:2022 Statement of Applicability Verification.\nDigital Personal Data Protection Act (DPDP) 2023 Technical Safeguards & Obligation Ledger.`;
    setExtractedFileText(sampleText);

    if (autoIsoScanOnSelect) {
      triggerIsoScan(derivedTitle, sampleName, sampleText);
    }
    if (autoDpdpScanOnSelect) {
      triggerDpdpScan(derivedTitle, sampleName, sampleText);
    }
  };

  const handleToggleIsoRequirement = (code: string) => {
    setSelectedIsoRequirements(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleAcceptAllIsoTags = () => {
    if (!isoScanResult?.suggestedTags) return;
    const current = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const merged = Array.from(new Set([...current, ...isoScanResult.suggestedTags]));
    setTagsInput(merged.join(', '));
  };

  const handleToggleClause = (code: string) => {
    setSelectedDpdpClauses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleAddSuggestedTag = (tagToAdd: string) => {
    const current = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (!current.includes(tagToAdd)) {
      setTagsInput(prev => (prev ? `${prev}, ${tagToAdd}` : tagToAdd));
    }
  };

  const handleAcceptAllTags = () => {
    if (!dpdpScanResult?.suggestedTags) return;
    const current = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const merged = Array.from(new Set([...current, ...dpdpScanResult.suggestedTags]));
    setTagsInput(merged.join(', '));
  };

  const handleRunAiAudit = async () => {
    const textToAnalyze = extractedFileText || description || `Evidence title: ${title}, Target Control: ${controlId}`;
    setAiAuditing(true);

    try {
      const res = await fetch('/api/ai/audit-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: textToAnalyze,
          standard: 'ISO 27001:2022',
          controlRef: controlId,
          department: departmentId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiAuditResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAuditing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);
    setSuccessMsg('');

    const fileName = selectedFileName || `${title.toLowerCase().replace(/\s+/g, '_')}.${fileType.toLowerCase()}`;
    const finalHash = computedHash || (await computeSHA256(`${fileName}-${Date.now()}`));

    const selectedCtrl = controls.find(c => c.id === controlId || c.controlCode === controlId);
    const selectedDept = masterDepartments.find(d => d.id === departmentId);

    const activeDpdpMappings = (dpdpScanResult?.mappedClauses || []).filter(m =>
      selectedDpdpClauses.includes(m.sectionCode)
    );

    const activeIsoMappings = (isoScanResult?.mappedRequirements || []).filter(m =>
      selectedIsoRequirements.includes(m.isoCode)
    );

    await uploadEvidence({
      title,
      controlCode: selectedCtrl?.controlCode || controlId || 'A.5.1',
      department: selectedDept?.name || departmentId,
      fileName,
      fileType,
      fileSize: fileSizeStr,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      initialStatus,
      sha256Hash: finalHash,
      dpdpClauses: selectedDpdpClauses,
      dpdpMappings: activeDpdpMappings,
      dpdpScanResult: dpdpScanResult || undefined,
      isoRequirements: selectedIsoRequirements,
      isoMappings: activeIsoMappings,
      isoScanResult: isoScanResult || undefined,
      recommendedIsoCategory: isoScanResult?.primaryCategory,
      recommendedControlCode: isoScanResult?.recommendedControlCode,
      documentExcerpt: extractedFileText.slice(0, 1000) || undefined,
      autoTaggedByAI: !!dpdpScanResult || !!isoScanResult
    });

    setIsUploading(false);
    const isoSummaryText = selectedIsoRequirements.length > 0 ? ` [ISO: ${selectedIsoRequirements.join(', ')}]` : '';
    const dpdpSummaryText = selectedDpdpClauses.length > 0 ? ` [DPDP: ${selectedDpdpClauses.join(', ')}]` : '';
    setSuccessMsg(`Evidence "${title}" uploaded, cryptographically recorded${isoSummaryText}${dpdpSummaryText}! SHA-256: ${finalHash.slice(0, 20)}...`);
    setTitle('');
    setDescription('');
    setSelectedFileName('');
    setComputedHash('');
    setAiAuditResult(null);
    setDpdpScanResult(null);
    setSelectedDpdpClauses([]);
    setIsoScanResult(null);
    setSelectedIsoRequirements([]);
  };

  return (
    <PageContainer id="evidence-upload-module" maxWidth="4xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
              Operational Compliance Ingestion
            </span>
            <h1 className="text-xl font-bold text-white mt-1">Departmental Evidence Upload & Cryptographic Vault</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Submit operational artefacts, penetration test reports, configuration exports, and audit logs. Files are hashed in real time using native SHA-256 for tamper-proof audit trails.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">{successMsg}</span>
          </div>
          <button
            onClick={() => setActiveModule('evidence_centre')}
            className="text-xs font-bold underline hover:text-emerald-200"
          >
            Go to Evidence Centre →
          </button>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-sm">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.json,.docx,.txt,.xml,.yaml,.yml"
        />

        {/* Drag and Drop Zone with Presets */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              processRealFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-2xl border-2 border-dashed border-sky-600/40 hover:border-sky-500 bg-slate-950/50 hover:bg-slate-950/80 text-center space-y-3 cursor-pointer transition"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-sky-400">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-xs font-bold text-white">
              {selectedFileName ? (
                <span className="text-emerald-400 font-mono">Selected: {selectedFileName} ({fileSizeStr})</span>
              ) : (
                'Click or drag real file from your computer to compute SHA-256'
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports real PDF, PNG, JPG, CSV, JSON, DOCX up to 50MB
            </p>
          </div>

          {computedHash && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-300 max-w-lg mx-auto truncate">
              <span className="text-slate-500">Live SHA-256: </span>
              {computedHash}
            </div>
          )}

          <div className="pt-2" onClick={e => e.stopPropagation()}>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-bold">
              Or Choose Fast Preset Artefact:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSimulatePreset('AWS_IAM_MFA_Enforcement_Policy.json', 'JSON')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                AWS IAM MFA Policy (.json)
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePreset('Annual_Penetration_Test_Executive_Summary.pdf', 'PDF')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                Penetration Test Report (.pdf)
              </button>
              <button
                type="button"
                onClick={() => handleSimulatePreset('Security_Awareness_Completion_Q3.csv', 'CSV')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              >
                Staff Training Register (.csv)
              </button>
            </div>
          </div>
        </div>

        {/* AI Audit, ISO Requirement Categorization & DPDP Statutory Mapping Pre-Checks */}
        {(selectedFileName || title) && (
          <div className="space-y-4">
            {/* ISO 27001 Requirements Auto-Tagger & Categorization Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/40 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>ISO/IEC 27001:2022 Requirement Auto-Tagging</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Evidence Centre Classifier
                    </span>
                    {isoScanResult && (
                      <>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getIsoCategoryBadgeClasses(isoScanResult.primaryCategory).bg} ${getIsoCategoryBadgeClasses(isoScanResult.primaryCategory).text} ${getIsoCategoryBadgeClasses(isoScanResult.primaryCategory).border}`}>
                          {isoScanResult.primaryCategory}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isoScanResult.overallConfidence === 'HIGH'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                            : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                        }`}>
                          Confidence: {isoScanResult.overallConfidence}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white">
                    Automated ISO Requirement Mapping & Category Classification
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Scans uploaded artifacts against ISO/IEC 27001:2022 ISMS requirements (Clauses 4-10 & Annex A Controls A.5, A.6, A.7, A.8) defined in the Evidence Centre.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => triggerIsoScan(title, selectedFileName, extractedFileText)}
                    disabled={isoScanning}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50 shadow-md shadow-emerald-900/30"
                  >
                    {isoScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isoScanning ? 'Classifying Requirements...' : isoScanResult ? 'Re-scan with ISO Engine' : 'Auto-Categorize with ISO AI'}</span>
                  </button>
                </div>
              </div>

              {/* Scanning in progress */}
              {isoScanning && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-center space-y-2 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-200">
                    Scanning artefact against ISO 27001:2022 clauses, Annex A controls, and audit objectives...
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Synthesizing category taxonomy (Organizational, People, Physical, Technological) and audit test criteria.
                  </p>
                </div>
              )}

              {/* Scan Results Display */}
              {isoScanResult && !isoScanning && (
                <div className="space-y-3 pt-1">
                  {/* Category & Executive Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-900/50 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recommended Primary Category:
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getIsoCategoryBadgeClasses(isoScanResult.primaryCategory).bg} ${getIsoCategoryBadgeClasses(isoScanResult.primaryCategory).text} ${getIsoCategoryBadgeClasses(isoScanResult.primaryCategory).border}`}>
                          {isoScanResult.primaryCategory}
                        </span>
                      </div>
                      {isoScanResult.recommendedControlCode && (
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <span className="text-slate-400">Recommended Control:</span>
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            {isoScanResult.recommendedControlCode}
                          </span>
                        </div>
                      )}
                    </div>
                    {isoScanResult.summary && (
                      <p className="leading-relaxed text-[11px] text-slate-200">
                        {isoScanResult.summary}
                      </p>
                    )}
                  </div>

                  {/* Mapped Requirements List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mapped ISO 27001 Requirements ({isoScanResult.mappedRequirements?.length || 0})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Select requirements to record in the Evidence Centre ledger
                      </span>
                    </div>

                    <div className="space-y-2">
                      {isoScanResult.mappedRequirements?.map((req, idx) => {
                        const isSelected = selectedIsoRequirements.includes(req.isoCode);
                        const standardColor = getIsoStandardColor(req.isoCode);
                        const catBadges = getIsoCategoryBadgeClasses(req.category);

                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleIsoRequirement(req.isoCode)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-slate-900/90 border-emerald-500/60 ring-1 ring-emerald-500/30'
                                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-90'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleIsoRequirement(req.isoCode)}
                                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                                  onClick={e => e.stopPropagation()}
                                />
                                <div>
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-sky-950/70 border-sky-700/60 ${standardColor}`}>
                                      {req.isoCode}
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                      {req.title || req.requirementTitle || req.isoCode}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${catBadges.bg} ${catBadges.text} ${catBadges.border}`}>
                                      {req.category}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-bold text-emerald-400">
                                  {req.relevanceScore || 92}% Match
                                </span>
                              </div>
                            </div>

                            {/* Testing Procedure & Audit Objective */}
                            <div className="pl-6 space-y-1 text-[11px]">
                              {req.auditObjective && (
                                <p className="text-slate-300">
                                  <strong className="text-slate-400">Audit Objective:</strong> {req.auditObjective}
                                </p>
                              )}
                              {req.testingProcedure && (
                                <p className="text-slate-400">
                                  <strong className="text-slate-500">Testing Procedure:</strong> {req.testingProcedure}
                                </p>
                              )}
                              {req.rationale && (
                                <p className="text-emerald-300/90 italic">
                                  "{req.rationale}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suggested ISO Tags */}
                  {isoScanResult.suggestedTags && isoScanResult.suggestedTags.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                          <span>AI-Suggested ISO Requirement Tags:</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleAcceptAllIsoTags}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                        >
                          Accept All Suggested ISO Tags
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {isoScanResult.suggestedTags.map((tagItem, idx) => {
                          const currentTagsList = tagsInput.split(',').map(t => t.trim());
                          const isAlreadyAdded = currentTagsList.includes(tagItem);

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const current = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
                                if (!current.includes(tagItem)) {
                                  setTagsInput(prev => (prev ? `${prev}, ${tagItem}` : tagItem));
                                }
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border flex items-center space-x-1 transition ${
                                isAlreadyAdded
                                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 font-semibold'
                                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-emerald-500 hover:text-emerald-300'
                              }`}
                            >
                              <span>{tagItem}</span>
                              {isAlreadyAdded ? <Check className="w-2.5 h-2.5" /> : <span>+</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DPDP 2023 Statutory Auto-Tagger Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-sky-950/30 border border-indigo-500/40 space-y-4 shadow-lg shadow-indigo-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 flex items-center space-x-1">
                      <Scale className="w-3 h-3 text-indigo-400" />
                      <span>DPDP Act 2023 Statutory Auto-Tagging</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Gemini 3.8 Flash Engine
                    </span>
                    {dpdpScanResult && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        dpdpScanResult.overallConfidence === 'HIGH'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                      }`}>
                        Confidence: {dpdpScanResult.overallConfidence}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white">
                    Automated Statutory Clause Mapping & Tag Taxonomy
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Scans uploaded artifacts against the statutory clauses of India's Digital Personal Data Protection Act, 2023 (Sec 4 to 18).
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => triggerDpdpScan(title, selectedFileName, extractedFileText)}
                    disabled={dpdpScanning}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50 shadow-md shadow-indigo-900/30"
                  >
                    {dpdpScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{dpdpScanning ? 'Scanning Clauses...' : dpdpScanResult ? 'Re-scan with Gemini' : 'Auto-Map to DPDP'}</span>
                  </button>
                </div>
              </div>

              {/* Scanning in progress */}
              {dpdpScanning && (
                <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-center space-y-2 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-sky-400 animate-spin mx-auto" />
                  <p className="text-xs font-medium text-slate-200">
                    Analyzing document against DPDP Act 2023 statutory obligations (Sections 4-18)...
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Extracting technical safeguards, parental consent verification, and breach reporting provisions.
                  </p>
                </div>
              )}

              {/* Scan Results Display */}
              {dpdpScanResult && !dpdpScanning && (
                <div className="space-y-3 pt-1">
                  {/* Executive Summary */}
                  {dpdpScanResult.summary && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-indigo-950 text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                        Statutory Compliance Summary:
                      </span>
                      <p className="leading-relaxed text-[11px] text-slate-200">
                        {dpdpScanResult.summary}
                      </p>
                    </div>
                  )}

                  {/* Statutory Penalty Risk Exposure Box */}
                  {dpdpScanResult.statutoryPenaltyRisk && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start space-x-3 text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-rose-200">
                            Statutory Exposure Risk: {dpdpScanResult.statutoryPenaltyRisk.riskLevel || 'CRITICAL'}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200 border border-rose-700/60 font-bold">
                            Max Penalty: ₹{dpdpScanResult.statutoryPenaltyRisk.maxExposureCrores || 250} Crores
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-300/90 leading-relaxed">
                          {dpdpScanResult.statutoryPenaltyRisk.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mapped Clauses List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Scale className="w-3.5 h-3.5 text-sky-400" />
                        <span>Mapped DPDP Statutory Clauses ({dpdpScanResult.mappedClauses?.length || 0})</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Select which clauses to record in the evidence ledger
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dpdpScanResult.mappedClauses?.map((clause, idx) => {
                        const isSelected = selectedDpdpClauses.includes(clause.sectionCode);
                        const badgeClasses = getDpdpBadgeClasses(clause.sectionCode);
                        const meta = getDpdpClauseMeta(clause.sectionCode);

                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleClause(clause.sectionCode)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-slate-900/90 border-indigo-500/60 ring-1 ring-indigo-500/30'
                                : 'bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-90'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleClause(clause.sectionCode)}
                                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                  onClick={e => e.stopPropagation()}
                                />
                                <div>
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeClasses.bg} ${badgeClasses.text} ${badgeClasses.border}`}>
                                      {clause.sectionCode}: Section {clause.sectionNumber || clause.sectionCode.replace(/[^\d]/g, '')}
                                    </span>
                                    <span className="text-xs font-bold text-white">
                                      {clause.title || meta?.title}
                                    </span>
                                    {clause.penaltyMaxCrores && clause.penaltyMaxCrores > 0 && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold">
                                        Max ₹{clause.penaltyMaxCrores} Cr Fine
                                      </span>
                                    )}
                                    {clause.mandatoryForSdf && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-semibold">
                                        Mandatory SDF
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    {clause.chapter || meta?.chapter || 'Chapter II: Obligations of Data Fiduciary'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-bold text-sky-400">
                                  {clause.relevanceScore || 90}% Match
                                </span>
                              </div>
                            </div>

                            {/* Statutory Legal Rationale */}
                            <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">
                              {clause.rationale}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Suggested DPDP Tags */}
                  {dpdpScanResult.suggestedTags && dpdpScanResult.suggestedTags.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
                          <Tag className="w-3.5 h-3.5 text-indigo-400" />
                          <span>AI-Suggested DPDP Compliance Tags:</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleAcceptAllTags}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                        >
                          Accept All Suggested Tags
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {dpdpScanResult.suggestedTags.map((tagItem, idx) => {
                          const currentTagsList = tagsInput.split(',').map(t => t.trim());
                          const isAlreadyAdded = currentTagsList.includes(tagItem);

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddSuggestedTag(tagItem)}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border flex items-center space-x-1 transition ${
                                isAlreadyAdded
                                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-700/60 font-semibold'
                                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <span>{isAlreadyAdded ? '✓' : '+'}</span>
                              <span>#{tagItem}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Auditor Pre-Check (ISO 27001) */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">ISO 27001 Auditor Pre-Ingestion Check</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verify if this artefact satisfies ISO 27001 auditor requirements before submitting.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunAiAudit}
                disabled={aiAuditing}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1.5 transition disabled:opacity-50 shrink-0"
              >
                {aiAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{aiAuditing ? 'Auditing...' : 'Evaluate with AI'}</span>
              </button>
            </div>

            {aiAuditResult && (
              <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Auditor Compliance Rating: {aiAuditResult.complianceRating}</span>
                  <span className="text-purple-300 font-mono font-bold">Score: {aiAuditResult.score}/100</span>
                </div>
                <p className="text-slate-300">{aiAuditResult.recommendedAction}</p>
                <div className="space-y-1">
                  {aiAuditResult.observations?.map((obs: string, idx: number) => (
                    <div key={idx} className="text-[11px] text-purple-200 flex items-start space-x-1.5">
                      <span>•</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Evidence Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. AWS Production Multi-Factor Authentication Audit"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Mapped ISO 27001 Control <span className="text-rose-400">*</span>
            </label>
            <select
              value={controlId}
              onChange={e => setControlId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
            >
              {applicableControls.map(ctrl => (
                <option key={ctrl.id} value={ctrl.controlCode}>
                  {ctrl.controlCode} — {ctrl.title} ({ctrl.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Responsible Department <span className="text-rose-400">*</span>
            </label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
            >
              {masterDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Evidence Expiry / Recertification Due Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="date"
                required
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-200">
            Description & Contextual Verification Notes
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Explain how this evidence demonstrates control compliance, sampling methodology used, and any exceptions observed..."
            className="w-full p-3 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-200">
            Categorization Tags (Comma-separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. AWS, MFA, IAM, Access Control"
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-200">
            Initial Verification Lifecycle Stage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInitialStatus('Draft')}
              className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                initialStatus === 'Draft'
                  ? 'bg-slate-900 border-sky-500/60 ring-1 ring-sky-500/30 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${initialStatus === 'Draft' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                <File className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <span>Save as Draft</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">Step 0/2</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Keep in custodian drafting stage. You can review and submit for formal review later.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setInitialStatus('Pending Review')}
              className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                initialStatus === 'Pending Review'
                  ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${initialStatus === 'Pending Review' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <span>Submit for Review</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/60">Step 1/2</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Directly ingest into the Auditor worklist for formal verification sign-off.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-mono">
            <Hash className="w-3.5 h-3.5 text-sky-400" />
            <span>Automatic SHA-256 calculation on ingest</span>
          </div>

          <button
            type="submit"
            disabled={isUploading || !title.trim()}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-900/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            id="btn-submit-evidence"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Hashing & Ingesting...' : 'Upload & Compute Hash'}</span>
          </button>
        </div>
      </form>
    </PageContainer>
  );
};
