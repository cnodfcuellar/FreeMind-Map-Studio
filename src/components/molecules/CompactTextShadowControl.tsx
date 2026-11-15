import React from 'react';
import { Minus, Plus, RotateCcw, Sparkles } from 'lucide-react';
import { Switch } from '../atoms/Switch';
import { ColorPicker } from '../atoms/ColorPicker';

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

export const CompactTextShadowControl: React.FC<CompactTextShadowControlProps> = ({
  enabled = false,
  preset = 'soft',
  blur,
  color,
  applyToBody = false,
  onUpdate,
}) => {
  const defaultBlur = preset === 'glow' ? 8 : preset === 'deep' ? 6 : preset === 'medium' ? 4 : 3;
  const currentBlur = blur ?? defaultBlur;
  const isCustomBlur = blur !== undefined && blur !== defaultBlur;

  const handleDecreaseBlur = () => {
    const next = Math.max(1, currentBlur - 1);
    onUpdate({ textShadowBlur: next === defaultBlur ? undefined : next });
  };

  const handleIncreaseBlur = () => {
    const next = Math.min(16, currentBlur + 1);
    onUpdate({ textShadowBlur: next === defaultBlur ? undefined : next });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-xl p-2.5 space-y-2.5 shadow-2xs">
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

      {/* Fila 2: Ajustes si la sombra está activa */}
      {enabled && (
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Stepper Desenfoque (Blur) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-medium text-slate-600 dark:text-slate-400">Desenfoque:</span>
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

          {/* ColorPicker Oficial de Sombra (en línea, idéntico al resto de la app) */}
          <ColorPicker
            label="Color de Sombra"
            value={color}
            onChange={(c) => onUpdate({ textShadowColor: c })}
            onClear={() => onUpdate({ textShadowColor: undefined })}
          />
        </div>
      )}
    </div>
  );
};
