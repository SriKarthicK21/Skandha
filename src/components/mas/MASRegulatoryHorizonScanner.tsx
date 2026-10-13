import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  AlertOctagon,
  ShieldAlert,
  FileText,
  Clock,
  Send,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  Bookmark,
  Building2,
  Calendar,
  AlertTriangle,
  Info,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Cpu
} from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import {
  MASCircularRecord,
  fetchLatestMASCirculars,
  filterMASCirculars,
  MAS_CIRCULAR_MASTER_DATA
} from '../../services/masCircularHorizonService';

export interface MASRegulatoryHorizonScannerProps {
  onLinkToIncident: (circular: MASCircularRecord) => void;
  activeIncidentCode?: string;
  onNavigateToDispatcher?: () => void;
}

export const MASRegulatoryHorizonScanner: React.FC<MASRegulatoryHorizonScannerProps> = ({
  onLinkToIncident,
  activeIncidentCode,
  onNavigateToDispatcher
}) => {
  const { addFinding } = useGRC();

  // Data & Loading state
  const [circulars, setCirculars] = useState<MASCircularRecord[]>(MAS_CIRCULAR_MASTER_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveGrounded, setIsLiveGrounded] = useState<boolean>(true);
  const [lastScanTime, setLastScanTime] = useState<string>('Just now');
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    'MAS maintains heightened supervisory focus on 1-hour statutory incident reporting under Notice 655/644, cloud concentration dependencies under Circular TRS 02/2025, and Generative AI governance.'
  );

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [statutoryOnly, setStatutoryOnly] = useState<boolean>(false);
  const [expandedDirectives, setExpandedDirectives] = useState<Record<string, boolean>>({});

  // Toast & Modal states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCircularForModal, setSelectedCircularForModal] = useState<MASCircularRecord | null>(null);
  const [linkConfirmModalOpen, setLinkConfirmModalOpen] = useState<boolean>(false);

  // Fetch live updates from API
  const handleFetchUpdates = async (query = searchQuery, topic = selectedTopic) => {
    setLoading(true);
    try {
      const res = await fetchLatestMASCirculars(query, topic);
      setCirculars(res.circulars);
      setIsLiveGrounded(res.isLiveGrounded);
      setLastScanTime(res.timestamp);
      if (res.rawExecutiveSummary) {
        setExecutiveSummary(res.rawExecutiveSummary);
      }
      showToast(`Scanned MAS portal: ${res.circulars.length} regulatory directives active.`);
    } catch (err) {
      console.error('Error fetching MAS circulars:', err);
      showToast('Loaded local authoritative circulars knowledgebase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchUpdates();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleDirectivesExpand = (id: string) => {
    setExpandedDirectives(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered circulars
  const filteredCirculars = useMemo(() => {
    return filterMASCirculars(circulars, {
      searchQuery,
      topic: selectedTopic,
      type: selectedType,
      impactLevel: selectedImpact,
      statutoryOnly
    });
  }, [circulars, searchQuery, selectedTopic, selectedType, selectedImpact, statutoryOnly]);

  // Topic tabs definitions
  const topicTabs = [
    { id: 'ALL', label: 'All Regulatory Updates', count: circulars.length },
    { id: 'INCIDENT_SLA', label: 'Notice 644/655 & Incident SLAs', count: circulars.filter(c => c.isStatutoryMandate || c.id.includes('655')).length },
    { id: 'CLOUD_RESILIENCE', label: 'Cloud & CSP Resilience', count: circulars.filter(c => c.summary.toLowerCase().includes('cloud') || c.title.toLowerCase().includes('cloud')).length },
    { id: 'CYBER_THREATS', label: 'Cyber Threats & AiTM', count: circulars.filter(c => c.type === 'ADVISORY' || c.summary.toLowerCase().includes('cyber') || c.summary.toLowerCase().includes('ransomware')).length },
    { id: 'AI_GOVERNANCE', label: 'GenAI & FEAT Governance', count: circulars.filter(c => c.summary.toLowerCase().includes('ai') || c.summary.toLowerCase().includes('agent')).length },
    { id: 'PAYMENTS', label: 'Payment Services (PSN01/02)', count: circulars.filter(c => c.referenceCode.includes('PSN') || c.summary.toLowerCase().includes('payment')).length }
  ];

  // Initiate linking flow
  const handleInitiateLink = (circular: MASCircularRecord) => {
    setSelectedCircularForModal(circular);
    setLinkConfirmModalOpen(true);
  };

  const handleConfirmLink = () => {
    if (!selectedCircularForModal) return;
    onLinkToIncident(selectedCircularForModal);
    setLinkConfirmModalOpen(false);
    showToast(`Linked ${selectedCircularForModal.referenceCode} to Incident Workflow. Opening Dispatcher...`);
  };

  // Raise CAPA finding directly from circular
  const handleRaiseCAPA = (circular: MASCircularRecord) => {
    addFinding({
      title: `Regulatory Alignment: ${circular.referenceCode} - ${circular.title}`,
      clauseOrControl: `MAS TRM ${circular.trmDomainMapping}`,
      department: 'Technology Risk & Cyber Operations',
      description: `Regulatory Horizon Scanning identified publication of ${circular.referenceCode}: "${circular.title}". Supervisory Expectation: ${circular.summary}`,
      severity: circular.impactLevel === 'CRITICAL' ? 'Major Non-Conformity' : 'Minor Non-Conformity',
      status: 'Open',
      rootCauseAnalysis: {
        methodology: 'DIRECT',
        rootCauseStatement: `Current standard operating procedures require revision to satisfy MAS expectations under ${circular.referenceCode}.`
      },
      capaPlan: {
        correctiveAction: `Review critical systems architecture, execute gap analysis against directives in ${circular.referenceCode}, and update incident escalation playbooks.`,
        preventiveAction: `Incorporate ${circular.referenceCode} criteria into internal compliance audit test procedures and architecture review gates.`,
        owner: 'Head of Technology Risk / Incident Commander',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        evidenceRequired: `Updated system architecture diagram, change management approval records, and table-top drill reports.`
      },
      implementationNotes: `Dispatched from SKANDA Regulatory Horizon Scanner (${circular.referenceCode}).`,
      source: 'CONTINUOUS_MONITORING'
    });

    showToast(`CAPA Finding logged for ${circular.referenceCode}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Horizon Scanner Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                Continuous Horizon Scanner
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live MAS Portal Sync Active
              </span>
              <span className="text-xs text-slate-400">
                Last checked: <strong className="text-slate-300">{lastScanTime}</strong>
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              MAS Regulatory Change Horizon Scanner
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time supervisory intelligence monitoring Monetary Authority of Singapore (MAS) Notices, Circulars, Advisories, and Consultation Papers. Search regulatory precedents, inspect mandatory reporting triggers, and link circulars directly into the statutory 1-Hour incident dispatch workflow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleFetchUpdates()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Scanning MAS Feeds...' : 'Rescan MAS Circulars'}</span>
            </button>

            {onNavigateToDispatcher && (
              <button
                onClick={onNavigateToDispatcher}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Go to 1-Hour Dispatcher</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-indigo-900/40 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-indigo-300 text-xs uppercase tracking-wide">
              Supervisory Horizon Context & Priority Directive
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Tracked Directives
          </span>
          <div className="text-2xl font-black text-white">{circulars.length}</div>
          <span className="text-[10px] text-slate-500">Notices, Circulars & Advisories</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-900/40 space-y-1">
          <span className="text-[11px] text-rose-300 font-semibold flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            Statutory Notice Mandates
          </span>
          <div className="text-2xl font-black text-rose-400">
            {circulars.filter(c => c.isStatutoryMandate).length}
          </div>
          <span className="text-[10px] text-rose-300/70">Legally Enforceable (Notice 655/644)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Cloud & Cyber Alerts
          </span>
          <div className="text-2xl font-black text-amber-400">
            {circulars.filter(c => c.type === 'ADVISORY' || c.summary.toLowerCase().includes('cloud')).length}
          </div>
          <span className="text-[10px] text-slate-500">Outages & AiTM Bulletins</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-900/40 space-y-1">
          <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            Workflow Linkable
          </span>
          <div className="text-2xl font-black text-emerald-400">100%</div>
          <span className="text-[10px] text-emerald-300/70">Pre-Configured for 1-Hour SLA</span>
        </div>
      </div>

      {/* Search & Topic Tabs Controls */}
      <div className="space-y-3">
        {/* Search and Secondary Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search circulars by reference code (e.g. Notice 655, TRS 02/2025), keyword (cloud, ransomware, payment), or summary..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Type */}
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="NOTICE">Notices (Statutory)</option>
              <option value="CIRCULAR">Circulars</option>
              <option value="ADVISORY">Advisories</option>
              <option value="CONSULTATION_PAPER">Consultation Papers</option>
            </select>

            {/* Filter by Impact */}
            <select
              value={selectedImpact}
              onChange={e => setSelectedImpact(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Impact Levels</option>
              <option value="CRITICAL">Critical Impact</option>
              <option value="HIGH">High Impact</option>
              <option value="MEDIUM">Medium Impact</option>
            </select>

            {/* Statutory Mandates Only Toggle */}
            <button
              onClick={() => setStatutoryOnly(!statutoryOnly)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                statutoryOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Statutory Mandates Only</span>
            </button>
          </div>
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {topicTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTopic(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTopic === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedTopic === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Circulars Listing Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredCirculars.length}</strong> regulatory circulars & notices
          </span>
          {activeIncidentCode && (
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Active Incident in Session: <span className="font-mono">{activeIncidentCode}</span>
            </span>
          )}
        </div>

        {filteredCirculars.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-300">No regulatory directives match your query</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search keywords, clearing the statutory filter, or clicking Rescan to fetch new circulars.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('ALL');
                setSelectedType('ALL');
                setSelectedImpact('ALL');
                setStatutoryOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCirculars.map(circular => {
            const isExpanded = !!expandedDirectives[circular.id];

            return (
              <div
                key={circular.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  circular.isStatutoryMandate
                    ? 'bg-slate-900/95 border-rose-900/50 hover:border-rose-700/80 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Header Row: Reference code, badges, authority */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-indigo-300">
                      {circular.referenceCode}
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      circular.type === 'NOTICE'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : circular.type === 'CIRCULAR'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : circular.type === 'ADVISORY'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {circular.type.replace('_', ' ')}
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                      circular.impactLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : circular.impactLevel === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {circular.impactLevel} IMPACT
                    </span>

                    {circular.isStatutoryMandate && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-950 text-rose-200 border border-rose-600 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-rose-400" />
                        Statutory Mandate
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Published: <strong className="text-slate-300">{circular.issuanceDate}</strong></span>
                  </div>
                </div>

                {/* Title & Domain Mapping */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {circular.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Layers className="w-3.5 h-3.5" />
                      Domain: {circular.trmDomainMapping}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Authority: <strong className="text-slate-300">{circular.authority}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      Legal Basis: <strong className="text-slate-300">{circular.statutoryLegalBasis}</strong>
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {circular.summary}
                </p>

                {/* Directives Preview / Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Key Directives & Supervisory Expectations ({circular.keyDirectives.length})
                    </span>
                    <button
                      onClick={() => toggleDirectivesExpand(circular.id)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer"
                    >
                      {isExpanded ? 'Show Less' : 'Expand All'}
                    </button>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(isExpanded ? circular.keyDirectives : circular.keyDirectives.slice(0, 2)).map((directive, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{directive}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Incident Notification Implications Box */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Incident Notification & SLA Mandate Implications</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/80 text-rose-200 border border-rose-800/60">
                      {circular.incidentNotificationImplications.slaWindow}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Reporting Trigger Condition
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {circular.incidentNotificationImplications.reportingTriggerCondition}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Root Cause Expectations
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {circular.incidentNotificationImplications.rootCauseExpectations}
                      </p>
                    </div>
                  </div>

                  {/* Systems & Tags */}
                  <div className="pt-1 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold">Designated Systems:</span>
                      {circular.incidentNotificationImplications.applicableCriticalSystems.map((sys, sIdx) => (
                        <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                          {sys}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {circular.tags.slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50 text-[10px] text-indigo-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                  <a
                    href={circular.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Official MAS Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleRaiseCAPA(circular)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Raise CAPA Gap</span>
                    </button>

                    <button
                      onClick={() => handleInitiateLink(circular)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-950 flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Link to Incident Notification</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Link Confirmation Modal */}
      {linkConfirmModalOpen && selectedCircularForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Link Circular to Incident Workflow
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pre-populating statutory 1-hour notification parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-mono text-indigo-400 font-bold">
                  {selectedCircularForModal.referenceCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {selectedCircularForModal.incidentNotificationImplications.slaWindow}
                </span>
              </div>

              <div className="font-bold text-white text-sm">
                {selectedCircularForModal.title}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  <strong>Recommended Incident Title:</strong>
                  <div className="text-white mt-0.5 font-medium">
                    {selectedCircularForModal.incidentNotificationImplications.recommendedIncidentTitle}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <strong>Root Cause Category:</strong>
                  <div className="text-white mt-0.5 font-mono">
                    {selectedCircularForModal.incidentNotificationImplications.defaultRootCauseCategory}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <strong>Pre-Populated Summary:</strong>
                  <div className="text-slate-300 mt-0.5 text-[11px] leading-relaxed italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    "{selectedCircularForModal.incidentNotificationImplications.recommendedPrePopulatedSummary}"
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Linking this circular will pre-populate the Official MAS Notification Form (Notice 644/655), attach the circular citation to the 14-day PIR report, and arm the 60-minute SLA countdown timer.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setLinkConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLink}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Open 1-Hour Dispatcher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
