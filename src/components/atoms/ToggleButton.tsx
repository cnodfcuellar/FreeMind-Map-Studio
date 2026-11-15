import React from 'react';

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  disabled?: boolean;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  active,
  onClick,
  icon,
  title,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      title={title || label}
      aria-label={title || label}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
        active
          ? 'bg-blue-600 text-white shadow-2xs font-semibold'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
