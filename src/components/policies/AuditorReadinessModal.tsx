import React, { useState } from 'react';
import { useGRC } from '../../context/GRCContext';
import { organizationService } from '../../services/organizationService';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  FileText,
  Server,
  KeyRound,
  Laptop,
  GitBranch,
  Search,
  Download,
  X,
  ExternalLink,
  Info
} from 'lucide-react';
import { AuditorGradeOptions } from '../../data/auditorGradePolicyEngine';

interface AuditorReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditorReadinessModal: React.FC<AuditorReadinessModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant, getAuditorReadinessScorecard, upgradeAllDocsToAuditorGrade } = useGRC();

  const [activeTab, setActiveTab] = useState<'assessment' | 'synthesis'>('assessment');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisSuccess, setSynthesisSuccess] = useState(false);

  // Customization state for synthesis
  const [cloudProvider, setCloudProvider] = useState<'AWS' | 'GCP' | 'Azure' | 'Multi-Cloud'>('AWS');
  const [identityProvider, setIdentityProvider] = useState<'Okta' | 'Google Workspace' | 'Microsoft Azure AD (Entra ID)' | 'JumpCloud'>('Okta');
  const [mdmProvider, setMdmProvider] = useState<'Jamf Pro' | 'Microsoft Intune' | 'Kandji' | 'Automox'>('Jamf Pro');
  const [vulnerabilityTool, setVulnerabilityTool] = useState<'Snyk & Trivy' | 'Wiz & AWS Inspector' | 'CrowdStrike Falcon' | 'Qualys'>('Snyk & Trivy');
  const [scmProvider, setScmProvider] = useState<'GitHub Enterprise' | 'GitLab SaaS' | 'Bitbucket Data Center'>('GitHub Enterprise');
  const [cisoName, setCisoName] = useState('Chief Information Security Officer (CISO)');

  if (!isOpen) return null;

  const scorecard = getAuditorReadinessScorecard();

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      const options: Partial<AuditorGradeOptions> = {
        cloudProvider,
        identityProvider,
        mdmProvider,
        vulnerabilityTool,
        scmProvider,
        cisoName
      };
      upgradeAllDocsToAuditorGrade(options);
      setIsSynthesizing(false);
      setSynthesisSuccess(true);
      setTimeout(() => {
        setSynthesisSuccess(false);
        setActiveTab('assessment');
      }, 1500);
    }, 800);
  };

  const handleExportAuditorBriefing = () => {
    const lines = [
      `# ISO/IEC 27001:2022 External Auditor Pre-Flight Readiness Briefing`,
      `Tenant Organization: ${organizationService.getOrganizationName(currentTenant)}`,
      `Evaluation Framework: ${currentTenant?.selectedFrameworks?.[0] || 'ISO/IEC 27001:2022 & ISO/IEC 27002:2022'}`,
      `Generated: ${new Date().toISOString()}`,
      `Readiness Benchmark Score: ${scorecard.overallReadinessScore}% (${scorecard.verdict})`,
      `\n---\n`,
      `## 7-Pillar Auditor Acceptance Checklist`,
      ...scorecard.criteria.map(c => 
        `### [${c.status}] ${c.title} (${c.clause})\n- Status: ${c.status}\n- Description: ${c.description}\n- Lead Auditor Expectation: ${c.auditorExpectation}\n- Failure Penalty: ${c.findingIfMissing}\n`
      ),
      `\n---\n`,
      `## Bound Operational Architecture`,
      `- Cloud Infrastructure: ${cloudProvider}`,
      `- Central Identity Federation: ${identityProvider}`,
      `- Device Management & Full Disk Encryption: ${mdmProvider}`,
      `- Vulnerability Scanning & SAST/SCA: ${vulnerabilityTool}`,
      `- Source Code Repository & Branch Protection: ${scmProvider}`,
      `- Document Owner & CISO: ${cisoName}`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(currentTenant?.name || 'Tenant').replace(/\s+/g, '_')}_ISO27001_Auditor_PreFlight.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  External Auditor Acceptance Assessment
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ISO 27001:2022 & Standards Benchmark
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation engine verifying that generated documentation will withstand rigorous Stage 1 & Stage 2 certification sampling.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-900/50 gap-6">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'assessment'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auditor Health Scorecard ({scorecard.overallReadinessScore}%)
          </button>
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-1.5 ${
              activeTab === 'synthesis'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Auditor-Grade Synthesis Engine
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'assessment' ? (
            <>
              {/* Scorecard Hero Banner */}
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <span className="text-2xl font-black text-slate-100">{scorecard.overallReadinessScore}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">External Auditor Verdict</span>
                      {scorecard.verdict === 'AUDIT_READY' && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          AUDIT READY & VERIFIED
                        </span>
                      )}
                      {scorecard.verdict === 'MINOR_REMEDIATION_NEEDED' && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          MINOR GAPS TO ADDRESS
                        </span>
                      )}
                      {scorecard.verdict === 'SHELFWARE_RISK_FAIL' && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          STAGE 1 REJECTION RISK
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1">
                      {scorecard.verdict === 'AUDIT_READY'
                        ? 'Documentation Meets Certified Lead Auditor Rigor'
                        : 'Action Recommended Before Engaging Certification Body'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                      {scorecard.verdict === 'AUDIT_READY'
                        ? `All 7 external audit benchmarks are satisfied. Policies include measurable quantitative SLAs, full RACI, real cloud tool references, and explicit evidence sampling criteria.`
                        : `Some documents contain generic language, missing SLAs, or unconfigured tool references that external ISO 27001 auditors flag as non-verifiable shelfware.`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={handleExportAuditorBriefing}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Auditor Dossier
                  </button>
                  <button
                    onClick={() => setActiveTab('synthesis')}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Re-Synthesize All Docs
                  </button>
                </div>
              </div>

              {/* 7 Auditor Acceptance Criteria List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lead Auditor Stage 1 & Stage 2 Examination Criteria ({scorecard.passedChecks}/{scorecard.totalChecks} Passed)
                  </h4>
                  <span className="text-xs text-slate-500">Based on Standards & Training & ISO/IEC 27001:2022 Clauses</span>
                </div>

                <div className="space-y-3">
                  {scorecard.criteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {criterion.status === 'PASS' && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            )}
                            {criterion.status === 'WARNING' && (
                              <AlertTriangle className="w-5 h-5 text-amber-400" />
                            )}
                            {criterion.status === 'FAIL' && (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-200">{criterion.title}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                {criterion.clause}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {criterion.description}
                            </p>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80">
                                <span className="font-semibold text-emerald-400 block mb-0.5">Lead Auditor Requirement:</span>
                                <span className="text-slate-300">{criterion.auditorExpectation}</span>
                              </div>
                              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80">
                                <span className="font-semibold text-rose-400 block mb-0.5">Non-Conformity Penalty If Failed:</span>
                                <span className="text-slate-300">{criterion.findingIfMissing}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {criterion.status === 'PASS' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              PASS
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              ACTION REQ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Synthesis Engine Tab */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-300 space-y-1">
                  <p className="font-bold">Real Architecture Binding Guarantee</p>
                  <p>
                    External ISO 27001 auditors immediately reject generic templates. By selecting your actual technology stack, the synthesis engine injects real tool names, API governance rules, branch protection parameters, and measurable SLAs into all generated policies and procedures.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cloud Infrastructure */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Server className="w-4 h-4 text-sky-400" />
                    Cloud Hosting Infrastructure
                  </label>
                  <select
                    value={cloudProvider}
                    onChange={(e) => setCloudProvider(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="AWS">Amazon Web Services (AWS - KMS, VPC, GuardDuty, RDS)</option>
                    <option value="GCP">Google Cloud Platform (GCP - Cloud KMS, Cloud Armor)</option>
                    <option value="Azure">Microsoft Azure (Azure Key Vault, Sentinel, NSGs)</option>
                    <option value="Multi-Cloud">Multi-Cloud Enterprise (AWS + GCP + Azure)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Injected into BCP, Access Control, and Cryptography policies.</p>
                </div>

                {/* Identity Provider */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    Central Identity Federation (IdP)
                  </label>
                  <select
                    value={identityProvider}
                    onChange={(e) => setIdentityProvider(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Okta">Okta Identity Cloud (FIDO2 WebAuthn, SCIM Provisioning)</option>
                    <option value="Microsoft Azure AD (Entra ID)">Microsoft Entra ID / Azure AD (Conditional Access, PIM)</option>
                    <option value="Google Workspace">Google Workspace Enterprise (Security Keys, Context-Aware)</option>
                    <option value="JumpCloud">JumpCloud Directory Platform</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Injected into Access Control and JML deprovisioning SOPs.</p>
                </div>

                {/* Mobile Device Management */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-purple-400" />
                    Endpoint & Device Security (MDM)
                  </label>
                  <select
                    value={mdmProvider}
                    onChange={(e) => setMdmProvider(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Jamf Pro">Jamf Pro (macOS FileVault 256-bit & Remote Wipe)</option>
                    <option value="Microsoft Intune">Microsoft Intune (BitLocker, Compliance Policies)</option>
                    <option value="Kandji">Kandji Apple Enterprise MDM</option>
                    <option value="Automox">Automox Cross-Platform Endpoint Management</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Injected into Acceptable Use and Asset Management policies.</p>
                </div>

                {/* Vulnerability Scanning */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-400" />
                    Vulnerability & SAST/SCA Tool
                  </label>
                  <select
                    value={vulnerabilityTool}
                    onChange={(e) => setVulnerabilityTool(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Snyk & Trivy">Snyk (SAST/SCA) & Trivy Container Scanner</option>
                    <option value="Wiz & AWS Inspector">Wiz Cloud Security & AWS Inspector</option>
                    <option value="CrowdStrike Falcon">CrowdStrike Falcon Spotlight & Horizon</option>
                    <option value="Qualys">Qualys Cloud Platform Vulnerability Suite</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Injected into Vulnerability Management and SDLC procedures.</p>
                </div>

                {/* Code Repository */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    Source Code Management & CI/CD
                  </label>
                  <select
                    value={scmProvider}
                    onChange={(e) => setScmProvider(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="GitHub Enterprise">GitHub Enterprise (Branch Protection, CODEOWNERS)</option>
                    <option value="GitLab SaaS">GitLab SaaS (Merge Request Approvals, CI/CD Gates)</option>
                    <option value="Bitbucket Data Center">Bitbucket Data Center (Strict Merge Checks)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">Injected into Secure SDLC and Change Governance procedures.</p>
                </div>

                {/* Document Owner */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    CISO / Document Approver Role Title
                  </label>
                  <input
                    type="text"
                    value={cisoName}
                    onChange={(e) => setCisoName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="Chief Information Security Officer (CISO)"
                  />
                  <p className="text-[11px] text-slate-500">Appears on all document control and sign-off blocks.</p>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Ready to Synthesize Auditor-Grade Documentation</h4>
                  <p className="text-[11px] text-slate-400">
                    Will generate 7 comprehensive, multi-page ISO 27001:2022 policies and procedures bound to {currentTenant?.name}.
                  </p>
                </div>

                <button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Synthesizing...
                    </>
                  ) : synthesisSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      Synthesized Successfully!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Apply & Synthesize Documentation Pack
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <span>Skanda GRC External Audit Assurance Suite • ISO/IEC 27001:2022 Clause 7.5 & Annex A</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
