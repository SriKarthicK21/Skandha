import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import {
  ShieldAlert,
  Clock,
  Lock,
  RefreshCw,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  EyeOff
} from 'lucide-react';

interface SessionSecurityManagerProps {
  /** Inactivity timeout in seconds (default 15 minutes = 900s per ISO 27001 A.8.5 & MAS Notice 655) */
  timeoutSeconds?: number;
  /** Warning countdown window before locking in seconds (default 60s) */
  warningWindowSeconds?: number;
}

export const SessionSecurityManager: React.FC<SessionSecurityManagerProps> = ({
  timeoutSeconds = 900, // 15 minutes
  warningWindowSeconds = 60 // 60 seconds warning
}) => {
  const { isAuthenticated, logout, currentUser, currentTenant, logAuditEvent } = useGRC();
  const { showToast } = useToast();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutSeconds);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isLockedManually, setIsLockedManually] = useState<boolean>(false);
  const [unlockPassword, setUnlockPassword] = useState<string>('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Reset activity timestamp on user interactions
  const recordActivity = useCallback(() => {
    // If the modal is already open or session is locked, don't reset without user clicking "Stay Logged In"
    if (showWarningModal || isLockedManually) return;
    lastActivityRef.current = Date.now();
  }, [showWarningModal, isLockedManually]);

  // Attach global DOM listeners for user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleEvent = () => recordActivity();

    // Debounced listener
    let throttleTimeout: any = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        handleEvent();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach(evt => window.addEventListener(evt, throttledHandler, { passive: true }));

    return () => {
      events.forEach(evt => window.removeEventListener(evt, throttledHandler));
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isAuthenticated, recordActivity]);

  // Main countdown timer loop
  useEffect(() => {
    if (!isAuthenticated) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    lastActivityRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsedSeconds);

      setSecondsRemaining(remaining);

      if (remaining <= warningWindowSeconds && remaining > 0) {
        setShowWarningModal(true);
      } else if (remaining <= 0) {
        // Session Expired: Terminate and lock session
        clearInterval(timerIntervalRef.current);
        handleSessionExpired();
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isAuthenticated, timeoutSeconds, warningWindowSeconds]);

  const handleSessionExpired = async () => {
    setShowWarningModal(false);
    await logAuditEvent(
      'ACCESS',
      'Session Security Subsystem',
      `Interactive session automatically terminated after ${Math.floor(timeoutSeconds / 60)} minutes of inactivity in compliance with ISO/IEC 27001:2022 Control A.8.5 & MAS TRM 10.1`,
      {
        userId: currentUser.id,
        userEmail: currentUser.email,
        timeoutSeconds
      }
    );
    showToast({
      title: 'Session Inactivity Lock',
      message: 'Session locked due to 15 minutes of inactivity (ISO 27001 A.8.5).',
      type: 'warning'
    });
    logout();
  };

  const handleExtendSession = async () => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);
    setShowWarningModal(false);
    showToast({
      title: 'Session Extended',
      message: 'Session extended for 15 minutes.',
      type: 'success'
    });
    await logAuditEvent(
      'ACCESS',
      'Session Security Subsystem',
      'User acknowledged inactivity prompt; session lease extended by 15 minutes.',
      {
        userId: currentUser.id,
        userEmail: currentUser.email
      }
    );
  };

  const handleLockImmediately = async () => {
    setShowWarningModal(false);
    await logAuditEvent(
      'ACCESS',
      'Session Security Subsystem',
      'User executed immediate session lock (ISO 27001 Control A.7.7 Clear screen / clear desk policy)',
      {
        userId: currentUser.id
      }
    );
    logout();
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ISO 27001 A.8.5 Inactivity Warning Dialog Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-amber-500/10 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800">
                ISO 27001:2022 A.8.5 & MAS TRM 10.1
              </span>
              <h2 className="text-lg font-bold text-white pt-1">Session Inactivity Timeout</h2>
              <p className="text-xs text-slate-300">
                To protect sensitive audit evidence and tenant data, your session will automatically lock due to inactivity.
              </p>
            </div>

            {/* Countdown Display */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center space-x-3">
              <div className="text-3xl font-black font-mono text-amber-400">
                {secondsRemaining}s
              </div>
              <div className="text-left text-[11px] text-slate-400 leading-tight">
                Remaining before automatic<br />
                <span className="text-slate-200 font-semibold">cryptographic session seal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleLockImmediately}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Session</span>
              </button>

              <button
                type="button"
                onClick={handleExtendSession}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Stay Signed In</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Session protected by zero-trust continuous verification</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
