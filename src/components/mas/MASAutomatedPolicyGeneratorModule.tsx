import React, { useState, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { GeneratedDocument } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  FileCheck2,
  Building2,
  Download,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Zap,
  BookmarkPlus,
  BookOpen,
  Globe,
  Languages
} from 'lucide-react';
import { PolicyLanguageSwitcher } from '../policies/PolicyLanguageSwitcher';
import { SUPPORTED_LANGUAGES } from '../../utils/policyTranslator';
import {
  generateDeterministicMASAnalysis,
  translateMASAnalysis
} from '../../utils/masCrossReferenceEngine';
import { exportPolicyPDF } from '../../utils/policyPdfExporter';

// MAS TRM Domain definitions for selection
const DOMAINS_LIST = [
  { domainNumber: '3.0', name: 'Technology Risk Governance & Board Oversight', category: 'Governance' },
  { domainNumber: '4.0', name: 'Technology Risk Management Framework', category: 'Governance' },
  { domainNumber: '5.0', name: 'IT Project Management & Acquisition', category: 'Operations' },
  { domainNumber: '6.0', name: 'Software Development Life Cycle (Secure DevSecOps)', category: 'Engineering' },
  { domainNumber: '7.0', name: 'IT Service Management & Change Control', category: 'Operations' },
  { domainNumber: '8.0', name: 'Cyber Security Operations & Threat Intelligence', category: 'Security' },
  { domainNumber: '9.0', name: 'Data Security & Cryptography (HSM/Key Vault)', category: 'Security' },
  { domainNumber: '10.0', name: 'Access Control & Identity Management (IAM/PAM)', category: 'Security' },
  { domainNumber: '11.0', name: 'Infrastructure, Endpoint & Network Security', category: 'Infrastructure' },
  { domainNumber: '12.0', name: 'Cloud Security & Virtualization Risk', category: 'Cloud' },
  { domainNumber: '13.0', name: 'Third-Party & Outsourcing Technology Risk', category: 'Third-Party' },
  { domainNumber: '14.0', name: 'Incident Management & MAS 1-Hour Statutory Notification', category: 'Resilience' },
  { domainNumber: '15.0', name: 'Business Continuity & System Resiliency (4h RTO Cap)', category: 'Resilience' },
  { domainNumber: '16.0', name: 'Audit Logging, WORM Immutability & Forensics', category: 'Audit' },
  { domainNumber: '17.0', name: 'Online Financial Services & API Security', category: 'Digital Banking' }
];

