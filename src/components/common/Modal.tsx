import React, { useEffect, useRef } from 'react';
import { X, LucideIcon } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon | React.ReactNode;
  iconTheme?: string;
  badge?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  id?: string;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

/**
 * Standardized SKANDA Enterprise Modal Component.
 * Enforces unified viewport centering, standardized backdrop blur,
 * responsive width scaling, consistent header-body-footer padding,
 * and seamless Dark/Light theme adaptability.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconTheme,
  badge,
  size = 'lg',
  children,
  footer,
  className = '',
  id,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-3xl';
      case '2xl':
        return 'max-w-4xl';
      case '3xl':
        return 'max-w-5xl';
      case '4xl':
        return 'max-w-6xl';
      case '5xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-[95vw] h-[92vh]';
      default:
        return 'max-w-2xl';
    }
  };

  const isLucide = typeof icon === 'function';
  const IconElement = isLucide ? (icon as LucideIcon) : null;

  return (
    <div
      id={id ? `${id}-overlay` : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        id={id}
        className={`relative w-full ${getSizeClasses()} max-h-[90vh] flex flex-col rounded-2xl border transition-all duration-200 bg-surface border-stroke text-ink shadow-2xl overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-stroke shrink-0 bg-[#F8FAFC] dark:bg-[#162033]">
            <div className="flex items-center space-x-3 min-w-0 pr-2">
              {icon && (
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    iconTheme || 'bg-accent-wash text-accent border-accent-border'
                  }`}
                >
                  {IconElement ? <IconElement className="w-4 h-4 shrink-0" /> : (React.isValidElement(icon) ? icon : null)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {typeof title === 'string' ? (
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-ink truncate">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {badge && (
                    <span className="shrink-0">{badge}</span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-ink-2 truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors text-ink-3 hover:text-ink hover:bg-slate-200/60 dark:hover:bg-[#1E293B] border border-transparent hover:border-stroke-strong shrink-0 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ring/50"
                aria-label="Close modal"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-[#CBD5E1] dark:scrollbar-thumb-[#273449]">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 sm:px-6 border-t border-stroke shrink-0 bg-[#F8FAFC] dark:bg-[#162033]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
