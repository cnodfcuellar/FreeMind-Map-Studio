import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  title?: string;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  title,
  className = '',
  id,
}) => {
  const isSm = size === 'sm';

  const trackWidth = isSm ? 'w-8 h-4.5' : 'w-10 h-5.5';
  const thumbSize = isSm ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const thumbTranslate = isSm ? 'translate-x-3.5' : 'translate-x-4.5';

  return (
    <div
      className={`flex items-center justify-between gap-2.5 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      title={title}
    >
      {(label || description) && (
        <div className="flex flex-col select-none pr-1">
          {label && (
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-1 dark:focus:ring-offset-slate-900 ${trackWidth} ${
          checked
            ? 'bg-emerald-500 dark:bg-emerald-600'
            : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400/80 dark:hover:bg-slate-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${thumbSize} ${
            checked ? thumbTranslate : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

