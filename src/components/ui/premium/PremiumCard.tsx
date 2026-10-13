import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { useGRC } from '../../../context/GRCContext';

export interface PremiumCardProps extends HTMLMotionProps<'div'> {
  elevation?: 1 | 2 | 3;
  status?: 'default' | 'success' | 'warning' | 'critical' | 'info';
  statusBorder?: boolean;
  isInteractive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
  selected?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  elevation = 1,
  status = 'default',
  statusBorder = false,
  isInteractive = false,
  padding = 'md',
  fullHeight = true,
  selected = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  // Padding classes
  const paddingClass = {
    none: 'p-0',
    sm: 'p-3 sm:p-3.5',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6'
  }[padding];

  // Elevation surfaces
  const elevationClasses = elevation === 2
    ? isLight
      ? 'bg-white border-slate-300/80 shadow-xs hover:shadow-md'
      : 'bg-slate-900 border-slate-700/80 shadow-sm hover:shadow-md'
    : elevation === 3
    ? isLight
      ? 'bg-white border-slate-300 shadow-md'
      : 'bg-slate-900 border-slate-700 shadow-xl'
    : isLight
    ? 'bg-white border-slate-200/90 hover:border-slate-300/90 shadow-2xs'
    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80 shadow-xs';

  // Semantic Status Borders
  let statusClasses = '';
  if (status === 'critical') {
    statusClasses = isLight
      ? 'border-rose-300 bg-rose-50/20 shadow-2xs'
      : 'border-rose-900/60 bg-rose-950/10 shadow-xs';
  } else if (status === 'warning') {
    statusClasses = isLight
      ? 'border-amber-300 bg-amber-50/20 shadow-2xs'
      : 'border-amber-900/60 bg-amber-950/10 shadow-xs';
  } else if (status === 'success') {
    statusClasses = isLight
      ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
      : 'border-emerald-900/60 bg-emerald-950/10 shadow-xs';
  } else if (status === 'info') {
    statusClasses = isLight
      ? 'border-blue-300 bg-blue-50/20 shadow-2xs'
      : 'border-blue-900/60 bg-blue-950/10 shadow-xs';
  }

  const selectedClasses = selected
    ? 'ring-2 ring-blue-600 border-blue-600 dark:ring-blue-500 dark:border-blue-500'
    : '';

  const heightClasses = fullHeight ? 'flex flex-col h-full min-h-0' : 'block';

  return (
    <motion.div
      whileHover={(isInteractive || onClick) ? { y: -2, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] } } : undefined}
      whileTap={(isInteractive || onClick) ? { y: 1 } : undefined}
      onClick={onClick}
      className={`rounded-xl border ${elevationClasses} ${statusClasses} ${selectedClasses} ${paddingClass} ${heightClasses} relative min-w-0 transition-colors duration-150 ${
        (isInteractive || onClick) ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {/* Optional Top Status Accent Bar */}
      {statusBorder && status !== 'default' && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
            status === 'critical'
              ? 'bg-rose-500'
              : status === 'warning'
              ? 'bg-amber-500'
              : status === 'success'
              ? 'bg-emerald-500'
              : 'bg-blue-500'
          }`}
        />
      )}
      {children}
    </motion.div>
  );
};

export interface PremiumCardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  iconTheme?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'slate' | 'default';
  action?: React.ReactNode;
  bordered?: boolean;
}

export const PremiumCardHeader: React.FC<PremiumCardHeaderProps> = ({
  children,
  icon,
  iconTheme,
  title,
  subtitle,
  description,
  badge,
  badgeColor = 'default',
  action,
  bordered = false,
  className = '',
  ...props
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';
  const subText = subtitle || description;

  const isComponent = typeof icon === 'function';
  const IconComponent = isComponent ? (icon as any) : null;

  return (
    <div
      className={`flex items-start justify-between gap-3 min-w-0 ${
        bordered
          ? `pb-3 mb-3.5 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`
          : 'mb-3.5'
      } ${className}`}
      {...props}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        {icon && (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
              iconTheme ||
              (isLight
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-slate-800 text-slate-300 border-slate-700')
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
          <div className="flex items-center gap-2 flex-wrap">
            {typeof title === 'string' ? (
              <h3 className="text-sm sm:text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                {title}
              </h3>
            ) : (
              title
            )}
            {badge && (
              <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-md border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {subText}
            </p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0 flex items-center gap-1.5">{action}</div>}
      {children}
    </div>
  );
};

export const PremiumCardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
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

export const PremiumCardFooter: React.FC<{
  children: React.ReactNode;
  bordered?: boolean;
  className?: string;
}> = ({
  children,
  bordered = true,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  return (
    <div
      className={`mt-3.5 pt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 ${
        bordered ? `border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}` : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default PremiumCard;
