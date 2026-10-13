import React, { useState, useMemo } from 'react';
import {
  DPDPDataFlowLink,
  INITIAL_DATA_FLOWS,
  DPDPDataSensitivity,
  DPDPComplianceHealth,
  buildDataFlowProofHash
} from '../../data/dpdpDataFlowData';
import { useToast } from '../common/ToastContainer';
import {
  GitFork,
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Share2,
  ExternalLink,
  Cpu,
  Database,
  ArrowRight,
  Server,
  Lock,
  Globe,
  Baby,
  Scale,
  CheckCircle2,
  XCircle,
  Eye,
  Hash,
  Clock,
  Sparkles,
  Info,
  Check,
  Building,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const DPDPDataFlowVisualizer: React.FC = () => {
  const { showToast } = useToast();

  const [flows, setFlows] = useState<DPDPDataFlowLink[]>(INITIAL_DATA_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>('flow_1');
  const [viewMode, setViewMode] = useState<'PIPELINE' | 'ROPA_MATRIX' | 'GAP_ANALYSIS'>('PIPELINE');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [sensitivityFilter, setSensitivityFilter] = useState('ALL');

  // Interactive selection state for nodes
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [highlightedActivity, setHighlightedActivity] = useState<string | null>(null);
  const [highlightedClause, setHighlightedClause] = useState<string | null>(null);

  // Modal State for New Flow
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDept, setNewFlowDept] = useState('Operations & Technology');
  const [newConsentType, setNewConsentType] = useState<DPDPDataFlowLink['consentSourceType']>('WEB_PORTAL');
  const [newConsentSource, setNewConsentSource] = useState('Bilingual Multilingual Web Portal');
  const [newNoticeLang, setNewNoticeLang] = useState('English + Hindi + Regional');
  const [newDataCategory, setNewDataCategory] = useState('Direct Identifiers (Name, Phone, PAN)');
  const [newDataClassification, setNewDataClassification] = useState('Customer Personal Data');
  const [newSensitivity, setNewSensitivity] = useState<DPDPDataSensitivity>('HIGH');
  const [newProcessingActivity, setNewProcessingActivity] = useState('');
  const [newProcessingPurpose, setNewProcessingPurpose] = useState('');
  const [newInfrastructure, setNewInfrastructure] = useState('AWS Mumbai (ap-south-1) Encrypted');
  const [newRetention, setNewRetention] = useState('180 days post purpose fulfillment');
  const [newStatutoryClause, setNewStatutoryClause] = useState('Section 6(1) Clear Prior Notice & Unbundled Consent');
  const [newStatutoryClauseCode, setNewStatutoryClauseCode] = useState('SEC-06(1)');
  const [newStatutoryBasis, setNewStatutoryBasis] = useState<DPDPDataFlowLink['statutoryBasis']>('EXPLICIT_CONSENT');
  const [newCrossBorder, setNewCrossBorder] = useState(false);
  const [newDestination, setNewDestination] = useState('');

  // Filtered flows
  const filteredFlows = useMemo(() => {
    return flows.filter(flow => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          flow.name.toLowerCase().includes(q) ||
          flow.flowCode.toLowerCase().includes(q) ||
          flow.consentSourceName.toLowerCase().includes(q) ||
          flow.dataCategoryName.toLowerCase().includes(q) ||
          flow.processingActivityName.toLowerCase().includes(q) ||
          flow.primaryStatutoryClause.toLowerCase().includes(q) ||
          flow.department.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (departmentFilter !== 'ALL' && flow.department !== departmentFilter) return false;
      if (healthFilter !== 'ALL' && flow.complianceHealth !== healthFilter) return false;
      if (sensitivityFilter !== 'ALL' && flow.sensitivity !== sensitivityFilter) return false;

      // Also check node highlights if active
      if (highlightedSource && flow.consentSourceId !== highlightedSource) return false;
      if (highlightedCategory && flow.dataCategoryId !== highlightedCategory) return false;
      if (highlightedActivity && flow.processingActivityId !== highlightedActivity) return false;
      if (highlightedClause && flow.statutoryClauseCode !== highlightedClause) return false;

      return true;
    });
  }, [flows, searchQuery, departmentFilter, healthFilter, sensitivityFilter, highlightedSource, highlightedCategory, highlightedActivity, highlightedClause]);

  const selectedFlow = useMemo(() => {
    return flows.find(f => f.id === selectedFlowId) || flows[0];
  }, [flows, selectedFlowId]);

  // Unique departments for filter
  const departments = useMemo(() => {
    return Array.from(new Set(flows.map(f => f.department)));
  }, [flows]);

  // Aggregated Pipeline Columns
  const pipelineSources = useMemo(() => {
    const map = new Map<string, { id: string; name: string; type: string; count: number; flows: DPDPDataFlowLink[] }>();
    flows.forEach(f => {
      const existing = map.get(f.consentSourceId);
      if (existing) {
        existing.count++;
        existing.flows.push(f);
      } else {
        map.set(f.consentSourceId, {
          id: f.consentSourceId,
          name: f.consentSourceName,
          type: f.consentSourceType,
          count: 1,
          flows: [f]
        });
      }
    });
    return Array.from(map.values());
  }, [flows]);

  const pipelineCategories = useMemo(() => {
    const map = new Map<string, { id: string; name: string; classification: string; sensitivity: DPDPDataSensitivity; count: number; flows: DPDPDataFlowLink[] }>();
    flows.forEach(f => {
      const existing = map.get(f.dataCategoryId);
      if (existing) {
        existing.count++;
        existing.flows.push(f);
      } else {
        map.set(f.dataCategoryId, {
          id: f.dataCategoryId,
          name: f.dataCategoryName,
          classification: f.dataCategoryClassification,
          sensitivity: f.sensitivity,
          count: 1,
          flows: [f]
        });
      }
    });
    return Array.from(map.values());
  }, [flows]);

  const pipelineActivities = useMemo(() => {
    const map = new Map<string, { id: string; name: string; department: string; infrastructure: string; crossBorder: boolean; count: number; flows: DPDPDataFlowLink[] }>();
    flows.forEach(f => {
      const existing = map.get(f.processingActivityId);
      if (existing) {
        existing.count++;
        existing.flows.push(f);
      } else {
        map.set(f.processingActivityId, {
          id: f.processingActivityId,
          name: f.processingActivityName,
          department: f.department,
          infrastructure: f.storageInfrastructure,
          crossBorder: f.crossBorderTransfer,
          count: 1,
          flows: [f]
        });
      }
    });
    return Array.from(map.values());
  }, [flows]);

  const pipelineClauses = useMemo(() => {
    const map = new Map<string, { code: string; title: string; health: DPDPComplianceHealth; count: number; flows: DPDPDataFlowLink[] }>();
    flows.forEach(f => {
      const existing = map.get(f.statutoryClauseCode);
      if (existing) {
        existing.count++;
        existing.flows.push(f);
        if (f.complianceHealth === 'CRITICAL_GAP') existing.health = 'CRITICAL_GAP';
        else if (f.complianceHealth === 'NEEDS_REVIEW' && existing.health !== 'CRITICAL_GAP') existing.health = 'NEEDS_REVIEW';
      } else {
        map.set(f.statutoryClauseCode, {
          code: f.statutoryClauseCode,
          title: f.primaryStatutoryClause,
          health: f.complianceHealth,
          count: 1,
          flows: [f]
        });
      }
    });
    return Array.from(map.values());
  }, [flows]);

  // Overall compliance metrics
  const compliantCount = flows.filter(f => f.complianceHealth === 'COMPLIANT').length;
  const reviewCount = flows.filter(f => f.complianceHealth === 'NEEDS_REVIEW').length;
  const gapCount = flows.filter(f => f.complianceHealth === 'CRITICAL_GAP').length;

  // Handle create new flow
  const handleCreateNewFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlowName.trim() || !newProcessingActivity.trim()) return;

    const flowId = `flow_${Date.now()}`;
    const flowCode = `DF-CUS-${Math.floor(10 + Math.random() * 90)}`;
    const proofHash = buildDataFlowProofHash(
      flowCode,
      newConsentSource,
      newDataCategory,
      newProcessingActivity,
      newStatutoryClause
    );

    const newFlow: DPDPDataFlowLink = {
      id: flowId,
      flowCode,
      name: newFlowName.trim(),
      department: newFlowDept,
      consentSourceId: `src_${newConsentType.toLowerCase()}`,
      consentSourceName: newConsentSource.trim(),
      consentSourceType: newConsentType,
      consentNoticeLanguage: newNoticeLang,
      dataCategoryId: `cat_${Math.floor(Math.random() * 1000)}`,
      dataCategoryName: newDataCategory.trim(),
      dataCategoryClassification: newDataClassification,
      sensitivity: newSensitivity,
      volumeEstimate: '50,000 Data Principals (Projected)',
      processingActivityId: `act_${Math.floor(Math.random() * 1000)}`,
      processingActivityName: newProcessingActivity.trim(),
      processingPurpose: newProcessingPurpose.trim() || 'Specified processing authorized under customer onboarding notice',
      storageInfrastructure: newInfrastructure.trim(),
      processorsEngaged: ['Primary Internal Storage (Encrypted)'],
      retentionPeriod: newRetention.trim(),
      crossBorderTransfer: newCrossBorder,
      destinationJurisdiction: newCrossBorder ? newDestination || 'Singapore (Permitted Zone)' : undefined,
      primaryStatutoryClause: newStatutoryClause.trim(),
      statutoryClauseCode: newStatutoryClauseCode.trim(),
      secondaryClauses: ['Section 8(5) Technical Safeguards'],
      statutoryBasis: newStatutoryBasis,
      complianceHealth: 'COMPLIANT',
      technicalSafeguards: ['AES-256 GCM at Rest', 'TLS 1.3 in Transit', 'Field-level Tokenization'],
      auditEvidenceProof: proofHash,
      dpoSignOff: true,
      dpoSignOffOfficer: 'Elena Rostova (Chief DPO)',
      lastAuditedDate: new Date().toISOString().split('T')[0]
    };

    setFlows([newFlow, ...flows]);
    setSelectedFlowId(newFlow.id);
    setIsNewFlowModalOpen(false);

    showToast({
      title: 'Data Flow Mapped & Registered',
      description: `Registered flow ${flowCode} (${newFlow.name}) with SHA-256 audit proof.`,
      type: 'success'
    });

    // Reset fields
    setNewFlowName('');
    setNewProcessingActivity('');
    setNewProcessingPurpose('');
  };

  // Export RoPA (Record of Processing Activities)
  const handleExportRoPA = () => {
    const ropaData = flows.map(f => ({
      'Flow Code': f.flowCode,
      'Activity Name': f.name,
      'Department': f.department,
      'Consent Ingestion Source': f.consentSourceName,
      'Notice Language Spec': f.consentNoticeLanguage,
      'Data Category': f.dataCategoryName,
      'Classification': f.dataCategoryClassification,
      'Sensitivity Tier': f.sensitivity,
      'Volume Estimate': f.volumeEstimate,
      'Processing Activity': f.processingActivityName,
      'Processing Purpose': f.processingPurpose,
      'Storage Infrastructure': f.storageInfrastructure,
      'Downstream Processors': f.processorsEngaged.join('; '),
      'Retention Policy': f.retentionPeriod,
      'Cross-Border Transfer': f.crossBorderTransfer ? `Yes (${f.destinationJurisdiction})` : 'No (Domestic)',
      'Primary Statutory Clause': f.primaryStatutoryClause,
      'Clause Code': f.statutoryClauseCode,
      'Legal Basis': f.statutoryBasis,
      'Compliance Health': f.complianceHealth,
      'Technical Safeguards': f.technicalSafeguards.join('; '),
      'DPO Sign-Off': f.dpoSignOff ? `Approved (${f.dpoSignOffOfficer})` : 'Pending / Rejected',
      'Audit Evidence Proof Hash': f.auditEvidenceProof,
      'Last Audit Date': f.lastAuditedDate
    }));

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(ropaData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `DPDP_RoPA_Data_Flow_Register_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast({
      title: 'RoPA Dossier Exported',
      description: `Exported ${flows.length} data flows in regulatory audit format.`,
      type: 'success'
    });
  };

  // Clear all node highlights
  const handleClearHighlights = () => {
    setHighlightedSource(null);
    setHighlightedCategory(null);
    setHighlightedActivity(null);
    setHighlightedClause(null);
  };

  const hasActiveHighlights = highlightedSource || highlightedCategory || highlightedActivity || highlightedClause;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Control Deck */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5" />
                <span>Section 6, 8, 9 & 16 Visual Architecture</span>
              </span>
              <span className="text-xs text-slate-400">Record of Processing Activities (RoPA) & Statutory Lineage</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Live Interactive Visualizer
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Data Flow Mapping & Statutory Clause Visualizer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Trace personal data from initial consent ingestion channels, through sensitive data categories and operational processing activities, directly to its statutory legal basis under the DPDP Act 2023. Identify unmapped processing risks, cross-border flows, and missing DPAs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewFlowModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Map New Data Flow</span>
            </button>

            <button
              type="button"
              onClick={handleExportRoPA}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export RoPA Register</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Mapped Data Flows</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-2">
              <span>{flows.length} Flows</span>
              <span className="text-[10px] font-sans text-indigo-400 font-semibold">100% Traced</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Statutory Compliance</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-2">
              <span>{compliantCount} Approved</span>
              <span className="text-[10px] font-sans text-slate-400">({Math.round((compliantCount / flows.length) * 100)}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Review & High-Risk Gaps</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5 flex items-baseline gap-2">
              <span>{gapCount} Gap • {reviewCount} Review</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Principals in Data Pipeline</div>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-0.5 flex items-baseline gap-2">
              <span>11.2M+ Principals</span>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/60">
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('PIPELINE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'PIPELINE'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Interactive Pipeline Graph</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ROPA_MATRIX')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'ROPA_MATRIX'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>RoPA Statutory Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('GAP_ANALYSIS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'GAP_ANALYSIS'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Statutory Gap Inspector</span>
              {gapCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-rose-900 text-white">
                  {gapCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search flow, activity, clause..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:border-indigo-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={healthFilter}
              onChange={e => setHealthFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:border-indigo-500"
            >
              <option value="ALL">All Health</option>
              <option value="COMPLIANT">🟢 Compliant</option>
              <option value="NEEDS_REVIEW">🟡 Needs Review</option>
              <option value="CRITICAL_GAP">🔴 Critical Gap</option>
            </select>

            {hasActiveHighlights && (
              <button
                type="button"
                onClick={handleClearHighlights}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-indigo-900"
                title="Clear active node filter highlights"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Highlight</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE PIPELINE GRAPH */}
      {viewMode === 'PIPELINE' && (
        <div className="space-y-6">
          {/* Visual Instruction Banner */}
          <div className="px-4 py-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Interactive Lineage:</strong> Click any card in any column to highlight its full end-to-end statutory journey and examine safeguards in the Inspector panel below.
              </span>
            </div>
            {hasActiveHighlights && (
              <span className="text-[11px] font-mono text-indigo-300 font-bold">
                Filtered: {filteredFlows.length} active matching flows
              </span>
            )}
          </div>

          {/* 4-Column Connected Flow Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative">
            {/* COLUMN 1: CONSENT SOURCES & INTAKE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Consent Ingestion Channels
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{pipelineSources.length} Channels</span>
              </div>

              <div className="space-y-2.5">
                {pipelineSources.map(src => {
                  const isSelected = highlightedSource === src.id;
                  const isFlowSelected = selectedFlow?.consentSourceId === src.id;

                  return (
                    <div
                      key={src.id}
                      onClick={() => {
                        if (highlightedSource === src.id) {
                          setHighlightedSource(null);
                        } else {
                          setHighlightedSource(src.id);
                          if (src.flows.length > 0) setSelectedFlowId(src.flows[0].id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-blue-950/80 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                          : isFlowSelected
                          ? 'bg-slate-900 border-blue-500/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {src.type === 'VPC_GATEWAY' ? (
                              <Baby className="w-3.5 h-3.5" />
                            ) : src.type === 'CONSENT_MANAGER' ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : src.type === 'LEGITIMATE_USE_SEC7' ? (
                              <Building className="w-3.5 h-3.5" />
                            ) : (
                              <Globe className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-snug">{src.name}</span>
                            <span className="text-[10px] font-mono text-blue-300">{src.type.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                          {src.count} {src.count === 1 ? 'Flow' : 'Flows'}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Multilingual Verification</span>
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: DATA CATEGORIES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Data Categories & Sensitivity
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{pipelineCategories.length} Categories</span>
              </div>

              <div className="space-y-2.5">
                {pipelineCategories.map(cat => {
                  const isSelected = highlightedCategory === cat.id;
                  const isFlowSelected = selectedFlow?.dataCategoryId === cat.id;

                  let sensColor = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (cat.sensitivity === 'CRITICAL_SENSITIVE') {
                    sensColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  } else if (cat.sensitivity === 'HIGH') {
                    sensColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  }

                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (highlightedCategory === cat.id) {
                          setHighlightedCategory(null);
                        } else {
                          setHighlightedCategory(cat.id);
                          if (cat.flows.length > 0) setSelectedFlowId(cat.flows[0].id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                          : isFlowSelected
                          ? 'bg-slate-900 border-purple-500/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <Database className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-snug">{cat.name}</span>
                            <span className="text-[10px] text-slate-400">{cat.classification}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold border ${sensColor}`}>
                          {cat.sensitivity.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {cat.count} {cat.count === 1 ? 'Flow' : 'Flows'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 3: PROCESSING ACTIVITIES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    3. Processing Activities & System
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{pipelineActivities.length} Operations</span>
              </div>

              <div className="space-y-2.5">
                {pipelineActivities.map(act => {
                  const isSelected = highlightedActivity === act.id;
                  const isFlowSelected = selectedFlow?.processingActivityId === act.id;

                  return (
                    <div
                      key={act.id}
                      onClick={() => {
                        if (highlightedActivity === act.id) {
                          setHighlightedActivity(null);
                        } else {
                          setHighlightedActivity(act.id);
                          if (act.flows.length > 0) setSelectedFlowId(act.flows[0].id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                          : isFlowSelected
                          ? 'bg-slate-900 border-amber-500/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Cpu className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-snug">{act.name}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">{act.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 truncate max-w-[160px] font-mono" title={act.infrastructure}>
                          {act.infrastructure.slice(0, 22)}...
                        </span>
                        {act.crossBorder ? (
                          <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5" />
                            <span>Sec 16</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Domestic</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 4: STATUTORY CLAUSES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    4. DPDP Statutory Clause
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{pipelineClauses.length} Clauses</span>
              </div>

              <div className="space-y-2.5">
                {pipelineClauses.map(cls => {
                  const isSelected = highlightedClause === cls.code;
                  const isFlowSelected = selectedFlow?.statutoryClauseCode === cls.code;

                  let borderStyle = 'border-slate-800';
                  let statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                  if (cls.health === 'CRITICAL_GAP') {
                    borderStyle = 'border-rose-500/60 bg-rose-950/20';
                    statusBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  } else if (cls.health === 'NEEDS_REVIEW') {
                    borderStyle = 'border-amber-500/60 bg-amber-950/20';
                    statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  }

                  return (
                    <div
                      key={cls.code}
                      onClick={() => {
                        if (highlightedClause === cls.code) {
                          setHighlightedClause(null);
                        } else {
                          setHighlightedClause(cls.code);
                          if (cls.flows.length > 0) setSelectedFlowId(cls.flows[0].id);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                          : isFlowSelected
                          ? 'bg-slate-900 border-emerald-500/50'
                          : `bg-slate-900/80 ${borderStyle} hover:border-slate-700`
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Scale className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block leading-snug">{cls.title}</span>
                            <span className="text-[10px] font-mono text-emerald-300">{cls.code}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold border ${statusBadge}`}>
                          {cls.health.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {cls.count} {cls.count === 1 ? 'Flow' : 'Flows'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ACTIVE FLOW INSPECTION DOSSIER CARD */}
          {selectedFlow && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800">
                        {selectedFlow.flowCode}
                      </span>
                      <h3 className="text-base font-black text-white">{selectedFlow.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedFlow.department} • Statutory Lineage & Technical Safeguards
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    selectedFlow.complianceHealth === 'COMPLIANT'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedFlow.complianceHealth === 'NEEDS_REVIEW'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {selectedFlow.complianceHealth === 'COMPLIANT' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{selectedFlow.complianceHealth.replace(/_/g, ' ')}</span>
                  </span>
                </div>
              </div>

              {/* Connected Path Breadcrumbs */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Consent Source</span>
                  </div>
                  <div className="font-bold text-white">{selectedFlow.consentSourceName}</div>
                  <div className="text-[10px] text-slate-400">{selectedFlow.consentNoticeLanguage}</div>
                </div>

                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-3 pt-2 sm:pt-0">
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Data Category</span>
                  </div>
                  <div className="font-bold text-white">{selectedFlow.dataCategoryName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedFlow.volumeEstimate}</div>
                </div>

                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-3 pt-2 sm:pt-0">
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>Processing Operation</span>
                  </div>
                  <div className="font-bold text-white">{selectedFlow.processingActivityName}</div>
                  <div className="text-[10px] text-slate-400 truncate" title={selectedFlow.storageInfrastructure}>
                    {selectedFlow.storageInfrastructure}
                  </div>
                </div>

                <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-3 pt-2 sm:pt-0">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    <span>Statutory Clause</span>
                  </div>
                  <div className="font-bold text-white">{selectedFlow.primaryStatutoryClause}</div>
                  <div className="text-[10px] text-emerald-300 font-mono font-bold">{selectedFlow.statutoryClauseCode}</div>
                </div>
              </div>

              {/* Detailed Safeguards & Governance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Statutory Basis & Penalties */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Statutory Basis & Schedule</span>
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Legal Authority:</span>
                      <span className="font-bold text-white font-mono">{selectedFlow.statutoryBasis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Secondary Clauses:</span>
                      <span className="text-slate-300 text-right">{selectedFlow.secondaryClauses.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Statutory Max Penalty:</span>
                      <span className="font-bold text-rose-400">Up to ₹250 Crores</span>
                    </div>
                  </div>
                </div>

                {/* Storage & Processors */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>Infrastructure & Retention</span>
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Downstream Processors:</span>
                      <span className="text-slate-300 text-right font-medium">{selectedFlow.processorsEngaged.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Retention Schedule:</span>
                      <span className="text-slate-300 text-right font-medium">{selectedFlow.retentionPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cross-Border Transfer:</span>
                      <span className={selectedFlow.crossBorderTransfer ? 'text-amber-400 font-bold' : 'text-emerald-400 font-medium'}>
                        {selectedFlow.crossBorderTransfer ? `Yes (${selectedFlow.destinationJurisdiction})` : 'Strictly Domestic'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Safeguards & Cryptographic Seal */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Technical Safeguards & Proof</span>
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      {selectedFlow.technicalSafeguards.map((sg, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                          {sg}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-indigo-400" />
                        <span>Audit Seal:</span>
                      </span>
                      <span className="font-mono text-slate-300 truncate max-w-[140px]" title={selectedFlow.auditEvidenceProof}>
                        {selectedFlow.auditEvidenceProof.slice(0, 20)}...
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">DPO Sign-Off:</span>
                      <span className={selectedFlow.dpoSignOff ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {selectedFlow.dpoSignOff ? `Attested (${selectedFlow.dpoSignOffOfficer})` : 'Pending DPO Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedFlow.gapNotes && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-200 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Statutory Audit Observation:</strong> {selectedFlow.gapNotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ROPA STATUTORY MATRIX (RECORD OF PROCESSING ACTIVITIES) */}
      {viewMode === 'ROPA_MATRIX' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Statutory Record of Processing Activities (RoPA) Register</span>
              </h3>
              <p className="text-xs text-slate-400">
                Auditor-ready register mapping every processing activity to statutory clauses, retention limits, and security proofs.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Showing {filteredFlows.length} of {flows.length} registered activities
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 pr-4">Code / Flow Name</th>
                  <th className="pb-3 pr-4">Consent Source</th>
                  <th className="pb-3 pr-4">Data Category</th>
                  <th className="pb-3 pr-4">Processing Purpose & System</th>
                  <th className="pb-3 pr-4">Retention Window</th>
                  <th className="pb-3 pr-4">DPDP Clause</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFlows.map(flow => (
                  <tr
                    key={flow.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedFlowId === flow.id ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <div className="font-bold text-white">{flow.name}</div>
                      <div className="text-[10px] font-mono text-indigo-400">{flow.flowCode} • {flow.department}</div>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="text-slate-200 font-medium">{flow.consentSourceName}</div>
                      <div className="text-[10px] text-slate-400">{flow.consentSourceType.replace(/_/g, ' ')}</div>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="text-slate-200">{flow.dataCategoryName}</div>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.2 text-[9px] rounded font-bold border ${
                        flow.sensitivity === 'CRITICAL_SENSITIVE'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : flow.sensitivity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {flow.sensitivity.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 pr-4 max-w-xs">
                      <div className="text-slate-300 font-medium truncate" title={flow.processingPurpose}>
                        {flow.processingPurpose}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{flow.storageInfrastructure}</div>
                    </td>

                    <td className="py-3 pr-4 text-slate-300 font-medium">
                      {flow.retentionPeriod}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="font-bold text-emerald-400 font-mono">{flow.statutoryClauseCode}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{flow.primaryStatutoryClause}</div>
                    </td>

                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        flow.complianceHealth === 'COMPLIANT'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : flow.complianceHealth === 'NEEDS_REVIEW'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {flow.complianceHealth.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFlowId(flow.id);
                          setViewMode('PIPELINE');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: STATUTORY GAP & PENALTY RISK INSPECTOR */}
      {viewMode === 'GAP_ANALYSIS' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Statutory Gap & Penalty Risk Analysis</h3>
                <p className="text-xs text-slate-400">
                  Automated scan detecting unmapped processing activities, missing statutory consent notices, or non-compliant cross-border transfers under the DPDP Act 2023.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Critical Statutory Violations</span>
                  <span className="text-sm font-mono font-bold text-rose-300">{gapCount} Flows</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Requires immediate DPO intervention or processing cessation order to avert statutory penalties of up to ₹250 Crores.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Safeguard Review Required</span>
                  <span className="text-sm font-mono font-bold text-amber-300">{reviewCount} Flows</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Secondary controls like physical vector garbage collection or DPA execution with sub-processors currently in progress.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Fully Verified & Attested</span>
                  <span className="text-sm font-mono font-bold text-emerald-300">{compliantCount} Flows</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clear unbundled consent, technical encryption safeguards, and active DPO sign-off recorded on immutable audit hashes.
                </p>
              </div>
            </div>
          </div>

          {/* Gap Breakdown Cards */}
          <div className="space-y-3">
            {flows
              .filter(f => f.complianceHealth !== 'COMPLIANT')
              .map(flow => (
                <div
                  key={flow.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-rose-900/60 space-y-3 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {flow.flowCode}
                      </span>
                      <h4 className="text-sm font-bold text-white">{flow.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {flow.complianceHealth.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Violated / Incomplete Clause:</span>
                      <span className="font-bold text-amber-400">{flow.primaryStatutoryClause}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Department Lead:</span>
                      <span className="text-slate-200">{flow.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Potential Statutory Liability:</span>
                      <span className="font-bold text-rose-400">Up to ₹250 Crores (Section 33 Schedule)</span>
                    </div>
                  </div>

                  {flow.gapNotes && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-rose-400">Audit Finding:</strong> {flow.gapNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFlows(prev =>
                          prev.map(f =>
                            f.id === flow.id
                              ? {
                                  ...f,
                                  complianceHealth: 'COMPLIANT',
                                  gapNotes: undefined,
                                  dpoSignOff: true,
                                  dpoSignOffOfficer: 'Elena Rostova (Chief DPO)'
                                }
                              : f
                          )
                        );
                        showToast({
                          title: 'Remediation Attested',
                          description: `Marked flow ${flow.flowCode} as Compliant. DPO approval recorded.`,
                          type: 'success'
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Attest Remediation & Close Gap</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CREATE NEW DATA FLOW MODAL */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Map New Personal Data Flow</h3>
                  <p className="text-xs text-slate-400">
                    Connect an ingestion consent source, data category, and processing activity to a statutory clause.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFlowModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewFlow} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Flow / Activity Name:</label>
                  <input
                    type="text"
                    required
                    value={newFlowName}
                    onChange={e => setNewFlowName(e.target.value)}
                    placeholder="e.g. Instant Personal Loan Pre-Approval Engine"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Department:</label>
                  <input
                    type="text"
                    value={newFlowDept}
                    onChange={e => setNewFlowDept(e.target.value)}
                    placeholder="e.g. Consumer Lending & FinTech Operations"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Column 1: Consent Source */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>1. Consent Ingestion Channel</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Ingestion Type:</label>
                    <select
                      value={newConsentType}
                      onChange={e => setNewConsentType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="WEB_PORTAL">🌐 Multilingual Web Portal (Sec 6(1))</option>
                      <option value="MOBILE_APP">📱 Mobile App SDK / Native Permissions</option>
                      <option value="CONSENT_MANAGER">🛡️ MeitY Consent Manager API (Sec 6(7))</option>
                      <option value="VPC_GATEWAY">👶 Verifiable Parental Consent Gateway (Sec 9)</option>
                      <option value="LEGITIMATE_USE_SEC7">🏢 Section 7 Legitimate Use Exemption</option>
                      <option value="OFFLINE_KYC">📝 Branch Physical Paper Form</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Consent Channel Descriptor:</label>
                    <input
                      type="text"
                      value={newConsentSource}
                      onChange={e => setNewConsentSource(e.target.value)}
                      placeholder="e.g. Android & iOS App v4.2 Onboarding"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Data Category */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span>2. Data Category & Sensitivity</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Data Category Name:</label>
                    <input
                      type="text"
                      value={newDataCategory}
                      onChange={e => setNewDataCategory(e.target.value)}
                      placeholder="e.g. PAN, Bank Account, Aadhaar Virtual ID"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Sensitivity Tier:</label>
                    <select
                      value={newSensitivity}
                      onChange={e => setNewSensitivity(e.target.value as DPDPDataSensitivity)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="CRITICAL_SENSITIVE">🚨 CRITICAL SENSITIVE (Biometrics / Children / Financial)</option>
                      <option value="HIGH">⚠️ HIGH (Direct Identifiers, Precise Location)</option>
                      <option value="MEDIUM">📊 MEDIUM (Behavioral, Telemetry, Preferences)</option>
                      <option value="STANDARD">📄 STANDARD (Contact Info, Basic Profile)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Column 3: Processing Activity */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Processing Activity & Systems</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Processing Operation:</label>
                    <input
                      type="text"
                      required
                      value={newProcessingActivity}
                      onChange={e => setNewProcessingActivity(e.target.value)}
                      placeholder="e.g. Real-Time Fraud Anomaly Detection"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Storage Infrastructure:</label>
                    <input
                      type="text"
                      value={newInfrastructure}
                      onChange={e => setNewInfrastructure(e.target.value)}
                      placeholder="e.g. AWS Mumbai S3 + Snowflake"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Processing Purpose & Justification:</label>
                  <textarea
                    rows={2}
                    value={newProcessingPurpose}
                    onChange={e => setNewProcessingPurpose(e.target.value)}
                    placeholder="Describe specific, non-bundled purpose disclosed to citizen..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              {/* Column 4: Statutory Clause */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>4. Statutory DPDP Clause Mapping</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Primary Statutory Clause:</label>
                    <select
                      value={newStatutoryClauseCode}
                      onChange={e => {
                        const code = e.target.value;
                        setNewStatutoryClauseCode(code);
                        if (code === 'SEC-06(1)') setNewStatutoryClause('Section 6(1) Multilingual Notice & Prior Consent');
                        else if (code === 'SEC-06(7)') setNewStatutoryClause('Section 6(7)-(9) Interoperable Consent Manager Architecture');
                        else if (code === 'SEC-07') setNewStatutoryClause('Section 7 Certain Legitimate Uses (Specified Exemptions)');
                        else if (code === 'SEC-08(1)') setNewStatutoryClause('Section 8(1) Processor Engagement via Valid DPA Contract');
                        else if (code === 'SEC-08(5)') setNewStatutoryClause('Section 8(5) Reasonable Security Safeguards to Prevent Breach');
                        else if (code === 'SEC-08(7)') setNewStatutoryClause('Section 8(7) Purpose Fulfillment & Erasure Cascade Mandate');
                        else if (code === 'SEC-09') setNewStatutoryClause('Section 9(1) & 9(2) Verifiable Parental Consent & Child Tracking Ban');
                        else if (code === 'SEC-16') setNewStatutoryClause('Section 16 Cross-Border Transfer to Permitted Jurisdictions');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="SEC-06(1)">Section 6(1) Clear Itemised Notice</option>
                      <option value="SEC-06(7)">Section 6(7)-(9) Registered Consent Manager</option>
                      <option value="SEC-07">Section 7 Certain Legitimate Uses</option>
                      <option value="SEC-08(1)">Section 8(1) Processor DPA Mandate</option>
                      <option value="SEC-08(5)">Section 8(5) Security Safeguards</option>
                      <option value="SEC-08(7)">Section 8(7) Erasure Cascade</option>
                      <option value="SEC-09">Section 9 Minor VPC & Tracking Prohibition</option>
                      <option value="SEC-16">Section 16 Cross-Border Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1 font-semibold">Legal Basis Authority:</label>
                    <select
                      value={newStatutoryBasis}
                      onChange={e => setNewStatutoryBasis(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="EXPLICIT_CONSENT">Explicit Multilingual Consent</option>
                      <option value="LEGITIMATE_USE">Section 7 Legitimate Use</option>
                      <option value="VERIFIABLE_PARENTAL_CONSENT">Section 9 Verifiable Parental Consent</option>
                      <option value="STATUTORY_MANDATE">Statutory Regulatory Mandate</option>
                    </select>
                  </div>
                </div>

                {/* Cross-border toggle */}
                <div className="flex items-center space-x-3 pt-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCrossBorder}
                      onChange={e => setNewCrossBorder(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Cross-Border Transfer Involved (Section 16 Applicability)</span>
                  </label>

                  {newCrossBorder && (
                    <input
                      type="text"
                      value={newDestination}
                      onChange={e => setNewDestination(e.target.value)}
                      placeholder="Destination territory (e.g. Singapore)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-white text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewFlowModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Register Data Flow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
