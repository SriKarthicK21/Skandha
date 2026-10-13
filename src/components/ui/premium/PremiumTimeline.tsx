import React from 'react';
import { LucideIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface PremiumTimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'in_progress' | 'pending' | 'failed';
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badge?: string;
  author?: string;
}

export interface PremiumTimelineProps {
  items: PremiumTimelineItem[];
  className?: string;
}

export const PremiumTimeline: React.FC<PremiumTimelineProps> = ({
  items,
  className = ''
}) => {
  const getStatusIcon = (item: PremiumTimelineItem) => {
    if (item.icon) {
      const Icon = item.icon;
      return <Icon className="w-3.5 h-3.5" />;
    }
    switch (item.status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />;
    }
  };

  const getStatusBg = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800/60';
      case 'failed':
        return 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:pointer-events-none ${className}`}>
      {items.map((item, index) => (
        <div key={item.id || index} className="relative flex items-start space-x-3.5 group">
          <div className={`relative z-10 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${getStatusBg(item.status)}`}>
            {getStatusIcon(item)}
          </div>

          <div className="flex-1 min-w-0 pt-0.5 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                {item.title}
              </span>
              {item.timestamp && (
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {item.timestamp}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            )}

            {(item.badge || item.author) && (
              <div className="flex items-center gap-2 pt-0.5">
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {item.badge}
                  </span>
                )}
                {item.author && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    by {item.author}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PremiumTimeline;
