import React from 'react';

interface SidebarSkeletonLoaderProps {
  isCollapsed?: boolean;
  itemCount?: number;
  showSubItems?: boolean;
}

export const SidebarSkeletonLoader: React.FC<SidebarSkeletonLoaderProps> = ({
  isCollapsed = false,
  itemCount = 10,
  showSubItems = true
}) => {
  // Deterministic realistic widths matching the 10 Skanda Enterprise GRC Business Workspaces
  const placeholderWidths = [
    { label: 'w-36', badge: true, badgeWidth: 'w-10' }, // Command Centre
    { label: 'w-28', badge: false },                    // My Workplace
    { label: 'w-40', badge: true, badgeWidth: 'w-8' },  // Governance & Frameworks
    { label: 'w-32', badge: false },                    // Enterprise Risk Engine
    { label: 'w-44', badge: true, badgeWidth: 'w-12' }, // Controls & Continuous Monitoring
    { label: 'w-36', badge: false },                    // Audit & Assurance
    { label: 'w-38', badge: false },                    // Incident & Crisis Resilience
    { label: 'w-32', badge: false },                    // Assets & Third Parties
    { label: 'w-28', badge: false },                    // Reports & Insights
    { label: 'w-34', badge: true, badgeWidth: 'w-14' }  // Skanda Intelligence
  ];

  return (
    <div
      data-testid="sidebar-skeleton-loader"
      className="sidebar-skeleton-container w-full space-y-1 select-none pointer-events-none"
      aria-busy="true"
      aria-label="Loading navigation modules and permissions..."
    >
      {/* Top Scope Pill Skeleton (Expanded only) */}
      {!isCollapsed && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded-sm sidebar-skeleton-shimmer" />
            <div className="w-28 h-3 rounded-md sidebar-skeleton-shimmer" />
          </div>
          <div className="w-8 h-3 rounded-md sidebar-skeleton-shimmer" />
        </div>
      )}

      {/* Primary Navigation Workspaces Skeletons */}
      {Array.from({ length: itemCount }).map((_, index) => {
        const itemConfig = placeholderWidths[index % placeholderWidths.length];
        const isThirdItemWithSubItems = !isCollapsed && showSubItems && index === 2;

        return (
          <div key={`sidebar-skel-${index}`} className="space-y-0.5">
            {/* Primary Nav Skeleton Item */}
            <div
              className={`sidebar-nav-skeleton relative w-full flex items-center rounded-lg border border-transparent ${
                isCollapsed
                  ? 'justify-center h-10 px-0'
                  : 'justify-between h-9 px-2.5 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              {/* Left edge subtle indicator placeholder */}
              {index === 0 && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-slate-300 dark:bg-slate-700" />
              )}

              {/* Icon & Label */}
              <div
                className={`flex items-center min-w-0 ${
                  isCollapsed ? 'justify-center w-full' : 'gap-2.5 flex-1'
                }`}
              >
                <div className="sidebar-icon-container w-5 h-5 flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 rounded-md sidebar-skeleton-shimmer" />
                </div>
                {!isCollapsed && (
                  <div className={`h-3 rounded-md sidebar-skeleton-shimmer ${itemConfig.label}`} />
                )}
              </div>

              {/* Trailing Badge and Chevron */}
              {!isCollapsed && (
                <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                  {itemConfig.badge && (
                    <div className={`h-3.5 rounded-sm sidebar-skeleton-shimmer ${itemConfig.badgeWidth}`} />
                  )}
                  <div className="w-3.5 h-3.5 rounded-xs sidebar-skeleton-shimmer opacity-60" />
                </div>
              )}
            </div>

            {/* Contextual Sub-Items Skeleton (Mimics active section hierarchy) */}
            {isThirdItemWithSubItems && (
              <div className="ml-3.5 pl-3 border-l border-slate-200/80 dark:border-slate-800/80 space-y-0.5 py-1">
                {[
                  { width: 'w-24', key: 'sub-1' },
                  { width: 'w-32', key: 'sub-2' },
                  { width: 'w-28', key: 'sub-3' }
                ].map((sub) => (
                  <div
                    key={sub.key}
                    className="h-8 px-2 rounded-lg flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full sidebar-skeleton-shimmer opacity-70" />
                      <div className={`h-2.5 rounded-md sidebar-skeleton-shimmer ${sub.width}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
