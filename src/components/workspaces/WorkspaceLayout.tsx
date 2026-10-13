import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface WorkspaceTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
  tooltip?: string;
}

export interface WorkspaceStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface WorkspaceLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  stats?: WorkspaceStat[];
  tabs: WorkspaceTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  stats = [],
  tabs,
  activeTab,
  onTabChange,
  actions,
  children
}) => {
  return (
    <div className="flex flex-col w-full min-w-0 min-h-full space-y-6">
      {/* Workspace Header & Segmented Tab Navigation Banner */}
      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Metadata */}
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 ${iconColor} shrink-0 mt-0.5`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {title}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                  Workspace
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              {/* Quiet Meta Stats with typographic separator */}
              {stats.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  {stats.map((stat, idx) => (
                    <React.Fragment key={stat.label}>
                      {idx > 0 && <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>}
                      <span>
                        <strong className="text-slate-900 dark:text-white font-semibold">{stat.value}</strong> {stat.label}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contextual Action Buttons */}
          {actions && (
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Segmented Workspace Tabs */}
        {tabs.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center overflow-x-auto no-scrollbar">
            <div className="inline-flex p-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 max-w-full">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    title={tab.tooltip || tab.label}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    {TabIcon && (
                      <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    )}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${tab.badgeColor || (isActive ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300')}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Content Area */}
      <div className="w-full min-w-0 flex-1">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="w-full min-w-0 space-y-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
