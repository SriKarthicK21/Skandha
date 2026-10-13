import React from 'react';

export interface PremiumSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table' | 'kpi' | 'chart';
  rows?: number;
  height?: string | number;
  width?: string | number;
}

export const PremiumSkeleton: React.FC<PremiumSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  rows = 4,
  height,
  width
}) => {
  const baseShimmer = 'animate-pulse bg-slate-200/70 dark:bg-slate-800/70 rounded';

  if (variant === 'kpi') {
    return (
      <div className={`p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[132px] flex flex-col justify-between ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${baseShimmer}`} />
            <div className={`w-24 h-4 ${baseShimmer}`} />
          </div>
          <div className={`w-12 h-4 ${baseShimmer}`} />
        </div>
        <div className={`w-28 h-8 ${baseShimmer}`} />
        <div className={`w-full h-2 rounded-full ${baseShimmer}`} />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${baseShimmer}`} />
            <div className="space-y-1.5">
              <div className={`w-36 h-4 ${baseShimmer}`} />
              <div className={`w-24 h-3 ${baseShimmer}`} />
            </div>
          </div>
          <div className={`w-16 h-5 rounded-md ${baseShimmer}`} />
        </div>
        <div className="space-y-2 pt-2">
          <div className={`w-full h-3.5 ${baseShimmer}`} />
          <div className={`w-4/5 h-3.5 ${baseShimmer}`} />
          <div className={`w-2/3 h-3.5 ${baseShimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
        {/* Table Header */}
        <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 flex items-center gap-4">
          <div className={`w-28 h-3.5 ${baseShimmer}`} />
          <div className={`w-44 h-3.5 ${baseShimmer}`} />
          <div className={`w-20 h-3.5 ${baseShimmer}`} />
          <div className={`w-16 h-3.5 ${baseShimmer} ml-auto`} />
        </div>
        {/* Table Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-12 px-2 flex items-center gap-4">
              <div className={`w-32 h-4 ${baseShimmer}`} />
              <div className={`w-52 h-4 ${baseShimmer}`} />
              <div className={`w-24 h-4 ${baseShimmer}`} />
              <div className={`w-20 h-6 rounded-md ${baseShimmer} ml-auto`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 min-h-[260px] flex flex-col justify-between ${className}`}>
        <div className="flex items-center justify-between">
          <div className={`w-40 h-4 ${baseShimmer}`} />
          <div className={`w-24 h-4 ${baseShimmer}`} />
        </div>
        <div className="flex items-end gap-3 h-40 pt-4">
          <div className={`w-1/6 h-24 ${baseShimmer}`} />
          <div className={`w-1/6 h-36 ${baseShimmer}`} />
          <div className={`w-1/6 h-16 ${baseShimmer}`} />
          <div className={`w-1/6 h-32 ${baseShimmer}`} />
          <div className={`w-1/6 h-28 ${baseShimmer}`} />
          <div className={`w-1/6 h-40 ${baseShimmer}`} />
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={`rounded-full ${baseShimmer} ${className}`}
        style={{
          width: width || height || '40px',
          height: height || width || '40px'
        }}
      />
    );
  }

  return (
    <div
      className={`${baseShimmer} ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px'
      }}
    />
  );
};

export default PremiumSkeleton;
