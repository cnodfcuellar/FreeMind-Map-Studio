import React, { useState } from 'react';
import {
  MindNode,
  LayoutType,
  MindMapTheme,
  MindMap,
  Connector,
  EdgeStyle,
  EdgeBorderStyle,
  EdgeProfile,
  BackgroundPatternStyle,
} from '../types/mindmap';
import { ContentTab } from './organisms/toolpanel/ContentTab';
import { FormatTab } from './organisms/toolpanel/FormatTab';
import { NotesTab } from './organisms/toolpanel/NotesTab';
import { IconsTab } from './organisms/toolpanel/IconsTab';
import { CloudsTab } from './organisms/toolpanel/CloudsTab';
import { ThemeTab } from './organisms/toolpanel/ThemeTab';
import { useMindMapStore } from '../hooks/useMindMapStore';
import { THEMES } from '../utils/themes';
import {
  Sliders,
  X,
  Type,
  Palette,
  FileText,
  Smile,
  Cloud,
  Layers,
} from 'lucide-react';

export interface ToolPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenConnectorModal?: (fromId?: string) => void;
  onEditConnector?: (connector: Connector) => void;
  onOpenIconPackModal?: () => void;

  // Propiedades opcionales para testing o inyección externa (retrocompatibilidad)
  selectedNode?: MindNode | null;
  currentTheme?: MindMapTheme;
  layout?: LayoutType;
  mindMap?: MindMap;
  onUpdateNode?: (nodeId: string, updates: Partial<MindNode>) => void;
  onUpdateMapTheme?: (themeId: string) => void;
  onUpdateMapLayout?: (layout: LayoutType) => void;
  onUpdateMapEdgeStyle?: (edgeStyle: EdgeStyle) => void;
  onUpdateMapEdgeProfile?: (edgeProfile: EdgeProfile) => void;
  onUpdateMapEdgeWidth?: (width: number) => void;
  onUpdateMapEdgeColor?: (color: string | undefined) => void;
  onUpdateMapEdgeDash?: (dash: EdgeBorderStyle) => void;
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
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
  onApplyIconsToChildren?: (nodeId: string) => void;
  onApplyIconsToSiblings?: (nodeId: string) => void;
  onDeleteConnector?: (connectorId: string) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<Connector>) => void;
  onUpdateMapGaps?: (gaps: { horizontal?: number; vertical?: number }) => void;
  onUpdateMapBackground?: (config: {
    backgroundColor?: string;
    backgroundPattern?: BackgroundPatternStyle;
    backgroundPatternColor?: string;
    backgroundPatternSize?: number;
    backgroundPatternOpacity?: number;
  }) => void;
  onUpdateMapBackgroundColor?: (backgroundColor?: string) => void;
  onUpdateMapBackgroundPattern?: (patternConfig: {
    pattern?: BackgroundPatternStyle;
    patternColor?: string;
    patternSize?: number;
    patternOpacity?: number;
  }) => void;
  onUpdateMapSpacing?: (horizontalGap: number, verticalGap: number) => void;
  onUpdateMapVisibility?: (visibility: {
    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
    showAllNotesInline?: boolean;
  }) => void;
  onResetMapBackground?: () => void;
}

export type TabType = 'content' | 'format' | 'notes' | 'icons' | 'clouds' | 'theme';

