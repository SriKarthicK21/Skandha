import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon: Icon,
  iconPosition = 'left',
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-ink-2 select-none"
        >
          {label} {required && <span className="text-bad" aria-hidden="true">*</span>}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && iconPosition === 'left' && (
          <Icon className="w-4 h-4 text-ink-disabled absolute left-3.5 pointer-events-none shrink-0" aria-hidden="true" />
        )}

        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={`w-full h-10 sm:h-11 px-3.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-[#0F172A] border transition-colors outline-none text-ink placeholder:text-ink-disabled font-sans ${
            Icon && iconPosition === 'left' ? 'pl-10' : ''
          } ${Icon && iconPosition === 'right' ? 'pr-10' : ''} ${
            error
              ? 'border-bad focus:border-bad focus:ring-2 focus:ring-bad/15'
              : 'border-stroke-strong hover:border-ink-disabled focus:border-accent focus:ring-2 focus:ring-accent/15'
          } ${className}`}
          {...props}
        />

        {Icon && iconPosition === 'right' && (
          <Icon className="w-4 h-4 text-ink-disabled absolute right-3.5 pointer-events-none shrink-0" aria-hidden="true" />
        )}
      </div>

      {error ? (
        <p role="alert" className="text-[11px] text-bad font-medium leading-tight">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-ink-3 leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
