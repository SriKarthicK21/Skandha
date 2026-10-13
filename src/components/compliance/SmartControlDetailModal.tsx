import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Shield,
  Layers,
  FileText,
  Flame,
  FolderCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  UploadCloud,
  UserCheck,
  Sparkles,
  Bot,
  HelpCircle,
  Zap,
  GitBranch,
  Award
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface SmartControlData {
  code: string;
  title: string;
  requirementSimple: string;
  whyItMatters: string;
  implementationSteps: string[];
  responsibleOwner: string;
  responsibleRole: string;
  evidenceRequiredList: string[];
  currentStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'PARTIALLY_EFFECTIVE' | 'EFFECTIVE';
  identifiedGap: string;
  recommendedAction: string;
  relatedRisks: Array<{ code: string; title: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  relatedPolicies: Array<{ code: string; title: string; version: string }>;
  relatedEvidence: Array<{ name: string; expiry: string; status: 'VALID' | 'PENDING' | 'EXPIRED' }>;
  relatedFrameworks: Array<{ framework: string; controlRef: string }>;
}

const DEFAULT_SAMPLE_CONTROL: SmartControlData = {
  code: 'A.5.15',
  title: 'Access Control',
  requirementSimple: 'Your organization must formally define, document, and enforce rules controlling who can access your systems, networks, and confidential customer data.',
  whyItMatters: 'Without access control, any employee, contractor, or compromised account can view, modify, or steal critical business data, resulting in massive regulatory fines and reputational destruction.',
  implementationSteps: [
    'Define access rules based on business roles and principle of least privilege (POLP).',
    'Enforce formal approval workflows for granting, modifying, and revoking user credentials.',
    'Require strong multi-factor authentication (MFA) across all remote and administrative endpoints.',
    'Conduct mandatory quarterly access reviews with designated department managers.'
  ],
  responsibleOwner: 'Sarah Chen (Head of Infrastructure & SecOps)',
  responsibleRole: 'Lead Security Administrator',
  evidenceRequiredList: [
    'Access Control Policy (POL-01) with executive approval signature',
    'Role-Based Access Control (RBAC) permission entitlement matrix',
    'Quarterly User Access Review (UAR) sign-off logs',
    'Automated offboarding revocation tickets with timestamped deletion'
  ],
  currentStatus: 'PARTIALLY_EFFECTIVE',
  identifiedGap: 'Quarterly access reviews are performed ad-hoc via Slack rather than through formal signed review manifests; staging environments lack strict RBAC separation.',
  recommendedAction: 'Execute Q2 quarterly access review sign-off through the Smart Evidence Uploader and restrict staging database access.',
  relatedRisks: [
    { code: 'RSK-04', title: 'Unauthorized privilege escalation via legacy IAM role', severity: 'HIGH' },
    { code: 'RSK-11', title: 'Orphaned contractor account retaining production access', severity: 'HIGH' },
    { code: 'RSK-18', title: 'Credential stuffing attack against administrative portal', severity: 'MEDIUM' }
  ],
  relatedPolicies: [
    { code: 'POL-01', title: 'Access Control & Password Policy', version: 'v2.4' },
    { code: 'POL-04', title: 'Identity & Authentication Standard', version: 'v1.2' },
    { code: 'SOP-08', title: 'User Deprovisioning & Offboarding Runbook', version: 'v3.0' }
  ],
  relatedEvidence: [
    { name: 'AWS_IAM_Privileged_Audit_Log_Q2.json', expiry: 'Expires in 42 days', status: 'VALID' },
    { name: 'Okta_MFA_Enforcement_Policy.png', expiry: 'Expires in 120 days', status: 'VALID' },
    { name: 'Finance_ERP_Access_Review_Q2.xlsx', expiry: 'Missing / Required', status: 'PENDING' }
  ],
  relatedFrameworks: [
    { framework: 'ISO/IEC 27001:2022', controlRef: 'Annex A.5.15' },
    { framework: 'SOC 2 Trust Services', controlRef: 'CC6.1 & CC6.2' },
    { framework: 'MAS TRM 2021', controlRef: 'Section 8.1 (User Access Mgmt)' },
    { framework: 'DPDP Act 2023 (India)', controlRef: 'Section 8(4) (Access Safeguards)' },
    { framework: 'PCI DSS v4.0', controlRef: 'Req 7.1 & Req 8.2' },
    { framework: 'NIST CSF 2.0', controlRef: 'PR.AC-1 & PR.AC-4' }
  ]
};

interface SmartControlDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  control?: Partial<SmartControlData>;
  onOpenUploadEvidence?: (controlCode: string) => void;
  onOpenAiCopilot?: (prompt: string) => void;
}

