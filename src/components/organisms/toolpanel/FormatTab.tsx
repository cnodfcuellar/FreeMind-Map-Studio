import React from 'react';
import {
  NodeShape,
  NodeBackgroundType,
  NodeGradientDirection,
  NodePatternStyle,
  NodeBgImageMode,
  EdgeStyle,
  EdgeProfile,
  MindNode,
  BubbleTailSide,
  BubbleTailStyle,
  ForkHooksSide,
  ForkCornerStyle,
  ForkPreset,
} from '../../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import { Switch } from '../../atoms/Switch';
import { ShapeSelector } from '../../molecules/ShapeSelector';
import { RectangleCornerControl } from '../../molecules/RectangleCornerControl';
import { OvalQualitiesControl } from '../../molecules/OvalQualitiesControl';
import { ArrowQualitiesControl } from '../../molecules/ArrowQualitiesControl';
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
  Upload,
  Trash2,
  Image as ImageIcon,
  MessageSquare,
  GitFork,
} from 'lucide-react';

interface FormatTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
}

const PATTERN_OPTIONS: {
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
  const [showAdvancedTail, setShowAdvancedTail] = React.useState(false);
  const [showAdvancedFork, setShowAdvancedFork] = React.useState(false);

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

  const bgType: NodeBackgroundType = selectedNode.bgType || (selectedNode.bgImageUrl ? 'image' : 'color');

  return (
    <div className="space-y-3.5">
      {/* Barra superior de plegar / desplegar */}
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider">
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

            {/* 3 Presets Rápidos en 1 Fila (Ahorro de espacio) */}
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

            {/* Ajustes Avanzados Plegables (para calibrar milímetros sin saturar la vista) */}
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

            {/* 2. Distribución de Ganchos Laterales (Fila Segmentada) */}
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

            {/* 3. Ajustes Avanzados Plegables (Altura milimétrica y Codos) */}
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

        {/* Cualidades del Rectángulo y Cuadrado (Alternativa A: Presets 1 Clic + Micro-Asimetría) */}
        {(selectedNode.shape === 'rectangle' || selectedNode.shape === 'square') && (
          <RectangleCornerControl
            node={selectedNode}
            onUpdateNode={onUpdateNode}
          />
        )}

        {/* Cualidades del Óvalo / Elipse (Alternativa A: Presets 1 Clic + Texto Recto) */}
        {selectedNode.shape === 'oval' && (
          <OvalQualitiesControl
            node={selectedNode}
            onUpdateNode={onUpdateNode}
          />
        )}

        {/* Cualidades de la Flecha (Alternativa A: Dirección 1 Clic + Smart Auto + Calibración) */}
        {selectedNode.shape === 'arrow' && (
          <ArrowQualitiesControl
            node={selectedNode}
            onUpdateNode={onUpdateNode}
          />
        )}
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

      {/* 3. Bordes y Contorno */}
      <CollapsibleSection
        title="Bordes y Contorno"
        subtitle="Grosor, color y estilo de línea"
        isOpen={sectionsOpen.border}
        onToggle={() => toggleSection('border')}
        icon={<Sparkles className="w-3.5 h-3.5" />}
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
                      <line x1="1" y1="6" x2="23" y2="6" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
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

          {/* 2. Modo Puntos: Selector de Forma (Esfera, Cuadrado, Rombo) y Separación */}
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

          {/* Grosor del borde (con step decimal y badge como tu captura) */}
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
    </div>
  );
};
