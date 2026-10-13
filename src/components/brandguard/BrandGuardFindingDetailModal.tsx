// Skanda BrandGuard — Forensic Finding Detail Investigation Modal
// Deep-dive forensic workbench displaying target infrastructure, side-by-side logo comparison,
// OCR extraction, explainable risk factors, tamper-evident SHA-256 evidence, and 1-click GRC linkages.

import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Lock,
  Globe,
  Server,
  UserCheck,
  Flame,
  FileCheck2,
  Copy,
  Check,
  Send,
  X,
  Clock,
  Eye,
  Building,
  CheckCircle2,
  Activity,
  Layers,
  ArrowUpRight,
  Info,
  Mail,
  Split,
  Scale,
  Cpu,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import {
  BrandFinding,
  BrandFindingStatus,
  BrandProfile
} from '../../types/brandguard';
import { BrandGuardStorageService } from '../../services/brandguard/brandguardStorageService';
import { BrandGuardIgnoreDomainModal } from './BrandGuardIgnoreDomainModal';
import { BrandGuardAbuseReportModal } from './BrandGuardAbuseReportModal';
import { BrandGuardSafeBrowsingModal } from './BrandGuardSafeBrowsingModal';
import { BrandGuardEmailSpoofModal } from './BrandGuardEmailSpoofModal';
import { BrandGuardClonedSiteComparisonModal } from './BrandGuardClonedSiteComparisonModal';
import { BrandGuardWipoDossierModal } from './BrandGuardWipoDossierModal';
import { BrandGuardPhishingForensicsModal } from './BrandGuardPhishingForensicsModal';
import { BrandGuardEvidenceBundleModal } from './BrandGuardEvidenceBundleModal';
import { BrandGuardWeaponizationModal } from './BrandGuardWeaponizationModal';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardFindingDetailModalProps {
  finding: BrandFinding | null;
  brandProfile: BrandProfile;
  isOpen: boolean;
  onClose: () => void;
  onFindingUpdated?: (updated: BrandFinding) => void;
  onOpenEvidenceDossier?: (finding: BrandFinding) => void;
}

