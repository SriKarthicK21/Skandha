import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  ShieldAlert,
  Calendar,
  User,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

interface CCMRiskWaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    controlCode: string;
    title: string;
    providerOrSystem: string;
    category?: string;
  };
  onWaiverApproved?: (waiverDetails: any) => void;
}

export const CCMRiskWaiverModal: React.FC<CCMRiskWaiverModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onWaiverApproved
}) => {
  const { currentTenant, logAuditEvent, theme } = useGRC();
  const { showToast } = useToast();

  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [businessJustification, setBusinessJustification] = useState<string>(
    'Scheduled upstream vendor telemetry daemon overhaul during migration window.'
  );
  const [compensatingControls, setCompensatingControls] = useState<string>(
    'Daily manual health checks performed by SecOps shift lead; external synthetic ping probe enabled with alert threshold at 15m.'
  );
  const [riskOwner, setRiskOwner] = useState<string>('Arjun Mehta, CISO');
  const [expirationDate] = useState<string>(thirtyDaysLater);
  const [riskSeverity, setRiskSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 600));

    const waiverId = `WVR-${Math.floor(1000 + Math.random() * 9000)}`;

    // Log to audit event trail
    logAuditEvent(
      'APPROVE',
      'Risk Waiver Engine',
      `Granted 30-day compliance risk waiver (${waiverId}) for control ${targetItem.controlCode} (${targetItem.providerOrSystem}). Valid until ${expirationDate}. Signed by ${riskOwner}.`
    );

    showToast({
      title: `Risk Waiver ${waiverId} Granted`,
      message: `30-Day waiver active until ${expirationDate}. Compensating controls verified.`,
      type: 'success'
    });

    if (onWaiverApproved) {
      onWaiverApproved({
        waiverId,
        controlCode: targetItem.controlCode,
        expirationDate,
        riskOwner,
        businessJustification,
        compensatingControls
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 ${
          theme === 'light'
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
            : 'bg-slate-900 border-slate-800 text-white shadow-black/80'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Request 30-Day Policy Risk Waiver</h3>
              <p className="text-[11px] text-slate-400">Formal regulatory risk exemption with compensating controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Control Info */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-indigo-400 font-bold">{targetItem.controlCode}</span>
            <span className="text-[10px] text-slate-400">{targetItem.providerOrSystem}</span>
          </div>
          <div className="text-slate-200 font-sans font-semibold">{targetItem.title}</div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Business Impact & Exemption Rationale
            </label>
            <textarea
              rows={2}
              value={businessJustification}
              onChange={e => setBusinessJustification(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Mandatory Compensating Security Controls
            </label>
            <textarea
              rows={2}
              value={compensatingControls}
              onChange={e => setCompensatingControls(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Authorized Risk Sign-Off
              </label>
              <input
                type="text"
                value={riskOwner}
                onChange={e => setRiskOwner(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl border outline-none ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Waiver Expiry (Strict 30-Day SLA)
              </label>
              <div className="px-3 py-1.5 rounded-xl border border-amber-800/40 bg-amber-950/20 text-amber-300 font-mono text-xs flex items-center justify-between">
                <span>{expirationDate}</span>
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-amber-900/30 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Recording Exemption...</span>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve 30-Day Risk Waiver</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
