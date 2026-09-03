import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'surface' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  rounded?: 'md' | 'lg' | 'xl' | 'full';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  tooltip,
  variant = 'ghost',
  size = 'md',
  active = false,
  rounded = 'lg',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 p-1 text-xs',
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-8 h-8 p-1.5 text-sm',
    lg: 'w-10 h-10 p-2.5 text-base',
  };

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const variantClasses = {
    ghost: active
      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
      : 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    primary: active
      ? 'bg-blue-700 text-white shadow-sm'
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
    secondary: active
      ? 'bg-slate-200 text-slate-900 dark:bg-slate-700'
      : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300',
    danger: active
      ? 'bg-rose-700 text-white'
      : 'bg-transparent hover:bg-rose-50 active:bg-rose-100 text-slate-500 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400',
    surface: active
      ? 'bg-blue-50 border-blue-300 text-blue-600'
      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200',
    dark: active
      ? 'bg-slate-700 text-white border border-slate-600'
      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 shadow-md',
  };

  return (
    <button
      type="button"
      title={tooltip || label}
      aria-label={label || tooltip}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses[size]} ${roundedClasses[rounded]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
