import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  ChevronRight,
  ExternalLink,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { Tooltip, MetricInfoTooltip } from '../common/Tooltip';

interface CertificationReadinessCardProps {
  onNavigateModule: (moduleId: string) => void;
  className?: string;
}

export interface FrameworkReadinessItem {
  id: string;
  name: string;
  code: string;
  readinessScore: number;
  stage1Ready: boolean;
  stage2Ready: boolean;
  targetDate: string;
  daysRemaining: number;
  verifiedEvidence: number;
  totalEvidenceRequired: number;
  majorGaps: number;
  status: 'QUALIFIED' | 'ON_TRACK' | 'ATTENTION_REQUIRED';
}

export const CertificationReadinessCard: React.FC<CertificationReadinessCardProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const { theme, currentTenant } = useGRC();
  const isLight = theme === 'light';

  const [selectedFramework, setSelectedFramework] = useState<string>('iso_27001');

  const frameworks: FrameworkReadinessItem[] = [
    {
      id: 'iso_27001',
      name: 'ISO/IEC 27001:2022 ISMS',
      code: 'ISO 27001',
      readinessScore: 96.4,
      stage1Ready: true,
      stage2Ready: true,
      targetDate: '15 Nov 2026',
      daysRemaining: 55,
      verifiedEvidence: 420,
      totalEvidenceRequired: 432,
      majorGaps: 0,
      status: 'QUALIFIED'
    },
    {
      id: 'iso_42001',
      name: 'ISO/IEC 42001:2023 AIMS',
      code: 'ISO 42001',
      readinessScore: 88.5,
      stage1Ready: true,
      stage2Ready: false,
      targetDate: '10 Jan 2027',
      daysRemaining: 111,
      verifiedEvidence: 168,
      totalEvidenceRequired: 194,
      majorGaps: 1,
      status: 'ON_TRACK'
    },
    {
      id: 'soc_2',
      name: 'SOC 2 Type II (Security/Confidentiality)',
      code: 'SOC 2',
      readinessScore: 92.8,
      stage1Ready: true,
      stage2Ready: true,
      targetDate: '01 Dec 2026',
      daysRemaining: 71,
      verifiedEvidence: 310,
      totalEvidenceRequired: 330,
      majorGaps: 0,
      status: 'QUALIFIED'
    },
    {
      id: 'mas_trm',
      name: 'MAS Technology Risk Management (2024)',
      code: 'MAS TRM',
      readinessScore: 94.0,
      stage1Ready: true,
      stage2Ready: true,
      targetDate: 'Active Scope',
      daysRemaining: 30,
      verifiedEvidence: 245,
      totalEvidenceRequired: 260,
      majorGaps: 0,
      status: 'QUALIFIED'
    }
  ];

  const activeItem = frameworks.find(f => f.id === selectedFramework) || frameworks[0];

  return (
    <div
      id="certification-readiness-card"
      className={`p-5 rounded-2xl border transition-all h-full flex flex-col justify-between ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-md'
      } ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Certification Readiness</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Auditor Gate
              </span>
              <MetricInfoTooltip
                title="Accredited Certification Gate"
                badge="ISO & SOC 2 Readiness"
                content="Deterministic qualification index verifying Stage 1 documentation readiness, Stage 2 operational effectiveness, and cryptographic workpaper hashes before certification body audit entry."
                formula="Stage 1 Docs (35%) + Stage 2 Controls (45%) + Evidence Integrity (20%)"
                benchmark="≥ 95% = Qualified for External Audit | 80–94% = Conditional Entry | < 80% = Audit Blocked"
                position="bottom"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accredited certification body gate qualifications across active scopes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateModule('audit_centre')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Audit Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Framework Tabs */}
        <div className="flex items-center space-x-1.5 mt-3.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {frameworks.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFramework(f.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                selectedFramework === f.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{f.code}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  f.status === 'QUALIFIED' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Active Framework Detailed Gate Card */}
        <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                {activeItem.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Target Audit Window: {activeItem.targetDate} ({activeItem.daysRemaining} days left)
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                {activeItem.readinessScore}%
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  activeItem.status === 'QUALIFIED'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                {activeItem.status === 'QUALIFIED' ? 'Audit Qualified' : 'Stage 1 Complete'}
              </span>
            </div>
          </div>

          {/* Gate Verification Stepper */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Stage 1 (Docs)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Passed</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Stage 2 (Ops)</span>
              <span className={`font-bold flex items-center space-x-1 mt-0.5 ${
                activeItem.stage2Ready ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
              }`}>
                {activeItem.stage2Ready ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                <span>{activeItem.stage2Ready ? 'Ready for Entry' : 'In Progress'}</span>
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Evidence Vault</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
                {activeItem.verifiedEvidence}/{activeItem.totalEvidenceRequired} files
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          Lead Certification Body: <strong>BSI Group Americas</strong>
        </span>
        <button
          type="button"
          onClick={() => onNavigateModule('audit_readiness')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
        >
          <span>Open Readiness Matrix</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
