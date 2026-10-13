import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useGRC } from '../../context/GRCContext';

export type CardVariant =
  | 'default'
  | 'kpi'
  | 'status'
  | 'analytics'
  | 'action'
  | 'risk'
  | 'evidence'
  | 'compliance'
  | 'executive'
  | 'interactive'
  | 'subtle'
  | 'elevated'
  | 'highlight';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: CardVariant;
  status?: 'default' | 'success' | 'warning' | 'critical' | 'info';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
  isClickable?: boolean;
  selected?: boolean;
  id?: string;
  className?: string;
}

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  iconTheme?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  badgeColor?: string;
  action?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'slate' | 'default';
  className?: string;
}

/**
 * Standardized SKANDA Enterprise Card Component.
 * Enforces unified padding (p-4 sm:p-5), standard border radius (rounded-xl),
 * consistent icon alignment, title typography, badge positioning, and hover states
 * across Dark and Light modes with zero text clipping.
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  status = 'default',
  padding = 'md',
  fullHeight = true,
  isClickable = false,
  selected = false,
  id,
  className = '',
  onClick,
  ...props
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  // Strict padding scale
  const paddingClass = {
    none: 'p-0',
    sm: 'p-3 sm:p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }[padding];

  // Base background & border styling
  let variantClasses = '';
  switch (variant) {
    case 'subtle':
      variantClasses = isLight
        ? 'bg-slate-50/80 border-slate-200/80'
        : 'bg-slate-900/40 border-slate-800/60';
      break;
    case 'elevated':
      variantClasses = isLight
        ? 'bg-white border-slate-300 shadow-sm'
        : 'bg-slate-900 border-slate-700 shadow-md';
      break;
    case 'highlight':
      variantClasses = isLight
        ? 'bg-white border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
        : 'bg-slate-900 border-blue-500 ring-1 ring-blue-500/30 shadow-md';
      break;
    case 'executive':
      variantClasses = isLight
        ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
        : 'bg-slate-900/90 border-slate-800 shadow-xs hover:border-slate-700';
      break;
    case 'risk':
      variantClasses = isLight
        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xs';
      break;
    case 'evidence':
    case 'compliance':
    case 'action':
    case 'analytics':
    case 'kpi':
    case 'status':
    case 'default':
    default:
      variantClasses = isLight
        ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300/90'
        : 'bg-slate-900/80 border-slate-800 shadow-xs hover:border-slate-700/80';
      break;
  }

  // Status border override
  if (status === 'critical') {
    variantClasses = isLight
      ? 'bg-white border-rose-300 shadow-2xs'
      : 'bg-slate-900/90 border-rose-900/60 shadow-xs';
  } else if (status === 'warning') {
    variantClasses = isLight
      ? 'bg-white border-amber-300 shadow-2xs'
      : 'bg-slate-900/90 border-amber-900/60 shadow-xs';
  } else if (status === 'success') {
    variantClasses = isLight
      ? 'bg-white border-emerald-300 shadow-2xs'
      : 'bg-slate-900/90 border-emerald-900/60 shadow-xs';
  } else if (status === 'info') {
    variantClasses = isLight
      ? 'bg-white border-blue-300 shadow-2xs'
      : 'bg-slate-900/90 border-blue-900/60 shadow-xs';
  }

  const clickableClasses =
    isClickable || onClick
      ? 'cursor-pointer hover:shadow-md transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500/50'
      : 'transition-colors duration-150';

  const selectedClasses = selected
    ? 'ring-2 ring-blue-600 border-blue-600 dark:ring-blue-500 dark:border-blue-500'
    : '';

  const heightClasses = fullHeight ? 'flex flex-col h-full min-h-0' : 'block';

  return (
    <div
      id={id}
      onClick={onClick}
      role={isClickable || onClick ? 'button' : undefined}
      tabIndex={isClickable || onClick ? 0 : undefined}
      onKeyDown={
        (isClickable || onClick) && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      className={`rounded-xl border ${variantClasses} ${paddingClass} ${clickableClasses} ${selectedClasses} ${heightClasses} relative min-w-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Standardized Card Header with optical icon-title-badge-action alignment.
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  icon,
  iconTheme,
  title,
  subtitle,
  description,
  badge,
  badgeColor,
  action,
  bordered = false,
  className = '',
  ...props
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';
  const subText = subtitle || description;

  if (icon || title || badge || action) {
    const isComponent = typeof icon === 'function';
    const IconComponent = isComponent ? (icon as any) : null;

    return (
      <div
        className={`flex items-start justify-between gap-3 min-w-0 ${
          bordered
            ? `pb-3 mb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`
            : 'mb-3'
        } ${className}`}
        {...props}
      >
        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
          {icon && (
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                iconTheme ||
                (isLight
                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                  : 'bg-blue-950/60 text-blue-400 border-blue-900/50')
              }`}
            >
              {IconComponent ? (
                <IconComponent className="w-4 h-4 shrink-0" />
              ) : React.isValidElement(icon) ? (
                icon
              ) : null}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {typeof title === 'string' ? (
                <h3
                  className={`text-sm sm:text-[15px] font-semibold tracking-tight truncate ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  {title}
                </h3>
              ) : (
                title
              )}
              {badge &&
                (typeof badge === 'string' ? (
                  <CardBadge variant={(badgeColor as any) || 'indigo'}>{badge}</CardBadge>
                ) : (
                  badge
                ))}
            </div>
            {subText && (
              <p
                className={`text-xs leading-relaxed line-clamp-2 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {subText}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0 flex items-center space-x-1.5">{action}</div>}
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 min-w-0 ${
        bordered
          ? `pb-3 mb-3 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`
          : 'mb-3'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  as: Component = 'h3',
  ...props
}) => {
  return (
    <Component
      className={`text-sm sm:text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p
      className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex-1 min-w-0 min-h-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Aliased for EnterpriseCard compatibility
export const CardBody = CardContent;

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  bordered = true,
  ...props
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  return (
    <div
      className={`mt-3.5 pt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 ${
        bordered ? `border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}` : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardBadge: React.FC<CardBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const getBadgeClasses = () => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      case 'sky':
      case 'indigo':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'slate':
      case 'default':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium border leading-none whitespace-nowrap shrink-0 ${getBadgeClasses()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Card;
