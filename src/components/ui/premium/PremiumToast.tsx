import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export type PremiumToastType = 'success' | 'warning' | 'error' | 'info';

export interface PremiumToastProps {
  id: string;
  title: string;
  message?: string;
  type?: PremiumToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

export const PremiumToast: React.FC<PremiumToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 4000,
  onDismiss
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const Icon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertOctagon,
    info: Info
  }[type];

  const typeStyles = {
    success: 'border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400',
    warning: 'border-amber-200 dark:border-amber-800/80 bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400',
    error: 'border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400',
    info: 'border-blue-200 dark:border-blue-800/80 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400'
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`w-80 sm:w-96 rounded-xl border shadow-xl p-3.5 sm:p-4 flex items-start gap-3 relative overflow-hidden ${typeStyles}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0 space-y-0.5">
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h4>
        {message && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle Duration Progress Bar */}
      {duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 ${
            type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
          }`}
        />
      )}
    </motion.div>
  );
};

export default PremiumToast;
