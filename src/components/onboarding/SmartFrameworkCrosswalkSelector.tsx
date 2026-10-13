import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  Database,
  Globe,
  Brain,
  Scale,
  CreditCard,
  Server,
  Activity,
  ArrowRight,
  TrendingDown,
  FileText,
  FolderCheck,
  Check,
  Sliders
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface FrameworkOption {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  totalControls: number;
  color: string;
}

export const TARGET_FRAMEWORKS: FrameworkOption[] = [
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO 27001',
    badge: 'Global Benchmark',
    icon: ShieldCheck,
    description: 'Gold standard for Information Security Management Systems (ISMS) across 93 controls.',
    totalControls: 93,
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'iso27701',
    name: 'ISO/IEC 27701:2019',
    shortName: 'ISO 27701 (PIMS)',
    badge: 'Privacy Extension',
    icon: Lock,
    description: 'Privacy Information Management System extension for GDPR and global data protection.',
    totalControls: 44,
    color: 'from-emerald-600 to-teal-700'
  },
  {
    id: 'iso42001',
    name: 'ISO/IEC 42001:2023',
    shortName: 'ISO 42001 (AI)',
    badge: 'AI Governance',
    icon: Brain,
    description: 'First international standard for Artificial Intelligence Management Systems (AIMS).',
    totalControls: 38,
    color: 'from-purple-600 to-violet-700'
  },
  {
    id: 'mas_trm',
    name: 'MAS TRM Guidelines 2021',
    shortName: 'MAS TRM',
    badge: 'Singapore Statutory',
    icon: Scale,
    description: 'Monetary Authority of Singapore Technology Risk Management & Cyber Hygiene (Notices 644/655).',
    totalControls: 86,
    color: 'from-rose-600 to-red-700'
  },
  {
    id: 'dpdpa',
    name: 'DPDP Act 2023 (India)',
    shortName: 'DPDPA 2023',
    badge: 'Statutory Privacy',
    icon: Globe,
    description: 'Digital Personal Data Protection Act compliance, consent registers, and 6-hour breach reporting.',
    totalControls: 44,
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'pci_dss',
    name: 'PCI DSS v4.0.1',
    shortName: 'PCI DSS',
    badge: 'Payments & Cardholder',
    icon: CreditCard,
    description: 'Payment Card Industry Data Security Standard for protecting cardholder account data.',
    totalControls: 64,
    color: 'from-cyan-600 to-blue-700'
  },
  {
    id: 'soc2',
    name: 'SOC 2 Type II (AICPA)',
    shortName: 'SOC 2',
    badge: 'US B2B SaaS Standard',
    icon: Server,
    description: 'Trust Services Criteria covering Security, Availability, and Confidentiality for SaaS vendors.',
    totalControls: 61,
    color: 'from-indigo-600 to-blue-700'
  },
  {
    id: 'nist_csf',
    name: 'NIST CSF 2.0',
    shortName: 'NIST CSF',
    badge: 'US Federal & Enterprise',
    icon: Activity,
    description: 'National Institute of Standards and Technology Cybersecurity Framework (Govern, Identify, Protect, Detect, Respond, Recover).',
    totalControls: 106,
    color: 'from-sky-600 to-indigo-800'
  },
  {
    id: 'cis_controls',
    name: 'CIS Critical Controls v8',
    shortName: 'CIS Controls',
    badge: 'Technical Hardening',
    icon: Layers,
    description: 'Prioritized set of actions that collectively form a defense-in-depth set of best practices.',
    totalControls: 56,
    color: 'from-slate-700 to-slate-900'
  },
  {
    id: 'iso22301',
    name: 'ISO 22301:2019 (BCM)',
    shortName: 'ISO 22301',
    badge: 'Business Continuity',
    icon: Activity,
    description: 'Security and resilience — Business continuity management systems requirements.',
    totalControls: 32,
    color: 'from-emerald-700 to-green-800'
  },
  {
    id: 'iso31000',
    name: 'ISO 31000:2018 (Risk)',
    shortName: 'ISO 31000',
    badge: 'Risk Guidelines',
    icon: Sliders,
    description: 'Risk management principles and guidelines for managing enterprise-wide uncertainties.',
    totalControls: 28,
    color: 'from-stone-700 to-zinc-900'
  }
];

