import React, { useState } from 'react';
import {
  MindMap,
  MindMapTheme,
  LayoutType,
  EdgeStyle,
  EdgeProfile,
  BackgroundPatternStyle,
  Connector,
} from '../../../types/mindmap';
import { THEMES, BACKGROUND_PRESET_THEMES, BackgroundPresetTheme } from '../../../utils/themes';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import { Switch } from '../../atoms/Switch';
import {
  Layers,
  Palette,
  Network,
  LayoutGrid,
  Link,
  MoveHorizontal,
  Compass,
  Sparkles,
  GitFork,
  CircleDot,
  Check,
  Dices,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';

interface ThemeTabProps {
  currentTheme: MindMapTheme;
  layout: LayoutType;
  mindMap?: MindMap;
  onUpdateMapTheme: (themeId: string) => void;
  onUpdateMapLayout: (layout: LayoutType) => void;
  onUpdateMapEdgeStyle?: (edgeStyle: EdgeStyle) => void;
  onUpdateMapEdgeProfile?: (edgeProfile: EdgeProfile) => void;
  onUpdateMapEdgeWidth?: (width: number) => void;
  onUpdateMapEdgeColor?: (color: string | undefined) => void;
  onUpdateMapEdgeDash?: (dash: 'solid' | 'dashed' | 'dotted') => void;
  onUpdateMapEdgeShadow?: (updates: {
    edgeShadow?: boolean;
    edgeShadowPreset?: 'soft' | 'deep' | 'glow';
    edgeShadowBlur?: number;
    edgeShadowOffsetY?: number;
    edgeShadowColor?: string;
  }) => void;
  onApplyEdgeStyleToAllNodes?: (edgeStyle: EdgeStyle) => void;
  onApplyEdgeProfileToAllNodes?: (edgeProfile: EdgeProfile) => void;
  onRandomizeEdgeColors?: () => void;
  onUpdateMapGaps?: (gaps: { horizontal?: number; vertical?: number }) => void;
  onOpenConnectorModal?: (fromId?: string) => void;
  onEditConnector?: (connector: Connector) => void;
  onDeleteConnector?: (connectorId: string) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<Connector>) => void;
  onUpdateMapBackground?: (config: {
    backgroundColor?: string;
    backgroundPattern?: BackgroundPatternStyle;
    backgroundPatternColor?: string;
    backgroundPatternSize?: number;
    backgroundPatternOpacity?: number;
  }) => void;
  onResetMapBackground?: () => void;
}

const LAYOUT_OPTIONS: { id: LayoutType; name: string; icon: React.ReactNode }[] = [
  { id: 'standard', name: 'Estándar', icon: <GitFork className="w-4 h-4" /> },
  { id: 'balanced-horizontal', name: 'Balanceado', icon: <MoveHorizontal className="w-4 h-4" /> },
  { id: 'right', name: 'Derecha', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'left', name: 'Izquierda', icon: <LayoutGrid className="w-4 h-4 scale-x-[-1]" /> },
  { id: 'top', name: 'Arriba', icon: <LayoutGrid className="w-4 h-4 -rotate-90" /> },
  { id: 'bottom', name: 'Abajo', icon: <LayoutGrid className="w-4 h-4 rotate-90" /> },
  { id: 'tree-down', name: 'Árbol ↓', icon: <Network className="w-4 h-4" /> },
  { id: 'radial', name: 'Radial ●', icon: <CircleDot className="w-4 h-4" /> },
  { id: 'circular', name: 'Circular ○', icon: <Compass className="w-4 h-4" /> },
];

