import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus, RotateCcw, ChevronDown, X, Sparkles } from 'lucide-react';
import { Switch } from '../atoms/Switch';

export interface CompactTextShadowControlProps {
  enabled?: boolean;
  preset?: 'soft' | 'medium' | 'deep' | 'glow';
  blur?: number;
  color?: string;
  applyToBody?: boolean;
  onUpdate: (updates: {
    textShadow?: boolean;
    textShadowPreset?: 'soft' | 'medium' | 'deep' | 'glow';
    textShadowBlur?: number;
    textShadowColor?: string;
    applyTextShadowToBody?: boolean;
  }) => void;
}

const SHADOW_COLOR_PRESETS = [
  'rgba(0,0,0,0.75)',
  'rgba(0,0,0,0.50)',
  'rgba(0,0,0,0.25)',
  '#0f172a',
  '#1e293b',
  '#2563eb',
  '#0284c7',
  '#38bdf8',
  '#059669',
  '#10b981',
  '#d97706',
  '#f59e0b',
  '#dc2626',
  '#ef4444',
  '#7c3aed',
  '#a855f7',
];

export const CompactTextShadowControl: React.FC<CompactTextShadowControlProps> = ({
  enabled = false,
  preset = 'soft',
  blur,
  color,
  applyToBody = false,
  onUpdate,
}) => {
  const [isColorOpen, setIsColorOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultBlur = preset === 'glow' ? 8 : preset === 'deep' ? 6 : preset === 'medium' ? 4 : 3;
  const currentBlur = blur ?? defaultBlur;
  const isCustomBlur = blur !== undefined && blur !== defaultBlur;

  const defaultColor = preset === 'glow' ? '#38bdf8' : 'rgba(0,0,0,0.65)';
  const currentColor = color || defaultColor;

  const handleDecreaseBlur = () => {
    const next = Math.max(1, currentBlur - 1);
    onUpdate({ textShadowBlur: next === defaultBlur ? undefined : next });
  };

  const handleIncreaseBlur = () => {
    const next = Math.min(16, currentBlur + 1);
    onUpdate({ textShadowBlur: next === defaultBlur ? undefined : next });
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
    <div
      ref={containerRef}
      className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-xl p-2 space-y-2 shadow-2xs"
    >
      {/* Fila 1: Título y Segmented Control de 4 estados */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
            Sombra
          </span>
          {enabled && (
            <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.2 rounded-full">
              ON
            </span>
          )}
        </div>

        {/* Segmented Control [ Off | Suave | Media | Glow ] */}
        <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          {[
            { id: 'off', label: 'Off' },
            { id: 'soft', label: 'Suave' },
            { id: 'medium', label: 'Media' },
            { id: 'glow', label: 'Glow' },
          ].map((item) => {
            const isActive = item.id === 'off' ? !enabled : enabled && preset === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'off') {
                    onUpdate({ textShadow: false });
                  } else {
                    onUpdate({
                      textShadow: true,
                      textShadowPreset: item.id as any,
                    });
                  }
                }}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fila 2: Ajustes compactos si la sombra está activa */}
      {enabled && (
        <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            {/* Color de la sombra compacto */}
            <div className="relative">
              <button
                type="button"
                title={`Color de sombra: ${currentColor} (clic para cambiar)`}
                aria-label={`Color de sombra: ${currentColor}`}
                onClick={() => setIsColorOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                  isColorOpen
                    ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/50 bg-blue-50/50 dark:bg-slate-750'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs shrink-0"
                  style={{ backgroundColor: currentColor }}
                />
                <span className="text-[9.5px] font-mono text-slate-700 dark:text-slate-300 max-w-[55px] truncate">
                  {color ? 'Color' : 'Auto'}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isColorOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Stepper Desenfoque (Blur) */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-2xs text-xs">
              <button
                type="button"
                title="Reducir desenfoque"
                disabled={currentBlur <= 1}
                onClick={handleDecreaseBlur}
                className="p-1 px-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span
                title={isCustomBlur ? `Blur: ${currentBlur}px (por defecto: ${defaultBlur}px)` : `Blur: ${currentBlur}px`}
                className={`px-1 text-[10px] font-mono font-bold select-none min-w-[28px] text-center ${
                  isCustomBlur ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {currentBlur}px
              </span>
              <button
                type="button"
                title="Aumentar desenfoque"
                disabled={currentBlur >= 16}
                onClick={handleIncreaseBlur}
                className="p-1 px-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
              {isCustomBlur && (
                <button
                  type="button"
                  title="Restablecer desenfoque sugerido"
                  onClick={() => onUpdate({ textShadowBlur: undefined })}
                  className="p-0.5 px-1 text-slate-400 hover:text-blue-600 border-l border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Switch secundario en cuerpo */}
            <div className="flex items-center gap-1.5">
              <Switch
                size="sm"
                label={<span className="text-[10px] font-medium text-slate-700 dark:text-slate-300">En cuerpo</span>}
                checked={applyToBody}
                onChange={(checked) => onUpdate({ applyTextShadowToBody: checked })}
              />
            </div>
          </div>

          {/* Panel Desplegable de Color de Sombra */}
          {isColorOpen && (
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200 text-[10.5px]">
                  Color de Sombra
                </span>
                <div className="flex items-center gap-1.5">
                  {color && (
                    <button
                      type="button"
                      onClick={() => onUpdate({ textShadowColor: undefined })}
                      title="Restablecer color automático de sombra"
                      className="text-[9.5px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsColorOpen(false)}
                    title="Cerrar paleta"
                    className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Grid de presets para sombra */}
              <div className="grid grid-cols-8 gap-1 pt-0.5">
                {SHADOW_COLOR_PRESETS.map((presetColor, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdate({ textShadowColor: presetColor })}
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
      )}
    </div>
  );
};