export const ToolPanel: React.FC<ToolPanelProps> = (props) => {
  const store = useMindMapStore();
  const [activeTab, setActiveTab] = useState<TabType>('format');

  const isOpen = props.isOpen ?? store.isToolPanelOpen;
  const onClose = props.onClose ?? (() => store.setIsToolPanelOpen(false));

  const mindMap = props.mindMap ?? store.mindMap;
  const selectedNodeId = store.selectedNodeId;
  const selectedNode =
    props.selectedNode !== undefined
      ? props.selectedNode
      : selectedNodeId
      ? mindMap.nodes[selectedNodeId] || null
      : null;
  const currentTheme = props.currentTheme ?? (THEMES[mindMap.themeId] || THEMES.default);
  const layout = props.layout ?? mindMap.layout;

  const onUpdateNode = props.onUpdateNode ?? store.updateNode;
  const onApplyStyleToChildren = props.onApplyStyleToChildren ?? store.handleApplyStyleToChildren;
  const onApplyStyleToSiblings = props.onApplyStyleToSiblings ?? store.handleApplyStyleToSiblings;
  const onApplyIconsToChildren = props.onApplyIconsToChildren ?? store.handleApplyIconsToChildren;
  const onApplyIconsToSiblings = props.onApplyIconsToSiblings ?? store.handleApplyIconsToSiblings;
  const onRandomizeEdgeColors = props.onRandomizeEdgeColors ?? store.handleRandomizeEdgeColors;

  const onUpdateMapTheme = props.onUpdateMapTheme ?? store.updateMapTheme;
  const onUpdateMapLayout = props.onUpdateMapLayout ?? store.updateMapLayout;
  const onUpdateMapEdgeStyle = props.onUpdateMapEdgeStyle ?? store.updateMapEdgeStyle;
  const onUpdateMapEdgeProfile = props.onUpdateMapEdgeProfile ?? store.updateMapEdgeProfile;
  const onUpdateMapEdgeWidth = props.onUpdateMapEdgeWidth ?? store.updateMapEdgeWidth;
  const onUpdateMapEdgeColor = props.onUpdateMapEdgeColor ?? store.updateMapEdgeColor;
  const onUpdateMapEdgeDash = props.onUpdateMapEdgeDash ?? store.updateMapEdgeDash;
  const onUpdateMapEdgeShadow = props.onUpdateMapEdgeShadow ?? store.updateMapEdgeShadow;
  const onApplyEdgeStyleToAllNodes = props.onApplyEdgeStyleToAllNodes ?? store.applyEdgeStyleToAllNodes;
  const onApplyEdgeProfileToAllNodes = props.onApplyEdgeProfileToAllNodes ?? store.applyEdgeProfileToAllNodes;
  const onUpdateMapBackground = props.onUpdateMapBackground ?? store.updateMapBackground;
  const onResetMapBackground = props.onResetMapBackground ?? store.resetMapBackground;
  const onDeleteConnector = props.onDeleteConnector ?? store.deleteConnector;
  const onUpdateConnector = props.onUpdateConnector ?? store.updateConnector;

  if (!isOpen) return null;

  return (
    <aside className="w-84 bg-[var(--sp-bg)] border-l border-[var(--sp-border)] shadow-xl flex flex-col z-10 h-full overflow-hidden transition-all select-none">
      {/* 1. Header del panel */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-[var(--sp-bg2)]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-sm text-[var(--sp-text)]">Panel de Propiedades</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Navegación de pestañas en grid / scroll adaptable */}
      <div className="grid grid-cols-6 border-b border-slate-200 bg-[var(--sp-bg2)] text-[11px] font-medium divide-x divide-slate-200/60 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          title="Texto & Contenido"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]'
          }`}
        >
          <Type className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Texto</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('format')}
          title="Estilos & Forma"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'format'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]'
          }`}
        >
          <Palette className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Estilos</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          title="Notas Markdown"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Notas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('icons')}
          title="Iconos"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'icons'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]'
          }`}
        >
          <Smile className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Iconos</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clouds')}
          title="Nubes de agrupación"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'clouds'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Nubes</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          title="Configuración del Mapa"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Mapa</span>
        </button>
      </div>

      {/* 3. Contenido de las pestañas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[var(--sp-text)]">
        {!selectedNode && activeTab !== 'theme' ? (
          <div className="py-12 text-center text-slate-400">
            <p className="font-medium text-sm text-slate-600">Ningún nodo seleccionado</p>
            <p className="text-xs mt-1 text-slate-400">Haz clic en cualquier nodo para modificar sus propiedades.</p>
          </div>
        ) : (
          <>
            {activeTab === 'content' && selectedNode && (
              <ContentTab
                selectedNode={selectedNode}
                onUpdateNode={onUpdateNode}
                onOpenIconPackModal={props.onOpenIconPackModal}
              />
            )}

            {activeTab === 'format' && selectedNode && (
              <FormatTab
                selectedNode={selectedNode}
                onUpdateNode={onUpdateNode}
                onApplyStyleToChildren={onApplyStyleToChildren}
                onApplyStyleToSiblings={onApplyStyleToSiblings}
              />
            )}

            {activeTab === 'notes' && selectedNode && (
              <NotesTab selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
            )}

            {activeTab === 'icons' && selectedNode && (
              <IconsTab
                selectedNode={selectedNode}
                onUpdateNode={onUpdateNode}
                onOpenIconPackModal={props.onOpenIconPackModal}
                onApplyIconsToChildren={onApplyIconsToChildren}
                onApplyIconsToSiblings={onApplyIconsToSiblings}
              />
            )}

            {activeTab === 'clouds' && selectedNode && (
              <CloudsTab selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
            )}

            {activeTab === 'theme' && (
              <ThemeTab
                currentTheme={currentTheme}
                layout={layout}
                mindMap={mindMap}
                onUpdateMapTheme={onUpdateMapTheme}
                onUpdateMapLayout={onUpdateMapLayout}
                onUpdateMapEdgeStyle={onUpdateMapEdgeStyle}
                onUpdateMapEdgeProfile={onUpdateMapEdgeProfile}
                onUpdateMapEdgeWidth={onUpdateMapEdgeWidth}
                onUpdateMapEdgeColor={onUpdateMapEdgeColor}
                onUpdateMapEdgeDash={onUpdateMapEdgeDash}
                onUpdateMapEdgeShadow={onUpdateMapEdgeShadow}
                onApplyEdgeStyleToAllNodes={onApplyEdgeStyleToAllNodes}
                onApplyEdgeProfileToAllNodes={onApplyEdgeProfileToAllNodes}
                onRandomizeEdgeColors={onRandomizeEdgeColors}
                onUpdateMapGaps={
                  props.onUpdateMapGaps ??
                  ((gaps) => {
                    const h = gaps.horizontal ?? mindMap.horizontalGap ?? 54;
                    const v = gaps.vertical ?? mindMap.verticalGap ?? 14;
                    if (props.onUpdateMapSpacing) {
                      props.onUpdateMapSpacing(h, v);
                    } else {
                      store.updateMapSpacing(h, v);
                    }
                  })
                }
                onOpenConnectorModal={props.onOpenConnectorModal}
                onEditConnector={props.onEditConnector}
                onDeleteConnector={onDeleteConnector}
                onUpdateConnector={onUpdateConnector}
                onUpdateMapBackground={onUpdateMapBackground}
                onResetMapBackground={onResetMapBackground}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
};
