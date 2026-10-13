// Skanda BrandGuard — Certificate Transparency (CT) Stream Component
// Interactive live monitoring console tracking public SSL/TLS Certificate Transparency logs
// Provides early warning detection of newly minted certificates hours/days before phishing pages deploy.

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  Radio,
  Filter,
  Activity
} from 'lucide-react';
import { BrandProfile, BrandFinding } from '../../types/brandguard';
import { BrandGuardCTService, CTLogEntry } from '../../services/brandguard/brandguardCTService';
import { BrandGuardSseWorkerService, SseIngestionEvent } from '../../services/brandguard/brandguardSseWorkerService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardCTLogStreamProps {
  brandProfile: BrandProfile;
  onFindingCreated?: (finding: BrandFinding) => void;
}

export const BrandGuardCTLogStream: React.FC<BrandGuardCTLogStreamProps> = ({
  brandProfile,
  onFindingCreated
}) => {
  const { theme, logAuditEvent } = useGRC();
  const [logs, setLogs] = useState<CTLogEntry[]>(() => BrandGuardCTService.getCTLogs());
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // SSE Ingestion Worker Telemetry State
  const [sseWorkerEvents, setSseWorkerEvents] = useState<SseIngestionEvent[]>(() =>
    BrandGuardSseWorkerService.getRecentWorkerEvents()
  );
  const [showSseWorkerFeed, setShowSseWorkerFeed] = useState(false);

  // SSE Ingestion Worker Subscription
  useEffect(() => {
    if (!isLiveStreaming) return;

    const unsubscribe = BrandGuardSseWorkerService.startSseStream(brandProfile, (sseEvent) => {
      setSseWorkerEvents(prev => [sseEvent, ...prev].slice(0, 50));

      // If high probability clone was escalated by the bloom & Levenshtein filter, add to CT logs table
      if (sseEvent.verdict === 'ESCALATED_HIGH_PROBABILITY_CLONE') {
        const newCTEvent: CTLogEntry = {
          id: `ct_sse_${Date.now()}`,
          timestamp: sseEvent.timestamp,
          subjectCN: sseEvent.rawCandidate,
          subjectSANs: [sseEvent.rawCandidate, `www.${sseEvent.rawCandidate}`],
          issuerCA: 'Let\'s Encrypt Authority Oak (SSE Push)',
          serialNumber: `SSE-WIRE-${Date.now().toString(16)}`,
          signatureAlgorithm: 'SHA256withRSA',
          validFrom: new Date().toISOString(),
          validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
          logOperator: 'Google Argon 2026',
          logIndex: Math.floor(Math.random() * 50000000) + 120000000,
          isPreCertificate: true,
          isSuspicious: true,
          matchedBrandKeyword: brandProfile.shortName.toLowerCase(),
          threatTags: ['Levenshtein Distance 1', 'Homoglyph 0.96', 'High Impersonation Risk'],
          riskLevel: 'CRITICAL',
          resolvedIP: '194.26.29.114'
        };
        setLogs(prev => [newCTEvent, ...prev].slice(0, 60));
      }
    });

    return () => unsubscribe();
  }, [isLiveStreaming, brandProfile]);

  const handleManualPulse = () => {
    const newEvent = BrandGuardCTService.generateSimulatedCTEvent(brandProfile);
    setLogs(prev => [newEvent, ...prev].slice(0, 60));
  };

  const handleIngestToFindings = (entry: CTLogEntry) => {
    const newFinding = BrandGuardCTService.ingestCTEntryAsFinding(entry, brandProfile);
    setLogs(BrandGuardCTService.getCTLogs());

    logAuditEvent(
      'CREATE',
      'BrandGuard CT Stream',
      `Ingested suspicious Certificate Transparency entry for ${entry.subjectCN} into forensic brand findings [Ref: ${newFinding.findingCode}]`
    );

    if (onFindingCreated) {
      onFindingCreated(newFinding);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (riskFilter !== 'ALL' && log.riskLevel !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCN = log.subjectCN.toLowerCase().includes(q);
      const matchCA = log.issuerCA.toLowerCase().includes(q);
      const matchTags = log.threatTags.some(t => t.toLowerCase().includes(q));
      if (!matchCN && !matchCA && !matchTags) return false;
    }
    return true;
  });

  const criticalCount = logs.filter(l => l.riskLevel === 'CRITICAL').length;
  const preCertCount = logs.filter(l => l.isPreCertificate).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stream Controls & Metrics */}
      <div className={`p-5 rounded-xl border shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Certificate Transparency (CT) Stream Telemetry
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1.5 ${
                    isLiveStreaming
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                    <span>{isLiveStreaming ? 'LIVE STREAM CONNECTED' : 'STREAM PAUSED'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuous log stream from Google Argon 2026, Cloudflare Nimbus, and Let's Encrypt Oak public monitors
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                isLiveStreaming
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isLiveStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isLiveStreaming ? 'Pause Feed' : 'Resume Live Feed'}</span>
            </button>

            <button
              onClick={() => setShowSseWorkerFeed(!showSseWorkerFeed)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                showSseWorkerFeed
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveStreaming ? 'animate-pulse text-purple-400' : ''}`} />
              <span>{showSseWorkerFeed ? 'Hide Ingestion Telemetry' : 'SSE Ingestion Worker Pipeline'}</span>
            </button>

            <button
              onClick={handleManualPulse}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate New Issuance</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Strips */}
        <div className={`mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t text-xs ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <span className="text-slate-400 block text-[11px]">Streamed Events (Window)</span>
            <span className={`text-base font-bold mt-0.5 block ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
              {logs.length} Certificates
            </span>
            <span className="text-[10px] text-emerald-400">Zero packet drop</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <span className="text-slate-400 block text-[11px]">Critical Impersonation Risk</span>
            <span className="text-base font-bold text-rose-500 mt-0.5 block">{criticalCount} Flagged</span>
            <span className="text-[10px] text-slate-500">Requires immediate attention</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <span className="text-slate-400 block text-[11px]">Pre-Certificates Intercepted</span>
            <span className="text-base font-bold text-indigo-400 mt-0.5 block">{preCertCount} Pre-Certs</span>
            <span className="text-[10px] text-indigo-300">Before DNS deployment</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <span className="text-slate-400 block text-[11px]">Avg Pre-Launch Lead Time</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">14.8 Hours</span>
            <span className="text-[10px] text-slate-400">Proactive mitigation advantage</span>
          </div>
        </div>

        {/* Real-Time SSE Ingestion Worker Live Stream Drawer */}
        {showSseWorkerFeed && (
          <div className="mt-5 p-4 rounded-xl bg-slate-950/90 border border-purple-500/30 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Worker-Side Wire-Speed Ingestion Pipeline (Bloom Filter & Levenshtein Pruning)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/30">
                SSE BUFFER: {sseWorkerEvents.length} RAW PRE-CERTS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Thousands of global CT log records are processed per second by server-side workers. Only candidates passing the Bloom filter with Levenshtein distance &le; 2 are admitted to avoid UI congestion.
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {sseWorkerEvents.slice(0, 12).map((ev) => (
                <div
                  key={ev.eventId}
                  className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-slate-500 text-[10px]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-200 truncate">{ev.rawCandidate}</span>
                    <span className="text-slate-500 text-[10px]">({ev.sourceStream.replace(/_/g, ' ')})</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-slate-400">Lev: {ev.levenshteinDistance}</span>
                    <span className="text-[10px] text-slate-400">Latency: {ev.processingLatencyMs}ms</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.verdict === 'ESCALATED_HIGH_PROBABILITY_CLONE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ev.verdict === 'ESCALATED_HIGH_PROBABILITY_CLONE' ? 'ESCALATED' : 'PRUNED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain, issuer CA, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
              theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
            }`}
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto text-xs">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setRiskFilter(tier)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                riskFilter === tier
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'light'
                  ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream Table */}
      <div className={`rounded-xl border overflow-hidden shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between text-xs ${
          theme === 'light' ? 'border-slate-200 bg-slate-50/50 text-slate-700' : 'border-slate-800 text-slate-300'
        }`}>
          <span className="font-bold">
            Monitored CT Certificate Records ({filteredLogs.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Keyword Monitor: "{brandProfile.shortName.toLowerCase()}", "apexfintech"
          </span>
        </div>

        <div className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
          {filteredLogs.map(entry => {
            const isExpanded = expandedLogId === entry.id;
            return (
              <div key={entry.id} className={`p-4 transition-colors ${
                theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start space-x-3 min-w-0">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                      className={`mt-0.5 p-1 rounded transition-colors shrink-0 ${
                        theme === 'light' ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-indigo-400 font-bold text-sm">
                          {entry.subjectCN}
                        </span>
                        {entry.isPreCertificate && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PRE-CERTIFICATE
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          entry.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : entry.riskLevel === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}>
                          {entry.riskLevel}
                        </span>
                        {entry.ingestedAsFindingId && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>INGESTED ({entry.ingestedAsFindingId})</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center space-x-3 text-[11px] text-slate-400 flex-wrap gap-y-1">
                        <span>Issuer: <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>{entry.issuerCA}</strong></span>
                        <span>•</span>
                        <span>Log: <span className="font-mono text-slate-400">{entry.logOperator}</span></span>
                        <span>•</span>
                        <span>Timestamp: {new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>

                      {/* Threat Tags */}
                      <div className="mt-2 flex items-center space-x-1.5 flex-wrap gap-y-1">
                        {entry.threatTags.map((tag, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              theme === 'light'
                                ? 'bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 md:self-center">
                    {entry.ingestedAsFindingId ? (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        theme === 'light' ? 'text-slate-500 border-slate-200 bg-slate-100' : 'text-slate-500 border-slate-800 bg-slate-950'
                      }`}>
                        Finding Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleIngestToFindings(entry)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ingest as Finding</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className={`mt-3.5 p-4 rounded-xl border text-xs space-y-3 animate-in fade-in duration-150 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[11px]">X.509 Serial Number:</span>
                        <span className={`font-mono text-[11px] break-all ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          {entry.serialNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Signature Algorithm:</span>
                        <span className={`font-mono text-[11px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                          {entry.signatureAlgorithm}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Resolved IP (Initial):</span>
                        <span className="font-mono text-emerald-500 text-[11px] font-bold">{entry.resolvedIP || 'Pending DNS Resolution'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">Subject Alternative Names (SANs):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.subjectSANs.map((san, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded border font-mono text-[10px] ${
                              theme === 'light'
                                ? 'bg-white text-indigo-700 border-slate-200'
                                : 'bg-slate-900 text-indigo-300 border-slate-800'
                            }`}
                          >
                            {san}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t ${
                      theme === 'light' ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <span>Log Index: #{entry.logIndex}</span>
                      <span>Validity: {new Date(entry.validFrom).toLocaleDateString()} to {new Date(entry.validTo).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
