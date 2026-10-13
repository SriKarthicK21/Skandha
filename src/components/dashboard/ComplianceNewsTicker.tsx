import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Radio,
  Sparkles,
  RefreshCw,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  Terminal,
  X,
  CheckSquare,
  Square,
  Copy,
  Check,
  Search,
  SlidersHorizontal,
  FileCheck2,
  Share2,
  ArrowUpRight,
  Clock,
  Building2,
  Scale
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export interface TickerItem {
  id: string;
  headline: string;
  bulletin: string;
  authority: string;
  jurisdiction: 'GLOBAL' | 'SG' | 'EU' | 'US' | 'IN' | 'UK' | string;
  urgency: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  category: string;
  affectedFrameworks: string[];
  auditImpact: string;
  actionSteps: string[];
  sourceUrl: string;
  sourceTitle: string;
  publishedTimeAgo: string;
}

export interface ComplianceNewsTickerProps {
  onNavigateModule?: (moduleKey: string) => void;
  selectedFrameworkId?: string | null;
  className?: string;
}

const TOPIC_CHANNELS = [
  { id: 'ALL', label: 'All Feeds', icon: Globe },
  { id: 'AI_GOVERNANCE', label: 'AI & ISO 42001', icon: Sparkles },
  { id: 'MAS_TRM', label: 'MAS TRM Singapore', icon: Building2 },
  { id: 'SEC_DISCLOSURES', label: 'SEC 4-Day Disclosures', icon: Scale },
  { id: 'DATA_PRIVACY', label: 'DPDP & Privacy', icon: Layers },
  { id: 'CLOUD_RESILIENCE', label: 'DORA & Cloud Resilience', icon: ShieldAlert }
];

