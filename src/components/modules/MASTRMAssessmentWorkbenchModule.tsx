import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  Layers,
  FileText,
  AlertCircle,
  Sparkles,
  Save,
  CheckSquare,
  Flame,
  ArrowUpRight,
  Plus,
  Bot,
  AlertOctagon,
  Building2,
  Server,
  ShieldAlert,
  X
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MASRequirementAssessmentRecord } from '../../types/regulatoryTypes';
import { MASQuickFixPolicySidebar } from '../mas/MASQuickFixPolicySidebar';
import { MASRegulatoryAIAdvisor } from '../mas/MASRegulatoryAIAdvisor';
import { RAGEvidenceAlignmentItem } from '../../services/masRAGKnowledgeService';
import {
  isStatutoryNoticeRequirement,
  getStatutoryNoticePillar,
  isSevereStatutoryViolation,
  getStatutoryNoticeStats
} from '../../services/masStatutoryNoticeService';
import { MASIncidentResponseWorkbench } from '../mas/MASIncidentResponseWorkbench';
import { MASCISDowntimeLedger } from '../mas/MASCISDowntimeLedger';
import { PageContainer } from '../layout/PageContainer';

export const MASTRMAssessmentWorkbenchModule: React.FC = () => {
  const {
    masDomains,
    masRequirements,
    masAssessments,
    updateMASAssessment,
    evidence,
    risks,
    findings,
    addFinding,
    setActiveModule
  } = useGRC();

  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [statutoryNoticeOnly, setStatutoryNoticeOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAssessment, setEditingAssessment] = useState<MASRequirementAssessmentRecord | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<'assessment' | 'evidence' | 'capa'>('assessment');
  const [notification, setNotification] = useState<string | null>(null);

  // Quick Fix Sidebar state
  const [isQuickFixOpen, setIsQuickFixOpen] = useState<boolean>(false);
  const [quickFixTargetAssessment, setQuickFixTargetAssessment] = useState<MASRequirementAssessmentRecord | null>(null);

  // MAS Regulatory AI Advisor state
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [advisorTargetAssessment, setAdvisorTargetAssessment] = useState<MASRequirementAssessmentRecord | null>(null);

  // Statutory Tools Modals
  const [isIncidentToolOpen, setIsIncidentToolOpen] = useState<boolean>(false);
  const [isCISLedgerOpen, setIsCISLedgerOpen] = useState<boolean>(false);

  const handleOpenAdvisorFor = (assessment: MASRequirementAssessmentRecord) => {
    setAdvisorTargetAssessment(assessment);
    setIsAdvisorOpen(true);
  };

  const handleApplyAdvisorEvidence = (reqCode: string, evidenceItems: RAGEvidenceAlignmentItem[]) => {
    const target = masAssessments.find(a => a.requirementCode === reqCode) || advisorTargetAssessment || editingAssessment;
    if (!target) return;

    const evidenceSummary = evidenceItems.map(e => `[${e.category}] ${e.evidenceTitle} (Dept: ${e.department}) - Verification: ${e.auditVerificationMethod}`).join('\n');
    
    if (editingAssessment && editingAssessment.requirementCode === reqCode) {
      setEditingAssessment(prev => prev ? {
        ...prev,
        sampleTestResults: prev.sampleTestResults ? `${prev.sampleTestResults}\n\n${evidenceSummary}` : evidenceSummary,
        designEffectiveness: 'EFFECTIVE',
        operatingEffectiveness: 'EFFECTIVE'
      } : null);
    }

    updateMASAssessment(target.id, {
      sampleTestResults: target.sampleTestResults ? `${target.sampleTestResults}\n\n${evidenceSummary}` : evidenceSummary,
      designEffectiveness: 'EFFECTIVE',
      operatingEffectiveness: 'EFFECTIVE'
    });

    setNotification(`Adopted ${evidenceItems.length} RAG evidence specifications into ${reqCode}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAdoptAdvisorNarrative = (reqCode: string, narrativeText: string) => {
    const target = masAssessments.find(a => a.requirementCode === reqCode) || advisorTargetAssessment || editingAssessment;
    if (!target) return;

    if (editingAssessment && editingAssessment.requirementCode === reqCode) {
      setEditingAssessment(prev => prev ? {
        ...prev,
        currentStateSummary: narrativeText,
        complianceStatus: prev.complianceStatus === 'NON_COMPLIANT' ? 'PARTIALLY_COMPLIANT' : prev.complianceStatus
      } : null);
    }

    updateMASAssessment(target.id, {
      currentStateSummary: narrativeText
    });

    setNotification(`Adopted RAG compliance explanation into ${reqCode}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateCapaFromAdvisor = (findingData: {
    title: string;
    description: string;
    category: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    masRequirementCode: string;
    remediationPlan: string;
  }) => {
    addFinding({
      title: findingData.title,
      description: findingData.description,
      severity: 'Major Non-Conformity',
      status: 'Open',
      clauseOrControl: findingData.masRequirementCode,
      department: 'Technology Risk & Infrastructure',
      source: 'EXTERNAL_AUDIT',
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          `Identified control deficiency against MAS TRM ${findingData.masRequirementCode}`,
          'Operational testing revealed missing evidence alignment and procedural exceptions',
          'Automated validation was not embedded into continuous telemetry',
          'Exception was flagged during regulatory intelligence evaluation',
          'Root cause: Modernized controls required to meet revised MAS TRM standards'
        ],
        rootCauseStatement: `Control deficiency under ${findingData.masRequirementCode} requiring formal remediation.`
      },
      capaPlan: {
        correctiveAction: `Implement recommended compensating measures: ${findingData.remediationPlan}`,
        preventiveAction: 'Incorporate automated control verification into CI/CD and identity governance.',
        owner: 'Chief Information Security Officer',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evidenceRequired: 'Signed implementation report, testing logs, and updated policy document.'
      }
    });

    setNotification(`Created CAPA finding from AI Advisor for ${findingData.masRequirementCode}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenQuickFixFor = (assessment: MASRequirementAssessmentRecord) => {
    setQuickFixTargetAssessment(assessment);
    if (assessment.domainNumber) {
      setSelectedDomain(assessment.domainNumber);
    }
    setIsQuickFixOpen(true);
  };

  const handleApplyRemediation = (remediationText: string, policyCode: string) => {
    if (editingAssessment) {
      setEditingAssessment(prev => prev ? {
        ...prev,
        currentStateSummary: remediationText,
        identifiedGaps: '',
        complianceStatus: 'COMPLIANT',
        designEffectiveness: 'EFFECTIVE',
        operatingEffectiveness: 'EFFECTIVE',
        maturityLevel: Math.max(prev.maturityLevel, 3) as any
      } : null);
      setNotification(`Applied ${policyCode} policy language to active evaluation form.`);
      setTimeout(() => setNotification(null), 3500);
    } else if (quickFixTargetAssessment) {
      updateMASAssessment(quickFixTargetAssessment.id, {
        currentStateSummary: remediationText,
        identifiedGaps: '',
        complianceStatus: 'COMPLIANT',
        designEffectiveness: 'EFFECTIVE',
        operatingEffectiveness: 'EFFECTIVE',
        maturityLevel: Math.max(quickFixTargetAssessment.maturityLevel, 3) as any
      });
      setNotification(`Remediated ${quickFixTargetAssessment.requirementCode} via ${policyCode}`);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleCreateCapaWithPolicy = (policyData: any) => {
    const target = quickFixTargetAssessment || editingAssessment || (filteredAssessments.length > 0 ? filteredAssessments[0] : null);
    if (!target) return;

    addFinding({
      title: `Remediation Implementation: ${policyData.title} (${policyData.docCode})`,
      description: `Adopt and operationalize policy controls for MAS TRM ${target.requirementCode} (${target.domainName}). Statutory reference: ${policyData.statutoryReference}.`,
      severity: 'Major Non-Conformity',
      status: 'CAPA Submitted',
      clauseOrControl: target.requirementCode,
      department: 'Technology Risk & Infrastructure',
      source: 'EXTERNAL_AUDIT',
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          `Absence of standardized bank-grade policy for MAS Domain ${target.domainNumber}`,
          'Engineering teams implemented fragmented ad-hoc procedures without formal documentation',
          'Audit identified missing board approvals and technical verification benchmarks',
          'Systematic enforcement was not configured in CI/CD or identity infrastructure',
          `Root Cause: Policy framework required modernization to meet MAS TRM 2026 standards for ${target.domainName}`
        ],
        rootCauseStatement: `Policy framework required modernization to meet MAS TRM 2026 standards for ${target.domainName}.`
      },
      capaPlan: {
        correctiveAction: `Formally adopt ${policyData.docCode} and operationalize technical mandates across designated critical systems.`,
        preventiveAction: `Incorporate ${policyData.docCode} into annual staff acknowledgment workflow and schedule bi-annual audit verification.`,
        owner: policyData.owner || target.controlOwner || 'Chief Information Security Officer',
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evidenceRequired: `Approved ${policyData.docCode} document, signed board minutes, and audit verification report for: ${(policyData.auditEvidenceRequired || []).join('; ')}`
      }
    });

    setNotification(`Created CAPA remediation finding linked to policy ${policyData.docCode}`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter assessments
  const filteredAssessments = masAssessments.filter(a => {
    const isStatutory = isStatutoryNoticeRequirement(a.requirementCode, a.requirementTitle);
    if ((statutoryNoticeOnly || statusFilter === 'STATUTORY_MANDATE') && !isStatutory) return false;
    if (selectedDomain !== 'ALL' && a.domainNumber !== selectedDomain) return false;
    if (statusFilter !== 'ALL' && statusFilter !== 'STATUTORY_MANDATE' && a.complianceStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.requirementCode.toLowerCase().includes(q) ||
        a.requirementTitle.toLowerCase().includes(q) ||
        a.domainName.toLowerCase().includes(q) ||
        (a.currentStateSummary && a.currentStateSummary.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const compliantCount = masAssessments.filter(a => a.complianceStatus === 'COMPLIANT').length;
  const partialCount = masAssessments.filter(a => a.complianceStatus === 'PARTIALLY_COMPLIANT').length;
  const nonCompliantCount = masAssessments.filter(a => a.complianceStatus === 'NON_COMPLIANT').length;
  const totalCount = masAssessments.length;
  const statutoryStats = getStatutoryNoticeStats(masAssessments);

  const handleSaveAssessment = () => {
    if (!editingAssessment) return;
    updateMASAssessment(editingAssessment.id, editingAssessment);
    setNotification(`Successfully saved assessment for ${editingAssessment.requirementCode}`);
    setTimeout(() => setNotification(null), 3000);
    setEditingAssessment(null);
  };

  const handleCreateCapaFinding = (assessment: MASRequirementAssessmentRecord) => {
    addFinding({
      title: `MAS TRM Gap: ${assessment.requirementTitle}`,
      description: `Identified compliance gap in MAS requirement ${assessment.requirementCode} (${assessment.domainName}): ${assessment.identifiedGaps || 'Control deficiency in operating effectiveness.'}`,
      severity: 'Major Non-Conformity',
      status: 'Open',
      clauseOrControl: assessment.requirementCode,
      department: 'Technology Risk & Infrastructure',
      source: 'EXTERNAL_AUDIT',
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          'Control verification process was not systematically executed in Q2.',
          'Automated CI/CD security rule lacked blocking gate for specific legacy microservices.',
          'Legacy microservices relied on manual review schedules.',
          'Resource constraints delayed scheduled vendor security audits.',
          'Root cause: Lack of centralized policy enforcement engine for multi-cloud repositories.'
        ],
        rootCauseStatement: 'Lack of centralized policy enforcement engine across cloud infrastructure.'
      },
      capaPlan: {
        correctiveAction: 'Deploy centralized policy enforcement gate and remediate sub-contractor attestations.',
        preventiveAction: 'Mandate automated weekly compliance scans with zero-exception tolerance for critical endpoints.',
        owner: assessment.controlOwner || 'CISO',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evidenceRequired: 'Signed policy enforcement deployment logs and verified vulnerability scan report.'
      }
    });

    setNotification(`Created 5-Whys CAPA finding for ${assessment.requirementCode}`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <PageContainer id="mas-trm-workbench-module">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                MAS TRM Assessment Workbench
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Design & Operating Effectiveness Evaluation
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Control Testing, Maturity & Gap Remediation
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Conduct rigorous testing procedures across all 15 MAS TRM domains, evaluate CMMI maturity levels (1 to 5), attach cryptographic evidence tokens, and auto-dispatch corrective actions (CAPA) with 5-Whys root-cause analysis.
            </p>
          </div>

          {/* Quick Metrics & Quick Fix Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <div className="px-3 py-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-center min-w-[85px]">
                <span className="text-[10px] text-emerald-400 block uppercase font-bold">Compliant</span>
                <span className="text-lg font-bold text-emerald-300">{compliantCount}</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-amber-950/50 border border-amber-800/60 text-center min-w-[85px]">
                <span className="text-[10px] text-amber-400 block uppercase font-bold">Partial</span>
                <span className="text-lg font-bold text-amber-300">{partialCount}</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-800/60 text-center min-w-[85px]">
                <span className="text-[10px] text-rose-400 block uppercase font-bold">Non-Compliant</span>
                <span className="text-lg font-bold text-rose-300">{nonCompliantCount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setAdvisorTargetAssessment(editingAssessment || (filteredAssessments.length > 0 ? filteredAssessments[0] : null));
                setIsAdvisorOpen(prev => !prev);
              }}
              className={`px-3.5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
                isAdvisorOpen
                  ? 'bg-rose-500 text-white shadow-rose-900/60 ring-2 ring-rose-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-slate-950'
              }`}
              title="Consult MAS Regulatory AI Advisor with RAG compliance guidance & evidence alignment"
            >
              <Bot className="w-4 h-4 text-rose-400" />
              <span>{isAdvisorOpen ? 'Close AI Advisor' : 'Regulatory AI Advisor'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-rose-300 text-[10px] font-mono border border-slate-750">
                RAG
              </span>
            </button>

            <button
              onClick={() => {
                setQuickFixTargetAssessment(null);
                setIsQuickFixOpen(prev => !prev);
              }}
              className={`px-3.5 py-2.5 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
                isQuickFixOpen
                  ? 'bg-rose-500 text-white shadow-rose-900/60 ring-2 ring-rose-400/50'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-950'
              }`}
              title="Open AI Recommended Policy Templates for MAS Domains"
            >
              <Sparkles className="w-4 h-4 text-rose-200" />
              <span>{isQuickFixOpen ? 'Close Policy Sidebar' : 'Quick Fix Policies'}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-200 text-[10px] font-mono">
                {selectedDomain === 'ALL' ? '15 Domains' : `D${selectedDomain}`}
              </span>
            </button>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, or gaps..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All 15 TRM Domains</option>
              {masDomains.map(d => (
                <option key={d.domainNumber} value={d.domainNumber}>
                  {d.domainNumber} {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="STATUTORY_MANDATE">Statutory Notice Mandate (6 Non-Negotiable)</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-slate-400">
              Showing <strong className="text-white">{filteredAssessments.length}</strong> of {totalCount} requirements
            </span>
          </div>
        </div>

        {/* Statutory Notice Gatekeeper & Alert Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-850">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[11px] border border-rose-500/40 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Statutory Gatekeeper (MAS Notice 644/655)
            </span>
            <span className="text-xs text-slate-300">
              6 Statutory Pillars: <strong className="text-emerald-400">{statutoryStats.compliantCount} Compliant</strong>,{' '}
              <strong className={statutoryStats.severeViolations > 0 ? 'text-rose-400' : 'text-slate-400'}>
                {statutoryStats.severeViolations} Severe Violations
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatutoryNoticeOnly(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                statutoryNoticeOnly
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950 ring-2 ring-rose-500/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>{statutoryNoticeOnly ? 'Statutory Notice Mandate (Showing 6)' : 'Statutory Notice Mandate'}</span>
            </button>

            <button
              onClick={() => setIsIncidentToolOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 transition-all cursor-pointer flex items-center gap-1.5"
              title="Launch 1-Hour Rapid Incident Notification & 14-Day PIR Tool"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>1h Incident Dispatcher</span>
            </button>

            <button
              onClick={() => setIsCISLedgerOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/60 transition-all cursor-pointer flex items-center gap-1.5"
              title="Open Critical Information Systems 4h Downtime & DR Drill Ledger"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              <span>CIS Downtime & DR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Assessments Grid / Table */}
      <div className="space-y-3">
        {filteredAssessments.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No assessment records match the specified filters.
          </div>
        ) : (
          filteredAssessments.map((item) => {
            const reqMeta = masRequirements.find(r => r.requirementCode === item.requirementCode);
            const isNoticeReq = isStatutoryNoticeRequirement(item.requirementCode, item.requirementTitle);
            const noticePillar = getStatutoryNoticePillar(item.requirementCode);
            const isSevereViolation = isSevereStatutoryViolation(item.complianceStatus, item.requirementCode);

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-xl p-5 space-y-4 transition-all ${
                  isSevereViolation
                    ? 'border-rose-600/70 shadow-lg shadow-rose-950/40 bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-950 text-rose-400 font-mono text-xs font-bold rounded border border-slate-800">
                        {item.requirementCode}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-medium rounded">
                        Domain {item.domainNumber}: {item.domainName}
                      </span>
                      {reqMeta?.criticalSystemsMandate && (
                        <span className="px-2 py-0.5 bg-rose-950/60 text-rose-300 text-[10px] font-semibold rounded border border-rose-800/60 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-400" />
                          Critical Systems Mandate
                        </span>
                      )}
                      {isNoticeReq && (
                        <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded border border-rose-500/40 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3 text-rose-400" />
                          Statutory Mandate: {noticePillar?.shortCode || 'Notice 644/655'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {item.requirementTitle}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.currentStateSummary || 'No current state narrative recorded yet.'}
                    </p>

                    {/* Severe Statutory Violation Alert */}
                    {isSevereViolation && (
                      <div className="p-3 bg-red-950/60 border border-red-500/70 rounded-lg text-xs text-red-200 flex items-start gap-2.5 mt-2 shadow-md">
                        <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="font-bold text-red-300 uppercase tracking-wide">
                              ⚠️ Severe Statutory Notice Violation (Supervisory Sanction Risk)
                            </strong>
                            <span className="text-[10px] bg-red-500/30 px-2 py-0.5 rounded font-mono text-red-200 border border-red-500/40">
                              {noticePillar?.legalBasis}
                            </span>
                          </div>
                          <p className="text-red-200/90 text-[11px] leading-relaxed">
                            {noticePillar?.penaltiesForBreach}
                          </p>
                          <div className="text-[10px] text-red-300 font-semibold pt-0.5">
                            Mandatory Benchmark: {noticePillar?.mandatoryThreshold}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.identifiedGaps && item.complianceStatus !== 'COMPLIANT' && !isSevereViolation && (
                      <div className="p-2.5 bg-amber-950/30 border border-amber-900/50 rounded-lg text-xs text-amber-300 flex items-start gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block">Identified Regulatory Gap:</strong>
                          <span>{item.identifiedGaps}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badges & Action Buttons */}
                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {isSevereViolation && (
                        <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-950/60 ring-1 ring-red-400/50">
                          <AlertOctagon className="w-3.5 h-3.5 text-white animate-pulse" />
                          Severe Statutory Violation
                        </span>
                      )}
                      {isNoticeReq && !isSevereViolation && (
                        <span className="px-2 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-700/60 text-xs font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                          Statutory Mandate Compliant
                        </span>
                      )}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        item.complianceStatus === 'COMPLIANT'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : item.complianceStatus === 'PARTIALLY_COMPLIANT'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      }`}>
                        {item.complianceStatus}
                      </span>
                      <span className="px-2 py-1 bg-slate-950 text-slate-300 text-xs font-mono font-semibold rounded border border-slate-800">
                        CMMI Level {item.maturityLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 flex-wrap justify-end">
                      <button
                        onClick={() => handleOpenAdvisorFor(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        title="Open MAS Regulatory AI Advisor (RAG Grounding)"
                      >
                        <Bot className="w-3.5 h-3.5 text-rose-400" />
                        AI Advisor
                      </button>

                      <button
                        onClick={() => handleOpenQuickFixFor(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border border-rose-800/70 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="AI Recommended Policy & Quick Fix for this requirement"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        Quick Fix
                      </button>

                      <button
                        onClick={() => {
                          setEditingAssessment({ ...item });
                          setActiveEditTab('assessment');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        Evaluate & Edit
                      </button>

                      {item.complianceStatus !== 'COMPLIANT' && (
                        <button
                          onClick={() => handleCreateCapaFinding(item)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Issue CAPA
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Evaluation Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Design Effectiveness</span>
                    <span className="font-semibold text-slate-200">{item.designEffectiveness || 'EFFECTIVE'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Operating Effectiveness</span>
                    <span className="font-semibold text-slate-200">{item.operatingEffectiveness || 'EFFECTIVE'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tested Samples (Failures)</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {item.testedSamplesCount} tested ({item.testedSamplesFailedCount || 0} failed)
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Control Owner</span>
                    <span className="font-semibold text-slate-200">{item.controlOwner}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editing Evaluation Modal */}
      {editingAssessment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 font-mono text-xs font-bold rounded border border-rose-800/60">
                    {editingAssessment.requirementCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    Domain {editingAssessment.domainNumber}: {editingAssessment.domainName}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  {editingAssessment.requirementTitle}
                </h2>
              </div>

              <button
                onClick={() => setEditingAssessment(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Compliance Status
                  </label>
                  <select
                    value={editingAssessment.complianceStatus}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, complianceStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="COMPLIANT">COMPLIANT</option>
                    <option value="PARTIALLY_COMPLIANT">PARTIALLY_COMPLIANT</option>
                    <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                    <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    CMMI Maturity Level (1 - 5)
                  </label>
                  <select
                    value={editingAssessment.maturityLevel}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, maturityLevel: Number(e.target.value) as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 font-mono"
                  >
                    <option value="1">Level 1 - Initial / Ad-hoc</option>
                    <option value="2">Level 2 - Managed / Repeatable</option>
                    <option value="3">Level 3 - Defined / Standardized</option>
                    <option value="4">Level 4 - Quantitatively Managed</option>
                    <option value="5">Level 5 - Continuously Optimizing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Control Owner
                  </label>
                  <input
                    type="text"
                    value={editingAssessment.controlOwner}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, controlOwner: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Design Effectiveness Evaluation
                  </label>
                  <select
                    value={editingAssessment.designEffectiveness}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, designEffectiveness: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="EFFECTIVE">EFFECTIVE - Control fully meets MAS criteria</option>
                    <option value="LARGELY_EFFECTIVE">LARGELY_EFFECTIVE - Minor procedural gaps</option>
                    <option value="PARTIALLY_EFFECTIVE">PARTIALLY_EFFECTIVE - Design deficiencies present</option>
                    <option value="DEFICIENT">DEFICIENT - Control design inadequate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Operating Effectiveness Evaluation
                  </label>
                  <select
                    value={editingAssessment.operatingEffectiveness}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, operatingEffectiveness: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="EFFECTIVE">EFFECTIVE - Operates consistently without failure</option>
                    <option value="LARGELY_EFFECTIVE">LARGELY_EFFECTIVE - Operating with isolated exceptions</option>
                    <option value="PARTIALLY_EFFECTIVE">PARTIALLY_EFFECTIVE - Frequent operating exceptions</option>
                    <option value="DEFICIENT">DEFICIENT - Control not operating</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Current State Implementation Narrative *
                  </label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenAdvisorFor(editingAssessment)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Consult RAG Advisor for compliance rationale & evidence requirements"
                    >
                      <Bot className="w-3.5 h-3.5 text-rose-400" />
                      <span>Consult AI Advisor</span>
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickFixTargetAssessment(editingAssessment);
                        setIsQuickFixOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Quick Fix Policy</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={editingAssessment.currentStateSummary}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment, currentStateSummary: e.target.value })}
                  placeholder="Describe operational controls, technical tools, and processes currently in place..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Identified Gaps & Audit Exceptions (if applicable)
                </label>
                <textarea
                  rows={2}
                  value={editingAssessment.identifiedGaps}
                  onChange={(e) => setEditingAssessment({ ...editingAssessment, identifiedGaps: e.target.value })}
                  placeholder="Note any gaps, missing policies, expired certificates, or vendor exceptions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tested Sample Count</label>
                  <input
                    type="number"
                    value={editingAssessment.testedSamplesCount}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, testedSamplesCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Failed Sample Count</label>
                  <input
                    type="number"
                    value={editingAssessment.testedSamplesFailedCount || 0}
                    onChange={(e) => setEditingAssessment({ ...editingAssessment, testedSamplesFailedCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingAssessment(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAssessment}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Test Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Edge Triggers */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        {!isAdvisorOpen && (
          <button
            onClick={() => {
              setAdvisorTargetAssessment(editingAssessment || (filteredAssessments.length > 0 ? filteredAssessments[0] : null));
              setIsAdvisorOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-rose-300 shadow-2xl py-3 px-2 rounded-l-xl flex flex-col items-center gap-2 border-y border-l border-rose-500/40 cursor-pointer group transition-transform hover:-translate-x-1"
            title="Open MAS Regulatory AI Advisor"
          >
            <Bot className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold tracking-wider uppercase text-slate-200">
              AI Advisor
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </button>
        )}

        {!isQuickFixOpen && (
          <button
            onClick={() => {
              setQuickFixTargetAssessment(null);
              setIsQuickFixOpen(true);
            }}
            className="bg-gradient-to-l from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-2xl py-3 px-2 rounded-l-xl flex flex-col items-center gap-2 border-y border-l border-rose-400/40 cursor-pointer group transition-transform hover:-translate-x-1"
            title="Open AI Quick Fix Policy Sidebar"
          >
            <Sparkles className="w-4 h-4 text-rose-200 animate-pulse" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold tracking-wider uppercase">
              Quick Fix
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </button>
        )}
      </div>

      {/* MAS Regulatory AI Advisor Panel */}
      <MASRegulatoryAIAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        activeAssessment={advisorTargetAssessment || editingAssessment}
        onSelectRequirement={(reqCode) => {
          const matched = masAssessments.find(a => a.requirementCode === reqCode);
          if (matched) setAdvisorTargetAssessment(matched);
        }}
        onApplyEvidenceAlignment={handleApplyAdvisorEvidence}
        onAdoptComplianceNarrative={handleAdoptAdvisorNarrative}
        onCreateCapaFromAdvisor={handleCreateCapaFromAdvisor}
      />

      {/* Quick Fix Policy Templates Sidebar */}
      <MASQuickFixPolicySidebar
        isOpen={isQuickFixOpen}
        onClose={() => setIsQuickFixOpen(false)}
        selectedDomainNumber={selectedDomain}
        onSelectDomainNumber={(domainNum) => setSelectedDomain(domainNum)}
        activeAssessment={quickFixTargetAssessment || editingAssessment}
        onApplyRemediationToAssessment={handleApplyRemediation}
        onCreateCapaWithPolicy={handleCreateCapaWithPolicy}
      />

      {/* 1-Hour Rapid Incident Response Modal */}
      {isIncidentToolOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsIncidentToolOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <MASIncidentResponseWorkbench isModal={true} onClose={() => setIsIncidentToolOpen(false)} />
          </div>
        </div>
      )}

      {/* CIS Downtime & DR Ledger Modal */}
      {isCISLedgerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsCISLedgerOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <MASCISDowntimeLedger onClose={() => setIsCISLedgerOpen(false)} />
          </div>
        </div>
      )}
    </PageContainer>
  );
};
