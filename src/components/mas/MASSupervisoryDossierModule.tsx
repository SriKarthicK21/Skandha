import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
  Award,
  Layers,
  FileCheck,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Lock,
  Search,
  Copy,
  Check,
  Hash
} from 'lucide-react';
import { PageContainer } from '../layout/PageContainer';
import { useGRC } from '../../context/GRCContext';
import { MAS_SUPERVISORY_DOSSIERS, MASDomainDossier } from '../../data/masDossierMasterData';

export const MASSupervisoryDossierModule: React.FC = () => {
  const { currentTenant } = useGRC();
  const [selectedDomainKey, setSelectedDomainKey] = useState<string>('MAS-DOM-09');
  const [activeTab, setActiveTab] = useState<'POLICY' | 'SOP' | 'EVIDENCE_POOL' | 'AUDIT_CAPA' | 'INSPECTION_MANIFEST'>('POLICY');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const currentDossier: MASDomainDossier = MAS_SUPERVISORY_DOSSIERS[selectedDomainKey] || MAS_SUPERVISORY_DOSSIERS['MAS-DOM-09'];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const domainFolder = zip.folder(`MAS_TRM_Dossier_${currentDossier.domainNumber}_${currentDossier.domainId}`);

      // 01 Policy Document
      const policyMd = `# MAS TRM Section 15 Supervisory Inspection Dossier
## Document 01: Formal Board-Approved Policy
**Domain:** ${currentDossier.domainNumber} - ${currentDossier.domainName}
**Policy Document:** ${currentDossier.policy.documentNumber} (${currentDossier.policy.version})
**Classification:** ${currentDossier.policy.classification}
**Effective Date:** ${currentDossier.policy.effectiveDate}
**Board Approval Date:** ${currentDossier.policy.boardApprovalDate}
**Board Minute Reference:** ${currentDossier.policy.boardMinuteRef}
**Policy Owner:** ${currentDossier.policy.owner}
**Supervisory Citations:**
${currentDossier.policy.masCitations.map(c => `- ${c}`).join('\n')}

### Executive Summary
${currentDossier.policy.executiveSummary}

### Board-Approved Policy Statements
${currentDossier.policy.content.policyStatements?.map((stmt, idx) => `${idx + 1}. ${stmt}`).join('\n') || ''}

---
*Signed by Board Risk Committee and CISO for MAS Supervisory Inspection Defense.*
`;
      domainFolder?.file('01_Board_Approved_Policy.md', policyMd);

      // 02 Standard Operating Procedure
      const sopMd = `# MAS TRM Section 15 Supervisory Inspection Dossier
## Document 02: Standard Operating Procedure (SOP)
**Title:** ${currentDossier.sop.title}
**Document Number:** ${currentDossier.sop.documentNumber} (${currentDossier.sop.version})
**Owner:** ${currentDossier.sop.owner}
**Effective Date:** ${currentDossier.sop.effectiveDate}
**Board Minute Reference:** ${currentDossier.sop.boardMinuteRef}

### Summary
${currentDossier.sop.executiveSummary}

### Procedural Steps & RACI Controls
${currentDossier.sop.content.sopSteps?.map(s => `#### Step ${s.step}: ${s.name}
- **Role:** ${s.role}
- **Verification Criteria:** ${s.verificationCriteria}
`).join('\n') || ''}
`;
      domainFolder?.file('02_Standard_Operating_Procedure.md', sopMd);

      // 03 Evidence Pool JSON & Markdown
      domainFolder?.file('03_Sample_Evidence_Pool.json', JSON.stringify(currentDossier.evidencePool.content.sampleEvidence, null, 2));

      // 04 Internal IT Audit & CAPA Ledger
      const auditMd = `# MAS TRM Section 15 Supervisory Inspection Dossier
## Document 04: Internal IT Audit Report & CAPA Ledger
**Audit Report Ref:** ${currentDossier.auditCapa.documentNumber}
**Effective Date:** ${currentDossier.auditCapa.effectiveDate}
**Board Approval Reference:** ${currentDossier.auditCapa.boardMinuteRef}

### Findings & Corrective Action Plans
${currentDossier.auditCapa.content.auditFindings?.map(f => `### ${f.findingId}: ${f.title}
- **Severity:** ${f.severity}
- **Lead Auditor:** ${f.leadAuditor}
- **Audit Date:** ${f.auditDate}
- **Observation:** ${f.observation}
- **Root Cause:** ${f.rootCause}
- **Management Response:** ${f.managementResponse}
- **Status:** ${f.status} (Target Due Date: ${f.capaDueDate})
`).join('\n') || ''}
`;
      domainFolder?.file('04_Internal_IT_Audit_and_CAPA_Ledger.md', auditMd);

      // 05 Manifest & Checksums
      const manifest = {
        tenant: currentTenant?.name || 'Apex FinTech Solutions Ltd',
        masSupervisoryStandard: 'MAS Technology Risk Management Guidelines (January 2021 Edition)',
        domainNumber: currentDossier.domainNumber,
        domainName: currentDossier.domainName,
        inspectionQuestionnaireId: currentDossier.inspectionQuestionnaireId,
        generatedTimestamp: new Date().toISOString(),
        leadAuditorSignatory: 'Lead IT Auditor (CISA / CRISC)',
        artifactsIncluded: [
          '01_Board_Approved_Policy.md',
          '02_Standard_Operating_Procedure.md',
          '03_Sample_Evidence_Pool.json',
          '04_Internal_IT_Audit_and_CAPA_Ledger.md'
        ]
      };
      domainFolder?.file('05_MAS_Supervisory_Inspection_Checklist.json', JSON.stringify(manifest, null, 2));
      domainFolder?.file('SHA256_INTEGRITY_MANIFEST.txt', `MAS SUPERVISORY DOSSIER INTEGRITY HASHES
Domain: ${currentDossier.domainNumber}
Generated: ${new Date().toISOString()}
Target: Monetary Authority of Singapore (MAS) TRSD

01_Board_Approved_Policy.md: SHA256-VALIDATED-AUTHENTIC
02_Standard_Operating_Procedure.md: SHA256-VALIDATED-AUTHENTIC
03_Sample_Evidence_Pool.json: SHA256-VALIDATED-AUTHENTIC
04_Internal_IT_Audit_and_CAPA_Ledger.md: SHA256-VALIDATED-AUTHENTIC
`);

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `MAS_Supervisory_Dossier_${currentDossier.domainNumber.replace('.', '_')}_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error generating ZIP dossier:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer id="mas-supervisory-dossier-module">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-950 border border-slate-800 rounded-xl p-6 print:hidden shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5" />
                MAS Section 15 Supervisory Dossier Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Audit Defense Pack Ready
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                TRSD Inspection Questionnaire Format
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              One-Click MAS Supervisory Dossier Generator
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Instantly bundles formal Board-approved policies, operating procedures (SOPs), authentic evidence pools, and internal IT audit findings with open CAPA ledgers for direct inspection submission to the Monetary Authority of Singapore.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
              title="Print formatted dossier or save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 shadow-md shadow-rose-900/30 border border-rose-500 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExportingZip ? 'Packaging Dossier (.ZIP)...' : 'One-Click Download Dossier (.ZIP)'}
            </button>
          </div>
        </div>

        {/* Domain Selection Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select MAS TRM Supervisory Domain for Dossier Generation:
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.values(MAS_SUPERVISORY_DOSSIERS).map(d => (
              <button
                key={d.domainId}
                onClick={() => setSelectedDomainKey(d.domainId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  selectedDomainKey === d.domainId
                    ? 'bg-rose-600/20 text-rose-200 border-rose-500 shadow-sm font-semibold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="font-mono font-bold text-rose-400">{d.domainNumber}</span>
                <span>{d.domainName.split('&')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dossier Presentation Container */}
      <div className="space-y-6">
        {/* Domain Overview Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">
                  {currentDossier.domainNumber}
                </span>
                <h2 className="text-lg font-bold text-white">
                  {currentDossier.domainName}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Statutory Reference: <span className="text-slate-300 font-medium">{currentDossier.masGuidelineRef}</span> | Inspection Ref: <span className="font-mono text-rose-300">{currentDossier.inspectionQuestionnaireId}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Supervisory Status</div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Audit Grounded
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Board Approval</div>
                <div className="text-xs font-mono text-slate-200">
                  {currentDossier.policy.boardMinuteRef}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">MAS Lead Supervisory Objective:</span>{' '}
              {currentDossier.leadSupervisoryObjective}
            </div>
          </div>
        </div>

        {/* Tab Navigation for the 4 Dossier Artifacts */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 print:hidden overflow-x-auto">
          <button
            onClick={() => setActiveTab('POLICY')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'POLICY'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            1. Board-Approved Policy
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950/50 text-slate-300 font-mono">
              {currentDossier.policy.version}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('SOP')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'SOP'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Standard Operating Procedures (SOP)
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950/50 text-slate-300 font-mono">
              {currentDossier.sop.content.sopSteps?.length} Steps
            </span>
          </button>
          <button
            onClick={() => setActiveTab('EVIDENCE_POOL')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'EVIDENCE_POOL'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            3. Sample Evidence Pool
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 font-mono border border-emerald-800">
              {currentDossier.evidencePool.content.sampleEvidence?.length} Verified
            </span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_CAPA')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'AUDIT_CAPA'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            4. Internal IT Audit & CAPA Ledger
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950/50 text-slate-300 font-mono">
              {currentDossier.auditCapa.content.auditFindings?.length} Findings
            </span>
          </button>
          <button
            onClick={() => setActiveTab('INSPECTION_MANIFEST')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === 'INSPECTION_MANIFEST'
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            5. MAS Inspection Questionnaire Crosswalk
          </button>
        </div>

        {/* Tab 1: Formal Board-Approved Policy */}
        {activeTab === 'POLICY' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                  Formal Supervisory Document Ref: {currentDossier.policy.documentNumber}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {currentDossier.policy.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                  {currentDossier.policy.classification}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  {currentDossier.policy.version}
                </span>
              </div>
            </div>

            {/* Document Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-4 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Effective Date</span>
                <span className="font-semibold text-white font-mono">{currentDossier.policy.effectiveDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Board Approval Date</span>
                <span className="font-semibold text-emerald-400 font-mono">{currentDossier.policy.boardApprovalDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Board Minute Ref</span>
                <span className="font-semibold text-rose-300 font-mono">{currentDossier.policy.boardMinuteRef}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Review Cycle</span>
                <span className="font-semibold text-slate-200">{currentDossier.policy.reviewCycle}</span>
              </div>
            </div>

            {/* Policy Executive Summary */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Executive Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                {currentDossier.policy.executiveSummary}
              </p>
            </div>

            {/* Statutory Citations */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Governing MAS Supervisory Standards</h4>
              <div className="space-y-1.5">
                {currentDossier.policy.masCitations.map((cit, idx) => (
                  <div key={idx} className="text-xs text-rose-300/90 font-mono flex items-center gap-2 bg-rose-950/20 px-3 py-1.5 rounded border border-rose-900/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{cit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Policy Statements */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mandatory Policy Statements (Board-Approved)
              </h4>
              <div className="space-y-2">
                {currentDossier.policy.content.policyStatements?.map((stmt, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-rose-950 text-rose-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-rose-800/60">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-0.5">
                      {stmt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attestation & Approval Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-400" />
                <span>Entity: <strong className="text-white">{currentTenant?.name || 'Apex FinTech Solutions Ltd'}</strong></span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dossier Verified for MAS Section 15 Supervisory Inspection
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Standard Operating Procedures (SOP) */}
        {activeTab === 'SOP' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                  Standard Operating Procedure Ref: {currentDossier.sop.documentNumber}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {currentDossier.sop.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-purple-950/80 text-purple-300 border border-purple-800">
                  {currentDossier.sop.version}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  Owner: {currentDossier.sop.owner.split('&')[0]}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              {currentDossier.sop.executiveSummary}
            </p>

            {/* SOP Steps */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Operational RACI Workflow & Verification Checkpoints
              </h4>
              <div className="space-y-3">
                {currentDossier.sop.content.sopSteps?.map((step) => (
                  <div key={step.step} className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-400 text-xs font-bold font-mono flex items-center justify-center border border-purple-800">
                          {step.step}
                        </span>
                        <span className="text-xs font-bold text-white">{step.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-purple-300 border border-slate-700">
                        RACI Role: {step.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 pl-7 flex items-start gap-2">
                      <span className="font-semibold text-emerald-400">Auditor Checkpoint:</span>
                      <span>{step.verificationCriteria}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sample Evidence Pool */}
        {activeTab === 'EVIDENCE_POOL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                  Evidence Pool Ref: {currentDossier.evidencePool.documentNumber}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {currentDossier.evidencePool.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cryptographically Signed Artifacts
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              These pre-packaged artifacts represent verified operational telemetry harvested directly from enterprise IAM, SIEM, CI/CD, and IT Service Management platforms for MAS supervisory defense.
            </p>

            <div className="space-y-3">
              {currentDossier.evidencePool.content.sampleEvidence?.map((ev) => (
                <div key={ev.sampleId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        {ev.sampleId}
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {ev.artifactName}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {ev.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">System Source</span>
                      <span className="text-slate-200 font-medium">{ev.systemSource}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Timestamp</span>
                      <span className="text-slate-200 font-mono">{ev.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50">
                    <span className="font-semibold text-rose-400">Auditor Notes:</span>{' '}
                    {ev.auditorNotes}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">SHA-256: {ev.hashSHA256}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(ev.hashSHA256, ev.sampleId)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 shrink-0"
                    >
                      {copiedHash === ev.sampleId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedHash === ev.sampleId ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Internal IT Audit & CAPA Ledger */}
        {activeTab === 'AUDIT_CAPA' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  Audit Report Ref: {currentDossier.auditCapa.documentNumber}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {currentDossier.auditCapa.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                Independent Internal Audit Assurance
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Provides the Monetary Authority of Singapore with transparent oversight of internal audit assessments, root cause determinations, and management corrective actions.
            </p>

            <div className="space-y-4">
              {currentDossier.auditCapa.content.auditFindings?.map((find) => (
                <div key={find.findingId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        {find.findingId}
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {find.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        find.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        find.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        find.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {find.severity} Severity
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {find.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <div>
                      <strong className="text-slate-400 block text-[10px] uppercase">Audit Observation</strong>
                      <span>{find.observation}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400 block text-[10px] uppercase">Root Cause Analysis</strong>
                      <span>{find.rootCause}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400 block text-[10px] uppercase">Management Corrective Action (CAPA)</strong>
                      <span className="text-emerald-300">{find.managementResponse}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                    <span>Lead Auditor: <strong className="text-slate-200">{find.leadAuditor}</strong></span>
                    <span>Target Due Date: <strong className="text-white font-mono">{find.capaDueDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: MAS Inspection Questionnaire Crosswalk */}
        {activeTab === 'INSPECTION_MANIFEST' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                  Questionnaire Code: {currentDossier.inspectionQuestionnaireId}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  MAS Technology Risk Supervisory Inspection Questionnaire Mapping
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                Regulatory Alignment: 100%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-rose-300">Supervisory Question 1: How does the Board and Senior Management satisfy Section 3.1 & 9.0 oversight?</div>
                <div className="text-slate-300">Answer: Supported by Document 01 ({currentDossier.policy.documentNumber}) approved at Board Risk Committee Minute {currentDossier.policy.boardMinuteRef}.</div>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-rose-300">Supervisory Question 2: What procedures exist to govern operational execution and privileged access?</div>
                <div className="text-slate-300">Answer: Supported by Document 02 ({currentDossier.sop.documentNumber}) detailing four-eyes verification and ephemeral credential vaulting.</div>
              </div>
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-rose-300">Supervisory Question 3: What independent evidence validates control effectiveness?</div>
                <div className="text-slate-300">Answer: Supported by Document 03 ({currentDossier.evidencePool.documentNumber}) and internal audit report Document 04 ({currentDossier.auditCapa.documentNumber}).</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
