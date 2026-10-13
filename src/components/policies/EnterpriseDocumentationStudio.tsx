// ============================================================================
// SKANDA ENTERPRISE GRC: ENTERPRISE DOCUMENTATION STUDIO & CONSULTING BENCHMARKS
// Path: src/components/policies/EnterpriseDocumentationStudio.tsx
//
// Interactive consulting-grade documentation engine providing:
// - Completed Model Samples (ISMS-POL-001 & ISMS-PROC-IAM-001)
// - Blank Policy, Procedure, Standard, and SOP Templates
// - Interactive Organizational Context Questionnaire (Non-Fabrication Engine)
// - Live 7-Dimension Consulting Quality Audit & RACI Single-Accountability Check
// - Professional DOCX, HTML Print-Preview, and Markdown Exports
// - Authoritative Promotion to Policy Governance Engine & PostgreSQL
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  BookOpen,
  Layers,
  Settings2,
  SlidersHorizontal,
  Eye,
  Printer,
  Building2,
  Users,
  Workflow,
  Scale,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Send,
  Lock,
  ArrowRight,
  X,
  Tag,
  Info,
  ListChecks,
  CheckSquare,
  Square
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import {
  enterpriseDocumentationEngine,
  EnterpriseConsultingDocument,
  DocumentationContextQuestionnaire,
  DocumentationQualityScorecard,
  CatalogueTemplateMetadata,
  CatalogueDomain
} from '../../../server/services/EnterpriseDocumentationEngine';
import { DocumentType } from '../../../server/services/PolicyGovernanceEngine';

