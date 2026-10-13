import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  complianceToastService,
  ComplianceToastPayload,
  ToastActionDefinition
} from '../../services/compliance/ComplianceToastService';
import { brandGuardNotificationService } from '../../services/brandguard/brandguardNotificationService';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type: ToastType;
  duration?: number;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  controlCode?: string;
  badgeText?: string;
  action?: ToastActionDefinition;
  secondaryAction?: ToastActionDefinition;
  metadata?: Record<string, any>;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: Toast = { ...toast, id };
    setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5 toasts

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Connect enterprise ComplianceToastService & BrandGuardNotificationService to UI toast rendering
  useEffect(() => {
    const unregisterCompliance = complianceToastService.registerToastHandler(payload => {
      showToast(payload);
    });
    const stopCompliance = complianceToastService.startAutoListening();

    const unregisterBrandGuard = brandGuardNotificationService.registerToastHandler(payload => {
      showToast(payload as any);
    });
    const stopBrandGuard = brandGuardNotificationService.startAutoListening();

    return () => {
      unregisterCompliance();
      stopCompliance();
      unregisterBrandGuard();
      stopBrandGuard();
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
          error: toast.severity ? (
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          ),
          warning: toast.severity ? (
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          ),
          info: <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
        };

        const borderStyles = {
          success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-emerald-950/20',
          error: 'border-rose-500/30 bg-slate-900/95 text-slate-100 shadow-rose-950/20',
          warning: 'border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-amber-950/20',
          info: 'border-sky-500/30 bg-slate-900/95 text-slate-100 shadow-sky-950/20'
        };

        const severityBadgeStyles = {
          CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          MEDIUM: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          LOW: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${borderStyles[toast.type]}`}
          >
            <div className="flex items-start space-x-2.5 min-w-0 pr-2 flex-1">
              {icons[toast.type]}
              <div className="text-xs min-w-0 flex-1">
                {/* Badges for Compliance Breaches & Control Codes */}
                {(toast.severity || toast.controlCode || toast.badgeText) && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {toast.severity && (
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          severityBadgeStyles[toast.severity]
                        }`}
                      >
                        {toast.severity} BREACH
                      </span>
                    )}
                    {toast.controlCode && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {toast.controlCode}
                      </span>
                    )}
                    {toast.badgeText && !toast.severity && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {toast.badgeText}
                      </span>
                    )}
                  </div>
                )}

                <p className="font-semibold text-white leading-tight">{toast.title}</p>
                {(toast.message || toast.description) && (
                  <p className="text-[11px] text-slate-300 mt-1 leading-normal break-words">
                    {toast.message || toast.description}
                  </p>
                )}

                {/* Interactive Toast Actions */}
                {toast.action && (
                  <div className="mt-2.5 flex items-center space-x-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toast.action?.onClick();
                        onRemove(toast.id);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
                    >
                      <span>{toast.action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {toast.secondaryAction && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toast.secondaryAction?.onClick();
                          onRemove(toast.id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white transition px-2 py-1 cursor-pointer"
                      >
                        {toast.secondaryAction.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-slate-400 hover:text-white transition p-0.5 -mr-1 -mt-1 rounded hover:bg-slate-800 shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
