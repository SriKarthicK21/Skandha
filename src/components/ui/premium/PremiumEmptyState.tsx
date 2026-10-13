// ============================================================================
// SKANDA ENTERPRISE GRC: PREMIUM EMPTY STATE COMPONENT
// Path: src/components/ui/premium/PremiumEmptyState.tsx
//
// Actionable, helpful empty states with clear iconography, contextual explanation,
// and prominent primary Call to Action (CTA) buttons.
// ============================================================================

import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

export interface PremiumEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  suggestedActionHint?: string;
  className?: string;
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  suggestedActionHint,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {suggestedActionHint && (
        <div className="mb-6 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{suggestedActionHint}</span>
        </div>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {secondaryActionLabel && onSecondaryAction && (
            <PremiumButton variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </PremiumButton>
          )}
          {actionLabel && onAction && (
            <PremiumButton variant="primary" onClick={onAction}>
              {actionLabel}
            </PremiumButton>
          )}
        </div>
      )}
    </motion.div>
  );
};
