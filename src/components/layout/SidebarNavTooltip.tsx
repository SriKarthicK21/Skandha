import React from 'react';

export interface SidebarNavTooltipData {
  title: string;
  badge?: string | number;
  badgeColor?: string;
  top: number;
  left: number;
}

export interface SidebarNavTooltipProps {
  tooltip: SidebarNavTooltipData | null;
}

/**
 * SidebarNavTooltip
 * Appears on hover for navigation items when the sidebar is collapsed.
 * Displays the module name, optional badge, and points back to the trigger icon.
 */
export const SidebarNavTooltip: React.FC<SidebarNavTooltipProps> = ({ tooltip }) => {
  if (!tooltip) return null;

  return (
    <div
      role="tooltip"
      aria-hidden="false"
      className="fixed z-50 pointer-events-none select-none transition-all duration-150 ease-out"
      style={{
        top: `${tooltip.top}px`,
        left: `${tooltip.left}px`,
        transform: 'translateY(-50%)'
      }}
    >
      <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xl border bg-slate-900/95 dark:bg-slate-800/95 text-white border-slate-700/80 backdrop-blur-xs whitespace-nowrap animate-in fade-in zoom-in-95">
        {/* Left notch arrow pointing back to trigger */}
        <span
          aria-hidden="true"
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-l border-t border-slate-700/80 -rotate-45"
        />
        <span>{tooltip.title}</span>
        {tooltip.badge !== undefined && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
              tooltip.badgeColor || 'bg-slate-700 text-slate-200'
            }`}
          >
            {tooltip.badge}
          </span>
        )}
      </div>
    </div>
  );
};
