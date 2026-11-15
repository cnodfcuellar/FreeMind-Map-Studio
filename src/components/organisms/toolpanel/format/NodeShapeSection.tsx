import React from 'react';
import {
  MindNode,
  BubbleTailSide,
  ForkHooksSide,
  ForkCornerStyle,
} from '../../../../types/mindmap';
import { CollapsibleSection } from '../../../atoms/CollapsibleSection';
import { SliderInput } from '../../../atoms/SliderInput';
import { ShapeSelector } from '../../../molecules/ShapeSelector';
import { RectangleCornerControl } from '../../../molecules/RectangleCornerControl';
import { OvalQualitiesControl } from '../../../molecules/OvalQualitiesControl';
import { ArrowQualitiesControl } from '../../../molecules/ArrowQualitiesControl';
import {
  Square,
  MessageSquare,
  GitFork,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export interface NodeShapeSectionProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const NodeShapeSection: React.FC<NodeShapeSectionProps> = ({
  selectedNode,
  onUpdateNode,
  isOpen,
  onToggle,
}) => {
  const [showAdvancedTail, setShowAdvancedTail] = React.useState(false);
  const [showAdvancedFork, setShowAdvancedFork] = React.useState(false);

  return (
    <CollapsibleSection
      title="Forma y Geometría"
      subtitle="Geometría exterior y dimensiones"
      isOpen={isOpen}
      onToggle={onToggle}
      icon={<Square className="w-3.5 h-3.5" />}
      badge={
        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full capitalize">
          {selectedNode.shape || 'Burbuja'}
        </span>
      }
    >
      <ShapeSelector
        currentShape={selectedNode.shape}
        onSelectShape={(shape) => onUpdateNode(selectedNode.id, { shape })}
      />

      {/* Dimensiones personalizadas (Fila compacta W / H) */}
      <div className="pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10.5px] font-semibold text-slate-600">Dimensiones (Ancho / Alto):</span>
          {(selectedNode.customWidth || selectedNode.customHeight) ? (
            <button
              type="button"
              onClick={() => onUpdateNode(selectedNode.id, { customWidth: undefined, customHeight: undefined })}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Resetear a Auto
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">Automático al texto</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <span className="text-[10px] font-bold text-slate-400">W</span>
            <input
              type="number"
              min={0}
              max={600}
              step={10}
              placeholder="Auto"
              value={selectedNode.customWidth ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateNode(selectedNode.id, { customWidth: !isNaN(val) && val > 0 ? val : undefined });
              }}
              className="w-full text-xs font-semibold text-slate-700 bg-transparent outline-none"
            />
            <span className="text-[10px] text-slate-400">px</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <span className="text-[10px] font-bold text-slate-400">H</span>
            <input
              type="number"
              min={0}
              max={400}
              step={10}
              placeholder="Auto"
              value={selectedNode.customHeight ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateNode(selectedNode.id, { customHeight: !isNaN(val) && val > 0 ? val : undefined });
              }}
              className="w-full text-xs font-semibold text-slate-700 bg-transparent outline-none"
            />
            <span className="text-[10px] text-slate-400">px</span>
          </div>
        </div>
      </div>

      {/* Anatomía de la Colita (Bocadillo / Speech Bubble - Modo Moderno Compacto) */}
      {(selectedNode.shape || 'bubble') === 'bubble' && (
        <div className="pt-2.5 border-t border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Estilo de Bocadillo
            </span>
            <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              1 Clic
            </span>
          </div>

          {/* 3 Presets Rápidos en 1 Fila */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              {
                id: 'classic',
                label: '▲ Clásico',
                sub: 'Recta',
                isActive: (selectedNode.tailStyle || 'straight') === 'straight',
                apply: () => onUpdateNode(selectedNode.id, { tailLength: 12, tailWidth: 14, tailStyle: 'straight' }),
              },
              {
                id: 'curved',
                label: '~ Cómic',
                sub: 'Curva',
                isActive: selectedNode.tailStyle === 'curved',
                apply: () => onUpdateNode(selectedNode.id, { tailLength: 16, tailWidth: 18, tailStyle: 'curved' }),
              },
              {
                id: 'thought',
                label: '○ Pensar',
                sub: 'Nube',
                isActive: selectedNode.tailStyle === 'thought',
                apply: () => onUpdateNode(selectedNode.id, { tailLength: 16, tailWidth: 14, tailStyle: 'thought' }),
              },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={preset.apply}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  preset.isActive
                    ? 'border-blue-600 bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`text-[10.5px] font-bold ${preset.isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                  {preset.label}
                </div>
                <div className={`text-[9px] ${preset.isActive ? 'text-blue-600/80' : 'text-slate-400'}`}>
                  {preset.sub}
                </div>
              </button>
            ))}
          </div>

          {/* Orientación Cardinal */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-slate-600 block">
              Hacia dónde apunta:
            </span>
            <div className="grid grid-cols-5 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              {[
                { id: 'auto' as BubbleTailSide, label: 'Auto', icon: '🎯' },
                { id: 'bottom' as BubbleTailSide, label: 'Abajo', icon: '↓' },
                { id: 'top' as BubbleTailSide, label: 'Arriba', icon: '↑' },
                { id: 'left' as BubbleTailSide, label: 'Izq', icon: '←' },
                { id: 'right' as BubbleTailSide, label: 'Der', icon: '→' },
              ].map((sideOpt) => {
                const isSelected = (selectedNode.tailSide || 'auto') === sideOpt.id;
                return (
                  <button
                    key={sideOpt.id}
                    type="button"
                    title={sideOpt.label}
                    onClick={() => onUpdateNode(selectedNode.id, { tailSide: sideOpt.id })}
                    className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer text-[10px] font-semibold flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xs leading-none">{sideOpt.icon}</span>
                    <span className="text-[9px] mt-0.5">{sideOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ajustes Avanzados Plegables */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAdvancedTail(!showAdvancedTail)}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                {showAdvancedTail ? 'Ocultar ajustes milimétricos' : 'Ajustes milimétricos avanzados'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedTail ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedTail && (
              <div className="mt-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                <SliderInput
                  label="Longitud de punta"
                  value={selectedNode.tailLength !== undefined ? selectedNode.tailLength : 12}
                  min={0}
                  max={32}
                  step={2}
                  unit="px"
                  badge={`${selectedNode.tailLength !== undefined ? selectedNode.tailLength : 12}px`}
                  onChange={(val) => onUpdateNode(selectedNode.id, { tailLength: val })}
                  onReset={() => onUpdateNode(selectedNode.id, { tailLength: undefined })}
                />

                <SliderInput
                  label="Ancho de base"
                  value={selectedNode.tailWidth !== undefined ? selectedNode.tailWidth : 14}
                  min={6}
                  max={30}
                  step={2}
                  unit="px"
                  badge={`${selectedNode.tailWidth !== undefined ? selectedNode.tailWidth : 14}px`}
                  onChange={(w) => onUpdateNode(selectedNode.id, { tailWidth: w })}
                  onReset={() => onUpdateNode(selectedNode.id, { tailWidth: undefined })}
                />

                <SliderInput
                  label="Posición en el borde"
                  value={selectedNode.tailOffset !== undefined ? selectedNode.tailOffset : 50}
                  min={15}
                  max={85}
                  step={5}
                  unit="%"
                  badge={`${selectedNode.tailOffset !== undefined ? selectedNode.tailOffset : 50}%`}
                  onChange={(off) => onUpdateNode(selectedNode.id, { tailOffset: off })}
                  onReset={() => onUpdateNode(selectedNode.id, { tailOffset: undefined })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cualidades Anatómicas de Horquilla (Fork Shape - Modo Moderno Compacto) */}
      {selectedNode.shape === 'fork' && (
        <div className="pt-2.5 border-t border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-blue-600" />
              Anatomía de Horquilla
            </span>
            <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              1 Clic
            </span>
          </div>

          {/* 1. 3 Presets Rápidos en 1 Fila */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              {
                id: 'classic',
                label: '⊔ Clásica',
                sub: 'Recta 90°',
                isActive:
                  (!selectedNode.forkPreset && selectedNode.forkHooks !== 'none' && (selectedNode.forkCornerStyle || 'sharp') === 'sharp') ||
                  selectedNode.forkPreset === 'classic',
                apply: () =>
                  onUpdateNode(selectedNode.id, {
                    forkHooks: 'both',
                    forkHookHeight: 6,
                    forkCornerStyle: 'sharp',
                    forkPreset: 'classic',
                  }),
              },
              {
                id: 'organic',
                label: '╰ Orgánica',
                sub: 'Curva',
                isActive:
                  selectedNode.forkPreset === 'organic' ||
                  selectedNode.forkCornerStyle === 'rounded',
                apply: () =>
                  onUpdateNode(selectedNode.id, {
                    forkHooks: 'both',
                    forkHookHeight: 8,
                    forkCornerStyle: 'rounded',
                    forkPreset: 'organic',
                  }),
              },
              {
                id: 'flat',
                label: '─ Plana',
                sub: 'Sin ganchos',
                isActive:
                  selectedNode.forkPreset === 'flat' ||
                  selectedNode.forkHooks === 'none',
                apply: () =>
                  onUpdateNode(selectedNode.id, {
                    forkHooks: 'none',
                    forkHookHeight: 0,
                    forkPreset: 'flat',
                  }),
              },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={preset.apply}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  preset.isActive
                    ? 'border-blue-600 bg-blue-50/90 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className={`text-[10.5px] font-bold ${preset.isActive ? 'text-blue-700' : 'text-slate-700'}`}>
                  {preset.label}
                </div>
                <div className={`text-[9px] ${preset.isActive ? 'text-blue-600/80' : 'text-slate-400'}`}>
                  {preset.sub}
                </div>
              </button>
            ))}
          </div>

          {/* 2. Distribución de Ganchos Laterales */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-slate-600 block">
              Ganchos laterales:
            </span>
            <div className="grid grid-cols-4 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              {[
                { id: 'both' as ForkHooksSide, label: 'Ambos', icon: '⊔' },
                { id: 'parent' as ForkHooksSide, label: 'Padre', icon: '└' },
                { id: 'children' as ForkHooksSide, label: 'Hijos', icon: '┘' },
                { id: 'none' as ForkHooksSide, label: 'Ninguno', icon: '─' },
              ].map((hookOpt) => {
                const currentHooks = selectedNode.forkHooks || 'both';
                const isSelected = currentHooks === hookOpt.id;
                return (
                  <button
                    key={hookOpt.id}
                    type="button"
                    title={hookOpt.label}
                    onClick={() =>
                      onUpdateNode(selectedNode.id, {
                        forkHooks: hookOpt.id,
                        forkPreset: undefined,
                      })
                    }
                    className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer text-[10px] font-semibold flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-xs leading-none font-bold">{hookOpt.icon}</span>
                    <span className="text-[9px] mt-0.5">{hookOpt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Ajustes Avanzados Plegables */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAdvancedFork(!showAdvancedFork)}
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                {showAdvancedFork ? 'Ocultar ajustes milimétricos' : 'Ajustes milimétricos avanzados'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFork ? 'rotate-180' : ''}`} />
            </button>

            {showAdvancedFork && (
              <div className="mt-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                <SliderInput
                  label="Altura del gancho"
                  value={selectedNode.forkHookHeight !== undefined ? selectedNode.forkHookHeight : 6}
                  min={2}
                  max={24}
                  step={2}
                  unit="px"
                  badge={`${selectedNode.forkHookHeight !== undefined ? selectedNode.forkHookHeight : 6}px`}
                  onChange={(val) =>
                    onUpdateNode(selectedNode.id, {
                      forkHookHeight: val,
                      forkPreset: undefined,
                    })
                  }
                  onReset={() =>
                    onUpdateNode(selectedNode.id, {
                      forkHookHeight: undefined,
                      forkPreset: undefined,
                    })
                  }
                />

                {/* Forma de esquina / codo */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-600 block">
                    Forma de la esquina / codo:
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'sharp' as ForkCornerStyle, label: 'Recta 90°', icon: '└' },
                      { id: 'rounded' as ForkCornerStyle, label: 'Redonda', icon: '╰' },
                      { id: 'bevel' as ForkCornerStyle, label: '45° Bisel', icon: '⌞' },
                    ].map((cornerOpt) => {
                      const currentCorner = selectedNode.forkCornerStyle || 'sharp';
                      const isSelected = currentCorner === cornerOpt.id;
                      return (
                        <button
                          key={cornerOpt.id}
                          type="button"
                          onClick={() =>
                            onUpdateNode(selectedNode.id, {
                              forkCornerStyle: cornerOpt.id,
                              forkPreset: undefined,
                            })
                          }
                          className={`py-1 px-1 rounded-lg text-center transition-all cursor-pointer text-[10px] font-medium border flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-white text-blue-700 border-blue-500 font-bold shadow-2xs'
                              : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs">{cornerOpt.icon}</span>
                          <span>{cornerOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cualidades del Rectángulo y Cuadrado */}
      {(selectedNode.shape === 'rectangle' || selectedNode.shape === 'square') && (
        <RectangleCornerControl
          node={selectedNode}
          onUpdateNode={onUpdateNode}
        />
      )}

      {/* Cualidades del Óvalo / Elipse */}
      {selectedNode.shape === 'oval' && (
        <OvalQualitiesControl
          node={selectedNode}
          onUpdateNode={onUpdateNode}
        />
      )}

      {/* Cualidades de la Flecha */}
      {selectedNode.shape === 'arrow' && (
        <ArrowQualitiesControl
          node={selectedNode}
          onUpdateNode={onUpdateNode}
        />
      )}
    </CollapsibleSection>
  );
};
