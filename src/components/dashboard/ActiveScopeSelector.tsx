import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Building2,
  Lock,
  FileCheck2,
  Eye,
  CreditCard,
  Layers,
  ArrowUpRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { navigateToGrc } from '../../services/grc/grcNavigationService';

interface ActiveScopeSelectorProps {
  className?: string;
  onNavigateModule?: (moduleId: string) => void;
}

export interface FrameworkScopeItem {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  targetModule: string;
  targetFramework: string;
  icon: any;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const FRAMEWORK_DICTIONARY: Record<string, FrameworkScopeItem> = {
  iso27001: {
    id: 'iso27001',
    code: 'ISO 27001',
    shortName: 'ISO 27001',
    fullName: 'ISO/IEC 27001:2022 ISMS',
    targetModule: 'compliance',
    targetFramework: 'iso27001',
    icon: ShieldCheck,
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-50/80 dark:bg-sky-950/40',
    borderClass: 'border-sky-200 dark:border-sky-800'
  },
  iso_27001: {
    id: 'iso_27001',
    code: 'ISO 27001',
    shortName: 'ISO 27001',
    fullName: 'ISO/IEC 27001:2022 ISMS',
    targetModule: 'compliance',
    targetFramework: 'iso27001',
    icon: ShieldCheck,
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-50/80 dark:bg-sky-950/40',
    borderClass: 'border-sky-200 dark:border-sky-800'
  },
  mas_trm: {
    id: 'mas_trm',
    code: 'MAS TRM',
    shortName: 'MAS TRM',
    fullName: 'MAS TRM (2024 Guidelines)',
    targetModule: 'compliance',
    targetFramework: 'mas_trm',
    icon: Building2,
    colorClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50/80 dark:bg-rose-950/40',
    borderClass: 'border-rose-200 dark:border-rose-800'
  },
  iso42001: {
    id: 'iso42001',
    code: 'ISO 42001',
    shortName: 'ISO 42001',
    fullName: 'ISO/IEC 42001:2023 AIMS',
    targetModule: 'compliance',
    targetFramework: 'iso42001',
    icon: Cpu,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50/80 dark:bg-purple-950/40',
    borderClass: 'border-purple-200 dark:border-purple-800'
  },
  soc2: {
    id: 'soc2',
    code: 'SOC 2',
    shortName: 'SOC 2',
    fullName: 'SOC 2 Type II (Security & Confidentiality)',
    targetModule: 'compliance',
    targetFramework: 'soc2',
    icon: Lock,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800'
  },
  soc_2: {
    id: 'soc_2',
    code: 'SOC 2',
    shortName: 'SOC 2',
    fullName: 'SOC 2 Type II (Security & Confidentiality)',
    targetModule: 'compliance',
    targetFramework: 'soc2',
    icon: Lock,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800'
  },
  dpdp: {
    id: 'dpdp',
    code: 'DPDP',
    shortName: 'DPDP Act 2023',
    fullName: 'Digital Personal Data Protection Act 2023',
    targetModule: 'dpdp_compliance',
    targetFramework: 'dpdp',
    icon: Eye,
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50/80 dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800'
  },
  iso27701: {
    id: 'iso27701',
    code: 'ISO 27701',
    shortName: 'ISO 27701',
    fullName: 'ISO/IEC 27701:2019 PIMS Privacy',
    targetModule: 'iso27701_soa',
    targetFramework: 'iso27701',
    icon: FileCheck2,
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-50/80 dark:bg-teal-950/40',
    borderClass: 'border-teal-200 dark:border-teal-800'
  },
  pci_dss: {
    id: 'pci_dss',
    code: 'PCI DSS',
    shortName: 'PCI DSS v4.0',
    fullName: 'Payment Card Industry Data Security Standard v4.0',
    targetModule: 'compliance',
    targetFramework: 'pci_dss',
    icon: CreditCard,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50/80 dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800'
  }
};

export const ActiveScopeSelector: React.FC<ActiveScopeSelectorProps> = ({
  className = '',
  onNavigateModule
}) => {
  const { currentTenant, theme } = useGRC();
  const isLight = theme === 'light';

  // 1. Derive active frameworks dynamically from the active tenant
  const rawFrameworks: string[] = React.useMemo(() => {
    if (!currentTenant) return ['iso27001', 'iso42001', 'mas_trm', 'soc2'];

    // Check selectedFrameworks array
    if (currentTenant.selectedFrameworks && currentTenant.selectedFrameworks.length > 0) {
      return currentTenant.selectedFrameworks;
    }

    // Check activeFrameworks if defined
    if ((currentTenant as any).activeFrameworks && (currentTenant as any).activeFrameworks.length > 0) {
      return (currentTenant as any).activeFrameworks;
    }

    // Default fallback based on industry/profile
    if (currentTenant.industryType === 'FinTech & Digital Banking' || currentTenant.industryType === 'Banking & Financial Services') {
      return ['iso27001', 'mas_trm', 'soc2', 'iso42001'];
    }

    return ['iso27001', 'soc2', 'iso42001'];
  }, [currentTenant]);

  // 2. Map raw keys to framework dictionary items
  const activeItems = React.useMemo(() => {
    const items: FrameworkScopeItem[] = [];
    const seen = new Set<string>();

    rawFrameworks.forEach(fw => {
      const normalizedKey = fw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const item = FRAMEWORK_DICTIONARY[normalizedKey] || FRAMEWORK_DICTIONARY[fw.toLowerCase()];
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      } else if (!item && !seen.has(fw)) {
        seen.add(fw);
        items.push({
          id: fw,
          code: fw.toUpperCase(),
          shortName: fw.toUpperCase(),
          fullName: `${fw.toUpperCase()} Compliance Program`,
          targetModule: 'compliance',
          targetFramework: fw,
          icon: Layers,
          colorClass: 'text-indigo-600 dark:text-indigo-400',
          bgClass: 'bg-indigo-50/80 dark:bg-indigo-950/40',
          borderClass: 'border-indigo-200 dark:border-indigo-800'
        });
      }
    });

    return items;
  }, [rawFrameworks]);

