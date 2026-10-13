import React from 'react';

interface RadialProgressIndicatorProps {
  value: number; // 0 to 100
  size?: number; // diameter in pixels (default: 72)
  strokeWidth?: number; // thickness in pixels (default: 6)
  label?: string; // e.g. "Complete"
  sublabel?: string; // secondary text
  colorVariant?: 'auto' | 'emerald' | 'sky' | 'indigo' | 'amber' | 'rose';
  showPercentage?: boolean;
  className?: string;
  trackColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const RadialProgressIndicator: React.FC<RadialProgressIndicatorProps> = ({
  value,
  size = 72,
  strokeWidth = 6,
  label,
  sublabel,
  colorVariant = 'auto',
  showPercentage = true,
  className = '',
  trackColor = 'stroke-slate-800',
  icon: Icon
}) => {
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  // Resolve color palette
  const getColorClasses = () => {
    if (colorVariant === 'emerald') return { stroke: 'stroke-emerald-400', text: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.15)' };
    if (colorVariant === 'sky') return { stroke: 'stroke-sky-400', text: 'text-sky-400', glow: 'rgba(56, 189, 248, 0.15)' };
    if (colorVariant === 'indigo') return { stroke: 'stroke-indigo-400', text: 'text-indigo-400', glow: 'rgba(129, 140, 248, 0.15)' };
    if (colorVariant === 'amber') return { stroke: 'stroke-amber-400', text: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.15)' };
    if (colorVariant === 'rose') return { stroke: 'stroke-rose-400', text: 'text-rose-400', glow: 'rgba(251, 113, 133, 0.15)' };

    // Auto based on value
    if (normalizedValue >= 90) {
      return { stroke: 'stroke-emerald-400', text: 'text-emerald-400', glow: 'rgba(52, 211, 153, 0.15)' };
    }
    if (normalizedValue >= 75) {
      return { stroke: 'stroke-sky-400', text: 'text-sky-400', glow: 'rgba(56, 189, 248, 0.15)' };
    }
    if (normalizedValue >= 50) {
      return { stroke: 'stroke-amber-400', text: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.15)' };
    }
    return { stroke: 'stroke-rose-400', text: 'text-rose-400', glow: 'rgba(251, 113, 133, 0.15)' };
  };

  const colors = getColorClasses();

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all duration-500"
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className={trackColor}
          />
          {/* Progress Indicator Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className={`${colors.stroke} transition-all duration-700 ease-out`}
            style={{
              filter: `drop-shadow(0 0 4px ${colors.glow})`
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {Icon ? (
            <Icon className={`w-5 h-5 ${colors.text}`} />
          ) : showPercentage ? (
            <div className="flex flex-col items-center leading-none">
              <span className={`font-bold font-mono tracking-tight ${size < 64 ? 'text-xs' : size < 80 ? 'text-sm' : 'text-base'} text-white`}>
                {normalizedValue}%
              </span>
              {size >= 72 && (
                <span className={`text-[9px] uppercase tracking-wider font-medium ${colors.text} mt-0.5`}>
                  {normalizedValue >= 90 ? 'Ready' : normalizedValue >= 60 ? 'Progress' : 'Action'}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Label and Sublabel (if provided outside ring) */}
      {(label || sublabel) && (
        <div className="mt-1.5 text-center">
          {label && <div className="text-xs font-semibold text-slate-200">{label}</div>}
          {sublabel && <div className="text-[10px] text-slate-400">{sublabel}</div>}
        </div>
      )}
    </div>
  );
};
