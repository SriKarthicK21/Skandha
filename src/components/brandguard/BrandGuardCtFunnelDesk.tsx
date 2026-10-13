// Skanda BrandGuard — Multi-Tier Funnel, ViT Vector Vision & Direct Abuse APIs Desk
// Chief CTO Suite: High-Throughput Scalability, OpenCLIP/ViT Embeddings & Automated Abuse APIs
import React, { useState } from 'react';
import {
  Layers,
  Eye,
  Send,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Server,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  MultiTierFunnelMetrics,
  VitVisionComparison,
  DirectAbuseApiDispatch
} from '../../types/brandguard';
import { BrandGuardCtFunnelService } from '../../services/brandguard/brandguardCtFunnelService';
import { useGRC } from '../../context/GRCContext';

export const BrandGuardCtFunnelDesk: React.FC = () => {
  const { theme, logAuditEvent } = useGRC();

  const [metrics] = useState<MultiTierFunnelMetrics>(() =>
    BrandGuardCtFunnelService.getFunnelMetrics()
  );
  const [vitBenchmarks] = useState<VitVisionComparison[]>(() =>
    BrandGuardCtFunnelService.getVitBenchmarks()
  );
  const [apiDispatches] = useState<DirectAbuseApiDispatch[]>(() =>
    BrandGuardCtFunnelService.getDirectApiDispatches()
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${
        theme === 'light'
          ? 'bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border-slate-800'
          : 'bg-gradient-to-r from-slate-950 via-teal-950/60 to-slate-950 text-white border-slate-800'
      } shadow-xl relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Chief CTO Architecture Suite</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SCALABILITY & AI VISION PIPELINE
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Multi-Tier Scanning Funnel & ViT Vector Embeddings
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Achieving 92.4% cloud compute cost reduction via tiered wire-speed DNS & HTTP filtering, paired with
              Vision Transformer (OpenCLIP) vector embeddings that detect adversary evasion techniques (rotated logos, dark mode, background noise).
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cloud Cost Savings</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {metrics.monthlyComputeSavingsPercent}%
              </span>
              <span className="text-[10px] text-teal-300 block font-semibold">vs. Unfiltered Headless Browsing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-TIER FILTERING FUNNEL VISUALIZER */}
      <div className={`p-5 rounded-xl border space-y-4 shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                4-Tier Cost & Latency Filtering Funnel
              </h3>
              <p className="text-xs text-slate-400">
                Over 145,000 domains analyzed daily. Discard non-malicious hosts at wire speed before allocating GPU resources.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tier 0 */}
          <div className={`p-4 rounded-xl border space-y-2 relative transition-all ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-slate-950/60 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                TIER 0: WIRE-SPEED DNS
              </span>
              <span className="text-[10px] text-slate-400">&lt;1ms</span>
            </div>
            <div className={`font-mono text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {metrics.tier0_WireSpeedDnsFiltered.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              85% discarded immediately at ~$0 cost (NXDOMAIN, unallocated zones, parked registrar pages).
            </p>
          </div>

          {/* Tier 1 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-slate-950/60 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                TIER 1: HTTP HEAD & GET
              </span>
              <span className="text-[10px] text-slate-400">&lt;50ms</span>
            </div>
            <div className={`font-mono text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {metrics.tier1_HttpHeadFastFiltered.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              10% inspected via lightweight non-JS HTTP request (title, favicon MurmurHash3, server headers).
            </p>
          </div>

          {/* Tier 2 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-slate-950/60 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                TIER 2: HEADLESS SANDBOX
              </span>
              <span className="text-[10px] text-slate-400">~1.2s</span>
            </div>
            <div className={`font-mono text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {metrics.tier2_HeadlessRenderExecuted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              4% rendered in stealth Chromium to execute SPAs and capture DOM tree and viewport screenshots.
            </p>
          </div>

          {/* Tier 3 */}
          <div className={`p-4 rounded-xl border space-y-2 transition-all ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-slate-950/60 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                TIER 3: ViT GPU VISION
              </span>
              <span className="text-[10px] text-slate-400">~28ms</span>
            </div>
            <div className={`font-mono text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {metrics.tier3_VitGpuVisionExecuted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only 1% of highest-risk candidates escalated to Vision Transformer vector cosine matching.
            </p>
          </div>
        </div>
      </div>

      {/* VISION TRANSFORMER (ViT) VS LEGACY PHASH BENCHMARK */}
      <div className={`p-5 rounded-xl border space-y-4 shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Vision Transformer (ViT) vs. Legacy pHash Adversarial Evasion Benchmarks
              </h3>
              <p className="text-xs text-slate-400">
                Demonstrates how OpenCLIP 512-dim vector embeddings resist adversarial logo rotations, crops, and dark mode inversions.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`font-bold uppercase tracking-wider text-[10px] border-b ${
              theme === 'light'
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-slate-950/60 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Adversary Attack Variant</th>
                <th className="py-3 px-4">Target Rogue Domain</th>
                <th className="py-3 px-4">Legacy pHash (Hamming Dist)</th>
                <th className="py-3 px-4">ViT OpenCLIP Cosine Similarity</th>
                <th className="py-3 px-4">Result Comparison</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {vitBenchmarks.map((bench, idx) => (
                <tr key={idx} className={`transition-colors ${
                  theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                }`}>
                  <td className={`py-3 px-4 font-sans font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                    {bench.attackVariant.replace(/_/g, ' ')}
                  </td>
                  <td className={`py-3 px-4 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    {bench.rogueDomain}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-400 mr-2">Dist: {bench.legacyPhashHammingDistance}</span>
                    {bench.legacyPhashMatchResult === 'MISSED_EVASION' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        MISSED (EVADED)
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        MATCHED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-teal-400 font-bold font-mono text-sm mr-2">
                      {(bench.vitEmbeddingCosineSimilarity * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans font-semibold">
                      ({bench.inferenceLatencyMs}ms)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {bench.legacyPhashMatchResult === 'MISSED_EVASION' ? (
                      <span className="text-[11px] font-bold text-teal-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>ViT Caught Evasion (pHash Failed)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Both Methods Matched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIRECT REGISTRAR & CDN ABUSE API DISPATCH HUB */}
      <div className={`p-5 rounded-xl border space-y-4 shadow-xs ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Direct Programmatic Abuse API Integrations
              </h3>
              <p className="text-xs text-slate-400">
                Submits structured API payloads directly to Cloudflare, AWS Trust & Safety, and Google Web Risk v4. Drops MTTR to &lt;2 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {apiDispatches.map(dispatch => (
            <div
              key={dispatch.id}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-sans">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {dispatch.provider.replace(/_/g, ' ')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {dispatch.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1">
                <div className={`font-bold truncate ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                  {dispatch.targetDomain}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">{dispatch.requestPayloadSummary}</div>
              </div>

              <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <span className="text-slate-400">Ticket Ref: {dispatch.ticketReferenceId}</span>
                <span className="text-emerald-400 font-bold font-sans">
                  MTTR: {dispatch.mttrHoursAchieved}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
