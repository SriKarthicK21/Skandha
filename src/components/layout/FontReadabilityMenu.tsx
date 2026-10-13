import React, { useState, useRef, useEffect } from 'react';
import { useGRC } from '../../context/GRCContext';
import { ContrastMode, FontSizeScale, FontWeightMode, FontFamilyChoice } from '../../types';
import {
  ALargeSmall,
  RotateCcw,
  Check,
  Eye,
  SlidersHorizontal,
  Type,
  Sparkles,
  SunMedium,
  CheckCircle2
} from 'lucide-react';

export const FontReadabilityMenu: React.FC = () => {
  const { readability, updateReadability, resetReadability, theme } = useGRC();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isCustomized =
    readability.contrastMode !== 'enhanced' ||
    readability.fontSize !== 'standard' ||
    readability.fontWeight !== 'standard' ||
    readability.fontFamily !== 'inter';

  return (
    <div ref={menuRef} className="relative shrink-0">
      {/* Header Trigger Button */}
      <button
        id="header-readability-menu-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 w-9 min-[1680px]:w-auto px-2 min-[1680px]:px-2.5 rounded-lg transition border relative flex items-center justify-center space-x-1.5 group shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
          isOpen
            ? theme === 'light'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-xs'
              : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 shadow-xs'
            : theme === 'light'
            ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-300'
            : 'text-slate-300 hover:text-white hover:bg-slate-800 border-transparent hover:border-slate-800'
        }`}
        title="Font Visibility & Contrast Settings"
        aria-label="Font Visibility and Contrast Accessibility Settings"
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <ALargeSmall className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isCustomized
              ? 'text-indigo-500'
              : theme === 'light'
              ? 'text-slate-600'
              : 'text-slate-300'
          }`} />
          {/* Customized Badge anchored to icon */}
          {isCustomized && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
          )}
        </div>
        <span className={`hidden min-[1680px]:inline text-xs font-bold transition-colors whitespace-nowrap ${
          theme === 'light' ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-200 group-hover:text-indigo-300'
        }`}>
          Font & Contrast
        </span>
      </button>

      {/* Accessibility Controls Dropdown Modal */}
      {isOpen && (
        <div
          id="readability-dropdown-panel"
          className={`absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in-50 zoom-in-95 duration-150 ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900 shadow-indigo-500/10'
              : 'bg-[#0f172a] border-slate-700/80 text-white shadow-black/60'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between pb-3 border-b mb-3.5 ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Font & Readability</h4>
                <p className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  Instant text contrast and sizing tuning
                </p>
              </div>
            </div>

            <button
              id="readability-reset-btn"
              type="button"
              onClick={resetReadability}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Reset to default crisp readability"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px]">Reset</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. Quick Presets */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Quick Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    updateReadability({
                      contrastMode: 'enhanced',
                      fontSize: 'standard',
                      fontWeight: 'standard',
                      fontFamily: 'inter'
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    readability.contrastMode === 'enhanced' &&
                    readability.fontSize === 'standard' &&
                    readability.fontWeight === 'standard' &&
                    readability.fontFamily === 'inter'
                      ? theme === 'light'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                      : theme === 'light'
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Executive Crisp</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateReadability({
                      contrastMode: 'high',
                      fontSize: 'comfortable',
                      fontWeight: 'boosted',
                      fontFamily: 'inter'
                    })
                  }
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    readability.contrastMode === 'high' &&
                    readability.fontSize === 'comfortable' &&
                    readability.fontWeight === 'boosted'
                      ? theme === 'light'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                      : theme === 'light'
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Max Legibility</span>
                </button>
              </div>
            </div>

            {/* 2. Text Color & Contrast Level */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Color Contrast Level
                </label>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                  {readability.contrastMode === 'ultra' ? 'WCAG AAA+' : readability.contrastMode === 'high' ? 'WCAG AAA' : 'Enhanced AA+'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['enhanced', 'high', 'ultra'] as ContrastMode[]).map((mode) => {
                  const isSelected = readability.contrastMode === mode;
                  const label =
                    mode === 'enhanced'
                      ? 'Enhanced'
                      : mode === 'high'
                      ? 'High (AAA)'
                      : 'Ultra 100%';
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateReadability({ contrastMode: mode })}
                      className={`py-2 px-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? theme === 'light'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : theme === 'light'
                          ? 'border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          : 'border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-[11px] leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Proportional Font Size Scaling */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Font Size Scale
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['standard', 'comfortable', 'large'] as FontSizeScale[]).map((size) => {
                  const isSelected = readability.fontSize === size;
                  const label =
                    size === 'standard'
                      ? '100% Default'
                      : size === 'comfortable'
                      ? '+8% Medium'
                      : '+18% Large';
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateReadability({ fontSize: size })}
                      className={`py-2 px-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? theme === 'light'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : theme === 'light'
                          ? 'border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          : 'border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-[11px] leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Font Weight & Stroke Enhancement */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Font Weight & Stroke
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['standard', 'boosted'] as FontWeightMode[]).map((weight) => {
                  const isSelected = readability.fontWeight === weight;
                  const label = weight === 'standard' ? 'Standard Weight' : 'Boosted Stroke (+1 Tier)';
                  return (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => updateReadability({ fontWeight: weight })}
                      className={`py-2 px-2 rounded-lg border text-center transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                        isSelected
                          ? theme === 'light'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : theme === 'light'
                          ? 'border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          : 'border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span className={`text-[11px] ${weight === 'boosted' ? 'font-bold' : 'font-medium'}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Font Family */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Typography Family
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                {([
                  { id: 'inter', label: 'Inter Enterprise', sample: 'Aa (Default)' },
                  { id: 'plus-jakarta', label: 'Jakarta Sans', sample: 'Aa' },
                  { id: 'josefin-sans', label: 'Josefin Geometric', sample: 'Aa' },
                  { id: 'sora', label: 'Sora Display', sample: 'Aa' },
                  { id: 'mono', label: 'IBM Plex Mono', sample: '</>' }
                ] as { id: FontFamilyChoice; label: string; sample: string }[]).map((item) => {
                  const isSelected = readability.fontFamily === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateReadability({ fontFamily: item.id })}
                      className={`py-2 px-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? theme === 'light'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : theme === 'light'
                          ? 'border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                          : 'border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-80">{item.sample}</span>
                      <span className="font-bold text-[11px] leading-tight mt-0.5">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Visual Reading Sample Card */}
            <div className={`p-2.5 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Live Preview
                </span>
                <span className="text-[10px] font-mono text-emerald-500 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  <span>Applied</span>
                </span>
              </div>
              <p className={`font-semibold leading-snug ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                ISO/IEC 27001:2022 Control A.5.15 Access Control
              </p>
              <p className={`text-[11px] mt-0.5 ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Access to information and associated assets shall be restricted in accordance with the established business rules.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
