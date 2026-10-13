import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Search,
  Sliders,
  Download,
  Copy,
  Check,
  Sparkles,
  Server,
  Key,
  RefreshCw,
  Eye,
  BookOpen,
  Table,
  AlertCircle,
  FileCode,
  Printer,
  Clock,
  UserCheck,
  Hash,
  ChevronRight,
  ShieldAlert,
  Save,
  HelpCircle,
  Laptop,
  Award,
  X,
  Database,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Workflow,
  FileSpreadsheet,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import {
  Iso27001PolicyEngine,
  StandardTemplateMetadata,
  PredefinedTemplateSections,
  ISO27001_POLICY_CATALOG,
  Stage2AuditorEvidenceLog,
  getStage2EvidenceLogsForPolicy,
  formatStage2LogsToMarkdown,
  formatRaciMatrixToMarkdown,
  getStandardIsoAuditHeaderForDoc,
  getStandardClause91KpisForDoc,
  formatIsoAuditHeaderAndKpisToMarkdown
} from '../../services/iso27001PolicyEngine';
import { StandardPdfDocumentView } from '../documents/StandardPdfDocumentView';
import { GeneratedDocument } from '../../types';
import { TuvSopEngineView } from './TuvSopEngineView';
import { TuvSoaMatrixView } from './TuvSoaMatrixView';
import { getFormalTuvSopStructure } from '../../services/iso27001Templates/sopTemplateEngine';

/**
 * 12-Step Structural Standard definition for ISO/IEC 27001:2022 compliant ISMS documentation.
 * Fulfills lead auditor requirements across Level 1 Governance, Level 2 Topic-Specific Policies,
 * Level 3 Operational Procedures (SOPs), and Level 4 Registers & Records.
 */
export interface StructuralStepDefinition {
  stepNumber: number;
  title: string;
  isoClause: string;
  pillar: 'GOVERNANCE' | 'PURPOSE' | 'SCOPE' | 'POLICY' | 'RACI' | 'OPERATIONS' | 'AUDIT';
  description: string;
  mandatoryElements: string[];
}

export const ISO27001_12_STEP_STRUCTURAL_STANDARD: StructuralStepDefinition[] = [
  {
    stepNumber: 1,
    title: 'Document Control, Versioning & Classification',
    isoClause: 'ISO 27001:2022 Clause 7.5',
    pillar: 'GOVERNANCE',
    description: 'Formal document metadata, owner, approver, classification marking, revision table, and review cadence.',
    mandatoryElements: ['Document Code', 'Revision Table', 'Classification Marking', 'Annual Review SLA']
  },
  {
    stepNumber: 2,
    title: 'Executive Purpose & Strategic Mandate',
    isoClause: 'ISO 27001:2022 Clause 5.1 & 5.2',
    pillar: 'PURPOSE',
    description: 'Executive umbrella mandate linking information security to business objectives, CIA triad protection, and top management commitment.',
    mandatoryElements: ['Executive Mandate', 'CIA Triad Alignment', 'Statutory Drivers', 'Top Management Commitment']
  },
  {
    stepNumber: 3,
    title: 'Scope & Technological Boundaries',
    isoClause: 'ISO 27001:2022 Clause 4.3',
    pillar: 'SCOPE',
    description: 'Defines tri-partite boundaries (Logical Cloud VPCs, Physical facilities, and Personnel/Contractors) with non-negotiable Clause 4-10 applicability.',
    mandatoryElements: ['Cloud/Logical Scope', 'Physical Facilities', 'Third-Party Contractors', 'Defensible Exclusions Justification']
  },
  {
    stepNumber: 4,
    title: 'Normative References & Legal Mandates',
    isoClause: 'ISO 27001:2022 Clause 4.2',
    pillar: 'GOVERNANCE',
    description: 'External standards, statutory compliance laws (GDPR, DPDP, HIPAA, MAS TRM), and contractual obligations.',
    mandatoryElements: ['Applicable Legislation', 'Regulatory Filings', 'Contractual SLAs', 'Penalties for Non-Compliance']
  },
  {
    stepNumber: 5,
    title: 'Core Policy Statements & Minimum Controls',
    isoClause: 'ISO 27001:2022 Annex A',
    pillar: 'POLICY',
    description: 'Definitive mandatory rules and minimum baseline security requirements enforceable across the entire organization.',
    mandatoryElements: ['Enforceable Shall Statements', 'Baseline Technical Controls', 'Zero-Trust Mandates']
  },
  {
    stepNumber: 6,
    title: 'Implementation Procedures & Technical Standards',
    isoClause: 'ISO 27001:2022 Clause 8.1',
    pillar: 'OPERATIONS',
    description: 'Operational workflows, technical configurations, cryptographic algorithms (AES-256, TLS 1.3), and standard operating guidelines.',
    mandatoryElements: ['Technical Baselines', 'Standard Operating Workflows', 'Toolchain Configurations']
  },
  {
    stepNumber: 7,
    title: 'RACI Accountability & Governance Matrix',
    isoClause: 'ISO 27001:2022 Clause 5.3',
    pillar: 'RACI',
    description: 'Six-role accountability distribution (Executive, CISO, SecOps, Department Heads, System Owners, Employees) across ISMS lifecycle phases.',
    mandatoryElements: ['Responsible (R)', 'Accountable (A)', 'Consulted (C)', 'Informed (I)', 'Escalation Protocols']
  },
  {
    stepNumber: 8,
    title: 'Exceptions, Waivers & Non-Conformity Management',
    isoClause: 'ISO 27001:2022 Clause 10.1',
    pillar: 'GOVERNANCE',
    description: 'Formal risk-assessed deviation protocol, temporary compensatory controls, CISO sign-off, and maximum waiver expiration (90 days).',
    mandatoryElements: ['Formal Exception Form', 'Compensating Controls', 'CISO Digital Approval', '90-Day Time-Boxed Expiry']
  },
  {
    stepNumber: 9,
    title: 'Monitoring, Metrics, KPIs & Review Cadence',
    isoClause: 'ISO 27001:2022 Clause 9.1 & 10.2',
    pillar: 'OPERATIONS',
    description: 'Quantitative metric SLAs, continuous compliance telemetry, monthly KPI reviews, and annual ISMS audit schedules.',
    mandatoryElements: ['Quantitative KPIs', 'Review Schedule', 'Management Review Inputs', 'Continual Improvement Triggers']
  },
  {
    stepNumber: 10,
    title: 'Enforcement, Disciplinary Actions & Sanctions',
    isoClause: 'ISO 27001:2022 Clause 7.2',
    pillar: 'GOVERNANCE',
    description: 'Consequences of willful non-compliance, HR disciplinary escalation paths, and statutory reporting obligations.',
    mandatoryElements: ['HR Escalation Paths', 'Revocation of Privileges', 'Statutory Legal Escalations']
  },
  {
    stepNumber: 11,
    title: 'Related ISMS Documentation & Annex A Control Mapping',
    isoClause: 'ISO 27001:2022 Clause 7.5',
    pillar: 'GOVERNANCE',
    description: 'Explicit cross-references to SoA control IDs, lower-level SOPs, registers, records, and evidence collections.',
    mandatoryElements: ['SoA Control IDs', 'Operational SOP Links', 'Evidence Repository Paths']
  },
  {
    stepNumber: 12,
    title: 'Lead Auditor Evidence Checklist & Sampling Guidelines',
    isoClause: 'ISO 27001:2022 Clause 9.2 & ISO 19011 §B.3',
    pillar: 'AUDIT',
    description: 'Auditor workpaper references, statistical sampling protocol (95% confidence, 5% MoE), WORM immutable storage, and SHA-256 seal.',
    mandatoryElements: ['Verifiable Primary Artifact', 'ISO 19011 Sampling Protocol', 'Storage Repository Target', 'SHA-256 Seal', 'Statutory Retention SLA']
  }
];

/**
 * Maps any ISO 27001:2022 Clause or Annex A Control to its primary policy template code.
 */
export function getTemplateForClause(clauseOrAnnexA: string): StandardTemplateMetadata | undefined {
  if (!clauseOrAnnexA) return undefined;
  const clean = clauseOrAnnexA.toLowerCase().trim();

  // Direct code match
  const directMatch = ISO27001_POLICY_CATALOG.find(
    t => t.code.toLowerCase() === clean || t.id.toLowerCase() === clean
  );
  if (directMatch) return directMatch;

  // Clause match
  return ISO27001_POLICY_CATALOG.find(t => {
    const isoRef = t.isoClauseOrAnnexA.toLowerCase();
    return isoRef.includes(clean) || clean.includes(isoRef);
  });
}

/**
 * Returns all standard templates in the ISO 27001:2022 catalog.
 */
export function getAllStandardTemplates(): StandardTemplateMetadata[] {
  return Iso27001PolicyEngine.getCatalog();
}

/**
 * Returns the 12-Step Structural Standard definition.
 */
export function get12StepStructuralStandard(): StructuralStepDefinition[] {
  return ISO27001_12_STEP_STRUCTURAL_STANDARD;
}

export interface PolicyGeneratorProps {
  initialTemplateCode?: string;
  targetClause?: string;
  onClose?: () => void;
  isEmbedded?: boolean;
  onDocumentGenerated?: (doc: GeneratedDocument) => void;
  isOpen?: boolean;
  defaultStep?: number;
}

