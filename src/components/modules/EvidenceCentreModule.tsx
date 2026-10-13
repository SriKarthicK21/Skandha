import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { EvidenceRecord, EvidenceVerificationState, DpdpClauseMapping, DpdpScanResult } from '../../types';
import { PageContainer } from '../layout/PageContainer';
import { safeConfirm } from '../../utils/safeConfirm';
import {
  FileCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Lock,
  Hash,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  FileEdit,
  AlertCircle,
  Send,
  RotateCcw,
  Check,
  Sparkles,
  Shield,
  UserCheck,
  ChevronRight,
  FileText,
  HelpCircle,
  Database,
  CheckSquare,
  Square,
  MinusSquare,
  FileArchive,
  FolderArchive,
  Layers,
  Settings2,
  X,
  RefreshCw,
  Scale,
  ShieldAlert,
  Tag,
  Wand2,
  Star,
  History
} from 'lucide-react';
import { EvidentiaryTriangulationEngine } from '../evidence/EvidentiaryTriangulationEngine';
import { EvidenceLinkageWizard } from '../evidence/EvidenceLinkageWizard';
import { formatDateTime, formatDate } from '../../utils/crypto';
import {
  exportEvidenceZipPackage,
  downloadBlob,
  generateIndividualEvidenceContent
} from '../../services/evidenceExportService';
import {
  scanEvidenceWithDPDP,
  scanBatchEvidenceWithDPDP,
  getDpdpBadgeClasses,
  getDpdpClauseMeta,
  DPDP_STATUTORY_CLAUSES
} from '../../services/dpdpAutoTagService';
import {
  scanEvidenceWithISO,
  scanBatchEvidenceWithISO,
  getIsoCategoryBadgeClasses,
  getIsoStandardColor,
  ISO_REQUIREMENTS_CATALOG
} from '../../services/isoAutoTagService';

