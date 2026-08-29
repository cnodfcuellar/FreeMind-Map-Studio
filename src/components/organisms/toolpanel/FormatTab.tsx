import React from 'react';
import { NodeShape, NodeBackgroundType, NodeGradientDirection, NodePatternStyle, NodeBgImageMode, EdgeStyle, EdgeProfile, MindNode } from '../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import { ShapeSelector } from '../../molecules/ShapeSelector';
import {
  Square,
  Sparkles,
  Paintbrush,
  Network,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowRight,
  ArrowDown,
  ArrowDownRight,
  Disc,
} from 'lucide-react';

interface FormatTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
}

const PATTERN_OPTIONS: { id: NodePatternStyle; label: string }[] = [
  { id: 'dots', label: 'Puntos' },
  { id: 'lines', label: 'Líneas' },
  { id: 'stripes', label: 'Rayas' },
  { id: 'squares', label: 'Cuadros' },
  { id: 'triangles', label: 'Triángulos' },
  { id: 'hexagons', label: 'Panal' },
  { id: 'cross', label: 'Cruces' },
];

export const FormatTab: React.FC<FormatTabProps> = ({
  selectedNode,
  onUpdateNode,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    shape: true,
    background: false,
    border: false,
    edge: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      shape: expand,
      background: expand,
      border: expand,
      edge: expand,
    });
  };

  const bgType: NodeBackgroundType = selectedNode.bgType || (selectedNode.color ? 'color' : 'color');

  return (
    <div className="space-y-3.5">
      {/* Barra superior de plegar / desplegar */}
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
          Formato Visual del Nodo
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleExpandAll(true)}
            className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
          >
            Desplegar todo
          </button>
          <span className="text-slate-300 text-[10px]">|</span>
          <button
            type="button"
            onClick={() => handleExpandAll(false)}
            className="text-[10.5px] text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer"
          >
            Plegar todo
          </button>
        </div>
      </div>

      {/* 1. Forma y Geometría */}
      <CollapsibleSection
        title="Forma y Geometría"
        subtitle="Geometría exterior y dimensiones"
        isOpen={sectionsOpen.shape}
        onToggle={() => toggleSection('shape')}
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

        <div className="pt-2 border-t border-slate-200/80 space-y-3">
          <SliderInput
            label="Ancho personalizado"
            value={selectedNode.customWidth || 0}
            min={0}
            max={500}
            step={10}
            unit="px"
            badge={selectedNode.customWidth ? `${selectedNode.customWidth}px` : 'Automático'}
            onChange={(w) => onUpdateNode(selectedNode.id, { customWidth: w > 0 ? w : undefined })}
            onReset={() => onUpdateNode(selectedNode.id, { customWidth: undefined })}
            description="0 = Ajuste automático al contenido"
          />

          <SliderInput
            label="Alto personalizado"
            value={selectedNode.customHeight || 0}
            min={0}
            max={300}
            step={5}
            unit="px"
            badge={selectedNode.customHeight ? `${selectedNode.customHeight}px` : 'Automático'}
            onChange={(h) => onUpdateNode(selectedNode.id, { customHeight: h > 0 ? h : undefined })}
            onReset={() => onUpdateNode(selectedNode.id, { customHeight: undefined })}
            description="0 = Ajuste automático al contenido"
          />
        </div>
      </CollapsibleSection>

      {/* 2. Fondo y Relleno */}
      <CollapsibleSection
        title="Fondo y Relleno"
        subtitle="Color, degradado, trama o imagen"
        isOpen={sectionsOpen.background}
        onToggle={() => toggleSection('background')}
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
                {PATTERN_OPTIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUpdateNode(selectedNode.id, { nodePattern: p.id })}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      selectedNode.nodePattern === p.id
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">
                      {p.id === 'dots' ? ':::' : p.id === 'lines' ? '≡' : p.id === 'stripes' ? '///' : p.id === 'squares' ? '⊞' : p.id === 'triangles' ? '▲' : p.id === 'hexagons' ? '⬡' : '✚'}
                    </span>
                    <span className="text-[10px] font-medium truncate w-full">{p.label}</span>
                  </button>
                ))}
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
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="URL de imagen de fondo..."
                value={selectedNode.bgImageUrl || ''}
                onChange={(e) => onUpdateNode(selectedNode.id, { bgImageUrl: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
              />
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

      {/* 3. Bordes y Contorno */}
      <CollapsibleSection
        title="Bordes y Contorno"
        subtitle="Grosor, color y estilo de línea"
        isOpen={sectionsOpen.border}
        onToggle={() => toggleSection('border')}
        icon={<Sparkles className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          <ColorPicker
            label="Color del Borde"
            value={selectedNode.borderColor}
            onChange={(c) => onUpdateNode(selectedNode.id, { borderColor: c })}
            onClear={() => onUpdateNode(selectedNode.id, { borderColor: undefined })}
          />

          <SliderInput
            label="Grosor del borde"
            value={selectedNode.borderWidth !== undefined ? selectedNode.borderWidth : 1}
            min={0}
            max={8}
            unit="px"
            onChange={(w) => onUpdateNode(selectedNode.id, { borderWidth: w })}
          />

          <span className="text-[11px] font-semibold text-slate-600 block">Estilo de Línea</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'solid' as const, label: 'Sólido', stroke: 'border-solid' },
              { id: 'dashed' as const, label: 'Guiones', stroke: 'border-dashed' },
              { id: 'dotted' as const, label: 'Puntos', stroke: 'border-dotted' },
            ].map((dash) => {
              const isSelected = (selectedNode.borderDash || 'solid') === dash.id;
              return (
                <button
                  key={dash.id}
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { borderDash: dash.id, borderStyle: dash.id })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 border-t-2 ${dash.stroke} border-current my-1`} />
                  <span className="text-[10px] text-center truncate w-full">{dash.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Aristas del Nodo y Propagación de Estilos */}
      <CollapsibleSection
        title="Aristas y Propagación"
        subtitle="Estilo de línea hacia los hijos"
        isOpen={sectionsOpen.edge}
        onToggle={() => toggleSection('edge')}
        icon={<Network className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-600 block">Forma de la Conexión</span>
          <div className="grid grid-cols-4 gap-1.5">
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

          <ColorPicker
            label="Color de la Arista"
            value={selectedNode.edgeColor}
            onChange={(c) => onUpdateNode(selectedNode.id, { edgeColor: c })}
            onClear={() => onUpdateNode(selectedNode.id, { edgeColor: undefined })}
          />

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
    </div>
  );
};
