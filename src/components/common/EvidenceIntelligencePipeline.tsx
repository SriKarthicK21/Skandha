import React from 'react';
import { useGRC } from '../../context/GRCContext';
import {
  FileText,
  Cpu,
  GitMerge,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface EvidenceIntelligencePipelineProps {
  className?: string;
  onNavigateModule?: (moduleId: string) => void;
}

export const EvidenceIntelligencePipeline: React.FC<EvidenceIntelligencePipelineProps> = ({
  className = '',
  onNavigateModule
}) => {
  const { theme, evidence, currentTenant, setActiveModule } = useGRC();
  const isLight = theme === 'light';

  const tenantEv = evidence.filter(e => !currentTenant?.id || e.tenantId === currentTenant.id);
  const totalCount = tenantEv.length || 48;
  const verifiedCount = tenantEv.filter(e => e.status === 'Verified').length || 38;
  const pendingCount = tenantEv.filter(e => e.status === 'Pending Review').length || 6;
  const processingCount = tenantEv.filter(e => e.status === 'Draft' || e.status === 'Requires Update').length || 4;

  const steps = [
    {
      id: 'docs',
      title: 'Documents',
      sub: 'Policy, Logs, PDFs',
      icon: FileText,
      metric: `${totalCount} Ingested`,
      mod: 'evidence_upload'
    },
    {
      id: 'ai',
      title: 'AI Analysis',
      sub: 'OCR & Data Extraction',
      icon: Cpu,
      metric: `${processingCount} Processing`,
      mod: 'evidence_centre'
    },
    {
      id: 'map',
      title: 'Control Mapping',
      sub: 'Multi-Framework Tagging',
      icon: GitMerge,
      metric: '93 Controls Linked',
      mod: 'control_library'
    },
    {
      id: 'val',
      title: 'Validation',
      sub: 'Auditor & Peer Review',
      icon: ShieldCheck,
      metric: `${pendingCount} In Review`,
      mod: 'auditor_portal'
    },
    {
      id: 'ready',
      title: 'Evidence Ready',
      sub: 'Cryptographic Integrity',
      icon: CheckCircle,
      metric: `${verifiedCount} Verified`,
      mod: 'evidence_centre'
    }
  ];

  return (
    <div
      className={`w-full rounded-2xl border p-4 sm:p-5 transition-all select-none ${
        isLight
          ? 'bg-white border-slate-200 shadow-2xs'
          : 'bg-slate-900/90 border-slate-800 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Evidence Intelligence Pipeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold">
              Automated OCR & Mapping
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Continuous ingestion from document upload to tamper-evident audit readiness
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onNavigateModule) onNavigateModule('evidence_centre');
            else setActiveModule('evidence_centre');
          }}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          View Evidence Vault →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              onClick={() => {
                if (onNavigateModule) onNavigateModule(step.mod);
                else setActiveModule(step.mod as any);
              }}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-colors cursor-pointer group ${
                isLight
                  ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                  idx === 4
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">Step {idx + 1}</span>
              </div>

              <div>
                <span className={`text-xs font-bold truncate block ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {step.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                  {step.sub}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  {step.metric}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvidenceIntelligencePipeline;
