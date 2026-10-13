import React from 'react';
import { useGRC } from '../../context/GRCContext';
import { Shield, ExternalLink, HelpCircle, Lock, BookOpen, LifeBuoy } from 'lucide-react';

interface GlobalFooterProps {
  onOpenHelp?: () => void;
  className?: string;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  onOpenHelp,
  className = ''
}) => {
  const { theme, currentTenant, setActiveModule } = useGRC();
  const isLight = theme === 'light';

  return (
    <footer
      id="skanda-global-footer"
      className={`w-full shrink-0 border-t py-2 px-3 sm:px-5 transition-colors duration-200 select-none ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-600'
          : 'bg-[#0F172A]/90 border-slate-800/80 text-slate-400'
      } ${className}`}
      role="contentinfo"
    >
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Brand, Copyright & Engine Health */}
        <div className="flex items-center space-x-2.5 flex-wrap justify-center sm:justify-start gap-y-1">
          <div className="flex items-center space-x-1.5 font-bold tracking-tight">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className={isLight ? 'text-slate-900' : 'text-white'}>SKANDA</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Enterprise Continuous GRC & Risk Intelligence
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden md:inline">·</span>
          <div className="hidden md:flex items-center space-x-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">All Engines Operational</span>
          </div>
        </div>

        {/* Center / Right: Meaningful Links */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-[11px] font-medium flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onOpenHelp?.()}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Help</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('tasks')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <LifeBuoy className="w-3 h-3" />
            <span>Support</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('policies')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            <span>Documentation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('dpdp')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Privacy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModule('security_exceptions')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Security</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>

          {/* Version Identifier */}
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md border font-semibold tracking-wider shrink-0 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            v2026.4.0-enterprise
          </span>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
