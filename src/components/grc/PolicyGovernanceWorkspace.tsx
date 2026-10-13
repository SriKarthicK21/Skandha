// ============================================================================
// SKANDA ENTERPRISE GRC: UNIFIED POLICY GOVERNANCE & INTELLIGENCE WORKSPACE
// Path: src/components/grc/PolicyGovernanceWorkspace.tsx
//
// Authoritative Policy Decision Workspace connecting:
// Regulatory Requirements -> Applicability -> Risks & Controls -> Policy Documents
// -> Procedures & Standards -> Implementation Tasks -> Evidence -> Control Testing
// -> Findings & CAPA -> Operating Effectiveness -> Audit Readiness
//
// Core Operating Principle:
// DOCUMENT + IMPLEMENTATION + EVIDENCE + CONTROL TEST = ASSURANCE
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Lock,
  Layers,
  Search,
  Filter,
  Eye,
  Plus,
  ArrowRight,
  GitPullRequest,
  Calendar,
  Award,
  Download,
  Flame,
  Key,
  Database,
  History,
  AlertCircle,
  Sparkles,
  Check,
  X,
  FileCheck,
  Tag,
  Cpu,
  RefreshCw,
  GitCompare,
  Sliders,
  ChevronRight,
  ChevronDown,
  Info,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  Workflow,
  HelpCircle,
  Hash,
  UserCheck,
  Building2,
  CheckCircle,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { EnterpriseDocumentationStudio } from '../policies/EnterpriseDocumentationStudio';
import {
  policyGovernanceService,
  GovernanceDocument,
  DocumentType,
  DocumentLifecycleStatus,
  DocumentGovernanceMetrics,
  AcknowledgementCampaign,
  ImplementationPlan,
  ExpectedEvidenceSpec,
  DocumentConflictRecord,
  DocumentDriftRecord,
  AuditorGovernancePack,
  PolicyExperience,
  PolicyQualityEvaluationResult,
  GeneratedPolicyDraftResponse,
  DuplicateDetectionResult,
  PolicyImpactAssessment,
  GovernanceReviewTask,
  VersionComparisonResult,
  SourceTraceabilityTag
} from '../../services/grc/policyGovernanceService';
import { useGRC } from '../../context/GRCContext';

export interface PolicyGovernanceWorkspaceProps {
  initialTab?: string;
}

