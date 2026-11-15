import React, { useState } from 'react';
import { Circle, Sliders, ChevronDown } from 'lucide-react';
import { MindNode, OvalPreset, OvalRatio } from '../../types/mindmap';
import { resolveOvalConfig } from '../../utils/ovalShapeUtils';

export interface OvalQualitiesControlProps {
  node: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const OvalQualitiesControl: React.FC<OvalQualitiesControlProps> = ({
  node,
  onUpdateNode,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const config = resolveOvalConfig(node);

  const isHorizActive =
    config.rotation === 0 || node.ovalPreset === 'horizontal';
  const isTiltedActive =
    (config.rotation === 15 || node.ovalPreset === 'tilted') && !isHorizActive;
  const isVertActive =
    (config.rotation === 90 || node.ovalPreset === 'vertical') && !isHorizActive;

  const handleApplyPreset = (preset: OvalPreset) => {
    let rotation = 0;
    if (preset === 'tilted') rotation = 15;
    else if (preset === 'vertical') rotation = 90;

    onUpdateNode(node.id, {
      ovalRotation: rotation,
      ovalPreset: preset,
      ovalKeepTextHorizontal: true,
    });
  };

  const handleRotationChange = (newAngle: number) => {
    const clamped = Math.max(-180, Math.min(180, newAngle));
    onUpdateNode(node.id, {
      ovalRotation: clamped,
      ovalPreset: undefined,
    });
  };

  const handleToggleKeepTextHorizontal = () => {
    onUpdateNode(node.id, {
      ovalKeepTextHorizontal: !config.keepTextHorizontal,
    });
  };

  const handleSelectRatio = (ratio: OvalRatio) => {
    onUpdateNode(node.id, {
      ovalRatio: ratio,
    });
  };

  return (
    <div className="pt-2.5 border-t border-slate-200/80 space-y-2.5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Circle className="w-3.5 h-3.5 text-blue-600 scale-x-125" />
          Cualidades del Óvalo (Elipse)
        </span>
        <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
          1 Clic
        </span>
      </div>

      {/* 1. 3 Presets Rápidos de Orientación en 1 Fila */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          {
            id: 'horizontal' as OvalPreset,
            label: '⬭ Horiz.',
            sub: '0° clásico',
            isActive: isHorizActive,
          },
          {
            id: 'tilted' as OvalPreset,
            label: '⬭ Inclinado',
            sub: '15° dinámico',
            isActive: isTiltedActive,
          },
          {
            id: 'vertical' as OvalPreset,
            label: '⬯ Vertical',
            sub: '90° insignia',
            isActive: isVertActive,
          },
        ].map((preset) => (
          <button
            key={preset.id}
            type="button"
            data-testid={`preset-oval-${preset.id}`}
            onClick={() => handleApplyPreset(preset.id)}
            className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              preset.isActive
                ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/60 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div
              className={`text-[10.5px] font-bold ${
                preset.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {preset.label}
            </div>
            <div
              className={`text-[9px] ${
                preset.isActive ? 'text-blue-600/80 dark:text-blue-400' : 'text-slate-400'
              }`}
            >
              {preset.sub}
            </div>
          </button>
        ))}
      </div>

      {/* 2. Switch: Texto siempre horizontal (Protección de legibilidad) */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
        <div className="space-y-0.5">
          <div className="text-[10.5px] font-semibold text-slate-700 dark:text-slate-200">
            Texto siempre horizontal
          </div>
          <div className="text-[8.5px] text-slate-400 dark:text-slate-500 leading-tight">
            Mantiene el texto legible aunque la elipse gire
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.keepTextHorizontal}
          aria-label="Texto siempre horizontal"
          data-testid="toggle-keep-text-horizontal"
          onClick={handleToggleKeepTextHorizontal}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            config.keepTextHorizontal ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
          title={config.keepTextHorizontal ? 'Texto horizontal activo' : 'Texto gira con la elipse'}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              config.keepTextHorizontal ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Acordeón Plegable de Calibración Avanzada */}
      <div className="pt-0.5">
        <button
          type="button"
          data-testid="toggle-advanced-oval"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors text-left cursor-pointer"
        >
          <span className="text-[10.5px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Calibración de grados y esbeltez
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {isExpanded && (
          <div className="mt-2 p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-3 animate-fadeIn">
            {/* Slider y Stepper de Rotación / Ángulo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold text-slate-600">
                  Ángulo exacto:
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid="oval-angle-badge"
                    className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md"
                  >
                    {config.rotation}°
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRotationChange(0)}
                    className="text-[9.5px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    title="Restablecer a 0°"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="angle-decrement"
                  aria-label="Reducir ángulo (-5°)"
                  onClick={() => handleRotationChange(config.rotation - 5)}
                  className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Reducir ángulo (-5°)"
                >
                  −
                </button>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="1"
                  value={config.rotation}
                  aria-label="Ángulo de rotación de la elipse"
                  onChange={(e) => handleRotationChange(parseInt(e.target.value, 10))}
                  data-testid="oval-angle-slider"
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  type="button"
                  data-testid="angle-increment"
                  aria-label="Aumentar ángulo (+5°)"
                  onClick={() => handleRotationChange(config.rotation + 5)}
                  className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Aumentar ángulo (+5°)"
                >
                  +
                </button>
              </div>

              {/* Botones de Atajo Rápido de Ángulos */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[-45, -15, 15, 45].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => handleRotationChange(deg)}
                    className={`py-0.5 rounded border text-[9.5px] font-medium transition-all ${
                      config.rotation === deg
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {deg > 0 ? `+${deg}°` : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            {/* Proporción / Esbeltez del Óvalo */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 block">
                Esbeltez / Proporción:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                {[
                  { id: 'classic' as OvalRatio, label: 'Clásico', sub: '3:2' },
                  { id: 'slender' as OvalRatio, label: 'Esbelto', sub: '2:1' },
                  { id: 'capsule' as OvalRatio, label: 'Cápsula', sub: '3:1' },
                ].map((opt) => {
                  const isSelected = config.ratio === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`oval-ratio-${opt.id}`}
                      aria-pressed={isSelected}
                      onClick={() => handleSelectRatio(opt.id)}
                      className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-[10px] leading-tight">{opt.label}</span>
                      <span className="text-[8.5px] text-slate-400">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
