import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
  description?: string;
  badge?: string | number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
  onReset,
  description,
  badge,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[11px]">
            {badge ?? `${value}${unit}`}
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Restablecer valor"
              aria-label={`Restablecer ${label}`}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {description && <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{description}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={String(badge ?? `${value}${unit}`)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />
    </div>
  );
};