export const ComplianceNewsTicker: React.FC<ComplianceNewsTickerProps> = ({
  onNavigateModule,
  selectedFrameworkId,
  className = ''
}) => {
  const { currentTenant, addFinding, logAuditEvent, theme } = useGRC();
  const { showToast } = useToast();

  const [activeTopic, setActiveTopic] = useState<string>('ALL');
  const [items, setItems] = useState<TickerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [cycleIntervalSec, setCycleIntervalSec] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearchGrounded, setIsSearchGrounded] = useState<boolean>(true);
  const [modelUsed, setModelLabel] = useState<string>('gemini-3.8-flash (Search Grounded)');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [groundingSources, setGroundingSources] = useState<Array<{ url: string; title: string }>>([]);
  const [webSearchQueries, setWebSearchQueries] = useState<string[]>([]);

  // Modals & Panels
  const [selectedItem, setSelectedItem] = useState<TickerItem | null>(null);
  const [isMoreChannelsOpen, setIsMoreChannelsOpen] = useState<boolean>(false);
  const [isLiveStreamModalOpen, setIsLiveStreamModalOpen] = useState<boolean>(false);
  const [streamedText, setStreamedText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch bulletins with Search Grounding
  const fetchBulletins = useCallback(
    async (topicToFetch = activeTopic, forceRefresh = false) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/compliance-news-ticker?topic=${encodeURIComponent(topicToFetch)}${forceRefresh ? '&forceRefresh=true' : ''}`);
        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
          setIsSearchGrounded(Boolean(data.isSearchGrounded));
          setModelLabel(data.modelUsed || 'gemini-3.8-flash (Search Grounded)');
          setLastUpdated(data.timestamp || new Date().toISOString());
          setGroundingSources(data.groundingSources || []);
          setWebSearchQueries(data.webSearchQueries || []);
          setCurrentIndex(0);
        }
      } catch (err: any) {
        console.warn('Compliance news ticker fetch warning:', err?.message || err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTopic]
  );

  // Initial load
  useEffect(() => {
    fetchBulletins(activeTopic);
  }, [activeTopic, fetchBulletins]);

  // Sync with selected framework if prop changes
  useEffect(() => {
    if (selectedFrameworkId && selectedFrameworkId !== 'all') {
      const normalized = selectedFrameworkId.toLowerCase();
      if (normalized.includes('mas')) {
        setActiveTopic('MAS_TRM');
      } else if (normalized.includes('42001') || normalized.includes('ai')) {
        setActiveTopic('AI_GOVERNANCE');
      } else if (normalized.includes('dpdp') || normalized.includes('privacy') || normalized.includes('27701')) {
        setActiveTopic('DATA_PRIVACY');
      }
    }
  }, [selectedFrameworkId]);

  // Automatic cycling timer
  useEffect(() => {
    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
    }

    if (isPlaying && !isHovered && items.length > 1) {
      cycleTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length);
      }, cycleIntervalSec * 1000);
    }

    return () => {
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current);
      }
    };
  }, [isPlaying, isHovered, items.length, cycleIntervalSec]);

  // Navigation handlers
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? Math.max(items.length - 1, 0) : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % Math.max(items.length, 1));
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  // Start live SSE teleprinter stream
  const startLiveStream = () => {
    setIsLiveStreamModalOpen(true);
    setIsStreaming(true);
    setStreamedText('');

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sse = new EventSource(`/api/v1/compliance-news-ticker/stream?topic=${encodeURIComponent(activeTopic)}`);
    eventSourceRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'CHUNK' && payload.text) {
          setStreamedText(prev => prev + payload.text);
        } else if (payload.type === 'ITEM' && payload.item) {
          setStreamedText(prev => prev + `\n\n[BREAKING ${payload.item.authority}] ${payload.item.headline}\n${payload.item.bulletin}\nImpact: ${payload.item.auditImpact}`);
        } else if (payload.type === 'DONE') {
          setIsStreaming(false);
          sse.close();
        } else if (payload.type === 'ERROR') {
          setStreamedText(prev => prev + `\n\n[Search Grounding Notice: ${payload.message}]`);
          setIsStreaming(false);
          sse.close();
        }
      } catch (err) {
        console.warn('SSE Parse error:', err);
      }
    };

    sse.onerror = () => {
      setIsStreaming(false);
      sse.close();
    };
  };

  const stopLiveStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setIsLiveStreamModalOpen(false);
  };

  // Create CAPA finding directly from ticker alert
  const handleRaiseCAPAFromBulletin = (item: TickerItem) => {
    addFinding({
      source: 'CONTINUOUS_MONITORING',
      severity: item.urgency === 'CRITICAL' ? 'Major Non-Conformity' : 'Minor Non-Conformity',
      title: `Regulatory Mandate Gap: ${item.headline}`,
      clauseOrControl: item.affectedFrameworks[0] || 'ISO 27001 / MAS TRM',
      department: 'Governance, Legal & Information Security',
      description: `${item.bulletin}\n\nRegulatory Authority: ${item.authority}\nAudit Impact: ${item.auditImpact}\nOfficial Publication: ${item.sourceTitle} (${item.sourceUrl})`,
      rootCauseAnalysis: {
        methodology: '5_WHYS',
        rootCauseStatement: `Emerging regulatory requirement promulgated by ${item.authority} requires operational policy and control update.`
      },
      capaPlan: {
        correctiveAction: item.actionSteps[0] || `Implement policy alignment for ${item.headline}.`,
        preventiveAction: item.actionSteps[1] || 'Establish continuous surveillance tracking in SKANDA Compliance Radar.',
        owner: 'Chief Compliance Officer / Lead Security Architect',
        targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        evidenceRequired: 'Signed Policy Addendum & Control Verification Report'
      },
      status: 'Open'
    });

    logAuditEvent(
      'CREATE',
      'Regulatory Intelligence',
      `Auto-instantiated CAPA finding from Search-Grounded bulletin ${item.id}: ${item.headline}`
    );

    showToast({
      type: 'success',
      title: 'CAPA Finding Instantiated',
      message: `Action plan logged for ${item.authority} alert. Added to Corrective Action backlog.`
    });
  };

  // Copy bulletin summary
  const handleCopyBulletin = (item: TickerItem) => {
    const text = `[SKANDA REGULATORY ALERT]\nAuthority: ${item.authority} (${item.jurisdiction})\nHeadline: ${item.headline}\nSummary: ${item.bulletin}\nAudit Impact: ${item.auditImpact}\nAffected Frameworks: ${item.affectedFrameworks.join(', ')}\nSource: ${item.sourceUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast({
      type: 'info',
      title: 'Alert Copied',
      message: 'Executive regulatory summary copied to clipboard.'
    });
  };

  const activeItem = items[currentIndex] || items[0];

  return (
    <div
      id="compliance-news-ticker"
      className={`compliance-radar-container relative w-full rounded-2xl backdrop-blur-md border shadow-md overflow-hidden transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white border-slate-200/90 shadow-slate-100/70 text-slate-900'
          : 'bg-slate-950/90 border-slate-800/80 shadow-lg text-white'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top micro-stripe ambient indicator */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 via-emerald-400 to-amber-400 opacity-80 z-10" />

      {/* =========================================================================
          TIER 1: COMPLIANCE RADAR TOP TOOLBAR (3 LOGICAL ZONES)
          Zone 1: Brand / Context (Left)
          Zone 2: Feed Filters with Progressive Disclosure (Middle)
          Zone 3: ComplianceRadarSystemControls (Right)
          ========================================================================= */}
      <div className="compliance-radar-toolbar px-3 py-2 sm:px-3.5 sm:py-2.5">
        {/* ZONE 1 — BRAND / CONTEXT */}
        <div className="radar-brand-zone">
          <div
            className={`flex items-center space-x-2 px-2.5 py-1 rounded-xl border shadow-inner shrink-0 ${
              theme === 'light'
                ? 'bg-slate-100/90 border-slate-300/80 text-slate-800'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
            }`}
          >
            <div className="relative flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span
              className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
                theme === 'light' ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
              <span className="radar-brand-full">Compliance Radar</span>
              <span className="radar-brand-compact hidden">Radar</span>
            </span>
          </div>
        </div>

        {/* ZONE 2 — FEED FILTERS */}
        <div className="feed-controls">
          {/* Search Grounded Badge */}
          <div
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[10px] font-mono shrink-0 ${
              theme === 'light'
                ? 'bg-sky-50/90 border-sky-200 text-sky-800'
                : 'bg-sky-950/70 border-sky-800/50 text-sky-300'
            }`}
            title="Search-Grounded AI Model: Google Gemini 3.8 Flash"
          >
            <Globe className="w-3 h-3 text-sky-500 shrink-0" />
            <span className="search-grounded-badge-full font-medium">Search Grounded</span>
            <span className="search-grounded-badge-compact hidden font-medium">Grounded</span>
            <span className="w-1 h-1 rounded-full bg-sky-400 search-grounded-badge-full" />
            <span
              className={`text-[9px] search-grounded-badge-full ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              3.8 Flash
            </span>
          </div>

          {/* Expanded Feed Channel Pills (Desktop / Container >= 820px) */}
          <div className="feed-controls-expanded flex items-center space-x-1 min-w-0">
            {/* 1. All Feeds (Always in expanded) */}
            {(() => {
              const channel = TOPIC_CHANNELS[0];
              const Icon = channel.icon;
              const isActive = activeTopic === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveTopic(channel.id);
                    fetchBulletins(channel.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center space-x-1 cursor-pointer shrink-0 ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold shadow-2xs'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                      : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  aria-label={`Switch feed filter to ${channel.label}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{channel.label}</span>
                </button>
              );
            })()}

            {/* 2. AI & ISO 42001 (Secondary: visible on >= 1050px) */}
            {(() => {
              const channel = TOPIC_CHANNELS[1];
              const Icon = channel.icon;
              const isActive = activeTopic === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveTopic(channel.id);
                    fetchBulletins(channel.id);
                  }}
                  className={`radar-feed-pill-secondary px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center space-x-1 cursor-pointer shrink-0 ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold shadow-2xs'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                      : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  aria-label={`Switch feed filter to ${channel.label}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{channel.label}</span>
                </button>
              );
            })()}

            {/* 3. MAS TRM Singapore (Tertiary: visible on >= 1250px) */}
            {(() => {
              const channel = TOPIC_CHANNELS[2];
              const Icon = channel.icon;
              const isActive = activeTopic === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setActiveTopic(channel.id);
                    fetchBulletins(channel.id);
                  }}
                  className={`radar-feed-pill-tertiary px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center space-x-1 cursor-pointer shrink-0 ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-sky-50 text-sky-800 border border-sky-300 font-bold shadow-2xs'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                      : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  aria-label={`Switch feed filter to ${channel.label}`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="whitespace-nowrap">{channel.label}</span>
                </button>
              );
            })()}

            {/* More Feeds Dropdown Popover */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreChannelsOpen(prev => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition flex items-center space-x-1 cursor-pointer shrink-0 border ${
                  TOPIC_CHANNELS.slice(3).some(c => c.id === activeTopic)
                    ? theme === 'light'
                      ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                    : theme === 'light'
                    ? 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                    : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title="View more regulatory channels"
                aria-label="Toggle more regulatory feeds menu"
                aria-expanded={isMoreChannelsOpen}
              >
                <SlidersHorizontal className="w-3 h-3 shrink-0" />
                <span className="whitespace-nowrap">
                  {TOPIC_CHANNELS.slice(3).find(c => c.id === activeTopic)?.label || 'More Feeds'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {isMoreChannelsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute left-0 mt-1.5 w-56 py-1 rounded-xl shadow-2xl backdrop-blur-md z-40 space-y-0.5 border ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
                        : 'bg-slate-900/95 border-slate-700/80 text-white shadow-black/80'
                    }`}
                  >
                    <div
                      className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider border-b flex items-center justify-between ${
                        theme === 'light' ? 'text-slate-500 border-slate-200' : 'text-slate-400 border-slate-800'
                      }`}
                    >
                      <span>Regulatory Channels</span>
                      <span className="text-[8px] text-sky-500 font-bold">Search Grounded</span>
                    </div>
                    {TOPIC_CHANNELS.map(channel => {
                      const Icon = channel.icon;
                      const isActive = activeTopic === channel.id;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => {
                            setActiveTopic(channel.id);
                            fetchBulletins(channel.id);
                            setIsMoreChannelsOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-[11px] font-medium transition flex items-center space-x-2 text-left cursor-pointer ${
                            isActive
                              ? theme === 'light'
                                ? 'bg-sky-50 text-sky-800 font-bold'
                                : 'bg-sky-500/20 text-sky-300 font-bold'
                              : theme === 'light'
                              ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0 text-sky-500" />
                          <span className="truncate">{channel.label}</span>
                          {isActive && <Check className="w-3.5 h-3.5 text-sky-500 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Collapsed Feed Selector Button (Container < 820px) */}
          <div className="feed-controls-collapsed hidden relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMoreChannelsOpen(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center space-x-1.5 cursor-pointer shrink-0 border ${
                theme === 'light'
                  ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
              }`}
              title="Select regulatory channel"
              aria-label="Select regulatory feed channel"
            >
              <SlidersHorizontal className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">
                {TOPIC_CHANNELS.find(c => c.id === activeTopic)?.label || 'Feeds'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* ZONE 3 — LIVE / SYSTEM CONTROLS (ComplianceRadarSystemControls) */}
        <div className="system-controls">
          {/* Critical / Urgency Status Badge */}
          {activeItem && (
            <span
              className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border select-none ${
                activeItem.urgency === 'CRITICAL'
                  ? theme === 'light'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                    : 'bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-sm shadow-rose-950/60'
                  : activeItem.urgency === 'HIGH'
                  ? theme === 'light'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                    : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  : theme === 'light'
                  ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                  : 'bg-sky-950/80 text-sky-300 border-sky-700/60'
              }`}
              title={`Active Bulletin Urgency: ${activeItem.urgency}`}
            >
              {activeItem.urgency}
            </span>
          )}

          {/* System Status / Index Indicator */}
          {items.length > 0 && (
            <span
              className={`radar-index-counter text-[10px] font-mono px-2 py-1 rounded-lg border shrink-0 select-none ${
                theme === 'light'
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800'
              }`}
              title={`Alert ${currentIndex + 1} of ${items.length}`}
              aria-label={`Alert ${currentIndex + 1} of ${items.length}`}
            >
              {String(currentIndex + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(items.length).padStart(2, '0')}
            </span>
          )}

          {/* Navigation Controls */}
          <div className="navigation-controls">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={items.length <= 1}
              aria-label="Previous regulatory alert"
              title="Previous regulatory alert"
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* Play/Pause Toggle */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause ticker auto-scroll' : 'Resume ticker auto-scroll'}
              title={isPlaying ? 'Pause ticker auto-scroll' : 'Resume ticker auto-scroll'}
              className={`radar-nav-play-pause w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition cursor-pointer shrink-0 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-0.5" />
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={items.length <= 1}
              aria-label="Next regulatory alert"
              title="Next regulatory alert"
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* Live Teleprinter Stream Mode Toggle */}
          <button
            onClick={startLiveStream}
            aria-label="Open Live Search-Grounded Teleprinter Stream"
            title="Open Live Search-Grounded Teleprinter Stream"
            className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg border transition cursor-pointer flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
              theme === 'light'
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-400 border-emerald-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <Terminal className="w-3.5 h-3.5 shrink-0" />
            <span className="radar-live-stream-label text-[10px] font-bold">Live Stream</span>
          </button>

          {/* Manual Force Sync / Refresh Button */}
          <button
            onClick={() => fetchBulletins(activeTopic, true)}
            disabled={isLoading}
            aria-label="Refresh compliance radar feeds via Google Search Grounding"
            title="Force refresh via Google Search Grounding"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition cursor-pointer disabled:opacity-50 shrink-0 ${
              theme === 'light'
                ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300 shadow-2xs'
                : 'bg-sky-950/50 hover:bg-sky-900/70 text-sky-400 border-sky-800/60'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isLoading ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: REAL-TIME REGULATORY BULLETIN STREAM (ACTIVE ALERT BAR)
          Dedicated scannable broadcast row with zero overlap and full clarity
          ========================================================================= */}
      <div
        className={`compliance-radar-alert-stream px-3 py-2 sm:px-3.5 sm:py-2 border-t transition-colors ${
          theme === 'light'
            ? 'bg-slate-50/60 border-slate-200/80 text-slate-800 hover:bg-sky-50/30'
            : 'bg-slate-900/40 border-slate-800/70 text-slate-200 hover:bg-slate-900/70'
        }`}
      >
        {isLoading && items.length === 0 ? (
          <div
            className={`flex items-center space-x-2 text-xs animate-pulse py-0.5 ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500 shrink-0" />
            <span>Grounding latest regulatory updates with Google Search...</span>
          </div>
        ) : activeItem ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={() => setSelectedItem(activeItem)}
              className="group flex items-center space-x-2 sm:space-x-2.5 cursor-pointer select-none w-full min-w-0"
              title="Click to view full regulatory dossier and instantiate CAPA finding"
            >
              {/* Jurisdiction Flag */}
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold ${
                  theme === 'light'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {activeItem.jurisdiction}
              </span>

              {/* Authority Name */}
              <span
                className={`shrink-0 text-xs font-bold ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                {activeItem.authority}:
              </span>

              {/* Main Headline & Summary */}
              <div className="flex-1 min-w-0 truncate">
                <span
                  className={`text-xs font-bold transition group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:underline underline-offset-2 ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {activeItem.headline}
                </span>
                <span
                  className={`hidden sm:inline text-xs ml-2 font-normal ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  — {activeItem.bulletin}
                </span>
              </div>

              {/* Published Time Ago & Dossier Prompt */}
              <div
                className={`shrink-0 flex items-center space-x-1.5 text-[11px] font-mono ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="hidden md:inline">{activeItem.publishedTimeAgo}</span>
                <span className="text-[10px] text-sky-500 font-sans font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 ml-1">
                  <span className="hidden lg:inline">Dossier</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className={`text-xs py-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-500'}`}>
            No active compliance bulletins for this channel.
          </div>
        )}
      </div>

      {/* Expanded Modal: Full Regulatory Intelligence Dossier */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
                  : 'bg-slate-900 border-slate-800 text-white shadow-2xl'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-5 border-b flex items-start justify-between ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="space-y-1.5 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border ${
                        selectedItem.urgency === 'CRITICAL'
                          ? theme === 'light'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                          : selectedItem.urgency === 'HIGH'
                          ? theme === 'light'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                          : theme === 'light'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                      }`}
                    >
                      {selectedItem.urgency} Urgency
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      theme === 'light'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {selectedItem.jurisdiction}
                    </span>
                    <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {selectedItem.authority}
                    </span>
                    <span className={`text-xs font-mono ml-auto ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                      {selectedItem.publishedTimeAgo}
                    </span>
                  </div>
                  <h3 className={`text-lg font-black tracking-tight leading-snug ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    {selectedItem.headline}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Executive Summary */}
                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                }`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <Info className="w-3.5 h-3.5 text-sky-500" />
                    Regulatory Mandate Summary
                  </div>
                  <p className="text-xs leading-relaxed font-sans">{selectedItem.bulletin}</p>
                </div>

                {/* Audit & Compliance Impact */}
                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-amber-950/20 border-amber-800/40 text-amber-200/90'
                }`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-amber-800' : 'text-amber-400'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Lead Auditor & Inspection Impact
                  </div>
                  <p className="text-xs leading-relaxed">{selectedItem.auditImpact}</p>
                </div>

                {/* Affected Frameworks */}
                <div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                    Affected Enterprise Frameworks
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.affectedFrameworks.map((fw, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${
                          theme === 'light'
                            ? 'bg-purple-50 border-purple-200 text-purple-800'
                            : 'bg-purple-950/40 border-purple-800/50 text-purple-300'
                        }`}
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actionable Implementation Steps */}
                <div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Recommended Remediation Checklist
                  </div>
                  <div className="space-y-2">
                    {selectedItem.actionSteps.map((step, idx) => {
                      const stepKey = `${selectedItem.id}-step-${idx}`;
                      const isDone = Boolean(completedSteps[stepKey]);
                      return (
                        <div
                          key={idx}
                          onClick={() => setCompletedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }))}
                          className={`p-2.5 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                            isDone
                              ? theme === 'light'
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                              : theme === 'light'
                              ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className={`text-xs ${isDone ? 'line-through text-slate-400' : ''}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Official Source Citation */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="truncate pr-3">
                    <div className={`text-[10px] uppercase font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Official Authority Source</div>
                    <div className={`text-xs font-semibold truncate ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{selectedItem.sourceTitle}</div>
                  </div>
                  <a
                    href={selectedItem.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    referrerPolicy="no-referrer"
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition shrink-0 ${
                      theme === 'light'
                        ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border-slate-700'
                    }`}
                  >
                    <span>View Circular</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-2 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <button
                  onClick={() => handleCopyBulletin(selectedItem)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Briefing'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRaiseCAPAFromBulletin(selectedItem)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Raise CAPA Finding</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      if (onNavigateModule) onNavigateModule('controls');
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Map to Controls</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Stream Terminal Modal */}
      <AnimatePresence>
        {isLiveStreamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono"
            >
              {/* Terminal Header */}
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Teleprinter • Search Grounded Feed
                  </span>
                  {isStreaming && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-[10px] animate-pulse">
                      STREAMING
                    </span>
                  )}
                </div>
                <button
                  onClick={stopLiveStream}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Terminal Window */}
              <div className="p-4 overflow-y-auto max-h-[60vh] text-xs leading-relaxed text-emerald-400/90 space-y-2 bg-black/90">
                <div className="text-slate-500 text-[11px]">
                  [SKANDA-SSE-FEED] Connected to /api/v1/compliance-news-ticker/stream
                  <br />
                  [MODEL] Gemini 3.8 Flash • Search Grounding Active
                  <br />
                  [TOPIC] {activeTopic}
                  <br />
                  -------------------------------------------------------------
                </div>
                <div className="whitespace-pre-wrap font-mono">
                  {streamedText || 'Awaiting incoming wire transmissions from global regulatory bodies...'}
                  {isStreaming && <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1" />}
                </div>
              </div>

              {/* Terminal Footer */}
              <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs">
                <div className="text-slate-400 text-[11px]">
                  Real-time regulatory intelligence powered by Google GenAI Search Grounding.
                </div>
                <button
                  onClick={stopLiveStream}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Close Stream
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