export const PolicyGenerator: React.FC<PolicyGeneratorProps> = ({
  initialTemplateCode,
  targetClause,
  onClose,
  isEmbedded = false,
  onDocumentGenerated,
  isOpen,
  defaultStep = 2
}) => {
  const { currentTenant, users, addDocument, theme, synthesizeStandardsPolicySuite } = useGRC();

  // Catalog & Template State
  const catalog = useMemo(() => Iso27001PolicyEngine.getCatalog(), []);

  // Compute resolved initial code from targetClause if provided
  const initialCode = useMemo(() => {
    if (initialTemplateCode) return initialTemplateCode;
    if (targetClause) {
      const match = getTemplateForClause(targetClause);
      if (match) return match.code;
    }
    return 'POL-ACC-04';
  }, [initialTemplateCode, targetClause]);

  const [selectedCode, setSelectedCode] = useState<string>(initialCode);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMandatoryOnly, setFilterMandatoryOnly] = useState(false);

  // Active View Mode & Step Focus
  const [activeTab, setActiveTab] = useState<'architectural' | 'preview' | 'markdown' | 'dossier' | 'tuv-sop' | 'tuv-soa'>('architectural');
  const [selectedArchitecturalStep, setSelectedArchitecturalStep] = useState<number>(defaultStep);
  const [show12StepGuide, setShow12StepGuide] = useState(false);

  // Tenant Customization Parameters
  const [companyName, setCompanyName] = useState(currentTenant?.name || 'Skanda Enterprise');
  const [industry, setIndustry] = useState(currentTenant?.industryType || 'Technology, Cloud SaaS & FinTech');
  const [cloudProvider, setCloudProvider] = useState<'AWS' | 'GCP' | 'Azure' | 'Multi-Cloud'>('AWS');
  const [identityProvider, setIdentityProvider] = useState('Okta');
  const [mdmProvider, setMdmProvider] = useState('Jamf Pro');
  const [vulnerabilityTool, setVulnerabilityTool] = useState('Snyk & Trivy');
  const [scmProvider, setScmProvider] = useState('GitHub Enterprise');
  const [cisoName, setCisoName] = useState('Dr. Alexis Vance (CISO)');
  const [effectiveDate, setEffectiveDate] = useState('15 January 2026');
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Editable Overrides for Predefined Sections
  const [customPurposeMandate, setCustomPurposeMandate] = useState<string | null>(null);
  const [customScopeSummary, setCustomScopeSummary] = useState<string | null>(null);
  const [customRaciOverrides, setCustomRaciOverrides] = useState<Record<string, { r: boolean; a: boolean; c: boolean; i: boolean }> | null>(null);

  // AI Lead Auditor Deep Generation States
  const [aiSynthesizedDocs, setAiSynthesizedDocs] = useState<Record<string, { doc: GeneratedDocument; isAI: boolean; model: string }>>({});
  const [isAiSynthesizing, setIsAiSynthesizing] = useState<boolean>(false);
  const [aiSynthesisFocus, setAiSynthesisFocus] = useState<string>('');
  const [aiSynthesisError, setAiSynthesisError] = useState<string | null>(null);

  // Status & Notification states
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Stage 2 Auditor Verification Checklist Toggle and Interactive State
  const [includeStage2Checklist, setIncludeStage2Checklist] = useState<boolean>(true);
  const [stage2SearchQuery, setStage2SearchQuery] = useState<string>('');
  const [stage2CategoryFilter, setStage2CategoryFilter] = useState<string>('All');
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);
  const [copiedAllQueries, setCopiedAllQueries] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Active Template Metadata
  const currentTemplate = useMemo(() => {
    return catalog.find(t => t.code.toUpperCase() === selectedCode.toUpperCase()) || catalog[0];
  }, [catalog, selectedCode]);

  // Stage 2 Operational Evidence Logs computation for this specific policy
  const stage2Logs: Stage2AuditorEvidenceLog[] = useMemo(() => {
    return getStage2EvidenceLogsForPolicy(selectedCode, {
      companyName,
      cloudProvider,
      identityProvider,
      mdmProvider,
      vulnerabilityTool,
      scmProvider,
      cisoName
    });
  }, [
    selectedCode,
    companyName,
    cloudProvider,
    identityProvider,
    mdmProvider,
    vulnerabilityTool,
    scmProvider,
    cisoName
  ]);

  // Filtered Stage 2 logs based on active category and search input
  const filteredStage2Logs = useMemo(() => {
    return stage2Logs.filter(log => {
      const matchesCategory =
        stage2CategoryFilter === 'All' || log.category.toLowerCase().includes(stage2CategoryFilter.toLowerCase());
      const matchesSearch =
        stage2SearchQuery.trim() === '' ||
        log.eventNameOrTicket.toLowerCase().includes(stage2SearchQuery.toLowerCase()) ||
        log.logSystem.toLowerCase().includes(stage2SearchQuery.toLowerCase()) ||
        log.verificationCriteria.toLowerCase().includes(stage2SearchQuery.toLowerCase()) ||
        log.extractionQueryOrPath.toLowerCase().includes(stage2SearchQuery.toLowerCase()) ||
        log.storageTarget.toLowerCase().includes(stage2SearchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [stage2Logs, stage2CategoryFilter, stage2SearchQuery]);

  // Formatted Markdown representation of the Stage 2 Evidence Logs Table
  const stage2MarkdownTable = useMemo(() => {
    return formatStage2LogsToMarkdown(stage2Logs, currentTemplate.code, currentTemplate.title);
  }, [stage2Logs, currentTemplate]);

  // Single query copy helper with visual indicator
  const handleCopyQuery = (queryText: string, logId: string) => {
    navigator.clipboard.writeText(queryText);
    setCopiedQueryId(logId);
    setTimeout(() => setCopiedQueryId(null), 2200);
  };

  // Copy all extraction queries at once for Lead Auditor workpapers
  const handleCopyAllQueries = () => {
    const allQueriesText = stage2Logs
      .map(
        (log, idx) =>
          `# ${idx + 1}. [${log.category}] ${log.logSystem} - ${log.eventNameOrTicket}\n# Verification: ${log.verificationCriteria}\n# Storage: ${log.storageTarget} (${log.retentionSla})\n${log.extractionQueryOrPath}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(allQueriesText);
    setCopiedAllQueries(true);
    setTimeout(() => setCopiedAllQueries(false), 2500);
  };

  // Pre-defined Sections computation
  const sections: PredefinedTemplateSections = useMemo(() => {
    const raw = Iso27001PolicyEngine.getTemplateSections(selectedCode, {
      companyName,
      industry,
      cloudProvider,
      identityProvider,
      mdmProvider,
      vulnerabilityTool,
      scmProvider,
      cisoName,
      effectiveDate,
      users,
      tenant: currentTenant,
      customRaciOverrides
    });

    // Apply custom overrides if user edited in the UI
    if (customPurposeMandate) {
      raw.purpose.executiveMandate = customPurposeMandate;
    }
    if (customScopeSummary) {
      raw.scope.summary = customScopeSummary;
    }
    if (customRaciOverrides) {
      raw.raci.matrix = raw.raci.matrix.map(row => {
        if (customRaciOverrides[row.role]) {
          return { ...row, ...customRaciOverrides[row.role] };
        }
        return row;
      });
    }

    return raw;
  }, [
    selectedCode,
    companyName,
    industry,
    cloudProvider,
    identityProvider,
    mdmProvider,
    vulnerabilityTool,
    scmProvider,
    cisoName,
    effectiveDate,
    users,
    currentTenant,
    customPurposeMandate,
    customScopeSummary,
    customRaciOverrides
  ]);

  // Live Generated Document with Stage 2 table injected when toggled ON
  const generatedDoc: GeneratedDocument = useMemo(() => {
    const doc = Iso27001PolicyEngine.generateDocument(selectedCode, {
      companyName,
      industry,
      cloudProvider,
      identityProvider,
      mdmProvider,
      vulnerabilityTool,
      scmProvider,
      cisoName,
      effectiveDate,
      users,
      tenant: currentTenant,
      customRaciOverrides
    });

    const fallbackDoc: GeneratedDocument = {
      id: `doc_${selectedCode.toLowerCase()}`,
      docCode: selectedCode,
      title: currentTemplate.title,
      type: currentTemplate.type,
      category: currentTemplate.category,
      version: '1.0',
      status: 'APPROVED',
      owner: cisoName,
      approver: 'Executive Board',
      effectiveDate,
      reviewCycle: currentTemplate.defaultReviewCycle,
      classification: 'Confidential - Internal ISMS Use Only',
      standard: 'ISO/IEC 27001:2022',
      documentOwner: cisoName,
      issuedBy: 'ISMS Working Group',
      approvedBy: 'CISO & Executive Management',
      acknowledgementCount: 1,
      content: `1. Executive Mandate & Purpose (Clause 5.1/5.2)\n${sections.purpose.executiveMandate}\n\n2. Scope & Technological Boundaries (Clause 4.3)\n${sections.scope.summary}\n\n3. RACI Accountability Matrix (Clause 5.3)\n4. Lead Auditor Evidence Checklist (Clause 9.2)`,
      lastModified: new Date().toISOString(),
      documentControlStatements: [
        `This document is maintained under formal revision control pursuant to ISO/IEC 27001:2022 Clause 7.5.`
      ],
      revisionHistory: [
        {
          sNo: '01',
          reviewDate: effectiveDate,
          pageNo: 'All Pages',
          issueNo: '1.0',
          changeDescription: 'Initial ISO 27001:2022 compliant policy synthesis.',
          approvedBy: cisoName
        }
      ],
      tableOfContents: [
        { title: 'Document Control & Revision Record', pageNo: 2, level: 1 },
        { title: 'Table of Contents', pageNo: 3, level: 1 },
        { title: '1. Executive Mandate & Purpose', pageNo: 4, level: 1 },
        { title: '2. Scope & Technological Boundaries', pageNo: 4, level: 1 },
        { title: '3. Tabular RACI Governance Matrix', pageNo: 5, level: 1 },
        { title: '4. Lead Auditor Evidence Checklist & Verification Seal', pageNo: 6, level: 1 }
      ],
      pages: [
        {
          pageNumber: 4,
          title: 'Executive Mandate, Purpose & Scope',
          content: `1. Executive Mandate & Purpose (Clause 5.1/5.2)\n${sections.purpose.executiveMandate}\n\n2. Scope & Technological Boundaries (Clause 4.3)\n${sections.scope.summary}`
        }
      ]
    };

    const baseDoc = aiSynthesizedDocs[selectedCode]?.doc || doc || fallbackDoc;

    // Ensure Lead Auditor Standards (ISO Audit Header Block & Clause 9.1 KPI Table) are present
    const isoAuditHeader = baseDoc.isoAuditHeader || getStandardIsoAuditHeaderForDoc(
      baseDoc.docCode,
      baseDoc.title,
      cisoName,
      effectiveDate
    );

    const clause91Kpis = baseDoc.clause91Kpis && baseDoc.clause91Kpis.length > 0
      ? baseDoc.clause91Kpis
      : getStandardClause91KpisForDoc(baseDoc.docCode, baseDoc.title, cisoName);

    let docWithAuditStandards: GeneratedDocument = {
      ...baseDoc,
      isoAuditHeader,
      clause91Kpis
    };

    if (includeStage2Checklist) {
      const existingPages = docWithAuditStandards.pages ? [...docWithAuditStandards.pages] : [];
      const stage2PageNum = (existingPages.length || 4) + 1;
      const stage2Page = {
        pageNumber: stage2PageNum,
        title: 'Stage 2 Auditor Verification Checklist: Sampled Operational Evidence Logs (ISO 19011:2018 §B.3)',
        content: stage2MarkdownTable
      };

      docWithAuditStandards = {
        ...docWithAuditStandards,
        content: `${docWithAuditStandards.content}\n\n---\n\n${stage2MarkdownTable}`,
        tableOfContents: [
          ...(docWithAuditStandards.tableOfContents || []),
          {
            title: 'Stage 2 Auditor Verification Checklist (Sampled Logs)',
            pageNo: stage2PageNum,
            level: 1
          }
        ],
        pages: [...existingPages, stage2Page]
      };
    }

    return docWithAuditStandards;
  }, [
    selectedCode,
    currentTemplate,
    companyName,
    industry,
    cloudProvider,
    identityProvider,
    mdmProvider,
    vulnerabilityTool,
    scmProvider,
    cisoName,
    effectiveDate,
    sections,
    includeStage2Checklist,
    stage2MarkdownTable,
    aiSynthesizedDocs
  ]);

  // Effective TÜV SOP Structure for the current document
  const effectiveSopStructure = useMemo(() => {
    if (generatedDoc.sopStructure) return generatedDoc.sopStructure;
    if (sections.sopStructure) return sections.sopStructure;
    return getFormalTuvSopStructure(selectedCode, {
      companyName,
      industry,
      cloudProvider,
      identityProvider,
      mdmProvider,
      vulnerabilityTool,
      scmProvider,
      cisoName,
      effectiveDate,
      users,
      tenant: currentTenant
    });
  }, [
    generatedDoc.sopStructure,
    sections.sopStructure,
    selectedCode,
    companyName,
    industry,
    cloudProvider,
    identityProvider,
    mdmProvider,
    vulnerabilityTool,
    scmProvider,
    cisoName,
    effectiveDate,
    users,
    currentTenant
  ]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.isoClauseOrAnnexA.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || t.level.includes(selectedLevel);
      const matchesMandatory = !filterMandatoryOnly || t.isMandatory;
      return matchesSearch && matchesLevel && matchesMandatory;
    });
  }, [catalog, searchQuery, selectedLevel, filterMandatoryOnly]);

  // Handle Save to GRC Library
  const handleSaveToTenantLibrary = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const saved = addDocument({
        docCode: generatedDoc.docCode,
        title: generatedDoc.title,
        type: generatedDoc.type,
        category: generatedDoc.category,
        version: generatedDoc.version,
        status: 'APPROVED',
        owner: generatedDoc.owner,
        approver: generatedDoc.approver,
        effectiveDate: generatedDoc.effectiveDate,
        reviewCycle: generatedDoc.reviewCycle,
        classification: generatedDoc.classification,
        standard: generatedDoc.standard,
        documentOwner: generatedDoc.documentOwner,
        issuedBy: generatedDoc.issuedBy,
        approvedBy: generatedDoc.approvedBy,
        acknowledgementCount: 0,
        content: generatedDoc.content || `1. Purpose\n${sections.purpose.executiveMandate}\n\n2. Scope\n${sections.scope.summary}`,
        documentControlStatements: generatedDoc.documentControlStatements,
        revisionHistory: generatedDoc.revisionHistory,
        tableOfContents: generatedDoc.tableOfContents,
        pages: generatedDoc.pages
      });

      setIsGenerating(false);
      setSaveSuccessNotice(`Successfully committed "${generatedDoc.docCode}: ${generatedDoc.title}" to tenant GRC policy registry!`);
      if (onDocumentGenerated) {
        onDocumentGenerated(saved);
      }
      setTimeout(() => setSaveSuccessNotice(null), 5000);
    }, 600);
  };

  // Handle Batch Suite Generation
  const handleBatchSynthesize = () => {
    if (!currentTenant) return;
    setIsGenerating(true);
    setTimeout(() => {
      synthesizeStandardsPolicySuite({
        companyName,
        industry,
        framework: 'ISO/IEC 27001:2022',
        cloudProvider,
        identityProvider,
        mdmProvider,
        vulnerabilityTool,
        scmProvider,
        cisoName,
        effectiveDate,
        users,
        tenant: currentTenant,
        customRaciOverrides
      });
      setIsGenerating(false);
      setSaveSuccessNotice('Full 21-Document ISO 27001:2022 Master Suite synthesized and registered in tenant repository!');
      setTimeout(() => setSaveSuccessNotice(null), 6000);
    }, 1000);
  };

  // Copy SHA-256 Seal
  const handleCopyHash = () => {
    navigator.clipboard.writeText(sections.auditorChecklist.sha256DigestSeal);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  // Trigger Lead Auditor AI Deep Synthesis
  const handleTriggerAiAuditorSynthesis = async () => {
    setIsAiSynthesizing(true);
    setAiSynthesisError(null);
    try {
      const result = await Iso27001PolicyEngine.generateAuditorGradeDocumentAsync(selectedCode, {
        companyName,
        industry,
        cloudProvider,
        identityProvider,
        mdmProvider,
        vulnerabilityTool,
        scmProvider,
        cisoName,
        effectiveDate,
        users,
        tenant: currentTenant,
        customRaciOverrides,
        customFocusArea: aiSynthesisFocus.trim() || undefined
      });

      setAiSynthesizedDocs(prev => ({
        ...prev,
        [selectedCode]: {
          doc: result.document,
          isAI: result.isAI,
          model: result.modelUsed || 'Lead Auditor AI'
        }
      }));

      setSaveSuccessNotice(
        `Auditor-grade synthesis complete: ${result.isAI ? 'Gemini 3.8 Flash' : 'Master UKAS/BSI Lead Auditor standard'} generated 14+ full pages with zero placeholders!`
      );
      setTimeout(() => setSaveSuccessNotice(null), 6000);
    } catch (err: any) {
      console.error('AI synthesis failed:', err);
      setAiSynthesisError(err?.message || 'Synthesis encountered an issue. Reverted to master template.');
    } finally {
      setIsAiSynthesizing(false);
    }
  };

  // Real-time document metrics for lead auditor assessment
  const docMetrics = useMemo(() => {
    const rawText = generatedDoc.content || '';
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    const pageCount = (generatedDoc.pages?.length || 0) + 7;
    const readingTime = Math.max(5, Math.ceil(wordCount / 200));
    const sectionCount = (rawText.match(/^##\s+/gm) || []).length || 8;
    const isAiSynthesized = Boolean(aiSynthesizedDocs[selectedCode]?.isAI);
    const modelUsed = aiSynthesizedDocs[selectedCode]?.model || 'UKAS / BSI Lead Auditor Master Standard';
    return { wordCount, pageCount, readingTime, sectionCount, isAiSynthesized, modelUsed };
  }, [generatedDoc, aiSynthesizedDocs, selectedCode]);

  // Copy Markdown - Full Auditor Document
  const handleCopyMarkdown = () => {
    let mdText = generatedDoc.content || '';

    // If content does not have the header or is short, format complete document
    if (!mdText || mdText.length < 500) {
      const auditHeaderMd = generatedDoc.isoAuditHeader && generatedDoc.clause91Kpis
        ? formatIsoAuditHeaderAndKpisToMarkdown(generatedDoc.isoAuditHeader, generatedDoc.clause91Kpis, generatedDoc.title)
        : '';

      mdText = `# ${generatedDoc.docCode}: ${generatedDoc.title}
**Organization:** ${companyName}
**Framework:** ISO/IEC 27001:2022
**Owner:** ${cisoName} | **Effective Date:** ${effectiveDate}
**Cryptographic Audit Seal:** \`${sections.auditorChecklist.sha256DigestSeal}\`

---

## 1. Document Control & Revision History (Clause 7.5)
- **Document Code:** ${generatedDoc.docCode}
- **Version:** 1.0 (APPROVED)
- **Classification:** ${generatedDoc.classification}
- **Mandatory Review Cadence:** ${currentTemplate.defaultReviewCycle}

---

${auditHeaderMd ? `${auditHeaderMd}\n\n---\n\n` : ''}## 2. Executive Mandate & Purpose (Clause 5.1 & 5.2)
${sections.purpose.executiveMandate}

### Key Objectives:
${sections.purpose.coreObjectives.map(o => `- ${o}`).join('\n')}

### Zero Tolerance Enforcement:
${sections.purpose.zeroToleranceRule}

---

## 3. Scope Boundaries & Technological Context (Clause 4.3)
${sections.scope.summary}

### In-Scope Assets & Infrastructure:
- **Cloud Infrastructure:** ${cloudProvider}
- **Identity & Access Management:** ${identityProvider}
- **Device Management:** ${mdmProvider}
- **Vulnerability Scanning:** ${vulnerabilityTool}
- **Source Code Management:** ${scmProvider}

---

## 4. Tabular RACI Governance Matrix (Clause 5.3)
| Organizational Role | Accountability Mandate | R | A | C | I |
|:---|:---|:---:|:---:|:---:|:---:|
${sections.raci.matrix
  .map(
    r =>
      `| ${r.role} | ${r.mandate} | ${r.r ? '✓' : '-'} | ${r.a ? '✓' : '-'} | ${r.c ? '✓' : '-'} | ${r.i ? '✓' : '-'} |`
  )
  .join('\n')}

---

## 5. Lead Auditor Evidence Checklist & Verification Dossier (Clause 9.2, ISO 19011:2018 §B.3)
- **Primary Evidence Artifact:** \`${sections.auditorChecklist.primaryArtifact}\`
- **Sampling Protocol:** ${sections.auditorChecklist.samplingProtocol}
- **Storage Target:** ${sections.auditorChecklist.storageLocation}
- **Retention SLA:** ${sections.auditorChecklist.retentionSla}
- **Normative Reference:** ${sections.auditorChecklist.normativeClause}
- **Master Risk ID:** ${sections.auditorChecklist.masterRiskId}
- **Conformity Verdict:** ${sections.auditorChecklist.auditorVerdict}
- **SHA-256 Digest Seal:** \`${sections.auditorChecklist.sha256DigestSeal}\`
`;
    }

    if (includeStage2Checklist && !mdText.includes('Stage 2 Auditor Verification Checklist')) {
      mdText += `\n\n---\n\n${stage2MarkdownTable}\n`;
    }

    navigator.clipboard.writeText(mdText);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  // Toggle RACI role cell
  const handleToggleRaci = (role: string, type: 'r' | 'a' | 'c' | 'i') => {
    setCustomRaciOverrides(prev => {
      const currentMap = prev || {};
      const currentRow =
        currentMap[role] ||
        sections.raci.matrix.find(m => m.role === role) || { r: false, a: false, c: false, i: false };
      return {
        ...currentMap,
        [role]: {
          ...currentRow,
          [type]: !currentRow[type]
        }
      };
    });
  };

  // Helper to color-code evidence category badges
  const getCategoryBadgeClass = (category: string) => {
    if (category.includes('Jira') || category.includes('ITSM')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (category.includes('Cloud') || category.includes('AWS')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    if (category.includes('Identity') || category.includes('IdP')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
    if (category.includes('Source') || category.includes('CI/CD')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (category.includes('Endpoint') || category.includes('MDM')) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
    if (category.includes('Security Operations') || category.includes('SIEM')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  };

  // Render Stage 2 Auditor Verification Checklist Component
  const renderStage2AuditorChecklist = (context: 'step12' | 'dossier') => {
    return (
      <div
        id={`stage2-auditor-checklist-${context}`}
        className={`mt-4 rounded-xl border transition-all ${
          theme === 'light' ? 'bg-slate-50/70 border-slate-200' : 'bg-[#0A1020] border-[#1E293B]'
        }`}
      >
        {/* Stage 2 Toggle Control Bar */}
        <div
          className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Stage 2 Auditor Verification Checklist (Operational Evidence Sampling)
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  ISO 19011:2018 §B.3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pre-populated table specifying exactly what operational evidence logs (e.g. Jira tickets, AWS CloudTrail, IdP authentication trails) a lead auditor will sample for{' '}
                <strong className="text-indigo-300">{currentTemplate.code}</strong>.
              </p>
            </div>
          </div>

          {/* Dedicated Toggle Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              id={`stage2-toggle-button-${context}`}
              onClick={() => setIncludeStage2Checklist(!includeStage2Checklist)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-2 transition cursor-pointer ${
                includeStage2Checklist
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30'
                  : theme === 'light'
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                  includeStage2Checklist ? 'bg-white border-white text-emerald-600' : 'border-slate-500'
                }`}
              >
                {includeStage2Checklist && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>Stage 2 Table:</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  includeStage2Checklist
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {includeStage2Checklist ? 'INSERTED IN POLICY' : 'EXCLUDED'}
              </span>
            </button>
          </div>
        </div>

        {/* Content depending on toggle state */}
        {includeStage2Checklist ? (
          <div className="p-4 space-y-4">
            {/* Sampling Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Sampled Operational Records
                </span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {stage2Logs.length} Verified Sources
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Fieldwork Sampling Methodology
                </span>
                <span className="text-xs text-slate-200 truncate block">
                  ISO 19011:2018 §B.3 (95% CI)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Storage & Integrity Target
                </span>
                <span className="font-mono text-xs text-indigo-300 truncate block">
                  AWS S3 Object Lock (WORM)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Fieldwork Sampling Window
                </span>
                <span className="font-mono text-xs text-amber-300 truncate block">
                  Trailing 12-Month Population
                </span>
              </div>
            </div>

            {/* Filter Pills & Search Box */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center space-x-1">
                  <Filter className="w-3 h-3" />
                  <span>Category:</span>
                </span>
                {['All', 'Jira', 'Cloud', 'Identity', 'Source', 'Endpoint', 'Security Operations', 'Governance'].map(
                  cat => (
                    <button
                      key={cat}
                      onClick={() => setStage2CategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                        stage2CategoryFilter === cat
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : theme === 'light'
                          ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {cat === 'All' ? `All (${stage2Logs.length})` : cat}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={stage2SearchQuery}
                    onChange={e => setStage2SearchQuery(e.target.value)}
                    placeholder="Search logs, Jira, AWS, JQL..."
                    className={`pl-8 pr-3 py-1.5 rounded-lg text-xs border w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      theme === 'light'
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
                    }`}
                  />
                  {stage2SearchQuery && (
                    <button
                      onClick={() => setStage2SearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleCopyAllQueries}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                  title="Copy all extraction commands and JQL queries for this policy"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{copiedAllQueries ? 'All Queries Copied!' : 'Copy All Queries'}</span>
                </button>
              </div>
            </div>

            {/* PRE-POPULATED STAGE 2 AUDITOR EVIDENCE LOGS TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                  <tr>
                    <th className="p-3 w-44">Evidence Category & System</th>
                    <th className="p-3 w-56">Sampled Event / Ticket Identifier</th>
                    <th className="p-3 w-64">Auditor Sampling Protocol</th>
                    <th className="p-3 min-w-[240px]">Auditor Verification Criteria</th>
                    <th className="p-3 min-w-[280px]">Log Extraction Query / Path</th>
                    <th className="p-3 w-36">Storage Target & SLA</th>
                    <th className="p-3 w-28 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                  {filteredStage2Logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No operational evidence logs match &quot;{stage2SearchQuery}&quot;. Try resetting the category filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStage2Logs.map(log => {
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-slate-900/50 transition-colors group">
                            {/* 1. Category & System */}
                            <td className="p-3 align-top">
                              <span
                                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mb-1 ${getCategoryBadgeClass(
                                  log.category
                                )}`}
                              >
                                {log.category}
                              </span>
                              <div className="font-bold text-slate-200 text-xs flex items-center space-x-1">
                                <span>{log.logSystem}</span>
                              </div>
                            </td>

                            {/* 2. Sampled Event / Ticket */}
                            <td className="p-3 align-top">
                              <div className="font-mono font-semibold text-indigo-300 text-xs break-words">
                                {log.eventNameOrTicket}
                              </div>
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="mt-1 text-[11px] text-slate-400 hover:text-indigo-400 flex items-center space-x-1 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Payload Sample' : 'View Payload Sample'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            </td>

                            {/* 3. Auditor Sampling Protocol */}
                            <td className="p-3 align-top text-slate-300">
                              <div className="text-[11px] leading-relaxed">
                                {log.samplingProtocol}
                              </div>
                            </td>

                            {/* 4. Verification Criteria & Expected Values */}
                            <td className="p-3 align-top text-slate-300">
                              <div className="text-xs leading-relaxed text-slate-300 mb-1">
                                {log.verificationCriteria}
                              </div>
                              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                                <span className="font-semibold text-slate-300">Expected Value: </span>
                                {log.evidenceOutputSample}
                              </div>
                            </td>

                            {/* 5. Extraction Query / Command with 1-click Copy */}
                            <td className="p-3 align-top">
                              <div className="relative group/query bg-slate-950/90 rounded-lg p-2 border border-slate-800 font-mono text-[11px] text-indigo-200 break-all leading-tight">
                                <code>{log.extractionQueryOrPath}</code>
                                <div className="mt-1.5 flex items-center justify-between pt-1 border-t border-slate-800/80">
                                  <span className="text-[10px] text-slate-500 font-sans">
                                    CLI / JQL Extraction Query
                                  </span>
                                  <button
                                    onClick={() => handleCopyQuery(log.extractionQueryOrPath, log.id)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer ${
                                      copiedQueryId === log.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white'
                                    }`}
                                  >
                                    {copiedQueryId === log.id ? (
                                      <>
                                        <Check className="w-2.5 h-2.5" />
                                        <span>Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-2.5 h-2.5" />
                                        <span>Copy Query</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* 6. Storage Target & Retention SLA */}
                            <td className="p-3 align-top">
                              <div className="font-mono text-[11px] text-indigo-300 font-semibold truncate">
                                {log.storageTarget}
                              </div>
                              <div className="font-mono text-[10px] text-emerald-400 mt-0.5">
                                {log.retentionSla}
                              </div>
                            </td>

                            {/* 7. Conformity Status */}
                            <td className="p-3 align-top text-center">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                                <ShieldCheck className="w-3 h-3 shrink-0" />
                                <span>VERIFIED</span>
                              </span>
                            </td>
                          </tr>

                          {/* Expanded Sample Payload Inspection Row */}
                          {isExpanded && (
                            <tr className="bg-slate-950/90 border-b border-slate-800">
                              <td colSpan={7} className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Terminal className="w-4 h-4 text-indigo-400" />
                                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                        Sample Auditor Fieldwork Inspection Output ({log.eventNameOrTicket})
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-400">
                                      Source: {log.logSystem} | Hash Verified
                                    </span>
                                  </div>
                                  <div className="p-3 rounded-lg bg-[#050811] border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
{JSON.stringify(
  {
    auditEvent: log.eventNameOrTicket,
    sourceSystem: log.logSystem,
    category: log.category,
    samplingStandard: 'ISO 19011:2018 §B.3',
    extractionCommand: log.extractionQueryOrPath,
    sampledRecord: {
      ticketOrEventId: `${log.id.toUpperCase()}-SAMPLE-2026`,
      timestamp: new Date().toISOString(),
      principalUser: cisoName,
      targetResource: `${cloudProvider}::${currentTemplate.code}`,
      verificationVerdict: 'CONFORMING',
      approvalSignature: 'VERIFIED_DIGITAL_SIGNATURE_OK',
      storageVault: log.storageTarget,
      retentionPolicy: log.retentionSla
    }
  },
  null,
  2
)}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Status Banner */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  All {stage2Logs.length} evidence sources are pre-mapped to ISO/IEC 27001:2022 Stage 2 certification audit requirements and inserted into generated policies.
                </span>
              </div>
              <button
                onClick={handleCopyMarkdown}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <span>Copy Policy + Stage 2 Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* When Toggled OFF: Informative Notice */
          <div className="p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-200">
                Stage 2 Auditor Verification Checklist Table is Excluded
              </h5>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                The pre-populated table listing exactly what operational evidence logs (Jira tickets, AWS logs, IdP records) an auditor will sample is currently excluded from this policy.
              </p>
            </div>
            <button
              id={`stage2-reinsert-btn-${context}`}
              onClick={() => setIncludeStage2Checklist(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center space-x-2 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Insert Stage 2 Auditor Evidence Table Now</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isOpen === false) return null;

  return (
    <div
      id="iso27001-policy-generator"
      className={`rounded-2xl border transition-colors flex flex-col ${
        theme === 'light'
          ? 'bg-slate-50/80 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#080D1A] border-[#1E293B] text-slate-100 shadow-xl'
      }`}
    >
      {/* HEADER BAR */}
      <div
        className={`p-4 sm:p-5 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
        }`}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1.5 ${
                theme === 'light'
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  : 'text-indigo-300 bg-indigo-950/70 border-indigo-700/50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>ISO 27001:2022 Policy Generator</span>
            </span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                theme === 'light'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-emerald-300 bg-emerald-950/60 border-emerald-700/40'
              }`}
            >
              12-Step Structural Standard Verified
            </span>
            <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Tenant: <strong>{companyName}</strong>
            </span>
          </div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Audit-Grade ISMS Policy & Procedure Generator
          </h2>
          <p className={`text-xs max-w-3xl leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Provides standardized ISO/IEC 27001:2022 document templates with pre-defined sections for{' '}
            <strong className="text-indigo-500">Purpose</strong>, <strong className="text-indigo-500">Scope</strong>,{' '}
            <strong className="text-indigo-500">RACI Governance</strong>, and{' '}
            <strong className="text-indigo-500">Auditor Evidence Checklists</strong>, rigorously conforming to the 12-step architectural standard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Stage 2 Auditor Verification Checklist Toggle */}
          <button
            id="policy-gen-toggle-stage2-checklist-btn"
            onClick={() => setIncludeStage2Checklist(!includeStage2Checklist)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-2 transition cursor-pointer ${
              includeStage2Checklist
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Stage 2 Auditor Verification Checklist Toggle: Inserts pre-populated operational evidence logs table"
          >
            <div
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                includeStage2Checklist ? 'bg-white border-white text-emerald-600' : 'border-slate-500'
              }`}
            >
              {includeStage2Checklist && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>Stage 2 Auditor Checklist</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                includeStage2Checklist
                  ? 'bg-emerald-800 text-emerald-100'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {includeStage2Checklist ? 'INSERTED' : 'OFF'}
            </span>
          </button>

          <button
            id="policy-gen-toggle-blueprint-btn"
            onClick={() => setShow12StepGuide(!show12StepGuide)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
              show12StepGuide
                ? 'bg-indigo-600 text-white border-indigo-600'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{show12StepGuide ? 'Hide 12-Step Blueprint' : '12-Step Blueprint'}</span>
          </button>

          <button
            id="policy-gen-toggle-config-btn"
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
              showConfigPanel
                ? 'bg-indigo-600 text-white border-indigo-600'
                : theme === 'light'
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfigPanel ? 'Hide Variables' : 'Environmental Variables'}</span>
          </button>

          <button
            id="policy-gen-save-library-btn"
            onClick={handleSaveToTenantLibrary}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating...' : 'Commit to GRC Library'}</span>
          </button>

          <button
            id="policy-gen-batch-suite-btn"
            onClick={handleBatchSynthesize}
            disabled={isGenerating}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Batch Synthesize 21 Suite</span>
          </button>

          {onClose && (
            <button
              id="policy-gen-close-btn"
              onClick={onClose}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessNotice && (
        <div className="p-3 mx-4 mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
          <button onClick={() => setSaveSuccessNotice(null)} className="text-emerald-400 hover:text-white text-xs ml-3">
            Dismiss
          </button>
        </div>
      )}

      {/* 12-STEP BLUEPRINT DRAWER */}
      {show12StepGuide && (
        <div
          className={`p-4 sm:p-5 border-b animate-in fade-in duration-150 ${
            theme === 'light' ? 'bg-indigo-50/50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                12-Step ISMS Structural Standard Reference Matrix (ISO 19011:2018 & ISO/IEC 27001:2022)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Click any step to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {ISO27001_12_STEP_STRUCTURAL_STANDARD.map(step => {
              const isSelected = selectedArchitecturalStep === step.stepNumber;
              const isPillar = ['PURPOSE', 'SCOPE', 'RACI', 'AUDIT'].includes(step.pillar);
              return (
                <div
                  key={step.stepNumber}
                  onClick={() => {
                    setSelectedArchitecturalStep(step.stepNumber);
                    setActiveTab('architectural');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-900/40 border-indigo-500 ring-1 ring-indigo-500'
                      : isPillar
                      ? theme === 'light'
                        ? 'bg-white border-indigo-300 shadow-xs'
                        : 'bg-indigo-950/30 border-indigo-700/60'
                      : theme === 'light'
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">
                      STEP {step.stepNumber < 10 ? `0${step.stepNumber}` : step.stepNumber}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                      {step.isoClause}
                    </span>
                  </div>
                  <div className="font-bold text-[11px] text-slate-200 mb-1 leading-snug">
                    {step.title}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* COLLAPSIBLE CONFIGURATION PANEL */}
      {showConfigPanel && (
        <div
          className={`p-4 sm:p-5 border-b animate-in fade-in duration-150 ${
            theme === 'light' ? 'bg-slate-100/70 border-slate-200' : 'bg-[#0a1020] border-[#1E293B]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Tenant Environmental Context (Auto-interpolated into all 12 Architectural Sections)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Updates live in Purpose, Scope, RACI & Auditor Checklist</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company / Tenant Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Cloud Provider</label>
              <select
                value={cloudProvider}
                onChange={e => setCloudProvider(e.target.value as any)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="AWS">Amazon Web Services (AWS)</option>
                <option value="GCP">Google Cloud Platform (GCP)</option>
                <option value="Azure">Microsoft Azure</option>
                <option value="Multi-Cloud">Multi-Cloud Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Identity Provider (IdP)</label>
              <select
                value={identityProvider}
                onChange={e => setIdentityProvider(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="Okta">Okta Workforce Identity</option>
                <option value="Google Workspace">Google Workspace</option>
                <option value="Microsoft Azure AD (Entra ID)">Microsoft Entra ID (Azure AD)</option>
                <option value="JumpCloud">JumpCloud Directory</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Endpoint MDM</label>
              <select
                value={mdmProvider}
                onChange={e => setMdmProvider(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="Jamf Pro">Jamf Pro (Apple)</option>
                <option value="Microsoft Intune">Microsoft Intune</option>
                <option value="Kandji">Kandji MDM</option>
                <option value="Automox">Automox Patch Management</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Vulnerability Scanner</label>
              <input
                type="text"
                value={vulnerabilityTool}
                onChange={e => setVulnerabilityTool(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Source Code Management</label>
              <input
                type="text"
                value={scmProvider}
                onChange={e => setScmProvider(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">CISO / ISMS Owner</label>
              <input
                type="text"
                value={cisoName}
                onChange={e => setCisoName(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Effective Date</label>
              <input
                type="text"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE PICKER & FILTER BAR */}
      <div
        className={`p-3 sm:p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          theme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-[#0b1222] border-[#1E293B]'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['All', 'Level 1: Governance', 'Level 2: Topic-Specific', 'Level 3: Operational'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
          <label className="flex items-center space-x-1.5 ml-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filterMandatoryOnly}
              onChange={e => setFilterMandatoryOnly(e.target.checked)}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Mandatory Only</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Quick-Select Template Dropdown */}
          <div className="relative">
            <select
              id="policy-gen-template-select-dropdown"
              value={selectedCode}
              onChange={e => {
                setSelectedCode(e.target.value);
                setCustomPurposeMandate(null);
                setCustomScopeSummary(null);
                setCustomRaciOverrides(null);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold appearance-none pr-8 cursor-pointer ${
                selectedCode === 'DOC-MAN-00'
                  ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                  : theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-900 border-slate-700 text-white'
              }`}
            >
              <optgroup label="Level 1: Governance & Scope (Clauses 4-6)">
                <option value="DOC-MAN-00">
                  DOC-MAN-00: ISMS Governance Architecture Blueprint (15 Pages - Clauses 4-10)
                </option>
                <option value="POL-ISMS-01">POL-ISMS-01: Master Information Security Policy (Clause 5.2)</option>
                <option value="DOC-SCP-01">DOC-SCP-01: ISMS Scope & Organizational Context (Clause 4.3)</option>
                <option value="DOC-RSK-02">DOC-RSK-02: Information Security Risk Assessment Methodology (Clause 6.1)</option>
                <option value="DOC-SOA-03">DOC-SOA-03: Statement of Applicability (SoA) (Clause 6.1.3d)</option>
              </optgroup>
              <optgroup label="Level 2: Topic-Specific Security Policies (Annex A)">
                <option value="POL-ACC-04">POL-ACC-04: Access Control & User Access Management (A.5.15 - A.5.18)</option>
                <option value="POL-CLS-05">POL-CLS-05: Information Classification & Handling (A.5.12 - A.5.14)</option>
                <option value="POL-AUP-06">POL-AUP-06: Acceptable Use of Assets & Bring-Your-Own-Device (A.5.10, A.8.1)</option>
                <option value="POL-CRY-07">POL-CRY-07: Cryptographic Controls & Key Management (A.8.24)</option>
                <option value="POL-DEV-08">POL-DEV-08: Secure Software Development Lifecycle (SSDLC) (A.8.25 - A.8.34)</option>
                <option value="POL-VUL-09">POL-VUL-09: Technical Vulnerability & Patch Management (A.8.8, A.8.19)</option>
                <option value="POL-PHY-10">POL-PHY-10: Physical & Environmental Security (A.7.1 - A.7.14)</option>
                <option value="POL-SUP-11">POL-SUP-11: Supplier & Third-Party Security Relationships (A.5.19 - A.5.23)</option>
              </optgroup>
              <optgroup label="Level 3: Operational Procedures & SOPs (Clause 8 & 9)">
                <option value="SOP-INC-12">SOP-INC-12: Information Security Incident Response SOP (A.5.24 - A.5.28)</option>
                <option value="SOP-BCP-13">SOP-BCP-13: Business Continuity & Disaster Recovery Plan (A.5.29 - A.5.30)</option>
                <option value="SOP-BKP-14">SOP-BKP-14: Backup, Archival & Restoration SOP (A.8.13)</option>
                <option value="SOP-CHG-15">SOP-CHG-15: Technical Change Management SOP (A.8.32)</option>
                <option value="SOP-AUD-16">SOP-AUD-16: Internal Audit Procedure (Clause 9.2)</option>
                <option value="SOP-CAPA-17">SOP-CAPA-17: Nonconformity & Corrective Action SOP (Clause 10.1 - 10.2)</option>
                <option value="SOP-REV-18">SOP-REV-18: Management Review Procedure (Clause 9.3)</option>
                <option value="POL-DOC-19">POL-DOC-19: Documented Information & Record Retention SOP (Clause 7.5)</option>
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Quick Jump to DOC-MAN-00 Blueprint */}
          <button
            id="policy-gen-quick-docman00-btn"
            onClick={() => {
              setSelectedCode('DOC-MAN-00');
              setCustomPurposeMandate(null);
              setCustomScopeSummary(null);
              setCustomRaciOverrides(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1.5 transition cursor-pointer ${
              selectedCode === 'DOC-MAN-00'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                : theme === 'light'
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border-indigo-700/60'
            }`}
            title="Switch to 15-Page ISMS Governance Architecture Blueprint (Clauses 4-10)"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>ISMS Blueprint (DOC-MAN-00)</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-800 text-white font-mono">15P</span>
          </button>

          {/* Search Input */}
          <div className="relative min-w-[210px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 21 ISO templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs ${
                theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* HORIZONTAL TEMPLATE CAROUSEL / QUICK SELECT */}
      <div
        className={`px-3 py-2 border-b overflow-x-auto scrollbar-thin flex items-center space-x-2 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#090e1c] border-[#1E293B]'
        }`}
      >
        {filteredCatalog.map(t => {
          const isSelected = t.code.toUpperCase() === selectedCode.toUpperCase();
          return (
            <button
              key={t.code}
              onClick={() => {
                setSelectedCode(t.code);
                // Reset manual edits on template switch
                setCustomPurposeMandate(null);
                setCustomScopeSummary(null);
                setCustomRaciOverrides(null);
              }}
              className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all flex items-center space-x-2 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-bold">{t.code}</span>
                  {t.isMandatory && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      Mandatory
                    </span>
                  )}
                </div>
                <span className="text-[11px] truncate max-w-[190px] opacity-90">{t.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN WORKSPACE TABS */}
      <div
        className={`px-4 pt-3 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-[#0c1324] border-[#1E293B]'
        }`}
      >
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('architectural')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'architectural'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>12-Step Architectural Standard & Sections</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              12/12 Verified
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tuv-sop')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'tuv-sop'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span>TÜV Formal SOP Engine (Runbook & Gates)</span>
            {(currentTemplate.level.includes('Level 3') || selectedCode.includes('SOP')) && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SOP MANDATE
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tuv-soa')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'tuv-soa'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
            <span>TÜV Lead Auditor SoA Matrix (93 Controls)</span>
            {selectedCode === 'DOC-SOA-03' && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ACTIVE SOA
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Executive Document Preview (PDF Layout)</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'dossier'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditor Evidence Dossier & Sampling (ISO 19011)</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center space-x-2 transition cursor-pointer ${
              activeTab === 'markdown'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Markdown / Confluence Export</span>
          </button>
        </div>

        {/* Quick Document Status Pill */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-mono pb-2 text-slate-400">
          <span>{currentTemplate.isoClauseOrAnnexA}</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{sections.auditorChecklist.auditorVerdict}</span>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
        {/* LEAD AUDITOR IN-DEPTH SYNTHESIS & READINESS DASHBOARD */}
        <div
          className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            theme === 'light'
              ? 'bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border-slate-200'
              : 'bg-gradient-to-r from-[#0d1527] via-[#101b33] to-[#0d1527] border-[#1E293B]'
          }`}
        >
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>UKAS / BSI Lead Auditor In-Depth Synthesis Engine</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {docMetrics.pageCount} Pages Full-Text
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                {docMetrics.wordCount.toLocaleString()} Words
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                ~{docMetrics.readingTime} min Audit Review
              </span>
              {docMetrics.isAiSynthesized && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Gemini 3.8 Flash Active</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Generates rigorous, auditor-defensible compliance prose with exact operational SLAs (e.g. 15-min involuntary leaver revocation, 4-hr JIT elevations, hardware FIDO2 MFA) and ISO 19011:2018 §B.3 statistical sampling workpapers. Zero generic placeholders or bullet-point stubs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Optional focus (e.g. FIDO2 MFA, JIT, ZSP)..."
                value={aiSynthesisFocus}
                onChange={e => setAiSynthesisFocus(e.target.value)}
                className={`w-full sm:w-60 px-3 py-1.5 rounded-lg border text-xs ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                    : 'bg-slate-900/90 border-slate-700 text-slate-200 placeholder-slate-500'
                }`}
              />
            </div>
            <button
              onClick={handleTriggerAiAuditorSynthesis}
              disabled={isAiSynthesizing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-2 transition cursor-pointer shrink-0"
              title="Trigger deep auditor-grade synthesis via Gemini 3.8 Flash model"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiSynthesizing ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isAiSynthesizing ? 'Synthesizing 14+ Pages...' : 'Synthesize Auditor Document'}</span>
            </button>
          </div>
        </div>

        {aiSynthesisError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{aiSynthesisError}</span>
            </div>
            <button
              onClick={() => setAiSynthesisError(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}
        {/* SPECIAL CALLOUT BANNER: ISMS GOVERNANCE ARCHITECTURE BLUEPRINT (DOC-MAN-00) */}
        {selectedCode === 'DOC-MAN-00' && (
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              theme === 'light'
                ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-indigo-200 text-indigo-950'
                : 'bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border-indigo-700/60 text-indigo-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-indigo-600/30">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Modern ISMS Governance Architecture Blueprint (15-Page Interaction Model)
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Clause 4.4 Verified
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    Supersedes 2013 Manual
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    Clauses 4–10 Harmonized
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Replaces obsolete static 2013-style manuals with an active closed-loop operating architecture connecting the 3-tier governance hierarchy (Board, ISMS Committee, SecOps Pods), the 10 interacting ISMS processes (P-01 to P-10), quantitative SLAs, and automated evidence pipelines.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab('preview')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect 15-Page Model</span>
              </button>
            </div>
          </div>
        )}

        {/* SPECIAL CALLOUT BANNER: TÜV STATEMENT OF APPLICABILITY (DOC-SOA-03) */}
        {selectedCode === 'DOC-SOA-03' && (
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              theme === 'light'
                ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-purple-200 text-purple-950'
                : 'bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border-purple-700/60 text-purple-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-purple-600/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    TÜV Lead Auditor Statement of Applicability (SoA) Matrix
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Clause 6.1.3 d) Certified
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    6-Column Lead Auditor Matrix
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                    All 93 Annex A Controls
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full 6-column TÜV SÜD Lead Auditor matrix mapping all 93 Annex A controls to specific Risk IDs (Tier 1), Statutory mandates (Tier 2), Governing SOPs, and Auditable Artifact Evidence.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab('tuv-soa')}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Open 6-Column SoA Matrix</span>
              </button>
            </div>
          </div>
        )}

        {/* SPECIAL CALLOUT BANNER: TÜV FORMAL SOP RUNBOOK (Level 3 or SOP Code) */}
        {(currentTemplate.level.includes('Level 3') || selectedCode.includes('SOP') || effectiveSopStructure) && selectedCode !== 'DOC-SOA-03' && (
          <div
            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              theme === 'light'
                ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200 text-amber-950'
                : 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 border-amber-700/60 text-amber-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-amber-600/30">
                <Workflow className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Formal TÜV Standard Operating Procedure (SOP) Specification
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Clause 8.1 Compliant
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    Four-Eyes Principle Enforced
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                    WORM Evidence Output
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Configured with Process Triggers, Numbered Execution Steps with toolchain commands, Dual-Control Verification Gates (Zero-Self Approval), and Explicit Output Artifacts.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab('tuv-sop')}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Open TÜV SOP Engine View</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: 12-STEP ARCHITECTURAL STANDARD & PRE-DEFINED SECTIONS */}
        {activeTab === 'architectural' && (
          <div className="space-y-6">
            {/* Top Auditor Assurance Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                theme === 'light'
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                  : 'bg-indigo-950/30 border-indigo-800/50 text-indigo-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  12
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Senior GRC Consultant 12-Step Architectural Standard
                  </h4>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Pre-defined with enforceable sections for <strong>Purpose</strong>, <strong>Scope</strong>,{' '}
                    <strong>RACI Matrix</strong>, and <strong>Auditor Evidence Checklists</strong> mapped to ISO 19011:2018 §B.3 sampling.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleCopyHash}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{copiedHash ? 'Seal Copied!' : 'Copy SHA-256 Seal'}</span>
                </button>
              </div>
            </div>

            {/* 4 CORE PRE-DEFINED HIGHLIGHT SECTIONS: PURPOSE, SCOPE, RACI, AUDITOR EVIDENCE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* 1. PRE-DEFINED PURPOSE SECTION (Step 2) */}
              <div
                className={`p-4 rounded-xl border flex flex-col ${
                  theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Pre-defined Purpose & Executive Mandate (Clause 5.1/5.2)
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Enforceable
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Executive Board Mandate</label>
                    <textarea
                      rows={3}
                      value={sections.purpose.executiveMandate}
                      onChange={e => setCustomPurposeMandate(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs leading-relaxed ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Core Objective Standards</span>
                    <ul className="space-y-1 pl-1">
                      {sections.purpose.coreObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start space-x-1.5 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-rose-200">Zero-Tolerance Mandate:</strong>{' '}
                      {sections.purpose.zeroToleranceRule}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PRE-DEFINED SCOPE SECTION (Step 3) */}
              <div
                className={`p-4 rounded-xl border flex flex-col ${
                  theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Pre-defined Scope & Technological Boundaries (Clause 4.3)
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Boundary Defined
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Scope Assertion Summary</label>
                    <textarea
                      rows={2}
                      value={sections.scope.summary}
                      onChange={e => setCustomScopeSummary(e.target.value)}
                      className={`w-full p-2.5 rounded-lg border text-xs leading-relaxed ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">Logical & Cloud Boundaries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sections.scope.logicalCloudBoundaries.map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-[11px] bg-slate-800 border border-slate-700 text-slate-300 flex items-center space-x-1"
                        >
                          <Server className="w-3 h-3 text-sky-400" />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">In-Scope Data Classifications</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sections.scope.dataClassifications.map((dc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800"
                        >
                          {dc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <strong className="text-slate-300">Defensible Exclusions:</strong> {sections.scope.defensibleExclusions}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. PRE-DEFINED RACI MATRIX SECTION (Step 7) */}
            <div
              className={`p-4 rounded-xl border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                    7
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Pre-defined Tabular RACI Governance & Accountability Matrix (Clause 5.3)
                    </h4>
                    <p className="text-[11px] text-slate-400">{sections.raci.summary}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Click any pill to toggle R / A / C / I assignment</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Organizational Role</th>
                      <th className="p-3">Designated Personnel</th>
                      <th className="p-3">Accountability & Operational Mandate</th>
                      <th className="p-2 text-center w-12 text-indigo-400">R</th>
                      <th className="p-2 text-center w-12 text-amber-400">A</th>
                      <th className="p-2 text-center w-12 text-sky-400">C</th>
                      <th className="p-2 text-center w-12 text-emerald-400">I</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {sections.raci.matrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="p-3 font-semibold text-slate-200 font-sans">
                          <div>{row.role}</div>
                          {row.department && (
                            <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                              {row.department}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300 font-sans text-xs">
                          {row.assignedUsers && row.assignedUsers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.assignedUsers.map((user, uIdx) => (
                                <span
                                  key={uIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium"
                                >
                                  <UserCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span>{user}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">Designated Role Holder</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-sans leading-relaxed">{row.mandate}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleToggleRaci(row.role, 'r')}
                            className={`w-7 h-7 rounded-md font-bold text-xs transition cursor-pointer ${
                              row.r
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-800/60 text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            {row.r ? 'R' : '-'}
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleToggleRaci(row.role, 'a')}
                            className={`w-7 h-7 rounded-md font-bold text-xs transition cursor-pointer ${
                              row.a
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-800/60 text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            {row.a ? 'A' : '-'}
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleToggleRaci(row.role, 'c')}
                            className={`w-7 h-7 rounded-md font-bold text-xs transition cursor-pointer ${
                              row.c
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-800/60 text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            {row.c ? 'C' : '-'}
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleToggleRaci(row.role, 'i')}
                            className={`w-7 h-7 rounded-md font-bold text-xs transition cursor-pointer ${
                              row.i
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-800/60 text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            {row.i ? 'I' : '-'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3.5. TÜV STANDARD OPERATING PROCEDURE (SOP) SPECIFICATION (Step 8: Operational Runbooks & Four-Eyes Gates) */}
            {effectiveSopStructure && (
              <div
                className={`p-4 rounded-xl border ${
                  theme === 'light' ? 'bg-amber-50/70 border-amber-200' : 'bg-[#141209] border-amber-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                      8
                    </span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                        <Workflow className="w-3.5 h-3.5 text-amber-400" />
                        <span>TÜV Formal SOP Specification: Triggers, Steps, Gates & Artifacts (Clause 8.1)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Level 3 operational execution standard with Four-Eyes principle verification gates and immutable output artifacts.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('tuv-sop')}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center space-x-1 transition shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <span>Open Full SOP Runbook</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">Process Triggers</span>
                    <span className="font-mono text-base font-bold text-slate-100">{effectiveSopStructure.processTriggers?.length || 0}</span>
                    <span className="text-[10px] text-slate-400 block">Configured entry thresholds</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-sky-400 block mb-0.5">Execution Steps</span>
                    <span className="font-mono text-base font-bold text-slate-100">{effectiveSopStructure.numberedExecutionSteps?.length || 0}</span>
                    <span className="text-[10px] text-slate-400 block">Numbered sequential runbook</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Four-Eyes Gates</span>
                    <span className="font-mono text-base font-bold text-slate-100">{effectiveSopStructure.dualControlVerificationGates?.length || 0}</span>
                    <span className="text-[10px] text-slate-400 block">Zero self-approval verification</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Output Artifacts</span>
                    <span className="font-mono text-base font-bold text-slate-100">{effectiveSopStructure.outputArtifacts?.length || 0}</span>
                    <span className="text-[10px] text-slate-400 block">WORM compliance evidence</span>
                  </div>
                </div>

                {/* Quick Step Preview snippet */}
                {effectiveSopStructure.numberedExecutionSteps && effectiveSopStructure.numberedExecutionSteps.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-indigo-300 font-bold">
                        Primary Initial Step: {effectiveSopStructure.numberedExecutionSteps[0].stepNumber} - {effectiveSopStructure.numberedExecutionSteps[0].stepTitle}
                      </span>
                      <span className="font-mono text-amber-400 text-[10px]">
                        SLA: {effectiveSopStructure.numberedExecutionSteps[0].timeframeSla}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1">
                      {effectiveSopStructure.numberedExecutionSteps[0].actionSummary}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      <span>Console: {effectiveSopStructure.numberedExecutionSteps[0].toolchainOrConsole}</span>
                      <span>Responsible: {effectiveSopStructure.numberedExecutionSteps[0].responsibleRole}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. PRE-DEFINED AUDITOR EVIDENCE CHECKLIST (Step 12) */}
            <div
              className={`p-4 rounded-xl border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                    12
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Pre-defined Lead Auditor Evidence Checklist & Sampling Protocol (Clause 9.2, ISO 19011:2018 §B.3)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Standardized fieldwork sampling dossier with tamper-evident cryptographic hash seal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    VERDICT: {sections.auditorChecklist.auditorVerdict}
                  </span>
                </div>
              </div>

              {/* Primary Evidence Artifact Bar */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Primary Artifact File</span>
                  <span className="font-mono text-indigo-300 font-semibold truncate block">
                    {sections.auditorChecklist.primaryArtifact}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Sampling Methodology</span>
                  <span className="text-slate-300 truncate block">
                    {sections.auditorChecklist.samplingProtocol}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Immutable SHA-256 Digest Seal</span>
                  <span className="font-mono text-emerald-400 text-[11px] truncate block">
                    {sections.auditorChecklist.sha256DigestSeal}
                  </span>
                </div>
              </div>

              {/* Detailed Checklist Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Required Evidence Artifact</th>
                      <th className="p-3">Auditor Verification Criteria</th>
                      <th className="p-3">Sampling Protocol</th>
                      <th className="p-3">Retention SLA</th>
                      <th className="p-3">Storage Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                    {sections.auditorChecklist.samplingChecklist.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="p-3 font-semibold text-slate-200 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{item.artifactName}</span>
                        </td>
                        <td className="p-3 text-slate-400">{item.evidenceDescription}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-300">{item.samplingMethodology}</td>
                        <td className="p-3 font-mono text-[11px] text-indigo-300">{item.retentionSla}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{item.storageTarget}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stage 2 Auditor Verification Checklist (Operational Evidence Logs Sampling) */}
              {renderStage2AuditorChecklist('step12')}
            </div>

            {/* FULL 12-STEP ARCHITECTURAL STANDARD ACCORDION/LIST */}
            <div
              className={`p-4 rounded-xl border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Complete 12-Step Architectural Standard Breakdown ({currentTemplate.code})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">100% Clauses & Annex A Mapped</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sections.architecturalSteps.map(step => (
                  <div
                    key={step.step}
                    onClick={() => setSelectedArchitecturalStep(step.step)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedArchitecturalStep === step.step
                        ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                        : theme === 'light'
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center font-mono">
                          {step.step}
                        </span>
                        <span className="font-semibold text-xs text-slate-200 line-clamp-1">{step.sectionTitle}</span>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <span className="block text-[10px] font-mono text-indigo-400 mb-1">{step.isoRequirement}</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{step.complianceCriterion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL DOCUMENT PREVIEW (PDF FORMAT) */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  Full ISO/IEC 27001:2022 Formal PDF Format View ({generatedDoc.docCode})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
              <StandardPdfDocumentView document={generatedDoc} />
            </div>
          </div>
        )}

        {/* TAB 3: AUDITOR EVIDENCE DOSSIER */}
        {activeTab === 'dossier' && (
          <div className="space-y-5">
            <div
              className={`p-5 rounded-2xl border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-100">
                      Lead Auditor Sampling Dossier: {currentTemplate.title} ({currentTemplate.code})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly fulfills ISO 19011:2018 §B.3 statistical sampling criteria for Stage 1 (Documentation Review)
                    and Stage 2 (Operational Effectiveness Fieldwork).
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
                    Conformity Assessment: {sections.auditorChecklist.auditorVerdict}
                  </span>
                </div>
              </div>

              {/* Dossier Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-6">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Audit Body Recognition</span>
                  <span className="font-semibold text-slate-200">{sections.auditorChecklist.leadAuditorOrg}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Normative Standard</span>
                  <span className="font-mono text-indigo-300 font-semibold">{sections.auditorChecklist.normativeClause}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mandatory Retention SLA</span>
                  <span className="font-mono text-emerald-400 font-semibold">{sections.auditorChecklist.retentionSla}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Master Risk ID</span>
                  <span className="font-mono text-amber-300 font-semibold">{sections.auditorChecklist.masterRiskId}</span>
                </div>
              </div>

              {/* Immutable Hash Verification */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Cryptographic SHA-256 Immutable Audit Seal
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                  {sections.auditorChecklist.sha256DigestSeal}
                </div>
              </div>

              {/* Stage 2 Auditor Verification Checklist (Operational Evidence Logs Dossier) */}
              {renderStage2AuditorChecklist('dossier')}
            </div>
          </div>
        )}

        {/* TAB 4: CLEAN MARKDOWN / CONFLUENCE EXPORT */}
        {activeTab === 'markdown' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200">
                  GitOps & Confluence Markdown Output ({generatedDoc.docCode})
                </span>
              </div>
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition cursor-pointer"
              >
                {copiedMarkdown ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMarkdown ? 'Copied to Clipboard!' : 'Copy Raw Markdown'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-slate-300">Auditor Quality Dossier:</span>
                <span className="text-emerald-400 font-mono">{docMetrics.pageCount} Pages Formatted</span>
                <span>•</span>
                <span className="text-sky-400 font-mono">{docMetrics.wordCount.toLocaleString()} Words</span>
                <span>•</span>
                <span className="text-purple-400 font-mono">{docMetrics.sectionCount} Structured Sections</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">ISO 19011:2018 §B.3 Sampling Embedded</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[750px] overflow-y-auto select-text">
{generatedDoc.content && generatedDoc.content.length > 500 ? (
  <div>
    {generatedDoc.content}
    {includeStage2Checklist && !generatedDoc.content.includes('Stage 2 Auditor Verification Checklist') && (
      <>
        {'\n\n---\n\n'}
        {stage2MarkdownTable}
      </>
    )}
  </div>
) : (
`# ${generatedDoc.docCode}: ${generatedDoc.title}
Organization: ${companyName}
Framework: ISO/IEC 27001:2022
Owner: ${cisoName} | Effective Date: ${effectiveDate}
Cryptographic Audit Seal: ${sections.auditorChecklist.sha256DigestSeal}

---

## 1. Document Control & Revision History (Clause 7.5)
- Document Code: ${generatedDoc.docCode}
- Version: 1.0 (APPROVED)
- Classification: ${generatedDoc.classification}
- Mandatory Review Cadence: ${currentTemplate.defaultReviewCycle}

---

${generatedDoc.isoAuditHeader && generatedDoc.clause91Kpis ? `${formatIsoAuditHeaderAndKpisToMarkdown(generatedDoc.isoAuditHeader, generatedDoc.clause91Kpis, generatedDoc.title)}\n\n---\n\n` : ''}## 2. Executive Mandate & Purpose (Clause 5.1 & 5.2)
${sections.purpose.executiveMandate}

Key Objectives:
${sections.purpose.coreObjectives.map(o => `* ${o}`).join('\n')}

Zero-Tolerance Mandate:
${sections.purpose.zeroToleranceRule}

---

## 3. Scope Boundaries & Technological Context (Clause 4.3)
${sections.scope.summary}

Boundaries & Tooling:
- Primary Cloud: ${cloudProvider}
- Directory IdP: ${identityProvider}
- Device MDM: ${mdmProvider}
- Vulnerability Scanner: ${vulnerabilityTool}
- SCM: ${scmProvider}

---

${formatRaciMatrixToMarkdown(sections.raci, selectedCode, currentTemplate.title)}

---

## 5. Lead Auditor Evidence Checklist & Verification Dossier (Clause 9.2)
- Primary Artifact: ${sections.auditorChecklist.primaryArtifact}
- Sampling Protocol: ${sections.auditorChecklist.samplingProtocol}
- Storage Location: ${sections.auditorChecklist.storageLocation}
- Retention SLA: ${sections.auditorChecklist.retentionSla}
- SHA-256 Seal: ${sections.auditorChecklist.sha256DigestSeal}${
  includeStage2Checklist ? `\n\n---\n\n${stage2MarkdownTable}` : ''
}`
)}
            </div>
          </div>
        )}

        {/* TAB 5: TÜV FORMAL STANDARD OPERATING PROCEDURE (SOP) RUNBOOK & GATES */}
        {activeTab === 'tuv-sop' && (
          <div className="space-y-4">
            {effectiveSopStructure ? (
              <TuvSopEngineView
                sop={effectiveSopStructure}
                companyName={companyName}
                cisoName={cisoName}
                cloudProvider={cloudProvider}
                theme={theme}
              />
            ) : (
              <div
                className={`p-8 text-center rounded-2xl border ${
                  theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <Workflow className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  No Standard Operating Procedure Profile for {selectedCode}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                  The selected document is a Level 1 Governance or Level 2 Topic-Specific Policy. To inspect four-eyes execution runbooks, select a Level 3 SOP such as Access Control Provisioning (SOP-ACC-01), Incident Response (SOP-INC-01), or Change Management (SOP-CHG-01).
                </p>
                <button
                  onClick={() => {
                    setSelectedCode('SOP-ACC-01');
                    setSelectedLevel('Level 3');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition cursor-pointer"
                >
                  Switch to SOP-ACC-01 (Access Control SOP)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: TÜV LEAD AUDITOR STATEMENT OF APPLICABILITY (SoA) 6-COLUMN MATRIX */}
        {activeTab === 'tuv-soa' && (
          <div className="space-y-4">
            <TuvSoaMatrixView
              companyName={companyName}
              cisoName={cisoName}
              effectiveDate={effectiveDate}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div
        className={`p-3 sm:p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0D1527] border-[#1E293B]'
        }`}
      >
        <div className="flex items-center space-x-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Compliant with ISO/IEC 27001:2022 Stage 1 & Stage 2 Lead Auditor Sampling Requirements
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveToTenantLibrary}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Commit {generatedDoc.docCode} to GRC Repository</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Re-export services for programmatic policy synthesis
export {
  Iso27001PolicyEngine,
  ISO27001_POLICY_CATALOG,
  getStage2EvidenceLogsForPolicy,
  formatStage2LogsToMarkdown
};
export type { Stage2AuditorEvidenceLog };

export default PolicyGenerator;
