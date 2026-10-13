import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Database,
  Cpu,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { MetricInfoTooltip } from '../common/Tooltip';

interface ContinuousComplianceLifecycleBarProps {
  onNavigateModule: (moduleId: string) => void;
  className?: string;
}

export const ContinuousComplianceLifecycleBar: React.FC<ContinuousComplianceLifecycleBarProps> = ({
  onNavigateModule,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  const [activeStep, setActiveStep] = useState<number>(3); // currently evaluating
  const [pulseCount, setPulseCount] = useState<number>(1429);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 5);
      setPulseCount(c => c + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 0,
      title: '1. Live Telemetry',
      subtitle: 'AWS, GCP, GitHub, Okta',
      metric: '48.2k events/s',
      status: 'Streaming'
    },
    {
      id: 1,
      title: '2. Ingestion & Normalization',
      subtitle: 'OSCAL & JSON-LD standard',
      metric: '99.99% valid',
      status: 'Normalized'
    },
    {
      id: 2,
      title: '3. Policy Evaluation',
      subtitle: 'Annex A & MAS TRM rules',
      metric: '93 controls',
      status: 'Evaluating'
    },
    {
      id: 3,
      title: '4. Dynamic Scoring',
      subtitle: 'Bayesian Health Index',
      metric: '96.4% Health',
      status: 'Synchronized'
    },
    {
      id: 4,
      title: '5. Audit Cryptography',
      subtitle: 'Immutable Merkle Ledger',
      metric: 'SHA-256 Valid',
      status: 'Sealed'
    }
  ];

  return (
    <div
      id="continuous-compliance-lifecycle-bar"
      className={`w-full rounded-2xl border transition-all p-3.5 sm:p-4 shadow-md ${
        isLight
          ? 'bg-white/80 backdrop-blur-md border-slate-200/90'
          : 'bg-slate-900/90 backdrop-blur-md border-slate-800'
      } ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Continuous Compliance Lifecycle Pipeline
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                ACTIVE PIPELINE
              </span>
              <MetricInfoTooltip
                title="Continuous Compliance Pipeline"
                badge="Real-Time GRC Engine"
                content="Demonstrates the real-time asynchronous streaming loop: ingestion of telemetry, OSCAL normalization, Annex A policy validation, deterministic score updates, and cryptographic sealing."
                formula="Telemetry → Ingestion → Normalization → Evaluation → Score Update → Immutable Audit Proof"
                position="bottom"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live feedback loop ensuring continuous compliance assurance without periodic auditor lag.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span>Processed Pulse: <strong className="text-slate-900 dark:text-white">#{pulseCount}</strong></span>
          <span className="text-emerald-500 font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Zero Latency Lag</span>
          </span>
        </div>
      </div>

      {/* 5 Step Lifecycle Visual Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {steps.map(step => {
          const isCurrent = activeStep === step.id;
          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-xl border transition-all text-xs relative ${
                isCurrent
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-xs'
                  : isLight
                  ? 'bg-slate-50/70 border-slate-200/80'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold font-mono text-[11px] ${
                  isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {step.title}
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate mb-1">
                {step.subtitle}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800 font-mono text-[10px]">
                <span className="font-bold text-slate-900 dark:text-white">{step.metric}</span>
                <span className="text-emerald-500">{step.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
