import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, LucideIcon } from 'lucide-react';
import { useGRC } from '../../../context/GRCContext';

export interface PremiumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconTheme?: string;
  width?: 'md' | 'lg' | 'xl' | '2xl';
  onBack?: () => void;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PremiumDrawer: React.FC<PremiumDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon: Icon,
  iconTheme,
  width = 'lg',
  onBack,
  actions,
  footer,
  children,
  className = ''
}) => {
  const { theme } = useGRC();
  const isLight = theme === 'light';

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

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl'
  }[width];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            className={`relative w-full ${widthClasses} bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 overflow-hidden ${className}`}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Go back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}

                {Icon && (
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
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
                  <div className="flex items-center gap-2">
                    {badge}
                    {typeof title === 'string' ? (
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {title}
                      </h2>
                    ) : (
                      title
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {actions}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PremiumDrawer;
