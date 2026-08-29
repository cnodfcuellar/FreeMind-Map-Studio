import React from 'react';

export interface ToggleOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

interface ToggleButtonGroupProps<T extends string | number> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function ToggleButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: ToggleButtonGroupProps<T>) {
  return (
    <div className={`flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs gap-0.5 ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            title={opt.title || opt.label}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-md transition-all cursor-pointer select-none ${
              size === 'sm' ? 'py-1 px-1.5 text-[10.5px]' : 'py-1.5 px-2 text-xs'
            } ${
              isSelected
                ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {opt.icon}
            {opt.label && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
