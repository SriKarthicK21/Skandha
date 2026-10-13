// ============================================================================
// SKANDA ENTERPRISE GRC: PREMIUM PAGE HEADER COMPONENT
// Path: src/components/ui/premium/PremiumPageHeader.tsx
//
// Consistent enterprise page header with breadcrumb navigation, title,
// description, status badges, and primary action toolbars.
// ============================================================================

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PremiumBadge, PremiumBadgeVariant } from './PremiumBadge';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PremiumPageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  badge?: {
    text: string;
    variant?: PremiumBadgeVariant;
  };
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PremiumPageHeader: React.FC<PremiumPageHeaderProps> = ({
  breadcrumbs,
  title,
  badge,
  description,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
                {crumb.onClick && !isLast ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-slate-900 dark:text-white font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {badge && (
              <PremiumBadge variant={badge.variant || 'neutral'}>
                {badge.text}
              </PremiumBadge>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional In-Header Metric Ribbon / Sub-content */}
      {children && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          {children}
        </div>
      )}
    </div>
  );
};
