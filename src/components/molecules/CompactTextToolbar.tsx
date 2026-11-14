import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  ChevronDown,
  RotateCcw,
  X,
} from 'lucide-react';

export interface CompactTextToolbarProps {
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  defaultFontSize?: number;
  minFontSize?: number;
  maxFontSize?: number;
  color?: string;
  defaultColor?: string;
  colorLabel?: string;
  presets?: string[];
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onChangeAlign: (align: 'left' | 'center' | 'right') => void;
  onChangeFontSize: (size: number | undefined) => void;
  onChangeColor: (color: string | undefined) => void;
}

const DEFAULT_PRESETS = [
  '#ffffff', '#f8fafc', '#eff6ff', '#f0fdf4', '#fefce8', '#fff7ed', '#faf5ff', '#ecfeff',
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#475569', '#0f172a'
];

export const CompactTextToolbar: React.FC<CompactTextToolbarProps> = ({
  bold,
  italic,
  align = 'left',
  fontSize,
  defaultFontSize = 14,
  minFontSize = 10,
  maxFontSize = 36,
  color,
  defaultColor = '#ffffff',
  colorLabel = 'Color',
  presets = DEFAULT_PRESETS,
  onToggleBold,
  onToggleItalic,
  onChangeAlign,
  onChangeFontSize,
  onChangeColor,
}) => {
  const [isColorOpen, setIsColorOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSize = fontSize || defaultFontSize;
  const isCustomSize = fontSize !== undefined && fontSize !== defaultFontSize;
  const currentColor = color || defaultColor;

  const handleDecreaseSize = () => {
    const next = Math.max(minFontSize, currentSize - 1);
    onChangeFontSize(next === defaultFontSize ? undefined : next);
  };

  const handleIncreaseSize = () => {
    const next = Math.min(maxFontSize, currentSize + 1);
    onChangeFontSize(next === defaultFontSize ? undefined : next);
  };

  const handleResetSize = () => {
    onChangeFontSize(undefined);
  };

  // Cerrar panel de color al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
    };
    if (isColorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorOpen]);

  return (
    <div ref={containerRef} className="space-y-1.5">
      {/* Barra de formato principal unificada en 1 fila */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* 1. Estilos: Negrita y Cursiva */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <button
            type="button"
            title="Negrita"
            aria-label="Negrita"
            aria-pressed={!!bold}
            onClick={onToggleBold}
            className={`p-1.5 transition-colors cursor-pointer ${
              bold
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Cursiva"
            aria-label="Cursiva"
            aria-pressed={!!italic}
            onClick={onToggleItalic}
            className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
              italic
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Alineación: Izquierda, Centro, Derecha */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <button
            type="button"
            title="Alinear a la izquierda"
            aria-label="Alinear a la izquierda"
            aria-pressed={align === 'left'}
            onClick={() => onChangeAlign('left')}
            className={`p-1.5 transition-colors cursor-pointer ${
              align === 'left'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Centrar"
            aria-label="Centrar"
            aria-pressed={align === 'center'}
            onClick={() => onChangeAlign('center')}
            className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
              align === 'center'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Alinear a la derecha"
            aria-label="Alinear a la derecha"
            aria-pressed={align === 'right'}
            onClick={() => onChangeAlign('right')}
            className={`p-1.5 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer ${
              align === 'right'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Stepper de Tamaño [- 16px +] */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
          <button
            type="button"
            title="Reducir tamaño"
            aria-label="Reducir tamaño"
            disabled={currentSize <= minFontSize}
            onClick={handleDecreaseSize}
            className="p-1 px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span
            title={isCustomSize ? `Tamaño personalizado: ${currentSize}px (por defecto: ${defaultFontSize}px)` : `Tamaño: ${currentSize}px`}
            className={`px-1.5 py-0.5 text-[11px] font-mono font-bold select-none text-center min-w-[34px] ${
              isCustomSize
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {currentSize}px
          </span>

          <button
            type="button"
            title="Aumentar tamaño"
            aria-label="Aumentar tamaño"
            disabled={currentSize >= maxFontSize}
            onClick={handleIncreaseSize}
            className="p-1 px-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </button>

          {isCustomSize && (
            <button
              type="button"
              title="Restablecer tamaño por defecto"
              aria-label="Restablecer tamaño por defecto"
              onClick={handleResetSize}
              className="p-1 pr-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-l border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* 4. Swatch de Color Compacto interactivo */}
        <div className="relative">
          <button
            type="button"
            title={`${colorLabel}: ${color ? color.toUpperCase() : 'Automático'} (clic para cambiar)`}
            aria-label={`${colorLabel}: ${color ? color.toUpperCase() : 'Automático'}`}
            onClick={() => setIsColorOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all cursor-pointer shadow-2xs ${
              isColorOpen
                ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50 bg-blue-50/50 dark:bg-slate-750'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {/* Círculo de color actual */}
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0"
              style={{ backgroundColor: color || defaultColor }}
            />
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-700 dark:text-slate-300 max-w-[50px] truncate">
              {color ? color : 'Auto'}
            </span>
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform ${
                isColorOpen ? 'rotate-180 text-blue-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Panel Desplegable de Color (Popover integrado) */}
      {isColorOpen && (
        <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md space-y-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-700/80">
            <span className="font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
              {colorLabel}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Input nativo de color */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                <input
                  type="color"
                  value={
                    currentColor.startsWith('#') && currentColor.length === 7
                      ? currentColor
                      : defaultColor.startsWith('#')
                      ? defaultColor
                      : '#ffffff'
                  }
                  onChange={(e) => onChangeColor(e.target.value)}
                  className="w-3.5 h-3.5 rounded border-0 cursor-pointer p-0 bg-transparent"
                  title="Color personalizado exacto"
                />
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase">
                  {color ? color : 'Auto'}
                </span>
              </div>

              {color && (
                <button
                  type="button"
                  onClick={() => onChangeColor(undefined)}
                  title="Restablecer color automático"
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsColorOpen(false)}
                title="Cerrar paleta"
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grid de 16 colores presets compactos */}
          <div className="grid grid-cols-8 gap-1 pt-0.5">
            {presets.map((presetColor, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChangeColor(presetColor);
                }}
                title={presetColor}
                style={{ backgroundColor: presetColor }}
                className={`w-full aspect-square rounded-md border transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xs ${
                  color?.toLowerCase() === presetColor.toLowerCase()
                    ? 'border-blue-600 ring-2 ring-blue-400 ring-offset-1 z-1'
                    : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