export const SmartControlDetailModal: React.FC<SmartControlDetailModalProps> = ({
  isOpen,
  onClose,
  control = DEFAULT_SAMPLE_CONTROL,
  onOpenUploadEvidence,
  onOpenAiCopilot
}) => {
  const { theme, setActiveModule } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const ctrl: SmartControlData = { ...DEFAULT_SAMPLE_CONTROL, ...control };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden my-6 transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {ctrl.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    ctrl.currentStatus === 'EFFECTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : ctrl.currentStatus === 'PARTIALLY_EFFECTIVE'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                  }`}
                >
                  {ctrl.currentStatus.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] dark:text-white mt-0.5">
                {ctrl.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenAiCopilot && (
              <button
                type="button"
                onClick={() => onOpenAiCopilot(`Explain control ${ctrl.code} (${ctrl.title}) and what specific evidence an auditor expects to see.`)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Copilot</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* 1. Control Requirement & Why It Matters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Control Requirement (Plain English)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {ctrl.requirementSimple}
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/20 border-amber-900/40'
              }`}
            >
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Zap className="w-4 h-4" />
                <span>Why It Matters to Your Business</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {ctrl.whyItMatters}
              </p>
            </div>
          </div>

          {/* 2. Implementation Guidance & Responsible Owner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className={`lg:col-span-2 p-4 rounded-xl border ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-2.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Step-by-Step Implementation Guidance</span>
              </div>
              <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {ctrl.implementationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Responsible Owner & Role
              </div>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  SC
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                    {ctrl.responsibleOwner}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {ctrl.responsibleRole}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Identified Gap
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {ctrl.identifiedGap}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Evidence Required Checklist & Action */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/20 border-blue-900/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                <FolderCheck className="w-4 h-4" />
                <span>Required Evidence Artifacts</span>
              </div>
              {onOpenUploadEvidence && (
                <button
                  type="button"
                  onClick={() => onOpenUploadEvidence(ctrl.code)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Evidence</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ctrl.evidenceRequiredList.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Multi-Framework Unified Crosswalk Mappings (Section 12 Requirement) */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <GitBranch className="w-4 h-4 text-emerald-600" />
                <span>Multi-Framework Harmonization (One Control → Multiple Standards)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                6x Multiplier (83% Effort Saved)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ctrl.relatedFrameworks.map((fw, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                >
                  <div className="text-[10px] font-bold text-slate-500 truncate">{fw.framework}</div>
                  <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {fw.controlRef}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Automatically Linked Risks & Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Related Risks */}
            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Linked Threat Risks ({ctrl.relatedRisks.length})</span>
              </div>
              <div className="space-y-1.5">
                {ctrl.relatedRisks.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      <strong>{r.code}</strong>: {r.title}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">{r.severity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Policies */}
            <div
              className={`p-3.5 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Linked Governing Policies ({ctrl.relatedPolicies.length})</span>
              </div>
              <div className="space-y-1.5">
                {ctrl.relatedPolicies.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      <strong>{p.code}</strong>: {p.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{p.version}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Next Action: <strong className="text-slate-800 dark:text-slate-200">{ctrl.recommendedAction}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
