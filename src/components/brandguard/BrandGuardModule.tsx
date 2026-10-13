// Skanda BrandGuard — Master Command Center & Surface Web Monitoring Module
// Enterprise Digital Brand Protection, Surface Discovery, Visual Logo Misuse Detection,
// Executive Protection, Explainable Risk Scoring, and Automated Abuse Mitigation.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Search,
  AlertTriangle,
  Flame,
  UserCheck,
  Eye,
  Server,
  Layers,
  FileText,
  Building,
  Lock,
  Plus,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
  Zap,
  DollarSign,
  Activity,
  Award,
  Terminal,
  X,
  Mail,
  Network,
  Key,
  Split,
  Download,
  Radio,
  Scale,
  Cpu,
  Camera,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import {
  BrandAsset,
  BrandFinding,
  BrandFindingSeverity,
  BrandFindingStatus,
  BrandFindingType,
  BrandGuardDashboardMetrics,
  BrandProfile,
  ExecutiveProfile,
  CommercialTier,
  BrandExposureRadarMetrics,
  CryptographicEvidenceBundle
} from '../../types/brandguard';
import { BrandGuardStorageService } from '../../services/brandguard/brandguardStorageService';
import { brandGuardNotificationService } from '../../services/brandguard/brandguardNotificationService';
import { BrandGuardDiscoveryEngine, GeneratedQuery } from '../../services/brandguard/brandguardDiscoveryEngine';
import { BrandGuardProviderRegistry, ProviderStats } from '../../services/brandguard/brandguardProviderService';
import { BrandGuardFindingDetailModal } from './BrandGuardFindingDetailModal';
import { BrandGuardCTLogStream } from './BrandGuardCTLogStream';
import { BrandGuardTakedownSlaDesk } from './BrandGuardTakedownSlaDesk';
import { BrandGuardDefensiveMatrix } from './BrandGuardDefensiveMatrix';
import { BrandGuardSafeBrowsingModal } from './BrandGuardSafeBrowsingModal';
import { BrandGuardEmailSpoofModal } from './BrandGuardEmailSpoofModal';
import { BrandGuardClonedSiteComparisonModal } from './BrandGuardClonedSiteComparisonModal';
import { BrandGuardThreatClusters } from './BrandGuardThreatClusters';
import { BrandGuardCredentialLeaks } from './BrandGuardCredentialLeaks';
import { BrandGuardEasmTakeoverDesk } from './BrandGuardEasmTakeoverDesk';
import { BrandGuardZeroHourIocDesk } from './BrandGuardZeroHourIocDesk';
import { BrandGuardCtFunnelDesk } from './BrandGuardCtFunnelDesk';
import { BrandGuardExecutiveProtectionDesk } from './BrandGuardExecutiveProtectionDesk';
import { BrandGuardPhishingForensicsModal } from './BrandGuardPhishingForensicsModal';
import { BrandGuardWipoDossierModal } from './BrandGuardWipoDossierModal';
import { BrandGuardBoardDeckPdfExporter } from '../../services/brandguard/brandguardBoardDeckPdfExporter';
import { BrandGuardClusteringService } from '../../services/brandguard/brandguardClusteringService';
import { BrandGuardLeakageService } from '../../services/brandguard/brandguardLeakageService';
import { LogoMonitoringDashboard } from './logo/LogoMonitoringDashboard';
import { BrandGuardEvidenceCustodyDesk } from './BrandGuardEvidenceCustodyDesk';
import { BrandGuardEvidenceDossierDrawer } from './BrandGuardEvidenceDossierDrawer';
import { IncidentResponseTimeline } from '../incident/IncidentResponseTimeline';
import { BrandGuardThreatHeatmap } from './BrandGuardThreatHeatmap';
import { BrandGuardIgnoreDomainModal } from './BrandGuardIgnoreDomainModal';
import { PageContainer } from '../layout/PageContainer';
import { RechartsSparkline } from '../common/RechartsSparkline';
import { MonthOverMonthDataPoint } from '../../utils/momComplianceMetrics';
import { useGRC } from '../../context/GRCContext';

export interface BrandGuardModuleProps {
  initialTab?:
    | 'DASHBOARD'
    | 'FINDINGS'
    | 'THREAT_HEATMAP'
    | 'LOGO_MONITORING'
    | 'EASM_TAKEOVER'
    | 'ZERO_HOUR_IOC'
    | 'CT_FUNNEL_VIT'
    | 'THREAT_CLUSTERS'
    | 'LEAKAGE_MONITOR'
    | 'CT_STREAM'
    | 'TAKEDOWN_SLA'
    | 'DEFENSIVE_MATRIX'
    | 'BRAND_REGISTRY'
    | 'EXECUTIVE_REGISTRY'
    | 'DISCOVERY_ENGINE'
    | 'MITIGATION_DESK'
    | 'TIERS_SANDBOX'
    | 'EVIDENCE_CUSTODY';
  initialZone?: 'ALL' | 'THREAT_INTEL' | 'ATTACK_SURFACE' | 'RESPONSE_ENFORCEMENT';
}

