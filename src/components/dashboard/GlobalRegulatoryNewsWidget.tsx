import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Globe,
  Radio,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  BookmarkPlus,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  SlidersHorizontal,
  Scale,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ListTodo,
  CheckSquare,
  Square,
  ShieldCheck,
  TrendingUp,
  Clock,
  Info,
  Link as LinkIcon,
  Tag
} from 'lucide-react';

export interface RegulatoryArticle {
  id: string;
  headline: string;
  authority: string;
  jurisdiction: 'Global' | 'EU' | 'US' | 'Singapore' | 'India' | 'UK' | string;
  publishedDate: string;
  effectiveDate: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';
  category: string;
  frameworks: string[];
  summary: string;
  complianceImpact: string;
  actionChecklist: string[];
  sourceUrl: string;
  sourceTitle: string;
}

export interface MacroClimate {
  sentiment: 'TIGHTENING' | 'AGGRESSIVE_ENFORCEMENT' | 'STANDARDIZING' | 'EXPANDING';
  enforcementTrend: string;
  topRiskSector: string;
  activeMandatesCount: number;
  criticalCount: number;
}

export interface GroundingSource {
  url: string;
  title: string;
}

export interface GlobalRegulatoryNewsProps {
  onNavigateModule?: (moduleKey: string) => void;
  selectedFrameworkId?: string | null;
}

