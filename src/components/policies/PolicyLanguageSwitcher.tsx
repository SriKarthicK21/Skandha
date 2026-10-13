import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Languages,
  Check,
  ChevronDown,
  Sparkles,
  BookOpen,
  Info
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage
} from '../../utils/policyTranslator';

export interface PolicyLanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (langCode: string) => void;
  isBilingual?: boolean;
  onToggleBilingual?: (bilingual: boolean) => void;
  isLoading?: boolean;
  compact?: boolean;
  showBilingualToggle?: boolean;
}

export const PolicyLanguageSwitcher: React.FC<PolicyLanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  isBilingual = false,
  onToggleBilingual,
  isLoading = false,
  compact = false,
  showBilingualToggle = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    onLanguageChange(lang.code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
      {/* Main Switcher Button */}
      <button
        id="policy-language-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold ${
          currentLanguage !== 'en'
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-900 shadow-2xs hover:border-blue-400'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
        } ${compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2'}`}
        title="Select policy language for distributed global teams"
      >
        <span className="text-sm leading-none">{activeLang.flag}</span>
        <span className="font-bold">{activeLang.nativeName}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono uppercase">
          {activeLang.code}
        </span>
        {isLoading ? (
          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin ml-1" />
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Bilingual / Dual-Language Auditor Toggle */}
      {showBilingualToggle && onToggleBilingual && currentLanguage !== 'en' && (
        <button
          id="btn-toggle-bilingual-mode"
          type="button"
          onClick={() => onToggleBilingual(!isBilingual)}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isBilingual
              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
              : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
          }`}
          title="Toggle Bilingual Auditor Mode (Original English Master + Translated Local Language)"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Bilingual {isBilingual ? 'On' : 'Off'}</span>
        </button>
      )}

      {/* Language Selection Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Global Team Localization</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              ISO 7.5.3
            </span>
          </div>

          <div className="p-1.5 max-h-80 overflow-y-auto divide-y divide-slate-50">
            {SUPPORTED_LANGUAGES.map(lang => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <div>
                      <div className="text-xs font-semibold flex items-center space-x-1.5">
                        <span>{lang.nativeName}</span>
                        {lang.code === 'en' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-mono">
                            Master
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {lang.name} • {lang.region}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center space-x-1">
              <Info className="w-3 h-3 text-slate-400" />
              <span>Auto-translates clauses & templates</span>
            </div>
            <span className="font-mono text-slate-400">{SUPPORTED_LANGUAGES.length} Languages</span>
          </div>
        </div>
      )}
    </div>
  );
};
