import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

export interface PageHeaderProps {
  id?: string;
  category?: string;
  categoryIcon?: LucideIcon;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  badges?: Array<{
    label: string;
    variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'slate';
    icon?: LucideIcon;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized SKANDA Enterprise Page Header.
 * Enforces unified typography, breadcrumb alignment, category badge hierarchy,
 * and responsive action button alignment across all GRC modules.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  id,
  category,
  categoryIcon: CategoryIcon,
  title,
  description,
  breadcrumbs,
  badges,
  actions,
  className = ''
}) => {
  return (
    <div
      id={id}
      className={`rounded-2xl border p-5 sm:p-6 transition-colors duration-200 bg-surface border-stroke shadow-xs ${className}`}
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          {/* 1. Breadcrumb / Hierarchy Navigation */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1.5 text-xs text-ink-3 pb-0.5" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                const CrumbIcon = crumb.icon;

                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-ink-disabled shrink-0" aria-hidden="true" />}
                    <div className="flex items-center space-x-1">
                      {CrumbIcon && <CrumbIcon className="w-3.5 h-3.5 shrink-0" />}
                      {crumb.onClick && !isLast ? (
                        <button
                          type="button"
                          onClick={crumb.onClick}
                          className="hover:text-accent transition-colors cursor-pointer"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className={isLast ? 'font-semibold text-ink' : ''} aria-current={isLast ? 'page' : undefined}>
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* 2. Category Pill & Context Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-wash text-accent border border-accent-border shrink-0">
                {CategoryIcon && <CategoryIcon className="w-3 h-3 shrink-0" />}
                <span>{category}</span>
              </span>
            )}

            {badges?.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              const variant = badge.variant || 'slate';
              let colorClasses = 'bg-status-neutral-wash text-status-neutral-ink border-stroke-strong';

              if (variant === 'emerald') {
                colorClasses = 'bg-status-ok-wash text-status-ok-ink border-status-ok-border';
              } else if (variant === 'amber') {
                colorClasses = 'bg-status-warn-wash text-status-warn-ink border-status-warn-border';
              } else if (variant === 'rose') {
                colorClasses = 'bg-status-bad-wash text-status-bad-ink border-status-bad-border';
              } else if (variant === 'indigo' || variant === 'sky') {
                colorClasses = 'bg-accent-wash text-accent border-accent-border';
              }

              return (
                <span
                  key={idx}
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${colorClasses}`}
                >
                  {BadgeIcon && <BadgeIcon className="w-3 h-3 shrink-0" />}
                  <span>{badge.label}</span>
                </span>
              );
            })}
          </div>

          {/* 3. Primary Page Title */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {title}
          </h1>

          {/* 4. Subtitle / Guidance */}
          {description && (
            <p className="text-xs sm:text-sm text-ink-2 max-w-3xl leading-relaxed pt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* 5. Right-Aligned Actions Toolbar */}
        {actions && (
          <div className="flex items-center flex-wrap gap-2 shrink-0 self-start xl:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