export const BrandGuardFindingDetailModal: React.FC<BrandGuardFindingDetailModalProps> = ({
  finding,
  brandProfile,
  isOpen,
  onClose,
  onFindingUpdated,
  onOpenEvidenceDossier
}) => {
  const { theme, addRisk, addFinding, logAuditEvent, currentUser } = useGRC();
  const [activeTab, setActiveTab] = useState<'FORENSICS' | 'RISK_FACTORS' | 'EVIDENCE' | 'DECISION_LOG'>('FORENSICS');
  const [showAbuseModal, setShowAbuseModal] = useState(false);
  const [showSafeBrowsingModal, setShowSafeBrowsingModal] = useState(false);
  const [showEmailSpoofModal, setShowEmailSpoofModal] = useState(false);
  const [showClonedSiteComparison, setShowClonedSiteComparison] = useState(false);
  const [showWipoModal, setShowWipoModal] = useState(false);
  const [showForensicsModal, setShowForensicsModal] = useState(false);
  const [showEvidenceBundleModal, setShowEvidenceBundleModal] = useState(false);
  const [showWeaponizationModal, setShowWeaponizationModal] = useState(false);
  const [showIgnoreModal, setShowIgnoreModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [incidentCreated, setIncidentCreated] = useState(false);
  const [riskCreated, setRiskCreated] = useState(false);
  const [capaCreated, setCapaCreated] = useState(false);

  if (!isOpen || !finding) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(finding.evidence.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleStatusChange = (newStatus: BrandFindingStatus, reason: string) => {
    const actor = currentUser?.name || 'Security Lead';
    const role = currentUser?.role || 'CISO_RISK_MANAGER';
    const updated = BrandGuardStorageService.updateFindingStatus(
      finding.tenantId,
      finding.id,
      newStatus,
      actor,
      role,
      reason
    );
    if (updated) {
      logAuditEvent(
        'UPDATE',
        'BrandGuard Findings',
        `Changed status of finding ${finding.findingCode} (${finding.targetDomain}) to "${newStatus}". Reason: ${reason}`
      );
      if (onFindingUpdated) onFindingUpdated(updated);
    }
  };

  const handleConfirmIgnore = (domain: string, reason: string, findingId?: string) => {
    if (!finding) return;
    const actor = currentUser?.name || 'Security Lead';
    const role = currentUser?.role || 'CISO_RISK_MANAGER';
    const { updatedFindings, record } = BrandGuardStorageService.ignoreDomain(
      finding.tenantId,
      domain,
      reason,
      actor,
      role,
      findingId || finding.id
    );
    const updated = updatedFindings.find(f => f.id === finding.id) || {
      ...finding,
      status: 'FALSE_POSITIVE' as BrandFindingStatus,
      isIgnored: true,
      ignoredReason: reason,
      ignoredAt: record.ignoredAt,
      ignoredBy: record.ignoredBy
    };
    logAuditEvent(
      'UPDATE',
      'BrandGuard Findings',
      `Marked domain ${domain} (${finding.findingCode}) as Ignored False Positive. Persisted preference to database.`
    );
    setShowIgnoreModal(false);
    if (onFindingUpdated) onFindingUpdated(updated);
  };

  const handleUnignore = () => {
    if (!finding) return;
    const actor = currentUser?.name || 'Security Lead';
    const role = currentUser?.role || 'CISO_RISK_MANAGER';
    const updatedFindings = BrandGuardStorageService.unignoreDomain(
      finding.tenantId,
      finding.targetDomain,
      actor,
      role
    );
    const updated = updatedFindings.find(f => f.id === finding.id) || {
      ...finding,
      status: 'NEW' as BrandFindingStatus,
      isIgnored: false,
      ignoredReason: undefined,
      ignoredAt: undefined,
      ignoredBy: undefined
    };
    logAuditEvent(
      'UPDATE',
      'BrandGuard Findings',
      `Restored domain ${finding.targetDomain} (${finding.findingCode}) to active investigation queue.`
    );
    if (onFindingUpdated) onFindingUpdated(updated);
  };

  const handleCreateSecurityIncident = () => {
    setIncidentCreated(true);
    logAuditEvent(
      'CREATE',
      'BrandGuard Threat Escalation',
      `Escalated BrandGuard finding ${finding.findingCode} (${finding.targetDomain}) to Priority-1 Security Incident. IOC: IP ${finding.domainIntel.resolvedIPs.join(', ')}, URL: ${finding.targetUrl}, Evidence: ${finding.evidence.sha256Hash.slice(0, 16)}...`
    );
  };

  const handleCreateEnterpriseRisk = () => {
    setRiskCreated(true);
    // Convert directly into Skanda RiskRecord
    addRisk({
      title: `[BrandGuard] Unauthorized Impersonation & Trademark Misuse on ${finding.targetDomain}`,
      category: 'Information Security',
      linkedItem: `Brand Identity Asset (${brandProfile.organizationName})`,
      department: 'Cybersecurity & External Threat Intel',
      threatDescription: `Malicious third-party established infrastructure at ${finding.targetDomain} (${finding.findingType}) with ${finding.riskScore.totalScore}/100 severity risk score.`,
      vulnerabilityDescription: 'Lack of automated registrar takedown integration and customer awareness gap regarding deceptive phishing portals.',
      likelihood: finding.severity === 'CRITICAL' ? 5 : finding.severity === 'HIGH' ? 4 : 3,
      impact: finding.severity === 'CRITICAL' ? 5 : 4,
      treatmentOption: 'Mitigate',
      mitigationControl: 'ISO 27001 A.8.1 (User Endpoint Devices), A.5.15 (Access Control), and Domain Registrar Takedown Notice',
      treatmentOwner: 'Priya Sharma (CISO)',
      targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      residualLikelihood: 2,
      residualImpact: 2,
      status: 'Treatment in Progress'
    });

    logAuditEvent(
      'CREATE',
      'BrandGuard Risk Integration',
      `Created Enterprise Risk record for ${finding.targetDomain} [BrandGuard Ref: ${finding.findingCode}]`
    );
  };

  const handleCreateCAPAFinding = () => {
    setCapaCreated(true);
    // Convert directly into Skanda FindingCAPARecord
    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: finding.severity === 'CRITICAL' ? 'Major Non-Conformity' : 'Minor Non-Conformity',
      title: `[BrandGuard CAPA] Brand Impersonation & Deceptive Infrastructure on ${finding.targetDomain}`,
      clauseOrControl: 'ISO 27001:2022 A.5.15, A.8.12 (Data Leakage) & DPDP Act Sec 8(5)',
      department: 'Information Security & Compliance',
      description: `Active deceptive brand misuse detected at ${finding.targetUrl}. Logo similarity: ${finding.logoSimilarityScore}%, Credential harvesting: ${finding.webPageAnalysis.detectedForms.hasLoginForm ? 'Confirmed' : 'None'}.`,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        whys: [
          'External actors registered an unmonitored combo-squatting domain.',
          'DMARC and brand registry alerts did not prevent third-party domain hosting.',
          'Offshore bulletproof registrar ignored initial informal warnings.',
          'Lack of preemptive brand TLD defensive registrations.',
          'Continuous surface web brand monitoring identified the active site.'
        ],
        rootCauseStatement: 'Unregistered secondary TLD allowed opportunistic malicious threat actors to clone brand assets and host phishing forms.'
      },
      capaPlan: {
        correctiveAction: `Dispatch formal RFC 2142 abuse notice to registrar ${finding.domainIntel.registrar} and request emergency DNS suspension.`,
        preventiveAction: 'Institute defensive domain registrations for top 10 homoglyph variants and configure proactive CT log alerts.',
        owner: 'Priya Sharma (CISO)',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        evidenceRequired: `Evidence dossier ${finding.evidence.evidenceId} with SHA-256 checksum.`
      },
      status: 'Open'
    });

    logAuditEvent(
      'CREATE',
      'BrandGuard CAPA Integration',
      `Raised CAPA non-conformity for ${finding.targetDomain} [Finding Code: ${finding.findingCode}]`
    );
  };

  const getSeverityBadge = () => {
    switch (finding.severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'LOW':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-5 animate-in fade-in duration-200">
        <div
          className={`rounded-xl border w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {/* Header */}
          <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className={`p-3 rounded-xl border ${
                finding.severity === 'CRITICAL'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <ShieldAlert className="w-6 h-6 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                    theme === 'light'
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}>
                    {finding.findingCode}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge()}`}>
                    {finding.severity} SEVERITY
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {finding.findingType.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                    theme === 'light'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-800/80 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    STATUS: {finding.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className={`text-base sm:text-lg font-bold mt-1 truncate ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {finding.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {onOpenEvidenceDossier && (
                <button
                  onClick={() => onOpenEvidenceDossier(finding)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Open Tamper-Evident Evidence Dossier (Screenshots, HAR, DNS Tree)"
                >
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Evidence Dossier</span>
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  theme === 'light' ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ignored False Positive Status Alert Banner */}
          {(finding.isIgnored || finding.status === 'FALSE_POSITIVE' || finding.status === 'IGNORED') && (
            <div className="mx-4 sm:mx-5 mt-4 p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <EyeOff className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-amber-300 flex items-center space-x-2 flex-wrap">
                    <span>Domain Ignored as False Positive</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">HIDDEN FROM ACTIVE THREATS</span>
                  </div>
                  <p className="text-amber-200/90 text-xs mt-0.5 truncate">
                    {finding.ignoredReason || 'Marked as false positive / benign domain.'}
                  </p>
                  {finding.ignoredBy && (
                    <span className="text-[10px] text-amber-400/80 block mt-0.5">
                      Logged by {finding.ignoredBy} {finding.ignoredAt ? `• ${new Date(finding.ignoredAt).toLocaleDateString()}` : ''}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleUnignore}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 cursor-pointer flex items-center space-x-1.5 shrink-0 ml-3"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Domain</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className={`px-5 py-3 border-b grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs ${
            theme === 'light' ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Explainable Risk</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-base font-extrabold text-rose-500">{finding.riskScore.totalScore}</span>
                <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Logo Similarity</span>
              <div className="flex items-center space-x-1 mt-0.5 font-bold text-indigo-400 text-sm">
                <span>{finding.logoSimilarityScore}%</span>
                <span className="text-[10px] text-slate-400 font-normal">Vector</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Domain Match</span>
              <div className="flex items-center space-x-1 mt-0.5 font-bold text-sky-400 text-sm">
                <span>{finding.domainSimilarityScore}%</span>
                <span className="text-[10px] text-slate-400 font-normal">Squat</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Login Harvester</span>
              <span className={`font-bold mt-0.5 inline-block text-xs ${
                finding.webPageAnalysis.detectedForms.hasLoginForm ? 'text-rose-500' : 'text-slate-400'
              }`}>
                {finding.webPageAnalysis.detectedForms.hasLoginForm ? 'Active Password Input' : 'None Detected'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Overall Confidence</span>
              <span className="font-extrabold text-emerald-500 mt-0.5 inline-block text-sm">
                {finding.overallConfidence}%
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex border-b px-5 space-x-6 text-xs font-semibold overflow-x-auto ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('FORENSICS')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'FORENSICS'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Forensic Evidence & Visuals</span>
            </button>
            <button
              onClick={() => setActiveTab('RISK_FACTORS')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'RISK_FACTORS'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Explainable Risk Breakdown</span>
            </button>
            <button
              onClick={() => setActiveTab('EVIDENCE')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'EVIDENCE'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Tamper-Evident Digest</span>
            </button>
            <button
              onClick={() => setActiveTab('DECISION_LOG')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'DECISION_LOG'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Review Log ({finding.decisionHistory.length})</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'FORENSICS' && (
              <div className="space-y-5">
                {/* Target Infrastructure Box */}
                <div className={`p-4 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                    <Server className="w-4 h-4 text-sky-400" />
                    <span>Target Infrastructure & Domain Telemetry</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Offending URL:</span>
                      <a
                        href={finding.targetUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-indigo-400 font-mono hover:underline flex items-center space-x-1 truncate mt-0.5"
                      >
                        <span className="truncate">{finding.targetUrl}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Registrar:</span>
                      <span className="font-semibold text-slate-200 block mt-0.5">
                        {finding.domainIntel.registrar}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Hosting & ASN:</span>
                      <span className="font-semibold text-slate-200 block mt-0.5">
                        {finding.domainIntel.hostingProvider} ({finding.domainIntel.asn})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Resolved IP(s):</span>
                      <span className="font-mono text-slate-300 block mt-0.5">
                        {finding.domainIntel.resolvedIPs.join(', ')} [{finding.domainIntel.countryCode}]
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Nameservers:</span>
                      <span className="font-mono text-slate-300 block mt-0.5 truncate">
                        {finding.domainIntel.nameservers.join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Registration Date:</span>
                      <span className="text-slate-300 block mt-0.5">
                        {new Date(finding.domainIntel.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Logo & Visual Match Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Registered Official Brand Asset */}
                  <div className={`p-4 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Registered Official Brand Asset</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Authorized Reference
                      </span>
                    </div>
                    <div className="h-36 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
                      {finding.matchedBrandAsset?.officialLogoUrl ? (
                        <img
                          src={finding.matchedBrandAsset.officialLogoUrl}
                          alt="Official Brand Asset"
                          className="max-h-full max-w-full object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center text-slate-500 text-xs">
                          Primary Shield & Wordmark Logo
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Asset Name:</span>
                        <span className="font-semibold truncate max-w-[200px]">
                          {finding.matchedBrandAsset?.assetName || 'Primary Logo'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Trademark Ref:</span>
                        <span className="font-mono text-slate-400">USPTO #92841029</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Discovered Candidate Logo */}
                  <div className={`p-4 rounded-xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Discovered Candidate Logo / Image</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {finding.logoSimilarityScore}% Perceptual Similarity
                      </span>
                    </div>
                    <div className="h-36 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden group">
                      <img
                        src={finding.webPageAnalysis.screenshotUrl}
                        alt="Discovered Candidate"
                        className="max-h-full max-w-full object-cover rounded opacity-90"
                        referrerPolicy="no-referrer"
                      />
                      {/* Bounding box overlay */}
                      <div className="absolute top-4 left-6 border-2 border-rose-500 bg-rose-500/10 px-2 py-0.5 rounded text-[10px] font-mono text-rose-300 flex items-center space-x-1 shadow-lg">
                        <span>Matched Area ({finding.logoSimilarityScore}%)</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Detection Method:</span>
                        <span className="font-semibold text-indigo-400">
                          {finding.matchedBrandAsset?.detectionMethod || 'PERCEPTUAL_VECTOR_HASH'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Visual Cloning Score:</span>
                        <span className="font-bold text-rose-400">
                          {finding.websiteVisualSimilarityScore}% Structural Mimicry
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Executive Impersonation Card (if matched) */}
                {finding.matchedExecutive && (
                  <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                    theme === 'light' ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
                  }`}>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-amber-300 text-sm">
                          Executive Impersonation Detected: {finding.matchedExecutive.fullName}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {finding.matchedExecutive.title}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        {finding.matchedExecutive.context}
                      </p>
                    </div>
                  </div>
                )}

                {/* OCR & Web Content Extraction */}
                <div className={`p-4 rounded-xl border ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      <span>OCR Extracted Text & Normalized Page Copy</span>
                    </span>
                    <span className="text-[10px] font-normal text-slate-500">
                      Confidence: {finding.webPageAnalysis.ocrConfidence}%
                    </span>
                  </h4>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed max-h-28 overflow-y-auto">
                    {finding.webPageAnalysis.ocrExtractedText}
                  </div>
                  {finding.webPageAnalysis.detectedForms.hasLoginForm && (
                    <div className="mt-2.5 flex items-center space-x-2 text-rose-400 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Interactive credential harvest form detected: Inputs for password & two-factor authentication.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'RISK_FACTORS' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Explainable Brand Risk Score Breakdown</h3>
                    <p className="text-xs text-slate-400">
                      Standard formula normalized to 100 points based on 8 weighted threat vectors.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-rose-400">{finding.riskScore.totalScore}</span>
                    <span className="text-xs text-slate-500 block">Total Risk Points</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {finding.riskScore.contributingFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <span className="text-xs font-bold text-slate-200 block">{factor.factorName}</span>
                        <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                          {factor.description}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-indigo-400">+{factor.pointsAwarded}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">points</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formula Transparency Box */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300 block">Algorithmic Weight Distribution:</span>
                  <p className="text-[11px] leading-relaxed">
                    Logo Similarity (25%) + Brand Name (15%) + Domain Similarity (15%) + Executive Likeness (10%) +
                    Visual Layout (10%) + Phishing/Login Harvester (15%) + Infrastructure (5%) + Reputation (5%) = 100% Max Score.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'EVIDENCE' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border space-y-3 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Tamper-Evident Cryptographic SHA-256 Digest</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      INTEGRITY VERIFIED
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-300 break-all pr-3">
                      {finding.evidence.sha256Hash}
                    </span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 transition-colors"
                      title="Copy SHA-256 Digest"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pt-2">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Evidence Reference ID:</span>
                      <span className="font-mono text-slate-200 font-bold">{finding.evidence.evidenceId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">First Discovered:</span>
                      <span className="text-slate-200">{new Date(finding.firstSeen).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Digital Seal Signature:</span>
                      <span className="font-mono text-slate-300 text-[11px] truncate block">
                        {finding.evidence.cryptographicSignature}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Discovery Provider:</span>
                      <span className="text-slate-200">{finding.evidence.discoveryProvider}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center space-x-3">
                  <Info className="w-5 h-5 shrink-0 text-indigo-400" />
                  <span>
                    This cryptographic record is immutably archived and admitted into Skanda Evidence Center for ISO 27001 Clause A.5.15 and statutory litigation audits.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {onOpenEvidenceDossier && (
                    <button
                      onClick={() => onOpenEvidenceDossier(finding)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center justify-center space-x-2 transition-all shadow-md"
                    >
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Open Evidence Dossier Drawer (Side-by-Side)</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowEvidenceBundleModal(true)}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center space-x-2 transition-all shadow-md"
                  >
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>Deep-Dive Forensic Modal</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'DECISION_LOG' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Audit Trail & Decision History
                </h3>
                <div className="space-y-2.5">
                  {finding.decisionHistory.map(entry => (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-200">
                          {entry.actorName} ({entry.actorRole})
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 my-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                          ACTION: {entry.action}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{entry.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {/* Quick Status Modifiers */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <button
                onClick={() => handleStatusChange('CONFIRMED_ABUSE', 'Verified by threat analyst as active brand abuse.')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
              >
                Confirm Abuse
              </button>
              <button
                onClick={() => handleStatusChange('LEGITIMATE_USE', 'Verified authorized partner or educational fair use.')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
              >
                Mark Legitimate (Whitelist)
              </button>
              {finding.isIgnored || finding.status === 'FALSE_POSITIVE' || finding.status === 'IGNORED' ? (
                <button
                  onClick={handleUnignore}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Unignore domain and restore to active investigation"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unignore Domain</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowIgnoreModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Ignore domain and mark as false positive in database"
                >
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ignore (False Positive)</span>
                </button>
              )}
            </div>

            {/* GRC & Takedown Integrations */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <button
                onClick={handleCreateSecurityIncident}
                disabled={incidentCreated}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                  incidentCreated
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {incidentCreated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{incidentCreated ? 'Incident Created' : 'Create Incident'}</span>
              </button>

              <button
                onClick={handleCreateEnterpriseRisk}
                disabled={riskCreated}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                  riskCreated
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {riskCreated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                <span>{riskCreated ? 'Risk Logged' : 'Create Risk'}</span>
              </button>

              <button
                onClick={handleCreateCAPAFinding}
                disabled={capaCreated}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                  capaCreated
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30'
                }`}
              >
                {capaCreated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileCheck2 className="w-3.5 h-3.5" />}
                <span>{capaCreated ? 'CAPA Logged' : 'Create CAPA'}</span>
              </button>

              <button
                onClick={() => setShowClonedSiteComparison(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 flex items-center space-x-1.5 transition-all"
                title="Side-by-Side Phishing Comparison Workbench"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Compare Clone</span>
              </button>

              <button
                onClick={() => setShowEmailSpoofModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5 transition-all"
                title="Active Mail Server (MX) & Spoofability Inspector"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Inspect MX</span>
              </button>

              <button
                onClick={() => setShowForensicsModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center space-x-1.5 transition-all"
                title="Phishing Kit Forensics, MurmurHash3 & YARA Rule Extractor"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Kit Forensics & YARA</span>
              </button>

              <button
                onClick={() => setShowWipoModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 transition-all"
                title="Automated WIPO UDRP / URS Dispute Dossier Generator"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>WIPO Legal Dossier</span>
              </button>

              <button
                onClick={() => setShowEvidenceBundleModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5 transition-all"
                title="Cryptographic Chain-of-Custody & Signed ISO 27037 Evidence Package"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Evidence Chain-of-Custody</span>
              </button>

              <button
                onClick={() => setShowWeaponizationModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 transition-all"
                title="Weaponization Lifecycle State Machine & Passive DNS Correlation"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Weaponization & Threat Intel</span>
              </button>

              <button
                onClick={() => setShowSafeBrowsingModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center space-x-1.5 transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Safe Browsing Blacklist</span>
              </button>

              <button
                onClick={() => setShowAbuseModal(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compose Takedown Notice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Abuse Notice Composer Modal */}
      {showAbuseModal && (
        <BrandGuardAbuseReportModal
          finding={finding}
          brandProfile={brandProfile}
          isOpen={showAbuseModal}
          onClose={() => setShowAbuseModal(false)}
          onTakedownDispatched={() => {
            handleStatusChange('MITIGATION_IN_PROGRESS', 'Takedown notice dispatched to registrar/host.');
          }}
        />
      )}

      {/* Browser Safe Browsing Rapid Blacklist Modal */}
      {showSafeBrowsingModal && (
        <BrandGuardSafeBrowsingModal
          finding={finding}
          brandProfile={brandProfile}
          isOpen={showSafeBrowsingModal}
          onClose={() => setShowSafeBrowsingModal(false)}
        />
      )}

      {/* Active Mail Server (MX) & Spoofability Inspector Modal */}
      {showEmailSpoofModal && (
        <BrandGuardEmailSpoofModal
          domain={finding.targetDomain}
          isOpen={showEmailSpoofModal}
          onClose={() => setShowEmailSpoofModal(false)}
        />
      )}

      {/* Side-by-Side Phishing Cloned Site Comparison Workbench Modal */}
      {showClonedSiteComparison && (
        <BrandGuardClonedSiteComparisonModal
          finding={finding}
          brandProfile={brandProfile}
          isOpen={showClonedSiteComparison}
          onClose={() => setShowClonedSiteComparison(false)}
        />
      )}

      {/* Phishing Kit Forensics & Heuristic Signatures Modal */}
      {showForensicsModal && (
        <BrandGuardPhishingForensicsModal
          finding={finding}
          onClose={() => setShowForensicsModal(false)}
        />
      )}

      {/* Automated WIPO UDRP / URS Legal Dispute Dossier Modal */}
      {showWipoModal && (
        <BrandGuardWipoDossierModal
          finding={finding}
          brandProfile={brandProfile}
          onClose={() => setShowWipoModal(false)}
        />
      )}

      {/* ISO 27037 Signed Cryptographic Evidence Chain-of-Custody Modal */}
      {showEvidenceBundleModal && (
        <BrandGuardEvidenceBundleModal
          finding={finding}
          isOpen={showEvidenceBundleModal}
          onClose={() => setShowEvidenceBundleModal(false)}
        />
      )}

      {/* Weaponization State Machine & Threat Intel Modal */}
      {showWeaponizationModal && (
        <BrandGuardWeaponizationModal
          finding={finding}
          isOpen={showWeaponizationModal}
          onClose={() => setShowWeaponizationModal(false)}
          onUpdateFinding={onFindingUpdated}
        />
      )}

      {/* Ignore Domain Preference Modal */}
      {showIgnoreModal && (
        <BrandGuardIgnoreDomainModal
          finding={finding}
          isOpen={showIgnoreModal}
          onClose={() => setShowIgnoreModal(false)}
          onConfirmIgnore={handleConfirmIgnore}
          theme={theme}
        />
      )}
    </>
  );
};
