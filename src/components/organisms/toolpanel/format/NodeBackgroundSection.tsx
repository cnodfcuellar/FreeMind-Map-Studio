import React from 'react';
import {
  MindNode,
  NodeBackgroundType,
  NodeGradientDirection,
  NodePatternStyle,
  NodeBgImageMode,
} from '../../../../types/mindmap';
import { CollapsibleSection } from '../../../atoms/CollapsibleSection';
import { ColorPicker } from '../../../atoms/ColorPicker';
import { SliderInput } from '../../../atoms/SliderInput';
import {
  Paintbrush,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowDown,
  ArrowDownRight,
  Disc,
  Upload,
  Trash2,
} from 'lucide-react';

export interface NodeBackgroundSectionProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const PATTERN_OPTIONS: {
  id: NodePatternStyle;
  label: string;
  aliases?: NodePatternStyle[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'dots',
    label: 'Puntos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" fill="currentColor">
        <circle cx="5.5" cy="5.5" r="1.6" />
        <circle cx="12.5" cy="5.5" r="1.6" />
        <circle cx="5.5" cy="12.5" r="1.6" />
        <circle cx="12.5" cy="12.5" r="1.6" />
      </svg>
    ),
  },
  {
    id: 'lines',
    label: 'Lineas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" stroke="currentColor">
        <line x1="3.5" y1="5.5" x2="14.5" y2="5.5" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="3.5" y1="9" x2="14.5" y2="9" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="3.5" y1="12.5" x2="14.5" y2="12.5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'stripes',
    label: 'Rayas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" stroke="currentColor">
        <line x1="4.5" y1="13.5" x2="11.5" y2="4.5" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="7.5" y1="13.5" x2="14.5" y2="4.5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'grid',
    label: 'Cuadros',
    aliases: ['squares'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="12" height="12" rx="1.5" strokeWidth="1.5" />
        <line x1="9" y1="3" x2="9" y2="15" strokeWidth="1.2" />
        <line x1="3" y1="9" x2="15" y2="9" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: 'isometric',
    label: 'Isométrico',
    aliases: ['triangles'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" stroke="currentColor">
        <line x1="9" y1="2.5" x2="9" y2="15.5" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3.5" y1="5.7" x2="14.5" y2="12.3" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3.5" y1="12.3" x2="14.5" y2="5.7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'diamonds',
    label: 'Rombos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" fill="none" stroke="currentColor">
        <polygon points="9,2.5 15.5,9 9,15.5 2.5,9" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'honeycomb',
    label: 'Panal',
    aliases: ['hexagons'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" fill="none" stroke="currentColor">
        <polygon points="5,4 12,4 15,9 12,14 5,14 2,9" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="15" y1="9" x2="17" y2="9" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'crosses',
    label: 'Cruces',
    aliases: ['cross'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" stroke="currentColor">
        <line x1="9" y1="3.5" x2="9" y2="14.5" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3.5" y1="9" x2="14.5" y2="9" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const NodeBackgroundSection: React.FC<NodeBackgroundSectionProps> = ({
  selectedNode,
  onUpdateNode,
  isOpen,
  onToggle,
}) => {
  const bgType: NodeBackgroundType = selectedNode.bgType || (selectedNode.bgImageUrl ? 'image' : 'color');

  return (
    <CollapsibleSection
      title="Fondo y Relleno"
      subtitle="Color, degradado, trama o imagen"
      isOpen={isOpen}
      onToggle={onToggle}
      icon={<Paintbrush className="w-3.5 h-3.5" />}
    >
      <div className="space-y-3">
        {/* Selector visual de tipo de fondo */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { id: 'color' as NodeBackgroundType, label: 'Sólido', icon: <div className="w-4 h-4 rounded bg-blue-500 border border-blue-600/40" /> },
            { id: 'gradient' as NodeBackgroundType, label: 'Degradado', icon: <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-purple-600" /> },
            { id: 'pattern' as NodeBackgroundType, label: 'Trama', icon: <Sparkles className="w-4 h-4 text-slate-700" /> },
            { id: 'image' as NodeBackgroundType, label: 'Imagen', icon: <Layers className="w-4 h-4 text-slate-700" /> },
            { id: 'transparent' as NodeBackgroundType, label: 'Transp.', icon: <div className="w-4 h-4 rounded border-2 border-dashed border-slate-400" /> },
          ].map((opt) => {
            const isSelected = bgType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { bgType: opt.id })}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {opt.icon}
                <span className="text-[9.5px] mt-1 text-center truncate w-full tracking-tight">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {bgType === 'color' && (
          <ColorPicker
            label="Color de Fondo"
            value={selectedNode.color}
            onChange={(color) => onUpdateNode(selectedNode.id, { color, bgType: 'color' })}
            onClear={() => onUpdateNode(selectedNode.id, { color: undefined, bgType: undefined })}
          />
        )}

        {bgType === 'gradient' && (
          <div className="space-y-2.5">
            <ColorPicker
              label="Color Inicial"
              value={selectedNode.gradientColor1 || '#3b82f6'}
              onChange={(c) => onUpdateNode(selectedNode.id, { gradientColor1: c })}
            />
            <ColorPicker
              label="Color Final"
              value={selectedNode.gradientColor2 || '#1d4ed8'}
              onChange={(c) => onUpdateNode(selectedNode.id, { gradientColor2: c })}
            />
            <span className="text-[11px] font-semibold text-slate-600 block">Dirección del Degradado</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'to-r' as NodeGradientDirection, label: 'Horizontal', icon: <ArrowRight className="w-3.5 h-3.5" /> },
                { id: 'to-b' as NodeGradientDirection, label: 'Vertical', icon: <ArrowDown className="w-3.5 h-3.5" /> },
                { id: 'to-br' as NodeGradientDirection, label: 'Diagonal', icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
                { id: 'radial' as NodeGradientDirection, label: 'Radial', icon: <Disc className="w-3.5 h-3.5" /> },
              ].map((opt) => {
                const isSelected = (selectedNode.gradientDirection || 'to-r') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateNode(selectedNode.id, { gradientDirection: opt.id })}
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
          </div>
        )}

        {bgType === 'pattern' && (
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-slate-600 block">Estilo de Trama</span>
            <div className="grid grid-cols-4 gap-1.5">
              {PATTERN_OPTIONS.map((p) => {
                const isSelected =
                  selectedNode.nodePattern === p.id ||
                  Boolean(p.aliases && selectedNode.nodePattern && p.aliases.includes(selectedNode.nodePattern)) ||
                  (!selectedNode.nodePattern && p.id === 'dots');
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUpdateNode(selectedNode.id, { nodePattern: p.id })}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/90 text-amber-800 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="h-5 flex items-center justify-center">
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-medium truncate w-full text-center">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <ColorPicker
                label="Color del Fondo Base"
                value={selectedNode.color}
                onChange={(color) => onUpdateNode(selectedNode.id, { color })}
                onClear={() => onUpdateNode(selectedNode.id, { color: undefined })}
              />
              <ColorPicker
                label="Color del Trazo de Trama"
                value={selectedNode.nodePatternColor || '#475569'}
                onChange={(c) => onUpdateNode(selectedNode.id, { nodePatternColor: c })}
                onClear={() => onUpdateNode(selectedNode.id, { nodePatternColor: undefined })}
              />
            </div>

            <SliderInput
              label="Tamaño del patrón"
              value={selectedNode.nodePatternSize || 16}
              min={8}
              max={40}
              unit="px"
              onChange={(s) => onUpdateNode(selectedNode.id, { nodePatternSize: s })}
            />

            <SliderInput
              label="Opacidad del trazo"
              value={Math.round((selectedNode.nodePatternOpacity !== undefined ? selectedNode.nodePatternOpacity : 0.4) * 100)}
              min={10}
              max={100}
              unit="%"
              onChange={(op) => onUpdateNode(selectedNode.id, { nodePatternOpacity: op / 100 })}
            />
          </div>
        )}

        {bgType === 'image' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="URL de imagen (https://...)"
                value={selectedNode.bgImageUrl || ''}
                onChange={(e) => onUpdateNode(selectedNode.id, { bgImageUrl: e.target.value })}
                className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
              />
              
              {/* Botón Explorar Archivo Local */}
              <label
                title="Examinar e insertar imagen local"
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200/80 shrink-0 cursor-pointer shadow-2xs flex items-center justify-center"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result as string;
                        if (result) {
                          onUpdateNode(selectedNode.id, { bgImageUrl: result, bgType: 'image' });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = '';
                  }}
                />
              </label>

              {/* Botón Eliminar Imagen de Fondo */}
              {selectedNode.bgImageUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { bgImageUrl: undefined })}
                  title="Eliminar imagen de fondo"
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200/80 shrink-0 cursor-pointer shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vista previa miniatura si existe imagen */}
            {selectedNode.bgImageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-100 flex items-center justify-center">
                <img
                  src={selectedNode.bgImageUrl}
                  alt="Fondo del nodo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <span className="absolute bottom-1 right-2 text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded shadow">
                  Vista previa
                </span>
              </div>
            )}

            <span className="text-[11px] font-semibold text-slate-600 block">Modo de Ajuste</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'cover' as NodeBgImageMode, label: 'Cubrir', desc: 'Expandir' },
                { id: 'contain' as NodeBgImageMode, label: 'Contener', desc: 'Completa' },
                { id: 'tile' as NodeBgImageMode, label: 'Repetir', desc: 'Mosaico' },
              ].map((opt) => {
                const isSelected = (selectedNode.bgImageMode || 'cover') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateNode(selectedNode.id, { bgImageMode: opt.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{opt.desc}</span>
                    <span className="text-[10px] mt-0.5 text-center truncate w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
