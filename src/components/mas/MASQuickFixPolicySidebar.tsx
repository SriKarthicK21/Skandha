import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  FileText,
  CheckCircle2,
  Copy,
  Plus,
  ExternalLink,
  Shield,
  BookOpen,
  ArrowRight,
  Download,
  Flame,
  Clock,
  Layers,
  Check,
  RefreshCw,
  Building2,
  FileCheck,
  Wand2
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASRequirementAssessmentRecord } from '../../types/regulatoryTypes';

interface PolicyTemplateData {
  docCode: string;
  title: string;
  masDomain: string;
  statutoryReference: string;
  version: string;
  classification: string;
  owner: string;
  approver: string;
  purpose: string;
  scope: string;
  policyStatements: string[];
  technicalMandates: Array<{ controlName: string; requirement: string; verificationMethod: string }>;
  remediationQuickFix: string;
  auditEvidenceRequired: string[];
  fullPolicyMarkdown: string;
}

interface MASQuickFixPolicySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDomainNumber: string;
  onSelectDomainNumber: (domainNum: string) => void;
  activeAssessment?: MASRequirementAssessmentRecord | null;
  onApplyRemediationToAssessment?: (remediationText: string, policyCode: string) => void;
  onCreateCapaWithPolicy?: (policyData: PolicyTemplateData) => void;
}