export const EnterpriseDocumentationStudio: React.FC = () => {
  const { currentTenant, currentUser } = useGRC();

  // Active view tabs
  const [activeTab, setActiveTab] = useState<'catalogue' | 'models' | 'templates' | 'questionnaire' | 'document_viewer' | 'quality_scorecard'>('catalogue');

  // Catalogue Exploration State
  const [catalogueSearch, setCatalogueSearch] = useState<string>('');
  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [filterFramework, setFilterFramework] = useState<string>('ALL');
  const [filterContentDepth, setFilterContentDepth] = useState<string>('ALL');
  const [selectedCatalogueTemplate, setSelectedCatalogueTemplate] = useState<CatalogueTemplateMetadata | null>(null);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  
  // Selected Document & View Mode
  const [selectedDocId, setSelectedDocId] = useState<string>('ISMS-PROC-IAM-001');
  const [activeDoc, setActiveDoc] = useState<EnterpriseConsultingDocument>(() => 
    enterpriseDocumentationEngine.getModelUserAccessProcedure()
  );

  // Quality Scorecard
  const [scorecard, setScorecard] = useState<DocumentationQualityScorecard>(() => 
    enterpriseDocumentationEngine.evaluateConsultingQuality(enterpriseDocumentationEngine.getModelUserAccessProcedure())
  );

  // Copy notification state
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotedSuccessId, setPromotedSuccessId] = useState<string | null>(null);

  // Organizational Context Questionnaire State (pre-filled with realistic enterprise defaults)
  const [questionnaire, setQuestionnaire] = useState<DocumentationContextQuestionnaire>({
    tenantId: currentTenant?.id || 'SKANDA-DEMO-ENTERPRISE',
    organizationProfile: {
      legalEntityName: currentTenant?.name || 'Acme Global FinTech Inc.',
      tradeName: 'Acme Payments',
      jurisdictions: ['Singapore', 'United States', 'European Union', 'India'],
      industry: 'Cloud Financial Infrastructure & Digital Payments',
      headquartersLocation: 'Singapore (One Raffles Quay)'
    },
    scopeDefinition: {
      inScopeLocations: ['Global HQ (Singapore)', 'AWS US-East-1', 'AWS AP-Southeast-1'],
      inScopeBusinessUnits: ['Core Banking Engineering', 'Security Operations', 'Payment Switch Infrastructure', 'Customer Success'],
      inScopeServicesAndProducts: ['Real-Time Settlement Engine', 'Merchant Transaction API', 'Identity Vault', 'Partner Portal'],
      excludedEntitiesOrFunctions: [
        {
          item: 'Legacy Regional POS Hardware Terminals (Discontinued)',
          rationale: 'Fully decomissioned in Q1 2026; zero active customer traffic.'
        }
      ]
    },
    operatingModel: {
      cloudInfrastructure: ['Amazon Web Services (AWS)', 'Google Cloud Platform (GCP)'],
      identityProvider: 'Okta Enterprise Identity Cloud',
      ticketingAndItsmSystem: 'Jira Service Management Cloud',
      codeRepositories: ['GitHub Enterprise Cloud'],
      databaseEngines: ['PostgreSQL 16 High-Availability', 'Snowflake'],
      hrisPlatform: 'Workday HCM',
      siemAndLoggingPlatform: 'Datadog Cloud SIEM & AWS CloudTrail'
    },
    keyRolesAndDelegations: {
      executiveSponsorRole: 'Chief Executive Officer',
      executiveSponsorEmail: 'ceo@acmefintech.io',
      ismsOwnerOrCisoRole: 'Chief Information Security Officer',
      ismsOwnerOrCisoEmail: 'ciso@acmefintech.io',
      securityReviewerRole: 'Principal Security Architect',
      securityReviewerEmail: 'sec.architect@acmefintech.io',
      headOfItOrEngineeringRole: 'VP of Cloud Infrastructure',
      headOfItOrEngineeringEmail: 'vp.infra@acmefintech.io',
      internalAuditorRole: 'Lead ISMS Internal Auditor',
      internalAuditorEmail: 'audit.lead@acmefintech.io'
    },
    approvalThresholdsAndRules: {
      policyApprovalAuthority: 'Board Risk Committee / CEO',
      procedureApprovalAuthority: 'CISO / Head of Security Operations',
      standardUserAccessApprover: 'Direct Line Manager + Target System Owner',
      privilegedAccessApprover: 'CISO + System Owner (Dual Authorization Mandate)',
      emergencyWaiverApprover: 'CISO Emergency Emergency Sign-off'
    },
    serviceLevelCommitments: {
      standardAccessDays: 2,
      roleModificationDays: 1,
      privilegedAccessHours: 4,
      emergencyAccessMinutes: 30
    },
    evidenceAndRecordsRetention: {
      defaultRecordRetentionYears: 7,
      accessLogRetentionDays: 365,
      evidenceStorageVault: 'SKANDA Authoritative Evidence Vault & AWS S3 WORM'
    }
  });

  // Catalogue Filtering & Search
  const filteredTemplates = useMemo(() => {
    return enterpriseDocumentationEngine.getCatalogue({
      search: catalogueSearch,
      documentType: filterDocType === 'ALL' ? undefined : (filterDocType as any),
      domain: filterDomain === 'ALL' ? undefined : (filterDomain as any),
      framework: filterFramework === 'ALL' ? undefined : filterFramework,
      contentDepth: filterContentDepth === 'ALL' ? undefined : (filterContentDepth as any)
    });
  }, [catalogueSearch, filterDocType, filterDomain, filterFramework, filterContentDepth]);

  const isInputResolved = (inputPath: string): boolean => {
    const parts = inputPath.split('.');
    let cur: any = questionnaire;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object') return false;
      cur = cur[part];
    }
    if (Array.isArray(cur)) return cur.length > 0;
    if (typeof cur === 'string') return cur.trim().length > 0;
    return cur !== undefined && cur !== null;
  };

  const handleGenerateFromCatalogue = (template: CatalogueTemplateMetadata, mode: 'BLANK' | 'MODEL' | 'TAILORED') => {
    try {
      const generatedDoc = enterpriseDocumentationEngine.generateDocument(
        template.id,
        mode,
        questionnaire
      );
      setActiveDoc(generatedDoc);
      setSelectedDocId(template.id);
      setScorecard(enterpriseDocumentationEngine.evaluateConsultingQuality(generatedDoc));
      setActiveTab('document_viewer');
      setSelectedCatalogueTemplate(null);
      setGenerationNotice(`Generated "${template.title}" in ${mode} mode`);
      setTimeout(() => setGenerationNotice(null), 4000);
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    }
  };

  // Switch Model Sample
  const handleSelectModel = (modelId: string) => {
    setSelectedDocId(modelId);
    let doc: EnterpriseConsultingDocument;
    if (modelId === 'ISMS-POL-001') {
      doc = enterpriseDocumentationEngine.getModelInformationSecurityPolicy();
    } else {
      doc = enterpriseDocumentationEngine.getModelUserAccessProcedure();
    }
    setActiveDoc(doc);
    setScorecard(enterpriseDocumentationEngine.evaluateConsultingQuality(doc));
    setActiveTab('document_viewer');
  };

  // Switch Blank Template
  const handleSelectTemplate = (templateType: 'POLICY' | 'PROCEDURE') => {
    let doc: EnterpriseConsultingDocument;
    if (templateType === 'POLICY') {
      doc = enterpriseDocumentationEngine.getBlankPolicyTemplate();
    } else {
      doc = enterpriseDocumentationEngine.getBlankProcedureTemplate();
    }
    setActiveDoc(doc);
    setScorecard(enterpriseDocumentationEngine.evaluateConsultingQuality(doc));
    setActiveTab('document_viewer');
  };

  // Tailor Document based on Questionnaire
  const handleTailorDocument = () => {
    const tailored = enterpriseDocumentationEngine.tailorDocument(activeDoc, questionnaire);
    setActiveDoc(tailored);
    setScorecard(enterpriseDocumentationEngine.evaluateConsultingQuality(tailored));
    setActiveTab('document_viewer');
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    const md = enterpriseDocumentationEngine.exportToMarkdown(activeDoc);
    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Export to Print-Ready HTML
  const handleExportHtml = () => {
    const html = enterpriseDocumentationEngine.exportToPrintReadyHtml(activeDoc);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  // Export to DOCX
  const handleExportDocx = async () => {
    try {
      const buffer = await enterpriseDocumentationEngine.exportToDocx(activeDoc);
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeDoc.metadata.documentId || 'document'}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`DOCX generation error: ${err.message}`);
    }
  };

  // Promote to Authoritative Governance
  const handlePromoteToGovernance = () => {
    setIsPromoting(true);
    try {
      const actorEmail = currentUser?.email || 'ciso@skanda.enterprise.com';
      const actorRole = currentUser?.role || 'CISO';
      const govDoc = enterpriseDocumentationEngine.promoteToGovernanceDocument(activeDoc, actorEmail, actorRole);
      setPromotedSuccessId(govDoc.id);
      setTimeout(() => setIsPromoting(false), 800);
    } catch (err: any) {
      setIsPromoting(false);
      alert(`Promotion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Enterprise Consulting Standard • Phase 46 Engine
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              Policy & Procedure Documentation Engine
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Consulting-grade documentation engine with completed reference benchmarks, strict single-accountability RACI discipline, operational failure gates, non-fabricating organizational questionnaires, and seamless promotion to authoritative PostgreSQL governance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('questionnaire')}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              Tailoring Questionnaire
            </button>
            <button
              onClick={() => handleTailorDocument()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Tailor Active Document
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'catalogue'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Documentation Catalogue (56 Templates)
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'models'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Model Benchmarks (ISMS-POL / ISMS-PROC)
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Blank Reusable Templates
          </button>
          <button
            onClick={() => setActiveTab('document_viewer')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'document_viewer'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Document Viewer & Details
            <span className="bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded text-[10px] ml-1">
              {activeDoc.metadata.documentId}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('quality_scorecard')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'quality_scorecard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Consulting Quality Audit
            <span className={`px-1.5 py-0.5 rounded text-[10px] ml-1 font-bold ${
              scorecard.overallScore >= 90 ? 'bg-emerald-900/80 text-emerald-300' : 'bg-amber-900/80 text-amber-300'
            }`}>
              {scorecard.overallScore}%
            </span>
          </button>
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'questionnaire'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Context Questionnaire
          </button>
        </div>
      </div>

      {/* VIEW 0: DOCUMENTATION CATALOGUE & TEMPLATE INTELLIGENCE (PHASE 47) */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          {/* Generation Success Toast */}
          {generationNotice && (
            <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {generationNotice}
              </span>
              <button onClick={() => setGenerationNotice(null)} className="text-emerald-400 hover:text-emerald-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search & Multi-Faceted Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalogue by title, purpose, category, or ID (e.g. Access Control, DPIA, SoA)..."
                  value={catalogueSearch}
                  onChange={(e) => setCatalogueSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {catalogueSearch && (
                  <button
                    onClick={() => setCatalogueSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={filterDocType}
                  onChange={(e) => setFilterDocType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Document Types (10 Levels)</option>
                  <option value="POLICY">Policies</option>
                  <option value="PROCEDURE">Procedures</option>
                  <option value="STANDARD">Technical Standards</option>
                  <option value="SOP">Standard Operating Procedures</option>
                  <option value="GUIDELINE">Guidelines</option>
                  <option value="WORK_INSTRUCTION">Work Instructions</option>
                  <option value="FORM_CHECKLIST">Forms & Checklists</option>
                  <option value="REGISTER_LOG">Registers & Logs</option>
                  <option value="IMPLEMENTATION_PLAN">Implementation Plans</option>
                  <option value="MANAGEMENT_REVIEW_PACK">Management Review Packs</option>
                </select>

                <select
                  value={filterDomain}
                  onChange={(e) => setFilterDomain(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Domains (7 Core)</option>
                  <option value="INFORMATION_SECURITY">Information Security</option>
                  <option value="PRIVACY_AND_DATA_PROTECTION">Privacy & Data Protection</option>
                  <option value="ENTERPRISE_RISK">Enterprise Risk</option>
                  <option value="COMPLIANCE_AND_AUDIT">Compliance & Audit</option>
                  <option value="TECHNOLOGY_AND_ENGINEERING">Technology & Engineering</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="THIRD_PARTY_RISK">Third-Party Risk</option>
                </select>
              </div>
            </div>

            {/* Depth Filter Pills & Counters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium mr-1">Content Depth:</span>
                <button
                  onClick={() => setFilterContentDepth('ALL')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    filterContentDepth === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({filteredTemplates.length})
                </button>
                <button
                  onClick={() => setFilterContentDepth('SUBSTANTIVE_MODEL_AVAILABLE')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    filterContentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Substantive Models (14)
                </button>
                <button
                  onClick={() => setFilterContentDepth('SCAFFOLD_TEMPLATE_AVAILABLE')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    filterContentDepth === 'SCAFFOLD_TEMPLATE_AVAILABLE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Scaffold Templates (42)
                </button>
              </div>

              <div className="text-slate-500 text-[11px]">
                Showing <strong className="text-slate-800">{filteredTemplates.length}</strong> of 56 Priority Enterprise Templates
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => {
              const totalInputs = template.requiredOrganizationalInputs.length;
              const resolvedInputs = template.requiredOrganizationalInputs.filter(isInputResolved).length;
              const isSubstantive = template.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE';

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {template.id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isSubstantive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isSubstantive ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                            Substantive Model
                          </>
                        ) : (
                          <>
                            <Layers className="w-2.5 h-2.5 text-slate-500" />
                            Scaffold Template
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
                      {template.title}
                    </h4>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {template.documentType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {template.domain.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {template.intendedPurpose}
                    </p>

                    {/* Mapped Frameworks Chips */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.relatedFrameworks.slice(0, 2).map((fw, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                          title={`${fw.frameworkCode}: ${fw.clauseOrControl} (${fw.provenance})`}
                        >
                          {fw.clauseOrControl}
                        </span>
                      ))}
                      {template.relatedFrameworks.length > 2 && (
                        <span className="text-[10px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                          +{template.relatedFrameworks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      {resolvedInputs === totalInputs ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {resolvedInputs}/{totalInputs} Inputs Ready
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {resolvedInputs}/{totalInputs} Inputs Set
                        </span>
                      )}
                    </span>

                    <button
                      onClick={() => setSelectedCatalogueTemplate(template)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      Inspect & Generate
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No templates matching your filter criteria</h4>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or adjusting your search keyword.</p>
              <button
                onClick={() => {
                  setCatalogueSearch('');
                  setFilterDocType('ALL');
                  setFilterDomain('ALL');
                  setFilterContentDepth('ALL');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* TEMPLATE DETAIL DRAWER / MODAL */}
          {selectedCatalogueTemplate && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95">
                {/* Modal Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
                        {selectedCatalogueTemplate.id}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        v{selectedCatalogueTemplate.version} • {selectedCatalogueTemplate.domain.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedCatalogueTemplate.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedCatalogueTemplate(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
                  {/* Content Depth Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      selectedCatalogueTemplate.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    {selectedCatalogueTemplate.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Layers className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <div>
                      <strong className="font-semibold block">
                        {selectedCatalogueTemplate.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE'
                          ? 'Substantive Reference Model Available'
                          : 'Standard Structural Scaffold Ready for Tailoring'}
                      </strong>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {selectedCatalogueTemplate.contentDepth === 'SUBSTANTIVE_MODEL_AVAILABLE'
                          ? 'Includes domain-specific mandatory requirements, operational failure gates, RACI discipline, and assurance limitations.'
                          : 'Provides complete structural sections, RACI, tailoring checklist, and field completion guidance.'}
                      </p>
                    </div>
                  </div>

                  {/* Intended Purpose */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      Intended Purpose & Scope
                    </h4>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedCatalogueTemplate.intendedPurpose}
                    </p>
                  </div>

                  {/* Required Inputs Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                        Required Organizational Inputs Checklist
                      </h4>
                      <button
                        onClick={() => {
                          setSelectedCatalogueTemplate(null);
                          setActiveTab('questionnaire');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-1"
                      >
                        Edit Questionnaire
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedCatalogueTemplate.requiredOrganizationalInputs.map((input, idx) => {
                        const resolved = isInputResolved(input);
                        return (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                            <span className="font-mono text-slate-700 text-[11px]">{input}</span>
                            {resolved ? (
                              <span className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Verified in Profile
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium text-[11px] flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Missing (Will generate checklist item)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Framework Traceability Table */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Framework Traceability & Provenance Status
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-2">Framework & Clause</th>
                            <th className="p-2">Provenance Status</th>
                            <th className="p-2">Distinction</th>
                            <th className="p-2">Assurance Limitation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedCatalogueTemplate.relatedFrameworks.map((fw, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="p-2 font-mono font-medium text-slate-900">
                                {fw.frameworkCode}: {fw.clauseOrControl}
                              </td>
                              <td className="p-2">
                                <span className="bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                                  {fw.provenance}
                                </span>
                              </td>
                              <td className="p-2 text-slate-600">
                                {fw.distinctionType}
                              </td>
                              <td className="p-2 text-slate-500 italic max-w-xs">
                                {fw.assuranceLimitationNotice}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Governance Roles & Required Sections */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block mb-1">Governing Roles</span>
                      <div className="space-y-1">
                        <div><strong className="text-slate-800">Owner:</strong> {selectedCatalogueTemplate.ownerAndReviewerRoles.defaultOwnerRole}</div>
                        <div><strong className="text-slate-800">Reviewer:</strong> {selectedCatalogueTemplate.ownerAndReviewerRoles.defaultReviewerRole}</div>
                        <div><strong className="text-slate-800">Approver:</strong> {selectedCatalogueTemplate.ownerAndReviewerRoles.approverRole}</div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-500 font-semibold block mb-1">Required Sections ({selectedCatalogueTemplate.requiredSections.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCatalogueTemplate.requiredSections.map((sec, idx) => (
                          <span key={idx} className="bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer: 3 GENERATION MODES */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Select a generation mode to instantiate this template into the Studio:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerateFromCatalogue(selectedCatalogueTemplate, 'BLANK')}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-semibold border border-slate-300 text-xs transition-all shadow-sm"
                    >
                      Mode A — Blank Template
                    </button>
                    <button
                      onClick={() => handleGenerateFromCatalogue(selectedCatalogueTemplate, 'MODEL')}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all shadow-sm"
                    >
                      Mode B — Model Sample
                    </button>
                    <button
                      onClick={() => handleGenerateFromCatalogue(selectedCatalogueTemplate, 'TAILORED')}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      Mode C — Customize for My Organization
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: MODEL BENCHMARKS */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Information Security Policy */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-50 text-blue-700 font-semibold text-xs px-2.5 py-1 rounded-md border border-blue-200">
                  Level 1 Governance Policy
                </span>
                <span className="text-xs text-slate-500 font-mono">ISMS-POL-001 v1.1</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Enterprise Information Security Policy
              </h3>
              <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                Management commitment, governance, risk ownership and mandatory security requirements. Matches reference 7-page enterprise benchmark with 9 mandatory requirement blocks, assurance limitations, and pre-publication checklist.
              </p>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 font-mono">
                <div className="flex justify-between">
                  <span>Frameworks:</span>
                  <span className="font-semibold text-slate-900">ISO 27001 (5.1, 5.2), SOC 2, MAS TRM</span>
                </div>
                <div className="flex justify-between">
                  <span>Assurance Limitations:</span>
                  <span className="font-semibold text-emerald-600">6 Explicit Declarations</span>
                </div>
                <div className="flex justify-between">
                  <span>Tailoring Checklist:</span>
                  <span className="font-semibold text-slate-900">7 Pre-Publication Verification Items</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Model Sample — Tailor before use
              </span>
              <button
                onClick={() => handleSelectModel('ISMS-POL-001')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                Inspect & Tailor
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: User Access Provisioning Procedure */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-md border border-indigo-200">
                  Level 2 Operational Procedure
                </span>
                <span className="text-xs text-slate-500 font-mono">ISMS-PROC-IAM-001 v1.1</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                User Access Provisioning and Modification Procedure
              </h3>
              <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                Operational control procedure with 9 sequential gates, strict single-accountability RACI discipline, decision rules, service-level governance, evidence retention specs, and failure handling. Matches 9-page benchmark.
              </p>

              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 font-mono">
                <div className="flex justify-between">
                  <span>Operational Gates:</span>
                  <span className="font-semibold text-slate-900">9 Steps (Action, Role, Evidence, Exit, Failure)</span>
                </div>
                <div className="flex justify-between">
                  <span>RACI Discipline:</span>
                  <span className="font-semibold text-emerald-600">Strictly 1 Accountable ('A') Role / Task</span>
                </div>
                <div className="flex justify-between">
                  <span>Decision Scenarios:</span>
                  <span className="font-semibold text-slate-900">8 Decision Rules & Escalation Vectors</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Model Sample — Tailor before use
              </span>
              <button
                onClick={() => handleSelectModel('ISMS-PROC-IAM-001')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                Inspect & Tailor
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BLANK TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Blank Governance Policy Template</h3>
            <p className="text-xs text-slate-600 mb-4">
              Clean 13-section Level 1 Policy template with Document Control Field, Document Governance, Terms, Objectives, RACI scaffolding, and Tailoring Checklist ready for custom policy authoring.
            </p>
            <button
              onClick={() => handleSelectTemplate('POLICY')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              Load Blank Policy Template
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Blank Operational Procedure Template</h3>
            <p className="text-xs text-slate-600 mb-4">
              Clean 14-section Level 2 Procedure template with 6-column operational gate table (Step, Action, Role, Evidence, Exit Criteria, Failure Handling), SLA governance, and Appendix B RACI matrix.
            </p>
            <button
              onClick={() => handleSelectTemplate('PROCEDURE')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              Load Blank Procedure Template
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: DOCUMENT VIEWER & ACTION BAR */}
      {activeTab === 'document_viewer' && (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                {activeDoc.metadata.documentId}
              </span>
              <span className="text-xs text-slate-500">Version: {activeDoc.metadata.version}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {activeDoc.metadata.status}
              </span>
              {activeDoc.metadata.notice && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded border border-amber-200 font-medium">
                  {activeDoc.metadata.notice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMarkdown}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200 transition-all"
                title="Copy GitHub-Flavored Markdown to Clipboard"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedNotification ? 'Copied MD!' : 'Copy MD'}
              </button>
              <button
                onClick={handleExportHtml}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200 transition-all"
                title="Open Print-Ready HTML with Landscape Tables & Running Headers"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                Print / PDF Preview
              </button>
              <button
                onClick={handleExportDocx}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                title="Export as Microsoft Word (.docx) document"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                Export Word (.docx)
              </button>
              <button
                onClick={handlePromoteToGovernance}
                disabled={isPromoting}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                title="Register directly in Authoritative Policy Governance Engine & PostgreSQL"
              >
                {isPromoting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Promote to Governance
              </button>
            </div>
          </div>

          {promotedSuccessId && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Successfully Promoted!</strong> Document registered as authoritative Governance Document{' '}
                  <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">{promotedSuccessId}</code> in PostgreSQL.
                </span>
              </div>
              <button
                onClick={() => setPromotedSuccessId(null)}
                className="text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Document Content Paper View */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-5xl mx-auto">
            {/* Header info */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span>SKANDA / GOVERNANCE, RISK & COMPLIANCE</span>
              <span>{activeDoc.metadata.documentId}</span>
            </div>

            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                ENTERPRISE MANAGEMENT SYSTEM / {activeDoc.metadata.documentType}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 mt-1">{activeDoc.metadata.title}</h1>
              {activeDoc.metadata.subtitle && (
                <p className="text-sm text-slate-600 mt-1">{activeDoc.metadata.subtitle}</p>
              )}
            </div>

            {/* Document Control Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Document Control Field</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="p-2.5 w-1/3">Document Control Field</th>
                      <th className="p-2.5">Model Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Document ID</td><td className="p-2.5 font-mono">{activeDoc.metadata.documentId}</td></tr>
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Version / status</td><td className="p-2.5">{activeDoc.metadata.version} — {activeDoc.metadata.status}</td></tr>
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Document owner</td><td className="p-2.5">{activeDoc.metadata.documentOwner}</td></tr>
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Approver</td><td className="p-2.5">{activeDoc.metadata.approver}</td></tr>
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Effective date</td><td className="p-2.5">{activeDoc.metadata.effectiveDate}</td></tr>
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Classification</td><td className="p-2.5">{activeDoc.metadata.classification}</td></tr>
                    <tr><td className="p-2.5 font-semibold bg-slate-50">Review trigger</td><td className="p-2.5">{activeDoc.metadata.reviewTrigger}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revision History */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Revision History</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="p-2.5 w-16">Version</th>
                      <th className="p-2.5 w-24">Date</th>
                      <th className="p-2.5">Summary of Change</th>
                      <th className="p-2.5 w-40">Prepared By</th>
                      <th className="p-2.5 w-40">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeDoc.revisionHistory.map((r, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                        <td className="p-2.5 font-bold">{r.version}</td>
                        <td className="p-2.5 text-slate-600">{r.date}</td>
                        <td className="p-2.5">{r.summaryOfChange}</td>
                        <td className="p-2.5 text-slate-600">{r.preparedBy}</td>
                        <td className="p-2.5 text-slate-700 font-medium">{r.approvalStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1. Purpose */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">1. Purpose</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {activeDoc.purpose}
              </p>
            </div>

            {/* 2. Scope */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">2. Scope and Applicability</h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-2">{activeDoc.scope.statement}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800">In-Scope Locations:</span>
                  <ul className="list-disc pl-4 mt-1 text-slate-600">
                    {activeDoc.scope.inScopeLocations.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">In-Scope Systems & Services:</span>
                  <ul className="list-disc pl-4 mt-1 text-slate-600">
                    {activeDoc.scope.inScopeSystemsAndServices.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Terms and Definitions */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">3. Terms and Definitions</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white font-semibold">
                    <tr>
                      <th className="p-2.5 w-1/3">Term</th>
                      <th className="p-2.5">Working Definition (Model)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeDoc.termsAndDefinitions.map((t, i) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                        <td className="p-2.5 font-bold text-slate-900">{t.term}</td>
                        <td className="p-2.5 text-slate-700">{t.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Level 2 Procedure Steps Table (if applicable) */}
            {activeDoc.procedureSteps && activeDoc.procedureSteps.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  7. Procedure Steps & Operational Gates (Full Operational View)
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
                  <table className="w-full min-w-[750px] text-left">
                    <thead className="bg-slate-900 text-white font-semibold">
                      <tr>
                        <th className="p-2.5 w-28">Step / Gate</th>
                        <th className="p-2.5">Required Action</th>
                        <th className="p-2.5 w-36">Responsible Role</th>
                        <th className="p-2.5 w-36">Evidence</th>
                        <th className="p-2.5 w-36">Exit Criteria</th>
                        <th className="p-2.5 w-36">Failure / Exception</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeDoc.procedureSteps.map((s, i) => (
                        <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                          <td className="p-2.5 font-bold text-slate-900">{s.stepNumber}. {s.stepName}</td>
                          <td className="p-2.5 text-slate-700">{s.requiredAction}</td>
                          <td className="p-2.5 text-blue-700 font-semibold">{s.responsibleRole}</td>
                          <td className="p-2.5 text-slate-600">{s.evidenceProduced}</td>
                          <td className="p-2.5 text-emerald-700 font-medium">{s.exitCriteria}</td>
                          <td className="p-2.5 text-red-600 font-medium">{s.failureOrExceptionHandling}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Appendix B Operational RACI (if applicable) */}
            {activeDoc.appendixB_OperationalRaci && activeDoc.appendixB_OperationalRaci.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Appendix B — Operational RACI (Strict Single-Accountability Rule)
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Validated: Exactly 1 'A' per activity
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white font-semibold text-center">
                      <tr>
                        <th className="p-2.5 text-left w-1/3">Activity</th>
                        <th className="p-2.5">Requester / Mgr</th>
                        <th className="p-2.5">System Owner</th>
                        <th className="p-2.5">IAM / Operator</th>
                        <th className="p-2.5">Security Reviewer</th>
                        <th className="p-2.5">Verifier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-center font-mono">
                      {activeDoc.appendixB_OperationalRaci.map((r, i) => (
                        <tr key={i} className={i % 2 === 1 ? 'bg-slate-50' : ''}>
                          <td className="p-2.5 text-left font-sans font-medium text-slate-900">{r.activity}</td>
                          <td className={`p-2.5 ${r.requesterOrManager.includes('A') ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-600'}`}>{r.requesterOrManager}</td>
                          <td className={`p-2.5 ${r.systemOwner.includes('A') ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-600'}`}>{r.systemOwner}</td>
                          <td className={`p-2.5 ${r.iamOrOperator.includes('A') ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-600'}`}>{r.iamOrOperator}</td>
                          <td className={`p-2.5 ${r.securityReviewer.includes('A') ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-600'}`}>{r.securityReviewer}</td>
                          <td className={`p-2.5 ${r.verifier.includes('A') ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-slate-600'}`}>{r.verifier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  R = Responsible; A = Accountable; C = Consulted; I = Informed. Each activity has exactly one Accountable role.
                </p>
              </div>
            )}

            {/* Appendix C Tailoring Checklist */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Appendix C — Pre-Publication Tailoring Checklist</h3>
              <div className="space-y-2 text-xs">
                {activeDoc.appendixC_TailoringChecklist.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      c.isCompleted ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {c.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-slate-400 shrink-0" />
                      )}
                      <div>
                        <strong className="font-semibold">{c.id}:</strong> {c.description}
                      </div>
                    </div>
                    {c.isCompleted && c.verifiedEvidenceRef && (
                      <span className="text-[10px] text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded">
                        {c.verifiedEvidenceRef}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CONSULTING QUALITY SCORECARD */}
      {activeTab === 'quality_scorecard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Enterprise Quality Standard • ISO 27001 & SOC 2 Lead Auditor Gate
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  Consulting Quality Scorecard: {activeDoc.metadata.documentId}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluation against 7 critical consulting assurance dimensions. Publication is strictly gated by 100% tailoring checklist completion, zero unresolved placeholders, and RACI single-accountability compliance.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">{scorecard.overallScore}%</div>
                  <div className={`text-xs font-semibold ${scorecard.isConsultingGrade ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {scorecard.isConsultingGrade ? 'Consulting Grade Verified' : 'Adjustments Required'}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white ${
                  scorecard.overallScore >= 90 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}>
                  {scorecard.overallScore >= 90 ? 'A+' : 'B'}
                </div>
              </div>
            </div>

            {/* Dimension Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(scorecard.dimensionScores).map(([key, dim]) => (
                <div key={key} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-slate-800">{dim.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {dim.score} / {dim.maxScore} pts
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dim.passed ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Findings & Critical Gates */}
            {scorecard.criticalDefects.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-xs">
                <h4 className="font-bold text-red-800 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Critical Publication Blockers ({scorecard.criticalDefects.length})
                </h4>
                <div className="space-y-2">
                  {scorecard.criticalDefects.map((f, i) => (
                    <div key={i} className="text-red-700 bg-red-100/50 p-2.5 rounded border border-red-200">
                      <strong>[{f.code}] {f.section}:</strong> {f.finding}
                      <div className="text-red-900 mt-1 italic font-medium">Remediation: {f.remediation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scorecard.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
                <h4 className="font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Quality Observations & Recommendations ({scorecard.warnings.length})
                </h4>
                <div className="space-y-2">
                  {scorecard.warnings.map((f, i) => (
                    <div key={i} className="text-amber-800 bg-amber-100/40 p-2.5 rounded border border-amber-200">
                      <strong>[{f.code}] {f.section}:</strong> {f.finding}
                      <div className="text-amber-950 mt-1 italic">Remediation: {f.remediation}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: ORGANIZATIONAL CONTEXT QUESTIONNAIRE */}
      {activeTab === 'questionnaire' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Non-Fabrication Policy Engine
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Organizational Context Questionnaire
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provides the authoritative organizational operating facts used to tailor policy and procedure templates. SKANDA strictly prohibits hallucinating or inventing organizational facts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Section 1: Entity Profile */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                1. Organization Profile & Scoping
              </h4>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Legal Entity Name</label>
                <input
                  type="text"
                  value={questionnaire.organizationProfile.legalEntityName}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    organizationProfile: { ...questionnaire.organizationProfile, legalEntityName: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Industry Classification</label>
                <input
                  type="text"
                  value={questionnaire.organizationProfile.industry}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    organizationProfile: { ...questionnaire.organizationProfile, industry: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Headquarters Location</label>
                <input
                  type="text"
                  value={questionnaire.organizationProfile.headquartersLocation}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    organizationProfile: { ...questionnaire.organizationProfile, headquartersLocation: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Section 2: Technology Stack */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-indigo-600" />
                2. Operating Systems & Toolchain
              </h4>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Identity Provider (IdP)</label>
                <input
                  type="text"
                  value={questionnaire.operatingModel.identityProvider}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    operatingModel: { ...questionnaire.operatingModel, identityProvider: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Ticketing & ITSM Platform</label>
                <input
                  type="text"
                  value={questionnaire.operatingModel.ticketingAndItsmSystem}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    operatingModel: { ...questionnaire.operatingModel, ticketingAndItsmSystem: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Evidence Storage Vault</label>
                <input
                  type="text"
                  value={questionnaire.evidenceAndRecordsRetention.evidenceStorageVault}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    evidenceAndRecordsRetention: { ...questionnaire.evidenceAndRecordsRetention, evidenceStorageVault: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            {/* Section 3: Key Personnel & Roles */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                3. Governance Roles & Key Stakeholders
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">CISO Role Title</label>
                  <input
                    type="text"
                    value={questionnaire.keyRolesAndDelegations.ismsOwnerOrCisoRole}
                    onChange={(e) => setQuestionnaire({
                      ...questionnaire,
                      keyRolesAndDelegations: { ...questionnaire.keyRolesAndDelegations, ismsOwnerOrCisoRole: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">CISO Email</label>
                  <input
                    type="email"
                    value={questionnaire.keyRolesAndDelegations.ismsOwnerOrCisoEmail}
                    onChange={(e) => setQuestionnaire({
                      ...questionnaire,
                      keyRolesAndDelegations: { ...questionnaire.keyRolesAndDelegations, ismsOwnerOrCisoEmail: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Executive Sponsor</label>
                  <input
                    type="text"
                    value={questionnaire.keyRolesAndDelegations.executiveSponsorRole}
                    onChange={(e) => setQuestionnaire({
                      ...questionnaire,
                      keyRolesAndDelegations: { ...questionnaire.keyRolesAndDelegations, executiveSponsorRole: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Executive Email</label>
                  <input
                    type="email"
                    value={questionnaire.keyRolesAndDelegations.executiveSponsorEmail}
                    onChange={(e) => setQuestionnaire({
                      ...questionnaire,
                      keyRolesAndDelegations: { ...questionnaire.keyRolesAndDelegations, executiveSponsorEmail: e.target.value }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: SLAs & Retention */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                4. Operational SLAs & Turnaround
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Standard User SLA (Days)</label>
                  <input
                    type="number"
                    value={questionnaire.serviceLevelCommitments.standardAccessDays}
                    onChange={(e) => setQuestionnaire({
                      ...questionnaire,
                      serviceLevelCommitments: { ...questionnaire.serviceLevelCommitments, standardAccessDays: Number(e.target.value) }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Privileged SLA (Hours)</label>
                  <input
                    type="number"
                    value={questionnaire.serviceLevelCommitments.privilegedAccessHours}
                    onChange={(e) => setQuestionnaire({
                      ...questionnaire,
                      serviceLevelCommitments: { ...questionnaire.serviceLevelCommitments, privilegedAccessHours: Number(e.target.value) }
                    })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Emergency Break-Glass SLA (Minutes)</label>
                <input
                  type="number"
                  value={questionnaire.serviceLevelCommitments.emergencyAccessMinutes}
                  onChange={(e) => setQuestionnaire({
                    ...questionnaire,
                    serviceLevelCommitments: { ...questionnaire.serviceLevelCommitments, emergencyAccessMinutes: Number(e.target.value) }
                  })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleTailorDocument}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Save Questionnaire & Tailor Active Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
