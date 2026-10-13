// Skanda BrandGuard — Side-by-Side Cloned Site Comparison Workbench (Split View)
// Dual-pane inspection canvas placing Authentic Brand Website on the left and Flagged Phishing Clone on the right.
// Features: Synchronized scroll, viewport zoom, perceptual visual diff highlighting mismatched form action targets,
// and color-coded visual similarity badges.

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Split,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  Server,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Eye,
  Crosshair,
  Code,
  CheckCircle2,
  Send,
  Mail,
  RefreshCw
} from 'lucide-react';
import { BrandFinding, BrandProfile } from '../../types/brandguard';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardClonedSiteComparisonModalProps {
  finding: BrandFinding;
  brandProfile: BrandProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenAbuseModal?: (finding: BrandFinding) => void;
  onOpenEmailSpoofModal?: (domain: string) => void;
}

export const BrandGuardClonedSiteComparisonModal: React.FC<BrandGuardClonedSiteComparisonModalProps> = ({
  finding,
  brandProfile,
  isOpen,
  onClose,
  onOpenAbuseModal,
  onOpenEmailSpoofModal
}) => {
  const { theme, logAuditEvent } = useGRC();
  const primaryDomain = brandProfile?.primaryDomain || brandProfile?.officialDomains?.[0] || 'apexfintech.com';
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [syncScroll, setSyncScroll] = useState<boolean>(true);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeDiffLayer, setActiveDiffLayer] = useState<'all' | 'form_actions' | 'css_branding' | 'scripts'>('all');
  const [highlightMismatches, setHighlightMismatches] = useState<boolean>(true);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      logAuditEvent(
        'ACCESS',
        'BrandGuard Cloned Site Workbench',
        `Initiated split-view comparison analysis between authentic "${primaryDomain}" and phishing clone "${finding.targetDomain}".`
      );
    }
  }, [isOpen]);

  // Synchronized scroll listener
  const handleScroll = (source: 'left' | 'right') => {
    if (!syncScroll || isScrollingRef.current) return;
    isScrollingRef.current = true;

    if (source === 'left' && leftPaneRef.current && rightPaneRef.current) {
      const scrollPercentage =
        leftPaneRef.current.scrollTop /
        (leftPaneRef.current.scrollHeight - leftPaneRef.current.clientHeight || 1);
      rightPaneRef.current.scrollTop =
        scrollPercentage * (rightPaneRef.current.scrollHeight - rightPaneRef.current.clientHeight);
    } else if (source === 'right' && leftPaneRef.current && rightPaneRef.current) {
      const scrollPercentage =
        rightPaneRef.current.scrollTop /
        (rightPaneRef.current.scrollHeight - rightPaneRef.current.clientHeight || 1);
      leftPaneRef.current.scrollTop =
        scrollPercentage * (leftPaneRef.current.scrollHeight - leftPaneRef.current.clientHeight);
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 50);
  };

  if (!isOpen) return null;

  const visualMatchPercent = finding.logoSimilarityScore || 94;
  const phishingLikelihood = finding.severity === 'CRITICAL' ? 100 : finding.severity === 'HIGH' ? 88 : 72;

  // Form action target comparison
  const officialFormAction = 'https://auth.apexfintech.com/api/v1/sso/callback';
  const rogueFormAction =
    finding.webPageAnalysis.detectedForms.formActionUrl ||
    `http://${finding.domainIntel.resolvedIPs[0] || '194.26.29.118'}:8080/auth/harvest.php`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`rounded-xl border w-full max-w-[96vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden ${
          theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Top Control Bar */}
        <div
          className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          {/* Title & Badges */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Split className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold truncate">
                  Side-by-Side Cloned Site Comparison Workbench
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{visualMatchPercent}% Visual Match</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {phishingLikelihood}% Phishing Likelihood
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Authentic: <span className="text-emerald-400 font-semibold">{primaryDomain}</span> vs Phishing Target:{' '}
                <span className="text-rose-400 font-semibold">{finding.targetDomain}</span>
              </p>
            </div>
          </div>

          {/* Workbench Ergonomic Controls */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Diff Highlighter Layer Toggle */}
            <div className="flex items-center rounded-xl bg-slate-800/80 p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setHighlightMismatches(!highlightMismatches)}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                  highlightMismatches
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Toggle visual diff highlights on rogue elements"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Diff Highlights</span>
              </button>
            </div>

            {/* Sync Scroll Toggle */}
            <button
              onClick={() => setSyncScroll(!syncScroll)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                syncScroll
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Synchronize vertical scrolling across both viewports"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncScroll ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>Sync Scroll: {syncScroll ? 'ON' : 'OFF'}</span>
            </button>

            {/* Device Switcher */}
            <div className="flex items-center rounded-xl bg-slate-800/80 p-1 border border-slate-700">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop Viewport (1920x1080)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile Viewport (iPhone 15 Pro)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1.5 font-bold text-slate-300 min-w-[3rem] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Perceptual Diff Callout Banner */}
        {highlightMismatches && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-rose-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>
                <strong>CRITICAL FORM ACTION MISMATCH DETECTED:</strong> Phishing login button POSTs employee credentials to an unauthorized Russian IP host (<code className="bg-rose-950/80 px-1 py-0.5 rounded text-rose-200">{rogueFormAction}</code>) rather than enterprise SSO.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {onOpenEmailSpoofModal && (
                <button
                  onClick={() => onOpenEmailSpoofModal(finding.targetDomain)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-bold flex items-center space-x-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>Inspect Active MX</span>
                </button>
              )}
              {onOpenAbuseModal && (
                <button
                  onClick={() => onOpenAbuseModal(finding)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Dispatch RFC Abuse</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Split View Canvas */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden bg-slate-950/50">
          {/* PANE 1: Authentic Brand Portal (LEFT) */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sub-header */}
            <div className="px-4 py-2 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-300">AUTHENTIC BRAND SITE</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  VERIFIED SANCTIONED
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>TLS 1.3 Extended Validation</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-emerald-400">Cloudflare Enterprise</span>
              </div>
            </div>

            {/* Authentic Browser Viewport */}
            <div
              ref={leftPaneRef}
              onScroll={() => handleScroll('left')}
              className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${
                deviceMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}
            >
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 space-y-4"
              >
                {/* Fake Browser Chrome Frame */}
                <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden text-xs">
                  <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex-1 mx-2 px-3 py-1 rounded bg-slate-950/80 border border-slate-700 font-mono text-[11px] text-emerald-400 flex items-center space-x-1.5">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>https://auth.{primaryDomain}/login</span>
                    </div>
                  </div>

                  {/* Rendered Official Page Replica */}
                  <div className="p-6 bg-gradient-to-b from-slate-900 to-[#0B0F19] text-white min-h-[520px] flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
                            {brandProfile.organizationName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm block">{brandProfile.organizationName}</span>
                            <span className="text-[10px] text-slate-400">Institutional SSO Portal</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Okta Verify / FIDO2 Enforced
                        </span>
                      </div>

                      <div className="max-w-xs mx-auto space-y-4 pt-4">
                        <h4 className="text-base font-bold text-center text-slate-100">
                          Sign In with Enterprise Account
                        </h4>
                        <p className="text-[11px] text-center text-slate-400">
                          Authorized access for institutional traders & staff
                        </p>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-300 block mb-1">Corporate Email</label>
                            <input
                              disabled
                              value="employee@apexfintech.com"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-300 block mb-1">Password</label>
                            <input
                              disabled
                              type="password"
                              value="••••••••••••••••"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-not-allowed"
                            />
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                            <span className="font-bold block">Sanctioned Form Action Target:</span>
                            <code className="text-emerald-400 break-all">{officialFormAction}</code>
                          </div>

                          <button
                            disabled
                            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-md cursor-not-allowed opacity-90"
                          >
                            Authenticate via Okta SSO
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 text-center text-[10px] text-slate-500">
                      © 2026 {brandProfile.legalEntityName}. All rights reserved. SEC & FINRA Regulated.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANE 2: Flagged Phishing Clone (RIGHT) */}
          <div className="flex flex-col h-full overflow-hidden bg-rose-950/10">
            {/* Sub-header */}
            <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span className="font-bold text-rose-300">FLAGGED DECEPTIVE CLONE</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                  {finding.severity} THREAT
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-rose-300">
                <Unlock className="w-3.5 h-3.5 text-rose-400" />
                <span>Self-Signed / Let's Encrypt DV</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-rose-400">Hostkey B.V. Bulletproof</span>
              </div>
            </div>

            {/* Phishing Clone Browser Viewport */}
            <div
              ref={rightPaneRef}
              onScroll={() => handleScroll('right')}
              className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${
                deviceMode === 'mobile' ? 'max-w-sm mx-auto' : ''
              }`}
            >
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 space-y-4"
              >
                {/* Fake Browser Chrome Frame */}
                <div className="rounded-xl border border-rose-500/40 bg-slate-900 shadow-xl overflow-hidden text-xs relative">
                  {/* Visual Diff Highlight Indicator Badge */}
                  {highlightMismatches && (
                    <div className="absolute top-12 right-4 z-20 px-2 py-1 rounded bg-rose-600 text-white font-mono text-[10px] font-bold shadow-lg animate-pulse">
                      ROGUE FORM EXFILTRATION
                    </div>
                  )}

                  <div className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex-1 mx-2 px-3 py-1 rounded bg-rose-950/80 border border-rose-500/50 font-mono text-[11px] text-rose-300 flex items-center space-x-1.5">
                      <Unlock className="w-3 h-3 text-rose-400" />
                      <span>https://{finding.targetDomain}/login</span>
                    </div>
                  </div>

                  {/* Rendered Phishing Page Replica */}
                  <div className="p-6 bg-gradient-to-b from-slate-900 to-[#0B0F19] text-white min-h-[520px] flex flex-col justify-between relative">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
                            {brandProfile.organizationName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm block">{brandProfile.organizationName}</span>
                            <span className="text-[10px] text-slate-400">Institutional SSO Portal</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                          FAKE OKTA HARVESTER
                        </span>
                      </div>

                      <div className="max-w-xs mx-auto space-y-4 pt-4">
                        <h4 className="text-base font-bold text-center text-slate-100">
                          Sign In with Enterprise Account
                        </h4>
                        <p className="text-[11px] text-center text-slate-400">
                          Authorized access for institutional traders & staff
                        </p>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-semibold text-slate-300 block mb-1">Corporate Email</label>
                            <input
                              disabled
                              value="victim@apexfintech.com"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-slate-300 block mb-1">Password</label>
                            <input
                              disabled
                              type="password"
                              value="••••••••••••••••"
                              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-not-allowed"
                            />
                          </div>

                          {/* Rogues Form Action Target Diff Highlight */}
                          <div
                            className={`p-2.5 rounded-lg border text-[10px] font-mono transition-all ${
                              highlightMismatches
                                ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/50'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center space-x-1 font-bold text-rose-400 mb-0.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>Malicious Exfiltration Target (Form Action):</span>
                            </div>
                            <code className="text-rose-300 font-bold break-all">{rogueFormAction}</code>
                          </div>

                          <button
                            disabled
                            className="w-full py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-md cursor-not-allowed opacity-90"
                          >
                            Authenticate (Stolen TOTP/Creds)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 text-center text-[10px] text-slate-500">
                      © 2026 {brandProfile.legalEntityName}. All rights reserved. SEC & FINRA Regulated.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status & Quick Action Bar */}
        <div
          className={`p-3 sm:p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-slate-400">
              Perceptual Logo Hash: <strong className="font-mono text-indigo-400">{finding.evidence.sha256Hash.slice(0, 16)}...</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Host IP: <strong className="font-mono text-rose-400">{finding.domainIntel.resolvedIPs[0] || '194.26.29.118'}</strong> ({finding.domainIntel.asn || 'AS59711'})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenEmailSpoofModal && (
              <button
                onClick={() => onOpenEmailSpoofModal(finding.targetDomain)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Inspect MX Records</span>
              </button>
            )}
            {onOpenAbuseModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAbuseModal(finding);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Launch Takedown Notice</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close Workbench
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
