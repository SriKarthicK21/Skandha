import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCheck2,
  Download,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Building,
  Award,
  Printer,
  FileText,
  ShieldCheck,
  Sparkles,
  Edit3,
  Check,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronsDownUp,
  Layers,
  Hash,
  Copy,
  ExternalLink,
  Cpu,
  X,
  AlertTriangle,
  Lock,
  Calendar,
  UserCheck,
  ClipboardList,
  ShieldAlert,
  ArrowRight,
  Database,
  KeyRound,
  FileSpreadsheet,
  Keyboard,
  FolderArchive,
  Zap
} from 'lucide-react';
import {
  ISO27701Control,
  PIMSAuditChecklistItem,
  ALL_ISO27701_SOA_CONTROLS,
  ISO27701_ANNEX_A_CONTROLS,
  ISO27701_ANNEX_B_CONTROLS,
  PIMS_AUDIT_DOSSIER_CHECKLIST,
  PIMSImplementationStatus,
  PIMSRoleType,
  PIMSAuditStage
} from '../../data/iso27701MasterData';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import { useToast } from '../common/ToastContainer';
import { PIMSProgressGauges } from './PIMSProgressGauges';
import { PIMSStatusIndicatorBadge } from './PIMSStatusIndicatorBadge';
import { motion, AnimatePresence } from 'motion/react';
import { AuditorSpeedReviewDock, SpeedReviewControlItem } from '../compliance/AuditorSpeedReviewDock';
import { UnifiedAuditBinderModal } from '../compliance/UnifiedAuditBinderModal';

interface ISO27701SoAWorkbenchProps {
  initialTab?: 'soa_matrix' | 'audit_dossier';
  onNavigateModule?: (moduleId: string) => void;
  tenantName?: string;
}

export type ScopingPreset = 'BOTH' | 'CONTROLLER_ONLY' | 'PROCESSOR_ONLY';

export interface PIMSCategoryDefinition {
  code: string;
  annex: 'Annex A' | 'Annex B';
  roleType: 'CONTROLLER' | 'PROCESSOR';
  title: string;
  shortTitle: string;
  description: string;
}

export const PIMS_CATEGORIES: PIMSCategoryDefinition[] = [
  {
    code: '7.2',
    annex: 'Annex A',
    roleType: 'CONTROLLER',
    title: 'Conditions for collection and processing',
    shortTitle: '7.2 Collection & Lawful Basis',
    description: 'Purposes, legal basis, consent mechanisms, sensitive PII, and customer privacy notice'
  },
  {
    code: '7.3',
    annex: 'Annex A',
    roleType: 'CONTROLLER',
    title: 'Obligations to PII principals',
    shortTitle: '7.3 Principal Rights & DSAR',
    description: 'Data subject rights (DSAR), access, rectification, erasure, objection, and consent withdrawal'
  },
  {
    code: '7.4',
    annex: 'Annex A',
    roleType: 'CONTROLLER',
    title: 'Privacy by design and privacy by default',
    shortTitle: '7.4 Privacy by Design & Retention',
    description: 'Data minimization, retention limits, disposal, transmission protection, and automated decision-making'
  },
  {
    code: '7.5',
    annex: 'Annex A',
    roleType: 'CONTROLLER',
    title: 'PII sharing, transfer and disclosure',
    shortTitle: '7.5 Cross-Border & Disclosures',
    description: 'Third-party sharing, cross-border adequacy, subprocessor records, and legal disclosures'
  },
  {
    code: '8.2',
    annex: 'Annex B',
    roleType: 'PROCESSOR',
    title: 'Conditions for collection and processing',
    shortTitle: '8.2 Customer Instructions',
    description: 'Processor obligations to adhere to customer DPA instructions, customer notice, and lawful processing boundaries'
  },
  {
    code: '8.3',
    annex: 'Annex B',
    roleType: 'PROCESSOR',
    title: 'Obligations to PII principals',
    shortTitle: '8.3 Rights Assistance',
    description: 'Technical and operational measures to assist customer controllers in fulfilling DSAR inquiries'
  },
  {
    code: '8.4',
    annex: 'Annex B',
    roleType: 'PROCESSOR',
    title: 'Privacy by design and privacy by default',
    shortTitle: '8.4 Ephemeral & Disposal',
    description: 'Temporary files, secure media disposal, encryption in transit/rest, and processing logging'
  },
  {
    code: '8.5',
    annex: 'Annex B',
    roleType: 'PROCESSOR',
    title: 'PII sharing, transfer and disclosure',
    shortTitle: '8.5 Subprocessors & Transfer',
    description: 'Subprocessor vetting, flow-down DPAs, customer authorization, notification, and cross-border transfers'
  }
];

