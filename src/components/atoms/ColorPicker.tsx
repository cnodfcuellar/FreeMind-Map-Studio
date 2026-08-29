import React from 'react';

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (color: string) => void;
  onClear?: () => void;
  defaultColor?: string;
  presets?: string[];
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  '#ffffff', '#f8fafc', '#eff6ff', '#f0fdf4', '#fefce8', '#fff7ed', '#faf5ff', '#ecfeff',
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#475569', '#0f172a'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  onClear,
  defaultColor = '#ffffff',
  presets = DEFAULT_PRESETS,
  disabled = false,
}) => {
  const currentColor = value || defaultColor;

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
            <input
              type="color"
              value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : defaultColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 rounded border-0 cursor-pointer p-0 bg-transparent"
            />
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {value ? value : 'Auto'}
            </span>
          </div>
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              title="Restablecer a automático"
              className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div className="grid grid-cols-8 gap-1 pt-0.5">
          {presets.map((color, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(color)}
              title={color}
              style={{ backgroundColor: color }}
              className={`w-full aspect-square rounded-md border transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xs ${
                value?.toLowerCase() === color.toLowerCase()
                  ? 'border-blue-600 ring-2 ring-blue-400 ring-offset-1 z-1'
                  : 'border-slate-200/80 hover:border-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
