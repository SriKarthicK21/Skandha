import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  badge?: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  breadcrumbs,
  title,
  badge,
  subtitle,
  actions,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  return (
    <div className={`space-y-2 mb-6 ${className}`}>
      {/* Breadcrumb Row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-700 dark:text-slate-200' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h1
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {subtitle && (
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
