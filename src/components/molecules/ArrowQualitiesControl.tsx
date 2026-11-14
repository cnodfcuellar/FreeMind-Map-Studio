import React, { useState } from 'react';
import { ArrowRight, Sliders, ChevronDown } from 'lucide-react';
import { MindNode, ArrowDirection, ArrowTailStyle } from '../../types/mindmap';
import {
  resolveArrowConfig,
  DEFAULT_ARROW_TIP_RATIO,
} from '../../utils/arrowShapeUtils';

export interface ArrowQualitiesControlProps {
  node: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const ArrowQualitiesControl: React.FC<ArrowQualitiesControlProps> = ({
  node,
  onUpdateNode,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const config = resolveArrowConfig(node);

  const DIRECTION_OPTIONS: Array<{
    id: ArrowDirection;
    label: string;
    sub: string;
    icon: string;
  }> = [
    { id: 'right', label: 'Derecha', sub: '→ flujo', icon: '→' },
    { id: 'left', label: 'Izq.', sub: '← retorno', icon: '←' },
    { id: 'up', label: 'Arriba', sub: '↑ ascenso', icon: '↑' },
    { id: 'down', label: 'Abajo', sub: '↓ jerarquía', icon: '↓' },
  ];

  const handleSelectDirection = (dir: ArrowDirection) => {
    onUpdateNode(node.id, {
      arrowDirection: dir,
      arrowAutoOrient: false, // Explicit selection overrides auto-orient
    });
  };

  const handleToggleAutoOrient = () => {
    onUpdateNode(node.id, {
      arrowAutoOrient: !config.autoOrient,
    });
  };

  const handleSelectTailStyle = (style: ArrowTailStyle, bidi: boolean) => {
    onUpdateNode(node.id, {
      arrowTailStyle: style,
      arrowBidirectional: bidi,
    });
  };

  const handleTipRatioChange = (newRatioPercent: number) => {
    const clamped = Math.max(15, Math.min(50, newRatioPercent)) / 100;
    onUpdateNode(node.id, {
      arrowTipRatio: clamped,
    });
  };

  const handleResetTipRatio = () => {
    onUpdateNode(node.id, {
      arrowTipRatio: DEFAULT_ARROW_TIP_RATIO,
    });
  };

  return (
    <div className="pt-2.5 border-t border-slate-200/80 space-y-2.5">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          Cualidades de la Flecha
        </span>
        <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
          1 Clic
        </span>
      </div>

      {/* 1. Fila de 4 Direcciones Rápidas de 1 Clic */}
      <div className="grid grid-cols-4 gap-1.5">
        {DIRECTION_OPTIONS.map((opt) => {
          const isActive = config.autoOrient
            ? config.effectiveDirection === opt.id
            : config.direction === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              data-testid={`preset-arrow-${opt.id}`}
              onClick={() => handleSelectDirection(opt.id)}
              className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isActive
                  ? 'border-blue-600 bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div
                className={`text-[11px] font-bold flex items-center gap-0.5 ${
                  isActive ? 'text-blue-700' : 'text-slate-700'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </div>
              <div
                className={`text-[8.5px] mt-0.5 ${
                  isActive ? 'text-blue-600/80 font-medium' : 'text-slate-400'
                }`}
              >
                {opt.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Switch Inteligente: Auto-orientación según rama */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex flex-col pr-2">
          <span className="text-[10px] font-bold text-slate-700">
            Auto-orientación según rama
          </span>
          <span className="text-[8.5px] text-slate-400">
            Apunta a la izquierda si el nodo está en rama izquierda
          </span>
        </div>
        <button
          type="button"
          data-testid="toggle-arrow-auto-orient"
          onClick={handleToggleAutoOrient}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.autoOrient ? 'bg-emerald-600' : 'bg-slate-200'
          }`}
          aria-label="Alternar auto-orientación según rama"
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              config.autoOrient ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3. Acordeón Plegable de Calibración Anatómica */}
      <div className="pt-0.5">
        <button
          type="button"
          data-testid="toggle-arrow-calibration"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors text-left cursor-pointer"
        >
          <span className="text-[10.5px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Calibración de punta, cola y doble punta
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {isExpanded && (
          <div className="mt-2 p-2.5 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-3 animate-fadeIn">
            {/* Estilo de Cola / Modo */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-600">
                Estilo de cola trasera:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  data-testid="tail-style-notch"
                  onClick={() => handleSelectTailStyle('notch', false)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer text-[9.5px] font-bold ${
                    !config.isBidirectional && config.tailStyle === 'notch'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  ❮ Con muesca
                </button>
                <button
                  type="button"
                  data-testid="tail-style-flat"
                  onClick={() => handleSelectTailStyle('flat', false)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer text-[9.5px] font-bold ${
                    !config.isBidirectional && config.tailStyle === 'flat'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  | Plana (Señal)
                </button>
                <button
                  type="button"
                  data-testid="tail-style-bidirectional"
                  onClick={() => handleSelectTailStyle('notch', true)}
                  className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer text-[9.5px] font-bold ${
                    config.isBidirectional
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  ↔ Doble punta
                </button>
              </div>
            </div>

            {/* Slider de Proporción de Punta */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-600">
                  Proporción de punta:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded">
                    {Math.round(config.tipRatio * 100)}%
                  </span>
                  <button
                    type="button"
                    data-testid="btn-reset-arrow-tip"
                    onClick={handleResetTipRatio}
                    className="text-[9px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Restablecer
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                data-testid="slider-arrow-tip-ratio"
                value={Math.round(config.tipRatio * 100)}
                onChange={(e) => handleTipRatioChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
