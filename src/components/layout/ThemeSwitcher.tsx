import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useGRC } from '../../context/GRCContext';
import { useToast } from '../common/ToastContainer';
import { GlobalTheme } from '../../types';

interface ThemeSwitcherProps {
  /** Optional variant: 'segmented' (3-way pill: Midnight, Light, Auto) or 'compact' (single toggle button) */
  variant?: 'segmented' | 'compact';
  /** Optional className for container layout overrides */
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'segmented',
  className = ''
}) => {
  const {
    theme,
    isThemeTransitioning,
    osTheme,
    isOSThemeSynced,
    setTheme,
    toggleTheme,
    syncWithOSTheme
  } = useGRC();
  const { showToast } = useToast();

  const handleSelectTheme = (target: 'midnight' | 'light' | 'auto') => {
    if (target === 'auto') {
      if (isOSThemeSynced) return;
      syncWithOSTheme();
      showToast({
        title: 'Theme: Synced with OS',
        message: `Detected OS ${osTheme === 'midnight' ? 'dark' : 'light'} mode via window.matchMedia.`,
        type: 'info'
      });
      return;
    }

    if (!isOSThemeSynced && target === theme) return;
    setTheme(target);
    showToast({
      title: target === 'midnight' ? 'Theme: Midnight Dark' : 'Theme: High-Contrast Light',
      message: target === 'midnight'
        ? 'Deep slate palette activated with smooth cross-fade.'
        : 'High-contrast light mode enabled with smooth cross-fade.',
      type: 'info'
    });
  };

  const handleCompactToggle = () => {
    // If currently synced, toggle to the opposite theme manually
    if (isOSThemeSynced) {
      const next: GlobalTheme = theme === 'midnight' ? 'light' : 'midnight';
      setTheme(next);
      showToast({
        title: next === 'midnight' ? 'Theme: Midnight Dark' : 'Theme: High-Contrast Light',
        message: 'Manual override set with smooth cross-fade.',
        type: 'info'
      });
      return;
    }

    // If manual, toggle between themes or cycle back to auto-sync
    const next: GlobalTheme = theme === 'midnight' ? 'light' : 'midnight';
    toggleTheme();
    showToast({
      title: next === 'midnight' ? 'Theme: Midnight Dark' : 'Theme: High-Contrast Light',
      message: 'Switched theme with smooth cross-fade.',
      type: 'info'
    });
  };

  // Keyboard navigation handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const modes: Array<'midnight' | 'light' | 'auto'> = ['midnight', 'light', 'auto'];
    const currentMode = isOSThemeSynced ? 'auto' : theme;
    const currentIndex = modes.indexOf(currentMode);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % modes.length;
      handleSelectTheme(modes[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
      handleSelectTheme(modes[prevIndex]);
    }
  };

  // Compact single-button icon toggle variant (ideal for constrained spaces & mobile)
  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center space-x-1 ${className}`}>
        <button
          id="theme-toggle-compact-btn"
          type="button"
          onClick={handleCompactToggle}
          className={`relative flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold shadow-xs group overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
            theme === 'light'
              ? 'bg-amber-50 hover:bg-amber-100/80 text-amber-950 border-amber-300/80 ring-1 ring-amber-400/30'
              : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border-slate-800 ring-1 ring-indigo-500/20'
          } ${isThemeTransitioning ? 'scale-[0.98] ring-2 ring-purple-500/50' : ''}`}
          title={`Theme: ${theme === 'midnight' ? 'Midnight Dark' : 'High-Contrast Light'} • System: ${osTheme} • Click to toggle`}
          aria-label={`Current theme is ${theme}. Click to switch theme.`}
        >
          {/* Light Mode Icon Layer */}
          <span
            className={`flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              theme === 'light'
                ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                : 'opacity-0 scale-75 -rotate-45 translate-y-2 pointer-events-none absolute'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600 shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          </span>

          {/* Midnight Dark Mode Icon Layer */}
          <span
            className={`flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              theme === 'midnight'
                ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                : 'opacity-0 scale-75 rotate-45 -translate-y-2 pointer-events-none absolute'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400 shrink-0 group-hover:-rotate-12 transition-transform duration-300" />
          </span>

          {/* Auto-Synced Indicator Dot */}
          {isOSThemeSynced && (
            <span
              className="absolute top-1 right-1 flex h-1.5 w-1.5"
              title={`Auto-synced with OS preference (${osTheme})`}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          )}
        </button>

        {/* Quick OS Sync Button if user has manual override active */}
        {!isOSThemeSynced && (
          <button
            id="theme-restore-os-sync-btn"
            type="button"
            onClick={() => handleSelectTheme('auto')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={`Restore Auto-Sync with OS (${osTheme === 'midnight' ? 'Dark' : 'Light'})`}
            aria-label="Restore Auto-Sync with OS preference"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Segmented 3-pill icon-only toggle variant (default: [Moon | Sun | Laptop])
  const activePosition = isOSThemeSynced ? 2 : theme === 'midnight' ? 0 : 1;

  return (
    <div
      id="theme-switcher-container"
      role="radiogroup"
      aria-label="Theme mode switcher"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center p-0.5 rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-2 focus:ring-ring/40 ${
        theme === 'light'
          ? 'bg-surface-2 border-stroke shadow-xs'
          : 'bg-slate-950/90 border-slate-800/90 shadow-inner'
      } ${isThemeTransitioning ? 'ring-2 ring-indigo-500/40 shadow-indigo-500/20' : ''} ${className}`}
    >
      {/* Sliding and Cross-Fading Active Indicator Track & Pill */}
      <div className="absolute inset-0.5 pointer-events-none" aria-hidden="true">
        <div
          className={`w-1/3 h-full rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xs ${
            activePosition === 0
              ? 'translate-x-0 bg-slate-850 border border-slate-700/80 ring-1 ring-indigo-500/20'
              : activePosition === 1
                ? 'translate-x-full bg-surface border border-stroke-strong shadow-xs'
                : 'translate-x-[200%] bg-indigo-950/90 border border-indigo-500/60 ring-1 ring-indigo-400/30'
          }`}
        />
      </div>

      {/* Midnight (Dark) Icon Pill */}
      <button
        id="theme-btn-midnight"
        type="button"
        role="radio"
        aria-checked={!isOSThemeSynced && theme === 'midnight'}
        aria-label="Midnight Dark mode"
        onClick={() => handleSelectTheme('midnight')}
        className={`relative z-10 flex-1 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-7.5 rounded-lg select-none transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
          !isOSThemeSynced && theme === 'midnight'
            ? 'text-white'
            : theme === 'light'
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Midnight Dark: Deep slate high-contrast palette engineered for low-light compliance operations"
      >
        <Moon
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            !isOSThemeSynced && theme === 'midnight'
              ? 'text-indigo-400 scale-110 rotate-0'
              : 'text-slate-400 scale-95 -rotate-12 group-hover:text-slate-300'
          }`}
        />
      </button>

      {/* Light (High-Contrast) Icon Pill */}
      <button
        id="theme-btn-light"
        type="button"
        role="radio"
        aria-checked={!isOSThemeSynced && theme === 'light'}
        aria-label="High-Contrast Light mode"
        onClick={() => handleSelectTheme('light')}
        className={`relative z-10 flex-1 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-7.5 rounded-lg select-none transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
          !isOSThemeSynced && theme === 'light'
            ? 'text-ink'
            : theme === 'light'
              ? 'text-ink-2 hover:text-ink'
              : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Light: Clean high-contrast daytime mode engineered for audits and boardroom presentations"
      >
        <Sun
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            !isOSThemeSynced && theme === 'light'
              ? 'text-warn scale-110 rotate-45'
              : 'text-slate-400 scale-95 rotate-0 group-hover:text-slate-300'
          }`}
        />
      </button>

      {/* Auto (OS System Preference) Icon Pill */}
      <button
        id="theme-btn-auto"
        type="button"
        role="radio"
        aria-checked={isOSThemeSynced}
        aria-label="Auto System OS theme"
        onClick={() => handleSelectTheme('auto')}
        className={`relative z-10 flex-1 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-7.5 rounded-lg select-none transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer ${
          isOSThemeSynced
            ? 'text-indigo-200'
            : theme === 'light'
              ? 'text-ink-2 hover:text-ink'
              : 'text-slate-400 hover:text-slate-200'
        }`}
        title={`Auto-Sync: Match OS scheme automatically (${osTheme === 'midnight' ? 'Currently Dark' : 'Currently Light'})`}
      >
        <Laptop
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isOSThemeSynced
              ? 'text-indigo-300 scale-110'
              : 'text-slate-400 scale-95 group-hover:text-slate-300'
          }`}
        />
      </button>
    </div>
  );
};
