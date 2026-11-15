import React from 'react';
import { MindNode } from '../../../../types/mindmap';
import { CollapsibleSection } from '../../../atoms/CollapsibleSection';
import { ColorPicker } from '../../../atoms/ColorPicker';
import { SliderInput } from '../../../atoms/SliderInput';
import { Switch } from '../../../atoms/Switch';
import { Sparkles } from 'lucide-react';

export interface NodeBorderSectionProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const NodeBorderSection: React.FC<NodeBorderSectionProps> = ({
  selectedNode,
  onUpdateNode,
  isOpen,
  onToggle,
}) => {
  return (
    <CollapsibleSection
      title="Bordes y Contorno"
      subtitle="Grosor, color y estilo de línea"
      isOpen={isOpen}
      onToggle={onToggle}
      icon={<Sparkles className="w-3.5 h-3.5" />}
      badge={
        selectedNode.borderColor ? (
          <span
            className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs inline-block"
            style={{ backgroundColor: selectedNode.borderColor }}
            title={`Borde: ${selectedNode.borderColor}`}
          />
        ) : undefined
      }
    >
      <div className="space-y-3.5">
        {/* Estilo de Línea (Grid 3x2) */}
        <div>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
            Estilo de Línea
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              {
                id: 'solid' as const,
                label: 'Sólido',
                icon: (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="my-0.5 shrink-0" fill="none">
                    <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                id: 'dashed' as const,
                label: 'Guiones',
                icon: (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="my-0.5 shrink-0" fill="none">
                    <line x1="1" y1="6" x2="23" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3" />
                  </svg>
                ),
              },
              {
                id: 'dotted' as const,
                label: 'Puntos',
                icon: (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="my-0.5 shrink-0" fill="none">
                    <circle cx="5" cy="6" r="2" fill="currentColor" />
                    <circle cx="12" cy="6" r="2" fill="currentColor" />
                    <circle cx="19" cy="6" r="2" fill="currentColor" />
                  </svg>
                ),
              },
              {
                id: 'double' as const,
                label: 'Doble',
                icon: (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="my-0.5 shrink-0" fill="none">
                    <line x1="2" y1="3.5" x2="22" y2="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="8.5" x2="22" y2="8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                id: 'zigzag' as const,
                label: 'Zigzag',
                icon: (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="my-0.5 shrink-0" fill="none">
                    <path d="M 2 9 L 6 3 L 10 9 L 14 3 L 18 9 L 22 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                id: 'wavy' as const,
                label: 'Ondulado',
                icon: (
                  <svg width="24" height="12" viewBox="0 0 24 12" className="my-0.5 shrink-0" fill="none">
                    <path d="M 2 6 Q 6 1 10 6 T 18 6 T 22 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map((styleItem) => {
              const currentStyle = selectedNode.borderStyle || selectedNode.borderDash || 'solid';
              const isSelected = currentStyle === styleItem.id;
              return (
                <button
                  key={styleItem.id}
                  type="button"
                  onClick={() =>
                    onUpdateNode(selectedNode.id, {
                      borderStyle: styleItem.id,
                      borderDash: styleItem.id,
                    })
                  }
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/90 text-amber-800 font-semibold shadow-2xs ring-1 ring-amber-500/50 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
                  }`}
                >
                  {styleItem.icon}
                  <span className="text-[10px] text-center truncate w-full">{styleItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTROLES CONTEXTUALES ESPECÍFICOS POR ESTILO DE LÍNEA */}

        {/* 1. Modo Guiones: Largo guión y Espacio */}
        {(selectedNode.borderStyle === 'dashed' || selectedNode.borderDash === 'dashed') && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
            <SliderInput
              label="Largo guión"
              value={selectedNode.borderDashLength !== undefined ? selectedNode.borderDashLength : 10}
              min={2}
              max={32}
              step={1}
              unit="px"
              badge={`${selectedNode.borderDashLength !== undefined ? selectedNode.borderDashLength : 10}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderDashLength: val })}
            />
            <SliderInput
              label="Espacio"
              value={selectedNode.borderDashSpace !== undefined ? selectedNode.borderDashSpace : 11}
              min={2}
              max={32}
              step={1}
              unit="px"
              badge={`${selectedNode.borderDashSpace !== undefined ? selectedNode.borderDashSpace : 11}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderDashSpace: val })}
            />
          </div>
        )}

        {/* 2. Modo Puntos: Selector de Forma y Separación */}
        {(selectedNode.borderStyle === 'dotted' || selectedNode.borderDash === 'dotted') && (
          <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
              {[
                { id: 'circle' as const, label: '● Esfera' },
                { id: 'square' as const, label: '■ Cuadrado' },
                { id: 'diamond' as const, label: '◆ Rombo' },
              ].map((dot) => {
                const isDotSel = (selectedNode.borderDotShape || 'circle') === dot.id;
                return (
                  <button
                    key={dot.id}
                    type="button"
                    onClick={() => onUpdateNode(selectedNode.id, { borderDotShape: dot.id })}
                    className={`flex-1 py-1 rounded-md text-center font-medium transition-all cursor-pointer ${
                      isDotSel
                        ? 'bg-white dark:bg-slate-700 text-amber-900 dark:text-amber-300 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {dot.label}
                  </button>
                );
              })}
            </div>

            <SliderInput
              label="Separación"
              value={selectedNode.borderDotSpacing !== undefined ? selectedNode.borderDotSpacing : 9}
              min={2}
              max={24}
              step={1}
              unit="px"
              badge={`${selectedNode.borderDotSpacing !== undefined ? selectedNode.borderDotSpacing : 9}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderDotSpacing: val })}
            />
          </div>
        )}

        {/* 3. Modo Doble: Separación, Color Línea Interior y Color Línea Exterior */}
        {(selectedNode.borderStyle === 'double' || selectedNode.borderDash === 'double') && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
            <SliderInput
              label="Separación"
              value={selectedNode.borderGap !== undefined ? selectedNode.borderGap : 4}
              min={1}
              max={16}
              step={0.5}
              unit="px"
              badge={`${selectedNode.borderGap !== undefined ? selectedNode.borderGap : 4}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderGap: val })}
            />

            <ColorPicker
              label="Color Línea Interior"
              value={selectedNode.borderColorInner || selectedNode.borderColor || '#FACC15'}
              onChange={(c) => onUpdateNode(selectedNode.id, { borderColorInner: c })}
              onClear={() => onUpdateNode(selectedNode.id, { borderColorInner: undefined })}
            />

            <ColorPicker
              label="Color Línea Exterior"
              value={selectedNode.borderColorOuter || selectedNode.borderColor || '#FACC15'}
              onChange={(c) => onUpdateNode(selectedNode.id, { borderColorOuter: c })}
              onClear={() => onUpdateNode(selectedNode.id, { borderColorOuter: undefined })}
            />
          </div>
        )}

        {/* 4. Modo Zigzag: Altura picos y Frecuencia */}
        {(selectedNode.borderStyle === 'zigzag' || selectedNode.borderDash === 'zigzag') && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
            <SliderInput
              label="Altura picos"
              value={selectedNode.borderZigzagHeight !== undefined ? selectedNode.borderZigzagHeight : 9.5}
              min={2}
              max={20}
              step={0.5}
              unit="px"
              badge={`${selectedNode.borderZigzagHeight !== undefined ? selectedNode.borderZigzagHeight : 9.5}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderZigzagHeight: val })}
            />
            <SliderInput
              label="Frecuencia"
              value={selectedNode.borderZigzagFreq !== undefined ? selectedNode.borderZigzagFreq : 19}
              min={6}
              max={40}
              step={1}
              unit="px"
              badge={`${selectedNode.borderZigzagFreq !== undefined ? selectedNode.borderZigzagFreq : 19}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderZigzagFreq: val })}
            />
          </div>
        )}

        {/* 5. Modo Ondulado: Altura ondas y Ancho onda */}
        {(selectedNode.borderStyle === 'wavy' || selectedNode.borderDash === 'wavy') && (
          <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
            <SliderInput
              label="Altura ondas"
              value={selectedNode.borderWaveHeight !== undefined ? selectedNode.borderWaveHeight : 10}
              min={2}
              max={20}
              step={0.5}
              unit="px"
              badge={`${selectedNode.borderWaveHeight !== undefined ? selectedNode.borderWaveHeight : 10}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderWaveHeight: val })}
            />
            <SliderInput
              label="Ancho onda"
              value={selectedNode.borderWaveWidth !== undefined ? selectedNode.borderWaveWidth : 36}
              min={12}
              max={60}
              step={1}
              unit="px"
              badge={`${selectedNode.borderWaveWidth !== undefined ? selectedNode.borderWaveWidth : 36}px`}
              onChange={(val) => onUpdateNode(selectedNode.id, { borderWaveWidth: val })}
            />
          </div>
        )}

        {/* Color del Borde (unificado para estilos que no son Doble) */}
        {(selectedNode.borderStyle !== 'double' && selectedNode.borderDash !== 'double') && (
          <ColorPicker
            label="Color del Borde"
            value={selectedNode.borderColor}
            onChange={(c) => onUpdateNode(selectedNode.id, { borderColor: c })}
            onClear={() => onUpdateNode(selectedNode.id, { borderColor: undefined })}
          />
        )}

        {/* Grosor del borde */}
        <SliderInput
          label="Grosor del borde"
          value={selectedNode.borderWidth !== undefined ? selectedNode.borderWidth : 2.5}
          min={0}
          max={10}
          step={0.5}
          unit="px"
          badge={`${selectedNode.borderWidth !== undefined ? selectedNode.borderWidth : 2.5}px`}
          onChange={(w) => onUpdateNode(selectedNode.id, { borderWidth: w })}
        />

        {/* Sombra del Contorno / Tarjeta del Nodo */}
        <div className="pt-3 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block">Sombra del Contorno</span>
              <span className="text-[10px] text-slate-500 block">Relieve y elevación de la tarjeta</span>
            </div>
            <Switch
              checked={Boolean(selectedNode.nodeShadow)}
              onChange={(val) => onUpdateNode(selectedNode.id, { nodeShadow: val })}
            />
          </div>

          {selectedNode.nodeShadow && (
            <div className="space-y-3 pt-1">
              {/* 4 Presets Rápidos */}
              <div>
                <span className="text-[10px] font-medium text-slate-600 block mb-1.5">Presets Rápidos</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'soft' as const, label: 'Suave' },
                    { id: 'medium' as const, label: 'Media' },
                    { id: 'deep' as const, label: '3D' },
                    { id: 'glow' as const, label: 'Glow' },
                  ].map((preset) => {
                    const isCur = (selectedNode.nodeShadowPreset || 'soft') === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          let blur = 8;
                          let offsetY = 3;
                          let color = 'rgba(0,0,0,0.12)';
                          if (preset.id === 'medium') {
                            blur = 14;
                            offsetY = 6;
                            color = 'rgba(0,0,0,0.22)';
                          } else if (preset.id === 'deep') {
                            blur = 24;
                            offsetY = 10;
                            color = 'rgba(0,0,0,0.35)';
                          } else if (preset.id === 'glow') {
                            blur = 16;
                            offsetY = 0;
                            color = '#38bdf8';
                          }
                          onUpdateNode(selectedNode.id, {
                            nodeShadowPreset: preset.id,
                            nodeShadowBlur: blur,
                            nodeShadowOffsetY: offsetY,
                            nodeShadowColor: color,
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
                  selectedNode.nodeShadowBlur ??
                  (selectedNode.nodeShadowPreset === 'deep'
                    ? 24
                    : selectedNode.nodeShadowPreset === 'medium'
                    ? 14
                    : selectedNode.nodeShadowPreset === 'glow'
                    ? 16
                    : 8)
                }
                min={1}
                max={40}
                unit="px"
                onChange={(blur) => onUpdateNode(selectedNode.id, { nodeShadowBlur: blur })}
              />

              {/* Slider de Desplazamiento Y */}
              <SliderInput
                label="Desplazamiento Vertical (Y)"
                value={
                  selectedNode.nodeShadowOffsetY ??
                  (selectedNode.nodeShadowPreset === 'deep'
                    ? 10
                    : selectedNode.nodeShadowPreset === 'medium'
                    ? 6
                    : selectedNode.nodeShadowPreset === 'glow'
                    ? 0
                    : 3)
                }
                min={0}
                max={30}
                unit="px"
                onChange={(y) => onUpdateNode(selectedNode.id, { nodeShadowOffsetY: y })}
              />

              {/* Selector de Color de Sombra */}
              <ColorPicker
                label="Color de Sombra"
                value={selectedNode.nodeShadowColor}
                onChange={(color) => onUpdateNode(selectedNode.id, { nodeShadowColor: color })}
                onClear={() => onUpdateNode(selectedNode.id, { nodeShadowColor: undefined })}
              />
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
};
