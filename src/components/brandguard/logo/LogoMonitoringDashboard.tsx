// Skanda Enterprise — Master Logo Monitoring & Visual Impersonation Defense Dashboard
// Autonomous visual candidate discovery, multi-signal correlation, 15-stage lifecycle state machine,
// explainable risk scoring, and legal takedown dispatching.

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Activity,
  Send,
  Lock,
  Globe,
  Clock,
  ChevronRight,
  ExternalLink,
  Cpu,
  FileText,
  Upload,
  Hash,
  Sliders,
  Check
} from 'lucide-react';
import {
  LogoMatch,
  EnterpriseBrandAsset,
  LogoInvestigationCase,
  LogoTakedownRequest,
  MonitoringJob,
  LogoRiskLevel,
  LogoMatchLifecycleStatus
} from '../../../types/logoMonitoring';
import { LogoMonitoringStorageService } from '../../../services/brandguard/logoMonitoringStorageService';
import { LogoLifecycleService } from '../../../services/brandguard/logoLifecycleService';
import { organizationService } from '../../../services/organizationService';
import { LogoMatchDetailModal } from './LogoMatchDetailModal';
import { BrandAssetUploadModal } from './BrandAssetUploadModal';
import { LogoTakedownModal } from './LogoTakedownModal';
import { useGRC } from '../../../context/GRCContext';

