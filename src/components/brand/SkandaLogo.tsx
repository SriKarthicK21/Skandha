import React from 'react';

export type SkandaLogoVariant = 'full' | 'horizontal' | 'icon_only' | 'simplified' | 'badge';
export type SkandaLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface SkandaLogoProps {
  size?: SkandaLogoSize;
  variant?: SkandaLogoVariant;
  theme?: string;
  className?: string;
  showSubtitle?: boolean;
  onClick?: () => void;
  alt?: string;
}

export const SkandaLogo: React.FC<SkandaLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'dark',
  className = '',
  onClick,
}) => {
  if (variant === 'full' || variant === 'icon_only' || variant === 'simplified') {
    return null;
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border select-none ${
          theme === 'light'
            ? 'bg-slate-50 border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        } ${onClick ? 'cursor-pointer hover:border-indigo-500 transition-all' : ''} ${className}`}
      >
        <span className="font-bold text-xs tracking-wider">SKANDA</span>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          GRC
        </span>
      </div>
    );
  }

  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' || size === 'xl' ? 'text-lg' : 'text-base';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <span
        className={`font-black tracking-wider uppercase transition-colors ${
          theme === 'light'
            ? 'text-slate-900 group-hover:text-indigo-600'
            : 'text-white group-hover:text-indigo-400'
        } ${textSize}`}
      >
        SKANDA
      </span>
      <span
        className={`text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border uppercase shrink-0 ${
          theme === 'light'
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
        }`}
      >
        GRC
      </span>
    </div>
  );
};
