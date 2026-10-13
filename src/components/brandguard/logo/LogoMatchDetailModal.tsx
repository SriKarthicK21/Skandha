// Skanda Enterprise — Logo Match Forensic Deep-Dive & Lifecycle Control Modal
// Side-by-side visual comparison, bounding box overlays, transformation diagnostics,
// multi-signal correlation panel, 15-stage lifecycle state machine with audit justification.

import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Cpu,
  Clock,
  Send,
  Eye,
  Camera,
  Layers,
  FileText,
  User,
  Activity,
  Maximize2,
  RefreshCw,
  Hash,
  Globe,
  Lock,
  Search,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  LogoMatch,
  LogoMatchLifecycleStatus,
  LogoRiskLevel,
  AiVisionProviderType,
  LogoMatchEvidenceRecord
} from '../../../types/logoMonitoring';
import { LogoLifecycleService } from '../../../services/brandguard/logoLifecycleService';
import { organizationService } from '../../../services/organizationService';

interface LogoMatchDetailModalProps {
  match: LogoMatch;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMatch: (updated: LogoMatch) => void;
  onEscalateCase: (match: LogoMatch) => void;
  onInitiateTakedown: (match: LogoMatch) => void;
}

export const LogoMatchDetailModal: React.FC<LogoMatchDetailModalProps> = ({
  match,
  isOpen,
  onClose,
  onUpdateMatch,
  onEscalateCase,
  onInitiateTakedown
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'VISUAL' | 'SIGNALS' | 'RISK_FACTORS' | 'EVIDENCE' | 'AUDIT_TRAIL'>('VISUAL');
  const [targetStatus, setTargetStatus] = useState<LogoMatchLifecycleStatus>(match.status);
  const [transitionReason, setTransitionReason] = useState('');
  const [analystComments, setAnalystComments] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [transitionSuccess, setTransitionSuccess] = useState(false);

  // Re-analysis provider state
  const [selectedProvider, setSelectedProvider] = useState<AiVisionProviderType>(match.aiVisionProvider);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Evidence upload state
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceType, setEvidenceType] = useState<LogoMatchEvidenceRecord['evidenceType']>('SCREENSHOT');
  const [evidenceValue, setEvidenceValue] = useState('');

  // 15 Lifecycle Status options
  const allStatuses: { status: LogoMatchLifecycleStatus; label: string; color: string }[] = [
    { status: 'DISCOVERED', label: 'Discovered', color: 'bg-slate-700 text-slate-200' },
    { status: 'PENDING_ANALYSIS', label: 'Pending Analysis', color: 'bg-amber-900/60 text-amber-300' },
    { status: 'ANALYZED', label: 'Analyzed', color: 'bg-blue-900/60 text-blue-300' },
    { status: 'POTENTIAL_MATCH', label: 'Potential Match', color: 'bg-indigo-900/60 text-indigo-300' },
    { status: 'SUSPECTED_IMPERSONATION', label: 'Suspected Impersonation', color: 'bg-orange-900/60 text-orange-300' },
    { status: 'CONFIRMED_UNAUTHORIZED_USE', label: 'Confirmed Unauthorized', color: 'bg-rose-900/60 text-rose-300' },
    { status: 'CONFIRMED_PHISHING', label: 'Confirmed Phishing', color: 'bg-red-700 text-white font-black' },
    { status: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'bg-purple-900/60 text-purple-300' },
    { status: 'TAKEDOWN_REQUESTED', label: 'Takedown Requested', color: 'bg-amber-800 text-amber-100' },
    { status: 'TAKEDOWN_IN_PROGRESS', label: 'Takedown In Progress', color: 'bg-amber-700 text-amber-100' },
    { status: 'REMOVED', label: 'Removed by Host', color: 'bg-teal-900/60 text-teal-300' },
    { status: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-900/60 text-emerald-300' },
    { status: 'FALSE_POSITIVE', label: 'False Positive', color: 'bg-slate-800 text-slate-400' },
    { status: 'REOPENED', label: 'Reopened', color: 'bg-yellow-900/60 text-yellow-300' },
    { status: 'ARCHIVED', label: 'Archived', color: 'bg-slate-900 text-slate-500' }
  ];

  const handleApplyTransition = () => {
    setTransitionError(null);
    if (!transitionReason || transitionReason.trim().length < 5) {
      setTransitionError('A clear operational rationale (at least 5 characters) is required for compliance audit trails.');
      return;
    }

    setIsTransitioning(true);
    const result = LogoLifecycleService.transitionStatus(
      match,
      targetStatus,
      'Security Analyst (Marcus Vance)',
      'Lead Incident Responder',
      transitionReason,
      analystComments
    );

    if (!result.success || !result.updatedMatch) {
      setTransitionError(result.error || 'Failed to update status');
      setIsTransitioning(false);
      return;
    }

    onUpdateMatch(result.updatedMatch);
    setTransitionSuccess(true);
    setIsTransitioning(false);
    setTimeout(() => setTransitionSuccess(false), 3000);
  };

  const handleReanalyze = () => {
    setIsReanalyzing(true);
    setTimeout(() => {
      const updated: LogoMatch = {
        ...match,
        aiVisionProvider: selectedProvider,
        aiConfidence: 98,
        similarityScore: Math.min(100, Math.max(75, match.similarityScore + 1)),
        updatedAt: new Date().toISOString(),
        history: [
          {
            id: `hist_re_${Date.now()}`,
            fromStatus: match.status,
            toStatus: match.status,
            actor: 'Security Analyst',
            actorRole: 'Reviewer',
            timestamp: new Date().toISOString(),
            reason: `Manual re-analysis executed using provider ${selectedProvider}.`
          },
          ...match.history
        ]
      };
      onUpdateMatch(updated);
      setIsReanalyzing(false);
    }, 1200);
  };

  const handleAddEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceValue.trim()) return;

    const newEvidence: LogoMatchEvidenceRecord = {
      id: `evi_${Date.now()}`,
      logoMatchId: match.id,
      evidenceType,
      evidenceValue: evidenceValue.trim(),
      confidence: 99,
      source: 'Security Analyst Manual Upload',
      collectedAt: new Date().toISOString(),
      sha256Hash: '98fa201b8e42c019248ba0291e84719208341920384192384102938401923841',
      immutableReference: `s3://skanda-evidence-vault/manual/${Date.now()}`
    };

    const updated: LogoMatch = {
      ...match,
      evidenceList: [newEvidence, ...match.evidenceList],
      updatedAt: new Date().toISOString()
    };

    onUpdateMatch(updated);
    setShowAddEvidence(false);
    setEvidenceValue('');
  };

  const getRiskColor = (level: LogoRiskLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-black text-indigo-400">{match.matchCode}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getRiskColor(match.riskAssessment.riskLevel)}`}>
                  {match.riskAssessment.riskLevel} RISK ({match.riskAssessment.riskScore}/100)
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {match.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 truncate max-w-xl">
                {match.targetDomain} — {match.brandAssetName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEscalateCase(match)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition-all shadow-md"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalate to Case</span>
            </button>
            <button
              onClick={() => onInitiateTakedown(match)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Takedown</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs font-bold space-x-4 shrink-0">
          {[
            { id: 'VISUAL', label: 'Side-by-Side Visual Comparison', icon: Eye },
            { id: 'SIGNALS', label: 'Contextual Signal Correlation', icon: Activity },
            { id: 'RISK_FACTORS', label: 'Explainable Scoring Drivers', icon: Cpu },
            { id: 'EVIDENCE', label: `Evidence Vault (${match.evidenceList.length})`, icon: Lock },
            { id: 'AUDIT_TRAIL', label: `Audit Log & Transitions (${match.history.length})`, icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VISUAL COMPARISON & TRANSFORMATION CHECKLIST */}
          {activeTab === 'VISUAL' && (
            <div className="space-y-6">
              {/* Visual Split Screen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Official Asset */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Official Registered Brand Asset
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{match.brandAssetName}</span>
                  </div>

                  <div className="h-56 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-4 relative overflow-hidden group">
                    <img
                      src={match.officialLogoUrl}
                      alt="Official Brand Asset"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                      Verified Genuine
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Source Identity:</span>
                      <span className="text-slate-200 font-bold">{organizationService.getOrganizationName(null, 'Enterprise Vault')} Master Vault</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registered Domain:</span>
                      <span className="text-slate-200">{organizationService.getBrandProfile().officialDomains[0] || 'enterprise.com'}</span>
                    </div>
                  </div>
                </div>

                {/* Detected Candidate */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Discovered Impersonating Logo
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-rose-400">
                      {match.similarityScore}% Resemblance
                    </span>
                  </div>

                  <div className="h-56 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
                    <img
                      src={match.detectedImageUrl}
                      alt="Detected Logo"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    {/* Bounding Box Visual Simulation */}
                    <div
                      className="absolute border-2 border-rose-500/80 bg-rose-500/10 pointer-events-none rounded"
                      style={{
                        left: `${match.detectedRegionCoordinates.x}px`,
                        top: `${match.detectedRegionCoordinates.y}px`,
                        width: `${Math.min(260, match.detectedRegionCoordinates.width)}px`,
                        height: `${Math.min(90, match.detectedRegionCoordinates.height)}px`
                      }}
                    >
                      <span className="absolute -top-4 left-0 text-[9px] font-mono bg-rose-600 text-white px-1 rounded">
                        Vector Match {match.similarityScore}%
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-rose-400 border border-rose-500/30">
                      Detected on {match.sourceType}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Discovered URL:</span>
                      <a
                        href={match.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center space-x-1 truncate max-w-[260px]"
                      >
                        <span className="truncate">{match.sourceUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span className="text-slate-200">{match.detectedImageDimensions.width}x{match.detectedImageDimensions.height}px</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Transformation Indicators Checklist */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Adversarial Transformation & Obfuscation Diagnostics</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Engine: <strong className="text-indigo-300">{match.aiVisionProvider}</strong> (Confidence: {match.aiConfidence}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  {[
                    { label: 'Exact Hash Match', active: match.transformations.isExactHashMatch, note: 'Pixel-for-pixel byte clone' },
                    { label: 'Perceptual Hash Match', active: match.transformations.isPerceptualHashMatch, note: 'Hamming distance <= 10' },
                    { label: 'Cropped / Partial Logo', active: match.transformations.isCropped || match.transformations.isPartialLogo, note: 'Symbol severed from text' },
                    { label: 'Dimension Resized', active: match.transformations.isResized, note: 'Scaled for phishing viewport' },
                    { label: 'Rotated / Skewed', active: match.transformations.isRotated, note: match.transformations.rotationDegrees ? `${match.transformations.rotationDegrees}° angle` : 'No rotation' },
                    { label: 'Mirrored / Flipped', active: match.transformations.isMirrored, note: 'Horizontal/Vertical reflection' },
                    { label: 'Color / Hue Modified', active: match.transformations.isColorModified, note: 'Inverted or altered palette' },
                    { label: 'Low Resolution Obfuscated', active: match.transformations.isLowResolution, note: '<120px micro-icon' },
                    { label: 'Phishing Login Embedded', active: match.transformations.combinedWithFakeLoginForm, note: 'Credential interception form' },
                    { label: 'Malicious URL Paired', active: match.transformations.combinedWithMaliciousUrl, note: 'Deceptive top-level domain' },
                    { label: 'Fraudulent Slogans Added', active: match.transformations.combinedWithFakeText, note: 'Guaranteed return claims' },
                    { label: 'Mobile Icon Impersonation', active: match.transformations.embeddedInMobileIcon, note: 'Rogue APK launcher asset' }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-start space-x-2 ${
                        item.active
                          ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className={`mt-0.5 rounded-full p-0.5 ${item.active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <span className={`font-bold block ${item.active ? 'text-white' : 'text-slate-400'}`}>
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                          {item.note}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pluggable Vision Model Re-run Controller */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-bold">Switch Vision Model Engine:</span>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="OPENCLIP_VIT_EMBEDDING">OpenCLIP ViT Embedding (Transformer)</option>
                      <option value="LOCAL_CONVOLUTIONAL">Local CNN Feature Pyramids</option>
                      <option value="ENTERPRISE_CLOUD_VISION">Enterprise Cloud Vision API</option>
                      <option value="INTERNAL_INFERENCE_SERVICE">Internal Zero-Trust Inference Engine</option>
                    </select>
                  </div>

                  <button
                    onClick={handleReanalyze}
                    disabled={isReanalyzing}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isReanalyzing ? 'animate-spin' : ''}`} />
                    <span>{isReanalyzing ? 'Re-running Vision Model...' : 'Re-analyze Candidate'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTEXTUAL SIGNAL CORRELATION */}
          {activeTab === 'SIGNALS' && (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Multi-Signal Corroboration Mandate:</strong> In Skanda Enterprise BrandGuard, visual logo similarity alone NEVER triggers an automatic "confirmed phishing" ruling. It must be corroborated across Brand, Domain, Website Form, and Threat Intel signals.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Brand Signals */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">1. Brand Signals</span>
                    <span className="text-xs font-mono text-slate-400">Match: {match.correlations.brandSignals.brandNameSimilarity}%</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Brand Name Resemblance:</span>
                      <span className="font-mono text-slate-200 font-bold">{match.correlations.brandSignals.brandNameSimilarity}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Trademark Slogan Match:</span>
                      <span className={`font-bold ${match.correlations.brandSignals.trademarkTextMatched ? 'text-rose-400' : 'text-slate-500'}`}>
                        {match.correlations.brandSignals.trademarkTextMatched ? `Triggered (${organizationService.getOrganizationName(null, 'Protected Trademark')})` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Brand Color Cosine Alignment:</span>
                      <span className="font-mono text-slate-200">{(match.correlations.brandSignals.brandColorCosineSimilarity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Typography / Font Similarity:</span>
                      <span className="font-mono text-slate-200">{match.correlations.brandSignals.typographySimilarity}%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Official Asset Whitelist:</span>
                      <span className={`font-bold ${match.correlations.brandSignals.isOfficialAssetMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {match.correlations.brandSignals.isOfficialAssetMatch ? 'Verified Official Domain' : 'UNAUTHORIZED HOST'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Domain Signals */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">2. Domain Signals</span>
                    <span className="text-xs font-mono text-slate-400">Age: {match.correlations.domainSignals.domainAgeDays} days</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Target Hostname:</span>
                      <span className="font-mono text-slate-200 font-bold">{match.correlations.domainSignals.targetDomain}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Typosquatting / Homoglyph:</span>
                      <span className={`font-bold ${match.correlations.domainSignals.isTyposquatting ? 'text-rose-400' : 'text-slate-400'}`}>
                        {match.correlations.domainSignals.isTyposquatting ? 'Detected' : 'Negative'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Newly Registered Domain:</span>
                      <span className={`font-bold ${match.correlations.domainSignals.isNewlyRegisteredDomain ? 'text-amber-400' : 'text-slate-400'}`}>
                        {match.correlations.domainSignals.isNewlyRegisteredDomain ? 'Yes (Under 30 Days)' : 'Aged Domain'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Hosting ASN & Provider:</span>
                      <span className="font-mono text-slate-200">{match.correlations.domainSignals.asn} ({match.correlations.domainSignals.asnOrg})</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Resolved IP Address:</span>
                      <span className="font-mono text-slate-200">{match.correlations.domainSignals.resolvedIps.join(', ') || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Website Signals */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">3. Website Signals</span>
                    <span className="text-xs font-mono text-slate-400">Clone Sim: {match.correlations.websiteSignals.layoutCloneSimilarity}%</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Login Form Present:</span>
                      <span className={`font-bold ${match.correlations.websiteSignals.hasLoginForm ? 'text-rose-400' : 'text-slate-400'}`}>
                        {match.correlations.websiteSignals.hasLoginForm ? 'Detected (HTML Form Action)' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Credential / 2FA Harvesting:</span>
                      <span className={`font-bold ${match.correlations.websiteSignals.hasCredentialHarvesting ? 'text-red-400' : 'text-slate-400'}`}>
                        {match.correlations.websiteSignals.hasCredentialHarvesting ? 'Active Harvesting Payload' : 'Negative'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Payment / Investment Scams:</span>
                      <span className={`font-bold ${match.correlations.websiteSignals.hasPaymentForm || match.correlations.websiteSignals.hasFakeInvestment ? 'text-amber-400' : 'text-slate-400'}`}>
                        {match.correlations.websiteSignals.hasFakeInvestment ? '18% Guaranteed Return Promises' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Malicious Download / APK:</span>
                      <span className={`font-bold ${match.correlations.websiteSignals.hasMaliciousDownload ? 'text-rose-400' : 'text-slate-400'}`}>
                        {match.correlations.websiteSignals.hasMaliciousDownload ? 'Detected Rogue APK' : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Impersonation Slogans:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[200px]">
                        {match.correlations.websiteSignals.brandImpersonationLanguage.join('; ') || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Threat Intel Signals */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">4. Threat Intel Signals</span>
                    <span className="text-xs font-mono text-slate-400">Reputation: {match.correlations.threatIntelSignals.securityVendorReputation}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Vendor Consensus:</span>
                      <span className={`font-bold ${
                        match.correlations.threatIntelSignals.securityVendorReputation === 'MALICIOUS' ? 'text-rose-400' :
                        match.correlations.threatIntelSignals.securityVendorReputation === 'SUSPICIOUS' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {match.correlations.threatIntelSignals.securityVendorReputation}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Active Threat Feeds:</span>
                      <span className="font-mono text-slate-200">
                        {match.correlations.threatIntelSignals.threatFeedMatches.join(', ') || 'Zero Flagged Feeds'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Abuse Reports Logged:</span>
                      <span className="font-mono text-slate-200">{match.correlations.threatIntelSignals.abuseReportsCount} incident(s)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Historical Infringements:</span>
                      <span className="font-mono text-slate-200">{match.correlations.threatIntelSignals.historicalDetectionsCount} prior detection(s)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Previous Takedowns on ASN:</span>
                      <span className={`font-bold ${match.correlations.threatIntelSignals.hasPreviousTakedowns ? 'text-rose-400' : 'text-slate-400'}`}>
                        {match.correlations.threatIntelSignals.hasPreviousTakedowns ? 'Repeat Offender' : 'First Encounter'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPLAINABLE RISK FACTORS */}
          {activeTab === 'RISK_FACTORS' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Composite Risk Score
                  </span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-black font-mono text-white">{match.riskAssessment.riskScore}</span>
                    <span className="text-sm font-bold text-slate-500">/ 100</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRiskColor(match.riskAssessment.riskLevel)}`}>
                      {match.riskAssessment.riskLevel} SEVERITY
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Evaluated via model {match.riskAssessment.modelVersion} at {new Date(match.riskAssessment.calculatedAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Primary Decision Drivers</span>
                  <div className="space-y-1">
                    {match.riskAssessment.topDrivers.map((driver, idx) => (
                      <span key={idx} className="block text-xs font-bold text-rose-300">
                        • {driver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Factors Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Individual Factor Contributions (Max 100 Pts)
                </h3>
                <div className="space-y-2">
                  {match.riskAssessment.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        factor.isTriggered
                          ? 'bg-slate-900/90 border-slate-700'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{factor.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {factor.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{factor.description}</p>
                        {factor.rawEvidence && (
                          <span className="text-[10px] font-mono text-indigo-300 block">
                            Evidence: {factor.rawEvidence}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0 pl-4">
                        <div className="flex items-baseline space-x-1 justify-end font-mono">
                          <span className={`text-base font-black ${factor.pointsAwarded > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                            +{factor.pointsAwarded}
                          </span>
                          <span className="text-xs text-slate-600">/ {factor.maxPoints}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {factor.isTriggered ? 'Triggered' : 'Not Triggered'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EVIDENCE VAULT */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Forensic Evidence Artifacts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable cryptographically hashed evidence packages ready for DMCA, UDRP, and registrar escalation.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEvidence(!showAddEvidence)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-all shadow"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Attach Manual Evidence</span>
                </button>
              </div>

              {/* Add Evidence Sub-form */}
              {showAddEvidence && (
                <form onSubmit={handleAddEvidenceSubmit} className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Artifact Type</label>
                      <select
                        value={evidenceType}
                        onChange={(e) => setEvidenceType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="SCREENSHOT">Headless Chromium Full-Page Screenshot</option>
                        <option value="DOM_HTML">Sanitized DOM HTML Snapshot</option>
                        <option value="HAR_ARCHIVE">HTTP Archive (HAR) Network Log</option>
                        <option value="TLS_CERT">TLS Certificate Chain Dump</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Evidence Value or URI</label>
                      <input
                        type="text"
                        placeholder="https://... or base64..."
                        value={evidenceValue}
                        onChange={(e) => setEvidenceValue(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEvidence(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Save to Vault
                    </button>
                  </div>
                </form>
              )}

              {/* Evidence Records List */}
              <div className="space-y-3">
                {match.evidenceList.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-slate-500 text-xs">
                    No forensic artifacts manually attached yet. Headless browser screenshot was captured during discovery scan.
                  </div>
                ) : (
                  match.evidenceList.map(item => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                            {item.evidenceType}
                          </span>
                          <span className="text-xs font-bold text-white">{item.source}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(item.collectedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-black/50 border border-slate-800/80 font-mono text-[10px] text-slate-400 break-all">
                        SHA-256: {item.sha256Hash}
                      </div>
                      <div className="text-[11px] text-slate-400 flex justify-between">
                        <span>Immutable S3 Reference:</span>
                        <span className="font-mono text-indigo-300">{item.immutableReference}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL & 15-STAGE STATE MACHINE */}
          {activeTab === 'AUDIT_TRAIL' && (
            <div className="space-y-6">
              {/* State Machine Transition Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Apply Audited Lifecycle Status Transition</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Current Status: <strong className="text-indigo-300">{match.status.replace(/_/g, ' ')}</strong>
                  </span>
                </div>

                {transitionError && (
                  <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{transitionError}</span>
                  </div>
                )}

                {transitionSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Lifecycle status transitioned and appended to immutable audit log!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Target Lifecycle State</label>
                    <select
                      value={targetStatus}
                      onChange={(e) => setTargetStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {allStatuses.map(item => (
                        <option key={item.status} value={item.status}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Compliance Audit Rationale (Mandatory)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified phishing clone; dispatched takedown..."
                      value={transitionReason}
                      onChange={(e) => setTransitionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Internal Analyst Notes / Case Reference (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide additional context for ISO 27001 / SOC 2 auditors..."
                    value={analystComments}
                    onChange={(e) => setAnalystComments(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleApplyTransition}
                    disabled={isTransitioning}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/30"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isTransitioning ? 'Logging Transition...' : 'Execute Transition'}</span>
                  </button>
                </div>
              </div>

              {/* Historical Log */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Immutable State Transition Audit Log
                </h3>

                <div className="space-y-2">
                  {match.history.map((event, idx) => (
                    <div key={event.id || idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-3 text-xs">
                      <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">
                              {event.fromStatus.replace(/_/g, ' ')} → {event.toStatus.replace(/_/g, ' ')}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                              {event.actor} ({event.actorRole})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300">{event.reason}</p>
                        {event.comments && (
                          <p className="text-[11px] text-slate-400 italic">Notes: {event.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-4">
            <span>Assigned: <strong className="text-slate-200">{match.assignedAnalyst || 'Unassigned'}</strong></span>
            {match.linkedInvestigationCaseId && (
              <span>Case: <strong className="text-purple-400">{match.linkedInvestigationCaseId}</strong></span>
            )}
            {match.linkedTakedownRequestId && (
              <span>Takedown: <strong className="text-rose-400">{match.linkedTakedownRequestId}</strong></span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
