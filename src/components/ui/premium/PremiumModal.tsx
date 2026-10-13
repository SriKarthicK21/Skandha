import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LucideIcon } from 'lucide-react';
import { useGRC } from '../../../context/GRCContext';

export type PremiumModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl' | 'full';

export interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconTheme?: string;
  size?: PremiumModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconTheme,
  size = 'lg',
  children,
  footer,
  showCloseButton = true,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    '5xl': 'max-w-6xl',
    full: 'max-w-[96vw] max-h-[94vh]'
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${sizeClasses} rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto max-h-[90vh] z-10 overflow-hidden ${className}`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-start gap-3 min-w-0">
                  {Icon && (
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        iconTheme ||
                        (isLight
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-blue-950/60 text-blue-400 border-blue-900/60')
                      }`}
                    >
                      {typeof Icon === 'function' ? <Icon className="w-4 h-4" /> : Icon}
                    </div>
                  )}
                  <div className="min-w-0 space-y-0.5">
                    {typeof title === 'string' ? (
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {title}
                      </h2>
                    ) : (
                      title
                    )}
                    {subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 min-h-0 space-y-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumModal;
