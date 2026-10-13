import React, { forwardRef } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

export interface PremiumSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: PremiumSelectOption[];
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  containerClassName?: string;
}

export const PremiumSelect = forwardRef<HTMLSelectElement, PremiumSelectProps>(({
  label,
  helperText,
  error,
  options = [],
  icon: IconLeft,
  children,
  id,
  required,
  disabled,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const LeftIconComp = typeof IconLeft === 'function' ? (IconLeft as any) : null;

  return (
    <div className={`space-y-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-tight"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative rounded-[11px] transition-all duration-150 group">
        {IconLeft && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors">
            {LeftIconComp ? <LeftIconComp className="w-4 h-4" /> : React.isValidElement(IconLeft) ? IconLeft : null}
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`w-full h-[50px] appearance-none rounded-[11px] border bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm transition-all duration-150 focus-visible:outline-hidden pr-10 ${
            IconLeft ? 'pl-10' : 'pl-3.5'
          } ${
            error
              ? 'border-rose-400 dark:border-rose-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : 'cursor-pointer'} ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-[11px] font-medium text-rose-500 dark:text-rose-400 tracking-tight">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="text-[11px] text-slate-500 dark:text-slate-400 tracking-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

PremiumSelect.displayName = 'PremiumSelect';
export default PremiumSelect;
