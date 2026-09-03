import React, { useState } from 'react';
import {
  MindNode,
  LayoutType,
  MindMapTheme,
  MindMap,
  Connector,
  EdgeStyle,
  EdgeProfile,
  BackgroundPatternStyle,
} from '../types/mindmap';
import { ContentTab } from './organisms/toolpanel/ContentTab';
import { FormatTab } from './organisms/toolpanel/FormatTab';
import { NotesTab } from './organisms/toolpanel/NotesTab';
import { IconsTab } from './organisms/toolpanel/IconsTab';
import { CloudsTab } from './organisms/toolpanel/CloudsTab';
import { ThemeTab } from './organisms/toolpanel/ThemeTab';
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
  selectedNode: MindNode | null;
  currentTheme: MindMapTheme;
  layout: LayoutType;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onUpdateMapTheme: (themeId: string) => void;
  onUpdateMapLayout: (layout: LayoutType) => void;
  mindMap?: MindMap;
  onUpdateMapEdgeStyle?: (edgeStyle: EdgeStyle) => void;
  onUpdateMapEdgeProfile?: (edgeProfile: EdgeProfile) => void;
  onUpdateMapEdgeWidth?: (width: number) => void;
  onUpdateMapEdgeColor?: (color: string | undefined) => void;
  onUpdateMapEdgeDash?: (dash: 'solid' | 'dashed' | 'dotted') => void;
  onApplyEdgeStyleToAllNodes?: (edgeStyle: EdgeStyle) => void;
  onApplyEdgeProfileToAllNodes?: (edgeProfile: EdgeProfile) => void;
  onRandomizeEdgeColors?: () => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
  onApplyIconsToChildren?: (nodeId: string) => void;
  onApplyIconsToSiblings?: (nodeId: string) => void;
  onOpenConnectorModal?: (fromId?: string) => void;
  onDeleteConnector?: (connectorId: string) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<Connector>) => void;
  onUpdateMapGaps?: (gaps: { horizontal?: number; vertical?: number }) => void;
  onOpenIconPackModal?: () => void;
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
  const { selectedNode, isOpen, onClose } = props;
  const [activeTab, setActiveTab] = useState<TabType>('content');

  if (!isOpen) return null;

  return (
    <aside className="w-84 bg-white border-l border-slate-200 shadow-xl flex flex-col z-10 h-full overflow-hidden transition-all select-none">
      {/* 1. Header del panel */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-sm text-slate-800">Panel de Propiedades</h2>
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
      <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50/50 text-[11px] font-medium divide-x divide-slate-200/60 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          title="Texto & Contenido"
          className={`flex flex-col items-center justify-center py-2 px-1 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 mb-0.5" />
          <span className="truncate w-full text-center">Mapa</span>
        </button>
      </div>

      {/* 3. Contenido de las pestañas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700">
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
                onUpdateNode={props.onUpdateNode}
                onOpenIconPackModal={props.onOpenIconPackModal}
              />
            )}

            {activeTab === 'format' && selectedNode && (
              <FormatTab
                selectedNode={selectedNode}
                onUpdateNode={props.onUpdateNode}
                onApplyStyleToChildren={props.onApplyStyleToChildren}
                onApplyStyleToSiblings={props.onApplyStyleToSiblings}
              />
            )}

            {activeTab === 'notes' && selectedNode && (
              <NotesTab selectedNode={selectedNode} onUpdateNode={props.onUpdateNode} />
            )}

            {activeTab === 'icons' && selectedNode && (
              <IconsTab
                selectedNode={selectedNode}
                onUpdateNode={props.onUpdateNode}
                onOpenIconPackModal={props.onOpenIconPackModal}
                onApplyIconsToChildren={props.onApplyIconsToChildren}
                onApplyIconsToSiblings={props.onApplyIconsToSiblings}
              />
            )}

            {activeTab === 'clouds' && selectedNode && (
              <CloudsTab selectedNode={selectedNode} onUpdateNode={props.onUpdateNode} />
            )}

            {activeTab === 'theme' && (
              <ThemeTab
                currentTheme={props.currentTheme}
                layout={props.layout}
                mindMap={props.mindMap}
                onUpdateMapTheme={props.onUpdateMapTheme}
                onUpdateMapLayout={props.onUpdateMapLayout}
                onUpdateMapEdgeStyle={props.onUpdateMapEdgeStyle}
                onUpdateMapEdgeProfile={props.onUpdateMapEdgeProfile}
                onUpdateMapEdgeWidth={props.onUpdateMapEdgeWidth}
                onUpdateMapEdgeColor={props.onUpdateMapEdgeColor}
                onUpdateMapEdgeDash={props.onUpdateMapEdgeDash}
                onApplyEdgeStyleToAllNodes={props.onApplyEdgeStyleToAllNodes}
                onApplyEdgeProfileToAllNodes={props.onApplyEdgeProfileToAllNodes}
                onRandomizeEdgeColors={props.onRandomizeEdgeColors}
                onUpdateMapGaps={props.onUpdateMapGaps}
                onOpenConnectorModal={props.onOpenConnectorModal}
                onDeleteConnector={props.onDeleteConnector}
                onUpdateConnector={props.onUpdateConnector}
                onUpdateMapBackground={props.onUpdateMapBackground}
                onResetMapBackground={props.onResetMapBackground}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
};