  const handleFrameworkClick = (item: FrameworkScopeItem) => {
    navigateToGrc({
      module: item.targetModule,
      framework: item.targetFramework,
      tab: item.targetFramework === 'iso27001' ? 'iso27001' : item.targetFramework === 'mas_trm' ? 'mas_trm' : item.targetFramework === 'iso42001' ? 'iso42001' : 'compliance',
      filters: {
        program: item.id
      }
    });
    if (onNavigateModule) {
      onNavigateModule(item.targetModule);
    }
  };

  const handleConfigureClick = () => {
    navigateToGrc({
      module: 'governance',
      tab: 'org_scope',
      filters: { action: 'configure_scope' }
    });
    if (onNavigateModule) {
      onNavigateModule('governance');
    }
  };

  if (activeItems.length === 0) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs ${
        isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
      } ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span className="font-medium">No active compliance programs</span>
        <button
          type="button"
          onClick={handleConfigureClick}
          className="ml-2 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white hover:bg-amber-700 transition cursor-pointer flex items-center space-x-1"
        >
          <PlusCircle className="w-3 h-3" />
          <span>Configure Compliance</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="active-scope-selector"
      className={`flex items-center space-x-1.5 p-1 rounded-xl border flex-wrap gap-y-1 ${
        isLight
          ? 'bg-slate-50/90 border-slate-200/90'
          : 'bg-slate-900/90 border-slate-800'
      } ${className}`}
      role="group"
      aria-label="Active In-Scope Compliance Programs"
    >
      <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold shrink-0 flex items-center space-x-1">
        <span>Active Scope:</span>
      </div>

      {activeItems.map(item => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleFrameworkClick(item)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold border transition shrink-0 flex items-center space-x-1.5 cursor-pointer shadow-2xs group hover:scale-[1.02] active:scale-[0.98] ${
              item.bgClass
            } ${item.borderClass} ${item.colorClass}`}
            title={`Open ${item.fullName} in Compliance Workspace`}
            aria-label={`Open ${item.fullName}`}
          >
            <Icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {item.shortName}
            </span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>
        );
      })}
    </div>
  );
};
