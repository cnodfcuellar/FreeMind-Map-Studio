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

export const EDUCATIONAL_COLOR_PRESETS = [
  // Fila 1: 8 Fondos de estudio (Pasteles limpios, diferenciables y legibles)
  '#ffffff', '#dbeafe', '#dcfce7', '#fef08a', '#ffedd5', '#fee2e2', '#f3e8ff', '#f1f5f9',
  // Fila 2: 8 Tintas y énfasis de aprendizaje (WCAG AAA alto contraste)
  '#0f172a', '#2563eb', '#16a34a', '#d97706', '#ea580c', '#dc2626', '#7c3aed', '#db2777'
];

const DEFAULT_PRESETS = EDUCATIONAL_COLOR_PRESETS;

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

  const getHexColor = (col: string) => {
    if (col.startsWith('#') && col.length === 7) return col;
    if (col.startsWith('#') && col.length === 4) {
      return `#${col[1]}${col[1]}${col[2]}${col[2]}${col[3]}${col[3]}`;
    }
    const match = col.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return defaultColor;
  };

  const inputColor = getHexColor(currentColor);

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-2xs">
            <input
              type="color"
              aria-label={label}
              value={inputColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
            />
            <span
              title={value || 'Auto'}
              className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase max-w-[55px] truncate"
            >
              {value ? (value.toLowerCase().startsWith('rgba') ? 'RGBA' : value) : 'Auto'}
            </span>
          </div>
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              title="Restablecer a automático"
              aria-label={`Restablecer ${label} a automático`}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline cursor-pointer"
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
              aria-label={`Seleccionar color ${color}`}
              style={{ backgroundColor: color }}
              className={`w-full aspect-square rounded-md border transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xs ${
                value?.toLowerCase() === color.toLowerCase()
                  ? 'border-blue-600 ring-2 ring-blue-400 ring-offset-1 z-1'
                  : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