export const GlobalRegulatoryNewsWidget: React.FC<GlobalRegulatoryNewsProps> = ({
  onNavigateModule,
  selectedFrameworkId
}) => {
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [frameworkFilter, setFrameworkFilter] = useState<string>(
    selectedFrameworkId ? selectedFrameworkId.toUpperCase().replace(/[^A-Z0-9]/g, '_') : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [articles, setArticles] = useState<RegulatoryArticle[]>([]);
  const [macroClimate, setMacroClimate] = useState<MacroClimate | null>(null);
  const [executiveBriefing, setExecutiveBriefing] = useState<string>('');
  const [isLiveGrounded, setIsLiveGrounded] = useState<boolean>(false);
  const [modelLabel, setModelLabel] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [webSearchQueries, setWebSearchQueries] = useState<string[]>([]);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [showGroundingSources, setShowGroundingSources] = useState<boolean>(false);

  // Card interaction state
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [linkedTasks, setLinkedTasks] = useState<Record<string, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Sync frameworkFilter if prop changes
  useEffect(() => {
    if (selectedFrameworkId && selectedFrameworkId !== 'all') {
      const normalized = selectedFrameworkId.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      setFrameworkFilter(normalized);
    }
  }, [selectedFrameworkId]);

  const fetchRegulatoryNews = useCallback(
    async (overrideParams?: {
      region?: string;
      category?: string;
      framework?: string;
      query?: string;
    }) => {
      setLoading(true);
      setErrorBanner(null);

      const targetRegion = overrideParams?.region !== undefined ? overrideParams.region : regionFilter;
      const targetCategory = overrideParams?.category !== undefined ? overrideParams.category : categoryFilter;
      const targetFramework = overrideParams?.framework !== undefined ? overrideParams.framework : frameworkFilter;
      const targetQuery = overrideParams?.query !== undefined ? overrideParams.query : activeQuery;

      try {
        const response = await fetch('/api/ai/global-regulatory-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: targetRegion,
            category: targetCategory,
            framework: targetFramework,
            customQuery: targetQuery
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          setArticles(data.data.articles || []);
          setMacroClimate(data.data.macroClimate || null);
          setExecutiveBriefing(data.data.executiveBriefing || '');
          setIsLiveGrounded(Boolean(data.isLiveGrounded));
          setModelLabel(data.model || 'Gemini 3.8 Flash (Search Grounded)');
          setLastUpdated(data.timestamp || new Date().toISOString());
          setWebSearchQueries(data.webSearchQueries || []);
          setGroundingSources(data.sources || []);
        } else {
          throw new Error(data.error || 'Failed to parse response payload');
        }
      } catch (err: any) {
        console.warn('Global regulatory news fetch notice:', err?.message || err);
        setErrorBanner(
          'Failed to reach live Google Search feed. Loaded standard regulatory intelligence baseline.'
        );
      } finally {
        setLoading(false);
      }
    },
    [regionFilter, categoryFilter, frameworkFilter, activeQuery]
  );

  // Initial load
  useEffect(() => {
    fetchRegulatoryNews();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
    fetchRegulatoryNews({ query: searchQuery });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    fetchRegulatoryNews({ query: '' });
  };

  const handleRegionChange = (newRegion: string) => {
    setRegionFilter(newRegion);
    fetchRegulatoryNews({ region: newRegion });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    fetchRegulatoryNews({ category: newCategory });
  };

  const handleFrameworkChange = (newFramework: string) => {
    setFrameworkFilter(newFramework);
    fetchRegulatoryNews({ framework: newFramework });
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleLinkToRemediation = (article: RegulatoryArticle) => {
    setLinkedTasks(prev => ({ ...prev, [article.id]: true }));
    setCopyFeedback(`Linked "${article.headline.slice(0, 45)}..." to Findings & CAPA queue!`);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  const handleCopyArticleBrief = (article: RegulatoryArticle) => {
    const text = `[REGULATORY BRIEFING] ${article.headline}\nAuthority: ${article.authority} (${article.jurisdiction})\nPublished: ${article.publishedDate} | Effective: ${article.effectiveDate}\nUrgency: ${article.urgency}\nCategory: ${article.category}\nFrameworks: ${article.frameworks.join(', ')}\n\nSummary:\n${article.summary}\n\nCompliance Impact:\n${article.complianceImpact}\n\nKey Actions:\n${article.actionChecklist.map(a => `• ${a}`).join('\n')}\n\nSource: ${article.sourceTitle} (${article.sourceUrl})`;
    navigator.clipboard.writeText(text);
    setCopyFeedback('Regulatory briefing copied to clipboard!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Filter articles client-side for immediate responsive toggling
  const displayArticles = useMemo(() => {
    let result = articles;
    if (urgencyFilter) {
      result = result.filter(a => a.urgency === 'CRITICAL' || a.urgency === 'HIGH');
    }
    return result;
  }, [articles, urgencyFilter]);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return {
          label: 'Critical Priority',
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        };
      case 'HIGH':
        return {
          label: 'High Priority',
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
        };
      case 'MEDIUM':
        return {
          label: 'Medium Priority',
          bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
          icon: <Clock className="w-3.5 h-3.5 text-sky-500" />
        };
      default:
        return {
          label: 'Informational',
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
          icon: <Info className="w-3.5 h-3.5 text-emerald-500" />
        };
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'AGGRESSIVE_ENFORCEMENT':
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'TIGHTENING':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'EXPANDING':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Toast Notification */}
      {copyFeedback && (
        <div className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs px-4 py-2.5 font-medium flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{copyFeedback}</span>
          </div>
          <button
            onClick={() => setCopyFeedback(null)}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-600/20 shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Global Regulatory News & Intelligence
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Google Search Grounded
                </span>
                {isLiveGrounded ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Web Grounding
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Regulatory Knowledge Base
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory updates, circulars, and cyber directives across EU AI Act, SEC, MAS TRM, India DPDP, and ISO standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => setShowGroundingSources(!showGroundingSources)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              <span>{showGroundingSources ? 'Hide Sources' : 'Search Sources'}</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                {groundingSources.length}
              </span>
            </button>
            <button
              onClick={() => fetchRegulatoryNews()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Searching...' : 'Scan Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Grounding Metadata Panel */}
        {showGroundingSources && (
          <div className="mt-4 p-3.5 bg-white dark:bg-slate-950/70 rounded-lg border border-blue-200/60 dark:border-blue-900/40 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Active Google Search Queries & Verified Sources</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Model: {modelLabel}
              </span>
            </div>
            {webSearchQueries.length > 0 && (
              <div className="mb-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 font-medium">Search queries:</span>
                {webSearchQueries.map((q, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 font-mono"
                  >
                    "{q}"
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
              {groundingSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 transition-colors group"
                >
                  <span className="truncate pr-2 font-medium">{source.title || source.url}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Executive Synthesis Summary */}
        {macroClimate && (
          <div className="mt-4 p-3.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
                  Global Regulatory Climate
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] border ${getSentimentColor(
                    macroClimate.sentiment
                  )}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {macroClimate.sentiment.replace('_', ' ')}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Top Scrutiny: <strong className="text-slate-700 dark:text-slate-300">{macroClimate.topRiskSector}</strong>
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {executiveBriefing || macroClimate.enforcementTrend}
              </p>
            </div>
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-2 md:pt-0 md:pl-4 flex-shrink-0">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {macroClimate.activeMandatesCount}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active Mandates</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {macroClimate.criticalCount}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Critical SLA</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search regulatory bulletins, ISO clauses, EU AI Act, SEC, MAS, or DPDP directives..."
              className="w-full pl-9 pr-20 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium px-1"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Search
            </button>
          </form>

          {/* Region Quick Select */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Regions' },
              { id: 'EU', label: 'EU' },
              { id: 'US', label: 'United States' },
              { id: 'SINGAPORE', label: 'Singapore' },
              { id: 'INDIA', label: 'India' },
              { id: 'APAC', label: 'APAC' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleRegionChange(r.id)}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                  regionFilter === r.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Category & Framework Filter Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">Domain:</span>
            {[
              { id: 'ALL', label: 'All Domains' },
              { id: 'AI_GOVERNANCE', label: 'AI Governance' },
              { id: 'CYBERSECURITY', label: 'Cyber & Incident' },
              { id: 'DATA_PRIVACY', label: 'Data Privacy' },
              { id: 'CLOUD_RESILIENCE', label: 'Operational Resilience' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUrgencyFilter(!urgencyFilter)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                urgencyFilter
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Critical & High Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-4">
        {errorBanner && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button
              onClick={() => fetchRegulatoryNews()}
              className="text-amber-900 dark:text-amber-200 font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading && articles.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Retrieving live regulatory updates via Google Search...
            </div>
            <div className="text-xs text-slate-400 mt-1 max-w-sm">
              Analyzing supervisory bulletins from EU AI Office, SEC, MAS, MeitY, and ISO accredited bodies.
            </div>
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
            <ShieldCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No regulatory bulletins match the active filters.</p>
            <p className="mt-1">Try selecting "All Regions" or clearing your search keywords.</p>
            <button
              onClick={() => {
                setRegionFilter('ALL');
                setCategoryFilter('ALL');
                setFrameworkFilter('ALL');
                setSearchQuery('');
                setActiveQuery('');
                setUrgencyFilter(false);
                fetchRegulatoryNews({ region: 'ALL', category: 'ALL', framework: 'ALL', query: '' });
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayArticles.map(article => {
              const urgencyBadge = getUrgencyBadge(article.urgency);
              const isExpanded = expandedArticleId === article.id;
              const isLinked = linkedTasks[article.id];

              return (
                <div
                  key={article.id}
                  className={`rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                    article.urgency === 'CRITICAL'
                      ? 'border-rose-200 dark:border-rose-900/40 bg-gradient-to-br from-white via-white to-rose-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  } hover:shadow-md`}
                >
                  <div className="p-4 sm:p-5">
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${urgencyBadge.bg}`}
                        >
                          {urgencyBadge.icon}
                          {urgencyBadge.label}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {article.authority}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {article.jurisdiction}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          Published: {article.publishedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyArticleBrief(article)}
                          title="Copy executive briefing to clipboard"
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLinkToRemediation(article)}
                          title={isLinked ? 'Linked to CAPA Remediation' : 'Link to CAPA & Remediation Tasks'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                            isLinked
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isLinked ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Linked to CAPA</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5 text-blue-500" />
                              <span>Link to CAPA</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Headline */}
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {article.headline}
                    </h4>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {article.summary}
                    </p>

                    {/* Framework Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      <span className="text-[11px] text-slate-400 font-medium">Frameworks:</span>
                      {article.frameworks.map((fw, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40"
                        >
                          {fw}
                        </span>
                      ))}
                      <span className="text-[11px] text-slate-400 ml-2">
                        Effective: <strong className="text-slate-600 dark:text-slate-300">{article.effectiveDate}</strong>
                      </span>
                    </div>

                    {/* Compliance & Business Impact Box */}
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/40 text-xs text-slate-800 dark:text-slate-200 mb-3 flex items-start gap-2.5">
                      <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-blue-900 dark:text-blue-300 mr-1.5">
                          Compliance & Risk Impact:
                        </span>
                        <span>{article.complianceImpact}</span>
                      </div>
                    </div>

                    {/* Toggleable Action Checklist */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                            Actionable Compliance Readiness Checklist
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {
                              article.actionChecklist.filter(
                                (_, idx) => completedTasks[`${article.id}-${idx}`]
                              ).length
                            }{' '}
                            of {article.actionChecklist.length} addressed
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {article.actionChecklist.map((task, idx) => {
                            const taskId = `${article.id}-${idx}`;
                            const isDone = completedTasks[taskId];
                            return (
                              <div
                                key={idx}
                                onClick={() => toggleTask(taskId)}
                                className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                  isDone
                                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 line-through'
                                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                )}
                                <span className="leading-snug">{task}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Footer Row: Source link and Expand Checklist */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group"
                      >
                        <span className="truncate max-w-[220px] sm:max-w-md">
                          {article.sourceTitle || 'Official Regulatory Document'}
                        </span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>

                      <button
                        onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Checklist' : 'View Action Checklist'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