export const ThemeTab: React.FC<ThemeTabProps> = ({
  currentTheme,
  layout,
  mindMap,
  onUpdateMapTheme,
  onUpdateMapLayout,
  onUpdateMapEdgeStyle,
  onUpdateMapEdgeProfile,
  onUpdateMapEdgeWidth,
  onUpdateMapEdgeColor,
  onUpdateMapEdgeDash,
  onUpdateMapEdgeShadow,
  onApplyEdgeStyleToAllNodes,
  onApplyEdgeProfileToAllNodes,
  onRandomizeEdgeColors,
  onUpdateMapGaps,
  onOpenConnectorModal,
  onEditConnector,
  onDeleteConnector,
  onUpdateConnector,
  onUpdateMapBackground,
  onResetMapBackground,
}) => {
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    theme: true,
    background: false,
    layout: false,
    edges: false,
    gaps: false,
    connectors: true,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      theme: expand,
      background: expand,
      layout: expand,
      edges: expand,
      gaps: expand,
      connectors: expand,
    });
  };

  const currentBgColor = mindMap?.backgroundColor || currentTheme.background || '#f8fafc';
  const currentBgPattern = mindMap?.backgroundPattern || currentTheme.backgroundPattern || 'dots';
  const currentBgPatternColor = mindMap?.backgroundPatternColor || currentTheme.backgroundPatternColor || '#94a3b8';
  const currentBgPatternSize = mindMap?.backgroundPatternSize || currentTheme.backgroundPatternSize || 24;
  const currentBgPatternOpacity = mindMap?.backgroundPatternOpacity ?? currentTheme.backgroundPatternOpacity ?? 0.45;

  return (
    <div className="space-y-3.5">
      {/* Barra superior de plegar / desplegar */}
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider">
          Configuración Global del Mapa
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

      {/* 1. Temas Visuales */}
      <CollapsibleSection
        title="Temas del Mapa"
        subtitle="Paletas de color y estilos"
        isOpen={sectionsOpen.theme}
        onToggle={() => toggleSection('theme')}
        icon={<Palette className="w-3.5 h-3.5" />}
        badge={
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            {currentTheme.name}
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {Object.values(THEMES).map((thm) => {
            const isSelected = currentTheme.id === thm.id;
            return (
              <button
                key={thm.id}
                type="button"
                onClick={() => onUpdateMapTheme(thm.id)}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800 text-xs truncate">{thm.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </div>
                <div className="flex items-center gap-1">
                  <div
                    style={{ backgroundColor: thm.rootBg }}
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                    title="Nodo raíz"
                  />
                  <div className="flex gap-0.5 flex-1">
                    {thm.branchColors.slice(0, 4).map((bc, i) => (
                      <div
                        key={i}
                        style={{ backgroundColor: bc }}
                        className="w-2.5 h-2.5 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* 2. Algoritmos de Diseño / Layout */}
      <CollapsibleSection
        title="Diseño del Árbol (Layout)"
        subtitle="Estructura y distribución del mapa"
        isOpen={sectionsOpen.layout}
        onToggle={() => toggleSection('layout')}
        icon={<Network className="w-3.5 h-3.5" />}
      >
        <div className="grid grid-cols-3 gap-1.5">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = layout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateMapLayout(opt.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.icon}
                <span className="text-[10px] mt-1 text-center truncate w-full">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* 3. Fondo del Lienzo (Canvas Background) */}
      <CollapsibleSection
        title="Fondo del Lienzo"
        subtitle="Color de fondo y patrones de rejilla"
        isOpen={sectionsOpen.background}
        onToggle={() => toggleSection('background')}
        icon={<Layers className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          <ColorPicker
            label="Color de Fondo del Lienzo"
            value={currentBgColor}
            onChange={(color) => onUpdateMapBackground && onUpdateMapBackground({ backgroundColor: color })}
            onClear={onResetMapBackground}
          />

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-700 block">Patrón de Cuadrícula</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  id: 'none' as BackgroundPatternStyle,
                  label: 'Liso',
                  icon: (
                    <div className="w-6 h-4 rounded bg-slate-100 border border-slate-200" />
                  ),
                },
                {
                  id: 'dots' as BackgroundPatternStyle,
                  label: 'Puntos',
                  icon: (
                    <div
                      className="w-6 h-4 rounded border border-slate-200"
                      style={{
                        backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                        backgroundSize: '4px 4px',
                      }}
                    />
                  ),
                },
                {
                  id: 'lines' as BackgroundPatternStyle,
                  label: 'Líneas',
                  icon: (
                    <div
                      className="w-6 h-4 rounded border border-slate-200"
                      style={{
                        backgroundImage: 'linear-gradient(to right, #64748b 1px, transparent 1px)',
                        backgroundSize: '5px 5px',
                      }}
                    />
                  ),
                },
                {
                  id: 'squares' as BackgroundPatternStyle,
                  label: 'Cuadros',
                  icon: (
                    <div
                      className="w-6 h-4 rounded border border-slate-200"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
                        backgroundSize: '5px 5px',
                      }}
                    />
                  ),
                },
                {
                  id: 'triangles' as BackgroundPatternStyle,
                  label: 'Triángulos',
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <polygon points="12,1 23,15 1,15" />
                      <line x1="12" y1="1" x2="12" y2="15" />
                    </svg>
                  ),
                },
                {
                  id: 'hexagons' as BackgroundPatternStyle,
                  label: 'Panal',
                  icon: (
                    <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <polygon points="6,2 18,2 23,8 18,14 6,14 1,8" />
                    </svg>
                  ),
                },
              ].map((opt) => {
                const isSelected = currentBgPattern === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateMapBackground && onUpdateMapBackground({ backgroundPattern: opt.id })
                    }
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center h-4 my-0.5">{opt.icon}</div>
                    <span className="text-[10px] mt-1 text-center truncate w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentBgPattern !== 'none' && (
            <>
              <ColorPicker
                label="Color del Trazo del Patrón"
                value={currentBgPatternColor}
                onChange={(c) =>
                  onUpdateMapBackground && onUpdateMapBackground({ backgroundPatternColor: c })
                }
              />

              <SliderInput
                label="Tamaño del Patrón"
                value={currentBgPatternSize}
                min={12}
                max={64}
                step={2}
                unit="px"
                onChange={(sz) =>
                  onUpdateMapBackground && onUpdateMapBackground({ backgroundPatternSize: sz })
                }
              />

              <SliderInput
                label="Opacidad del Patrón"
                value={Math.round(currentBgPatternOpacity * 100)}
                min={5}
                max={100}
                unit="%"
                onChange={(op) =>
                  onUpdateMapBackground && onUpdateMapBackground({ backgroundPatternOpacity: op / 100 })
                }
              />
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* 4. Aristas Globales */}
      <CollapsibleSection
        title="Aristas Globales"
        subtitle="Estilo por defecto de las ramas"
        isOpen={sectionsOpen.edges}
        onToggle={() => toggleSection('edges')}
        icon={<GitFork className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          <span className="text-[11px] font-semibold text-slate-600 block">Forma de Conexión Global</span>
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
              const currentVal = mindMap?.edgeStyle || currentTheme.edgeStyle || 'bezier';
              const isSelected = currentVal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (onApplyEdgeStyleToAllNodes) onApplyEdgeStyleToAllNodes(opt.id);
                    else if (onUpdateMapEdgeStyle) onUpdateMapEdgeStyle(opt.id);
                  }}
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

          <span className="text-[11px] font-semibold text-slate-600 block">Perfil de Grosor (Ribbon)</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'uniform' as EdgeProfile, label: 'Uniforme', desc: '═' },
              { id: 'tapered' as EdgeProfile, label: 'Cónica', desc: '◣' },
              { id: 'spindle' as EdgeProfile, label: 'Huso', desc: '◆' },
              { id: 'hourglass' as EdgeProfile, label: 'Reloj', desc: '⧖' },
            ].map((opt) => {
              const currentVal = mindMap?.edgeProfile || 'uniform';
              const isSelected = currentVal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (onApplyEdgeProfileToAllNodes) onApplyEdgeProfileToAllNodes(opt.id);
                    else if (onUpdateMapEdgeProfile) onUpdateMapEdgeProfile(opt.id);
                  }}
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

          {/* Color de Aristas Global & Modo Multicolor & Randomizador */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-700">Color de Aristas</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateMapEdgeColor) onUpdateMapEdgeColor(undefined);
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer border ${
                    !mindMap?.edgeColor
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-transparent shadow-2xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="Cada rama principal tiene su propio color del tema"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Multicolor</span>
                </button>

                {onRandomizeEdgeColors && (
                  <button
                    type="button"
                    onClick={onRandomizeEdgeColors}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                    title="Aleatorizar colores en todos los enlaces del mapa con una paleta amplia y vibrante"
                  >
                    <Dices className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Randomizar</span>
                  </button>
                )}
              </div>
            </div>

            <ColorPicker
              label="Color Uniforme de Ramas"
              value={mindMap?.edgeColor}
              onChange={(c) => onUpdateMapEdgeColor && onUpdateMapEdgeColor(c)}
              onClear={() => onUpdateMapEdgeColor && onUpdateMapEdgeColor(undefined)}
            />

            {/* Paleta rápida de colores populares para aristas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sugeridos:</span>
              {[
                { col: '#3b82f6', label: 'Azul' },
                { col: '#8b5cf6', label: 'Púrpura' },
                { col: '#10b981', label: 'Verde' },
                { col: '#f59e0b', label: 'Ámbar' },
                { col: '#ef4444', label: 'Rojo' },
                { col: '#ec4899', label: 'Rosa' },
                { col: '#475569', label: 'Pizarra' },
                { col: '#0f172a', label: 'Oscuro' },
              ].map((item) => (
                <button
                  key={item.col}
                  type="button"
                  title={item.label}
                  onClick={() => onUpdateMapEdgeColor && onUpdateMapEdgeColor(item.col)}
                  className={`w-4.5 h-4.5 rounded-full shrink-0 border transition-transform hover:scale-115 cursor-pointer shadow-2xs ${
                    mindMap?.edgeColor === item.col ? 'ring-2 ring-blue-500 ring-offset-1 border-white' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: item.col }}
                />
              ))}
            </div>
          </div>

          {/* Estilo de Trazo Global (Sólido / Guiones / Puntos) */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 block">Estilo de Línea Global</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'solid' as const, label: 'Sólido', preview: 'border-t-2 border-slate-600' },
                { id: 'dashed' as const, label: 'Guiones', preview: 'border-t-2 border-dashed border-slate-600' },
                { id: 'dotted' as const, label: 'Puntos', preview: 'border-t-2 border-dotted border-slate-600' },
              ].map((opt) => {
                const currentDash = mindMap?.edgeDash || 'solid';
                const isSelected = currentDash === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateMapEdgeDash && onUpdateMapEdgeDash(opt.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 my-1">
                      <div className={`w-full ${opt.preview}`} />
                    </div>
                    <span className="text-[10px] mt-0.5 text-center truncate w-full">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <SliderInput
            label="Grosor de Aristas Global"
            value={mindMap?.edgeWidth || 2.5}
            min={1}
            max={8}
            step={0.5}
            unit="px"
            onChange={(w) => onUpdateMapEdgeWidth && onUpdateMapEdgeWidth(w)}
          />

          {/* Sombra de Aristas Global del Mapa */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block">Sombra de Aristas Global</span>
                <span className="text-[10px] text-slate-500 block">Relieve o resplandor neón en todas las ramas</span>
              </div>
              <Switch
                checked={Boolean(mindMap?.edgeShadow)}
                onChange={(val) =>
                  onUpdateMapEdgeShadow &&
                  onUpdateMapEdgeShadow({
                    edgeShadow: val,
                    edgeShadowPreset: mindMap?.edgeShadowPreset || 'soft',
                  })
                }
              />
            </div>

            {mindMap?.edgeShadow && (
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
                      const isCur = (mindMap?.edgeShadowPreset || 'soft') === preset.id;
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
                              color = mindMap?.edgeColor || '#3b82f6';
                            }
                            onUpdateMapEdgeShadow &&
                              onUpdateMapEdgeShadow({
                                edgeShadow: true,
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
                    mindMap?.edgeShadowBlur ??
                    (mindMap?.edgeShadowPreset === 'deep'
                      ? 8
                      : mindMap?.edgeShadowPreset === 'glow'
                      ? 6
                      : 4)
                  }
                  min={1}
                  max={20}
                  unit="px"
                  onChange={(blur) =>
                    onUpdateMapEdgeShadow && onUpdateMapEdgeShadow({ edgeShadowBlur: blur })
                  }
                />

                {/* Slider de Desplazamiento Y */}
                <SliderInput
                  label="Desplazamiento Vertical (Y)"
                  value={
                    mindMap?.edgeShadowOffsetY ??
                    (mindMap?.edgeShadowPreset === 'deep'
                      ? 4
                      : mindMap?.edgeShadowPreset === 'glow'
                      ? 0
                      : 2)
                  }
                  min={0}
                  max={16}
                  unit="px"
                  onChange={(y) =>
                    onUpdateMapEdgeShadow && onUpdateMapEdgeShadow({ edgeShadowOffsetY: y })
                  }
                />

                {/* Selector de Color de Sombra */}
                <ColorPicker
                  label="Color de Sombra / Resplandor"
                  value={mindMap?.edgeShadowColor}
                  onChange={(color) =>
                    onUpdateMapEdgeShadow && onUpdateMapEdgeShadow({ edgeShadowColor: color })
                  }
                  onClear={() =>
                    onUpdateMapEdgeShadow && onUpdateMapEdgeShadow({ edgeShadowColor: undefined })
                  }
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Espaciado entre Nodos */}
      <CollapsibleSection
        title="Espaciado del Mapa"
        subtitle="Separación horizontal y vertical"
        isOpen={sectionsOpen.gaps}
        onToggle={() => toggleSection('gaps')}
        icon={<MoveHorizontal className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          <SliderInput
            label="Separación Horizontal"
            value={mindMap?.horizontalGap !== undefined ? mindMap.horizontalGap : 54}
            min={20}
            max={150}
            step={2}
            unit="px"
            onChange={(h) => onUpdateMapGaps && onUpdateMapGaps({ horizontal: h })}
          />

          <SliderInput
            label="Separación Vertical"
            value={mindMap?.verticalGap !== undefined ? mindMap.verticalGap : 14}
            min={4}
            max={60}
            step={2}
            unit="px"
            onChange={(v) => onUpdateMapGaps && onUpdateMapGaps({ vertical: v })}
          />
        </div>
      </CollapsibleSection>

      {/* 6. Conexiones y Relaciones Libres */}
      <CollapsibleSection
        title="Conexiones Libres"
        subtitle="Relaciones transversales entre nodos"
        isOpen={sectionsOpen.connectors}
        onToggle={() => toggleSection('connectors')}
        icon={<Link className="w-3.5 h-3.5 text-blue-600" />}
        badge={
          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
            {(mindMap?.connectors || []).length} { (mindMap?.connectors || []).length === 1 ? 'activa' : 'activas' }
          </span>
        }
      >
        <div className="space-y-3">
          {/* Botón superior de Añadir Conexión */}
          <button
            type="button"
            onClick={() => onOpenConnectorModal && onOpenConnectorModal()}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-blue-400/80 dark:border-blue-600/80 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Conexión / Relación
          </button>

          {/* Lista de Conectores Creados */}
          {(!mindMap?.connectors || mindMap.connectors.length === 0) ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-1">
              <Link className="w-5 h-5 mx-auto text-slate-400 dark:text-slate-500 opacity-60 mb-1" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                No hay conexiones libres
              </p>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                Enlaza dos nodos independientemente de la jerarquía del árbol.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mindMap.connectors.map((conn, index) => {
                const fromNode = mindMap.nodes[conn.fromId];
                const toNode = mindMap.nodes[conn.toId];
                const fromTitle = fromNode?.text || '(Nodo origen)';
                const toTitle = toNode?.text || '(Nodo destino)';
                const strokeColor = conn.color || '#3b82f6';

                return (
                  <div
                    key={conn.id || index}
                    className="p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-blue-300 dark:hover:border-blue-700 shadow-2xs transition-all space-y-2"
                  >
                    {/* Fila superior: Indicador de color y Nombres */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-black/10 dark:border-white/10"
                          style={{ backgroundColor: strokeColor }}
                          title={`Color: ${strokeColor}`}
                        />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {fromTitle}
                        </span>
                        {conn.arrow === 'both' ? (
                          <ArrowLeftRight className="w-3 h-3 shrink-0 text-slate-400" />
                        ) : (
                          <ArrowRight className="w-3 h-3 shrink-0 text-slate-400" />
                        )}
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {toTitle}
                        </span>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditConnector && onEditConnector(conn)}
                          className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Editar Conector"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteConnector && onDeleteConnector(conn.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Eliminar Conector"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Fila inferior: Etiquetas y metadatos */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {conn.label && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60 truncate max-w-[140px]">
                          «{conn.label}»
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                        {conn.style || 'dashed'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {conn.layer === 'below' ? 'Detrás' : 'Frente'}
                      </span>
                      {conn.shadow && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800/60">
                          Sombra {conn.shadowPreset || 'soft'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};
