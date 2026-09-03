import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      iconLeft,
      iconRight,
      onClear,
      className = '',
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'py-1 text-xs',
      md: 'py-1.5 text-sm',
      lg: 'py-2.5 text-base',
    };

    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {iconLeft && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-400">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            value={value}
            disabled={disabled}
            className={`w-full rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700'
            } ${iconLeft ? 'pl-8' : 'pl-3'} ${
              iconRight || (onClear && hasValue) ? 'pr-8' : 'pr-3'
            } ${sizeClasses[size]} ${
              disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : ''
            } ${className}`}
            {...props}
          />
          {onClear && hasValue && !disabled ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : (
            iconRight && (
              <div className="absolute right-2.5 flex items-center pointer-events-none text-slate-400">
                {iconRight}
              </div>
            )
          )}
        </div>
        {error ? (
          <span className="text-[11px] text-rose-500 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