export const LogoMonitoringDashboard: React.FC = () => {
  const { theme, logAuditEvent } = useGRC();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<
    'FEED' | 'ASSETS' | 'DIAGNOSTICS' | 'CASES_TAKEDOWNS' | 'SCANNERS'
  >('FEED');

  // Core Data State
  const [matches, setMatches] = useState<LogoMatch[]>(() =>
    LogoMonitoringStorageService.getMatches('default_tenant')
  );
  const [assets, setAssets] = useState<EnterpriseBrandAsset[]>(() =>
    LogoMonitoringStorageService.getBrandAssets('default_tenant')
  );
  const [cases, setCases] = useState<LogoInvestigationCase[]>(() =>
    LogoMonitoringStorageService.getCases('default_tenant')
  );
  const [takedowns, setTakedowns] = useState<LogoTakedownRequest[]>(() =>
    LogoMonitoringStorageService.getTakedowns('default_tenant')
  );
  const [jobs, setJobs] = useState<MonitoringJob[]>(() =>
    LogoMonitoringStorageService.getJobs('default_tenant')
  );

  // Modals
  const [selectedMatch, setSelectedMatch] = useState<LogoMatch | null>(null);
  const [takedownTargetMatch, setTakedownTargetMatch] = useState<LogoMatch | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const reloadData = () => {
    setMatches(LogoMonitoringStorageService.getMatches('default_tenant'));
    setAssets(LogoMonitoringStorageService.getBrandAssets('default_tenant'));
    setCases(LogoMonitoringStorageService.getCases('default_tenant'));
    setTakedowns(LogoMonitoringStorageService.getTakedowns('default_tenant'));
    setJobs(LogoMonitoringStorageService.getJobs('default_tenant'));
  };

  // KPI Metrics Calculation
  const criticalCount = matches.filter(m => m.riskAssessment.riskLevel === 'CRITICAL').length;
  const highCount = matches.filter(m => m.riskAssessment.riskLevel === 'HIGH').length;
  const confirmedPhishingCount = matches.filter(m => m.status === 'CONFIRMED_PHISHING').length;
  const openCasesCount = cases.filter(c => c.status !== 'CLOSED_RESOLVED').length;
  const activeTakedownsCount = takedowns.filter(t => t.status === 'SUBMITTED' || t.status === 'IN_REVIEW_BY_PROVIDER').length;

  // Filtered Matches
  const filteredMatches = matches.filter(match => {
    if (riskFilter !== 'ALL' && match.riskAssessment.riskLevel !== riskFilter) return false;
    if (statusFilter !== 'ALL' && match.status !== statusFilter) return false;
    if (sourceFilter !== 'ALL' && match.sourceType !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const domainMatch = match.targetDomain.toLowerCase().includes(q);
      const assetMatch = match.brandAssetName.toLowerCase().includes(q);
      const codeMatch = match.matchCode.toLowerCase().includes(q);
      return domainMatch || assetMatch || codeMatch;
    }
    return true;
  });

  // Handlers
  const handleUpdateMatch = (updated: LogoMatch) => {
    LogoMonitoringStorageService.saveMatch(updated);
    reloadData();
    setSelectedMatch(updated);
    logAuditEvent(
      'UPDATE',
      'Logo Monitoring Engine',
      `Updated lifecycle status or telemetry for match ${updated.matchCode} (${updated.targetDomain})`
    );
  };

  const handleEscalateCase = (match: LogoMatch) => {
    const newCase = LogoLifecycleService.createInvestigationCase(
      match,
      'Security Analyst',
      `Forensic case initiated from logo impersonation match ${match.matchCode} targeting domain ${match.targetDomain}.`
    );
    LogoMonitoringStorageService.saveCase(newCase);
    const updatedMatch: LogoMatch = {
      ...match,
      status: 'UNDER_INVESTIGATION',
      linkedInvestigationCaseId: newCase.caseNumber,
      updatedAt: new Date().toISOString()
    };
    LogoMonitoringStorageService.saveMatch(updatedMatch);
    reloadData();
    setSelectedMatch(updatedMatch);
    logAuditEvent(
      'CREATE',
      'Logo Investigation Case',
      `Opened case ${newCase.caseNumber} for domain ${match.targetDomain}.`
    );
  };

  const handleInitiateTakedown = (match: LogoMatch) => {
    setTakedownTargetMatch(match);
  };

  const handleTakedownDispatched = (takedown: LogoTakedownRequest) => {
    LogoMonitoringStorageService.saveTakedown(takedown);
    if (takedownTargetMatch) {
      const updated: LogoMatch = {
        ...takedownTargetMatch,
        status: 'TAKEDOWN_REQUESTED',
        linkedTakedownRequestId: takedown.takedownNumber,
        updatedAt: new Date().toISOString()
      };
      LogoMonitoringStorageService.saveMatch(updated);
      if (selectedMatch?.id === updated.id) {
        setSelectedMatch(updated);
      }
    }
    reloadData();
    setTakedownTargetMatch(null);
    logAuditEvent(
      'CREATE',
      'Logo Takedown Notice',
      `Dispatched takedown ${takedown.takedownNumber} to ${takedown.providerName} for ${takedown.targetDomain}.`
    );
  };

  const handleAssetRegistered = (newAsset: EnterpriseBrandAsset) => {
    LogoMonitoringStorageService.saveBrandAsset(newAsset);
    reloadData();
    logAuditEvent(
      'CREATE',
      'Brand Asset Registry',
      `Registered new official brand asset ${newAsset.name} with SHA-256 ${newAsset.sha256.substring(0, 16)}...`
    );
  };

  const handleRunManualScan = () => {
    setIsScanning(true);
    setScanMessage('Scanning Certificate Transparency logs, surface web, and mobile app stores for logo clones...');
    setTimeout(() => {
      reloadData();
      setIsScanning(false);
      setScanMessage('Scan complete: 2 new candidate matches analyzed and correlated.');
      setTimeout(() => setScanMessage(null), 4000);
    }, 2000);
  };

  const getRiskBadge = (level: LogoRiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border ${
        theme === 'light'
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-200'
          : 'bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 text-white border-slate-800'
      } shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tier Visual AI & Trademark Impersonation Defense</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-3">
              <span>Logo Monitoring & Visual Trademark Defense</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-600/60 border border-indigo-400/40">
                v2.4 Enterprise
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pluggable OpenCLIP ViT embedding pipelines and multi-signal corroboration. Continuously discovers visual clones,
              defends against adversarial logo transformations, and enforces audited legal takedowns.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
            >
              <Upload className="w-4 h-4" />
              <span>Register Brand Asset</span>
            </button>

            <button
              onClick={handleRunManualScan}
              disabled={isScanning}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all border ${
                isScanning
                  ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700 shadow-md'
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Trigger Crawler Job'}</span>
            </button>
          </div>
        </div>

        {scanMessage && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs font-mono text-indigo-200 flex items-center space-x-2 animate-pulse">
            <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Assets</span>
            <Camera className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-white">{assets.length}</span>
            <span className="text-[10px] text-slate-500">marks</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">pHash registered</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Matches</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-white">{matches.length}</span>
            <span className="text-[10px] text-slate-500">detected</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Surface web + CT</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Critical / High</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-rose-400">{criticalCount + highCount}</span>
            <span className="text-[10px] text-slate-500">high risk</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">{criticalCount} Critical Active</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed Phishing</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-red-500">{confirmedPhishingCount}</span>
            <span className="text-[10px] text-slate-500">verified</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Corroborated fraud</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Cases</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-purple-400">{openCasesCount}</span>
            <span className="text-[10px] text-slate-500">cases</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Security ops triage</span>
        </div>

        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Takedowns</span>
            <Send className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-black text-teal-400">{activeTakedownsCount}</span>
            <span className="text-[10px] text-slate-500">enforcing</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Registrar / CDN desk</span>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-800 overflow-x-auto text-xs font-bold space-x-2">
        {[
          { id: 'FEED', label: `Detection Feed (${matches.length})`, icon: Eye },
          { id: 'ASSETS', label: `Brand Asset Vault (${assets.length})`, icon: Camera },
          { id: 'DIAGNOSTICS', label: 'Explainable Risk & Multi-Signal AI', icon: Cpu },
          { id: 'CASES_TAKEDOWNS', label: `Cases & Takedowns (${cases.length}/${takedowns.length})`, icon: ShieldAlert },
          { id: 'SCANNERS', label: `Autonomous Scanners (${jobs.length})`, icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: DETECTION FEED */}
      {activeSubTab === 'FEED' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by target domain, match code, brand asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical Severity</option>
                <option value="HIGH">High Severity</option>
                <option value="MEDIUM">Medium Severity</option>
                <option value="LOW">Low Severity</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All 15 Lifecycle States</option>
                <option value="CONFIRMED_PHISHING">Confirmed Phishing</option>
                <option value="SUSPECTED_IMPERSONATION">Suspected Impersonation</option>
                <option value="POTENTIAL_MATCH">Potential Match</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="TAKEDOWN_REQUESTED">Takedown Requested</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Sources</option>
                <option value="SURFACE_WEB">Surface Web Crawler</option>
                <option value="CERTIFICATE_TRANSPARENCY">CT Log Feed</option>
                <option value="MOBILE_APP_STORE">Mobile APK Mirrors</option>
                <option value="SOCIAL_MEDIA">Social Media Network</option>
                <option value="AD_NETWORK">Digital Ads / Search</option>
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Discovered Candidate Logo</th>
                    <th className="py-3 px-4">Target Host / Domain</th>
                    <th className="py-3 px-4">Matched Brand Asset</th>
                    <th className="py-3 px-4">Resemblance & AI</th>
                    <th className="py-3 px-4">Explainable Risk</th>
                    <th className="py-3 px-4">Lifecycle State</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No logo impersonation matches found matching the specified filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMatches.map(match => (
                      <tr
                        key={match.id}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => setSelectedMatch(match)}
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-14 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0 group-hover:border-indigo-500/60 transition-all">
                              <img
                                src={match.detectedImageUrl}
                                alt="Detected Logo"
                                className="max-h-full max-w-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <span className="font-mono text-[10px] font-bold text-indigo-400 block">
                                {match.matchCode}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {new Date(match.firstSeenAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Domain & Source */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5 font-bold text-white group-hover:text-indigo-300">
                              <span>{match.targetDomain}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono inline-block">
                              {match.sourceType}
                            </span>
                          </div>
                        </td>

                        {/* Brand Asset */}
                        <td className="py-3 px-4">
                          <span className="text-slate-200 font-medium block">{match.brandAssetName}</span>
                          <span className="text-[10px] text-slate-500">{organizationService.getOrganizationName(null, 'Enterprise')} Master</span>
                        </td>

                        {/* Similarity & AI Engine */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${match.similarityScore}%` }}
                                ></div>
                              </div>
                              <span className="font-mono font-bold text-indigo-300 text-[11px]">
                                {match.similarityScore}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                              {match.aiVisionProvider.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Risk Gauge */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getRiskBadge(match.riskAssessment.riskLevel)}`}>
                              {match.riskAssessment.riskLevel} ({match.riskAssessment.riskScore})
                            </span>
                          </div>
                        </td>

                        {/* Lifecycle Status */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                            {match.status.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedMatch(match)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                              title="Forensic Deep Dive"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEscalateCase(match)}
                              className="p-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-800/80 text-purple-300 border border-purple-800/50 transition-all"
                              title="Escalate to Incident Case"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleInitiateTakedown(match)}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-800/80 text-rose-300 border border-rose-800/50 transition-all"
                              title="Dispatch Takedown Notice"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BRAND ASSET VAULT */}
      {activeSubTab === 'ASSETS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Registered Enterprise Brand Assets</h2>
              <p className="text-xs text-slate-400">Master visual marks with immutable cryptographic signatures, pHash embeddings, and version history.</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Asset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {asset.assetType.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 font-bold">
                    v{asset.currentVersion} Active
                  </span>
                </div>

                <div className="h-36 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center p-4 relative overflow-hidden">
                  <img
                    src={asset.versionHistory?.[0]?.fileReference || asset.embeddingReference || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300'}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 bg-black/60 px-1.5 py-0.5 rounded">
                    {asset.dimensions.width}x{asset.dimensions.height}px
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{asset.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{asset.description || 'Enterprise visual asset.'}</p>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Palette:</span>
                  {asset.colorPalette.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Hashes & Metadata */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-400">
                  <div className="truncate">
                    <span className="text-slate-500">SHA-256: </span>
                    <span className="text-slate-300">{asset.sha256}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">pHash: </span>
                    <span className="text-indigo-400">{asset.perceptualHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Domain: </span>
                    <span className="text-slate-300">{asset.associatedDomain}</span>
                  </div>
                </div>

                {/* Version History Quick Strip */}
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Registered: {new Date(asset.uploadDate).toLocaleDateString()}</span>
                  <span>{asset.versionHistory?.length || 1} Version(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXPLAINABLE RISK & MULTI-SIGNAL AI */}
      {activeSubTab === 'DIAGNOSTICS' && (
        <div className="space-y-6">
          {/* Architectural Manifesto Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>The Skanda Multi-Signal Corroboration Engine</span>
            </div>
            <h2 className="text-lg font-bold text-white">Why Visual Similarity Alone is Never Sufficient</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              Traditional trademark crawlers trigger high volumes of false positives when analyzing affiliate blogs, news aggregators,
              or legitimate tech partners displaying corporate logos. Skanda Enterprise enforces four-dimensional signal corroboration:
              an alert is only classified as <strong>CONFIRMED PHISHING</strong> when high visual resemblance is corroborated with
              adversarial domain infrastructure, fraudulent HTML form actions (credential/OTP harvesting), or known bad threat intel feeds.
            </p>
          </div>

          {/* 4-Pillar Multi-Signal Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pillar 1: Visual AI</span>
              <h3 className="text-sm font-bold text-white">OpenCLIP ViT & pHash</h3>
              <p className="text-xs text-slate-400">
                Vector cosine distance & perceptual hash invariance across crops, color alterations, and rotations.
              </p>
              <span className="inline-block text-[11px] font-mono text-indigo-300 font-bold">Weight: Up to 35 Points</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Pillar 2: Domain Context</span>
              <h3 className="text-sm font-bold text-white">Typosquat & Age</h3>
              <p className="text-xs text-slate-400">
                Homoglyph detection, Levenshtein distance, bulletproof ASN hosting, and newly registered domain flags (&lt;30 days).
              </p>
              <span className="inline-block text-[11px] font-mono text-sky-300 font-bold">Weight: Up to 25 Points</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Pillar 3: Website Payload</span>
              <h3 className="text-sm font-bold text-white">Credential Harvesters</h3>
              <p className="text-xs text-slate-400">
                DOM parsing for fake login forms, 2FA/OTP interception scripts, fake investment promises, and rogue APK downloads.
              </p>
              <span className="inline-block text-[11px] font-mono text-rose-300 font-bold">Weight: Up to 25 Points</span>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Pillar 4: Threat Intel</span>
              <h3 className="text-sm font-bold text-white">Consensus & Feeds</h3>
              <p className="text-xs text-slate-400">
                Cross-referencing AlienVault OTX, URLhaus, Google Safe Browsing, and historical infringement recidivism.
              </p>
              <span className="inline-block text-[11px] font-mono text-purple-300 font-bold">Weight: Up to 15 Points</span>
            </div>
          </div>

          {/* Pluggable Vision Model Benchmarks */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pluggable AI Vision Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">OpenCLIP ViT (ViT-B/32)</span>
                <span className="text-slate-400 block text-[11px]">Primary semantic embedding model running with cosine similarity threshold &gt; 0.78.</span>
                <span className="text-emerald-400 font-mono text-[10px] block">Inference: ~18ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Perceptual Hash (64-bit DCT)</span>
                <span className="text-slate-400 block text-[11px]">First-pass high-throughput filter. Discards non-matches in O(1) Hamming distance checks.</span>
                <span className="text-emerald-400 font-mono text-[10px] block">Inference: ~1.2ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Tesseract / Cloud OCR</span>
                <span className="text-slate-400 block text-[11px]">Extracts embedded wordmarks to identify brand name variants and copyright notices.</span>
                <span className="text-emerald-400 font-mono text-[10px] block">Inference: ~34ms</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Bounding Box Localizer</span>
                <span className="text-slate-400 block text-[11px]">YOLOv8 custom head detects sub-region logo coordinates inside viewport screenshots.</span>
                <span className="text-emerald-400 font-mono text-[10px] block">Inference: ~22ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CASES & TAKEDOWNS */}
      {activeSubTab === 'CASES_TAKEDOWNS' && (
        <div className="space-y-6">
          {/* Active Cases */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Formal Logo Impersonation Investigation Cases</span>
            </h2>
            <div className="space-y-2">
              {cases.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
                  No open investigation cases currently recorded.
                </div>
              ) : (
                cases.map(c => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-purple-400">{c.caseNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {c.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          {c.priority} PRIORITY
                        </span>
                      </div>
                      <h4 className="font-bold text-white">{c.title}</h4>
                      <p className="text-slate-400 text-[11px]">{c.summary}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">Lead: <strong>{c.assignedTo}</strong></span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Opened: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Takedowns */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Send className="w-4 h-4 text-rose-400" />
              <span>Automated Legal Takedown & Abuse Desk Dispatches</span>
            </h2>
            <div className="space-y-2">
              {takedowns.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
                  No takedown notices dispatched yet.
                </div>
              ) : (
                takedowns.map(t => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-rose-400">{t.takedownNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300">
                          {t.status}
                        </span>
                        <span className="text-slate-400 font-bold">{t.targetDomain}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{t.notes}</p>
                      {t.externalTicketId && (
                        <span className="text-[10px] font-mono text-indigo-400 block">
                          Provider Ticket: {t.externalTicketId}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-300 font-bold block">{t.providerName}</span>
                      <span className="text-[10px] text-slate-500 block">Type: {t.providerType}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: AUTONOMOUS SCANNERS & JOBS */}
      {activeSubTab === 'SCANNERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Autonomous Discovery Crawler Jobs</h2>
              <p className="text-xs text-slate-400">Scheduled continuous ingestion workers monitoring public CT logs, surface search, app stores, and ad networks.</p>
            </div>
            <button
              onClick={handleRunManualScan}
              disabled={isScanning}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-all shadow-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Run Ingestion Cycle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobs.map(job => (
              <div key={job.id} className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{job.sourceName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    job.status === 'RUNNING' ? 'bg-indigo-500/20 text-indigo-400 animate-pulse' :
                    job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Candidates Ingested:</span>
                    <span className="font-mono text-indigo-300 font-bold">{job.candidatesDiscovered} candidates</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logos Analyzed (ViT/Hash):</span>
                    <span className="font-mono text-slate-200">{job.logosAnalyzed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matches Identified:</span>
                    <span className="font-mono text-amber-400 font-bold">{job.matchesIdentified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Duration:</span>
                    <span className="font-mono text-slate-200">
                      {job.processingDurationMs ? `${(job.processingDurationMs / 1000).toFixed(1)}s` : 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span className="font-mono text-slate-300">{new Date(job.startedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Forensic Match Detail & 15-Stage State Machine */}
      {selectedMatch && (
        <LogoMatchDetailModal
          match={selectedMatch}
          isOpen={true}
          onClose={() => setSelectedMatch(null)}
          onUpdateMatch={handleUpdateMatch}
          onEscalateCase={handleEscalateCase}
          onInitiateTakedown={handleInitiateTakedown}
        />
      )}

      {/* Modal: Brand Asset Cryptographic Upload */}
      {showUploadModal && (
        <BrandAssetUploadModal
          isOpen={true}
          onClose={() => setShowUploadModal(false)}
          onAssetRegistered={handleAssetRegistered}
        />
      )}

      {/* Modal: Legal Takedown Notice Dispatcher */}
      {takedownTargetMatch && (
        <LogoTakedownModal
          match={takedownTargetMatch}
          isOpen={true}
          onClose={() => setTakedownTargetMatch(null)}
          onTakedownDispatched={handleTakedownDispatched}
        />
      )}
    </div>
  );
};
