import React from 'react';
import {
  MindNode,
  EdgeStyle,
  EdgeBorderStyle,
  EdgeDotShape,
  EdgeProfile,
} from '../../../../types/mindmap';
import { CollapsibleSection } from '../../../atoms/CollapsibleSection';
import { ColorPicker } from '../../../atoms/ColorPicker';
import { SliderInput } from '../../../atoms/SliderInput';
import { Switch } from '../../../atoms/Switch';
import { Network } from 'lucide-react';

export interface NodeEdgeSectionProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
}

export const NodeEdgeSection: React.FC<NodeEdgeSectionProps> = ({
  selectedNode,
  onUpdateNode,
  isOpen,
  onToggle,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  return (
    <CollapsibleSection
      title="Aristas y Propagación"
      subtitle="Estilo de línea hacia los hijos"
      isOpen={isOpen}
      onToggle={onToggle}
      icon={<Network className="w-3.5 h-3.5" />}
    >
      <div className="space-y-3">
        <span className="text-[11px] font-semibold text-slate-600 block">Forma de la Conexión</span>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            {
              id: 'bezier' as EdgeStyle,
              label: 'Curva',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 18 C10 18, 14 6, 20 6" />
                </svg>
              ),
            },
            {
              id: 'linear' as EdgeStyle,
              label: 'Recta',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="18" x2="20" y2="6" />
                </svg>
              ),
            },
            {
              id: 'sharp' as EdgeStyle,
              label: 'Escuadra',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4,18 4,6 20,6" />
                </svg>
              ),
            },
            {
              id: 'horizontal' as EdgeStyle,
              label: 'Horiz.',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 18 H12 V6 H20" />
                </svg>
              ),
            },
            {
              id: 'bracket' as EdgeStyle,
              label: 'Corchete',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12 H7 L10 6 L14 6 H21 M7 12 L10 18 L14 18 H21 M7 12 H21" />
                </svg>
              ),
            },
          ].map((opt) => {
            const isSelected = (selectedNode.edgeStyle || 'bezier') === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { edgeStyle: opt.id })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {opt.icon}
                <span className="text-[10px] mt-1 text-center truncate w-full">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Perfil de Grosor de la Rama (Uniforme, Cónica, Huso, Reloj) */}
        <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 block">Perfil de Grosor (Ribbon)</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'uniform' as EdgeProfile, label: 'Uniforme', desc: '═' },
              { id: 'tapered' as EdgeProfile, label: 'Cónica', desc: '◣' },
              { id: 'spindle' as EdgeProfile, label: 'Huso', desc: '◆' },
              { id: 'hourglass' as EdgeProfile, label: 'Reloj', desc: '⧖' },
            ].map((opt) => {
              const currentVal = selectedNode.edgeProfile || 'uniform';
              const isSelected = currentVal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { edgeProfile: opt.id })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.desc}</span>
                  <span className="text-[10px] mt-0.5 text-center truncate w-full">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estilo de Línea de la Arista */}
        <div className="pt-2 border-t border-slate-200/80 space-y-2">
          <span className="text-[11px] font-semibold text-slate-600 block">Estilo de Línea</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              {
                id: 'solid' as EdgeBorderStyle,
                label: 'Sólido',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                ),
              },
              {
                id: 'dashed' as EdgeBorderStyle,
                label: 'Guiones',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
                    <line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                ),
              },
              {
                id: 'dotted' as EdgeBorderStyle,
                label: 'Puntos',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="0.1 5" strokeLinecap="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                  </svg>
                ),
              },
              {
                id: 'double' as EdgeBorderStyle,
                label: 'Doble',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                  </svg>
                ),
              },
              {
                id: 'zigzag' as EdgeBorderStyle,
                label: 'Zigzag',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                    <path d="M3 12 L6 8 L10 16 L14 8 L18 16 L21 12" />
                  </svg>
                ),
              },
              {
                id: 'wavy' as EdgeBorderStyle,
                label: 'Ondulado',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 12 C6 7, 9 17, 12 12 C15 7, 18 17, 21 12" />
                  </svg>
                ),
              },
            ].map((styleItem) => {
              const currentStyle = selectedNode.edgeBorderStyle || selectedNode.edgeDash || 'solid';
              const isSelected = currentStyle === styleItem.id;
              return (
                <button
                  key={styleItem.id}
                  type="button"
                  onClick={() =>
                    onUpdateNode(selectedNode.id, {
                      edgeBorderStyle: styleItem.id,
                      edgeDash: styleItem.id,
                    })
                  }
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {styleItem.icon}
                  <span className="text-[10px] mt-1 text-center truncate w-full">{styleItem.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controles Dinámicos de Estilo de Línea para Aristas */}
          {(selectedNode.edgeBorderStyle === 'dashed' || selectedNode.edgeDash === 'dashed') && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
              <SliderInput
                label="Largo guión"
                value={selectedNode.edgeDashLength !== undefined ? selectedNode.edgeDashLength : 10}
                min={2}
                max={32}
                step={1}
                unit="px"
                badge={`${selectedNode.edgeDashLength !== undefined ? selectedNode.edgeDashLength : 10}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeDashLength: val })}
              />
              <SliderInput
                label="Espacio"
                value={selectedNode.edgeDashSpace !== undefined ? selectedNode.edgeDashSpace : 11}
                min={2}
                max={32}
                step={1}
                unit="px"
                badge={`${selectedNode.edgeDashSpace !== undefined ? selectedNode.edgeDashSpace : 11}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeDashSpace: val })}
              />
            </div>
          )}

          {(selectedNode.edgeBorderStyle === 'dotted' || selectedNode.edgeDash === 'dotted') && (
            <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                {[
                  { id: 'circle' as const, label: '● Esfera' },
                  { id: 'square' as const, label: '■ Cuadrado' },
                  { id: 'diamond' as const, label: '◆ Rombo' },
                ].map((dot) => {
                  const isDotSel = (selectedNode.edgeDotShape || 'circle') === dot.id;
                  return (
                    <button
                      key={dot.id}
                      type="button"
                      onClick={() => onUpdateNode(selectedNode.id, { edgeDotShape: dot.id })}
                      className={`flex-1 py-1 rounded-md text-center font-medium transition-all cursor-pointer ${
                        isDotSel
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {dot.label}
                    </button>
                  );
                })}
              </div>
              <SliderInput
                label="Separación"
                value={selectedNode.edgeDotSpacing !== undefined ? selectedNode.edgeDotSpacing : 9}
                min={4}
                max={32}
                step={1}
                unit="px"
                badge={`${selectedNode.edgeDotSpacing !== undefined ? selectedNode.edgeDotSpacing : 9}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeDotSpacing: val })}
              />
            </div>
          )}

          {(selectedNode.edgeBorderStyle === 'double' || selectedNode.edgeDash === 'double') && (
            <div className="pt-1 animate-in fade-in duration-150">
              <SliderInput
                label="Separación entre líneas"
                value={selectedNode.edgeBorderGap !== undefined ? selectedNode.edgeBorderGap : 4}
                min={2}
                max={16}
                step={1}
                unit="px"
                badge={`${selectedNode.edgeBorderGap !== undefined ? selectedNode.edgeBorderGap : 4}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeBorderGap: val })}
              />
            </div>
          )}

          {(selectedNode.edgeBorderStyle === 'zigzag' || selectedNode.edgeDash === 'zigzag') && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
              <SliderInput
                label="Altura picos"
                value={selectedNode.edgeZigzagHeight !== undefined ? selectedNode.edgeZigzagHeight : 9.5}
                min={2}
                max={20}
                step={0.5}
                unit="px"
                badge={`${selectedNode.edgeZigzagHeight !== undefined ? selectedNode.edgeZigzagHeight : 9.5}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeZigzagHeight: val })}
              />
              <SliderInput
                label="Frecuencia"
                value={selectedNode.edgeZigzagFreq !== undefined ? selectedNode.edgeZigzagFreq : 19}
                min={6}
                max={40}
                step={1}
                unit="px"
                badge={`${selectedNode.edgeZigzagFreq !== undefined ? selectedNode.edgeZigzagFreq : 19}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeZigzagFreq: val })}
              />
            </div>
          )}

          {(selectedNode.edgeBorderStyle === 'wavy' || selectedNode.edgeDash === 'wavy') && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
              <SliderInput
                label="Altura ondas"
                value={selectedNode.edgeWaveHeight !== undefined ? selectedNode.edgeWaveHeight : 10}
                min={2}
                max={20}
                step={0.5}
                unit="px"
                badge={`${selectedNode.edgeWaveHeight !== undefined ? selectedNode.edgeWaveHeight : 10}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeWaveHeight: val })}
              />
              <SliderInput
                label="Ancho onda"
                value={selectedNode.edgeWaveWidth !== undefined ? selectedNode.edgeWaveWidth : 36}
                min={8}
                max={50}
                step={1}
                unit="px"
                badge={`${selectedNode.edgeWaveWidth !== undefined ? selectedNode.edgeWaveWidth : 36}px`}
                onChange={(val) => onUpdateNode(selectedNode.id, { edgeWaveWidth: val })}
              />
            </div>
          )}
        </div>

        <ColorPicker
          label="Color de la Arista"
          value={selectedNode.edgeColor}
          onChange={(c) => onUpdateNode(selectedNode.id, { edgeColor: c })}
          onClear={() => onUpdateNode(selectedNode.id, { edgeColor: undefined })}
        />

        {/* Sombra de la Arista del Nodo */}
        <div className="pt-3 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Sombra de la Rama</span>
              <span className="text-[10px] text-slate-500 block">Relieve o resplandor de esta conexión</span>
            </div>
            <Switch
              checked={Boolean(selectedNode.edgeShadow)}
              onChange={(val) => onUpdateNode(selectedNode.id, { edgeShadow: val })}
            />
          </div>

          {selectedNode.edgeShadow && (
            <div className="space-y-3 pt-1">
              {/* 3 Presets Rápidos */}
              <div>
                <span className="text-[10px] font-medium text-slate-600 block mb-1.5">Presets Rápidos</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'soft' as const, label: 'Suave' },
                    { id: 'deep' as const, label: '3D' },
                    { id: 'glow' as const, label: 'Glow' },
                  ].map((preset) => {
                    const isCur = (selectedNode.edgeShadowPreset || 'soft') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          let blur = 4;
                          let offsetY = 2;
                          let color = 'rgba(0,0,0,0.20)';
                          if (preset.id === 'deep') {
                            blur = 8;
                            offsetY = 4;
                            color = 'rgba(0,0,0,0.35)';
                          } else if (preset.id === 'glow') {
                            blur = 6;
                            offsetY = 0;
                            color = selectedNode.edgeColor || '#3b82f6';
                          }
                          onUpdateNode(selectedNode.id, {
                            edgeShadowPreset: preset.id,
                            edgeShadowBlur: blur,
                            edgeShadowOffsetY: offsetY,
                            edgeShadowColor: color,
                          });
                        }}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                          isCur
                            ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider de Desenfoque */}
              <SliderInput
                label="Desenfoque (Blur)"
                value={
                  selectedNode.edgeShadowBlur ??
                  (selectedNode.edgeShadowPreset === 'deep'
                    ? 8
                    : selectedNode.edgeShadowPreset === 'glow'
                    ? 6
                    : 4)
                }
                min={1}
                max={20}
                unit="px"
                onChange={(blur) => onUpdateNode(selectedNode.id, { edgeShadowBlur: blur })}
              />

              {/* Slider de Desplazamiento Y */}
              <SliderInput
                label="Desplazamiento Vertical (Y)"
                value={
                  selectedNode.edgeShadowOffsetY ??
                  (selectedNode.edgeShadowPreset === 'deep'
                    ? 4
                    : selectedNode.edgeShadowPreset === 'glow'
                    ? 0
                    : 2)
                }
                min={0}
                max={16}
                unit="px"
                onChange={(y) => onUpdateNode(selectedNode.id, { edgeShadowOffsetY: y })}
              />

              {/* Selector de Color de Sombra */}
              <ColorPicker
                label="Color de Sombra / Resplandor"
                value={selectedNode.edgeShadowColor}
                onChange={(color) => onUpdateNode(selectedNode.id, { edgeShadowColor: color })}
                onClear={() => onUpdateNode(selectedNode.id, { edgeShadowColor: undefined })}
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200/80 space-y-2">
          <span className="text-[11px] font-semibold text-slate-700 block">Propagación de Estilo</span>
          <div className="grid grid-cols-2 gap-1.5">
            {onApplyStyleToChildren && (
              <button
                type="button"
                onClick={() => onApplyStyleToChildren(selectedNode.id)}
                className="py-1.5 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer text-center"
              >
                Aplicar a Hijos
              </button>
            )}
            {onApplyStyleToSiblings && (
              <button
                type="button"
                onClick={() => onApplyStyleToSiblings(selectedNode.id)}
                className="py-1.5 px-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition-colors cursor-pointer text-center"
              >
                Aplicar a Hermanos
              </button>
            )}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