export const PolicyGovernanceWorkspace: React.FC<PolicyGovernanceWorkspaceProps> = ({
  initialTab = 'command_center'
}) => {
  const { currentTenant, currentUser } = useGRC();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [metrics, setMetrics] = useState<DocumentGovernanceMetrics | null>(null);
  const [documents, setDocuments] = useState<GovernanceDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [experience, setExperience] = useState<PolicyExperience | null>(null);
  const [isLoadingExperience, setIsLoadingExperience] = useState(false);
  const [auditorPack, setAuditorPack] = useState<AuditorGovernancePack | null>(null);
  const [reviewTasks, setReviewTasks] = useState<GovernanceReviewTask[]>([]);
  const [duplicationResult, setDuplicationResult] = useState<DuplicateDetectionResult | null>(null);
  const [impactAssessment, setImpactAssessment] = useState<PolicyImpactAssessment | null>(null);

  // Policy 360 sub-tab
  const [policy360Tab, setPolicy360Tab] = useState<
    | 'overview'
    | 'document'
    | 'governance'
    | 'requirements'
    | 'implementation'
    | 'evidence'
    | 'acknowledgement'
    | 'exceptions'
    | 'quality'
    | 'history'
  >('overview');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // AI Policy Generation Studio State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('Cloud Infrastructure Security & Encryption Standard');
  const [aiDocType, setAiDocType] = useState<DocumentType>('STANDARD');
  const [aiFrameworks, setAiFrameworks] = useState<string[]>(['ISO_27001_2022', 'MAS_TRM_2021', 'SOC_2_TYPE_2']);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedPolicyDraftResponse | null>(null);

  // Version Comparison State
  const [comparingVersions, setComparingVersions] = useState<VersionComparisonResult | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // New Manual Document Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDocCode, setNewDocCode] = useState('POL-SEC-004');
  const [newDocTitle, setNewDocTitle] = useState('Enterprise Responsible AI Development Policy');
  const [newDocType, setNewDocType] = useState<DocumentType>('POLICY');
  const [newDocDept, setNewDocDept] = useState('dept-ai-01');
  const [newDocDeptName, setNewDocDeptName] = useState('AI Research & Engineering');
  const [newDocProcess, setNewDocProcess] = useState('proc-ai-01');
  const [newDocProcessName, setNewDocProcessName] = useState('Model Lifecycle & Algorithmic Safety');
  const [newDocPurpose, setNewDocPurpose] = useState('Establishes ethical and technical standards for AI model training, data quality, bias mitigation, and human oversight under ISO/IEC 42001.');
  const [newDocScope, setNewDocScope] = useState('All internal generative AI models, LLM agents, and automated decision engines operating across corporate workloads.');

  // Electronic Signature state
  const [signingName, setSigningName] = useState(currentUser?.name || 'Enterprise Compliance Auditor');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'overview' || initialTab === 'command_center') setActiveTab('command_center');
      else if (initialTab === 'documents' || initialTab === 'document_register') setActiveTab('register');
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadAllData();
  }, [currentTenant?.id]);

  const loadAllData = async () => {
    try {
      if (currentTenant?.id) {
        policyGovernanceService.setTenantId(currentTenant.id);
      }
      const [m, docs, pack, tasks] = await Promise.all([
        policyGovernanceService.getGovernanceMetrics(),
        policyGovernanceService.getDocuments(),
        policyGovernanceService.getAuditorPack(),
        policyGovernanceService.getGovernanceReviewTasks()
      ]);

      setMetrics(m);
      setDocuments(docs);
      setAuditorPack(pack);
      setReviewTasks(tasks);

      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
        loadExperience(docs[0].id);
      }
    } catch {
      // Fallbacks
    }
  };

  const loadExperience = async (docId: string) => {
    setIsLoadingExperience(true);
    try {
      const exp = await policyGovernanceService.getPolicyExperience(
        docId,
        currentUser?.email || 'ciso@skanda.enterprise.com',
        currentUser?.role || 'CISO'
      );
      setExperience(exp);
    } finally {
      setIsLoadingExperience(false);
    }
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocId(docId);
    loadExperience(docId);
    setActiveTab('policy_360');
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch =
        searchQuery === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ownerRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = typeFilter === 'ALL' || doc.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || doc.status === statusFilter;
      const matchDept = departmentFilter === 'ALL' || doc.departmentName === departmentFilter;
      const matchFw = frameworkFilter === 'ALL' || doc.frameworkCodes.includes(frameworkFilter);

      return matchSearch && matchType && matchStatus && matchDept && matchFw;
    });
  }, [documents, searchQuery, typeFilter, statusFilter, departmentFilter, frameworkFilter]);

  // Actions
  const handleApproveDocument = async (doc: GovernanceDocument) => {
    const actorEmail = currentUser?.email || 'ciso@acmefintech.io';
    const actorRole = 'CISO';

    const result = await policyGovernanceService.approveDocument(doc.id, actorEmail, actorRole);
    if (result.success) {
      showToast(`Document ${doc.code} approved successfully by ${actorEmail}. Segregation of duties verified.`, 'success');
      loadAllData();
      if (selectedDocId === doc.id) loadExperience(doc.id);
    } else {
      showToast(`Approval Blocked: ${result.error || result.reason}`, 'error');
    }
  };

  const handlePublishDocument = async (doc: GovernanceDocument) => {
    const actorEmail = currentUser?.email || 'ciso@acmefintech.io';
    const result = await policyGovernanceService.publishDocument(doc.id, actorEmail);
    if (result.success) {
      showToast(`Document ${doc.code} published! Immutable SHA-256 seal & downstream implementation tasks generated.`, 'success');
      loadAllData();
      if (selectedDocId === doc.id) loadExperience(doc.id);
    } else {
      showToast(`Publication Blocked: ${result.error} (Blockers: ${result.blockers?.join(', ') || 'Validation failed'})`, 'error');
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const authorEmail = currentUser?.email || 'sec.lead@skanda.enterprise.com';
    const result = await policyGovernanceService.createDocument({
      code: newDocCode,
      title: newDocTitle,
      type: newDocType,
      departmentId: newDocDept,
      departmentName: newDocDeptName,
      processId: newDocProcess,
      processName: newDocProcessName,
      frameworkCodes: ['ISO_27001_2022', 'ISO_42001_2023'],
      authorEmail: authorEmail,
      authorRole: 'Security Lead',
      ownerEmail: 'ciso@skanda.enterprise.com',
      ownerRole: 'CISO',
      reviewCadence: 'ANNUAL',
      mandatoryAcknowledgement: true,
      content: {
        purpose: newDocPurpose,
        scope: newDocScope,
        objectives: ['Enforce data quality, safety, and continuous monitoring for all AI workloads.'],
        definitions: { 'AI': 'Artificial Intelligence', 'LLM': 'Large Language Model' },
        rolesAndResponsibilities: [
          { role: 'CISO', mandate: 'Policy owner & risk governance authority', r: false, a: true, c: true, i: false },
          { role: 'AI Lead', mandate: 'Executes bias testing and model cards', r: true, a: false, c: false, i: false }
        ],
        requirementsOrSteps: [
          { stepNumber: 1, actor: 'AI Engineer', system: 'Model Registry', action: 'Publish signed model card and dataset provenance log', expectedOutput: 'Verified Model Card', evidenceProduced: 'AI Model Provenance Ledger' }
        ],
        controlMappings: [
          { controlCode: 'A.5.15', requirement: 'Access Control', practice: 'Role-based access to model weights and training datasets' }
        ],
        exceptionHandling: { workflow: 'Formal exception ticket reviewed by AI Ethics Committee', approver: 'CISO', maxDays: 45 },
        governanceAndReview: { cycle: 'Annual', owner: 'CISO', approver: 'Executive Risk Committee' }
      }
    });

    if (result.success && result.document) {
      showToast(`Document ${result.document.code} created in DRAFT status`, 'success');
      setIsCreateModalOpen(false);
      loadAllData();
      handleSelectDocument(result.document.id);
    } else {
      showToast(`Error creating document: ${result.error}`, 'error');
    }
  };

  const handleTriggerAiGeneration = async () => {
    setIsAiGenerating(true);
    const result = await policyGovernanceService.generatePolicyDraft({
      domainOrTopic: aiTopic,
      documentType: aiDocType,
      departmentId: 'DEP-SEC-01',
      departmentName: 'Information Security',
      processId: 'PROC-SEC-01',
      processName: 'Cloud Security Governance',
      targetFrameworkCodes: aiFrameworks,
      ownerEmail: 'ciso@acmefintech.io',
      ownerRole: 'Chief Information Security Officer',
      authorEmail: currentUser?.email || 'sec.lead@skanda.enterprise.com',
      authorRole: 'Lead Security Architect',
      organizationContext: {
        organizationName: currentTenant?.name || 'Acme Financial Technologies',
        industry: 'FinTech / SaaS',
        jurisdictions: ['US', 'EU', 'SG', 'IN'],
        technologyStack: {
          cloudProviders: ['AWS', 'Microsoft Azure'],
          identityProviders: ['Microsoft Entra ID', 'Okta'],
          itsmPlatforms: ['ServiceNow ITSM'],
          endpointSecurity: ['CrowdStrike Falcon'],
          databaseEngines: ['PostgreSQL RDS', 'Amazon Aurora']
        }
      }
    });
    setIsAiGenerating(false);

    if (result.success && result.data) {
      setGeneratedDraft(result.data);
      showToast(`AI Policy Draft generated with 12-step structure and statement-level source traceability!`, 'success');
    } else {
      showToast(`AI Generation failed: ${result.error}`, 'error');
    }
  };

  const handleSaveAiDraftToRegister = async () => {
    if (!generatedDraft) return;
    const result = await policyGovernanceService.createDocument({
      code: generatedDraft.code,
      title: generatedDraft.title,
      type: generatedDraft.type as DocumentType,
      departmentId: 'DEP-SEC-01',
      departmentName: 'Information Security',
      processId: 'PROC-SEC-01',
      processName: 'Cloud Security Governance',
      frameworkCodes: aiFrameworks,
      authorEmail: currentUser?.email || 'sec.lead@skanda.enterprise.com',
      authorRole: 'Lead Security Architect',
      ownerEmail: 'ciso@acmefintech.io',
      ownerRole: 'CISO',
      reviewCadence: 'ANNUAL',
      mandatoryAcknowledgement: true,
      content: generatedDraft.content
    });

    if (result.success && result.document) {
      showToast(`AI Draft ${result.document.code} saved to Document Register in DRAFT status. Human review gate required before approval.`, 'success');
      setGeneratedDraft(null);
      loadAllData();
      handleSelectDocument(result.document.id);
    }
  };

  const handleSignAcknowledgement = async (campaignId: string) => {
    setIsSigning(true);
    const userEmail = currentUser?.email || 'karthikeyan.j@skanda.enterprise.com';
    const result = await policyGovernanceService.recordAcknowledgement(campaignId, userEmail, signingName, 'ELECTRONIC_SIGNATURE');
    setIsSigning(false);

    if (result.success) {
      showToast(`Electronic signature recorded for ${userEmail}. Cryptographic audit ledger updated!`, 'success');
      loadAllData();
      if (selectedDocId) loadExperience(selectedDocId);
    } else {
      showToast(`Failed to record signature: ${result.error}`, 'error');
    }
  };

  const handleRunDuplicationScan = async () => {
    const res = await policyGovernanceService.scanDuplicatePolicies();
    setDuplicationResult(res);
    if (res) {
      showToast(`Duplication scan completed: ${res.duplicateFindings.length} findings identified across ${res.analyzedDocumentsCount} policies.`, 'info');
    }
  };

  const handleSimulateRegulatoryChange = async () => {
    const res = await policyGovernanceService.assessRegulatoryImpact({
      eventId: 'REG-EVT-MAS-2024',
      sourceRegulatoryBody: 'Monetary Authority of Singapore (MAS)',
      frameworkCode: 'MAS_TRM_2021',
      affectedClauseOrSection: 'Section 5.1 Multi-Factor Authentication & Identity Hygiene',
      changeDescription: 'Mandates biometric / FIDO2 phishing-resistant credentials and 15-minute privileged idle session terminations.',
      effectiveDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      urgency: 'HIGH'
    });
    setImpactAssessment(res);
    if (res) {
      showToast(`Regulatory change assessed: Created ${res.impactedDocuments.length} formal governance review task(s). Existing policies remain active.`, 'success');
      loadAllData();
    }
  };

  const handleCompareVersions = async (doc: GovernanceDocument) => {
    if (doc.versions.length < 2) {
      showToast(`Document ${doc.code} has only 1 version. Creating a revision to enable version diff.`, 'info');
      return;
    }
    const v1 = doc.versions[0].version;
    const v2 = doc.versions[doc.versions.length - 1].version;
    const comp = await policyGovernanceService.compareVersions(doc.id, v1, v2);
    setComparingVersions(comp);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-sky-950/90 border-sky-500/50 text-sky-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-sky-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Enterprise Policy Governance & Intelligence Workspace
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Decision Workspace
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Continuous Assurance
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Connected Policy Lifecycle: Requirements → Applicability → Controls & Risks → Documents → Implementation → Evidence → Testing → Assurance
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('ai_generator')}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-sm font-medium rounded-lg border border-indigo-500/30 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Policy Studio
          </button>
          <button
            onClick={() => setActiveTab('auditor_pack')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Auditor Digital Pack
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        </div>
      </div>

      {/* Primary Workspace Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-800 text-sm">
        {[
          { id: 'command_center', label: 'Command Center & KPIs', icon: Layers },
          { id: 'register', label: 'Policy Register', icon: FileText, badge: documents.length },
          { id: 'policy_360', label: 'Policy 360 Workspace', icon: ShieldCheck, badge: experience ? experience.policy.code : undefined },
          { id: 'ai_generator', label: 'AI Generation & Traceability', icon: Sparkles },
          { id: 'duplication_scanner', label: 'Duplication & Contradiction', icon: GitCompare },
          { id: 'regulatory_impact', label: 'Regulatory Change Impact', icon: Workflow, badge: reviewTasks.filter(t => t.status === 'PENDING_REVIEW').length || undefined },
          { id: 'documentation_studio', label: 'Documentation Studio (Consulting Benchmarks)', icon: BookOpen, badge: 'Consulting' },
          { id: 'review_calendar', label: 'Review Calendar', icon: Calendar, badge: metrics?.overdueReviewsCount ? `${metrics.overdueReviewsCount} Overdue` : undefined },
          { id: 'auditor_pack', label: 'Auditor Governance Pack', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-500/30 text-blue-300'
                      : typeof tab.badge === 'string' && tab.badge.includes('Overdue')
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: COMMAND CENTER & EXECUTIVE METRICS                            */}
      {/* ==================================================================== */}
      {activeTab === 'command_center' && (
        <div className="space-y-6">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase">Total Documents</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{metrics?.totalDocuments || documents.length}</div>
              <p className="text-xs text-slate-400 mt-1">Authoritative register</p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase">Published</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{metrics?.publishedDocuments || 0}</div>
              <p className="text-xs text-slate-400 mt-1">WORM sealed active</p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase">In Review / Pending</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">
                {(metrics?.inReviewDocuments || 0) + (metrics?.pendingApprovalDocuments || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">SME & CISO queue</p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase">Acknowledgement Rate</span>
                <Send className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-sky-400">{metrics?.overallAcknowledgementRate || 0}%</div>
              <p className="text-xs text-slate-400 mt-1">Electronic signatures</p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase">Implementation Score</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-400">{metrics?.averageImplementationScore || 0}%</div>
              <p className="text-xs text-slate-400 mt-1">Operational execution</p>
            </div>

            <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium uppercase">Overdue Reviews</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-rose-400">{metrics?.overdueReviewsCount || 0}</div>
              <p className="text-xs text-slate-400 mt-1">Requires immediate review</p>
            </div>
          </div>

          {/* Priority Work Queue */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">Priority Policy Governance Work Queue</h3>
              </div>
              <span className="text-xs text-slate-400">Actionable items requiring human SME / CISO governance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Approvals Pending */}
              <div className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-amber-300">Approvals Pending</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-300">
                    {documents.filter(d => d.status === 'IN_REVIEW' || d.status === 'PENDING_APPROVAL').length}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Policies awaiting SME verification and formal CISO sign-off under segregation of duties.
                </p>
                <div className="space-y-2">
                  {documents
                    .filter(d => d.status === 'IN_REVIEW' || d.status === 'PENDING_APPROVAL')
                    .slice(0, 2)
                    .map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleSelectDocument(d.id)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700/80 rounded border border-slate-700 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <div className="font-medium text-white">{d.code}</div>
                          <div className="text-slate-400 truncate max-w-[200px]">{d.title}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                </div>
              </div>

              {/* Card 2: Upcoming / Overdue Reviews */}
              <div className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-rose-300">Review Watchdog</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-rose-500/20 text-rose-300">
                    {metrics?.dueForReviewCount || 0} Due Soon
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Annual ISMS and MAS TRM review cadence tracking.
                </p>
                <div className="space-y-2">
                  {documents.slice(0, 2).map(d => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDocument(d.id)}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700/80 rounded border border-slate-700 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <div className="font-medium text-white">{d.code}</div>
                        <div className="text-slate-400">Next Review: {new Date(d.nextReviewDate).toLocaleDateString()}</div>
                      </div>
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Regulatory Impact & Change Tasks */}
              <div className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-indigo-300">Regulatory Impact</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-300">
                    {reviewTasks.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Upstream statutory changes mapped to downstream governance review tasks.
                </p>
                <button
                  onClick={() => setActiveTab('regulatory_impact')}
                  className="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 rounded border border-indigo-500/30 text-xs font-medium transition flex items-center justify-center gap-2"
                >
                  <Workflow className="w-3.5 h-3.5" />
                  View Regulatory Change Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: POLICY REGISTER (AUTHORITATIVE TABLE)                         */}
      {/* ==================================================================== */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, title, owner, department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="POLICY">Policy</option>
                <option value="STANDARD">Standard</option>
                <option value="PROCEDURE">Procedure</option>
                <option value="SOP">SOP</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="IMPACTED_BY_CHANGE">Impacted by Change</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="font-semibold text-white">{filteredDocuments.length}</span> of {documents.length} records
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Document Code & Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Implementation</th>
                  <th className="px-4 py-3">Acknowledgements</th>
                  <th className="px-4 py-3">Next Review</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{doc.code}</span>
                        {doc.status === 'PUBLISHED' && (
                          <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]" title="SHA-256 WORM Sealed">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{doc.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300 font-mono">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{doc.departmentName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">v{doc.currentVersion}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${
                          doc.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : doc.status === 'IN_REVIEW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : doc.status === 'APPROVED'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : doc.status === 'IMPACTED_BY_CHANGE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${doc.implementationScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-300">{doc.implementationScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-300">{doc.acknowledgementRate}%</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(doc.nextReviewDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSelectDocument(doc.id)}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium rounded border border-blue-500/30 transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Policy 360
                        </button>
                        {doc.status === 'IN_REVIEW' && (
                          <button
                            onClick={() => handleApproveDocument(doc)}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium rounded border border-emerald-500/30 transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        )}
                        {doc.status === 'APPROVED' && (
                          <button
                            onClick={() => handlePublishDocument(doc)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: UNIFIED POLICY 360 WORKSPACE                                  */}
      {/* ==================================================================== */}
      {activeTab === 'policy_360' && (
        <div className="space-y-6">
          {isLoadingExperience && (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mr-2" />
              <span>Loading authoritative Policy 360 experience...</span>
            </div>
          )}

          {experience && !isLoadingExperience && (
            <div>
              {/* Document Overview Header */}
              <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl mb-6 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {experience.policy.code}
                      </span>
                      <h2 className="text-xl font-bold text-white">{experience.policy.title}</h2>
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${
                          experience.policy.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : experience.policy.status === 'IN_REVIEW'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {experience.policy.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">v{experience.policy.currentVersion}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Owner: <strong className="text-slate-200">{experience.policy.ownerEmail}</strong> ({experience.policy.ownerRole})</span>
                      <span>•</span>
                      <span>Department: <strong className="text-slate-200">{experience.policy.departmentName}</strong></span>
                      <span>•</span>
                      <span>Cadence: <strong className="text-slate-200">{experience.policy.reviewCadence}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCompareVersions(experience.policy)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg border border-slate-600 transition flex items-center gap-1.5"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-slate-300" />
                      Version Diff
                    </button>
                    {experience.policy.status === 'IN_REVIEW' && (
                      <button
                        onClick={() => handleApproveDocument(experience.policy)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Document
                      </button>
                    )}
                    {experience.policy.status === 'APPROVED' && (
                      <button
                        onClick={() => handlePublishDocument(experience.policy)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publish WORM Seal
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Tabs for Policy 360 */}
                <div className="flex items-center gap-1 overflow-x-auto pt-4 text-xs font-medium">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'document', label: 'Document Content' },
                    { id: 'governance', label: 'Governance & Approvals' },
                    { id: 'requirements', label: 'Requirements & Controls' },
                    { id: 'implementation', label: 'Implementation Plan' },
                    { id: 'evidence', label: 'Evidence & Testing' },
                    { id: 'acknowledgement', label: 'Acknowledgements' },
                    { id: 'quality', label: 'Quality Intelligence (12D)' },
                    { id: 'history', label: 'Version History & Diff' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setPolicy360Tab(st.id as any)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                        policy360Tab === st.id
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Tab 1: Overview */}
              {policy360Tab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Executive Purpose</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{experience.policy.content.purpose}</p>
                    </div>

                    <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Scope & Boundaries</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{experience.policy.content.scope}</p>
                    </div>

                    <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Strategic Objectives</h4>
                      <ul className="space-y-2">
                        {experience.policy.content.objectives?.map((obj, i) => (
                          <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Quality Summary Card */}
                    <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">Quality Score</h4>
                        <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {experience.quality.maturityTier}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-400">{experience.quality.overallScore}%</div>
                      <p className="text-xs text-slate-400">12-dimension structural & assurance scorecard</p>
                    </div>

                    {/* Cryptographic Hash Card */}
                    <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-blue-400" />
                        WORM SHA-256 Digest
                      </h4>
                      <p className="text-xs font-mono text-slate-300 break-all bg-slate-900/80 p-2.5 rounded border border-slate-700">
                        {experience.policy.sha256Digest}
                      </p>
                      <p className="text-[11px] text-slate-400">Immutable cryptographic publication seal.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Document Content */}
              {policy360Tab === 'document' && (
                <div className="space-y-6">
                  {/* RACI Matrix */}
                  <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">RACI Accountability Matrix</h4>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/60 text-slate-400">
                        <tr>
                          <th className="p-2.5">Role</th>
                          <th className="p-2.5">Mandate</th>
                          <th className="p-2.5 text-center">R</th>
                          <th className="p-2.5 text-center">A</th>
                          <th className="p-2.5 text-center">C</th>
                          <th className="p-2.5 text-center">I</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {experience.policy.content.rolesAndResponsibilities?.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-semibold text-slate-200">{r.role}</td>
                            <td className="p-2.5 text-slate-300">{r.mandate}</td>
                            <td className="p-2.5 text-center">{r.r ? <span className="text-emerald-400 font-bold">✓</span> : '-'}</td>
                            <td className="p-2.5 text-center">{r.a ? <span className="text-blue-400 font-bold">✓</span> : '-'}</td>
                            <td className="p-2.5 text-center">{r.c ? <span className="text-amber-400 font-bold">✓</span> : '-'}</td>
                            <td className="p-2.5 text-center">{r.i ? <span className="text-purple-400 font-bold">✓</span> : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Requirements / Operational Steps */}
                  <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Step-by-Step Operational Requirements</h4>
                    <div className="space-y-3">
                      {experience.policy.content.requirementsOrSteps?.map((st, i) => (
                        <div key={i} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-bold text-blue-400">Step {st.stepNumber || i + 1}: {st.actor}</span>
                            <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">System: {st.system}</span>
                          </div>
                          <p className="text-slate-200 text-sm">{st.action}</p>
                          <div className="text-slate-400 flex items-center gap-4 pt-1 border-t border-slate-800">
                            <span>Output: <strong className="text-slate-300">{st.expectedOutput}</strong></span>
                            {st.evidenceProduced && (
                              <span>Evidence: <strong className="text-emerald-300">{st.evidenceProduced}</strong></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Governance & Approvals */}
              {policy360Tab === 'governance' && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Segregation of Duties & Approval Matrix</h4>
                    <div
                      className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
                        experience.governance.sodStatus.isCompliant
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold">Segregation of Duties Check</div>
                        <p>{experience.governance.sodStatus.message}</p>
                      </div>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pt-2">Tenant Configured Approval Matrix Rules</h5>
                    <div className="space-y-2">
                      {experience.governance.approvalRules.map(r => (
                        <div key={r.id} className="p-3 bg-slate-900/60 border border-slate-700 rounded-lg text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-200">Domain: {r.departmentDomain}</span>
                            <span className="text-slate-400 ml-3">Authorized Role: <strong className="text-blue-300">{r.authorizedApproverRole}</strong></span>
                          </div>
                          <span className="text-slate-400 font-mono">{r.authorizedApproverEmail || 'Any matching role'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 4: Requirements & Controls */}
              {policy360Tab === 'requirements' && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                    <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Applicable Frameworks & Canonical Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {experience.traceability.controls.map(c => (
                        <div key={c.controlCode} className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-400 font-mono">{c.controlCode}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{c.assuranceLevel}</span>
                          </div>
                          <div className="font-medium text-slate-200">{c.title}</div>
                          <div className="text-slate-400">Implementation: <strong className="text-slate-300">{c.implementationStatus}</strong></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 5: Implementation Plan */}
              {policy360Tab === 'implementation' && (
                <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Operational Implementation Tasks</h4>
                    <span className="text-xs text-slate-400">Progress Score: <strong className="text-emerald-400">{experience.implementation.overallScore}%</strong></span>
                  </div>
                  <div className="space-y-2">
                    {experience.implementation.upcomingDeadlines.map(t => (
                      <div key={t.taskId} className="p-3 bg-slate-900/60 border border-slate-700 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-200">{t.activityName}</div>
                          <div className="text-slate-400">Owner: {t.ownerEmail} • Due: {new Date(t.dueDate).toLocaleDateString()}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 6: Evidence & Testing */}
              {policy360Tab === 'evidence' && (
                <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Expected Evidence Specifications & Continuous Testing</h4>
                  <div className="space-y-3">
                    {experience.evidenceAndTesting.specs.map(spec => (
                      <div key={spec.id} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">{spec.evidenceTitle}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">{spec.currentAvailability}</span>
                        </div>
                        <div className="text-slate-400 flex items-center gap-4">
                          <span>Cadence: <strong className="text-slate-300">{spec.generationCadence}</strong></span>
                          <span>Method: <strong className="text-slate-300">{spec.harvestMethod}</strong></span>
                          <span>Retention: <strong className="text-slate-300">{spec.retentionDays} days</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 7: Acknowledgements */}
              {policy360Tab === 'acknowledgement' && (
                <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Employee Acknowledgement Campaign</h4>
                    <span className="text-xs text-sky-400 font-bold">{experience.acknowledgement.completionRate}% Acknowledged</span>
                  </div>

                  {experience.policy.acknowledgementCampaignId && (
                    <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-3">
                      <div className="font-medium text-slate-200">Electronic Signature Sign-off</div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={signingName}
                          onChange={e => setSigningName(e.target.value)}
                          placeholder="Your Full Name"
                          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs flex-1"
                        />
                        <button
                          onClick={() => handleSignAcknowledgement(experience.policy.acknowledgementCampaignId!)}
                          disabled={isSigning}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow transition"
                        >
                          {isSigning ? 'Signing...' : 'Sign & Acknowledge'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 8: Quality Intelligence (12 Dimensions) */}
              {policy360Tab === 'quality' && (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">12-Dimension Quality Intelligence Scorecard</h4>
                      <div className="text-2xl font-bold text-emerald-400">{experience.quality.overallScore}% ({experience.quality.maturityTier})</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {experience.quality.dimensionScores.map(dim => (
                        <div key={dim.dimension} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{dim.name}</span>
                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${dim.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {dim.score}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${dim.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${dim.score}%` }} />
                          </div>
                          <p className="text-slate-400 text-[11px]">{dim.observations[0]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 9: Version History & Diff */}
              {policy360Tab === 'history' && (
                <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
                  <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Version History & Cryptographic WORM Ledgers</h4>
                  <div className="space-y-3">
                    {experience.policy.versions.map((v, i) => (
                      <div key={i} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white font-mono">v{v.version}</span>
                          <span className="text-slate-400">{v.publishedAt ? new Date(v.publishedAt).toLocaleString() : 'Draft'}</span>
                        </div>
                        <p className="text-slate-300">{v.changeSummary}</p>
                        <div className="text-slate-400 font-mono text-[11px] break-all bg-slate-800/60 p-2 rounded mt-1">
                          SHA-256: {v.sha256Digest}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: AI POLICY GENERATION STUDIO WITH SOURCE TRACEABILITY          */}
      {/* ==================================================================== */}
      {activeTab === 'ai_generator' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI-Assisted Policy Implementation Studio</h3>
                <p className="text-xs text-slate-400">
                  Synthesizes verified organizational context, canonical frameworks, and technical infrastructure into 12-step structured policies with statement-level source traceability.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase">Policy Topic / Domain</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase">Document Type</label>
                <select
                  value={aiDocType}
                  onChange={e => setAiDocType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="POLICY">POLICY</option>
                  <option value="STANDARD">STANDARD</option>
                  <option value="PROCEDURE">PROCEDURE</option>
                  <option value="SOP">SOP</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleTriggerAiGeneration}
                  disabled={isAiGenerating}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2"
                >
                  {isAiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isAiGenerating ? 'Synthesizing Policy...' : 'Generate 12-Step Draft'}
                </button>
              </div>
            </div>
          </div>

          {generatedDraft && (
            <div className="p-6 bg-slate-800/80 border border-indigo-500/40 rounded-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {generatedDraft.code}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{generatedDraft.title}</h3>
                </div>
                <button
                  onClick={handleSaveAiDraftToRegister}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Draft to Register
                </button>
              </div>

              {/* Source Traceability Tags */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Statement-Level Source Traceability</h4>
                <div className="space-y-2">
                  {generatedDraft.traceableStatements.map(stmt => (
                    <div key={stmt.statementId} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{stmt.section}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                          {stmt.sourceType}
                        </span>
                      </div>
                      <p className="text-slate-300">{stmt.text}</p>
                      <div className="text-slate-400 text-[11px]">Source Reference: <strong className="text-slate-200">{stmt.sourceReference}</strong></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: DUPLICATION & CONTRADICTION SCANNER                           */}
      {/* ==================================================================== */}
      {activeTab === 'duplication_scanner' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Policy Duplication & Contradiction Scanner</h3>
              <p className="text-xs text-slate-400">
                Scans across all policy documents for duplicate titles, conflicting operational requirements, contradictory exception periods, and outdated framework references.
              </p>
            </div>
            <button
              onClick={handleRunDuplicationScan}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Scan Policy Catalog
            </button>
          </div>

          {duplicationResult && (
            <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase">Scan Results ({duplicationResult.analyzedDocumentsCount} policies analyzed)</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs">
                  Redundancy Score: {duplicationResult.overallRedundancyScore}%
                </span>
              </div>

              {duplicationResult.duplicateFindings.length === 0 ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero duplicate policies or contradictory statements detected across catalog.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {duplicationResult.duplicateFindings.map(f => (
                    <div key={f.findingId} className="p-3 bg-slate-900/80 border border-amber-500/30 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{f.findingType}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">{f.severity}</span>
                      </div>
                      <p className="text-slate-200">{f.description}</p>
                      <p className="text-slate-400 text-[11px]">Suggested Resolution: {f.suggestedResolution}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: REGULATORY CHANGE IMPACT                                      */}
      {/* ==================================================================== */}
      {activeTab === 'regulatory_impact' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Regulatory Change Impact & Governance Tasks</h3>
              <p className="text-xs text-slate-400">
                Maps upstream statutory amendments to affected policies without destructive auto-overwrites.
              </p>
            </div>
            <button
              onClick={handleSimulateRegulatoryChange}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-2"
            >
              <Workflow className="w-4 h-4" />
              Simulate MAS TRM / ISO Update
            </button>
          </div>

          <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Active Governance Review Tasks</h4>
            {reviewTasks.length === 0 ? (
              <p className="text-xs text-slate-400">No pending regulatory review tasks.</p>
            ) : (
              <div className="space-y-3">
                {reviewTasks.map(t => (
                  <div key={t.taskId} className="p-4 bg-slate-900/80 border border-slate-700 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 font-mono">{t.documentCode}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">{t.status}</span>
                    </div>
                    <div className="text-slate-300">Trigger: <strong>{t.triggerSource}</strong></div>
                    <div className="text-slate-400">Responsible Owner: {t.responsibleOwner} • Due: {new Date(t.dueDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: REVIEW CALENDAR                                               */}
      {/* ==================================================================== */}
      {activeTab === 'review_calendar' && (
        <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white">Periodic Review Calendar & SLA Watchdog</h3>
          <div className="space-y-3">
            {documents.map(d => (
              <div key={d.id} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{d.code}: {d.title}</span>
                  <div className="text-slate-400">Owner: {d.ownerEmail} • Cadence: {d.reviewCadence}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-200">{new Date(d.nextReviewDate).toLocaleDateString()}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">{d.reviewStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 8: AUDITOR GOVERNANCE DIGITAL PACK                               */}
      {/* ==================================================================== */}
      {activeTab === 'auditor_pack' && auditorPack && (
        <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div>
              <h3 className="text-lg font-bold text-white">Auditor Digital Governance Pack</h3>
              <p className="text-xs text-slate-400">Immutable governance dossier with complete closed-loop assurance lineage.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded border border-emerald-500/30">
                SHA-256 Seal: {auditorPack.sha256Digest.substring(0, 16)}...
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <div className="text-xs text-slate-400 uppercase">Documents</div>
              <div className="text-2xl font-bold text-white">{auditorPack.documentRegister.length}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <div className="text-xs text-slate-400 uppercase">Approval Records</div>
              <div className="text-2xl font-bold text-emerald-400">{auditorPack.approvalRecords.length}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <div className="text-xs text-slate-400 uppercase">Acknowledgement Campaigns</div>
              <div className="text-2xl font-bold text-sky-400">{auditorPack.acknowledgementSummaries.length}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
              <div className="text-xs text-slate-400 uppercase">Implementation Plans</div>
              <div className="text-2xl font-bold text-indigo-400">{auditorPack.implementationStatus.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB: ENTERPRISE DOCUMENTATION STUDIO (CONSULTING BENCHMARKS)         */}
      {/* ==================================================================== */}
      {activeTab === 'documentation_studio' && (
        <div className="space-y-6">
          <EnterpriseDocumentationStudio />
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: CREATE DOCUMENT                                               */}
      {/* ==================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white">Create New Governance Document</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Document Code</label>
                <input
                  type="text"
                  value={newDocCode}
                  onChange={e => setNewDocCode(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Title</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Type</label>
                  <select
                    value={newDocType}
                    onChange={e => setNewDocType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                  >
                    <option value="POLICY">POLICY</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="PROCEDURE">PROCEDURE</option>
                    <option value="SOP">SOP</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    value={newDocDeptName}
                    onChange={e => setNewDocDeptName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">Purpose</label>
                <textarea
                  rows={2}
                  value={newDocPurpose}
                  onChange={e => setNewDocPurpose(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Scope</label>
                <textarea
                  rows={2}
                  value={newDocScope}
                  onChange={e => setNewDocScope(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded shadow">
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: VERSION COMPARISON DIFF                                       */}
      {/* ==================================================================== */}
      {isCompareModalOpen && comparingVersions && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-400" />
                Version Comparison Diff: {comparingVersions.versionA.version} vs {comparingVersions.versionB.version}
              </h3>
              <button onClick={() => setIsCompareModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {comparingVersions.sectionDiffs.map((diff, idx) => (
                <div key={idx} className="p-3 bg-slate-900/80 border border-slate-700 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{diff.section}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        diff.status === 'UNCHANGED'
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {diff.status}
                    </span>
                  </div>
                  <p className="text-slate-300">{diff.summary}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-700">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded text-xs hover:bg-slate-600"
              >
                Close Diff Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
