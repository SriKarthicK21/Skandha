import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  iconRight?: LucideIcon | React.ComponentType<{ className?: string }>;
  onRightIconClick?: () => void;
  containerClassName?: string;
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(({
  label,
  helperText,
  error,
  icon: IconLeft,
  iconRight: IconRight,
  onRightIconClick,
  id,
  required,
  disabled,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const isComponent = typeof IconLeft === 'function';
  const LeftIconComp = isComponent ? (IconLeft as any) : null;

  return (
    <div className={`space-y-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
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

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full h-[50px] rounded-[11px] border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm transition-all duration-150 focus-visible:outline-hidden ${
            IconLeft ? 'pl-10' : 'pl-3.5'
          } ${IconRight ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 dark:border-rose-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : ''} ${className}`}
          {...props}
        />

        {IconRight && (
          <div
            onClick={onRightIconClick}
            className={`absolute inset-y-0 right-0 pr-3.5 flex items-center ${
              onRightIconClick ? 'cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200' : 'pointer-events-none text-slate-400'
            }`}
          >
            {typeof IconRight === 'function' ? <IconRight className="w-4 h-4" /> : IconRight}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-[11px] font-medium text-rose-500 dark:text-rose-400 tracking-tight">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-[11px] text-slate-500 dark:text-slate-400 tracking-tight">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

PremiumInput.displayName = 'PremiumInput';

export default PremiumInput;