export const MASQuickFixPolicySidebar: React.FC<MASQuickFixPolicySidebarProps> = ({
  isOpen,
  onClose,
  selectedDomainNumber,
  onSelectDomainNumber,
  activeAssessment,
  onApplyRemediationToAssessment,
  onCreateCapaWithPolicy
}) => {
  const { masDomains, addDocument, setActiveModule, currentUser } = useGRC();

  const [currentDomain, setCurrentDomain] = useState<string>(
    selectedDomainNumber && selectedDomainNumber !== 'ALL' ? selectedDomainNumber : '10.0'
  );
  const [institutionType, setInstitutionType] = useState<string>('Full Commercial Bank');
  const [customFocus, setCustomFocus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [policyTemplate, setPolicyTemplate] = useState<PolicyTemplateData | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [adoptedSuccess, setAdoptedSuccess] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);
  const [viewFullDocModal, setViewFullDocModal] = useState<boolean>(false);

  // Sync current domain when selectedDomainNumber or activeAssessment changes
  useEffect(() => {
    if (activeAssessment?.domainNumber) {
      setCurrentDomain(activeAssessment.domainNumber);
    } else if (selectedDomainNumber && selectedDomainNumber !== 'ALL') {
      setCurrentDomain(selectedDomainNumber);
    }
  }, [selectedDomainNumber, activeAssessment]);

  // Fetch policy template when current domain changes
  useEffect(() => {
    if (!isOpen) return;
    fetchPolicyTemplate(currentDomain);
  }, [currentDomain, isOpen]);

  const activeDomainMeta = masDomains.find(d => d.domainNumber === currentDomain) || {
    domainNumber: currentDomain,
    name: 'Access Control & Identity Governance',
    description: 'Enforce stringent identity authentication and access control.',
    category: 'TECHNICAL',
    totalRequirements: 5
  };

  const fetchPolicyTemplate = async (domainNum: string, overrideFocus?: string) => {
    setLoading(true);
    setCopied(false);
    setAdoptedSuccess(null);
    setAppliedSuccess(null);

    try {
      const targetDomainMeta = masDomains.find(d => d.domainNumber === domainNum);
      const res = await fetch('/api/ai/mas-policy-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domainNumber: domainNum,
          domainName: targetDomainMeta?.name || 'Security & Risk Governance',
          requirementCode: activeAssessment?.requirementCode || `MAS-${domainNum.replace('.0', '')}.1`,
          institutionType,
          customFocus: overrideFocus !== undefined ? overrideFocus : customFocus
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.template) {
          setPolicyTemplate(data.template);
          setIsAiGenerated(Boolean(data.isAI));
        }
      }
    } catch (err) {
      console.error('Failed to fetch policy template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAdoptPolicy = () => {
    if (!policyTemplate) return;

    const newDoc = addDocument({
      docCode: policyTemplate.docCode,
      title: policyTemplate.title,
      type: 'POLICY',
      category: 'MAS Technology Risk Management',
      version: policyTemplate.version || '2026.1-MAS',
      status: 'APPROVED',
      owner: policyTemplate.owner || currentUser.name,
      approver: policyTemplate.approver || 'Board Risk Committee',
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewCycle: 'Annual',
      standard: `MAS TRM Guidelines (${policyTemplate.masDomain}) & Notice 655`,
      classification: policyTemplate.classification || 'Confidential (Internal GRC)',
      documentOwner: policyTemplate.owner,
      approvedBy: policyTemplate.approver,
      content: policyTemplate.fullPolicyMarkdown,
      revisionHistory: [
        {
          sNo: '1.0',
          reviewDate: new Date().toISOString().split('T')[0],
          pageNo: 'All',
          issueNo: '2026.1',
          changeDescription: `Initial formal release aligned with MAS TRM Guidelines ${policyTemplate.masDomain} and regulatory notices.`,
          approvedBy: policyTemplate.approver || 'Board Risk Committee'
        }
      ]
    });

    setAdoptedSuccess(`Policy ${policyTemplate.docCode} adopted into Enterprise Policies!`);
    setTimeout(() => setAdoptedSuccess(null), 4000);
  };

  const handleApplyToAssessment = () => {
    if (!policyTemplate) return;
    const combinedRemediation = `${policyTemplate.remediationQuickFix} Supported by formal adoption of ${policyTemplate.docCode} (${policyTemplate.title}).`;
    
    if (onApplyRemediationToAssessment) {
      onApplyRemediationToAssessment(combinedRemediation, policyTemplate.docCode);
      setAppliedSuccess('Applied remediation language to assessment narrative!');
      setTimeout(() => setAppliedSuccess(null), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[55]"
        onClick={onClose}
      />

      {/* Main Quick Fix Sidebar Container */}
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] lg:w-[560px] bg-slate-900 border-l border-slate-800 z-[60] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out">
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Quick Fix Remediation
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AI Policy Engine
                  </span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Recommended Policy Templates
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Close Quick Fix Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Target Banner */}
          {activeAssessment && (
            <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 font-mono font-bold text-[10px] shrink-0">
                  {activeAssessment.requirementCode}
                </span>
                <span className="text-slate-200 truncate font-medium">
                  {activeAssessment.requirementTitle}
                </span>
              </div>
              <span className="text-[10px] text-rose-300 shrink-0 font-semibold pl-2">
                Active Audit Target
              </span>
            </div>
          )}

          {/* Quick Domain Navigation Chips */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0">
              Jump:
            </span>
            {['3.0', '8.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.0', '16.0'].map(dNum => (
              <button
                key={dNum}
                onClick={() => {
                  setCurrentDomain(dNum);
                  onSelectDomainNumber(dNum);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 transition-all cursor-pointer ${
                  currentDomain === dNum
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                D{dNum}
              </button>
            ))}
          </div>

          {/* Domain Selector Dropdown */}
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                MAS TRM Audit Domain
              </label>
              <select
                value={currentDomain}
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentDomain(val);
                  onSelectDomainNumber(val);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-rose-500 font-medium"
              >
                {masDomains.map(d => (
                  <option key={d.domainNumber} value={d.domainNumber}>
                    {d.domainNumber} {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                Institution Category
              </label>
              <select
                value={institutionType}
                onChange={(e) => {
                  setInstitutionType(e.target.value);
                  fetchPolicyTemplate(currentDomain);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="Full Commercial Bank">Full Commercial Bank</option>
                <option value="Digital Wholesale Bank">Digital Wholesale Bank</option>
                <option value="Major Payment Institution">Major Payment Institution (MPI)</option>
                <option value="Capital Markets Services (CMS) Licensee">CMS Licensee / Brokerage</option>
                <option value="Licensed Insurer">Licensed Insurer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Notifications */}
        {adoptedSuccess && (
          <div className="m-3 p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{adoptedSuccess}</span>
            </div>
            <button
              onClick={() => {
                onClose();
                setActiveModule('policies');
              }}
              className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
            >
              Open Policies
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {appliedSuccess && (
          <div className="m-3 p-3 bg-rose-950/90 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2 shadow-lg">
            <Check className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{appliedSuccess}</span>
          </div>
        )}

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-slate-300">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-rose-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  Generating Bank-Grade Policy Template...
                </p>
                <p className="text-xs text-slate-400">
                  Aligning with MAS TRM Guidelines ({currentDomain}) and statutory benchmarks.
                </p>
              </div>
            </div>
          ) : policyTemplate ? (
            <>
              {/* Primary Policy Banner Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold border border-rose-500/30">
                        {policyTemplate.docCode}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                        v{policyTemplate.version}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-medium">
                        {policyTemplate.classification}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {policyTemplate.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopyText(policyTemplate.fullPolicyMarkdown)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Copy full policy text"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-800/80 pt-2">
                  <Shield className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">
                    <strong>Statutory Mandate:</strong> {policyTemplate.statutoryReference}
                  </span>
                </div>
              </div>

              {/* 1-Click Action Hub for Remediation */}
              <div className="bg-gradient-to-r from-rose-950/30 to-slate-950 border border-rose-900/50 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Instant Remediation Actions
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Streamline MAS Audit
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleAdoptPolicy}
                    className="w-full px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adopt to Policies
                  </button>

                  <button
                    onClick={handleApplyToAssessment}
                    className="w-full px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Inject into Narrative
                  </button>
                </div>

                {onCreateCapaWithPolicy && (
                  <button
                    onClick={() => onCreateCapaWithPolicy(policyTemplate)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Issue CAPA Finding with this Policy
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    setActiveModule('mas_policy_generator');
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950/40 to-rose-950/40 hover:from-purple-900/50 hover:to-rose-900/50 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                  Cross-Reference Internal Drafts in Policy Generator
                </button>
              </div>

              {/* Quick Fix Narrative Snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Auditor-Ready Narrative Snippet
                  </span>
                  <button
                    onClick={() => handleCopyText(policyTemplate.remediationQuickFix)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy snippet
                  </button>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300 font-normal">
                  {policyTemplate.remediationQuickFix}
                </div>
              </div>

              {/* Mandatory Policy Statements */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Mandatory Policy Statements
                </span>
                <div className="space-y-1.5">
                  {policyTemplate.policyStatements.map((stmt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-relaxed">{stmt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concrete Technical Mandates */}
              {policyTemplate.technicalMandates && policyTemplate.technicalMandates.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Enforceable Technical Controls
                  </span>
                  <div className="space-y-2">
                    {policyTemplate.technicalMandates.map((ctrl, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white font-semibold">{ctrl.controlName}</strong>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                            Mandate
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{ctrl.requirement}</p>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900 flex items-center gap-1">
                          <span className="text-slate-500 font-medium">Audit Proof:</span>
                          <span className="text-rose-300 truncate">{ctrl.verificationMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Audit Evidence Artifacts */}
              {policyTemplate.auditEvidenceRequired && policyTemplate.auditEvidenceRequired.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Statutory Evidence Artifacts for Inspection
                  </span>
                  <ul className="space-y-1 pl-1">
                    {policyTemplate.auditEvidenceRequired.map((ev, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* View Full Document Link */}
              <div className="pt-2">
                <button
                  onClick={() => setViewFullDocModal(true)}
                  className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  Read Complete Formatted Document
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Select an audit domain above to view AI-recommended policy templates.
            </div>
          )}
        </div>

        {/* Sidebar Footer with Live Status */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MAS TRM 2026 Regulatory Alignment</span>
          </div>

          <button
            onClick={() => fetchPolicyTemplate(currentDomain)}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Regenerate
          </button>
        </div>
      </aside>

      {/* Full Document Viewer Modal */}
      {viewFullDocModal && policyTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                    {policyTemplate.docCode}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                    MAS TRM {policyTemplate.masDomain}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{policyTemplate.title}</h2>
              </div>

              <button
                onClick={() => setViewFullDocModal(false)}
                className="text-slate-400 hover:text-white text-xl p-1.5 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body: Document Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
              {/* Document Header Metadata Table */}
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <table className="w-full text-xs text-left">
                  <tbody className="divide-y divide-slate-800">
                    <tr className="divide-x divide-slate-800">
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60 w-1/4">Document Title</td>
                      <td className="p-2.5 text-white font-medium">{policyTemplate.title}</td>
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60 w-1/4">Document Code</td>
                      <td className="p-2.5 text-rose-400 font-mono font-bold">{policyTemplate.docCode}</td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60">Version</td>
                      <td className="p-2.5 text-white">{policyTemplate.version}</td>
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60">Classification</td>
                      <td className="p-2.5 text-amber-300">{policyTemplate.classification}</td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60">Policy Owner</td>
                      <td className="p-2.5 text-white">{policyTemplate.owner}</td>
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60">Approver</td>
                      <td className="p-2.5 text-white">{policyTemplate.approver}</td>
                    </tr>
                    <tr className="divide-x divide-slate-800">
                      <td className="p-2.5 font-bold text-slate-400 bg-slate-900/60">Statutory Mandate</td>
                      <td colSpan={3} className="p-2.5 text-slate-200">{policyTemplate.statutoryReference}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Raw Markdown / Structured Clauses */}
              <div className="space-y-4 whitespace-pre-line font-sans bg-slate-950/70 p-5 rounded-xl border border-slate-800/80">
                {policyTemplate.fullPolicyMarkdown}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={() => handleCopyText(policyTemplate.fullPolicyMarkdown)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Policy' : 'Copy Full Document'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewFullDocModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAdoptPolicy();
                    setViewFullDocModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adopt to Enterprise Policies
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
