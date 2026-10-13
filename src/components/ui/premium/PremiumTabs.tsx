// ============================================================================
// SKANDA ENTERPRISE GRC: PREMIUM TABS COMPONENT
// Path: src/components/ui/premium/PremiumTabs.tsx
//
// Standardized enterprise tab navigation with horizontal scroll containment,
// keyboard navigation, notification badges, icons, and theme-aware active states.
// ============================================================================

import React, { useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { useGRC } from '../../../context/GRCContext';

export interface PremiumTabItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

export interface PremiumTabsProps {
  tabs: PremiumTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export const PremiumTabs: React.FC<PremiumTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  className = '',
  fullWidth = false
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view if container is horizontally scrollable
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTab]);

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3 text-xs gap-2',
    lg: 'h-10 px-4 text-sm gap-2.5'
  }[size];

  const getBadgeClasses = (badgeVariant: PremiumTabItem['badgeVariant'] = 'neutral', isActive: boolean) => {
    if (badgeVariant === 'danger') {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    if (badgeVariant === 'warning') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    if (badgeVariant === 'success') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (badgeVariant === 'primary') {
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
    return isActive
      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`w-full min-w-0 overflow-x-auto scrollbar-none flex items-center select-none ${
        variant === 'underline'
          ? 'border-b border-slate-200 dark:border-slate-800 gap-1'
          : variant === 'segmented'
          ? 'p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 gap-1'
          : 'gap-1.5'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        let buttonStyle = '';
        if (variant === 'underline') {
          buttonStyle = isActive
            ? 'font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 -mb-[1px]'
            : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-b-2 hover:border-slate-300 dark:hover:border-slate-700';
        } else if (variant === 'segmented') {
          buttonStyle = isActive
            ? 'font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs rounded-lg'
            : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg';
        } else {
          // Pills
          buttonStyle = isActive
            ? 'font-bold bg-indigo-600 text-white shadow-xs rounded-lg'
            : isLight
            ? 'font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg'
            : 'font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg';
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            data-active={isActive ? 'true' : 'false'}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`inline-flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${sizeClasses} ${buttonStyle} ${
              fullWidth ? 'flex-1' : ''
            } ${tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate whitespace-nowrap">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${getBadgeClasses(
                  tab.badgeVariant,
                  isActive
                )}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PremiumTabs;
