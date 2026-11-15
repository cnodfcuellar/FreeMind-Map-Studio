import React, { useState } from 'react';
import { Square, Sliders, ChevronDown, Check } from 'lucide-react';
import { MindNode, RectangleCornerStyle, RectanglePreset } from '../../types/mindmap';
import { resolveRectangleCorners } from '../../utils/rectangleCornerUtils';

export interface RectangleCornerControlProps {
  node: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const RectangleCornerControl: React.FC<RectangleCornerControlProps> = ({
  node,
  onUpdateNode,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const config = resolveRectangleCorners(node);
  const shapeName = node.shape === 'square' ? 'Cuadrado' : 'Rectángulo';
  const isRotated45 = Boolean(node.squareRotation && Math.abs(node.squareRotation) === 45);

  const handleSelectSquareRotation = (deg: 0 | 45) => {
    onUpdateNode(node.id, {
      squareRotation: deg,
      squareKeepTextHorizontal: true,
    });
  };

  const isSharpActive = config.style === 'sharp' || config.radius === 0;
  const isRoundedActive = config.style === 'rounded' && config.radius > 0;
  const isBevelActive = config.style === 'bevel' && config.radius > 0;
  const isConcaveActive = config.style === 'concave' && config.radius > 0;

  const allCornersActive =
    config.topLeft && config.topRight && config.bottomRight && config.bottomLeft;

  const handleSelectCornerType = (style: RectangleCornerStyle) => {
    if (style === 'sharp') {
      onUpdateNode(node.id, {
        rectCornerStyle: 'sharp',
        rectRadius: 0,
        rectPreset: 'sharp',
      });
      return;
    }

    let targetRadius = config.radius;
    if (targetRadius === 0) {
      if (style === 'rounded') targetRadius = 8;
      else if (style === 'bevel') targetRadius = 6;
      else if (style === 'concave') targetRadius = 10;
    }

    const preset: RectanglePreset | undefined =
      style === 'rounded' ? 'smooth' : style === 'bevel' ? 'bevel' : undefined;

    onUpdateNode(node.id, {
      rectCornerStyle: style,
      rectRadius: targetRadius,
      rectPreset: preset,
    });
  };

  const handleRadiusChange = (newRadius: number) => {
    const clamped = Math.max(0, Math.min(32, newRadius));
    onUpdateNode(node.id, {
      rectRadius: clamped,
      rectPreset: undefined,
    });
  };

  const handleToggleCorner = (
    cornerKey:
      | 'rectCornerTopLeft'
      | 'rectCornerTopRight'
      | 'rectCornerBottomRight'
      | 'rectCornerBottomLeft',
    currentValue: boolean
  ) => {
    onUpdateNode(node.id, {
      [cornerKey]: !currentValue,
      rectPreset: undefined,
    });
  };

  const handleResetCorners = () => {
    onUpdateNode(node.id, {
      rectCornerTopLeft: true,
      rectCornerTopRight: true,
      rectCornerBottomRight: true,
      rectCornerBottomLeft: true,
      rectPreset: undefined,
    });
  };

  const CORNER_OPTIONS = [
    {
      id: 'sharp' as RectangleCornerStyle,
      label: 'Recta',
      sub: '0px',
      icon: '▢',
      isActive: isSharpActive,
    },
    {
      id: 'rounded' as RectangleCornerStyle,
      label: 'Redonda',
      sub: `${isRoundedActive ? config.radius : 8}px`,
      icon: '▢',
      isActive: isRoundedActive,
    },
    {
      id: 'bevel' as RectangleCornerStyle,
      label: 'Bisel',
      sub: `${isBevelActive ? config.radius : 6}px`,
      icon: '⬡',
      isActive: isBevelActive,
    },
    {
      id: 'concave' as RectangleCornerStyle,
      label: 'Cóncava',
      sub: `${isConcaveActive ? config.radius : 10}px`,
      icon: '▢',
      isActive: isConcaveActive,
    },
  ];

  return (
    <div className="pt-2.5 border-t border-slate-200/80 space-y-2.5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <Square className="w-3.5 h-3.5 text-blue-600" />
          Cualidades del {shapeName}
        </span>
        <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
          1 Clic
        </span>
      </div>

      {/* 1. Selector de Orientación de 1 Clic (Solo para Cuadrado, sin vista previa) */}
      {node.shape === 'square' && (
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            data-testid="preset-square-0"
            onClick={() => handleSelectSquareRotation(0)}
            className={`py-1.5 px-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
              !isRotated45
                ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/60 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">▢</span>
            <div>
              <div
                className={`text-[10.5px] font-bold ${
                  !isRotated45 ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Cuadrado
              </div>
              <div
                className={`text-[8.5px] ${
                  !isRotated45 ? 'text-blue-600/80 dark:text-blue-400 font-medium' : 'text-slate-400'
                }`}
              >
                0° estándar
              </div>
            </div>
          </button>

          <button
            type="button"
            data-testid="preset-square-45"
            onClick={() => handleSelectSquareRotation(45)}
            className={`py-1.5 px-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
              isRotated45
                ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/60 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">◇</span>
            <div>
              <div
                className={`text-[10.5px] font-bold ${
                  isRotated45 ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                Rombo
              </div>
              <div
                className={`text-[8.5px] ${
                  isRotated45 ? 'text-blue-600/80 dark:text-blue-400 font-medium' : 'text-slate-400'
                }`}
              >
                45° decisión
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Fila Única Unificada: 4 Tipos de Esquina de 1 Clic (Sin repetición) */}
      <div className="grid grid-cols-4 gap-1.5">
        {CORNER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            data-testid={`corner-style-${opt.id}`}
            onClick={() => handleSelectCornerType(opt.id)}
            className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              opt.isActive
                ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/60 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div
              className={`text-[10px] font-bold flex items-center gap-0.5 ${
                opt.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="text-[11px] leading-none">{opt.icon}</span>
              <span>{opt.label}</span>
            </div>
            <div
              className={`text-[8.5px] mt-0.5 ${
                opt.isActive ? 'text-blue-600/80 dark:text-blue-400 font-medium' : 'text-slate-400'
              }`}
            >
              {opt.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Acordeón Plegable de Calibración Avanzada */}
      <div className="pt-0.5">
        <button
          type="button"
          data-testid="toggle-advanced-calibration"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors text-left cursor-pointer"
        >
          <span className="text-[10.5px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Calibración de radio y asimetría
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {isExpanded && (
          <div className="mt-2 p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-3 animate-fadeIn">
            {/* Slider y Stepper de Radio / Bisel */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold text-slate-600">
                  Radio / Bisel:
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    data-testid="radius-badge"
                    className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md"
                  >
                    {config.radius}px
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRadiusChange(8)}
                    className="text-[9.5px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                    title="Restablecer a 8px"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="radius-decrement"
                  aria-label="Reducir radio (-2px)"
                  onClick={() => handleRadiusChange(config.radius - 2)}
                  className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Reducir radio (-2px)"
                >
                  −
                </button>
                <input
                  type="range"
                  min="0"
                  max="32"
                  step="1"
                  value={config.radius}
                  aria-label="Radio de curvatura de esquinas"
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10))}
                  data-testid="radius-slider"
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button
                  type="button"
                  data-testid="radius-increment"
                  aria-label="Aumentar radio (+2px)"
                  onClick={() => handleRadiusChange(config.radius + 2)}
                  className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Aumentar radio (+2px)"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cuadrante 2x2 de Esquinas Activas (Asimetría estilo Figma) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-semibold text-slate-600">
                  Esquinas activas (asimetría):
                </span>
                {!allCornersActive && (
                  <button
                    type="button"
                    data-testid="reset-corners-btn"
                    onClick={handleResetCorners}
                    className="text-[9.5px] text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
                  >
                    Activar todas (4)
                  </button>
                )}
              </div>

              {/* Matriz 2x2 que refleja físicamente la orientación de las esquinas */}
              <div className="grid grid-cols-2 gap-1.5 bg-white dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                {/* Superior Izquierda */}
                <button
                  type="button"
                  data-testid="toggle-corner-tl"
                  aria-pressed={config.topLeft}
                  aria-label="Esquina Superior Izquierda"
                  onClick={() => handleToggleCorner('rectCornerTopLeft', config.topLeft)}
                  className={`py-1.5 px-2 rounded-md border text-center transition-all cursor-pointer flex items-center justify-between text-[10px] font-medium ${
                    config.topLeft
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold text-xs">⌜ Sup-Izq</span>
                  {config.topLeft ? (
                    <Check className="w-3 h-3 text-blue-600 stroke-[2.5]" />
                  ) : (
                    <span className="text-[9px] text-slate-400">90°</span>
                  )}
                </button>

                {/* Superior Derecha */}
                <button
                  type="button"
                  data-testid="toggle-corner-tr"
                  aria-pressed={config.topRight}
                  aria-label="Esquina Superior Derecha"
                  onClick={() => handleToggleCorner('rectCornerTopRight', config.topRight)}
                  className={`py-1.5 px-2 rounded-md border text-center transition-all cursor-pointer flex items-center justify-between text-[10px] font-medium ${
                    config.topRight
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold text-xs">⌝ Sup-Der</span>
                  {config.topRight ? (
                    <Check className="w-3 h-3 text-blue-600 stroke-[2.5]" />
                  ) : (
                    <span className="text-[9px] text-slate-400">90°</span>
                  )}
                </button>

                {/* Inferior Izquierda */}
                <button
                  type="button"
                  data-testid="toggle-corner-bl"
                  aria-pressed={config.bottomLeft}
                  aria-label="Esquina Inferior Izquierda"
                  onClick={() => handleToggleCorner('rectCornerBottomLeft', config.bottomLeft)}
                  className={`py-1.5 px-2 rounded-md border text-center transition-all cursor-pointer flex items-center justify-between text-[10px] font-medium ${
                    config.bottomLeft
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold text-xs">⌞ Inf-Izq</span>
                  {config.bottomLeft ? (
                    <Check className="w-3 h-3 text-blue-600 stroke-[2.5]" />
                  ) : (
                    <span className="text-[9px] text-slate-400">90°</span>
                  )}
                </button>

                {/* Inferior Derecha */}
                <button
                  type="button"
                  data-testid="toggle-corner-br"
                  aria-pressed={config.bottomRight}
                  aria-label="Esquina Inferior Derecha"
                  onClick={() => handleToggleCorner('rectCornerBottomRight', config.bottomRight)}
                  className={`py-1.5 px-2 rounded-md border text-center transition-all cursor-pointer flex items-center justify-between text-[10px] font-medium ${
                    config.bottomRight
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold text-xs">⌟ Inf-Der</span>
                  {config.bottomRight ? (
                    <Check className="w-3 h-3 text-blue-600 stroke-[2.5]" />
                  ) : (
                    <span className="text-[9px] text-slate-400">90°</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