export const EvidenceCentreModule: React.FC = () => {
  const {
    evidence,
    currentTenant,
    masterDepartments,
    reviewEvidence,
    submitEvidenceForReview,
    deleteEvidence,
    verifyEvidenceChecksum,
    currentRole,
    currentUser,
    setActiveModule,
    persistenceStatus,
    syncStateToCloudDatabase,
    logAuditEvent,
    autoTagEvidenceWithDPDP,
    batchAutoTagEvidenceWithDPDP,
    autoTagEvidenceWithISO,
    batchAutoTagEvidenceWithISO
  } = useGRC();

  const { showToast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [dpdpClauseFilter, setDpdpClauseFilter] = useState('All');
  const [isoRequirementFilter, setIsoRequirementFilter] = useState('All');
  const [isoCategoryFilter, setIsoCategoryFilter] = useState('All');
  const [aiTaggedOnly, setAiTaggedOnly] = useState(false);
  const [isBatchAutoTagging, setIsBatchAutoTagging] = useState(false);
  const [scanningItemId, setScanningItemId] = useState<string | null>(null);
  const [isBatchIsoTagging, setIsBatchIsoTagging] = useState(false);
  const [scanningIsoItemId, setScanningIsoItemId] = useState<string | null>(null);

  const checkIsSelfSubmitted = (item: EvidenceRecord): boolean => {
    const author = (item.uploadedBy || '').toLowerCase();
    const submitter = (item.submittedBy || '').toLowerCase();
    const me = (currentUser.name || '').toLowerCase();
    const firstName = me.split(' ')[0] || me;
    return author.includes(me) || author.includes(firstName) || (submitter.length > 0 && (submitter.includes(me) || submitter.includes(firstName)));
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const ok = await syncStateToCloudDatabase();
    setIsSyncing(false);
    if (ok) {
      setActionFeedback('Cloud persistence store synchronized successfully.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const tenantEvidence = evidence.filter(e => e.tenantId === currentTenant?.id);

  const [evidenceMainTab, setEvidenceMainTab] = useState<'repository' | 'triangulation' | 'linkage_wizard'>('repository');
  const [linkagePreselectedItem, setLinkagePreselectedItem] = useState<EvidenceRecord | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Draft' | 'Pending Review' | 'Verified' | 'Requires Update' | 'Expired'
  >('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);

  // Retrospective Timeline Snapshot State from navigation
  const [retrospectiveSnapshot, setRetrospectiveSnapshot] = useState<{
    period: string;
    dateLabel: string;
    timestamp: string;
    deficient: number;
    milestone?: string;
  } | null>(null);

  React.useEffect(() => {
    const handleNavEvent = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.retrospective) {
        setRetrospectiveSnapshot(customEvt.detail.retrospective);
      }
      if (customEvt.detail?.search) {
        setSearchTerm(customEvt.detail.search);
      }
      if (customEvt.detail?.filter && customEvt.detail.filter !== 'All') {
        setStatusFilter(customEvt.detail.filter);
      }
    };

    window.addEventListener('skanda:navigate-module', handleNavEvent);
    return () => {
      window.removeEventListener('skanda:navigate-module', handleNavEvent);
    };
  }, []);

  // Review Modal State
  const [reviewNotes, setReviewNotes] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [verifyingChecksumId, setVerifyingChecksumId] = useState<string | null>(null);

  const handleVerifyChecksum = async (item: EvidenceRecord) => {
    setVerifyingChecksumId(item.id);
    const res = await verifyEvidenceChecksum(item.id);
    setVerifyingChecksumId(null);
    if (res.success) {
      showToast({
        title: 'Cryptographically Certified',
        message: `SHA-256 Checksum certified: ${res.sha256Hash.slice(0, 16)}...`,
        type: 'success'
      });
      if (selectedEvidence?.id === item.id) {
        setSelectedEvidence(prev => prev ? {
          ...prev,
          sha256Hash: res.sha256Hash,
          auditHash: res.sha256Hash,
          integrityVerifiedAt: res.timestamp,
          checksumVerified: true
        } : null);
      }
    }
  };

  const isAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'COMPANY_ADMIN';
  const isAuditor = currentRole === 'INTERNAL_AUDITOR' || currentRole === 'PLATFORM_AUDITOR';
  const isAuditorOrAdmin = isAdmin || isAuditor;

  // Derive verification state safely
  const getVerificationState = (item: EvidenceRecord): EvidenceVerificationState => {
    if (item.verificationState) return item.verificationState;
    if (item.status === 'Verified') return 'Verified';
    if (item.status === 'Draft') return 'Draft';
    return 'Pending Review';
  };

  // Step 1: Submit Draft for Review
  const handleSubmitForReview = (item: EvidenceRecord, customNotes?: string) => {
    setIsProcessing(true);
    submitEvidenceForReview(item.id, customNotes || 'Submitted for formal auditor review (Step 1 of 2)');
    setActionFeedback(`"${item.title}" successfully submitted for formal review (Step 1 Complete).`);
    setTimeout(() => setActionFeedback(null), 4000);
    setIsProcessing(false);
    if (selectedEvidence?.id === item.id) {
      setSelectedEvidence(prev =>
        prev
          ? {
              ...prev,
              status: 'Pending Review',
              verificationState: 'Pending Review',
              submittedBy: `${currentUser.name} (${currentRole})`,
              submittedDate: new Date().toISOString()
            }
          : null
      );
    }
  };

  // Step 2: Formal Verification or Rejection by Auditor/Admin
  const handleReviewAction = (
    status: 'Verified' | 'Requires Update' | 'Draft',
    customNotes?: string
  ) => {
    if (!selectedEvidence) return;
    setIsProcessing(true);
    const notes =
      customNotes ||
      reviewNotes ||
      (status === 'Verified'
        ? `Evidence verified by ${currentUser.name} (${currentRole}). Conforming with ISO 27001 requirements.`
        : status === 'Draft'
        ? `Returned to Draft by ${currentUser.name} (${currentRole}) for revision.`
        : `Evidence requires update as noted during audit.`);

    const result = reviewEvidence(selectedEvidence.id, status, notes);
    if (result && !result.success) {
      setActionFeedback(result.error || 'Action blocked by Four-Eyes Policy');
      setIsProcessing(false);
      setTimeout(() => setActionFeedback(null), 6000);
      return;
    }

    setActionFeedback(
      status === 'Verified'
        ? `"${selectedEvidence.title}" formally verified and approved (Step 2 Complete • Four-Eyes Enforced).`
        : status === 'Draft'
        ? `"${selectedEvidence.title}" returned to Draft status for custodian amendment.`
        : `"${selectedEvidence.title}" marked as Requires Update.`
    );
    setTimeout(() => setActionFeedback(null), 4000);
    setIsProcessing(false);
    setSelectedEvidence(null);
    setReviewNotes('');
    setSubmissionNotes('');
  };

  // Inline one-click verify for auditors/admins
  const handleQuickVerify = (item: EvidenceRecord) => {
    if (checkIsSelfSubmitted(item)) {
      setActionFeedback(`Four-Eyes Principle Enforced: You cannot verify "${item.title}" because you authored/submitted it. Independent sign-off is required.`);
      setTimeout(() => setActionFeedback(null), 5000);
      return;
    }

    const result = reviewEvidence(
      item.id,
      'Verified',
      `Direct audit sign-off by ${currentUser.name} (${currentRole}). Sample conforms with ISO 27001 Annex A.`
    );

    if (result && !result.success) {
      setActionFeedback(result.error || 'Verification failed');
      setTimeout(() => setActionFeedback(null), 5000);
      return;
    }

    setActionFeedback(`"${item.title}" verified by ${currentUser.name} (Step 2 Complete • Four-Eyes Validated).`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Inline return to draft
  const handleQuickReturnToDraft = (item: EvidenceRecord) => {
    reviewEvidence(
      item.id,
      'Draft',
      `Returned to Draft stage by ${currentUser.name} (${currentRole}) for supplementary evidence.`
    );
    setActionFeedback(`"${item.title}" returned to Draft state.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleRunBatchAutoTag = async (onlySelected: boolean = false) => {
    const targets = onlySelected && selectedEvidenceIds.size > 0
      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
      : tenantEvidence;

    if (targets.length === 0) {
      showToast({
        title: 'No Items to Scan',
        message: 'No evidence records available to auto-tag.',
        type: 'warning'
      });
      return;
    }

    setIsBatchAutoTagging(true);
    showToast({
      title: 'AI Statutory Scan Initiated',
      message: `Analyzing ${targets.length} evidence artefacts against DPDP Act 2023 statutory obligations via Gemini...`,
      type: 'info'
    });

    try {
      const itemsToScan = targets.map(t => ({
        id: t.id,
        title: t.title,
        fileName: t.fileName,
        controlCode: t.controlCode,
        department: t.department,
        tags: t.tags,
        documentText: t.documentExcerpt || t.title
      }));

      const batchResults = await scanBatchEvidenceWithDPDP(itemsToScan);
      const batchPayload = batchResults.map(r => ({
        id: r.id,
        mappings: r.scanResult.mappedClauses,
        suggestedTags: r.scanResult.suggestedTags,
        scanResult: r.scanResult
      }));
      await batchAutoTagEvidenceWithDPDP(batchPayload);

      showToast({
        title: 'DPDP Auto-Tagging Complete',
        message: `Successfully analyzed and mapped ${batchResults.length} evidence artefacts to DPDP statutory clauses!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Batch auto-tag error:', err);
      showToast({
        title: 'Auto-Tagging Failed',
        message: 'Unable to complete DPDP statutory scan.',
        type: 'error'
      });
    } finally {
      setIsBatchAutoTagging(false);
    }
  };

  const handleScanSingleItem = async (item: EvidenceRecord) => {
    setScanningItemId(item.id);
    showToast({
      title: 'Scanning Evidence with Gemini',
      message: `Evaluating "${item.title}" against DPDP Act 2023 statutory clauses...`,
      type: 'info'
    });

    try {
      const result = await scanEvidenceWithDPDP({
        title: item.title,
        fileName: item.fileName,
        controlCode: item.controlCode,
        department: item.department,
        tags: item.tags,
        documentText: item.documentExcerpt || item.title
      });

      await autoTagEvidenceWithDPDP(
        item.id,
        result.mappedClauses,
        result.suggestedTags,
        result
      );

      showToast({
        title: 'DPDP Statutory Tagging Complete',
        message: `Mapped to ${result.mappedClauses.length} statutory clauses (${result.mappedClauses.map(m => m.sectionCode).join(', ')})`,
        type: 'success'
      });

      if (selectedEvidence?.id === item.id) {
        setSelectedEvidence(prev => prev ? {
          ...prev,
          dpdpClauses: result.mappedClauses.map(m => m.sectionCode),
          dpdpMappings: result.mappedClauses,
          dpdpScanResult: result,
          autoTaggedByAI: true,
          aiTaggedAt: new Date().toISOString()
        } : null);
      }
    } catch (err) {
      console.error('Single item scan error:', err);
      showToast({
        title: 'Scan Error',
        message: 'Could not auto-tag evidence with DPDP clauses.',
        type: 'error'
      });
    } finally {
      setScanningItemId(null);
    }
  };

  const handleRunBatchIsoAutoTag = async (onlySelected = false) => {
    const targets = onlySelected && selectedEvidenceIds.size > 0
      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
      : tenantEvidence;

    if (targets.length === 0) {
      showToast({
        title: 'No Evidence Records',
        message: 'There are no evidence records available to scan.',
        type: 'warning'
      });
      return;
    }

    setIsBatchIsoTagging(true);
    showToast({
      title: 'Batch ISO Auto-Tagging Started',
      message: `Analyzing ${targets.length} evidence records against ISO/IEC 27001:2022 requirements and categories...`,
      type: 'info'
    });

    try {
      const itemsToScan = targets.map(t => ({
        id: t.id,
        title: t.title,
        fileName: t.fileName,
        controlCode: t.controlCode,
        department: t.department,
        tags: t.tags,
        documentText: t.documentExcerpt || t.title
      }));

      const batchResults = await scanBatchEvidenceWithISO(itemsToScan);
      const batchPayload = batchResults.map(r => ({
        id: r.id,
        mappings: r.scanResult.mappedRequirements,
        suggestedTags: r.scanResult.suggestedTags,
        scanResult: r.scanResult
      }));
      await batchAutoTagEvidenceWithISO(batchPayload);

      showToast({
        title: 'ISO Auto-Tagging Complete',
        message: `Successfully classified and tagged ${batchResults.length} evidence artefacts with ISO requirements!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Batch ISO auto-tag error:', err);
      showToast({
        title: 'ISO Auto-Tagging Failed',
        message: 'Unable to complete ISO requirements scan.',
        type: 'error'
      });
    } finally {
      setIsBatchIsoTagging(false);
    }
  };

  const handleScanSingleItemISO = async (item: EvidenceRecord) => {
    setScanningIsoItemId(item.id);
    showToast({
      title: 'Scanning Evidence with ISO Engine',
      message: `Evaluating "${item.title}" against ISO/IEC 27001:2022 requirements...`,
      type: 'info'
    });

    try {
      const result = await scanEvidenceWithISO({
        title: item.title,
        fileName: item.fileName,
        controlCode: item.controlCode,
        department: item.department,
        tags: item.tags,
        documentText: item.documentExcerpt || item.title
      });

      await autoTagEvidenceWithISO(
        item.id,
        result.mappedRequirements,
        result.suggestedTags,
        result
      );

      showToast({
        title: 'ISO Auto-Tagging Complete',
        message: `Classified as ${result.primaryCategory} with ${result.mappedRequirements.length} mapped requirements (${result.mappedRequirements.map(m => m.isoCode).join(', ')})`,
        type: 'success'
      });

      if (selectedEvidence?.id === item.id) {
        setSelectedEvidence(prev => prev ? {
          ...prev,
          isoRequirements: result.mappedRequirements.map(m => m.isoCode),
          isoMappings: result.mappedRequirements,
          isoScanResult: result,
          recommendedIsoCategory: result.primaryCategory,
          recommendedControlCode: result.recommendedControlCode,
          autoTaggedByAI: true,
          aiTaggedAt: new Date().toISOString()
        } : null);
      }
    } catch (err) {
      console.error('Single item ISO scan error:', err);
      showToast({
        title: 'Scan Error',
        message: 'Could not auto-tag evidence with ISO requirements.',
        type: 'error'
      });
    } finally {
      setScanningIsoItemId(null);
    }
  };

  const filteredEvidence = tenantEvidence.filter(e => {
    const vState = getVerificationState(e);
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Draft'
        ? e.status === 'Draft' || vState === 'Draft'
        : statusFilter === 'Pending Review'
        ? e.status === 'Pending Review' || vState === 'Pending Review'
        : statusFilter === 'Verified'
        ? e.status === 'Verified' || vState === 'Verified'
        : e.status === statusFilter;

    const matchesDept = departmentFilter === 'All' || e.department === departmentFilter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.controlCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.reviewedBy && e.reviewedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDpdp =
      dpdpClauseFilter === 'All'
        ? true
        : (e.dpdpClauses?.includes(dpdpClauseFilter) || e.dpdpMappings?.some(m => m.sectionCode === dpdpClauseFilter));

    const matchesIsoReq =
      isoRequirementFilter === 'All'
        ? true
        : (e.isoRequirements?.includes(isoRequirementFilter) || e.isoMappings?.some(m => m.isoCode === isoRequirementFilter));

    const matchesIsoCat =
      isoCategoryFilter === 'All'
        ? true
        : (e.recommendedIsoCategory === isoCategoryFilter || e.isoMappings?.some(m => m.category === isoCategoryFilter));

    const matchesAiTagged = !aiTaggedOnly || e.autoTaggedByAI === true;

    const matchesRetrospective = !retrospectiveSnapshot?.timestamp
      ? true
      : e.uploadedDate
      ? new Date(e.uploadedDate).getTime() <= new Date(retrospectiveSnapshot.timestamp).getTime()
      : false;

    return matchesStatus && matchesDept && matchesSearch && matchesDpdp && matchesIsoReq && matchesIsoCat && matchesAiTagged && matchesRetrospective;
  });

  // KPI calculations
  const draftCount = tenantEvidence.filter(e => getVerificationState(e) === 'Draft').length;
  const pendingCount = tenantEvidence.filter(e => getVerificationState(e) === 'Pending Review').length;
  const verifiedCount = tenantEvidence.filter(e => getVerificationState(e) === 'Verified').length;
  const dpdpTaggedCount = tenantEvidence.filter(e => (e.dpdpClauses && e.dpdpClauses.length > 0) || e.autoTaggedByAI).length;
  const isoTaggedCount = tenantEvidence.filter(e => (e.isoRequirements && e.isoRequirements.length > 0) || e.recommendedIsoCategory).length;
  const verificationRate =
    tenantEvidence.length > 0 ? Math.round((verifiedCount / tenantEvidence.length) * 100) : 0;

  // Preset quick feedback notes for auditor convenience
  const PRESET_AUDIT_NOTES = [
    'Conforms to ISO 27001:2022 Annex A requirements. Sample validated without exception.',
    'Cryptographic hash verified against source repository export. No unauthorized modifications detected.',
    'Sampled records substantiate operational effectiveness across the audit observation period.',
    'Insufficient sample size. Please attach full-quarter log export covering all in-scope nodes.'
  ];

  // Bulk Selection & Export State
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<Set<string>>(new Set());
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportProgressStatus, setExportProgressStatus] = useState('');
  const [exportProgressPercent, setExportProgressPercent] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [customPackageName, setCustomPackageName] = useState('');
  const [includeManifestOpt, setIncludeManifestOpt] = useState(true);
  const [includeIndexOpt, setIncludeIndexOpt] = useState(true);
  const [includeChecksumsOpt, setIncludeChecksumsOpt] = useState(true);
  const [organizeFoldersOpt, setOrganizeFoldersOpt] = useState(true);

  const handleToggleSelect = (id: string) => {
    setSelectedEvidenceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    const allFilteredIds = filteredEvidence.map(e => e.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedEvidenceIds.has(id));
    if (areAllSelected) {
      setSelectedEvidenceIds(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedEvidenceIds(prev => {
        const next = new Set(prev);
        allFilteredIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const handleSelectVerifiedOnly = () => {
    const verifiedIds = tenantEvidence
      .filter(e => (e.verificationState || e.status) === 'Verified')
      .map(e => e.id);
    setSelectedEvidenceIds(new Set(verifiedIds));
    showToast({
      title: 'Selected Verified Artefacts',
      message: `${verifiedIds.length} approved evidence records selected for auditor package.`,
      type: 'info'
    });
  };

  const handleSelectPendingOnly = () => {
    const pendingIds = tenantEvidence
      .filter(e => (e.verificationState || e.status) === 'Pending Review')
      .map(e => e.id);
    setSelectedEvidenceIds(new Set(pendingIds));
    showToast({
      title: 'Selected Pending Artefacts',
      message: `${pendingIds.length} artefacts selected for review.`,
      type: 'info'
    });
  };

  const handleClearSelection = () => {
    setSelectedEvidenceIds(new Set());
  };

  const handleOpenExportModal = (itemsToExport?: EvidenceRecord[]) => {
    const list = itemsToExport || (selectedEvidenceIds.size > 0
      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
      : filteredEvidence);

    if (list.length === 0) {
      showToast({
        title: 'No Artefacts to Export',
        message: 'Please select at least one evidence artefact or reset your filters.',
        type: 'warning'
      });
      return;
    }

    if (!customPackageName) {
      const tenantClean = (currentTenant?.name || 'Apex_Global').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      setCustomPackageName(`${tenantClean}_ISO27001_Evidence_Package_${dateStr}`);
    }
    setShowExportModal(true);
  };

  const handleExecuteExportZip = async () => {
    const listToExport = selectedEvidenceIds.size > 0
      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
      : filteredEvidence;

    if (listToExport.length === 0) return;

    setIsExportingZip(true);
    setExportProgressPercent(10);
    setExportProgressStatus('Initializing ZIP package...');

    try {
      const result = await exportEvidenceZipPackage({
        evidenceList: listToExport,
        tenant: currentTenant ? { id: currentTenant.id, name: currentTenant.name } : undefined,
        packageName: customPackageName,
        includeManifest: includeManifestOpt,
        includeIndexMd: includeIndexOpt,
        includeChecksums: includeChecksumsOpt,
        organizeByFolder: organizeFoldersOpt,
        currentUser: { name: currentUser.name, title: currentUser.title },
        currentRole,
        onProgress: (status, percent) => {
          setExportProgressStatus(status);
          if (percent) setExportProgressPercent(percent);
        }
      });

      downloadBlob(result.blob, result.filename);

      logAuditEvent(
        'EXPORT',
        'Evidence Centre',
        `Bulk exported ${listToExport.length} evidence artefacts as ZIP archive "${result.filename}" with SHA-256 manifest (${result.rootSha256.slice(0, 16)}...)`
      );

      showToast({
        title: 'Bulk Export Successful',
        message: `Downloaded "${result.filename}" with ${result.totalFiles} files and cryptographic manifest.`,
        type: 'success'
      });

      setActionFeedback(`Successfully downloaded "${result.filename}" (${listToExport.length} evidence records packaged for auditor submission).`);
      setTimeout(() => setActionFeedback(null), 5000);
      setShowExportModal(false);
    } catch (err: any) {
      console.error('Bulk export failed:', err);
      showToast({
        title: 'Export Failed',
        message: err?.message || 'Could not compile ZIP archive.',
        type: 'error'
      });
      setActionFeedback(`Export failed: ${err?.message || 'Unknown error'}`);
      setTimeout(() => setActionFeedback(null), 5000);
    } finally {
      setIsExportingZip(false);
      setExportProgressPercent(0);
      setExportProgressStatus('');
    }
  };

  const handleDownloadSingleEvidence = (item: EvidenceRecord) => {
    const generated = generateIndividualEvidenceContent(item, currentTenant?.name);
    const blob = new Blob([generated.content], { type: generated.mimeType });
    downloadBlob(blob, generated.filename);
    showToast({
      title: 'Artefact Downloaded',
      message: `Downloaded ${generated.filename} (${item.controlCode}).`,
      type: 'info'
    });
  };

  return (
    <PageContainer id="evidence-centre-module">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400/70 hover:text-emerald-300 text-xs px-2 py-0.5 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/50 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-800">
                Annex A Evidence Custody
              </span>
              <span className="text-xs text-slate-400">Total Artefacts: {tenantEvidence.length}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold">
                {verificationRate}% Verified
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Evidence Centre & Chain-of-Custody</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Centralized vault with a rigorous two-step verification lifecycle (Draft ➔ Pending Review ➔ Verified) visible to both auditors and compliance administrators.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={() => {
                setLinkagePreselectedItem(null);
                setEvidenceMainTab('linkage_wizard');
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02]"
              id="btn-evidence-linkage-wizard-top"
              title="Open Evidence Linkage Wizard to map multiple evidence items to targeted control requirements"
            >
              <Wand2 className="w-4 h-4 text-emerald-200" />
              <span>Evidence Linkage Wizard</span>
            </button>
            <button
              onClick={() => handleOpenExportModal()}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-sky-500/40 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
              id="btn-bulk-export-zip-top"
              title="Bulk export evidence records as a cryptographically sealed ZIP archive for auditor submission"
            >
              <FileArchive className="w-4 h-4 text-sky-400" />
              <span>Bulk Export (ZIP)</span>
              {selectedEvidenceIds.size > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-slate-950 font-mono font-bold text-[10px]">
                  {selectedEvidenceIds.size}
                </span>
              )}
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-all"
              title="Force sync state to durable persistent disk storage"
            >
              <Database className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : 'text-emerald-400'}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Persistence Store'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            <button
              onClick={() => setActiveModule('evidence_upload')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-900/30 transition-all hover:scale-[1.02]"
              id="btn-upload-evidence-top"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Evidence</span>
            </button>
          </div>
        </div>

        {/* Auditor & Admin Two-Step Governance & Four-Eyes Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">Current Session:</span>
              <span className="font-mono text-sky-300">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {currentRole}
              </span>
            </div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Four-Eyes Dual-Custody RBAC Enforced</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Draft (Custodian Ingestion)</span>
            </span>
            <span className="text-slate-600">➔</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Step 1: Submitted for Review</span>
            </span>
            <span className="text-slate-600">➔</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Step 2: Auditor/Admin Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setEvidenceMainTab('repository')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            evidenceMainTab === 'repository'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Evidence Repository & Cryptographic Ledger</span>
        </button>

        <button
          onClick={() => setEvidenceMainTab('triangulation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            evidenceMainTab === 'triangulation'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>ISO 19011 Triangulation Engine (§6.4.7)</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
            1–3 Star Audit Defense
          </span>
        </button>

        <button
          onClick={() => {
            setLinkagePreselectedItem(null);
            setEvidenceMainTab('linkage_wizard');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            evidenceMainTab === 'linkage_wizard'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>Evidence Linkage Wizard</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Multi-Modal Mapping
          </span>
        </button>
      </div>

      {evidenceMainTab === 'linkage_wizard' ? (
        <EvidenceLinkageWizard
          preselectedEvidenceId={linkagePreselectedItem?.id}
          preselectedControlCode={linkagePreselectedItem?.controlCode}
          onClose={() => {
            setLinkagePreselectedItem(null);
            setEvidenceMainTab('repository');
          }}
          onLinkageCompleted={() => {
            setLinkagePreselectedItem(null);
            setActionFeedback('Evidence linkage completed and certified for audit readiness.');
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      ) : evidenceMainTab === 'triangulation' ? (
        <EvidentiaryTriangulationEngine
          controls={currentTenant?.controls || []}
          evidenceList={tenantEvidence}
          onUploadEvidenceForControl={() => setActiveModule('evidence_upload')}
        />
      ) : (
        <>
          {/* Retrospective Time Travel Banner */}
          {retrospectiveSnapshot && (
            <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border border-amber-500/40 rounded-xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">
                      Retrospective Audit Inspection: Evidence Vault as of {retrospectiveSnapshot.period}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {retrospectiveSnapshot.deficient} Deficiencies Active at this Snapshot
                    </span>
                    {retrospectiveSnapshot.milestone && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {retrospectiveSnapshot.milestone}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Showing EvidenceVault items collected and verified on or before historical milestone cut-off date (<span className="font-mono text-amber-300 font-bold">{retrospectiveSnapshot.timestamp}</span>).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setRetrospectiveSnapshot(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Live Vault</span>
                </button>
                <button
                  onClick={() => setActiveModule('mas_gap_analysis')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Back to Gap Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

      {/* Two-Step Verification Process Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => {
            setStatusFilter('All');
            setAiTaggedOnly(false);
            setIsoCategoryFilter('All');
            setIsoRequirementFilter('All');
            setDpdpClauseFilter('All');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'All' && !aiTaggedOnly && isoCategoryFilter === 'All' && isoRequirementFilter === 'All' && dpdpClauseFilter === 'All'
              ? 'bg-sky-950/30 border-sky-500/50 ring-1 ring-sky-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">All Artefacts</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1">{tenantEvidence.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Full repository index</div>
        </button>

        <button
          onClick={() => setStatusFilter('Draft')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Draft'
              ? 'bg-slate-800/80 border-slate-500 ring-1 ring-slate-400/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-300">Draft</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Step 0/2
            </span>
          </div>
          <div className="text-xl font-bold text-slate-200 mt-1">{draftCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting review submission</div>
        </button>

        <button
          onClick={() => setStatusFilter('Pending Review')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Pending Review'
              ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-300">Pending Review</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
              Step 1/2
            </span>
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-amber-300/70 mt-0.5">Requires Auditor/Admin sign-off</div>
        </button>

        <button
          onClick={() => setStatusFilter('Verified')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            statusFilter === 'Verified'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300">Verified</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Step 2/2
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{verifiedCount}</div>
          <div className="text-[10px] text-emerald-300/70 mt-0.5">Accredited audit evidence</div>
        </button>

        <button
          onClick={() => {
            setAiTaggedOnly(prev => !prev);
            setStatusFilter('All');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            aiTaggedOnly
              ? 'bg-purple-950/50 border-purple-500/60 ring-1 ring-purple-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-purple-300">DPDP Mapped</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center space-x-0.5">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              <span>AI</span>
            </span>
          </div>
          <div className="text-xl font-bold text-purple-400 mt-1">{dpdpTaggedCount}</div>
          <div className="text-[10px] text-purple-300/70 mt-0.5">DPDP 2023 statutory clauses</div>
        </button>

        <button
          onClick={() => {
            setIsoCategoryFilter(prev => prev === 'All' ? 'Technological Controls (Clause A.8)' : 'All');
            setStatusFilter('All');
          }}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            isoCategoryFilter !== 'All' || isoTaggedCount > 0
              ? 'bg-sky-950/40 border-sky-500/50 ring-1 ring-sky-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-sky-300">ISO 27001 Tagged</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 flex items-center space-x-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-sky-400" />
              <span>ISO</span>
            </span>
          </div>
          <div className="text-xl font-bold text-sky-400 mt-1">{isoTaggedCount}</div>
          <div className="text-[10px] text-sky-300/70 mt-0.5">Annex A & ISMS mapped</div>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by title, control (A.5.15), uploader, reviewer, tags..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ISO 27001 Category Filter */}
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <select
              value={isoCategoryFilter}
              onChange={e => setIsoCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-sky-700/60 text-sky-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="All">All ISO Categories</option>
              <option value="Organizational Controls (Clause A.5)">Clause A.5 - Organizational</option>
              <option value="People Controls (Clause A.6)">Clause A.6 - People</option>
              <option value="Physical Controls (Clause A.7)">Clause A.7 - Physical</option>
              <option value="Technological Controls (Clause A.8)">Clause A.8 - Technological</option>
              <option value="ISMS Management Clauses (Clauses 4-10)">Clauses 4-10 - ISMS Framework</option>
            </select>
          </div>

          {/* ISO Requirement Filter */}
          <div className="flex items-center space-x-1.5">
            <select
              value={isoRequirementFilter}
              onChange={e => setIsoRequirementFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-sky-800/60 text-slate-200 focus:outline-none focus:border-sky-500 text-[11px]"
            >
              <option value="All">All ISO Requirements</option>
              {Object.values(ISO_REQUIREMENTS_CATALOG).map(req => (
                <option key={req.isoCode} value={req.isoCode}>
                  {req.isoCode} - {req.title.slice(0, 28)}...
                </option>
              ))}
            </select>
          </div>

          {/* DPDP Statutory Clause Filter */}
          <div className="flex items-center space-x-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={dpdpClauseFilter}
              onChange={e => setDpdpClauseFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-indigo-700/60 text-indigo-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="All">All DPDP Clauses</option>
              {DPDP_STATUTORY_CLAUSES.map(c => (
                <option key={c.sectionCode} value={c.sectionCode}>
                  {c.sectionCode}: Sec {c.sectionNumber} - {c.title.slice(0, 20)}...
                </option>
              ))}
            </select>
          </div>

          {/* AI Auto-Tagged Filter Toggle */}
          <button
            type="button"
            onClick={() => setAiTaggedOnly(prev => !prev)}
            className={`px-2.5 py-1.5 text-xs rounded-lg border flex items-center space-x-1.5 transition ${
              aiTaggedOnly
                ? 'bg-purple-950/80 text-purple-300 border-purple-600 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Tagged</span>
          </button>

          {/* Verification State Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Verification States</option>
              <option value="Draft">Draft (Step 0/2: In Preparation)</option>
              <option value="Pending Review">Pending Review (Step 1/2: Awaiting Audit)</option>
              <option value="Verified">Verified (Step 2/2: Approved)</option>
              <option value="Requires Update">Requires Update</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Departments</option>
            {masterDepartments.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Selection & Auditor Export Toolbar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Master Toggle Checkbox */}
          <button
            id="btn-select-all-filtered"
            type="button"
            onClick={handleToggleSelectAllFiltered}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            title="Toggle select all filtered artefacts"
          >
            {filteredEvidence.length > 0 && filteredEvidence.every(e => selectedEvidenceIds.has(e.id)) ? (
              <CheckSquare className="w-4 h-4 text-sky-400" />
            ) : filteredEvidence.some(e => selectedEvidenceIds.has(e.id)) ? (
              <MinusSquare className="w-4 h-4 text-sky-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span className="font-semibold">
              {selectedEvidenceIds.size > 0
                ? `${selectedEvidenceIds.size} of ${filteredEvidence.length} Selected`
                : `Select All (${filteredEvidence.length})`}
            </span>
          </button>

          {/* Quick Selection Pills */}
          <div className="flex items-center space-x-1.5 text-[11px] flex-wrap gap-y-1">
            <span className="text-slate-500 font-medium">Quick Select:</span>
            <button
              id="btn-quick-select-verified"
              onClick={handleSelectVerifiedOnly}
              className="px-2 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/60 transition"
              title="Select all verified artefacts for auditor package"
            >
              Verified Only ({verifiedCount})
            </button>
            <button
              id="btn-quick-select-pending"
              onClick={handleSelectPendingOnly}
              className="px-2 py-1 rounded-md bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border border-amber-800/60 transition"
              title="Select all pending review artefacts"
            >
              Pending ({pendingCount})
            </button>
            {selectedEvidenceIds.size > 0 && (
              <button
                id="btn-clear-selection"
                onClick={handleClearSelection}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action: Batch ISO Auto-Tag, DPDP Auto-Tag & Bulk Export Trigger */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <button
            id="btn-batch-iso-autotag"
            onClick={() => handleRunBatchIsoAutoTag(selectedEvidenceIds.size > 0)}
            disabled={isBatchIsoTagging}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-sky-950/40 transition-all hover:scale-[1.02] disabled:opacity-50"
            title="Scan artefacts with AI/Heuristics to classify into ISO 27001 Annex A requirements & categories"
          >
            {isBatchIsoTagging ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>
              {isBatchIsoTagging
                ? 'Scanning ISO...'
                : selectedEvidenceIds.size > 0
                ? `ISO Auto-Tag (${selectedEvidenceIds.size})`
                : 'Batch ISO Auto-Tag'}
            </span>
          </button>

          <button
            id="btn-batch-dpdp-autotag"
            onClick={() => handleRunBatchAutoTag(selectedEvidenceIds.size > 0)}
            disabled={isBatchAutoTagging}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-950/40 transition-all hover:scale-[1.02] disabled:opacity-50"
            title="Scan artefacts with Gemini and map them to DPDP 2023 statutory clauses"
          >
            {isBatchAutoTagging ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>
              {isBatchAutoTagging
                ? 'Scanning DPDP...'
                : selectedEvidenceIds.size > 0
                ? `AI Auto-Tag (${selectedEvidenceIds.size})`
                : 'Batch AI DPDP Auto-Tag'}
            </span>
          </button>

          <button
            id="btn-bulk-export-zip-bar"
            onClick={() => handleOpenExportModal()}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-slate-700 font-semibold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>
              Export {selectedEvidenceIds.size > 0 ? `${selectedEvidenceIds.size} Selected` : 'Filtered'} to ZIP
            </span>
          </button>
        </div>
      </div>

      {/* Evidence Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidence.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Evidence Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No evidence records match the current filter or search criteria. Try switching verification states or clearing the search bar.
            </p>
            <button
              onClick={() => {
                setStatusFilter('All');
                setDepartmentFilter('All');
                setSearchTerm('');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvidence.map(item => {
            const vState = getVerificationState(item);
            const isSelected = selectedEvidenceIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-500/40 bg-slate-900/95 shadow-sky-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Checkbox + Control Code & Prominent 'Verification State' Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        id={`select-evidence-${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(item.id);
                        }}
                        className={`p-0.5 rounded transition-colors ${
                          isSelected
                            ? 'text-sky-400 hover:text-sky-300'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={isSelected ? "Deselect from bulk export" : "Select for bulk export"}
                        aria-label={`Select ${item.title}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 hover:text-slate-400" />
                        )}
                      </button>
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
                        {item.controlCode}
                      </span>
                    </div>

                    {/* Dedicated 'Verification State' Badge */}
                    <div className="flex flex-col items-end">
                      {vState === 'Draft' && (
                        <span
                          className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-slate-800/90 text-slate-300 border-slate-600 shadow-sm"
                          title="Verification State: Draft (Step 0 of 2: In Preparation)"
                        >
                          <FileEdit className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Verification State: Draft (0/2)</span>
                        </span>
                      )}

                      {vState === 'Pending Review' && (
                        <span
                          className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-amber-950/70 text-amber-300 border-amber-500/50 shadow-sm animate-pulse"
                          title="Verification State: Pending Review (Step 1 of 2: In Review Queue)"
                        >
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Verification State: Pending Review (1/2)</span>
                        </span>
                      )}

                      {vState === 'Verified' && (
                        <span
                          className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-sm"
                          title="Verification State: Verified (Step 2 of 2: Fully Approved)"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Verification State: Verified (2/2)</span>
                        </span>
                      )}

                      {item.status === 'Requires Update' && (
                        <span className="text-[9px] text-rose-400 font-semibold mt-0.5">
                          Requires Custodian Update
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two-Step Visual Progress Stepper */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-[10px]">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300 text-[9px] uppercase tracking-wider">
                        Two-Step Verification Process
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {vState === 'Draft'
                          ? 'Stage: Ingestion'
                          : vState === 'Pending Review'
                          ? 'Stage: Under Audit'
                          : 'Stage: Approved'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[9px]">
                      {/* Step 1: Draft/Submission */}
                      <div
                        className={`flex items-center space-x-1 px-1.5 py-0.5 rounded ${
                          vState === 'Draft'
                            ? 'bg-slate-800 text-white font-medium border border-slate-700'
                            : 'text-emerald-400 font-medium'
                        }`}
                      >
                        {vState !== 'Draft' ? (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        )}
                        <span>1. Submit</span>
                      </div>

                      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

                      {/* Step 2: Auditor Verification */}
                      <div
                        className={`flex items-center space-x-1 px-1.5 py-0.5 rounded ${
                          vState === 'Pending Review'
                            ? 'bg-amber-950/80 text-amber-300 font-semibold border border-amber-700/50 animate-pulse'
                            : vState === 'Verified'
                            ? 'text-emerald-400 font-medium'
                            : 'text-slate-500'
                        }`}
                      >
                        {vState === 'Verified' ? (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              vState === 'Pending Review' ? 'bg-amber-400' : 'bg-slate-600'
                            }`}
                          />
                        )}
                        <span>2. Verify</span>
                      </div>

                      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

                      {/* Complete */}
                      <div
                        className={`flex items-center space-x-1 px-1.5 py-0.5 rounded ${
                          vState === 'Verified'
                            ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-700/50'
                            : 'text-slate-600'
                        }`}
                      >
                        {vState === 'Verified' && <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />}
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white leading-snug">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-1">
                      Department: {item.department} • File: {item.fileName}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* DPDP Statutory Clauses & AI Tagged Badges */}
                  {((item.dpdpClauses && item.dpdpClauses.length > 0) || item.autoTaggedByAI) && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      {item.autoTaggedByAI && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 inline-flex items-center space-x-1">
                          <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                          <span>AI Tagged</span>
                        </span>
                      )}
                      {(item.dpdpClauses || []).map(clauseCode => {
                        const style = getDpdpBadgeClasses(clauseCode);
                        const meta = getDpdpClauseMeta(clauseCode);
                        return (
                          <span
                            key={clauseCode}
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                            title={meta?.title || clauseCode}
                          >
                            DPDP {clauseCode}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* ISO 27001 Requirements & Category Badges */}
                  {((item.isoRequirements && item.isoRequirements.length > 0) || item.recommendedIsoCategory) && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      {item.recommendedIsoCategory && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border inline-flex items-center space-x-1 ${getIsoCategoryBadgeClasses(item.recommendedIsoCategory).bg} ${getIsoCategoryBadgeClasses(item.recommendedIsoCategory).text} ${getIsoCategoryBadgeClasses(item.recommendedIsoCategory).border}`}
                          title={`Classified Category: ${item.recommendedIsoCategory}`}
                        >
                          <ShieldCheck className="w-2.5 h-2.5 text-sky-400" />
                          <span>{item.recommendedIsoCategory.replace(' Controls', '').replace(' Management Clauses', '')}</span>
                        </span>
                      )}
                      {(item.isoRequirements || []).map(isoCode => (
                        <span
                          key={isoCode}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border bg-sky-950/70 text-sky-300 border-sky-700/60"
                          title={`ISO/IEC 27001 Requirement: ${isoCode}`}
                        >
                          ISO {isoCode}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Submitter & Auditor Stamping */}
                  <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                    {item.submittedBy && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-slate-500">Submitted:</span>
                        <span className="truncate max-w-[170px] text-slate-300">
                          {item.submittedBy}
                        </span>
                      </div>
                    )}
                    {item.reviewedBy && (
                      <div className="flex items-center justify-between text-emerald-400">
                        <span className="text-emerald-500/80">Auditor:</span>
                        <span className="truncate max-w-[170px] font-medium">
                          {item.reviewedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Two-Step Approval Actions & Metadata */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-[130px] font-medium text-slate-300">
                      {item.department}
                    </span>
                    <span>
                      {item.fileSize} • {item.fileType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-1 text-emerald-400 truncate max-w-[170px]" title={item.sha256Hash || item.auditHash || item.id}>
                      <Hash className="w-3 h-3 shrink-0 text-emerald-500" />
                      <span className="truncate">
                        {(item.sha256Hash || item.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855').slice(0, 16)}...
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyChecksum(item);
                      }}
                      className={`text-[9px] px-1.5 py-0.5 rounded flex items-center space-x-0.5 transition-colors ${
                        item.checksumVerified || item.integrityVerifiedAt
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                      title="Verify SHA-256 integrity checksum (ISO 27001 A.8.14 & A.8.28)"
                    >
                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                      <span>{item.checksumVerified || item.integrityVerifiedAt ? 'Certified' : 'Verify'}</span>
                    </button>
                  </div>

                  {/* Two-Step Approval Process Action Bar */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    {/* State-Specific Fast Action Button */}
                    {vState === 'Draft' && (
                      <button
                        onClick={() => handleSubmitForReview(item)}
                        className="w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                        title="Submit this evidence artifact into the review queue (Step 1 of 2)"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit for Review (Step 1)</span>
                      </button>
                    )}

                    {vState === 'Pending Review' && isAuditorOrAdmin && (
                      <div className="flex items-center space-x-1.5">
                        {checkIsSelfSubmitted(item) ? (
                          <div
                            className="flex-1 py-1 px-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300/90 text-[11px] font-medium flex items-center justify-center space-x-1 cursor-not-allowed"
                            title="Four-Eyes Dual Custody: You authored/submitted this item. You cannot verify your own evidence. Another auditor or administrator must provide independent sign-off."
                          >
                            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Self-Authored (Requires 2nd Sign-off)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuickVerify(item)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-sm transition-all"
                            title="Verify evidence compliance (Step 2 of 2 • Four-Eyes Validated)"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify (Step 2)</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleQuickReturnToDraft(item)}
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center"
                          title="Return to Draft for updates"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {vState === 'Pending Review' && !isAuditorOrAdmin && (
                      <div className="py-1 px-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300/90 text-center text-[11px] font-medium flex items-center justify-center space-x-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Awaiting Auditor Verification</span>
                      </div>
                    )}

                    {/* Review Details, Single Download & Delete Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 truncate max-w-[130px]" title={item.uploadedBy}>
                        By {item.uploadedBy}
                      </span>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          id={`btn-ai-scan-iso-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScanSingleItemISO(item);
                          }}
                          disabled={scanningIsoItemId === item.id}
                          className="p-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 hover:text-sky-200 transition-colors border border-sky-700/60 disabled:opacity-50"
                          title="Scan with AI to auto-classify ISO 27001 requirements & category"
                        >
                          <ShieldCheck className={`w-3 h-3 ${scanningIsoItemId === item.id ? 'animate-spin text-sky-400' : 'text-sky-400'}`} />
                        </button>
                        <button
                          id={`btn-ai-scan-dpdp-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScanSingleItem(item);
                          }}
                          disabled={scanningItemId === item.id}
                          className="p-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 hover:text-indigo-200 transition-colors border border-indigo-700/60 disabled:opacity-50"
                          title="Scan with Gemini to auto-map DPDP 2023 statutory clauses"
                        >
                          <Sparkles className={`w-3 h-3 ${scanningItemId === item.id ? 'animate-spin text-purple-400' : 'text-indigo-400'}`} />
                        </button>
                        <button
                          id={`btn-download-artefact-${item.id}`}
                          onClick={() => handleDownloadSingleEvidence(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors border border-slate-700"
                          title={`Download ${item.fileName} audit attestation`}
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEvidence(item);
                            setReviewNotes(item.reviewNotes || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 font-semibold text-xs border border-sky-500/30 flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review / Audit</span>
                        </button>
                        {isAuditorOrAdmin && (
                          <button
                            onClick={() => {
                              if (safeConfirm(`Delete evidence artifact "${item.title}"?`)) {
                                deleteEvidence(item.id);
                              }
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Evidence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Two-Step Verification & Audit Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {selectedEvidence.controlCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      getVerificationState(selectedEvidence) === 'Verified'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : getVerificationState(selectedEvidence) === 'Pending Review'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    Verification State: {getVerificationState(selectedEvidence)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedEvidence.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedEvidence(null);
                  setReviewNotes('');
                  setSubmissionNotes('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Visual Two-Step Approval Stepper in Modal */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Two-Step Verification Lifecycle
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Step 1: Draft & Ingestion */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    getVerificationState(selectedEvidence) === 'Draft'
                      ? 'bg-slate-900 border-sky-500/50 ring-1 ring-sky-500/20'
                      : 'bg-slate-900/50 border-emerald-500/30 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Step 1: Submission</span>
                    {getVerificationState(selectedEvidence) !== 'Draft' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Submitted</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        In Draft
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Uploaded by {selectedEvidence.uploadedBy} on {formatDate(selectedEvidence.uploadedDate)}
                  </p>
                  {selectedEvidence.submittedBy && (
                    <p className="text-[10px] text-sky-400 font-mono">
                      Formally submitted: {selectedEvidence.submittedBy}
                    </p>
                  )}
                </div>

                {/* Step 2: Auditor Verification */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    getVerificationState(selectedEvidence) === 'Verified'
                      ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/20'
                      : getVerificationState(selectedEvidence) === 'Pending Review'
                      ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Step 2: Audit Review</span>
                    {getVerificationState(selectedEvidence) === 'Verified' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : getVerificationState(selectedEvidence) === 'Pending Review' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                        Pending Sign-off
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedEvidence.reviewedBy ? (
                      <span className="text-emerald-300 font-medium">
                        Verified by {selectedEvidence.reviewedBy} on {formatDate(selectedEvidence.reviewDate)}
                      </span>
                    ) : (
                      'Authorized for Internal/External Auditors and Compliance Administrators'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* File & Evidence Metadata */}
            <div className="space-y-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLinkagePreselectedItem(selectedEvidence);
                  setSelectedEvidence(null);
                  setEvidenceMainTab('linkage_wizard');
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-md transition-all hover:scale-[1.01]"
              >
                <Wand2 className="w-4 h-4 text-emerald-200" />
                <span>Map to Controls in Evidence Linkage Wizard</span>
              </button>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">File Information</span>
                <div className="text-slate-200 font-medium">
                  {selectedEvidence.fileName} ({selectedEvidence.fileSize} • {selectedEvidence.fileType})
                </div>
                <div className="text-[11px] text-slate-400">
                  Department: <span className="text-slate-300">{selectedEvidence.department}</span>
                </div>
                <div className="pt-2 border-t border-slate-900 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ISO 27001 A.8.14 Cryptographic Hash</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVerifyChecksum(selectedEvidence)}
                      disabled={verifyingChecksumId === selectedEvidence.id}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${verifyingChecksumId === selectedEvidence.id ? 'animate-spin' : ''}`} />
                      <span>{selectedEvidence.checksumVerified || selectedEvidence.integrityVerifiedAt ? 'Re-Verify Checksum' : 'Verify SHA-256'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-300 break-all bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex items-start space-x-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[9px]">SHA-256 Digest:</span>
                      <span>{selectedEvidence.sha256Hash || selectedEvidence.auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
                    </div>
                  </div>
                  {selectedEvidence.integrityVerifiedAt && (
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Integrity certified at: {formatDate(selectedEvidence.integrityVerifiedAt)} (UTC)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DPDP 2023 Statutory Compliance & Auto-Tagging Intelligence Panel */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-950 border border-indigo-500/30 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>DPDP Act 2023 Statutory Mapping</span>
                        {selectedEvidence.autoTaggedByAI && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60 flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                            <span>AI Verified</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Statutory obligations, clause mapping rationale & penalty exposure
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleScanSingleItem(selectedEvidence)}
                    disabled={scanningItemId === selectedEvidence.id}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    {scanningItemId === selectedEvidence.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{scanningItemId === selectedEvidence.id ? 'Scanning...' : 'Re-Scan with Gemini'}</span>
                  </button>
                </div>

                {/* AI Summary / Context */}
                {selectedEvidence.dpdpScanResult?.summary && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Statutory Assessment Summary</span>
                    </div>
                    {selectedEvidence.dpdpScanResult.summary}
                  </div>
                )}

                {/* Statutory Penalty Risk Exposure */}
                {selectedEvidence.dpdpScanResult?.statutoryPenaltyRisk && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-rose-300 font-bold text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Maximum Non-Compliance Risk: {selectedEvidence.dpdpScanResult.statutoryPenaltyRisk.riskLevel}</span>
                      </div>
                      <span className="text-[11px] font-mono font-extrabold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                        ₹{selectedEvidence.dpdpScanResult.statutoryPenaltyRisk.maxExposureCrores} Crores
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-200/80">
                      {selectedEvidence.dpdpScanResult.statutoryPenaltyRisk.description}
                    </p>
                  </div>
                )}

                {/* Mapped Clauses List */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                    Mapped DPDP Statutory Sections ({selectedEvidence.dpdpMappings?.length || selectedEvidence.dpdpClauses?.length || 0})
                  </span>

                  {(!selectedEvidence.dpdpClauses || selectedEvidence.dpdpClauses.length === 0) && (!selectedEvidence.dpdpMappings || selectedEvidence.dpdpMappings.length === 0) ? (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 text-center text-slate-400 text-xs space-y-1">
                      <p>No DPDP clauses mapped yet.</p>
                      <button
                        type="button"
                        onClick={() => handleScanSingleItem(selectedEvidence)}
                        className="text-indigo-400 hover:text-indigo-300 underline text-xs font-medium"
                      >
                        Click here to trigger Gemini statutory auto-scan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedEvidence.dpdpMappings || selectedEvidence.dpdpClauses?.map(c => ({
                        sectionCode: c,
                        sectionNumber: getDpdpClauseMeta(c)?.sectionNumber || 0,
                        title: getDpdpClauseMeta(c)?.title || c,
                        rationale: 'Mapped to evidence control requirement and department workflows.',
                        relevanceScore: 90,
                        penaltyMaxCrores: getDpdpClauseMeta(c)?.penaltyMaxCrores || 50
                      })) || []).map((mapping, idx) => {
                        const style = getDpdpBadgeClasses(mapping.sectionCode);
                        const clauseMeta = getDpdpClauseMeta(mapping.sectionCode);
                        const secNum = mapping.sectionNumber ?? clauseMeta?.sectionNumber;
                        const fineCrores = mapping.penaltyMaxCrores ?? clauseMeta?.penaltyMaxCrores ?? 50;
                        return (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                                  {mapping.sectionCode} {secNum ? `(Sec ${secNum})` : ''}
                                </span>
                                <span className="text-xs font-semibold text-white">
                                  {mapping.title || mapping.sectionTitle || clauseMeta?.title || mapping.sectionCode}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px]">
                                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                  {mapping.relevanceScore}% Match
                                </span>
                                <span className="font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                                  Up to ₹{fineCrores} Cr
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pl-1 border-l-2 border-slate-800">
                              <strong className="text-slate-300">Statutory Rationale:</strong> {mapping.rationale}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AI Suggested Tags */}
                {selectedEvidence.dpdpScanResult?.suggestedTags && selectedEvidence.dpdpScanResult.suggestedTags.length > 0 && (
                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                      Statutory Search Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvidence.dpdpScanResult.suggestedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-indigo-300 border border-slate-800 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ISO/IEC 27001:2022 Requirements & Categorization Intelligence Panel */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/40 via-blue-950/20 to-slate-950 border border-sky-500/30 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>ISO/IEC 27001:2022 Requirements Auto-Tagger</span>
                        {selectedEvidence.recommendedIsoCategory && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700/60 flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                            <span>Classified</span>
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Annex A domain classification, audit objective alignment & testing procedures
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleScanSingleItemISO(selectedEvidence)}
                    disabled={scanningIsoItemId === selectedEvidence.id}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    {scanningIsoItemId === selectedEvidence.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3 h-3" />
                    )}
                    <span>{scanningIsoItemId === selectedEvidence.id ? 'Scanning ISO...' : 'Scan with ISO Engine'}</span>
                  </button>
                </div>

                {/* ISO Primary Category & Recommended Control Highlight */}
                {selectedEvidence.recommendedIsoCategory && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Primary Classified Category
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border inline-flex items-center space-x-1.5 ${getIsoCategoryBadgeClasses(selectedEvidence.recommendedIsoCategory).bg} ${getIsoCategoryBadgeClasses(selectedEvidence.recommendedIsoCategory).text} ${getIsoCategoryBadgeClasses(selectedEvidence.recommendedIsoCategory).border}`}>
                        <Shield className="w-3 h-3" />
                        <span>{selectedEvidence.recommendedIsoCategory}</span>
                      </span>
                    </div>

                    {selectedEvidence.recommendedControlCode && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Aligned Annex A Control
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-1 rounded-md bg-sky-950 text-sky-300 border border-sky-800">
                          {selectedEvidence.recommendedControlCode}
                        </span>
                      </div>
                    )}

                    {selectedEvidence.isoScanResult?.confidenceScore && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Confidence
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          {selectedEvidence.isoScanResult.confidenceScore}% Match
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ISO AI Summary */}
                {selectedEvidence.isoScanResult?.summary && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <div className="text-[10px] uppercase font-bold text-sky-400 mb-1 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      <span>ISO Audit Compliance Rationale</span>
                    </div>
                    {selectedEvidence.isoScanResult.summary}
                  </div>
                )}

                {/* Mapped ISO Requirements List */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                    Mapped ISO 27001 Requirements ({selectedEvidence.isoMappings?.length || selectedEvidence.isoRequirements?.length || 0})
                  </span>

                  {(!selectedEvidence.isoRequirements || selectedEvidence.isoRequirements.length === 0) && (!selectedEvidence.isoMappings || selectedEvidence.isoMappings.length === 0) ? (
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 text-center text-slate-400 text-xs space-y-1">
                      <p>No ISO requirements mapped yet.</p>
                      <button
                        type="button"
                        onClick={() => handleScanSingleItemISO(selectedEvidence)}
                        className="text-sky-400 hover:text-sky-300 underline font-medium"
                      >
                        Run ISO auto-tagging scan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {(selectedEvidence.isoMappings || (selectedEvidence.isoRequirements || []).map(code => ({
                        isoCode: code,
                        title: `ISO 27001 Control ${code}`,
                        category: 'Technological Controls (Clause A.8)',
                        relevanceScore: 90,
                        rationale: 'Automatically matched against standard Annex A control taxonomy.'
                      }))).map((mapping, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-sky-950 text-sky-300 border-sky-800">
                                {mapping.isoCode}
                              </span>
                              <span className="text-xs font-semibold text-white">
                                {mapping.title}
                              </span>
                            </div>
                            <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                              {mapping.relevanceScore}% Match
                            </span>
                          </div>

                          {mapping.auditObjective && (
                            <p className="text-[11px] text-slate-300 leading-relaxed pl-1 border-l-2 border-sky-700">
                              <strong className="text-sky-400">Audit Objective:</strong> {mapping.auditObjective}
                            </p>
                          )}

                          {mapping.testingProcedure && (
                            <p className="text-[11px] text-slate-400 leading-relaxed pl-1 border-l-2 border-slate-700">
                              <strong className="text-slate-300">Auditor Testing:</strong> {mapping.testingProcedure}
                            </p>
                          )}

                          <p className="text-[11px] text-slate-400 leading-relaxed pl-1 border-l-2 border-slate-800">
                            <strong className="text-slate-300">Compliance Rationale:</strong> {mapping.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ISO AI Suggested Tags */}
                {selectedEvidence.isoScanResult?.suggestedTags && selectedEvidence.isoScanResult.suggestedTags.length > 0 && (
                  <div className="pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                      ISO Compliance Search Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvidence.isoScanResult.suggestedTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-sky-300 border border-slate-800 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedEvidence.reviewNotes && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">
                    Audit Review History & Findings
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">{selectedEvidence.reviewNotes}</p>
                </div>
              )}

              {/* Step 1 Action if in Draft */}
              {getVerificationState(selectedEvidence) === 'Draft' && (
                <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/50 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white text-xs">
                      Step 1 Action: Submit for Formal Review
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    This item is currently in Draft state. Submitting it will advance it to Step 1:
                    Pending Review, placing it in the auditor worklist.
                  </p>
                  <button
                    onClick={() => handleSubmitForReview(selectedEvidence, submissionNotes)}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Advance to Step 1: Submit for Auditor Review</span>
                  </button>
                </div>
              )}

              {/* Step 2 Action if visible to Auditor or Admin */}
              {isAuditorOrAdmin ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Auditor / Admin Verification Decision (Step 2)</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      {currentRole}
                    </span>
                  </div>

                  {/* Four-Eyes Dual Custody Policy Warning */}
                  {checkIsSelfSubmitted(selectedEvidence) && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-amber-300">
                        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Four-Eyes Dual-Custody Restriction Enforced</span>
                      </div>
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">
                        Segregation of Duties Policy: You authored or submitted this evidence artifact (<span className="font-mono text-white">{selectedEvidence.uploadedBy}</span>). To prevent conflicts of interest and maintain audit integrity, self-verification is blocked. An independent Auditor or Compliance Officer must perform the verification decision.
                      </p>
                    </div>
                  )}

                  {/* Preset Audit Findings */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Quick Insert Audit Statements:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_AUDIT_NOTES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setReviewNotes(preset)}
                          className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left transition-colors"
                        >
                          {preset.slice(0, 38)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Enter audit observations, sample criteria, ISO 27001 conformity assessment notes..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleReviewAction('Verified')}
                      disabled={isProcessing || checkIsSelfSubmitted(selectedEvidence)}
                      className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all ${
                        checkIsSelfSubmitted(selectedEvidence)
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.01]'
                      }`}
                      title={checkIsSelfSubmitted(selectedEvidence) ? 'Self-verification prohibited by Four-Eyes Policy' : 'Approve & formally verify evidence'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify (Step 2)</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('Draft')}
                      disabled={isProcessing}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-amber-950/80 text-amber-300 font-semibold text-xs border border-slate-700 hover:border-amber-700/60 flex items-center justify-center space-x-1.5 transition-all"
                      title="Return evidence to Draft state for contributor remediation"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Return to Draft</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('Requires Update')}
                      disabled={isProcessing}
                      className="py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Require Update</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auditor Sign-off Restricted</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    Step 2 verification sign-off is restricted to Auditors (INTERNAL_AUDITOR, PLATFORM_AUDITOR) and Administrators (SUPER_ADMIN, COMPANY_ADMIN). Switch your session role to approve this evidence.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Floating Selection Action Dock */}
      {selectedEvidenceIds.size > 0 && (
        <div
          id="floating-evidence-dock"
          className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-40 flex items-center justify-between sm:justify-start space-x-3 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-sky-500/50 shadow-2xl shadow-sky-950/60 text-white animate-in slide-in-from-bottom-4"
        >
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-semibold text-xs text-sky-200">
              {selectedEvidenceIds.size} Artefact{selectedEvidenceIds.size !== 1 ? 's' : ''} Selected
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center space-x-2">
            <button
              id="btn-floating-bulk-export"
              onClick={() => handleOpenExportModal()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all hover:scale-105"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>Export ZIP Package</span>
            </button>
            <button
              id="btn-floating-clear-selection"
              onClick={handleClearSelection}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      </>
      )}

      {/* Bulk Export Modal */}
      {showExportModal && (
        <div
          id="modal-bulk-export"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
                    <FileArchive className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Auditor Bulk Evidence Export</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Compile selected evidence files into an ISO 27001 auditor-compliant ZIP package with cryptographic chain-of-custody attestations.
                </p>
              </div>
              <button
                onClick={() => !isExportingZip && setShowExportModal(false)}
                disabled={isExportingZip}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection Scope Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Export Scope:</span>
                <span className="font-semibold text-sky-400">
                  {selectedEvidenceIds.size > 0
                    ? `${selectedEvidenceIds.size} Selected Records`
                    : `${filteredEvidence.length} Filtered Records (All)`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Verified (Step 2/2)</span>
                  <span className="font-bold text-emerald-400">
                    {(selectedEvidenceIds.size > 0
                      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
                      : filteredEvidence
                    ).filter(e => (e.verificationState || e.status) === 'Verified').length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Pending Review (1/2)</span>
                  <span className="font-bold text-amber-400">
                    {(selectedEvidenceIds.size > 0
                      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
                      : filteredEvidence
                    ).filter(e => (e.verificationState || e.status) === 'Pending Review').length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Draft (0/2)</span>
                  <span className="font-bold text-slate-300">
                    {(selectedEvidenceIds.size > 0
                      ? tenantEvidence.filter(e => selectedEvidenceIds.has(e.id))
                      : filteredEvidence
                    ).filter(e => (e.verificationState || e.status) === 'Draft').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Package Archive Name
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customPackageName}
                    onChange={e => setCustomPackageName(e.target.value)}
                    placeholder="e.g. Apex_Global_ISO27001_Evidence_Package"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-slate-500 font-mono text-xs">.zip</span>
                </div>
              </div>

              {/* Package Inclusion Options */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Package Inclusions & Integrity Controls
                </label>

                <div className="space-y-2">
                  <label className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={includeManifestOpt}
                      onChange={e => setIncludeManifestOpt(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600 text-sky-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Include Machine-Readable Manifest (<code className="text-sky-300">manifest.json</code>)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Contains SHA-256 hashes, review metadata, ISO 27001 controls, and Four-Eyes dual-signoff chain.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={includeIndexOpt}
                      onChange={e => setIncludeIndexOpt(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600 text-sky-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Include Auditor Submission Index (<code className="text-sky-300">AUDIT_INDEX.md</code>)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Human-readable executive audit table with verification dates, auditors, and control mapping.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={includeChecksumsOpt}
                      onChange={e => setIncludeChecksumsOpt(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600 text-sky-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Include SHA-256 Checksums (<code className="text-sky-300">CHECKSUMS.sha256</code>)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Standard unix-format checksums file for automated auditor tamper-verification (<code className="text-slate-400">sha256sum -c</code>).
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={organizeFoldersOpt}
                      onChange={e => setOrganizeFoldersOpt(e.target.checked)}
                      className="mt-0.5 rounded border-slate-600 text-sky-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Organize by Department & Control Code Hierarchy
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Groups files into <code className="text-slate-400">evidence/Department/Control_Code/</code> folders.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Export Progress Indicator */}
            {isExportingZip && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-sky-300">
                    <Database className="w-4 h-4 animate-spin" />
                    <span className="font-semibold">{exportProgressStatus || 'Compiling ZIP package...'}</span>
                  </div>
                  <span className="font-mono text-sky-400 font-bold">{exportProgressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${exportProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isExportingZip}
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>

              <button
                id="btn-confirm-export-zip"
                type="button"
                disabled={isExportingZip}
                onClick={handleExecuteExportZip}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-950/40 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isExportingZip ? (
                  <>
                    <Database className="w-4 h-4 animate-spin" />
                    <span>Packaging Archive...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate & Download ZIP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