interface Props {
  onSelectionConfirmed?: (selectedFrameworkIds: string[]) => void;
  initialSelected?: string[];
}

export const SmartFrameworkCrosswalkSelector: React.FC<Props> = ({
  onSelectionConfirmed,
  initialSelected = ['iso27001', 'soc2', 'mas_trm']
}) => {
  const { theme, currentTenant } = useGRC();
  const { showToast } = useToast();
  const isLight = theme === 'light';

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  const toggleFramework = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          showToast({
            title: 'Minimum 1 Framework Required',
            message: 'Your compliance program requires at least one governing standard.',
            type: 'warning'
          });
          return prev;
        }
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Crosswalk Deduplication Intelligence calculation
  const metrics = useMemo(() => {
    const rawTotalControls = TARGET_FRAMEWORKS.filter(f => selectedIds.includes(f.id)).reduce(
      (sum, f) => sum + f.totalControls,
      0
    );

    // Multi-Framework deduplication factor: 1 framework = 0%, 2 = ~40% overlap, 3 = ~65% overlap, 4+ = ~76% overlap
    let overlapPct = 0;
    if (selectedIds.length === 2) overlapPct = 42;
    else if (selectedIds.length === 3) overlapPct = 68;
    else if (selectedIds.length >= 4) overlapPct = 78;

    const deduplicatedControls = Math.round(rawTotalControls * (1 - overlapPct / 100));
    const savedHours = Math.round((rawTotalControls - deduplicatedControls) * 4.5);
    const sharedPoliciesCount = Math.min(14, selectedIds.length * 4);

    return {
      rawTotalControls,
      deduplicatedControls,
      overlapPct,
      savedHours,
      sharedPoliciesCount
    };
  }, [selectedIds]);

  const handleApply = () => {
    showToast({
      title: 'Unified Control Architecture Synced',
      message: `${selectedIds.length} frameworks harmonized. ${metrics.overlapPct}% duplicate effort eliminated!`,
      type: 'success'
    });
    if (onSelectionConfirmed) {
      onSelectionConfirmed(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Step 2 • Multi-Framework Harmonization
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
          What do you want to achieve?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Select all standards and statutory regulations applicable to your business. Skanda automatically creates a <strong>single unified control library</strong> — so you implement each security control once.
        </p>
      </div>

      {/* Visual Framework Grid (Multi-Select) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {TARGET_FRAMEWORKS.map(fw => {
          const isSelected = selectedIds.includes(fw.id);
          const Icon = fw.icon;

          return (
            <div
              key={fw.id}
              onClick={() => toggleFramework(fw.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? isLight
                    ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-blue-950/40 border-blue-500 shadow-lg ring-2 ring-blue-500/30'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {fw.totalControls} Controls
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {fw.badge}
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white mt-0.5">
                  {fw.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {fw.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2.5 border-t border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  <span>Included in Active Scope</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Skanda Crosswalk Intelligence Banner (Section 2 & 12 Requirement) */}
      <div
        className={`p-5 rounded-2xl border ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-emerald-200 text-slate-800'
            : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border-emerald-900 text-slate-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">
                Skanda Crosswalk Engine
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                One Control → Multiple Frameworks
              </span>
            </div>
            <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
              {metrics.overlapPct}% Duplicate Effort Eliminated
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Instead of implementing <strong>{metrics.rawTotalControls} separate controls</strong>, Skanda harmonizes them into only <strong>{metrics.deduplicatedControls} unified controls</strong>. An estimated <strong>{metrics.savedHours} hours of auditor interviews and duplicate evidence uploads</strong> saved!
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Confirm {selectedIds.length} Target Frameworks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