export const BrandGuardModule: React.FC<BrandGuardModuleProps> = ({
  initialTab,
  initialZone
}) => {
  const { theme, logAuditEvent } = useGRC();

  // Operational Zone Navigation
  const [activeZone, setActiveZone] = useState<'ALL' | 'THREAT_INTEL' | 'ATTACK_SURFACE' | 'RESPONSE_ENFORCEMENT'>(
    initialZone || 'ALL'
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'FINDINGS' | 'LOGO_MONITORING' | 'EASM_TAKEOVER' | 'ZERO_HOUR_IOC' | 'CT_FUNNEL_VIT' | 'THREAT_CLUSTERS' | 'THREAT_HEATMAP' | 'LEAKAGE_MONITOR' | 'CT_STREAM' | 'TAKEDOWN_SLA' | 'DEFENSIVE_MATRIX' | 'BRAND_REGISTRY' | 'EXECUTIVE_REGISTRY' | 'DISCOVERY_ENGINE' | 'MITIGATION_DESK' | 'TIERS_SANDBOX' | 'EVIDENCE_CUSTODY'
  >(initialTab || 'DASHBOARD');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialZone) {
      setActiveZone(initialZone);
    }
  }, [initialTab, initialZone]);

  const [wipoFinding, setWipoFinding] = useState<BrandFinding | null>(null);
  const [forensicsFinding, setForensicsFinding] = useState<BrandFinding | null>(null);
  const [showIncidentTimelineModal, setShowIncidentTimelineModal] = useState<boolean>(false);

  // Core State
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(() => BrandGuardStorageService.getBrandProfile());
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>(() => BrandGuardStorageService.getBrandAssets());
  const [executives, setExecutives] = useState<ExecutiveProfile[]>(() => BrandGuardStorageService.getExecutiveProfiles());
  const [findings, setFindings] = useState<BrandFinding[]>(() => BrandGuardStorageService.getFindings());
  const [metrics, setMetrics] = useState<BrandGuardDashboardMetrics>(() => BrandGuardStorageService.getDashboardMetrics());
  const [providerStats, setProviderStats] = useState<ProviderStats[]>(() => BrandGuardProviderRegistry.getProviderStats());

  // Historical Score Trend Sparkline State for Brand Exposure Score Card
  const [trendTimeRange, setTrendTimeRange] = useState<'6M' | '30D'>('6M');
  const sparklineRef = useRef<HTMLDivElement>(null);
  const [sparklineWidth, setSparklineWidth] = useState<number>(220);
  const [isScoreCardHovered, setIsScoreCardHovered] = useState<boolean>(false);

  useEffect(() => {
    if (!sparklineRef.current) return;
    const updateWidth = () => {
      if (sparklineRef.current) {
        const w = sparklineRef.current.clientWidth;
        if (w > 60) {
          setSparklineWidth(Math.max(120, w - 8));
        }
      }
    };
    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(sparklineRef.current);
    return () => observer.disconnect();
  }, []);

  // 6-Month Month-over-Month historical trend data anchored to live metrics.brandExposureScore
  const brandExposure6MHistory: MonthOverMonthDataPoint[] = useMemo(() => {
    const current = metrics.brandExposureScore;
    const prev = 75;
    const delta = Number((current - prev).toFixed(1));
    return [
      {
        month: 'Apr',
        year: 2026,
        date: '30 Apr 2026',
        fullDate: 'Apr 2026',
        value: 64,
        isImprovement: false,
        milestone: 'Initial Surface Baseline'
      },
      {
        month: 'May',
        year: 2026,
        date: '31 May 2026',
        fullDate: 'May 2026',
        value: 71,
        previousValue: 64,
        delta: 7,
        deltaFormatted: '+7 pts',
        isImprovement: false,
        milestone: 'Typosquatting Wave Detected'
      },
      {
        month: 'Jun',
        year: 2026,
        date: '30 Jun 2026',
        fullDate: 'Jun 2026',
        value: 66,
        previousValue: 71,
        delta: -5,
        deltaFormatted: '-5 pts',
        isImprovement: true,
        milestone: 'Registrar Suspensions Enforced'
      },
      {
        month: 'Jul',
        year: 2026,
        date: '31 Jul 2026',
        fullDate: 'Jul 2026',
        value: 78,
        previousValue: 66,
        delta: 12,
        deltaFormatted: '+12 pts',
        isImprovement: false,
        milestone: 'C-Suite Executive Impersonation'
      },
      {
        month: 'Aug',
        year: 2026,
        date: '31 Aug 2026',
        fullDate: 'Aug 2026',
        value: 75,
        previousValue: 78,
        delta: -3,
        deltaFormatted: '-3 pts',
        isImprovement: true,
        milestone: 'Abuse Desk Takedowns Confirmed'
      },
      {
        month: 'Sep',
        year: 2026,
        date: '14 Sep 2026',
        fullDate: 'Sep 2026',
        value: current,
        previousValue: 75,
        delta: delta,
        deltaFormatted: `${delta > 0 ? '+' : ''}${delta} pts`,
        isImprovement: delta <= 0,
        milestone: 'Active Multi-Vector Perimeter Surveillance'
      }
    ];
  }, [metrics.brandExposureScore]);

  // 30-Day High-Frequency rolling historical trend
  const brandExposure30DHistory: MonthOverMonthDataPoint[] = useMemo(() => {
    const current = metrics.brandExposureScore;
    const baseOffsets = [-6, -4, -1, +3, +1, -2, +4, +2, +1, 0];
    const dates = [
      '16 Aug', '19 Aug', '23 Aug', '26 Aug', '30 Aug',
      '02 Sep', '05 Sep', '09 Sep', '12 Sep', '14 Sep'
    ];
    const milestones = [
      'Automated RDAP sweep',
      'Favicon hash match',
      'TLS cert renewal flag',
      'Telegram bot clone detected',
      'DMCA sent to hosting provider',
      'DNS hold active',
      'CEO spoofing email campaign',
      'Mailgun MX filter added',
      'Google Safe Browsing sync',
      'Surface perimeter clear'
    ];

    return baseOffsets.map((offset, idx) => {
      const val = Math.max(20, Math.min(95, current + offset));
      const prevVal = idx > 0 ? Math.max(20, Math.min(95, current + baseOffsets[idx - 1])) : undefined;
      const d = prevVal !== undefined ? Number((val - prevVal).toFixed(1)) : undefined;
      return {
        month: dates[idx].split(' ')[1],
        year: 2026,
        date: `${dates[idx]} 2026`,
        fullDate: `${dates[idx]} 2026`,
        value: val,
        previousValue: prevVal,
        delta: d,
        deltaFormatted: d !== undefined ? `${d > 0 ? '+' : ''}${d} pts` : undefined,
        isImprovement: d !== undefined ? d <= 0 : true,
        milestone: milestones[idx]
      };
    });
  }, [metrics.brandExposureScore]);

  const activeTrendData = trendTimeRange === '6M' ? brandExposure6MHistory : brandExposure30DHistory;
  const activeTrendLastPoint = activeTrendData[activeTrendData.length - 1];
  const activeTrendFirstPoint = activeTrendData[0];
  const activeTrendDelta = activeTrendLastPoint && activeTrendFirstPoint
    ? Number((activeTrendLastPoint.value - (activeTrendLastPoint.previousValue ?? activeTrendFirstPoint.value)).toFixed(1))
    : 0;

  const isTrendImproving = activeTrendDelta < 0;
  const isTrendWorsening = activeTrendDelta > 0;
  const isTrendFlat = activeTrendDelta === 0;
  const trendDeltaFormatted = activeTrendDelta > 0
    ? `+${activeTrendDelta} pts`
    : activeTrendDelta < 0
    ? `${activeTrendDelta} pts`
    : '0.0 pts';
  const trendStatusLabel = isTrendImproving ? 'improving' : isTrendWorsening ? 'elevating' : 'stable';

  const trendValues = activeTrendData.map(d => d.value);
  const minScoreVal = Math.min(...trendValues);
  const maxScoreVal = Math.max(...trendValues);

  // Safe Browsing Rapid Blacklist Modal State
  const [safeBrowsingFinding, setSafeBrowsingFinding] = useState<BrandFinding | null>(null);

  // Email Spoofability Modal State
  const [emailSpoofDomain, setEmailSpoofDomain] = useState<string | null>(null);

  // Cloned Site Comparison Workbench Modal State
  const [clonedSiteFinding, setClonedSiteFinding] = useState<BrandFinding | null>(null);

  // Board Deck PDF Export State
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Evidence Dossier Side-Drawer State
  const [dossierDrawerState, setDossierDrawerState] = useState<{
    isOpen: boolean;
    finding?: BrandFinding | null;
    bundle?: CryptographicEvidenceBundle | null;
  }>({
    isOpen: false,
    finding: null,
    bundle: null
  });

  const handleOpenDossierDrawer = (finding?: BrandFinding | null, bundle?: CryptographicEvidenceBundle | null) => {
    setDossierDrawerState({
      isOpen: true,
      finding: finding || null,
      bundle: bundle || null
    });
  };

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Selected Finding for Forensic Deep Dive
  const [selectedFinding, setSelectedFinding] = useState<BrandFinding | null>(null);

  // Discovery Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [generatedQueries, setGeneratedQueries] = useState<GeneratedQuery[]>([]);

  // Add Asset Modal
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState<BrandAsset['assetType']>('PRIMARY_LOGO');
  const [newAssetUrl, setNewAssetUrl] = useState('');

  // Add Executive Modal
  const [showAddExecModal, setShowAddExecModal] = useState(false);
  const [newExecName, setNewExecName] = useState('');
  const [newExecTitle, setNewExecTitle] = useState('');
  const [newExecDept, setNewExecDept] = useState('');
  const [newExecEmail, setNewExecEmail] = useState('');

  // Ignore Domain State & False Positive Suppression
  const [findingToIgnore, setFindingToIgnore] = useState<BrandFinding | null>(null);
  const [showIgnoreModal, setShowIgnoreModal] = useState<boolean>(false);
  const [hideIgnored, setHideIgnored] = useState<boolean>(true);

  const ignoredCount = useMemo(() => {
    return findings.filter(f => f.isIgnored || f.status === 'FALSE_POSITIVE' || f.status === 'IGNORED').length;
  }, [findings]);

  const handleOpenIgnoreModal = (finding: BrandFinding) => {
    setFindingToIgnore(finding);
    setShowIgnoreModal(true);
  };

  const handleConfirmIgnore = (domain: string, reason: string, findingId?: string) => {
    BrandGuardStorageService.ignoreDomain(
      'default_tenant',
      domain,
      reason,
      'Threat Analyst',
      'Security Operations',
      findingId
    );
    reloadData();
    setShowIgnoreModal(false);
    setFindingToIgnore(null);
    logAuditEvent(
      'UPDATE',
      'BrandGuard Threat Suppression',
      `Persisted domain "${domain}" into False-Positive Whitelist registry. Reason: ${reason}`
    );
    brandGuardNotificationService.showNotification({
      title: 'Impersonation Domain Ignored',
      message: `${domain} has been marked as a false positive and persisted in the database.`,
      type: 'INFO'
    });
  };

  const handleUnignore = (domain: string) => {
    BrandGuardStorageService.unignoreDomain(
      'default_tenant',
      domain,
      'Threat Analyst',
      'Security Operations'
    );
    reloadData();
    logAuditEvent(
      'UPDATE',
      'BrandGuard Threat Restoration',
      `Restored domain "${domain}" to active investigation queue.`
    );
    brandGuardNotificationService.showNotification({
      title: 'Domain Restored',
      message: `${domain} has been restored to active threat queue.`,
      type: 'SUCCESS'
    });
  };

  // Refresh data helper
  const reloadData = () => {
    const profile = BrandGuardStorageService.getBrandProfile();
    const assets = BrandGuardStorageService.getBrandAssets();
    const execs = BrandGuardStorageService.getExecutiveProfiles();
    const fnds = BrandGuardStorageService.getFindings();
    const mtrs = BrandGuardStorageService.getDashboardMetrics();
    const stats = BrandGuardProviderRegistry.getProviderStats();

    setBrandProfile(profile);
    setBrandAssets(assets);
    setExecutives(execs);
    setFindings(fnds);
    setMetrics(mtrs);
    setProviderStats(stats);
    setGeneratedQueries(BrandGuardDiscoveryEngine.generateQueries(profile, execs));
  };

  const handleSimulateThreatAlert = () => {
    brandGuardNotificationService.simulateHighSeverityImpersonation();
    reloadData();
    logAuditEvent('ACCESS', 'BrandGuard Notification Engine', 'Dispatched automated Toast alert for high-severity domain impersonation incident.');
  };

  const handleExportBoardPdf = () => {
    try {
      setIsExportingPdf(true);
      const clusters = BrandGuardClusteringService.getClusters();
      const leaks = BrandGuardLeakageService.getLeaks();

      const domainMimicryRisk = Math.min(95, Math.max(30, metrics.fakeDomainsCount * 12 + 25));
      const emailSpoofingExposure = Math.min(98, Math.max(35, findings.filter(f => f.findingType === 'PHISHING_BRAND_IMPERSONATION' || f.findingType === 'DOMAIN_IMPERSONATION').length * 15 + 30));
      const visualCloneProximity = Math.min(96, Math.max(20, findings.filter(f => (f.logoSimilarityScore || 0) > 75).length * 18 + 25));
      const takedownVelocityMTTR = Math.min(92, Math.max(40, 92 - (metrics.criticalFindingsCount * 5)));
      const brandDefenseCoverage = Math.min(90, Math.max(30, 45 + (metrics.resolvedTakedownsCount * 10)));
      const compositeExposureIndex = Math.round(
        (domainMimicryRisk * 0.25) +
        (emailSpoofingExposure * 0.25) +
        (visualCloneProximity * 0.20) +
        (takedownVelocityMTTR * 0.15) +
        (brandDefenseCoverage * 0.15)
      );

      const radarMetrics: BrandExposureRadarMetrics = {
        domainMimicryRisk,
        emailSpoofingExposure,
        visualCloneProximity,
        takedownVelocityMTTR,
        brandDefenseCoverage,
        compositeExposureIndex,
        executiveNarrative: `Composite Brand Exposure Index sits at ${compositeExposureIndex}/100. Perimeter monitoring observes active targeted spoofing attempts and credential exposures, requiring strict enforcement of registrar takedowns and perimeter DNS revocation.`
      };

      BrandGuardBoardDeckPdfExporter.exportBoardDeckPdf(
        brandProfile,
        radarMetrics,
        findings,
        clusters,
        leaks.credentials,
        leaks.codeLeaks
      );

      logAuditEvent('EXPORT', 'BrandGuard Executive Reporting', 'Generated and downloaded Executive Board Deck PDF');
    } catch (err) {
      console.error('Failed to export Board Deck PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Run On-Demand Discovery Scanner
  const handleRunDiscoveryScan = async (queryOverride?: string) => {
    setIsScanning(true);
    setScanLogs([
      `[${new Date().toLocaleTimeString()}] Initializing Skanda BrandGuard Multi-Provider Crawler...`,
      `[${new Date().toLocaleTimeString()}] Verifying outbound SSRF sandbox filters and DNS rebinding protections...`,
      `[${new Date().toLocaleTimeString()}] Broadcasting queries to Search Engine, DNS/RDAP, and Certificate Transparency logs...`
    ]);

    try {
      const result = await BrandGuardDiscoveryEngine.executeLiveDiscoveryRun('default_tenant', queryOverride);

      setScanLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Executed queries across: ${result.providersQueried.join(', ')}.`,
        `[${new Date().toLocaleTimeString()}] Discovered ${result.totalCandidateUrlsDiscovered} surface web candidate URLs.`,
        `[${new Date().toLocaleTimeString()}] Performed visual vector hashing, OCR extraction, and multi-signal correlation.`,
        `[${new Date().toLocaleTimeString()}] Generated ${result.newFindingsGenerated.length} new high-confidence brand finding(s).`,
        `[${new Date().toLocaleTimeString()}] Completed in ${result.durationMs}ms (Cost: $${result.totalCostUSD.toFixed(4)} USD).`
      ]);

      reloadData();
      logAuditEvent(
        'CREATE',
        'BrandGuard Discovery Engine',
        `Executed live surface web scan. Generated ${result.newFindingsGenerated.length} finding(s) with cost $${result.totalCostUSD.toFixed(4)} USD.`
      );
    } catch (err: any) {
      setScanLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Scan warning: ${err.message || 'Error occurred'}`
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  // Add Asset Handler
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    const newAsset: BrandAsset = {
      id: `asset_${Date.now()}`,
      tenantId: 'default_tenant',
      name: newAssetName.trim(),
      assetType: newAssetType,
      imageUrl: newAssetUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
      fileFormat: 'PNG / Vectorized Vector',
      dimensions: { width: 512, height: 180 },
      aspectRatio: 2.8,
      perceptualHash: Math.random().toString(16).slice(2, 18),
      colorHistogram: ['#4F46E5', '#6366F1', '#0F172A'],
      isPrimary: newAssetType === 'PRIMARY_LOGO' && brandAssets.every(a => !a.isPrimary),
      registeredAt: new Date().toISOString()
    };

    const updated = [...brandAssets, newAsset];
    BrandGuardStorageService.saveBrandAssets('default_tenant', updated);
    setBrandAssets(updated);
    setShowAddAssetModal(false);
    setNewAssetName('');
    setNewAssetUrl('');

    logAuditEvent('CREATE', 'Brand Asset Vault', `Registered new brand asset trademark "${newAsset.name}".`);
  };

  // Add Executive Handler
  const handleAddExecutive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExecName.trim()) return;

    const nameParts = newExecName.trim().split(/\s+/);
    const initials = nameParts.map(p => p[0]?.toUpperCase() || '').join('');

    const newExec: ExecutiveProfile = {
      id: `exec_${Date.now()}`,
      tenantId: 'default_tenant',
      fullName: newExecName.trim(),
      nameVariants: [newExecName.trim(), `${nameParts[0]} ${nameParts[nameParts.length - 1]}`],
      initials: initials || 'EX',
      professionalTitle: newExecTitle.trim() || 'Director',
      department: newExecDept.trim() || 'Executive Committee',
      associatedOrganization: brandProfile.organizationName,
      publicProfileUrl: `https://linkedin.com/in/${newExecName.toLowerCase().replace(/\s+/g, '')}`,
      approvedPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
      publicBiographyExcerpt: `${newExecName.trim()} serves as ${newExecTitle.trim() || 'Executive Leader'} at ${brandProfile.organizationName}.`,
      officialEmail: newExecEmail.trim() || `${newExecName.toLowerCase().replace(/\s+/g, '.')}@apexfintech.com`,
      officialSocialHandles: {
        linkedIn: `https://linkedin.com/in/${newExecName.toLowerCase().replace(/\s+/g, '')}`
      },
      monitoredKeywords: ['investment', 'partnership', 'interview', 'hiring', 'fundraising'],
      isActive: true,
      addedAt: new Date().toISOString()
    };

    const updated = [...executives, newExec];
    BrandGuardStorageService.saveExecutiveProfiles('default_tenant', updated);
    setExecutives(updated);
    setShowAddExecModal(false);
    setNewExecName('');
    setNewExecTitle('');
    setNewExecDept('');
    setNewExecEmail('');

    logAuditEvent('CREATE', 'Executive Registry', `Registered C-suite officer "${newExec.fullName}" (${newExec.professionalTitle}).`);
  };

  // Filtered Findings
  const filteredFindings = findings.filter(f => {
    const isIgnored = f.isIgnored || f.status === 'FALSE_POSITIVE' || f.status === 'IGNORED';
    if (statusFilter === 'ALL' && hideIgnored && isIgnored) {
      return false;
    }
    if (statusFilter === 'ACTIVE' && isIgnored) {
      return false;
    }

    const matchesSearch =
      searchQuery === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.targetDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.findingCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'ALL' || statusFilter === 'ACTIVE'
        ? true
        : statusFilter === 'FALSE_POSITIVE'
        ? isIgnored
        : f.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || f.findingType === typeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  return (
    <PageContainer id="brandguard-module" className="animate-in fade-in duration-300">
      {/* Master 12-Column CSS Grid Layout System for BrandGuardModule Container */}
      <div id="brandguard-container-grid" className="grid grid-cols-12 gap-6 items-stretch w-full stagger-cards">
        {/* === SECTION 1: COMMAND CENTER HEADER SECTIONS (12-COLUMNS) === */}
        {/* 1. Brand Identity & Live Sentry Card (Cols 1-6 on lg) */}
        <div id="brandguard-header-card" className={`col-span-12 lg:col-span-6 p-5 sm:p-6 rounded-xl border border-b-2 relative overflow-hidden flex flex-col justify-between transition-all backdrop-blur-md shadow-inner ${
          theme === 'light'
            ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 border-b-indigo-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_8px_-2px_rgba(15,23,42,0.08)]'
            : 'bg-gradient-to-br from-slate-950 via-indigo-950/70 to-slate-950 text-white border-slate-800 border-b-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
        }`}>
          {/* Background decorative glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Skanda BrandGuard™</span>
              </span>
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>ACTIVE DEFENSE</span>
              </span>
              <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80">
                Tier: Enterprise
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Digital Brand Protection & Threat Discovery
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mt-1 line-clamp-2">
                Autonomous surface web monitoring, visual trademark cloning detection, executive identity impersonation defense,
                and tamper-evident abuse mitigation for <span className="font-semibold text-indigo-300">{brandProfile.organizationName}</span>.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-slate-400 truncate text-[11px] sm:text-xs">
              24/7 Surface Sentry: <strong className="text-slate-200">14 Target Assets</strong> &bull; <strong className="text-slate-200">8 Executive Likenesses</strong> &bull; Next Sweep &lt; 4m
            </span>
          </div>
        </div>

        {/* 2. Brand Exposure Score Card (Cols 7-9 on lg, Cols 1-6 on sm/md) */}
        <div
          id="brandguard-exposure-score-card"
          tabIndex={0}
          role="region"
          aria-label="Brand Exposure Score and Trajectory Card"
          onMouseEnter={() => setIsScoreCardHovered(true)}
          onMouseLeave={() => setIsScoreCardHovered(false)}
          onFocus={() => setIsScoreCardHovered(true)}
          onBlur={() => setIsScoreCardHovered(false)}
          className={`col-span-12 sm:col-span-6 lg:col-span-3 p-5 sm:p-6 rounded-xl border border-b-2 flex flex-col justify-between transition-all duration-300 backdrop-blur-md shadow-inner group/scorecard cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
            theme === 'light'
              ? isScoreCardHovered
                ? 'bg-white border-slate-300 border-b-indigo-600 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_6px_18px_-2px_rgba(15,23,42,0.1)] -translate-y-0.5'
                : 'bg-white/80 border-slate-200/80 border-b-indigo-600 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(15,23,42,0.06)]'
              : isScoreCardHovered
              ? 'bg-slate-900 border-slate-700 border-b-indigo-400 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_2px_4px_rgba(0,0,0,0.4),0_6px_22px_rgba(0,0,0,0.4)] -translate-y-0.5'
              : 'bg-slate-900/80 border-slate-800/80 border-b-indigo-400 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
          }`}
        >
          <div>
            {/* Header: Label & Status Badges */}
            <div className={`flex items-center justify-between pb-2.5 border-b ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800/60'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Brand Exposure Score
              </span>
              <div className="flex items-center gap-1.5">
                {/* CommandCenter-styled Trend Delta Pill with Green/Red Visual Arrow Indicator */}
                <div
                  className={`h-6 px-2 inline-flex items-center justify-center space-x-1 rounded-md text-[10px] font-bold font-mono border whitespace-nowrap shrink-0 leading-none ${
                    isTrendImproving
                      ? theme === 'light'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs'
                        : 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                      : isTrendWorsening
                      ? theme === 'light'
                        ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-2xs'
                        : 'bg-rose-500/15 text-rose-200 border-rose-500/30'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={`${isTrendImproving ? 'Improving Posture' : isTrendWorsening ? 'Elevated Threat' : 'Stable'}: ${trendDeltaFormatted} compared to previous ${trendTimeRange === '6M' ? 'month' : 'sweep'}`}
                >
                  {isTrendImproving ? (
                    <TrendingDown className="w-3.5 h-3.5 shrink-0 text-emerald-500 stroke-[2.5]" />
                  ) : isTrendWorsening ? (
                    <TrendingUp className="w-3.5 h-3.5 shrink-0 text-rose-500 stroke-[2.5]" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 shrink-0 text-slate-400 stroke-[2.5]" />
                  )}
                  <span className="whitespace-nowrap leading-none font-bold">{trendDeltaFormatted}</span>
                  <span className={`text-[9px] font-medium hidden sm:inline ${
                    isTrendImproving
                      ? theme === 'light' ? 'text-emerald-700' : 'text-emerald-300/80'
                      : isTrendWorsening
                      ? theme === 'light' ? 'text-rose-700' : 'text-rose-300/80'
                      : 'text-slate-400'
                  }`}>
                    {trendStatusLabel}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  metrics.brandExposureScore >= 75
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : metrics.brandExposureScore >= 50
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {metrics.brandExposureScore >= 75 ? 'Elevated' : metrics.brandExposureScore >= 50 ? 'Moderate' : 'Guarded'}
                </span>
              </div>
            </div>

            {/* Gauge & Primary Exposure Reading */}
            <div className="flex items-center gap-3.5 mt-3">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    className={theme === 'light' ? 'text-slate-200' : 'text-slate-800'}
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={150}
                    strokeDashoffset={150 - (150 * metrics.brandExposureScore) / 100}
                    className={
                      metrics.brandExposureScore >= 75
                        ? 'text-rose-500'
                        : metrics.brandExposureScore >= 50
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center leading-none">
                  <div className="flex items-center gap-0.5">
                    <span className="text-sm font-black font-mono">
                      {metrics.brandExposureScore}
                    </span>
                    {isTrendImproving ? (
                      <TrendingDown className="w-2.5 h-2.5 text-emerald-500 stroke-[2.5]" />
                    ) : isTrendWorsening ? (
                      <TrendingUp className="w-2.5 h-2.5 text-rose-500 stroke-[2.5]" />
                    ) : null}
                  </div>
                  <span className="text-[8px] font-mono text-slate-400">pts</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-bold truncate ${
                  metrics.brandExposureScore >= 75 ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {metrics.brandExposureScore >= 75 ? 'High Perimeter Risk' : 'Guarded Perimeter'}
                </div>

                {/* Visual Trend Performance Movement Row */}
                <div className="flex items-center space-x-1.5 text-[11px] mt-1 truncate">
                  <span className={`inline-flex items-center shrink-0 ${
                    isTrendImproving ? 'text-emerald-500' : isTrendWorsening ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {isTrendImproving ? (
                      <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : isTrendWorsening ? (
                      <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </span>
                  <span className="truncate text-slate-400">
                    Velocity:{' '}
                    <strong className={`font-mono font-bold ${
                      isTrendImproving
                        ? theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'
                        : isTrendWorsening
                        ? theme === 'light' ? 'text-rose-700' : 'text-rose-400'
                        : 'text-slate-400'
                    }`}>
                      {trendDeltaFormatted}
                    </strong>{' '}
                    <span className="text-[10px] text-slate-400 font-sans">
                      ({isTrendImproving ? 'improving' : isTrendWorsening ? 'elevating threat' : 'stable'})
                    </span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>
                    <strong className="text-rose-400 font-mono">{metrics.criticalFindingsCount}</strong> Critical active
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {metrics.totalActiveFindings} Total
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Historical Score Trend Sparkline Section */}
            <div
              ref={sparklineRef}
              className={`mt-3.5 pt-2.5 border-t transition-colors duration-300 ${
                theme === 'light'
                  ? isScoreCardHovered ? 'border-slate-300' : 'border-slate-200'
                  : isScoreCardHovered ? 'border-slate-700/80' : 'border-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span>Score Trajectory</span>
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-bold ${
                    isTrendImproving ? 'text-emerald-500' : isTrendWorsening ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {isTrendImproving ? (
                      <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                    ) : isTrendWorsening ? (
                      <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
                    ) : null}
                    <span>{trendDeltaFormatted}</span>
                  </span>
                  <span className="text-[9px] font-normal text-slate-500 font-mono">
                    ({trendTimeRange === '6M' ? 'MoM' : 'Daily'})
                  </span>
                  {/* Subtle Focus Badge when card is hovered/focused */}
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold transition-all duration-300 ${
                      isScoreCardHovered
                        ? theme === 'light'
                          ? 'opacity-100 translate-x-0 bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs'
                          : 'opacity-100 translate-x-0 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'opacity-0 -translate-x-1 pointer-events-none'
                    }`}
                  >
                    Focus Active
                  </span>
                </span>
                <div className={`inline-flex rounded p-0.5 text-[9px] font-mono font-medium ${
                  theme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800/80 border border-slate-700/60'
                }`}>
                  <button
                    type="button"
                    onClick={() => setTrendTimeRange('6M')}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      trendTimeRange === '6M'
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    6M
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendTimeRange('30D')}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      trendTimeRange === '30D'
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    30D
                  </button>
                </div>
              </div>

              {/* Recharts Sparkline Component with animated opacity and stroke width on card focus/hover */}
              <div
                id="brandguard-sparkline-focus-wrapper"
                className={`w-full flex items-center justify-center py-1 transition-all duration-300 ease-out ${
                  isScoreCardHovered
                    ? 'opacity-100 drop-shadow-[0_2px_8px_rgba(99,102,241,0.28)]'
                    : 'opacity-75'
                } [&_.recharts-area-curve]:transition-all [&_.recharts-area-curve]:duration-300 [&_.recharts-area-curve]:ease-out [&_.recharts-area-area]:transition-all [&_.recharts-area-area]:duration-300 [&_.recharts-area-area]:ease-out ${
                  isScoreCardHovered
                    ? '[&_.recharts-area-area]:opacity-100'
                    : '[&_.recharts-area-area]:opacity-60'
                }`}
              >
                <RechartsSparkline
                  data={activeTrendData}
                  width={sparklineWidth}
                  height={32}
                  strokeWidth={isScoreCardHovered ? 2.8 : 1.6}
                  className={`transition-all duration-300 ease-out ${
                    isScoreCardHovered ? 'scale-[1.02]' : 'scale-100'
                  }`}
                  color={
                    metrics.brandExposureScore >= 75
                      ? 'rose'
                      : metrics.brandExposureScore >= 50
                      ? 'amber'
                      : 'emerald'
                  }
                  invertColor={true}
                  unit=" pts"
                  showArea={true}
                  showEndDot={true}
                  showTooltip={true}
                  isLight={theme === 'light'}
                  title={`Brand Exposure Trend (${trendTimeRange}): ${activeTrendFirstPoint?.value ?? 0} → ${activeTrendLastPoint?.value ?? 0} pts`}
                />
              </div>

              {/* Min & Peak Score Context */}
              <div className={`flex items-center justify-between text-[9px] font-mono transition-colors duration-300 mt-1 ${
                isScoreCardHovered ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span>
                  Low: <strong className={theme === 'light' ? 'text-slate-700 font-bold' : 'text-slate-300 font-bold'}>{minScoreVal}</strong>
                </span>
                <span className={`text-[9px] transition-colors duration-300 font-sans ${
                  isScoreCardHovered ? 'text-indigo-400 font-semibold' : 'text-slate-400'
                }`}>
                  {isScoreCardHovered ? 'Inspecting trajectory milestones' : 'Hover points for milestones'}
                </span>
                <span>
                  Peak: <strong className="text-rose-400 font-bold">{maxScoreVal}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] text-slate-400 ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800/60'
          }`}>
            <div className="flex items-center gap-1.5">
              <span>Perimeter Threat Index</span>
              <span
                className={`inline-flex items-center shrink-0 ${
                  isTrendImproving ? 'text-emerald-500' : isTrendWorsening ? 'text-rose-500' : 'text-slate-400'
                }`}
                title={`${isTrendImproving ? 'Improving Posture' : isTrendWorsening ? 'Elevated Threat' : 'Stable'}: ${trendDeltaFormatted}`}
              >
                {isTrendImproving ? (
                  <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                ) : isTrendWorsening ? (
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                {metrics.brandExposureScore}/100
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                isTrendImproving
                  ? theme === 'light' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-emerald-300 bg-emerald-950/70 border-emerald-800'
                  : isTrendWorsening
                  ? theme === 'light' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-rose-300 bg-rose-950/70 border-rose-800'
                  : 'text-slate-400 bg-slate-800 border-slate-700'
              }`}>
                {trendDeltaFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Command Action Buttons Panel (Cols 10-12 on lg, Cols 7-12 on sm/md) */}
        <div id="brandguard-command-actions-card" className={`col-span-12 sm:col-span-6 lg:col-span-3 p-5 sm:p-6 rounded-xl border border-b-2 flex flex-col justify-between transition-all backdrop-blur-md shadow-inner ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200/80 border-b-indigo-600 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(15,23,42,0.06)]'
            : 'bg-slate-900/80 border-slate-800/80 border-b-indigo-400 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60 dark:border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Command Actions
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Live Hub
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5">
              {/* Primary Run Live Scan Button */}
              <button
                id="brandguard-run-discovery-btn"
                onClick={() => handleRunDiscoveryScan()}
                disabled={isScanning}
                className={`w-full h-8 px-3 inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isScanning
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isScanning ? 'Scanning Surface...' : 'Run Live Discovery'}</span>
              </button>

              {/* Automated Threat Notification Simulator Button */}
              <button
                id="brandguard-test-alert-btn"
                onClick={handleSimulateThreatAlert}
                className="w-full h-7 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all shadow-2xs cursor-pointer"
                title="Trigger automated ToastProvider alert for a detected high-severity domain impersonation"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Domain Threat Alert</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Container with 'flex gap-4' and uniform width for perfect header alignment */}
          <div
            id="brandguard-header-action-buttons"
            className={`mt-4 pt-3 border-t flex gap-4 w-full items-center ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800/60'
            }`}
          >
            {/* Evidence Desk Button */}
            <button
              id="brandguard-action-evidence-desk-btn"
              onClick={() => {
                setActiveZone('RESPONSE_ENFORCEMENT');
                setActiveTab('EVIDENCE_CUSTODY');
              }}
              className={`flex-1 min-w-0 h-8 px-2 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs truncate ${
                theme === 'light'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
              title="Automated Signed Forensic Bundles & Chain of Custody Desk"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Evidence Desk</span>
            </button>

            {/* Dossier Viewer Button */}
            <button
              id="brandguard-action-dossier-viewer-btn"
              onClick={() => {
                const targetFinding = findings.find(f => f.severity === 'CRITICAL') || findings[0];
                handleOpenDossierDrawer(targetFinding);
              }}
              className={`flex-1 min-w-0 h-8 px-2 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs truncate ${
                theme === 'light'
                  ? 'bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300/80'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
              }`}
              title="Inspect Forensic Evidence Dossier (Screenshots, HAR, DNS Tree, TLS Chain)"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">Dossier</span>
            </button>

            {/* Incident Lifecycle Timeline Button */}
            <button
              id="brandguard-action-timeline-btn"
              onClick={() => setShowIncidentTimelineModal(true)}
              className={`flex-1 min-w-0 h-8 px-2 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs truncate cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
              }`}
              title="Inspect End-to-End Incident Response Lifecycle (BrandGuard to RemediationDesk)"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Timeline</span>
            </button>

            {/* Export Button */}
            <button
              id="brandguard-action-export-btn"
              onClick={handleExportBoardPdf}
              disabled={isExportingPdf}
              className={`flex-1 min-w-0 h-8 px-2 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs truncate ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80'
              }`}
              title="Download ISO 27001 & SOC 2 Executive Boardroom PDF Report"
            >
              <Download className={`w-3.5 h-3.5 text-indigo-400 shrink-0 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span className="truncate">{isExportingPdf ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Live Terminal Log Stream during scan (Full width 12-columns) */}
        {isScanning && (
          <div className="col-span-12 p-3.5 rounded-xl bg-black/90 border border-indigo-500/30 font-mono text-[11px] text-indigo-300 space-y-1.5 shadow-md">
            <div className="flex items-center space-x-2 font-bold text-indigo-200">
              <Terminal className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>Surface Crawler Console Stream:</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-0.5 no-scrollbar">
              {scanLogs.map((log, i) => (
                <div key={i} className="text-slate-300">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* === SECTION 2: PERIMETER THREAT DATA WIDGETS (12-COLUMNS) === */}
        {/* Data Widget 1: Critical Threat Sites (Cols 1-3) */}
        <div id="brandguard-widget-critical-sites" className={`col-span-12 sm:col-span-6 lg:col-span-3 p-5 sm:p-6 rounded-xl border border-b-2 transition-all backdrop-blur-md shadow-inner flex flex-col justify-between hover:-translate-y-0.5 ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200/80 border-b-rose-600 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(15,23,42,0.06)]'
            : 'bg-slate-900/80 border-slate-800/80 border-b-rose-500 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Threat Sites</span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-rose-500">{metrics.criticalFindingsCount}</span>
              <span className="text-xs text-slate-500 font-medium">active domain(s)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Phishing credential harvesters and high-yield investment scams.
          </p>
        </div>

        {/* Data Widget 2: Trademark Logo Misuse (Cols 4-6) */}
        <div id="brandguard-widget-logo-misuse" className={`col-span-12 sm:col-span-6 lg:col-span-3 p-5 sm:p-6 rounded-xl border border-b-2 transition-all backdrop-blur-md shadow-inner flex flex-col justify-between hover:-translate-y-0.5 ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200/80 border-b-indigo-600 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(15,23,42,0.06)]'
            : 'bg-slate-900/80 border-slate-800/80 border-b-indigo-400 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trademark Logo Misuse</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Building className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-indigo-400">{metrics.logoMisuseCount}</span>
              <span className="text-xs text-slate-500 font-medium">infringing asset(s)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Perceptual hash similarity &ge;75% against official brand marks.
          </p>
        </div>

        {/* Data Widget 3: Executive Identity Abuse (Cols 7-9) */}
        <div id="brandguard-widget-executive-abuse" className={`col-span-12 sm:col-span-6 lg:col-span-3 p-5 sm:p-6 rounded-xl border border-b-2 transition-all backdrop-blur-md shadow-inner flex flex-col justify-between hover:-translate-y-0.5 ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200/80 border-b-amber-500 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(15,23,42,0.06)]'
            : 'bg-slate-900/80 border-slate-800/80 border-b-amber-400 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Identity Abuse</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-amber-400">{metrics.executiveImpersonationCount}</span>
              <span className="text-xs text-slate-500 font-medium">C-suite incident(s)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fabricated statements or likeness of CEO, CISO, or CTO.
          </p>
        </div>

        {/* Data Widget 4: Enforced Takedowns (Cols 10-12) */}
        <div id="brandguard-widget-enforced-takedowns" className={`col-span-12 sm:col-span-6 lg:col-span-3 p-5 sm:p-6 rounded-xl border border-b-2 transition-all backdrop-blur-md shadow-inner flex flex-col justify-between hover:-translate-y-0.5 ${
          theme === 'light'
            ? 'bg-white/80 border-slate-200/80 border-b-emerald-600 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_2px_8px_-2px_rgba(15,23,42,0.06)]'
            : 'bg-slate-900/80 border-slate-800/80 border-b-emerald-400 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_2px_4px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.3)]'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enforced Takedowns</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-emerald-400">{metrics.resolvedTakedownsCount}</span>
              <span className="text-xs text-slate-500 font-medium">offline verified</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Registrar suspensions & DNS server-holds successfully completed.
          </p>
        </div>

        {/* === SECTION 3: UNIFIED ENTERPRISE NAVIGATION PANEL (12-COLUMNS) === */}
        <div id="brandguard-navigation-panel" className={`col-span-12 rounded-xl border shadow-xs overflow-hidden ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-[#0E1526]/90 border-slate-800/90 text-slate-100 backdrop-blur-sm'
      }`}>
        {/* Upper Deck: Operational Zones Selector */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between flex-wrap gap-2 ${
          theme === 'light'
            ? 'bg-slate-50/80 border-slate-200'
            : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Operational Zone:</span>
            </span>
            {[
              { id: 'ALL', label: 'All Operations (17)', defaultTab: 'DASHBOARD' },
              { id: 'THREAT_INTEL', label: 'Threat Intelligence & Telemetry (6)', color: 'text-indigo-400', defaultTab: 'DASHBOARD' },
              { id: 'ATTACK_SURFACE', label: 'Asset & Attack Surface (7)', color: 'text-sky-400', defaultTab: 'EASM_TAKEOVER' },
              { id: 'RESPONSE_ENFORCEMENT', label: 'Response & Enforcement (4)', color: 'text-rose-400', defaultTab: 'TAKEDOWN_SLA' }
            ].map(zone => {
              const isSelected = activeZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZone(zone.id as any);
                    // Check if current active tab belongs to the newly selected zone
                    const currentTabObj = [
                      { id: 'DASHBOARD', zone: 'THREAT_INTEL' },
                      { id: 'FINDINGS', zone: 'THREAT_INTEL' },
                      { id: 'ZERO_HOUR_IOC', zone: 'THREAT_INTEL' },
                      { id: 'CT_FUNNEL_VIT', zone: 'THREAT_INTEL' },
                      { id: 'CT_STREAM', zone: 'THREAT_INTEL' },
                      { id: 'THREAT_CLUSTERS', zone: 'THREAT_INTEL' },
                      { id: 'THREAT_HEATMAP', zone: 'THREAT_INTEL' },
                      { id: 'EASM_TAKEOVER', zone: 'ATTACK_SURFACE' },
                      { id: 'LOGO_MONITORING', zone: 'ATTACK_SURFACE' },
                      { id: 'LEAKAGE_MONITOR', zone: 'ATTACK_SURFACE' },
                      { id: 'DEFENSIVE_MATRIX', zone: 'ATTACK_SURFACE' },
                      { id: 'BRAND_REGISTRY', zone: 'ATTACK_SURFACE' },
                      { id: 'EXECUTIVE_REGISTRY', zone: 'ATTACK_SURFACE' },
                      { id: 'DISCOVERY_ENGINE', zone: 'ATTACK_SURFACE' },
                      { id: 'TAKEDOWN_SLA', zone: 'RESPONSE_ENFORCEMENT' },
                      { id: 'EVIDENCE_CUSTODY', zone: 'RESPONSE_ENFORCEMENT' },
                      { id: 'MITIGATION_DESK', zone: 'RESPONSE_ENFORCEMENT' },
                      { id: 'TIERS_SANDBOX', zone: 'RESPONSE_ENFORCEMENT' }
                    ].find(t => t.id === activeTab);

                    if (zone.id !== 'ALL' && currentTabObj?.zone !== zone.id) {
                      setActiveTab(zone.defaultTab as any);
                    }
                  }}
                  className={`px-3 py-1 rounded-md font-semibold text-xs whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {zone.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lower Deck: Module Navigation Tabs (Filtered by Operational Zone) */}
        <div className="px-2 flex overflow-x-auto text-xs font-semibold space-x-1 no-scrollbar py-1">
          {[
            { id: 'DASHBOARD', label: 'Executive Dashboard', icon: Activity, zone: 'THREAT_INTEL' },
            { id: 'FINDINGS', label: `Forensic Findings (${findings.length})`, icon: ShieldAlert, zone: 'THREAT_INTEL' },
            { id: 'ZERO_HOUR_IOC', label: 'Zero-Hour IoC & EDR Feeds', icon: Radio, zone: 'THREAT_INTEL' },
            { id: 'CT_FUNNEL_VIT', label: 'Multi-Tier Funnel & ViT AI', icon: Layers, zone: 'THREAT_INTEL' },
            { id: 'CT_STREAM', label: 'CT Log Stream (Real-Time)', icon: Lock, zone: 'THREAT_INTEL' },
            { id: 'THREAT_CLUSTERS', label: 'Threat Actor Clusters', icon: Network, zone: 'THREAT_INTEL' },
            { id: 'THREAT_HEATMAP', label: 'Threat Origin Heatmap', icon: Globe, zone: 'THREAT_INTEL' },

            { id: 'EASM_TAKEOVER', label: 'EASM & Subdomain Takeover', icon: Server, zone: 'ATTACK_SURFACE' },
            { id: 'LOGO_MONITORING', label: 'Logo Impersonation Defense', icon: Camera, zone: 'ATTACK_SURFACE' },
            { id: 'LEAKAGE_MONITOR', label: 'Credential & Code Leaks', icon: Key, zone: 'ATTACK_SURFACE' },
            { id: 'DEFENSIVE_MATRIX', label: 'Defensive Homoglyph Matrix', icon: Globe, zone: 'ATTACK_SURFACE' },
            { id: 'BRAND_REGISTRY', label: `Brand & Asset Vault (${brandAssets.length})`, icon: Building, zone: 'ATTACK_SURFACE' },
            { id: 'EXECUTIVE_REGISTRY', label: `Executive Protection (${executives.length})`, icon: UserCheck, zone: 'ATTACK_SURFACE' },
            { id: 'DISCOVERY_ENGINE', label: 'Discovery Engine & Providers', icon: Globe, zone: 'ATTACK_SURFACE' },

            { id: 'TAKEDOWN_SLA', label: 'Takedown Lifecycle SLA', icon: Clock, zone: 'RESPONSE_ENFORCEMENT' },
            { id: 'EVIDENCE_CUSTODY', label: 'Evidence Chain-of-Custody (ISO 27037)', icon: Scale, zone: 'RESPONSE_ENFORCEMENT' },
            { id: 'MITIGATION_DESK', label: 'Mitigation & Abuse Desk', icon: Send, zone: 'RESPONSE_ENFORCEMENT' },
            { id: 'TIERS_SANDBOX', label: 'Tiers & Sandbox Security', icon: Lock, zone: 'RESPONSE_ENFORCEMENT' }
          ]
            .filter(tab => activeZone === 'ALL' || tab.zone === activeZone)
            .map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-xs'
                      : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* === SECTION 4: ACTIVE OPERATIONAL TAB CONTENT (12-COLUMNS) === */}
      <div id="brandguard-active-tab-content" className="col-span-12 w-full">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Threat Distribution & Severity Analysis (Unified 12-Column Grid) */}
            <div className="grid grid-cols-12 gap-6 items-stretch stagger-cards">
              {/* Severity Breakdown Bar (Cols 1-8 on lg) */}
            <div className={`p-5 rounded-xl border col-span-12 lg:col-span-8 flex flex-col justify-between ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold">Surface Threat Severity Distribution</h3>
                    <p className="text-xs text-slate-400">Classified by explainable 8-factor risk scoring formula</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Total Active: {metrics.totalActiveFindings}
                  </span>
                </div>

                {/* Stacked Progress Bar */}
                <div className="h-4 rounded-full overflow-hidden bg-slate-800 flex">
                  <div
                    style={{ width: `${(metrics.criticalFindingsCount / (metrics.totalActiveFindings || 1)) * 100}%` }}
                    className="bg-rose-500"
                    title="Critical"
                  />
                  <div
                    style={{ width: `${(metrics.highRiskFindingsCount / (metrics.totalActiveFindings || 1)) * 100}%` }}
                    className="bg-amber-500"
                    title="High"
                  />
                  <div
                    style={{ width: `${(metrics.mediumRiskFindingsCount / (metrics.totalActiveFindings || 1)) * 100}%` }}
                    className="bg-sky-500"
                    title="Medium"
                  />
                  <div
                    style={{ width: `${(metrics.lowRiskFindingsCount / (metrics.totalActiveFindings || 1)) * 100}%` }}
                    className="bg-slate-500"
                    title="Low"
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-xs stagger-cards">
                <div className={`p-3 rounded-xl border border-b-2 backdrop-blur-md shadow-inner transition-all ${
                  theme === 'light'
                    ? 'bg-white/80 border-slate-200/80 border-b-rose-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'bg-slate-950/60 border-slate-800/80 border-b-rose-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="font-bold text-slate-200">Critical (81-100)</span>
                  </div>
                  <span className="text-lg font-black text-rose-400 mt-1 block font-mono">
                    {metrics.criticalFindingsCount}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border border-b-2 backdrop-blur-md shadow-inner transition-all ${
                  theme === 'light'
                    ? 'bg-white/80 border-slate-200/80 border-b-amber-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'bg-slate-950/60 border-slate-800/80 border-b-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-bold text-slate-200">High (61-80)</span>
                  </div>
                  <span className="text-lg font-black text-amber-400 mt-1 block font-mono">
                    {metrics.highRiskFindingsCount}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border border-b-2 backdrop-blur-md shadow-inner transition-all ${
                  theme === 'light'
                    ? 'bg-white/80 border-slate-200/80 border-b-sky-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'bg-slate-950/60 border-slate-800/80 border-b-sky-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span className="font-bold text-slate-200">Medium (41-60)</span>
                  </div>
                  <span className="text-lg font-black text-sky-400 mt-1 block font-mono">
                    {metrics.mediumRiskFindingsCount}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border border-b-2 backdrop-blur-md shadow-inner transition-all ${
                  theme === 'light'
                    ? 'bg-white/80 border-slate-200/80 border-b-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'bg-slate-950/60 border-slate-800/80 border-b-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="font-bold text-slate-200">Low (0-40)</span>
                  </div>
                  <span className="text-lg font-black text-slate-400 mt-1 block font-mono">
                    {metrics.lowRiskFindingsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Threat Typology Card (Cols 9-12 on lg) */}
            <div className={`p-5 rounded-xl border col-span-12 lg:col-span-4 flex flex-col justify-between ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
            }`}>
              <div>
                <h3 className="text-sm font-bold mb-3">Threat Typology Breakdown</h3>
                <div className="space-y-2.5 text-xs">
                  {[
                    { name: 'Phishing Credential Portals', count: metrics.phishingSitesCount, color: 'text-rose-400' },
                    { name: 'Typosquatting & Homoglyphs', count: metrics.fakeDomainsCount, color: 'text-amber-400' },
                    { name: 'Trademark Logo Cloning', count: metrics.logoMisuseCount, color: 'text-indigo-400' },
                    { name: 'Executive Likeness Misuse', count: metrics.executiveImpersonationCount, color: 'text-sky-400' }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}>
                      <span className="font-medium">{item.name}</span>
                      <span className={`font-mono font-bold ${item.color}`}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                <span>False Positive Rate:</span>
                <span className="font-mono font-bold text-emerald-400">{metrics.falsePositiveRatePercent}% (Benchmark &lt;5%)</span>
              </div>
            </div>
          </div>

          {/* Executive Brand Exposure Index & Board Deck Export */}
          <div className={`p-6 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <h3 className="text-base font-bold">Executive Brand Exposure Index (Radar Multi-Factor)</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      High Exposure
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      ISO 27001 A.5.20 / SOC 2 CC7.4
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Comprehensive multi-vector threat profile synthesizing Lookalike Domains, Confirmed MX/Email Spoofing,
                    Visual Logo Likeness, Takedown Velocity, and Credential Leakage into a boardroom-ready readiness indicator.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={handleExportBoardPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  <Download className={`w-4 h-4 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'Generating PDF...' : '1-Click Board Deck Export (PDF)'}</span>
                </button>
              </div>
            </div>

            {/* 5-Factor Exposure Vectors Grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs stagger-cards">
              <div className={`p-4 rounded-xl border border-b-2 flex flex-col justify-between min-h-[140px] backdrop-blur-md shadow-inner transition-all ${
                theme === 'light'
                  ? 'bg-white/80 border-slate-200/80 border-b-rose-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'bg-slate-950/70 border-slate-800/80 border-b-rose-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">1. Domain Mimicry</span>
                    <span className="font-mono font-bold text-rose-400">84/100</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Homoglyphs, combosquats & Cyrillic lookalikes
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '84%' }} />
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold mt-1.5 block">Critical Perimeter Risk</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border border-b-2 flex flex-col justify-between min-h-[140px] backdrop-blur-md shadow-inner transition-all ${
                theme === 'light'
                  ? 'bg-white/80 border-slate-200/80 border-b-rose-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'bg-slate-950/70 border-slate-800/80 border-b-rose-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">2. Email Spoofability</span>
                    <span className="font-mono font-bold text-rose-400">92/100</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Active MX servers & permissive DMARC/SPF
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold mt-1.5 block">High CEO Fraud Exposure</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border border-b-2 flex flex-col justify-between min-h-[140px] backdrop-blur-md shadow-inner transition-all ${
                theme === 'light'
                  ? 'bg-white/80 border-slate-200/80 border-b-amber-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'bg-slate-950/70 border-slate-800/80 border-b-amber-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">3. Visual Clone Proximity</span>
                    <span className="font-mono font-bold text-amber-400">88/100</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    SSIM & Perceptual Hash logo theft
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold mt-1.5 block">High Customer Confusion</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border border-b-2 flex flex-col justify-between min-h-[140px] backdrop-blur-md shadow-inner transition-all ${
                theme === 'light'
                  ? 'bg-white/80 border-slate-200/80 border-b-indigo-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'bg-slate-950/70 border-slate-800/80 border-b-indigo-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">4. Takedown Velocity</span>
                    <span className="font-mono font-bold text-indigo-400">78/100</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    21.4h MTTR vs 48h SLA baseline
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                  <span className="text-[10px] text-indigo-400 font-bold mt-1.5 block">96.2% SLA Adherence</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border border-b-2 flex flex-col justify-between min-h-[140px] backdrop-blur-md shadow-inner transition-all ${
                theme === 'light'
                  ? 'bg-white/80 border-slate-200/80 border-b-emerald-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'bg-slate-950/70 border-slate-800/80 border-b-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">5. Defense Matrix</span>
                    <span className="font-mono font-bold text-emerald-400">65/100</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Pre-registered brand variations in cart
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold mt-1.5 block">Proactive Expansion</span>
                </div>
              </div>
            </div>

            {/* Sub-Actions Quick Strip */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Executive Sign-off Required prior to upcoming Board Audit Committee review.</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('THREAT_CLUSTERS')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 font-semibold transition-colors"
                >
                  <Network className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Inspect Threat Clusters</span>
                </button>
                <button
                  onClick={() => setActiveTab('LEAKAGE_MONITOR')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 font-semibold transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Review Credential Leaks</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Brand Protection Status: Detected Impersonation Domains & Logo Abuse Metrics */}
          <div id="brandguard-protection-status-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 1. Detected Impersonation Domains Radar Panel (7 Cols) */}
            <div className={`col-span-12 lg:col-span-7 p-5 sm:p-6 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
                : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
            }`}>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Globe className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold tracking-tight">Detected Impersonation Domains</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          {metrics.fakeDomainsCount || 8} Active Threats
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Combosquats, typosquats, and punycode lookalikes impersonating official brand domains.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveZone('ATTACK_SURFACE');
                      setActiveTab('EASM_TAKEOVER');
                    }}
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Domain Radar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Impersonation Domains List */}
                <div className="mt-3.5 space-y-2.5">
                  {findings
                    .filter(f => f.targetDomain && (f.findingType === 'FAKE_INVESTMENT' || f.findingType === 'EXECUTIVE_IMPERSONATION' || f.findingType === 'TYPOSQUATTING' || f.findingType === 'PHISHING_BRAND_IMPERSONATION' || f.findingType === 'WEBSITE_IMPERSONATION'))
                    .slice(0, 3)
                    .map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFinding(item)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          theme === 'light'
                            ? 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200'
                            : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-rose-500 dark:text-rose-400 truncate">
                              {item.targetDomain}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                              {item.domainIntel?.domainSquattingTechnique || 'COMBOSQUATTING'}
                            </span>
                            {item.domainIntel?.emailSecurity?.hasMx && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" />
                                Active MX
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                            <span>Registrar: <strong className="text-slate-700 dark:text-slate-300 font-medium">{item.domainIntel?.registrar || 'Porkbun LLC'}</strong></span>
                            <span>ASN: <strong className="text-slate-700 dark:text-slate-300 font-medium">{item.domainIntel?.asn || 'AS13335'}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-rose-500">
                              {item.riskScore.totalScore}/100
                            </span>
                            <span className="block text-[9px] text-slate-400 uppercase font-semibold">Risk Score</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              brandGuardNotificationService.notifyFinding(item, { suppressSound: false });
                            }}
                            className="p-1.5 rounded-lg border text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-800/80 cursor-pointer"
                            title="Trigger Automated Impersonation Incident Toast Alert"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDossierDrawer(item);
                            }}
                            className="p-1.5 rounded-lg border text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/80 cursor-pointer"
                            title="Inspect Evidence Dossier"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time CT Stream & Whois Daemon Synchronized</span>
                </div>
                <button
                  onClick={() => {
                    setActiveZone('RESPONSE_ENFORCEMENT');
                    setActiveTab('TAKEDOWN_SLA');
                  }}
                  className="font-semibold text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Execute Bulk Takedown</span>
                </button>
              </div>
            </div>

            {/* 2. Visual Logo Abuse & Trademark Metrics (5 Cols) */}
            <div className={`col-span-12 lg:col-span-5 p-5 sm:p-6 rounded-xl border flex flex-col justify-between shadow-xs transition-all ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]'
                : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
            }`}>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      <Camera className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold tracking-tight">Logo Abuse Metrics</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          Vision AI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Perceptual hash (pHash) & SSIM visual clone classification.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveZone('ALL');
                      setActiveTab('LOGO_MONITORING');
                    }}
                    className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Desk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visual Similarity KPI Gauge Grid */}
                <div className="grid grid-cols-2 gap-3 mt-3.5">
                  <div className={`p-3 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Logo Misuse Incidents</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-indigo-500 dark:text-indigo-400">
                        {metrics.logoMisuseCount || 5}
                      </span>
                      <span className="text-[10px] text-slate-500">infringing marks</span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">4 Under Legal Notice</span>
                  </div>

                  <div className={`p-3 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Similarity Index</span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-mono text-rose-500">
                        89.4%
                      </span>
                      <span className="text-[10px] text-slate-500">pHash match</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-semibold block mt-0.5">High Brand Dilution</span>
                  </div>
                </div>

                {/* Channels Affected Breakdown */}
                <div className="mt-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Distribution Channels & Typology
                  </span>
                  {[
                    { label: 'Surface Web Landing Portals', pct: '62%', count: '3 sites', color: 'bg-rose-500' },
                    { label: 'Rogue Social & Telegram Channels', pct: '23%', count: '2 handles', color: 'bg-amber-500' },
                    { label: 'Unofficial Mobile App Packages', pct: '15%', count: '1 APK', color: 'bg-indigo-500' }
                  ].map((row, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{row.label}</span>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{row.pct}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full`} style={{ width: row.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono text-[11px]">Monitored Assets: 3 Official Logos</span>
                <button
                  onClick={() => {
                    setActiveZone('ALL');
                    setActiveTab('BRAND_REGISTRY');
                  }}
                  className="font-semibold text-indigo-500 hover:text-indigo-400 cursor-pointer"
                >
                  Manage Brand Registry
                </button>
              </div>
            </div>
          </div>

          {/* Visual Threat Geographic Origin Heatmap (D3 Choropleth) */}
          <BrandGuardThreatHeatmap
            findings={findings}
            theme={theme === 'light' ? 'light' : 'dark'}
            onSelectFinding={(f) => setSelectedFinding(f)}
          />

          {/* High-Impact Active Findings Table */}
          <div className={`rounded-xl border overflow-hidden shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Top High-Impact Surface Threats</h3>
                <p className="text-xs text-slate-400">Immediate action required &mdash; Click any record to inspect forensic dossier</p>
              </div>
              <button
                onClick={() => setActiveTab('FINDINGS')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>View All Findings</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={`font-semibold border-b ${
                  theme === 'light'
                    ? 'bg-slate-50 text-slate-600 border-slate-200'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="p-3.5 pl-5">Severity</th>
                    <th className="p-3.5">Threat Code & Title</th>
                    <th className="p-3.5">Target Domain</th>
                    <th className="p-3.5 text-center">Risk Score</th>
                    <th className="p-3.5 text-center">Logo Match</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800'}`}>
                  {findings
                    .filter(f => !f.isIgnored && f.status !== 'FALSE_POSITIVE' && f.status !== 'IGNORED')
                    .slice(0, 5)
                    .map(finding => (
                    <tr
                      key={finding.id}
                      onClick={() => setSelectedFinding(finding)}
                      className={`cursor-pointer transition-colors ${
                        theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3.5 pl-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          finding.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : finding.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        }`}>
                          {finding.severity}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className={`font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>{finding.title}</div>
                        <div className="font-mono text-[10px] text-slate-500">{finding.findingCode}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-indigo-400">{finding.targetDomain}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-extrabold text-rose-500 text-sm">
                          {finding.riskScore.totalScore}
                        </span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-bold text-indigo-400">
                          {finding.logoSimilarityScore}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {finding.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenIgnoreModal(finding);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                            title="Ignore domain and mark as false positive in database"
                          >
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>Ignore</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDossierDrawer(finding);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold flex items-center space-x-1 cursor-pointer"
                            title="Inspect Evidence Dossier Side-Drawer"
                          >
                            <Scale className="w-3 h-3 text-amber-400" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFinding(finding);
                            }}
                            className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold cursor-pointer"
                          >
                            Investigate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORENSIC FINDINGS WORKBENCH */}
      {activeTab === 'FINDINGS' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className={`p-4 rounded-xl border shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by domain, brand, executive, code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className={`text-xs px-3 py-2 rounded-xl border font-semibold ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={`text-xs px-3 py-2 rounded-xl border font-semibold ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Threats Only</option>
                <option value="NEW">New</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="CONFIRMED_ABUSE">Confirmed Abuse</option>
                <option value="MITIGATION_IN_PROGRESS">Mitigation in Progress</option>
                <option value="RESOLVED_TAKEDOWN">Resolved Takedown</option>
                <option value="LEGITIMATE_USE">Legitimate (Whitelisted)</option>
                <option value="FALSE_POSITIVE">Ignored False Positives ({ignoredCount})</option>
              </select>

              <button
                type="button"
                onClick={() => setHideIgnored(prev => !prev)}
                className={`text-xs px-3 py-2 rounded-xl border font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  hideIgnored
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
                title={hideIgnored ? 'Currently hiding false positive ignored domains. Click to show.' : 'Currently showing ignored domains. Click to hide.'}
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{hideIgnored ? `Hiding Ignored (${ignoredCount})` : `Showing Ignored (${ignoredCount})`}</span>
              </button>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className={`text-xs px-3 py-2 rounded-xl border font-semibold ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <option value="ALL">All Threat Types</option>
                <option value="PHISHING_BRAND_IMPERSONATION">Phishing Impersonation</option>
                <option value="FAKE_INVESTMENT">Fake Investment Scheme</option>
                <option value="FAKE_RECRUITMENT">Fake Recruitment Portal</option>
                <option value="EXECUTIVE_IMPERSONATION">Executive Impersonation</option>
                <option value="TYPOSQUATTING">Typosquatting Domain</option>
                <option value="LOGO_MISUSE">Logo Misuse</option>
              </select>
            </div>
          </div>

          {/* Findings Table */}
          <div className={`rounded-xl border overflow-hidden shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={`font-semibold border-b ${
                  theme === 'light'
                    ? 'bg-slate-50 text-slate-600 border-slate-200'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="p-3.5 pl-5">Severity</th>
                    <th className="p-3.5">Threat Code & Title</th>
                    <th className="p-3.5">Target Domain / URL</th>
                    <th className="p-3.5 text-center">Risk Score</th>
                    <th className="p-3.5 text-center">Logo Match</th>
                    <th className="p-3.5">Assigned Owner</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800'}`}>
                  {filteredFindings.map(finding => (
                    <tr
                      key={finding.id}
                      onClick={() => setSelectedFinding(finding)}
                      className={`cursor-pointer transition-colors ${
                        theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3.5 pl-5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          finding.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : finding.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        }`}>
                          {finding.severity}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <div className={`font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>{finding.title}</div>
                        <div className="font-mono text-[10px] text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>{finding.findingCode}</span>
                          <span>•</span>
                          <span>{finding.findingType.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <div className="font-mono text-indigo-400 truncate">{finding.targetDomain}</div>
                        <div className="text-[10px] text-slate-500 truncate">{finding.domainIntel.registrar}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-black text-rose-400 text-sm">
                          {finding.riskScore.totalScore}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-bold text-indigo-300">
                          {finding.logoSimilarityScore}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>{finding.owner || 'Unassigned'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          finding.isIgnored || finding.status === 'FALSE_POSITIVE' || finding.status === 'IGNORED'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : finding.status === 'CONFIRMED_ABUSE'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : finding.status === 'LEGITIMATE_USE'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {finding.isIgnored || finding.status === 'FALSE_POSITIVE' || finding.status === 'IGNORED'
                            ? 'IGNORED'
                            : finding.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {finding.isIgnored || finding.status === 'FALSE_POSITIVE' || finding.status === 'IGNORED' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnignore(finding.targetDomain);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                              title="Unignore domain and restore to active investigation"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-400" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenIgnoreModal(finding);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                              title="Ignore domain and mark as false positive in database"
                            >
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Ignore</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClonedSiteFinding(finding);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-600/10 hover:bg-sky-600/20 text-sky-300 border border-sky-500/30 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                            title="Side-by-Side Phishing Site Comparison Workbench"
                          >
                            <Split className="w-3 h-3" />
                            <span>Compare Clone</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmailSpoofDomain(finding.targetDomain);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center space-x-1"
                            title="Active Mail Server (MX) & Email Spoofability Inspector"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Inspect MX</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setForensicsFinding(finding);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 font-semibold text-[11px] flex items-center space-x-1"
                            title="Phishing Kit Forensics, MurmurHash3 & YARA Rule Generator"
                          >
                            <Cpu className="w-3 h-3" />
                            <span>YARA</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWipoFinding(finding);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] flex items-center space-x-1"
                            title="WIPO UDRP Dispute Legal Dossier Generator"
                          >
                            <Scale className="w-3 h-3" />
                            <span>WIPO</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSafeBrowsingFinding(finding);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/30 font-semibold text-[11px]"
                            title="1-Click Safe Browsing Blacklist"
                          >
                            Blacklist
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDossierDrawer(finding);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center space-x-1"
                            title="Inspect Tamper-Evident Evidence Dossier (Screenshots, HAR, DNS Tree)"
                          >
                            <Scale className="w-3 h-3 text-amber-400" />
                            <span>Dossier</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFinding(finding);
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold"
                          >
                            Investigate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EASM & SUBDOMAIN TAKEOVER */}
      {activeTab === 'EASM_TAKEOVER' && (
        <BrandGuardEasmTakeoverDesk />
      )}

      {/* TAB: ZERO-HOUR IOC & EDR FEEDS */}
      {activeTab === 'ZERO_HOUR_IOC' && (
        <BrandGuardZeroHourIocDesk />
      )}

      {/* TAB: MULTI-TIER FUNNEL & VIT AI */}
      {activeTab === 'CT_FUNNEL_VIT' && (
        <BrandGuardCtFunnelDesk />
      )}

      {/* TAB 3: BRAND REGISTRY & ASSET VAULT */}
      {activeTab === 'BRAND_REGISTRY' && (
        <div className="space-y-6">
          {/* Organization Legal Entity & Trademarks */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Organization Identity & Registered Trademarks
                </h3>
                <p className="text-xs text-slate-400">Baseline entities used for search query generation and infringement attribution</p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">Tenant: {brandProfile.tenantId}</span>
            </div>

            <div className="grid grid-cols-12 gap-6 text-xs stagger-cards">
              <div className={`col-span-12 md:col-span-4 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 text-[11px] block">Primary Legal Entity:</span>
                <span className={`font-bold text-sm mt-0.5 block ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                  {brandProfile.legalEntityName}
                </span>
                <span className="text-slate-400 text-[11px] mt-1 block">Short Name: {brandProfile.shortName}</span>
              </div>

              <div className={`col-span-12 md:col-span-4 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 text-[11px] block">Official Domain Properties:</span>
                <div className="mt-1 space-y-0.5 font-mono text-indigo-400">
                  {brandProfile.officialDomains.map((d, i) => (
                    <div key={i} className="flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`col-span-12 md:col-span-4 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 text-[11px] block">Protected Trademarks:</span>
                <div className="mt-1 space-y-1">
                  {brandProfile.trademarks.map((tm, i) => (
                    <div key={i} className={theme === 'light' ? 'text-slate-900' : 'text-slate-200'}>
                      <span className="font-bold">{tm.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{tm.registrationNumber} ({tm.jurisdiction})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registered Brand Assets (Logos, Icons) */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Registered Brand Asset Vault ({brandAssets.length})
                </h3>
                <p className="text-xs text-slate-400">High-resolution logo vectors and perceptual hashes used for visual cloning matching</p>
              </div>
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Brand Asset</span>
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6 stagger-cards">
              {brandAssets.map(asset => (
                <div
                  key={asset.id}
                  className={`col-span-12 md:col-span-4 p-4 rounded-xl border flex flex-col justify-between ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {asset.assetType.replace(/_/g, ' ')}
                      </span>
                      {asset.isPrimary && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          PRIMARY MARK
                        </span>
                      )}
                    </div>

                    <div className={`h-28 rounded-lg border flex items-center justify-center p-3 my-3 ${
                      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <h4 className={`text-xs font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>{asset.name}</h4>
                    <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Format: {asset.fileFormat}</div>
                      <div>Dimensions: {asset.dimensions.width}x{asset.dimensions.height}px</div>
                      <div className="truncate">pHash: {asset.perceptualHash}</div>
                    </div>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] text-slate-400 ${
                    theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                  }`}>
                    <span>Registered: {new Date(asset.registeredAt).toLocaleDateString()}</span>
                    <span className="text-emerald-500 font-bold">Active Shield</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTIVE PROTECTION REGISTRY */}
      {activeTab === 'EXECUTIVE_REGISTRY' && (
        <div className="space-y-6">
          <BrandGuardExecutiveProtectionDesk
            executives={executives}
            onOpenAddModal={() => setShowAddExecModal(true)}
          />
        </div>
      )}

      {/* TAB 5: DISCOVERY ENGINE & PROVIDERS */}
      {activeTab === 'DISCOVERY_ENGINE' && (
        <div className="space-y-6">
          {/* Provider Health & Cost Management */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  External Discovery Provider Adapters
                </h3>
                <p className="text-xs text-slate-400">Adapter status, query rate limits, and cost accounting</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Registry: All Healthy</span>
            </div>

            <div className="grid grid-cols-12 gap-6 stagger-cards">
              {providerStats.map(stat => (
                <div
                  key={stat.providerId}
                  className={`col-span-12 md:col-span-4 p-4 rounded-xl border space-y-2.5 flex flex-col justify-between ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                      {stat.providerName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {stat.healthStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-400">
                    <div className="flex justify-between">
                      <span>Monthly Queries:</span>
                      <span className={`font-mono font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {stat.queriesExecutedThisMonth} / {stat.monthlyQuota}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Latency:</span>
                      <span className={`font-mono ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {stat.averageLatencyMs}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limit:</span>
                      <span className={`font-mono ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {stat.rateLimitPerMinute} req/min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Incurred Cost:</span>
                      <span className="font-mono font-bold text-indigo-400">${stat.costIncurredUSD.toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Quota Bar */}
                  <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}>
                    <div
                      style={{ width: `${(stat.queriesExecutedThisMonth / stat.monthlyQuota) * 100}%` }}
                      className="bg-indigo-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Queries Synthesizer */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Deterministically Synthesized Search Queries
                </h3>
                <p className="text-xs text-slate-400">
                  High-intent boolean search strings synthesized from registered trademarks, C-suite executives, and financial scam keywords
                </p>
              </div>
              <button
                onClick={() => handleRunDiscoveryScan()}
                disabled={isScanning}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Batch Scan</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {generatedQueries.map(q => (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                        theme === 'light'
                          ? 'bg-white text-indigo-600 border-slate-200'
                          : 'bg-slate-900 text-indigo-300 border-slate-800'
                      }`}>
                        {q.queryString}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {q.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{q.rationale}</p>
                  </div>
                  <button
                    onClick={() => handleRunDiscoveryScan(q.queryString)}
                    disabled={isScanning}
                    className={`px-2.5 py-1 rounded font-semibold shrink-0 border cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                    }`}
                  >
                    Run Query
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MITIGATION & ABUSE DESK */}
      {activeTab === 'MITIGATION_DESK' && (
        <div className="space-y-6">
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <h3 className={`text-sm font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Active Abuse & Takedown Queue
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              RFC 2142 complaint notices, registrar communications, and law-enforcement evidentiary dossiers.
            </p>

            <div className="space-y-3">
              {findings
                .filter(f => f.status === 'CONFIRMED_ABUSE' || f.status === 'MITIGATION_IN_PROGRESS' || f.status === 'RESOLVED_TAKEDOWN')
                .map(finding => (
                  <div
                    key={finding.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-indigo-400 font-bold text-sm">{finding.targetDomain}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {finding.findingType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{finding.title}</p>
                      <div className="mt-1 flex items-center space-x-3 text-[11px] text-slate-400">
                        <span>Registrar: {finding.domainIntel.registrar}</span>
                        <span>•</span>
                        <span>Evidence Ref: {finding.evidence.evidenceId}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setSelectedFinding(finding)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold cursor-pointer"
                      >
                        Inspect Dossier
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: COMMERCIAL TIERS & SANDBOX SECURITY */}
      {activeTab === 'TIERS_SANDBOX' && (
        <div className="space-y-6">
          {/* Commercial Tiers */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <h3 className={`text-sm font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Commercial Subscription & Capacity Tiers
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current organization tier: <span className="font-bold text-indigo-400">ENTERPRISE</span> (Full autonomous surface web protection)
            </p>

            <div className="grid grid-cols-12 gap-6 text-xs stagger-cards">
              <div className={`col-span-12 md:col-span-4 p-4 rounded-xl border space-y-2.5 opacity-70 flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'border-slate-800 bg-slate-950/40'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-slate-300'}`}>Basic</span>
                    <span className="text-slate-400">$499 / mo</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-[11px] mt-2.5">
                    <li>• 1 Brand Profile</li>
                    <li>• 3 Registered Trademarks & Logos</li>
                    <li>• 2 Executive Profiles</li>
                    <li>• Daily discovery frequency</li>
                    <li>• Basic WHOIS/RDAP scan</li>
                  </ul>
                </div>
              </div>

              <div className={`col-span-12 md:col-span-4 p-4 rounded-xl border space-y-2.5 opacity-90 flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'border-slate-800 bg-slate-950/40'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-slate-300'}`}>Professional</span>
                    <span className="text-slate-400">$1,499 / mo</span>
                  </div>
                  <ul className="space-y-1 text-slate-400 text-[11px] mt-2.5">
                    <li>• 3 Brand Profiles</li>
                    <li>• 10 Registered Logos</li>
                    <li>• 5 Executive Profiles</li>
                    <li>• 6-Hour Discovery Frequency</li>
                    <li>• CT Log Stream & Image Search</li>
                  </ul>
                </div>
              </div>

              <div className={`col-span-12 md:col-span-4 p-4 rounded-xl border-2 space-y-2.5 flex flex-col justify-between ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-50/70'
                  : 'border-indigo-500 bg-indigo-950/30'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400 text-sm">Enterprise (Current)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <ul className={`space-y-1 text-[11px] mt-2.5 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                    <li>✓ Unlimited Brand Profiles & Trademarks</li>
                    <li>✓ Visual Vector Perceptual Hashing (Logo Misuse)</li>
                    <li>✓ Unlimited C-Suite Executive Protection</li>
                    <li>✓ Hourly Discovery Frequency + CT Log Streaming</li>
                    <li>✓ 1-Click Formal Abuse Notice Dispatch</li>
                    <li>✓ Tamper-Evident SHA-256 Chain-of-Custody</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Zero-Trust Sandbox Security */}
          <div className={`p-5 rounded-xl border shadow-xs ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <h3 className={`text-sm font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Crawler Sandbox Security & SSRF Protection Status
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enforced headless container isolation parameters to prevent malicious redirection, SSRF, and private IP traversal.
            </p>

            <div className="grid grid-cols-12 gap-6 text-xs stagger-cards">
              <div className={`col-span-12 sm:col-span-6 lg:col-span-3 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 block text-[11px]">Private IP Interception</span>
                <span className="text-emerald-500 font-bold block mt-1">RFC 1918 Enforced</span>
                <span className="text-[10px] text-slate-400 block">Blocks 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</span>
              </div>
              <div className={`col-span-12 sm:col-span-6 lg:col-span-3 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 block text-[11px]">Cloud Metadata Protection</span>
                <span className="text-emerald-500 font-bold block mt-1">IMDS Blocked</span>
                <span className="text-[10px] text-slate-400 block">Blocks 169.254.169.254 requests</span>
              </div>
              <div className={`col-span-12 sm:col-span-6 lg:col-span-3 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 block text-[11px]">DNS Rebinding Guard</span>
                <span className="text-emerald-500 font-bold block mt-1">Active Dual-Resolve</span>
                <span className="text-[10px] text-slate-400 block">Validates IP before and after socket connect</span>
              </div>
              <div className={`col-span-12 sm:col-span-6 lg:col-span-3 p-3.5 rounded-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-slate-400 block text-[11px]">Execution Sandbox</span>
                <span className="text-emerald-500 font-bold block mt-1">Non-Root Headless</span>
                <span className="text-[10px] text-slate-400 block">Isolated container memory cgroups</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: CT LOG STREAM */}
      {activeTab === 'CT_STREAM' && (
        <BrandGuardCTLogStream
          brandProfile={brandProfile}
          onFindingCreated={(newFinding) => {
            reloadData();
            setSelectedFinding(newFinding);
          }}
        />
      )}

      {/* TAB 9: TAKEDOWN LIFECYCLE SLA DESK */}
      {activeTab === 'TAKEDOWN_SLA' && (
        <BrandGuardTakedownSlaDesk
          brandProfile={brandProfile}
          findings={findings}
          onSelectFinding={(f) => setSelectedFinding(f)}
        />
      )}

      {/* TAB: THREAT ACTOR CLUSTERS & ASN FINGERPRINTING */}
      {activeTab === 'THREAT_CLUSTERS' && (
        <BrandGuardThreatClusters
          findings={findings}
          brandProfile={brandProfile}
          onSelectFinding={(f) => setSelectedFinding(f)}
          onInspectEmail={(domain) => setEmailSpoofDomain(domain)}
        />
      )}

      {/* TAB: THREAT HEATMAP & GEOGRAPHIC ORIGIN CHOROPLETH */}
      {activeTab === 'THREAT_HEATMAP' && (
        <BrandGuardThreatHeatmap
          findings={findings}
          theme={theme === 'light' ? 'light' : 'dark'}
          onSelectFinding={(f) => setSelectedFinding(f)}
        />
      )}

      {/* TAB: CREDENTIAL & CODE REPO LEAKAGE MONITOR */}
      {activeTab === 'LEAKAGE_MONITOR' && (
        <BrandGuardCredentialLeaks
          brandProfile={brandProfile}
        />
      )}

      {/* TAB: LOGO IMPERSONATION & VISUAL TRADEMARK DEFENSE */}
      {activeTab === 'LOGO_MONITORING' && (
        <LogoMonitoringDashboard />
      )}

      {/* TAB 10: DEFENSIVE HOMOGLYPH & TYPOSQUATTING MATRIX */}
      {activeTab === 'DEFENSIVE_MATRIX' && (
        <BrandGuardDefensiveMatrix
          brandProfile={brandProfile}
          onInspectEmail={(domain) => setEmailSpoofDomain(domain)}
        />
      )}

          {/* TAB: EVIDENCE CHAIN-OF-CUSTODY & CRYPTOGRAPHIC SEALS */}
          {activeTab === 'EVIDENCE_CUSTODY' && (
            <BrandGuardEvidenceCustodyDesk
              findings={findings}
              brandProfile={brandProfile}
              onOpenFindingDetail={(finding) => setSelectedFinding(finding)}
              onOpenDossierDrawer={(bundle, finding) => handleOpenDossierDrawer(finding, bundle)}
            />
          )}
        </div>
      </div>

      {/* Forensic Finding Detail Modal */}
      {selectedFinding && (
        <BrandGuardFindingDetailModal
          finding={selectedFinding}
          brandProfile={brandProfile}
          isOpen={!!selectedFinding}
          onClose={() => setSelectedFinding(null)}
          onFindingUpdated={(updated) => {
            setSelectedFinding(updated);
            reloadData();
          }}
          onOpenEvidenceDossier={(finding) => handleOpenDossierDrawer(finding)}
        />
      )}

      {/* Ignore Impersonation Domain False-Positive Modal */}
      {showIgnoreModal && (
        <BrandGuardIgnoreDomainModal
          finding={findingToIgnore}
          isOpen={showIgnoreModal}
          onClose={() => {
            setShowIgnoreModal(false);
            setFindingToIgnore(null);
          }}
          onConfirmIgnore={handleConfirmIgnore}
          theme={theme}
        />
      )}

      {/* Safe Browsing Rapid Blacklist Modal */}
      {safeBrowsingFinding && (
        <BrandGuardSafeBrowsingModal
          finding={safeBrowsingFinding}
          brandProfile={brandProfile}
          isOpen={!!safeBrowsingFinding}
          onClose={() => setSafeBrowsingFinding(null)}
          onSubmitted={() => reloadData()}
        />
      )}

      {/* Active Mail Server (MX) & Email Spoofability Inspector Modal */}
      {emailSpoofDomain && (
        <BrandGuardEmailSpoofModal
          domain={emailSpoofDomain}
          isOpen={!!emailSpoofDomain}
          onClose={() => setEmailSpoofDomain(null)}
        />
      )}

      {/* Side-by-Side Phishing Cloned Site Comparison Workbench Modal */}
      {clonedSiteFinding && (
        <BrandGuardClonedSiteComparisonModal
          finding={clonedSiteFinding}
          brandProfile={brandProfile}
          isOpen={!!clonedSiteFinding}
          onClose={() => setClonedSiteFinding(null)}
        />
      )}

      {/* Register Brand Asset Modal */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`p-6 rounded-xl border w-full max-w-md shadow-2xl ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Register New Brand Asset</h3>
              <button onClick={() => setShowAddAssetModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Asset Trademark Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corporate Emblem / Gradient Shield"
                  value={newAssetName}
                  onChange={e => setNewAssetName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Asset Type</label>
                <select
                  value={newAssetType}
                  onChange={e => setNewAssetType(e.target.value as any)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="PRIMARY_LOGO">Primary Logo</option>
                  <option value="MONOCHROME_LOGO">Monochrome Logo</option>
                  <option value="FAVICON">Favicon</option>
                  <option value="APP_ICON">App Icon</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Image URL / Vector Artifact</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newAssetUrl}
                  onChange={e => setNewAssetUrl(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className={`px-3.5 py-2 rounded-lg cursor-pointer ${
                    theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
                >
                  Save & Compute Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Executive Modal */}
      {showAddExecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`p-6 rounded-xl border w-full max-w-md shadow-2xl ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Register Key Executive Profile</h3>
              <button onClick={() => setShowAddExecModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExecutive} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Chen"
                  value={newExecName}
                  onChange={e => setNewExecName(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Professional Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Operating Officer"
                  value={newExecTitle}
                  onChange={e => setNewExecTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Operations & Trading"
                  value={newExecDept}
                  onChange={e => setNewExecDept(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Official Corporate Email</label>
                <input
                  type="email"
                  placeholder="e.g. dchen@apexfintech.com"
                  value={newExecEmail}
                  onChange={e => setNewExecEmail(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddExecModal(false)}
                  className={`px-3.5 py-2 rounded-lg cursor-pointer ${
                    theme === 'light' ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
                >
                  Register & Protect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phishing Kit Forensics & Heuristics Modal */}
      {forensicsFinding && (
        <BrandGuardPhishingForensicsModal
          finding={forensicsFinding}
          onClose={() => setForensicsFinding(null)}
        />
      )}

      {/* Automated WIPO UDRP / URS Dispute Dossier Modal */}
      {wipoFinding && (
        <BrandGuardWipoDossierModal
          finding={wipoFinding}
          brandProfile={brandProfile}
          onClose={() => setWipoFinding(null)}
        />
      )}

      {/* Evidence Dossier Viewer (Tamper-Evident Side-Drawer) */}
      <BrandGuardEvidenceDossierDrawer
        isOpen={dossierDrawerState.isOpen}
        onClose={() => setDossierDrawerState(prev => ({ ...prev, isOpen: false }))}
        finding={dossierDrawerState.finding}
        bundle={dossierDrawerState.bundle}
        brandProfile={brandProfile}
        onOpenFindingDetail={(finding) => {
          setDossierDrawerState(prev => ({ ...prev, isOpen: false }));
          setSelectedFinding(finding);
        }}
      />

      {/* Incident Response Lifecycle Timeline Modal */}
      {showIncidentTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <IncidentResponseTimeline
              onClose={() => setShowIncidentTimelineModal(false)}
              isStandalone={true}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};
