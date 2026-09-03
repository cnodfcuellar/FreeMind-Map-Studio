import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'surface';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1 rounded',
    sm: 'px-2.5 py-1 text-xs font-medium gap-1.5 rounded-lg',
    md: 'px-3.5 py-1.5 text-sm font-medium gap-2 rounded-xl',
    lg: 'px-4 py-2 text-base font-semibold gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-500/20 border border-blue-500/30',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 border border-rose-500/30',
    outline:
      'bg-transparent border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:hover:bg-slate-800 dark:text-slate-200',
    surface:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800',
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};