// Curated internal draft presets with common corporate regulatory deficiencies
const SAMPLE_INTERNAL_DRAFTS = [
  {
    id: 'sample-10',
    domainNumber: '10.0',
    title: 'Internal Access Control & Password Management Draft (v0.8)',
    summary: 'Contains typical discretionary language ("should"), missing hardware MFA, and single-party administrative overrides.',
    draftText: `1. Purpose & Scope:
This document outlines standard access protocols for company network systems and workstations.

2. User Authentication:
Employees are assigned unique user IDs. Passwords should be changed periodically every 90 to 180 days where feasible. Multi-factor authentication is encouraged for remote access when practical.

3. Privileged Accounts:
System administrators have elevated root access to production servers. Administrators should exercise good judgment when modifying databases. Management may review access privileges as appropriate.

4. Session Control:
Workstations should be locked when unattended for long periods. System sessions remain active to facilitate continuous background processing.`
  },
  {
    id: 'sample-14',
    domainNumber: '14.0',
    title: 'Corporate IT Incident Response & Escalation Procedure (v1.2)',
    summary: 'Features a critical 24-48 hour reporting window, violating the statutory MAS Notice 655 1-hour notification mandate.',
    draftText: `1. Incident Identification:
Any technical malfunction, cyber alert, or system downtime detected by operations will be logged in the internal ticketing queue.

2. Severity & Triage:
The shift engineer will evaluate severity and assign an engineer within standard business hours.

3. External Escalation:
If customer services are severely impacted, the communications team will prepare a statement and notify external regulators as soon as practicable, typically within 24 to 48 hours following root cause confirmation.

4. Post-Mortem:
Teams will conduct an internal retrospective within 30 to 60 days to document lessons learned.`
  },
  {
    id: 'sample-15',
    domainNumber: '15.0',
    title: 'Disaster Recovery & Operational Continuity Policy (v1.0)',
    summary: 'Specifies standard 24-hour RTO and lacks statutory 4-hour annual unscheduled downtime cap.',
    draftText: `1. Continuity Objectives:
The company endeavors to maintain 99.9% uptime across primary hosting environments.

2. Disaster Recovery RTO/RPO:
In the event of a catastrophic facility failure, the targeted Recovery Time Objective (RTO) is 24 hours from disaster declaration. Backups are performed nightly with a 24-hour Recovery Point Objective (RPO).

3. DR Testing:
Disaster recovery tests are performed periodically every two years or when major architectural changes occur. Failover exercises are conducted in staging environments to avoid disrupting live banking transactions.`
  },
  {
    id: 'sample-13',
    domainNumber: '13.0',
    title: 'Third-Party Vendor Management & Cloud Procurement Standard (v0.6)',
    summary: 'Omits unconditional MAS right-to-audit clauses and lacks downstream fourth-party sub-contractor visibility.',
    draftText: `1. Vendor Selection:
Business units selecting SaaS or IT vendors must verify commercial viability and obtain standard non-disclosure agreements.

2. Security Commitments:
Vendors should maintain standard industry safeguards to protect customer data. Cloud vendors are relied upon for infrastructure patching under their standard terms of service.

3. Audit & Verification:
Vendors are asked to provide their public SOC 2 summary report upon request. Direct physical or technical inspection of vendor facilities is not required.`
  },
  {
    id: 'sample-6',
    domainNumber: '6.0',
    title: 'Software Development & Application Release Guidelines (v0.9)',
    summary: 'Lacks automated SAST/DAST CI/CD security gating and mandatory annual red teaming.',
    draftText: `1. Development Workflow:
Engineers commit code to central repositories. Code reviews are recommended prior to merging into production branches.

2. Testing & Vulnerabilities:
Developers should test their features for security bugs before deployment. Penetration testing may be commissioned when deemed necessary by project sponsors.

3. Third-Party Libraries:
Open source packages may be downloaded from public package managers as needed for rapid delivery.`
  }
];

interface DetectedGap {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  statutoryReference: string;
  findingTitle: string;
  draftExcerpt: string;
  inspectorVerdict: string;
  suggestedRemedy: string;
}

interface ClauseSuggestion {
  id: string;
  sectionTitle: string;
  masRequirementCode: string;
  originalClauseText: string;
  suggestedCompliantText: string;
  statutoryJustification: string;
  keyChanges: string[];
  mandatoryPhrasingAdded: string[];
}

interface CrossReferenceAnalysis {
  complianceScore: number;
  projectedScore: number;
  riskRating: 'CRITICAL_GAP' | 'HIGH_EXPOSURE' | 'MODERATE' | 'COMPLIANT';
  executiveSummary: string;
  detectedGaps: DetectedGap[];
  clauseSuggestions: ClauseSuggestion[];
  fullRevisedPolicyMarkdown: string;
  metadata: {
    docCode: string;
    title: string;
    masDomain: string;
    version: string;
    classification: string;
    effectiveDate: string;
  };
}

