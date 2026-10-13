import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, X, ChevronDown, Check, Sparkles } from 'lucide-react';
import { PIMSImplementationStatus } from '../../data/iso27701MasterData';

export interface PIMSStatusIndicatorBadgeProps {
  status: PIMSImplementationStatus;
  applicable?: boolean;
  isRecentlyUpdated?: boolean;
  onChangeStatus?: (newStatus: PIMSImplementationStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  showDropdownArrow?: boolean;
  showFeedbackLabel?: boolean;
  theme?: string;
  className?: string;
  id?: string;
}

export const PIMSStatusIndicatorBadge: React.FC<PIMSStatusIndicatorBadgeProps> = ({
  status,
  applicable = true,
  isRecentlyUpdated = false,
  onChangeStatus,
  disabled = false,
  size = 'md',
  showDropdownArrow = true,
  showFeedbackLabel = true,
  theme = 'dark',
  className = '',
  id
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleSelectStatus = (newStatus: PIMSImplementationStatus) => {
    setMenuOpen(false);
    if (newStatus !== status && onChangeStatus) {
      onChangeStatus(newStatus);
    }
  };

  // Status color mappings
  const getBadgeColors = (st: PIMSImplementationStatus) => {
    switch (st) {
      case 'Implemented':
        return theme === 'light'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25';
      case 'Partially Implemented':
        return theme === 'light'
          ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100/80'
          : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25';
      case 'Not Applicable':
      default:
        return theme === 'light'
          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200/80'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30 hover:bg-slate-500/25';
    }
  };

  // Subtle glow ring when recently updated
  const getGlowRing = () => {
    if (!isRecentlyUpdated) return '';
    switch (status) {
      case 'Implemented':
        return 'ring-2 ring-emerald-500/60 ring-offset-1 shadow-sm shadow-emerald-500/20 ring-offset-white dark:ring-offset-slate-900';
      case 'Partially Implemented':
        return 'ring-2 ring-amber-500/60 ring-offset-1 shadow-sm shadow-amber-500/20 ring-offset-white dark:ring-offset-slate-900';
      case 'Not Applicable':
      default:
        return 'ring-2 ring-slate-400/60 ring-offset-1 shadow-sm shadow-slate-400/20 ring-offset-white dark:ring-offset-slate-900';
    }
  };

  const isInteractive = Boolean(onChangeStatus) && !disabled;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Animated Badge Container */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.button
          key={status}
          id={id}
          type="button"
          disabled={!isInteractive}
          onClick={() => isInteractive && setMenuOpen(prev => !prev)}
          initial={{ scale: 0.90, opacity: 0.7 }}
          animate={{ scale: [0.90, 1.04, 1], opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{
            duration: 0.32,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={`group inline-flex items-center space-x-1.5 border rounded-md font-bold transition-all duration-300 ease-out select-none ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
          } ${getBadgeColors(status)} ${getGlowRing()} ${
            isInteractive ? 'cursor-pointer hover:shadow-xs active:scale-95' : 'cursor-default'
          }`}
          title={isInteractive ? `Current status: ${status}. Click to change.` : `Status: ${status}`}
        >
          {/* Animated Icon */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={status}
              initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 25, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="inline-flex items-center justify-center shrink-0"
            >
              {status === 'Implemented' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              {status === 'Partially Implemented' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              {status === 'Not Applicable' && <X className="w-3.5 h-3.5 text-slate-400" />}
            </motion.span>
          </AnimatePresence>

          {/* Animated Status Text */}
          <motion.span
            key={`${status}-label`}
            initial={{ opacity: 0.5, y: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="tracking-tight whitespace-nowrap"
          >
            {status}
          </motion.span>

          {/* Optional Interactive Chevron Indicator */}
          {isInteractive && showDropdownArrow && (
            <ChevronDown className={`w-3 h-3 opacity-50 group-hover:opacity-100 transition-transform duration-200 ${
              menuOpen ? 'rotate-180' : 'rotate-0'
            }`} />
          )}
        </motion.button>
      </AnimatePresence>

      {/* Visual Feedback Pill for Recent Updates */}
      <AnimatePresence>
        {isRecentlyUpdated && showFeedbackLabel && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
            className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-1.5 shrink-0 select-none"
          >
            <Sparkles className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
            <span>Updated</span>
          </motion.span>
        )}
      </AnimatePresence>

      {/* Quick Status Selection Dropdown Popover */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute left-0 top-full mt-1.5 z-40 w-56 p-1.5 rounded-xl border shadow-xl backdrop-blur-md ${
              theme === 'light'
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
                : 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/60'
            }`}
          >
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800 mb-1">
              Update Implementation Status
            </div>

            <div className="space-y-0.5">
              {/* Option 1: Implemented */}
              <button
                type="button"
                onClick={() => handleSelectStatus('Implemented')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === 'Implemented'
                    ? theme === 'light'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-emerald-500/20 text-emerald-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <div className="leading-tight">Implemented</div>
                    <div className="text-[10px] font-normal text-slate-400">Compliant & active</div>
                  </div>
                </div>
                {status === 'Implemented' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </button>

              {/* Option 2: Partially Implemented */}
              <button
                type="button"
                onClick={() => handleSelectStatus('Partially Implemented')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === 'Partially Implemented'
                    ? theme === 'light'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-amber-500/20 text-amber-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="text-left">
                    <div className="leading-tight">Partially Implemented</div>
                    <div className="text-[10px] font-normal text-slate-400">Under progressive rollout</div>
                  </div>
                </div>
                {status === 'Partially Implemented' && <Check className="w-3.5 h-3.5 text-amber-500" />}
              </button>

              {/* Option 3: Not Applicable */}
              <button
                type="button"
                onClick={() => handleSelectStatus('Not Applicable')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === 'Not Applicable'
                    ? theme === 'light'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-800 text-slate-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="text-left">
                    <div className="leading-tight">Not Applicable</div>
                    <div className="text-[10px] font-normal text-slate-400">Formal PIMS exclusion</div>
                  </div>
                </div>
                {status === 'Not Applicable' && <Check className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
