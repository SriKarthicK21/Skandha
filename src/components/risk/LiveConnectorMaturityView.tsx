import React from 'react';
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Server,
  KeyRound,
  ShieldAlert,
  Clock,
  Layers,
  Info,
  AlertTriangle
} from 'lucide-react';
import { LiveConnectorMaturityRecord } from '../../types/enterpriseRiskTypes';

interface LiveConnectorMaturityViewProps {
  connectors: LiveConnectorMaturityRecord[];
}

export const LiveConnectorMaturityView: React.FC<LiveConnectorMaturityViewProps> = ({ connectors }) => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Live Integration Assurance & Connector Maturity Ledger</h2>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              12-TIER MATURITY LADDER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry verification across integration fabric connectors. Distinguishes live verified feeds from mock adapters with zero secret exposure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">{connectors.filter(c => c.isLiveValidated).length} Live Verified Connectors</span>
          </div>
        </div>
      </div>

      {/* CONNECTORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((conn) => {
          const isLive = conn.isLiveValidated;
          const maturityBadge =
            conn.maturityLevel === 'PRODUCTION_VERIFIED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : conn.maturityLevel === 'CONTINUOUS_MONITORING_VERIFIED'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : conn.maturityLevel === 'LIVE_RETRIEVAL_VERIFIED'
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

          return (
            <div
              key={conn.connectorId}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {conn.connectorId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${maturityBadge}`}>
                    {conn.maturityLevel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1">{conn.name}</h3>
                <div className="text-[11px] text-slate-400">
                  Provider: <strong className="text-slate-200">{conn.provider}</strong> ({conn.environment})
                </div>
              </div>

              {/* TELEMETRY METRICS OR NOT CONFIGURATED BANNER */}
              {isLive ? (
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Collection Latency</span>
                    <span className="font-mono font-bold text-white text-xs">{conn.collectionLatencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Data Completeness</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">{conn.dataCompletenessPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Monitored Entities</span>
                    <span className="font-mono font-bold text-white text-xs">{conn.affectedEntitiesCount} assets</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Risks Updated</span>
                    <span className="font-mono font-bold text-indigo-400 text-xs">{conn.risksUpdatedCount} live</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>NOT_LIVE_VALIDATED</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Connector is in catalog state. Live credentials and telemetry polling are pending configuration.
                  </p>
                </div>
              )}

              {/* LIMITATIONS & LAST SYNC */}
              <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Last Retrieval:</span>
                  <span className="font-mono text-slate-300 text-[10px]">
                    {conn.lastSuccessfulRetrieval ? new Date(conn.lastSuccessfulRetrieval).toLocaleTimeString() : 'N/A (Unconfigured)'}
                  </span>
                </div>
                {conn.knownLimitations && conn.knownLimitations.length > 0 && (
                  <div className="text-[10px] text-slate-500 italic">
                    Note: {conn.knownLimitations[0]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveConnectorMaturityView;