export const MASAutomatedPolicyGeneratorModule: React.FC = () => {
  const { generatedDocs, addDocument, updateDocument, setActiveModule } = useGRC();
  const { showToast } = useToast();

  // Drafting inputs
  const [selectedDomainNumber, setSelectedDomainNumber] = useState('10.0');
  const [policyTitle, setPolicyTitle] = useState('Access Control & Privileged Identity Governance Policy');
  const [draftContent, setDraftContent] = useState(SAMPLE_INTERNAL_DRAFTS[0].draftText);
  const [institutionType, setInstitutionType] = useState('Full Commercial Bank (Licensed under Banking Act)');
  const [selectedPresetId, setSelectedPresetId] = useState('sample-10');
  const [selectedDocId, setSelectedDocId] = useState('');

  // Execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CrossReferenceAnalysis | null>(null);
  const [rawEnglishAnalysisResult, setRawEnglishAnalysisResult] = useState<CrossReferenceAnalysis | null>(null);
  const [isAiPowered, setIsAiPowered] = useState(false);
  const [aiModelName, setAiModelName] = useState('');

  // Multi-Lingual ISO & MAS Clause Translation state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isBilingual, setIsBilingual] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'suggestions' | 'gaps' | 'fullDocument'>('suggestions');

  // Clause acceptance tracker
  const [acceptedClauses, setAcceptedClauses] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const currentDomainObj = DOMAINS_LIST.find(d => d.domainNumber === selectedDomainNumber) || DOMAINS_LIST[7];

  // Auto-translate analysis result when selectedLanguage changes
  const handleLanguageChange = async (langCode: string) => {
    setSelectedLanguage(langCode);
    if (!rawEnglishAnalysisResult) return;

    if (langCode === 'en') {
      setAnalysisResult(rawEnglishAnalysisResult);
      return;
    }

    try {
      setIsTranslating(true);
      const translated = await translateMASAnalysis(rawEnglishAnalysisResult, langCode);
      setAnalysisResult(translated as CrossReferenceAnalysis);
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
      showToast({
        title: 'Policy Clauses Localized',
        message: `Auto-translated ISO and MAS clauses to ${langObj?.nativeName || langCode} (${langObj?.name}) for distributed teams.`,
        type: 'info'
      });
    } catch (err) {
      console.error('Translation error:', err);
      showToast({
        title: 'Translation Notice',
        message: 'Loaded static regulatory dictionary translation for this language.',
        type: 'info'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Auto-run analysis on first load with preset
  useEffect(() => {
    handleRunCrossReference(SAMPLE_INTERNAL_DRAFTS[0].draftText, SAMPLE_INTERNAL_DRAFTS[0].title, '10.0');
  }, []);

  // Handle preset change
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setSelectedDocId('');
    const preset = SAMPLE_INTERNAL_DRAFTS.find(p => p.id === presetId);
    if (preset) {
      setSelectedDomainNumber(preset.domainNumber);
      setPolicyTitle(preset.title);
      setDraftContent(preset.draftText);
      handleRunCrossReference(preset.draftText, preset.title, preset.domainNumber);
    }
  };

  // Handle selecting an existing enterprise policy from tenant generatedDocs
  const handleSelectExistingDoc = (docId: string) => {
    setSelectedDocId(docId);
    setSelectedPresetId('');
    const doc = generatedDocs.find(d => d.id === docId);
    if (doc) {
      setPolicyTitle(doc.title);
      setDraftContent(doc.content);
      // Guess domain based on title
      const titleLower = doc.title.toLowerCase();
      let matchedDomain = '10.0';
      if (titleLower.includes('incident') || titleLower.includes('breach')) matchedDomain = '14.0';
      else if (titleLower.includes('continuity') || titleLower.includes('resilience') || titleLower.includes('disaster')) matchedDomain = '15.0';
      else if (titleLower.includes('vendor') || titleLower.includes('third party') || titleLower.includes('supplier')) matchedDomain = '13.0';
      else if (titleLower.includes('development') || titleLower.includes('software') || titleLower.includes('sdlc')) matchedDomain = '6.0';
      else if (titleLower.includes('log') || titleLower.includes('audit')) matchedDomain = '16.0';
      else if (titleLower.includes('crypt') || titleLower.includes('key')) matchedDomain = '9.0';
      setSelectedDomainNumber(matchedDomain);
      handleRunCrossReference(doc.content, doc.title, matchedDomain);
    }
  };

  // Run Cross-Reference & Policy Generation API
  const handleRunCrossReference = async (
    customDraft?: string,
    customTitle?: string,
    customDomain?: string
  ) => {
    const textToAnalyze = customDraft !== undefined ? customDraft : draftContent;
    const titleToUse = customTitle !== undefined ? customTitle : policyTitle;
    const domainToUse = customDomain !== undefined ? customDomain : selectedDomainNumber;
    const domainObj = DOMAINS_LIST.find(d => d.domainNumber === domainToUse) || currentDomainObj;

    setIsAnalyzing(true);
    setAcceptedClauses({});

    try {
      const res = await fetch('/api/mas/cross-reference-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftText: textToAnalyze,
          policyTitle: titleToUse,
          domainNumber: domainToUse,
          domainName: domainObj.name,
          institutionType,
          strictnessMode: 'STATUTORY_ENFORCEMENT'
        })
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      if (data.success && data.analysis) {
        setRawEnglishAnalysisResult(data.analysis);
        if (selectedLanguage !== 'en') {
          const translated = await translateMASAnalysis(data.analysis, selectedLanguage);
          setAnalysisResult(translated as CrossReferenceAnalysis);
        } else {
          setAnalysisResult(data.analysis);
        }
        setIsAiPowered(Boolean(data.isAI));
        setAiModelName(data.model || 'Deterministic MAS Cross-Reference Engine');
        showToast({
          title: 'MAS TRM Cross-Reference Complete',
          message: `Identified ${data.analysis.detectedGaps?.length || 0} gaps; generated ${data.analysis.clauseSuggestions?.length || 0} compliant policy suggestions.`,
          type: 'success'
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      console.warn('Network API call fell back to deterministic MAS TRM engine:', err);
      const fallbackAnalysis = generateDeterministicMASAnalysis(
        textToAnalyze,
        titleToUse,
        domainToUse,
        domainObj.name,
        institutionType
      ) as unknown as CrossReferenceAnalysis;

      setRawEnglishAnalysisResult(fallbackAnalysis);
      if (selectedLanguage !== 'en') {
        const translatedFallback = await translateMASAnalysis(fallbackAnalysis, selectedLanguage);
        setAnalysisResult(translatedFallback as CrossReferenceAnalysis);
      } else {
        setAnalysisResult(fallbackAnalysis);
      }
      setIsAiPowered(false);
      setAiModelName('Deterministic MAS Regulatory Engine');

      showToast({
        title: 'Analysis Fallback Activated',
        message: 'Using offline deterministic MAS TRM regulatory analysis engine.',
        type: 'info'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export localized PDF document
  const handleExportPDF = async () => {
    if (!analysisResult) return;
    try {
      setIsExportingPdf(true);
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
      const fileName = await exportPolicyPDF({
        title: analysisResult.metadata.title,
        code: analysisResult.metadata.docCode,
        category: `MAS TRM Domain ${selectedDomainNumber}`,
        companyName: 'Apex Banking & Technologies Corp.',
        version: analysisResult.metadata.version,
        classification: analysisResult.metadata.classification,
        effectiveDate: analysisResult.metadata.effectiveDate,
        language: selectedLanguage,
        languageLabel: langObj ? `${langObj.nativeName} (${langObj.name})` : undefined,
        policyText: analysisResult.fullRevisedPolicyMarkdown,
        isoClause: `MAS TRM Domain ${selectedDomainNumber} / ISO/IEC 27001`
      });
      showToast({
        title: 'PDF Export Complete',
        message: `Generated controlled document: ${fileName}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      showToast({
        title: 'PDF Export Failed',
        message: 'Could not generate PDF document. Please retry.',
        type: 'error'
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Accept a suggested clause and inject it into the draft text
  const handleAcceptClause = (suggestion: ClauseSuggestion) => {
    setAcceptedClauses(prev => ({ ...prev, [suggestion.id]: true }));
    
    // Replace original or append to draft
    let newDraft = draftContent;
    if (newDraft.includes(suggestion.originalClauseText)) {
      newDraft = newDraft.replace(suggestion.originalClauseText, suggestion.suggestedCompliantText);
    } else {
      newDraft = `${newDraft}\n\n## ${suggestion.sectionTitle}\n${suggestion.suggestedCompliantText}`;
    }
    setDraftContent(newDraft);

    showToast({
      title: 'Clause Suggestion Accepted',
      message: `Merged compliant text for "${suggestion.sectionTitle}" into the active draft.`,
      type: 'success'
    });
  };

  // Accept all suggestions at once
  const handleAcceptAllSuggestions = () => {
    if (!analysisResult) return;
    const newAccepted: Record<string, boolean> = {};
    let updatedDraft = draftContent;

    analysisResult.clauseSuggestions.forEach(sugg => {
      newAccepted[sugg.id] = true;
      if (updatedDraft.includes(sugg.originalClauseText)) {
        updatedDraft = updatedDraft.replace(sugg.originalClauseText, sugg.suggestedCompliantText);
      }
    });

    setAcceptedClauses(newAccepted);
    setDraftContent(updatedDraft);
    showToast({
      title: 'All Policy Suggestions Accepted',
      message: `Replaced ${analysisResult.clauseSuggestions.length} draft clauses with MAS-compliant text.`,
      type: 'success'
    });
  };

  // Copy text helper
  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
    showToast({ title: 'Copied to Clipboard', type: 'info' });
  };

  // Adopt into Enterprise Policies
  const handleAdoptToEnterprisePolicies = () => {
    if (!analysisResult) return;

    const docCode = analysisResult.metadata.docCode || `POL-MAS-${selectedDomainNumber.replace('.', '')}-2026`;
    const docTitle = analysisResult.metadata.title || policyTitle;
    const fullContent = analysisResult.fullRevisedPolicyMarkdown || draftContent;

    // Check if doc already exists
    const existing = generatedDocs.find(d => d.docCode === docCode || d.title.toLowerCase() === docTitle.toLowerCase());
    
    if (existing) {
      updateDocument(existing.id, {
        content: fullContent,
        status: 'IN_REVIEW',
        standard: 'MAS TRM Guidelines (2021/2026) & Notices 644/655',
        version: '2026.1-MAS',
        approver: 'Board Risk Committee & CISO'
      });
      showToast({
        title: 'Enterprise Policy Updated',
        message: `Updated existing policy "${docTitle}" (${docCode}) in Policies & Procedures.`,
        type: 'success'
      });
    } else {
      addDocument({
        docCode,
        title: docTitle,
        type: 'POLICY',
        category: `MAS TRM Domain ${selectedDomainNumber}`,
        version: '2026.1-MAS',
        status: 'IN_REVIEW',
        owner: 'Head of Technology Risk & CISO',
        approver: 'Chief Executive Officer & Board Risk Committee',
        effectiveDate: new Date().toISOString().split('T')[0],
        reviewCycle: 'Annual',
        content: fullContent,
        classification: 'Confidential (Internal GRC)',
        standard: 'MAS TRM Guidelines (2021/2026) & Notices 644/655',
        documentOwner: 'Chief Information Security Officer (CISO)',
        issuedBy: 'Technology Risk Governance Committee',
        approvedBy: 'Board Risk Committee'
      });
      showToast({
        title: 'New Policy Adopted & Registered',
        message: `Created formal policy "${docTitle}" (${docCode}) in Policies & Procedures repository.`,
        type: 'success'
      });
    }
  };

  // Export as markdown file download
  const handleExportFile = () => {
    if (!analysisResult) return;
    const content = analysisResult.fullRevisedPolicyMarkdown;
    const langSuffix = selectedLanguage !== 'en' ? `_${selectedLanguage.toUpperCase()}` : '';
    const filename = `${(analysisResult.metadata.docCode || 'MAS-POLICY')}${langSuffix}.md`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ title: 'Downloaded Policy Markdown', message: filename, type: 'info' });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Module Executive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                Automated Policy Generator
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-mono">
                MAS TRM 2021/2026 Grounded
              </span>
              <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-full text-xs font-mono">
                Notices 644 & 655 Enforced
              </span>
              {isAiPowered && (
                <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                  {aiModelName}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              MAS TRM Policy Cross-Referencing & Drafting Engine
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Analyze internal policy drafts against the Monetary Authority of Singapore (MAS) statutory framework.
              The engine scans for unenforceable phrasing, missing mandatory controls (such as 1-hour incident SLAs and dual authorization),
              and generates legally binding, bank-grade policy text suggestions ready for board adoption.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>15 TRM Domains Covered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Enforceable Statutory Phrasing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Statutory SLA Verification (Notice 655)</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex flex-col gap-2.5 shrink-0">
            {/* Global Teams Multi-Lingual Switcher */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 space-y-1.5 shadow-sm">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Global Team Language</span>
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-900/40 text-blue-300 font-mono">
                  ISO 7.5.3
                </span>
              </div>
              <PolicyLanguageSwitcher
                currentLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                isBilingual={isBilingual}
                onToggleBilingual={setIsBilingual}
                isLoading={isTranslating}
                compact
              />
            </div>

            <div className="flex flex-row gap-2">
              <button
                onClick={() => setActiveModule('mas_assessment_workbench')}
                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Workbench</span>
              </button>
              <button
                onClick={() => setActiveModule('policies')}
                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Policies Hub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Draft Source & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Preset & Source Ingestion Selector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-rose-400" />
                1. Select Draft Source
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Input Configuration</span>
            </div>

            {/* Quick Sample Presets Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Load Pre-Configured Draft with Realistic Deficiencies:
              </label>
              <div className="space-y-1.5">
                {SAMPLE_INTERNAL_DRAFTS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                      selectedPresetId === preset.id
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-100 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-rose-400 shrink-0 mt-0.5">
                      D{preset.domainNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate">{preset.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{preset.summary}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Enterprise Policy Selector */}
            {generatedDocs.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Or Select Existing Enterprise Policy:</span>
                  <span className="text-[10px] text-slate-400 font-normal">({generatedDocs.length} in tenant)</span>
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => handleSelectExistingDoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-rose-500 cursor-pointer"
                >
                  <option value="">-- Choose from your Policies Hub --</option>
                  {generatedDocs.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      [{doc.docCode}] {doc.title} ({doc.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Scope & Audit Target Settings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-rose-400" />
              2. Audit Domain & Institution Scope
            </h2>

            {/* Target MAS TRM Domain Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target MAS TRM Regulatory Domain
              </label>
              <select
                value={selectedDomainNumber}
                onChange={(e) => setSelectedDomainNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-rose-500 cursor-pointer"
              >
                {DOMAINS_LIST.map(d => (
                  <option key={d.domainNumber} value={d.domainNumber}>
                    Domain {d.domainNumber}: {d.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                <span>Domain Category:</span>
                <span className="font-semibold text-rose-300">{currentDomainObj.category}</span>
              </p>
            </div>

            {/* Institution Profile */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Financial Institution License Profile
              </label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-rose-500 cursor-pointer"
              >
                <option value="Full Commercial Bank (Licensed under Banking Act)">Full Commercial Bank (Banking Act - Highest Stringency)</option>
                <option value="Digital Wholesale Bank (DWB License)">Digital Wholesale Bank (DWB License)</option>
                <option value="Major Payment Institution (MPI under Payment Services Act)">Major Payment Institution (MPI - Payment Services Act)</option>
                <option value="Capital Markets Services (CMS) Licensee">Capital Markets Services (CMS) Licensee</option>
                <option value="Licensed Direct Insurer (Insurance Act)">Licensed Direct Insurer (Insurance Act)</option>
              </select>
            </div>

            {/* Policy Title Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Internal Policy Title
              </label>
              <input
                type="text"
                value={policyTitle}
                onChange={(e) => setPolicyTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
                placeholder="e.g., Access Control & Identity Governance Policy"
              />
            </div>

            {/* Internal Draft Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Internal Policy Draft Text
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {draftContent.length} chars | {draftContent.split('\n').filter(Boolean).length} lines
                </span>
              </div>
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-hidden focus:border-rose-500 resize-y"
                placeholder="Paste or edit internal policy text here..."
              />
            </div>

            {/* Run Analysis Trigger Button */}
            <button
              onClick={() => handleRunCrossReference()}
              disabled={isAnalyzing || !draftContent.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cross-Referencing with MAS Guidelines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-rose-200" />
                  <span>Generate Compliant Policy Suggestions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Cross-Referenced Results, Redlines & Suggestions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Executive Scorecard & Health Meter */}
          {analysisResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-rose-400" />
                    Regulatory Compliance Scorecard
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Target: Domain {selectedDomainNumber} ({currentDomainObj.name})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      analysisResult.riskRating === 'CRITICAL_GAP'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : analysisResult.riskRating === 'HIGH_EXPOSURE'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {analysisResult.riskRating.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Progress & Scores Compare */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Draft Score */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Current Draft Posture:</span>
                    <span className="text-base font-bold text-rose-400">{analysisResult.complianceScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.complianceScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{analysisResult.detectedGaps.length} regulatory non-conformities found</span>
                  </div>
                </div>

                {/* Projected Score with AI Suggestions Applied */}
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium">Post-Harmonization Projected:</span>
                    <span className="text-base font-bold text-emerald-400">{analysisResult.projectedScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.projectedScore}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Statutory compliance achieved across all mandatory clauses</span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed">
                {analysisResult.executiveSummary}
              </div>
            </div>
          )}

          {/* Multi-Lingual ISO & MAS Clause Translation Bar */}
          {analysisResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Multi-Lingual ISO & MAS Clause Translation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-mono border border-blue-700/40">
                      ISO 27001 Cl. 7.5.3
                    </span>
                    {selectedLanguage !== 'en' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-mono border border-emerald-700/40">
                        {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName} Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Auto-translate generated ISO & MAS clauses for distributed cross-border teams, regional branches, and multi-jurisdictional audits.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <PolicyLanguageSwitcher
                  currentLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  isBilingual={isBilingual}
                  onToggleBilingual={setIsBilingual}
                  isLoading={isTranslating}
                  showBilingualToggle={true}
                />
              </div>
            </div>
          )}

          {/* Navigation Tabs for Analysis Result */}
          {analysisResult && (
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'suggestions'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compliant Clause Suggestions</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {analysisResult.clauseSuggestions.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('gaps')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'gaps'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Statutory Gaps & Findings</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {analysisResult.detectedGaps.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('fullDocument')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'fullDocument'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Harmonized Document Preview</span>
                  {selectedLanguage !== 'en' && (
                    <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] uppercase font-mono">
                      {selectedLanguage}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'suggestions' && (
                <button
                  onClick={handleAcceptAllSuggestions}
                  className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All ({analysisResult.clauseSuggestions.length})</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 1: Clause Suggestions & Side-by-Side Redline */}
          {analysisResult && activeTab === 'suggestions' && (
            <div className="space-y-4">
              {analysisResult.clauseSuggestions.map((suggestion, idx) => {
                const isAccepted = acceptedClauses[suggestion.id];
                return (
                  <div
                    key={suggestion.id}
                    className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-xl transition-all ${
                      isAccepted ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800'
                    }`}
                  >
                    {/* Clause Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold rounded">
                            {suggestion.masRequirementCode}
                          </span>
                          <span className="text-xs font-bold text-white">
                            Clause {idx + 1}: {suggestion.sectionTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <span className="text-rose-400 font-medium">Statutory Ref:</span>
                          <span>{suggestion.statutoryJustification}</span>
                        </p>
                      </div>

                      {/* Acceptance Badge */}
                      {isAccepted ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Merged
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcceptClause(suggestion)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept & Merge</span>
                        </button>
                      )}
                    </div>

                    {/* Side-by-Side Clause Comparative View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Original Weak Draft */}
                      <div className="p-3 bg-rose-950/15 border border-rose-500/20 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Original Draft Clause (Deficient)
                        </span>
                        <p className="text-slate-300 leading-relaxed font-mono text-[11px] italic">
                          "{suggestion.originalClauseText}"
                        </p>
                      </div>

                      {/* MAS-Compliant Suggested Replacement */}
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>MAS-Compliant Replacement</span>
                            {selectedLanguage !== 'en' && (
                              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[9px] uppercase font-mono">
                                {selectedLanguage}
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => handleCopy(suggestion.id, suggestion.suggestedCompliantText)}
                            className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedStates[suggestion.id] ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Localized text */}
                        <div className="space-y-1">
                          {isBilingual && selectedLanguage !== 'en' && (
                            <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                              Localized ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}):
                            </div>
                          )}
                          <p className="text-emerald-100 leading-relaxed font-sans text-xs">
                            {suggestion.suggestedCompliantText}
                          </p>
                        </div>

                        {/* If bilingual active, show authoritative English Master Clause */}
                        {isBilingual && selectedLanguage !== 'en' && (
                          <div className="mt-2 pt-2 border-t border-emerald-500/20 space-y-1">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <span>Authoritative Master Clause (English):</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed font-sans text-xs italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                              {rawEnglishAnalysisResult?.clauseSuggestions.find(s => s.id === suggestion.id)?.suggestedCompliantText || suggestion.suggestedCompliantText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Additions & Mandates */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-semibold">Mandatory Phrasing Injected:</span>
                      {suggestion.mandatoryPhrasingAdded?.map((phrase, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded text-[10px] font-mono"
                        >
                          +{phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Detected Statutory Gaps & Violations */}
          {analysisResult && activeTab === 'gaps' && (
            <div className="space-y-4">
              {analysisResult.detectedGaps.map(gap => (
                <div
                  key={gap.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            gap.severity === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : gap.severity === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {gap.severity} DEFICIENCY
                        </span>
                        <span className="text-xs font-mono text-slate-400 font-medium">
                          {gap.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{gap.findingTitle}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {gap.statutoryReference}
                    </span>
                  </div>

                  {/* Inspector Verdict */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                        MAS Supervisory Inspector Verdict:
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{gap.inspectorVerdict}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                        Concrete Operational Remedy:
                      </span>
                      <p className="text-emerald-200 mt-0.5 leading-relaxed">{gap.suggestedRemedy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Full Harmonized Document Preview & Adoption Actions */}
          {analysisResult && activeTab === 'fullDocument' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Document Header & Metadata Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {analysisResult.metadata.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="font-mono text-rose-400 font-bold">{analysisResult.metadata.docCode}</span>
                    <span>•</span>
                    <span>Version: {analysisResult.metadata.version}</span>
                    <span>•</span>
                    <span>Classification: {analysisResult.metadata.classification}</span>
                  </div>
                </div>

                {/* Document Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy('fullDoc', analysisResult.fullRevisedPolicyMarkdown)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedStates['fullDoc'] ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportFile}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-xs"
                    title="Download localized policy in Markdown format"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export (.md)</span>
                  </button>

                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPdf}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    title="Export publication-ready ISO/MAS PDF document with localized typography and document control"
                  >
                    {isExportingPdf ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileCheck2 className="w-3.5 h-3.5" />
                    )}
                    <span>Export PDF</span>
                  </button>

                  <button
                    onClick={handleAdoptToEnterprisePolicies}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Adopt to Policies Hub</span>
                  </button>
                </div>
              </div>

              {/* Formatted Markdown Container */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {analysisResult.fullRevisedPolicyMarkdown}
              </div>

              {/* Bottom Adoption Bar */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">
                      Ready for Formal Board Risk Committee Adoption
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Adopting registers this document under Policies & Procedures and links it as evidence for MAS TRM Domain {selectedDomainNumber}.
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAdoptToEnterprisePolicies}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-md"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Adopt into Enterprise Policies</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State when loading or no result */}
          {!analysisResult && !isAnalyzing && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-white">No Policy Analyzed Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Select a draft source from the left panel and click "Generate Compliant Policy Suggestions" to cross-reference against MAS TRM guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
