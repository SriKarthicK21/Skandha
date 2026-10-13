import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Building2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  ArrowRight,
  TrendingUp,
  Send,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';

export interface RegulatoryItem {
  id: string;
  title: string;
  type: 'NOTICE' | 'CIRCULAR' | 'CONSULTATION_PAPER' | 'ADVISORY' | 'INDUSTRY_TREND';
  referenceCode: string;
  publishedDate: string;
  masDomain: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  summary: string;
  keyActions: string[];
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface IndustryTrend {
  trend: string;
  impact: string;
  recommendation: string;
}

export interface GroundingSource {
  url: string;
  title: string;
}

export const RegulatoryIntelligenceWidget: React.FC = () => {
  const { addFinding, setActiveModule, masProfile } = useGRC();

  const [loading, setLoading] = useState(false);
  const [isLiveGrounded, setIsLiveGrounded] = useState(true);
  const [modelName, setModelName] = useState('gemini-3.8-flash (Google Search Grounded)');
  const [lastFetched, setLastFetched] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [searchQueryUsed, setSearchQueryUsed] = useState<string>('');
  const [webSearchQueries, setWebSearchQueries] = useState<string[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [showSources, setShowSources] = useState(false);

  const [executiveSummary, setExecutiveSummary] = useState<string>(
    'MAS maintains heightened supervisory focus on technology operational resilience, 1-hour statutory incident notification under Notice 655/644, and governance for Generative AI deployment under the FEAT framework.'
  );
  const [items, setItems] = useState<RegulatoryItem[]>([]);
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>([]);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  // CAPA Modal state
  const [capaModalOpen, setCapaModalOpen] = useState(false);
  const [selectedItemForCapa, setSelectedItemForCapa] = useState<RegulatoryItem | null>(null);
  const [capaNotes, setCapaNotes] = useState('');
  const [capaSuccessToast, setCapaSuccessToast] = useState<string | null>(null);

  const topicTabs = [
    { id: 'all', label: 'All Regulatory Updates' },
    { id: 'trm', label: 'Notice 655 / TRM Guidelines' },
    { id: 'ai_governance', label: 'GenAI & FEAT Governance' },
    { id: 'resilience', label: 'Cloud Resiliency (4h Downtime)' },
    { id: 'quantum', label: 'Quantum-Safe Cryptography' },
    { id: 'cyber', label: 'Cyber Threat Bulletins' }
  ];

  const fetchIntelligence = async (topic = activeTopic, query = customSearch) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/regulatory-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          customQuery: query,
          institutionType: masProfile.institutionCategory || 'Full Commercial Bank / Major Payment Institution'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch regulatory intelligence`);
      }

      const data = await res.json();
      setIsLiveGrounded(!!data.isLiveGrounded);
      setModelName(data.model || 'gemini-3.8-flash (Google Search Grounded)');
      setLastFetched(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSearchQueryUsed(data.searchQueryUsed || '');
      setWebSearchQueries(data.webSearchQueries || []);
      setSources(data.sources || []);

      if (data.data) {
        setExecutiveSummary(data.data.executiveSummary || '');
        setItems(data.data.items || []);
        setIndustryTrends(data.data.industryTrends || []);
      }
    } catch (err: any) {
      console.warn('Regulatory intelligence fetch notice:', err?.message || err);
      setIsLiveGrounded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence('all', '');
  }, []);

  const handleTopicChange = (topicId: string) => {
    setActiveTopic(topicId);
    setCustomSearch('');
    fetchIntelligence(topicId, '');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIntelligence(activeTopic, customSearch);
  };

  const toggleActionCheck = (actionKey: string) => {
    setCheckedActions(prev => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  const handleOpenCapaModal = (item: RegulatoryItem) => {
    setSelectedItemForCapa(item);
    setCapaNotes(`Identified requirement from official update: ${item.referenceCode} - "${item.title}". Evaluate gap against current critical system controls.`);
    setCapaModalOpen(true);
  };

  const handleSaveCapa = () => {
    if (!selectedItemForCapa) return;

    addFinding({
      title: `Regulatory Alignment: ${selectedItemForCapa.referenceCode} - ${selectedItemForCapa.title}`,
      clauseOrControl: `MAS TRM ${selectedItemForCapa.masDomain}`,
      department: 'Technology Risk & Compliance',
      description: `Continuous regulatory horizon scanning flagged publication of ${selectedItemForCapa.referenceCode}: "${selectedItemForCapa.title}". Supervisory expectation: ${selectedItemForCapa.summary}`,
      severity: selectedItemForCapa.impactLevel === 'CRITICAL' ? 'Major Non-Conformity' : 'Minor Non-Conformity',
      status: 'Open',
      rootCauseAnalysis: {
        methodology: 'DIRECT',
        rootCauseStatement: `Existing technical configurations and standard operating procedures require revision following MAS regulatory updates under ${selectedItemForCapa.referenceCode}.`
      },
      capaPlan: {
        correctiveAction: capaNotes || `Review critical system configurations, implement recommended technical controls, and document supervisory compliance evidence.`,
        preventiveAction: `Incorporate ${selectedItemForCapa.referenceCode} compliance criteria into bi-annual MAS compliance audit checklists and architecture review gates.`,
        owner: 'Head of Technology Risk / Lead Compliance Officer',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evidenceRequired: `Updated system architecture diagram, change management approvals, and operational drill verification reports.`
      },
      implementationNotes: `Dispatched from live Regulatory Intelligence Feed (${selectedItemForCapa.referenceCode}).`,
      source: 'CONTINUOUS_MONITORING'
    });

    setCapaModalOpen(false);
    setCapaSuccessToast(`CAPA finding created for ${selectedItemForCapa.referenceCode}!`);
    setTimeout(() => setCapaSuccessToast(null), 4000);
  };

  const filteredItems = items.filter(item => {
    if (typeFilter === 'ALL') return true;
    return item.type === typeFilter;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl relative">
      {/* Toast notification */}
      {capaSuccessToast && (
        <div className="absolute top-4 right-6 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xl z-20 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{capaSuccessToast}</span>
        </div>
      )}

      {/* Widget Header & Grounding Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-rose-400" />
              Regulatory Intelligence Horizon
            </span>

            {/* Google Search Grounding Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-950 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${isLiveGrounded ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                Google Search Grounded
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Model: {modelName.split(' ')[0]}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            MAS Regulatory Notices & Industry Trends
          </h2>
          <p className="text-xs text-slate-400">
            Real-time web search grounding of Singapore Monetary Authority notices, circulars, cyber advisories, and financial sector technology risk trends.
          </p>
        </div>

        {/* Refresh & Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {lastFetched && (
            <span className="text-[11px] text-slate-400 font-mono hidden lg:inline">
              Synced: {lastFetched}
            </span>
          )}

          <button
            onClick={() => fetchIntelligence(activeTopic, customSearch)}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh from Google Search"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Searching Web...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Topic Filter Pills & Search Input */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {topicTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTopicChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTopic === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Query Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customSearch}
              onChange={e => setCustomSearch(e.target.value)}
              placeholder="Search custom MAS regulation (e.g. 'Notice 655 incident SLA', 'generative AI FEAT audit', 'cloud disaster recovery')..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-rose-400" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Executive Horizon Synthesis Banner */}
      <div className="bg-gradient-to-r from-rose-950/30 via-slate-950 to-slate-950 border border-rose-900/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            MAS Regulatory Trajectory & Supervisory Focus
          </span>
          {sources.length > 0 && (
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{sources.length} Grounding Sources</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {executiveSummary}
        </p>

        {webSearchQueries.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400">
            <span className="text-slate-400 font-semibold">Web Queries Grounded:</span>
            {webSearchQueries.map((q, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                "{q}"
              </span>
            ))}
          </div>
        )}

        {/* Collapsible Verified Sources Panel */}
        {showSources && sources.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 mt-2 space-y-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Verified Web Citations & External Links (Google Search Grounded)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-lg flex items-center justify-between gap-2 text-[11px] text-slate-300 hover:text-white transition-all group"
                >
                  <span className="truncate font-medium">{src.title || src.url}</span>
                  <ExternalLink className="w-3 h-3 text-sky-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs by Type */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1">
          {['ALL', 'NOTICE', 'CIRCULAR', 'ADVISORY', 'CONSULTATION_PAPER'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === t
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredItems.length} Regulatory Directives
        </span>
      </div>

      {/* Regulatory Items Cards Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">
              Grounding latest MAS regulatory notices via Google Search...
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Synthesizing MAS Notice 655/644, AI Governance circulars, cyber advisories, and Singapore fintech technology risk bulletins.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No notices found matching this filter. Try refreshing or changing topic.
          </div>
        ) : (
          filteredItems.map(item => {
            const isCritical = item.impactLevel === 'CRITICAL';
            const isHigh = item.impactLevel === 'HIGH';

            return (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-5 space-y-4 transition-all"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 font-mono text-[10px] font-bold">
                        {item.referenceCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.type === 'NOTICE'
                          ? 'bg-red-950/70 text-red-300 border-red-800/60'
                          : item.type === 'CIRCULAR'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-800/60'
                          : item.type === 'ADVISORY'
                          ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                          : 'bg-sky-950/70 text-sky-300 border-sky-800/60'
                      }`}>
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.impactLevel} IMPACT
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.publishedDate}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Associated MAS TRM Domain Action */}
                  <button
                    onClick={() => setActiveModule('mas_checklist')}
                    className="self-start px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    title="View related domain checklist"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
                    <span>Domain: {item.masDomain.split(' ')[0]}</span>
                  </button>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.summary}
                </p>

                {/* Actionable FI Checklist */}
                {item.keyActions && item.keyActions.length > 0 && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mandatory Supervisory Implementation Checklist:
                    </span>
                    <div className="space-y-1.5">
                      {item.keyActions.map((action, idx) => {
                        const key = `${item.id}-action-${idx}`;
                        const isChecked = !!checkedActions[key];

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleActionCheck(key)}
                            className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer hover:text-white group"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-0.5 rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500 cursor-pointer"
                            />
                            <span className={isChecked ? 'line-through text-slate-500' : ''}>
                              {action}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900 text-xs">
                  <div className="flex items-center gap-2">
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium group"
                      >
                        <span>View Official Notice / Source</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Source: {item.sourceTitle || 'Monetary Authority of Singapore'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCapaModal(item)}
                      className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Raise CAPA Ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Industry Trends Radar Panel */}
      {industryTrends.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Singapore Financial Sector Tech Risk Horizon & Trends
            </h3>
            <span className="text-[11px] text-slate-400">
              Forward-Looking Supervisory & Threat Intel
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {industryTrends.map((tr, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2 flex flex-col justify-between text-xs"
              >
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 font-mono text-[10px] font-bold">
                    TREND 0{idx + 1}
                  </span>
                  <h4 className="font-bold text-white text-xs">
                    {tr.trend}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {tr.impact}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 space-y-1 mt-2">
                  <span className="font-bold text-rose-400 text-[10px] uppercase block">
                    Strategic Action:
                  </span>
                  <p>{tr.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raise CAPA Modal */}
      {capaModalOpen && selectedItemForCapa && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Raise CAPA Remediation Ticket
                </h3>
              </div>
              <button
                onClick={() => setCapaModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-mono text-rose-400 text-[10px] font-bold">
                  {selectedItemForCapa.referenceCode}
                </span>
                <p className="font-semibold text-white">
                  {selectedItemForCapa.title}
                </p>
                <span className="text-slate-400 text-[11px]">
                  Associated Domain: {selectedItemForCapa.masDomain}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Corrective Action Plan / Implementation Notes *
                </label>
                <textarea
                  rows={4}
                  value={capaNotes}
                  onChange={e => setCapaNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  placeholder="Detail the technical tasks, architecture reviews, or policy modifications required to satisfy this MAS update..."
                />
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-[11px] text-rose-300 leading-relaxed">
                This ticket will be dispatched to the <strong>Findings & CAPA Remediation Hub</strong> and assigned to the Technology Risk & Compliance lead.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCapaModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCapa}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-lg shadow-rose-950 transition-all"
              >
                Confirm & Dispatch CAPA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
