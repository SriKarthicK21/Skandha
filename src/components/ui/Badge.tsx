import React from 'react';

export type StatusBadgeType =
  | 'compliant'
  | 'non-compliant'
  | 'in-progress'
  | 'pending'
  | 'draft'
  | 'info'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: StatusBadgeType;
  showDot?: boolean;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

/**
 * Status palette, expressed with the shared semantic status tokens declared in
 * src/index.css (@theme inline + the per-theme status families). Status colour
 * and status meaning are therefore defined once for the whole product instead
 * of being re-typed as literal light/dark hex pairs in each component.
 *
 * Every class below is written as a complete literal on purpose: Tailwind scans
 * source text, so a class assembled from parts (`bg-status-${family}-wash`) would
 * never be generated and the badge would render unstyled.
 */
const statusConfig: Record<
  StatusBadgeType,
  { bg: string; text: string; border: string; dot: string }
> = {
  compliant: {
    bg: 'bg-status-ok-wash',
    text: 'text-status-ok-ink',
    border: 'border-status-ok-border',
    dot: 'bg-status-ok-dot'
  },
  'non-compliant': {
    bg: 'bg-status-bad-wash',
    text: 'text-status-bad-ink',
    border: 'border-status-bad-border',
    dot: 'bg-status-bad-dot'
  },
  critical: {
    bg: 'bg-status-bad-wash',
    text: 'text-status-bad-ink',
    border: 'border-status-bad-border',
    dot: 'bg-status-bad-dot'
  },
  high: {
    bg: 'bg-status-bad-wash',
    text: 'text-status-bad-ink',
    border: 'border-status-bad-border',
    dot: 'bg-status-bad-dot'
  },
  pending: {
    bg: 'bg-status-warn-wash',
    text: 'text-status-warn-ink',
    border: 'border-status-warn-border',
    dot: 'bg-status-warn-dot'
  },
  medium: {
    bg: 'bg-status-warn-wash',
    text: 'text-status-warn-ink',
    border: 'border-status-warn-border',
    dot: 'bg-status-warn-dot'
  },
  low: {
    // "Low" is a residual-risk level rather than a warning: it keeps the softer
    // dot so it cannot be confused with "medium" at a glance.
    bg: 'bg-status-warn-wash',
    text: 'text-status-warn-ink',
    border: 'border-status-warn-border',
    dot: 'bg-[#CA8A04] dark:bg-[#FACC15]'
  },
  info: {
    bg: 'bg-status-info-wash',
    text: 'text-status-info-ink',
    border: 'border-status-info-border',
    dot: 'bg-status-info-dot'
  },
  'in-progress': {
    bg: 'bg-accent-wash',
    text: 'text-accent',
    border: 'border-accent-border',
    dot: 'bg-accent'
  },
  draft: {
    bg: 'bg-status-neutral-wash',
    text: 'text-status-neutral-ink',
    border: 'border-status-neutral-border',
    dot: 'bg-status-neutral-dot'
  }
};

/**
 * Standardized SKANDA Enterprise Status Badge.
 * Status is carried by the text label as well as the colour; the dot is
 * decorative so the badge is never colour-only.
 */
export const Badge: React.FC<BadgeProps> = ({
  status = 'draft',
  showDot = true,
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClasses =
    size === 'sm'
      ? 'h-6 px-2.5 text-[11px] font-semibold gap-1.5'
      : 'h-7 px-3 text-xs font-semibold gap-2';

  return (
    <span
      data-status={status}
      className={`inline-flex items-center justify-center rounded-full border leading-none shrink-0 select-none ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