export const ISO27701SoAWorkbench: React.FC<ISO27701SoAWorkbenchProps> = ({
  initialTab = 'soa_matrix',
  onNavigateModule,
  tenantName
}) => {
  const { currentTenant, logAuditEvent, theme } = useGRC();
  const { showToast } = useToast();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'soa_matrix' | 'audit_dossier'>(initialTab);

  // =========================================================================
  // STATE: STATEMENT OF APPLICABILITY (SoA) BUILDER
  // =========================================================================
  const [controls, setControls] = useState<ISO27701Control[]>(ALL_ISO27701_SOA_CONTROLS);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CONTROLLER' | 'PROCESSOR'>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [justificationFilter, setJustificationFilter] = useState<'ALL' | 'MISSING' | 'VALIDATED'>('ALL');
  const [scopingPreset, setScopingPreset] = useState<ScopingPreset>('BOTH');

  // Category Expansion State
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PIMS_CATEGORIES.forEach(cat => {
      initial[cat.code] = true;
    });
    return initial;
  });

  // Control Editing & Inspection State
  const [inspectingControl, setInspectingControl] = useState<ISO27701Control | null>(null);
  const [editingControlCode, setEditingControlCode] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<PIMSImplementationStatus>('Implemented');
  const [editedApplicable, setEditedApplicable] = useState<boolean>(true);
  const [editedJustification, setEditedJustification] = useState<string>('');
  const [editedExclusionReason, setEditedExclusionReason] = useState<string>('');
  const [editedResponsibleLead, setEditedResponsibleLead] = useState<string>('');

  // Status Indicator Transition & Visual Feedback State
  const [recentlyUpdatedControls, setRecentlyUpdatedControls] = useState<Record<string, { timestamp: number; status: PIMSImplementationStatus }>>({});
  const [recentlyUpdatedAuditItems, setRecentlyUpdatedAuditItems] = useState<Record<string, number>>({});

  const markControlUpdated = (code: string, newStatus: PIMSImplementationStatus) => {
    setRecentlyUpdatedControls(prev => ({
      ...prev,
      [code]: { timestamp: Date.now(), status: newStatus }
    }));
  };

  const isControlRecentlyUpdated = (code: string): boolean => {
    const record = recentlyUpdatedControls[code];
    if (!record) return false;
    return Date.now() - record.timestamp < 2500;
  };

  // Cryptographic Lockdown & Version
  const [soaVersion, setSoaVersion] = useState<string>('v2.4-ISO27701-PIMS');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [cryptoDigest, setCryptoDigest] = useState<string>('sha256-e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8');
  const [showSealModal, setShowSealModal] = useState<boolean>(false);

  // =========================================================================
  // STATE: PIMS STAGE 1 & 2 AUDIT READINESS DOSSIER
  // =========================================================================
  const [dossierChecklist, setDossierChecklist] = useState<PIMSAuditChecklistItem[]>(PIMS_AUDIT_DOSSIER_CHECKLIST);
  const [dossierStageFilter, setDossierStageFilter] = useState<'ALL' | PIMSAuditStage>('ALL');
  const [dossierStatusFilter, setDossierStatusFilter] = useState<string>('ALL');
  const [dossierSearch, setDossierSearch] = useState<string>('');
  const [selectedAuditItem, setSelectedAuditItem] = useState<PIMSAuditChecklistItem | null>(null);
  const [showDossierPackageModal, setShowDossierPackageModal] = useState<boolean>(false);

  // Speed-Review Dock & Consolidated Audit Binder
  const [isSpeedReviewOpen, setIsSpeedReviewOpen] = useState<boolean>(false);
  const [currentSpeedIndex, setCurrentSpeedIndex] = useState<number>(0);
  const [showAuditBinderModal, setShowAuditBinderModal] = useState<boolean>(false);

  // =========================================================================
  // DOMAIN LIST FOR FILTERING
  // =========================================================================
  const DOMAINS = useMemo(() => [
    { code: 'ALL', label: 'All Domains (49 controls)', count: controls.length },
    { code: '7.2', label: '7.2 Collection & Lawful Basis (8)', count: 8, annex: 'Annex A' },
    { code: '7.3', label: '7.3 Principal Rights & DSAR (10)', count: 10, annex: 'Annex A' },
    { code: '7.4', label: '7.4 Privacy by Design & Retention (9)', count: 9, annex: 'Annex A' },
    { code: '7.5', label: '7.5 Cross-Border & Disclosures (4)', count: 4, annex: 'Annex A' },
    { code: '8.2', label: '8.2 Customer Instructions (6)', count: 6, annex: 'Annex B' },
    { code: '8.3', label: '8.3 Rights Assistance (2)', count: 2, annex: 'Annex B' },
    { code: '8.4', label: '8.4 Ephemeral & Disposal (3)', count: 3, annex: 'Annex B' },
    { code: '8.5', label: '8.5 Subprocessors & Transfer (8)', count: 8, annex: 'Annex B' }
  ], [controls]);

  // =========================================================================
  // FILTERING LOGIC: SoA MATRIX
  // =========================================================================
  const filteredControls = useMemo(() => {
    return controls.filter(c => {
      // Role filter
      if (roleFilter === 'CONTROLLER' && c.roleType !== 'CONTROLLER') return false;
      if (roleFilter === 'PROCESSOR' && c.roleType !== 'PROCESSOR') return false;

      // Domain filter
      if (selectedDomain !== 'ALL' && c.domainCode !== selectedDomain) return false;

      // Status filter
      if (statusFilter === 'APPLICABLE' && !c.applicable) return false;
      if (statusFilter === 'EXCLUDED' && c.applicable) return false;
      if (statusFilter !== 'ALL' && statusFilter !== 'APPLICABLE' && statusFilter !== 'EXCLUDED') {
        if (c.implementationStatus !== statusFilter) return false;
      }

      // Justification check
      if (justificationFilter === 'MISSING') {
        const isMissing = !c.justification || c.justification.trim().length < 15;
        if (!isMissing) return false;
      } else if (justificationFilter === 'VALIDATED') {
        const isValid = c.justification && c.justification.trim().length >= 15;
        if (!isValid) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.controlCode.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.guidanceSummary.toLowerCase().includes(q) ||
          c.justification.toLowerCase().includes(q) ||
          c.responsibleLead.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [controls, roleFilter, selectedDomain, statusFilter, justificationFilter, searchQuery]);

  // Auditor Speed-Review Dock Adaptor
  const dockControls: SpeedReviewControlItem[] = useMemo(() => {
    return filteredControls.map(c => ({
      id: c.id,
      controlCode: c.controlCode,
      title: c.title,
      description: c.objective,
      guidance: c.guidanceSummary,
      category: `${c.annex} • ${c.roleType}`,
      implementationStatus: c.implementationStatus,
      applicable: c.applicable,
      justification: c.justification,
      evidenceRequirements: c.suggestedEvidenceTypes,
      responsibleDepartment: c.responsibleLead,
      framework: 'ISO/IEC 27701:2019'
    }));
  }, [filteredControls]);

  const handleDockUpdateControl = (controlId: string, updates: Partial<SpeedReviewControlItem>) => {
    setControls(prev =>
      prev.map(c => {
        if (c.id === controlId) {
          const newStatus = (updates.implementationStatus as PIMSImplementationStatus) || c.implementationStatus;
          markControlUpdated(c.controlCode, newStatus);
          return {
            ...c,
            implementationStatus: newStatus,
            applicable: updates.applicable !== undefined ? updates.applicable : c.applicable,
            justification: updates.justification !== undefined ? updates.justification : c.justification
          };
        }
        return c;
      })
    );
  };

  // =========================================================================
  // CATEGORY GROUPING & EXPAND/COLLAPSE MANAGEMENT
  // =========================================================================
  const groupedControls = useMemo(() => {
    return PIMS_CATEGORIES.map(category => {
      const catControls = filteredControls.filter(c => c.domainCode === category.code);
      const implementedCount = catControls.filter(c => c.implementationStatus === 'Implemented').length;
      const partialCount = catControls.filter(c => c.implementationStatus === 'Partially Implemented').length;
      const excludedCount = catControls.filter(c => !c.applicable || c.implementationStatus === 'Not Applicable').length;
      return {
        category,
        controls: catControls,
        implementedCount,
        partialCount,
        excludedCount,
        totalCount: catControls.length
      };
    }).filter(group => group.totalCount > 0);
  }, [filteredControls]);

  // Expansion state metrics
  const isAllExpanded = useMemo(() => {
    if (groupedControls.length === 0) return true;
    return groupedControls.every(g => expandedCategories[g.category.code]);
  }, [groupedControls, expandedCategories]);

  const isAllCollapsed = useMemo(() => {
    if (groupedControls.length === 0) return false;
    return groupedControls.every(g => !expandedCategories[g.category.code]);
  }, [groupedControls, expandedCategories]);

  const expandedCount = useMemo(() => {
    return groupedControls.filter(g => expandedCategories[g.category.code]).length;
  }, [groupedControls, expandedCategories]);

  // Auto-expand categories containing matching controls when searching
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setExpandedCategories(prev => {
        const next = { ...prev };
        groupedControls.forEach(g => {
          next[g.category.code] = true;
        });
        return next;
      });
    }
  }, [searchQuery, groupedControls]);

  // Handlers for category toggles
  const handleToggleAllCategories = () => {
    const nextState = !isAllExpanded;
    setExpandedCategories(prev => {
      const updated = { ...prev };
      groupedControls.forEach(g => {
        updated[g.category.code] = nextState;
      });
      return updated;
    });
  };

  const handleExpandAll = () => {
    setExpandedCategories(prev => {
      const updated = { ...prev };
      groupedControls.forEach(g => {
        updated[g.category.code] = true;
      });
      return updated;
    });
  };

  const handleCollapseAll = () => {
    setExpandedCategories(prev => {
      const updated = { ...prev };
      groupedControls.forEach(g => {
        updated[g.category.code] = false;
      });
      return updated;
    });
  };

  const handleToggleCategory = (categoryCode: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryCode]: !prev[categoryCode]
    }));
  };

  // =========================================================================
  // METRICS COMPUTATION
  // =========================================================================
  const soaMetrics = useMemo(() => {
    const total = controls.length;
    const annexACount = controls.filter(c => c.annex === 'Annex A').length;
    const annexBCount = controls.filter(c => c.annex === 'Annex B').length;
    const applicable = controls.filter(c => c.applicable).length;
    const excluded = controls.filter(c => !c.applicable).length;
    const implemented = controls.filter(c => c.implementationStatus === 'Implemented').length;
    const partiallyImplemented = controls.filter(c => c.implementationStatus === 'Partially Implemented').length;
    const notApplicable = controls.filter(c => c.implementationStatus === 'Not Applicable').length;
    
    // Controls lacking mandatory auditor justification
    const missingJustifications = controls.filter(
      c => c.applicable && (!c.justification || c.justification.trim().length < 15)
    ).length;

    const compliancePercent = total > 0 ? Math.round(((implemented * 1.0 + partiallyImplemented * 0.5) / total) * 100) : 0;

    return {
      total,
      annexACount,
      annexBCount,
      applicable,
      excluded,
      implemented,
      partiallyImplemented,
      notApplicable,
      missingJustifications,
      compliancePercent
    };
  }, [controls]);

  // =========================================================================
  // FILTERING LOGIC: PIMS AUDIT DOSSIER
  // =========================================================================
  const filteredDossier = useMemo(() => {
    return dossierChecklist.filter(item => {
      if (dossierStageFilter !== 'ALL' && item.stage !== dossierStageFilter) return false;
      if (dossierStatusFilter !== 'ALL' && item.status !== dossierStatusFilter) return false;
      if (dossierSearch.trim()) {
        const q = dossierSearch.toLowerCase();
        return (
          item.clauseCode.toLowerCase().includes(q) ||
          item.clauseTitle.toLowerCase().includes(q) ||
          item.auditorRequirement.toLowerCase().includes(q) ||
          (item.evidenceName && item.evidenceName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [dossierChecklist, dossierStageFilter, dossierStatusFilter, dossierSearch]);

  const dossierMetrics = useMemo(() => {
    const total = dossierChecklist.length;
    const passed = dossierChecklist.filter(i => i.status === 'AUDITED_PASS').length;
    const inReview = dossierChecklist.filter(i => i.status === 'IN_REVIEW').length;
    const actionRequired = dossierChecklist.filter(i => i.status === 'ACTION_REQUIRED').length;
    const majorGaps = dossierChecklist.filter(i => i.status === 'MAJOR_GAP').length;
    const evidenceAttached = dossierChecklist.filter(i => i.evidenceVerified).length;
    const readinessScore = Math.round((passed / total) * 100);

    return {
      total,
      passed,
      inReview,
      actionRequired,
      majorGaps,
      evidenceAttached,
      readinessScore
    };
  }, [dossierChecklist]);

  // =========================================================================
  // HANDLERS: SoA EDITING
  // =========================================================================
  const handleStartEdit = (ctrl: ISO27701Control) => {
    setEditingControlCode(ctrl.controlCode);
    setEditedStatus(ctrl.implementationStatus);
    setEditedApplicable(ctrl.applicable);
    setEditedJustification(ctrl.justification || '');
    setEditedExclusionReason(ctrl.exclusionReason || '');
    setEditedResponsibleLead(ctrl.responsibleLead || '');
    // Ensure the control's category is expanded
    setExpandedCategories(prev => ({
      ...prev,
      [ctrl.domainCode]: true
    }));
  };

  const handleQuickUpdateStatus = (code: string, newStatus: PIMSImplementationStatus) => {
    const isApplicable = newStatus !== 'Not Applicable';
    setControls(prev =>
      prev.map(c => {
        if (c.controlCode === code) {
          return {
            ...c,
            applicable: isApplicable,
            implementationStatus: newStatus,
            exclusionReason: !isApplicable ? (c.exclusionReason || 'Formally excluded from organization PIMS scope.') : undefined
          };
        }
        return c;
      })
    );
    markControlUpdated(code, newStatus);
    showToast({
      title: 'Status Updated',
      message: `Control ${code} status updated to "${newStatus}"`,
      type: 'success'
    });
    logAuditEvent('UPDATE', 'ISO 27701 SoA', `Quick updated control ${code} status to ${newStatus}`);
  };

  const handleSaveEdit = (code: string) => {
    const finalStatus: PIMSImplementationStatus = editedApplicable ? editedStatus : 'Not Applicable';
    setControls(prev =>
      prev.map(c => {
        if (c.controlCode === code) {
          const updated: ISO27701Control = {
            ...c,
            applicable: editedApplicable,
            implementationStatus: finalStatus,
            justification: editedJustification,
            exclusionReason: !editedApplicable ? editedExclusionReason : undefined,
            responsibleLead: editedResponsibleLead
          };
          return updated;
        }
        return c;
      })
    );
    markControlUpdated(code, finalStatus);
    setEditingControlCode(null);
    showToast({
      title: 'SoA Control Updated',
      message: `Auditor justification and status (${finalStatus}) updated for control ${code}`,
      type: 'success'
    });
    logAuditEvent('UPDATE', 'ISO 27701 SoA', `Updated control ${code} status to ${finalStatus}`);
  };

  // Preset Application
  const handleApplyPreset = (preset: ScopingPreset) => {
    setScopingPreset(preset);
    setControls(prev =>
      prev.map(c => {
        if (preset === 'CONTROLLER_ONLY') {
          if (c.annex === 'Annex B') {
            return {
              ...c,
              applicable: false,
              implementationStatus: 'Not Applicable',
              exclusionReason: 'Excluded: Organization operates solely as PII Controller; no third-party processor services provided.'
            };
          } else {
            return { ...c, applicable: true, implementationStatus: c.implementationStatus === 'Not Applicable' ? 'Implemented' : c.implementationStatus };
          }
        } else if (preset === 'PROCESSOR_ONLY') {
          if (c.annex === 'Annex A') {
            return {
              ...c,
              applicable: false,
              implementationStatus: 'Not Applicable',
              exclusionReason: 'Excluded: Organization operates strictly as SaaS / Cloud PII Processor under customer master DPAs.'
            };
          } else {
            return { ...c, applicable: true, implementationStatus: c.implementationStatus === 'Not Applicable' ? 'Implemented' : c.implementationStatus };
          }
        } else {
          // BOTH (Hybrid)
          return {
            ...c,
            applicable: true,
            implementationStatus: c.implementationStatus === 'Not Applicable' ? 'Implemented' : c.implementationStatus,
            exclusionReason: undefined
          };
        }
      })
    );
    showToast({
      title: 'Scoping Preset Applied',
      message: `Applied ${preset === 'BOTH' ? 'Dual-Role (Controller & Processor)' : preset} scoping profile`,
      type: 'info'
    });
  };

  // Cryptographic Lockdown
  const handleSealBaseline = () => {
    const timestamp = new Date().toISOString();
    const mockHash = `sha256-${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setCryptoDigest(mockHash);
    setIsLocked(true);
    setShowSealModal(false);
    showToast({
      title: 'SoA Baseline Sealed',
      message: `Statement of Applicability locked for Lead Auditor certification: ${mockHash.substring(0, 16)}...`,
      type: 'success'
    });
    logAuditEvent('LOCK_BASELINE', 'ISO 27701 SoA', `Cryptographic seal applied: ${mockHash}`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Control Code',
      'Annex',
      'Clause Ref',
      'Role Type',
      'Domain',
      'Title',
      'Applicable',
      'Implementation Status',
      'Mandatory Auditor Justification',
      'Exclusion Rationale',
      'Responsible Lead',
      'Mapped ISO 27001 Controls',
      'Mapped GDPR Articles'
    ];

    const rows = controls.map(c => [
      `"${c.controlCode}"`,
      `"${c.annex}"`,
      `"${c.clauseRef}"`,
      `"${c.roleType}"`,
      `"${c.domainCode} ${c.domainTitle}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      c.applicable ? 'Yes' : 'No',
      `"${c.implementationStatus}"`,
      `"${(c.justification || '').replace(/"/g, '""')}"`,
      `"${(c.exclusionReason || '').replace(/"/g, '""')}"`,
      `"${c.responsibleLead}"`,
      `"${c.mappedIso27001Controls.join(', ')}"`,
      `"${c.mappedGdprArticles.join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ISO_27701_SoA_Matrix_${currentTenant?.name || 'ApexFinTech'}_v2.4.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      title: 'SoA Exported',
      message: 'Downloaded accredited ISO 27701 Statement of Applicability CSV',
      type: 'success'
    });
  };

  // Toggle Audit Item Status
  const handleToggleAuditItemStatus = (id: string, newStatus: PIMSAuditChecklistItem['status']) => {
    setDossierChecklist(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            evidenceVerified: newStatus === 'AUDITED_PASS' ? true : item.evidenceVerified
          };
        }
        return item;
      })
    );
    setRecentlyUpdatedAuditItems(prev => ({
      ...prev,
      [id]: Date.now()
    }));
    showToast({
      title: 'Audit Finding Updated',
      message: `Audit workpaper status set to ${newStatus}`,
      type: 'info'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Banner & Navigation Header */}
      <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ISO/IEC 27701:2019 PIMS Extension</span>
              </span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Annex A (31) + Annex B (18) Controls
              </span>
              {isLocked ? (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Baseline Sealed ({cryptoDigest.substring(0, 10)}...)</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-400">
                  Version: {soaVersion}
                </span>
              )}
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              ISO 27701 Statement of Applicability (SoA) & Audit Dossier
            </h1>

            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Authoritative control matrix for Privacy Information Management Systems (PIMS). Delineates Annex A
              (Controller) and Annex B (Processor) controls with mandatory auditor justifications, statutory crosswalks,
              and certifier-ready Stage 1 & Stage 2 evidence packaging.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="iso27701-speed-review-toggle-btn"
              onClick={() => {
                setIsSpeedReviewOpen(prev => !prev);
                if (!isSpeedReviewOpen && dockControls.length > 0) {
                  setCurrentSpeedIndex(0);
                }
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
                isSpeedReviewOpen
                  ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-900/40'
                  : 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-800 text-indigo-300'
              }`}
              title="Toggle Auditor Speed Review Dock (Shortcuts: J/K to navigate, 1/2/3 to update status, E for evidence)"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSpeedReviewOpen ? 'Close Speed Dock' : 'Auditor Speed Dock [J/K]'}</span>
            </button>

            <button
              id="iso27701-audit-binder-btn"
              onClick={() => setShowAuditBinderModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-medium text-xs flex items-center space-x-2 transition cursor-pointer"
              title="Consolidated Audit Binder Generator (One-Click ZIP Bundle)"
            >
              <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Binder (ZIP)</span>
            </button>

            {onNavigateModule && (
              <button
                onClick={() => onNavigateModule('compliance_heatmap')}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>View in Compliance Heatmap</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export SoA (CSV)</span>
            </button>

            <button
              onClick={() => setShowSealModal(true)}
              disabled={isLocked}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm ${
                isLocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isLocked ? 'Baseline Locked' : 'Seal SoA Baseline'}</span>
            </button>
          </div>
        </div>

        {/* Primary View Mode Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('soa_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'soa_matrix'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Interactive SoA Builder (Annex A & B)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-black/20 text-white">
              {soaMetrics.total} Controls
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit_dossier')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'audit_dossier'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>PIMS Stage 1 & Stage 2 Audit Dossier</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-black/20 text-white">
              {dossierMetrics.total} Clauses
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: STATEMENT OF APPLICABILITY (SoA) BUILDER */}
      {activeTab === 'soa_matrix' && (
        <div className="space-y-6">
          {/* Circular Progress Indicator: Annex A & B Implementation Posture (Recharts) */}
          <PIMSProgressGauges
            controls={controls}
            activeRoleFilter={roleFilter}
            onSelectRoleFilter={(newRole) => setRoleFilter(newRole)}
            scopingPreset={scopingPreset}
            theme={theme}
          />

          {/* Top KPI Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Controls</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {soaMetrics.total}
                </span>
                <span className="text-[11px] font-mono text-indigo-500">
                  {soaMetrics.annexACount}A / {soaMetrics.annexBCount}B
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">31 Controller + 18 Processor</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Implemented</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {soaMetrics.implemented}
                </span>
                <span className="text-[11px] font-mono text-emerald-500">
                  {Math.round((soaMetrics.implemented / soaMetrics.total) * 100)}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Fully operational controls</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Partially Implemented</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {soaMetrics.partiallyImplemented}
                </span>
                <span className="text-[11px] font-mono text-amber-500">In Progress</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Under remediation SLA</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Not Applicable</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  {soaMetrics.notApplicable}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Excluded</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Requires justification</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              soaMetrics.missingJustifications > 0
                ? 'bg-rose-500/10 border-rose-500/30'
                : theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`text-[11px] uppercase font-semibold ${
                soaMetrics.missingJustifications > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
              }`}>
                Missing Justifications
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${
                  soaMetrics.missingJustifications > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-500'
                }`}>
                  {soaMetrics.missingJustifications}
                </span>
                {soaMetrics.missingJustifications > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                    Audit Risk
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {soaMetrics.missingJustifications === 0 ? 'All 100% justified' : 'Mandatory for certification'}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">PIMS Coverage</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {soaMetrics.compliancePercent}%
                </span>
                <span className="text-[11px] font-mono text-indigo-500">SoA Index</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Calculated posture score</span>
            </div>
          </div>

          {/* Scope Profiles & Role Segmentation Bar */}
          <div className={`p-4 rounded-2xl border shadow-sm ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Role Scope Preset */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Organizational PIMS Role Scope:</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApplyPreset('BOTH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      scopingPreset === 'BOTH'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>Hybrid (Both Controller & Processor)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white">49 Controls</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('CONTROLLER_ONLY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      scopingPreset === 'CONTROLLER_ONLY'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>PII Controller Primary (Annex A Only)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white">31 Controls</span>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('PROCESSOR_ONLY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                      scopingPreset === 'PROCESSOR_ONLY'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>PII Processor / SaaS Provider (Annex B Only)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white">18 Controls</span>
                  </button>
                </div>
              </div>

              {/* Annex Filter Tabs & Category Toggle */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <button
                    onClick={() => setRoleFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      roleFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All (49)
                  </button>
                  <button
                    onClick={() => setRoleFilter('CONTROLLER')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                      roleFilter === 'CONTROLLER'
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Annex A: Controllers (31)</span>
                  </button>
                  <button
                    onClick={() => setRoleFilter('PROCESSOR')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                      roleFilter === 'PROCESSOR'
                        ? 'bg-purple-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Annex B: Processors (18)</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <button
                    type="button"
                    onClick={handleToggleAllCategories}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white shadow-2xs"
                    title={isAllExpanded ? "Collapse all categories" : "Expand all categories"}
                  >
                    {isAllExpanded ? (
                      <>
                        <ChevronsDownUp className="w-3.5 h-3.5 text-slate-500" />
                        <span>Collapse Categories</span>
                      </>
                    ) : (
                      <>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Expand Categories</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtering and Search Controls */}
          <div className={`p-4 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search code, title, justification..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Domain Filter */}
              <div>
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                >
                  {DOMAINS.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                >
                  <option value="ALL">All Implementation Statuses</option>
                  <option value="Implemented">Implemented</option>
                  <option value="Partially Implemented">Partially Implemented</option>
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="APPLICABLE">Applicable Controls Only</option>
                  <option value="EXCLUDED">Excluded Controls Only</option>
                </select>
              </div>

              {/* Auditor Justification Check */}
              <div>
                <select
                  value={justificationFilter}
                  onChange={e => setJustificationFilter(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      : 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500'
                  }`}
                >
                  <option value="ALL">All Justification States</option>
                  <option value="MISSING">Missing Mandatory Justification</option>
                  <option value="VALIDATED">Auditor Validated Justification</option>
                </select>
              </div>
            </div>
          </div>

          {/* SoA Table Matrix */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  ISO 27701 Control Applicability & Justification Matrix
                </span>
                <span className="text-xs text-slate-400">
                  (Showing {filteredControls.length} of {controls.length} controls in {groupedControls.length} categories)
                </span>
              </div>

              {/* Expand All / Collapse All Toggle Group */}
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {expandedCount} of {groupedControls.length} categories expanded
                </span>

                <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs">
                  <button
                    type="button"
                    onClick={handleExpandAll}
                    disabled={isAllExpanded}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                      isAllExpanded
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-2xs font-semibold'
                    }`}
                    title="Expand all categories across Annex A and Annex B"
                  >
                    <ChevronsUpDown className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Expand All</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCollapseAll}
                    disabled={isAllCollapsed}
                    className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                      isAllCollapsed
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-2xs font-semibold'
                    }`}
                    title="Collapse all categories to high-level domain summaries"
                  >
                    <ChevronsDownUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  theme === 'light'
                    ? 'bg-slate-50/80 text-slate-500 border-slate-200'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="py-3 px-4 w-28">Control Code</th>
                    <th className="py-3 px-4 w-40">Domain / Role</th>
                    <th className="py-3 px-4">Title & Objective</th>
                    <th className="py-3 px-4 w-44">Status Indicator</th>
                    <th className="py-3 px-4 min-w-[280px]">Mandatory Auditor Justification</th>
                    <th className="py-3 px-4 w-36">Responsible Lead</th>
                    <th className="py-3 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {groupedControls.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 px-4 text-center">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                        <p className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          No ISO 27701 controls matched your filter criteria
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting search query, annex selector, or status filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    groupedControls.map(group => {
                      const isExpanded = !!expandedCategories[group.category.code];

                      return (
                        <React.Fragment key={`category-group-${group.category.code}`}>
                          {/* Collapsible Category Header Row */}
                          <tr
                            onClick={() => handleToggleCategory(group.category.code)}
                            className={`cursor-pointer select-none transition-colors border-y ${
                              group.category.annex === 'Annex A'
                                ? theme === 'light'
                                  ? 'bg-indigo-50/70 hover:bg-indigo-100/70 border-indigo-200/80'
                                  : 'bg-indigo-950/30 hover:bg-indigo-950/50 border-indigo-900/60'
                                : theme === 'light'
                                  ? 'bg-purple-50/70 hover:bg-purple-100/70 border-purple-200/80'
                                  : 'bg-purple-950/30 hover:bg-purple-950/50 border-purple-900/60'
                            }`}
                          >
                            <td colSpan={7} className="py-2.5 px-4">
                              <div className="flex flex-wrap items-center justify-between gap-2.5">
                                {/* Left: Toggle Icon, Annex Badge, Category Code & Title */}
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-transform duration-200 ${
                                      isExpanded
                                        ? 'rotate-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs'
                                        : '-rotate-90 bg-white/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                                    }`}
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </div>

                                  <span
                                    className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-wider uppercase ${
                                      group.category.annex === 'Annex A'
                                        ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                                        : 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                                    }`}
                                  >
                                    {group.category.annex} • {group.category.roleType}
                                  </span>

                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`font-mono font-bold text-xs ${
                                        group.category.annex === 'Annex A'
                                          ? 'text-indigo-700 dark:text-indigo-400'
                                          : 'text-purple-700 dark:text-purple-400'
                                      }`}
                                    >
                                      Clause {group.category.code}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                      {group.category.title}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                      ({group.totalCount} {group.totalCount === 1 ? 'control' : 'controls'})
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Stats badges & expand/collapse label */}
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                                      {group.implementedCount}/{group.totalCount} Implemented
                                    </span>
                                    {group.partialCount > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                        {group.partialCount} Partial
                                      </span>
                                    )}
                                    {group.excludedCount > 0 && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                                        {group.excludedCount} Excluded
                                      </span>
                                    )}
                                  </div>

                                  <span
                                    className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center space-x-1 transition ${
                                      isExpanded
                                        ? 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 font-semibold shadow-2xs'
                                    }`}
                                  >
                                    <span>{isExpanded ? 'Collapse' : `Expand (${group.totalCount})`}</span>
                                    {isExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-slate-400" />
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>

                          {/* Control Rows (shown when category is expanded) */}
                          {isExpanded &&
                            group.controls.map(ctrl => {
                              const isEditing = editingControlCode === ctrl.controlCode;
                              const hasJustification = ctrl.justification && ctrl.justification.trim().length >= 15;

                              return (
                                <tr
                                  key={ctrl.id}
                                  className={`transition-colors ${
                                    theme === 'light' ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                                  } ${!ctrl.applicable ? 'opacity-70 bg-slate-50/40 dark:bg-slate-950/30' : ''}`}
                                >
                                  {/* Control Code & Annex */}
                                  <td className="py-3.5 px-4 font-mono font-bold align-top">
                                    <span className={`text-xs ${
                                      ctrl.annex === 'Annex A' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'
                                    }`}>
                                      {ctrl.controlCode}
                                    </span>
                                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                      {ctrl.annex}
                                    </span>
                                  </td>

                                  {/* Domain & Role */}
                                  <td className="py-3.5 px-4 align-top">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                      ctrl.roleType === 'CONTROLLER'
                                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                        : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                    }`}>
                                      {ctrl.roleType}
                                    </span>
                                    <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                      {ctrl.domainCode} {ctrl.domainTitle}
                                    </span>
                                  </td>

                                  {/* Title & Guidance */}
                                  <td className="py-3.5 px-4 align-top max-w-sm">
                                    <div className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                      {ctrl.title}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                      {ctrl.guidanceSummary}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                      {ctrl.mappedIso27001Controls.slice(0, 2).map((isoRef, idx) => (
                                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                          ISO {isoRef}
                                        </span>
                                      ))}
                                      {ctrl.mappedGdprArticles.slice(0, 2).map((gdprRef, idx) => (
                                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                          GDPR {gdprRef}
                                        </span>
                                      ))}
                                    </div>
                                  </td>

                                  {/* Status Indicator */}
                                  <td className="py-3.5 px-4 align-top">
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        <select
                                          value={editedStatus}
                                          onChange={e => setEditedStatus(e.target.value as PIMSImplementationStatus)}
                                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 outline-none ${
                                            theme === 'light' ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500' : 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                                          }`}
                                        >
                                          <option value="Implemented">Implemented</option>
                                          <option value="Partially Implemented">Partially Implemented</option>
                                          <option value="Not Applicable">Not Applicable</option>
                                        </select>

                                        <label className="flex items-center space-x-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={editedApplicable}
                                            onChange={e => setEditedApplicable(e.target.checked)}
                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                          />
                                          <span>Applicable to PIMS</span>
                                        </label>
                                      </div>
                                    ) : (
                                      <div>
                                        <PIMSStatusIndicatorBadge
                                          id={`soa-status-badge-${ctrl.controlCode}`}
                                          status={ctrl.implementationStatus}
                                          applicable={ctrl.applicable}
                                          isRecentlyUpdated={isControlRecentlyUpdated(ctrl.controlCode)}
                                          onChangeStatus={newStatus => handleQuickUpdateStatus(ctrl.controlCode, newStatus)}
                                          theme={theme}
                                        />

                                        <span className="block text-[10px] text-slate-400 mt-1">
                                          {ctrl.applicable ? 'Scope: Applicable' : 'Scope: Excluded'}
                                        </span>
                                      </div>
                                    )}
                                  </td>

                                  {/* Mandatory Auditor Justification */}
                                  <td className="py-3.5 px-4 align-top">
                                    {isEditing ? (
                                      <div className="space-y-2">
                                        {editedApplicable ? (
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                                              Auditor Inclusion Justification (Mandatory):
                                            </label>
                                            <textarea
                                              value={editedJustification}
                                              onChange={e => setEditedJustification(e.target.value)}
                                              placeholder="State statutory basis, technical implementation architecture, and reason for applicability..."
                                              rows={3}
                                              className={`w-full p-2 rounded-lg border text-xs ${
                                                theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                                              }`}
                                            />
                                          </div>
                                        ) : (
                                          <div>
                                            <label className="text-[10px] font-bold uppercase text-rose-500 block mb-1">
                                              Formal Exclusion Justification (Mandatory for Auditor):
                                            </label>
                                            <textarea
                                              value={editedExclusionReason}
                                              onChange={e => setEditedExclusionReason(e.target.value)}
                                              placeholder="State why this control is non-applicable to the organization's PIMS boundary..."
                                              rows={3}
                                              className={`w-full p-2 rounded-lg border text-xs ${
                                                theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                                              }`}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div>
                                        {ctrl.applicable ? (
                                          hasJustification ? (
                                            <div className="space-y-1">
                                              <p className={`text-xs leading-relaxed ${
                                                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                                              }`}>
                                                {ctrl.justification}
                                              </p>
                                              <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-emerald-500">
                                                <Check className="w-2.5 h-2.5" />
                                                <span>Auditor verified inclusion rationale</span>
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                                              <div className="font-bold flex items-center space-x-1">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                <span>Justification Missing</span>
                                              </div>
                                              <span className="text-[11px]">Mandatory text field required for Stage 1 audit pass.</span>
                                            </div>
                                          )
                                        ) : (
                                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                                            <span className="text-[10px] font-bold uppercase text-slate-500 block">Exclusion Rationale:</span>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 italic">
                                              {ctrl.exclusionReason || 'No formal exclusion rationale documented.'}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Responsible Lead */}
                                  <td className="py-3.5 px-4 align-top">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editedResponsibleLead}
                                        onChange={e => setEditedResponsibleLead(e.target.value)}
                                        className={`w-full px-2 py-1.5 rounded-lg border text-xs ${
                                          theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'
                                        }`}
                                      />
                                    ) : (
                                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {ctrl.responsibleLead}
                                      </span>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3.5 px-4 align-top text-right space-x-1">
                                    {isEditing ? (
                                      <div className="flex items-center justify-end space-x-1">
                                        <button
                                          onClick={() => handleSaveEdit(ctrl.controlCode)}
                                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                                          title="Save control justification"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingControlCode(null)}
                                          className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition"
                                          title="Cancel"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-end space-x-1">
                                        <button
                                          onClick={() => handleStartEdit(ctrl)}
                                          className={`p-1.5 rounded-lg border transition ${
                                            theme === 'light'
                                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                          }`}
                                          title="Edit justification & status"
                                        >
                                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                                        </button>
                                        <button
                                          onClick={() => setInspectingControl(ctrl)}
                                          className={`p-1.5 rounded-lg border transition ${
                                            theme === 'light'
                                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                          }`}
                                          title="Inspect audit evidence & test procedures"
                                        >
                                          <Info className="w-3.5 h-3.5 text-slate-400" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIMS STAGE 1 & STAGE 2 AUDIT READINESS DOSSIER */}
      {activeTab === 'audit_dossier' && (
        <div className="space-y-6">
          {/* Top Dossier Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Certifier Readiness</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${
                  dossierMetrics.readinessScore >= 85 ? 'text-emerald-500' : 'text-amber-500'
                }`}>
                  {dossierMetrics.readinessScore}%
                </span>
                <span className="text-[11px] font-mono text-emerald-500">Stage 1 & 2</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Clauses 5.1 to 8.5 checked</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Audited Pass</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {dossierMetrics.passed} / {dossierMetrics.total}
                </span>
                <span className="text-[11px] font-mono text-emerald-500">Verified</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Evidence cross-referenced</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 uppercase font-semibold">In Review / Action Req.</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {dossierMetrics.inReview + dossierMetrics.actionRequired}
                </span>
                <span className="text-[11px] font-mono text-amber-500">Workpapers</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Lead auditor testing</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              dossierMetrics.majorGaps > 0
                ? 'bg-rose-500/10 border-rose-500/30'
                : theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`text-[11px] uppercase font-semibold ${
                dossierMetrics.majorGaps > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}>
                Major Non-Conformities
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-2xl font-extrabold ${
                  dossierMetrics.majorGaps > 0 ? 'text-rose-600' : 'text-emerald-500'
                }`}>
                  {dossierMetrics.majorGaps}
                </span>
                <span className="text-[11px] font-mono text-slate-400">Certifier Risk</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {dossierMetrics.majorGaps === 0 ? 'Zero critical blockers' : 'Blocks Stage 2 certification'}
              </span>
            </div>
          </div>

          {/* Dossier Filter & Certifier Package Trigger */}
          <div className={`p-4 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDossierStageFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    dossierStageFilter === 'ALL'
                      ? 'bg-emerald-600 text-white font-bold'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Clauses (5.1 - 8.5)
                </button>
                <button
                  onClick={() => setDossierStageFilter('STAGE_1_DOCUMENTATION')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    dossierStageFilter === 'STAGE_1_DOCUMENTATION'
                      ? 'bg-indigo-600 text-white font-bold'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>Stage 1: Documentation & ISMS Extension (Cl. 5-6)</span>
                </button>
                <button
                  onClick={() => setDossierStageFilter('STAGE_2_OPERATIONAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    dossierStageFilter === 'STAGE_2_OPERATIONAL'
                      ? 'bg-purple-600 text-white font-bold'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>Stage 2: Operational Evidence Tests (Cl. 7-8)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDossierPackageModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Certifier Evidence Dossier Package</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Dossier Checklist Items */}
          <div className="space-y-3.5">
            {filteredDossier.map(item => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Clause info & requirement */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        ISO 27701 §{item.clauseCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.clauseTitle}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        item.stage === 'STAGE_1_DOCUMENTATION'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}>
                        {item.stage === 'STAGE_1_DOCUMENTATION' ? 'Stage 1 Document Review' : 'Stage 2 Operational Audit'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Role: {item.targetRole}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      <strong className="text-slate-900 dark:text-white">Auditor Requirement: </strong>
                      {item.auditorRequirement}
                    </p>

                    {/* Testing procedure */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Lead Auditor Testing Procedure:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.testingProcedure}
                      </p>
                    </div>

                    {/* Evidence Cross-Referencing */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Mandatory Artifacts:</span>
                        {item.mandatoryEvidence.map((evd, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          >
                            {evd}
                          </span>
                        ))}
                      </div>

                      {item.evidenceName && (
                        <div className="flex items-center space-x-1.5 text-xs text-indigo-500 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Linked: {item.evidenceName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status & Auditor Controls */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <AnimatePresence>
                        {recentlyUpdatedAuditItems[item.id] && Date.now() - recentlyUpdatedAuditItems[item.id] < 2500 && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.7, x: 4 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-500"
                          >
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            <span>Updated</span>
                          </motion.span>
                        )}
                      </AnimatePresence>

                      <motion.div
                        key={item.status}
                        initial={{ scale: 0.94, opacity: 0.8 }}
                        animate={{ scale: [0.94, 1.03, 1], opacity: 1 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <select
                          id={`dossier-status-${item.id}`}
                          value={item.status}
                          onChange={e => handleToggleAuditItemStatus(item.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all duration-300 ${
                            recentlyUpdatedAuditItems[item.id] && Date.now() - recentlyUpdatedAuditItems[item.id] < 2500
                              ? 'ring-2 ring-emerald-500/50 ring-offset-1 shadow-sm'
                              : ''
                          } ${
                            item.status === 'AUDITED_PASS'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : item.status === 'IN_REVIEW'
                              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30'
                              : item.status === 'ACTION_REQUIRED'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <option value="AUDITED_PASS">AUDITED PASS</option>
                          <option value="IN_REVIEW">IN REVIEW</option>
                          <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
                          <option value="MAJOR_GAP">MAJOR GAP (MNC)</option>
                        </select>
                      </motion.div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Lead Auditor Attestation:</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {item.leadAuditorVerificationNotes}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedAuditItem(item)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        theme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      Inspect Workpapers & Findings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CONTROL DETAILS & AUDIT INSPECTOR */}
      {inspectingControl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-start justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-500">
                    {inspectingControl.controlCode}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {inspectingControl.clauseRef}
                  </span>
                  <PIMSStatusIndicatorBadge
                    id={`inspect-status-badge-${inspectingControl.controlCode}`}
                    status={inspectingControl.implementationStatus}
                    applicable={inspectingControl.applicable}
                    isRecentlyUpdated={isControlRecentlyUpdated(inspectingControl.controlCode)}
                    onChangeStatus={newStatus => {
                      handleQuickUpdateStatus(inspectingControl.controlCode, newStatus);
                      setInspectingControl(prev => prev ? {
                        ...prev,
                        implementationStatus: newStatus,
                        applicable: newStatus !== 'Not Applicable'
                      } : null);
                    }}
                    size="sm"
                    theme={theme}
                  />
                </div>
                <h3 className={`text-base font-bold mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {inspectingControl.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingControl(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">Objective:</span>
                <p className={`p-3 rounded-xl leading-relaxed ${
                  theme === 'light' ? 'bg-slate-50 text-slate-700' : 'bg-slate-950 text-slate-300'
                }`}>
                  {inspectingControl.objective}
                </p>
              </div>

              <div>
                <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">Auditor Testing Procedure:</span>
                <p className={`p-3 rounded-xl leading-relaxed ${
                  theme === 'light' ? 'bg-slate-50 text-slate-700' : 'bg-slate-950 text-slate-300'
                }`}>
                  {inspectingControl.auditorTestProcedure}
                </p>
              </div>

              <div>
                <span className="font-bold uppercase text-[10px] text-slate-400 block mb-1">Recommended Evidence Types:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingControl.suggestedEvidenceTypes.map((evd, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                      {evd}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-400 block">Regulatory Crosswalks:</span>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span><strong>ISO 27001:</strong> {inspectingControl.mappedIso27001Controls.join(', ')}</span>
                  <span>•</span>
                  <span><strong>GDPR:</strong> {inspectingControl.mappedGdprArticles.join(', ')}</span>
                  <span>•</span>
                  <span><strong>DPDP Act:</strong> {inspectingControl.mappedDpdpSections.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setInspectingControl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold"
              >
                Close Workpaper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CERTIFIER EVIDENCE DOSSIER PACKAGE */}
      {showDossierPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-3xl p-6 rounded-2xl border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-emerald-500">ISO/IEC 27701:2019 Certifier Package</span>
                <h3 className={`text-lg font-bold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Consolidated Lead Auditor Evidence Dossier
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ready for external certification body (BSI, SGS, TÜV SÜD) audit committee review.
                </p>
              </div>
              <button
                onClick={() => setShowDossierPackageModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Summary Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Certifier Evidence Crosswalk:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>1. Policy & Scope Documentation</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Joint ISMS-PIMS Scope Charter v2.4, Board Ratified PIMS Policy v3.0, DPO Appointment Charter.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>2. Training & Competence Logs</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    96.8% LMS course completion logs, DPO CIPP/E & CIPM credentials, phishing simulation records.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>3. DPIA & Risk Assessment Dossiers</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Section 10 / ISO 29134 DPIA for AI credit underwriting and biometric facial match onboarding.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>4. Third-Party & Subprocessor Audit Reports</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Executed DPAs for AWS/Datadog, SOC 2 Type II reports, 30-day prior change customer notices.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
              <span className="font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Certification Body Attestation Statement</span>
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                This dossier package satisfies ISO/IEC 17021-1 and ISO/IEC 27006 audit evidence requirements for PIMS
                accreditation. All sampled records demonstrate continuous operational effectiveness across the 12-month
                audit cycle.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowDossierPackageModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CRYPTOGRAPHIC SEAL MODAL */}
      {showSealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center space-x-2 text-indigo-500">
              <Lock className="w-5 h-5" />
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Seal Statement of Applicability Baseline
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Locking this SoA baseline computes an immutable SHA-256 cryptographic digest of all 49 control
              justifications and applicability declarations. This locks the baseline against unauthorized modifications
              during the Stage 1 certifier audit.
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              Target Baseline: ISO 27701:2019 v2.4 ({organizationService.getOrganizationName(currentTenant, tenantName)})
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowSealModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSealBaseline}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Confirm Cryptographic Seal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auditor Split-Pane Speed Review Dock for PIMS */}
      <AuditorSpeedReviewDock
        isOpen={isSpeedReviewOpen}
        onClose={() => setIsSpeedReviewOpen(false)}
        controls={dockControls}
        currentControlIndex={currentSpeedIndex}
        onSelectControlIndex={setCurrentSpeedIndex}
        onUpdateControl={handleDockUpdateControl}
        theme={theme}
        isPims={true}
      />

      {/* Unified Audit Binder Package Modal for PIMS */}
      <UnifiedAuditBinderModal
        isOpen={showAuditBinderModal}
        onClose={() => setShowAuditBinderModal(false)}
        preselectedFramework="ISO/IEC 27701:2019"
      />
    </div>
  );
};
