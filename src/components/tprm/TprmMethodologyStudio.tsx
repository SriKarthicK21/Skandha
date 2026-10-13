/**
 * SKANDA ENTERPRISE TPRM RISK METHODOLOGY STUDIO
 * Path: src/components/tprm/TprmMethodologyStudio.tsx
 */

import React, { useState } from 'react';
import {
  Sliders,
  ShieldAlert,
  Layers,
  CheckCircle2,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { useTprmStore } from '../../stores/useTprmStore';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';

export const TprmMethodologyStudio: React.FC = () => {
  const { theme } = useGRC();
  const { showToast } = useToast();
  const { activeMethodology, setActiveMethodology } = useTprmStore();

  const isLight = theme === 'light';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div
        className={`p-6 rounded-2xl border transition ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-sky-500/15 text-sky-400 border-sky-500/30">
                Transparent & Versioned Risk Science
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Active Methodology: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{activeMethodology.version}</strong>
              </span>
            </div>
            <h2 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Enterprise 14-Factor TPRM Methodology & Matrix Studio
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Configurable scoring factor weights, documented rating definitions, and immutable historical snapshot provenance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              ✓ Approved by CRO & Board
            </span>
          </div>
        </div>
      </div>

      {/* 2. Factor Weights & 5x5 Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factor Weights Editor */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              14-Factor Weighting Specifications
            </h3>
          </div>

          <div className="space-y-2.5">
            {Object.entries(activeMethodology.factorWeights).map(([cat, weight]) => (
              <div
                key={cat}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-400 block">Category factor contribution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${weight * 500}%` }} />
                  </div>
                  <span className="font-mono font-bold text-sky-400 w-12 text-right">
                    {Math.round(weight * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5x5 Matrix Visualizer */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                5x5 Risk Matrix & Severity Bands
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Likelihood &times; Impact</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-[10px] font-mono font-bold">
            {[5, 4, 3, 2, 1].map(l =>
              [1, 2, 3, 4, 5].map(i => {
                const score = l * i;
                const isCrit = score >= 17;
                const isHigh = score >= 10 && score < 17;
                const isMed = score >= 5 && score < 10;
                return (
                  <div
                    key={`${l}-${i}`}
                    className={`p-3 rounded-lg border transition ${
                      isCrit
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isMed
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    <div>{score}</div>
                    <span className="text-[8px] opacity-75 font-normal">L{l}&bull;I{i}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-xs space-y-1">
            <div className="font-bold text-sky-300">Appetite Policy Rule:</div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {activeMethodology.appetitePolicy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
