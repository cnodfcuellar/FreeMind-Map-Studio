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
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
            {badge ?? `${value}${unit}`}
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Restablecer valor"
              className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {description && <p className="text-[10px] text-slate-400 leading-tight">{description}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
      />
    </div>
  );
};
