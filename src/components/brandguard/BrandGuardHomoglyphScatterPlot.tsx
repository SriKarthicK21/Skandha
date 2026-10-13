// Skanda BrandGuard — Interactive Homoglyph Attack Surface Scatter Plot
// Visual scatter matrix plotting Visual/Phonetic Similarity Score (X-axis)
// against Threat Likelihood & Registration Status (Y-axis).
// Allows security analysts to visually spot high-risk impersonation clusters.

import React, { useState } from 'react';
import {
  Globe,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ShoppingCart,
  Check,
  Mail,
  Eye,
  Info,
  ExternalLink,
  Plus
} from 'lucide-react';
import { DefensiveDomainVariant } from '../../services/brandguard/brandguardHomoglyphService';
import { useGRC } from '../../context/GRCContext';

interface BrandGuardHomoglyphScatterPlotProps {
  variants: DefensiveDomainVariant[];
  onToggleCart: (variant: DefensiveDomainVariant) => void;
  onInspectEmail?: (domain: string) => void;
  onAddToWatchlist?: (domain: string) => void;
}

export const BrandGuardHomoglyphScatterPlot: React.FC<BrandGuardHomoglyphScatterPlotProps> = ({
  variants,
  onToggleCart,
  onInspectEmail,
  onAddToWatchlist
}) => {
  const { theme } = useGRC();
  const [selectedNode, setSelectedNode] = useState<DefensiveDomainVariant | null>(null);
  const [hoveredNode, setHoveredNode] = useState<DefensiveDomainVariant | null>(null);
  const [filterTechnique, setFilterTechnique] = useState<string>('ALL');

  // Y-axis positioning based on status & threat level
  const getYPosition = (variant: DefensiveDomainVariant): number => {
    switch (variant.registrationStatus) {
      case 'SQUATTED_ACTIVE_THREAT':
        return 88; // Top risk
      case 'SQUATTED_PARKED':
        return 62;
      case 'OWNED_DEFENSIVE':
        return 36;
      case 'AVAILABLE_FOR_PURCHASE':
      default:
        return 16; // Bottom / Unregistered
    }
  };

  const getStatusColor = (variant: DefensiveDomainVariant): { bg: string; border: string; text: string; ring: string } => {
    switch (variant.registrationStatus) {
      case 'SQUATTED_ACTIVE_THREAT':
        return {
          bg: 'rgba(244, 63, 94, 0.85)',
          border: '#f43f5e',
          text: '#fda4af',
          ring: 'rgba(244, 63, 94, 0.4)'
        };
      case 'SQUATTED_PARKED':
        return {
          bg: 'rgba(245, 158, 11, 0.85)',
          border: '#f59e0b',
          text: '#fde68a',
          ring: 'rgba(245, 158, 11, 0.4)'
        };
      case 'OWNED_DEFENSIVE':
        return {
          bg: 'rgba(16, 185, 129, 0.85)',
          border: '#10b981',
          text: '#a7f3d0',
          ring: 'rgba(16, 185, 129, 0.4)'
        };
      case 'AVAILABLE_FOR_PURCHASE':
      default:
        return {
          bg: 'rgba(99, 102, 241, 0.85)',
          border: '#6366f1',
          text: '#c7d2fe',
          ring: 'rgba(99, 102, 241, 0.4)'
        };
    }
  };

  const filtered = variants.filter(v => {
    if (filterTechnique === 'ALL') return true;
    return v.technique === filterTechnique;
  });

  // Dimensions for SVG canvas
  const svgWidth = 800;
  const svgHeight = 360;
  const padding = { top: 30, right: 40, bottom: 45, left: 160 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Active or displayed node for inspection drawer
  const activeNode = selectedNode || hoveredNode;

  return (
    <div
      className={`p-5 rounded-2xl border ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Globe className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold">Interactive Homoglyph Attack Surface Scatter Plot</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            X-Axis: Perceptual Similarity Score (0-100%) vs Y-Axis: Threat Likelihood & Registration Status
          </p>
        </div>

        {/* Technique Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] font-semibold">
          {[
            { id: 'ALL', label: 'All Variants' },
            { id: 'HOMOGLYPH', label: 'Homoglyph' },
            { id: 'COMBOSQUATTING', label: 'Combosquat' },
            { id: 'TYPOSQUATTING', label: 'Typosquat' },
            { id: 'TLD_VARIATION', label: 'TLDs' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterTechnique(btn.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterTechnique === btn.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scatter Canvas Area */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Scatter Plot (Col span 2) */}
        <div className="lg:col-span-2 relative bg-slate-950/90 rounded-xl border border-slate-800 p-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            style={{ minWidth: '540px' }}
          >
            {/* Background Grid Lines & Y-Zones */}
            {/* Active Threat Zone */}
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight * 0.3}
              fill="rgba(244, 63, 94, 0.04)"
            />
            {/* Parked Zone */}
            <rect
              x={padding.left}
              y={padding.top + plotHeight * 0.3}
              width={plotWidth}
              height={plotHeight * 0.25}
              fill="rgba(245, 158, 11, 0.03)"
            />
            {/* Defensive Zone */}
            <rect
              x={padding.left}
              y={padding.top + plotHeight * 0.55}
              width={plotWidth}
              height={plotHeight * 0.22}
              fill="rgba(16, 185, 129, 0.03)"
            />
            {/* Available Zone */}
            <rect
              x={padding.left}
              y={padding.top + plotHeight * 0.77}
              width={plotWidth}
              height={plotHeight * 0.23}
              fill="rgba(99, 102, 241, 0.03)"
            />

            {/* Y-Axis Tier Labels */}
            <g className="text-[10px] font-sans font-bold fill-slate-400">
              <text x={padding.left - 12} y={padding.top + plotHeight * 0.15} textAnchor="end" fill="#fda4af">
                ACTIVE THREAT (SQUATTED)
              </text>
              <text x={padding.left - 12} y={padding.top + plotHeight * 0.42} textAnchor="end" fill="#fde68a">
                PARKED / ADULT RELAY
              </text>
              <text x={padding.left - 12} y={padding.top + plotHeight * 0.66} textAnchor="end" fill="#a7f3d0">
                DEFENSIVELY SECURED
              </text>
              <text x={padding.left - 12} y={padding.top + plotHeight * 0.88} textAnchor="end" fill="#c7d2fe">
                AVAILABLE TO ACQUIRE
              </text>
            </g>

            {/* Horizontal Guide Dividers */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight * 0.3}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight * 0.3}
              stroke="#334155"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={padding.top + plotHeight * 0.55}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight * 0.55}
              stroke="#334155"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={padding.top + plotHeight * 0.77}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight * 0.77}
              stroke="#334155"
              strokeDasharray="4 4"
            />

            {/* X-Axis Baseline & Ticks */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="#475569"
            />

            {[40, 50, 60, 70, 80, 90, 100].map(val => {
              const xPos = padding.left + ((val - 40) / 60) * plotWidth;
              return (
                <g key={val}>
                  <line x1={xPos} y1={padding.top} x2={xPos} y2={padding.top + plotHeight} stroke="#1e293b" />
                  <line x1={xPos} y1={padding.top + plotHeight} x2={xPos} y2={padding.top + plotHeight + 5} stroke="#475569" />
                  <text
                    x={xPos}
                    y={padding.top + plotHeight + 18}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            <text
              x={padding.left + plotWidth / 2}
              y={padding.top + plotHeight + 35}
              textAnchor="middle"
              className="text-[11px] font-sans font-bold fill-slate-300"
            >
              Visual & Phonetic Similarity Score (%) →
            </text>

            {/* Plot Scatter Nodes */}
            {filtered.map(variant => {
              const simPercent = Math.max(40, Math.min(100, variant.similarityScore));
              const cx = padding.left + ((simPercent - 40) / 60) * plotWidth;
              const yVal = getYPosition(variant);
              const cy = padding.top + plotHeight - (yVal / 100) * plotHeight;
              const colors = getStatusColor(variant);
              const isSelected = selectedNode?.id === variant.id;
              const isHovered = hoveredNode?.id === variant.id;

              return (
                <g
                  key={variant.id}
                  className="cursor-pointer transition-transform"
                  onClick={() => setSelectedNode(variant)}
                  onMouseEnter={() => setHoveredNode(variant)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Halo ring if high threat or selected */}
                  {(isSelected || isHovered || variant.priorityTier === 'CRITICAL_DEFENSE') && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 14 : isHovered ? 12 : 9}
                      fill={colors.ring}
                      className={variant.registrationStatus === 'SQUATTED_ACTIVE_THREAT' ? 'animate-pulse' : ''}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 8 : isHovered ? 7 : 5.5}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Inline Domain label on hover or if critical */}
                  {(isSelected || isHovered) && (
                    <g>
                      <rect
                        x={cx - 50}
                        y={cy - 26}
                        width={100}
                        height={18}
                        rx={4}
                        fill="#020617"
                        stroke="#475569"
                      />
                      <text
                        x={cx}
                        y={cy - 14}
                        textAnchor="middle"
                        fill="#ffffff"
                        className="text-[10px] font-mono font-bold"
                      >
                        {variant.domain.slice(0, 16)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Quick Legend Bar */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center space-x-3 flex-wrap">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Active Threat (Squatted)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Parked / Inactive</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Defensively Owned</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Available to Acquire</span>
              </div>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Showing {filtered.length} plot nodes
            </span>
          </div>
        </div>

        {/* Interactive Node Inspector Drawer (Col span 1) */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          {activeNode ? (
            <div className="space-y-4 text-xs">
              {/* Header */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300">
                    {activeNode.technique}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activeNode.priorityTier === 'CRITICAL_DEFENSE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {activeNode.priorityTier.replace(/_/g, ' ')}
                  </span>
                </div>
                <h5 className="text-base font-bold font-mono text-indigo-400 mt-2 break-all">
                  {activeNode.domain}
                </h5>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                  <span>Punycode:</span>
                  <span className="text-slate-300 truncate">{activeNode.punycode}</span>
                </div>
              </div>

              {/* Unicode Breakdown */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
                <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                  Unicode Character Mapping
                </span>
                {activeNode.homoglyphSubstitutions.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {activeNode.homoglyphSubstitutions.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-300 font-mono">
                        <span className="text-rose-400 font-bold">
                          '{sub.replacementChar || sub.substituted}' ({sub.script || 'Cyrillic'} {sub.unicodeCodepoint || sub.unicodeHex || ''})
                        </span>
                        <span className="text-slate-500">replaces</span>
                        <span className="text-emerald-400 font-bold">'{sub.originalChar || sub.original}' (Latin)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-[10px]">
                    Standard ASCII manipulation ({activeNode.technique.toLowerCase()}). No cross-script substitution.
                  </p>
                )}
              </div>

              {/* Threat Rationale & Risk Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Visual Similarity:</span>
                  <span className="font-bold font-mono text-indigo-400 text-sm">
                    {activeNode.similarityScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-bold ${
                      activeNode.registrationStatus === 'SQUATTED_ACTIVE_THREAT'
                        ? 'text-rose-400'
                        : activeNode.registrationStatus === 'AVAILABLE_FOR_PURCHASE'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {activeNode.registrationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Annual Est. Fee:</span>
                  <span className="font-bold font-mono text-slate-200">
                    ${activeNode.estimatedAnnualFeeUSD.toFixed(2)} USD
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-bold text-indigo-300 block mb-0.5">Threat Rationale:</span>
                  <p className="leading-relaxed text-slate-400">{activeNode.threatRationale}</p>
                </div>
              </div>

              {/* Action Chips */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {activeNode.registrationStatus === 'AVAILABLE_FOR_PURCHASE' ? (
                  <button
                    onClick={() => onToggleCart(activeNode)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                      activeNode.inProcurementCart
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    {activeNode.inProcurementCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>In Defensive Cart (${activeNode.estimatedAnnualFeeUSD})</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Defensive Cart (${activeNode.estimatedAnnualFeeUSD}/yr)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {onInspectEmail && (
                      <button
                        onClick={() => onInspectEmail(activeNode.domain)}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center space-x-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Inspect Active MX / Spoofability</span>
                      </button>
                    )}
                    {onAddToWatchlist && (
                      <button
                        onClick={() => onAddToWatchlist(activeNode.domain)}
                        className="w-full py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center space-x-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to CT Log Watchlist</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Eye className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Select a Scatter Plot Node</p>
              <p className="text-[11px] text-slate-500">
                Click on any node in the matrix to view its Unicode character decomposition, threat rating, and 1-click procurement chip.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
