# Proyecto completo

## index.html

\\html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>FreeMind Map Studio - Mapas Mentales Offline y Portables</title>
    <meta name="description" content="Editor de mapas mentales offline y portable inspirado en Freeplane y Mindomo. Exporta e importa archivos .mm, HTML portable, JSON, Markdown e imágenes." />
    <meta name="theme-color" content="#3b82f6" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased overflow-hidden select-none">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\\n


## src/App.tsx

\\tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  MindNode,
  NodeShape,
  EdgeStyle,
  EdgeProfile,
  LayoutType,
  Connector,
  BackgroundPatternStyle,
} from './types/mindmap';
import { THEMES } from './utils/themes';
import { BLANK_MAP } from './utils/sampleMaps';
import { saveCurrentMap } from './utils/storage';
import { applyThemeRestyle, applyBackgroundUpdate } from './utils/mapTheme';
import { loadUiTheme, applyUiTheme, getNextTheme, UiTheme } from './utils/uiTheme';
import { ListTree, Sliders } from 'lucide-react';

// Store Zustand & Hooks
import { useMindMapStore } from './hooks/useMindMapStore';
import { useSearchFilter } from './hooks/useSearchFilter';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Template & Atoms
import { MainEditorLayout } from './components/templates/MainEditorLayout';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';


// Componentes Principales (Organisms)
import { MenuBar } from './components/MenuBar';
import { ToolBar } from './components/ToolBar';
import { FilterBar } from './components/FilterBar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { ToolPanel } from './components/ToolPanel';
import { OutlineView } from './components/OutlineView';
import { PresentationMode } from './components/PresentationMode';
import { StatusBar } from './components/StatusBar';

// Modales (Organisms)
import { ExportImportModal } from './components/Modals/ExportImportModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { SavedMapsModal } from './components/Modals/SavedMapsModal';
import { ConnectorModal } from './components/Modals/ConnectorModal';
import { IconPackModal } from './components/Modals/IconPackModal';
import { ElaboratePresentationSystem } from './components/Presentation/ElaboratePresentationSystem';

export default function App() {
  const store = useMindMapStore();
  const {
    mindMap,
    setMindMap,
    historyPast,
    historyFuture,
    selectedNodeId,
    setSelectedNodeId,
    editingNodeId,
    setEditingNodeId,
    isOutlineOpen,
    setIsOutlineOpen,
    isOutlineFullscreen,
    setIsOutlineFullscreen,
    isPresentationMode,
    setIsPresentationMode,
    isToolPanelOpen,
    setIsToolPanelOpen,
    isFilterBarOpen,
    setIsFilterBarOpen,
    filterOptions,
    setFilterOptions,
    pushHistory,
    handleUndo,
    handleRedo,
    updateNode,
    handleAddChild,
    handleAddSibling,
    handleDeleteNode,
    handleToggleFold,
    handleFoldAll,
    handleUnfoldAll,
    handleReparentNode,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
    focusTarget,
    setFocusTarget,
    handleApplyStyleToChildren,
    handleApplyStyleToSiblings,
    handleApplyIconsToChildren,
    handleApplyIconsToSiblings,
    handleRandomizeEdgeColors,
  } = store;

  // Estado local de Modales
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isSavedMapsModalOpen, setIsSavedMapsModalOpen] = useState(false);
  const [isIconPackModalOpen, setIsIconPackModalOpen] = useState(false);
  const [connectorSourceId, setConnectorSourceId] = useState<string | null>(null);
  const [presentationType, setPresentationType] = useState<'classic' | 'dynamic' | 'elaborate'>('dynamic');
  const [viewport, setViewport] = useState<{ zoom: number; x: number; y: number }>({ zoom: 1, x: 0, y: 0 });

  // Tema de interfaz claro/oscuro/sepia (persistido, aplicado a <html>)
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => loadUiTheme());
  useEffect(() => {
    applyUiTheme(uiTheme);
  }, [uiTheme]);

  const isAnyModalOpen = Boolean(
    isExportModalOpen ||
      isShortcutsModalOpen ||
      isTemplatesModalOpen ||
      isSavedMapsModalOpen ||
      isIconPackModalOpen ||
      connectorSourceId
  );

  const handleCloseModals = () => {
    setIsExportModalOpen(false);
    setIsShortcutsModalOpen(false);
    setIsTemplatesModalOpen(false);
    setIsSavedMapsModalOpen(false);
    setIsIconPackModalOpen(false);
    setConnectorSourceId(null);
  };

  // Atajos de teclado globales
  useKeyboardShortcuts({
    isAnyModalOpen,
    onCloseModals: handleCloseModals,
  });

  // Tema activo y Filtro
  const currentTheme = useMemo(() => {
    return THEMES[mindMap.themeId] || THEMES.default;
  }, [mindMap.themeId]);

  const { searchMatches, availableTags } = useSearchFilter(mindMap, filterOptions);
  const selectedNode = selectedNodeId ? mindMap.nodes[selectedNodeId] || null : null;

  return (
    <ErrorBoundary fallbackTitle="Error en el Editor de Mapas Mentales">
      <MainEditorLayout
        isPresentationMode={isPresentationMode}

      isOutlineOpen={isOutlineOpen}
      isOutlineFullscreen={isOutlineFullscreen}
      isToolPanelOpen={isToolPanelOpen}
      isFilterBarOpen={isFilterBarOpen}
      menuBar={
        <MenuBar
          mindMap={mindMap}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onNewMap={() => {
            pushHistory(mindMap);
            setMindMap({
              ...BLANK_MAP,
              id: `map-${Date.now()}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            setSelectedNodeId('root');
          }}
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onOpenSavedMaps={() => setIsSavedMapsModalOpen(true)}
          onSaveMap={() => saveCurrentMap(mindMap)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenImportModal={() => setIsExportModalOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAddChild={() => handleAddChild()}
          onAddSibling={() => handleAddSibling()}
          onDeleteNode={() => handleDeleteNode()}
          onToggleOutline={() => setIsOutlineOpen((o) => !o)}
          onStartPresentation={(mode) => {
            if (mode === 'elaborate') {
              setPresentationType('elaborate');
            } else if (mode === 'classic') {
              setPresentationType('classic');
            } else {
              setPresentationType('dynamic');
            }
            setIsPresentationMode(true);
          }}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onToggleFullscreen={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          onFoldAll={handleFoldAll}
          onUnfoldAll={handleUnfoldAll}
          onOpenConnectorModal={() => setConnectorSourceId(selectedNodeId || mindMap.rootId)}
          onToggleCloud={() => {
            if (selectedNodeId) {
              const curr = mindMap.nodes[selectedNodeId];
              updateNode(selectedNodeId, {
                cloud: curr?.cloud?.enabled
                  ? undefined
                  : {
                      enabled: true,
                      color: '#3b82f6',
                      shape: 'cloud-scallop',
                      opacity: 0.08,
                      bgType: 'color',
                      borderColor: '#3b82f6',
                      borderWidth: 1.5,
                      borderDash: 'dashed',
                      shadow: true,
                    },
              });
            }
          }}
          onTitleChange={(newTitle) =>
            setMindMap((m) => ({ ...m, title: newTitle, updatedAt: Date.now() }))
          }
          onOpenIconPack={() => setIsIconPackModalOpen(true)}
          uiTheme={uiTheme}
          onCycleTheme={() => setUiTheme((t) => getNextTheme(t))}
          onChangeTheme={(themeId) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, themeId, updatedAt: Date.now() }));
          }}
          onChangeShape={(shape) => {
            if (selectedNode) updateNode(selectedNode.id, { shape });
          }}
          onResetFormat={() => {
            if (selectedNode) {
              updateNode(selectedNode.id, {
                shape: 'bubble',
                color: undefined,
                textColor: undefined,
                borderColor: undefined,
                borderWidth: undefined,
                borderDash: undefined,
                bgType: 'color',
                gradientColor1: undefined,
                gradientColor2: undefined,
                bold: false,
                italic: false,
                fontSize: 14,
                fontFamily: undefined,
                textAlign: 'center',
                body: undefined,
                bodyFontSize: 13,
                bodyBold: false,
                bodyItalic: false,
                bodyColor: undefined,
                bodyAlign: 'left',
              });
            }
          }}
        />
      }
      toolBar={
        <ToolBar
          mindMap={mindMap}
          selectedNode={selectedNode}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          isToolPanelOpen={isToolPanelOpen}
          isFilterBarOpen={isFilterBarOpen}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAddChild={() => handleAddChild()}
          onAddSibling={() => handleAddSibling()}
          onDeleteNode={() => handleDeleteNode()}
          onToggleOutline={() => setIsOutlineOpen((o) => !o)}
          onToggleToolPanel={() => setIsToolPanelOpen((t) => !t)}
          onToggleFilterBar={() => setIsFilterBarOpen((f) => !f)}
          onToggleGlobalVisibility={(key: 'hideAllBodies' | 'hideAllImages' | 'hideAllTags' | 'hideAllIcons' | 'hideAllLinks') => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, [key]: !m[key], updatedAt: Date.now() }));
          }}
          onStartPresentation={(mode) => {
            if (mode === 'elaborate') {
              setPresentationType('elaborate');
            } else if (mode === 'classic') {
              setPresentationType('classic');
            } else {
              setPresentationType('dynamic');
            }
            setIsPresentationMode(true);
          }}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenConnectorModal={() => setConnectorSourceId(selectedNodeId || mindMap.rootId)}
          onToggleCloud={() => {
            if (selectedNodeId) {
              const curr = mindMap.nodes[selectedNodeId];
              updateNode(selectedNodeId, {
                cloud: curr?.cloud?.enabled
                  ? undefined
                  : {
                      enabled: true,
                      color: '#3b82f6',
                      shape: 'cloud-scallop',
                      opacity: 0.08,
                      bgType: 'color',
                      borderColor: '#3b82f6',
                      borderWidth: 1.5,
                      borderDash: 'dashed',
                      shadow: true,
                    },
              });
            }
          }}
          onChangeShape={(shape: NodeShape) => {
            if (selectedNode) updateNode(selectedNode.id, { shape });
          }}
        />
      }
      filterBar={
        <FilterBar
          filterOptions={filterOptions}
          availableTags={availableTags}
          matchCount={searchMatches ? searchMatches.size : 0}
          isOpen={isFilterBarOpen}
          onClose={() => setIsFilterBarOpen(false)}
          onUpdateFilter={(up) => setFilterOptions((f) => ({ ...f, ...up }))}
          onClearFilter={() =>
            setFilterOptions({ query: '', showAncestors: true, showDescendants: true })
          }
        />
      }
      outlineView={
        <OutlineView
          mindMap={mindMap}
          selectedNodeId={selectedNodeId}
          isOpen={isOutlineOpen}
          isFullscreen={isOutlineFullscreen}
          onToggleFullscreen={() => setIsOutlineFullscreen((f) => !f)}
          onSelectNode={(id) => {
            setSelectedNodeId(id);
            setFocusTarget({ nodeId: id, timestamp: Date.now() });
          }}
          onUpdateText={(id, text) => updateNode(id, { text })}
          onAddChild={(pid) => handleAddChild(pid)}
          onAddSibling={(sid) => handleAddSibling(sid)}
          onDeleteNode={(nid) => handleDeleteNode(nid)}
          onToggleFold={(fid) => handleToggleFold(fid)}
          onFoldAll={handleFoldAll}
          onUnfoldAll={handleUnfoldAll}
          onClose={() => setIsOutlineOpen(false)}
        />
      }
      canvas={
        <>
          {/* Quick Reveal Floating Buttons */}
          {!isOutlineOpen && !isOutlineFullscreen && !isPresentationMode && (
            <button
              type="button"
              onClick={() => setIsOutlineOpen(true)}
              title="Mostrar panel lateral de esquema (Alt+O)"
              className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-md text-slate-700 hover:text-indigo-600 hover:border-indigo-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <ListTree className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>Esquema</span>
            </button>
          )}

          {!isToolPanelOpen && !isOutlineFullscreen && !isPresentationMode && (
            <button
              type="button"
              onClick={() => setIsToolPanelOpen(true)}
              title="Mostrar panel de propiedades (Alt+P)"
              className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Propiedades</span>
            </button>
          )}

          {!isOutlineFullscreen && (
            <MindMapCanvas
              mindMap={mindMap}
              theme={currentTheme}
              selectedNodeId={selectedNodeId}
              editingNodeId={editingNodeId}
              searchMatches={searchMatches}
              focusTarget={focusTarget}
              onSelectNode={(id) => setSelectedNodeId(id)}
              onStartEditing={(id) => setEditingNodeId(id)}
              onFinishEditing={() => setEditingNodeId(null)}
              onUpdateNodeText={(id, text) => updateNode(id, { text })}
              onAddChildNode={(pid) => handleAddChild(pid)}
              onAddSiblingNode={(sid) => handleAddSibling(sid)}
              onDeleteNode={(nid) => handleDeleteNode(nid)}
              onToggleFoldNode={(fid) => handleToggleFold(fid)}
              onReparentNode={handleReparentNode}
              onOpenNotePanel={(nid) => {
                setSelectedNodeId(nid);
                setIsToolPanelOpen(true);
              }}
              onOpenConnectorModal={(fromId) => setConnectorSourceId(fromId)}
              onToggleCloud={(nid) => {
                const curr = mindMap.nodes[nid];
                updateNode(nid, {
                  cloud: curr?.cloud?.enabled
                    ? undefined
                    : {
                        enabled: true,
                        color: '#3b82f6',
                        shape: 'cloud-scallop',
                        opacity: 0.08,
                        bgType: 'color',
                        borderColor: '#3b82f6',
                        borderWidth: 1.5,
                        borderDash: 'dashed',
                        shadow: true,
                      },
                });
              }}
              onCopyNode={handleCopyNode}
              onCutNode={handleCutNode}
              onPasteNode={handlePasteNode}
              onApplyStyleToChildren={handleApplyStyleToChildren}
              onApplyStyleToSiblings={handleApplyStyleToSiblings}
              isPresentationMode={isPresentationMode && presentationType === 'dynamic'}
              onClosePresentation={() => setIsPresentationMode(false)}
              onUpdateMindMap={(updated) => setMindMap(updated)}
              onViewportChange={setViewport}
              onUpdateConnector={(connectorId, updates) => {
                pushHistory(mindMap);
                setMindMap((m) => ({
                  ...m,
                  connectors: (m.connectors || []).map((c) =>
                    c.id === connectorId ? { ...c, ...updates } : c
                  ),
                  updatedAt: Date.now(),
                }));
              }}
            />
          )}
        </>
      }
      toolPanel={
        <ToolPanel
          selectedNode={selectedNode}
          currentTheme={currentTheme}
          layout={mindMap.layout}
          isOpen={isToolPanelOpen}
          onClose={() => setIsToolPanelOpen(false)}
          onUpdateNode={updateNode}
          onApplyStyleToChildren={handleApplyStyleToChildren}
          onApplyStyleToSiblings={handleApplyStyleToSiblings}
          onApplyIconsToChildren={handleApplyIconsToChildren}
          onApplyIconsToSiblings={handleApplyIconsToSiblings}
          onRandomizeEdgeColors={handleRandomizeEdgeColors}
          onUpdateMapTheme={(themeId) => {
            pushHistory(mindMap);
            setMindMap((m) => applyThemeRestyle(m, themeId));
          }}
          onUpdateMapLayout={(layout: LayoutType) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, layout, updatedAt: Date.now() }));
          }}
          mindMap={mindMap}
          onUpdateMapEdgeStyle={(edgeStyle: EdgeStyle) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...node, edgeStyle: undefined };
              });
              return { ...m, edgeStyle, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeWidth={(edgeWidth: number) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...node, edgeWidth: undefined };
              });
              return { ...m, edgeWidth, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeProfile={(edgeProfile: EdgeProfile) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...node, edgeProfile: undefined };
              });
              return { ...m, edgeProfile, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeColor={(edgeColor: string) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...node, edgeColor: undefined };
              });
              return { ...m, edgeColor, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeDash={(edgeDash: 'solid' | 'dashed' | 'dotted') => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...node, edgeDash: undefined };
              });
              return { ...m, edgeDash, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapBackgroundColor={(backgroundColor?: string) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, backgroundColor, updatedAt: Date.now() }));
          }}
          onUpdateMapBackground={(config: {
            backgroundColor?: string;
            backgroundPattern?: BackgroundPatternStyle;
            backgroundPatternColor?: string;
            backgroundPatternSize?: number;
            backgroundPatternOpacity?: number;
          }) => {
            pushHistory(mindMap);
            setMindMap((m) => applyBackgroundUpdate(m, config));
          }}
          onResetMapBackground={() => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              backgroundColor: undefined,
              backgroundPattern: undefined,
              backgroundPatternColor: undefined,
              backgroundPatternSize: undefined,
              backgroundPatternOpacity: undefined,
              updatedAt: Date.now(),
            }));
          }}
          onUpdateMapBackgroundPattern={(patternConfig: {
            pattern?: BackgroundPatternStyle;
            patternColor?: string;
            patternSize?: number;
            patternOpacity?: number;
          }) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              backgroundPattern: patternConfig.pattern,
              backgroundPatternColor: patternConfig.patternColor,
              backgroundPatternSize: patternConfig.patternSize,
              backgroundPatternOpacity: patternConfig.patternOpacity,
              updatedAt: Date.now(),
            }));
          }}
          onUpdateMapSpacing={(horizontalGap: number, verticalGap: number) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              horizontalGap,
              verticalGap,
              updatedAt: Date.now(),
            }));
          }}
          onUpdateMapVisibility={(visibility: {
            hideAllBodies?: boolean;
            hideAllImages?: boolean;
            hideAllTags?: boolean;
            hideAllIcons?: boolean;
            hideAllLinks?: boolean;
            showAllNotesInline?: boolean;
          }) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              ...visibility,
              updatedAt: Date.now(),
            }));
          }}
          onOpenIconPackModal={() => setIsIconPackModalOpen(true)}
        />
      }
      statusBar={
        <StatusBar
          totalNodes={Object.keys(mindMap.nodes).length}
          selectedNodeText={selectedNode?.text || null}
          selectedNodeId={selectedNodeId}
          zoom={Math.round(viewport.zoom * 100)}
          positionX={Math.round(viewport.x)}
          positionY={Math.round(viewport.y)}
          mode={editingNodeId ? 'Editando' : 'Listo'}
        />
      }
      presentationOverlay={
        <>
          {presentationType === 'classic' && (
            <PresentationMode
              mindMap={mindMap}
              onClose={() => setIsPresentationMode(false)}
              onEditNode={(nodeId) => {
                setSelectedNodeId(nodeId);
                setIsPresentationMode(false);
                setIsToolPanelOpen(true);
              }}
              onUpdateNode={updateNode}
            />
          )}

          {presentationType === 'elaborate' && (
            <ElaboratePresentationSystem
              mindMap={mindMap}
              onClose={() => setIsPresentationMode(false)}
              onUpdateMindMap={(updated) => setMindMap(updated)}
            />
          )}
        </>
      }
      modals={
        <>
          <IconPackModal
            isOpen={isIconPackModalOpen}
            onClose={() => setIsIconPackModalOpen(false)}
            selectedNodeId={selectedNodeId}
            selectedNodeText={selectedNode?.text}
            currentNodeIcons={selectedNode?.icons || []}
            onToggleIcon={(iconId) => {
              if (!selectedNodeId) return;
              const current = mindMap.nodes[selectedNodeId]?.icons || [];
              const updated = current.includes(iconId)
                ? current.filter((i) => i !== iconId)
                : [...current, iconId];
              updateNode(selectedNodeId, { icons: updated });
            }}
          />

          <ExportImportModal
            mindMap={mindMap}
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onImportMap={(imported) => {
              pushHistory(mindMap);
              setMindMap(imported);
              setSelectedNodeId(imported.rootId);
            }}
          />

          <ShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
          />

          <TemplatesModal
            isOpen={isTemplatesModalOpen}
            onClose={() => setIsTemplatesModalOpen(false)}
            onSelectTemplate={(tmpl) => {
              pushHistory(mindMap);
              setMindMap(tmpl);
              setSelectedNodeId(tmpl.rootId);
            }}
          />

          <SavedMapsModal
            isOpen={isSavedMapsModalOpen}
            currentMapId={mindMap.id}
            onClose={() => setIsSavedMapsModalOpen(false)}
            onSelectMap={(loaded) => {
              pushHistory(mindMap);
              setMindMap(loaded);
              setSelectedNodeId(loaded.rootId);
            }}
            onNewMap={() => {
              pushHistory(mindMap);
              setMindMap({
                ...BLANK_MAP,
                id: `map-${Date.now()}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
              setSelectedNodeId('root');
            }}
          />

          <ConnectorModal
            mindMap={mindMap}
            fromNodeId={connectorSourceId}
            isOpen={Boolean(connectorSourceId)}
            onClose={() => setConnectorSourceId(null)}
            onSaveConnector={(conn: Connector) => {
              pushHistory(mindMap);
              setMindMap((m) => ({
                ...m,
                connectors: [...(m.connectors || []), conn],
                updatedAt: Date.now(),
              }));
            }}
          />
        </>
      }
    />
  </ErrorBoundary>
);
}
\\n

## src/components/FilterBar.tsx

\\tsx
import React from 'react';
import { FilterOptions } from '../types/mindmap';
import { Search, X, Tag, CheckSquare, Sparkles } from 'lucide-react';

interface FilterBarProps {
  filterOptions: FilterOptions;
  availableTags: string[];
  matchCount: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFilter: (updates: Partial<FilterOptions>) => void;
  onClearFilter: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  availableTags,
  matchCount,
  isOpen,
  onClose,
  onUpdateFilter,
  onClearFilter,
}) => {
  if (!isOpen) return null;

  const isFiltering =
    Boolean(filterOptions.query) ||
    Boolean(filterOptions.tag) ||
    Boolean(filterOptions.icon) ||
    filterOptions.minProgress !== undefined;

  return (
    <div className="h-10 bg-[var(--chrome-bar)] text-white px-4 flex items-center justify-between z-30 relative shrink-0 text-xs shadow-md border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 select-none">
      <div className="flex items-center gap-3 flex-1 max-w-3xl">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Filtro Rápido:</span>
        </div>

        {/* Text Query Input */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={filterOptions.query}
            onChange={(e) => onUpdateFilter({ query: e.target.value })}
            placeholder="Buscar por texto en nodos..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500"
          />
          {filterOptions.query && (
            <button
              onClick={() => onUpdateFilter({ query: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <select
            value={filterOptions.tag || ''}
            onChange={(e) => onUpdateFilter({ tag: e.target.value || undefined })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="">Todas las Etiquetas</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        )}

        {/* Progress Filter */}
        <select
          value={filterOptions.minProgress === undefined ? '' : String(filterOptions.minProgress)}
          onChange={(e) =>
            onUpdateFilter({
              minProgress: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
            })
          }
          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
        >
          <option value="">Cualquier Progreso</option>
          <option value="100">Solo 100% Completados</option>
          <option value="50">Progreso &ge; 50%</option>
          <option value="0">Con Progreso Activo</option>
        </select>

        {/* Results Counter */}
        {isFiltering && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{matchCount} {matchCount === 1 ? 'coincidencia' : 'coincidencias'}</span>
          </div>
        )}
      </div>

      {/* Clear & Close */}
      <div className="flex items-center gap-2">
        {isFiltering && (
          <button
            onClick={onClearFilter}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Limpiar filtros
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
\\n

## src/components/MenuBar.tsx

\\tsx
import React, { useState, useRef, useEffect } from 'react';
import { MindMap, NodeShape } from '../types/mindmap';
import { UiTheme } from '../utils/uiTheme';
import {
  FileText,
  Save,
  FolderOpen,
  Plus,
  FileDown,
  FileUp,
  Undo2,
  Redo2,
  Trash2,
  ListTree,
  Presentation,
  HelpCircle,
  Sparkles,
  Maximize,
  LayoutTemplate,
  Cloud,
  Link,
  ChevronDown,
  Check,
  Palette,
  Circle,
  Square,
  Star,
  ArrowRight,
  Hexagon,
  Type,
  Eraser,
  Map,
  Zap,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react';

interface MenuBarProps {
  mindMap: MindMap;
  canUndo: boolean;
  canRedo: boolean;
  onNewMap: () => void;
  onOpenTemplates: () => void;
  onOpenSavedMaps: () => void;
  onSaveMap: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDeleteNode: () => void;
  onToggleOutline: () => void;
  onStartPresentation: (mode?: 'classic' | 'dynamic' | 'elaborate') => void;
  onOpenShortcuts: () => void;
  onToggleFullscreen: () => void;
  onFoldAll: () => void;
  onUnfoldAll: () => void;
  onOpenConnectorModal: () => void;
  onToggleCloud: () => void;
  onTitleChange: (newTitle: string) => void;
  onOpenIconPack?: () => void;
  onChangeTheme?: (themeId: string) => void;
  onChangeShape?: (shape: NodeShape) => void;
  onResetFormat?: () => void;
  uiTheme?: UiTheme;
  onCycleTheme?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  mindMap,
  canUndo,
  canRedo,
  onNewMap,
  onOpenTemplates,
  onOpenSavedMaps,
  onSaveMap,
  onOpenExportModal,
  onOpenImportModal,
  onUndo,
  onRedo,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleOutline,
  onStartPresentation,
  onOpenShortcuts,
  onToggleFullscreen,
  onFoldAll,
  onUnfoldAll,
  onOpenConnectorModal,
  onToggleCloud,
  onTitleChange,
  onOpenIconPack,
  onChangeTheme,
  onChangeShape,
  onResetFormat,
  uiTheme = 'claro',
  onCycleTheme,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(mindMap.title);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(mindMap.title);
  }, [mindMap.title]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <header
      ref={menuRef}
      className="h-10 bg-[var(--chrome-bar)] text-white px-3 flex items-center justify-between z-50 relative shrink-0 select-none border-b border-slate-800 text-xs"
    >
      {/* Left: Brand & Dropdown Menus */}
      <div className="flex items-center gap-2">
        {/* Brand */}
        <div className="flex items-center gap-1.5 mr-2 font-bold text-slate-100 tracking-tight">
          <span className="text-base">🧠</span>
          <span className="hidden sm:inline font-bold">FreeMind Map Studio</span>
        </div>

        {/* ARCHIVO Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'file' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Archivo
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { onNewMap(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Nuevo Mapa</span>
              </button>
              <button
                onClick={() => { onOpenTemplates(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" /> Plantillas de Ejemplo</span>
              </button>
              <button
                onClick={() => { onOpenSavedMaps(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5 text-amber-600" /> Mis Mapas Guardados</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onSaveMap(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5 text-emerald-600" /> Guardar Ahora</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+S</kbd>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onOpenExportModal(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between font-semibold text-blue-600 hover:bg-blue-50"
              >
                <span className="flex items-center gap-2"><FileDown className="w-3.5 h-3.5" /> Exportar (.mm / HTML)</span>
              </button>
              <button
                onClick={() => { onOpenImportModal(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><FileUp className="w-3.5 h-3.5 text-purple-600" /> Importar Freeplane (.mm)</span>
              </button>
            </div>
          )}
        </div>

        {/* EDITAR Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'edit' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Editar
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                disabled={!canUndo}
                onClick={() => { onUndo(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Undo2 className="w-3.5 h-3.5" /> Deshacer</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Z</kbd>
              </button>
              <button
                disabled={!canRedo}
                onClick={() => { onRedo(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Redo2 className="w-3.5 h-3.5" /> Rehacer</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Y</kbd>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onDeleteNode(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-red-600 hover:bg-red-50"
              >
                <span className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Eliminar Rama</span>
                <kbd className="text-[10px] text-red-400 font-mono">Supr</kbd>
              </button>
            </div>
          )}
        </div>

        {/* INSERTAR Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('insert')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'insert' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Insertar
          </button>
          {openMenu === 'insert' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => { onAddChild(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-blue-600" /> Nodo Hijo</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Tab</kbd>
              </button>
              <button
                onClick={() => { onAddSibling(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-emerald-600" /> Nodo Hermano</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Enter</kbd>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onOpenConnectorModal(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Link className="w-3.5 h-3.5 text-cyan-600" /> Conector de Relación
              </button>
              <button
                onClick={() => { onToggleCloud(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-500" /> Nube de Rama
              </button>
              {onOpenIconPack && (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { onOpenIconPack(); setOpenMenu(null); }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Pack Iconos Vectoriales
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                      500+
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* FORMATO Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('format')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'format' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Formato
          </button>
          {openMenu === 'format' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temas Visuales</div>
              <button
                onClick={() => { onChangeTheme?.('default'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Clásico Freeplane
              </button>
              <button
                onClick={() => { onChangeTheme?.('forest'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Bosque Esmeralda
              </button>
              <button
                onClick={() => { onChangeTheme?.('rainbow'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-blue-500"></span> Arcoiris Vibrante
              </button>
              <button
                onClick={() => { onChangeTheme?.('sunset'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> Atardecer Cálido
              </button>
              <button
                onClick={() => { onChangeTheme?.('dark'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
              >
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600"></span> Modo Oscuro
              </button>

              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forma del Nodo</div>
              <button
                onClick={() => { onChangeShape?.('bubble'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3.5 h-2.5 rounded-sm border border-slate-500 block" /> Burbuja
              </button>
              <button
                onClick={() => { onChangeShape?.('fork'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="text-slate-500 font-bold ml-1 text-xs">─</span> Horquilla
              </button>
              <button
                onClick={() => { onChangeShape?.('rectangle'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="w-3.5 h-2.5 border border-slate-500 rounded-[1px]" /> Rectángulo
              </button>
              <button
                onClick={() => { onChangeShape?.('square'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Square className="w-3.5 h-3.5 text-slate-500" /> Cuadrada
              </button>
              <button
                onClick={() => { onChangeShape?.('oval'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="w-4 h-2.5 border border-slate-500 rounded-full" /> Óvalo
              </button>
              <button
                onClick={() => { onChangeShape?.('circle'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Circle className="w-3.5 h-3.5 text-slate-500" /> Circular
              </button>
              <button
                onClick={() => { onChangeShape?.('pill'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="w-4 h-2 border border-slate-500 rounded-full" /> Cápsula
              </button>
              <button
                onClick={() => { onChangeShape?.('hexagon'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Hexagon className="w-3.5 h-3.5 text-slate-500" /> Hexágono
              </button>
              <button
                onClick={() => { onChangeShape?.('arrow'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" /> Flecha
              </button>
              <button
                onClick={() => { onChangeShape?.('star'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Star className="w-3.5 h-3.5 text-slate-500" /> Estrella
              </button>

              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onResetFormat?.(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 font-medium"
              >
                <Eraser className="w-3.5 h-3.5" /> Restablecer Formato
              </button>
            </div>
          )}
        </div>

        {/* VER Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'view' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Ver
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => { onToggleOutline(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><ListTree className="w-3.5 h-3.5 text-indigo-600" /> Panel Lateral de Esquema</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Alt+O</kbd>
              </button>
              <button
                onClick={() => { onStartPresentation('classic'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                <span className="flex items-center gap-2"><Presentation className="w-3.5 h-3.5 text-purple-600" /> Presentación Clásica</span>
                <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Activo</span>
              </button>
              <button
                onClick={() => { onStartPresentation('dynamic'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-pink-50 hover:text-pink-600 cursor-pointer"
              >
                <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-pink-600" /> Presentación Dinámica (Lienzo)</span>
                <kbd className="text-[10px] text-slate-400 font-mono">F5</kbd>
              </button>
              <button
                onClick={() => { onStartPresentation('elaborate'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
              >
                <span className="flex items-center gap-2"><Map className="w-3.5 h-3.5 text-indigo-600" /> Presentación Elaborada (Espacial)</span>
                <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Activo</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onUnfoldAll(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>Desplegar Todo el Mapa</span>
              </button>
              <button
                onClick={() => { onFoldAll(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>Plegar Todas las Ramas</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onToggleFullscreen(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5" /> Pantalla Completa</span>
                <kbd className="text-[10px] text-slate-400 font-mono">F11</kbd>
              </button>
            </div>
          )}
        </div>

        {/* AYUDA Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'help' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Ayuda
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => { onOpenShortcuts(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 font-medium"
              >
                <span className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Atajos de Teclado</span>
                <kbd className="text-[10px] text-slate-400 font-mono">?</kbd>
              </button>
              <button
                onClick={() => { onOpenTemplates(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Guía Tutorial Freeplane
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Editable Map Title */}
      <div className="flex-1 max-w-sm mx-4 text-center">
        {isEditingTitle ? (
          <input
            type="text"
            autoFocus
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="w-full bg-slate-800 border border-blue-500 rounded px-2 py-0.5 text-xs text-white font-medium text-center outline-none"
          />
        ) : (
          <div
            title="Doble clic para cambiar el título del mapa"
            onDoubleClick={() => setIsEditingTitle(true)}
            className="cursor-pointer hover:bg-slate-800/80 px-2 py-0.5 rounded text-xs font-semibold text-slate-200 truncate transition-colors"
          >
            {mindMap.title}
          </div>
        )}
      </div>

      {/* Right: Offline Indicator + UI Theme */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">100% Offline</span>
        </div>
        {onCycleTheme && (
          <button
            type="button"
            onClick={onCycleTheme}
            title={`Tema de interfaz: ${uiTheme} (clic para cambiar)`}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {uiTheme === 'claro' && <Sun className="w-4 h-4" />}
            {uiTheme === 'oscuro' && <Moon className="w-4 h-4" />}
            {uiTheme === 'sepia' && <Coffee className="w-4 h-4" />}
          </button>
        )}
      </div>
    </header>
  );
};
\\n

## src/components/MindMapCanvas.tsx

\\tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MindMap,
  MindNode,
  CalculatedNodeLayout,
  MindMapTheme,
  Connector,
  SlideFrame,
} from '../types/mindmap';
import {
  computeMindMapLayout,
  generateEdgePath,
  generateRibbonEdgePath,
  computeCloudBounds,
} from '../utils/layoutEngine';
import { generateDefaultPresentationSlides } from '../utils/presentationGenerator';
import { MarkdownView } from '../utils/markdownRenderer';
import { NodeComponent } from './NodeComponent';
import { MiniMap } from './MiniMap';
import { CanvasBackgroundLayer } from './organisms/canvas/CanvasBackgroundLayer';
import { CanvasDrawingOverlay } from './organisms/canvas/CanvasDrawingOverlay';
import { CanvasPresentationHUD } from './organisms/canvas/CanvasPresentationHUD';
import { CanvasContextMenu } from './organisms/canvas/CanvasContextMenu';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Link,
  Cloud,
  CheckSquare,
  Copy,
  Scissors,
  Clipboard,
  Sparkles,
  GitFork,
  MoveHorizontal,
  Play,
  Sliders,
  X,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Undo2,
  Redo2,
  Crop,
  MousePointer,
  Maximize,
} from 'lucide-react';
import { calculateConnectorGeometry } from '../utils/connectorUtils';

interface MindMapCanvasProps {
  mindMap: MindMap;
  theme: MindMapTheme;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  searchMatches?: Set<string>;
  onSelectNode: (id: string | null) => void;
  onStartEditing: (id: string) => void;
  onFinishEditing: () => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (siblingId: string) => void;
  onDeleteNode: (id: string) => void;
  onToggleFoldNode: (id: string) => void;
  onReparentNode: (draggedId: string, targetParentId: string) => void;
  onOpenNotePanel: (id: string) => void;
  onOpenConnectorModal: (fromId: string) => void;
  onToggleCloud: (nodeId: string) => void;
  onCopyNode: (id: string) => void;
  onCutNode: (id: string) => void;
  onPasteNode: (targetParentId: string) => void;
  focusTarget?: { nodeId: string; timestamp: number } | null;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<Connector>) => void;
  // Direct Presentation Mode Props
  isPresentationMode?: boolean;
  onClosePresentation?: () => void;
  onUpdateMindMap?: (updated: MindMap) => void;
  initialPresentationMode?: 'editor' | 'play';
  onViewportChange?: (viewport: { zoom: number; x: number; y: number }) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  mindMap,
  theme,
  selectedNodeId,
  editingNodeId,
  searchMatches,
  onSelectNode,
  onStartEditing,
  onFinishEditing,
  onUpdateNodeText,
  onAddChildNode,
  onAddSiblingNode,
  onDeleteNode,
  onToggleFoldNode,
  onReparentNode,
  onOpenNotePanel,
  onOpenConnectorModal,
  onToggleCloud,
  onCopyNode,
  onCutNode,
  onPasteNode,
  focusTarget,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
  onUpdateConnector,
  isPresentationMode = false,
  onClosePresentation,
  onUpdateMindMap,
  initialPresentationMode = 'play',
  onViewportChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Report zoom/pan to parent (StatusBar) whenever the viewport changes
  useEffect(() => {
    onViewportChange?.({ zoom, x: pan.x, y: pan.y });
  }, [zoom, pan.x, pan.y, onViewportChange]);

  // Presentation Mode Internal States
  const [presMode, setPresMode] = useState<'editor' | 'play'>(initialPresentationMode);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);
  const [isOverviewActive, setIsOverviewActive] = useState<boolean>(false);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState<boolean>(true);
  const [editorTool, setEditorTool] = useState<'navigate' | 'pick_nodes' | 'draw_frame'>('pick_nodes');
  const [stagedNodeIds, setStagedNodeIds] = useState<Set<string>>(new Set());
  const [isDrawingFrame, setIsDrawingFrame] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Drag & Drop Node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);

  // Connector Interactive State
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [hoveredConnectorId, setHoveredConnectorId] = useState<string | null>(null);
  const [draggingConnectorId, setDraggingConnectorId] = useState<string | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  // Mini-map toggle
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  // Container dimensions for responsive minimap calculations
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  // Compute Layout of all nodes
  const layoutMap = React.useMemo(() => {
    return computeMindMapLayout(mindMap, { x: 0, y: 0 });
  }, [mindMap]);

  // Slides state (from mindMap or generated default)
  const slides = React.useMemo(() => {
    if (mindMap.presentationSlides !== undefined) {
      return mindMap.presentationSlides;
    }
    return generateDefaultPresentationSlides(mindMap, layoutMap);
  }, [mindMap.presentationSlides, mindMap, layoutMap]);


  // Active Slide and Node
  const activeSlide = slides[currentSlideIndex] || slides[0];
  const activeNode = activeSlide?.nodeId ? mindMap.nodes[activeSlide.nodeId] : null;

  // History stack for Presentation slides
  const [undoStack, setUndoStack] = useState<SlideFrame[][]>([]);
  const [redoStack, setRedoStack] = useState<SlideFrame[][]>([]);

  const updateSlides = useCallback(
    (newSlides: SlideFrame[], addToHistory: boolean = true) => {
      if (addToHistory) {
        setUndoStack((prev) => [...prev.slice(-25), slides]);
        setRedoStack([]);
      }
      if (onUpdateMindMap) {
        onUpdateMindMap({
          ...mindMap,
          presentationSlides: newSlides,
        });
      }
    },
    [mindMap, onUpdateMindMap, slides]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, slides]);
    setUndoStack((prev) => prev.slice(0, -1));
    if (onUpdateMindMap) {
      onUpdateMindMap({ ...mindMap, presentationSlides: previous });
    }
    if (currentSlideIndex >= previous.length) {
      setCurrentSlideIndex(Math.max(0, previous.length - 1));
    }
  }, [undoStack, slides, mindMap, onUpdateMindMap, currentSlideIndex]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, slides]);
    setRedoStack((prev) => prev.slice(0, -1));
    if (onUpdateMindMap) {
      onUpdateMindMap({ ...mindMap, presentationSlides: next });
    }
    if (currentSlideIndex >= next.length) {
      setCurrentSlideIndex(Math.max(0, next.length - 1));
    }
  }, [redoStack, slides, mindMap, onUpdateMindMap, currentSlideIndex]);

  // Overview bounds calculation
  const overviewBounds = React.useMemo(() => {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    layoutMap.forEach((l) => {
      minX = Math.min(minX, l.bounds.minX);
      minY = Math.min(minY, l.bounds.minY);
      maxX = Math.max(maxX, l.bounds.maxX);
      maxY = Math.max(maxY, l.bounds.maxY);
    });
    if (minX === Infinity) return { x: -300, y: -200, width: 600, height: 400 };
    const pad = 80;
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(500, maxX - minX + pad * 2),
      height: Math.max(350, maxY - minY + pad * 2),
    };
  }, [layoutMap]);

  // Camera flight directly on MindMapCanvas pan & zoom
  const flyCameraToBounds = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vw = rect.width || window.innerWidth;
      const vh = rect.height || window.innerHeight;

      const scaleX = (vw * 0.92) / bounds.width;
      const scaleY = (vh * 0.88) / bounds.height;
      const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 3.2);

      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      setZoom(targetZoom);
      setPan({
        x: vw / 2 - centerX * targetZoom,
        y: vh / 2 - centerY * targetZoom,
      });
    },
    []
  );

  // Focus slide when in presentation mode and sync note drawer
  useEffect(() => {
    if (!isPresentationMode) return;
    if (isOverviewActive) {
      flyCameraToBounds(overviewBounds);
      setShowNotesDrawer(false);
    } else if (activeSlide) {
      flyCameraToBounds(activeSlide.bounds);
      // If the slide is specifically a Note slide or explicitly has showNotes enabled
      if (activeSlide.type === 'note' || activeSlide.showNotes) {
        setShowNotesDrawer(true);
      } else {
        setShowNotesDrawer(false);
      }
    }
  }, [isPresentationMode, currentSlideIndex, activeSlide, isOverviewActive, overviewBounds, flyCameraToBounds]);

  // Navigation handlers
  const handleNextSlide = useCallback(() => {
    setIsOverviewActive(false);
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    setIsOverviewActive(false);
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  const handleToggleOverview = useCallback(() => {
    setIsOverviewActive((prev) => !prev);
  }, []);

  // Spotlight active highlighted node IDs
  const activeHighlightedNodeIds = React.useMemo(() => {
    if (!isPresentationMode || isOverviewActive || !activeSlide) {
      return new Set(Object.keys(mindMap.nodes));
    }
    const set = new Set<string>();
    if (activeSlide.nodeIds && activeSlide.nodeIds.length > 0) {
      activeSlide.nodeIds.forEach((id) => set.add(id));
    }
    if (activeSlide.nodeId) {
      set.add(activeSlide.nodeId);
      if (activeSlide.type === 'branch') {
        const addChildren = (nid: string) => {
          const n = mindMap.nodes[nid];
          if (n && n.children) {
            n.children.forEach((cid) => {
              set.add(cid);
              addChildren(cid);
            });
          }
        };
        addChildren(activeSlide.nodeId);
      }
    }
    return set;
  }, [isPresentationMode, isOverviewActive, activeSlide, mindMap.nodes]);

  // Keyboard navigation for presentation
  useEffect(() => {
    if (!isPresentationMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key.toLowerCase() === 'o' || e.key === 'Home') {
        e.preventDefault();
        handleToggleOverview();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNotesDrawer((prev) => !prev);
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setPresMode((m) => (m === 'play' ? 'editor' : 'play'));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClosePresentation?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, handleNextSlide, handlePrevSlide, handleToggleOverview, handleUndo, handleRedo, onClosePresentation]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Center canvas on initial load
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  }, []);

  // Center and Zoom on a specific target node (e.g. from Outline Panel click)
  useEffect(() => {
    if (!focusTarget || !containerRef.current) return;
    const layout = layoutMap.get(focusTarget.nodeId);
    if (!layout) return;

    const rect = containerRef.current.getBoundingClientRect();
    const nodeCenterX = layout.x + layout.width / 2;
    const nodeCenterY = layout.y + layout.height / 2;

    // Smooth target zoom (1.1x to 1.25x for close inspection, or maintain at least 1.05)
    const targetZoom = Math.max(zoom, 1.15);

    setZoom(targetZoom);
    setPan({
      x: rect.width / 2 - nodeCenterX * targetZoom,
      y: rect.height / 2 - nodeCenterY * targetZoom,
    });
  }, [focusTarget, layoutMap]);

  // Fit View / Center Function
  const handleFitView = useCallback(() => {
    if (!containerRef.current || layoutMap.size === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    (Array.from(layoutMap.values()) as CalculatedNodeLayout[]).forEach((l) => {
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x + l.width);
      minY = Math.min(minY, l.y);
      maxY = Math.max(maxY, l.y + l.height);
    });

    const mapWidth = maxX - minX + 160;
    const mapHeight = maxY - minY + 160;

    const scaleX = rect.width / mapWidth;
    const scaleY = rect.height / mapHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
    });
  }, [layoutMap]);

  // Handle Pan & Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    // 1. Drawing Frame in Presentation Editor Mode
    if (isPresentationMode && presMode === 'editor' && editorTool === 'draw_frame' && containerRef.current) {
      if (e.button !== 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;
      setIsDrawingFrame(true);
      setDrawStart({ x: canvasX, y: canvasY });
      setDrawCurrent({ x: canvasX, y: canvasY });
      return;
    }

    // 2. Normal Canvas Pan
    if (
      e.button === 0 &&
      (e.target === containerRef.current ||
        (e.target as HTMLElement).id === 'svg-edges-layer' ||
        (e.target as HTMLElement).id === 'canvas-background')
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
      setSelectedConnectorId(null);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Drawing frame in progress
    if (isDrawingFrame && drawStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;
      setDrawCurrent({ x: canvasX, y: canvasY });
      return;
    }

    if (draggingConnectorId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;
      if (onUpdateConnector) {
        onUpdateConnector(draggingConnectorId, {
          controlPoint: { x: Math.round(canvasX), y: Math.round(canvasY) },
        });
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    if (draggedNodeId) {
      // Find element under cursor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = el?.closest('[id^="node-"]');
      if (nodeEl) {
        const id = nodeEl.id.replace('node-', '');
        if (id !== draggedNodeId) {
          setDragOverNodeId(id);
          return;
        }
      }
      setDragOverNodeId(null);
    }
  };

  const handleMouseUp = () => {
    // 1. Complete Drawing Frame
    if (isDrawingFrame && drawStart && drawCurrent) {
      const boxX = Math.min(drawStart.x, drawCurrent.x);
      const boxY = Math.min(drawStart.y, drawCurrent.y);
      const boxW = Math.abs(drawCurrent.x - drawStart.x);
      const boxH = Math.abs(drawCurrent.y - drawStart.y);
      setIsDrawingFrame(false);
      setDrawStart(null);
      setDrawCurrent(null);

      if (boxW >= 24 && boxH >= 24) {
        const enclosedNodeIds: string[] = [];
        layoutMap.forEach((l, nid) => {
          if (
            l.x + l.width >= boxX &&
            l.x <= boxX + boxW &&
            l.y + l.height >= boxY &&
            l.y <= boxY + boxH
          ) {
            enclosedNodeIds.push(nid);
          }
        });

        const firstNode = enclosedNodeIds.length > 0 ? mindMap.nodes[enclosedNodeIds[0]] : null;
        const newSlide: SlideFrame = {
          id: `slide-frame-${Date.now()}`,
          order: slides.length + 1,
          title: firstNode?.text ? `Marco: ${firstNode.text}` : `Marco ${slides.length + 1}`,
          type: 'custom_area',
          nodeIds: enclosedNodeIds,
          nodeId: enclosedNodeIds[0],
          bounds: {
            x: Math.round(boxX),
            y: Math.round(boxY),
            width: Math.round(boxW),
            height: Math.round(boxH),
          },
          showNotes: enclosedNodeIds.some((nid) => Boolean(mindMap.nodes[nid]?.note)),
          color: '#3b82f6',
        };
        updateSlides([...slides, newSlide]);
        setCurrentSlideIndex(slides.length);
      }
      return;
    }

    setIsPanning(false);

    if (draggingConnectorId) {
      setDraggingConnectorId(null);
    }

    if (draggedNodeId && dragOverNodeId && draggedNodeId !== dragOverNodeId) {
      onReparentNode(draggedNodeId, dragOverNodeId);
    }
    setDraggedNodeId(null);
    setDragOverNodeId(null);
  };

  // Native non-passive Wheel Zoom to prevent "Unable to preventDefault inside passive event listener invocation"
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;

      setZoom((currentZoom) => {
        const newZoom = Math.min(Math.max(currentZoom * zoomFactor, 0.2), 2.5);
        setPan((currentPan) => {
          const newPanX = mouseX - (mouseX - currentPan.x) * (newZoom / currentZoom);
          const newPanY = mouseY - (mouseY - currentPan.y) * (newZoom / currentZoom);
          return { x: newPanX, y: newPanY };
        });
        return newZoom;
      });
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheelNative);
    };
  }, []);


  // Right Click Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const nodeEl = target.closest('[id^="node-"]');
    const nodeId = nodeEl ? nodeEl.id.replace('node-', '') : null;

    if (nodeId) {
      onSelectNode(nodeId);
    }

    // Auto-adjust position so menu never gets cut off at bottom or right screen edges
    const estimatedMenuWidth = 240;
    const estimatedMenuHeight = 360;
    const padding = 12;

    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + estimatedMenuWidth > window.innerWidth - padding) {
      posX = Math.max(padding, window.innerWidth - estimatedMenuWidth - padding);
    }

    if (posY + estimatedMenuHeight > window.innerHeight - padding) {
      // Shift upwards above click position or clamp to bottom edge
      posY = Math.max(padding, window.innerHeight - estimatedMenuHeight - padding);
    }

    setContextMenu({
      visible: true,
      x: posX,
      y: posY,
      nodeId,
    });
  };

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  // Determine Branch Color for an edge
  const getBranchColor = (childLayout: CalculatedNodeLayout): string => {
    const colors = theme.branchColors;
    return colors[childLayout.branchIndex % colors.length] || '#3b82f6';
  };

  // Background style values (override from mindMap if set, else from theme)
  const effectiveBgColor = mindMap.backgroundColor || theme.background || '#f8fafc';
  const effectivePattern = mindMap.backgroundPattern || theme.backgroundPattern || 'dots';
  const effectivePatternColor = mindMap.backgroundPatternColor || theme.backgroundPatternColor || '#94a3b8';
  const effectivePatternSize = mindMap.backgroundPatternSize || theme.backgroundPatternSize || 24;
  const effectivePatternOpacity = mindMap.backgroundPatternOpacity ?? theme.backgroundPatternOpacity ?? 0.45;

  // Triangular & Hexagonal geometry calculations
  const triangleW = effectivePatternSize;
  const triangleH = effectivePatternSize * 1.7320508;
  const triangleH2 = triangleH / 2;
  const triangleW2 = triangleW / 2;

  const hexW = effectivePatternSize;
  const hexH = effectivePatternSize * 1.7320508;
  const hexW2 = hexW / 2;
  const hexH6 = effectivePatternSize * 0.28867513;
  const hexH2 = effectivePatternSize * 0.8660254;
  const hexH3 = effectivePatternSize * 1.1547005;

  const renderConnector = (conn: Connector, isTopLayer = false) => {
    const fromLayout = layoutMap.get(conn.fromId);
    const toLayout = layoutMap.get(conn.toId);
    if (!fromLayout || !toLayout) return null;

    const x1 = fromLayout.x + fromLayout.width / 2;
    const y1 = fromLayout.y + fromLayout.height / 2;
    const x2 = toLayout.x + toLayout.width / 2;
    const y2 = toLayout.y + toLayout.height / 2;

    const geom = calculateConnectorGeometry(x1, y1, x2, y2, conn);
    const isHovered = hoveredConnectorId === conn.id;
    const isSelected = selectedConnectorId === conn.id;
    const isDraggingThis = draggingConnectorId === conn.id;
    const showHandle = isHovered || isSelected || isDraggingThis;

    const strokeColor = conn.color || '#3b82f6';
    const strokeWidth = conn.width || 2;
    const opacity = conn.opacity !== undefined ? conn.opacity : 1;

    const connectorDash =
      conn.style === 'dashed'
        ? '8 6'
        : conn.style === 'dotted'
        ? '2 5'
        : undefined;

    const arrowMode = conn.arrow || 'end';
    const hasEndArrow = arrowMode === 'end' || arrowMode === 'both';
    const hasStartArrow = arrowMode === 'start' || arrowMode === 'both';

    const endMarkerUrl = isTopLayer ? 'url(#top-connector-arrow-end)' : 'url(#connector-arrow-end)';
    const startMarkerUrl = isTopLayer ? 'url(#top-connector-arrow-start)' : 'url(#connector-arrow-start)';

    return (
      <g
        key={conn.id}
        className="cursor-pointer pointer-events-auto"
        onMouseEnter={() => setHoveredConnectorId(conn.id)}
        onMouseLeave={() => {
          if (!isDraggingThis) setHoveredConnectorId(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedConnectorId(conn.id);
        }}
      >
        {/* Broad invisible hit area for easy click/hover */}
        <path
          d={geom.pathD}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
        />

        {/* Highlight halo when selected or hovered */}
        {(isSelected || isHovered) && (
          <path
            d={geom.pathD}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 5}
            strokeOpacity="0.25"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Main Connector Path */}
        <path
          d={geom.pathD}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          opacity={opacity}
          strokeDasharray={connectorDash}
          strokeLinecap="round"
          fill="none"
          markerEnd={hasEndArrow ? endMarkerUrl : undefined}
          markerStart={hasStartArrow ? startMarkerUrl : undefined}
        />

        {/* Text Label with readable background halo */}
        {conn.label && (
          <text
            x={geom.labelX}
            y={geom.labelY}
            textAnchor="middle"
            opacity={opacity}
            className="text-xs font-semibold fill-slate-800 select-none pointer-events-none"
            style={{
              fontSize: '11px',
              paintOrder: 'stroke fill',
              stroke: '#ffffff',
              strokeWidth: '4px',
              strokeLinejoin: 'round',
            }}
          >
            {conn.label}
          </text>
        )}

        {/* Interactive Control Point Guide and Handle */}
        {showHandle && (
          <g className="cursor-grab active:cursor-grabbing">
            {/* Dashed guide line from midpoint to control point */}
            <line
              x1={geom.midX}
              y1={geom.midY}
              x2={geom.cpX}
              y2={geom.cpY}
              stroke={strokeColor}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />

            {/* Control Point Circle Handle */}
            <circle
              cx={geom.cpX}
              cy={geom.cpY}
              r={isDraggingThis ? 8 : 6}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2.5"
              className="transition-transform hover:scale-125 shadow-md"
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingConnectorId(conn.id);
                setSelectedConnectorId(conn.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onUpdateConnector) {
                  onUpdateConnector(conn.id, {
                    controlPoint: undefined,
                    curvature: -50,
                  });
                }
              }}
            >
              <title>Arrastra para curvar o doble clic para restablecer</title>
            </circle>
          </g>
        )}
      </g>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        id="canvas-background"
        style={{ backgroundColor: effectiveBgColor }}
        className={`relative flex-1 w-full h-full overflow-hidden select-none ${
          isPresentationMode && presMode === 'editor' && editorTool === 'draw_frame'
            ? 'cursor-crosshair'
            : isPresentationMode && presMode === 'editor' && editorTool === 'pick_nodes'
            ? 'cursor-pointer'
            : 'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}

      >
      {/* Viewport Transform Container */}
      <div
        id="canvas-viewport"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPresentationMode && !isPanning && !isDrawingFrame ? 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
        }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none will-change-transform"
      >
        {/* SVG Rendering Layer for Background Patterns, Edges, Clouds and Connectors */}
        <svg
          id="svg-edges-layer"
          className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Arrowhead marker for connectors (End) */}
            <marker
              id="connector-arrow-end"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="context-stroke" />
            </marker>

            {/* Arrowhead marker for connectors (Start) */}
            <marker
              id="connector-arrow-start"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="context-stroke" />
            </marker>

            {/* Fallback marker */}
            <marker
              id="connector-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
            </marker>

          </defs>

          {/* Group 0: Dynamic Background Pattern Plane */}
          <CanvasBackgroundLayer
            pattern={effectivePattern}
            patternColor={effectivePatternColor}
            patternSize={effectivePatternSize}
            patternOpacity={effectivePatternOpacity}
          />

          {/* Group 1: Clouds (rendered behind edges and nodes, outer clouds first) */}
          <g id="clouds-group">
            {/* Filter for cloud drop shadow */}
            <filter id="cloud-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>

            {(Object.values(mindMap.nodes) as MindNode[])
              .filter(node => Boolean(node.cloud?.enabled))
              .map(node => ({
                node,
                bounds: computeCloudBounds(node.id, mindMap.nodes, layoutMap),
              }))
              .filter((item): item is { node: MindNode; bounds: NonNullable<ReturnType<typeof computeCloudBounds>> } => Boolean(item.bounds))
              .sort((a, b) => (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height))
              .map(({ node, bounds }) => {
                const cloud = node.cloud!;
                const shape = cloud.shape || 'cloud-scallop';
                // Extract clean hex/rgb color if it was stored as rgba string
                let rawColor = cloud.color || '#3b82f6';
                let calculatedOpacity = cloud.opacity !== undefined ? cloud.opacity : 0.08;
                if (rawColor.startsWith('rgba')) {
                  const match = rawColor.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
                  if (match) {
                    rawColor = `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
                    if (cloud.opacity === undefined) {
                      calculatedOpacity = Math.min(0.12, parseFloat(match[4]));
                    }
                  }
                }
                const opacity = calculatedOpacity;
                const bgType = cloud.bgType || 'color';

                const strokeColor = cloud.borderColor || rawColor || '#3b82f6';
                const strokeWidth = cloud.borderWidth !== undefined ? cloud.borderWidth : 1.5;
                const strokeDash = cloud.borderDash || 'dashed';
                const strokeDasharray =
                  strokeDash === 'dashed'
                    ? '8 5'
                    : strokeDash === 'dotted'
                    ? '2 4'
                    : undefined;

                // Fill color or SVG definitions
                let fillVal = rawColor;
                const gradId = `cloud-grad-${node.id}`;
                const patternId = `cloud-pat-${node.id}`;
                const clipId = `cloud-clip-${node.id}`;

                if (bgType === 'gradient') {
                  fillVal = `url(#${gradId})`;
                } else if (bgType === 'pattern') {
                  fillVal = `url(#${patternId})`;
                }

                // Path generators for 8 geometric shapes
                const x = bounds.x;
                const y = bounds.y;
                const w = bounds.width;
                const h = bounds.height;
                const cx = x + w / 2;
                const cy = y + h / 2;

                let shapePath = '';
                if (shape === 'rectangle') {
                  shapePath = `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
                } else if (shape === 'round-rectangle') {
                  const r = Math.min(24, Math.min(w, h) / 4);
                  shapePath = `M ${x + r} ${y} h ${w - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
                } else if (shape === 'arc') {
                  const r = Math.min(36, Math.min(w, h) / 3);
                  shapePath = `M ${x + r} ${y} h ${w - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
                } else if (shape === 'bubble') {
                  // Globo de diálogo estilo cómic orgánico ultra-redondeado con cola prominente
                  const r = Math.min(w / 2, h / 2, 48);
                  const tailW = Math.max(32, Math.min(56, w * 0.25));
                  const tailH = Math.max(28, Math.min(48, h * 0.35));
                  const tailBaseX = x + Math.max(r, Math.min(w * 0.25, 60));
                  const tailTipX = tailBaseX - 22;
                  const tailTipY = y + h + tailH;

                  shapePath = `
                    M ${x + r} ${y}
                    h ${w - 2 * r}
                    a ${r} ${r} 0 0 1 ${r} ${r}
                    v ${h - 2 * r}
                    a ${r} ${r} 0 0 1 ${-r} ${r}
                    H ${tailBaseX + tailW}
                    L ${tailTipX} ${tailTipY}
                    L ${tailBaseX} ${y + h}
                    H ${x + r}
                    a ${r} ${r} 0 0 1 ${-r} ${-r}
                    v ${-(h - 2 * r)}
                    a ${r} ${r} 0 0 1 ${r} ${-r}
                    Z
                  `.replace(/\s+/g, ' ').trim();
                } else if (shape === 'oval') {
                  const rx = w / 2;
                  const ry = h / 2;
                  shapePath = `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
                } else if (shape === 'hexagon') {
                  const cut = Math.min(32, w / 5);
                  shapePath = `M ${x + cut} ${y} L ${x + w - cut} ${y} L ${x + w} ${cy} L ${x + w - cut} ${y + h} L ${x + cut} ${y + h} L ${x} ${cy} Z`;
                } else if (shape === 'star') {
                  const pts: string[] = [];
                  const numPoints = 12;
                  const rxOuter = w / 2;
                  const ryOuter = h / 2;
                  const rxInner = rxOuter * 0.88;
                  const ryInner = ryOuter * 0.88;
                  for (let p = 0; p < numPoints * 2; p++) {
                    const angle = (p * Math.PI) / numPoints - Math.PI / 2;
                    const rxVal = p % 2 === 0 ? rxOuter : rxInner;
                    const ryVal = p % 2 === 0 ? ryOuter : ryInner;
                    pts.push(`${cx + rxVal * Math.cos(angle)},${cy + ryVal * Math.sin(angle)}`);
                  }
                  shapePath = `M ${pts.join(' L ')} Z`;
                } else {
                  // shape === 'cloud-scallop' (Festoneado de nubes con arcos esponjosos)
                  const step = Math.max(28, Math.min(44, (w + h) / 16));
                  const nx = Math.max(2, Math.round(w / step));
                  const ny = Math.max(2, Math.round(h / step));
                  const stepX = w / nx;
                  const stepY = h / ny;

                  const scallops: string[] = [`M ${x} ${y + stepY / 2}`];
                  // Top edge
                  for (let i = 0; i < nx; i++) {
                    const x1 = x + i * stepX;
                    const x2 = x + (i + 1) * stepX;
                    scallops.push(`Q ${x1 + stepX / 2} ${y - stepX * 0.28}, ${x2} ${y}`);
                  }
                  // Right edge
                  for (let i = 0; i < ny; i++) {
                    const y1 = y + i * stepY;
                    const y2 = y + (i + 1) * stepY;
                    scallops.push(`Q ${x + w + stepY * 0.28} ${y1 + stepY / 2}, ${x + w} ${y2}`);
                  }
                  // Bottom edge
                  for (let i = 0; i < nx; i++) {
                    const x1 = x + w - i * stepX;
                    const x2 = x + w - (i + 1) * stepX;
                    scallops.push(`Q ${x1 - stepX / 2} ${y + h + stepX * 0.28}, ${x2} ${y + h}`);
                  }
                  // Left edge
                  for (let i = 0; i < ny; i++) {
                    const y1 = y + h - i * stepY;
                    const y2 = y + h - (i + 1) * stepY;
                    scallops.push(`Q ${x - stepY * 0.28} ${y1 - stepY / 2}, ${x} ${y2}`);
                  }
                  shapePath = `${scallops.join(' ')} Z`;
                }

                return (
                  <g key={`cloud-group-${node.id}`} filter={cloud.shadow ? 'url(#cloud-drop-shadow)' : undefined}>
                    <defs>
                      {/* Gradient def */}
                      {bgType === 'gradient' && (
                        <linearGradient
                          id={gradId}
                          x1={cloud.gradientDirection === 'to-r' ? '0%' : cloud.gradientDirection === 'to-b' ? '0%' : '0%'}
                          y1={cloud.gradientDirection === 'to-r' ? '0%' : cloud.gradientDirection === 'to-b' ? '0%' : '0%'}
                          x2={cloud.gradientDirection === 'to-r' ? '100%' : cloud.gradientDirection === 'to-b' ? '0%' : '100%'}
                          y2={cloud.gradientDirection === 'to-r' ? '0%' : cloud.gradientDirection === 'to-b' ? '100%' : '100%'}
                        >
                          <stop offset="0%" stopColor={cloud.gradientColor1 || cloud.color || '#3b82f6'} />
                          <stop offset="100%" stopColor={cloud.gradientColor2 || '#8b5cf6'} />
                        </linearGradient>
                      )}

                      {/* Pattern def */}
                      {bgType === 'pattern' && (
                        <pattern
                          id={patternId}
                          width={cloud.cloudPatternSize || 16}
                          height={cloud.cloudPatternSize || 16}
                          patternUnits="userSpaceOnUse"
                        >
                          {(cloud.cloudPattern === 'dots' || !cloud.cloudPattern) && (
                            <circle
                              cx={(cloud.cloudPatternSize || 16) / 2}
                              cy={(cloud.cloudPatternSize || 16) / 2}
                              r={Math.max(2, (cloud.cloudPatternSize || 16) / 8)}
                              fill={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              fillOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'lines' && (
                            <line
                              x1="0"
                              y1={(cloud.cloudPatternSize || 16) / 2}
                              x2={cloud.cloudPatternSize || 16}
                              y2={(cloud.cloudPatternSize || 16) / 2}
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.5"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'stripes' && (
                            <path
                              d={`M 0 0 L ${cloud.cloudPatternSize || 16} ${cloud.cloudPatternSize || 16} M 0 ${cloud.cloudPatternSize || 16} L ${cloud.cloudPatternSize || 16} 0`}
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.5"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'squares' && (
                            <rect
                              x="0"
                              y="0"
                              width={cloud.cloudPatternSize || 16}
                              height={cloud.cloudPatternSize || 16}
                              fill="none"
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.2"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'triangles' && (
                            <polygon
                              points={`0,${cloud.cloudPatternSize || 16} ${(cloud.cloudPatternSize || 16) / 2},0 ${cloud.cloudPatternSize || 16},${cloud.cloudPatternSize || 16}`}
                              fill="none"
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'hexagons' && (
                            <polygon
                              points={`
                                ${(cloud.cloudPatternSize || 16) * 0.25},0 
                                ${(cloud.cloudPatternSize || 16) * 0.75},0 
                                ${cloud.cloudPatternSize || 16},${(cloud.cloudPatternSize || 16) * 0.5} 
                                ${(cloud.cloudPatternSize || 16) * 0.75},${cloud.cloudPatternSize || 16} 
                                ${(cloud.cloudPatternSize || 16) * 0.25},${cloud.cloudPatternSize || 16} 
                                0,${(cloud.cloudPatternSize || 16) * 0.5}
                              `.replace(/\s+/g, ' ').trim()}
                              fill="none"
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'cross' && (
                            <path
                              d={`M ${(cloud.cloudPatternSize || 16) / 2} 0 v ${cloud.cloudPatternSize || 16} M 0 ${(cloud.cloudPatternSize || 16) / 2} h ${cloud.cloudPatternSize || 16}`}
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.5"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                        </pattern>
                      )}

                      {/* ClipPath for Cloud Image background */}
                      <clipPath id={clipId}>
                        <path d={shapePath} />
                      </clipPath>
                    </defs>

                    {/* Base Background Tint Layer */}
                    <path
                      d={shapePath}
                      fill={bgType === 'pattern' ? (cloud.color || '#3b82f6') : (bgType === 'image' ? (cloud.color || '#3b82f6') : fillVal)}
                      fillOpacity={bgType === 'pattern' ? Math.max(0.04, opacity * 0.5) : opacity}
                    />

                    {/* Pattern Overlay Layer when bgType is pattern */}
                    {bgType === 'pattern' && (
                      <path
                        d={shapePath}
                        fill={`url(#${patternId})`}
                        fillOpacity={1}
                      />
                    )}

                    {/* Stroke Outline & Dropshadow */}
                    <path
                      d={shapePath}
                      fill="none"
                      stroke={strokeWidth > 0 ? strokeColor : 'none'}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Image Background clipped to cloud shape */}
                    {bgType === 'image' && cloud.bgImageUrl && (
                      <image
                        href={cloud.bgImageUrl}
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        preserveAspectRatio={
                          cloud.bgImageMode === 'contain'
                            ? 'xMidYMid meet'
                            : cloud.bgImageMode === 'tile'
                            ? 'none'
                            : 'xMidYMid slice'
                        }
                        opacity={opacity}
                        clipPath={`url(#${clipId})`}
                      />
                    )}
                  </g>
                );
              })}
          </g>

          {/* Group 2: Hierarchical Tree Edges */}
          <g id="tree-edges-group">
            {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
              const childNode = mindMap.nodes[childLayout.id];
              if (!childNode || !childNode.parentId) return null;

              const parentLayout = layoutMap.get(childNode.parentId);
              if (!parentLayout) return null;

              const effectiveStyle = childNode.edgeStyle || mindMap.edgeStyle || theme.edgeStyle || 'bezier';
              if (effectiveStyle === 'hidden') return null;

              const edgePath = generateEdgePath(
                parentLayout,
                childLayout,
                effectiveStyle,
                childNode.shape
              );

              if (!edgePath) return null;

              const color = childNode.edgeColor || mindMap.edgeColor || getBranchColor(childLayout);
              const defaultWidth = childLayout.depth === 1 ? 2.5 : 1.75;
              const width = childNode.edgeWidth || mindMap.edgeWidth || defaultWidth;
              const effectiveDash = childNode.edgeDash || mindMap.edgeDash || 'solid';
              const effectiveProfile = childNode.edgeProfile || mindMap.edgeProfile || 'uniform';

              // Calculate stroke dash pattern with proper, legible spacing
              const strokeDasharray =
                effectiveDash === 'dashed'
                  ? `${Math.max(10, width * 3.5)} ${Math.max(7, width * 2.5)}`
                  : effectiveDash === 'dotted'
                  ? `0.1 ${Math.max(8, width * 3.0)}`
                  : undefined;

              // If a variable-width profile is active, render dynamic filled ribbon
              if (effectiveProfile !== 'uniform') {
                const ribbonPath = generateRibbonEdgePath(
                  parentLayout,
                  childLayout,
                  effectiveStyle,
                  childNode.shape,
                  effectiveProfile,
                  width
                );
                if (ribbonPath) {
                  // If solid, render opaque filled ribbon
                  if (effectiveDash === 'solid') {
                    return (
                      <path
                        key={`edge-${childNode.parentId}-${childNode.id}`}
                        d={ribbonPath}
                        fill={color}
                        fillOpacity={0.92}
                        stroke={color}
                        strokeWidth={0.5}
                        strokeLinejoin="round"
                      />
                    );
                  }

                  // If dashed or dotted with variable thickness profile, render both profile silhouette and dashed spine
                  return (
                    <g key={`edge-group-${childNode.parentId}-${childNode.id}`}>
                      <path
                        d={ribbonPath}
                        fill={color}
                        fillOpacity={0.18}
                        stroke={color}
                        strokeWidth={0.5}
                        strokeOpacity={0.4}
                        strokeLinejoin="round"
                      />
                      <path
                        d={edgePath}
                        stroke={color}
                        strokeWidth={width}
                        strokeDasharray={strokeDasharray}
                        fill="none"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                }
              }

              return (
                <path
                  key={`edge-${childNode.parentId}-${childNode.id}`}
                  d={edgePath}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={strokeDasharray}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Group 3: Custom Connectors / Relations rendered BEHIND nodes (layer === 'below') */}
          <g id="connectors-below-group">
            {mindMap.connectors?.filter(c => c.layer === 'below').map(conn => renderConnector(conn, false))}
          </g>
        </svg>

        {/* Nodes Layer (DOM elements for crisp typography and events) */}
        <div id="nodes-layer" className="absolute top-0 left-0 pointer-events-auto">
          {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((layout) => {
            const node = mindMap.nodes[layout.id];
            if (!node) return null;

            const isSelected = selectedNodeId === node.id;
            const isEditing = editingNodeId === node.id;
            const isMatch = searchMatches ? searchMatches.has(node.id) : false;
            const branchColor = getBranchColor(layout);

            const isHighlighted = !isPresentationMode || isOverviewActive || activeHighlightedNodeIds.has(node.id);
            const hasSlideFrame = isPresentationMode && presMode === 'editor' && slides.some((s) => s.nodeId === node.id);
            const isStaged = hasSlideFrame || stagedNodeIds.has(node.id);

            return (
              <div
                key={node.id}
                style={{
                  opacity: isHighlighted ? 1 : 0.18,
                  transition: 'opacity 400ms ease-in-out',
                }}
              >
                <NodeComponent
                  node={node}
                  layout={layout}
                  isSelected={isSelected}
                  isEditing={isEditing}
                  theme={theme}
                  branchColor={branchColor}
                  isMatch={isMatch}
                  isPresentationMode={isPresentationMode}
                  isStaged={isStaged}
                  globalVisibility={{
                    hideAllBodies: mindMap.hideAllBodies,
                    hideAllImages: mindMap.hideAllImages,
                    hideAllTags: mindMap.hideAllTags,
                    hideAllIcons: mindMap.hideAllIcons,
                    hideAllLinks: mindMap.hideAllLinks,
                    showAllNotesInline: mindMap.showAllNotesInline,
                  }}
                  onSelect={(id) => {
                    if (isPresentationMode && presMode === 'editor' && editorTool === 'pick_nodes') {
                      const targetNode = mindMap.nodes[id];
                      const targetLayout = layoutMap.get(id);
                      if (!targetNode || !targetLayout) return;

                      // Check if a slide frame already exists for this node
                      const existingIndex = slides.findIndex((s) => s.nodeId === id && s.type === 'node');
                      if (existingIndex !== -1) {
                        setCurrentSlideIndex(existingIndex);
                        return;
                      }

                      // Automatically create presentation frame over this node!
                      const pad = 28;
                      const newSlide: SlideFrame = {
                        id: `slide-node-${id}-${Date.now()}`,
                        order: slides.length + 1,
                        title: targetNode.text || `Marco ${slides.length + 1}`,
                        type: 'node',
                        nodeId: id,
                        nodeIds: [id],
                        bounds: {
                          x: Math.round(targetLayout.x - pad),
                          y: Math.round(targetLayout.y - pad),
                          width: Math.round(targetLayout.width + pad * 2),
                          height: Math.round(targetLayout.height + pad * 2),
                        },
                        showNotes: Boolean(targetNode.note),
                        color: targetNode.color || '#3b82f6',
                      };

                      updateSlides([...slides, newSlide]);
                      setCurrentSlideIndex(slides.length);
                      return;
                    }
                    onSelectNode(id);
                  }}

                  onDoubleClick={(id) => onStartEditing(id)}
                  onTextChange={onUpdateNodeText}
                  onFinishEditing={onFinishEditing}
                  onToggleFold={onToggleFoldNode}
                  onAddChild={onAddChildNode}
                  onOpenNote={onOpenNotePanel}
                  onDragStart={(id) => setDraggedNodeId(id)}
                  onDropOnNode={onReparentNode}
                />
              </div>
            );

          })}
        </div>

          {/* Top SVG Layer for Connectors rendered ABOVE nodes (layer !== 'below') */}
          <svg
            id="svg-top-connectors-layer"
            className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
            style={{ overflow: 'visible', zIndex: 20 }}
          >
            <defs>
              <marker
                id="top-connector-arrow-end"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="context-stroke" />
              </marker>
              <marker
                id="top-connector-arrow-start"
                viewBox="0 0 10 10"
                refX="2"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="context-stroke" />
              </marker>
            </defs>
            <g id="connectors-above-group">
              {mindMap.connectors?.filter(c => c.layer !== 'below').map(conn => renderConnector(conn, true))}
            </g>
          </svg>

          {/* Presentation Slide Frames Layer (Editor Mode) */}
          {isPresentationMode && presMode === 'editor' && (
            <CanvasDrawingOverlay
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSelectSlide={setCurrentSlideIndex}
              editorTool={editorTool}
              isDrawingFrame={isDrawingFrame}
              drawStart={drawStart}
              drawCurrent={drawCurrent}
            />
          )}
        </div>

        {/* PRESENTATION HUD OVERLAYS (Rendered on top of the real canvas) */}
        {isPresentationMode && (
          <CanvasPresentationHUD
            mindMap={mindMap}
            layoutMap={layoutMap}
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            activeSlide={activeSlide}
            activeNode={activeNode}
            presMode={presMode}
            setPresMode={setPresMode}
            editorTool={editorTool}
            setEditorTool={setEditorTool}
            stagedNodeIds={stagedNodeIds}
            setStagedNodeIds={setStagedNodeIds}
            showNotesDrawer={showNotesDrawer}
            setShowNotesDrawer={setShowNotesDrawer}
            isOverviewActive={isOverviewActive}
            setIsOverviewActive={setIsOverviewActive}
            isFilmstripOpen={isFilmstripOpen}
            setIsFilmstripOpen={setIsFilmstripOpen}
            undoStack={undoStack}
            redoStack={redoStack}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            updateSlides={updateSlides}
            setCurrentSlideIndex={setCurrentSlideIndex}
            handleNextSlide={handleNextSlide}
            handlePrevSlide={handlePrevSlide}
            handleToggleOverview={handleToggleOverview}
            onClosePresentation={onClosePresentation}
            overviewBounds={overviewBounds}
            generateDefaultPresentationSlides={generateDefaultPresentationSlides}
          />
        )}

        {/* Interactive Mini-Map & Zoom Controls (Hidden during Presentation Mode) */}
        {!isPresentationMode && (
          <MiniMap
            mindMap={mindMap}
            layoutMap={layoutMap}
            theme={theme}
            pan={pan}
            zoom={zoom}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            selectedNodeId={selectedNodeId}
            showMiniMap={showMiniMap}
            onPanChange={setPan}
            onSelectNode={onSelectNode}
            onZoomIn={() => setZoom((z) => Math.min(2.5, z * 1.15))}
            onZoomOut={() => setZoom((z) => Math.max(0.2, z / 1.15))}
            onResetZoom={() => setZoom(1)}
            onFitView={handleFitView}
            onToggleMiniMap={() => setShowMiniMap((s) => !s)}
          />
        )}
      </div>

      {/* Right Click Context Menu (Freeplane inspired) */}
      <CanvasContextMenu
        contextMenu={contextMenu}
        mindMap={mindMap}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
        onAddChildNode={onAddChildNode}
        onAddSiblingNode={onAddSiblingNode}
        onStartEditing={onStartEditing}
        onDeleteNode={onDeleteNode}
        onCopyNode={onCopyNode}
        onCutNode={onCutNode}
        onPasteNode={onPasteNode}
        onOpenConnectorModal={onOpenConnectorModal}
        onToggleCloud={onToggleCloud}
        onApplyStyleToChildren={onApplyStyleToChildren}
        onApplyStyleToSiblings={onApplyStyleToSiblings}
      />
    </>
  );
};
\\n

## src/components/MiniMap.tsx

\\tsx
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { MindMap, CalculatedNodeLayout, MindMapTheme } from '../types/mindmap';
import { ZoomControls } from './molecules/ZoomControls';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  ChevronDown,
} from 'lucide-react';


export type MiniMapSize = 'compact' | 'medium' | 'large';

interface MiniMapProps {
  mindMap: MindMap;
  layoutMap: Map<string, CalculatedNodeLayout>;
  theme: MindMapTheme;
  pan: { x: number; y: number };
  zoom: number;
  containerWidth: number;
  containerHeight: number;
  selectedNodeId: string | null;
  showMiniMap: boolean;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onSelectNode?: (id: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  onToggleMiniMap: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  mindMap,
  layoutMap,
  theme,
  pan,
  zoom,
  containerWidth,
  containerHeight,
  selectedNodeId,
  showMiniMap,
  onPanChange,
  onSelectNode,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onToggleMiniMap,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);

  // Size option for minimap: 'compact' (Pequeño), 'medium' (Mediano), 'large' (Grande)
  const [size, setSize] = useState<MiniMapSize>(() => {
    try {
      const saved = localStorage.getItem('mindmap_minimap_size');
      if (saved === 'compact' || saved === 'medium' || saved === 'large') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'compact';
  });

  const handleSizeChange = (newSize: MiniMapSize) => {
    setSize(newSize);
    try {
      localStorage.setItem('mindmap_minimap_size', newSize);
    } catch {
      // ignore
    }
  };

  // Dimensions based on size choice
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'compact':
        return {
          cardWidth: 'w-44',
          svgHeight: 'h-24',
          label: 'S',
        };
      case 'large':
        return {
          cardWidth: 'w-72',
          svgHeight: 'h-44',
          label: 'L',
        };
      case 'medium':
      default:
        return {
          cardWidth: 'w-56',
          svgHeight: 'h-32',
          label: 'M',
        };
    }
  }, [size]);

  // Compute bounding box encompassing all nodes + current viewport
  const { viewBox, bounds, viewportRect } = useMemo(() => {
    if (layoutMap.size === 0 || containerWidth <= 0 || containerHeight <= 0) {
      return {
        viewBox: '-400 -300 800 600',
        bounds: { minX: -400, maxX: 400, minY: -300, maxY: 300 },
        viewportRect: { x: 0, y: 0, width: 100, height: 100 },
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    (Array.from(layoutMap.values()) as CalculatedNodeLayout[]).forEach((l) => {
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x + l.width);
      minY = Math.min(minY, l.y);
      maxY = Math.max(maxY, l.y + l.height);
    });

    // Current viewport in map space
    const vpX = (0 - pan.x) / zoom;
    const vpY = (0 - pan.y) / zoom;
    const vpW = containerWidth / zoom;
    const vpH = containerHeight / zoom;

    // Expand bounds to include both nodes and current viewport
    const totalMinX = Math.min(minX - 60, vpX - 40);
    const totalMaxX = Math.max(maxX + 60, vpX + vpW + 40);
    const totalMinY = Math.min(minY - 60, vpY - 40);
    const totalMaxY = Math.max(maxY + 60, vpY + vpH + 40);

    const width = totalMaxX - totalMinX;
    const height = totalMaxY - totalMinY;

    return {
      viewBox: `${totalMinX} ${totalMinY} ${width} ${height}`,
      bounds: { minX: totalMinX, maxX: totalMaxX, minY: totalMinY, maxY: totalMaxY },
      viewportRect: { x: vpX, y: vpY, width: vpW, height: vpH },
    };
  }, [layoutMap, containerWidth, containerHeight, pan, zoom]);

  // Convert client coordinates from mouse event to map space coordinates
  const getMapCoordinatesFromEvent = useCallback(
    (e: React.MouseEvent<SVGSVGElement | HTMLDivElement>) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const normX = Math.max(0, Math.min(1, clickX / rect.width));
      const normY = Math.max(0, Math.min(1, clickY / rect.height));

      const mapWidth = bounds.maxX - bounds.minX;
      const mapHeight = bounds.maxY - bounds.minY;

      const mapX = bounds.minX + normX * mapWidth;
      const mapY = bounds.minY + normY * mapHeight;

      return { mapX, mapY };
    },
    [bounds]
  );

  // Center canvas pan on clicked map point
  const handleMiniMapClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const coords = getMapCoordinatesFromEvent(e);
      if (!coords) return;

      const newPanX = containerWidth / 2 - coords.mapX * zoom;
      const newPanY = containerHeight / 2 - coords.mapY * zoom;

      onPanChange({ x: newPanX, y: newPanY });
    },
    [getMapCoordinatesFromEvent, containerWidth, containerHeight, zoom, onPanChange]
  );

  // Start dragging viewport on minimap
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingViewport(true);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDraggingViewport) return;
      const coords = getMapCoordinatesFromEvent(e);
      if (!coords) return;

      const newPanX = containerWidth / 2 - coords.mapX * zoom;
      const newPanY = containerHeight / 2 - coords.mapY * zoom;

      onPanChange({ x: newPanX, y: newPanY });
    },
    [isDraggingViewport, getMapCoordinatesFromEvent, containerWidth, containerHeight, zoom, onPanChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingViewport(false);
  }, []);

  return (
    <div
      className="absolute bottom-2 right-5 z-40 flex flex-col items-end gap-1.5 select-none pointer-events-auto"
      onMouseUp={handleMouseUp}
    >
      {/* MiniMap Canvas Card (Toggleable & Ultra-Crystal Glassmorphism) */}
      {showMiniMap && layoutMap.size > 0 && (
        <div
          style={{
            borderColor: 'rgba(226, 232, 240, 0.85)',
            borderWidth: '1px',
            borderStyle: 'solid',
            backgroundColor: 'var(--sp-glass, rgba(255, 255, 255, 0.65))',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          }}
          className={`backdrop-blur-md hover:bg-white/90 p-1.5 rounded-2xl ${sizeConfig.cardWidth} flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 group opacity-85 hover:opacity-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 py-0.5 mb-1 text-slate-500 gap-1">
            <div className="flex items-center gap-1.5 min-w-0" title="MiniMapa">
              <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
              {size !== 'compact' && (
                <span className="text-[11px] font-bold text-[var(--sp-text)] uppercase tracking-wider truncate">
                  MiniMapa
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Size Selector (S / M / L) */}
              <div
                style={{
                  borderColor: 'rgba(226, 232, 240, 0.9)',
                  backgroundColor: 'rgba(241, 245, 249, 0.8)',
                }}
                className="flex items-center p-0.5 rounded-lg border text-[9px] font-bold font-mono"
                title="Tamaño del MiniMapa"
              >
                {(['compact', 'medium', 'large'] as MiniMapSize[]).map((s) => {
                  const label = s === 'compact' ? 'S' : s === 'medium' ? 'M' : 'L';
                  const isCurrent = size === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleSizeChange(s)}
                      title={`Tamaño ${s === 'compact' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}`}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-blue-600 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Minimize / Close */}
              <button
                onClick={onToggleMiniMap}
                title="Minimizar MiniMapa"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map View Area */}
          <div
            style={{
              borderColor: 'rgba(226, 232, 240, 0.85)',
              backgroundColor: 'rgba(248, 250, 252, 0.65)',
            }}
            className={`relative w-full ${sizeConfig.svgHeight} rounded-xl border overflow-hidden shadow-inner cursor-crosshair transition-all duration-200`}
          >
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              onClick={handleMiniMapClick}
              onMouseMove={handleMouseMove}
            >
              {/* Radar Background fill */}
              <rect
                x={bounds.minX}
                y={bounds.minY}
                width={bounds.maxX - bounds.minX}
                height={bounds.maxY - bounds.minY}
                fill="#0f172a"
              />

              {/* Connecting Tree Edges */}
              <g id="minimap-edges">
                {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
                  const childNode = mindMap.nodes[childLayout.id];
                  if (!childNode || !childNode.parentId) return null;

                  const parentLayout = layoutMap.get(childNode.parentId);
                  if (!parentLayout) return null;

                  const branchColor =
                    childNode.edgeColor ||
                    theme.branchColors[childLayout.branchIndex % theme.branchColors.length] ||
                    '#38bdf8';

                  // Calculate anchor points based on node side for organic curved paths
                  let pathData = '';
                  if (childLayout.side === 'left') {
                    const startX = parentLayout.x;
                    const startY = parentLayout.y + parentLayout.height / 2;
                    const endX = childLayout.x + childLayout.width;
                    const endY = childLayout.y + childLayout.height / 2;
                    const midX = (startX + endX) / 2;
                    pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                  } else if (childLayout.side === 'bottom') {
                    const startX = parentLayout.x + parentLayout.width / 2;
                    const startY = parentLayout.y + parentLayout.height;
                    const endX = childLayout.x + childLayout.width / 2;
                    const endY = childLayout.y;
                    const midY = (startY + endY) / 2;
                    pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                  } else if (childLayout.side === 'top') {
                    const startX = parentLayout.x + parentLayout.width / 2;
                    const startY = parentLayout.y;
                    const endX = childLayout.x + childLayout.width / 2;
                    const endY = childLayout.y + childLayout.height;
                    const midY = (startY + endY) / 2;
                    pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                  } else {
                    // Standard right-side branch, root, radial or circular
                    const startX = parentLayout.x + parentLayout.width;
                    const startY = parentLayout.y + parentLayout.height / 2;
                    const endX = childLayout.x;
                    const endY = childLayout.y + childLayout.height / 2;
                    const midX = (startX + endX) / 2;
                    pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                  }

                  return (
                    <path
                      key={`mm-edge-${childNode.parentId}-${childNode.id}`}
                      d={pathData}
                      fill="none"
                      stroke={branchColor}
                      strokeWidth={childLayout.depth === 1 ? 3 : 2}
                      strokeOpacity={childLayout.depth === 1 ? 0.95 : 0.75}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g id="minimap-nodes">
                {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((l) => {
                  const node = mindMap.nodes[l.id];
                  const isSelected = selectedNodeId === l.id;
                  const isRoot = l.depth === 0;

                  // Minimum legible width & height for child nodes
                  const minW = isRoot ? 50 : l.depth === 1 ? 36 : 24;
                  const minH = isRoot ? 30 : l.depth === 1 ? 20 : 16;
                  const renderW = Math.max(l.width, minW);
                  const renderH = Math.max(l.height, minH);
                  const renderX = l.x - (renderW - l.width) / 2;
                  const renderY = l.y - (renderH - l.height) / 2;

                  const branchColor = theme.branchColors[l.branchIndex % theme.branchColors.length] || '#38bdf8';

                  // Always vibrant, solid color fill
                  let nodeFill = node?.color;
                  if (!nodeFill || nodeFill === '#ffffff' || nodeFill === '#f8fafc') {
                    if (isRoot) {
                      nodeFill = '#3b82f6';
                    } else {
                      nodeFill = branchColor;
                    }
                  }

                  // Border stroke for crisp radar look
                  const nodeStroke = isSelected
                    ? '#fbbf24'
                    : '#ffffff';

                  const strokeW = isSelected ? 4 : isRoot ? 3 : 2;

                  return (
                    <g
                      key={`mm-node-${l.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectNode) onSelectNode(l.id);
                        // Center on node
                        const newPanX = containerWidth / 2 - (l.x + l.width / 2) * zoom;
                        const newPanY = containerHeight / 2 - (l.y + l.height / 2) * zoom;
                        onPanChange({ x: newPanX, y: newPanY });
                      }}
                      className="cursor-pointer group"
                    >
                      <rect
                        x={renderX}
                        y={renderY}
                        width={renderW}
                        height={renderH}
                        rx={isRoot ? 8 : l.depth === 1 ? 6 : 4}
                        fill={nodeFill}
                        stroke={nodeStroke}
                        strokeWidth={strokeW}
                      />
                      {/* Highlight dot if node has folded children */}
                      {node?.folded && node?.children && node.children.length > 0 && (
                        <circle
                          cx={renderX + renderW - 2}
                          cy={renderY + 2}
                          r={4}
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Viewport Indicator Rectangle (Current Visible Frame on Screen) */}
              <rect
                x={viewportRect.x}
                y={viewportRect.y}
                width={viewportRect.width}
                height={viewportRect.height}
                fill="rgba(56, 189, 248, 0.2)"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6 3"
                rx="6"
                className="cursor-move hover:fill-sky-400/30 transition-colors"
                onMouseDown={handleViewportMouseDown}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Zoom Controls HUD (Placed UNDER the minimap) */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
        onFitToScreen={onFitView}
        onToggleMiniMap={onToggleMiniMap}
        showMiniMap={showMiniMap}
      />
    </div>
  );
};
\\n

## src/components/Modals/ConnectorModal.tsx

\\tsx
import React, { useState } from 'react';
import { MindMap, Connector, MindNode } from '../../types/mindmap';
import { Link } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

interface ConnectorModalProps {
  mindMap: MindMap;
  fromNodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveConnector: (connector: Connector) => void;
}

export const ConnectorModal: React.FC<ConnectorModalProps> = ({
  mindMap,
  fromNodeId,
  isOpen,
  onClose,
  onSaveConnector,
}) => {
  const [toNodeId, setToNodeId] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [shape, setShape] = useState<'curved' | 'bezier' | 'straight' | 'step'>('curved');
  const [curvature, setCurvature] = useState<number>(-50);
  const [layer, setLayer] = useState<'above' | 'below'>('above');
  const [opacity, setOpacity] = useState<number>(1);
  const [style, setStyle] = useState<'solid' | 'dashed' | 'dotted'>('dashed');
  const [color, setColor] = useState<string>('#3b82f6');

  const fromNode = fromNodeId ? mindMap.nodes[fromNodeId] : null;

  // Potential target nodes (exclude source node)
  const candidateNodes = fromNodeId
    ? (Object.values(mindMap.nodes) as MindNode[]).filter((n) => n.id !== fromNodeId)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toNodeId || !fromNodeId) return;

    const newConnector: Connector = {
      id: `conn-${Date.now()}`,
      fromId: fromNodeId,
      toId: toNodeId,
      label: label.trim() || undefined,
      shape,
      curvature,
      layer,
      opacity,
      style,
      color,
      arrow: 'end',
      width: 2,
    };

    onSaveConnector(newConnector);
    onClose();
  };

  if (!fromNode) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="md">
      <ModalHeader
        title="Crear Conector de Relación"
        subtitle="Enlaza dos nodos con aristas personalizadas"
        icon={<Link className="w-5 h-5 text-cyan-600" />}
        onClose={onClose}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nodo de Origen</label>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 truncate">
            {fromNode.text.split('\n')[0]}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nodo de Destino</label>
          <select
            value={toNodeId}
            onChange={(e) => setToNodeId(e.target.value)}
            required
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Selecciona el nodo a conectar...</option>
            {candidateNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.text.split('\n')[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Etiqueta de la Relación (Opcional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: depende de, influye en, relacionado con..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Forma</label>
            <select
              value={shape}
              onChange={(e: any) => setShape(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="curved">Curva Orgánica</option>
              <option value="bezier">Bézier Suave</option>
              <option value="straight">Línea Recta</option>
              <option value="step">Ortogonal / Ángulo</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Capa Visual</label>
            <select
              value={layer}
              onChange={(e: any) => setLayer(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="above">Por Encima (Frente)</option>
              <option value="below">Por Debajo (Fondo)</option>
            </select>
          </div>
        </div>

        {shape !== 'straight' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Curvatura</label>
              <span className="font-mono text-slate-500 text-[11px]">{curvature}px</span>
            </div>
            <input
              type="range"
              min="-200"
              max="200"
              step="5"
              value={curvature}
              onChange={(e) => setCurvature(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Opacidad</label>
            <span className="font-mono text-slate-500 text-[11px]">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Estilo de Línea</label>
            <select
              value={style}
              onChange={(e: any) => setStyle(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="solid">Continua (Solid)</option>
              <option value="dashed">Guiones (Dashed)</option>
              <option value="dotted">Punteada (Dotted)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0"
              />
              <span className="font-mono text-slate-600 dark:text-slate-400">{color}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!toNodeId}
          >
            Crear Conector
          </Button>
        </div>
      </form>
    </ModalBackdrop>
  );
};
\\n

## src/components/Modals/ExportImportModal.tsx

\\tsx
import React, { useState } from 'react';
import { MindMap } from '../../types/mindmap';
import {
  exportToFreeplaneXML,
  importFromFreeplaneXML,
  exportToStandaloneHTML,
  exportToMarkdown,
} from '../../utils/freeplaneConverter';
import {
  FileCode,
  Globe,
  FileText,
  Upload,
  Download,
  Sparkles,
} from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';

interface ExportImportModalProps {
  mindMap: MindMap;
  isOpen: boolean;
  onClose: () => void;
  onImportMap: (importedMap: MindMap) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  mindMap,
  isOpen,
  onClose,
  onImportMap,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importError, setImportError] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFreeplaneMM = () => {
    const xml = exportToFreeplaneXML(mindMap);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(xml, `${safeTitle}.mm`, 'application/xml');
  };

  const handleExportPortableHTML = () => {
    const html = exportToStandaloneHTML(mindMap);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(html, `${safeTitle}_portable.html`, 'text/html');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(mindMap, null, 2);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(json, `${safeTitle}.json`, 'application/json');
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(mindMap);
    const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
    downloadFile(md, `${safeTitle}.md`, 'text/markdown');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.rootId && parsed.nodes) {
            onImportMap(parsed);
            onClose();
            return;
          }
        }
        // Assume Freeplane / FreeMind .mm XML
        const imported = importFromFreeplaneXML(text);
        onImportMap(imported);
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo. Asegúrate de que sea un archivo .mm o .json válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <ModalHeader
        title="Exportar e Importar Mapas Mentales"
        subtitle="Intercambio de archivos con Freeplane, HTML portable, Markdown e imágenes"
        icon={<Download className="w-5 h-5 text-blue-600" />}
        onClose={onClose}
      />

      {/* Tab Toggle */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'export'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" /> Exportar (Formatos Portables)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'import'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Importar Archivo
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto space-y-4">
        {activeTab === 'export' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Descarga tu mapa mental en formatos estándar para compartir, presentar o abrir en otros programas:
            </p>

            {/* 1. Freeplane .mm */}
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800/60 hover:bg-amber-50/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Formato Freeplane / FreeMind (.mm)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                      100% Compatible
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Archivo XML estándar compatible con Freeplane, FreeMind y suites de escritorio.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportFreeplaneMM}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .mm</span>
              </button>
            </div>

            {/* 2. Standalone HTML */}
            <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-800/60 hover:bg-blue-50/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      HTML Portable (Autónomo & Offline)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Un único archivo HTML que se abre en cualquier navegador sin internet ni servidor.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportPortableHTML}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .html</span>
              </button>
            </div>

            {/* 3. Markdown Outline */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Esquema Markdown (.md)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Texto Plano
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ideal para Obsidian, Notion o editores de texto plano con jerarquía de encabezados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .md</span>
              </button>
            </div>

            {/* 4. JSON Backup */}
            <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-800/60 hover:bg-indigo-50/70 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      Copia Completa JSON (.json)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800">
                      Respaldo 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estructura íntegra con todas las posiciones, colores, notas y presentaciones.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .json</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
                Arrastra o selecciona un archivo .mm o .json
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Soporta mapas mentales creados en Freeplane, FreeMind o copias de seguridad.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs">
                <span>Seleccionar Archivo</span>
                <input
                  type="file"
                  accept=".mm,.json,.xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-medium">
                {importError}
              </div>
            )}
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
};
\\n

## src/components/Modals/IconPackModal.tsx

\\tsx
import React, { useState, useMemo } from 'react';
import {
  VECTOR_ICON_PACK,
  VECTOR_ICON_CATEGORIES,
  VectorIconCategory,
  searchVectorIcons,
  VectorIconItem,
  TOTAL_VECTOR_ICONS_COUNT,
} from '../../utils/vectorIconPack';
import {
  X,
  Search,
  Check,
  Copy,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Info,
  LayoutGrid,
} from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🌟',
  priority_status: '🎯',
  business_finance: '💼',
  tech_code: '💻',
  communication: '💬',
  design_media: '🎨',
  education_science: '🎓',
  navigation_maps: '🧭',
  documents_files: '📁',
  nature_weather: '☀️',
  tools_security: '🛡️',
  health_sports: '🏃',
  emojis_symbols: '✨',
};

const QUICK_SEARCH_TAGS = [
  { label: '🎯 Prioridad', query: 'prioridad' },
  { label: '✓ Check', query: 'check' },
  { label: '⚠ Alerta', query: 'alerta' },
  { label: '★ Estrella', query: 'estrella' },
  { label: '👤 Usuario', query: 'usuario' },
  { label: '➔ Flecha', query: 'flecha' },
  { label: '💰 Dinero', query: 'dinero' },
  { label: '📁 Archivo', query: 'archivo' },
];

interface IconPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNodeId: string | null;
  selectedNodeText?: string;
  currentNodeIcons?: string[];
  onToggleIcon: (iconId: string) => void;
}

export const IconPackModal: React.FC<IconPackModalProps> = ({
  isOpen,
  onClose,
  selectedNodeId,
  selectedNodeText,
  currentNodeIcons = [],
  onToggleIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<VectorIconCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewIcon, setPreviewIcon] = useState<VectorIconItem | null>(null);

  // Filtered list
  const filteredIcons = useMemo(() => {
    return searchVectorIcons(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  const handleCopySvgCode = (icon: VectorIconItem) => {
    // Generate clean SVG markup for clipboard
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n  <!-- ${icon.name} (${icon.id}) -->\n</svg>`;
    navigator.clipboard.writeText(svgString);
    setCopiedId(icon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="5xl" className="h-[90vh]">
      <ModalHeader
        title="Explorador de Iconos SVG Vectoriales"
        subtitle="100% vectoriales, libre uso (MIT), ultraligeros y escalables para nodos y mapas mentales"
        icon={<Sparkles className="w-5 h-5 text-blue-600" />}
        badge={
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
            {TOTAL_VECTOR_ICONS_COUNT} Iconos
          </span>
        }
        onClose={onClose}
      />

        {/* Selected Node Status Bar */}
        {selectedNodeId && (
          <div className="bg-blue-50/90 border-b border-blue-100 px-5 py-1.5 flex items-center justify-between text-xs text-blue-900 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold">Nodo seleccionado:</span>
              <span className="truncate max-w-xs bg-white/80 px-2 py-0.5 rounded border border-blue-200 text-slate-800 font-medium text-[11px]">
                {selectedNodeText || selectedNodeId}
              </span>
              <span className="text-blue-600 font-mono text-[11px]">({currentNodeIcons.length} iconos activos)</span>
            </div>
            <span className="text-[11px] text-blue-700 hidden sm:inline">
              Haz clic en cualquier icono para añadirlo o quitarlo del nodo.
            </span>
          </div>
        )}

        {/* Main Body (Left Category Panel + Right Content Area) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Categories Sidebar */}
          <aside className="w-56 sm:w-64 bg-[var(--sp-bg2)] border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-2.5 space-y-1 select-none">
            <div className="px-2 py-1.5 flex items-center justify-between text-xs font-bold text-[var(--sp-text)]">
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                <span>Categorías</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">12 grupos</span>
            </div>

            {/* "All" Category Button */}
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-[var(--sp-bg)] text-[var(--sp-text)] hover:bg-[var(--sp-hover)] border border-slate-200/70'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-sm">🌟</span>
                <span className="truncate">Todos los Iconos</span>
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ml-1.5 ${
                  activeCategory === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {TOTAL_VECTOR_ICONS_COUNT}
              </span>
            </button>

            {/* 12 Categories List */}
            {VECTOR_ICON_CATEGORIES.map((cat) => {
              const count = VECTOR_ICON_PACK.filter((i) => i.category === cat.id).length;
              const isSelected = activeCategory === cat.id;
              const emoji = CATEGORY_EMOJIS[cat.id] || '📁';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-[var(--sp-bg)] text-[var(--sp-text)] hover:bg-[var(--sp-hover)] border border-slate-200/70'
                  }`}
                  title={cat.description}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{emoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ml-1.5 ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-[var(--sp-bg)] overflow-hidden">
            {/* Top Search Bar & Suggestions */}
            <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, tag o ID (ej: dinero, cpu, correo, exito, estrella)..."
                    className="w-full bg-[var(--sp-input)] border border-[var(--sp-border)] rounded-xl pl-10 pr-10 py-2 text-xs text-[var(--sp-text)] outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="px-3 py-2 bg-[var(--sp-hover)] text-[var(--sp-text)] rounded-xl text-xs font-semibold shrink-0 font-mono">
                  {filteredIcons.length} {filteredIcons.length === 1 ? 'icono' : 'iconos'}
                </div>
              </div>

              {/* Quick Search Tag Suggestions */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Sugerencias:</span>
                {QUICK_SEARCH_TAGS.map((st) => (
                  <button
                    key={st.query}
                    type="button"
                    onClick={() => setSearchQuery(searchQuery === st.query ? '' : st.query)}
                    className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      searchQuery === st.query
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Category Header in Main Area */}
            <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 font-semibold text-[var(--sp-text)]">
                <span className="text-sm">{CATEGORY_EMOJIS[activeCategory] || '📁'}</span>
                <span>
                  {activeCategory === 'all'
                    ? 'Todos los Iconos Vectoriales'
                    : VECTOR_ICON_CATEGORIES.find((c) => c.id === activeCategory)?.name}
                </span>
                {activeCategory !== 'all' && (
                  <span className="text-[11px] font-normal text-slate-500 hidden md:inline">
                    — {VECTOR_ICON_CATEGORIES.find((c) => c.id === activeCategory)?.description}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {filteredIcons.length} mostrados
              </span>
            </div>

            {/* Icon Grid Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 min-h-[300px]">
              {filteredIcons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--sp-text)]">No se encontraron iconos</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    No hay coincidencias para "{searchQuery}". Intenta con sinónimos o borra el filtro.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    Mostrar todos los 500+ iconos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {filteredIcons.map((icon) => {
                    const IconComponent = icon.icon;
                    const isSelectedOnNode = currentNodeIcons.includes(icon.id);
                    const isCurrentPreview = previewIcon?.id === icon.id;

                    return (
                      <div
                        key={icon.id}
                        onClick={() => {
                          setPreviewIcon(icon);
                          if (selectedNodeId) {
                            onToggleIcon(icon.id);
                          }
                        }}
                        onMouseEnter={() => setPreviewIcon(icon)}
                        className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer select-none text-center ${
                          isSelectedOnNode
                            ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400 scale-102'
                            : isCurrentPreview
                            ? 'bg-white border-slate-400 shadow-xs ring-1 ring-slate-300'
                            : 'bg-[var(--sp-bg)] border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Active checkmark */}
                        {isSelectedOnNode && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-2xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}

                        {/* SVG Icon Container */}
                        <div
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-transform group-hover:scale-110 mb-1.5 ${
                            isSelectedOnNode ? 'text-blue-600' : 'text-[var(--sp-muted)] group-hover:text-blue-600'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Icon Name */}
                        <span className="text-[10.5px] font-medium text-[var(--sp-muted)] truncate w-full px-1 leading-tight">
                          {icon.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono truncate w-full mt-0.5">
                          {icon.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Footer with Inspector and Quick Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {previewIcon ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                {React.createElement(previewIcon.icon, { className: 'w-6 h-6' })}
              </div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {previewIcon.name}
                  </span>
                  <code className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {previewIcon.id}
                  </code>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-md">
                  Etiquetas: {previewIcon.tags.join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500" />
              <span>
                Pasa el cursor o pulsa sobre un icono para ver detalles o aplicarlo al mapa.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {previewIcon && (
              <button
                onClick={() => handleCopySvgCode(previewIcon)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                title="Copiar referencia SVG"
              >
                {copiedId === previewIcon.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar ID
                  </>
                )}
              </button>
            )}

            <Button variant="primary" size="sm" onClick={onClose}>
              Listo
            </Button>
          </div>
        </div>
    </ModalBackdrop>
  );
};
\\n

## src/components/Modals/SavedMapsModal.tsx

\\tsx
import React from 'react';
import { SavedMapMeta, getSavedMapsIndex, loadMapById, deleteMapById } from '../../utils/storage';
import { MindMap } from '../../types/mindmap';
import { FolderOpen, Trash2, Clock, Plus, Map } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

interface SavedMapsModalProps {
  isOpen: boolean;
  currentMapId: string;
  onClose: () => void;
  onSelectMap: (map: MindMap) => void;
  onNewMap: () => void;
}

export const SavedMapsModal: React.FC<SavedMapsModalProps> = ({
  isOpen,
  currentMapId,
  onClose,
  onSelectMap,
  onNewMap,
}) => {
  const [mapsList, setMapsList] = React.useState<SavedMapMeta[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setMapsList(getSavedMapsIndex());
    }
  }, [isOpen]);

  const handleOpen = (id: string) => {
    const loaded = loadMapById(id);
    if (loaded) {
      onSelectMap(loaded);
      onClose();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este mapa mental?')) {
      deleteMapById(id);
      setMapsList(getSavedMapsIndex());
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <ModalHeader
        title="Mis Mapas Mentales Guardados"
        subtitle="Mapas almacenados localmente en este navegador"
        icon={<FolderOpen className="w-5 h-5 text-amber-500" />}
        onClose={onClose}
      />

      {/* Action Button */}
      <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {mapsList.length} {mapsList.length === 1 ? 'mapa guardado' : 'mapas guardados'} en este equipo
        </span>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            onNewMap();
            onClose();
          }}
        >
          Crear Nuevo
        </Button>
      </div>

      {/* List */}
      <div className="p-6 overflow-y-auto space-y-2">
        {mapsList.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-xs">
            No tienes mapas guardados todavía.
          </p>
        ) : (
          mapsList.map((m) => {
            const isCurrent = m.id === currentMapId;
            const dateStr = new Date(m.updatedAt).toLocaleString();

            return (
              <div
                key={m.id}
                onClick={() => handleOpen(m.id)}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all group ${
                  isCurrent
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Map className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {m.title} {isCurrent && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold ml-1">(Actual)</span>}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {dateStr}
                      </span>
                      <span>• {m.nodeCount || 1} nodos</span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    title="Eliminar mapa"
                    onClick={(e) => handleDelete(m.id, e)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </ModalBackdrop>
  );
};
\\n

## src/components/Modals/ShortcutsModal.tsx

\\tsx
import React from 'react';
import { Keyboard } from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const SHORTCUTS = [
    { key: 'Tab / Insert', desc: 'Crear nuevo nodo hijo del nodo seleccionado', cat: 'Nodos' },
    { key: 'Enter', desc: 'Crear nuevo nodo hermano al mismo nivel', cat: 'Nodos' },
    { key: 'Shift + Enter', desc: 'Salto de línea multilínea dentro del nodo', cat: 'Edición' },
    { key: 'F2 / Doble Clic', desc: 'Editar el texto del nodo en el mapa', cat: 'Edición' },
    { key: 'Supr / Delete', desc: 'Eliminar el nodo seleccionado y sus hijos', cat: 'Nodos' },
    { key: 'Espacio (Space)', desc: 'Plegar o desplegar la rama del nodo', cat: 'Navegación' },
    { key: 'Flechas (↑ ↓ ← →)', desc: 'Navegar rápidamente entre nodos y ramas', cat: 'Navegación' },
    { key: 'Escape', desc: 'Volver al nodo raíz o cancelar edición', cat: 'Navegación' },
    { key: 'Ctrl + Z', desc: 'Deshacer la última acción', cat: 'Historial' },
    { key: 'Ctrl + Y', desc: 'Rehacer la acción deshecha', cat: 'Historial' },
    { key: 'Ctrl + C / X / V', desc: 'Copiar, cortar y pegar ramas completas', cat: 'Portapapeles' },
    { key: 'Ctrl + F', desc: 'Abrir la barra de búsqueda y filtrado', cat: 'Vistas' },
    { key: 'Alt + O', desc: 'Mostrar u ocultar el panel lateral de esquema', cat: 'Vistas' },
    { key: 'Alt + P', desc: 'Mostrar u ocultar el panel de propiedades', cat: 'Vistas' },
    { key: 'F5', desc: 'Iniciar el modo presentación de diapositivas', cat: 'Vistas' },
    { key: 'F11', desc: 'Alternar modo pantalla completa', cat: 'Vistas' },
  ];

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <ModalHeader
        title="Atajos de Teclado"
        subtitle="Accesos rápidos compatibles con Freeplane y FreeMind"
        icon={<Keyboard className="w-5 h-5 text-blue-600" />}
        onClose={onClose}
      />

      {/* Shortcuts List */}
      <div className="p-6 overflow-y-auto space-y-2 text-xs">
        {SHORTCUTS.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
          >
            <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
            <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shrink-0 ml-4">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </ModalBackdrop>
  );
};
\\n

## src/components/Modals/TemplatesModal.tsx

\\tsx
import React, { useState, useMemo } from 'react';
import { MindMap, CalculatedNodeLayout } from '../../types/mindmap';
import { ALL_TEMPLATES, BLANK_MAP } from '../../utils/sampleMaps';
import { computeMindMapLayout } from '../../utils/layoutEngine';
import { THEMES } from '../../utils/themes';
import { TEMPLATE_SVGS } from '../../utils/templateIllustrations';
import {
  X,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Sliders,
  Palette,
  GitBranch,
  Tag,
  Eye,
} from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';


interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MindMap) => void;
}

/**
 * Component that computes the real mindmap layout and renders a sharp mini SVG diagram
 */
const TemplateMapPreview: React.FC<{ map: MindMap; height?: number }> = ({ map, height = 110 }) => {
  const theme = THEMES[map.themeId] || THEMES.default;

  const { viewBox, layoutMap, nodesList } = useMemo(() => {
    const computed = computeMindMapLayout(map, { x: 0, y: 0 });
    const nodes = Array.from(computed.values()) as CalculatedNodeLayout[];

    if (nodes.length === 0) {
      return {
        viewBox: '-150 -100 300 200',
        layoutMap: computed,
        nodesList: [],
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((l) => {
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x + l.width);
      minY = Math.min(minY, l.y);
      maxY = Math.max(maxY, l.y + l.height);
    });

    const pad = 24;
    const w = Math.max(120, maxX - minX + pad * 2);
    const h = Math.max(80, maxY - minY + pad * 2);
    const vx = minX - pad;
    const vy = minY - pad;

    return {
      viewBox: `${vx} ${vy} ${w} ${h}`,
      layoutMap: computed,
      nodesList: nodes,
    };
  }, [map]);

  const isDark = theme.id === 'dark' || theme.id === 'blueprint' || map.backgroundColor === '#0f172a';
  const bgColor = map.backgroundColor || theme.background || (isDark ? '#0f172a' : '#f8fafc');

  return (
    <div
      className="w-full relative rounded-lg overflow-hidden border border-slate-200/80 shadow-2xs group-hover:border-blue-400 transition-colors"
      style={{ height: `${height}px`, backgroundColor: bgColor }}
    >
      <svg
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Branches / Edges */}
        <g id="preview-edges">
          {nodesList.map((childLayout) => {
            const childNode = map.nodes[childLayout.id];
            if (!childNode || !childNode.parentId) return null;

            const parentLayout = layoutMap.get(childNode.parentId);
            if (!parentLayout) return null;

            const branchColor =
              childNode.edgeColor ||
              theme.branchColors[childLayout.branchIndex % theme.branchColors.length] ||
              '#3b82f6';

            let pathData = '';
            if (childLayout.side === 'left') {
              const startX = parentLayout.x;
              const startY = parentLayout.y + parentLayout.height / 2;
              const endX = childLayout.x + childLayout.width;
              const endY = childLayout.y + childLayout.height / 2;
              const midX = (startX + endX) / 2;
              pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
            } else if (childLayout.side === 'bottom') {
              const startX = parentLayout.x + parentLayout.width / 2;
              const startY = parentLayout.y + parentLayout.height;
              const endX = childLayout.x + childLayout.width / 2;
              const endY = childLayout.y;
              const midY = (startY + endY) / 2;
              pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
            } else if (childLayout.side === 'top') {
              const startX = parentLayout.x + parentLayout.width / 2;
              const startY = parentLayout.y;
              const endX = childLayout.x + childLayout.width / 2;
              const endY = childLayout.y + childLayout.height;
              const midY = (startY + endY) / 2;
              pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
            } else {
              const startX = parentLayout.x + parentLayout.width;
              const startY = parentLayout.y + parentLayout.height / 2;
              const endX = childLayout.x;
              const endY = childLayout.y + childLayout.height / 2;
              const midX = (startX + endX) / 2;
              pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
            }

            return (
              <path
                key={`preview-edge-${childNode.parentId}-${childNode.id}`}
                d={pathData}
                fill="none"
                stroke={branchColor}
                strokeWidth={childLayout.depth === 1 ? 3 : 2}
                strokeOpacity={0.85}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g id="preview-nodes">
          {nodesList.map((l) => {
            const node = map.nodes[l.id];
            const isRoot = l.depth === 0;
            const branchColor = theme.branchColors[l.branchIndex % theme.branchColors.length] || '#3b82f6';

            let nodeFill = node?.color;
            if (!nodeFill) {
              if (isRoot) {
                nodeFill = theme.rootBg || '#2563eb';
              } else if (l.depth === 1) {
                nodeFill = branchColor;
              } else {
                nodeFill = theme.nodeBg || '#ffffff';
              }
            }

            const strokeColor = isRoot ? '#ffffff' : l.depth === 1 ? '#ffffff' : branchColor;
            const strokeW = isRoot ? 2.5 : 1.5;
            const shape = node?.shape || (isRoot ? 'bubble' : 'bubble');

            if (shape === 'circle') {
              const r = Math.min(l.width, l.height) / 2;
              return (
                <g key={`preview-node-${l.id}`}>
                  <circle
                    cx={l.x + l.width / 2}
                    cy={l.y + l.height / 2}
                    r={r}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'oval') {
              return (
                <g key={`preview-node-${l.id}`}>
                  <ellipse
                    cx={l.x + l.width / 2}
                    cy={l.y + l.height / 2}
                    rx={l.width / 2}
                    ry={l.height / 2}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'hexagon') {
              const x = l.x;
              const y = l.y;
              const w = l.width;
              const h = l.height;
              const cut = Math.min(w * 0.18, 12);
              const points = `${x + cut},${y} ${x + w - cut},${y} ${x + w},${y + h / 2} ${x + w - cut},${y + h} ${x + cut},${y + h} ${x},${y + h / 2}`;
              return (
                <g key={`preview-node-${l.id}`}>
                  <polygon
                    points={points}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'pill') {
              const r = l.height / 2;
              return (
                <g key={`preview-node-${l.id}`}>
                  <rect
                    x={l.x}
                    y={l.y}
                    width={l.width}
                    height={l.height}
                    rx={r}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'fork') {
              return (
                <g key={`preview-node-${l.id}`}>
                  <line
                    x1={l.x}
                    y1={l.y + l.height}
                    x2={l.x + l.width}
                    y2={l.y + l.height}
                    stroke={strokeColor}
                    strokeWidth={strokeW * 2}
                    strokeLinecap="round"
                  />
                </g>
              );
            }

            // Default Bubble / Rectangle / Star / Square / Arrow
            return (
              <g key={`preview-node-${l.id}`}>
                <rect
                  x={l.x}
                  y={l.y}
                  width={l.width}
                  height={l.height}
                  rx={isRoot ? 8 : shape === 'square' ? 2 : shape === 'rectangle' ? 3 : 6}
                  fill={nodeFill}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Eye Badge */}
      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[9px] font-semibold text-white/90 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="w-2.5 h-2.5" />
        Vista Previa
      </div>
    </div>
  );
};

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags across all templates
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    ALL_TEMPLATES.forEach((tmpl) => {
      tmpl.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, []);

  if (!isOpen) return null;

  const CATEGORIES = ['Todas', 'Destacada', 'Estrategia', 'Tecnología', 'Gestión', 'Creatividad', 'Educación'];

  const getTemplateIllustration = (id: string): string => {
    switch (id) {
      case 'tutorial':
        return TEMPLATE_SVGS.brainAi;
      case 'okr-strategy':
        return TEMPLATE_SVGS.strategyChess;
      case 'cloud-arch':
        return TEMPLATE_SVGS.cloudInfra;
      case 'brainstorming':
        return TEMPLATE_SVGS.ideaBulb;
      case 'org-chart':
        return TEMPLATE_SVGS.teamCollab;
      case 'agile-sprint':
        return TEMPLATE_SVGS.agileKanban;
      case 'study-exam':
        return TEMPLATE_SVGS.educationCap;
      case 'marketing-funnel':
        return TEMPLATE_SVGS.marketingTarget;
      case 'decision-tree':
        return TEMPLATE_SVGS.workflowGear;
      case 'product-gtm':
        return TEMPLATE_SVGS.rocketLaunch;
      case 'ai-roadmap':
        return TEMPLATE_SVGS.aiRobot;
      case 'swot-matrix':
        return TEMPLATE_SVGS.swotMatrix;
      case 'cybersecurity-framework':
        return TEMPLATE_SVGS.securityShield;
      case 'customer-journey':
        return TEMPLATE_SVGS.customerJourney;
      case 'startup-pitch':
        return TEMPLATE_SVGS.pitchDeck;
      case 'fullstack-roadmap':
        return TEMPLATE_SVGS.codeDev;
      case 'financial-budget':
        return TEMPLATE_SVGS.financeGrowth;
      case 'design-system':
        return TEMPLATE_SVGS.designPalette;
      case 'content-creator':
        return TEMPLATE_SVGS.podcastMic;
      case 'health-wellness':
        return TEMPLATE_SVGS.healthHeart;
      default:
        return TEMPLATE_SVGS.mindMapHub;
    }
  };

  const filteredTemplates = ALL_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'Todas' || tmpl.category === selectedCategory;
    const matchesTag = !selectedTag || (tmpl.tags && tmpl.tags.includes(selectedTag));
    const matchesSearch =
      searchQuery.trim() === '' ||
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tmpl.themeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.layoutLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="4xl" forceLight>
      <ModalHeader
        title="Galería de Plantillas y Ejemplos"
        subtitle="Mapas preconfigurados con etiquetas de nodo, estilos de enlace, perfiles de grosor y paletas"
        icon={<Sparkles className="w-5 h-5 text-blue-600" />}
        badge={
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {ALL_TEMPLATES.length} Modelos
          </span>
        }
        onClose={onClose}
        forceLight
      />

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col gap-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-0.5 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por plantilla, etiqueta (#)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick Tag Filtering Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-[11px]">
            <span className="flex items-center gap-1 text-slate-400 font-semibold shrink-0 mr-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Tags:
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 transition-colors shrink-0 cursor-pointer"
              >
                Limpiar (#{selectedTag}) ×
              </button>
            )}
            {allUniqueTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid Container */}
        <div className="p-6 overflow-y-auto max-h-[58vh] space-y-4">
          {/* Blank Map Quick Action */}
          <div
            onClick={() => {
              onSelectTemplate({
                ...BLANK_MAP,
                id: `map-${Date.now()}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
              onClose();
            }}
            className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 bg-slate-50/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={TEMPLATE_SVGS.mindMapHub}
                  alt="Mapa en Blanco"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                  Comenzar con Mapa en Blanco
                </h4>
                <p className="text-[11px] text-slate-500">
                  Lienzo limpio desde una idea central para estructurar libremente tus pensamientos
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-all shrink-0">
              Crear <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Grid of 20 Distinct Templates with Live Map Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => {
              const illustrationUrl = tmpl.map.nodes[tmpl.map.rootId]?.imageUrl || getTemplateIllustration(tmpl.id);

              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate({
                      ...tmpl.map,
                      id: `map-${Date.now()}`,
                      updatedAt: Date.now(),
                    });
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between group ${tmpl.color}`}
                >
                  <div>
                    {/* Header: Illustration + Title + Category */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0 border border-slate-200/80 p-1 overflow-hidden group-hover:scale-105 transition-transform">
                        <img
                          src={illustrationUrl}
                          alt={tmpl.title}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {tmpl.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${tmpl.badgeColor}`}>
                          {tmpl.category}
                        </span>
                      </div>
                    </div>

                    {/* Live Mind Map Visual Diagram Preview */}
                    <div className="mb-2.5">
                      <TemplateMapPreview map={tmpl.map} height={105} />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5 line-clamp-2">
                      {tmpl.desc}
                    </p>

                    {/* Template Tags Display */}
                    {tmpl.tags && tmpl.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mb-3">
                        {tmpl.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(selectedTag === tag ? null : tag);
                            }}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                              selectedTag === tag
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/90 text-blue-700 border border-blue-200/80 hover:bg-blue-100/80'
                            }`}
                            title={`Filtrar por etiqueta #${tag}`}
                          >
                            <Tag className="w-2.5 h-2.5 opacity-70" />
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metadata badges for visual differentiation */}
                  <div className="pt-2.5 border-t border-slate-200/60 mt-auto flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                      <Palette className="w-3 h-3 text-slate-400" />
                      {tmpl.themeName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                      <GitBranch className="w-3 h-3 text-slate-400" />
                      {tmpl.layoutLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                      <Sliders className="w-3 h-3 text-slate-400" />
                      {tmpl.edgeDesc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron plantillas con el criterio especificado.
              {(selectedTag || searchQuery) && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                      setSelectedCategory('Todas');
                    }}
                    className="px-3 py-1 bg-blue-50 text-blue-600 font-semibold rounded-md hover:bg-blue-100 text-xs"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Selecciona cualquier plantilla para cargar su contenido y configuración visual completa.</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
    </ModalBackdrop>
  );
};
\\n

## src/components/Modals/__tests__/TemplatesModal.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/Modals/__tests__/TemplatesModal.test.tsx'
\\n

## src/components/NodeComponent.tsx

\\tsx
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../types/mindmap';
import {
  getNodeShapeStyles,
  isDarkNodeBackground,
  NodeSvgPolygonBackground,
  NodeBubbleTail,
} from './molecules/node/NodeBackgroundRenderer';
import { NodeHeaderRow } from './molecules/node/NodeHeaderRow';
import { NodeBadgesBar } from './molecules/node/NodeBadgesBar';
import { NodeActionButtons } from './molecules/node/NodeActionButtons';

export interface NodeComponentProps {
  node: MindNode;
  layout: CalculatedNodeLayout;
  isSelected: boolean;
  isEditing: boolean;
  theme: MindMapTheme;
  branchColor: string;
  isMatch?: boolean;
  isPresentationMode?: boolean;
  isStaged?: boolean;
  globalVisibility?: {

    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
    showAllNotesInline?: boolean;
  };
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string) => void;
  onTextChange: (id: string, newText: string) => void;
  onFinishEditing: () => void;
  onToggleFold: (id: string, e: React.MouseEvent) => void;
  onAddChild: (parentId: string) => void;
  onOpenNote: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onDropOnNode: (draggedId: string, targetId: string) => void;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  layout,
  isSelected,
  isEditing,
  theme,
  branchColor,
  isMatch,
  isPresentationMode,
  isStaged = false,
  globalVisibility,
  onSelect,
  onDoubleClick,
  onTextChange,
  onFinishEditing,
  onToggleFold,
  onAddChild,
  onOpenNote,
  onDragStart,
  onDropOnNode,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(node.text);

  // Resync editText when entering edit mode: node.text may have changed since mount
  // (outline edits, undo/redo, templates, paste) and nodes are keyed by id (no remount).
  useEffect(() => {
    if (isEditing) {
      setEditText(node.text);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const isRoot = !node.parentId;
  const shape = node.shape || (isRoot ? 'rounded' : 'rounded');
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star';

  // Effective Visibility (combines node-level and map-level global toggles)
  const isBodyHidden = Boolean(node.hideBody || globalVisibility?.hideAllBodies);
  const isImageHidden = Boolean(node.hideImage || globalVisibility?.hideAllImages);
  const isTagsHidden = Boolean(node.hideTags || globalVisibility?.hideAllTags);
  const isIconsHidden = Boolean(node.hideIcons || globalVisibility?.hideAllIcons);
  const isLinkHidden = Boolean(node.hideLink || globalVisibility?.hideAllLinks);
  const isProgressHidden = Boolean(node.hideProgress);

  // Colors & luminance
  const textColor = isRoot
    ? (node.textColor || theme.rootText)
    : (node.textColor || theme.nodeText);
  const effectiveFontFamily = node.fontFamily || theme.fontFamily;
  const isDarkBg = isDarkNodeBackground(node.color, isRoot);

  const shapeStyles = getNodeShapeStyles(node, theme, branchColor, isRoot);

  return (
    <div
      id={`node-${node.id}`}
      style={{
        left: `${layout.x}px`,
        top: `${layout.y}px`,
        width: `${layout.width}px`,
        minHeight: `${layout.height}px`,
        ...shapeStyles,
        ...(isSelected && shape === 'fork' ? { filter: 'drop-shadow(0 2px 4px rgba(59,130,246,0.8))' } : {}),
      }}
      className={`absolute select-none flex flex-col justify-center transition-all duration-150 group cursor-pointer ${
        isSvgShape || shape === 'fork' ? 'px-0 py-0 shadow-none' : 'px-2 py-1 shadow-xs'
      } ${
        isStaged
          ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_35px_rgba(59,130,246,0.9)] scale-[1.03] z-50 animate-pulse'
          : isSelected
          ? isSvgShape || shape === 'fork'
            ? 'z-30'
            : 'ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-50 shadow-md z-30'
          : isSvgShape || shape === 'fork'
          ? 'z-10'
          : 'hover:shadow-md z-10'
      } ${isMatch ? (isSvgShape ? 'brightness-125' : 'ring-2 ring-amber-400 bg-amber-50/90') : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(node.id);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Staged Checkmark Badge (Presentation Editor Frame Picking) */}
      {isStaged && (
        <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center font-bold text-xs border-2 border-white animate-bounce z-50">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* 1. SVG Polygon Background (Hexagon, Arrow, Star) */}
      <NodeSvgPolygonBackground
        node={node}
        layout={layout}
        theme={theme}
        branchColor={branchColor}
        isRoot={isRoot}
        isSelected={isSelected}
      />

      {/* 2. Visible Speech Bubble Pointy Tail */}
      <NodeBubbleTail
        node={node}
        layout={layout}
        theme={theme}
        branchColor={branchColor}
        isRoot={isRoot}
      />

      {/* 3. Header Row (Top Image, Top Icons, Drag Handle, Title & Body) */}
      <NodeHeaderRow
        node={node}
        theme={theme}
        isRoot={isRoot}
        isHovered={isHovered}
        isEditing={isEditing}
        editText={editText}
        setEditText={setEditText}
        onTextChange={onTextChange}
        onFinishEditing={onFinishEditing}
        onDragStart={onDragStart}
        isImageHidden={isImageHidden}
        isIconsHidden={isIconsHidden}
        isProgressHidden={isProgressHidden}
        isBodyHidden={isBodyHidden}
        textColor={textColor}
        effectiveFontFamily={effectiveFontFamily}
        contentMaxWidth={shape === 'hexagon' ? '68%' : undefined}
        mediaMaxWidth={shape === 'hexagon' ? '96px' : undefined}
      />

      {/* 4. Badges Bar (Right Image, Bottom Image, Note icon/inline, Prominent Link, Tags, Tooltip) */}
      <NodeBadgesBar
        node={node}
        isHovered={isHovered}
        isEditing={isEditing}
        isPresentationMode={isPresentationMode}
        isImageHidden={isImageHidden}
        isLinkHidden={isLinkHidden}
        isTagsHidden={isTagsHidden}
        isDarkNodeBackground={isDarkBg}
        side={layout.side}
        onOpenNote={onOpenNote}
        globalVisibility={globalVisibility}
        contentMaxWidth={shape === 'hexagon' ? '68%' : undefined}
        mediaMaxWidth={shape === 'hexagon' ? '96px' : undefined}
      />

      {/* 5. Action Buttons (Fold/Unfold branch badge & Quick Add child button) */}
      <NodeActionButtons
        node={node}
        side={layout.side}
        hasChildren={hasChildren}
        branchColor={branchColor}
        isHovered={isHovered}
        isEditing={isEditing}
        onToggleFold={onToggleFold}
        onAddChild={onAddChild}
      />
    </div>
  );
};
\\n

## src/components/OutlineView.tsx

\\tsx
import React, { useState, useMemo } from 'react';
import { MindMap, MindNode } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Search,
  X,
  Maximize2,
  Minimize2,
  FolderOpen,
  FolderClosed,
  ChevronsDownUp,
  ChevronsUpDown,
  PanelLeftClose,
  Tag,
} from 'lucide-react';

// Utility to ensure optimal contrast against the outline panel's white/light background
function getReadableOutlineTextColor(customColor?: string, defaultColor: string = '#1e293b'): string {
  if (!customColor) return defaultColor;

  const clean = customColor.trim().toLowerCase();
  // Handle white or near-white CSS strings
  if (
    clean === '#fff' ||
    clean === '#ffffff' ||
    clean === 'white' ||
    clean.startsWith('rgba(255, 255, 255') ||
    clean.startsWith('rgba(255,255,255') ||
    clean.startsWith('rgb(255, 255, 255') ||
    clean.startsWith('rgb(255,255,255')
  ) {
    return defaultColor;
  }

  // Check luminance for hex colors
  const hex = clean.replace('#', '');
  if (hex.length === 6 || hex.length === 3) {
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      // YIQ perceptual brightness calculation
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      // If the color is too light for a light panel background (brightness > 180), fallback to high-contrast dark color
      if (yiq > 180) {
        return defaultColor;
      }
    }
  }

  return customColor;
}

interface OutlineViewProps {
  mindMap: MindMap;
  selectedNodeId: string | null;
  isOpen: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onSelectNode: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onAddChild: (parentId: string) => void;
  onAddSibling: (siblingId: string) => void;
  onDeleteNode: (id: string) => void;
  onToggleFold: (id: string) => void;
  onFoldAll?: () => void;
  onUnfoldAll?: () => void;
  onClose: () => void;
}

export const OutlineView: React.FC<OutlineViewProps> = ({
  mindMap,
  selectedNodeId,
  isOpen,
  isFullscreen = false,
  onToggleFullscreen,
  onSelectNode,
  onUpdateText,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleFold,
  onFoldAll,
  onUnfoldAll,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const rootNode = mindMap.nodes[mindMap.rootId];
  const totalNodesCount = useMemo(() => Object.keys(mindMap.nodes).length, [mindMap.nodes]);

  // Compute matched node IDs if search query exists
  const matchedNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const set = new Set<string>();

    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      const matchText = n.text?.toLowerCase().includes(query);
      const matchBody = n.body?.toLowerCase().includes(query);
      const matchTags = n.tags?.some((t) => t.toLowerCase().includes(query));
      if (matchText || matchBody || matchTags) {
        set.add(n.id);
        // Add ancestors so hierarchy path remains visible
        let curr = n.parentId;
        while (curr) {
          set.add(curr);
          curr = mindMap.nodes[curr]?.parentId;
        }
      }
    });

    return set;
  }, [mindMap.nodes, searchQuery]);

  if (!isOpen || !rootNode) return null;

  const renderOutlineNode = (nodeId: string, depth: number = 0) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return null;

    // Filter by search query if active
    if (matchedNodeIds && !matchedNodeIds.has(node.id)) {
      return null;
    }

    const isSelected = selectedNodeId === node.id;
    const isEditing = editingId === node.id;
    const isRoot = node.id === mindMap.rootId;
    const hasChildren = node.children && node.children.length > 0;
    const isSearchMatch =
      searchQuery.trim() &&
      (node.text?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        node.body?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        node.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase().trim())));

    return (
      <div key={node.id} className="flex flex-col">
        {/* Node Line Row */}
        <div
          style={{ paddingLeft: `${depth * 18 + 10}px` }}
          onClick={() => onSelectNode(node.id)}
          className={`flex items-start gap-1.5 py-1.5 pr-2.5 border-l-2 transition-all cursor-pointer group text-xs ${
            isSelected
              ? 'bg-blue-50/90 border-blue-600 text-blue-950 font-medium shadow-2xs'
              : isSearchMatch
              ? 'bg-amber-50/80 border-amber-400 text-slate-800'
              : 'border-transparent hover:bg-[var(--sp-hover)] text-[var(--sp-text)]'
          }`}
        >
          {/* Fold/Unfold Arrow */}
          <div className="pt-0.5 shrink-0">
            {hasChildren ? (
              <button
                title={node.folded ? 'Desplegar rama' : 'Plegar rama'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFold(node.id);
                }}
                className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
              >
                {node.folded ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block" />
            )}
          </div>

          {/* Node Bullet / Dot */}
          <div className="pt-1.5 shrink-0">
            <span
              style={{ backgroundColor: node.color || (isRoot ? '#2563eb' : '#64748b') }}
              className={`w-2 h-2 rounded-full block ${isRoot ? 'ring-2 ring-blue-300' : ''}`}
            />
          </div>

          {/* Icons */}
          {node.icons && node.icons.length > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
              {node.icons.map((ic, i) => (
                <span key={i} className="text-xs">{renderNodeIcon(ic)}</span>
              ))}
            </div>
          )}

          {/* Progress badge */}
          {node.progress !== undefined && (
            <span
              className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 mt-0.5 ${
                node.progress === 100
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {node.progress}%
            </span>
          )}

          {/* Text Content / In-place Input */}
          <div className="flex-1 min-w-0 pr-1">
            {isEditing ? (
              <input
                type="text"
                autoFocus
                value={node.text}
                onChange={(e) => onUpdateText(node.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingId(null);
                    onAddSibling(node.id);
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    setEditingId(null);
                    onAddChild(node.id);
                  } else if (e.key === 'Escape') {
                    setEditingId(null);
                  }
                }}
                className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 outline-none font-medium shadow-2xs"
              />
            ) : (
              <div className="flex flex-col">
                <span
                  onDoubleClick={() => setEditingId(node.id)}
                  title="Doble clic para editar título"
                  style={{
                    color: getReadableOutlineTextColor(
                      node.textColor,
                      isRoot ? '#0f172a' : isSelected ? '#1e3a8a' : '#1e293b'
                    ),
                    fontWeight: node.bold || isRoot ? 'bold' : 'normal',
                    fontStyle: node.italic ? 'italic' : 'normal',
                  }}
                  className={`leading-tight block break-words ${
                    isRoot ? 'font-bold text-[13px]' : 'text-xs'
                  }`}
                >
                  {node.text}
                </span>

                {/* Subtext Body */}
                {node.body && (
                  <span
                    style={{
                      color: getReadableOutlineTextColor(node.bodyColor, '#64748b'),
                      fontWeight: node.bodyBold ? 'bold' : 'normal',
                      fontStyle: node.bodyItalic ? 'italic' : 'normal',
                    }}
                    className="text-[11px] block truncate mt-0.5 leading-snug"
                  >
                    {node.body}
                  </span>
                )}

                {/* Tags */}
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Note / Link indicators */}
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {node.note && (
              <span title="Tiene nota">
                <FileText className="w-3 h-3 text-slate-400" />
              </span>
            )}
            {node.link && (
              <a
                href={node.link}
                target="_blank"
                rel="noreferrer"
                title={`Enlace: ${node.link}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Hover Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
            <button
              title="Agregar nodo hijo (Tab)"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
            {!isRoot && (
              <button
                title="Eliminar nodo (Supr)"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
                className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Render Children Recursively if not folded */}
        {!node.folded && hasChildren && (
          <div className="flex flex-col">
            {node.children.map((childId) => renderOutlineNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${
        isFullscreen
          ? 'flex-1 z-30'
          : 'w-80 md:w-88 border-r border-[var(--sp-border)] shadow-xl z-20 shrink-0'
      } bg-[var(--sp-bg)] flex flex-col h-full overflow-hidden transition-all select-none`}
    >
      {/* Outline Panel Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 bg-[var(--sp-bg2)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-xs text-[var(--sp-text)]">Panel de Esquema</h2>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200/70 text-[10px] font-semibold text-slate-600">
                {totalNodesCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Jerarquía y vista outline</p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1">
          {/* Toggle search */}
          <button
            title="Buscar en esquema"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              showSearch || searchQuery ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Unfold All */}
          {onUnfoldAll && (
            <button
              title="Desplegar todas las ramas"
              onClick={onUnfoldAll}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fold All */}
          {onFoldAll && (
            <button
              title="Plegar todas las ramas"
              onClick={onFoldAll}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <FolderClosed className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Fullscreen / Side Panel */}
          {onToggleFullscreen && (
            <button
              title={isFullscreen ? 'Reducir a panel lateral' : 'Maximizar esquema a pantalla completa'}
              onClick={onToggleFullscreen}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close / Hide Side Panel */}
          <button
            title="Ocultar panel lateral (Alt+O)"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Search Input (when search active) */}
      {(showSearch || searchQuery) && (
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Filtrar por texto o #etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-[var(--sp-input)] border border-[var(--sp-border)] rounded-md px-2 py-1 text-xs text-[var(--sp-text)] outline-none focus:border-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Outline Tree List Content */}
      <div className="flex-1 overflow-y-auto py-2.5 space-y-0.5">
        {renderOutlineNode(mindMap.rootId, 0)}
      </div>

      {/* Outline Footer Helper */}
      <div className="px-3 py-2 border-t border-slate-100 bg-[var(--sp-bg2)] text-[10px] text-slate-400 flex items-center justify-between">
        <span>Tab: hijo • Enter: hermano</span>
        <span>Doble clic: editar</span>
      </div>
    </aside>
  );
};
\\n

## src/components/Presentation/ElaboratePresentationSystem.tsx

\\tsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { MindMap, SpatialSlideCard } from '../../types/mindmap';
import { THEMES } from '../../utils/themes';
import { generateDefaultSpatialSlides, SpatialArrangementType } from '../../utils/spatialPresentationGenerator';
import { SpatialSlideCardComponent } from './SpatialSlideCardComponent';
import { SlideDetailModal } from './SlideDetailModal';
import {
  Play,
  Sliders,
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
  RotateCcw,
  Plus,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Palette,
  FileText,
} from 'lucide-react';

interface ElaboratePresentationSystemProps {
  mindMap: MindMap;
  onClose: () => void;
  onUpdateMindMap?: (updated: MindMap) => void;
}

export const ElaboratePresentationSystem: React.FC<ElaboratePresentationSystemProps> = ({
  mindMap,
  onClose,
  onUpdateMindMap,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Slides State (loaded from mindMap or generated initially)
  const initialSlides = useMemo(() => {
    if (mindMap.elaborateSlides !== undefined) {
      return mindMap.elaborateSlides;
    }
    return generateDefaultSpatialSlides(mindMap, 'spiral');
  }, [mindMap.elaborateSlides, mindMap]);


  const [slides, setSlides] = useState<SpatialSlideCard[]>(initialSlides);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(slides[0]?.id || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [isOverviewActive, setIsOverviewActive] = useState<boolean>(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState<boolean>(true);

  // Camera Spatial Coordinates
  const [camPan, setCamPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [camZoom, setCamZoom] = useState<number>(0.65);
  const [camRotation, setCamRotation] = useState<number>(0);

  // Interaction Drag / Rotate / Resize state
  const [isPanningBoard, setIsPanningBoard] = useState<boolean>(false);
  const [boardPanStart, setBoardPanStart] = useState<{ x: number; y: number } | null>(null);

  const [transformingCardId, setTransformingCardId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'drag' | 'rotate' | 'resize' | null>(null);
  const [transformStartPos, setTransformStartPos] = useState<{
    mouseX: number;
    mouseY: number;
    cardX: number;
    cardY: number;
    cardRot: number;
    cardW: number;
    cardH: number;
    cardScale: number;
  } | null>(null);

  // Theme styling
  const theme = THEMES[mindMap.themeId] || THEMES.default;

  // Active slide
  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Sync slides with mindMap
  const saveSlides = useCallback(
    (newSlides: SpatialSlideCard[]) => {
      setSlides(newSlides);
      if (onUpdateMindMap) {
        onUpdateMindMap({
          ...mindMap,
          elaborateSlides: newSlides,
        });
      }
    },
    [mindMap, onUpdateMindMap]
  );

  // Fly Camera smoothly to a target slide (Prezi Cinematic Flight)
  const flyCameraToSlide = useCallback(
    (card: SpatialSlideCard) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vw = rect.width || window.innerWidth;
      const vh = rect.height || window.innerHeight;

      const cardScale = card.spatial.scale || 1;
      const cardW = card.spatial.width;
      const cardH = card.spatial.height;

      // Target zoom should fit the scaled card snugly inside viewport (with safe margin)
      const targetZoom = Math.min(
        Math.max(Math.min((vw * 0.82) / (cardW * cardScale), (vh * 0.78) / (cardH * cardScale)), 0.25),
        2.5
      );
      const targetRotDeg = -card.spatial.rotation; // Inverse rotation to make card horizontal
      const targetRotRad = (targetRotDeg * Math.PI) / 180;

      // Center of the unrotated card in world board space
      const cx = card.spatial.x + cardW / 2;
      const cy = card.spatial.y + cardH / 2;

      // Position of the card center after applying viewport rotation and zoom around (0,0)
      const rotCenterX = (cx * Math.cos(targetRotRad) - cy * Math.sin(targetRotRad)) * targetZoom;
      const rotCenterY = (cx * Math.sin(targetRotRad) + cy * Math.cos(targetRotRad)) * targetZoom;

      setCamZoom(targetZoom);
      setCamRotation(targetRotDeg);
      setCamPan({
        x: vw / 2 - rotCenterX,
        y: vh / 2 - rotCenterY,
      });
    },
    []
  );

  // Overview calculation
  const flyToOverview = useCallback(() => {
    if (!containerRef.current || slides.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const vw = rect.width || window.innerWidth;
    const vh = rect.height || window.innerHeight;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    slides.forEach((s) => {
      const w = s.spatial.width * (s.spatial.scale || 1);
      const h = s.spatial.height * (s.spatial.scale || 1);
      minX = Math.min(minX, s.spatial.x);
      minY = Math.min(minY, s.spatial.y);
      maxX = Math.max(maxX, s.spatial.x + w);
      maxY = Math.max(maxY, s.spatial.y + h);
    });

    const pad = 180;
    const totalW = Math.max(400, maxX - minX + pad * 2);
    const totalH = Math.max(300, maxY - minY + pad * 2);

    const fitZoom = Math.min(Math.max(Math.min(vw / totalW, vh / totalH), 0.15), 1.2);
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    setCamZoom(fitZoom);
    setCamRotation(0);
    setCamPan({
      x: vw / 2 - centerX * fitZoom,
      y: vh / 2 - centerY * fitZoom,
    });
    setIsOverviewActive(true);
  }, [slides]);

  // Sync camera when current slide changes in presenter mode
  useEffect(() => {
    if (isPresenterMode && activeSlide && !isOverviewActive) {
      flyCameraToSlide(activeSlide);
    }
  }, [isPresenterMode, currentSlideIndex, activeSlide, isOverviewActive, flyCameraToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCardId) return;

      if (e.key === 'F5') {
        e.preventDefault();
        setIsPresenterMode((p) => !p);
        setIsOverviewActive(false);
        return;
      }
      if (e.key === 'Escape') {
        if (isPresenterMode) {
          setIsPresenterMode(false);
        } else {
          onClose();
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setIsOverviewActive(false);
        setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault();
        setIsOverviewActive(false);
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
        return;
      }
      if (e.key === 'o' || e.key === 'O' || e.key === 'Home') {
        e.preventDefault();
        if (isOverviewActive && activeSlide) {
          setIsOverviewActive(false);
          flyCameraToSlide(activeSlide);
        } else {
          flyToOverview();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterMode, slides.length, editingCardId, activeSlide, isOverviewActive, flyCameraToSlide, flyToOverview, onClose]);

  // Board Mouse Drag & Card Transformations via Window Listeners
  const handleBoardMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    setIsPanningBoard(true);
    setBoardPanStart({ x: e.clientX - camPan.x, y: e.clientY - camPan.y });
    setSelectedSlideId(null);
  };

  useEffect(() => {
    if (!isPanningBoard && !transformingCardId) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isPanningBoard && boardPanStart) {
        setCamPan({
          x: e.clientX - boardPanStart.x,
          y: e.clientY - boardPanStart.y,
        });
        return;
      }

      if (transformingCardId && transformStartPos && transformMode) {
        const card = slides.find((s) => s.id === transformingCardId);
        if (!card) return;

        const rawDx = (e.clientX - transformStartPos.mouseX) / camZoom;
        const rawDy = (e.clientY - transformStartPos.mouseY) / camZoom;
        const camRotRad = (camRotation * Math.PI) / 180;
        const dx = rawDx * Math.cos(-camRotRad) - rawDy * Math.sin(-camRotRad);
        const dy = rawDx * Math.sin(-camRotRad) + rawDy * Math.cos(-camRotRad);

        if (transformMode === 'drag') {
          const updated = slides.map((s) =>
            s.id === transformingCardId
              ? {
                  ...s,
                  spatial: {
                    ...s.spatial,
                    x: Math.round(transformStartPos.cardX + dx),
                    y: Math.round(transformStartPos.cardY + dy),
                  },
                }
              : s
          );
          setSlides(updated);
        } else if (transformMode === 'rotate') {
          const cardCenterX = card.spatial.x + card.spatial.width / 2;
          const cardCenterY = card.spatial.y + card.spatial.height / 2;
          const screenCardX =
            (cardCenterX * Math.cos(camRotRad) - cardCenterY * Math.sin(camRotRad)) * camZoom + camPan.x;
          const screenCardY =
            (cardCenterX * Math.sin(camRotRad) + cardCenterY * Math.cos(camRotRad)) * camZoom + camPan.y;

          const rad = Math.atan2(e.clientY - screenCardY, e.clientX - screenCardX);
          let deg = Math.round((rad * 180) / Math.PI) - Math.round(camRotation) + 90;
          deg = ((deg % 360) + 360) % 360;

          const updated = slides.map((s) =>
            s.id === transformingCardId ? { ...s, spatial: { ...s.spatial, rotation: deg } } : s
          );
          setSlides(updated);
        } else if (transformMode === 'resize') {
          const initialScale = transformStartPos.cardScale ?? 1.0;
          const initialHypot = Math.hypot(transformStartPos.cardW, transformStartPos.cardH);
          const currentHypot = Math.hypot(transformStartPos.cardW + dx, transformStartPos.cardH + dy);
          const factor = Math.max(0.4, Math.min(3.0, (currentHypot / initialHypot) * initialScale));

          const updated = slides.map((s) =>
            s.id === transformingCardId
              ? {
                  ...s,
                  spatial: {
                    ...s.spatial,
                    scale: Number(factor.toFixed(2)),
                  },
                }
              : s
          );
          setSlides(updated);
        }
      }
    };

    const handleWindowMouseUp = () => {
      setIsPanningBoard(false);
      setBoardPanStart(null);
      if (transformingCardId) {
        saveSlides(slides);
        setTransformingCardId(null);
        setTransformMode(null);
        setTransformStartPos(null);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [
    isPanningBoard,
    boardPanStart,
    transformingCardId,
    transformStartPos,
    transformMode,
    slides,
    camZoom,
    camRotation,
    camPan,
    saveSlides,
  ]);


  // Zoom on wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (isPresenterMode) return;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setCamZoom((prev) => Math.min(Math.max(prev * factor, 0.15), 3.0));
  };

  // Re-arrangement generator
  const handleReArrange = (type: SpatialArrangementType) => {
    const generated = generateDefaultSpatialSlides(mindMap, type);
    saveSlides(generated);
    setCurrentSlideIndex(0);
    flyToOverview();
  };

  // Trajectory Path calculation between slides (Connecting 1 -> 2 -> 3)
  const trajectorySvgPath = useMemo(() => {
    if (slides.length < 2) return '';
    let d = '';
    slides.forEach((s, idx) => {
      const scale = s.spatial.scale || 1;
      const cx = s.spatial.x + (s.spatial.width * scale) / 2;
      const cy = s.spatial.y + (s.spatial.height * scale) / 2;

      if (idx === 0) {
        d += `M ${cx} ${cy}`;
      } else {
        const prev = slides[idx - 1];
        const prevScale = prev.spatial.scale || 1;
        const prevCx = prev.spatial.x + (prev.spatial.width * prevScale) / 2;
        const prevCy = prev.spatial.y + (prev.spatial.height * prevScale) / 2;

        const midX = (prevCx + cx) / 2;
        const midY = (prevCy + cy) / 2 - 80;
        d += ` Q ${midX} ${midY}, ${cx} ${cy}`;
      }
    });
    return d;
  }, [slides]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP HUD BAR (Floating Controls) */}
      <div className="h-14 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-xl shadow-md text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presentación Elaborada (Prezi Espacial)</span>
          </div>
          <span className="text-sm font-semibold text-slate-300 truncate max-w-xs sm:max-w-md">
            {mindMap.title}
          </span>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-bold">
          <button
            onClick={() => {
              setIsPresenterMode(false);
              setIsOverviewActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              !isPresenterMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editor del Lienzo</span>
          </button>
          <button
            onClick={() => {
              setIsPresenterMode(true);
              setIsOverviewActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              isPresenterMode ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Presentar (F5)</span>
          </button>
        </div>

        {/* Right Tools & Exit */}
        <div className="flex items-center gap-2">
          {!isPresenterMode && (
            <>
              {/* Auto-arrangements */}
              <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
                <span className="text-[11px] text-slate-400 px-2 font-semibold">Acomodar:</span>
                <button
                  onClick={() => handleReArrange('spiral')}
                  className="px-2 py-1 rounded hover:bg-slate-700 text-slate-200 cursor-pointer font-medium"
                >
                  Espiral
                </button>
                <button
                  onClick={() => handleReArrange('constellation')}
                  className="px-2 py-1 rounded hover:bg-slate-700 text-slate-200 cursor-pointer font-medium"
                >
                  Constelación
                </button>
                <button
                  onClick={() => handleReArrange('grid')}
                  className="px-2 py-1 rounded hover:bg-slate-700 text-slate-200 cursor-pointer font-medium"
                >
                  Matriz
                </button>
                <button
                  onClick={() => handleReArrange('random')}
                  className="px-2 py-1 rounded hover:bg-slate-700 text-slate-200 cursor-pointer font-medium"
                  title="Acomodar de forma artística/aleatoria"
                >
                  Randómico
                </button>
                <button
                  onClick={() => handleReArrange('stacked')}
                  className="px-2 py-1 rounded hover:bg-slate-700 text-slate-200 cursor-pointer font-medium"
                  title="Acomodar en pila (uno sobre otro con ligera inclinación)"
                >
                  En Pila (Mazo)
                </button>
              </div>

              {/* Add Custom Card */}
              <button
                onClick={() => {
                  const newCard: SpatialSlideCard = {
                    id: `spatial-custom-${Date.now()}`,
                    order: slides.length + 1,
                    title: 'Nueva Diapositiva',
                    spatial: {
                      x: (slides[slides.length - 1]?.spatial.x || 0) + 800,
                      y: (slides[slides.length - 1]?.spatial.y || 0),
                      width: 720,
                      height: 440,
                      scale: 1.0,
                      rotation: 0,
                    },
                    content: {
                      titleText: 'Nueva Diapositiva',
                      bodyText: 'Escribe aquí tu contenido...',
                    },
                  };
                  saveSlides([...slides, newCard]);
                  setSelectedSlideId(newCard.id);
                  setEditingCardId(newCard.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Tarjeta</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            title="Salir al Mapa Mental (ESC)"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN INFINITE SPATIAL CANVAS (Prezi Camera Viewport) */}
      <div
        ref={containerRef}
        onMouseDown={handleBoardMouseDown}
        onWheel={handleWheel}
        className="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing bg-radial from-slate-900 via-slate-950 to-black"
      >
        {/* Spatial Camera Viewport with Inverse Prezi Matrix Transformation */}
        <div
          style={{
            transform: `translate3d(${camPan.x}px, ${camPan.y}px, 0) scale(${camZoom}) rotate(${camRotation}deg)`,
            transformOrigin: '0 0',
            transition: !isPanningBoard && !transformingCardId ? 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none will-change-transform"
        >
          {/* Flight Trajectory Connecting Line */}
          <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-10">
            <defs>
              <linearGradient id="flightLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {trajectorySvgPath && (
              <path
                d={trajectorySvgPath}
                fill="none"
                stroke="url(#flightLineGrad)"
                strokeWidth={4}
                strokeDasharray="8 8"
                strokeLinecap="round"
                className="opacity-70 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]"
              />
            )}
          </svg>

          {/* Render All Spatial Slide Cards */}
          <div className="pointer-events-auto">
            {slides.map((card, idx) => (
              <SpatialSlideCardComponent
                key={card.id}
                card={card}
                isSelected={selectedSlideId === card.id}
                isPresenterMode={isPresenterMode}
                isCurrentActive={idx === currentSlideIndex}
                isOverviewActive={isOverviewActive}
                onSelect={() => {
                  setSelectedSlideId(card.id);
                  setCurrentSlideIndex(idx);
                  if (isPresenterMode) {
                    flyCameraToSlide(card);
                  }
                }}
                onDoubleClick={() => {
                  setEditingCardId(card.id);
                }}
                onEditDetail={() => {
                  setEditingCardId(card.id);
                }}
                onDelete={() => {
                  const updated = slides.filter((s) => s.id !== card.id).map((s, i) => ({ ...s, order: i + 1 }));
                  saveSlides(updated);
                }}
                onDuplicate={() => {
                  const dup: SpatialSlideCard = {
                    ...card,
                    id: `spatial-dup-${Date.now()}`,
                    order: card.order + 1,
                    spatial: {
                      ...card.spatial,
                      x: card.spatial.x + 80,
                      y: card.spatial.y + 80,
                    },
                  };
                  const newSlides = [...slides];
                  newSlides.splice(idx + 1, 0, dup);
                  saveSlides(newSlides.map((s, i) => ({ ...s, order: i + 1 })));
                }}
                onStartDrag={(e) => {
                  e.stopPropagation();
                  setSelectedSlideId(card.id);
                  setTransformingCardId(card.id);
                  setTransformMode('drag');
                  setTransformStartPos({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    cardX: card.spatial.x,
                    cardY: card.spatial.y,
                    cardRot: card.spatial.rotation,
                    cardW: card.spatial.width,
                    cardH: card.spatial.height,
                    cardScale: card.spatial.scale || 1.0,
                  });
                }}
                onStartRotate={(e) => {
                  e.stopPropagation();
                  setSelectedSlideId(card.id);
                  setTransformingCardId(card.id);
                  setTransformMode('rotate');
                  setTransformStartPos({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    cardX: card.spatial.x,
                    cardY: card.spatial.y,
                    cardRot: card.spatial.rotation,
                    cardW: card.spatial.width,
                    cardH: card.spatial.height,
                    cardScale: card.spatial.scale || 1.0,
                  });
                }}
                onStartResize={(e) => {
                  e.stopPropagation();
                  setSelectedSlideId(card.id);
                  setTransformingCardId(card.id);
                  setTransformMode('resize');
                  setTransformStartPos({
                    mouseX: e.clientX,
                    mouseY: e.clientY,
                    cardX: card.spatial.x,
                    cardY: card.spatial.y,
                    cardRot: card.spatial.rotation,
                    cardW: card.spatial.width,
                    cardH: card.spatial.height,
                    cardScale: card.spatial.scale || 1.0,
                  });
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating Quick Navigation & Zoom Buttons */}
        {!isPresenterMode && (
          <div className="absolute bottom-20 left-4 z-40 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-1">
            <button
              onClick={() => setCamZoom((z) => Math.min(z * 1.2, 3.0))}
              title="Acercar (Zoom In)"
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCamZoom((z) => Math.max(z * 0.8, 0.15))}
              title="Alejar (Zoom Out)"
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={flyToOverview}
              title="Ver todo el tablero (O)"
              className="p-2 hover:bg-blue-600 rounded-xl text-blue-400 hover:text-white transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. BOTTOM FILMSTRIP & CONTROLS HUD */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex flex-col z-50 shadow-2xl">
        {/* Progress Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            style={{
              width: `${((currentSlideIndex + 1) / Math.max(1, slides.length)) * 100}%`,
            }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
          />
        </div>

        {/* Filmstrip Bar */}
        {isFilmstripOpen && (
          <div className="px-4 py-2 overflow-x-auto flex items-center gap-2 border-b border-slate-800/80 scrollbar-thin">
            {slides.map((s, idx) => {
              const isCurrent = idx === currentSlideIndex;
              return (
                <div
                  key={`thumb-${s.id}`}
                  onClick={() => {
                    setIsOverviewActive(false);
                    setCurrentSlideIndex(idx);
                    setSelectedSlideId(s.id);
                    flyCameraToSlide(s);
                  }}
                  className={`group relative shrink-0 px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-700 group-hover:bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {s.order}
                  </span>
                  <span className="text-xs max-w-[130px] truncate">{s.title}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Control Actions */}
        <div className="h-12 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-white font-mono">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <span className="hidden sm:inline opacity-60">• {activeSlide?.title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsOverviewActive(false);
                setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
              }}
              title="Anterior (←)"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (isOverviewActive && activeSlide) {
                  setIsOverviewActive(false);
                  flyCameraToSlide(activeSlide);
                } else {
                  flyToOverview();
                }
              }}
              title={isOverviewActive ? 'Volver al foco' : 'Vista Panorámica (O)'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isOverviewActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setIsOverviewActive(false);
                setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
              }}
              title="Siguiente (→ / Espacio)"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <button
              onClick={() => setIsFilmstripOpen((prev) => !prev)}
              title="Mostrar/Ocultar Tira de Diapositivas"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. DETAIL EDIT MODAL (Classic Style Slide Designer) */}
      {editingCardId && (
        <SlideDetailModal
          card={slides.find((s) => s.id === editingCardId) || slides[0]}
          isOpen={Boolean(editingCardId)}
          onClose={() => setEditingCardId(null)}
          onUpdateCard={(updated) => {
            const updatedSlides = slides.map((s) => (s.id === updated.id ? updated : s));
            saveSlides(updatedSlides);
          }}
        />
      )}
    </div>
  );
};
\\n

## src/components/Presentation/SlideDetailModal.tsx

\\tsx
import React, { useState } from 'react';
import { SpatialSlideCard } from '../../types/mindmap';
import { THEMES } from '../../utils/themes';
import { MarkdownView } from '../../utils/markdownRenderer';
import {
  X,
  FileText,
  Type,
  AlignLeft,
  AlignCenter,
  Palette,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';

interface SlideDetailModalProps {
  card: SpatialSlideCard;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCard: (updated: SpatialSlideCard) => void;
}

export const SlideDetailModal: React.FC<SlideDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onUpdateCard,
}) => {
  if (!isOpen) return null;

  const [titleText, setTitleText] = useState(card.content.titleText);
  const [bodyText, setBodyText] = useState(card.content.bodyText || '');
  const [notesMarkdown, setNotesMarkdown] = useState(card.content.notesMarkdown || '');
  const [imageUrl, setImageUrl] = useState(card.content.imageUrl || '');
  const [themeId, setThemeId] = useState(card.style?.themeId || 'default');
  const [contentAlign, setContentAlign] = useState<'center' | 'left'>(card.style?.contentAlign || 'left');
  const [scale, setScale] = useState(card.spatial.scale);
  const [rotation, setRotation] = useState(card.spatial.rotation);

  const handleSave = () => {
    onUpdateCard({
      ...card,
      title: titleText,
      spatial: {
        ...card.spatial,
        scale,
        rotation,
      },
      content: {
        ...card.content,
        titleText,
        bodyText: bodyText.trim() ? bodyText : undefined,
        notesMarkdown: notesMarkdown.trim() ? notesMarkdown : undefined,
        imageUrl: imageUrl.trim() ? imageUrl : undefined,
      },
      style: {
        ...card.style,
        themeId,
        contentAlign,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md">
              Slide #{card.order}
            </span>
            <h2 className="text-base font-bold text-slate-200">Editar Diapositiva (Estilo Clásico)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs / Form */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span>Título del Tema</span>
            </label>
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Escribe el título..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 text-sm font-semibold outline-none transition-all"
            />
          </div>

          {/* 2. Body Text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cuerpo / Explicación</span>
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Descripción breve que complementa el título..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-200 text-xs leading-relaxed outline-none transition-all resize-none"
            />
          </div>

          {/* 3. Speaker Notes Markdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Notas del Orador (Markdown Enriquecido)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Soporta # títulos, **negrita**, listas y links</span>
            </div>
            <textarea
              rows={4}
              value={notesMarkdown}
              onChange={(e) => setNotesMarkdown(e.target.value)}
              placeholder="# Puntos clave de la presentación&#10;- Explicar el concepto principal&#10;- Mencionar ejemplos reales..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-700 font-mono text-xs text-amber-100/90 leading-relaxed outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
            {notesMarkdown.trim().length > 0 && (
              <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Vista Previa:</span>
                <MarkdownView content={notesMarkdown} isDark={true} />
              </div>
            )}
          </div>

          {/* 4. Layout & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                URL de Imagen Adjunta
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-blue-500 text-xs text-slate-200 outline-none"
              />
            </div>

            {/* Alignment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Alineación del Contenido
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setContentAlign('left')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    contentAlign === 'left'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Izquierda</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentAlign('center')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    contentAlign === 'center'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Centrado</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Theme Palette */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Tema Visual de la Diapositiva</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(THEMES).map(([id, t]) => {
                const isCurrent = id === themeId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setThemeId(id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow" style={{ backgroundColor: t.rootBg }} />
                    <span className="text-xs truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Spatial Controls (Rotation & Scale Sliders) */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400">Rotación Espacial</span>
                <span className="text-xs font-mono font-bold text-blue-400">{Math.round(rotation)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400">Escala de Tarjeta</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
};
\\n

## src/components/Presentation/SpatialSlideCardComponent.tsx

\\tsx
import React from 'react';
import { SpatialSlideCard } from '../../types/mindmap';
import { THEMES } from '../../utils/themes';
import { MarkdownView } from '../../utils/markdownRenderer';
import { renderNodeIcon } from '../../utils/iconMap';
import {
  RotateCw,
  Maximize2,
  Trash2,
  Copy,
  Edit3,
  FileText,
  Sparkles,
  Move,
} from 'lucide-react';

interface SpatialSlideCardComponentProps {
  card: SpatialSlideCard;
  isSelected: boolean;
  isPresenterMode: boolean;
  isCurrentActive?: boolean;
  isOverviewActive?: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onEditDetail: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
  onStartRotate: (e: React.MouseEvent) => void;
  onStartResize: (e: React.MouseEvent, corner: string) => void;
}

export const SpatialSlideCardComponent: React.FC<SpatialSlideCardComponentProps> = ({
  card,
  isSelected,
  isPresenterMode,
  isCurrentActive = false,
  isOverviewActive = false,
  onSelect,
  onDoubleClick,
  onEditDetail,
  onDelete,
  onDuplicate,
  onStartDrag,
  onStartRotate,
  onStartResize,
}) => {
  const theme = THEMES[card.style?.themeId || 'default'] || THEMES.default;
  const isRoot = card.order === 1;

  const { x, y, width, height, scale, rotation } = card.spatial;
  const content = card.content;

  // Background and Text color
  const baseBgColor = card.style?.backgroundColor || (isRoot ? theme.rootBg : theme.nodeBg);
  const textColor = card.style?.textColor || (isRoot ? theme.rootText : theme.nodeText);
  const borderColor = card.style?.borderColor || (isRoot ? '#2563eb' : theme.nodeBorder);
  const borderWidth = card.style?.borderWidth ?? (isRoot ? 3 : 2);
  const isCenter = card.style?.contentAlign === 'center';

  // Build Rich Background (Gradients & SVG Patterns)
  const getCardBackgroundStyle = (): React.CSSProperties => {
    const s = card.style;
    if (!s) return { backgroundColor: baseBgColor };

    // 1. Gradients
    if (s.bgType === 'gradient') {
      const g1 = s.gradientColor1 || baseBgColor;
      const g2 = s.gradientColor2 || '#1e293b';
      const dir = s.gradientDirection || 'to-br';
      if (dir === 'radial') {
        return { backgroundImage: `radial-gradient(circle, ${g1}, ${g2})` };
      }
      const cssDir = dir === 'to-r' ? 'to right' : dir === 'to-b' ? 'to bottom' : 'to bottom right';
      return { backgroundImage: `linear-gradient(${cssDir}, ${g1}, ${g2})` };
    }

    // 2. SVG Patterns
    if (s.bgType === 'pattern' && s.pattern) {
      const pat = s.pattern;
      const patColor = s.patternColor || '#94a3b8';
      const size = s.patternSize || 24;
      const opacity = s.patternOpacity ?? 0.45;

      const hexToRgba = (hex: string, op: number) => {
        let cleanHex = hex.replace('#', '');
        let r = 148, g = 163, b = 184;
        if (cleanHex.length === 3) {
          r = parseInt(cleanHex[0] + cleanHex[0], 16);
          g = parseInt(cleanHex[1] + cleanHex[1], 16);
          b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else if (cleanHex.length === 6) {
          r = parseInt(cleanHex.substring(0, 2), 16);
          g = parseInt(cleanHex.substring(2, 4), 16);
          b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${op})`;
      };

      const patRgba = hexToRgba(patColor, opacity);

      if (pat === 'dots') {
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (pat === 'squares') {
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `linear-gradient(to right, ${patRgba} 1px, transparent 1px), linear-gradient(to bottom, ${patRgba} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
        };
      }
      if (pat === 'stripes') {
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `repeating-linear-gradient(45deg, ${patRgba}, ${patRgba} 1.5px, transparent 1.5px, transparent ${size}px)`,
        };
      }
      if (pat === 'hexagons') {
        const R = size;
        const W = Number((R * 1.7320508).toFixed(2));
        const H = Number((R * 3).toFixed(2));
        const W2 = Number((W / 2).toFixed(2));
        const r05 = Number((R * 0.5).toFixed(2));
        const r10 = Number((R * 1.0).toFixed(2));
        const d = `M 0,0 v ${r05} l ${W2},${r05} v ${r10} l -${W2},${r05} v ${r05} M ${W},0 v ${r05} l -${W2},${r05} v ${r10} l ${W2},${r05} v ${r05} M 0,${R * 1.5} h 0`;
        const hexSvg = encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        );
        return {
          backgroundColor: baseBgColor,
          backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
          backgroundSize: `${W}px ${H}px`,
        };
      }
    }

    return { backgroundColor: baseBgColor };
  };

  const richBgStyle = getCardBackgroundStyle();

  // In presenter mode: active slide is on top (z-50) and 100% opaque. Non-active slides are dimmed (opacity 0.22, z-10).
  const isSpotlighted = !isPresenterMode || isOverviewActive || isCurrentActive;
  const zIndexVal = isPresenterMode
    ? isCurrentActive
      ? 60
      : 10
    : isSelected
    ? 50
    : 20;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: 'center center',
        width: `${width}px`,
        minHeight: `${height}px`,
        color: textColor,
        borderColor: isSelected && !isPresenterMode ? '#3b82f6' : isPresenterMode && isCurrentActive ? '#60a5fa' : borderColor,
        borderWidth: `${borderWidth}px`,
        opacity: isSpotlighted ? 1 : 0.2,
        zIndex: zIndexVal,
        transition: 'opacity 400ms ease, box-shadow 300ms ease, border-color 300ms ease',
        ...richBgStyle,
      }}
      className={`absolute top-0 left-0 rounded-3xl p-6 flex flex-col justify-between select-none group ${
        isPresenterMode && isCurrentActive
          ? 'shadow-[0_0_80px_rgba(59,130,246,0.5)] ring-2 ring-blue-400/80'
          : isSelected && !isPresenterMode
          ? 'ring-4 ring-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.35)]'
          : 'shadow-2xl hover:shadow-[0_0_30px_rgba(0,0,0,0.15)]'
      }`}
    >
      {/* 1. Header Badges & Actions */}
      <div className="flex items-center justify-between gap-3 mb-3 border-b border-black/10 dark:border-white/10 pb-3">
        {/* Order Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-md">
            #{card.order}
          </span>
          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {content.tags.slice(0, 2).map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-500/15 text-[11px] font-semibold opacity-90"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls in Edit Mode */}
        {!isPresenterMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/10 p-1 rounded-xl backdrop-blur-xs">
            <button
              title="Editar contenido detallado (Doble clic)"
              onClick={(e) => {
                e.stopPropagation();
                onEditDetail();
              }}
              className="p-1.5 hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              title="Duplicar diapositiva"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1.5 hover:bg-slate-700 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              title="Eliminar diapositiva"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer text-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Content Body */}
      {card.isNoteSlide ? (
        <div className="flex-1 flex flex-col items-start text-left w-full overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-sm border-b border-amber-500/20 pb-2 w-full">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Nota Detallada</span>
            </span>
            <span className="text-base font-extrabold text-slate-100">{content.titleText}</span>
          </div>
          <div className="overflow-y-auto pr-1 text-sm leading-relaxed text-slate-100 max-h-[320px] w-full">
            <MarkdownView content={content.notesMarkdown} isDark={true} />
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
          {/* Optional Image */}
          {content.imageUrl && (
            <div className="mb-4 w-full flex justify-center">
              <img
                src={content.imageUrl}
                alt={content.titleText}
                className="max-h-40 object-contain rounded-xl shadow-md border border-black/5"
              />
            </div>
          )}

          {/* Title & Icons */}
          <div className={`flex items-center gap-2 mb-2 ${isCenter ? 'justify-center' : 'justify-start'}`}>
            {content.icons && content.icons.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {content.icons.map((ic, i) => (
                  <span key={i} className="text-xl">
                    {renderNodeIcon(ic, 'w-5 h-5', textColor, 22)}
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              {content.titleText}
            </h2>
          </div>

          {/* Body Text */}
          {content.bodyText && (
            <p className="text-sm opacity-85 leading-relaxed mb-4 max-w-xl font-medium">
              {content.bodyText}
            </p>
          )}

          {/* Sub-items list if any */}
          {content.subItems && content.subItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 w-full my-2">
              {content.subItems.slice(0, 6).map((sub) => (
                <div
                  key={sub.id}
                  className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold flex items-center gap-2 truncate"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color || '#3b82f6' }} />
                  <span className="truncate">{sub.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Footer with Markdown Notes Preview on standard cards (if not a dedicated note slide) */}
      {!card.isNoteSlide && content.notesMarkdown && content.notesMarkdown.trim().length > 0 && (
        <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Nota del Orador (Ver diapositiva siguiente)</span>
          </div>
        </div>
      )}

      {/* 4. Interactive Transformation Handles in Edit Mode */}
      {isSelected && !isPresenterMode && (
        <>
          {/* Top Rotation Knob */}
          <div
            onMouseDown={onStartRotate}
            title="Arrastra para rotar la tarjeta"
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-50 border-2 border-white"
          >
            <RotateCw className="w-4 h-4" />
          </div>
          <div className="absolute -top-4 left-1/2 -translate-x-px w-0.5 h-4 bg-blue-500 z-40" />

          {/* Drag Move Handle */}
          <div
            onMouseDown={onStartDrag}
            title="Arrastra para mover la posición (X, Y)"
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 text-white shadow-xl text-[10px] font-bold flex items-center gap-1.5 cursor-grab active:cursor-grabbing hover:bg-blue-600 transition-colors z-50 border border-slate-700"
          >
            <Move className="w-3 h-3" />
            <span>Mover ({Math.round(x)}, {Math.round(y)}) • {Math.round(rotation)}°</span>
          </div>

          {/* Corner Resize Knobs */}
          <div
            onMouseDown={(e) => onStartResize(e, 'se')}
            title="Escalar tamaño"
            className="absolute -bottom-2.5 -right-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-50 flex items-center justify-center text-white text-[8px]"
          >
            <Maximize2 className="w-2.5 h-2.5" />
          </div>
          <div
            onMouseDown={(e) => onStartResize(e, 'sw')}
            title="Escalar tamaño"
            className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-50"
          />
          <div
            onMouseDown={(e) => onStartResize(e, 'ne')}
            title="Escalar tamaño"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nesw-resize hover:scale-125 transition-transform z-50"
          />
          <div
            onMouseDown={(e) => onStartResize(e, 'nw')}
            title="Escalar tamaño"
            className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-50"
          />
        </>
      )}
    </div>
  );
};
\\n

## src/components/PresentationMode.tsx

\\tsx
import React, { useState, useEffect, useMemo } from 'react';
import { MindMap, MindNode } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import { MarkdownView } from '../utils/markdownRenderer';
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  Image as ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  GitBranch,
  Network,
  BookOpen,
  CornerUpLeft,
  ArrowUpRight,
  ChevronsRight,
  CornerLeftUp,
  Compass,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react';
import { THEMES } from '../utils/themes';
import { computeMindMapLayout } from '../utils/layoutEngine';
import { CalculatedNodeLayout } from '../types/mindmap';

interface PresentationThemeConfig {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  previewColor: string;
  badgeBg: string;
  isLight: boolean;
  branchColors: string[];
  accentClass?: string;
  cardBgClass?: string;
  cardBorderClass?: string;
}


/**
 * Presentation Themes synchronized with all MindMap Themes from the app.
 */
const PRESENTATION_THEMES: PresentationThemeConfig[] = [
  {
    id: 'default',
    name: 'Clásico Azul',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#2563eb',
    cardBgColor: '#ffffff',
    cardBorderColor: '#cbd5e1',
    previewColor: '#2563eb',
    badgeBg: 'bg-blue-100 border-blue-300 text-blue-800',
    isLight: true,
    branchColors: THEMES.default.branchColors,
  },
  {
    id: 'rainbow',
    name: 'Arcoíris Vibrante',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#3b82f6',
    cardBgColor: '#f8fafc',
    cardBorderColor: '#e2e8f0',
    previewColor: '#0f172a',
    badgeBg: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    isLight: true,
    branchColors: THEMES.rainbow.branchColors,
  },
  {
    id: 'dark',
    name: 'Modo Oscuro',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#38bdf8',
    cardBgColor: '#1e293b',
    cardBorderColor: '#334155',
    previewColor: '#0f172a',
    badgeBg: 'bg-blue-950/80 border-blue-800/60 text-blue-300',
    isLight: false,
    branchColors: THEMES.dark.branchColors,
  },
  {
    id: 'forest',
    name: 'Bosque Esmeralda',
    backgroundColor: '#f0fdf4',
    textColor: '#064e3b',
    accentColor: '#059669',
    cardBgColor: '#ffffff',
    cardBorderColor: '#a7f3d0',
    previewColor: '#047857',
    badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    isLight: true,
    branchColors: THEMES.forest.branchColors,
  },
  {
    id: 'sunset',
    name: 'Atardecer Cálido',
    backgroundColor: '#fffbeb',
    textColor: '#431407',
    accentColor: '#ea580c',
    cardBgColor: '#ffffff',
    cardBorderColor: '#fed7aa',
    previewColor: '#ea580c',
    badgeBg: 'bg-orange-100 border-orange-300 text-orange-800',
    isLight: true,
    branchColors: THEMES.sunset.branchColors,
  },
  {
    id: 'minimal',
    name: 'Minimalista Mono',
    backgroundColor: '#fafafa',
    textColor: '#18181b',
    accentColor: '#27272a',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e4e4e7',
    previewColor: '#18181b',
    badgeBg: 'bg-zinc-200 border-zinc-300 text-zinc-800',
    isLight: true,
    branchColors: THEMES.minimal.branchColors,
  },
  {
    id: 'blueprint',
    name: 'Plano Técnico Blueprint',
    backgroundColor: '#0a2540',
    textColor: '#f0f9ff',
    accentColor: '#38bdf8',
    cardBgColor: '#0f3863',
    cardBorderColor: '#0284c7',
    previewColor: '#0284c7',
    badgeBg: 'bg-sky-950/80 border-sky-800/60 text-sky-300',
    isLight: false,
    branchColors: THEMES.blueprint.branchColors,
  },
  {
    id: 'honeycomb',
    name: 'Panal Creativo',
    backgroundColor: '#fffdf5',
    textColor: '#78350f',
    accentColor: '#d97706',
    cardBgColor: '#ffffff',
    cardBorderColor: '#fde68a',
    previewColor: '#d97706',
    badgeBg: 'bg-amber-100 border-amber-300 text-amber-800',
    isLight: true,
    branchColors: THEMES.honeycomb.branchColors,
  },
];

const MAX_CHILDREN_PER_SLIDE = 6;

export type SlidePhase = 'body' | 'notes' | 'children';

export interface PresentationSlide {
  slideKey: string;
  node: MindNode;
  phase: SlidePhase;
  pageIndex: number;
  totalPages: number;
  bodySubset?: string;
  noteSubset?: string;
  childrenSubset?: string[];
}

interface PresentationModeProps {
  mindMap: MindMap;
  onClose: () => void;
  onEditNode?: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<MindNode>) => void;
}

/**
 * Splits plain body text into readable, non-overflowing slide chunks (~4-6 lines or ~320 chars)
 * when a body is extensive, ensuring full viewport fit without scrollbars.
 */
function splitBodyTextIntoSlideChunks(text: string | undefined, hasImage: boolean): string[] {
  if (!text || !text.trim()) return [];

  const rawParagraphs = text.trim().split(/\n+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  const MAX_LINES_PER_CHUNK = hasImage ? 4 : 6;
  const MAX_CHARS_PER_CHUNK = hasImage ? 280 : 450;

  for (let i = 0; i < rawParagraphs.length; i++) {
    const para = rawParagraphs[i];
    const paraLen = para.length + 1;

    if (
      currentChunk.length >= MAX_LINES_PER_CHUNK ||
      (currentLength + paraLen > MAX_CHARS_PER_CHUNK && currentChunk.length >= 1)
    ) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n\n'));
        currentChunk = [];
        currentLength = 0;
      }
    }

    currentChunk.push(para);
    currentLength += paraLen;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}

/**
 * Splits a markdown note into readable, compact slide chunks (~8-10 lines or ~550 chars)
 * to ensure that long notes paginate across continuation slides without scrollbars.
 */
function splitMarkdownIntoSlideChunks(markdown: string | undefined): string[] {
  if (!markdown || !markdown.trim()) return [];

  const rawLines = markdown.trim().split('\n');
  const chunks: string[] = [];
  let currentChunkLines: string[] = [];
  let currentLength = 0;

  const MAX_LINES_PER_CHUNK = 9;
  const MAX_CHARS_PER_CHUNK = 550;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const lineLen = line.length + 1;

    if (
      currentChunkLines.length >= MAX_LINES_PER_CHUNK ||
      (currentLength + lineLen > MAX_CHARS_PER_CHUNK && currentChunkLines.length >= 4)
    ) {
      if (currentChunkLines.length > 0) {
        chunks.push(currentChunkLines.join('\n'));
        currentChunkLines = [];
        currentLength = 0;
      }
    }

    currentChunkLines.push(line);
    currentLength += lineLen;
  }

  if (currentChunkLines.length > 0) {
    chunks.push(currentChunkLines.join('\n'));
  }

  return chunks.length > 0 ? chunks : [markdown.trim()];
}

/**
 * Intelligent contrast resolver: guarantees 100% legibility in all presentation themes.
 */
function getContrastSafeColor(
  customColor: string | undefined,
  isLightTheme: boolean,
  defaultLightBgText: string,
  defaultDarkBgText: string
): string {
  if (!customColor) {
    return isLightTheme ? defaultLightBgText : defaultDarkBgText;
  }
  const hex = customColor.replace('#', '').toLowerCase();
  const isColorLight =
    hex === 'fff' ||
    hex === 'ffffff' ||
    hex === 'f8fafc' ||
    hex === 'f1f5f9' ||
    hex === 'e2e8f0' ||
    hex === 'cbd5e1';
  const isColorDark =
    hex === '000' ||
    hex === '000000' ||
    hex === '0f172a' ||
    hex === '1e293b' ||
    hex === '334155' ||
    hex === '475569';

  if (isLightTheme) {
    if (isColorLight) return defaultLightBgText;
    return customColor;
  } else {
    if (isColorDark) return defaultDarkBgText;
    return customColor;
  }
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  mindMap,
  onClose,
  onEditNode,
}) => {
  // Presentation customization options synchronized with current mindMap theme
  const [themeId, setThemeId] = useState<string>(mindMap.themeId || 'default');
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [imageSize, setImageSize] = useState<'small' | 'medium' | 'large' | 'hidden'>('medium');
  const [showChildrenCards, setShowChildrenCards] = useState<boolean>(true);
  const [showConnectorsCards, setShowConnectorsCards] = useState<boolean>(true);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [contentAlign, setContentAlign] = useState<'center' | 'left'>('center');
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'compact'>('normal');

  // Compute full layout for radar mini-map in presentation
  const layoutMap = useMemo(() => {
    return computeMindMapLayout(mindMap, { x: 0, y: 0 });
  }, [mindMap]);

  // Compute map bounding box for the presentation mini-map
  const mapBounds = useMemo(() => {
    if (!layoutMap || layoutMap.size === 0) {
      return { minX: -200, maxX: 200, minY: -200, maxY: 200, width: 400, height: 400 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    layoutMap.forEach((layout) => {
      minX = Math.min(minX, layout.x - 30);
      maxX = Math.max(maxX, layout.x + layout.width + 30);
      minY = Math.min(minY, layout.y - 30);
      maxY = Math.max(maxY, layout.y + layout.height + 30);
    });

    const pad = 40;
    minX -= pad;
    maxX += pad;
    minY -= pad;
    maxY += pad;

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(100, maxX - minX),
      height: Math.max(100, maxY - minY),
    };
  }, [layoutMap]);

  // Generate sequential unmixed slides:
  // For each node:
  // 1. Fase 1: Spotlight (Título y Cuerpo) -> Auto-paginated if body is long; Image ALWAYS visible!
  // 2. Fase 2: Notas del Presentador (si existen y están activadas) -> Auto-paginated
  // 3. Fase 3: Subtemas / Nodos Hijos (si existen y están activados) -> Auto-paginated
  // Then depth-first into children.
  const slides = useMemo(() => {
    const list: PresentationSlide[] = [];

    function traverse(nodeId: string) {
      const node = mindMap.nodes[nodeId];
      if (!node) return;

      const hasImage = Boolean(node.imageUrl && imageSize !== 'hidden');

      // 1. FASE 1: TÍTULO Y CUERPO (Auto-paginación si el cuerpo es extenso)
      const bodyChunks = splitBodyTextIntoSlideChunks(node.body, hasImage);
      if (bodyChunks.length <= 1) {
        list.push({
          slideKey: `${node.id}-body-0`,
          node,
          phase: 'body',
          pageIndex: 0,
          totalPages: 1,
          bodySubset: bodyChunks[0] || '',
        });
      } else {
        for (let p = 0; p < bodyChunks.length; p++) {
          list.push({
            slideKey: `${node.id}-body-${p}`,
            node,
            phase: 'body',
            pageIndex: p,
            totalPages: bodyChunks.length,
            bodySubset: bodyChunks[p],
          });
        }
      }

      // 2. FASE 2: NOTAS DEL PRESENTADOR (Auto-paginación si las notas son extensas)
      if (showNotes && node.note && node.note.trim().length > 0) {
        const noteChunks = splitMarkdownIntoSlideChunks(node.note);
        for (let p = 0; p < noteChunks.length; p++) {
          list.push({
            slideKey: `${node.id}-notes-${p}`,
            node,
            phase: 'notes',
            pageIndex: p,
            totalPages: noteChunks.length,
            noteSubset: noteChunks[p],
          });
        }
      }

      // 3. FASE 3: SUBTEMAS / NODOS HIJOS (Auto-paginación en lotes de 6)
      const childrenIds = node.children || [];
      if (showChildrenCards && childrenIds.length > 0) {
        const childPages = Math.ceil(childrenIds.length / MAX_CHILDREN_PER_SLIDE);
        for (let p = 0; p < childPages; p++) {
          const subset = childrenIds.slice(
            p * MAX_CHILDREN_PER_SLIDE,
            (p + 1) * MAX_CHILDREN_PER_SLIDE
          );
          list.push({
            slideKey: `${node.id}-children-${p}`,
            node,
            phase: 'children',
            pageIndex: p,
            totalPages: childPages,
            childrenSubset: subset,
          });
        }
      }

      // Depth-first traversal into children
      if (node.children) {
        node.children.forEach(traverse);
      }
    }

    traverse(mindMap.rootId);
    return list;
  }, [mindMap, showChildrenCards, showNotes, imageSize]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const currentTheme = useMemo(() => {
    return PRESENTATION_THEMES.find((t) => t.id === themeId) || PRESENTATION_THEMES[0];
  }, [themeId]);

  const isLight = currentTheme.isLight;
  const currentSlide = slides[currentIndex] || slides[0];
  const currentNode = currentSlide?.node;

  const [jumpHistory, setJumpHistory] = useState<number[]>([]);

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleJumpToNode = (nodeId: string) => {
    const idx = slides.findIndex((s) => s.node.id === nodeId && s.phase === 'body');
    const targetIdx = idx !== -1 ? idx : slides.findIndex((s) => s.node.id === nodeId);
    if (targetIdx !== -1 && targetIdx !== currentIndex) {
      setJumpHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex(targetIdx);
    }
  };

  const handleReturnJump = () => {
    if (jumpHistory.length > 0) {
      const prevIdx = jumpHistory[jumpHistory.length - 1];
      setJumpHistory((prev) => prev.slice(0, prev.length - 1));
      setCurrentIndex(prevIdx);
    }
  };

  // 1. Ir al Inicio del Tema / Nodo Padre
  const handleGoToParent = () => {
    if (!currentNode || !currentNode.parentId) return;
    handleJumpToNode(currentNode.parentId);
  };

  // 2. Ir al Siguiente Tema (siguiente hermano o salto de rama al siguiente tema)
  const handleGoToNextTopic = () => {
    if (!currentNode) return;

    // Buscar si tiene siguiente hermano
    if (currentNode.parentId) {
      const parent = mindMap.nodes[currentNode.parentId];
      if (parent && parent.children) {
        const currentSiblingIndex = parent.children.indexOf(currentNode.id);
        if (currentSiblingIndex !== -1 && currentSiblingIndex < parent.children.length - 1) {
          const nextSiblingId = parent.children[currentSiblingIndex + 1];
          handleJumpToNode(nextSiblingId);
          return;
        }
      }
    }

    // Si no hay siguiente hermano directo, buscar el siguiente slide que sea de un nodo distinto
    const nextDistinctSlideIdx = slides.findIndex((s, idx) => idx > currentIndex && s.node.id !== currentNode.id && s.phase === 'body');
    if (nextDistinctSlideIdx !== -1) {
      setJumpHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex(nextDistinctSlideIdx);
    } else {
      // Si estamos en la última diapositiva o cerca, avanzar si es posible
      handleNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'Backspace' && jumpHistory.length > 0 && (e.altKey || !e.shiftKey)) {
        e.preventDefault();
        handleReturnJump();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        if (isConfigOpen) {
          setIsConfigOpen(false);
        } else {
          onClose();
        }
      } else if (e.key.toLowerCase() === 'e') {
        setIsConfigOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length, isConfigOpen, jumpHistory]);

  if (!currentNode) return null;

  const isRoot = currentNode.id === mindMap.rootId;
  const parentNode = currentNode.parentId ? mindMap.nodes[currentNode.parentId] : null;

  // Find related connectors (cross-links)
  const relatedConnectors = useMemo(() => {
    if (!mindMap.connectors || !currentNode) return [];
    return mindMap.connectors.filter((c) => {
      const f = c.fromId || c.fromNodeId;
      const t = c.toId || c.toNodeId;
      return f === currentNode.id || t === currentNode.id;
    });
  }, [mindMap.connectors, currentNode]);


  // Current batch of child nodes for this slide (in phase 'children')
  const currentChildNodes = useMemo(() => {
    if (!currentSlide || !currentSlide.childrenSubset || currentSlide.childrenSubset.length === 0) {
      return [];
    }
    return currentSlide.childrenSubset
      .map((id) => mindMap.nodes[id])
      .filter((n): n is MindNode => Boolean(n));
  }, [currentSlide, mindMap.nodes]);

  const totalChildrenCount = currentNode.children?.length || 0;

  // Image dimension styling for Phase 1
  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small':
        return 'max-h-36 max-w-[180px]';
      case 'large':
        return 'max-h-80 max-w-[560px]';
      case 'medium':
      default:
        return 'max-h-60 max-w-[420px]';
    }
  };

  // Font size styling
  const getHeadingSizeClass = () => {
    switch (fontSizeScale) {
      case 'large':
        return 'text-4xl sm:text-6xl md:text-7xl';
      case 'compact':
        return 'text-2xl sm:text-4xl';
      case 'normal':
      default:
        return 'text-3xl sm:text-5xl md:text-6xl';
    }
  };

  return (
    <div
      style={{
        backgroundColor: currentTheme.backgroundColor,
        color: currentTheme.textColor,
      }}
      className={`fixed inset-0 h-screen w-screen overflow-hidden z-50 flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200 transition-colors`}
    >
      {/* 1. TOP HEADER BAR */}
      <header className="flex items-center justify-between gap-3 w-full shrink-0 h-10">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs border ${currentTheme.badgeBg}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Modo Presentación Clásica
          </div>

          {/* Phase Badge: Indica si estamos en Cuerpo, Notas o Subtemas con Paginación */}
          {currentSlide.phase === 'body' && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950/80 border-blue-800 text-blue-300'
            }`}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                Tema Principal {currentSlide.totalPages > 1 ? `(Parte ${currentSlide.pageIndex + 1}/${currentSlide.totalPages})` : ''}
              </span>
            </span>
          )}

          {currentSlide.phase === 'notes' && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/80 border-amber-800 text-amber-300'
            }`}>
              <FileText className="w-3.5 h-3.5" />
              <span>
                Notas del Tema {currentSlide.totalPages > 1 ? `(Parte ${currentSlide.pageIndex + 1}/${currentSlide.totalPages})` : ''}
              </span>
            </span>
          )}

          {currentSlide.phase === 'children' && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 ${
              isLight ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : 'bg-cyan-950/80 border-cyan-800 text-cyan-300'
            }`}>
              <GitBranch className="w-3.5 h-3.5" />
              <span>
                Subtemas {currentSlide.totalPages > 1 ? `(Parte ${currentSlide.pageIndex + 1}/${currentSlide.totalPages})` : ''}
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* RETURN JUMP BUTTON (Volver al nodo previo si se hizo clic en un Card) */}
          {jumpHistory.length > 0 && (
            <button
              onClick={handleReturnJump}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md animate-in fade-in slide-in-from-right-2 duration-150 ${
                isLight
                  ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200'
                  : 'bg-amber-950/90 border border-amber-700/80 text-amber-300 hover:bg-amber-900'
              }`}
              title="Regresar a la diapositiva previa desde donde saltaste (Tecla Backspace)"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          )}

          {/* EDIT & CONFIGURE PRESENTATION BUTTON (Editar) */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isConfigOpen
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
            title="Personalizar tema, notas, imágenes y tarjetas de hijos/conectores (Tecla E)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Editar</span>
          </button>

          {/* Slide Indicator */}
          <span
            className={`text-xs font-mono px-3 py-1.5 rounded-xl border hidden sm:inline ${
              isLight ? 'bg-white border-slate-300 text-slate-700 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {currentIndex + 1} / {slides.length}
          </span>

          {/* Exit Presentation */}
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-slate-700 hover:text-black hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Salir de la presentación (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. CUSTOMIZATION SETTINGS MODAL */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Opciones del Modo Presentación
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Personaliza el tema, notas, imágenes y tarjetas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className={`p-1.5 rounded-lg cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. SELECTOR DE TEMAS */}
            <div className="space-y-2">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <Palette className="w-3.5 h-3.5 text-purple-500" />
                <span>Tema de la Presentación</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESENTATION_THEMES.map((th) => {
                  const isSelected = themeId === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeId(th.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-400/60 font-bold shadow-md bg-blue-50/20'
                          : isLight
                          ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                          : 'border-slate-800 bg-slate-950/70 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: th.previewColor }}
                        />
                        <span className={`text-[11px] truncate font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                          {th.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {th.branchColors.slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. MOSTRAR / OCULTAR NOTAS */}
            <div className={`space-y-2 pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Diapositivas de Notas del Presentador
                    </span>
                    <span className={`text-[10.5px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Presenta las notas en una diapositiva dedicada después del cuerpo
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNotes}
                    onChange={(e) => setShowNotes(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`}></div>
                </label>
              </div>
            </div>

            {/* C. TAMAÑO DE IMÁGENES */}
            <div className={`space-y-2 pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tamaño de Imágenes Adjuntas</span>
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['small', 'medium', 'large', 'hidden'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`py-1.5 px-2 rounded-xl border text-center capitalize font-medium transition-all cursor-pointer ${
                      imageSize === size
                        ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-2xs'
                        : isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {size === 'small'
                      ? 'Pequeña'
                      : size === 'medium'
                      ? 'Mediana'
                      : size === 'large'
                      ? 'Grande'
                      : 'Ocultar'}
                  </button>
                ))}
              </div>
            </div>

            {/* D. MOSTRAR HIJOS COMO CARDS */}
            <div className={`space-y-2 pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-500" />
                  <div>
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Diapositivas de Sub-Nodos Hijos
                    </span>
                    <span className={`text-[10.5px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Presenta los subtemas en una diapositiva dedicada al final del nodo
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showChildrenCards}
                    onChange={(e) => setShowChildrenCards(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`}></div>
                </label>
              </div>
            </div>

            {/* E. MOSTRAR CONEXIONES CRUZADAS COMO CARDS */}
            <div className={`space-y-2 pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-pink-500" />
                  <div>
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Conexiones Cruzadas
                    </span>
                    <span className={`text-[10.5px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Muestra enlaces cruzados junto a las tarjetas de subtemas
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showConnectorsCards}
                    onChange={(e) => setShowConnectorsCards(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`}></div>
                </label>
              </div>
            </div>

            {/* F. MOSTRAR MINIMAPA RADAR */}
            <div className={`space-y-2 pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className={`text-xs font-bold block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      MiniMapa en Esquina Inferior
                    </span>
                    <span className={`text-[10.5px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Muestra el minimapa del mapa con el nodo actual resaltado
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMiniMap}
                    onChange={(e) => setShowMiniMap(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`}></div>
                </label>
              </div>
            </div>

            {/* F. ALINEACIÓN Y TAMAÑO DE TEXTO */}
            <div className={`grid grid-cols-2 gap-3 pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div>
                <label className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Alineación del Contenido
                </label>
                <div className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/60 border-slate-700'}`}>
                  <button
                    type="button"
                    onClick={() => setContentAlign('center')}
                    className={`py-1 rounded-lg text-xs flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                      contentAlign === 'center'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : isLight ? 'text-slate-700 hover:text-black' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <AlignCenter className="w-3 h-3" /> Centro
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentAlign('left')}
                    className={`py-1 rounded-lg text-xs flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                      contentAlign === 'left'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : isLight ? 'text-slate-700 hover:text-black' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <AlignLeft className="w-3 h-3" /> Izquierda
                  </button>
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Escala de Título
                </label>
                <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/60 border-slate-700'}`}>
                  {(['compact', 'normal', 'large'] as const).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontSizeScale(scale)}
                      className={`py-1 rounded-lg text-xs capitalize font-semibold transition-all cursor-pointer ${
                        fontSizeScale === scale
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : isLight ? 'text-slate-700 hover:text-black' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {scale === 'compact' ? 'Compact' : scale === 'normal' ? 'Normal' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className={`flex items-center justify-between pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                type="button"
                onClick={() => {
                  if (onEditNode) onEditNode(currentNode.id);
                }}
                className={`text-xs font-semibold flex items-center gap-1 cursor-pointer ${isLight ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'}`}
              >
                <span>Editar en Lienzo</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 cursor-pointer"
              >
                Aplicar y Ver Diapositiva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN SLIDE CONTENT CANVAS (Pure Single-Focus Stages) */}
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto overflow-hidden flex items-center justify-center p-2 sm:p-4">
        
        {/* ========================================================================= */}
        {/* FASE 1: TÍTULO Y CUERPO (Visión Principal del Tema + Imagen Siempre Visible) */}
        {/* ========================================================================= */}
        {currentSlide.phase === 'body' && (
          <div
            className={`w-full max-w-5xl flex flex-col justify-center transition-all animate-in fade-in zoom-in-95 duration-200 ${
              contentAlign === 'center' ? 'items-center text-center' : 'items-start text-left'
            }`}
          >
            {/* Parent Breadcrumb */}
            {parentNode && (
              <div className={`text-xs sm:text-sm font-medium mb-3 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <span
                  onClick={() => handleJumpToNode(parentNode.id)}
                  className="hover:underline cursor-pointer"
                >
                  {parentNode.text.split('\n')[0]}
                </span>
                <span>→</span>
              </div>
            )}

            {/* Node Icons */}
            {currentNode.icons && currentNode.icons.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                {currentNode.icons.map((ic, i) => (
                  <span key={i} className="scale-125">
                    {renderNodeIcon(ic)}
                  </span>
                ))}
              </div>
            )}

            {/* Layout inteligente: Si hay imagen + cuerpo, distribuir armoniosamente */}
            {currentNode.imageUrl && imageSize !== 'hidden' && currentSlide.bodySubset ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-2">
                {/* Imagen siempre visible en tamaño generoso */}
                <div className="md:col-span-5 flex justify-center items-center">
                  <div className={`overflow-hidden rounded-2xl shadow-2xl border ${isLight ? 'border-slate-300 bg-white p-2' : 'border-white/10'}`}>
                    <img
                      src={currentNode.imageUrl}
                      alt=""
                      className={`rounded-xl object-contain pointer-events-none transition-all ${getImageDimensions()}`}
                    />
                  </div>
                </div>

                {/* Título y Cuerpo correspondiente a esta parte */}
                <div className={`md:col-span-7 flex flex-col justify-center ${contentAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
                  <h1
                    style={{
                      color: isRoot
                        ? undefined
                        : getContrastSafeColor(currentNode.textColor, isLight, '#0f172a', '#ffffff'),
                    }}
                    className={`${getHeadingSizeClass()} font-bold tracking-tight mb-3 leading-tight whitespace-pre-wrap ${
                      isRoot ? currentTheme.accentClass : ''
                    }`}
                  >
                    {currentNode.text}
                  </h1>

                  <div
                    style={{
                      color: getContrastSafeColor(currentNode.bodyColor, isLight, '#334155', '#cbd5e1'),
                      fontWeight: currentNode.bodyBold ? 'bold' : 'normal',
                      fontStyle: currentNode.bodyItalic ? 'italic' : 'normal',
                    }}
                    className="text-base sm:text-lg md:text-xl font-normal whitespace-pre-wrap leading-relaxed opacity-95 mb-4"
                  >
                    {currentSlide.bodySubset}
                  </div>

                  {/* Progress and Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {currentNode.progress !== undefined && (
                      <span className="px-3.5 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold">
                        Progreso: {currentNode.progress}%
                      </span>
                    )}
                    {currentNode.tags?.map((t) => (
                      <span
                        key={t}
                        className={`px-3 py-1 rounded-full border text-xs font-medium ${
                          isLight ? 'bg-slate-200 border-slate-300 text-slate-800 font-semibold' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Layout cuando sólo hay imagen O sólo texto de cuerpo */
              <>
                {/* Attached Image (cuando no hay cuerpo extenso) */}
                {currentNode.imageUrl && imageSize !== 'hidden' && (
                  <div className={`my-3.5 overflow-hidden rounded-2xl shadow-xl border ${isLight ? 'border-slate-300 bg-white p-2' : 'border-white/10'}`}>
                    <img
                      src={currentNode.imageUrl}
                      alt=""
                      className={`rounded-xl object-contain pointer-events-none transition-all ${getImageDimensions()}`}
                    />
                  </div>
                )}

                {/* Main Title Heading */}
                <h1
                  style={{
                    color: isRoot
                      ? undefined
                      : getContrastSafeColor(currentNode.textColor, isLight, '#0f172a', '#ffffff'),
                  }}
                  className={`${getHeadingSizeClass()} font-bold tracking-tight mb-4 leading-tight whitespace-pre-wrap ${
                    isRoot ? currentTheme.accentClass : ''
                  }`}
                >
                  {currentNode.text}
                </h1>

                {/* Node Body / Subtitle (Texto dividido en diapositivas limpias) */}
                {currentSlide.bodySubset && (
                  <div
                    style={{
                      color: getContrastSafeColor(currentNode.bodyColor, isLight, '#334155', '#cbd5e1'),
                      fontWeight: currentNode.bodyBold ? 'bold' : 'normal',
                      fontStyle: currentNode.bodyItalic ? 'italic' : 'normal',
                    }}
                    className="text-lg sm:text-xl md:text-2xl max-w-3xl mb-6 font-normal whitespace-pre-wrap leading-relaxed opacity-95"
                  >
                    {currentSlide.bodySubset}
                  </div>
                )}

                {/* Progress and Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {currentNode.progress !== undefined && (
                    <span className="px-3.5 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold">
                      Progreso: {currentNode.progress}%
                    </span>
                  )}
                  {currentNode.tags?.map((t) => (
                    <span
                      key={t}
                      className={`px-3 py-1 rounded-full border text-xs font-medium ${
                        isLight ? 'bg-slate-200 border-slate-300 text-slate-800 font-semibold' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FASE 2: NOTAS DEL PRESENTADOR (Diapositiva Dedicada a las Notas)           */}
        {/* ========================================================================= */}
        {currentSlide.phase === 'notes' && (
          <div className="w-full max-w-4xl flex flex-col justify-center items-center text-left animate-in fade-in zoom-in-95 duration-200">
            {/* Header Context Bar: Shows parent, node icon, thumbnail if image exists & title */}
            <div className="w-full mb-3 flex items-center justify-between gap-3 pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentNode.imageUrl && imageSize !== 'hidden' && (
                  <img
                    src={currentNode.imageUrl}
                    alt=""
                    className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0 shadow-xs"
                  />
                )}
                {currentNode.icons && currentNode.icons.length > 0 && (
                  <span className="scale-110">{renderNodeIcon(currentNode.icons[0])}</span>
                )}
                <h3
                  style={{
                    color: getContrastSafeColor(currentNode.textColor, isLight, '#0f172a', '#ffffff'),
                  }}
                  className="text-lg sm:text-xl font-bold truncate"
                >
                  {currentNode.text}
                </h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950 border border-amber-800 text-amber-300'
              }`}>
                {currentSlide.totalPages > 1
                  ? `Notas (${currentSlide.pageIndex + 1} de ${currentSlide.totalPages})`
                  : 'Notas del Tema'}
              </span>
            </div>

            {/* Main Note Card (Full visual focus, zero scrollbars) */}
            <div
              className={`w-full rounded-2xl p-6 sm:p-8 shadow-2xl border ${currentTheme.cardBgClass} ${currentTheme.cardBorderClass}`}
            >
              <div className="text-sm sm:text-base md:text-lg leading-relaxed">
                <MarkdownView content={currentSlide.noteSubset || ''} isDark={!isLight} />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FASE 3: SUBTEMAS / NODOS HIJOS (Diapositiva Dedicada a las Cards)          */}
        {/* ========================================================================= */}
        {currentSlide.phase === 'children' && (
          <div className="w-full max-w-5xl flex flex-col justify-center items-center text-left animate-in fade-in zoom-in-95 duration-200">
            {/* Header Context Bar: Shows parent, thumbnail image & node title */}
            <div className="w-full mb-4 flex items-center justify-between gap-3 pb-2 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentNode.imageUrl && imageSize !== 'hidden' && (
                  <img
                    src={currentNode.imageUrl}
                    alt=""
                    className="w-9 h-9 object-cover rounded-lg border border-slate-700 shrink-0 shadow-xs"
                  />
                )}
                {currentNode.icons && currentNode.icons.length > 0 && (
                  <span className="scale-110">{renderNodeIcon(currentNode.icons[0])}</span>
                )}
                <div>
                  <h3
                    style={{
                      color: getContrastSafeColor(currentNode.textColor, isLight, '#0f172a', '#ffffff'),
                    }}
                    className="text-lg sm:text-xl font-bold truncate"
                  >
                    {currentNode.text}
                  </h3>
                  <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Exploración de Subtemas
                  </span>
                </div>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-950 border border-cyan-800 text-cyan-300'
              }`}>
                Subtemas ({currentSlide.pageIndex * MAX_CHILDREN_PER_SLIDE + 1}-
                {Math.min((currentSlide.pageIndex + 1) * MAX_CHILDREN_PER_SLIDE, totalChildrenCount)} de {totalChildrenCount})
              </span>
            </div>

            {/* Grid of Subtopic Cards (Spacious, elegant 2x3 or 3x2, zero scrollbars) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mb-4">
              {currentChildNodes.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleJumpToNode(child.id)}
                  style={{
                    backgroundColor: currentTheme.cardBgColor,
                    borderColor: currentTheme.cardBorderColor,
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-xl hover:border-blue-500`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {child.icons && child.icons.length > 0 ? (
                      <span className="shrink-0 scale-110">{renderNodeIcon(child.icons[0])}</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <h4
                      style={{
                        color: getContrastSafeColor(child.textColor, isLight, '#0f172a', '#ffffff'),
                      }}
                      className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors"
                    >
                      {child.text}
                    </h4>
                  </div>
                  {child.body && (
                    <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {child.body}
                    </p>
                  )}
                  {child.note && (
                    <span className={`inline-flex items-center gap-1 text-[10.5px] font-semibold mt-2.5 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                      <FileText className="w-3 h-3" /> Nota adjunta
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Cross Connectors (if enabled) */}
            {showConnectorsCards && relatedConnectors.length > 0 && (
              <div className="w-full pt-3 border-t border-slate-700/30">
                <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-pink-800' : 'text-pink-400'}`}>
                  <Network className="w-3.5 h-3.5" />
                  <span>Enlaces y Conectores ({relatedConnectors.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {relatedConnectors.slice(0, 3).map((conn) => {
                    const fromId = conn.fromId || conn.fromNodeId || '';
                    const toId = conn.toId || conn.toNodeId || '';
                    const isSource = fromId === currentNode.id;
                    const targetId = isSource ? toId : fromId;
                    const targetNode = mindMap.nodes[targetId];
                    if (!targetNode) return null;


                    return (
                      <div
                        key={conn.id}
                        onClick={() => handleJumpToNode(targetId)}
                        style={{
                          backgroundColor: currentTheme.cardBgColor,
                          borderColor: currentTheme.cardBorderColor,
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-md flex items-center justify-between gap-2 hover:border-pink-500`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isLight ? 'text-pink-700' : 'text-pink-400'}`}>
                            <span>{isSource ? 'Hacia ➔' : 'Desde ⬅'}</span>
                            {conn.label && <span className="opacity-80 italic truncate">"{conn.label}"</span>}
                          </div>
                          <h4
                            style={{
                              color: getContrastSafeColor(targetNode.textColor, isLight, '#0f172a', '#ffffff'),
                            }}
                            className="text-xs font-bold truncate group-hover:text-pink-500 transition-colors"
                          >
                            {targetNode.text}
                          </h4>
                        </div>
                        <div className="w-5 h-5 rounded-md bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. BOTTOM NAVIGATION BAR */}
      <footer className="flex items-center justify-between max-w-4xl mx-auto w-full shrink-0 h-12 gap-2 sm:gap-4 px-2">
        {/* Left cluster: Anterior + Inicio del Tema (Padre) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Diapositiva anterior (Flecha Izquierda)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {!isRoot && currentNode.parentId && (
            <button
              onClick={handleGoToParent}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer shadow-2xs ${
                isLight
                  ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                  : 'bg-blue-950/80 border-blue-800/80 text-blue-300 hover:bg-blue-900'
              }`}
              title="Ir al inicio del tema (Nodo Padre)"
            >
              <CornerLeftUp className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                Inicio: {parentNode?.text || 'Padre'}
              </span>
            </button>
          )}
        </div>

        {/* Center: Slide indicator dots */}
        <div className="flex items-center gap-1 overflow-hidden max-w-xs px-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-blue-500'
                  : isLight
                  ? 'w-2 bg-slate-400 hover:bg-slate-500'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Diapositiva ${idx + 1}`}
            />
          ))}
        </div>

        {/* Right cluster: Siguiente Tema + Siguiente */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleGoToNextTopic}
            disabled={currentIndex >= slides.length - 1}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs ${
              isLight
                ? 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
                : 'bg-purple-950/80 border-purple-800/80 text-purple-300 hover:bg-purple-900'
            }`}
            title="Saltar al siguiente tema o rama hermana"
          >
            <span>Siguiente Tema</span>
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>

          <button
            disabled={currentIndex === slides.length - 1}
            onClick={handleNext}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-md shadow-blue-900/40 cursor-pointer"
            title="Siguiente diapositiva (Flecha Derecha o Espacio)"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* 5. RADAR MINIMAP (CENTRO SUPERIOR, TRASLÚCIDO Y CON ULTRA-RESALTE DEL NODO ACTIVO) */}
      {showMiniMap && layoutMap.size > 0 && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
          <div
            className={`px-3 py-2 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 group hover:opacity-100 hover:scale-102 ${
              isLight
                ? 'bg-white/50 border-slate-300/50 opacity-80'
                : 'bg-black/45 border-white/15 opacity-75'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Canvas SVG MiniMapa Agrandado y Translúcido */}
              <div className="relative w-52 sm:w-68 md:w-80 h-14 sm:h-16 md:h-18 overflow-hidden rounded-xl">
                <svg
                  className="w-full h-full"
                  viewBox={`${mapBounds.minX} ${mapBounds.minY} ${mapBounds.width} ${mapBounds.height}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* 1. Aristas tenues traslúcidas */}
                  <g id="presentation-minimap-edges">
                    {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
                      const childNode = mindMap.nodes[childLayout.id];
                      if (!childNode || !childNode.parentId) return null;
                      const parentLayout = layoutMap.get(childNode.parentId);
                      if (!parentLayout) return null;

                      const branchColor =
                        childNode.edgeColor ||
                        currentTheme.branchColors[childLayout.branchIndex % currentTheme.branchColors.length] ||
                        '#38bdf8';

                      let pathData = '';
                      if (childLayout.side === 'left') {
                        const startX = parentLayout.x;
                        const startY = parentLayout.y + parentLayout.height / 2;
                        const endX = childLayout.x + childLayout.width;
                        const endY = childLayout.y + childLayout.height / 2;
                        const midX = (startX + endX) / 2;
                        pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                      } else if (childLayout.side === 'bottom') {
                        const startX = parentLayout.x + parentLayout.width / 2;
                        const startY = parentLayout.y + parentLayout.height;
                        const endX = childLayout.x + childLayout.width / 2;
                        const endY = childLayout.y;
                        const midY = (startY + endY) / 2;
                        pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                      } else if (childLayout.side === 'top') {
                        const startX = parentLayout.x + parentLayout.width / 2;
                        const startY = parentLayout.y;
                        const endX = childLayout.x + childLayout.width / 2;
                        const endY = childLayout.y + childLayout.height;
                        const midY = (startY + endY) / 2;
                        pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                      } else {
                        const startX = parentLayout.x + parentLayout.width;
                        const startY = parentLayout.y + parentLayout.height / 2;
                        const endX = childLayout.x;
                        const endY = childLayout.y + childLayout.height / 2;
                        const midX = (startX + endX) / 2;
                        pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                      }

                      return (
                        <path
                          key={`pm-edge-${childNode.parentId}-${childNode.id}`}
                          d={pathData}
                          fill="none"
                          stroke={branchColor}
                          strokeWidth={1.5}
                          strokeOpacity={0.4}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </g>

                  {/* 2. Nodos del Mapa con ULTRA-RESALTE del Nodo Activo */}
                  <g id="presentation-minimap-nodes">
                    {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((l) => {
                      const node = mindMap.nodes[l.id];
                      const isCurrent = currentNode.id === l.id;
                      const isRootNode = l.depth === 0;

                      const minW = isRootNode ? 40 : l.depth === 1 ? 28 : 20;
                      const minH = isRootNode ? 22 : l.depth === 1 ? 16 : 12;
                      const renderW = Math.max(l.width, minW);
                      const renderH = Math.max(l.height, minH);
                      const renderX = l.x - (renderW - l.width) / 2;
                      const renderY = l.y - (renderH - l.height) / 2;

                      const branchColor =
                        currentTheme.branchColors[l.branchIndex % currentTheme.branchColors.length] || '#38bdf8';

                      let nodeFill = node?.color;
                      if (!nodeFill || nodeFill === '#ffffff' || nodeFill === '#f8fafc') {
                        nodeFill = isRootNode ? '#3b82f6' : branchColor;
                      }

                      return (
                        <g
                          key={`pm-node-${l.id}`}
                          onClick={() => handleJumpToNode(l.id)}
                          className="cursor-pointer"
                        >
                          {/* Super Glow Halo exterior si es el nodo actual */}
                          {isCurrent && (
                            <>
                              {/* Halo difuso 1 */}
                              <rect
                                x={renderX - 12}
                                y={renderY - 12}
                                width={renderW + 24}
                                height={renderH + 24}
                                rx={12}
                                fill="#38bdf8"
                                fillOpacity={0.35}
                                className="animate-ping"
                              />
                              {/* Halo sólido 2 */}
                              <rect
                                x={renderX - 6}
                                y={renderY - 6}
                                width={renderW + 12}
                                height={renderH + 12}
                                rx={8}
                                fill="#2563eb"
                                fillOpacity={0.65}
                                className="animate-pulse"
                              />
                            </>
                          )}

                          {/* Nodo base */}
                          <rect
                            x={renderX}
                            y={renderY}
                            width={renderW}
                            height={renderH}
                            rx={isRootNode ? 6 : 4}
                            fill={isCurrent ? '#ffffff' : nodeFill}
                            fillOpacity={isCurrent ? 1 : 0.6}
                            stroke={isCurrent ? '#2563eb' : '#64748b'}
                            strokeWidth={isCurrent ? 3 : 1}
                            strokeOpacity={isCurrent ? 1 : 0.5}
                          />

                          {/* Pin / Baliza brillante en el nodo actual */}
                          {isCurrent && (
                            <circle
                              cx={renderX + renderW / 2}
                              cy={renderY + renderH / 2}
                              r={3.5}
                              fill="#ef4444"
                              stroke="#ffffff"
                              strokeWidth={1.5}
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Título o Etiqueta Compacta del Nodo Activo */}
              <div className="flex items-center gap-1 shrink-0 border-l border-slate-300/30 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className={`text-[10px] font-bold truncate max-w-[90px] sm:max-w-[120px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {currentNode.text}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
\\n

## src/components/StatusBar.tsx

\\tsx
import React from 'react';

interface StatusBarProps {
  totalNodes: number;
  selectedNodeText: string | null;
  selectedNodeId: string | null;
  zoom?: number;
  positionX?: number;
  positionY?: number;
  mode?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalNodes,
  selectedNodeText,
  selectedNodeId,
  zoom = 100,
  positionX = 0,
  positionY = 0,
  mode = 'Listo',
}) => {
  return (
    <div className="h-6 bg-[var(--chrome-bar)] text-slate-400 px-3 flex items-center gap-4 z-30 shrink-0 select-none border-t border-slate-800 text-[10px] sm:text-xs">
      <div>
        Nodos totales: <span className="text-slate-200">{totalNodes}</span>
      </div>
      <div className="w-px h-3 bg-slate-700" />
      <div className="truncate max-w-[200px] sm:max-w-md">
        Seleccionado:{' '}
        <span className="text-slate-200">
          {selectedNodeText ? `"${selectedNodeText}"` : 'Ninguno'}
        </span>{' '}
        {selectedNodeId && (
          <span className="text-slate-500">(ID: {selectedNodeId})</span>
        )}
      </div>
      <div className="w-px h-3 bg-slate-700 hidden sm:block" />
      <div className="hidden sm:block">
        Zoom: <span className="text-slate-200">{zoom}%</span>
      </div>
      <div className="w-px h-3 bg-slate-700 hidden sm:block" />
      <div className="hidden sm:block">
        Posición: <span className="text-slate-200">(X: {positionX}, Y: {positionY})</span>
      </div>
      <div className="w-px h-3 bg-slate-700 hidden sm:block" />
      <div className="hidden sm:block">
        Modo: <span className="text-slate-200">{mode}</span>
      </div>
    </div>
  );
};
\\n

## src/components/ToolBar.tsx

\\tsx
import React, { useState, useRef, useEffect } from 'react';
import { MindNode, NodeShape, MindMap, LayoutType, EdgeStyle, EdgeProfile } from '../types/mindmap';

import {
  Plus,
  FolderPlus,
  Trash2,
  Minimize2,
  Maximize2,
  Bold,
  Italic,
  Undo2,
  Redo2,
  Sliders,
  ListTree,
  Presentation,
  Search,
  Link,
  Cloud,
  FileDown,
  MoreHorizontal,
  ChevronDown,
  Map,
  Zap,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  Tag,
} from 'lucide-react';

interface ToolBarProps {
  selectedNode: MindNode | null;
  canUndo: boolean;
  canRedo: boolean;
  isOutlineMode?: boolean;
  isFilterBarOpen: boolean;
  isToolPanelOpen: boolean;
  mindMap?: MindMap;

  onToggleGlobalVisibility?: (key: 'hideAllBodies' | 'hideAllImages' | 'hideAllTags' | 'hideAllIcons' | 'hideAllLinks') => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDeleteNode: () => void;
  onToggleFold?: () => void;
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onChangeShape?: (shape: NodeShape) => void;
  onUndo: () => void;

  onRedo: () => void;
  onToggleOutline: () => void;
  onStartPresentation: (mode?: 'classic' | 'dynamic' | 'elaborate') => void;
  onToggleFilterBar: () => void;
  onToggleToolPanel: () => void;
  onOpenConnectorModal: () => void;
  onToggleCloud: () => void;
  onOpenExportModal: () => void;
  onOpenIconPackModal?: () => void;
}


export const ToolBar: React.FC<ToolBarProps> = ({
  selectedNode,
  canUndo,
  canRedo,
  isOutlineMode,
  isFilterBarOpen,
  isToolPanelOpen,
  mindMap,
  onToggleGlobalVisibility,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleFold,
  onToggleBold,
  onToggleItalic,
  onChangeShape,
  onUndo,
  onRedo,
  onToggleOutline,
  onStartPresentation,
  onToggleFilterBar,
  onToggleToolPanel,
  onOpenConnectorModal,
  onToggleCloud,
  onOpenExportModal,
  onOpenIconPackModal,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPresentationMenuOpen, setIsPresentationMenuOpen] = useState(false);
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const presentationMenuRef = useRef<HTMLDivElement>(null);
  const visibilityMenuRef = useRef<HTMLDivElement>(null);

  const hasAnyHiddenGlobal = Boolean(
    mindMap?.hideAllBodies ||
    mindMap?.hideAllImages ||
    mindMap?.hideAllTags ||
    mindMap?.hideAllIcons ||
    mindMap?.hideAllLinks
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (presentationMenuRef.current && !presentationMenuRef.current.contains(e.target as Node)) {
        setIsPresentationMenuOpen(false);
      }
      if (visibilityMenuRef.current && !visibilityMenuRef.current.contains(e.target as Node)) {
        setIsVisibilityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-11 bg-[var(--chrome-toolbar)] border-b border-slate-200 px-2 sm:px-3 flex items-center justify-between gap-1 sm:gap-2 z-40 shrink-0 select-none relative">
      {/* Left group: Node Actions & History */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            title="Deshacer (Ctrl+Z)"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 rounded-lg text-[var(--sp-text)] hover:bg-[var(--sp-hover)] disabled:opacity-35 disabled:hover:bg-transparent transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            title="Rehacer (Ctrl+Y)"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 rounded-lg text-[var(--sp-text)] hover:bg-[var(--sp-hover)] disabled:opacity-35 disabled:hover:bg-transparent transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Add Child */}
        <button
          title="Agregar Nodo Hijo (Tab o Insert)"
          onClick={onAddChild}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hijo</span>
        </button>

        {/* Add Sibling */}
        <button
          title="Agregar Nodo Hermano (Enter)"
          onClick={onAddSibling}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[var(--sp-text)] hover:bg-[var(--sp-hover)] font-semibold text-xs transition-colors shrink-0"
        >
          <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Hermano</span>
        </button>

        {/* Delete */}
        <button
          title="Eliminar Nodo Seleccionado (Supr / Delete)"
          disabled={!selectedNode || selectedNode.parentId === null}
          onClick={onDeleteNode}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Fold / Unfold */}
        <button
          title="Plegar / Desplegar Rama (Espacio)"
          disabled={!selectedNode || !selectedNode.children || selectedNode.children.length === 0}
          onClick={onToggleFold}
          className="p-1.5 rounded-lg text-[var(--sp-text)] hover:bg-[var(--sp-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0"
        >
          {selectedNode?.folded ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Typography Quick Formats (visible from sm and up) */}
        <div className="hidden sm:flex items-center gap-0.5">
          <button
            title="Negrita (Bold)"
            disabled={!selectedNode}
            onClick={onToggleBold}
            className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center ${
              selectedNode?.bold ? 'bg-blue-100 text-blue-700 font-bold' : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
            } disabled:opacity-30 disabled:hover:bg-transparent`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            title="Cursiva (Italic)"
            disabled={!selectedNode}
            onClick={onToggleItalic}
            className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center ${
              selectedNode?.italic ? 'bg-blue-100 text-blue-700' : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
            } disabled:opacity-30 disabled:hover:bg-transparent`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shape Selector (Responsive compact width on smaller screens) */}
        <div className="hidden sm:block">
          <select
            disabled={!selectedNode}
            value={selectedNode?.shape || 'bubble'}
            onChange={(e) => onChangeShape(e.target.value as NodeShape)}
            className="bg-[var(--sp-input)] border border-[var(--sp-border)] rounded-lg px-2 py-1 text-xs text-[var(--sp-text)] font-medium outline-none focus:border-blue-500 disabled:opacity-35 max-w-[105px] md:max-w-none truncate"
          >
            <option value="bubble">Burbuja</option>
            <option value="fork">Horquilla</option>
            <option value="rectangle">Rectángulo</option>
            <option value="oval">Óvalo</option>
            <option value="hexagon">Hexágono</option>
            <option value="pill">Cápsula</option>
          </select>
        </div>

        <div className="hidden md:block w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* Connector (Desktop & Tablets) */}
        <button
          title="Crear Conector / Relación entre 2 nodos"
          disabled={!selectedNode}
          onClick={onOpenConnectorModal}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-[var(--sp-text)] hover:bg-[var(--sp-hover)] font-medium text-xs disabled:opacity-35 shrink-0"
        >
          <Link className="w-3.5 h-3.5 text-cyan-600" />
          <span className="hidden lg:inline">Conector</span>
        </button>

        {/* Cloud (Desktop & Tablets) */}
        <button
          title="Alternar Nube de Rama"
          disabled={!selectedNode}
          onClick={onToggleCloud}
          className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium text-xs transition-colors ${
            selectedNode?.cloud?.enabled ? 'bg-amber-100 text-amber-800' : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
          } disabled:opacity-35 shrink-0`}
        >
          <Cloud className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden lg:inline">Nube</span>
        </button>

        {/* 500+ Vector Icons Pack Trigger */}
        {onOpenIconPackModal && (
          <button
            title="Abrir pack de 500+ iconos vectoriales SVG para nodos"
            onClick={onOpenIconPackModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-xs transition-colors shrink-0"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center text-blue-600 font-bold text-xs">★</span>
            <span className="hidden lg:inline">Iconos SVG</span>
            <span className="hidden xl:inline px-1 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold">500+</span>
          </button>
        )}

        {/* Mobile "More Options" Menu Popover (for small screens) */}
        <div className="relative md:hidden shrink-0" ref={moreMenuRef}>
          <button
            title="Más opciones de nodo"
            onClick={() => setIsMoreMenuOpen((o) => !o)}
            className={`p-1.5 rounded-lg text-[var(--sp-text)] hover:bg-[var(--sp-hover)] transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center ${
              isMoreMenuOpen ? 'bg-slate-100 text-blue-600' : ''
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[var(--sp-bg)] text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Formato & Enlaces
              </div>

              {/* Mobile Shape selector */}
              <div className="px-3 py-1.5 flex items-center justify-between">
                <span className="text-slate-600">Forma:</span>
                <select
                  disabled={!selectedNode}
                  value={selectedNode?.shape || 'bubble'}
                  onChange={(e) => {
                    onChangeShape(e.target.value as NodeShape);
                    setIsMoreMenuOpen(false);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 outline-none"
                >
                  <option value="bubble">Burbuja</option>
                  <option value="fork">Horquilla</option>
                  <option value="rectangle">Rectángulo</option>
                  <option value="square">Cuadrada</option>
                  <option value="oval">Óvalo</option>
                  <option value="circle">Circular</option>
                  <option value="pill">Cápsula</option>
                  <option value="hexagon">Hexágono</option>
                  <option value="arrow">Flecha</option>
                  <option value="star">Estrella</option>
                </select>
              </div>

              <div className="my-1 border-t border-slate-100" />

              {/* Bold / Italic */}
              <div className="px-3 py-1 flex items-center justify-around gap-1">
                <button
                  disabled={!selectedNode}
                  onClick={() => {
                    onToggleBold();
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex-1 py-1 rounded text-center border ${
                    selectedNode?.bold ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Negrita
                </button>
                <button
                  disabled={!selectedNode}
                  onClick={() => {
                    onToggleItalic();
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex-1 py-1 rounded text-center border italic ${
                    selectedNode?.italic ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Cursiva
                </button>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <button
                disabled={!selectedNode}
                onClick={() => {
                  onOpenConnectorModal();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                <Link className="w-3.5 h-3.5 text-cyan-600" />
                <span>Crear Conector flotante</span>
              </button>

              <button
                disabled={!selectedNode}
                onClick={() => {
                  onToggleCloud();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span>Alternar Nube de agrupación</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right group: Modes & Panels */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Search & Filter */}
        <button
          title="Buscar y Filtrar (Ctrl+F)"
          onClick={onToggleFilterBar}
          className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0 ${
            isFilterBarOpen ? 'bg-blue-100 text-blue-700' : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
          }`}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Focus / Element Visibility (Eye Dropdown) */}
        <div className="relative shrink-0" ref={visibilityMenuRef}>
          <button
            title="Visibilidad de elementos y modo enfoque (Ocultar/Mostrar imágenes, cuerpo, tags)"
            onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
              isVisibilityMenuOpen
                ? 'bg-amber-100 text-amber-800 shadow-2xs'
                : hasAnyHiddenGlobal
                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
            }`}
          >
            {hasAnyHiddenGlobal ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
            <span className="hidden lg:inline">Vista</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isVisibilityMenuOpen ? 'rotate-180 text-amber-600' : ''}`} />
          </button>

          {isVisibilityMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-[var(--sp-pop)] backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Visibilidad Global (Modo Enfoque)
                </span>
              </div>

              {/* 1. Toggle Bodies */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllBodies')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[var(--sp-text)] font-medium">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Cuerpos / Explicación</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllBodies ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {mindMap?.hideAllBodies ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 2. Toggle Images */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllImages')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[var(--sp-text)] font-medium">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Imágenes adjuntas</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllImages ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {mindMap?.hideAllImages ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 3. Toggle Tags */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllTags')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[var(--sp-text)] font-medium">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Etiquetas (#Tags)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllTags ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {mindMap?.hideAllTags ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 4. Toggle Icons */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllIcons')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[var(--sp-text)] font-medium">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Iconos temáticos</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllIcons ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {mindMap?.hideAllIcons ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 5. Toggle Links */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllLinks')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[var(--sp-text)] font-medium">
                  <Link className="w-4 h-4 text-cyan-600" />
                  <span>Insignias de enlace</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllLinks ? 'bg-rose-100 text-rose-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  {mindMap?.hideAllLinks ? 'Oculto' : 'Visible'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Outline View Toggle */}
        <button
          title="Mostrar / Ocultar panel lateral de esquema (Alt+O)"
          onClick={onToggleOutline}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 ${
            isOutlineMode ? 'bg-indigo-100 text-indigo-700 font-bold shadow-2xs' : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
          }`}
        >
          <ListTree className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Esquema</span>
        </button>

        {/* Presentation Mode Dropdown */}
        <div className="relative shrink-0" ref={presentationMenuRef}>
          <button
            title="Modos de Presentación (F5)"
            onClick={() => setIsPresentationMenuOpen(!isPresentationMenuOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
              isPresentationMenuOpen
                ? 'bg-purple-100 text-purple-800 shadow-2xs'
                : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden lg:inline">Presentar</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isPresentationMenuOpen ? 'rotate-180 text-purple-600' : ''}`} />
          </button>

          {isPresentationMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-[var(--sp-pop)] backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tipos de Presentación
                </span>
                <span className="text-[9px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-semibold">
                  F5
                </span>
              </div>

              {/* 1. Clásico */}
              <button
                onClick={() => {
                  setIsPresentationMenuOpen(false);
                  onStartPresentation('classic');
                }}
                className="w-full p-2 rounded-xl text-left hover:bg-purple-50 group flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-[var(--sp-text)] group-hover:text-purple-900">
                      Clásico
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Diapositivas paso a paso por nodos y notas
                  </p>
                </div>
              </button>

              {/* 2. Elaborado (Prezi Espacial + Tarjetas Libres) */}
              <button
                onClick={() => {
                  setIsPresentationMenuOpen(false);
                  onStartPresentation('elaborate');
                }}
                className="w-full p-2 rounded-xl text-left hover:bg-indigo-50 group flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Map className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-[var(--sp-text)] group-hover:text-indigo-900">
                      Elaborado (Espacial Prezi)
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Lienzo libre, rotación de tarjetas y vuelo cinemático con zoom
                  </p>
                </div>
              </button>

              {/* 3. Dinámico (Mindomo Canvas Zoom & Frame Studio) */}
              <button
                onClick={() => {
                  setIsPresentationMenuOpen(false);
                  onStartPresentation('dynamic');
                }}
                className="w-full p-2 rounded-xl text-left hover:bg-pink-50 group flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-[var(--sp-text)] group-hover:text-pink-900">
                      Dinámico (Estilo Mindomo)
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Vuelo de cámara sobre el lienzo con editor de marcos y foco Spotlight
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export / Portable HTML */}
        <button
          title="Exportar archivo .mm / HTML Portable"
          onClick={onOpenExportModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs shadow-xs transition-colors shrink-0"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Toggle Tool Panel */}
        <button
          title="Alternar Panel de Propiedades (Alt+P)"
          onClick={onToggleToolPanel}
          className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0 ${
            isToolPanelOpen ? 'bg-blue-100 text-blue-700' : 'text-[var(--sp-text)] hover:bg-[var(--sp-hover)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
\\n

## src/components/ToolPanel.tsx

\\tsx
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
                onUpdateMapGaps={
                  props.onUpdateMapGaps ??
                  ((gaps) => {
                    // Cableado 2026-10-17: App no pasa onUpdateMapGaps; adaptamos al
                    // handler onUpdateMapSpacing(h, v) que App sí inyecta (App.tsx:553).
                    props.onUpdateMapSpacing?.(
                      gaps.horizontal ?? props.mindMap?.horizontalGap ?? 54,
                      gaps.vertical ?? props.mindMap?.verticalGap ?? 14
                    );
                  })
                }
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
\\n

## src/components/__tests__/MenuBar.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/MenuBar.test.tsx'
\\n

## src/components/__tests__/MiniMap.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/MiniMap.test.tsx'
\\n

## src/components/__tests__/NodeComponent.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/NodeComponent.test.tsx'
\\n

## src/components/__tests__/PresentationMode.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/PresentationMode.test.tsx'
\\n

## src/components/__tests__/StatusBar.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/StatusBar.test.tsx'
\\n

## src/components/__tests__/ToolBar.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/ToolBar.test.tsx'
\\n

## src/components/__tests__/ToolPanel.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/__tests__/ToolPanel.test.tsx'
\\n

## src/components/atoms/Badge.tsx

\\tsx
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'slate' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'sm',
  icon,
  onRemove,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.2 text-[10px] gap-1 rounded',
    sm: 'px-2 py-0.5 text-xs gap-1.5 rounded-md font-medium',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg font-semibold',
  };

  const variantClasses = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  };

  return (
    <span
      className={`inline-flex items-center select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-0.5 hover:opacity-75 focus:outline-none cursor-pointer"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};
\\n

## src/components/atoms/Button.tsx

\\tsx
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'surface';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1 rounded',
    sm: 'px-2.5 py-1 text-xs font-medium gap-1.5 rounded-lg',
    md: 'px-3.5 py-1.5 text-sm font-medium gap-2 rounded-xl',
    lg: 'px-4 py-2 text-base font-semibold gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-500/20 border border-blue-500/30',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 border border-rose-500/30',
    outline:
      'bg-transparent border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 dark:border-slate-600 dark:hover:bg-slate-800 dark:text-slate-200',
    surface:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200 shadow-sm dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800',
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};
\\n

## src/components/atoms/CollapsibleSection.tsx

\\tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  icon,
  badge,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all ${className}`}>
      <div className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors select-none">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer text-left"
        >
          {icon && (
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
              {title}
            </span>
            {subtitle && (
              <span className="text-[10px] text-slate-400 font-normal block truncate">
                {subtitle}
              </span>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {action}
          {badge}
          <button
            type="button"
            onClick={onToggle}
            className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-slate-200/60 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
};
\\n

## src/components/atoms/ColorPicker.tsx

\\tsx
import React from 'react';

interface ColorPickerProps {
  label: string;
  value?: string;
  onChange: (color: string) => void;
  onClear?: () => void;
  defaultColor?: string;
  presets?: string[];
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  '#ffffff', '#f8fafc', '#eff6ff', '#f0fdf4', '#fefce8', '#fff7ed', '#faf5ff', '#ecfeff',
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#475569', '#0f172a'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  onClear,
  defaultColor = '#ffffff',
  presets = DEFAULT_PRESETS,
  disabled = false,
}) => {
  const currentColor = value || defaultColor;

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
            <input
              type="color"
              value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : defaultColor}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 rounded border-0 cursor-pointer p-0 bg-transparent"
            />
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {value ? value : 'Auto'}
            </span>
          </div>
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              title="Restablecer a automático"
              className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div className="grid grid-cols-8 gap-1 pt-0.5">
          {presets.map((color, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(color)}
              title={color}
              style={{ backgroundColor: color }}
              className={`w-full aspect-square rounded-md border transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xs ${
                value?.toLowerCase() === color.toLowerCase()
                  ? 'border-blue-600 ring-2 ring-blue-400 ring-offset-1 z-1'
                  : 'border-slate-200/80 hover:border-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
\\n

## src/components/atoms/ErrorBoundary.tsx

\\tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }


  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {this.props.fallbackTitle || 'Ocurrió un error en esta vista'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {this.props.fallbackMessage ||
                  'No te preocupes, los datos de tu mapa siguen seguros en el almacenamiento local.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-2.5 bg-slate-100 dark:bg-slate-900/80 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={this.handleReset}>
                Reintentar
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={this.handleReload}
              >
                Recargar Aplicación
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
\\n

## src/components/atoms/IconButton.tsx

\\tsx
import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'surface' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  rounded?: 'md' | 'lg' | 'xl' | 'full';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  tooltip,
  variant = 'ghost',
  size = 'md',
  active = false,
  rounded = 'lg',
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 p-1 text-xs',
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-8 h-8 p-1.5 text-sm',
    lg: 'w-10 h-10 p-2.5 text-base',
  };

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const variantClasses = {
    ghost: active
      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
      : 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    primary: active
      ? 'bg-blue-700 text-white shadow-sm'
      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
    secondary: active
      ? 'bg-slate-200 text-slate-900 dark:bg-slate-700'
      : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300',
    danger: active
      ? 'bg-rose-700 text-white'
      : 'bg-transparent hover:bg-rose-50 active:bg-rose-100 text-slate-500 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400',
    surface: active
      ? 'bg-blue-50 border-blue-300 text-blue-600'
      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200',
    dark: active
      ? 'bg-slate-700 text-white border border-slate-600'
      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 shadow-md',
  };

  return (
    <button
      type="button"
      title={tooltip || label}
      aria-label={label || tooltip}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses[size]} ${roundedClasses[rounded]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
\\n

## src/components/atoms/Input.tsx

\\tsx
import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      iconLeft,
      iconRight,
      onClear,
      className = '',
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'py-1 text-xs',
      md: 'py-1.5 text-sm',
      lg: 'py-2.5 text-base',
    };

    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {iconLeft && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-400">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            value={value}
            disabled={disabled}
            className={`w-full rounded-xl bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700'
            } ${iconLeft ? 'pl-8' : 'pl-3'} ${
              iconRight || (onClear && hasValue) ? 'pr-8' : 'pr-3'
            } ${sizeClasses[size]} ${
              disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : ''
            } ${className}`}
            {...props}
          />
          {onClear && hasValue && !disabled ? (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ) : (
            iconRight && (
              <div className="absolute right-2.5 flex items-center pointer-events-none text-slate-400">
                {iconRight}
              </div>
            )
          )}
        </div>
        {error ? (
          <span className="text-[11px] text-rose-500 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
\\n

## src/components/atoms/ModalBackdrop.tsx

\\tsx
import React, { useEffect } from 'react';

export interface ModalBackdropProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
  /** Solo claro aunque el SO esté en oscuro (armonía visual, ej. Plantillas). */
  forceLight?: boolean;
}

export const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'xl',
  className = '',
  forceLight = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} bg-[var(--sp-bg)] ${forceLight ? '' : 'dark:bg-slate-900'} rounded-2xl shadow-2xl border border-slate-200/80 ${forceLight ? '' : 'dark:border-slate-800'} overflow-hidden transform transition-all duration-200 scale-100 flex flex-col max-h-[90vh] ${className}`}
        style={forceLight ? ({ '--sp-bg': '#ffffff', '--sp-bg2': '#f8fafc' } as React.CSSProperties) : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
\\n

## src/components/atoms/SliderInput.tsx

\\tsx
import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset?: () => void;
  description?: string;
  badge?: string | number;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
  onReset,
  description,
  badge,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
            {badge ?? `${value}${unit}`}
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Restablecer valor"
              className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      {description && <p className="text-[10px] text-slate-400 leading-tight">{description}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
      />
    </div>
  );
};
\\n

## src/components/atoms/ToggleButton.tsx

\\tsx
import React from 'react';

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  disabled?: boolean;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  active,
  onClick,
  icon,
  title,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      title={title || label}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none ${
        active
          ? 'bg-blue-600 text-white shadow-2xs font-semibold'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
\\n

## src/components/atoms/ToggleButtonGroup.tsx

\\tsx
import React from 'react';

export interface ToggleOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

interface ToggleButtonGroupProps<T extends string | number> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function ToggleButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: ToggleButtonGroupProps<T>) {
  return (
    <div className={`flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs gap-0.5 ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            title={opt.title || opt.label}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-md transition-all cursor-pointer select-none ${
              size === 'sm' ? 'py-1 px-1.5 text-[10.5px]' : 'py-1.5 px-2 text-xs'
            } ${
              isSelected
                ? 'bg-blue-100 text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {opt.icon}
            {opt.label && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
\\n

## src/components/atoms/__tests__/Atoms.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/atoms/__tests__/Atoms.test.tsx'
\\n

## src/components/molecules/FontFormatToolbar.tsx

\\tsx
import React from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface FontFormatToolbarProps {
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onChangeAlign: (align: 'left' | 'center' | 'right') => void;
}

export const FontFormatToolbar: React.FC<FontFormatToolbarProps> = ({
  bold,
  italic,
  align = 'left',
  onToggleBold,
  onToggleItalic,
  onChangeAlign,
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Negrita"
          onClick={onToggleBold}
          className={`p-1.5 transition-colors cursor-pointer ${
            bold ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Cursiva"
          onClick={onToggleItalic}
          className={`p-1.5 transition-colors border-l border-slate-200 cursor-pointer ${
            italic ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          title="Alinear a la izquierda"
          onClick={() => onChangeAlign('left')}
          className={`p-1.5 transition-colors cursor-pointer ${
            align === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Centrar"
          onClick={() => onChangeAlign('center')}
          className={`p-1.5 transition-colors border-l border-slate-200 cursor-pointer ${
            align === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Alinear a la derecha"
          onClick={() => onChangeAlign('right')}
          className={`p-1.5 transition-colors border-l border-slate-200 cursor-pointer ${
            align === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
\\n

## src/components/molecules/HistoryControls.tsx

\\tsx
import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

export interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <IconButton
        icon={<Undo2 className="w-4 h-4" />}
        tooltip="Deshacer (Ctrl + Z)"
        onClick={onUndo}
        disabled={!canUndo}
        size="md"
        rounded="lg"
      />
      <IconButton
        icon={<Redo2 className="w-4 h-4" />}
        tooltip="Rehacer (Ctrl + Y / Ctrl + Shift + Z)"
        onClick={onRedo}
        disabled={!canRedo}
        size="md"
        rounded="lg"
      />
    </div>
  );
};
\\n

## src/components/molecules/ModalHeader.tsx

\\tsx
import React from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  badge?: React.ReactNode;
  /** Solo claro aunque el SO esté en oscuro (requiere ModalBackdrop forceLight). */
  forceLight?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  badge,
  forceLight = false,
}) => {
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${forceLight ? '' : 'dark:border-slate-800/80'} bg-[var(--sp-bg2)] ${forceLight ? '' : 'dark:bg-slate-900/50'} select-none`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 ${forceLight ? '' : 'dark:bg-blue-950/60 dark:text-blue-400'} border border-blue-100 ${forceLight ? '' : 'dark:border-blue-900/50'} shadow-xs`}>
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className={`text-lg font-bold text-slate-900 ${forceLight ? '' : 'dark:text-white'} tracking-tight`}>
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p className={`text-xs text-slate-500 ${forceLight ? '' : 'dark:text-slate-400'} mt-0.5`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <IconButton
        icon={<X className="w-4 h-4" />}
        label="Cerrar modal"
        tooltip="Cerrar (Esc)"
        onClick={onClose}
        variant="ghost"
        size="md"
        rounded="lg"
      />
    </div>
  );
};
\\n

## src/components/molecules/SearchInput.tsx

\\tsx
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  matchCount?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar nodos (texto, notas, etiquetas)...',
  matchCount,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClear={() => onChange('')}
        placeholder={placeholder}
        size="sm"
        iconLeft={<Search className="w-3.5 h-3.5" />}
        iconRight={
          matchCount !== undefined && value.trim().length > 0 ? (
            <Badge variant="blue" size="xs">
              {matchCount} {matchCount === 1 ? 'coincidencia' : 'coincidencias'}
            </Badge>
          ) : undefined
        }
      />
    </div>
  );
};
\\n

## src/components/molecules/ShapeSelector.tsx

\\tsx
import React from 'react';
import { NodeShape } from '../../types/mindmap';
import {
  MessageSquare,
  GitFork,
  Square,
  Circle,
  Pill,
  Hexagon,
  ArrowRight,
  Star,
} from 'lucide-react';

interface ShapeSelectorProps {
  currentShape?: NodeShape;
  onSelectShape: (shape: NodeShape) => void;
}

interface ShapeItem {
  id: NodeShape;
  name: string;
  icon: React.ReactNode;
}

const SHAPES: ShapeItem[] = [
  {
    id: 'bubble',
    name: 'Burbuja',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'fork',
    name: 'Horquilla',
    icon: (
      <div className="w-5 h-3.5 flex flex-col justify-end">
        <div className="w-full h-0.5 bg-current rounded-full" />
      </div>
    ),
  },
  {
    id: 'rectangle',
    name: 'Rectángulo',
    icon: (
      <div className="w-5 h-3.5 rounded-none border-2 border-current" />
    ),
  },
  {
    id: 'square',
    name: 'Cuadrado',
    icon: (
      <div className="w-4 h-4 rounded-none border-2 border-current" />
    ),
  },
  {
    id: 'oval',
    name: 'Óvalo',
    icon: (
      <div className="w-5 h-3 rounded-[50%] border-2 border-current" />
    ),
  },
  {
    id: 'circle',
    name: 'Círculo',
    icon: (
      <div className="w-4 h-4 rounded-full border-2 border-current" />
    ),
  },
  {
    id: 'pill',
    name: 'Píldora',
    icon: (
      <div className="w-5 h-2.5 rounded-full border-2 border-current" />
    ),
  },
  {
    id: 'hexagon',
    name: 'Hexágono',
    icon: <Hexagon className="w-4 h-4" />,
  },
  {
    id: 'arrow',
    name: 'Flecha',
    icon: <ArrowRight className="w-4 h-4" />,
  },
  {
    id: 'star',
    name: 'Estrella',
    icon: <Star className="w-4 h-4" />,
  },
];

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  currentShape = 'bubble',
  onSelectShape,
}) => {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {SHAPES.map((s) => {
        const isSelected = currentShape === s.id;
        return (
          <button
            key={s.id}
            type="button"
            title={s.name}
            onClick={() => onSelectShape(s.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
              isSelected
                ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {s.icon}
            <span className="text-[10px] mt-1 text-center truncate w-full">{s.name}</span>
          </button>
        );
      })}
    </div>
  );
};
\\n

## src/components/molecules/TagManager.tsx

\\tsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagManagerProps {
  tags?: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags = [],
  onAddTag,
  onRemoveTag,
}) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Añadir etiqueta..."
          className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim()}
          className="flex items-center justify-center p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md text-[11px] font-medium"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
\\n

## src/components/molecules/ZoomControls.tsx

\\tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Compass } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

export interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen?: () => void;
  onToggleMiniMap?: () => void;
  showMiniMap?: boolean;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onToggleMiniMap,
  showMiniMap,
  className = '',
}) => {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div
      className={`flex items-center gap-1 p-1 bg-[var(--sp-bg)] backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg shadow-slate-900/5 select-none ${className}`}
    >
      {onToggleMiniMap && (
        <>
          <IconButton
            icon={<Compass className="w-4 h-4" />}
            tooltip={showMiniMap ? 'Ocultar MiniMapa' : 'Mostrar MiniMapa'}
            onClick={onToggleMiniMap}
            size="sm"
            rounded="xl"
            className={showMiniMap ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}
          />
          <div className="w-[1px] h-4 bg-slate-200 my-auto mx-0.5" />
        </>
      )}

      <IconButton
        icon={<ZoomOut className="w-3.5 h-3.5" />}
        tooltip="Reducir zoom (Ctrl + -)"
        onClick={onZoomOut}
        size="sm"
        rounded="xl"
      />
      <button
        type="button"
        onClick={onResetZoom}
        title="Restablecer zoom al 100% (Ctrl + 0)"
        className="px-2 py-0.5 text-xs font-bold font-mono text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors tabular-nums cursor-pointer"
      >
        {zoomPercentage}%
      </button>
      <IconButton
        icon={<ZoomIn className="w-3.5 h-3.5" />}
        tooltip="Aumentar zoom (Ctrl + +)"
        onClick={onZoomIn}
        size="sm"
        rounded="xl"
      />
      <div className="w-[1px] h-4 bg-slate-200 my-auto mx-0.5" />
      {onFitToScreen && (
        <IconButton
          icon={<Maximize2 className="w-3.5 h-3.5" />}
          tooltip="Ajustar y centrar todo el mapa"
          onClick={onFitToScreen}
          size="sm"
          rounded="xl"
        />
      )}
    </div>
  );
};
\\n

## src/components/molecules/__tests__/Molecules.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/molecules/__tests__/Molecules.test.tsx'
\\n

## src/components/molecules/node/NodeActionButtons.tsx

\\tsx
import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

export interface NodeActionButtonsProps {
  node: MindNode;
  side?: string;
  hasChildren: boolean;
  branchColor?: string;
  isHovered: boolean;
  isEditing: boolean;
  onToggleFold: (id: string, e: React.MouseEvent) => void;
  onAddChild: (parentId: string) => void;
}

export const NodeActionButtons: React.FC<NodeActionButtonsProps> = ({
  node,
  side,
  hasChildren,
  branchColor,
  isHovered,
  isEditing,
  onToggleFold,
  onAddChild,
}) => {
  return (
    <>
      {/* Folding / Unfolding Toggle Badge */}
      {hasChildren && (
        <button
          type="button"
          title={
            node.folded
              ? `Desplegar ${node.children.length} sub-nodos (Espacio)`
              : 'Plegar rama (Espacio)'
          }
          onClick={(e) => onToggleFold(node.id, e)}
          style={{
            borderColor: node.folded ? '#f59e0b' : branchColor || '#94a3b8',
          }}
          className={`absolute flex items-center justify-center rounded-full transition-all z-20 shadow-xs cursor-pointer ${
            node.folded
              ? 'min-w-5 h-5 px-1 bg-amber-50 text-amber-800 border-2 border-amber-500 font-bold hover:bg-amber-100 hover:scale-105'
              : 'w-4.5 h-4.5 bg-white text-slate-600 border border-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
          } ${
            side === 'left'
              ? '-left-2.5 top-1/2 -translate-y-1/2'
              : '-right-2.5 top-1/2 -translate-y-1/2'
          }`}
        >
          {node.folded ? (
            <span className="flex items-center gap-0.5 text-[10px] leading-none">
              {side === 'left' ? (
                <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              )}
              <span className="text-[9px] font-bold font-mono">{node.children.length}</span>
            </span>
          ) : (
            <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
          )}
        </button>
      )}

      {/* Quick Add Child Button on Hover (Placed Higher Up to avoid collision) */}
      {isHovered && !isEditing && (
        <button
          type="button"
          title="Agregar nodo hijo (Tab)"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          className={`absolute flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer ${
            side === 'left' ? '-left-3 -top-2.5' : '-right-3 -top-2.5'
          }`}
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
        </button>
      )}
    </>
  );
};
\\n

## src/components/molecules/node/NodeBackgroundRenderer.tsx

\\tsx
import React from 'react';
import { MindNode, CalculatedNodeLayout, MindMapTheme } from '../../../types/mindmap';

export interface NodeBackgroundProps {
  node: MindNode;
  layout: CalculatedNodeLayout;
  theme: MindMapTheme;
  branchColor: string;
  isRoot: boolean;
  isSelected?: boolean;
}

/**
 * Calculates perceived luminance (ITU-R BT.709) to detect if background is dark
 */
export const isDarkNodeBackground = (color: string | undefined, isRoot: boolean): boolean => {
  const rawCol = (color || (isRoot ? '#1d4ed8' : '#ffffff')).replace('#', '');
  if (rawCol.length === 3 || rawCol.length === 6) {
    const r = parseInt(rawCol.length === 3 ? rawCol[0] + rawCol[0] : rawCol.substring(0, 2), 16);
    const g = parseInt(rawCol.length === 3 ? rawCol[1] + rawCol[1] : rawCol.substring(2, 4), 16);
    const b = parseInt(rawCol.length === 3 ? rawCol[2] + rawCol[2] : rawCol.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.52;
  }
  return isRoot;
};

/**
 * Computes CSS background properties for solid, transparent, gradient, pattern or image
 */
export const getNodeBackgroundStyles = (
  node: MindNode,
  theme: MindMapTheme,
  isRoot: boolean
): React.CSSProperties => {
  const bgColor = isRoot
    ? (node.color || theme.rootBg)
    : (node.color || theme.nodeBg);

  const bgType = node.bgType || (node.bgImageUrl ? 'image' : 'color');

  if (bgType === 'transparent') {
    return {
      backgroundColor: 'transparent',
      backgroundImage: 'none',
    };
  }

  if (bgType === 'gradient') {
    const c1 = node.gradientColor1 || node.color || bgColor || '#3b82f6';
    const c2 = node.gradientColor2 || '#8b5cf6';
    const dir = node.gradientDirection || 'to-br';
    let grad = `linear-gradient(135deg, ${c1}, ${c2})`;
    if (dir === 'to-r') grad = `linear-gradient(to right, ${c1}, ${c2})`;
    else if (dir === 'to-b') grad = `linear-gradient(to bottom, ${c1}, ${c2})`;
    else if (dir === 'radial') grad = `radial-gradient(circle, ${c1}, ${c2})`;

    return {
      background: grad,
    };
  }

  if (bgType === 'pattern') {
    const baseColor = node.color || bgColor || '#ffffff';
    const pat = node.nodePattern || 'dots';
    const patColor = node.nodePatternColor || '#475569';
    const opacity = node.nodePatternOpacity ?? 0.4;
    const size = node.nodePatternSize || 16;

    const hexToRgba = (hex: string, op: number) => {
      const cleanHex = hex.replace('#', '');
      let r = 71, g = 85, b = 105;
      if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
      } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${op})`;
    };

    const patRgba = hexToRgba(patColor, opacity);

    if (pat === 'dots') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'lines') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(to bottom, ${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `100% ${size}px`,
      };
    }
    if (pat === 'squares') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `linear-gradient(to right, ${patRgba} 1.5px, transparent 1.5px), linear-gradient(to bottom, ${patRgba} 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      };
    }
    if (pat === 'stripes') {
      return {
        backgroundColor: baseColor,
        backgroundImage: `repeating-linear-gradient(45deg, ${patRgba} 0px, ${patRgba} 1.5px, transparent 1.5px, transparent ${size}px)`,
      };
    }
    if (pat === 'triangles') {
      const triW = size;
      const triH = Math.max(8, Math.round(size * 0.866));
      const triSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${triW}" height="${triH}" viewBox="0 0 ${triW} ${triH}"><polygon points="0,${triH} ${triW / 2},0 ${triW},${triH}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${triSvg}")`,
        backgroundSize: `${triW}px ${triH}px`,
      };
    }
    if (pat === 'hexagons') {
      const hexW = size;
      const hexH = size;
      const hexSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${hexW}" height="${hexH}" viewBox="0 0 ${hexW} ${hexH}"><polygon points="${hexW * 0.25},0 ${hexW * 0.75},0 ${hexW},${hexH * 0.5} ${hexW * 0.75},${hexH} ${hexW * 0.25},${hexH} 0,${hexH * 0.5}" fill="none" stroke="${patColor}" stroke-width="1.2" stroke-opacity="${opacity}"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${hexSvg}")`,
        backgroundSize: `${hexW}px ${hexH}px`,
      };
    }
    if (pat === 'cross') {
      const cLen = Math.max(3, Math.round(size * 0.35));
      const cMid = size / 2;
      const crossSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><line x1="${cMid - cLen}" y1="${cMid}" x2="${cMid + cLen}" y2="${cMid}" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}" stroke-linecap="round"/><line x1="${cMid}" y1="${cMid - cLen}" x2="${cMid}" y2="${cMid + cLen}" stroke="${patColor}" stroke-width="1.5" stroke-opacity="${opacity}" stroke-linecap="round"/></svg>`
      );
      return {
        backgroundColor: baseColor,
        backgroundImage: `url("data:image/svg+xml,${crossSvg}")`,
        backgroundSize: `${size}px ${size}px`,
      };
    }

    return {
      backgroundColor: baseColor,
      backgroundImage: `radial-gradient(${patRgba} 1.5px, transparent 1.5px)`,
      backgroundSize: `${size}px ${size}px`,
    };
  }

  if (bgType === 'image' && node.bgImageUrl) {
    const bgImg = node.bgImageUrl;
    const mode = node.bgImageMode || 'cover';
    const bgSize = mode === 'fit' || mode === 'contain' ? 'contain' : mode === 'tile' ? 'auto' : 'cover';
    const bgRepeat = mode === 'tile' ? 'repeat' : 'no-repeat';
    const bgPos = 'center';
    return {
      backgroundColor: node.color || bgColor || '#ffffff',
      backgroundImage: `url("${bgImg}")`,
      backgroundSize: bgSize,
      backgroundRepeat: bgRepeat,
      backgroundPosition: bgPos,
    };
  }

  return {
    backgroundColor: bgColor,
    backgroundImage: 'none',
  };
};

/**
 * Computes the container shape CSS styles
 */
export const getNodeShapeStyles = (
  node: MindNode,
  theme: MindMapTheme,
  branchColor: string,
  isRoot: boolean
): React.CSSProperties => {
  const bgStyles = getNodeBackgroundStyles(node, theme, isRoot);
  const shape = node.shape || 'bubble';
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  
  // Resuelve el color de borde predeterminado para evitar que sea invisible si el usuario cambia el grosor
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);

  const baseStyle: React.CSSProperties = {
    ...bgStyles,
    border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none',
  };

  if (shape === 'fork') {
    const underlineColor = borderColor || fallbackBorderColor;
    // El subrayado es la forma: siempre visible (2.5px por defecto),
    // independiente de que el borde de caja sea 0.
    const underlineWidth = borderWidth && borderWidth > 0 ? borderWidth : 2.5;
    return {
      ...bgStyles,
      background: 'transparent',
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      border: 'none',
      borderBottom: underlineWidth > 0 ? `${underlineWidth}px ${borderStyle} ${underlineColor}` : 'none',
      borderRadius: '0px',
      boxShadow: 'none',
      paddingBottom: '4px',
    };
  }
  if (shape === 'bubble') {
    return {
      ...baseStyle,
      borderRadius: isRoot ? '24px' : '16px',
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      boxShadow: '0 4px 14px -2px rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.06)',
    };
  }
  if (shape === 'square') {
    return {
      ...baseStyle,
      borderRadius: '0px',
    };
  }
  if (shape === 'circle') {
    return {
      ...baseStyle,
      borderRadius: '9999px',
    };
  }
  if (shape === 'pill') {
    return {
      ...baseStyle,
      borderRadius: '9999px',
      paddingLeft: '20px',
      paddingRight: '20px',
    };
  }
  if (shape === 'oval') {
    return {
      ...baseStyle,
      borderRadius: '50%',
      paddingLeft: '20px',
      paddingRight: '20px',
    };
  }
  if (shape === 'rectangle') {
    return {
      ...baseStyle,
      borderRadius: '0px',
    };
  }
  if (shape === 'hexagon') {
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      paddingLeft: '32px',
      paddingRight: '32px',
    };
  }
  if (shape === 'arrow') {
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      paddingLeft: '24px',
      paddingRight: '36px',
    };
  }
  if (shape === 'star') {
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: '24px 28px',
      textAlign: 'center',
    };
  }

  return {
    ...baseStyle,
    borderRadius: isRoot ? '20px' : '14px',
  };
};

/**
 * Renders SVG overlay polygon/path background for Hexagon, Arrow, Star
 */
export const NodeSvgPolygonBackground: React.FC<NodeBackgroundProps> = ({
  node,
  layout,
  theme,
  branchColor,
  isRoot,
  isSelected,
}) => {
  const shape = node.shape || 'bubble';
  const isSvgShape = shape === 'hexagon' || shape === 'arrow' || shape === 'star';
  if (!isSvgShape) return null;

  const w = layout.width;
  const h = layout.height;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);
  const strokeDash = borderStyle === 'dashed' ? '6 4' : borderStyle === 'dotted' ? '2.5 3' : undefined;
  const effectiveBorderColor = borderWidth > 0 ? borderColor : 'none';
  const effectiveBorderWidth = borderWidth;

  const bgType = node.bgType || (node.bgImageUrl ? 'image' : 'color');
  const gradId = `grad-${node.id}`;
  const patternId = `pat-${node.id}`;
  const bgImgId = `bg-img-${node.id}`;
  const bgImg = node.bgImageUrl;
  const bgColor = isRoot ? (node.color || theme.rootBg) : (node.color || theme.nodeBg);
  const baseColor = node.color || bgColor || '#ffffff';

  let fillAttr = baseColor;
  if (bgType === 'transparent') {
    fillAttr = 'transparent';
  } else if (bgType === 'image' && bgImg) {
    fillAttr = `url(#${bgImgId})`;
  } else if (bgType === 'gradient') {
    fillAttr = `url(#${gradId})`;
  } else if (bgType === 'pattern') {
    fillAttr = `url(#${patternId})`;
  }

  let points = '';

  if (shape === 'hexagon') {
    const inset = Math.min(w * 0.28, Math.max(28, h * 0.58));
    const pad = Math.max(effectiveBorderWidth / 2, 1);
    points = `${inset},${pad} ${w - inset},${pad} ${w - pad},${h / 2} ${w - inset},${h - pad} ${inset},${h - pad} ${pad},${h / 2}`;
  } else if (shape === 'arrow') {
    const arrowTip = Math.min(w * 0.32, Math.max(32, h * 0.70));
    const notch = Math.min(w * 0.16, Math.max(16, h * 0.40));
    const pad = Math.max(effectiveBorderWidth / 2, 1);
    points = `${pad},${pad} ${w - arrowTip},${pad} ${w - pad},${h / 2} ${w - arrowTip},${h - pad} ${pad},${h - pad} ${notch},${h / 2}`;
  } else if (shape === 'star') {
    const pad = Math.max(effectiveBorderWidth / 2, 1);
    const cx = w / 2;
    const cy = h / 2;
    const Rx = Math.max((w - 2 * pad) / 2, 10);
    const Ry = Math.max((h - 2 * pad) / 2, 10);
    const rx = Rx * 0.44;
    const ry = Ry * 0.44;
    const starPts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const rCurrX = i % 2 === 0 ? Rx : rx;
      const rCurrY = i % 2 === 0 ? Ry : ry;
      starPts.push(`${cx + rCurrX * Math.cos(angle)},${cy + rCurrY * Math.sin(angle)}`);
    }
    points = starPts.join(' ');
  }

  const patSize = node.nodePatternSize || 16;
  const patColor = node.nodePatternColor || '#475569';
  const patOpacity = node.nodePatternOpacity ?? 0.4;
  const patStyle = node.nodePattern || 'dots';
  const patMid = patSize / 2;
  const patLen = Math.max(3, Math.round(patSize * 0.35));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 0 }}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
    >
      <defs>
        {bgImg && (
          <pattern
            id={bgImgId}
            width="100%"
            height="100%"
            patternContentUnits="objectBoundingBox"
          >
            <image
              href={bgImg}
              width="1"
              height="1"
              preserveAspectRatio={node.bgImageMode === 'fit' || node.bgImageMode === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}
            />
          </pattern>
        )}
        {bgType === 'gradient' && (
          node.gradientDirection === 'radial' ? (
            <radialGradient
              id={gradId}
              cx="50%"
              cy="50%"
              r="60%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor={node.gradientColor1 || node.color || bgColor || '#3b82f6'} />
              <stop offset="100%" stopColor={node.gradientColor2 || '#8b5cf6'} />
            </radialGradient>
          ) : (
            <linearGradient
              id={gradId}
              x1={node.gradientDirection === 'to-r' ? '0%' : '0%'}
              y1={node.gradientDirection === 'to-b' ? '0%' : '0%'}
              x2={node.gradientDirection === 'to-r' ? '100%' : node.gradientDirection === 'to-br' ? '100%' : '0%'}
              y2={node.gradientDirection === 'to-b' ? '100%' : node.gradientDirection === 'to-br' ? '100%' : '100%'}
            >
              <stop offset="0%" stopColor={node.gradientColor1 || node.color || bgColor || '#3b82f6'} />
              <stop offset="100%" stopColor={node.gradientColor2 || '#8b5cf6'} />
            </linearGradient>
          )
        )}
        {bgType === 'pattern' && (
          <pattern
            id={patternId}
            width={patSize}
            height={patSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill={baseColor} />
            {patStyle === 'dots' && (
              <circle
                cx={patMid}
                cy={patMid}
                r={1.5}
                fill={patColor}
                opacity={patOpacity}
              />
            )}
            {patStyle === 'lines' && (
              <line
                x1="0"
                y1={patMid}
                x2={patSize}
                y2={patMid}
                stroke={patColor}
                strokeWidth="1.5"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'stripes' && (
              <>
                <line
                  x1="0"
                  y1={patSize}
                  x2={patSize}
                  y2="0"
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
                <line
                  x1={-patSize / 2}
                  y1={patSize / 2}
                  x2={patSize / 2}
                  y2={-patSize / 2}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
                <line
                  x1={patSize / 2}
                  y1={patSize * 1.5}
                  x2={patSize * 1.5}
                  y2={patSize / 2}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                />
              </>
            )}
            {patStyle === 'squares' && (
              <rect
                x="0.75"
                y="0.75"
                width={patSize - 1.5}
                height={patSize - 1.5}
                fill="none"
                stroke={patColor}
                strokeWidth="1.5"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'triangles' && (
              <polygon
                points={`0,${patSize} ${patSize / 2},0 ${patSize},${patSize}`}
                fill="none"
                stroke={patColor}
                strokeWidth="1.2"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'hexagons' && (
              <polygon
                points={`${patSize * 0.25},0 ${patSize * 0.75},0 ${patSize},${patSize * 0.5} ${patSize * 0.75},${patSize} ${patSize * 0.25},${patSize} 0,${patSize * 0.5}`}
                fill="none"
                stroke={patColor}
                strokeWidth="1.2"
                strokeOpacity={patOpacity}
              />
            )}
            {patStyle === 'cross' && (
              <>
                <line
                  x1={patMid - patLen}
                  y1={patMid}
                  x2={patMid + patLen}
                  y2={patMid}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                  strokeLinecap="round"
                />
                <line
                  x1={patMid}
                  y1={patMid - patLen}
                  x2={patMid}
                  y2={patMid + patLen}
                  stroke={patColor}
                  strokeWidth="1.5"
                  strokeOpacity={patOpacity}
                  strokeLinecap="round"
                />
              </>
            )}
          </pattern>
        )}
      </defs>

      {/* Resplandor exterior de selección que sigue la geometría del polígono */}
      {isSelected && (
        <polygon
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={Math.max(effectiveBorderWidth + 3.5, 4)}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.85))',
          }}
        />
      )}

      {/* Polígono principal con fondo y borde */}
      <polygon
        points={points}
        fill={fillAttr}
        stroke={effectiveBorderColor}
        strokeWidth={effectiveBorderWidth}
        strokeDasharray={strokeDash}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Speech bubble tail rendering with synchronized border styling
 */
export const NodeBubbleTail: React.FC<NodeBackgroundProps> = ({
  node,
  layout,
  theme,
  branchColor,
  isRoot,
}) => {
  const shape = node.shape || 'bubble';
  if (shape !== 'bubble') return null;

  const tailSide = layout.side === 'left' ? 'right' : 'left';
  const bgColor = isRoot ? (node.color || theme.rootBg) : (node.color || theme.nodeBg);
  const fillCol = node.color || bgColor || '#ffffff';
  const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);
  const fallbackBorderColor = branchColor || theme.nodeBorder || '#3b82f6';
  const borderColor = node.borderColor || (isRoot ? (node.borderWidth ? fallbackBorderColor : 'transparent') : fallbackBorderColor);
  const borderCol = borderWidth > 0 ? borderColor : 'transparent';
  const bWidth = borderWidth;
  const borderStyle = node.borderDash || node.borderStyle || 'solid';
  const strokeDash = borderStyle === 'dashed' ? '4 3' : borderStyle === 'dotted' ? '2 2' : undefined;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-0"
      style={{
        [tailSide === 'left' ? 'left' : 'right']: '-10px',
        width: '12px',
        height: '16px',
      }}
    >
      <svg
        viewBox="0 0 12 16"
        className="w-full h-full overflow-visible"
        style={{
          transform: tailSide === 'right' ? 'scaleX(-1)' : 'none',
        }}
      >
        <path
          d="M 12 0 L 0 8 L 12 16 Z"
          fill={fillCol}
          stroke={borderCol}
          strokeWidth={bWidth}
          strokeDasharray={strokeDash}
          strokeLinejoin="round"
        />
        {bWidth > 0 && (
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="15"
            stroke={fillCol}
            strokeWidth={bWidth + 2}
          />
        )}
      </svg>
    </div>
  );
};
\\n

## src/components/molecules/node/NodeBadgesBar.tsx

\\tsx
import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { MarkdownView } from '../../../utils/markdownRenderer';
import { FileText, ExternalLink } from 'lucide-react';

export interface NodeBadgesBarProps {
  node: MindNode;
  isHovered: boolean;
  isEditing: boolean;
  isPresentationMode?: boolean;
  isImageHidden: boolean;
  isLinkHidden: boolean;
  isTagsHidden: boolean;
  isDarkNodeBackground: boolean;
  side?: string;
  onOpenNote: (id: string) => void;
  globalVisibility?: {
    showAllNotesInline?: boolean;
  };
  /** Acota tags/enlace/nota (ej. '68%' en hexágono). */
  contentMaxWidth?: string;
  /** Tope en px para imágenes (ej. '96px' en hexágono). */
  mediaMaxWidth?: string;
}

export const NodeBadgesBar: React.FC<NodeBadgesBarProps> = ({
  node,
  isHovered,
  isEditing,
  isPresentationMode,
  isImageHidden,
  isLinkHidden,
  isTagsHidden,
  isDarkNodeBackground,
  side,
  onOpenNote,
  globalVisibility,
  contentMaxWidth,
  mediaMaxWidth,
}) => {
  const contentStyle: React.CSSProperties | undefined = contentMaxWidth
    ? { maxWidth: contentMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : undefined;
  const mediaStyle: React.CSSProperties | undefined = mediaMaxWidth
    ? { maxWidth: mediaMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : contentStyle;
  return (
    <>
      {/* Right Attached Content Image */}
      {!isImageHidden && node.imageUrl && node.imagePosition === 'right' && (
        <div className="shrink-0 flex items-center justify-center overflow-hidden rounded-lg relative z-10 ml-1.5" style={mediaStyle}>
          <img
            src={node.imageUrl}
            alt=""
            className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
            style={{
              width: `${node.imageWidth || 100}px`,
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      )}

      {/* Note indicator icon button */}
      {node.note && (
        <button
          type="button"
          title={
            node.showNoteInline || globalVisibility?.showAllNotesInline
              ? undefined
              : `Nota: ${node.note}`
          }
          onClick={(e) => {
            e.stopPropagation();
            onOpenNote(node.id);
          }}
          className={`shrink-0 p-0.5 transition-colors cursor-pointer ${
            node.showNoteInline || globalVisibility?.showAllNotesInline
              ? 'text-amber-600 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-900/40 rounded'
              : 'text-amber-500 hover:text-amber-600 dark:text-amber-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Link indicator */}
      {!isLinkHidden && node.link && (
        <a
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir enlace: ${node.link}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {/* Inline Note (Notas visibles debajo del cuerpo sin tooltip con contraste automático) */}
      {(node.showNoteInline || globalVisibility?.showAllNotesInline) && node.note && node.note.trim().length > 0 && (
        <div
          style={contentStyle}
          className={`mt-2 pt-2 border-t rounded-lg p-2.5 text-xs select-text w-full shadow-2xs transition-all ${
            isDarkNodeBackground
              ? 'border-white/20 bg-black/35 text-slate-100 backdrop-blur-xs'
              : 'border-amber-500/20 bg-amber-50/70 text-slate-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
              isDarkNodeBackground ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nota</span>
          </div>
          <MarkdownView content={node.note} isDark={isDarkNodeBackground} />
        </div>
      )}

      {/* Bottom Image if position is bottom */}
      {!isImageHidden && node.imageUrl && node.imagePosition === 'bottom' && (
        <div className="w-full flex justify-center mt-1.5 overflow-hidden rounded-lg relative z-10" style={mediaStyle}>
          <img
            src={node.imageUrl}
            alt=""
            className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
            style={{
              width: `${node.imageWidth || 140}px`,
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      )}

      {/* Dedicated Prominent Link Badge */}
      {!isLinkHidden && node.link && node.link.trim().length > 0 && (
        <div className="w-full flex justify-center" style={contentStyle}>
        <a
          href={node.link}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir enlace: ${node.link}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-sky-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-[11px] font-semibold transition-all max-w-full truncate shadow-2xs z-10 select-none cursor-pointer"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {node.link.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
          </span>
        </a>
        </div>
      )}

      {/* Tags in the bottom area of the node (Centrados) */}
      {!isTagsHidden && node.tags && node.tags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-1 pt-1 border-t border-black/10 dark:border-white/10 w-full shrink-0 relative z-10" style={contentStyle}>
          {node.tags.map((tg, idx) => (
            <span
              key={idx}
              className="text-[10px] leading-tight px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium tracking-tight shadow-2xs"
            >
              #{tg}
            </span>
          ))}
        </div>
      )}

      {/* Floating Note Hover Tooltip Preview Card (Only when notes are NOT shown inline and NOT in presentation mode) */}
      {node.note &&
        node.note.trim().length > 0 &&
        isHovered &&
        !isEditing &&
        !isPresentationMode &&
        !(node.showNoteInline || globalVisibility?.showAllNotesInline) && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-max min-w-[200px] max-w-[340px] sm:max-w-[420px] bg-slate-900/95 text-slate-100 dark:bg-slate-800/98 dark:text-slate-100 p-3.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-left z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none ${
            side === 'top' ? 'top-full mt-2.5' : 'bottom-full mb-2.5'
          }`}
        >
          {/* Tooltip Header */}
          <div className="flex items-center gap-1.5 pb-1.5 mb-2 border-b border-slate-700/60 text-[11px] font-semibold text-amber-400">
            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Nota del Nodo</span>
          </div>

          {/* Tooltip Body with Complete Rich Markdown Rendering */}
          <div className="text-xs leading-relaxed text-slate-200">
            <MarkdownView content={node.note} isDark={true} />
          </div>

          {/* Arrow pointing towards node */}
          {side === 'top' ? (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-px w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-slate-900/95 dark:border-b-slate-800/98" />
          ) : (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-900/95 dark:border-t-slate-800/98" />
          )}
        </div>
      )}
    </>
  );
};
\\n

## src/components/molecules/node/NodeHeaderRow.tsx

\\tsx
import React, { useRef, useEffect } from 'react';
import { MindNode, MindMapTheme } from '../../../types/mindmap';
import { renderNodeIcon } from '../../../utils/iconMap';
import { GripVertical } from 'lucide-react';

export interface NodeHeaderRowProps {
  node: MindNode;
  theme: MindMapTheme;
  isRoot: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editText: string;
  setEditText: (val: string) => void;
  onTextChange: (id: string, newText: string) => void;
  onFinishEditing: () => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  isImageHidden: boolean;
  isIconsHidden: boolean;
  isProgressHidden: boolean;
  isBodyHidden: boolean;
  textColor: string;
  effectiveFontFamily?: string;
  children?: React.ReactNode;
  /** Ancho máximo del contenido (ej. '68%' en hexágono para respetar el polígono). */
  contentMaxWidth?: string;
  /** Tope en px para imágenes de contenido (ej. '96px' en hexágono). */
  mediaMaxWidth?: string;
}

export const NodeHeaderRow: React.FC<NodeHeaderRowProps> = ({
  node,
  theme,
  isRoot,
  isHovered,
  isEditing,
  editText,
  setEditText,
  onTextChange,
  onFinishEditing,
  onDragStart,
  isImageHidden,
  isIconsHidden,
  isProgressHidden,
  isBodyHidden,
  textColor,
  effectiveFontFamily,
  children,
  contentMaxWidth,
  mediaMaxWidth,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onTextChange(node.id, editText);
      onFinishEditing();
    } else if (e.key === 'Escape') {
      setEditText(node.text);
      onFinishEditing();
    }
  };

  const handleBlur = () => {
    onTextChange(node.id, editText);
    onFinishEditing();
  };

  // Formas con contenido centrado (el hexágono además se ciñe al polígono)
  const centeredShape =
    node.shape === 'circle' ||
    node.shape === 'square' ||
    node.shape === 'star' ||
    node.shape === 'hexagon';
  const contentStyle: React.CSSProperties | undefined = contentMaxWidth
    ? { maxWidth: contentMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : undefined;
  // Las imágenes se acotan más (vértices estrechos) con tope fijo en px
  // para que la medición del motor coincida con lo dibujado.
  const mediaStyle: React.CSSProperties | undefined = mediaMaxWidth
    ? { maxWidth: mediaMaxWidth, marginLeft: 'auto', marginRight: 'auto' }
    : contentStyle;

  return (
    <>
      {/* Top Image if position is top, fit or default */}
      {!isImageHidden && node.imageUrl && (!node.imagePosition || node.imagePosition === 'top' || node.imagePosition === 'fit') && (
        <div className="w-full flex justify-center mb-1.5 overflow-hidden rounded-lg relative z-10" style={mediaStyle}>
          <img
            src={node.imageUrl}
            alt=""
            className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
            style={{
              width: `${node.imageWidth || 140}px`,
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      )}

      {/* Top Icons & Status / Progress Row (Placed OVER / ABOVE the Title) */}
      {((!isIconsHidden && node.icons && node.icons.length > 0 && node.iconPosition !== 'left') ||
        (!isProgressHidden && node.progress !== undefined && node.progressPosition !== 'left')) && (
        <div
          className={`flex items-center gap-1.5 mb-1 relative z-10 w-full ${
            node.textAlign === 'center' || centeredShape
              ? 'justify-center'
              : node.textAlign === 'right'
              ? 'justify-end'
              : 'justify-start'
          }`}
        >
          {/* Icons */}
          {!isIconsHidden && node.icons && node.icons.length > 0 && node.iconPosition !== 'left' && (
            <div className="flex items-center gap-1 shrink-0">
              {node.icons.map((ic, idx) => (
                <span key={idx} className="inline-flex items-center shrink-0">
                  {renderNodeIcon(ic, 'w-3.5 h-3.5', node.iconColor, node.iconSize)}
                </span>
              ))}
            </div>
          )}

          {/* Progress / Status indicator */}
          {!isProgressHidden && node.progress !== undefined && node.progressPosition !== 'left' && (
            <div
              title={`Progreso: ${node.progress}%`}
              className="shrink-0 flex items-center justify-center px-1.5 py-0.5 rounded-full border border-slate-300/80 bg-slate-100/90 text-[9.5px] font-bold text-slate-700 shadow-2xs"
            >
              {node.progress === 100 ? '✓ 100%' : `${node.progress}%`}
            </div>
          )}
        </div>
      )}

      {/* Node Content Container (Side elements + Title/Body) */}
      <div className="flex items-start gap-1.5 w-full relative z-10">
        {/* Drag handle on hover (non-root) */}
        {!isRoot && isHovered && (
          <div
            title="Arrastrar para mover o reordenar rama"
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 -ml-1.5 mt-0.5 shrink-0"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart(node.id, e);
            }}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Side Icons (only when iconPosition is explicitly 'left') */}
        {!isIconsHidden && node.icons && node.icons.length > 0 && node.iconPosition === 'left' && (
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {node.icons.map((ic, idx) => (
              <span key={idx} className="inline-flex items-center shrink-0">
                {renderNodeIcon(ic, 'w-3.5 h-3.5', node.iconColor, node.iconSize)}
              </span>
            ))}
          </div>
        )}

        {/* Side Progress (only when progressPosition is explicitly 'left') */}
        {!isProgressHidden && node.progress !== undefined && node.progressPosition === 'left' && (
          <div
            title={`Progreso: ${node.progress}%`}
            className="shrink-0 flex items-center justify-center w-4.5 h-4.5 rounded-full border border-slate-300 bg-slate-100 text-[9px] font-bold text-slate-700 mt-0.5"
          >
            {node.progress === 100 ? '✓' : `${node.progress}%`}
          </div>
        )}

        {/* Left Attached Content Image */}
        {!isImageHidden && node.imageUrl && node.imagePosition === 'left' && (
          <div className="shrink-0 flex items-center justify-center overflow-hidden rounded-lg relative z-10 mr-1.5" style={mediaStyle}>
            <img
              src={node.imageUrl}
              alt=""
              className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
              style={{
                width: `${node.imageWidth || 100}px`,
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </div>
        )}

        {/* Main Text Content (Title & Body) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden z-10" style={contentStyle}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              rows={Math.max(1, editText.split('\n').length)}
              className="w-full bg-white text-slate-900 text-sm rounded px-1.5 py-0.5 border border-blue-500 outline-none resize-none overflow-hidden font-medium"
              style={{
                fontSize: `${node.fontSize || (isRoot ? 16 : 14)}px`,
                fontWeight: node.bold ? 700 : 500,
                fontStyle: node.italic ? 'italic' : 'normal',
                textAlign: node.textAlign || (centeredShape ? 'center' : 'left'),
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          ) : (
            <>
              {/* Title */}
              <div
                className="leading-snug break-words whitespace-pre-wrap select-text w-full"
                style={{
                  color: textColor,
                  fontSize: `${node.fontSize || (isRoot ? 16 : 14)}px`,
                  fontWeight: node.bold ? 700 : (isRoot ? 600 : 500),
                  fontStyle: node.italic ? 'italic' : 'normal',
                  textAlign: node.textAlign || (node.shape === 'circle' || node.shape === 'square' || node.shape === 'star' ? 'center' : 'left'),
                  fontFamily: effectiveFontFamily,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                }}
              >
                {node.text || 'Nuevo Nodo'}
              </div>

              {/* Between Image (between title and body) */}
              {!isImageHidden && node.imageUrl && node.imagePosition === 'between' && (
                <div className="w-full flex justify-center my-1.5 overflow-hidden rounded-lg relative z-10" style={mediaStyle}>
                  <img
                    src={node.imageUrl}
                    alt=""
                    className="rounded-lg object-contain pointer-events-none shadow-2xs transition-all"
                    style={{
                      width: `${node.imageWidth || 140}px`,
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </div>
              )}

              {/* Body (Cuerpo del nodo) */}
              {!isBodyHidden && node.body && node.body.trim().length > 0 && (
                <div
                  className="mt-1 pt-0.5 leading-relaxed break-words whitespace-pre-wrap select-text border-t border-black/5 dark:border-white/5 w-full"
                  style={{
                    color: node.bodyColor || (isRoot ? 'rgba(255,255,255,0.88)' : (theme.nodeText ? `${theme.nodeText}cc` : '#475569')),
                    fontSize: `${node.bodyFontSize || (isRoot ? 13 : 12)}px`,
                    fontWeight: node.bodyBold ? 700 : 400,
                    fontStyle: node.bodyItalic ? 'italic' : 'normal',
                    textAlign: node.bodyAlign || (centeredShape ? 'center' : 'left'),
                    fontFamily: node.bodyFontFamily || effectiveFontFamily,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {node.body}
                </div>
              )}

              {/* Slot for inline notes if needed */}
              {children}
            </>
          )}
        </div>
      </div>
    </>
  );
};
\\n

## src/components/molecules/node/__tests__/NodeBackgroundRenderer.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/components/molecules/node/__tests__/NodeBackgroundRenderer.test.ts'
\\n

## src/components/organisms/canvas/CanvasBackgroundLayer.tsx

\\tsx
import React from 'react';
import { BackgroundPatternStyle } from '../../../types/mindmap';

export interface CanvasBackgroundLayerProps {
  pattern?: BackgroundPatternStyle;
  patternColor?: string;
  patternSize?: number;
  patternOpacity?: number;
  canvasBounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

export const CanvasBackgroundLayer: React.FC<CanvasBackgroundLayerProps> = ({
  pattern = 'none',
  patternColor = '#64748b',
  patternSize = 24,
  patternOpacity = 0.15,
  canvasBounds = { minX: -20000, maxX: 20000, minY: -20000, maxY: 20000 },
}) => {
  if (pattern === 'none') return null;

  // Triangles pattern dimensions
  const triangleW = patternSize * 2;
  const triangleH = Math.round(patternSize * 1.732);
  const triangleW2 = patternSize;
  const triangleH2 = Math.round((patternSize * 1.732) / 2);

  // Hexagon pattern dimensions
  const R = patternSize;
  const hexW = Number((R * 1.7320508).toFixed(2));
  const hexH = Number((R * 3).toFixed(2));
  const hexW2 = Number((hexW / 2).toFixed(2));
  const r05 = Number((R * 0.5).toFixed(2));
  const r10 = Number((R * 1.0).toFixed(2));
  const hexD = `M 0,0 v ${r05} l ${hexW2},${r05} v ${r10} l -${hexW2},${r05} v ${r05} M ${hexW},0 v ${r05} l -${hexW2},${r05} v ${r10} l ${hexW2},${r05} v ${r05}`;

  const width = canvasBounds.maxX - canvasBounds.minX;
  const height = canvasBounds.maxY - canvasBounds.minY;

  return (
    <>
      <defs>
        {/* Pattern: Dots */}
        {pattern === 'dots' && (
          <pattern
            id="canvas-bg-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={patternSize / 2}
              cy={patternSize / 2}
              r={1.5}
              fill={patternColor}
              fillOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Lines */}
        {pattern === 'lines' && (
          <pattern
            id="canvas-bg-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1={patternSize}
              x2={patternSize}
              y2={patternSize}
              stroke={patternColor}
              strokeWidth="1"
              strokeOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Squares */}
        {pattern === 'squares' && (
          <pattern
            id="canvas-bg-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`}
              fill="none"
              stroke={patternColor}
              strokeWidth="1"
              strokeOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Triangles */}
        {pattern === 'triangles' && (
          <pattern
            id="canvas-bg-pattern"
            width={triangleW}
            height={triangleH}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M 0 0 L ${triangleW} 0 M 0 ${triangleH2} L ${triangleW} ${triangleH2} M 0 0 L ${triangleW} ${triangleH} M ${triangleW2} 0 L ${triangleW} ${triangleH2} M 0 ${triangleH2} L ${triangleW2} ${triangleH} M ${triangleW} 0 L 0 ${triangleH} M ${triangleW2} 0 L 0 ${triangleH2} M ${triangleW} ${triangleH2} L ${triangleW2} ${triangleH}`}
              fill="none"
              stroke={patternColor}
              strokeWidth="1"
              strokeOpacity={patternOpacity}
            />
          </pattern>
        )}

        {/* Pattern: Hexagons */}
        {pattern === 'hexagons' && (
          <pattern
            id="canvas-bg-pattern"
            width={hexW}
            height={hexH}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={hexD}
              fill="none"
              stroke={patternColor}
              strokeWidth="1.2"
              strokeOpacity={patternOpacity}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </pattern>
        )}
      </defs>

      <rect
        id="canvas-pattern-plane"
        x={canvasBounds.minX}
        y={canvasBounds.minY}
        width={width}
        height={height}
        fill="url(#canvas-bg-pattern)"
        pointerEvents="none"
      />
    </>
  );
};
\\n

## src/components/organisms/canvas/CanvasContextMenu.tsx

\\tsx
import React from 'react';
import {
  Plus,
  FolderPlus,
  Edit2,
  Copy,
  Scissors,
  Clipboard,
  Link,
  Cloud,
  GitFork,
  MoveHorizontal,
  Trash2,
} from 'lucide-react';
import { MindMap } from '../../../types/mindmap';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export interface CanvasContextMenuProps {
  contextMenu: ContextMenuState;
  mindMap: MindMap;
  onClose: () => void;
  onAddChildNode: (nodeId: string) => void;
  onAddSiblingNode: (nodeId: string) => void;
  onStartEditing: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onCopyNode: (nodeId: string) => void;
  onCutNode: (nodeId: string) => void;
  onPasteNode: (nodeId: string) => void;
  onOpenConnectorModal: (nodeId: string) => void;
  onToggleCloud: (nodeId: string) => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  contextMenu,
  mindMap,
  onClose,
  onAddChildNode,
  onAddSiblingNode,
  onStartEditing,
  onDeleteNode,
  onCopyNode,
  onCutNode,
  onPasteNode,
  onOpenConnectorModal,
  onToggleCloud,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  if (!contextMenu.visible) return null;

  return (
    <div
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
      className="fixed z-50 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xl py-1.5 min-w-56 max-h-[calc(100vh-24px)] overflow-y-auto text-xs text-slate-700 font-medium animate-in fade-in zoom-in-95 duration-100 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.nodeId ? (
        <>
          <button
            type="button"
            onClick={() => {
              onAddChildNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Agregar Nodo Hijo
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Tab
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddSiblingNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" /> Agregar Nodo Hermano
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Enter
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onStartEditing(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Editar Texto
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              F2
            </kbd>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onCopyNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-slate-500" /> Copiar Rama
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Ctrl+C
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onCutNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-slate-500" /> Cortar Rama
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Ctrl+X
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onPasteNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5 text-slate-500" /> Pegar como Hijo
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Ctrl+V
            </kbd>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onOpenConnectorModal(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Link className="w-3.5 h-3.5 text-cyan-600" /> Crear Conector a otro nodo
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleCloud(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-500" /> Alternar Nube de Rama
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onApplyStyleToChildren?.(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <GitFork className="w-3.5 h-3.5 text-blue-600" /> Aplicar Estilo a Hijos
          </button>

          {contextMenu.nodeId !== mindMap.rootId && (
            <button
              type="button"
              onClick={() => {
                onApplyStyleToSiblings?.(contextMenu.nodeId!);
                onClose();
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <MoveHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Aplicar Estilo a Hermanos
            </button>
          )}

          {contextMenu.nodeId !== mindMap.rootId && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  onDeleteNode(contextMenu.nodeId!);
                  onClose();
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar Nodo
                </span>
                <kbd className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono">
                  Supr
                </kbd>
              </button>
            </>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            onAddChildNode(mindMap.rootId);
            onClose();
          }}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" /> Agregar Rama Principal
        </button>
      )}
    </div>
  );
};
\\n

## src/components/organisms/canvas/CanvasDrawingOverlay.tsx

\\tsx
import React from 'react';
import { SlideFrame } from '../../../types/mindmap';
import { Crop } from 'lucide-react';

export interface CanvasDrawingOverlayProps {
  slides: SlideFrame[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  editorTool: 'navigate' | 'pick_nodes' | 'draw_frame';
  isDrawingFrame: boolean;
  drawStart: { x: number; y: number } | null;
  drawCurrent: { x: number; y: number } | null;
}

export const CanvasDrawingOverlay: React.FC<CanvasDrawingOverlayProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  editorTool,
  isDrawingFrame,
  drawStart,
  drawCurrent,
}) => {
  return (
    <div id="canvas-drawing-overlay-plane" className="absolute inset-0 pointer-events-none">
      {/* Existing Slide Frames (pointer-events-none so nodes underneath are ALWAYS clickable) */}
      {slides.map((slide, idx) => {
        const isSelected = idx === currentSlideIndex;
        // Stagger badge horizontal offset so duplicate/close bounds don't stack directly over each other
        const badgeLeftOffset = 16 + ((slide.order - 1) % 4) * 32;

        return (
          <div
            key={`editor-frame-${slide.id}`}
            style={{
              transform: `translate3d(${slide.bounds.x}px, ${slide.bounds.y}px, 0)`,
              width: slide.bounds.width,
              height: slide.bounds.height,
              zIndex: isSelected ? 30 : 15,
            }}
            className={`absolute top-0 left-0 rounded-3xl border-2 transition-all select-none pointer-events-none ${
              isSelected
                ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_35px_rgba(59,130,246,0.3)] ring-2 ring-blue-400/50'
                : 'border-dashed border-slate-500/40 bg-slate-800/5'
            }`}
          >
            {/* Slide Order Badge (Clickable to select this frame without blocking nodes) */}
            <div
              style={{ left: `${badgeLeftOffset}px` }}
              onClick={(e) => {
                if (editorTool === 'draw_frame') return;
                e.stopPropagation();
                onSelectSlide(idx);
              }}
              title={`Marco ${slide.order}: ${slide.title} (Clic para enfocar)`}
              className={`absolute -top-3.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-md flex items-center gap-1 transition-all ${
                editorTool === 'draw_frame'
                  ? 'pointer-events-none'
                  : 'pointer-events-auto cursor-pointer hover:scale-105 active:scale-95'
              } ${
                isSelected
                  ? 'bg-blue-600 text-white scale-105 ring-2 ring-white/60 z-40'
                  : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 z-20'
              }`}
            >
              <span>Slide {slide.order}</span>
              {(isSelected || slides.length <= 8) && (
                <span className="opacity-80 max-w-[140px] truncate">• {slide.title}</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Drawn Box in Progress */}
      {editorTool === 'draw_frame' && isDrawingFrame && drawStart && drawCurrent && (
        <div
          style={{
            transform: `translate3d(${Math.min(drawStart.x, drawCurrent.x)}px, ${Math.min(drawStart.y, drawCurrent.y)}px, 0)`,
            width: Math.abs(drawCurrent.x - drawStart.x),
            height: Math.abs(drawCurrent.y - drawStart.y),
            zIndex: 40,
          }}
          className="absolute top-0 left-0 rounded-2xl border-2 border-blue-400 bg-blue-500/20 pointer-events-none border-dashed shadow-[0_0_25px_rgba(59,130,246,0.4)]"
        >
          <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-lg flex items-center gap-1">
            <Crop className="w-3 h-3" />
            <span>Nuevo marco ({Math.round(Math.abs(drawCurrent.x - drawStart.x))} × {Math.round(Math.abs(drawCurrent.y - drawStart.y))})</span>
          </div>
        </div>
      )}
    </div>
  );
};
\\n

## src/components/organisms/canvas/CanvasPresentationHUD.tsx

\\tsx
import React from 'react';
import {
  Layers,
  Sliders,
  Play,
  Undo2,
  Redo2,
  Trash2,
  RotateCcw,
  X,
  CheckSquare,
  Crop,
  MousePointer,
  Plus,
  FileText,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
} from 'lucide-react';

import { MindMap, MindNode, SlideFrame, CalculatedNodeLayout } from '../../../types/mindmap';
import { MarkdownView } from '../../../utils/markdownRenderer';

export interface CanvasPresentationHUDProps {
  mindMap: MindMap;
  layoutMap: Map<string, CalculatedNodeLayout>;
  slides: SlideFrame[];
  currentSlideIndex: number;
  activeSlide: SlideFrame;
  activeNode: MindNode | null;
  presMode: 'editor' | 'play';
  setPresMode: (mode: 'editor' | 'play') => void;
  editorTool: 'navigate' | 'pick_nodes' | 'draw_frame';
  setEditorTool: (tool: 'navigate' | 'pick_nodes' | 'draw_frame') => void;
  stagedNodeIds: Set<string>;
  setStagedNodeIds: (ids: Set<string>) => void;
  showNotesDrawer: boolean;
  setShowNotesDrawer: (show: boolean | ((prev: boolean) => boolean)) => void;
  isOverviewActive: boolean;
  setIsOverviewActive: (active: boolean) => void;
  isFilmstripOpen: boolean;
  setIsFilmstripOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  undoStack: SlideFrame[][];
  redoStack: SlideFrame[][];
  handleUndo: () => void;
  handleRedo: () => void;
  updateSlides: (slides: SlideFrame[]) => void;
  setCurrentSlideIndex: (idx: number) => void;
  handleNextSlide: () => void;
  handlePrevSlide: () => void;
  handleToggleOverview: () => void;
  onClosePresentation?: () => void;
  overviewBounds: { x: number; y: number; width: number; height: number };
  generateDefaultPresentationSlides: (map: MindMap, layout: Map<string, CalculatedNodeLayout>) => SlideFrame[];
}

export const CanvasPresentationHUD: React.FC<CanvasPresentationHUDProps> = ({
  mindMap,
  layoutMap,
  slides,
  currentSlideIndex,
  activeSlide,
  activeNode,
  presMode,
  setPresMode,
  editorTool,
  setEditorTool,
  stagedNodeIds,
  setStagedNodeIds,
  showNotesDrawer,
  setShowNotesDrawer,
  isOverviewActive,
  setIsOverviewActive,
  isFilmstripOpen,
  setIsFilmstripOpen,
  undoStack,
  redoStack,
  handleUndo,
  handleRedo,
  updateSlides,
  setCurrentSlideIndex,
  handleNextSlide,
  handlePrevSlide,
  handleToggleOverview,
  onClosePresentation,
  overviewBounds,
  generateDefaultPresentationSlides,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-50">
      {/* Top Presentation Bar */}
      <div className="pointer-events-auto h-14 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-xl border border-blue-500/30 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Presentación Dinámica</span>
          </div>
          <span className="text-sm font-semibold text-slate-300 truncate max-w-[260px] sm:max-w-md">
            {mindMap.title}
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPresMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              presMode === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editor de Marcos</span>
          </button>
          <button
            type="button"
            onClick={() => setPresMode('play')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              presMode === 'play' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Presentar (F5)</span>
          </button>
        </div>

        {/* Right Exit & Actions */}
        <div className="flex items-center gap-2">
          {presMode === 'editor' && (
            <>
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 mr-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Deshacer (Ctrl+Z)"
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Rehacer (Ctrl+Y / Ctrl+Shift+Z)"
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateSlides([]);
                  setCurrentSlideIndex(0);
                  setStagedNodeIds(new Set());
                }}
                title="Empezar desde cero (Eliminar todos los marcos)"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold transition-colors cursor-pointer border border-red-800/60"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Empezar de Cero</span>
              </button>


              <button
                type="button"
                onClick={() => {
                  const autoSlides = generateDefaultPresentationSlides(mindMap, layoutMap);
                  updateSlides(autoSlides);
                  setCurrentSlideIndex(0);
                }}
                title="Generar marcos según la jerarquía"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Auto-generar</span>
              </button>
            </>
          )}

          {onClosePresentation && (
            <button
              type="button"
              onClick={onClosePresentation}
              title="Salir de la presentación (ESC)"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Floating Tools Pill */}
      {presMode === 'editor' && (
        <div className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-2 text-xs z-40">
          <span className="text-slate-400 font-semibold mr-1">Crear marco:</span>
          <button
            type="button"
            onClick={() => setEditorTool('pick_nodes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              editorTool === 'pick_nodes' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>1. Seleccionar Nodo (Crear Marco)</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorTool('draw_frame')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              editorTool === 'draw_frame' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>2. Dibujar Recuadro</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorTool('navigate')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              editorTool === 'navigate' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Navegar / Mover</span>
          </button>

          {editorTool === 'pick_nodes' && (
            <span className="text-[11px] text-blue-300 font-medium bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 flex items-center gap-1.5 animate-pulse">
              <span>👆 Haz clic en cualquier nodo para crear un marco automáticamente</span>
            </span>
          )}


          {stagedNodeIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-blue-300 font-bold bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30 text-xs flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>{stagedNodeIds.size} seleccionados</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  let minX = Infinity;
                  let minY = Infinity;
                  let maxX = -Infinity;
                  let maxY = -Infinity;
                  const selectedIds: string[] = Array.from(stagedNodeIds);
                  selectedIds.forEach((nid) => {
                    const l = layoutMap.get(nid);
                    if (l) {
                      minX = Math.min(minX, l.x);
                      maxX = Math.max(maxX, l.x + l.width);
                      minY = Math.min(minY, l.y);
                      maxY = Math.max(maxY, l.y + l.height);
                    }
                  });
                  if (minX === Infinity) return;
                  const pad = 30;
                  const firstNode = mindMap.nodes[selectedIds[0]];
                  const newSlide: SlideFrame = {
                    id: `slide-custom-${Date.now()}`,
                    order: slides.length + 1,
                    title: firstNode?.text ? `Marco: ${firstNode.text}` : `Marco ${slides.length + 1}`,
                    type: 'custom_area',
                    nodeIds: selectedIds,
                    nodeId: selectedIds[0],
                    bounds: {
                      x: Math.round(minX - pad),
                      y: Math.round(minY - pad),
                      width: Math.max(160, Math.round(maxX - minX + pad * 2)),
                      height: Math.max(100, Math.round(maxY - minY + pad * 2)),
                    },
                    showNotes: selectedIds.some((id) => Boolean(mindMap.nodes[id]?.note)),
                    color: '#3b82f6',
                  };
                  updateSlides([...slides, newSlide]);
                  setCurrentSlideIndex(slides.length);
                  setStagedNodeIds(new Set());
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-md cursor-pointer hover:bg-blue-500 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Marco</span>
              </button>
              <button
                type="button"
                onClick={() => setStagedNodeIds(new Set())}
                title="Deseleccionar todos"
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* Empty State Banner for Custom Presentation Creation */}
      {presMode === 'editor' && slides.length === 0 && (
        <div className="pointer-events-auto absolute top-28 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-slate-900/95 border border-blue-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-4 text-slate-200 z-40 max-w-lg text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white mb-0.5">Lienzo en Blanco (0 marcos)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Haz clic en los nodos con <strong>1. Seleccionar Nodos</strong> para agruparlos o arrastra sobre el lienzo con <strong>2. Dibujar Recuadro</strong> para crear tu primera diapositiva.
            </p>
          </div>
        </div>
      )}


      {/* Notes Slide Floating Modal / Drawer */}
      {(() => {
        let noteContent = activeNode?.note;
        let noteTitle = activeNode?.text;
        if (!noteContent && activeSlide?.nodeId && mindMap.nodes[activeSlide.nodeId]?.note) {
          noteContent = mindMap.nodes[activeSlide.nodeId].note;
          noteTitle = mindMap.nodes[activeSlide.nodeId].text;
        }
        if (!noteContent && activeSlide?.nodeIds && activeSlide.nodeIds.length > 0) {
          for (const nid of activeSlide.nodeIds) {
            if (mindMap.nodes[nid]?.note) {
              noteContent = mindMap.nodes[nid].note;
              noteTitle = mindMap.nodes[nid].text;
              break;
            }
          }
        }

        if (!showNotesDrawer || !noteContent) return null;

        return (
          <div className="pointer-events-auto absolute top-20 right-6 sm:right-10 w-84 sm:w-96 max-h-[70vh] bg-slate-900/98 backdrop-blur-xl rounded-2xl border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] p-4 flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Nota Detallada</span>
                </span>
                {noteTitle && <span className="truncate max-w-[160px] text-slate-300">({noteTitle})</span>}
              </div>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-1 text-xs space-y-2 leading-relaxed text-slate-200">
              <MarkdownView content={noteContent} isDark={true} />
            </div>
          </div>
        );
      })()}

      {/* Bottom Filmstrip & Controls HUD */}
      <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex flex-col z-30 shadow-2xl">
        {/* Progress Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            style={{
              width: `${((currentSlideIndex + 1) / Math.max(1, slides.length)) * 100}%`,
            }}
            className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          />
        </div>

        {/* Filmstrip Bar */}
        {isFilmstripOpen && (
          <div className="px-4 py-2 overflow-x-auto flex items-center gap-2 border-b border-slate-800/80 scrollbar-thin">
            {slides.map((s, idx) => {
              const isCurrent = idx === currentSlideIndex;
              return (
                <div
                  key={`thumb-${s.id}`}
                  onClick={() => {
                    setIsOverviewActive(false);
                    setCurrentSlideIndex(idx);
                  }}
                  className={`group relative shrink-0 px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold shadow-md'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-700 group-hover:bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {s.order}
                  </span>
                  <span className="text-xs max-w-[130px] truncate">{s.title}</span>
                  {presMode === 'editor' && slides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = slides.filter((_, i) => i !== idx).map((item, i) => ({ ...item, order: i + 1 }));
                        updateSlides(updated);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="h-12 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-white font-mono">
              {slides.length > 0 ? currentSlideIndex + 1 : 0} / {slides.length}
            </span>
            <span className="opacity-50">|</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{activeSlide?.title || 'Sin marcos'}</span>
          </div>


          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevSlide}
              title="Anterior (← o Retroceso)"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleToggleOverview}
              title={isOverviewActive ? 'Volver al foco' : 'Vista General (O / Home)'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isOverviewActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNextSlide}
              title="Siguiente (→ o Espacio)"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            {activeNode?.note && (
              <button
                type="button"
                onClick={() => setShowNotesDrawer((prev) => !prev)}
                title="Notas del Orador (N)"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showNotesDrawer ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFilmstripOpen((prev) => !prev)}
              title="Tira de Diapositivas"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
\\n

## src/components/organisms/toolpanel/CloudsTab.tsx

\\tsx
import React from 'react';
import { MindNode, CloudShape, NodePatternStyle, NodeGradientDirection, NodeBgImageMode } from '../../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import {
  Cloud,
  Layers,
  Sparkles,
  Paintbrush,
  Square,
  Circle,
  Hexagon,
  Star,
  MessageSquare,
} from 'lucide-react';

interface CloudsTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

const CLOUD_SHAPES: { id: CloudShape; name: string; icon: React.ReactNode }[] = [
  { id: 'cloud-scallop', name: 'Nube', icon: <Cloud className="w-4 h-4" /> },
  { id: 'arc', name: 'Arco', icon: <Circle className="w-4 h-4" /> },
  { id: 'round-rectangle', name: 'Redondeado', icon: <Square className="w-4 h-4 rounded-md" /> },
  { id: 'rectangle', name: 'Rectángulo', icon: <Square className="w-4 h-4" /> },
  { id: 'bubble', name: 'Burbuja', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'oval', name: 'Óvalo', icon: <Circle className="w-4 h-4 scale-x-125" /> },
  { id: 'hexagon', name: 'Hexágono', icon: <Hexagon className="w-4 h-4" /> },
  { id: 'star', name: 'Estrella', icon: <Star className="w-4 h-4" /> },
];

export const CloudsTab: React.FC<CloudsTabProps> = ({ selectedNode, onUpdateNode }) => {
  const isCloudEnabled = Boolean(selectedNode.cloud?.enabled);
  const currentCloud = selectedNode.cloud || {
    enabled: false,
    color: '#3b82f6',
    shape: 'cloud-scallop',
    opacity: 0.08,
    bgType: 'color',
    borderColor: '#3b82f6',
    borderWidth: 1.5,
    borderDash: 'dashed',
    shadow: true,
  };

  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    shape: true,
    fill: false,
    border: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      shape: expand,
      fill: expand,
      border: expand,
    });
  };

  const handleToggleCloud = () => {
    if (isCloudEnabled) {
      onUpdateNode(selectedNode.id, { cloud: undefined });
    } else {
      onUpdateNode(selectedNode.id, {
        cloud: {
          enabled: true,
          color: '#3b82f6',
          shape: 'cloud-scallop',
          opacity: 0.08,
          bgType: 'color',
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderDash: 'dashed',
          shadow: true,
        },
      });
    }
  };

  const updateCloudProps = (updates: Partial<typeof currentCloud>) => {
    onUpdateNode(selectedNode.id, {
      cloud: {
        ...currentCloud,
        enabled: true,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Interruptor maestro de nube */}
      <div className="flex items-center justify-between p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-blue-600" />
          <div>
            <span className="font-semibold text-xs text-blue-900 block">Nube de Agrupación</span>
            <span className="text-[10px] text-blue-600 font-normal">
              Envuelve visualmente este nodo y sus descendientes
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleCloud}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isCloudEnabled ? 'bg-blue-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isCloudEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {isCloudEnabled && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Barra superior de plegar / desplegar */}
          <div className="flex items-center justify-between pb-0.5">
            <span className="text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider">
              Formato de la Nube
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

          {/* 1. Forma y Dimensiones de la Nube */}
          <CollapsibleSection
            title="Forma y Márgenes"
            subtitle="Geometría y tamaño de envolvente"
            isOpen={sectionsOpen.shape}
            onToggle={() => toggleSection('shape')}
            icon={<Square className="w-3.5 h-3.5" />}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {CLOUD_SHAPES.map((s) => {
                const isSelected = (currentCloud.shape || 'cloud-scallop') === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={s.name}
                    onClick={() => updateCloudProps({ shape: s.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.icon}
                    <span className="text-[9.5px] mt-1 truncate w-full text-center">{s.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-3">
              <SliderInput
                label="Margen Horizontal Extra"
                value={currentCloud.paddingX || 0}
                min={-50}
                max={200}
                step={5}
                unit="px"
                onChange={(px) => updateCloudProps({ paddingX: px })}
                onReset={() => updateCloudProps({ paddingX: undefined })}
              />

              <SliderInput
                label="Margen Vertical Extra"
                value={currentCloud.paddingY || 0}
                min={-50}
                max={200}
                step={5}
                unit="px"
                onChange={(py) => updateCloudProps({ paddingY: py })}
                onReset={() => updateCloudProps({ paddingY: undefined })}
              />
            </div>
          </CollapsibleSection>

          {/* 2. Relleno y Color */}
          <CollapsibleSection
            title="Relleno de la Nube"
            subtitle="Color y transparencia de fondo"
            isOpen={sectionsOpen.fill}
            onToggle={() => toggleSection('fill')}
            icon={<Paintbrush className="w-3.5 h-3.5" />}
          >
            <div className="space-y-3">
              <ColorPicker
                label="Color de Nube"
                value={currentCloud.color || '#3b82f6'}
                onChange={(color) => updateCloudProps({ color })}
              />

              <SliderInput
                label="Opacidad de Fondo"
                value={Math.round((currentCloud.opacity !== undefined ? currentCloud.opacity : 0.08) * 100)}
                min={0}
                max={100}
                unit="%"
                onChange={(op) => updateCloudProps({ opacity: op / 100 })}
              />
            </div>
          </CollapsibleSection>

          {/* 3. Borde y Sombra */}
          <CollapsibleSection
            title="Borde y Sombra"
            subtitle="Contorno de la agrupación"
            isOpen={sectionsOpen.border}
            onToggle={() => toggleSection('border')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            <div className="space-y-3">
              <ColorPicker
                label="Color de Borde"
                value={currentCloud.borderColor || '#3b82f6'}
                onChange={(bc) => updateCloudProps({ borderColor: bc })}
              />

              <SliderInput
                label="Grosor de Borde"
                value={currentCloud.borderWidth !== undefined ? currentCloud.borderWidth : 1.5}
                min={0}
                max={6}
                step={0.5}
                unit="px"
                onChange={(bw) => updateCloudProps({ borderWidth: bw })}
              />

              <span className="text-[11px] font-semibold text-slate-600 block">Estilo de Línea</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'solid' as const, label: 'Sólido', stroke: 'border-solid' },
                  { id: 'dashed' as const, label: 'Guiones', stroke: 'border-dashed' },
                  { id: 'dotted' as const, label: 'Puntos', stroke: 'border-dotted' },
                ].map((dash) => {
                  const isSelected = (currentCloud.borderDash || 'dashed') === dash.id;
                  return (
                    <button
                      key={dash.id}
                      type="button"
                      onClick={() => updateCloudProps({ borderDash: dash.id })}
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
        </div>
      )}
    </div>
  );
};
\\n

## src/components/organisms/toolpanel/ContentTab.tsx

\\tsx
import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { ToggleButtonGroup } from '../../atoms/ToggleButtonGroup';
import { FontFormatToolbar } from '../../molecules/FontFormatToolbar';
import { TagManager } from '../../molecules/TagManager';
import {
  Type,
  FileText,
  Image as ImageIcon,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Smile,
  Minus,
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  FoldVertical,
  Maximize2,
} from 'lucide-react';

interface ContentTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onOpenIconPackModal?: () => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({
  selectedNode,
  onUpdateNode,
  onOpenIconPackModal,
}) => {
  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    title: true,
    body: false,
    image: false,
    metadata: false,
  });

  const toggleSection = (s: string) => {
    setSectionsOpen((prev) => ({ ...prev, [s]: !prev[s] }));
  };

  const handleExpandAll = (expand: boolean) => {
    setSectionsOpen({
      title: expand,
      body: expand,
      image: expand,
      metadata: expand,
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Barra superior de plegar / desplegar */}
      <div className="flex items-center justify-between pb-0.5">
        <span className="text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider">
          Secciones de Contenido
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

      {/* 1. Título del Nodo */}
      <CollapsibleSection
        title="Título del Nodo"
        subtitle="Texto principal y tipografía"
        isOpen={sectionsOpen.title}
        onToggle={() => toggleSection('title')}
        icon={<Type className="w-3.5 h-3.5" />}
        badge={
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            {selectedNode.fontSize || 14}px
          </span>
        }
      >
        <textarea
          value={selectedNode.text}
          onChange={(e) => onUpdateNode(selectedNode.id, { text: e.target.value })}
          rows={2}
          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 resize-y shadow-2xs"
          placeholder="Escribe el título..."
        />

        <div className="space-y-2 pt-1 border-t border-slate-200/80">
          <FontFormatToolbar
            bold={selectedNode.bold}
            italic={selectedNode.italic}
            align={selectedNode.textAlign || 'left'}
            onToggleBold={() => onUpdateNode(selectedNode.id, { bold: !selectedNode.bold })}
            onToggleItalic={() => onUpdateNode(selectedNode.id, { italic: !selectedNode.italic })}
            onChangeAlign={(align) => onUpdateNode(selectedNode.id, { textAlign: align })}
          />

          <ColorPicker
            label="Color del Texto"
            value={selectedNode.textColor}
            onChange={(c) => onUpdateNode(selectedNode.id, { textColor: c })}
            onClear={() => onUpdateNode(selectedNode.id, { textColor: undefined })}
          />

          <SliderInput
            label="Tamaño de Fuente"
            value={selectedNode.fontSize || 14}
            min={10}
            max={36}
            unit="px"
            onChange={(s) => onUpdateNode(selectedNode.id, { fontSize: s })}
            onReset={() => onUpdateNode(selectedNode.id, { fontSize: undefined })}
          />
        </div>
      </CollapsibleSection>

      {/* 2. Cuerpo / Subtexto */}
      <CollapsibleSection
        title="Cuerpo / Subtexto"
        subtitle="Descripción adicional del nodo"
        isOpen={sectionsOpen.body}
        onToggle={() => toggleSection('body')}
        icon={<FileText className="w-3.5 h-3.5" />}
        action={
          selectedNode.body ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateNode(selectedNode.id, { hideBody: !selectedNode.hideBody });
              }}
              title={selectedNode.hideBody ? 'Mostrar cuerpo en el lienzo' : 'Ocultar cuerpo en el lienzo'}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                selectedNode.hideBody
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {selectedNode.hideBody ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          ) : undefined
        }
        badge={
          selectedNode.body ? (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              selectedNode.hideBody ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'
            }`}>
              {selectedNode.hideBody ? 'Oculto' : 'Activo'}
            </span>
          ) : undefined
        }
      >
        <textarea
          value={selectedNode.body || ''}
          onChange={(e) => onUpdateNode(selectedNode.id, { body: e.target.value || undefined })}
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 resize-y shadow-2xs"
          placeholder="Escribe detalles o párrafos explicativos..."
        />

        {selectedNode.body && (
          <div className="space-y-2 pt-1 border-t border-slate-200/80">
            <FontFormatToolbar
              bold={selectedNode.bodyBold}
              italic={selectedNode.bodyItalic}
              align={selectedNode.bodyAlign || 'left'}
              onToggleBold={() => onUpdateNode(selectedNode.id, { bodyBold: !selectedNode.bodyBold })}
              onToggleItalic={() => onUpdateNode(selectedNode.id, { bodyItalic: !selectedNode.bodyItalic })}
              onChangeAlign={(align) => onUpdateNode(selectedNode.id, { bodyAlign: align })}
            />

            <ColorPicker
              label="Color del Cuerpo"
              value={selectedNode.bodyColor}
              onChange={(c) => onUpdateNode(selectedNode.id, { bodyColor: c })}
              onClear={() => onUpdateNode(selectedNode.id, { bodyColor: undefined })}
            />

            <SliderInput
              label="Tamaño del Cuerpo"
              value={selectedNode.bodyFontSize || 12}
              min={9}
              max={24}
              unit="px"
              onChange={(s) => onUpdateNode(selectedNode.id, { bodyFontSize: s })}
              onReset={() => onUpdateNode(selectedNode.id, { bodyFontSize: undefined })}
            />
          </div>
        )}
      </CollapsibleSection>

      {/* 3. Imagen de Contenido */}
      <CollapsibleSection
        title="Imagen Adjunta"
        subtitle="Ilustración dentro del nodo"
        isOpen={sectionsOpen.image}
        onToggle={() => toggleSection('image')}
        icon={<ImageIcon className="w-3.5 h-3.5" />}
        action={
          selectedNode.imageUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateNode(selectedNode.id, { hideImage: !selectedNode.hideImage });
              }}
              title={selectedNode.hideImage ? 'Mostrar imagen en el lienzo' : 'Ocultar imagen en el lienzo'}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                selectedNode.hideImage
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {selectedNode.hideImage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          ) : undefined
        }
        badge={
          selectedNode.imageUrl ? (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              selectedNode.hideImage ? 'text-amber-700 bg-amber-100' : 'text-blue-700 bg-blue-100'
            }`}>
              {selectedNode.hideImage ? 'Oculta' : 'Activa'}
            </span>
          ) : undefined
        }
      >
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="URL de la imagen (https://...)"
              value={selectedNode.imageUrl || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { imageUrl: e.target.value || undefined })}
              className="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
            />
            {/* Botón Examinar Archivo Local */}
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
                        onUpdateNode(selectedNode.id, { imageUrl: result, imagePosition: selectedNode.imagePosition || 'top' });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>

            {selectedNode.imageUrl && (
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { imageUrl: undefined, imagePosition: undefined, imageWidth: undefined, imageHeight: undefined })}
                title="Eliminar imagen adjunta"
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200/80 shrink-0 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedNode.imageUrl && (
            <div className="space-y-2.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-600 block">Posición de Imagen</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'top' as const, label: 'Arriba', icon: <ArrowUp className="w-3.5 h-3.5" /> },
                  { id: 'between' as const, label: 'Entre texto', icon: <FoldVertical className="w-3.5 h-3.5" /> },
                  { id: 'bottom' as const, label: 'Abajo', icon: <ArrowDown className="w-3.5 h-3.5" /> },
                  { id: 'left' as const, label: 'Izquierda', icon: <ArrowLeft className="w-3.5 h-3.5" /> },
                  { id: 'right' as const, label: 'Derecha', icon: <ArrowRight className="w-3.5 h-3.5" /> },
                  { id: 'fit' as const, label: 'Ajustar', icon: <Maximize2 className="w-3.5 h-3.5" /> },
                ].map((opt) => {
                  const isSelected = (selectedNode.imagePosition || 'top') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateNode(selectedNode.id, { imagePosition: opt.id })}
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

              <SliderInput
                label="Ancho de imagen"
                value={selectedNode.imageWidth || 140}
                min={60}
                max={500}
                step={10}
                unit="px"
                onChange={(w) => onUpdateNode(selectedNode.id, { imageWidth: w })}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 4. Metadatos (Tags, Enlace, Progreso, Iconos) */}
      <CollapsibleSection
        title="Metadatos y Visibilidad"
        subtitle="Tags, enlace, progreso e iconos"
        isOpen={sectionsOpen.metadata}
        onToggle={() => toggleSection('metadata')}
        icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
      >
        <div className="space-y-3">
          {/* Tags */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Etiquetas (Tags)</span>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { hideTags: !selectedNode.hideTags })}
                  title={selectedNode.hideTags ? 'Mostrar etiquetas en nodo' : 'Ocultar etiquetas en nodo'}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedNode.hideTags ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {selectedNode.hideTags ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{selectedNode.hideTags ? 'Oculto' : 'Visible'}</span>
                </button>
              )}
            </div>
            <TagManager
              tags={selectedNode.tags}
              onAddTag={(tag) => onUpdateNode(selectedNode.id, { tags: [...(selectedNode.tags || []), tag] })}
              onRemoveTag={(tag) =>
                onUpdateNode(selectedNode.id, {
                  tags: (selectedNode.tags || []).filter((t) => t !== tag),
                })
              }
            />
          </div>

          {/* Enlace */}
          <div className="space-y-1 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Enlace Web</span>
              {selectedNode.link && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { hideLink: !selectedNode.hideLink })}
                  title={selectedNode.hideLink ? 'Mostrar enlace en nodo' : 'Ocultar enlace en nodo'}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedNode.hideLink ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {selectedNode.hideLink ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{selectedNode.hideLink ? 'Oculto' : 'Visible'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="https://ejemplo.com"
                value={selectedNode.link || ''}
                onChange={(e) => onUpdateNode(selectedNode.id, { link: e.target.value || undefined })}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Progreso */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Barra de Progreso</span>
              {selectedNode.progress !== undefined && (
                <button
                  type="button"
                  onClick={() => onUpdateNode(selectedNode.id, { hideProgress: !selectedNode.hideProgress })}
                  title={selectedNode.hideProgress ? 'Mostrar progreso en nodo' : 'Ocultar progreso en nodo'}
                  className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    selectedNode.hideProgress ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {selectedNode.hideProgress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{selectedNode.hideProgress ? 'Oculto' : 'Visible'}</span>
                </button>
              )}
            </div>
            <SliderInput
              label="Porcentaje"
              value={selectedNode.progress || 0}
              min={0}
              max={100}
              step={5}
              unit="%"
              badge={selectedNode.progress !== undefined ? `${selectedNode.progress}%` : 'Sin asignar'}
              onChange={(p) => onUpdateNode(selectedNode.id, { progress: p })}
              onReset={() => onUpdateNode(selectedNode.id, { progress: undefined })}
            />
          </div>

          {/* Iconos Activos y Visibilidad */}
          {selectedNode.icons && selectedNode.icons.length > 0 && (
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">
                Iconos ({selectedNode.icons.length})
              </span>
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { hideIcons: !selectedNode.hideIcons })}
                title={selectedNode.hideIcons ? 'Mostrar iconos en nodo' : 'Ocultar iconos en nodo'}
                className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  selectedNode.hideIcons ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {selectedNode.hideIcons ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{selectedNode.hideIcons ? 'Ocultos' : 'Visibles'}</span>
              </button>
            </div>
          )}

          {/* Icon Pack Modal Trigger */}
          {onOpenIconPackModal && (
            <div className="pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={onOpenIconPackModal}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-200/80 shadow-2xs"
              >
                <Smile className="w-4 h-4" />
                <span>Abrir Galería de Iconos</span>
              </button>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};
\\n

## src/components/organisms/toolpanel/FormatTab.tsx

\\tsx
import React from 'react';
import { NodeShape, NodeBackgroundType, NodeGradientDirection, NodePatternStyle, NodeBgImageMode, EdgeStyle, EdgeProfile, MindNode } from '../../../types/mindmap';
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
  Upload,
  Trash2,
  Image as ImageIcon,
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
\\n

## src/components/organisms/toolpanel/IconsTab.tsx

\\tsx
import React, { useState, useMemo } from 'react';
import { MindNode } from '../../../types/mindmap';
import {
  VECTOR_ICON_PACK,
  VECTOR_ICON_CATEGORIES,
  VectorIconCategory,
  searchVectorIcons,
  TOTAL_VECTOR_ICONS_COUNT,
} from '../../../utils/vectorIconPack';
import { renderNodeIcon } from '../../../utils/iconMap';
import { ColorPicker } from '../../atoms/ColorPicker';
import { SliderInput } from '../../atoms/SliderInput';
import { CollapsibleSection } from '../../atoms/CollapsibleSection';
import { Search, Sparkles, X, Palette } from 'lucide-react';

interface IconsTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onOpenIconPackModal?: () => void;
  onApplyIconsToChildren?: (nodeId: string) => void;
  onApplyIconsToSiblings?: (nodeId: string) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🌟',
  priority_status: '🎯',
  business_finance: '💼',
  tech_code: '💻',
  communication: '💬',
  design_media: '🎨',
  education_science: '🎓',
  navigation_maps: '🧭',
  documents_files: '📁',
  nature_weather: '☀️',
  tools_security: '🛡️',
  health_sports: '🏃',
  emojis_symbols: '✨',
};

const QUICK_SEARCH_TAGS = [
  { label: '🎯 Prioridad', query: 'prioridad' },
  { label: '✓ Check', query: 'check' },
  { label: '⚠ Alerta', query: 'alerta' },
  { label: '★ Estrella', query: 'estrella' },
  { label: '👤 Usuario', query: 'usuario' },
  { label: '➔ Flecha', query: 'flecha' },
  { label: '💰 Dinero', query: 'dinero' },
  { label: '📁 Archivo', query: 'archivo' },
];

export const IconsTab: React.FC<IconsTabProps> = ({
  selectedNode,
  onUpdateNode,
  onOpenIconPackModal,
  onApplyIconsToChildren,
  onApplyIconsToSiblings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<VectorIconCategory | 'all'>('all');
  const [isStyleSectionOpen, setIsStyleSectionOpen] = useState(true);

  const filteredIcons = useMemo(() => {
    return searchVectorIcons(searchQuery, category);
  }, [searchQuery, category]);

  const handleToggleIcon = (iconId: string) => {
    const current = selectedNode.icons || [];
    const updated = current.includes(iconId)
      ? current.filter((id) => id !== iconId)
      : [...current, iconId];
    onUpdateNode(selectedNode.id, { icons: updated });
  };

  const handleRemoveIcon = (iconId: string) => {
    const current = selectedNode.icons || [];
    onUpdateNode(selectedNode.id, {
      icons: current.filter((id) => id !== iconId),
    });
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Sección Plegable de Estilo y Tamaño de Iconos */}
      <CollapsibleSection
        title="Color y Tamaño de Iconos"
        subtitle="Personalizar tinte, escala y propagación"
        isOpen={isStyleSectionOpen}
        onToggle={() => setIsStyleSectionOpen((prev) => !prev)}
        icon={<Palette className="w-3.5 h-3.5" />}
        badge={
          selectedNode.iconColor ? (
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block"
              style={{ backgroundColor: selectedNode.iconColor }}
            />
          ) : undefined
        }
      >
        <div className="space-y-3">
          {/* Selector de Color */}
          <ColorPicker
            label="Tinte del Icono"
            value={selectedNode.iconColor}
            onChange={(color) => onUpdateNode(selectedNode.id, { iconColor: color })}
            onClear={() => onUpdateNode(selectedNode.id, { iconColor: undefined })}
          />

          {/* Paleta rápida de colores populares para iconos */}
          <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto pb-0.5">
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Sugeridos:</span>
            {[
              { col: '#ef4444', label: 'Rojo' },
              { col: '#f59e0b', label: 'Ámbar' },
              { col: '#10b981', label: 'Verde' },
              { col: '#3b82f6', label: 'Azul' },
              { col: '#8b5cf6', label: 'Púrpura' },
              { col: '#ec4899', label: 'Rosa' },
              { col: '#475569', label: 'Pizarra' },
            ].map((item) => (
              <button
                key={item.col}
                type="button"
                title={item.label}
                onClick={() => onUpdateNode(selectedNode.id, { iconColor: item.col })}
                className="w-4.5 h-4.5 rounded-full shrink-0 border border-slate-300 transition-transform hover:scale-115 cursor-pointer shadow-2xs"
                style={{ backgroundColor: item.col }}
              />
            ))}
            {selectedNode.iconColor && (
              <button
                type="button"
                onClick={() => onUpdateNode(selectedNode.id, { iconColor: undefined })}
                className="text-[10px] text-slate-400 hover:text-slate-600 underline ml-auto shrink-0 cursor-pointer"
              >
                Original
              </button>
            )}
          </div>

          {/* Barra deslizante para cambiar el tamaño de los iconos */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <SliderInput
              label="Tamaño del Icono"
              value={selectedNode.iconSize || 14}
              min={10}
              max={36}
              step={1}
              unit="px"
              badge={selectedNode.iconSize ? `${selectedNode.iconSize}px` : '14px (Estándar)'}
              onChange={(sz) => onUpdateNode(selectedNode.id, { iconSize: sz })}
              onReset={() => onUpdateNode(selectedNode.id, { iconSize: undefined })}
            />
          </div>

          {/* Propagación exclusiva de iconos, tamaño y color a hijos o hermanos */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
            <span className="text-[10.5px] font-semibold text-slate-600 block">Propagación de Iconos</span>
            <div className="grid grid-cols-2 gap-1.5">
              {onApplyIconsToChildren && (
                <button
                  type="button"
                  onClick={() => onApplyIconsToChildren(selectedNode.id)}
                  className="py-1.5 px-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10.5px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer text-center"
                >
                  Copiar a Hijos
                </button>
              )}
              {onApplyIconsToSiblings && (
                <button
                  type="button"
                  onClick={() => onApplyIconsToSiblings(selectedNode.id)}
                  className="py-1.5 px-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10.5px] font-semibold hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Copiar a Hermanos
                </button>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Iconos actualmente asignados al nodo */}
      {selectedNode.icons && selectedNode.icons.length > 0 && (
        <div className="space-y-1.5 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-900">Iconos Asignados</span>
            <button
              type="button"
              onClick={() => onUpdateNode(selectedNode.id, { icons: [] })}
              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
            >
              Quitar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {selectedNode.icons.map((iconId) => (
              <span
                key={iconId}
                className="inline-flex items-center gap-1 bg-white border border-blue-200 px-2 py-1 rounded-lg text-xs shadow-2xs"
              >
                <span>{renderNodeIcon(iconId, 'w-3.5 h-3.5', selectedNode.iconColor)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIcon(iconId)}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buscador de iconos */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Buscar entre ${TOTAL_VECTOR_ICONS_COUNT}+ iconos...`}
          className="w-full bg-white border border-slate-200 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Categorías en chip scroll */}
      <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
            category === 'all'
              ? 'bg-blue-600 text-white font-semibold border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          🌟 Todos
        </button>
        {VECTOR_ICON_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap cursor-pointer transition-all ${
              category === cat.id
                ? 'bg-blue-600 text-white font-semibold border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {CATEGORY_EMOJIS[cat.id] || '•'} {cat.name}
          </button>
        ))}
      </div>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap gap-1">
        {QUICK_SEARCH_TAGS.map((t) => (
          <button
            key={t.query}
            type="button"
            onClick={() => setSearchQuery(t.query)}
            className="text-[10px] bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full cursor-pointer transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid de iconos */}
      <div className="grid grid-cols-6 gap-1.5 max-h-[300px] overflow-y-auto p-1 bg-slate-50/60 rounded-xl border border-slate-200/80">
        {filteredIcons.slice(0, 120).map((icon) => {
          const isSelected = selectedNode.icons?.includes(icon.id);
          return (
            <button
              key={icon.id}
              type="button"
              title={icon.name}
              onClick={() => handleToggleIcon(icon.id)}
              className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-2xs scale-105 ring-2 ring-blue-400'
                  : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200/80 hover:border-blue-300'
              }`}
            >
              {renderNodeIcon(icon.id)}
            </button>
          );
        })}
      </div>

      {/* Modal Trigger para el pack completo */}
      {onOpenIconPackModal && (
        <button
          type="button"
          onClick={onOpenIconPackModal}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-blue-200 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ver Galería Completa de Iconos</span>
        </button>
      )}
    </div>
  );
};
\\n

## src/components/organisms/toolpanel/NotesTab.tsx

\\tsx
import React, { useState } from 'react';
import { MindNode } from '../../../types/mindmap';
import { MarkdownView } from '../../../utils/markdownRenderer';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Heading1,
  Heading2,
  Columns,
  Eye,
  Edit3,
  LayoutList,
  MessageSquareOff,
} from 'lucide-react';

interface NotesTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ selectedNode, onUpdateNode }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'edit' | 'split'>('preview');

  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const currentNote = selectedNode.note || '';
    const textarea = document.getElementById('node-note-textarea') as HTMLTextAreaElement | null;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = currentNote.substring(start, end) || defaultPlaceholder;
      const replacement = prefix + selectedText + suffix;
      const newText = currentNote.substring(0, start) + replacement + currentNote.substring(end);
      onUpdateNode(selectedNode.id, { note: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }, 0);
    } else {
      onUpdateNode(selectedNode.id, {
        note: (currentNote ? currentNote + '\n' : '') + prefix + defaultPlaceholder + suffix,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Selector de modo de vista y Toggle Mostrar debajo del cuerpo */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200 gap-2 flex-wrap">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
          Nota Markdown
        </span>
        <div className="flex items-center gap-1.5">
          {/* Botón: Mostrar debajo del cuerpo / Desactivar Tooltip */}
          <button
            type="button"
            onClick={() =>
              onUpdateNode(selectedNode.id, {
                showNoteInline: !selectedNode.showNoteInline,
              })
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer border shadow-2xs ${
              selectedNode.showNoteInline
                ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={
              selectedNode.showNoteInline
                ? 'Nota visible debajo del cuerpo en el lienzo (Tooltips desactivados)'
                : 'Mostrar nota debajo del cuerpo del nodo (Desactiva tooltips)'
            }
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{selectedNode.showNoteInline ? 'Debajo del Cuerpo ✓' : 'Mostrar en Nodo'}</span>
          </button>

          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'edit' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Solo editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista dividida"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'preview' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Solo vista previa"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar de formato Markdown */}
      {(viewMode === 'edit' || viewMode === 'split') && (
        <div className="flex items-center gap-1 flex-wrap bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => handleInsertMarkdown('**', '**', 'negrita')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Negrita"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('*', '*', 'cursiva')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Cursiva"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('# ', '', 'Encabezado 1')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="H1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('## ', '', 'Encabezado 2')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="H2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('- ', '', 'Elemento')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Lista con viñetas"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('1. ', '', 'Elemento')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Lista numerada"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('- [ ] ', '', 'Tarea')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Casilla de verificación"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('`', '`', 'código')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Código en línea"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('> ', '', 'Cita')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Cita"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor & Preview */}
      <div className="space-y-3">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <textarea
            id="node-note-textarea"
            value={selectedNode.note || ''}
            onChange={(e) => onUpdateNode(selectedNode.id, { note: e.target.value })}
            rows={viewMode === 'split' ? 6 : 12}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono resize-y shadow-2xs leading-relaxed"
            placeholder="Escribe notas en formato Markdown aquí..."
          />
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs min-h-[120px] max-h-[350px] overflow-y-auto">
            {selectedNode.note ? (
              <MarkdownView content={selectedNode.note} />
            ) : (
              <p className="text-slate-400 italic text-center py-6 text-xs">
                Sin notas aún. Cambia al modo editor para escribir.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
\\n

## src/components/organisms/toolpanel/ThemeTab.tsx

\\tsx
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
  onApplyEdgeStyleToAllNodes?: (edgeStyle: EdgeStyle) => void;
  onApplyEdgeProfileToAllNodes?: (edgeProfile: EdgeProfile) => void;
  onRandomizeEdgeColors?: () => void;
  onUpdateMapGaps?: (gaps: { horizontal?: number; vertical?: number }) => void;
  onOpenConnectorModal?: (fromId?: string) => void;
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
  onApplyEdgeStyleToAllNodes,
  onApplyEdgeProfileToAllNodes,
  onRandomizeEdgeColors,
  onUpdateMapGaps,
  onOpenConnectorModal,
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
    </div>
  );
};
\\n

## src/components/organisms/toolpanel/__tests__/ThemeTab.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/organisms/toolpanel/__tests__/ThemeTab.test.tsx'
\\n

## src/components/templates/MainEditorLayout.tsx

\\tsx
import React from 'react';

export interface MainEditorLayoutProps {
  menuBar?: React.ReactNode;
  toolBar?: React.ReactNode;
  filterBar?: React.ReactNode;
  canvas: React.ReactNode;
  toolPanel?: React.ReactNode;
  outlineView?: React.ReactNode;
  statusBar?: React.ReactNode;
  modals?: React.ReactNode;
  presentationOverlay?: React.ReactNode;
  isPresentationMode?: boolean;
  isOutlineOpen?: boolean;
  isOutlineFullscreen?: boolean;
  isToolPanelOpen?: boolean;
  isFilterBarOpen?: boolean;
}

export const MainEditorLayout: React.FC<MainEditorLayoutProps> = ({
  menuBar,
  toolBar,
  filterBar,
  canvas,
  toolPanel,
  outlineView,
  statusBar,
  modals,
  presentationOverlay,
  isPresentationMode = false,
  isOutlineOpen = false,
  isOutlineFullscreen = false,
  isToolPanelOpen = false,
  isFilterBarOpen = false,
}) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-900 select-none">
      {/* 1. Menu Bar (Top Navigation) */}
      {!isPresentationMode && menuBar}

      {/* 2. Main ToolBar */}
      {!isPresentationMode && toolBar}

      {/* 3. Filter Bar (Collapsible) */}
      {!isPresentationMode && isFilterBarOpen && filterBar}

      {/* 4. Central Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Outline View Drawer */}
        {isOutlineOpen && !isPresentationMode && outlineView}

        {/* Center Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {canvas}
        </div>

        {/* Right Properties Panel */}
        {isToolPanelOpen && !isOutlineFullscreen && !isPresentationMode && toolPanel}
      </div>

      {/* 5. Status Bar */}
      {!isPresentationMode && statusBar}

      {/* 6. Presentation Fullscreen Overlay */}
      {isPresentationMode && presentationOverlay}

      {/* 7. Dialogs and Modals Layer */}
      {modals}
    </div>
  );
};
\\n

## src/components/templates/__tests__/MainEditorLayout.test.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/components/templates/__tests__/MainEditorLayout.test.tsx'
\\n

## src/hooks/__tests__/useKeyboardShortcuts.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/hooks/__tests__/useKeyboardShortcuts.test.ts'
\\n

## src/hooks/__tests__/useMindMapStore.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/hooks/__tests__/useMindMapStore.test.ts'
\\n

## src/hooks/__tests__/useSearchFilter.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/hooks/__tests__/useSearchFilter.test.ts'
\\n

## src/hooks/useKeyboardShortcuts.ts

\\ts
import { useEffect } from 'react';
import { useMindMapStore } from './useMindMapStore';

interface UseKeyboardShortcutsProps {
  isAnyModalOpen: boolean;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts({ isAnyModalOpen, onCloseModals }: UseKeyboardShortcutsProps) {
  const {
    mindMap,
    selectedNodeId,
    isPresentationMode,
    setIsPresentationMode,
    setSelectedNodeId,
    setEditingNodeId,
    setIsOutlineOpen,
    setIsToolPanelOpen,
    setIsFilterBarOpen,
    handleUndo,
    handleRedo,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
    handleAddChild,
    handleAddSibling,
    handleToggleFold,
    handleDeleteNode,
  } = useMindMapStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (isTyping) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
          setEditingNodeId(null);
        }
        return;
      }

      // Modals Open Guard
      if (isAnyModalOpen) {
        if (e.key === 'Escape') {
          onCloseModals();
        }
        return;
      }

      // Presentation Mode toggle (F5)
      if (e.key === 'F5') {
        e.preventDefault();
        setIsPresentationMode((p) => !p);
        return;
      }

      // Presentation Mode active guard
      if (isPresentationMode) return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Copy / Cut / Paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyNode();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCutNode();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteNode();
        return;
      }

      // Search & Filter (Ctrl + F)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFilterBarOpen((f) => !f);
        return;
      }

      // Outline Side Panel Toggle (Alt + O)
      if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsOutlineOpen((o) => !o);
        return;
      }

      // ToolPanel Toggle (Alt + P)
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsToolPanelOpen((t) => !t);
        return;
      }

      // Add Child (Tab / Insert)
      if (e.key === 'Tab' || e.key === 'Insert') {
        e.preventDefault();
        handleAddChild();
        return;
      }

      // Add Sibling (Enter)
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSibling();
        return;
      }

      // Edit Text (F2)
      if (e.key === 'F2') {
        e.preventDefault();
        if (selectedNodeId) {
          setEditingNodeId(selectedNodeId);
        }
        return;
      }

      // Fold / Unfold (Space)
      if (e.key === ' ') {
        e.preventDefault();
        handleToggleFold();
        return;
      }

      // Delete Node (Delete / Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteNode();
        return;
      }

      // Escape -> Select Root
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodeId(mindMap.rootId);
        return;
      }

      // Arrow Keys Navigation
      if (selectedNodeId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const curr = mindMap.nodes[selectedNodeId];
        if (!curr) return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          if (curr.parentId) {
            const parent = mindMap.nodes[curr.parentId];
            if (parent && parent.children) {
              const idx = parent.children.indexOf(curr.id);
              if (e.key === 'ArrowUp' && idx > 0) {
                setSelectedNodeId(parent.children[idx - 1]);
              } else if (e.key === 'ArrowDown' && idx < parent.children.length - 1) {
                setSelectedNodeId(parent.children[idx + 1]);
              }
            }
          }
        } else if (e.key === 'ArrowRight') {
          if (curr.id === mindMap.rootId) {
            const rightChild = curr.children.find((cid) => mindMap.nodes[cid]?.side === 'right');
            if (rightChild) setSelectedNodeId(rightChild);
          } else if (curr.side === 'right' && !curr.folded && curr.children.length > 0) {
            setSelectedNodeId(curr.children[0]);
          } else if (curr.side === 'left' && curr.parentId) {
            setSelectedNodeId(curr.parentId);
          }
        } else if (e.key === 'ArrowLeft') {
          if (curr.id === mindMap.rootId) {
            const leftChild = curr.children.find((cid) => mindMap.nodes[cid]?.side === 'left');
            if (leftChild) setSelectedNodeId(leftChild);
          } else if (curr.side === 'left' && !curr.folded && curr.children.length > 0) {
            setSelectedNodeId(curr.children[0]);
          } else if (curr.side === 'right' && curr.parentId) {
            setSelectedNodeId(curr.parentId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    mindMap,
    isPresentationMode,
    isAnyModalOpen,
    onCloseModals,
    handleAddChild,
    handleAddSibling,
    handleDeleteNode,
    handleToggleFold,
    handleUndo,
    handleRedo,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
    setIsPresentationMode,
    setEditingNodeId,
    setIsOutlineOpen,
    setIsToolPanelOpen,
    setIsFilterBarOpen,
    setSelectedNodeId,
  ]);
}
\\n

## src/hooks/useMindMapStore.ts

\\ts
import { create } from 'zustand';
import {
  MindMap,
  MindNode,
  Connector,
  EdgeStyle,
  EdgeProfile,
  LayoutType,
  BackgroundPatternStyle,
  FilterOptions,
} from '../types/mindmap';
import { BLANK_MAP, TUTORIAL_MAP } from '../utils/sampleMaps';
import { loadCurrentMap, saveCurrentMap } from '../utils/storage';

interface MindMapStore {
  // Estado base
  mindMap: MindMap;
  historyPast: MindMap[];
  historyFuture: MindMap[];
  selectedNodeId: string | null;
  editingNodeId: string | null;
  focusTarget: { nodeId: string; timestamp: number } | null;

  // Modos de visualización y paneles
  isOutlineOpen: boolean;
  isOutlineFullscreen: boolean;
  isPresentationMode: boolean;
  isToolPanelOpen: boolean;
  isFilterBarOpen: boolean;

  // Filtro y búsqueda
  filterOptions: FilterOptions;

  // Portapapeles (Copy/Cut/Paste)
  clipboard: { node: MindNode; subNodes: Record<string, MindNode>; isCut: boolean } | null;

  // Acciones de estado
  setMindMap: (mapOrUpdater: MindMap | ((prev: MindMap) => MindMap)) => void;
  setSelectedNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setFocusTarget: (target: { nodeId: string; timestamp: number } | null) => void;
  setIsOutlineOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setIsOutlineFullscreen: (fullscreen: boolean | ((prev: boolean) => boolean)) => void;
  setIsPresentationMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  setIsToolPanelOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setIsFilterBarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setFilterOptions: (optionsOrUpdater: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void;

  // Historial Undo / Redo
  pushHistory: (map: MindMap) => void;
  handleUndo: () => void;
  handleRedo: () => void;

  // CRUD y Mutaciones de nodos
  updateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  handleAddChild: (parentId?: string) => void;
  handleAddSibling: (siblingId?: string) => void;
  handleDeleteNode: (nodeIdToDelete?: string) => void;
  handleToggleFold: (nodeId?: string) => void;
  handleFoldAll: () => void;
  handleUnfoldAll: () => void;
  handleReparentNode: (draggedId: string, targetParentId: string) => void;

  // Clipboard operations
  handleCopyNode: (nodeId?: string) => void;
  handleCutNode: (nodeId?: string) => void;
  handlePasteNode: (targetParentId?: string) => void;

  // Propagación de estilos
  handleApplyStyleToChildren: (nodeId?: string) => void;
  handleApplyStyleToSiblings: (nodeId?: string) => void;

  // Propagación exclusiva de iconos y su color
  handleApplyIconsToChildren?: (nodeId?: string) => void;
  handleApplyIconsToSiblings?: (nodeId?: string) => void;
  handleRandomizeEdgeColors: () => void;
}

const extractNodeStyleBundle = (sourceNode: MindNode): Partial<MindNode> => {
  return {
    shape: sourceNode.shape,
    color: sourceNode.color,
    bgType: sourceNode.bgType,
    gradientColor1: sourceNode.gradientColor1,
    gradientColor2: sourceNode.gradientColor2,
    gradientDirection: sourceNode.gradientDirection,
    nodePattern: sourceNode.nodePattern,
    nodePatternColor: sourceNode.nodePatternColor,
    nodePatternSize: sourceNode.nodePatternSize,
    nodePatternOpacity: sourceNode.nodePatternOpacity,
    borderColor: sourceNode.borderColor,
    borderWidth: sourceNode.borderWidth,
    borderDash: sourceNode.borderDash,
    borderStyle: sourceNode.borderStyle,
    textColor: sourceNode.textColor,
    fontSize: sourceNode.fontSize,
    bold: sourceNode.bold,
    italic: sourceNode.italic,
    fontFamily: sourceNode.fontFamily,
    textAlign: sourceNode.textAlign,
    edgeColor: sourceNode.edgeColor,
    edgeStyle: sourceNode.edgeStyle,
    edgeWidth: sourceNode.edgeWidth,
    edgeDash: sourceNode.edgeDash,
    edgeProfile: sourceNode.edgeProfile,
    customWidth: sourceNode.customWidth,
    customHeight: sourceNode.customHeight,
  };
};

export const useMindMapStore = create<MindMapStore>((set, get) => {
  const initialMap = loadCurrentMap();

  return {
    mindMap: initialMap,
    historyPast: [],
    historyFuture: [],
    selectedNodeId: initialMap.rootId,
    editingNodeId: null,
    focusTarget: null,
    isOutlineOpen: false,
    isOutlineFullscreen: false,
    isPresentationMode: false,
    isToolPanelOpen: true,
    isFilterBarOpen: false,
    filterOptions: {
      query: '',
      showAncestors: true,
      showDescendants: true,
    },
    clipboard: null,

    setMindMap: (mapOrUpdater) => {
      set((state) => {
        const nextMap = typeof mapOrUpdater === 'function' ? mapOrUpdater(state.mindMap) : mapOrUpdater;
        saveCurrentMap(nextMap);
        return { mindMap: nextMap };
      });
    },

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    setEditingNodeId: (id) => set({ editingNodeId: id }),
    setFocusTarget: (target) => set({ focusTarget: target }),
    setIsOutlineOpen: (val) =>
      set((s) => ({ isOutlineOpen: typeof val === 'function' ? val(s.isOutlineOpen) : val })),
    setIsOutlineFullscreen: (val) =>
      set((s) => ({ isOutlineFullscreen: typeof val === 'function' ? val(s.isOutlineFullscreen) : val })),
    setIsPresentationMode: (val) =>
      set((s) => ({ isPresentationMode: typeof val === 'function' ? val(s.isPresentationMode) : val })),
    setIsToolPanelOpen: (val) =>
      set((s) => ({ isToolPanelOpen: typeof val === 'function' ? val(s.isToolPanelOpen) : val })),
    setIsFilterBarOpen: (val) =>
      set((s) => ({ isFilterBarOpen: typeof val === 'function' ? val(s.isFilterBarOpen) : val })),
    setFilterOptions: (val) =>
      set((s) => ({ filterOptions: typeof val === 'function' ? val(s.filterOptions) : val })),

    pushHistory: (current) => {
      set((state) => ({
        historyPast: [...state.historyPast.slice(-40), current],
        historyFuture: [],
      }));
    },

    handleUndo: () => {
      const { historyPast, mindMap } = get();
      if (historyPast.length === 0) return;
      const previous = historyPast[historyPast.length - 1];
      const newPast = historyPast.slice(0, -1);

      set((s) => ({
        historyFuture: [mindMap, ...s.historyFuture],
        historyPast: newPast,
        mindMap: previous,
      }));
      saveCurrentMap(previous);
    },

    handleRedo: () => {
      const { historyFuture, mindMap } = get();
      if (historyFuture.length === 0) return;
      const next = historyFuture[0];
      const newFuture = historyFuture.slice(1);

      set((s) => ({
        historyPast: [...s.historyPast, mindMap],
        historyFuture: newFuture,
        mindMap: next,
      }));
      saveCurrentMap(next);
    },

    updateNode: (nodeId, updates) => {
      const { mindMap, pushHistory } = get();
      const existing = mindMap.nodes[nodeId];
      if (!existing) return;

      pushHistory(mindMap);

      const nextMap: MindMap = {
        ...mindMap,
        updatedAt: Date.now(),
        nodes: {
          ...mindMap.nodes,
          [nodeId]: {
            ...existing,
            ...updates,
          },
        },
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleAddChild: (parentId) => {
      const { mindMap, selectedNodeId, pushHistory } = get();
      const targetParentId = parentId || selectedNodeId || mindMap.rootId;
      const targetParent = mindMap.nodes[targetParentId];
      if (!targetParent) return;

      pushHistory(mindMap);

      const newId = `node-${Date.now()}`;
      const isParentRoot = targetParent.id === mindMap.rootId;

      let side = targetParent.side;
      if (isParentRoot) {
        const rightCount = targetParent.children.filter((cid) => mindMap.nodes[cid]?.side === 'right').length;
        const leftCount = targetParent.children.filter((cid) => mindMap.nodes[cid]?.side === 'left').length;
        side = rightCount <= leftCount ? 'right' : 'left';
      }

      const newNode: MindNode = {
        id: newId,
        text: 'Nueva Idea',
        parentId: targetParentId,
        children: [],
        side,
        shape: 'bubble',
      };

      const nextMap: MindMap = {
        ...mindMap,
        updatedAt: Date.now(),
        nodes: {
          ...mindMap.nodes,
          [targetParentId]: {
            ...targetParent,
            folded: false,
            children: [...targetParent.children, newId],
          },
          [newId]: newNode,
        },
      };

      set({ mindMap: nextMap, selectedNodeId: newId, editingNodeId: newId });
      saveCurrentMap(nextMap);
    },

    handleAddSibling: (siblingId) => {
      const { mindMap, selectedNodeId, pushHistory, handleAddChild } = get();
      const targetSiblingId = siblingId || selectedNodeId;
      if (!targetSiblingId || targetSiblingId === mindMap.rootId) {
        handleAddChild(mindMap.rootId);
        return;
      }

      const siblingNode = mindMap.nodes[targetSiblingId];
      if (!siblingNode || !siblingNode.parentId) return;

      const parentNode = mindMap.nodes[siblingNode.parentId];
      if (!parentNode) return;

      pushHistory(mindMap);

      const newId = `node-${Date.now()}`;
      const siblingIndex = parentNode.children.indexOf(targetSiblingId);

      const newNode: MindNode = {
        id: newId,
        text: 'Nueva Idea',
        parentId: parentNode.id,
        children: [],
        side: siblingNode.side,
        shape: siblingNode.shape || 'bubble',
      };

      const newChildren = [...parentNode.children];
      newChildren.splice(siblingIndex + 1, 0, newId);

      const nextMap: MindMap = {
        ...mindMap,
        updatedAt: Date.now(),
        nodes: {
          ...mindMap.nodes,
          [parentNode.id]: {
            ...parentNode,
            children: newChildren,
          },
          [newId]: newNode,
        },
      };

      set({ mindMap: nextMap, selectedNodeId: newId, editingNodeId: newId });
      saveCurrentMap(nextMap);
    },

    handleDeleteNode: (nodeIdToDelete) => {
      const { mindMap, selectedNodeId, pushHistory } = get();
      const targetId = nodeIdToDelete || selectedNodeId;
      if (!targetId || targetId === mindMap.rootId) return;

      const nodeToDelete = mindMap.nodes[targetId];
      if (!nodeToDelete || !nodeToDelete.parentId) return;

      const parentNode = mindMap.nodes[nodeToDelete.parentId];
      if (!parentNode) return;

      pushHistory(mindMap);

      const idsToDelete = new Set<string>();
      function collect(id: string) {
        idsToDelete.add(id);
        const curr = mindMap.nodes[id];
        if (curr?.children) {
          curr.children.forEach(collect);
        }
      }
      collect(targetId);

      const remainingNodes = { ...mindMap.nodes };
      idsToDelete.forEach((id) => delete remainingNodes[id]);

      remainingNodes[parentNode.id] = {
        ...parentNode,
        children: parentNode.children.filter((id) => id !== targetId),
      };

      const remainingConnectors = (mindMap.connectors || []).filter(
        (c) => !idsToDelete.has(c.fromId) && !idsToDelete.has(c.toId)
      );

      const nextMap: MindMap = {
        ...mindMap,
        updatedAt: Date.now(),
        nodes: remainingNodes,
        connectors: remainingConnectors,
      };

      set({ mindMap: nextMap, selectedNodeId: parentNode.id });
      saveCurrentMap(nextMap);
    },

    handleToggleFold: (nodeId) => {
      const { mindMap, selectedNodeId, updateNode } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId) return;
      const node = mindMap.nodes[targetId];
      if (!node || !node.children || node.children.length === 0) return;

      updateNode(targetId, { folded: !node.folded });
    },

    handleFoldAll: () => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes = { ...mindMap.nodes };
      Object.keys(updatedNodes).forEach((id) => {
        if (id !== mindMap.rootId && updatedNodes[id].children.length > 0) {
          updatedNodes[id] = { ...updatedNodes[id], folded: true };
        }
      });
      const nextMap: MindMap = { ...mindMap, nodes: updatedNodes, updatedAt: Date.now() };
      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleUnfoldAll: () => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes = { ...mindMap.nodes };
      Object.keys(updatedNodes).forEach((id) => {
        updatedNodes[id] = { ...updatedNodes[id], folded: false };
      });
      const nextMap: MindMap = { ...mindMap, nodes: updatedNodes, updatedAt: Date.now() };
      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleReparentNode: (draggedId, targetParentId) => {
      const { mindMap, pushHistory } = get();
      if (draggedId === targetParentId || draggedId === mindMap.rootId) return;

      const draggedNode = mindMap.nodes[draggedId];
      const targetParent = mindMap.nodes[targetParentId];
      if (!draggedNode || !targetParent || !draggedNode.parentId) return;

      function isDescendant(parentId: string, searchId: string): boolean {
        const parent = mindMap.nodes[parentId];
        if (!parent || !parent.children) return false;
        if (parent.children.includes(searchId)) return true;
        return parent.children.some((cid) => isDescendant(cid, searchId));
      }
      if (isDescendant(draggedId, targetParentId)) return;

      pushHistory(mindMap);

      const oldParent = mindMap.nodes[draggedNode.parentId];
      const newOldParent = oldParent
        ? {
            ...oldParent,
            children: oldParent.children.filter((id) => id !== draggedId),
          }
        : null;

      const newSide = targetParent.id === mindMap.rootId ? draggedNode.side || 'right' : targetParent.side;

      const nextMap: MindMap = {
        ...mindMap,
        updatedAt: Date.now(),
        nodes: {
          ...mindMap.nodes,
          ...(newOldParent ? { [newOldParent.id]: newOldParent } : {}),
          [targetParent.id]: {
            ...targetParent,
            children: [...targetParent.children, draggedId],
          },
          [draggedId]: {
            ...draggedNode,
            parentId: targetParent.id,
            side: newSide,
          },
        },
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleCopyNode: (nodeId) => {
      const { mindMap, selectedNodeId } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId) return;

      const node = mindMap.nodes[targetId];
      if (!node) return;

      const subNodes: Record<string, MindNode> = {};
      function collect(id: string) {
        const n = mindMap.nodes[id];
        if (n) {
          subNodes[id] = { ...n };
          n.children.forEach(collect);
        }
      }
      collect(targetId);

      set({ clipboard: { node, subNodes, isCut: false } });
    },

    handleCutNode: (nodeId) => {
      const { mindMap, selectedNodeId, handleCopyNode, handleDeleteNode } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId || targetId === mindMap.rootId) return;

      handleCopyNode(targetId);
      handleDeleteNode(targetId);
    },

    handlePasteNode: (targetParentId) => {
      const { clipboard, mindMap, selectedNodeId, pushHistory } = get();
      if (!clipboard) return;
      const targetId = targetParentId || selectedNodeId || mindMap.rootId;
      const targetParent = mindMap.nodes[targetId];
      if (!targetParent) return;

      pushHistory(mindMap);

      const idMap = new Map<string, string>();
      const newSubNodes: Record<string, MindNode> = {};

      Object.keys(clipboard.subNodes).forEach((oldId) => {
        idMap.set(oldId, `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`);
      });

      (Object.entries(clipboard.subNodes) as [string, MindNode][]).forEach(([oldId, origNode]) => {
        const newId = idMap.get(oldId)!;
        const newParentId = oldId === clipboard.node.id ? targetId : idMap.get(origNode.parentId!) || targetId;
        const newChildren = origNode.children.map((cid) => idMap.get(cid)!).filter(Boolean);

        newSubNodes[newId] = {
          ...origNode,
          id: newId,
          parentId: newParentId,
          children: newChildren,
          side: targetParent.side,
        };
      });

      const rootClonedId = idMap.get(clipboard.node.id)!;

      const nextMap: MindMap = {
        ...mindMap,
        updatedAt: Date.now(),
        nodes: {
          ...mindMap.nodes,
          ...newSubNodes,
          [targetId]: {
            ...targetParent,
            children: [...targetParent.children, rootClonedId],
          },
        },
      };

      set({ mindMap: nextMap, selectedNodeId: rootClonedId });
      saveCurrentMap(nextMap);
    },

    handleApplyStyleToChildren: (nodeId) => {
      const { mindMap, selectedNodeId, pushHistory } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId) return;

      const sourceNode = mindMap.nodes[targetId];
      if (!sourceNode || !sourceNode.children || sourceNode.children.length === 0) return;

      pushHistory(mindMap);
      const styleBundle = extractNodeStyleBundle(sourceNode);

      const updatedNodes = { ...mindMap.nodes };

      const applyRecursively = (childId: string) => {
        const childNode = updatedNodes[childId];
        if (childNode) {
          updatedNodes[childId] = {
            ...childNode,
            ...styleBundle,
          };
          (childNode.children || []).forEach(applyRecursively);
        }
      };

      sourceNode.children.forEach(applyRecursively);

      const nextMap: MindMap = {
        ...mindMap,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleApplyStyleToSiblings: (nodeId) => {
      const { mindMap, selectedNodeId, pushHistory } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId || targetId === mindMap.rootId) return;

      const sourceNode = mindMap.nodes[targetId];
      if (!sourceNode || !sourceNode.parentId) return;

      const parentNode = mindMap.nodes[sourceNode.parentId];
      if (!parentNode || !parentNode.children || parentNode.children.length <= 1) return;

      pushHistory(mindMap);
      const styleBundle = extractNodeStyleBundle(sourceNode);

      const updatedNodes = { ...mindMap.nodes };

      parentNode.children.forEach((siblingId) => {
        if (siblingId !== targetId && updatedNodes[siblingId]) {
          updatedNodes[siblingId] = {
            ...updatedNodes[siblingId],
            ...styleBundle,
          };
        }
      });

      const nextMap: MindMap = {
        ...mindMap,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleApplyIconsToChildren: (nodeId) => {
      const { mindMap, selectedNodeId, pushHistory } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId) return;

      const sourceNode = mindMap.nodes[targetId];
      if (!sourceNode || !sourceNode.children || sourceNode.children.length === 0) return;

      pushHistory(mindMap);

      const iconBundle = {
        icons: sourceNode.icons ? [...sourceNode.icons] : [],
        iconColor: sourceNode.iconColor,
        iconSize: sourceNode.iconSize,
        iconPosition: sourceNode.iconPosition,
      };

      const updatedNodes = { ...mindMap.nodes };

      const applyRecursively = (childId: string) => {
        const childNode = updatedNodes[childId];
        if (childNode) {
          updatedNodes[childId] = {
            ...childNode,
            ...iconBundle,
          };
          (childNode.children || []).forEach(applyRecursively);
        }
      };

      sourceNode.children.forEach(applyRecursively);

      const nextMap: MindMap = {
        ...mindMap,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleApplyIconsToSiblings: (nodeId) => {
      const { mindMap, selectedNodeId, pushHistory } = get();
      const targetId = nodeId || selectedNodeId;
      if (!targetId || targetId === mindMap.rootId) return;

      const sourceNode = mindMap.nodes[targetId];
      if (!sourceNode || !sourceNode.parentId) return;

      const parentNode = mindMap.nodes[sourceNode.parentId];
      if (!parentNode || !parentNode.children || parentNode.children.length <= 1) return;

      pushHistory(mindMap);

      const iconBundle = {
        icons: sourceNode.icons ? [...sourceNode.icons] : [],
        iconColor: sourceNode.iconColor,
        iconSize: sourceNode.iconSize,
        iconPosition: sourceNode.iconPosition,
      };

      const updatedNodes = { ...mindMap.nodes };

      parentNode.children.forEach((siblingId) => {
        if (siblingId !== targetId && updatedNodes[siblingId]) {
          updatedNodes[siblingId] = {
            ...updatedNodes[siblingId],
            ...iconBundle,
          };
        }
      });

      const nextMap: MindMap = {
        ...mindMap,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },

    handleRandomizeEdgeColors: () => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);

      // Paleta amplia y vibrante de 24 colores armónicos para ramificaciones
      const VIBRANT_PALETTE = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185',
        '#38bdf8', '#4ade80', '#fbbf24', '#c084fc', '#f472b6', '#2dd4bf'
      ];

      // Shuffle determinístico/aleatorio de colores
      const shuffled = [...VIBRANT_PALETTE].sort(() => Math.random() - 0.5);

      const updatedNodes: Record<string, MindNode> = {};
      let colorIdx = 0;

      // Asignar colores distribuidos por ramas y niveles para máxima variedad
      Object.entries(mindMap.nodes).forEach(([id, node]) => {
        if (id === mindMap.rootId) {
          updatedNodes[id] = { ...(node as MindNode), edgeColor: undefined };
        } else {
          const assignedColor = shuffled[colorIdx % shuffled.length];
          colorIdx++;
          updatedNodes[id] = {
            ...(node as MindNode),
            edgeColor: assignedColor,
          };
        }
      });

      const nextMap: MindMap = {
        ...mindMap,
        edgeColor: undefined, // asegura modo multicolor activo
        nodes: updatedNodes,
        updatedAt: Date.now(),
      };

      set({ mindMap: nextMap });
      saveCurrentMap(nextMap);
    },
  };
});
\\n

## src/hooks/useSearchFilter.ts

\\ts
import { useMemo } from 'react';
import { MindMap, MindNode, FilterOptions } from '../types/mindmap';

export function useSearchFilter(mindMap: MindMap, filterOptions: FilterOptions) {
  // Compute Search Matches
  const searchMatches = useMemo(() => {
    if (!filterOptions.query && !filterOptions.tag && filterOptions.minProgress === undefined) {
      return undefined;
    }

    const matches = new Set<string>();
    const q = filterOptions.query.toLowerCase().trim();

    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      let isMatch = true;

      if (q && !n.text.toLowerCase().includes(q) && !(n.note && n.note.toLowerCase().includes(q))) {
        isMatch = false;
      }
      if (filterOptions.tag && (!n.tags || !n.tags.includes(filterOptions.tag))) {
        isMatch = false;
      }
      if (
        filterOptions.minProgress !== undefined &&
        (n.progress === undefined || n.progress < filterOptions.minProgress)
      ) {
        isMatch = false;
      }

      if (isMatch) {
        matches.add(n.id);
      }
    });

    return matches;
  }, [mindMap.nodes, filterOptions]);

  // Available Tags in Map
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      n.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [mindMap.nodes]);

  return {
    searchMatches,
    availableTags,
  };
}
\\n

## src/index.css

\\css
@import "tailwindcss";

/* Tema oscuro por clase (no por SO): lo gobierna data-theme + .dark,
   persistido en localStorage (freemind_ui_theme_v1). */
@custom-variant dark (&:where(.dark, .dark *));

/* Superficies de barras por tema de interfaz (sepia incluido) */
:root,
:root[data-theme="claro"] {
  --chrome-bar: #0f172a;
  --chrome-toolbar: #ffffff;
  --sp-bg: #ffffff;
  --sp-bg2: #f8fafc;
  --sp-hover: #f1f5f9;
  --sp-glass: rgba(255, 255, 255, 0.65);
  --sp-pop: rgba(255, 255, 255, 0.95);
  --sp-text: #1e293b;
  --sp-muted: #64748b;
  --sp-border: #e2e8f0;
  --sp-input: #ffffff;
}
:root[data-theme="oscuro"] {
  --chrome-toolbar: #1e293b;
  --sp-bg: #0f172a;
  --sp-bg2: #1e293b;
  --sp-hover: #1e293b;
  --sp-glass: rgba(15, 23, 42, 0.65);
  --sp-pop: rgba(15, 23, 42, 0.95);
  --sp-text: #e2e8f0;
  --sp-muted: #94a3b8;
  --sp-border: #334155;
  --sp-input: #1e293b;
}
:root[data-theme="sepia"] {
  --chrome-bar: #433422;
  --chrome-toolbar: #efe3c8;
  --sp-bg: #f7efdc;
  --sp-bg2: #efe2c6;
  --sp-hover: #e9dcc0;
  --sp-glass: rgba(247, 239, 220, 0.65);
  --sp-pop: rgba(247, 239, 220, 0.95);
  color-scheme: light;
}
:root[data-theme="sepia"] {
  --chrome-bar: #433422;
  --chrome-toolbar: #efe3c8;
  color-scheme: light;
}
:root[data-theme="oscuro"] {
  color-scheme: dark;
}

@layer base {
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
}

/* Background grid patterns */
.bg-grid-dots {
  background-image: radial-gradient(rgba(148, 163, 184, 0.35) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bg-grid-dots-dark {
  background-image: radial-gradient(rgba(100, 116, 139, 0.4) 1px, transparent 1px);
  background-size: 24px 24px;
}

.bg-grid-lines {
  background-size: 32px 32px;
  background-image: 
    linear-gradient(to right, rgba(226, 232, 240, 0.7) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(226, 232, 240, 0.7) 1px, transparent 1px);
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.6);
}

/* Node animation and transitions */
.mind-node {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s ease, border-color 0.15s ease;
}

.node-selected {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Prevent accidental browser gestures interfering with canvas */
.canvas-container {
  touch-action: none;
  user-select: none;
}
\\n

## src/main.tsx

\\tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
\\n

## src/test/setup.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/test/setup.ts'
\\n

## src/types/mindmap.ts

\\ts
export type NodeShape =
  | 'bubble'
  | 'fork'
  | 'rectangle'
  | 'square'
  | 'oval'
  | 'circle'
  | 'hexagon'
  | 'pill'
  | 'arrow'
  | 'star';

export type EdgeStyle = 'bezier' | 'linear' | 'sharp' | 'horizontal' | 'hidden';

export type EdgeProfile = 'uniform' | 'tapered' | 'spindle' | 'hourglass';

export type LayoutType =
  | 'standard'
  | 'balanced-horizontal'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'tree-down'
  | 'radial'
  | 'circular';

export type NodeSide = 'left' | 'right' | 'root' | 'bottom' | 'top' | 'radial' | 'circular';

export type CloudShape =
  | 'arc'
  | 'rectangle'
  | 'round-rectangle'
  | 'star'
  | 'cloud-scallop'
  | 'bubble'
  | 'hexagon'
  | 'oval';

export interface NodeCloud {
  enabled: boolean;
  color: string;
  shape: CloudShape;
  opacity?: number; // 0 to 1
  
  // Background types (Solid, Gradient, Pattern, Image)
  bgType?: 'color' | 'gradient' | 'pattern' | 'image';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: NodeGradientDirection;
  cloudPattern?: NodePatternStyle;
  cloudPatternColor?: string;
  cloudPatternSize?: number;
  cloudPatternOpacity?: number;

  // Background image
  bgImageUrl?: string;
  bgImageMode?: NodeBgImageMode;
  bgImageOpacity?: number;

  // Dimension adjustments (ancho y alto extra de la nube)
  paddingX?: number; // margen horizontal extra (-100 a +300 px)
  paddingY?: number; // margen vertical extra (-100 a +300 px)

  // Border & Stroke Options
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  shadow?: boolean;
}

export type NodeBackgroundType = 'color' | 'transparent' | 'gradient' | 'pattern' | 'image';
export type NodeGradientDirection = 'to-r' | 'to-b' | 'to-br' | 'radial';
export type NodePatternStyle = 'dots' | 'lines' | 'squares' | 'stripes' | 'triangles' | 'hexagons' | 'cross';
export type NodeBgImageMode = 'fit' | 'cover' | 'contain' | 'tile';

export interface MindNode {
  id: string;
  text: string;
  parentId: string | null;
  children: string[];
  folded?: boolean;
  side?: NodeSide;
  
  // Visual Styles
  shape?: NodeShape;
  customWidth?: number;
  customHeight?: number;
  color?: string; // background fill or accent
  bgType?: NodeBackgroundType;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: NodeGradientDirection;
  nodePattern?: NodePatternStyle;
  nodePatternColor?: string;
  nodePatternSize?: number;
  nodePatternOpacity?: number;

  // Background Image (Fondo del nodo)
  bgImageUrl?: string;
  bgImageMode?: NodeBgImageMode;
  bgImageOpacity?: number;

  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // Node Attached Content Image (Imagen de contenido del nodo)
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'between' | 'background' | 'fit';

  // Title Text & Typography
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Body Text & Typography (Cuerpo del nodo)
  body?: string;
  bodyFontSize?: number;
  bodyBold?: boolean;
  bodyItalic?: boolean;
  bodyColor?: string;
  bodyFontFamily?: string;
  bodyAlign?: 'left' | 'center' | 'right';
  
  // Edges
  edgeColor?: string;
  edgeStyle?: EdgeStyle;
  edgeWidth?: number;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile;
  
  // Metadata & Features
  icons?: string[];
  iconPosition?: 'left' | 'top';
  iconColor?: string;
  iconSize?: number;
  tags?: string[];
  progress?: number; // 0 to 100
  progressPosition?: 'left' | 'top';
  link?: string; // URL, mailto:, #nodeId
  note?: string; // Rich Markdown note
  showNoteInline?: boolean; // When true, displays the note inline below the body instead of only in tooltips
  details?: string; // Additional details

  // Node Element Visibility Overrides (Eye Toggles)
  hideBody?: boolean;
  hideImage?: boolean;
  hideTags?: boolean;
  hideIcons?: boolean;
  hideLink?: boolean;
  hideProgress?: boolean;
  
  // Free floating / Post-it
  isFreeFloating?: boolean;
  freePosition?: { x: number; y: number };
  
  // Groupings
  cloud?: NodeCloud;
}

export interface Connector {
  id: string;
  fromId: string;
  toId: string;
  fromNodeId?: string;
  toNodeId?: string;
  label?: string;

  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  arrow?: 'start' | 'end' | 'both' | 'none';
  curvature?: number;
  shape?: 'curved' | 'bezier' | 'straight' | 'step';
  width?: number;
  controlPoint?: { x: number; y: number };
  layer?: 'above' | 'below';
  opacity?: number;
}

export type BackgroundPatternStyle =
  | 'none'
  | 'dots'
  | 'lines'
  | 'squares'
  | 'triangles'
  | 'hexagons';

export interface MapBackgroundConfig {
  color?: string;
  pattern?: BackgroundPatternStyle;
  patternColor?: string;
  patternSize?: number;
  patternOpacity?: number;
}

export interface MindMapTheme {
  id: string;
  name: string;
  background: string;
  backgroundPattern?: BackgroundPatternStyle;
  backgroundPatternColor?: string;
  backgroundPatternSize?: number;
  backgroundPatternOpacity?: number;
  rootBg: string;
  rootText: string;
  nodeBg: string;
  nodeText: string;
  nodeBorder: string;
  branchColors: string[];
  edgeStyle: EdgeStyle;
  fontFamily: string;
}

export interface MindMap {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindNode>;
  connectors: Connector[];
  layout: LayoutType;
  themeId: string;
  // Custom Background Properties (override theme background if set)
  backgroundColor?: string;
  backgroundPattern?: BackgroundPatternStyle;
  backgroundPatternColor?: string;
  backgroundPatternSize?: number;
  backgroundPatternOpacity?: number;
  edgeStyle?: EdgeStyle;
  edgeWidth?: number;
  edgeColor?: string;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile;
  horizontalGap?: number;
  verticalGap?: number;

  // Global Map Visibility Toggles (Modo Enfoque / Densidad Visual)
  hideAllBodies?: boolean;
  hideAllImages?: boolean;
  hideAllTags?: boolean;
  hideAllIcons?: boolean;
  hideAllLinks?: boolean;
  showAllNotesInline?: boolean;

  // Presentation Mode (Mindomo-style Custom Frames & Storyboard)
  presentationSlides?: SlideFrame[];

  // Elaborate Spatial Presentation Mode (Prezi-style Free Board & Rotation)
  elaborateSlides?: SpatialSlideCard[];

  createdAt: number;
  updatedAt: number;
}

export interface SpatialSlideCard {
  id: string;
  order: number;
  title: string;
  isNoteSlide?: boolean;
  spatial: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    rotation: number; // in degrees
  };
  content: {
    nodeId?: string;
    titleText: string;
    bodyText?: string;
    notesMarkdown?: string;
    imageUrl?: string;
    imageSize?: 'small' | 'medium' | 'large';
    icons?: string[];
    tags?: string[];
    progress?: number;
    subItems?: { id: string; text: string; color?: string }[];
  };
  style?: {
    themeId?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    contentAlign?: 'center' | 'left';
    bgType?: NodeBackgroundType;
    gradientColor1?: string;
    gradientColor2?: string;
    gradientDirection?: NodeGradientDirection;
    pattern?: NodePatternStyle;
    patternColor?: string;
    patternSize?: number;
    patternOpacity?: number;
  };
}

export interface SlideFrame {
  id: string;
  order: number;
  title: string;
  type: 'node' | 'branch' | 'custom_area' | 'overview' | 'note';
  nodeId?: string;
  nodeIds?: string[]; // Specific set of user-selected nodes for this slide
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  showNotes?: boolean;
  color?: string; // Color identifier for frame badge
  transitionDurationMs?: number;
}

export interface CalculatedNodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: NodeSide;
  depth: number;
  branchIndex: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface FilterOptions {
  query: string;
  tag?: string;
  icon?: string;
  hasNote?: boolean;
  hasLink?: boolean;
  minProgress?: number;
  showAncestors: boolean;
  showDescendants: boolean;
}

export interface HistoryState {
  past: MindMap[];
  present: MindMap;
  future: MindMap[];
}
\\n

## src/utils/__tests__/connectorUtils.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/connectorUtils.test.ts'
\\n

## src/utils/__tests__/freeplaneConverter.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/freeplaneConverter.test.ts'
\\n

## src/utils/__tests__/freeplaneExtra.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/freeplaneExtra.test.ts'
\\n

## src/utils/__tests__/htmlExporter.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/htmlExporter.test.ts'
\\n

## src/utils/__tests__/layoutEngine.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/layoutEngine.test.ts'
\\n

## src/utils/__tests__/layoutExtra.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/layoutExtra.test.ts'
\\n

## src/utils/__tests__/mapTheme.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/mapTheme.test.ts'
\\n

## src/utils/__tests__/markdownRenderer.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/markdownRenderer.test.ts'
\\n

## src/utils/__tests__/presentationGenerators.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/presentationGenerators.test.ts'
\\n

## src/utils/__tests__/storage.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/storage.test.ts'
\\n

## src/utils/__tests__/themes.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/themes.test.ts'
\\n

## src/utils/__tests__/uiTheme.test.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/__tests__/uiTheme.test.ts'
\\n

## src/utils/additionalTemplates.ts

\\ts
import { MindMap } from '../types/mindmap';
import { TEMPLATE_SVGS } from './templateIllustrations';

// ============================================================================
// 11. ROADMAP DE PRODUCTO IA GENERATIVA & AGENTES (Layout: Radial 360°)
// ============================================================================
export const AI_PRODUCT_ROADMAP_MAP: MindMap = {
  id: 'map-ai-roadmap',
  title: 'Roadmap de Producto IA Generativa & Agentes 2026',
  rootId: 'root',
  layout: 'radial',
  themeId: 'dark',
  backgroundColor: '#090d16',
  backgroundPattern: 'triangles',
  backgroundPatternColor: '#1e293b',
  backgroundPatternSize: 26,
  backgroundPatternOpacity: 0.5,
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 52,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'ai-conn-1',
      fromId: 'ai-rag',
      toId: 'ai-eval',
      label: 'Evaluación RAG Triad',
      color: '#38bdf8',
      shape: 'bezier',
      curvature: -70,
      style: 'dashed',
      width: 2,
      arrow: 'end',
      opacity: 0.9,
      layer: 'above',
    },
    {
      id: 'ai-conn-2',
      fromId: 'ai-agents',
      toId: 'ai-tools',
      label: 'Invocación de Herramientas MCP',
      color: '#a855f7',
      shape: 'curved',
      curvature: 60,
      style: 'solid',
      width: 2.5,
      arrow: 'both',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'ai-conn-3',
      fromId: 'ai-guardrails',
      toId: 'ai-finetune',
      label: 'Alineación de Seguridad (RLHF)',
      color: '#f43f5e',
      shape: 'step',
      style: 'dotted',
      width: 2,
      arrow: 'end',
      opacity: 0.8,
      layer: 'below',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🤖 AI Agentic Architecture 2026',
      body: 'Ecosistema de modelos fundacionales, agentes autónomos, pipelines RAG híbridos e infraestructura MLOps',
      bodyFontSize: 11.5,
      bodyColor: '#94a3b8',
      parentId: null,
      children: ['ai-models', 'ai-agents', 'ai-rag', 'ai-infra', 'ai-safety', 'ai-ux'],
      side: 'root',
      shape: 'hexagon',
      color: '#0f172a',
      textColor: '#38bdf8',
      borderColor: '#0284c7',
      borderWidth: 2.5,
      bold: true,
      fontSize: 17,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.brainAi,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['IA', 'GenAI', 'Agentes'],
      cloud: {
        enabled: true,
        color: 'rgba(2, 132, 199, 0.12)',
        shape: 'round-rectangle',
      },
    },
    'ai-models': {
      id: 'ai-models',
      text: '🧠 Modelos & Enrutamiento',
      body: 'Selección dinámica y optimización de costes/latencia',
      bodyFontSize: 10,
      bodyColor: '#cbd5e1',
      parentId: 'root',
      children: ['ai-llm-router', 'ai-slm-edge', 'ai-finetune'],
      side: 'right',
      shape: 'oval',
      color: '#1e293b',
      textColor: '#f8fafc',
      borderColor: '#38bdf8',
      borderWidth: 2,
      bold: true,
    },
    'ai-llm-router': {
      id: 'ai-llm-router',
      text: 'Dynamic Model Router',
      body: 'Claude 3.7 / GPT-4o para razonamiento complejo, Flash para tareas rápidas',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'ai-models',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#0f172a',
      textColor: '#e2e8f0',
      borderColor: '#0284c7',
    },
    'ai-slm-edge': {
      id: 'ai-slm-edge',
      text: 'Small Language Models (SLMs)',
      body: 'Modelos de 3B a 8B (Phi-4, Gemma 2) ejecutándose en local con WebGPU',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'ai-models',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#e2e8f0',
      borderColor: '#334155',
    },
    'ai-finetune': {
      id: 'ai-finetune',
      text: 'LoRA & DPO Fine-tuning',
      body: 'Adaptadores de bajo rango especializados en dominio corporativo',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'ai-models',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#e2e8f0',
      borderColor: '#334155',
    },
    'ai-agents': {
      id: 'ai-agents',
      text: '⚡ Multi-Agent System (MAS)',
      body: 'Orquestación de agentes con memoria y ejecución de herramientas',
      bodyFontSize: 10,
      bodyColor: '#e9d5ff',
      parentId: 'root',
      children: ['ai-planner', 'ai-memory', 'ai-tools'],
      side: 'right',
      shape: 'rectangle',
      color: '#581c87',
      textColor: '#f5d0fe',
      borderColor: '#c084fc',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.aiRobot,
      imagePosition: 'left',
      imageWidth: 40,
    },
    'ai-planner': {
      id: 'ai-planner',
      text: 'Planificación & ReAct Loop',
      body: 'Descomposición en sub-tareas, evaluación de resultados y autorreflexión',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-agents',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#a855f7',
    },
    'ai-memory': {
      id: 'ai-memory',
      text: 'Memoria Corto / Largo Plazo',
      body: 'Vector Stores + Semantic Cache + Resumen de grafo de conversación',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-agents',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#a855f7',
    },
    'ai-tools': {
      id: 'ai-tools',
      text: 'Herramientas MCP & APIs',
      body: 'Model Context Protocol: Acceso seguro a BDs, terminal, web search y Git',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-agents',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#1e293b',
      textColor: '#f0abfc',
      borderColor: '#e879f9',
      bold: true,
    },
    'ai-rag': {
      id: 'ai-rag',
      text: '📚 RAG Híbrido Avanzado',
      body: 'Recuperación densa + dispersa (BM25) con reranking neuronal',
      bodyFontSize: 10,
      bodyColor: '#bae6fd',
      parentId: 'root',
      children: ['ai-chunking', 'ai-vector-db', 'ai-eval'],
      side: 'left',
      shape: 'square',
      color: '#0369a1',
      textColor: '#f0f9ff',
      borderColor: '#38bdf8',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.databaseCluster,
      imagePosition: 'left',
      imageWidth: 40,
    },
    'ai-chunking': {
      id: 'ai-chunking',
      text: 'Chunking Semántico & Jerárquico',
      body: 'División adaptativa por encabezados y relaciones padre-hijo',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-rag',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#38bdf8',
    },
    'ai-vector-db': {
      id: 'ai-vector-db',
      text: 'Vector Store & Embeddings',
      body: 'Qdrant / Milvus / pgvector con embeddings multilingües de 1536 dims',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-rag',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#38bdf8',
    },
    'ai-eval': {
      id: 'ai-eval',
      text: 'Evaluación Continua (Ragas)',
      body: 'Métricas de Faithfulness, Answer Relevance y Context Precision',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-rag',
      children: [],
      side: 'left',
      shape: 'pill',
      color: '#1e293b',
      textColor: '#7dd3fc',
      borderColor: '#0284c7',
    },
    'ai-safety': {
      id: 'ai-safety',
      text: '🛡️ Seguridad & Guardrails',
      body: 'Mitigación de inyecciones de prompt y filtrado PII en tiempo real',
      bodyFontSize: 10,
      bodyColor: '#fecdd3',
      parentId: 'root',
      children: ['ai-guardrails', 'ai-audit'],
      side: 'left',
      shape: 'bubble',
      color: '#9f1239',
      textColor: '#fff1f2',
      borderColor: '#f43f5e',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.securityShield,
      imagePosition: 'left',
      imageWidth: 38,
    },
    'ai-guardrails': {
      id: 'ai-guardrails',
      text: 'NeMo Guardrails & Llama Guard',
      body: 'Comprobación bidireccional de entrada y salida contra jailbreaks',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-safety',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#f43f5e',
    },
    'ai-audit': {
      id: 'ai-audit',
      text: 'Observabilidad & Trazabilidad',
      body: 'Registro estructurado con Langfuse / Arize Phoenix para inspección',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'ai-safety',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#f43f5e',
    },
    'ai-infra': {
      id: 'ai-infra',
      text: '🚀 MLOps & Despliegue',
      body: 'Servidores vLLM, TensorRT-LLM y escalado elástico en Kubernetes',
      bodyFontSize: 10,
      bodyColor: '#bbf7d0',
      parentId: 'root',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#14532d',
      textColor: '#f0fdf4',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
    },
    'ai-ux': {
      id: 'ai-ux',
      text: '✨ UX de IA Generativa',
      body: 'Streaming de tokens, visualización de razonamiento y citas verificables',
      bodyFontSize: 10,
      bodyColor: '#fef08a',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#713f12',
      textColor: '#fefce8',
      borderColor: '#eab308',
      borderWidth: 2,
      bold: true,
    },
  },
};

// ============================================================================
// 12. MATRIZ FODA / DAFO ESTRATÉGICO (Layout: Bilateral Cuadrantes)
// ============================================================================
export const SWOT_ANALYSIS_MAP: MindMap = {
  id: 'map-swot-matrix',
  title: 'Matriz Estratégica FODA / DAFO Corporativa',
  rootId: 'root',
  layout: 'standard',
  themeId: 'rainbow',
  backgroundColor: '#f8fafc',
  backgroundPattern: 'squares',
  backgroundPatternColor: '#e2e8f0',
  backgroundPatternSize: 24,
  backgroundPatternOpacity: 0.45,
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 56,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'swot-conn-1',
      fromId: 'foda-f1',
      toId: 'foda-o1',
      label: 'Estrategia FO: Maximizar',
      color: '#2563eb',
      shape: 'curved',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'both',
      opacity: 0.9,
      layer: 'above',
    },
    {
      id: 'swot-conn-2',
      fromId: 'foda-d1',
      toId: 'foda-a1',
      label: 'Estrategia DA: Mitigar Riesgo Crítico',
      color: '#dc2626',
      shape: 'bezier',
      curvature: 65,
      style: 'dashed',
      width: 2.5,
      arrow: 'end',
      opacity: 0.95,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '📊 Matriz FODA / DAFO',
      body: 'Diagnóstico estratégico 360° para toma de decisiones y ventajas competitivas',
      bodyFontSize: 11,
      bodyColor: '#334155',
      parentId: null,
      children: ['foda-strengths', 'foda-opportunities', 'foda-weaknesses', 'foda-threats'],
      side: 'root',
      shape: 'hexagon',
      color: '#f8fafc',
      textColor: '#0f172a',
      borderColor: '#64748b',
      borderWidth: 3,
      bold: true,
      fontSize: 18,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.swotMatrix,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Estrategia', 'FODA', 'Negocio'],
    },
    'foda-strengths': {
      id: 'foda-strengths',
      text: '💪 Fortalezas (Interno +)',
      body: 'Capacidades únicas, recursos propios y ventajas ya consolidadas',
      bodyFontSize: 10,
      bodyColor: '#1e40af',
      parentId: 'root',
      children: ['foda-f1', 'foda-f2', 'foda-f3'],
      side: 'right',
      shape: 'oval',
      color: '#dbeafe',
      textColor: '#1e3a8a',
      borderColor: '#3b82f6',
      borderWidth: 2.5,
      bold: true,
      cloud: { enabled: true, color: 'rgba(59, 130, 246, 0.08)', shape: 'round-rectangle' },
    },
    'foda-f1': {
      id: 'foda-f1',
      text: 'Tecnología Propietaria con Patente',
      body: 'Algoritmo con 40% menor consumo de memoria que competidores directos',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-strengths',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#93c5fd',
    },
    'foda-f2': {
      id: 'foda-f2',
      text: 'Equipo Senior con Retención >95%',
      body: 'Cultura de alto desempeño y liderazgo consolidado en el sector',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-strengths',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#93c5fd',
    },
    'foda-f3': {
      id: 'foda-f3',
      text: 'Solvencia Financiera & Flujo Positivo',
      body: 'Runway de 24 meses sin necesidad de deuda inmediata',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-strengths',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#eff6ff',
      textColor: '#1d4ed8',
      borderColor: '#60a5fa',
    },
    'foda-opportunities': {
      id: 'foda-opportunities',
      text: '🌟 Oportunidades (Externo +)',
      body: 'Tendencias de mercado, vacíos competitivos y nuevas normativas',
      bodyFontSize: 10,
      bodyColor: '#065f46',
      parentId: 'root',
      children: ['foda-o1', 'foda-o2', 'foda-o3'],
      side: 'right',
      shape: 'star',
      color: '#d1fae5',
      textColor: '#064e3b',
      borderColor: '#10b981',
      borderWidth: 2.5,
      bold: true,
      cloud: { enabled: true, color: 'rgba(16, 185, 129, 0.08)', shape: 'round-rectangle' },
    },
    'foda-o1': {
      id: 'foda-o1',
      text: 'Expansión a Mercado Latinoamericano',
      body: 'Crecimiento de demanda B2B superior al 65% interanual',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-opportunities',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#6ee7b7',
    },
    'foda-o2': {
      id: 'foda-o2',
      text: 'Alianzas Estratégicas con Integradores',
      body: 'Canal de distribución indirecto con más de 120 revendedores certificados',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-opportunities',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#6ee7b7',
    },
    'foda-o3': {
      id: 'foda-o3',
      text: 'Automatización con IA para Clientes',
      body: 'Monetización mediante suscripción a módulos avanzados de inteligencia artificial',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-opportunities',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#f0fdf4',
      textColor: '#047857',
      borderColor: '#34d399',
    },
    'foda-weaknesses': {
      id: 'foda-weaknesses',
      text: '⚠️ Debilidades (Interno -)',
      body: 'Limitaciones operativas, brechas técnicas o dependencia crítica',
      bodyFontSize: 10,
      bodyColor: '#92400e',
      parentId: 'root',
      children: ['foda-d1', 'foda-d2'],
      side: 'left',
      shape: 'fork',
      color: '#fef3c7',
      textColor: '#78350f',
      borderColor: '#f59e0b',
      borderWidth: 2.5,
      bold: true,
      cloud: { enabled: true, color: 'rgba(245, 158, 11, 0.08)', shape: 'round-rectangle' },
    },
    'foda-d1': {
      id: 'foda-d1',
      text: 'Proceso de Onboarding Complejo',
      body: 'Tiempo medio de implantación de 4 semanas, superior al promedio de 10 días',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-weaknesses',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fcd34d',
    },
    'foda-d2': {
      id: 'foda-d2',
      text: 'Baja Notoriedad de Marca Digital',
      body: 'Dependencia de ventas outbound sin tráfico orgánico consolidado',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-weaknesses',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fcd34d',
    },
    'foda-threats': {
      id: 'foda-threats',
      text: '🚨 Amenazas (Externo -)',
      body: 'Competencia agresiva, cambios legislativos o riesgos macroeconómicos',
      bodyFontSize: 10,
      bodyColor: '#991b1b',
      parentId: 'root',
      children: ['foda-a1', 'foda-a2'],
      side: 'left',
      shape: 'rectangle',
      color: '#fee2e2',
      textColor: '#7f1d1d',
      borderColor: '#ef4444',
      borderWidth: 2.5,
      bold: true,
      cloud: { enabled: true, color: 'rgba(239, 68, 68, 0.08)', shape: 'round-rectangle' },
    },
    'foda-a1': {
      id: 'foda-a1',
      text: 'Entrada de Competidores con Precios Low-Cost',
      body: 'Guerra de tarifas que erosiona los márgenes brutos tradicionales',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-threats',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fca5a5',
    },
    'foda-a2': {
      id: 'foda-a2',
      text: 'Nuevas Regulaciones de Privacidad (GDPR+)',
      body: 'Exigencia de auditorías de datos locales e infraestructura soberana',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'foda-threats',
      children: [],
      side: 'left',
      shape: 'pill',
      color: '#fff5f5',
      textColor: '#b91c1c',
      borderColor: '#f87171',
    },
  },
};

// ============================================================================
// 13. MARCO DE CIBERSEGURIDAD & ZERO TRUST (Layout: Organigrama Descendente NIST)
// ============================================================================
export const CYBERSECURITY_FRAMEWORK_MAP: MindMap = {
  id: 'map-cybersecurity-framework',
  title: 'Marco de Ciberseguridad NIST & Arquitectura Zero-Trust',
  rootId: 'root',
  layout: 'bottom',
  themeId: 'dark',
  edgeStyle: 'sharp',
  edgeProfile: 'uniform',
  edgeWidth: 2.5,
  edgeDash: 'solid',
  horizontalGap: 52,
  verticalGap: 14,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'sec-conn-1',
      fromId: 'sec-detect',
      toId: 'sec-respond',
      label: 'Respuesta Automática SOAR <60s',
      color: '#f43f5e',
      shape: 'bezier',
      curvature: -50,
      style: 'solid',
      width: 2.5,
      arrow: 'end',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'sec-conn-2',
      fromId: 'sec-backup',
      toId: 'sec-drp',
      label: 'RPO: 15 min / RTO: 1 hr',
      color: '#38bdf8',
      shape: 'curved',
      curvature: 45,
      style: 'dashed',
      width: 2,
      arrow: 'both',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🛡️ NIST Cybersecurity & Zero-Trust',
      body: 'Estrategia de defensa en profundidad: Nunca confíes, verifica siempre',
      bodyFontSize: 11.5,
      bodyColor: '#94a3b8',
      parentId: null,
      children: ['sec-id', 'sec-protect', 'sec-detect', 'sec-respond', 'sec-recover'],
      side: 'root',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#e0e7ff',
      borderColor: '#6366f1',
      borderWidth: 3,
      bold: true,
      fontSize: 17,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.securityShield,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Ciberseguridad', 'NIST', 'ZeroTrust'],
      cloud: { enabled: true, color: 'rgba(99, 102, 241, 0.1)', shape: 'round-rectangle' },
    },
    'sec-id': {
      id: 'sec-id',
      text: '1. IDENTIFY (Identificar)',
      body: 'Inventario de activos, análisis de riesgos y gobierno de datos',
      bodyFontSize: 10,
      bodyColor: '#e0e7ff',
      parentId: 'root',
      children: ['sec-assets', 'sec-vuln'],
      side: 'bottom',
      shape: 'bubble',
      color: '#312e81',
      textColor: '#e0e7ff',
      borderColor: '#818cf8',
      borderWidth: 2,
      bold: true,
    },
    'sec-assets': {
      id: 'sec-assets',
      text: 'Inventario Automatizado de Activos',
      body: 'Descubrimiento continuo de endpoints, instancias cloud y APIs expuestas',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-id',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#f8fafc',
      borderColor: '#4338ca',
    },
    'sec-vuln': {
      id: 'sec-vuln',
      text: 'Gestión Continua de Vulnerabilidades',
      body: 'Escaneo diario CVSS, dependencias SBOM y parches automatizados',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-id',
      children: [],
      side: 'bottom',
      shape: 'pill',
      color: '#1e293b',
      textColor: '#a5b4fc',
      borderColor: '#6366f1',
    },
    'sec-protect': {
      id: 'sec-protect',
      text: '2. PROTECT (Proteger)',
      body: 'MFA biométrico, cifrado end-to-end y segmentación micro-red',
      bodyFontSize: 10,
      bodyColor: '#cffafe',
      parentId: 'root',
      children: ['sec-iam', 'sec-encrypt', 'sec-waf'],
      side: 'bottom',
      shape: 'bubble',
      color: '#164e63',
      textColor: '#cffafe',
      borderColor: '#06b6d4',
      borderWidth: 2,
      bold: true,
    },
    'sec-iam': {
      id: 'sec-iam',
      text: 'IAM con Principio de Menor Privilegio',
      body: 'Autenticación FIDO2 / Passkeys, RBAC estricto y sesiones Just-In-Time',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-protect',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#f8fafc',
      borderColor: '#0891b2',
    },
    'sec-encrypt': {
      id: 'sec-encrypt',
      text: 'Cifrado en Tránsito & Reposo',
      body: 'TLS 1.3 con HSTS + AES-256 GCM con gestión de llaves en HSM dedicado',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-protect',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#f8fafc',
      borderColor: '#0891b2',
    },
    'sec-waf': {
      id: 'sec-waf',
      text: 'WAF & Protección Anti-DDoS',
      body: 'Cloudflare / AWS Shield con reglas OWASP Top 10 y rate-limiting adaptativo',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-protect',
      children: [],
      side: 'bottom',
      shape: 'pill',
      color: '#1e293b',
      textColor: '#67e8f9',
      borderColor: '#06b6d4',
    },
    'sec-detect': {
      id: 'sec-detect',
      text: '3. DETECT (Detectar)',
      body: 'SIEM centralizado, XDR en endpoints y análisis de comportamiento UEBA',
      bodyFontSize: 10,
      bodyColor: '#fef08a',
      parentId: 'root',
      children: ['sec-siem', 'sec-soc'],
      side: 'bottom',
      shape: 'bubble',
      color: '#713f12',
      textColor: '#fef08a',
      borderColor: '#eab308',
      borderWidth: 2,
      bold: true,
    },
    'sec-siem': {
      id: 'sec-siem',
      text: 'SIEM & Correlación en Tiempo Real',
      body: 'Ingesta de logs (Elastic / Splunk) con detección de anomalías con ML',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-detect',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#ca8a04',
    },
    'sec-soc': {
      id: 'sec-soc',
      text: 'SOC 24/7 & Threat Hunting',
      body: 'Monitorización proactiva de IOCs y ciberinteligencia MITRE ATT&CK',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-detect',
      children: [],
      side: 'bottom',
      shape: 'pill',
      color: '#1e293b',
      textColor: '#fde047',
      borderColor: '#eab308',
    },
    'sec-respond': {
      id: 'sec-respond',
      text: '4. RESPOND (Responder)',
      body: 'Playbooks de contención automática, aislamiento y comunicación de crisis',
      bodyFontSize: 10,
      bodyColor: '#fecdd3',
      parentId: 'root',
      children: ['sec-soar'],
      side: 'bottom',
      shape: 'bubble',
      color: '#881337',
      textColor: '#ffe4e6',
      borderColor: '#f43f5e',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.bugFix,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'sec-soar': {
      id: 'sec-soar',
      text: 'Orquestación SOAR & Forense',
      body: 'Aislamiento de red automático de hosts infectados y volcado de memoria',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-respond',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#f43f5e',
    },
    'sec-recover': {
      id: 'sec-recover',
      text: '5. RECOVER (Recuperar)',
      body: 'Copias de seguridad inmutables, plan DRP y lecciones aprendidas',
      bodyFontSize: 10,
      bodyColor: '#bbf7d0',
      parentId: 'root',
      children: ['sec-backup', 'sec-drp'],
      side: 'bottom',
      shape: 'bubble',
      color: '#14532d',
      textColor: '#dcfce7',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
    },
    'sec-backup': {
      id: 'sec-backup',
      text: 'Backups 3-2-1 Inmutables (Air-Gapped)',
      body: '3 copias, 2 soportes distintos, 1 fuera de línea protegida contra ransomware',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-recover',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#ffffff',
      borderColor: '#16a34a',
    },
    'sec-drp': {
      id: 'sec-drp',
      text: 'Disaster Recovery Plan (DRP)',
      body: 'Simulacros semestrales de restauración de servicios en región secundaria',
      bodyFontSize: 9.5,
      bodyColor: '#cbd5e1',
      parentId: 'sec-recover',
      children: [],
      side: 'bottom',
      shape: 'pill',
      color: '#1e293b',
      textColor: '#86efac',
      borderColor: '#22c55e',
    },
  },
};

// ============================================================================
// 14. CUSTOMER JOURNEY MAP & EXPERIENCIA DE USUARIO (Layout: Unilateral Derecha)
// ============================================================================
export const CUSTOMER_JOURNEY_MAP: MindMap = {
  id: 'map-customer-journey',
  title: 'Mapa de Experiencia de Cliente (Customer Journey & UX)',
  rootId: 'root',
  layout: 'right',
  themeId: 'warm',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 54,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'cj-conn-1',
      fromId: 'cj-onboard',
      toId: 'cj-aha',
      label: 'Tiempo al Valor (TTV) < 5 min',
      color: '#ea580c',
      shape: 'bezier',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'end',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'cj-conn-2',
      fromId: 'cj-referral',
      toId: 'cj-discover',
      label: 'Bucle de Crecimiento Viral',
      color: '#059669',
      shape: 'curved',
      curvature: -120,
      style: 'dashed',
      width: 2.5,
      arrow: 'end',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🗺️ Customer Journey Map',
      body: 'Mapeo integral de puntos de contacto, emociones, fricciones y momentos de la verdad (Aha! Moments)',
      bodyFontSize: 11,
      bodyColor: '#7c2d12',
      parentId: null,
      children: ['cj-stage1', 'cj-stage2', 'cj-stage3', 'cj-stage4', 'cj-stage5'],
      side: 'root',
      shape: 'bubble',
      color: '#ffedd5',
      textColor: '#9a3412',
      borderColor: '#ea580c',
      borderWidth: 3,
      bold: true,
      fontSize: 17,
      imageUrl: TEMPLATE_SVGS.customerJourney,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['UX', 'CustomerJourney', 'Marketing'],
    },
    'cj-stage1': {
      id: 'cj-stage1',
      text: '1. Descubrimiento & Conciencia',
      body: 'El usuario identifica una necesidad y busca soluciones en el mercado',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['cj-discover', 'cj-content'],
      side: 'right',
      shape: 'bubble',
      color: '#fff7ed',
      textColor: '#c2410c',
      borderColor: '#fb923c',
      borderWidth: 2,
      bold: true,
    },
    'cj-discover': {
      id: 'cj-discover',
      text: 'Búsqueda Orgánica & Redes',
      body: 'Punto de contacto: Artículos de blog SEO y recomendaciones en LinkedIn',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage1',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fed7aa',
    },
    'cj-content': {
      id: 'cj-content',
      text: 'Emoción: Curiosidad & Interés',
      body: 'Fricción: Exceso de opciones en el mercado. Solución: Caso de estudio claro',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage1',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#fffbeb',
      textColor: '#b45309',
      borderColor: '#fcd34d',
    },
    'cj-stage2': {
      id: 'cj-stage2',
      text: '2. Evaluación & Comparativa',
      body: 'Análisis detallado de características, precios, reseñas y demostraciones',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['cj-demo', 'cj-trial'],
      side: 'right',
      shape: 'bubble',
      color: '#fff7ed',
      textColor: '#c2410c',
      borderColor: '#fb923c',
      borderWidth: 2,
      bold: true,
    },
    'cj-demo': {
      id: 'cj-demo',
      text: 'Prueba Gratuita sin Tarjeta',
      body: 'Registro en 1 clic con Google o GitHub para eliminar toda barrera inicial',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage2',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fed7aa',
    },
    'cj-trial': {
      id: 'cj-trial',
      text: 'Calculadora de ROI en Directo',
      body: 'Herramienta interactiva que cuantifica el ahorro en horas de trabajo',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage2',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#f0fdf4',
      textColor: '#15803d',
      borderColor: '#86efac',
    },
    'cj-stage3': {
      id: 'cj-stage3',
      text: '3. Compra & Activación (Onboarding)',
      body: 'El momento de la conversión y primera experiencia con el producto',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['cj-onboard', 'cj-aha'],
      side: 'right',
      shape: 'bubble',
      color: '#fef2f2',
      textColor: '#dc2626',
      borderColor: '#f87171',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.ecommerceCart,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'cj-onboard': {
      id: 'cj-onboard',
      text: 'Wizard de Configuración Guiada',
      body: '3 pasos simples para conectar datos y tener el primer resultado listo',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage3',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fca5a5',
    },
    'cj-aha': {
      id: 'cj-aha',
      text: '🎉 Momento Aha! (First Success)',
      body: 'El usuario exporta su primer informe en segundos. Sentimiento de satisfacción',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage3',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#fefce8',
      textColor: '#a16207',
      borderColor: '#fde047',
      bold: true,
    },
    'cj-stage4': {
      id: 'cj-stage4',
      text: '4. Retención & Uso Habitual',
      body: 'Integración en el flujo de trabajo diario y soporte proactivo',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['cj-success', 'cj-updates'],
      side: 'right',
      shape: 'bubble',
      color: '#f0fdf4',
      textColor: '#16a34a',
      borderColor: '#4ade80',
      borderWidth: 2,
      bold: true,
    },
    'cj-success': {
      id: 'cj-success',
      text: 'Customer Success & Check-in',
      body: 'Alertas automáticas si el usuario no inicia sesión en 7 días con tips útiles',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage4',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#bbf7d0',
    },
    'cj-updates': {
      id: 'cj-updates',
      text: 'Lanzamiento Semanal de Funciones',
      body: 'Changelog interactivo con feedback directo in-app',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage4',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#ecfeff',
      textColor: '#0e7490',
      borderColor: '#67e8f9',
    },
    'cj-stage5': {
      id: 'cj-stage5',
      text: '5. Fidelización & Promoción (Advocacy)',
      body: 'Los clientes satisfechos se convierten en embajadores de la marca',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['cj-nps', 'cj-referral'],
      side: 'right',
      shape: 'bubble',
      color: '#faf5ff',
      textColor: '#9333ea',
      borderColor: '#c084fc',
      borderWidth: 2,
      bold: true,
    },
    'cj-nps': {
      id: 'cj-nps',
      text: 'Encuesta NPS (Score > 75)',
      body: 'Solicitud de reseña en G2 y Capterra a los promotores identificados',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage5',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#e9d5ff',
    },
    'cj-referral': {
      id: 'cj-referral',
      text: 'Programa de Referidos con Recompensa',
      body: 'Descuento del 20% recurrente por cada cliente invitado que contrate',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'cj-stage5',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#fdf2f8',
      textColor: '#be185d',
      borderColor: '#f472b6',
      bold: true,
    },
  },
};

// ============================================================================
// 15. ESTRUCTURA MAESTRA DE PITCH DECK PARA INVERSORES (Layout: Jerarquía Ascendente / Top)
// ============================================================================
export const STARTUP_PITCH_DECK_MAP: MindMap = {
  id: 'map-startup-pitch',
  title: 'Estructura Maestra de Pitch Deck para Inversores',
  rootId: 'root',
  layout: 'top',
  themeId: 'default',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 56,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'pitch-conn-1',
      fromId: 'p-solution',
      toId: 'p-traction',
      label: 'Product-Market Fit Validado',
      color: '#2563eb',
      shape: 'curved',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'end',
      opacity: 0.9,
      layer: 'above',
    },
    {
      id: 'pitch-conn-2',
      fromId: 'p-ask',
      toId: 'p-financials',
      label: 'Uso de Fondos: 18m Runway',
      color: '#059669',
      shape: 'bezier',
      curvature: 60,
      style: 'dashed',
      width: 2,
      arrow: 'both',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🚀 Seed / Series A Pitch Deck',
      body: 'Estructura probada de 10 diapositivas para levantar capital con fondos de Venture Capital',
      bodyFontSize: 11,
      bodyColor: '#dbeafe',
      parentId: null,
      children: ['p-problem', 'p-solution', 'p-market', 'p-business', 'p-traction', 'p-team', 'p-ask'],
      side: 'root',
      shape: 'bubble',
      color: '#1e3a8a',
      textColor: '#ffffff',
      borderColor: '#3b82f6',
      borderWidth: 3,
      bold: true,
      fontSize: 18,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.pitchDeck,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['PitchDeck', 'Startup', 'Inversión'],
    },
    'p-problem': {
      id: 'p-problem',
      text: '1. El Problema Urgente & Doloroso',
      body: 'Qué problema crítico sufre el cliente y cuánto dinero/tiempo pierde hoy',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#fee2e2',
      textColor: '#991b1b',
      borderColor: '#ef4444',
      borderWidth: 2,
      bold: true,
    },
    'p-solution': {
      id: 'p-solution',
      text: '2. Nuestra Solución & Propuesta Única',
      body: '10x más rápido, 50% más barato o con una experiencia radicalmente superior',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#dbeafe',
      textColor: '#1e40af',
      borderColor: '#3b82f6',
      borderWidth: 2,
      bold: true,
    },
    'p-market': {
      id: 'p-market',
      text: '3. Tamaño de Mercado (TAM, SAM, SOM)',
      body: 'TAM: $14B Global | SAM: $3.2B Europa/Latam | SOM: $180M año 3',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#fef3c7',
      textColor: '#92400e',
      borderColor: '#f59e0b',
      borderWidth: 2,
      bold: true,
    },
    'p-business': {
      id: 'p-business',
      text: '4. Modelo de Negocio & Unit Economics',
      body: 'SaaS B2B recurrente | LTV: $18,400 | CAC: $3,200 | Ratio LTV/CAC: 5.7x',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#dcfce7',
      textColor: '#166534',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
    },
    'p-traction': {
      id: 'p-traction',
      text: '5. Tracción & Métricas Clave',
      body: '$1.4M ARR (+180% YoY) | Net Revenue Retention (NRR): 124% | 85 Clientes',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['p-financials'],
      side: 'top',
      shape: 'bubble',
      color: '#f0fdf4',
      textColor: '#15803d',
      borderColor: '#16a34a',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.financeGrowth,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'p-financials': {
      id: 'p-financials',
      text: 'Proyección a 3 Años',
      body: 'Año 1: $3.5M ARR | Año 2: $8.2M ARR | Año 3: $18M ARR con EBITDA positivo',
      bodyFontSize: 9,
      bodyColor: '#64748b',
      parentId: 'p-traction',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#ffffff',
      textColor: '#047857',
      borderColor: '#86efac',
    },
    'p-team': {
      id: 'p-team',
      text: '6. Equipo Fundador & Ventaja Injusta',
      body: 'Fundadores con 2 exits previos en el sector y directores técnicos de FAANG',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#fdf4ff',
      textColor: '#86198f',
      borderColor: '#d946ef',
      borderWidth: 2,
      bold: true,
    },
    'p-ask': {
      id: 'p-ask',
      text: '7. Ronda de Inversión (The Ask)',
      body: 'Ronda Seed de $2.5M para escalar equipo comercial (50%) e ingeniería (35%)',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#fefce8',
      textColor: '#a16207',
      borderColor: '#eab308',
      borderWidth: 2.5,
      bold: true,
    },
  },
};

// ============================================================================
// 16. RUTA DE APRENDIZAJE FULLSTACK & DEVOPS (Layout: Ascendente / Top)
// ============================================================================
export const FULLSTACK_DEV_ROADMAP_MAP: MindMap = {
  id: 'map-fullstack-dev',
  title: 'Ruta de Carrera Desarrollador Fullstack & DevOps 2026',
  rootId: 'root',
  layout: 'top',
  themeId: 'dark',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 54,
  verticalGap: 15,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'fs-conn-1',
      fromId: 'fs-frontend',
      toId: 'fs-backend',
      label: 'Contratos tRPC / OpenAPI',
      color: '#38bdf8',
      shape: 'bezier',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'both',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'fs-conn-2',
      fromId: 'fs-backend',
      toId: 'fs-devops',
      label: 'CI/CD Pipeline Automatizado',
      color: '#a855f7',
      shape: 'curved',
      curvature: 50,
      style: 'dashed',
      width: 2,
      arrow: 'end',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '💻 Modern Fullstack & Cloud Native',
      body: 'Competencias esenciales para construir aplicaciones web escalables de grado de producción',
      bodyFontSize: 11,
      bodyColor: '#94a3b8',
      parentId: null,
      children: ['fs-frontend', 'fs-backend', 'fs-databases', 'fs-devops', 'fs-testing', 'fs-arch'],
      side: 'root',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#38bdf8',
      borderColor: '#0284c7',
      borderWidth: 3,
      bold: true,
      fontSize: 17,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.codeDev,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Programación', 'Fullstack', 'DevOps'],
    },
    'fs-frontend': {
      id: 'fs-frontend',
      text: '🎨 Frontend Moderno',
      body: 'React 19, Next.js App Router, TypeScript y Tailwind CSS / CSS Modules',
      bodyFontSize: 10,
      bodyColor: '#cbd5e1',
      parentId: 'root',
      children: ['fs-react', 'fs-state', 'fs-perf'],
      side: 'top',
      shape: 'bubble',
      color: '#1e293b',
      textColor: '#67e8f9',
      borderColor: '#06b6d4',
      borderWidth: 2,
      bold: true,
    },
    'fs-react': {
      id: 'fs-react',
      text: 'Server Components & Actions',
      body: 'Renderizado en servidor (RSC) para bundle cero en cliente y carga instantánea',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-frontend',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#ffffff',
      borderColor: '#334155',
    },
    'fs-state': {
      id: 'fs-state',
      text: 'Gestión de Estado Ligera',
      body: 'Zustand para cliente + TanStack Query para sincronización de servidor y caché',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-frontend',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#0f172a',
      textColor: '#a5f3fc',
      borderColor: '#0891b2',
    },
    'fs-perf': {
      id: 'fs-perf',
      text: 'Core Web Vitals & a11y',
      body: 'LCP < 1.2s, INP < 100ms, CLS = 0 y accesibilidad WCAG 2.1 AA',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-frontend',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#ffffff',
      borderColor: '#334155',
    },
    'fs-backend': {
      id: 'fs-backend',
      text: '⚙️ Backend & APIs Escalables',
      body: 'Node.js / Bun con Fastify o Go / Rust para servicios de alta concurrencia',
      bodyFontSize: 10,
      bodyColor: '#e9d5ff',
      parentId: 'root',
      children: ['fs-apis', 'fs-auth'],
      side: 'top',
      shape: 'bubble',
      color: '#3b0764',
      textColor: '#f5d0fe',
      borderColor: '#c084fc',
      borderWidth: 2,
      bold: true,
    },
    'fs-apis': {
      id: 'fs-apis',
      text: 'Arquitectura de APIs',
      body: 'RESTful + gRPC para comunicación interna entre microservicios',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-backend',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#ffffff',
      borderColor: '#334155',
    },
    'fs-auth': {
      id: 'fs-auth',
      text: 'Auth Segura (OAuth2 / JWT)',
      body: 'Auth.js / Supabase Auth con rotación de refresh tokens y cookies HttpOnly',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-backend',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#0f172a',
      textColor: '#e879f9',
      borderColor: '#a855f7',
    },
    'fs-databases': {
      id: 'fs-databases',
      text: '🗄️ Persistencia & Bases de Datos',
      body: 'PostgreSQL como base principal + Redis para caché y Pub/Sub en memoria',
      bodyFontSize: 10,
      bodyColor: '#bae6fd',
      parentId: 'root',
      children: ['fs-postgres', 'fs-redis'],
      side: 'top',
      shape: 'bubble',
      color: '#0c4a6e',
      textColor: '#bae6fd',
      borderColor: '#38bdf8',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.databaseCluster,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'fs-postgres': {
      id: 'fs-postgres',
      text: 'PostgreSQL + Prisma / Drizzle',
      body: 'Migraciones controladas por código, tipos TypeScript estrictos e índices GiST/GIN',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-databases',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#ffffff',
      borderColor: '#334155',
    },
    'fs-redis': {
      id: 'fs-redis',
      text: 'Redis / Dragonfly',
      body: 'Caché de consultas pesadas, colas con BullMQ y rate-limiting por IP',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-databases',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#0f172a',
      textColor: '#7dd3fc',
      borderColor: '#0284c7',
    },
    'fs-devops': {
      id: 'fs-devops',
      text: '☁️ Cloud, Docker & CI/CD',
      body: 'Contenedores ligeros, GitHub Actions y despliegue en Kubernetes / AWS',
      bodyFontSize: 10,
      bodyColor: '#bbf7d0',
      parentId: 'root',
      children: ['fs-docker', 'fs-cicd'],
      side: 'top',
      shape: 'bubble',
      color: '#14532d',
      textColor: '#bbf7d0',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.cloudInfra,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'fs-docker': {
      id: 'fs-docker',
      text: 'Docker Multi-Stage Builds',
      body: 'Imágenes mínimas Alpine < 80MB optimizadas para producción',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-devops',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#0f172a',
      textColor: '#ffffff',
      borderColor: '#334155',
    },
    'fs-cicd': {
      id: 'fs-cicd',
      text: 'GitHub Actions Automatizado',
      body: 'Lint -> Typecheck -> Unit Tests -> E2E -> Build -> Despliegue en < 4 minutos',
      bodyFontSize: 9.5,
      bodyColor: '#94a3b8',
      parentId: 'fs-devops',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#0f172a',
      textColor: '#86efac',
      borderColor: '#16a34a',
    },
    'fs-testing': {
      id: 'fs-testing',
      text: '🧪 Testing Automatizado',
      body: 'Pirámide de pruebas: Vitest para unitarios + Playwright para E2E en navegadores reales',
      bodyFontSize: 10,
      bodyColor: '#fef08a',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#713f12',
      textColor: '#fefce8',
      borderColor: '#eab308',
      borderWidth: 2,
      bold: true,
    },
    'fs-arch': {
      id: 'fs-arch',
      text: '🏗️ Clean Architecture & DDD',
      body: 'Separación en capas de Dominio, Casos de Uso e Infraestructura desacoplada',
      bodyFontSize: 10,
      bodyColor: '#fecdd3',
      parentId: 'root',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#881337',
      textColor: '#fff1f2',
      borderColor: '#f43f5e',
      borderWidth: 2,
      bold: true,
    },
  },
};

// ============================================================================
// 17. PLAN FINANCIERO & CASH FLOW (Layout: Equilibrado Horizontal Arriba/Abajo)
// ============================================================================
export const FINANCIAL_BUDGET_MAP: MindMap = {
  id: 'map-financial-budget',
  title: 'Plan Financiero Corporativo, Presupuesto & Cash Flow',
  rootId: 'root',
  layout: 'balanced-horizontal',
  themeId: 'emerald',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 56,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'fin-conn-1',
      fromId: 'fin-rev-saas',
      toId: 'fin-opex-team',
      label: 'Margen Bruto del 82%',
      color: '#059669',
      shape: 'curved',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'end',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'fin-conn-2',
      fromId: 'fin-runway',
      toId: 'fin-capex',
      label: 'Límite de Inversión Trimestral',
      color: '#d97706',
      shape: 'bezier',
      curvature: 60,
      style: 'dashed',
      width: 2,
      arrow: 'both',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '💰 Presupuesto & Finanzas 2026',
      body: 'Planificación anual de ingresos, costes operativos, inversiones de capital y flujo de caja libre',
      bodyFontSize: 11,
      bodyColor: '#064e3b',
      parentId: null,
      children: ['fin-revenue', 'fin-cashflow', 'fin-opex', 'fin-capex'],
      side: 'root',
      shape: 'square',
      color: '#d1fae5',
      textColor: '#065f46',
      borderColor: '#10b981',
      borderWidth: 3,
      bold: true,
      fontSize: 18,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.financeGrowth,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Finanzas', 'Presupuesto', 'CashFlow'],
    },
    'fin-revenue': {
      id: 'fin-revenue',
      text: '📈 1. Fuentes de Ingresos ($4.8M)',
      body: 'Ventas recurrentes, expansión de cuentas y servicios profesionales',
      bodyFontSize: 10,
      bodyColor: '#166534',
      parentId: 'root',
      children: ['fin-rev-saas', 'fin-rev-enter', 'fin-rev-svc'],
      side: 'top',
      shape: 'bubble',
      color: '#f0fdf4',
      textColor: '#15803d',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
    },
    'fin-rev-saas': {
      id: 'fin-rev-saas',
      text: 'Suscripciones SaaS Recurrentes ($3.4M)',
      body: '71% del total. 450 clientes SMB con ARPU de $630/mes',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'fin-revenue',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#86efac',
    },
    'fin-rev-enter': {
      id: 'fin-rev-enter',
      text: 'Cuentas Enterprise Anuales ($1.1M)',
      body: '23% del total. 18 clientes corporativos con ACV de $61,000',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'fin-revenue',
      children: [],
      side: 'top',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#86efac',
    },
    'fin-rev-svc': {
      id: 'fin-rev-svc',
      text: 'Servicios de Implementación ($300k)',
      body: '6% del total. Formación y migraciones personalizadas',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'fin-revenue',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#ecfdf5',
      textColor: '#047857',
      borderColor: '#34d399',
    },
    'fin-cashflow': {
      id: 'fin-cashflow',
      text: '💵 2. Flujo de Caja & Runway',
      body: 'EBITDA: $1.28M (26.6% margen) | Caja disponible en banco: $2.4M',
      bodyFontSize: 10,
      bodyColor: '#1e40af',
      parentId: 'root',
      children: ['fin-runway'],
      side: 'top',
      shape: 'bubble',
      color: '#dbeafe',
      textColor: '#1d4ed8',
      borderColor: '#3b82f6',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.analyticsPie,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'fin-runway': {
      id: 'fin-runway',
      text: 'Runway de Seguridad: > 28 Meses',
      body: 'Capacidad de soportar escenarios adversos de caída de ventas sin recortes',
      bodyFontSize: 9,
      bodyColor: '#64748b',
      parentId: 'fin-cashflow',
      children: [],
      side: 'top',
      shape: 'pill',
      color: '#ffffff',
      textColor: '#1e40af',
      borderColor: '#93c5fd',
      bold: true,
    },
    'fin-opex': {
      id: 'fin-opex',
      text: '📉 3. Gastos Operativos OPEX ($3.1M)',
      body: 'Costes de personal, infraestructura cloud, marketing y herramientas',
      bodyFontSize: 10,
      bodyColor: '#991b1b',
      parentId: 'root',
      children: ['fin-opex-team', 'fin-opex-mkt', 'fin-opex-infra'],
      side: 'bottom',
      shape: 'bubble',
      color: '#fee2e2',
      textColor: '#b91c1c',
      borderColor: '#ef4444',
      borderWidth: 2,
      bold: true,
    },
    'fin-opex-team': {
      id: 'fin-opex-team',
      text: 'Salarios & Equipo ($1.9M)',
      body: '61% del OPEX. 24 personas a tiempo completo con seguridad social y beneficios',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'fin-opex',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fca5a5',
    },
    'fin-opex-mkt': {
      id: 'fin-opex-mkt',
      text: 'Marketing & Adquisición ($720k)',
      body: '23% del OPEX. Google Ads, patrocinios de eventos y contenido',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'fin-opex',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#fca5a5',
    },
    'fin-opex-infra': {
      id: 'fin-opex-infra',
      text: 'Servidores & Licencias ($480k)',
      body: '16% del OPEX. AWS, Snowflake, GitHub Enterprise y Slack',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'fin-opex',
      children: [],
      side: 'bottom',
      shape: 'pill',
      color: '#fff5f5',
      textColor: '#991b1b',
      borderColor: '#f87171',
    },
    'fin-capex': {
      id: 'fin-capex',
      text: '💼 4. Inversiones CAPEX ($420k)',
      body: 'Desarrollo de nuevas patentes y hardware de oficina central',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'bottom',
      shape: 'bubble',
      color: '#fef3c7',
      textColor: '#b45309',
      borderColor: '#f59e0b',
      borderWidth: 2,
      bold: true,
    },
  },
};

// ============================================================================
// 18. SISTEMA DE DISEÑO UI/UX & TOKENS (Layout: Radial 360°)
// ============================================================================
export const DESIGN_SYSTEM_MAP: MindMap = {
  id: 'map-design-system',
  title: 'Sistema de Diseño UI/UX & Tokens de Componentes',
  rootId: 'root',
  layout: 'radial',
  themeId: 'rainbow',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 56,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'ds-conn-1',
      fromId: 'ds-tokens',
      toId: 'ds-components',
      label: 'Propagación Automática a Figma & Código',
      color: '#d946ef',
      shape: 'bezier',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'end',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'ds-conn-2',
      fromId: 'ds-a11y',
      toId: 'ds-tokens-color',
      label: 'Ratio de Contraste WCAG AAA (7:1)',
      color: '#0284c7',
      shape: 'curved',
      curvature: 50,
      style: 'dashed',
      width: 2,
      arrow: 'both',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🎨 Aurora UI Design System',
      body: 'Lenguaje visual unificado, tokens de diseño semánticos, componentes accesibles y guías de interacción',
      bodyFontSize: 11,
      bodyColor: '#86198f',
      parentId: null,
      children: ['ds-tokens', 'ds-components', 'ds-patterns', 'ds-a11y'],
      side: 'root',
      shape: 'bubble',
      color: '#fdf4ff',
      textColor: '#a21caf',
      borderColor: '#d946ef',
      borderWidth: 3,
      bold: true,
      fontSize: 18,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.designPalette,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Diseño', 'DesignSystem', 'UI/UX'],
    },
    'ds-tokens': {
      id: 'ds-tokens',
      text: '1. Tokens Fundacionales',
      body: 'Variables primitivas y semánticas exportadas en JSON para React y Tailwind',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['ds-tokens-color', 'ds-tokens-type', 'ds-tokens-space'],
      side: 'right',
      shape: 'bubble',
      color: '#f5f3ff',
      textColor: '#6d28d9',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      bold: true,
    },
    'ds-tokens-color': {
      id: 'ds-tokens-color',
      text: 'Paleta HSL & Modos Claro/Oscuro',
      body: 'Primary (Indigo), Neutral (Slate), Success (Emerald), Danger (Rose)',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'ds-tokens',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#c4b5fd',
    },
    'ds-tokens-type': {
      id: 'ds-tokens-type',
      text: 'Escala Tipográfica (Inter / Plus Jakarta)',
      body: 'Modular scale 1.25 (Major Third) desde 12px (caption) hasta 48px (h1)',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'ds-tokens',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#c4b5fd',
    },
    'ds-tokens-space': {
      id: 'ds-tokens-space',
      text: 'Espaciado & Cuadrícula de 4px/8px',
      body: 'Sistema de densidad adaptativa con radios de curvatura (sm: 6px, md: 12px, full: 9999px)',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'ds-tokens',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#f5f3ff',
      textColor: '#5b21b6',
      borderColor: '#a78bfa',
    },
    'ds-components': {
      id: 'ds-components',
      text: '2. Biblioteca de Componentes',
      body: 'Componentes atómicos sin estilo (Radix UI) vestidos con nuestras clases',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: ['ds-cmp-buttons', 'ds-cmp-forms', 'ds-cmp-overlays'],
      side: 'right',
      shape: 'bubble',
      color: '#eff6ff',
      textColor: '#1d4ed8',
      borderColor: '#3b82f6',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.mobileApp,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'ds-cmp-buttons': {
      id: 'ds-cmp-buttons',
      text: 'Botones & Acciones',
      body: 'Variantes: Primary, Secondary, Ghost, Danger con estados de carga (spinner) y foco visible',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'ds-components',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#93c5fd',
    },
    'ds-cmp-forms': {
      id: 'ds-cmp-forms',
      text: 'Formularios & Entradas',
      body: 'Inputs con validación flotante, selector de fechas accesible y combobox con autocompletado',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'ds-components',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#93c5fd',
    },
    'ds-cmp-overlays': {
      id: 'ds-cmp-overlays',
      text: 'Modales, Toasts & Tooltips',
      body: 'Gestión de portal, bloqueo de scroll de fondo y cierre con tecla ESC',
      bodyFontSize: 9.5,
      bodyColor: '#64748b',
      parentId: 'ds-components',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#eff6ff',
      textColor: '#1e40af',
      borderColor: '#60a5fa',
    },
    'ds-patterns': {
      id: 'ds-patterns',
      text: '3. Patrones de UX & Flujos',
      body: 'Estados vacíos ilustrados, esqueletos de carga (skeleton loaders) y mensajes de error',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#f0fdf4',
      textColor: '#15803d',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
    },
    'ds-a11y': {
      id: 'ds-a11y',
      text: '4. Accesibilidad (a11y WCAG 2.1)',
      body: 'Navegación completa por teclado (Tab/Flechas), atributos ARIA y soporte para lectores de pantalla',
      bodyFontSize: 10,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#ecfeff',
      textColor: '#0e7490',
      borderColor: '#06b6d4',
      borderWidth: 2,
      bold: true,
    },
  },
};

// ============================================================================
// 19. SISTEMA DE CREACIÓN DE CONTENIDO (Layout: Circular Concéntrico)
// ============================================================================
export const CONTENT_CREATOR_SYSTEM_MAP: MindMap = {
  id: 'map-content-creator',
  title: 'Sistema de Creación de Contenido Multimedia & Redes',
  rootId: 'root',
  layout: 'circular',
  themeId: 'warm',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 56,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'cc-conn-1',
      fromId: 'cc-pillar',
      toId: 'cc-repurpose',
      label: '1 Vídeo Largo = 15 Micro-contenidos',
      color: '#f43f5e',
      shape: 'bezier',
      curvature: -60,
      style: 'solid',
      width: 2.5,
      arrow: 'end',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'cc-conn-2',
      fromId: 'cc-newsletter',
      toId: 'cc-monetize',
      label: 'Conversión a Clientes de Pago',
      color: '#059669',
      shape: 'curved',
      curvature: 50,
      style: 'dashed',
      width: 2.5,
      arrow: 'both',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🎙️ Content Creator Machine',
      body: 'Fábrica de producción semanal: De una idea pilar a distribución omnicanal automatizada',
      bodyFontSize: 11,
      bodyColor: '#78350f',
      parentId: null,
      children: ['cc-ideation', 'cc-pillar', 'cc-repurpose', 'cc-newsletter', 'cc-monetize'],
      side: 'root',
      shape: 'star',
      color: '#fef3c7',
      textColor: '#92400e',
      borderColor: '#f59e0b',
      borderWidth: 3,
      bold: true,
      fontSize: 18,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.podcastMic,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Contenido', 'YouTube', 'Podcast', 'Marketing'],
    },
    'cc-ideation': {
      id: 'cc-ideation',
      text: '1. Ideación & Validación de Temas',
      body: 'Análisis de tendencias en YouTube, preguntas frecuentes de la comunidad y Google Trends',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#ffffff',
      textColor: '#1e293b',
      borderColor: '#cbd5e1',
      borderWidth: 1.5,
      bold: true,
    },
    'cc-pillar': {
      id: 'cc-pillar',
      text: '2. Contenido Pilar (YouTube / Podcast)',
      body: 'Episodio profundo de 25-40 min con guion estructurado en ganchos, desarrollo y llamada a la acción',
      bodyFontSize: 10,
      bodyColor: '#991b1b',
      parentId: 'root',
      children: [],
      side: 'right',
      shape: 'bubble',
      color: '#fee2e2',
      textColor: '#b91c1c',
      borderColor: '#ef4444',
      borderWidth: 2,
      bold: true,
    },
    'cc-repurpose': {
      id: 'cc-repurpose',
      text: '3. Reciclaje (Shorts / Reels / TikTok)',
      body: 'Extracción de los 5 momentos más virales con subtítulos dinámicos y formatos verticales',
      bodyFontSize: 10,
      bodyColor: '#1e40af',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#dbeafe',
      textColor: '#1d4ed8',
      borderColor: '#3b82f6',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.gamificationTrophy,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'cc-newsletter': {
      id: 'cc-newsletter',
      text: '4. Newsletter Semanal (Substack)',
      body: 'Resumen ejecutivo con valor accionable enviado cada jueves a 22,000 suscriptores',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#f0fdf4',
      textColor: '#15803d',
      borderColor: '#22c55e',
      borderWidth: 2,
      bold: true,
    },
    'cc-monetize': {
      id: 'cc-monetize',
      text: '5. Vías de Monetización',
      body: 'Patrocinios directos, cursos avanzados de pago y membresía privada de comunidad',
      bodyFontSize: 9.5,
      bodyColor: '#701a75',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'pill',
      color: '#fdf4ff',
      textColor: '#a21caf',
      borderColor: '#d946ef',
      borderWidth: 2,
      bold: true,
    },
  },
};

// ============================================================================
// 20. PLAN INTEGRAL DE SALUD & BIOHACKING (Layout: Circular Concéntrico)
// ============================================================================
export const HEALTH_WELLNESS_MAP: MindMap = {
  id: 'map-health-wellness',
  title: 'Plan Integral de Salud, Hábitos & Biohacking',
  rootId: 'root',
  layout: 'circular',
  themeId: 'emerald',
  edgeStyle: 'bezier',
  edgeProfile: 'tapered',
  edgeWidth: 3.5,
  edgeDash: 'solid',
  horizontalGap: 56,
  verticalGap: 16,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  connectors: [
    {
      id: 'hw-conn-1',
      fromId: 'hw-sleep',
      toId: 'hw-mind',
      label: 'Recuperación del Sistema Nervioso',
      color: '#0284c7',
      shape: 'curved',
      curvature: -55,
      style: 'solid',
      width: 2.5,
      arrow: 'both',
      opacity: 0.95,
      layer: 'above',
    },
    {
      id: 'hw-conn-2',
      fromId: 'hw-exercise',
      toId: 'hw-nutrition',
      label: 'Síntesis Proteica & Recuperación Muscular',
      color: '#16a34a',
      shape: 'bezier',
      curvature: 60,
      style: 'dashed',
      width: 2.5,
      arrow: 'end',
      opacity: 0.9,
      layer: 'above',
    },
  ],
  nodes: {
    root: {
      id: 'root',
      text: '🌱 Longevidad & Alto Rendimiento',
      body: 'Protocolo holístico basado en ciencia: Optimización de sueño, nutrición celular, ejercicio y claridad mental',
      bodyFontSize: 11,
      bodyColor: '#064e3b',
      parentId: null,
      children: ['hw-sleep', 'hw-nutrition', 'hw-exercise', 'hw-mind'],
      side: 'root',
      shape: 'bubble',
      color: '#dcfce7',
      textColor: '#14532d',
      borderColor: '#22c55e',
      borderWidth: 3,
      bold: true,
      fontSize: 18,
      textAlign: 'center',
      imageUrl: TEMPLATE_SVGS.healthHeart,
      imagePosition: 'top',
      imageWidth: 64,
      tags: ['Salud', 'Hábitos', 'Bienestar', 'Biohacking'],
    },
    'hw-sleep': {
      id: 'hw-sleep',
      text: '😴 1. Higiene del Sueño (8 Horas)',
      body: 'Horario constante de descanso, habitación a 18°C y bloqueo de luz azul 90 min antes',
      bodyFontSize: 10,
      bodyColor: '#1e3a8a',
      parentId: 'root',
      children: ['hw-circadian'],
      side: 'right',
      shape: 'bubble',
      color: '#dbeafe',
      textColor: '#1e40af',
      borderColor: '#3b82f6',
      borderWidth: 2,
      bold: true,
    },
    'hw-circadian': {
      id: 'hw-circadian',
      text: 'Luz Solar Matutina (15 min)',
      body: 'Anclaje del ritmo circadiano y activación natural de cortisol al despertar',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'hw-sleep',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#ffffff',
      textColor: '#1d4ed8',
      borderColor: '#93c5fd',
    },
    'hw-nutrition': {
      id: 'hw-nutrition',
      text: '🥗 2. Nutrición & Hidratación',
      body: 'Comida real sin ultraprocesados, 1.8g proteína/kg y 3 litros de agua con electrolitos',
      bodyFontSize: 10,
      bodyColor: '#14532d',
      parentId: 'root',
      children: ['hw-fasting'],
      side: 'right',
      shape: 'bubble',
      color: '#f0fdf4',
      textColor: '#166534',
      borderColor: '#16a34a',
      borderWidth: 2,
      bold: true,
      imageUrl: TEMPLATE_SVGS.sustainabilityLeaf,
      imagePosition: 'left',
      imageWidth: 36,
    },
    'hw-fasting': {
      id: 'hw-fasting',
      text: 'Ventana de Ayuno 14/10',
      body: 'Favorece la autofagia celular y descanso del sistema digestivo durante la noche',
      bodyFontSize: 9.5,
      bodyColor: '#475569',
      parentId: 'hw-nutrition',
      children: [],
      side: 'right',
      shape: 'pill',
      color: '#ffffff',
      textColor: '#15803d',
      borderColor: '#86efac',
    },
    'hw-exercise': {
      id: 'hw-exercise',
      text: '🏋️ 3. Entrenamiento Físico Mixto',
      body: 'Fuerza 4x/semana + 150 min de cardio Zona 2 + 1 sesión de alta intensidad (VO2 Max)',
      bodyFontSize: 10,
      bodyColor: '#78350f',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#fef3c7',
      textColor: '#92400e',
      borderColor: '#f59e0b',
      borderWidth: 2,
      bold: true,
    },
    'hw-mind': {
      id: 'hw-mind',
      text: '🧘 4. Gestión del Estrés & Mente',
      body: 'Meditación mindfulness 10 min, escritura de gratitud y pausas de respiración fisiológica',
      bodyFontSize: 10,
      bodyColor: '#701a75',
      parentId: 'root',
      children: [],
      side: 'left',
      shape: 'bubble',
      color: '#fdf4ff',
      textColor: '#86198f',
      borderColor: '#d946ef',
      borderWidth: 2,
      bold: true,
    },
  },
};
\\n

## src/utils/connectorUtils.ts

\\ts
import { Connector } from '../types/mindmap';

export interface ConnectorGeometry {
  pathD: string;
  cpX: number;
  cpY: number;
  midX: number;
  midY: number;
  labelX: number;
  labelY: number;
}

/**
 * Calculates SVG path data and control point positions for cross connectors.
 */
export function calculateConnectorGeometry(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  conn: Connector
): ConnectorGeometry {
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy) || 1;

  // Normal unit vector (perpendicular to direct line)
  const nx = -dy / dist;
  const ny = dx / dist;

  const curvature = conn.curvature !== undefined ? conn.curvature : -50;

  let cpX: number;
  let cpY: number;

  if (conn.controlPoint) {
    cpX = conn.controlPoint.x;
    cpY = conn.controlPoint.y;
  } else {
    cpX = midX + nx * curvature;
    cpY = midY + ny * curvature;
  }

  const shape = conn.shape || 'curved';
  let pathD = '';
  let labelX = midX;
  let labelY = midY;

  switch (shape) {
    case 'straight':
      pathD = `M ${fromX} ${fromY} L ${toX} ${toY}`;
      labelX = midX;
      labelY = midY - 6;
      break;

    case 'step': {
      // Orthogonal step line through control point or midX
      const cornerX = conn.controlPoint ? cpX : midX;
      pathD = `M ${fromX} ${fromY} L ${cornerX} ${fromY} L ${cornerX} ${toY} L ${toX} ${toY}`;
      labelX = cornerX;
      labelY = (fromY + toY) / 2 - 6;
      break;
    }

    case 'bezier': {
      // Cubic Bézier / S-Curve
      const cp1X = fromX + (cpX - fromX) * 0.75;
      const cp1Y = fromY + (cpY - fromY) * 0.75;
      const cp2X = toX + (cpX - toX) * 0.75;
      const cp2Y = toY + (cpY - toY) * 0.75;
      pathD = `M ${fromX} ${fromY} C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${toX} ${toY}`;
      // Point at t = 0.5 on cubic Bézier
      labelX = 0.125 * fromX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * toX;
      labelY = 0.125 * fromY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * toY - 6;
      break;
    }

    case 'curved':
    default: {
      // Quadratic Bézier curve
      pathD = `M ${fromX} ${fromY} Q ${cpX} ${cpY} ${toX} ${toY}`;
      // Point at t = 0.5 on quadratic Bézier: 0.25*P0 + 0.5*CP + 0.25*P1
      labelX = 0.25 * fromX + 0.5 * cpX + 0.25 * toX;
      labelY = 0.25 * fromY + 0.5 * cpY + 0.25 * toY - 6;
      break;
    }
  }

  return {
    pathD,
    cpX,
    cpY,
    midX,
    midY,
    labelX,
    labelY,
  };
}
\\n

## src/utils/freeplaneConverter.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/freeplaneConverter.ts'
\\n

## src/utils/htmlExporter.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/htmlExporter.ts'
\\n

## src/utils/iconMap.tsx

\\tsx
import React from 'react';
import { getVectorIconItem, VECTOR_ICON_PACK } from './vectorIconPack';
import {
  Check,
  Star,
  Flag,
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  Heart,
  Calendar,
  Clock,
  Flame,
  Bookmark,
  Sparkles,
  Smile,
  Frown,
  ThumbsUp,
  Tag,
  FileText,
  Link,
  Keyboard,
  Layout,
  Presentation,
  FileCode,
  Globe,
  Image,
  Database,
  ShieldCheck,
  CheckCircle,
  Activity,
  Zap,
  Target,
  Award,
} from 'lucide-react';

export interface IconDefinition {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  color?: string;
}

// Available curated starter icons for quick access
export const AVAILABLE_ICONS: IconDefinition[] = [
  // Priorities
  { id: 'p1', name: 'Prioridad 1', category: 'priority', icon: <span className="font-bold text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span> },
  { id: 'p2', name: 'Prioridad 2', category: 'priority', icon: <span className="font-bold text-xs bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center">2</span> },
  { id: 'p3', name: 'Prioridad 3', category: 'priority', icon: <span className="font-bold text-xs bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">3</span> },
  { id: 'p4', name: 'Prioridad 4', category: 'priority', icon: <span className="font-bold text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">4</span> },
  { id: 'p5', name: 'Prioridad 5', category: 'priority', icon: <span className="font-bold text-xs bg-slate-500 text-white rounded-full w-4 h-4 flex items-center justify-center">5</span> },
  
  // Status
  { id: 'check', name: 'Completado', category: 'status', icon: <Check className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'check-circle', name: 'Verificado', category: 'status', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'activity', name: 'En curso', category: 'status', icon: <Activity className="w-3.5 h-3.5 text-blue-600" /> },
  { id: 'alert-triangle', name: 'Atención', category: 'status', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> },
  { id: 'help-circle', name: 'Duda', category: 'status', icon: <HelpCircle className="w-3.5 h-3.5 text-purple-600" /> },
  { id: 'clock', name: 'Pendiente', category: 'status', icon: <Clock className="w-3.5 h-3.5 text-indigo-600" /> },

  // Markers & Highlights
  { id: 'star', name: 'Estrella / Favorito', category: 'markers', icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> },
  { id: 'flag', name: 'Bandera', category: 'markers', icon: <Flag className="w-3.5 h-3.5 text-red-500 fill-red-500" /> },
  { id: 'lightbulb', name: 'Idea', category: 'markers', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'flame', name: 'Urgente / Fuego', category: 'markers', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
  { id: 'zap', name: 'Rápido', category: 'markers', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
  { id: 'target', name: 'Objetivo', category: 'markers', icon: <Target className="w-3.5 h-3.5 text-rose-500" /> },
  { id: 'award', name: 'Premio / Hito', category: 'markers', icon: <Award className="w-3.5 h-3.5 text-purple-500" /> },
  
  // General
  { id: 'heart', name: 'Me gusta', category: 'general', icon: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" /> },
  { id: 'sparkles', name: 'Destacado', category: 'general', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> },
  { id: 'thumbs-up', name: 'Aprobado', category: 'general', icon: <ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> },
  { id: 'calendar', name: 'Fecha', category: 'general', icon: <Calendar className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'tag', name: 'Etiqueta', category: 'general', icon: <Tag className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'file-text', name: 'Documento', category: 'general', icon: <FileText className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'link', name: 'Conexión', category: 'general', icon: <Link className="w-3.5 h-3.5 text-blue-500" /> },
  { id: 'keyboard', name: 'Teclado', category: 'general', icon: <Keyboard className="w-3.5 h-3.5 text-slate-600" /> },
  { id: 'globe', name: 'Web', category: 'general', icon: <Globe className="w-3.5 h-3.5 text-emerald-600" /> },
  { id: 'database', name: 'Base de datos', category: 'general', icon: <Database className="w-3.5 h-3.5 text-indigo-600" /> },
  { id: 'shield-check', name: 'Seguridad', category: 'general', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> },
];

/**
 * Universal vector icon renderer supporting all 500+ vector SVG icons with optional custom color and size
 */
export function renderNodeIcon(iconId: string, className: string | number = 'w-3.5 h-3.5', customColor?: string, customSize?: number): React.ReactNode {
  const safeClassName = typeof className === 'string' ? className : 'w-3.5 h-3.5';
  const finalSize = typeof className === 'number' ? className : customSize;
  const finalColor = typeof className === 'number' && typeof customColor === 'string' ? customColor : customColor;

  const style: React.CSSProperties = {
    ...(finalColor ? { color: finalColor } : {}),
    ...(finalSize ? { width: `${finalSize}px`, height: `${finalSize}px` } : {}),
  };

  // 1. Check in 500+ vector icon repository
  const vectorItem = getVectorIconItem(iconId);
  if (vectorItem) {
    const IconComponent = vectorItem.icon;
    return <IconComponent className={safeClassName} style={style} />;
  }

  // 2. Fallback check in available icons list
  const found = AVAILABLE_ICONS.find(i => i.id === iconId);
  if (found) {
    if (customColor || customSize) {
      return <span style={style} className="inline-flex items-center justify-center">{found.icon}</span>;
    }
    return found.icon;
  }
  
  // 3. Fallback for common aliases and legacy names
  switch (iconId) {
    case 'idea':
    case 'lightbulb': return <Lightbulb className={`${className} ${customColor ? '' : 'text-amber-500'}`} style={style} />;
    case 'check': return <Check className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    case 'star': return <Star className={`${className} ${customColor ? '' : 'text-amber-500 fill-amber-400'}`} style={style} />;
    case 'flag-red': return <Flag className={`${className} ${customColor ? '' : 'text-red-500 fill-red-500'}`} style={style} />;
    case 'flag-yellow': return <Flag className={`${className} ${customColor ? '' : 'text-yellow-500 fill-yellow-400'}`} style={style} />;
    case 'flag-blue': return <Flag className={`${className} ${customColor ? '' : 'text-blue-500 fill-blue-400'}`} style={style} />;
    case 'keyboard': return <Keyboard className={`${className} ${customColor ? '' : 'text-slate-600'}`} style={style} />;
    case 'sparkles': return <Sparkles className={`${className} ${customColor ? '' : 'text-indigo-500'}`} style={style} />;
    case 'activity': return <Activity className={`${className} ${customColor ? '' : 'text-blue-600'}`} style={style} />;
    case 'file-text': return <FileText className={`${className} ${customColor ? '' : 'text-slate-600'}`} style={style} />;
    case 'link': return <Link className={`${className} ${customColor ? '' : 'text-blue-500'}`} style={style} />;
    case 'layout': return <Layout className={`${className} ${customColor ? '' : 'text-slate-600'}`} style={style} />;
    case 'presentation': return <Presentation className={`${className} ${customColor ? '' : 'text-purple-600'}`} style={style} />;
    case 'file-code': return <FileCode className={`${className} ${customColor ? '' : 'text-orange-600'}`} style={style} />;
    case 'globe': return <Globe className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    case 'image': return <Image className={`${className} ${customColor ? '' : 'text-blue-500'}`} style={style} />;
    case 'database': return <Database className={`${className} ${customColor ? '' : 'text-indigo-600'}`} style={style} />;
    case 'shield-check': return <ShieldCheck className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    case 'check-circle': return <CheckCircle className={`${className} ${customColor ? '' : 'text-emerald-600'}`} style={style} />;
    default:
      return <span className="text-xs" style={style}>{iconId}</span>;
  }
}
\\n

## src/utils/layoutEngine.ts

\\ts
import { MindMap, MindNode, CalculatedNodeLayout, NodeSide, EdgeProfile } from '../types/mindmap';

const HORIZONTAL_GAP = 54;
const VERTICAL_GAP = 14;
const ROOT_HORIZONTAL_GAP = 68;

// Estimation of node size based on text and components
export function estimateNodeSize(
  node: MindNode,
  mapOptions?: {
    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
    showAllNotesInline?: boolean;
  }
): { width: number; height: number } {
  const boxShape = !node.shape || node.shape === 'bubble' || node.shape === 'rectangle';
  const hasCustomW = Boolean(node.customWidth && node.customWidth > 0);
  const hasCustomH = Boolean(node.customHeight && node.customHeight > 0);

  // Con ambas dimensiones personalizadas manda el usuario.
  if (hasCustomW && hasCustomH) {
    return estimateNodeSizeInner(node, mapOptions, undefined);
  }

  // Solo ancho personalizado: la altura es la natural envuelta (ceñida).
  if (boxShape && hasCustomW && !hasCustomH) {
    return estimateNodeSizeInner(node, mapOptions, undefined);
  }

  // Solo alto personalizado: el ancho es el natural (ceñido).
  if (boxShape && !hasCustomW && hasCustomH) {
    return estimateNodeSizeInner(node, mapOptions, undefined);
  }

  // Totalmente automático en forma de caja: 4:3 como GUÍA de envoltura.
  // Se calcula el tamaño natural, se deriva un ancho objetivo de igual área
  // en 4:3 y se re-envuelve el texto a ese ancho. La altura resultante es
  // la natural envuelta (el nodo se ciñe al contenido, sin huecos).
  if (boxShape) {
    const natural = estimateNodeSizeInner(node, mapOptions, undefined);
    const targetW = Math.min(420, Math.max(80, Math.round(Math.sqrt(natural.width * natural.height * (4 / 3)))));
    return estimateNodeSizeInner(node, mapOptions, targetW);
  }

  // Hexágono automático: el contenido visible es el 68% (polígono en punta),
  // así que se envuelve angosto y la CAJA se deriva del contenido acotado:
  // si hay mucho contenido, el nodo crece en vez de desbordar.
  if (!hasCustomW && !hasCustomH && node.shape === 'hexagon') {
    const natural = estimateNodeSizeInner(node, mapOptions, undefined);
    const guide = Math.min(420, Math.max(80, Math.round(Math.sqrt(natural.width * natural.height * (4 / 3)))));
    const targetW = Math.min(300, Math.max(100, Math.round(guide * 0.72)));
    const wrapped = estimateNodeSizeInner(node, mapOptions, targetW);
    return {
      width: Math.max(wrapped.width, Math.round(targetW / 0.68)),
      height: wrapped.height,
    };
  }

  // Square/circle automáticos: cuadrado MÍNIMO que encaja el contenido
  // (búsqueda binaria del ancho menor cuya altura envuelta cabe en el lado),
  // en vez del lado máximo que dejaba huecos.
  if (!hasCustomW && !hasCustomH && (node.shape === 'square' || node.shape === 'circle')) {
    const natural = estimateNodeSizeInner(node, mapOptions, undefined);
    let lo = 48;
    let hi = Math.max(natural.width, natural.height, 48);
    for (let i = 0; i < 8; i++) {
      const mid = Math.round((lo + hi) / 2);
      const probe = estimateNodeSizeInner(node, mapOptions, mid);
      if (probe.height <= mid) hi = mid;
      else lo = mid + 1;
      if (lo >= hi) break;
    }
    return { width: hi, height: hi };
  }

  return estimateNodeSizeInner(node, mapOptions, undefined);
}

function estimateNodeSizeInner(
  node: MindNode,
  mapOptions: {
    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
    showAllNotesInline?: boolean;
  } | undefined,
  forcedWidth?: number
): { width: number; height: number } {
  const isRoot = !node.parentId;
  const fontSize = node.fontSize || (isRoot ? 16 : 14);
  
  const isBodyHidden = node.hideBody || mapOptions?.hideAllBodies;
  const isImageHidden = node.hideImage || mapOptions?.hideAllImages;
  const isTagsHidden = node.hideTags || mapOptions?.hideAllTags;
  const isIconsHidden = node.hideIcons || mapOptions?.hideAllIcons;
  const isLinkHidden = node.hideLink || mapOptions?.hideAllLinks;
  const isProgressHidden = node.hideProgress;

  // Base padding (ceñido: acompaña al padding visual del nodo)
  const paddingX = isRoot ? 16 : 10;
  const paddingY = isRoot ? 8 : 6;
  
  // Extra width / height for icons, progress, badges
  const iconPos = node.iconPosition || 'top';
  const progPos = node.progressPosition || 'top';

  let extraWidth = 0;
  let iconExtraHeight = 0;

  if (!isIconsHidden && node.icons && node.icons.length > 0) {
    if (iconPos === 'left') {
      extraWidth += node.icons.length * 20 + 6;
    } else {
      iconExtraHeight = Math.max(iconExtraHeight, 22);
    }
  }
  if (!isProgressHidden && node.progress !== undefined) {
    if (progPos === 'left') {
      extraWidth += 24;
    } else {
      iconExtraHeight = Math.max(iconExtraHeight, 22);
    }
  }
  if (!isLinkHidden && node.link) {
    extraWidth += 18;
  }
  if (node.note) {
    extraWidth += 18;
  }

  // Node Image dimensions (hexágono: tope 96px como en el render)
  let imageExtraHeight = 0;
  let imageMinWidth = 0;
  const hexImgCap = node.shape === 'hexagon' ? 96 : Number.POSITIVE_INFINITY;
  if (!isImageHidden && node.imageUrl) {
    if (node.imagePosition === 'background') {
      imageMinWidth = 70;
      imageExtraHeight = 20;
    } else if (node.imagePosition === 'left' || node.imagePosition === 'right') {
      const imgW = Math.min(node.imageWidth || 100, hexImgCap);
      const imgH = node.imageHeight || Math.round(imgW * 0.75);
      extraWidth += imgW + 10;
      imageExtraHeight = Math.max(0, imgH - 28);
    } else {
      // 'top', 'bottom', 'between'
      const imgW = Math.min(node.imageWidth || 140, hexImgCap);
      const imgH = node.imageHeight || Math.round(imgW * 0.65);
      imageExtraHeight = imgH + 12;
      imageMinWidth = imgW + 16;
    }
  }

  // Tags are rendered in the bottom row of the node
  let extraHeight = 0;
  let tagMinWidth = 0;
  if (!isTagsHidden && node.tags && node.tags.length > 0) {
    extraHeight += 22; // Tag bar height + top border/margin
    // En hexágono la columna es angosta: reserva una fila extra de tags
    if (node.shape === 'hexagon') extraHeight += 22;
    tagMinWidth = Math.min(node.tags.reduce((acc, t) => acc + t.length * 7 + 16, 0), 280);
  }

  // Links are rendered with a dedicated badge
  let linkExtraHeight = 0;
  let linkMinWidth = 0;
  if (!isLinkHidden && node.link && node.link.trim().length > 0) {
    linkExtraHeight += 24;
    const cleanUrl = node.link.replace(/^https?:\/\//, '').replace(/^www\./, '');
    linkMinWidth = Math.min(cleanUrl.length * 6.5 + 28, 220);
  }
  
  const charWidth = fontSize * 0.58;
  const lines = (node.text || ' ').split('\n');

  // Check if there is a specified custom width or symmetrical 1:1 shape
  // (forcedWidth re-envuelve el texto para el 4:3 compacto sin tocar el nodo)
  let customW = node.customWidth ?? forcedWidth;
  if (node.shape === 'square' || node.shape === 'circle') {
    customW = Math.max(node.customWidth || 0, node.customHeight || 0, forcedWidth || 0);
  }

  let titleWidth = 0;
  let titleHeight = 0;

  if (customW && customW > 0) {
    // Width is constrained by user slider: wrap lines according to available width
    const availTextWidth = Math.max(customW - (paddingX * 2 + extraWidth), 30);
    const charsPerLine = Math.max(Math.floor(availTextWidth / charWidth), 1);
    let wrappedTitleLines = 0;
    for (const l of lines) {
      wrappedTitleLines += Math.max(Math.ceil((l.length || 1) / charsPerLine), 1);
    }
    titleWidth = availTextWidth;
    titleHeight = wrappedTitleLines * (fontSize * 1.38);
  } else {
    // Width is unconstrained / auto
    const maxLineLength = Math.max(...lines.map(l => l.length), 1);
    titleWidth = Math.min(Math.max(maxLineLength * charWidth, 40), 400);
    titleHeight = lines.length * (fontSize * 1.35);
  }

  // Body text dimensions
  let bodyWidth = 0;
  let bodyHeight = 0;
  if (!isBodyHidden && node.body && node.body.trim().length > 0) {
    const bodyFontSize = node.bodyFontSize || (isRoot ? 13 : 12);
    const bodyLines = node.body.split('\n');
    const bodyCharWidth = bodyFontSize * 0.56;

    if (customW && customW > 0) {
      const availBodyWidth = Math.max(customW - (paddingX * 2), 30);
      const bodyCharsPerLine = Math.max(Math.floor(availBodyWidth / bodyCharWidth), 1);
      let wrappedBodyLines = 0;
      for (const bl of bodyLines) {
        wrappedBodyLines += Math.max(Math.ceil((bl.length || 1) / bodyCharsPerLine), 1);
      }
      bodyWidth = availBodyWidth;
      bodyHeight = wrappedBodyLines * (bodyFontSize * 1.4) + 6;
    } else {
      const maxBodyLineLength = Math.max(...bodyLines.map(l => l.length), 1);
      bodyWidth = Math.min(Math.max(maxBodyLineLength * bodyCharWidth, 40), 420);
      bodyHeight = bodyLines.length * (bodyFontSize * 1.4) + 6;
    }
  }

  // Inline Note dimensions (when showNoteInline is active)
  const isNoteInline = Boolean((node.showNoteInline || mapOptions?.showAllNotesInline) && node.note && node.note.trim().length > 0);
  let noteInlineWidth = 0;
  let noteInlineHeight = 0;
  if (isNoteInline) {
    const noteLines = (node.note || '').split('\n');
    const noteCharWidth = 6.2;
    if (customW && customW > 0) {
      const availNoteWidth = Math.max(customW - (paddingX * 2), 40);
      const noteCharsPerLine = Math.max(Math.floor(availNoteWidth / noteCharWidth), 1);
      let wrappedNoteLines = 0;
      for (const nl of noteLines) {
        wrappedNoteLines += Math.max(Math.ceil((nl.length || 1) / noteCharsPerLine), 1);
      }
      noteInlineWidth = availNoteWidth;
      noteInlineHeight = wrappedNoteLines * 16 + 14;
    } else {
      const maxNoteLineLength = Math.max(...noteLines.map(l => l.length), 1);
      noteInlineWidth = Math.min(Math.max(maxNoteLineLength * noteCharWidth, 60), 400);
      noteInlineHeight = Math.min(noteLines.length * 16 + 14, 250);
    }
  }

  const contentWidth = Math.max(titleWidth, bodyWidth, noteInlineWidth);
  const contentHeight = titleHeight + bodyHeight + noteInlineHeight;

  let width = Math.round(Math.max(contentWidth + paddingX * 2 + extraWidth, tagMinWidth + paddingX * 2, linkMinWidth + paddingX * 2, imageMinWidth + paddingX * 2));
  let height = Math.round(Math.max(contentHeight + paddingY * 2 + extraHeight + iconExtraHeight + linkExtraHeight + imageExtraHeight, (isRoot ? 48 : 34) + extraHeight + iconExtraHeight + linkExtraHeight + imageExtraHeight));

  // Custom User-Defined Width and Height
  if (node.customWidth && node.customWidth > 0) {
    width = Math.max(width, node.customWidth);
  }
  if (node.customHeight && node.customHeight > 0) {
    height = Math.max(height, node.customHeight);
  }

  // Shape specific dimensions adjustments
  if ((node.bgType === 'image' && node.bgImageMode === 'fit') || (node.imageUrl && node.imagePosition === 'fit')) {
    const scale = node.customWidth || node.imageWidth || 160;
    width = scale;
    height = node.customHeight || Math.round(scale * 0.75);
  } else if (node.shape === 'square' || node.shape === 'circle') {
    const dim = Math.max(width, height, node.customWidth || 0, node.customHeight || 0, 48);
    width = dim;
    height = dim;
  } else if (node.shape === 'star') {
    const baseW = Math.max(width + 48, 100);
    width = node.customWidth || baseW;
    // Double default star height so it's upright and tall rather than flat
    height = node.customHeight || Math.round(Math.max(height * 2.2, width * 0.95, 96));
  } else if (node.shape === 'bubble') {
    width = node.customWidth || (width + 36);
    height = node.customHeight || (height + 20);
  } else if (node.shape === 'hexagon') {
    width = node.customWidth || (width + 48);
    height = node.customHeight || Math.max(height, 42);
  } else if (node.shape === 'arrow') {
    width = node.customWidth || (width + 52);
    height = node.customHeight || Math.max(height, 42);
  }

  return { width, height };
}

// ----------------------------------------------------
// 1. HORIZONTAL SUBTREE METRICS (Standard, Left, Right)
// ----------------------------------------------------
interface SubTreeLayout {
  id: string;
  width: number;
  height: number;
  subtreeHeight: number;
  childrenLayouts: SubTreeLayout[];
}

export function nodeOrDescendantHasCloud(nodeId: string, nodes: Record<string, MindNode>): boolean {
  const node = nodes[nodeId];
  if (!node) return false;
  if (node.cloud?.enabled) return true;
  if (node.children && !node.folded) {
    for (const cid of node.children) {
      if (nodeOrDescendantHasCloud(cid, nodes)) return true;
    }
  }
  return false;
}

function calculateSubTreeMetrics(
  nodeId: string,
  nodes: Record<string, MindNode>,
  verticalGap: number = VERTICAL_GAP,
  mapOptions?: {
    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
  }
): SubTreeLayout {
  const node = nodes[nodeId];
  if (!node) {
    return { id: nodeId, width: 60, height: 30, subtreeHeight: 30, childrenLayouts: [] };
  }

  const { width, height } = estimateNodeSize(node, mapOptions);
  const hasCloud = Boolean(node.cloud?.enabled);
  const cloudPad = hasCloud ? 36 : 0;

  if (node.folded || !node.children || node.children.length === 0) {
    return {
      id: nodeId,
      width: width + cloudPad,
      height: height + cloudPad,
      subtreeHeight: height + cloudPad,
      childrenLayouts: [],
    };
  }

  const childrenLayouts = node.children
    .filter(childId => Boolean(nodes[childId]))
    .map(childId => calculateSubTreeMetrics(childId, nodes, verticalGap, mapOptions));

  let totalChildrenHeight = 0;
  for (let i = 0; i < childrenLayouts.length; i++) {
    totalChildrenHeight += childrenLayouts[i].subtreeHeight;
    if (i < childrenLayouts.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? verticalGap + 36
        : (currHasCloud || nextHasCloud)
        ? verticalGap + 24
        : verticalGap;
      totalChildrenHeight += gap;
    }
  }

  const subtreeHeight = Math.max(height + cloudPad, totalChildrenHeight + cloudPad);

  return {
    id: nodeId,
    width: width + cloudPad,
    height: height + cloudPad,
    subtreeHeight,
    childrenLayouts,
  };
}

// ----------------------------------------------------
// 2. VERTICAL SUBTREE METRICS (Top, Bottom, Balanced-Horizontal)
// ----------------------------------------------------
interface SubTreeVerticalLayout {
  id: string;
  width: number;
  height: number;
  subtreeWidth: number;
  childrenLayouts: SubTreeVerticalLayout[];
}

function calculateSubTreeVerticalMetrics(
  nodeId: string,
  nodes: Record<string, MindNode>,
  horizontalGap: number = HORIZONTAL_GAP,
  mapOptions?: {
    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
  }
): SubTreeVerticalLayout {
  const node = nodes[nodeId];
  if (!node) {
    return { id: nodeId, width: 60, height: 30, subtreeWidth: 60, childrenLayouts: [] };
  }

  const { width, height } = estimateNodeSize(node, mapOptions);
  const hasCloud = Boolean(node.cloud?.enabled);
  const cloudPad = hasCloud ? 36 : 0;

  if (node.folded || !node.children || node.children.length === 0) {
    return {
      id: nodeId,
      width: width + cloudPad,
      height: height + cloudPad,
      subtreeWidth: width + cloudPad,
      childrenLayouts: [],
    };
  }

  const childrenLayouts = node.children
    .filter(childId => Boolean(nodes[childId]))
    .map(childId => calculateSubTreeVerticalMetrics(childId, nodes, horizontalGap, mapOptions));

  let totalChildrenWidth = 0;
  for (let i = 0; i < childrenLayouts.length; i++) {
    totalChildrenWidth += childrenLayouts[i].subtreeWidth;
    if (i < childrenLayouts.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? horizontalGap + 36
        : (currHasCloud || nextHasCloud)
        ? horizontalGap + 24
        : horizontalGap;
      totalChildrenWidth += gap;
    }
  }

  const subtreeWidth = Math.max(width + cloudPad, totalChildrenWidth + cloudPad);

  return {
    id: nodeId,
    width: width + cloudPad,
    height: height + cloudPad,
    subtreeWidth,
    childrenLayouts,
  };
}

// ----------------------------------------------------
// 3. MAIN COMPUTE LAYOUT FUNCTION
// ----------------------------------------------------
export function computeMindMapLayout(
  mindMap: MindMap,
  canvasCenter: { x: number; y: number } = { x: 0, y: 0 }
): Map<string, CalculatedNodeLayout> {
  const layoutMap = new Map<string, CalculatedNodeLayout>();
  const rootNode = mindMap.nodes[mindMap.rootId];
  
  if (!rootNode) return layoutMap;

  const hGap = mindMap.horizontalGap !== undefined ? mindMap.horizontalGap : HORIZONTAL_GAP;
  const vGap = mindMap.verticalGap !== undefined ? mindMap.verticalGap : VERTICAL_GAP;
  const rootHGap = Math.max(48, Math.round(hGap * 1.3));

  // Vertical layout specific gaps (generous vertical levels and sibling horizontal breathing room)
  const vertSiblingHGap = Math.max(20, Math.round(hGap * 0.9 + 10));
  const vertLevelVGap = Math.max(50, Math.round(vGap * 2.8 + 45));
  const vertRootVGap = Math.max(70, Math.round(vGap * 3.4 + 60));

  const mapOptions = {
    hideAllBodies: mindMap.hideAllBodies,
    hideAllImages: mindMap.hideAllImages,
    hideAllTags: mindMap.hideAllTags,
    hideAllIcons: mindMap.hideAllIcons,
    hideAllLinks: mindMap.hideAllLinks,
  };
  const rootSize = estimateNodeSize(rootNode, mapOptions);
  const rootLayout: CalculatedNodeLayout = {
    id: rootNode.id,
    x: canvasCenter.x - rootSize.width / 2,
    y: canvasCenter.y - rootSize.height / 2,
    width: rootSize.width,
    height: rootSize.height,
    side: 'root',
    depth: 0,
    branchIndex: 0,
    bounds: {
      minX: canvasCenter.x - rootSize.width / 2,
      maxX: canvasCenter.x + rootSize.width / 2,
      minY: canvasCenter.y - rootSize.height / 2,
      maxY: canvasCenter.y + rootSize.height / 2,
    },
  };
  layoutMap.set(rootNode.id, rootLayout);

  if (rootNode.folded || !rootNode.children || rootNode.children.length === 0) {
    return layoutMap;
  }

  const validChildren = rootNode.children.filter(id => Boolean(mindMap.nodes[id]));
  const layoutType = mindMap.layout || 'standard';

  // ------------------------------------------------------------------
  // MODE 1: RADIAL (Hijos agrupados alrededor de su propio padre local)
  // ------------------------------------------------------------------
  if (layoutType === 'radial') {
    layoutRadialTree(rootLayout, validChildren, mindMap.nodes, layoutMap, canvasCenter, hGap, vGap);
  }
  // ------------------------------------------------------------------
  // MODE 2: CIRCULAR CONCÉNTRICO (Capas concéntricas alrededor de la raíz)
  // ------------------------------------------------------------------
  else if (layoutType === 'circular') {
    layoutCircularTree(rootLayout, validChildren, mindMap.nodes, layoutMap, canvasCenter, hGap, vGap);
  }
  // ------------------------------------------------------------------
  // MODE 3: HACIA ABAJO (Organigrama descendente / Tree Down)
  // ------------------------------------------------------------------
  else if (layoutType === 'bottom' || layoutType === 'tree-down') {
    layoutVerticalBranch(validChildren, 'bottom', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
  }
  // ------------------------------------------------------------------
  // MODE 4: HACIA ARRIBA (Organigrama ascendente / Tree Up)
  // ------------------------------------------------------------------
  else if (layoutType === 'top') {
    layoutVerticalBranch(validChildren, 'top', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
  }
  // ------------------------------------------------------------------
  // MODE 5: EQUILIBRADO HORIZONTAL (Doble lado Arriba / Abajo)
  // ------------------------------------------------------------------
  else if (layoutType === 'balanced-horizontal') {
    const topChildren: string[] = [];
    const bottomChildren: string[] = [];

    validChildren.forEach((childId, idx) => {
      const child = mindMap.nodes[childId];
      if (child.side === 'top') {
        topChildren.push(childId);
      } else if (child.side === 'bottom') {
        bottomChildren.push(childId);
      } else {
        if (idx % 2 === 0) {
          bottomChildren.push(childId);
        } else {
          topChildren.push(childId);
        }
      }
    });

    layoutVerticalBranch(topChildren, 'top', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
    layoutVerticalBranch(bottomChildren, 'bottom', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
  }
  // ------------------------------------------------------------------
  // MODE 6, 7 & 8: EQUILIBRADO VERTICAL (STANDARD), SOLO DERECHA, SOLO IZQUIERDA
  // ------------------------------------------------------------------
  else {
    let rightChildren: string[] = [];
    let leftChildren: string[] = [];

    if (layoutType === 'right') {
      rightChildren = validChildren;
    } else if (layoutType === 'left') {
      leftChildren = validChildren;
    } else {
      // Standard dual layout (Equilibrado vertical)
      validChildren.forEach((childId, idx) => {
        const child = mindMap.nodes[childId];
        if (child.side === 'left') {
          leftChildren.push(childId);
        } else if (child.side === 'right') {
          rightChildren.push(childId);
        } else {
          if (idx % 2 === 0) {
            rightChildren.push(childId);
          } else {
            leftChildren.push(childId);
          }
        }
      });
    }

    // Layout Right Subtrees
    layoutBranchSide(rightChildren, 'right', rootLayout, mindMap.nodes, layoutMap, rootHGap, hGap, vGap);

    // Layout Left Subtrees
    layoutBranchSide(leftChildren, 'left', rootLayout, mindMap.nodes, layoutMap, rootHGap, hGap, vGap);
  }

  // Layout any free floating nodes
  Object.values(mindMap.nodes).forEach(node => {
    if (node.isFreeFloating && !layoutMap.has(node.id)) {
      const size = estimateNodeSize(node);
      const pos = node.freePosition || { x: canvasCenter.x + 200, y: canvasCenter.y - 150 };
      layoutMap.set(node.id, {
        id: node.id,
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
        side: 'right',
        depth: 1,
        branchIndex: 99,
        bounds: { minX: pos.x, maxX: pos.x + size.width, minY: pos.y, maxY: pos.y + size.height }
      });
    }
  });

  // Universal collision resolution pass across all layout types
  resolveLayoutCollisions(layoutMap, mindMap, canvasCenter, layoutType, hGap, vGap);

  return layoutMap;
}

// ----------------------------------------------------
// HORIZONTAL BRANCH LAYOUT (Right / Left)
// ----------------------------------------------------
function layoutBranchSide(
  childIds: string[],
  side: 'right' | 'left',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  rootHorizontalGap: number,
  horizontalGap: number,
  verticalGap: number
) {
  if (childIds.length === 0) return;

  const metricsList = childIds.map(id => calculateSubTreeMetrics(id, nodes, verticalGap));
  
  let totalHeight = 0;
  for (let i = 0; i < metricsList.length; i++) {
    totalHeight += metricsList[i].subtreeHeight;
    if (i < metricsList.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(metricsList[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(metricsList[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? verticalGap + 36
        : (currHasCloud || nextHasCloud)
        ? verticalGap + 24
        : verticalGap;
      totalHeight += gap;
    }
  }

  let startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

  metricsList.forEach((metric, branchIdx) => {
    const node = nodes[metric.id];
    const nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraHGap = hasCloud ? 16 : 0;
    
    let nodeX = 0;
    if (side === 'right') {
      nodeX = parentLayout.x + parentLayout.width + rootHorizontalGap + extraHGap;
    } else {
      nodeX = parentLayout.x - metric.width - rootHorizontalGap - extraHGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: nodeX,
        maxX: nodeX + metric.width,
        minY: startY,
        maxY: startY + metric.subtreeHeight,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutDescendants(metric.childrenLayouts, side, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = metricsList[branchIdx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? verticalGap + 36
      : (currHasCloud || nextHasCloud)
      ? verticalGap + 24
      : verticalGap;
    startY += metric.subtreeHeight + gap;
  });
}

function layoutDescendants(
  childrenMetrics: SubTreeLayout[],
  side: 'right' | 'left',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  branchIdx: number,
  horizontalGap: number,
  verticalGap: number
) {
  let totalHeight = 0;
  for (let i = 0; i < childrenMetrics.length; i++) {
    totalHeight += childrenMetrics[i].subtreeHeight;
    if (i < childrenMetrics.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? verticalGap + 36
        : (currHasCloud || nextHasCloud)
        ? verticalGap + 24
        : verticalGap;
      totalHeight += gap;
    }
  }

  let startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

  childrenMetrics.forEach((metric, idx) => {
    const node = nodes[metric.id];
    const nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraHGap = hasCloud ? 14 : 0;

    let nodeX = 0;
    if (side === 'right') {
      nodeX = parentLayout.x + parentLayout.width + horizontalGap + extraHGap;
    } else {
      nodeX = parentLayout.x - metric.width - horizontalGap - extraHGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: nodeX,
        maxX: nodeX + metric.width,
        minY: startY,
        maxY: startY + metric.subtreeHeight,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutDescendants(metric.childrenLayouts, side, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = childrenMetrics[idx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? verticalGap + 36
      : (currHasCloud || nextHasCloud)
      ? verticalGap + 24
      : verticalGap;
    startY += metric.subtreeHeight + gap;
  });
}

// ----------------------------------------------------
// VERTICAL BRANCH LAYOUT (Bottom / Top)
// ----------------------------------------------------
function layoutVerticalBranch(
  childIds: string[],
  direction: 'top' | 'bottom',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  rootVerticalGap: number,
  horizontalGap: number,
  verticalGap: number
) {
  if (childIds.length === 0) return;

  const metricsList = childIds.map(id => calculateSubTreeVerticalMetrics(id, nodes, horizontalGap));
  
  let totalWidth = 0;
  for (let i = 0; i < metricsList.length; i++) {
    totalWidth += metricsList[i].subtreeWidth;
    if (i < metricsList.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(metricsList[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(metricsList[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? horizontalGap + 36
        : (currHasCloud || nextHasCloud)
        ? horizontalGap + 24
        : horizontalGap;
      totalWidth += gap;
    }
  }

  let startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

  metricsList.forEach((metric, branchIdx) => {
    const node = nodes[metric.id];
    const nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraVGap = hasCloud ? 16 : 0;
    
    let nodeY = 0;
    if (direction === 'bottom') {
      nodeY = parentLayout.y + parentLayout.height + rootVerticalGap + extraVGap;
    } else {
      nodeY = parentLayout.y - metric.height - rootVerticalGap - extraVGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side: direction,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: startX,
        maxX: startX + metric.subtreeWidth,
        minY: nodeY,
        maxY: nodeY + metric.height,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutVerticalDescendants(metric.childrenLayouts, direction, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = metricsList[branchIdx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? horizontalGap + 36
      : (currHasCloud || nextHasCloud)
      ? horizontalGap + 24
      : horizontalGap;
    startX += metric.subtreeWidth + gap;
  });
}

function layoutVerticalDescendants(
  childrenMetrics: SubTreeVerticalLayout[],
  direction: 'top' | 'bottom',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  branchIdx: number,
  horizontalGap: number,
  verticalGap: number
) {
  let totalWidth = 0;
  for (let i = 0; i < childrenMetrics.length; i++) {
    totalWidth += childrenMetrics[i].subtreeWidth;
    if (i < childrenMetrics.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? horizontalGap + 36
        : (currHasCloud || nextHasCloud)
        ? horizontalGap + 24
        : horizontalGap;
      totalWidth += gap;
    }
  }

  let startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

  childrenMetrics.forEach((metric, idx) => {
    const node = nodes[metric.id];
    const nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraVGap = hasCloud ? 14 : 0;

    let nodeY = 0;
    if (direction === 'bottom') {
      nodeY = parentLayout.y + parentLayout.height + verticalGap + extraVGap;
    } else {
      nodeY = parentLayout.y - metric.height - verticalGap - extraVGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side: direction,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: startX,
        maxX: startX + metric.subtreeWidth,
        minY: nodeY,
        maxY: nodeY + metric.height,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutVerticalDescendants(metric.childrenLayouts, direction, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = childrenMetrics[idx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? horizontalGap + 36
      : (currHasCloud || nextHasCloud)
      ? horizontalGap + 24
      : horizontalGap;
    startX += metric.subtreeWidth + gap;
  });
}

// ----------------------------------------------------
// 4. RADIAL LAYOUT (Distribución angular uniforme de 360° y expansión radial concéntrica)
// ----------------------------------------------------
function layoutRadialTree(
  rootLayout: CalculatedNodeLayout,
  rootChildren: string[],
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  canvasCenter: { x: number; y: number },
  horizontalGap: number,
  verticalGap: number
) {
  if (rootChildren.length === 0) return;

  const count = rootChildren.length;

  // Measure maximum child dimensions
  let maxChildW = 90;
  let maxChildH = 34;
  rootChildren.forEach(cid => {
    const node = nodes[cid];
    if (node) {
      const size = estimateNodeSize(node);
      maxChildW = Math.max(maxChildW, size.width);
      maxChildH = Math.max(maxChildH, size.height);
    }
  });

  // Calculate base radius for level 1 (root to children)
  const sectorSpan = (2 * Math.PI) / count;
  const chordRequired = Math.max(maxChildW, maxChildH) + verticalGap + 28;
  const chordRadius = chordRequired / (2 * Math.sin(Math.max(0.04, sectorSpan / 2)));
  const rootClearance = (rootLayout.width + maxChildW) / 2 + horizontalGap + 50;
  const baseRadius = Math.max(190, chordRadius, rootClearance);

  // Distribute 360 degrees UNIFORMLY among all root children starting from top (-PI/2)
  rootChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    const startAngle = -Math.PI / 2 + idx * sectorSpan;
    const endAngle = startAngle + sectorSpan;
    const midAngle = startAngle + sectorSpan / 2;

    const childSize = estimateNodeSize(childNode);
    const centerX = canvasCenter.x + baseRadius * Math.cos(midAngle);
    const centerY = canvasCenter.y + baseRadius * Math.sin(midAngle);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'radial',
      depth: 1,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutRadialSubtree(
        childId,
        childLayout,
        startAngle,
        endAngle,
        baseRadius,
        2,
        nodes,
        layoutMap,
        canvasCenter,
        horizontalGap,
        verticalGap
      );
    }
  });
}

function layoutRadialSubtree(
  parentId: string,
  parentLayout: CalculatedNodeLayout,
  startAngle: number,
  endAngle: number,
  parentRadius: number,
  depth: number,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  canvasCenter: { x: number; y: number },
  horizontalGap: number,
  verticalGap: number
) {
  const parentNode = nodes[parentId];
  if (!parentNode || parentNode.folded || !parentNode.children || parentNode.children.length === 0) return;

  const validChildren = parentNode.children.filter(id => Boolean(nodes[id]));
  if (validChildren.length === 0) return;

  const count = validChildren.length;

  let maxChildW = 90;
  let maxChildH = 34;
  validChildren.forEach(cid => {
    const node = nodes[cid];
    if (node) {
      const size = estimateNodeSize(node);
      maxChildW = Math.max(maxChildW, size.width);
      maxChildH = Math.max(maxChildH, size.height);
    }
  });

  const sectorSpan = endAngle - startAngle;
  const availableSpan = Math.min(sectorSpan * 0.92, Math.PI * 0.85);
  const stepDist = (parentLayout.width + maxChildW) / 2 + horizontalGap + 40;
  
  // Calculate minimum radius so that adjacent siblings at this level do not overlap
  const childSlice = availableSpan / count;
  const reqChord = maxChildH + verticalGap + 18;
  const minChordRadius = reqChord / (2 * Math.sin(Math.max(0.04, childSlice / 2)));
  const currentRadius = Math.max(parentRadius + stepDist, minChordRadius);

  const parentMidAngle = (startAngle + endAngle) / 2;

  validChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    let midAngle = parentMidAngle;
    let childStartAngle = startAngle;
    let childEndAngle = endAngle;

    if (count === 1) {
      midAngle = parentMidAngle;
      childStartAngle = parentMidAngle - sectorSpan / 2;
      childEndAngle = parentMidAngle + sectorSpan / 2;
    } else {
      midAngle = parentMidAngle - availableSpan / 2 + (idx + 0.5) * childSlice;
      childStartAngle = midAngle - childSlice / 2;
      childEndAngle = midAngle + childSlice / 2;
    }

    const childSize = estimateNodeSize(childNode);
    const centerX = canvasCenter.x + currentRadius * Math.cos(midAngle);
    const centerY = canvasCenter.y + currentRadius * Math.sin(midAngle);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'radial',
      depth,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutRadialSubtree(
        childId,
        childLayout,
        childStartAngle,
        childEndAngle,
        currentRadius,
        depth + 1,
        nodes,
        layoutMap,
        canvasCenter,
        horizontalGap,
        verticalGap
      );
    }
  });
}

// ----------------------------------------------------
// 5. CIRCULAR CONCENTRIC LAYOUT (Concéntrico por capas con partición angular)
// ----------------------------------------------------
function getSubtreeLeafWeight(nodeId: string, nodes: Record<string, MindNode>): number {
  const node = nodes[nodeId];
  if (!node || node.folded || !node.children || node.children.length === 0) {
    return 1;
  }
  const validChildren = node.children.filter(cid => Boolean(nodes[cid]));
  if (validChildren.length === 0) return 1;

  return validChildren.reduce((acc, cid) => acc + getSubtreeLeafWeight(cid, nodes), 0);
}

function layoutCircularTree(
  rootLayout: CalculatedNodeLayout,
  rootChildren: string[],
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  canvasCenter: { x: number; y: number },
  horizontalGap: number,
  verticalGap: number
) {
  if (rootChildren.length === 0) return;

  const count = rootChildren.length;
  
  // Calculate maximum dimensions
  let maxChildW = 100;
  let maxChildH = 36;
  rootChildren.forEach(cid => {
    const node = nodes[cid];
    if (node) {
      const size = estimateNodeSize(node);
      maxChildW = Math.max(maxChildW, size.width);
      maxChildH = Math.max(maxChildH, size.height);
    }
  });

  const sectorSpan = (2 * Math.PI) / count;
  const reqChord = Math.max(maxChildW, maxChildH) + verticalGap + 36;
  const chordRadius = reqChord / (2 * Math.sin(Math.max(0.04, sectorSpan / 2)));
  const rootClearanceRadius = (rootLayout.width + maxChildW) / 2 + horizontalGap + 80;
  const baseRadius = Math.max(280, chordRadius, rootClearanceRadius);
  const ringStep = Math.max(220, horizontalGap * 2.5 + 100);

  rootChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    const startA = -Math.PI / 2 + (2 * Math.PI * idx) / count;
    const endA = startA + sectorSpan;
    const midA = (startA + endA) / 2;

    const childSize = estimateNodeSize(childNode);

    const centerX = canvasCenter.x + baseRadius * Math.cos(midA);
    const centerY = canvasCenter.y + baseRadius * Math.sin(midA);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'circular',
      depth: 1,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutCircularDescendants(
        childId,
        childLayout,
        startA,
        endA,
        2,
        baseRadius + ringStep,
        ringStep,
        canvasCenter,
        nodes,
        layoutMap,
        horizontalGap,
        verticalGap
      );
    }
  });
}

function layoutCircularDescendants(
  parentId: string,
  parentLayout: CalculatedNodeLayout,
  startAngle: number,
  endAngle: number,
  depth: number,
  currentRadius: number,
  ringStep: number,
  canvasCenter: { x: number; y: number },
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  horizontalGap: number,
  verticalGap: number
) {
  const parentNode = nodes[parentId];
  if (!parentNode || parentNode.folded || !parentNode.children || parentNode.children.length === 0) return;

  const validChildren = parentNode.children.filter(cid => Boolean(nodes[cid]));
  if (validChildren.length === 0) return;

  const weights = validChildren.map(cid => Math.max(1, getSubtreeLeafWeight(cid, nodes)));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;
  const totalSpan = endAngle - startAngle;

  let currA = startAngle;

  validChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    const weight = weights[idx];
    const arcSpan = (weight / totalWeight) * totalSpan;
    const subStart = currA;
    const subEnd = currA + arcSpan;
    const midA = (subStart + subEnd) / 2;

    const childSize = estimateNodeSize(childNode);

    // Guaranteed clearance on concentric ring
    const minChord = childSize.height + verticalGap + 24;
    const angleDelta = Math.max(0.03, arcSpan / 2);
    const chordClearance = minChord / (2 * Math.sin(angleDelta));
    const effectiveRadius = Math.max(currentRadius, chordClearance);

    const centerX = canvasCenter.x + effectiveRadius * Math.cos(midA);
    const centerY = canvasCenter.y + effectiveRadius * Math.sin(midA);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'circular',
      depth,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutCircularDescendants(
        childId,
        childLayout,
        subStart,
        subEnd,
        depth + 1,
        effectiveRadius + ringStep,
        ringStep,
        canvasCenter,
        nodes,
        layoutMap,
        horizontalGap,
        verticalGap
      );
    }

    currA += arcSpan;
  });
}

// ----------------------------------------------------
// 6. UNIVERSAL COLLISION RESOLUTION PASS (Prevents overlaps across all layouts)
// ----------------------------------------------------
function shiftSubtree(
  nodeId: string,
  dx: number,
  dy: number,
  layoutMap: Map<string, CalculatedNodeLayout>,
  getDescendantIds: (id: string) => string[]
) {
  const allIds = [nodeId, ...getDescendantIds(nodeId)];
  for (const id of allIds) {
    const layout = layoutMap.get(id);
    if (layout) {
      layout.x += dx;
      layout.y += dy;
      layout.bounds.minX += dx;
      layout.bounds.maxX += dx;
      layout.bounds.minY += dy;
      layout.bounds.maxY += dy;
    }
  }
}

function resolveLayoutCollisions(
  layoutMap: Map<string, CalculatedNodeLayout>,
  mindMap: MindMap,
  canvasCenter: { x: number; y: number },
  layoutType: string,
  horizontalGap: number,
  verticalGap: number
) {
  const rootId = mindMap.rootId;
  const nodeIds = Array.from(layoutMap.keys()).filter(id => id !== rootId);
  if (nodeIds.length < 2) return;

  const minGapX = Math.max(20, Math.round(horizontalGap * 0.4));
  const minGapY = Math.max(16, Math.round(verticalGap * 0.7));

  // Build tree hierarchy map (nodeId -> all descendant IDs)
  const descendantsMap = new Map<string, string[]>();
  function getDescendantIds(id: string): string[] {
    if (descendantsMap.has(id)) return descendantsMap.get(id)!;
    const node = mindMap.nodes[id];
    let list: string[] = [];
    if (node && node.children) {
      for (const cid of node.children) {
        if (layoutMap.has(cid)) {
          list.push(cid);
          list = list.concat(getDescendantIds(cid));
        }
      }
    }
    descendantsMap.set(id, list);
    return list;
  }

  // Helper to check if childId is inside parentId's subtree
  function isDescendantOf(childId: string, parentId: string): boolean {
    const descs = getDescendantIds(parentId);
    return descs.includes(childId);
  }

  // Iterative relaxation passes
  const MAX_PASSES = 32;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let hasCollision = false;

    // Pass A: Node vs Node collisions
    for (let i = 0; i < nodeIds.length; i++) {
      const aId = nodeIds[i];
      const a = layoutMap.get(aId);
      if (!a) continue;
      const aCenter = { x: a.x + a.width / 2, y: a.y + a.height / 2 };

      for (let j = i + 1; j < nodeIds.length; j++) {
        const bId = nodeIds[j];
        const b = layoutMap.get(bId);
        if (!b) continue;
        const bCenter = { x: b.x + b.width / 2, y: b.y + b.height / 2 };

        // Check if bounding boxes with safety margins overlap
        const overlapX = (a.width / 2 + b.width / 2 + minGapX) - Math.abs(aCenter.x - bCenter.x);
        const overlapY = (a.height / 2 + b.height / 2 + minGapY) - Math.abs(aCenter.y - bCenter.y);

        if (overlapX > 0 && overlapY > 0) {
          hasCollision = true;

          // Determine direction of resolution based on layout type
          if (layoutType === 'standard' || layoutType === 'left' || layoutType === 'right') {
            // Horizontal trees: push apart along Y
            const pushY = (overlapY / 2) + 3;
            const sign = aCenter.y <= bCenter.y ? -1 : 1;
            shiftSubtree(a.id, 0, sign * pushY, layoutMap, getDescendantIds);
            shiftSubtree(b.id, 0, -sign * pushY, layoutMap, getDescendantIds);
          } else if (
            layoutType === 'top' ||
            layoutType === 'bottom' ||
            layoutType === 'balanced-horizontal' ||
            layoutType === 'tree-down'
          ) {
            // Vertical trees: push apart along X
            const pushX = (overlapX / 2) + 3;
            const sign = aCenter.x <= bCenter.x ? -1 : 1;
            shiftSubtree(a.id, sign * pushX, 0, layoutMap, getDescendantIds);
            shiftSubtree(b.id, -sign * pushX, 0, layoutMap, getDescendantIds);
          } else {
            // Radial & Circular: push outward away from canvas center and each other
            let dx = bCenter.x - aCenter.x;
            let dy = bCenter.y - aCenter.y;
            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
              dx = bCenter.x - canvasCenter.x || 1;
              dy = bCenter.y - canvasCenter.y || 1;
            }
            const dist = Math.hypot(dx, dy) || 1;
            const pushDist = Math.max(overlapX, overlapY) / 2 + 5;

            const nx = dx / dist;
            const ny = dy / dist;

            if (a.depth > b.depth) {
              shiftSubtree(a.id, -nx * pushDist * 1.5, -ny * pushDist * 1.5, layoutMap, getDescendantIds);
            } else if (b.depth > a.depth) {
              shiftSubtree(b.id, nx * pushDist * 1.5, ny * pushDist * 1.5, layoutMap, getDescendantIds);
            } else {
              shiftSubtree(a.id, -nx * pushDist, -ny * pushDist, layoutMap, getDescendantIds);
              shiftSubtree(b.id, nx * pushDist, ny * pushDist, layoutMap, getDescendantIds);
            }
          }
        }
      }
    }

    // Pass B: Cloud vs Node & Cloud vs Cloud collision resolution
    const cloudNodes = nodeIds.filter(id => Boolean(mindMap.nodes[id]?.cloud?.enabled));
    if (cloudNodes.length > 0) {
      const cloudGap = 16;
      for (const cId of cloudNodes) {
        const cBounds = computeCloudBounds(cId, mindMap.nodes, layoutMap);
        if (!cBounds) continue;
        const cCenter = { x: cBounds.x + cBounds.width / 2, y: cBounds.y + cBounds.height / 2 };

        // 1. Cloud vs external Nodes
        for (const nId of nodeIds) {
          if (nId === cId || isDescendantOf(nId, cId) || isDescendantOf(cId, nId)) continue;
          const nodeLayout = layoutMap.get(nId);
          if (!nodeLayout) continue;
          const nCenter = { x: nodeLayout.x + nodeLayout.width / 2, y: nodeLayout.y + nodeLayout.height / 2 };

          const overlapX = (cBounds.width / 2 + nodeLayout.width / 2 + cloudGap) - Math.abs(cCenter.x - nCenter.x);
          const overlapY = (cBounds.height / 2 + nodeLayout.height / 2 + cloudGap) - Math.abs(cCenter.y - nCenter.y);

          if (overlapX > 0 && overlapY > 0) {
            hasCollision = true;
            if (layoutType === 'standard' || layoutType === 'left' || layoutType === 'right') {
              const pushY = (overlapY / 2) + 4;
              const sign = cCenter.y <= nCenter.y ? -1 : 1;
              shiftSubtree(cId, 0, sign * pushY, layoutMap, getDescendantIds);
              shiftSubtree(nId, 0, -sign * pushY, layoutMap, getDescendantIds);
            } else if (
              layoutType === 'top' ||
              layoutType === 'bottom' ||
              layoutType === 'balanced-horizontal' ||
              layoutType === 'tree-down'
            ) {
              const pushX = (overlapX / 2) + 4;
              const sign = cCenter.x <= nCenter.x ? -1 : 1;
              shiftSubtree(cId, sign * pushX, 0, layoutMap, getDescendantIds);
              shiftSubtree(nId, -sign * pushX, 0, layoutMap, getDescendantIds);
            } else {
              const dx = nCenter.x - cCenter.x || 1;
              const dy = nCenter.y - cCenter.y || 1;
              const dist = Math.hypot(dx, dy) || 1;
              const pushDist = Math.max(overlapX, overlapY) / 2 + 6;
              shiftSubtree(cId, -(dx / dist) * pushDist, -(dy / dist) * pushDist, layoutMap, getDescendantIds);
              shiftSubtree(nId, (dx / dist) * pushDist, (dy / dist) * pushDist, layoutMap, getDescendantIds);
            }
          }
        }

        // 2. Cloud vs other Clouds
        for (const oId of cloudNodes) {
          if (oId === cId || isDescendantOf(oId, cId) || isDescendantOf(cId, oId)) continue;
          const oBounds = computeCloudBounds(oId, mindMap.nodes, layoutMap);
          if (!oBounds) continue;
          const oCenter = { x: oBounds.x + oBounds.width / 2, y: oBounds.y + oBounds.height / 2 };

          const overlapX = (cBounds.width / 2 + oBounds.width / 2 + cloudGap) - Math.abs(cCenter.x - oCenter.x);
          const overlapY = (cBounds.height / 2 + oBounds.height / 2 + cloudGap) - Math.abs(cCenter.y - oCenter.y);

          if (overlapX > 0 && overlapY > 0) {
            hasCollision = true;
            if (layoutType === 'standard' || layoutType === 'left' || layoutType === 'right') {
              const pushY = (overlapY / 2) + 4;
              const sign = cCenter.y <= oCenter.y ? -1 : 1;
              shiftSubtree(cId, 0, sign * pushY, layoutMap, getDescendantIds);
              shiftSubtree(oId, 0, -sign * pushY, layoutMap, getDescendantIds);
            } else if (
              layoutType === 'top' ||
              layoutType === 'bottom' ||
              layoutType === 'balanced-horizontal' ||
              layoutType === 'tree-down'
            ) {
              const pushX = (overlapX / 2) + 4;
              const sign = cCenter.x <= oCenter.x ? -1 : 1;
              shiftSubtree(cId, sign * pushX, 0, layoutMap, getDescendantIds);
              shiftSubtree(oId, -sign * pushX, 0, layoutMap, getDescendantIds);
            } else {
              const dx = oCenter.x - cCenter.x || 1;
              const dy = oCenter.y - cCenter.y || 1;
              const dist = Math.hypot(dx, dy) || 1;
              const pushDist = Math.max(overlapX, overlapY) / 2 + 6;
              shiftSubtree(cId, -(dx / dist) * pushDist, -(dy / dist) * pushDist, layoutMap, getDescendantIds);
              shiftSubtree(oId, (dx / dist) * pushDist, (dy / dist) * pushDist, layoutMap, getDescendantIds);
            }
          }
        }
      }
    }

    if (!hasCollision) break;
  }
}

// ----------------------------------------------------
// 6. 360° RAY & BOX INTERSECTION FOR RADIAL / CIRCULAR EDGES
// ----------------------------------------------------
function getBoxRayIntersection(
  box: { x: number; y: number; width: number; height: number },
  targetCenter: { x: number; y: number }
): { x: number; y: number } {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const dx = targetCenter.x - centerX;
  const dy = targetCenter.y - centerY;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return { x: centerX, y: centerY };
  }

  const halfW = box.width / 2;
  const halfH = box.height / 2;

  if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
    const signX = dx > 0 ? 1 : -1;
    const x = centerX + signX * halfW;
    const y = centerY + signX * halfW * (dy / dx);
    return { x, y };
  } else {
    const signY = dy > 0 ? 1 : -1;
    const y = centerY + signY * halfH;
    const x = centerX + signY * halfH * (dx / dy);
    return { x, y };
  }
}

// ----------------------------------------------------
// 7. EDGE PATH GENERATION
// ----------------------------------------------------
export function generateEdgePath(
  parentLayout: CalculatedNodeLayout,
  childLayout: CalculatedNodeLayout,
  edgeStyle: string = 'bezier',
  childShape: string = 'bubble'
): string {
  if (edgeStyle === 'hidden') return '';

  const parentCenterX = parentLayout.x + parentLayout.width / 2;
  const parentCenterY = parentLayout.y + parentLayout.height / 2;
  const childCenterX = childLayout.x + childLayout.width / 2;
  const childCenterY = childLayout.y + childLayout.height / 2;

  // Case A: Radial or Circular layout
  if (childLayout.side === 'radial' || childLayout.side === 'circular') {
    const start = getBoxRayIntersection(parentLayout, { x: childCenterX, y: childCenterY });
    const end = getBoxRayIntersection(childLayout, { x: parentCenterX, y: parentCenterY });

    if (edgeStyle === 'linear') {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    if (edgeStyle === 'sharp') {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }

    if (edgeStyle === 'horizontal') {
      const midX = (start.x + end.x) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }

    // Default: Organic cubic bezier along vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const cx1 = start.x + dx * 0.4;
    const cy1 = start.y + dy * 0.4;
    const cx2 = start.x + dx * 0.6;
    const cy2 = start.y + dy * 0.6;

    return `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
  }

  // Case B: Vertical layout (top or bottom)
  if (childLayout.side === 'bottom') {
    const x1 = parentCenterX;
    const y1 = parentLayout.y + parentLayout.height;
    const x2 = childCenterX;
    let y2 = childLayout.y;
    if (childShape === 'fork') {
      y2 = childLayout.y + childLayout.height - 2;
    }

    if (edgeStyle === 'linear') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'sharp') {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'horizontal') {
      const stepY = y1 + Math.min(24, Math.abs(y2 - y1) * 0.4);
      return `M ${x1} ${y1} L ${x1} ${stepY} L ${x2} ${stepY} L ${x2} ${y2}`;
    }

    const dy = Math.max(Math.abs(y2 - y1), 20);
    const cy1 = y1 + dy * 0.45;
    const cy2 = y2 - dy * 0.45;
    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  }

  if (childLayout.side === 'top') {
    const x1 = parentCenterX;
    const y1 = parentLayout.y;
    const x2 = childCenterX;
    let y2 = childLayout.y + childLayout.height;
    if (childShape === 'fork') {
      y2 = childLayout.y + childLayout.height - 2;
    }

    if (edgeStyle === 'linear') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'sharp') {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'horizontal') {
      const stepY = y1 - Math.min(24, Math.abs(y2 - y1) * 0.4);
      return `M ${x1} ${y1} L ${x1} ${stepY} L ${x2} ${stepY} L ${x2} ${y2}`;
    }

    const dy = Math.max(Math.abs(y2 - y1), 20);
    const cy1 = y1 - dy * 0.45;
    const cy2 = y2 + dy * 0.45;
    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  }

  // Case C: Standard Horizontal layout (right / left)
  const isRight =
    childLayout.side === 'right' ||
    (childLayout.side !== 'left' && childLayout.x >= parentLayout.x + parentLayout.width / 2);

  const x1 = isRight ? parentLayout.x + parentLayout.width : parentLayout.x;
  const y1 = parentLayout.y + parentLayout.height / 2;

  const x2 = isRight ? childLayout.x : childLayout.x + childLayout.width;
  let y2 = childLayout.y + childLayout.height / 2;

  if (childShape === 'fork') {
    y2 = childLayout.y + childLayout.height - 2;
  }

  if (edgeStyle === 'linear') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (edgeStyle === 'sharp') {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  if (edgeStyle === 'horizontal') {
    const offset = isRight ? Math.min(28, Math.abs(x2 - x1) * 0.4) : -Math.min(28, Math.abs(x2 - x1) * 0.4);
    const midX = x1 + offset;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  // Default: Smooth organic Bezier curve (Freeplane & Mindomo style)
  const dx = Math.max(Math.abs(x2 - x1), 20);
  const cx1 = isRight ? x1 + dx * 0.45 : x1 - dx * 0.45;
  const cx2 = isRight ? x2 - dx * 0.45 : x2 + dx * 0.45;

  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
}

// ----------------------------------------------------
// 8. VARIABLE-THICKNESS RIBBON EDGES
// ----------------------------------------------------
export function generateRibbonEdgePath(
  parentLayout: CalculatedNodeLayout,
  childLayout: CalculatedNodeLayout,
  edgeStyle: string = 'bezier',
  childShape: string = 'bubble',
  edgeProfile: EdgeProfile = 'uniform',
  baseWidth: number = 2.5
): string | null {
  if (!edgeProfile || edgeProfile === 'uniform' || edgeStyle === 'hidden') {
    return null;
  }

  const parentCenterX = parentLayout.x + parentLayout.width / 2;
  const parentCenterY = parentLayout.y + parentLayout.height / 2;
  const childCenterX = childLayout.x + childLayout.width / 2;
  const childCenterY = childLayout.y + childLayout.height / 2;

  let x1: number, y1: number, x2: number, y2: number;
  let cx1: number, cy1: number, cx2: number, cy2: number;

  if (childLayout.side === 'radial' || childLayout.side === 'circular') {
    const start = getBoxRayIntersection(parentLayout, { x: childCenterX, y: childCenterY });
    const end = getBoxRayIntersection(childLayout, { x: parentCenterX, y: parentCenterY });
    x1 = start.x;
    y1 = start.y;
    x2 = end.x;
    y2 = end.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    cx1 = x1 + dx * 0.4;
    cy1 = y1 + dy * 0.4;
    cx2 = x1 + dx * 0.6;
    cy2 = y1 + dy * 0.6;
  } else if (childLayout.side === 'bottom') {
    x1 = parentCenterX;
    y1 = parentLayout.y + parentLayout.height;
    x2 = childCenterX;
    y2 = childLayout.y;
    const dy = Math.max(Math.abs(y2 - y1), 20);
    cx1 = x1;
    cy1 = y1 + dy * 0.45;
    cx2 = x2;
    cy2 = y2 - dy * 0.45;
  } else if (childLayout.side === 'top') {
    x1 = parentCenterX;
    y1 = parentLayout.y;
    x2 = childCenterX;
    y2 = childLayout.y + childLayout.height;
    const dy = Math.max(Math.abs(y2 - y1), 20);
    cx1 = x1;
    cy1 = y1 - dy * 0.45;
    cx2 = x2;
    cy2 = y2 + dy * 0.45;
  } else {
    const isRight =
      childLayout.side === 'right' ||
      (childLayout.side !== 'left' && childLayout.x >= parentLayout.x + parentLayout.width / 2);

    x1 = isRight ? parentLayout.x + parentLayout.width : parentLayout.x;
    y1 = parentLayout.y + parentLayout.height / 2;
    x2 = isRight ? childLayout.x : childLayout.x + childLayout.width;
    y2 = childLayout.y + childLayout.height / 2;

    if (childShape === 'fork') {
      y2 = childLayout.y + childLayout.height - 2;
    }

    const dx = Math.max(Math.abs(x2 - x1), 20);
    cx1 = isRight ? x1 + dx * 0.45 : x1 - dx * 0.45;
    cx2 = isRight ? x2 - dx * 0.45 : x2 + dx * 0.45;
    cy1 = y1;
    cy2 = y2;
  }

  const effectiveBase = Math.max(2.2, baseWidth);
  const getWidthAtT = (t: number): number => {
    let factor = 1.0;
    if (edgeProfile === 'tapered') {
      factor = 0.35 + 2.65 * Math.pow(1 - t, 1.2);
    } else if (edgeProfile === 'spindle') {
      factor = 0.35 + 2.75 * Math.sin(Math.PI * t);
    } else if (edgeProfile === 'hourglass') {
      const centered = 2 * t - 1;
      factor = 0.45 + 2.55 * (centered * centered);
    }
    return Math.max(1.0, effectiveBase * factor);
  };

  const STEPS = 32;
  const topPoints: { x: number; y: number }[] = [];
  const bottomPoints: { x: number; y: number }[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    if (edgeStyle === 'linear') {
      px = (1 - t) * x1 + t * x2;
      py = (1 - t) * y1 + t * y2;
      tx = x2 - x1;
      ty = y2 - y1;
    } else if (edgeStyle === 'sharp') {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      if (t <= 0.5) {
        const subT = t / 0.5;
        px = (1 - subT) * x1 + subT * midX;
        py = y1;
        tx = midX - x1;
        ty = 0;
      } else {
        const subT = (t - 0.5) / 0.5;
        px = midX;
        py = (1 - subT) * y1 + subT * y2;
        tx = 0;
        ty = y2 - y1;
      }
    } else {
      const oneMinusT = 1 - t;
      const oneMinusT2 = oneMinusT * oneMinusT;
      const oneMinusT3 = oneMinusT2 * oneMinusT;
      const t2 = t * t;
      const t3 = t2 * t;

      px = oneMinusT3 * x1 + 3 * oneMinusT2 * t * cx1 + 3 * oneMinusT * t2 * cx2 + t3 * x2;
      py = oneMinusT3 * y1 + 3 * oneMinusT2 * t * cy1 + 3 * oneMinusT * t2 * cy2 + t3 * y2;

      tx = 3 * oneMinusT2 * (cx1 - x1) + 6 * oneMinusT * t * (cx2 - cx1) + 3 * t2 * (x2 - cx2);
      ty = 3 * oneMinusT2 * (cy1 - y1) + 6 * oneMinusT * t * (cy2 - cy1) + 3 * t2 * (y2 - cy2);
    }

    const len = Math.sqrt(tx * tx + ty * ty);
    let nx = 0;
    let ny = 1;
    if (len > 0.0001) {
      nx = -ty / len;
      ny = tx / len;
    }

    const halfW = getWidthAtT(t) / 2;

    topPoints.push({
      x: Number((px + nx * halfW).toFixed(2)),
      y: Number((py + ny * halfW).toFixed(2)),
    });
    bottomPoints.push({
      x: Number((px - nx * halfW).toFixed(2)),
      y: Number((py - ny * halfW).toFixed(2)),
    });
  }

  let pathStr = `M ${topPoints[0].x} ${topPoints[0].y}`;
  for (let i = 1; i < topPoints.length; i++) {
    pathStr += ` L ${topPoints[i].x} ${topPoints[i].y}`;
  }
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    pathStr += ` L ${bottomPoints[i].x} ${bottomPoints[i].y}`;
  }
  pathStr += ' Z';

  return pathStr;
}

// ----------------------------------------------------
// 9. CLOUD BOUNDS COMPUTATION
// ----------------------------------------------------
export function computeCloudBounds(
  nodeId: string,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>
): { x: number; y: number; width: number; height: number } | null {
  const node = nodes[nodeId];
  if (!node || !node.cloud?.enabled) return null;

  const nodeLayout = layoutMap.get(nodeId);
  if (!nodeLayout) return null;

  let minX = nodeLayout.x;
  let maxX = nodeLayout.x + nodeLayout.width;
  let minY = nodeLayout.y;
  let maxY = nodeLayout.y + nodeLayout.height;
  let maxChildCloudExtra = 0;

  function collectDescendantBounds(currentId: string) {
    const curr = nodes[currentId];
    if (!curr || curr.folded) return;
    curr.children.forEach(childId => {
      const childLayout = layoutMap.get(childId);
      if (childLayout) {
        minX = Math.min(minX, childLayout.x);
        maxX = Math.max(maxX, childLayout.x + childLayout.width);
        minY = Math.min(minY, childLayout.y);
        maxY = Math.max(maxY, childLayout.y + childLayout.height);

        const childNode = nodes[childId];
        if (childNode?.cloud?.enabled) {
          maxChildCloudExtra = Math.max(maxChildCloudExtra, 12);
        }
        collectDescendantBounds(childId);
      }
    });
  }

  collectDescendantBounds(nodeId);

  const basePadding = 18;
  const padding = basePadding + maxChildCloudExtra;
  const extraPadX = node.cloud.paddingX !== undefined ? node.cloud.paddingX : 0;
  const extraPadY = node.cloud.paddingY !== undefined ? node.cloud.paddingY : 0;

  const finalPadX = Math.max(4, padding + extraPadX);
  const finalPadY = Math.max(4, padding + extraPadY);

  return {
    x: minX - finalPadX,
    y: minY - finalPadY,
    width: maxX - minX + finalPadX * 2,
    height: maxY - minY + finalPadY * 2,
  };
}
\\n

## src/utils/mapTheme.ts

\\ts
import { MindMap, MindNode } from '../types/mindmap';

/**
 * Restilo total al cambiar de tema: limpia los overrides de color por nodo
 * y de fondo/aristas del mapa para que el tema mande en todo.
 * Conserva formas, imágenes, degradados, tipografía y metadatos.
 */
export function applyThemeRestyle(map: MindMap, themeId: string): MindMap {
  const clearedNodes: Record<string, MindNode> = {};
  Object.entries(map.nodes).forEach(([id, node]) => {
    const { color, textColor, borderColor, ...rest } = node;
    clearedNodes[id] = rest as MindNode;
  });
  return {
    ...map,
    themeId,
    nodes: clearedNodes,
    backgroundColor: undefined,
    backgroundPattern: undefined,
    backgroundPatternColor: undefined,
    backgroundPatternSize: undefined,
    backgroundPatternOpacity: undefined,
    edgeColor: undefined,
    updatedAt: Date.now(),
  };
}

/**
 * Fusiona un cambio parcial de fondo del lienzo sobre el mapa.
 */
export function applyBackgroundUpdate(
  map: MindMap,
  config: Pick<
    MindMap,
    | 'backgroundColor'
    | 'backgroundPattern'
    | 'backgroundPatternColor'
    | 'backgroundPatternSize'
    | 'backgroundPatternOpacity'
  >
): MindMap {
  return { ...map, ...config, updatedAt: Date.now() };
}
\\n

## src/utils/markdownRenderer.tsx

\\tsx
ERROR: [Errno 2] No such file or directory: 'src/utils/markdownRenderer.tsx'
\\n

## src/utils/presentationGenerator.ts

\\ts
import { MindMap, CalculatedNodeLayout, SlideFrame } from '../types/mindmap';

/**
 * Automatically computes an intelligent presentation storyboard for a given MindMap and its layout.
 * Sequence:
 * 1. Overview (Full MindMap)
 * 2. Root Node Introduction
 * 3. Each main branch tree with its sub-branches in hierarchical order.
 */
export function generateDefaultPresentationSlides(
  mindMap: MindMap,
  layoutMap: Map<string, CalculatedNodeLayout>
): SlideFrame[] {
  const slides: SlideFrame[] = [];
  if (!mindMap.rootId || !layoutMap.has(mindMap.rootId)) {
    return slides;
  }

  // 1. Calculate Entire Map Overview Bounds
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  layoutMap.forEach((l) => {
    minX = Math.min(minX, l.bounds.minX);
    minY = Math.min(minY, l.bounds.minY);
    maxX = Math.max(maxX, l.bounds.maxX);
    maxY = Math.max(maxY, l.bounds.maxY);
  });

  const overviewPadding = 120;
  const overviewBounds = {
    x: minX - overviewPadding,
    y: minY - overviewPadding,
    width: Math.max(400, maxX - minX + overviewPadding * 2),
    height: Math.max(300, maxY - minY + overviewPadding * 2),
  };

  // Slide 1: General Overview
  slides.push({
    id: 'slide-overview',
    order: 1,
    title: `🗺️ Visión General: ${mindMap.title || 'Mapa Mental'}`,
    type: 'overview',
    bounds: overviewBounds,
    showNotes: false,
    color: '#3b82f6',
  });

  // Slide 2: Root Node
  const rootNode = mindMap.nodes[mindMap.rootId];
  const rootLayout = layoutMap.get(mindMap.rootId)!;
  const rootPadding = 24;
  slides.push({
    id: 'slide-root',
    order: 2,
    title: `🎯 ${rootNode.text || 'Tema Central'}`,
    type: 'node',
    nodeId: rootNode.id,
    bounds: {
      x: rootLayout.x - rootPadding,
      y: rootLayout.y - rootPadding,
      width: rootLayout.width + rootPadding * 2,
      height: rootLayout.height + rootPadding * 2,
    },
    showNotes: false,
    color: rootNode.color || '#2563eb',
  });

  let currentOrder = 3;

  // If Root has notes, insert a dedicated Note Slide immediately after Root
  if (rootNode.note && rootNode.note.trim().length > 0) {
    slides.push({
      id: `slide-note-${rootNode.id}`,
      order: currentOrder++,
      title: `📝 Nota: ${rootNode.text || 'Tema Central'}`,
      type: 'note',
      nodeId: rootNode.id,
      bounds: {
        x: rootLayout.x - rootPadding * 1.5,
        y: rootLayout.y - rootPadding * 1.5,
        width: rootLayout.width + rootPadding * 3,
        height: rootLayout.height + rootPadding * 3,
      },
      showNotes: true,
      color: '#f59e0b',
    });
  }

  // 3. Helper to recursively collect branch bounds
  const getSubtreeBounds = (nodeId: string): { minX: number; minY: number; maxX: number; maxY: number } => {
    const l = layoutMap.get(nodeId);
    if (!l) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let sMinX = l.bounds.minX;
    let sMinY = l.bounds.minY;
    let sMaxX = l.bounds.maxX;
    let sMaxY = l.bounds.maxY;

    const n = mindMap.nodes[nodeId];
    if (n && n.children) {
      n.children.forEach((cId) => {
        const cBounds = getSubtreeBounds(cId);
        sMinX = Math.min(sMinX, cBounds.minX);
        sMinY = Math.min(sMinY, cBounds.minY);
        sMaxX = Math.max(sMaxX, cBounds.maxX);
        sMaxY = Math.max(sMaxY, cBounds.maxY);
      });
    }

    return { minX: sMinX, minY: sMinY, maxX: sMaxX, maxY: sMaxY };
  };

  // 4. Iterate main branches & major sub-branches
  if (rootNode.children && rootNode.children.length > 0) {
    rootNode.children.forEach((mainChildId) => {
      const mainNode = mindMap.nodes[mainChildId];
      const mainLayout = layoutMap.get(mainChildId);
      if (!mainNode || !mainLayout) return;

      const branchBounds = getSubtreeBounds(mainChildId);
      const bPadding = 32;

      // Add main branch full frame
      slides.push({
        id: `slide-branch-${mainChildId}`,
        order: currentOrder++,
        title: `📌 ${mainNode.text || 'Rama Principal'}`,
        type: 'branch',
        nodeId: mainChildId,
        bounds: {
          x: branchBounds.minX - bPadding,
          y: branchBounds.minY - bPadding,
          width: Math.max(200, branchBounds.maxX - branchBounds.minX + bPadding * 2),
          height: Math.max(140, branchBounds.maxY - branchBounds.minY + bPadding * 2),
        },
        showNotes: false,
        color: mainNode.color || '#3b82f6',
      });

      // If Main branch node has notes, insert a dedicated Note Slide immediately
      if (mainNode.note && mainNode.note.trim().length > 0) {
        slides.push({
          id: `slide-note-${mainChildId}`,
          order: currentOrder++,
          title: `📝 Nota: ${mainNode.text || 'Rama Principal'}`,
          type: 'note',
          nodeId: mainChildId,
          bounds: {
            x: mainLayout.x - 30,
            y: mainLayout.y - 30,
            width: mainLayout.width + 60,
            height: mainLayout.height + 60,
          },
          showNotes: true,
          color: '#f59e0b',
        });
      }

      // Add individual focused slide for sub-children
      if (mainNode.children && mainNode.children.length > 0) {
        mainNode.children.forEach((subChildId) => {
          const subNode = mindMap.nodes[subChildId];
          const subLayout = layoutMap.get(subChildId);
          if (!subNode || !subLayout) return;

          const subTreeBounds = getSubtreeBounds(subChildId);
          const subPadding = 24;

          slides.push({
            id: `slide-sub-${subChildId}`,
            order: currentOrder++,
            title: `• ${subNode.text || 'Detalle'}`,
            type: subNode.children && subNode.children.length > 0 ? 'branch' : 'node',
            nodeId: subChildId,
            bounds: {
              x: subTreeBounds.minX - subPadding,
              y: subTreeBounds.minY - subPadding,
              width: Math.max(160, subTreeBounds.maxX - subTreeBounds.minX + subPadding * 2),
              height: Math.max(100, subTreeBounds.maxY - subTreeBounds.minY + subPadding * 2),
            },
            showNotes: false,
            color: subNode.color || mainNode.color || '#6366f1',
          });

          // If Sub-child node has notes, insert a dedicated Note Slide immediately
          if (subNode.note && subNode.note.trim().length > 0) {
            slides.push({
              id: `slide-note-${subChildId}`,
              order: currentOrder++,
              title: `📝 Nota: ${subNode.text || 'Detalle'}`,
              type: 'note',
              nodeId: subChildId,
              bounds: {
                x: subLayout.x - 24,
                y: subLayout.y - 24,
                width: subLayout.width + 48,
                height: subLayout.height + 48,
              },
              showNotes: true,
              color: '#f59e0b',
            });
          }
        });
      }
    });
  }

  return slides;
}
\\n

## src/utils/sampleMaps.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/sampleMaps.ts'
\\n

## src/utils/spatialPresentationGenerator.ts

\\ts
import { MindMap, SpatialSlideCard } from '../types/mindmap';

export type SpatialArrangementType = 'spiral' | 'constellation' | 'grid' | 'random' | 'stacked';

/**
 * Generates an intelligent array of SpatialSlideCard items from the current MindMap.
 * Supports multiple cinematic spatial layouts:
 * - 'spiral': Progressive spiral with elegant rotation increments.
 * - 'constellation': Giant central root and orbit branches with radial rotations.
 * - 'grid': Clean structured matrix.
 * - 'random': Artistic scattered arrangement with random positions, rotations and tilts.
 * - 'stacked': Cards stacked on top of each other (deck of cards / flashcards style) with slight offset and rotation.
 */
export function generateDefaultSpatialSlides(
  mindMap: MindMap,
  arrangement: SpatialArrangementType = 'spiral'
): SpatialSlideCard[] {
  const slides: SpatialSlideCard[] = [];
  if (!mindMap.rootId || !mindMap.nodes[mindMap.rootId]) {
    return slides;
  }

  const rootNode = mindMap.nodes[mindMap.rootId];

  // Helper to extract clean content from a node
  const extractNodeContent = (nodeId: string) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return null;

    const subItems = (node.children || [])
      .map((cId) => mindMap.nodes[cId])
      .filter(Boolean)
      .map((c) => ({
        id: c.id,
        text: c.text,
        color: c.color,
      }));

    return {
      nodeId: node.id,
      titleText: node.text || 'Sin Título',
      bodyText: node.body,
      notesMarkdown: node.note,
      imageUrl: node.imageUrl,
      imageSize: 'medium' as const,
      icons: node.icons,
      tags: node.tags,
      progress: node.progress,
      subItems: subItems.length > 0 ? subItems : undefined,
    };
  };

  // Helper to extract exact visual styles from a node matching the map
  const extractNodeStyle = (nodeId: string, isRoot: boolean) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return { themeId: mindMap.themeId };

    return {
      themeId: mindMap.themeId,
      backgroundColor: node.color,
      textColor: node.textColor,
      borderColor: node.borderColor,
      borderWidth: node.borderWidth,
      contentAlign: isRoot ? ('center' as const) : ('left' as const),
      bgType: node.bgType,
      gradientColor1: node.gradientColor1,
      gradientColor2: node.gradientColor2,
      gradientDirection: node.gradientDirection,
      pattern: node.nodePattern,
      patternColor: node.nodePatternColor,
      patternSize: node.nodePatternSize,
      patternOpacity: node.nodePatternOpacity,
    };
  };

  // Collect ordered nodes (Root first, then recursive traversal of main branches & children)
  const orderedNodeIds: string[] = [rootNode.id];
  const traverse = (nodeId: string) => {
    const n = mindMap.nodes[nodeId];
    if (!n || !n.children) return;
    n.children.forEach((cId) => {
      orderedNodeIds.push(cId);
      traverse(cId);
    });
  };
  traverse(rootNode.id);

  const cardWidth = 720;
  const cardHeight = 440;
  let orderCounter = 1;

  // Generate spatial coordinates based on arrangement
  if (arrangement === 'spiral') {
    // Elegant Fibonacci / Archimedean spiral
    let currentAngle = 0;
    let currentRadius = 0;
    const angleStep = 0.48; // in radians
    const radiusGrowth = 180;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const x = isRoot ? 0 : Math.round(Math.cos(currentAngle) * currentRadius);
      const y = isRoot ? 0 : Math.round(Math.sin(currentAngle) * currentRadius);
      const rot = isRoot ? 0 : Math.round(((currentAngle * 180) / Math.PI) * 0.45) % 360;
      const scale = isRoot ? 1.3 : Math.max(0.85, 1.05 - idx * 0.015);

      // Main Node Slide
      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: x - (cardWidth * scale) / 2,
          y: y - (cardHeight * scale) / 2,
          width: cardWidth,
          height: cardHeight,
          scale,
          rotation: rot,
        },
        content,
        style: extractNodeStyle(nodeId, isRoot),
      });

      // Dedicated Note Slide if node has notes
      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        const noteAngle = currentAngle + 0.22;
        const noteRadius = currentRadius + 140;
        const noteX = Math.round(Math.cos(noteAngle) * noteRadius);
        const noteY = Math.round(Math.sin(noteAngle) * noteRadius);
        const noteRot = (rot + 8) % 360;

        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: noteX - (cardWidth * 0.95 * scale) / 2,
            y: noteY - (cardHeight * 0.95 * scale) / 2,
            width: cardWidth,
            height: cardHeight,
            scale: scale * 0.95,
            rotation: noteRot,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: {
            ...extractNodeStyle(nodeId, false),
            borderColor: '#f59e0b',
            borderWidth: 2,
          },
        });
      }

      currentAngle += angleStep;
      currentRadius += radiusGrowth;
    });
  } else if (arrangement === 'constellation') {
    // Root in center, main branches orbiting with direct radial angles
    const rootContent = extractNodeContent(rootNode.id);
    if (rootContent) {
      slides.push({
        id: `spatial-${rootNode.id}-0`,
        order: orderCounter++,
        title: rootContent.titleText,
        isNoteSlide: false,
        spatial: {
          x: -cardWidth * 0.7,
          y: -cardHeight * 0.7,
          width: cardWidth,
          height: cardHeight,
          scale: 1.4,
          rotation: 0,
        },
        content: rootContent,
        style: extractNodeStyle(rootNode.id, true),
      });

      if (rootContent.notesMarkdown && rootContent.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${rootNode.id}-0`,
          order: orderCounter++,
          title: `📝 Nota: ${rootContent.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: -cardWidth * 0.5 + 400,
            y: -cardHeight * 0.5 + 200,
            width: cardWidth,
            height: cardHeight,
            scale: 1.1,
            rotation: 12,
          },
          content: {
            nodeId: rootContent.nodeId,
            titleText: `Nota: ${rootContent.titleText}`,
            notesMarkdown: rootContent.notesMarkdown,
            icons: ['file-text'],
          },
          style: { ...extractNodeStyle(rootNode.id, false), borderColor: '#f59e0b' },
        });
      }
    }

    const mainChildren = rootNode.children || [];
    const orbitRadius = 1200;

    mainChildren.forEach((mainId, mainIdx) => {
      const angle = (mainIdx / Math.max(1, mainChildren.length)) * Math.PI * 2;
      const branchX = Math.round(Math.cos(angle) * orbitRadius);
      const branchY = Math.round(Math.sin(angle) * orbitRadius);
      const branchRot = Math.round((angle * 180) / Math.PI) - 90;

      const mainContent = extractNodeContent(mainId);
      if (mainContent) {
        slides.push({
          id: `spatial-${mainId}-${orderCounter}`,
          order: orderCounter++,
          title: mainContent.titleText,
          isNoteSlide: false,
          spatial: {
            x: branchX - cardWidth / 2,
            y: branchY - cardHeight / 2,
            width: cardWidth,
            height: cardHeight,
            scale: 1.0,
            rotation: branchRot,
          },
          content: mainContent,
          style: extractNodeStyle(mainId, false),
        });

        if (mainContent.notesMarkdown && mainContent.notesMarkdown.trim().length > 0) {
          slides.push({
            id: `spatial-note-${mainId}-${orderCounter}`,
            order: orderCounter++,
            title: `📝 Nota: ${mainContent.titleText}`,
            isNoteSlide: true,
            spatial: {
              x: branchX - cardWidth / 2 + 120,
              y: branchY - cardHeight / 2 + 80,
              width: cardWidth,
              height: cardHeight,
              scale: 0.9,
              rotation: branchRot + 10,
            },
            content: {
              nodeId: mainContent.nodeId,
              titleText: `Nota: ${mainContent.titleText}`,
              notesMarkdown: mainContent.notesMarkdown,
              icons: ['file-text'],
            },
            style: { ...extractNodeStyle(mainId, false), borderColor: '#f59e0b' },
          });
        }
      }

      // Orbit sub-children further outward
      const subChildren = mindMap.nodes[mainId]?.children || [];
      subChildren.forEach((subId, subIdx) => {
        const subAngle = angle + (subIdx - (subChildren.length - 1) / 2) * 0.22;
        const subRadius = orbitRadius + 750;
        const subX = Math.round(Math.cos(subAngle) * subRadius);
        const subY = Math.round(Math.sin(subAngle) * subRadius);

        const subContent = extractNodeContent(subId);
        if (subContent) {
          slides.push({
            id: `spatial-${subId}-${orderCounter}`,
            order: orderCounter++,
            title: subContent.titleText,
            isNoteSlide: false,
            spatial: {
              x: subX - (cardWidth * 0.85) / 2,
              y: subY - (cardHeight * 0.85) / 2,
              width: cardWidth,
              height: cardHeight,
              scale: 0.85,
              rotation: Math.round((subAngle * 180) / Math.PI) - 90,
            },
            content: subContent,
            style: extractNodeStyle(subId, false),
          });

          if (subContent.notesMarkdown && subContent.notesMarkdown.trim().length > 0) {
            slides.push({
              id: `spatial-note-${subId}-${orderCounter}`,
              order: orderCounter++,
              title: `📝 Nota: ${subContent.titleText}`,
              isNoteSlide: true,
              spatial: {
                x: subX - (cardWidth * 0.8) / 2 + 60,
                y: subY - (cardHeight * 0.8) / 2 + 50,
                width: cardWidth,
                height: cardHeight,
                scale: 0.8,
                rotation: Math.round((subAngle * 180) / Math.PI) - 80,
              },
              content: {
                nodeId: subContent.nodeId,
                titleText: `Nota: ${subContent.titleText}`,
                notesMarkdown: subContent.notesMarkdown,
                icons: ['file-text'],
              },
              style: { ...extractNodeStyle(subId, false), borderColor: '#f59e0b' },
            });
          }
        }
      });
    });
  } else if (arrangement === 'random') {
    // Artistic Scattered / Organic Random arrangement
    const spreadRadius = 1400;
    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const angle = (idx / Math.max(1, orderedNodeIds.length)) * Math.PI * 2 + (pseudoRandom() - 0.5) * 0.8;
      const distance = isRoot ? 0 : 350 + pseudoRandom() * spreadRadius;

      const x = isRoot ? 0 : Math.round(Math.cos(angle) * distance);
      const y = isRoot ? 0 : Math.round(Math.sin(angle) * distance);
      const rot = isRoot ? 0 : Math.round((pseudoRandom() - 0.5) * 60);
      const scale = isRoot ? 1.3 : 0.85 + pseudoRandom() * 0.35;

      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: x - (cardWidth * scale) / 2,
          y: y - (cardHeight * scale) / 2,
          width: cardWidth,
          height: cardHeight,
          scale,
          rotation: rot,
        },
        content,
        style: extractNodeStyle(nodeId, isRoot),
      });

      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: x - (cardWidth * 0.9 * scale) / 2 + 80,
            y: y - (cardHeight * 0.9 * scale) / 2 + 60,
            width: cardWidth,
            height: cardHeight,
            scale: scale * 0.9,
            rotation: (rot + 12) % 360,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: { ...extractNodeStyle(nodeId, false), borderColor: '#f59e0b' },
        });
      }
    });
  } else if (arrangement === 'stacked') {
    // Stacked Cards / Deck of Cards Style
    const baseOffsetX = 0;
    const baseOffsetY = 0;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const offsetX = isRoot ? 0 : ((idx % 7) - 3) * 16;
      const offsetY = isRoot ? 0 : ((idx % 5) - 2) * 14;
      const rot = isRoot ? 0 : ((idx % 9) - 4) * 3.5;
      const scale = isRoot ? 1.2 : 1.0;

      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: baseOffsetX + offsetX - (cardWidth * scale) / 2,
          y: baseOffsetY + offsetY - (cardHeight * scale) / 2,
          width: cardWidth,
          height: cardHeight,
          scale,
          rotation: rot,
        },
        content,
        style: extractNodeStyle(nodeId, isRoot),
      });

      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: baseOffsetX + offsetX + 25 - (cardWidth * 0.95 * scale) / 2,
            y: baseOffsetY + offsetY + 25 - (cardHeight * 0.95 * scale) / 2,
            width: cardWidth,
            height: cardHeight,
            scale: scale * 0.95,
            rotation: (rot + 5) % 360,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: { ...extractNodeStyle(nodeId, false), borderColor: '#f59e0b' },
        });
      }
    });
  } else {
    // Standard Grid / Matrix
    const cols = 3;
    const gapX = 880;
    const gapY = 580;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: col * gapX,
          y: row * gapY,
          width: cardWidth,
          height: cardHeight,
          scale: 1.0,
          rotation: (idx % 2 === 1 ? 4 : -4) * (idx % 3),
        },
        content,
        style: extractNodeStyle(nodeId, isRoot),
      });

      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: col * gapX + 60,
            y: row * gapY + 50,
            width: cardWidth,
            height: cardHeight,
            scale: 0.95,
            rotation: ((idx % 2 === 1 ? 4 : -4) * (idx % 3)) + 6,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: { ...extractNodeStyle(nodeId, false), borderColor: '#f59e0b' },
        });
      }
    });
  }

  return slides;
}
\\n

## src/utils/storage.ts

\\ts
import { MindMap } from '../types/mindmap';
import { TUTORIAL_MAP } from './sampleMaps';

const CURRENT_MAP_KEY = 'freemind_current_map_v1';
const SAVED_MAPS_INDEX_KEY = 'freemind_saved_maps_index_v1';

export interface SavedMapMeta {
  id: string;
  title: string;
  updatedAt: number;
  nodeCount: number;
}

export function loadCurrentMap(): MindMap {
  try {
    const saved = localStorage.getItem(CURRENT_MAP_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rootId && parsed.nodes) {
        // If it's the tutorial map, return the updated TUTORIAL_MAP definition
        if (parsed.id === 'map-tutorial-freeplane' || parsed.id === 'map-tutorial-v1') {
          return TUTORIAL_MAP;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading current map from localStorage:', err);
  }
  return TUTORIAL_MAP;
}

export function saveCurrentMap(map: MindMap): void {
  try {
    localStorage.setItem(CURRENT_MAP_KEY, JSON.stringify(map));
    updateSavedMapsIndex(map);
  } catch (err) {
    console.error('Error saving current map to localStorage:', err);
  }
}

export function getSavedMapsIndex(): SavedMapMeta[] {
  try {
    const raw = localStorage.getItem(SAVED_MAPS_INDEX_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading maps index:', err);
  }
  return [
    {
      id: TUTORIAL_MAP.id,
      title: TUTORIAL_MAP.title,
      updatedAt: TUTORIAL_MAP.updatedAt,
      nodeCount: Object.keys(TUTORIAL_MAP.nodes).length,
    }
  ];
}

export function updateSavedMapsIndex(map: MindMap): void {
  try {
    const list = getSavedMapsIndex();
    const existingIdx = list.findIndex(m => m.id === map.id);
    const meta: SavedMapMeta = {
      id: map.id,
      title: map.title,
      updatedAt: Date.now(),
      nodeCount: Object.keys(map.nodes).length,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = meta;
    } else {
      list.unshift(meta);
    }

    localStorage.setItem(SAVED_MAPS_INDEX_KEY, JSON.stringify(list));
    // Also save the specific map in individual slot
    localStorage.setItem(`freemind_map_${map.id}`, JSON.stringify(map));
  } catch (err) {
    console.error('Error updating maps index:', err);
  }
}

export function loadMapById(id: string): MindMap | null {
  try {
    const raw = localStorage.getItem(`freemind_map_${id}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error loading map ${id}:`, err);
  }
  return null;
}

export function deleteMapById(id: string): void {
  try {
    localStorage.removeItem(`freemind_map_${id}`);
    const list = getSavedMapsIndex().filter(m => m.id !== id);
    localStorage.setItem(SAVED_MAPS_INDEX_KEY, JSON.stringify(list));
  } catch (err) {
    console.error(`Error deleting map ${id}:`, err);
  }
}
\\n

## src/utils/templateIllustrations.ts

\\ts
ERROR: [Errno 2] No such file or directory: 'src/utils/templateIllustrations.ts'
\\n

## src/utils/themes.ts

\\ts
import { MindMapTheme, BackgroundPatternStyle, MapBackgroundConfig } from '../types/mindmap';

export interface BackgroundPresetTheme {
  id: string;
  name: string;
  category: 'light' | 'dark' | 'paper' | 'technical' | 'creative';
  backgroundColor: string;
  pattern: BackgroundPatternStyle;
  patternColor: string;
  patternSize: number;
  patternOpacity: number;
  description: string;
}

export const THEMES: Record<string, MindMapTheme> = {
  default: {
    id: 'default',
    name: 'Clásico Azul',
    background: '#f8fafc',
    backgroundPattern: 'dots',
    backgroundPatternColor: '#94a3b8',
    backgroundPatternSize: 24,
    backgroundPatternOpacity: 0.45,
    rootBg: '#2563eb',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#1e293b',
    nodeBorder: '#cbd5e1',
    branchColors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  },
  rainbow: {
    id: 'rainbow',
    name: 'Arcoíris Vibrante',
    background: '#ffffff',
    backgroundPattern: 'squares',
    backgroundPatternColor: '#e2e8f0',
    backgroundPatternSize: 28,
    backgroundPatternOpacity: 0.6,
    rootBg: '#0f172a',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#0f172a',
    nodeBorder: '#e2e8f0',
    branchColors: ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  },
  dark: {
    id: 'dark',
    name: 'Modo Oscuro',
    background: '#0f172a',
    backgroundPattern: 'dots',
    backgroundPatternColor: '#475569',
    backgroundPatternSize: 24,
    backgroundPatternOpacity: 0.5,
    rootBg: '#3b82f6',
    rootText: '#ffffff',
    nodeBg: '#1e293b',
    nodeText: '#f1f5f9',
    nodeBorder: '#334155',
    branchColors: ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#f472b6', '#38bdf8'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  },
  forest: {
    id: 'forest',
    name: 'Bosque Esmeralda',
    background: '#f0fdf4',
    backgroundPattern: 'dots',
    backgroundPatternColor: '#86efac',
    backgroundPatternSize: 24,
    backgroundPatternOpacity: 0.55,
    rootBg: '#047857',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#064e3b',
    nodeBorder: '#a7f3d0',
    branchColors: ['#059669', '#10b981', '#34d399', '#0d9488', '#14b8a6', '#84cc16'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  },
  sunset: {
    id: 'sunset',
    name: 'Atardecer Cálido',
    background: '#fffbeb',
    backgroundPattern: 'triangles',
    backgroundPatternColor: '#fed7aa',
    backgroundPatternSize: 32,
    backgroundPatternOpacity: 0.6,
    rootBg: '#ea580c',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#431407',
    nodeBorder: '#fed7aa',
    branchColors: ['#ea580c', '#f97316', '#fb923c', '#e11d48', '#f43f5e', '#d97706'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimalista Mono',
    background: '#fafafa',
    backgroundPattern: 'none',
    backgroundPatternColor: '#e4e4e7',
    backgroundPatternSize: 24,
    backgroundPatternOpacity: 0.4,
    rootBg: '#18181b',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#18181b',
    nodeBorder: '#e4e4e7',
    branchColors: ['#3f3f46', '#52525b', '#71717a', '#a1a1aa'],
    edgeStyle: 'linear',
    fontFamily: 'Plus Jakarta Sans',
  },
  blueprint: {
    id: 'blueprint',
    name: 'Plano Técnico Blueprint',
    background: '#0a2540',
    backgroundPattern: 'squares',
    backgroundPatternColor: '#0284c7',
    backgroundPatternSize: 28,
    backgroundPatternOpacity: 0.4,
    rootBg: '#0284c7',
    rootText: '#ffffff',
    nodeBg: '#0f3863',
    nodeText: '#f0f9ff',
    nodeBorder: '#0369a1',
    branchColors: ['#38bdf8', '#7dd3fc', '#bae6fd', '#67e8f9', '#a5f3fc'],
    edgeStyle: 'sharp',
    fontFamily: 'Plus Jakarta Sans',
  },
  honeycomb: {
    id: 'honeycomb',
    name: 'Panal Creativo',
    background: '#fffdf5',
    backgroundPattern: 'hexagons',
    backgroundPatternColor: '#fde68a',
    backgroundPatternSize: 32,
    backgroundPatternOpacity: 0.7,
    rootBg: '#d97706',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#78350f',
    nodeBorder: '#fde68a',
    branchColors: ['#d97706', '#f59e0b', '#b45309', '#e11d48', '#ca8a04'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  },
};

/**
 * Curated background themes and preset styles specifically for the canvas background
 */
export const BACKGROUND_PRESET_THEMES: BackgroundPresetTheme[] = [
  {
    id: 'bg-clean-white',
    name: 'Lienzo Puro (Liso)',
    category: 'light',
    backgroundColor: '#ffffff',
    pattern: 'none',
    patternColor: '#cbd5e1',
    patternSize: 24,
    patternOpacity: 0.3,
    description: 'Fondo blanco minimalista sin trama para máxima concentración',
  },
  {
    id: 'bg-dot-grid-slate',
    name: 'Cuaderno de Puntos',
    category: 'paper',
    backgroundColor: '#fafaf9',
    pattern: 'dots',
    patternColor: '#78716c',
    patternSize: 24,
    patternOpacity: 0.4,
    description: 'Puntos estilo bullet journal sobre papel crema',
  },
  {
    id: 'bg-square-grid',
    name: 'Papel Milimetrado',
    category: 'technical',
    backgroundColor: '#f8fafc',
    pattern: 'squares',
    patternColor: '#94a3b8',
    patternSize: 24,
    patternOpacity: 0.45,
    description: 'Cuadrícula precisa para alineación geométrica',
  },
  {
    id: 'bg-blueprint-pro',
    name: 'Blueprint Técnico',
    category: 'technical',
    backgroundColor: '#0c2d48',
    pattern: 'squares',
    patternColor: '#38bdf8',
    patternSize: 28,
    patternOpacity: 0.35,
    description: 'Cuadrícula técnica azul eléctrico tipo cianotipo de ingeniería',
  },
  {
    id: 'bg-honeycomb-gold',
    name: 'Panal Hexagonal',
    category: 'creative',
    backgroundColor: '#fffdf5',
    pattern: 'hexagons',
    patternColor: '#d97706',
    patternSize: 32,
    patternOpacity: 0.4,
    description: 'Trama de hexágonos dorados interconectados',
  },
  {
    id: 'bg-triangular-mesh',
    name: 'Malla Triangular Isométrica',
    category: 'creative',
    backgroundColor: '#f1f5f9',
    pattern: 'triangles',
    patternColor: '#64748b',
    patternSize: 32,
    patternOpacity: 0.35,
    description: 'Estructura poligonal de triángulos equiláteros',
  },
  {
    id: 'bg-lined-paper',
    name: 'Rayas de Cuaderno',
    category: 'paper',
    backgroundColor: '#fafaf9',
    pattern: 'lines',
    patternColor: '#94a3b8',
    patternSize: 24,
    patternOpacity: 0.45,
    description: 'Líneas horizontales continuas para redacción ordenada',
  },
  {
    id: 'bg-dark-matrix-dots',
    name: 'Pizarra Oscura Puntos',
    category: 'dark',
    backgroundColor: '#0f172a',
    pattern: 'dots',
    patternColor: '#475569',
    patternSize: 24,
    patternOpacity: 0.6,
    description: 'Puntos sutiles sobre lienzo azul noche de alto contraste',
  },
  {
    id: 'bg-dark-honeycomb',
    name: 'Cyber Panal Oscuro',
    category: 'dark',
    backgroundColor: '#090d16',
    pattern: 'hexagons',
    patternColor: '#06b6d4',
    patternSize: 36,
    patternOpacity: 0.35,
    description: 'Hexágonos cian sobre fondo de grafito espacial',
  },
  {
    id: 'bg-dark-isometric',
    name: 'Malla Neón Triangular',
    category: 'dark',
    backgroundColor: '#111827',
    pattern: 'triangles',
    patternColor: '#8b5cf6',
    patternSize: 36,
    patternOpacity: 0.35,
    description: 'Triángulos en púrpura eléctrico en entorno oscuro',
  },
  {
    id: 'bg-graphite-lines',
    name: 'Grafito con Rayas',
    category: 'dark',
    backgroundColor: '#18181b',
    pattern: 'lines',
    patternColor: '#3f3f46',
    patternSize: 28,
    patternOpacity: 0.6,
    description: 'Líneas horizontales en tono grafito mate profesional',
  },
  {
    id: 'bg-mint-breeze',
    name: 'Brisa de Menta (Puntos)',
    category: 'light',
    backgroundColor: '#f0fdf4',
    pattern: 'dots',
    patternColor: '#22c55e',
    patternSize: 24,
    patternOpacity: 0.45,
    description: 'Atmósfera fresca y relajante en verde menta suave',
  },
];
\\n

## src/utils/uiTheme.ts

\\ts
export type UiTheme = 'claro' | 'oscuro' | 'sepia';

export const UI_THEMES: UiTheme[] = ['claro', 'oscuro', 'sepia'];
const STORAGE_KEY = 'freemind_ui_theme_v1';

export function getNextTheme(theme: UiTheme): UiTheme {
  const idx = UI_THEMES.indexOf(theme);
  return UI_THEMES[(idx + 1) % UI_THEMES.length];
}

export function resolveInitialTheme(stored: string | null, prefersDark: boolean): UiTheme {
  if (stored === 'claro' || stored === 'oscuro' || stored === 'sepia') return stored;
  return prefersDark ? 'oscuro' : 'claro';
}

export function loadUiTheme(): UiTheme {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento: decide por el SO
  }
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return resolveInitialTheme(stored, prefersDark);
}

/** Aplica el tema al <html>: data-theme + clase .dark (solo en oscuro). Persiste. */
export function applyUiTheme(theme: UiTheme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'oscuro');
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // sin almacenamiento: el tema vive solo en memoria
  }
}
\\n

## src/utils/vectorIconPack.tsx

\\tsx
import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface VectorIconItem {
  id: string;
  name: string;
  category: VectorIconCategory;
  tags: string[];
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isColorFilled?: boolean;
}

export type VectorIconCategory =
  | 'priority_status'
  | 'business_finance'
  | 'tech_code'
  | 'communication'
  | 'design_media'
  | 'education_science'
  | 'navigation_maps'
  | 'documents_files'
  | 'nature_weather'
  | 'tools_security'
  | 'health_sports'
  | 'emojis_symbols';

export interface CategoryInfo {
  id: VectorIconCategory;
  name: string;
  iconName: string;
  description: string;
}

export const VECTOR_ICON_CATEGORIES: CategoryInfo[] = [
  { id: 'priority_status', name: 'Prioridad & Estados', iconName: 'CheckCircle2', description: 'Niveles de prioridad 1-9, completado, alertas, banderas' },
  { id: 'business_finance', name: 'Negocios & Finanzas', iconName: 'Briefcase', description: 'Monedas, finanzas, métricas, ventas, gráficos de crecimiento' },
  { id: 'tech_code', name: 'Tecnología & Código', iconName: 'Code', description: 'Desarrollo, servidores, nube, hardware, bases de datos' },
  { id: 'communication', name: 'Comunicación & Redes', iconName: 'MessageSquare', description: 'Mensajería, correo, usuarios, llamadas, notificaciones' },
  { id: 'design_media', name: 'Diseño & Multimedia', iconName: 'Palette', description: 'Arte, fotografía, vídeo, audio, herramientas de diseño' },
  { id: 'education_science', name: 'Educación & Ciencia', iconName: 'GraduationCap', description: 'Aprendizaje, física, química, investigación, ideas' },
  { id: 'navigation_maps', name: 'Navegación & Lugares', iconName: 'Compass', description: 'Mapas, brújulas, flechas, ubicación, rutas' },
  { id: 'documents_files', name: 'Documentos & Archivos', iconName: 'FileText', description: 'Carpetas, hojas de cálculo, notas, libros, proyectos' },
  { id: 'nature_weather', name: 'Naturaleza & Clima', iconName: 'Sun', description: 'Sol, luna, lluvia, plantas, energía, medio ambiente' },
  { id: 'tools_security', name: 'Herramientas & Seguridad', iconName: 'ShieldCheck', description: 'Seguridad, candados, configuración, ajustes de sistema' },
  { id: 'health_sports', name: 'Salud, Deportes & Vida', iconName: 'Activity', description: 'Bienestar, medicina, fitness, alimentación, ocio' },
  { id: 'emojis_symbols', name: 'Símbolos & Emociones', iconName: 'Sparkles', description: 'Estrellas, corazones, trofeos, medallas, emociones' },
];

// Helper to safely extract component or create fallback
const getIcon = (name: keyof typeof LucideIcons): React.ComponentType<{ className?: string; style?: React.CSSProperties }> => {
  const IconComp = (LucideIcons as any)[name];
  if (IconComp) return IconComp;
  return LucideIcons.HelpCircle;
};

// Priority SVG Badge generators for P1 to P9
const createPriorityBadge = (num: number, bg: string, border: string): React.ComponentType<{ className?: string }> => {
  const PriorityBadge: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill={bg} stroke={border} strokeWidth="1.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {num}
      </text>
    </svg>
  );
  PriorityBadge.displayName = `PriorityBadge_${num}`;
  return PriorityBadge;
};

// MASTER VECTOR ICONS REPOSITORY: 520+ CURATED VECTOR SVG ICONS
export const VECTOR_ICON_PACK: VectorIconItem[] = [
  // ==========================================
  // 1. PRIORIDAD & ESTADOS (45 icons)
  // ==========================================
  { id: 'p1', name: 'Prioridad 1 (Urgente)', category: 'priority_status', tags: ['prioridad', 'p1', 'urgente', 'rojo', '1'], icon: createPriorityBadge(1, '#ef4444', '#dc2626') },
  { id: 'p2', name: 'Prioridad 2 (Alta)', category: 'priority_status', tags: ['prioridad', 'p2', 'alta', 'naranja', '2'], icon: createPriorityBadge(2, '#f97316', '#ea580c') },
  { id: 'p3', name: 'Prioridad 3 (Media)', category: 'priority_status', tags: ['prioridad', 'p3', 'media', 'ambar', '3'], icon: createPriorityBadge(3, '#f59e0b', '#d97706') },
  { id: 'p4', name: 'Prioridad 4 (Baja)', category: 'priority_status', tags: ['prioridad', 'p4', 'baja', 'azul', '4'], icon: createPriorityBadge(4, '#3b82f6', '#2563eb') },
  { id: 'p5', name: 'Prioridad 5 (Mínima)', category: 'priority_status', tags: ['prioridad', 'p5', 'minima', 'gris', '5'], icon: createPriorityBadge(5, '#64748b', '#475569') },
  { id: 'p6', name: 'Prioridad 6', category: 'priority_status', tags: ['prioridad', 'p6', '6'], icon: createPriorityBadge(6, '#8b5cf6', '#7c3aed') },
  { id: 'p7', name: 'Prioridad 7', category: 'priority_status', tags: ['prioridad', 'p7', '7'], icon: createPriorityBadge(7, '#06b6d4', '#0891b2') },
  { id: 'p8', name: 'Prioridad 8', category: 'priority_status', tags: ['prioridad', 'p8', '8'], icon: createPriorityBadge(8, '#10b981', '#059669') },
  { id: 'p9', name: 'Prioridad 9', category: 'priority_status', tags: ['prioridad', 'p9', '9'], icon: createPriorityBadge(9, '#ec4899', '#db2777') },

  { id: 'check', name: 'Completado', category: 'priority_status', tags: ['check', 'listo', 'ok', 'completado', 'correcto'], icon: getIcon('Check') },
  { id: 'check-check', name: 'Doble Check / Aprobado', category: 'priority_status', tags: ['doble check', 'visto', 'entregado', 'aprobado'], icon: getIcon('CheckCheck') },
  { id: 'check-circle', name: 'Verificado en Círculo', category: 'priority_status', tags: ['verificado', 'circulo', 'valido', 'ok'], icon: getIcon('CheckCircle') },
  { id: 'check-circle-2', name: 'Confirmado Éxito', category: 'priority_status', tags: ['confirmado', 'exito', 'circulo'], icon: getIcon('CheckCircle2') },
  { id: 'check-square', name: 'Casilla Marcada', category: 'priority_status', tags: ['checkbox', 'casilla', 'marcada', 'tarea'], icon: getIcon('CheckSquare') },
  { id: 'square', name: 'Casilla Pendiente', category: 'priority_status', tags: ['checkbox', 'pendiente', 'cuadro', 'vacio'], icon: getIcon('Square') },
  { id: 'alert-triangle', name: 'Advertencia Peligro', category: 'priority_status', tags: ['alerta', 'advertencia', 'triangulo', 'peligro', 'warning'], icon: getIcon('AlertTriangle') },
  { id: 'alert-circle', name: 'Alerta Círculo', category: 'priority_status', tags: ['alerta', 'atencion', 'circulo', 'error'], icon: getIcon('AlertCircle') },
  { id: 'alert-octagon', name: 'Alerta Crítica / Stop', category: 'priority_status', tags: ['alerta', 'stop', 'octogono', 'critico'], icon: getIcon('AlertOctagon') },
  { id: 'badge-alert', name: 'Insignia de Alerta', category: 'priority_status', tags: ['badge', 'insignia', 'alerta', 'aviso'], icon: getIcon('BadgeAlert') },
  { id: 'badge-check', name: 'Insignia Verificada', category: 'priority_status', tags: ['badge', 'verificado', 'oficial', 'certificado'], icon: getIcon('BadgeCheck') },
  { id: 'badge-info', name: 'Insignia Informativa', category: 'priority_status', tags: ['badge', 'info', 'informacion'], icon: getIcon('BadgeInfo') },
  { id: 'badge-help', name: 'Insignia de Ayuda', category: 'priority_status', tags: ['badge', 'ayuda', 'soporte'], icon: getIcon('BadgeHelp') },
  { id: 'help-circle', name: 'Pregunta / Duda', category: 'priority_status', tags: ['ayuda', 'duda', 'pregunta', 'faq', 'help'], icon: getIcon('HelpCircle') },
  { id: 'info', name: 'Información General', category: 'priority_status', tags: ['info', 'informacion', 'detalle', 'guia'], icon: getIcon('Info') },
  { id: 'flag', name: 'Bandera Estándar', category: 'priority_status', tags: ['bandera', 'marcador', 'hito', 'flag'], icon: getIcon('Flag') },
  { id: 'flag-triangle-right', name: 'Banderín de Meta', category: 'priority_status', tags: ['banderin', 'meta', 'hito'], icon: getIcon('FlagTriangleRight') },
  { id: 'flame', name: 'Fuego / Urgente', category: 'priority_status', tags: ['fuego', 'urgente', 'caliente', 'prioritario', 'flame'], icon: getIcon('Flame') },
  { id: 'zap', name: 'Rayo / Inmediato', category: 'priority_status', tags: ['rayo', 'rapido', 'inmediato', 'energia', 'zap'], icon: getIcon('Zap') },
  { id: 'clock', name: 'Reloj / En Espera', category: 'priority_status', tags: ['reloj', 'tiempo', 'espera', 'cronometro', 'pendiente'], icon: getIcon('Clock') },
  { id: 'hourglass', name: 'Reloj de Arena', category: 'priority_status', tags: ['reloj de arena', 'tiempo', 'limite', 'esperando'], icon: getIcon('Hourglass') },
  { id: 'timer', name: 'Temporizador', category: 'priority_status', tags: ['temporizador', 'timer', 'cuenta atras', 'plazo'], icon: getIcon('Timer') },
  { id: 'alarm-clock', name: 'Alarma / Despertador', category: 'priority_status', tags: ['alarma', 'recordatorio', 'despertador'], icon: getIcon('AlarmClock') },
  { id: 'calendar-clock', name: 'Fecha Límite', category: 'priority_status', tags: ['fecha limite', 'calendario', 'entrega', 'deadline'], icon: getIcon('CalendarClock') },
  { id: 'target', name: 'Objetivo / Diana', category: 'priority_status', tags: ['objetivo', 'meta', 'diana', 'target', 'kpi'], icon: getIcon('Target') },
  { id: 'crosshair', name: 'Punto de Mira / Enfoque', category: 'priority_status', tags: ['enfoque', 'mira', 'preciso', 'foco'], icon: getIcon('Crosshair') },
  { id: 'ban', name: 'Prohibido / Bloqueado', category: 'priority_status', tags: ['bloqueado', 'prohibido', 'cancelado', 'no'], icon: getIcon('Ban') },
  { id: 'x-circle', name: 'Cancelado / Error', category: 'priority_status', tags: ['error', 'cancelado', 'fallo', 'cerrar'], icon: getIcon('XCircle') },
  { id: 'x-octagon', name: 'Detener Emergencia', category: 'priority_status', tags: ['detener', 'parar', 'stop', 'emergencia'], icon: getIcon('XOctagon') },
  { id: 'pause-circle', name: 'En Pausa', category: 'priority_status', tags: ['pausa', 'detenido', 'esperar'], icon: getIcon('PauseCircle') },
  { id: 'play-circle', name: 'En Ejecución / Play', category: 'priority_status', tags: ['iniciado', 'ejecucion', 'play', 'arranque'], icon: getIcon('PlayCircle') },
  { id: 'refresh-cw', name: 'En Proceso / Sincronizando', category: 'priority_status', tags: ['proceso', 'sincronizando', 'recarga', 'loop'], icon: getIcon('RefreshCw') },
  { id: 'loader', name: 'Cargando', category: 'priority_status', tags: ['cargando', 'progreso', 'espera', 'loader'], icon: getIcon('Loader') },
  { id: 'shield-alert', name: 'Escudo en Alerta', category: 'priority_status', tags: ['seguridad', 'alerta', 'escudo', 'vulnerable'], icon: getIcon('ShieldAlert') },
  { id: 'radio', name: 'En Vivo / Transmitiendo', category: 'priority_status', tags: ['en vivo', 'live', 'transmision', 'activo'], icon: getIcon('Radio') },

  // ==========================================
  // 2. NEGOCIOS, FINANZAS & TRABAJO (50 icons)
  // ==========================================
  { id: 'briefcase', name: 'Maletín / Trabajo', category: 'business_finance', tags: ['maletin', 'trabajo', 'negocio', 'empresa', 'empleo'], icon: getIcon('Briefcase') },
  { id: 'building', name: 'Edificio / Oficina', category: 'business_finance', tags: ['edificio', 'oficina', 'sede', 'empresa'], icon: getIcon('Building') },
  { id: 'building-2', name: 'Corporación / Rascacielos', category: 'business_finance', tags: ['corporacion', 'rascacielos', 'negocio'], icon: getIcon('Building2') },
  { id: 'dollar-sign', name: 'Dólar / Dinero', category: 'business_finance', tags: ['dolar', 'dinero', 'moneda', 'precio', 'ingreso'], icon: getIcon('DollarSign') },
  { id: 'euro', name: 'Euro', category: 'business_finance', tags: ['euro', 'dinero', 'europa', 'moneda'], icon: getIcon('Euro') },
  { id: 'pound-sterling', name: 'Libra Esterlina', category: 'business_finance', tags: ['libra', 'dinero', 'uk', 'moneda'], icon: getIcon('PoundSterling') },
  { id: 'coins', name: 'Monedas / Ahorro', category: 'business_finance', tags: ['monedas', 'cambio', 'ahorro', 'efectivo'], icon: getIcon('Coins') },
  { id: 'wallet', name: 'Billetera', category: 'business_finance', tags: ['billetera', 'cartera', 'pagos', 'fondos'], icon: getIcon('Wallet') },
  { id: 'credit-card', name: 'Tarjeta de Crédito', category: 'business_finance', tags: ['tarjeta', 'credito', 'debito', 'pago', 'compra'], icon: getIcon('CreditCard') },
  { id: 'receipt', name: 'Recibo / Factura', category: 'business_finance', tags: ['recibo', 'factura', 'ticket', 'comprobante'], icon: getIcon('Receipt') },
  { id: 'trending-up', name: 'Crecimiento / Tendencia Alza', category: 'business_finance', tags: ['crecimiento', 'alza', 'exito', 'subida', 'ganancia'], icon: getIcon('TrendingUp') },
  { id: 'trending-down', name: 'Descenso / Pérdida', category: 'business_finance', tags: ['bajada', 'descenso', 'perdida', 'caida'], icon: getIcon('TrendingDown') },
  { id: 'bar-chart', name: 'Gráfico de Barras', category: 'business_finance', tags: ['grafico', 'barras', 'estadisticas', 'analytics'], icon: getIcon('BarChart') },
  { id: 'bar-chart-2', name: 'Gráfico Comparativo', category: 'business_finance', tags: ['grafico', 'comparacion', 'rendimiento'], icon: getIcon('BarChart2') },
  { id: 'bar-chart-3', name: 'Métricas de Negocio', category: 'business_finance', tags: ['metricas', 'grafico', 'informe'], icon: getIcon('BarChart3') },
  { id: 'pie-chart', name: 'Gráfico Circular / Tarta', category: 'business_finance', tags: ['grafico circular', 'tarta', 'porcentaje', 'cuota'], icon: getIcon('PieChart') },
  { id: 'line-chart', name: 'Gráfico de Líneas', category: 'business_finance', tags: ['grafico lineas', 'tendencia', 'evolucion'], icon: getIcon('LineChart') },
  { id: 'candlestick-chart', name: 'Velas Financieras / Trading', category: 'business_finance', tags: ['trading', 'bolsa', 'velas', 'finanzas'], icon: getIcon('CandlestickChart') },
  { id: 'presentation', name: 'Presentación Ejecutiva', category: 'business_finance', tags: ['presentacion', 'diapositivas', 'reunion', 'pitch'], icon: getIcon('Presentation') },
  { id: 'landmark', name: 'Banco / Institución', category: 'business_finance', tags: ['banco', 'institucion', 'gobierno', 'finanzas'], icon: getIcon('Landmark') },
  { id: 'piggy-bank', name: 'Alcancía / Ahorros', category: 'business_finance', tags: ['alcancia', 'cerdito', 'ahorro', 'reserva'], icon: getIcon('PiggyBank') },
  { id: 'badge-percent', name: 'Descuento / Porcentaje', category: 'business_finance', tags: ['descuento', 'porcentaje', 'oferta', 'promo'], icon: getIcon('BadgePercent') },
  { id: 'percent', name: 'Símbolo Porcentaje', category: 'business_finance', tags: ['porcentaje', 'tasa', 'interes'], icon: getIcon('Percent') },
  { id: 'shopping-cart', name: 'Carrito de Compras', category: 'business_finance', tags: ['carrito', 'compras', 'tienda', 'ecommerce'], icon: getIcon('ShoppingCart') },
  { id: 'shopping-bag', name: 'Bolsa de Compras', category: 'business_finance', tags: ['bolsa', 'compras', 'retail', 'tienda'], icon: getIcon('ShoppingBag') },
  { id: 'store', name: 'Tienda Física / Local', category: 'business_finance', tags: ['tienda', 'local', 'comercio', 'negocio'], icon: getIcon('Store') },
  { id: 'tag', name: 'Etiqueta de Precio', category: 'business_finance', tags: ['etiqueta', 'precio', 'oferta', 'tag'], icon: getIcon('Tag') },
  { id: 'tags', name: 'Múltiples Etiquetas', category: 'business_finance', tags: ['etiquetas', 'categorias', 'clasificacion'], icon: getIcon('Tags') },
  { id: 'award', name: 'Premio / Hito Comercial', category: 'business_finance', tags: ['premio', 'reconocimiento', 'hito', 'record'], icon: getIcon('Award') },
  { id: 'trophy', name: 'Trofeo de Éxito', category: 'business_finance', tags: ['trofeo', 'campeon', 'ganador', 'victoria'], icon: getIcon('Trophy') },
  { id: 'medal', name: 'Medalla de Oro', category: 'business_finance', tags: ['medalla', 'merito', 'logro', 'puesto'], icon: getIcon('Medal') },
  { id: 'scale', name: 'Balanza / Justicia Legal', category: 'business_finance', tags: ['balanza', 'ley', 'justicia', 'equilibrio', 'legal'], icon: getIcon('Scale') },
  { id: 'gavel', name: 'Martillo Legal / Contrato', category: 'business_finance', tags: ['martillo', 'juez', 'subasta', 'acuerdo'], icon: getIcon('Gavel') },
  { id: 'handshake', name: 'Apretón de Manos / Alianza', category: 'business_finance', tags: ['alianza', 'acuerdo', 'trato', 'socio', 'negociacion'], icon: getIcon('Handshake') },
  { id: 'network', name: 'Red de Contactos / Networking', category: 'business_finance', tags: ['red', 'networking', 'organigrama', 'nodos'], icon: getIcon('Network') },
  { id: 'user-check', name: 'Cliente Verificado', category: 'business_finance', tags: ['cliente', 'aprobado', 'usuario verificado'], icon: getIcon('UserCheck') },
  { id: 'user-plus', name: 'Nuevo Cliente / Contratación', category: 'business_finance', tags: ['reclutamiento', 'nuevo usuario', 'contratacion'], icon: getIcon('UserPlus') },
  { id: 'users', name: 'Equipo de Trabajo', category: 'business_finance', tags: ['equipo', 'grupo', 'empleados', 'comunidad'], icon: getIcon('Users') },
  { id: 'calculator', name: 'Calculadora / Presupuesto', category: 'business_finance', tags: ['calculadora', 'costos', 'presupuesto', 'cuentas'], icon: getIcon('Calculator') },
  { id: 'factory', name: 'Fábrica / Industria', category: 'business_finance', tags: ['fabrica', 'industria', 'produccion', 'manufactura'], icon: getIcon('Factory') },
  { id: 'boxes', name: 'Inventario / Almacén', category: 'business_finance', tags: ['inventario', 'almacen', 'stock', 'cajas'], icon: getIcon('Boxes') },
  { id: 'package', name: 'Paquete de Envío', category: 'business_finance', tags: ['paquete', 'envio', 'producto', 'caja'], icon: getIcon('Package') },
  { id: 'truck', name: 'Transporte / Logística', category: 'business_finance', tags: ['camion', 'logistica', 'transporte', 'entrega'], icon: getIcon('Truck') },
  { id: 'container', name: 'Contenedor / Comercio Exterior', category: 'business_finance', tags: ['contenedor', 'exportacion', 'importacion'], icon: getIcon('Container') },
  { id: 'newspaper', name: 'Noticias / Prensa', category: 'business_finance', tags: ['periodico', 'prensa', 'noticias', 'comunicado'], icon: getIcon('Newspaper') },
  { id: 'megaphone', name: 'Megáfono / Marketing', category: 'business_finance', tags: ['marketing', 'publicidad', 'anuncio', 'promocion'], icon: getIcon('Megaphone') },
  { id: 'target-arrow', name: 'Público Objetivo / Lead', category: 'business_finance', tags: ['lead', 'audiencia', 'meta comercial'], icon: getIcon('Target') },
  { id: 'stamp', name: 'Sello / Aprobación Oficial', category: 'business_finance', tags: ['sello', 'oficial', 'validez', 'firmado'], icon: getIcon('Stamp') },
  { id: 'qr-code', name: 'Código QR', category: 'business_finance', tags: ['qr', 'escaneo', 'codigo', 'enlace digital'], icon: getIcon('QrCode') },
  { id: 'scan', name: 'Escáner / Lector', category: 'business_finance', tags: ['escanear', 'codigo', 'lector'], icon: getIcon('Scan') },

  // ==========================================
  // 3. TECNOLOGÍA, CÓDIGO & DATOS (50 icons)
  // ==========================================
  { id: 'code', name: 'Código / Desarrollo', category: 'tech_code', tags: ['codigo', 'programacion', 'desarrollo', 'html', 'software'], icon: getIcon('Code') },
  { id: 'code-2', name: 'Etiquetas de Código', category: 'tech_code', tags: ['codigo', 'tags', 'script'], icon: getIcon('Code2') },
  { id: 'terminal', name: 'Consola / Terminal', category: 'tech_code', tags: ['terminal', 'consola', 'bash', 'cli', 'comandos'], icon: getIcon('Terminal') },
  { id: 'cpu', name: 'Procesador / CPU', category: 'tech_code', tags: ['cpu', 'procesador', 'chip', 'hardware', 'computacion'], icon: getIcon('Cpu') },
  { id: 'database', name: 'Base de Datos', category: 'tech_code', tags: ['base de datos', 'sql', 'almacenamiento', 'db', 'datos'], icon: getIcon('Database') },
  { id: 'server', name: 'Servidor Backend', category: 'tech_code', tags: ['servidor', 'backend', 'hosting', 'infraestructura'], icon: getIcon('Server') },
  { id: 'cloud', name: 'Nube Cloud', category: 'tech_code', tags: ['nube', 'cloud', 'aws', 'gcp', 'almacenamiento en linea'], icon: getIcon('Cloud') },
  { id: 'cloud-cog', name: 'Servicios en la Nube', category: 'tech_code', tags: ['cloud', 'configuracion nube', 'devops'], icon: getIcon('CloudCog') },
  { id: 'git-branch', name: 'Rama Git (Branch)', category: 'tech_code', tags: ['git', 'rama', 'branch', 'versionamiento'], icon: getIcon('GitBranch') },
  { id: 'git-commit', name: 'Commit Git', category: 'tech_code', tags: ['git', 'commit', 'cambio', 'historial'], icon: getIcon('GitCommit') },
  { id: 'git-merge', name: 'Merge Git', category: 'tech_code', tags: ['git', 'merge', 'fusion', 'pull request'], icon: getIcon('GitMerge') },
  { id: 'git-pull-request', name: 'Pull Request', category: 'tech_code', tags: ['pr', 'pull request', 'revision', 'github'], icon: getIcon('GitPullRequest') },
  { id: 'git-fork', name: 'Fork Git', category: 'tech_code', tags: ['fork', 'bifurcacion', 'copia repositorio'], icon: getIcon('GitFork') },
  { id: 'bug', name: 'Error / Bug', category: 'tech_code', tags: ['bug', 'error', 'fallo', 'depuracion', 'debug'], icon: getIcon('Bug') },
  { id: 'binary', name: 'Código Binario', category: 'tech_code', tags: ['binario', '0101', 'datos binarios', 'maquina'], icon: getIcon('Binary') },
  { id: 'bot', name: 'Robot / Agente IA', category: 'tech_code', tags: ['bot', 'robot', 'ia', 'inteligencia artificial', 'automatizacion'], icon: getIcon('Bot') },
  { id: 'circuit-board', name: 'Placa de Circuito', category: 'tech_code', tags: ['circuito', 'hardware', 'electronica', 'pcb'], icon: getIcon('CircuitBoard') },
  { id: 'laptop', name: 'Portátil / Laptop', category: 'tech_code', tags: ['laptop', 'computadora', 'portatil', 'notebook'], icon: getIcon('Laptop') },
  { id: 'monitor', name: 'Monitor / Pantalla', category: 'tech_code', tags: ['monitor', 'pantalla', 'display', 'escritorio'], icon: getIcon('Monitor') },
  { id: 'smartphone', name: 'Móvil / Smartphone', category: 'tech_code', tags: ['smartphone', 'movil', 'celular', 'telefono', 'app'], icon: getIcon('Smartphone') },
  { id: 'tablet', name: 'Tablet / iPad', category: 'tech_code', tags: ['tablet', 'ipad', 'pantalla tactil'], icon: getIcon('Tablet') },
  { id: 'watch', name: 'Smartwatch / Reloj', category: 'tech_code', tags: ['smartwatch', 'wearable', 'reloj inteligente'], icon: getIcon('Watch') },
  { id: 'hard-drive', name: 'Disco Duro / HDD', category: 'tech_code', tags: ['disco duro', 'hdd', 'ssd', 'almacenamiento'], icon: getIcon('HardDrive') },
  { id: 'hard-hat', name: 'Casco de Construcción', category: 'tech_code', tags: ['construccion', 'en obra', 'ingenieria'], icon: getIcon('HardHat') },
  { id: 'usb', name: 'Memoria USB', category: 'tech_code', tags: ['usb', 'pendrive', 'puerto', 'hardware'], icon: getIcon('Usb') },
  { id: 'wifi', name: 'Conexión Wi-Fi', category: 'tech_code', tags: ['wifi', 'inalambrico', 'internet', 'red'], icon: getIcon('Wifi') },
  { id: 'wifi-off', name: 'Sin Conexión Wi-Fi', category: 'tech_code', tags: ['sin internet', 'desconectado', 'offline'], icon: getIcon('WifiOff') },
  { id: 'bluetooth', name: 'Bluetooth', category: 'tech_code', tags: ['bluetooth', 'emparejamiento', 'inalambrico'], icon: getIcon('Bluetooth') },
  { id: 'satellite', name: 'Satélite', category: 'tech_code', tags: ['satelite', 'orbita', 'telecomunicaciones', 'gps'], icon: getIcon('Satellite') },
  { id: 'satellite-dish', name: 'Antena Parabólica', category: 'tech_code', tags: ['antena', 'senal', 'receptor'], icon: getIcon('SatelliteDish') },
  { id: 'radio-tower', name: 'Torre de Transmisión', category: 'tech_code', tags: ['torre', 'telecom', 'cobertura'], icon: getIcon('RadioTower') },
  { id: 'qr-scan', name: 'Escaneo de Código', category: 'tech_code', tags: ['escanear', 'qr', 'optico'], icon: getIcon('ScanLine') },
  { id: 'layers', name: 'Capas de Software / Layers', category: 'tech_code', tags: ['capas', 'arquitectura', 'niveles', 'layers'], icon: getIcon('Layers') },
  { id: 'webhook', name: 'Webhook / API', category: 'tech_code', tags: ['webhook', 'api', 'evento', 'integracion'], icon: getIcon('Webhook') },
  { id: 'blocks', name: 'Módulos / Bloques', category: 'tech_code', tags: ['bloques', 'modulos', 'componentes', 'plugins'], icon: getIcon('Blocks') },
  { id: 'cable', name: 'Cable de Red', category: 'tech_code', tags: ['cable', 'ethernet', 'conexion fisica'], icon: getIcon('Cable') },
  { id: 'power', name: 'Botón de Encendido', category: 'tech_code', tags: ['power', 'encendido', 'apagado', 'reiniciar'], icon: getIcon('Power') },
  { id: 'cpu-tower', name: 'Torre de Ordenador', category: 'tech_code', tags: ['torre', 'pc gamer', 'estacion de trabajo'], icon: getIcon('Server') },
  { id: 'fingerprint', name: 'Huella Dactilar / Biometría', category: 'tech_code', tags: ['huella', 'biometria', 'autenticacion', 'seguridad'], icon: getIcon('Fingerprint') },
  { id: 'scan-face', name: 'Reconocimiento Facial', category: 'tech_code', tags: ['face id', 'reconocimiento', 'camara ia'], icon: getIcon('ScanFace') },
  { id: 'mouse', name: 'Ratón / Mouse', category: 'tech_code', tags: ['mouse', 'raton', 'cursor', 'puntero'], icon: getIcon('Mouse') },
  { id: 'keyboard', name: 'Teclado de Computadora', category: 'tech_code', tags: ['teclado', 'mecanografia', 'atajos', 'keyboard'], icon: getIcon('Keyboard') },
  { id: 'gamepad', name: 'Mando / Videojuegos', category: 'tech_code', tags: ['gamepad', 'juegos', 'consola', 'gaming'], icon: getIcon('Gamepad2') },
  { id: 'printer', name: 'Impresora', category: 'tech_code', tags: ['impresora', 'imprimir', 'papel', 'copia'], icon: getIcon('Printer') },
  { id: 'router', name: 'Router de Red', category: 'tech_code', tags: ['router', 'modem', 'red local', 'ip'], icon: getIcon('Router') },
  { id: 'split', name: 'División / Fork', category: 'tech_code', tags: ['dividir', 'split', 'separar'], icon: getIcon('Split') },
  { id: 'combine', name: 'Combinar / Merge', category: 'tech_code', tags: ['combinar', 'unir', 'agrupar'], icon: getIcon('Combine') },
  { id: 'plug', name: 'Enchufe / Plugin', category: 'tech_code', tags: ['enchufe', 'plugin', 'conector', 'adaptador'], icon: getIcon('Plug') },
  { id: 'unplug', name: 'Desconectado', category: 'tech_code', tags: ['desenchufado', 'desconectado', 'aislado'], icon: getIcon('Unplug') },

  // ==========================================
  // 4. COMUNICACIÓN & REDES SOCIALES (45 icons)
  // ==========================================
  { id: 'message-square', name: 'Mensaje de Texto', category: 'communication', tags: ['mensaje', 'chat', 'comentario', 'texto'], icon: getIcon('MessageSquare') },
  { id: 'message-circle', name: 'Burbuja de Conversación', category: 'communication', tags: ['conversacion', 'dialogo', 'chat'], icon: getIcon('MessageCircle') },
  { id: 'messages-square', name: 'Foro / Hilo de Discusión', category: 'communication', tags: ['foro', 'hilos', 'respuestas', 'comunidad'], icon: getIcon('MessagesSquare') },
  { id: 'mail', name: 'Correo Electrónico', category: 'communication', tags: ['correo', 'email', 'inbox', 'mensaje'], icon: getIcon('Mail') },
  { id: 'mail-open', name: 'Correo Leído', category: 'communication', tags: ['correo abierto', 'leido', 'revisado'], icon: getIcon('MailOpen') },
  { id: 'mail-plus', name: 'Redactar Correo', category: 'communication', tags: ['nuevo correo', 'enviar email'], icon: getIcon('MailPlus') },
  { id: 'send', name: 'Enviar Mensaje / Avión', category: 'communication', tags: ['enviar', 'avion de papel', 'transmitir', 'send'], icon: getIcon('Send') },
  { id: 'phone', name: 'Teléfono / Llamada', category: 'communication', tags: ['telefono', 'llamada', 'contacto', 'celular'], icon: getIcon('Phone') },
  { id: 'phone-call', name: 'Llamada Entrante', category: 'communication', tags: ['llamando', 'conversacion telefonica'], icon: getIcon('PhoneCall') },
  { id: 'phone-forwarded', name: 'Desvío de Llamada', category: 'communication', tags: ['desvio', 'transferencia llamada'], icon: getIcon('PhoneForwarded') },
  { id: 'phone-missed', name: 'Llamada Perdida', category: 'communication', tags: ['perdida', 'no contestada'], icon: getIcon('PhoneMissed') },
  { id: 'bell', name: 'Campana / Notificación', category: 'communication', tags: ['notificacion', 'campana', 'alerta', 'aviso', 'bell'], icon: getIcon('Bell') },
  { id: 'bell-ring', name: 'Notificación Activa', category: 'communication', tags: ['sonando', 'aviso activo', 'recordatorio'], icon: getIcon('BellRing') },
  { id: 'bell-off', name: 'Silenciar Notificaciones', category: 'communication', tags: ['silencio', 'no molestar', 'sin avisos'], icon: getIcon('BellOff') },
  { id: 'share-2', name: 'Compartir', category: 'communication', tags: ['compartir', 'enviar', 'red social', 'share'], icon: getIcon('Share2') },
  { id: 'thumbs-up', name: 'Me Gusta / Like', category: 'communication', tags: ['like', 'me gusta', 'positivo', 'aprobado'], icon: getIcon('ThumbsUp') },
  { id: 'thumbs-down', name: 'No Me Gusta / Dislike', category: 'communication', tags: ['dislike', 'no me gusta', 'negativo'], icon: getIcon('ThumbsDown') },
  { id: 'heart', name: 'Corazón / Favorito', category: 'communication', tags: ['corazon', 'amor', 'favorito', 'love', 'heart'], icon: getIcon('Heart') },
  { id: 'user', name: 'Perfil de Usuario', category: 'communication', tags: ['usuario', 'persona', 'perfil', 'avatar', 'cuenta'], icon: getIcon('User') },
  { id: 'user-cog', name: 'Configuración de Usuario', category: 'communication', tags: ['cuenta', 'ajustes usuario', 'rol'], icon: getIcon('UserCog') },
  { id: 'user-x', name: 'Eliminar / Bloquear Usuario', category: 'communication', tags: ['bloquear', 'eliminar contacto'], icon: getIcon('UserX') },
  { id: 'contact', name: 'Libreta de Contactos', category: 'communication', tags: ['contactos', 'agenda', 'directorio'], icon: getIcon('Contact') },
  { id: 'at-sign', name: 'Mención @', category: 'communication', tags: ['arroba', 'mencion', 'etiquetar'], icon: getIcon('AtSign') },
  { id: 'hash', name: 'Hashtag #', category: 'communication', tags: ['hashtag', 'numeral', 'tendencia', 'etiqueta'], icon: getIcon('Hash') },
  { id: 'rss', name: 'Canal RSS / Feed', category: 'communication', tags: ['rss', 'feed', 'suscripcion', 'noticias'], icon: getIcon('Rss') },
  { id: 'podcast', name: 'Podcast / Emisión', category: 'communication', tags: ['podcast', 'audio', 'programa', 'episodio'], icon: getIcon('Podcast') },
  { id: 'mic', name: 'Micrófono / Voz', category: 'communication', tags: ['microfono', 'audio', 'grabacion', 'hablar'], icon: getIcon('Mic') },
  { id: 'mic-off', name: 'Micrófono Silenciado', category: 'communication', tags: ['mute', 'silenciado', 'sin microfono'], icon: getIcon('MicOff') },
  { id: 'video', name: 'Videollamada / Cámara', category: 'communication', tags: ['videollamada', 'zoom', 'meet', 'camara'], icon: getIcon('Video') },
  { id: 'video-off', name: 'Cámara Apagada', category: 'communication', tags: ['camara apagada', 'sin video'], icon: getIcon('VideoOff') },
  { id: 'voicemail', name: 'Buzón de Voz', category: 'communication', tags: ['buzon', 'mensaje de voz'], icon: getIcon('Voicemail') },
  { id: 'inbox', name: 'Bandeja de Entrada', category: 'communication', tags: ['inbox', 'recibidos', 'bandeja'], icon: getIcon('Inbox') },
  { id: 'pin', name: 'Fijar Mensaje / Chincheta', category: 'communication', tags: ['fijar', 'anclar', 'destacar', 'pin'], icon: getIcon('Pin') },
  { id: 'pin-off', name: 'Desanclar', category: 'communication', tags: ['desfijar', 'desanclar'], icon: getIcon('PinOff') },
  { id: 'sparkle', name: 'Destello Social', category: 'communication', tags: ['destello', 'popular', 'viral'], icon: getIcon('Sparkle') },

  // ==========================================
  // 5. DISEÑO, ARTE & MULTIMEDIA (45 icons)
  // ==========================================
  { id: 'palette', name: 'Paleta de Pintura / Color', category: 'design_media', tags: ['color', 'paleta', 'diseno', 'arte', 'pintura'], icon: getIcon('Palette') },
  { id: 'paint-brush', name: 'Pincel de Artista', category: 'design_media', tags: ['pincel', 'pintar', 'brocha', 'trazado'], icon: getIcon('Paintbrush') },
  { id: 'paint-bucket', name: 'Bote de Pintura / Relleno', category: 'design_media', tags: ['relleno', 'color de fondo', 'cubo pintura'], icon: getIcon('PaintBucket') },
  { id: 'pen-tool', name: 'Pluma Vectorial Bézier', category: 'design_media', tags: ['pluma', 'vector', 'bezier', 'illustrator', 'curva'], icon: getIcon('PenTool') },
  { id: 'pencil', name: 'Lápiz de Boceto', category: 'design_media', tags: ['lapiz', 'boceto', 'dibujo', 'escribir'], icon: getIcon('Pencil') },
  { id: 'eraser', name: 'Borrador', category: 'design_media', tags: ['borrador', 'goma', 'limpiar'], icon: getIcon('Eraser') },
  { id: 'image', name: 'Imagen / Fotografía', category: 'design_media', tags: ['imagen', 'foto', 'grafico', 'galeria'], icon: getIcon('Image') },
  { id: 'images', name: 'Galería de Imágenes', category: 'design_media', tags: ['galeria', 'fotos', 'album'], icon: getIcon('Images') },
  { id: 'camera', name: 'Cámara Fotográfica', category: 'design_media', tags: ['camara', 'fotografia', 'foto', 'captura'], icon: getIcon('Camera') },
  { id: 'film', name: 'Rollo de Película / Cine', category: 'design_media', tags: ['pelicula', 'cine', 'video', 'metraje'], icon: getIcon('Film') },
  { id: 'clapperboard', name: 'Claqueta de Cine', category: 'design_media', tags: ['claqueta', 'cine', 'grabacion', 'director'], icon: getIcon('Clapperboard') },
  { id: 'music', name: 'Nota Musical', category: 'design_media', tags: ['musica', 'cancion', 'nota', 'melodia'], icon: getIcon('Music') },
  { id: 'music-2', name: 'Doble Corchea', category: 'design_media', tags: ['musica', 'ritmo', 'sonido'], icon: getIcon('Music2') },
  { id: 'headphones', name: 'Auriculares', category: 'design_media', tags: ['auriculares', 'escuchar', 'musica', 'audio'], icon: getIcon('Headphones') },
  { id: 'speaker', name: 'Altavoz', category: 'design_media', tags: ['altavoz', 'sonido', 'parlante'], icon: getIcon('Speaker') },
  { id: 'volume-2', name: 'Volumen Alto', category: 'design_media', tags: ['volumen', 'sonido alto', 'audio'], icon: getIcon('Volume2') },
  { id: 'volume-x', name: 'Silencio / Mudo', category: 'design_media', tags: ['mute', 'silencio', 'sin sonido'], icon: getIcon('VolumeX') },
  { id: 'crop', name: 'Recortar Imagen', category: 'design_media', tags: ['recortar', 'encuadre', 'crop', 'tamano'], icon: getIcon('Crop') },
  { id: 'scissors', name: 'Tijeras / Cortar', category: 'design_media', tags: ['cortar', 'tijeras', 'edicion'], icon: getIcon('Scissors') },
  { id: 'eye', name: 'Ojo / Visibilidad', category: 'design_media', tags: ['ojo', 'ver', 'visible', 'mostrar', 'preview'], icon: getIcon('Eye') },
  { id: 'eye-off', name: 'Oculto / No Visible', category: 'design_media', tags: ['oculto', 'invisible', 'esconder'], icon: getIcon('EyeOff') },
  { id: 'pipette', name: 'Cuentagotas / Selector de Color', category: 'design_media', tags: ['cuentagotas', 'color', 'muestra'], icon: getIcon('Pipette') },
  { id: 'wand-2', name: 'Varita Mágica / Retoque', category: 'design_media', tags: ['varita magica', 'retoque', 'efectos', 'ia'], icon: getIcon('Wand2') },
  { id: 'sliders', name: 'Ajustes de Ecualizador / Sliders', category: 'design_media', tags: ['sliders', 'ecualizador', 'parametros', 'filtro'], icon: getIcon('Sliders') },
  { id: 'sliders-horizontal', name: 'Controles Horizontales', category: 'design_media', tags: ['controles', 'ajustes', 'niveles'], icon: getIcon('SlidersHorizontal') },
  { id: 'maximize', name: 'Pantalla Completa', category: 'design_media', tags: ['pantalla completa', 'maximizar', 'fullscreen'], icon: getIcon('Maximize') },
  { id: 'minimize', name: 'Minimizar', category: 'design_media', tags: ['minimizar', 'reducir'], icon: getIcon('Minimize') },
  { id: 'zoom-in', name: 'Acercar Zoom', category: 'design_media', tags: ['zoom', 'acercar', 'lupa'], icon: getIcon('ZoomIn') },
  { id: 'zoom-out', name: 'Alejar Zoom', category: 'design_media', tags: ['zoom out', 'alejar', 'reducir vista'], icon: getIcon('ZoomOut') },
  { id: 'shapes', name: 'Formas Geométricas', category: 'design_media', tags: ['figuras', 'formas', 'geometria', 'vector'], icon: getIcon('Shapes') },
  { id: 'sparkles', name: 'Efecto Destacado / Brillos', category: 'design_media', tags: ['brillo', 'magia', 'destacado', 'especial', 'sparkles'], icon: getIcon('Sparkles') },
  { id: 'contrast', name: 'Contraste', category: 'design_media', tags: ['contraste', 'brillo', 'luz'], icon: getIcon('Contrast') },

  // ==========================================
  // 6. NAVEGACIÓN, MAPAS & FLECHAS (45 icons)
  // ==========================================
  { id: 'compass', name: 'Brújula / Orientación', category: 'navigation_maps', tags: ['brujula', 'orientacion', 'norte', 'rumbo', 'compass'], icon: getIcon('Compass') },
  { id: 'map-pin', name: 'Marcador de Mapa / Ubicación', category: 'navigation_maps', tags: ['ubicacion', 'marcador', 'lugar', 'pin', 'mapa'], icon: getIcon('MapPin') },
  { id: 'map', name: 'Mapa Geográfico', category: 'navigation_maps', tags: ['mapa', 'cartografia', 'plano', 'guia'], icon: getIcon('Map') },
  { id: 'globe', name: 'Globo Terráqueo / Mundo', category: 'navigation_maps', tags: ['mundo', 'planeta', 'global', 'tierra', 'internacional'], icon: getIcon('Globe') },
  { id: 'globe-2', name: 'Red Global', category: 'navigation_maps', tags: ['red global', 'internacional', 'web'], icon: getIcon('Globe2') },
  { id: 'navigation', name: 'Flecha de Navegación GPS', category: 'navigation_maps', tags: ['gps', 'navegacion', 'rumbo', 'direccion'], icon: getIcon('Navigation') },
  { id: 'navigation-2', name: 'Guía de Ruta', category: 'navigation_maps', tags: ['ruta', 'camino', 'itinerario'], icon: getIcon('Navigation2') },
  { id: 'route', name: 'Trazado de Ruta', category: 'navigation_maps', tags: ['ruta', 'camino', 'trayectoria', 'puntos'], icon: getIcon('Route') },
  { id: 'signpost', name: 'Señal de Cruce', category: 'navigation_maps', tags: ['cartel', 'cruce', 'opciones', 'direccion'], icon: getIcon('Signpost') },
  { id: 'anchor', name: 'Ancla Marina', category: 'navigation_maps', tags: ['ancla', 'puerto', 'firme', 'mar'], icon: getIcon('Anchor') },
  { id: 'arrow-right', name: 'Flecha Derecha', category: 'navigation_maps', tags: ['flecha', 'derecha', 'siguiente', 'avance'], icon: getIcon('ArrowRight') },
  { id: 'arrow-left', name: 'Flecha Izquierda', category: 'navigation_maps', tags: ['flecha', 'izquierda', 'atras', 'regresar'], icon: getIcon('ArrowLeft') },
  { id: 'arrow-up', name: 'Flecha Arriba', category: 'navigation_maps', tags: ['flecha', 'arriba', 'subir'], icon: getIcon('ArrowUp') },
  { id: 'arrow-down', name: 'Flecha Abajo', category: 'navigation_maps', tags: ['flecha', 'abajo', 'bajar'], icon: getIcon('ArrowDown') },
  { id: 'arrow-up-right', name: 'Flecha Diagonal Arriba', category: 'navigation_maps', tags: ['diagonal', 'crecimiento', 'externo'], icon: getIcon('ArrowUpRight') },
  { id: 'arrow-down-right', name: 'Flecha Diagonal Abajo', category: 'navigation_maps', tags: ['diagonal', 'descenso'], icon: getIcon('ArrowDownRight') },
  { id: 'arrow-right-left', name: 'Doble Sentido / Intercambio', category: 'navigation_maps', tags: ['intercambio', 'bidireccional', 'canje'], icon: getIcon('ArrowRightLeft') },
  { id: 'arrow-up-down', name: 'Subir y Bajar', category: 'navigation_maps', tags: ['vertical', 'ordenar'], icon: getIcon('ArrowUpDown') },
  { id: 'corner-down-right', name: 'Giro a la Derecha', category: 'navigation_maps', tags: ['retorno', 'subrama', 'derivacion'], icon: getIcon('CornerDownRight') },
  { id: 'external-link', name: 'Enlace Externo', category: 'navigation_maps', tags: ['enlace', 'link', 'externo', 'abrir'], icon: getIcon('ExternalLink') },
  { id: 'link', name: 'Cadena / Hipervínculo', category: 'navigation_maps', tags: ['link', 'vinculo', 'cadena', 'url'], icon: getIcon('Link') },
  { id: 'link-2', name: 'Enlace Corto', category: 'navigation_maps', tags: ['enlace', 'hipervinculo'], icon: getIcon('Link2') },
  { id: 'unlink', name: 'Desvincular', category: 'navigation_maps', tags: ['desconectar', 'romper enlace'], icon: getIcon('Unlink') },
  { id: 'shuffle', name: 'Orden Aleatorio', category: 'navigation_maps', tags: ['aleatorio', 'mezclar', 'shuffle'], icon: getIcon('Shuffle') },
  { id: 'repeat', name: 'Repetir / Bucle', category: 'navigation_maps', tags: ['repetir', 'bucle', 'ciclo'], icon: getIcon('Repeat') },
  { id: 'plane', name: 'Avión / Vuelo', category: 'navigation_maps', tags: ['avion', 'viaje', 'vuelo', 'turismo', 'aereo'], icon: getIcon('Plane') },
  { id: 'car', name: 'Coche / Automóvil', category: 'navigation_maps', tags: ['coche', 'auto', 'vehiculo', 'viaje'], icon: getIcon('Car') },
  { id: 'train', name: 'Tren / Ferrocarril', category: 'navigation_maps', tags: ['tren', 'metro', 'via'], icon: getIcon('Train') },
  { id: 'ship', name: 'Barco / Crucero', category: 'navigation_maps', tags: ['barco', 'navio', 'mar'], icon: getIcon('Ship') },
  { id: 'bus', name: 'Autobús / Bus', category: 'navigation_maps', tags: ['bus', 'autobus', 'transporte publico'], icon: getIcon('Bus') },

  // ==========================================
  // 7. DOCUMENTOS & ARCHIVOS (45 icons)
  // ==========================================
  { id: 'folder', name: 'Carpeta', category: 'documents_files', tags: ['carpeta', 'directorio', 'folder'], icon: getIcon('Folder') },
  { id: 'folder-open', name: 'Carpeta Abierta', category: 'documents_files', tags: ['carpeta abierta', 'explorador'], icon: getIcon('FolderOpen') },
  { id: 'folder-plus', name: 'Crear Carpeta', category: 'documents_files', tags: ['nueva carpeta', 'anadir carpeta'], icon: getIcon('FolderPlus') },
  { id: 'folder-check', name: 'Carpeta Verificada', category: 'documents_files', tags: ['carpeta lista', 'aprobada'], icon: getIcon('FolderCheck') },
  { id: 'folder-git', name: 'Carpeta de Repositorio', category: 'documents_files', tags: ['repo', 'codigo', 'proyecto'], icon: getIcon('FolderGit') },
  { id: 'file', name: 'Archivo Genérico', category: 'documents_files', tags: ['archivo', 'fichero', 'documento'], icon: getIcon('File') },
  { id: 'file-text', name: 'Documento de Texto', category: 'documents_files', tags: ['texto', 'documento', 'doc', 'escrito', 'file-text'], icon: getIcon('FileText') },
  { id: 'file-code', name: 'Archivo de Código Fuente', category: 'documents_files', tags: ['codigo', 'script', 'ts', 'js', 'html'], icon: getIcon('FileCode') },
  { id: 'file-plus', name: 'Nuevo Documento', category: 'documents_files', tags: ['crear archivo', 'nuevo documento'], icon: getIcon('FilePlus') },
  { id: 'file-check', name: 'Documento Firmado / Listo', category: 'documents_files', tags: ['documento aprobado', 'valido'], icon: getIcon('FileCheck') },
  { id: 'file-spreadsheet', name: 'Hoja de Cálculo / Excel', category: 'documents_files', tags: ['excel', 'hoja de calculo', 'tabla', 'datos'], icon: getIcon('FileSpreadsheet') },
  { id: 'file-archive', name: 'Archivo Comprimido ZIP', category: 'documents_files', tags: ['zip', 'rar', 'comprimido'], icon: getIcon('FileArchive') },
  { id: 'archive', name: 'Caja de Archivo', category: 'documents_files', tags: ['archivo historico', 'guardar'], icon: getIcon('Archive') },
  { id: 'clipboard', name: 'Portapapeles', category: 'documents_files', tags: ['portapapeles', 'clipboard', 'copiar', 'pegar'], icon: getIcon('Clipboard') },
  { id: 'clipboard-check', name: 'Lista de Control / Checklist', category: 'documents_files', tags: ['checklist', 'auditoria', 'tareas listas'], icon: getIcon('ClipboardCheck') },
  { id: 'clipboard-list', name: 'Lista de Tareas', category: 'documents_files', tags: ['lista', 'tareas', 'inventario'], icon: getIcon('ClipboardList') },
  { id: 'book', name: 'Libro Cerrado', category: 'documents_files', tags: ['libro', 'lectura', 'manual', 'biblioteca'], icon: getIcon('Book') },
  { id: 'book-open', name: 'Libro Abierto', category: 'documents_files', tags: ['libro abierto', 'estudio', 'guia'], icon: getIcon('BookOpen') },
  { id: 'bookmark', name: 'Marcador de Página', category: 'documents_files', tags: ['marcador', 'favorito', 'bookmark', 'guardar'], icon: getIcon('Bookmark') },
  { id: 'calendar', name: 'Calendario Mensual', category: 'documents_files', tags: ['calendario', 'fecha', 'mes', 'agenda', 'calendar'], icon: getIcon('Calendar') },
  { id: 'calendar-days', name: 'Agenda de Días', category: 'documents_files', tags: ['dias', 'planificacion', 'citas'], icon: getIcon('CalendarDays') },
  { id: 'calendar-range', name: 'Periodo / Rango de Fechas', category: 'documents_files', tags: ['rango', 'periodo', 'duracion'], icon: getIcon('CalendarRange') },
  { id: 'copy', name: 'Copiar', category: 'documents_files', tags: ['copiar', 'duplicar'], icon: getIcon('Copy') },
  { id: 'save', name: 'Guardar en Disco', category: 'documents_files', tags: ['guardar', 'salvar', 'disco'], icon: getIcon('Save') },
  { id: 'download', name: 'Descargar Archivo', category: 'documents_files', tags: ['descargar', 'bajar', 'exportar'], icon: getIcon('Download') },
  { id: 'upload', name: 'Subir Archivo', category: 'documents_files', tags: ['subir', 'cargar', 'importar'], icon: getIcon('Upload') },
  { id: 'hard-drive-download', name: 'Copia de Seguridad', category: 'documents_files', tags: ['backup', 'respaldo'], icon: getIcon('HardDriveDownload') },

  // ==========================================
  // 8. EDUCACIÓN, CIENCIA & LÓGICA (45 icons)
  // ==========================================
  { id: 'graduation-cap', name: 'Birrete de Graduación', category: 'education_science', tags: ['educacion', 'graduacion', 'universidad', 'titulo', 'estudio'], icon: getIcon('GraduationCap') },
  { id: 'lightbulb', name: 'Bombilla / Idea Genial', category: 'education_science', tags: ['idea', 'bombilla', 'creatividad', 'innovacion', 'inspiracion', 'lightbulb'], icon: getIcon('Lightbulb') },
  { id: 'atom', name: 'Átomo / Física Cuántica', category: 'education_science', tags: ['atomo', 'fisica', 'ciencia', 'nuclear', 'investigacion'], icon: getIcon('Atom') },
  { id: 'brain', name: 'Cerebro / Inteligencia', category: 'education_science', tags: ['cerebro', 'inteligencia', 'mente', 'pensamiento', 'psicologia'], icon: getIcon('Brain') },
  { id: 'flask-conical', name: 'Matraz de Química', category: 'education_science', tags: ['quimica', 'laboratorio', 'experimento', 'matraz'], icon: getIcon('FlaskConical') },
  { id: 'flask-round', name: 'Frasco de Laboratorio', category: 'education_science', tags: ['quimica', 'formula', 'ciencia'], icon: getIcon('FlaskRound') },
  { id: 'microscope', name: 'Microscopio / Análisis', category: 'education_science', tags: ['microscopio', 'analisis', 'biologia', 'medico'], icon: getIcon('Microscope') },
  { id: 'dna', name: 'Cadena de ADN / Genética', category: 'education_science', tags: ['adn', 'genetica', 'biologia', 'vida'], icon: getIcon('Dna') },
  { id: 'telescope', name: 'Telescopio / Astronomía', category: 'education_science', tags: ['telescopio', 'estrellas', 'universo', 'espacio'], icon: getIcon('Telescope') },
  { id: 'rocket', name: 'Cohete / Lanzamiento', category: 'education_science', tags: ['cohete', 'lanzamiento', 'startup', 'espacio', 'futuro'], icon: getIcon('Rocket') },
  { id: 'puzzle', name: 'Pieza de Rompecabezas', category: 'education_science', tags: ['puzzle', 'rompecabezas', 'logica', 'encaje', 'solucion'], icon: getIcon('Puzzle') },
  { id: 'glasses', name: 'Gafas de Lectura', category: 'education_science', tags: ['gafas', 'lectura', 'estudio', 'vision'], icon: getIcon('Glasses') },
  { id: 'library', name: 'Biblioteca', category: 'education_science', tags: ['biblioteca', 'conocimiento', 'academico'], icon: getIcon('Library') },
  { id: 'school', name: 'Escuela / Colegio', category: 'education_science', tags: ['escuela', 'colegio', 'educacion'], icon: getIcon('School') },
  { id: 'scroll', name: 'Pergamino Antiguo', category: 'education_science', tags: ['pergamino', 'historia', 'documento antiguo'], icon: getIcon('Scroll') },
  { id: 'magnet', name: 'Imán / Atracción', category: 'education_science', tags: ['iman', 'magnetismo', 'atraccion', 'fisica'], icon: getIcon('Magnet') },
  { id: 'ruler', name: 'Regla de Medir', category: 'education_science', tags: ['regla', 'medida', 'precision', 'geometria'], icon: getIcon('Ruler') },
  { id: 'orbit', name: 'Órbita Planetaria', category: 'education_science', tags: ['orbita', 'sistema', 'planetas'], icon: getIcon('Orbit') },
  { id: 'binary-code', name: 'Lógica Matemática', category: 'education_science', tags: ['matematicas', 'algebra', 'calculo'], icon: getIcon('Binary') },

  // ==========================================
  // 9. NATURALEZA, CLIMA & ENERGÍA (45 icons)
  // ==========================================
  { id: 'sun', name: 'Sol / Despejado', category: 'nature_weather', tags: ['sol', 'dia', 'luz', 'calor', 'verano'], icon: getIcon('Sun') },
  { id: 'sun-medium', name: 'Sol Radiante', category: 'nature_weather', tags: ['sol brillante', 'energia solar'], icon: getIcon('SunMedium') },
  { id: 'moon', name: 'Luna / Noche', category: 'nature_weather', tags: ['luna', 'noche', 'oscuro', 'modo oscuro'], icon: getIcon('Moon') },
  { id: 'cloud-sun', name: 'Parcialmente Nublado', category: 'nature_weather', tags: ['sol y nubes', 'clima templado'], icon: getIcon('CloudSun') },
  { id: 'cloud-rain', name: 'Lluvia / Precipitaciones', category: 'nature_weather', tags: ['lluvia', 'tormenta', 'agua', 'tiempo'], icon: getIcon('CloudRain') },
  { id: 'cloud-lightning', name: 'Tormenta Eléctrica', category: 'nature_weather', tags: ['tormenta', 'trueno', 'rayos'], icon: getIcon('CloudLightning') },
  { id: 'cloud-snow', name: 'Nieve / Nevada', category: 'nature_weather', tags: ['nieve', 'invierno', 'frio'], icon: getIcon('CloudSnow') },
  { id: 'snowflake', name: 'Copo de Nieve', category: 'nature_weather', tags: ['copo', 'nieve', 'congelado', 'helado'], icon: getIcon('Snowflake') },
  { id: 'wind', name: 'Viento / Brisa', category: 'nature_weather', tags: ['viento', 'aire', 'brisa', 'flujo'], icon: getIcon('Wind') },
  { id: 'tornado', name: 'Tornado / Huracán', category: 'nature_weather', tags: ['tornado', 'huracan', 'vortice'], icon: getIcon('Tornado') },
  { id: 'umbrella', name: 'Paraguas', category: 'nature_weather', tags: ['paraguas', 'proteccion', 'lluvia'], icon: getIcon('Umbrella') },
  { id: 'droplet', name: 'Gota de Agua', category: 'nature_weather', tags: ['gota', 'agua', 'liquido', 'hidratacion'], icon: getIcon('Droplet') },
  { id: 'waves', name: 'Olas del Mar', category: 'nature_weather', tags: ['olas', 'mar', 'oceano', 'agua'], icon: getIcon('Waves') },
  { id: 'thermometer', name: 'Termómetro / Temperatura', category: 'nature_weather', tags: ['temperatura', 'termometro', 'grados'], icon: getIcon('Thermometer') },
  { id: 'thermometer-sun', name: 'Calor Extremo', category: 'nature_weather', tags: ['ola de calor', 'verano ardiente'], icon: getIcon('ThermometerSun') },
  { id: 'thermometer-snowflake', name: 'Frío Extremo', category: 'nature_weather', tags: ['helada', 'bajo cero'], icon: getIcon('ThermometerSnowflake') },
  { id: 'tree-pine', name: 'Pino / Bosque', category: 'nature_weather', tags: ['pino', 'bosque', 'naturaleza', 'arbol'], icon: getIcon('TreePine') },
  { id: 'tree-deciduous', name: 'Árbol Frondoso', category: 'nature_weather', tags: ['arbol', 'ecologia', 'medio ambiente'], icon: getIcon('TreeDeciduous') },
  { id: 'leaf', name: 'Hoja / Sostenibilidad', category: 'nature_weather', tags: ['hoja', 'verde', 'eco', 'sostenible', 'bio'], icon: getIcon('Leaf') },
  { id: 'flower', name: 'Flor / Primavera', category: 'nature_weather', tags: ['flor', 'jardin', 'primavera', 'botanica'], icon: getIcon('Flower') },
  { id: 'flower-2', name: 'Margarita', category: 'nature_weather', tags: ['margarita', 'planta'], icon: getIcon('Flower2') },
  { id: 'sprout', name: 'Brote / Germinación', category: 'nature_weather', tags: ['brote', 'crecimiento', 'semilla', 'inicio'], icon: getIcon('Sprout') },
  { id: 'mountain', name: 'Montaña / Cumbre', category: 'nature_weather', tags: ['montana', 'cumbre', 'cima', 'senderismo'], icon: getIcon('Mountain') },
  { id: 'mountain-snow', name: 'Montaña Nevada', category: 'nature_weather', tags: ['cordillera', 'alpes', 'nieve'], icon: getIcon('MountainSnow') },
  { id: 'sunrise', name: 'Amanecer', category: 'nature_weather', tags: ['amanecer', 'salida del sol', 'manana'], icon: getIcon('Sunrise') },
  { id: 'sunset', name: 'Puesta de Sol', category: 'nature_weather', tags: ['atardecer', 'ocaso'], icon: getIcon('Sunset') },

  // ==========================================
  // 10. HERRAMIENTAS, SEGURIDAD & SISTEMA (45 icons)
  // ==========================================
  { id: 'shield', name: 'Escudo de Protección', category: 'tools_security', tags: ['escudo', 'seguridad', 'proteccion', 'defensa'], icon: getIcon('Shield') },
  { id: 'shield-check', name: 'Seguridad Verificada', category: 'tools_security', tags: ['seguro', 'antivirus', 'firewall', 'protegido', 'shield-check'], icon: getIcon('ShieldCheck') },
  { id: 'lock', name: 'Candado Cerrado', category: 'tools_security', tags: ['candado', 'bloqueado', 'privado', 'contrasena'], icon: getIcon('Lock') },
  { id: 'unlock', name: 'Candado Abierto', category: 'tools_security', tags: ['desbloqueado', 'abierto', 'publico'], icon: getIcon('Unlock') },
  { id: 'key', name: 'Llave de Acceso', category: 'tools_security', tags: ['llave', 'acceso', 'autenticacion', 'token'], icon: getIcon('Key') },
  { id: 'key-round', name: 'Llave Redonda', category: 'tools_security', tags: ['llave maestra', 'permiso'], icon: getIcon('KeyRound') },
  { id: 'settings', name: 'Engranaje de Ajustes', category: 'tools_security', tags: ['ajustes', 'configuracion', 'opciones', 'preferencias'], icon: getIcon('Settings') },
  { id: 'settings-2', name: 'Panel de Configuración', category: 'tools_security', tags: ['configuracion avanzada', 'control'], icon: getIcon('Settings2') },
  { id: 'wrench', name: 'Llave Inglesa / Mantenimiento', category: 'tools_security', tags: ['herramienta', 'mantenimiento', 'reparacion', 'taller'], icon: getIcon('Wrench') },
  { id: 'hammer', name: 'Martillo', category: 'tools_security', tags: ['martillo', 'construir', 'herramienta'], icon: getIcon('Hammer') },
  { id: 'axe', name: 'Hacha', category: 'tools_security', tags: ['hacha', 'corte', 'madera'], icon: getIcon('Axe') },
  { id: 'construction', name: 'En Construcción', category: 'tools_security', tags: ['obras', 'construccion', 'en desarrollo'], icon: getIcon('Construction') },
  { id: 'trash', name: 'Papelera de Reciclaje', category: 'tools_security', tags: ['papelera', 'borrar', 'eliminar', 'basura'], icon: getIcon('Trash') },
  { id: 'trash-2', name: 'Eliminar Elemento', category: 'tools_security', tags: ['eliminar', 'suprimir'], icon: getIcon('Trash2') },
  { id: 'filter', name: 'Filtro / Embudo', category: 'tools_security', tags: ['filtro', 'embudo', 'filtrar datos', 'buscar'], icon: getIcon('Filter') },
  { id: 'search', name: 'Lupa de Búsqueda', category: 'tools_security', tags: ['buscar', 'lupa', 'explorar', 'encontrar'], icon: getIcon('Search') },
  { id: 'life-buoy', name: 'Salvavidas / Soporte 24/7', category: 'tools_security', tags: ['soporte', 'ayuda', 'salvavidas', 'asistencia'], icon: getIcon('LifeBuoy') },
  { id: 'siren', name: 'Sirena de Emergencia', category: 'tools_security', tags: ['sirena', 'emergencia', 'policia', 'alerta maxima'], icon: getIcon('Siren') },
  { id: 'cctv', name: 'Cámara de Seguridad', category: 'tools_security', tags: ['camara vigilancia', 'cctv', 'seguridad'], icon: getIcon('Cctv') },
  { id: 'gauge', name: 'Velocímetro / Medidor', category: 'tools_security', tags: ['velocidad', 'rendimiento', 'medidor', 'kpi'], icon: getIcon('Gauge') },

  // ==========================================
  // 11. SALUD, DEPORTES & VIDA (45 icons)
  // ==========================================
  { id: 'activity', name: 'Pulso Cardíaco / Actividad', category: 'health_sports', tags: ['pulso', 'cardiograma', 'salud', 'ritmo', 'actividad'], icon: getIcon('Activity') },
  { id: 'heart-pulse', name: 'Corazón con Latido', category: 'health_sports', tags: ['latido', 'cardiologia', 'salud'], icon: getIcon('HeartPulse') },
  { id: 'pill', name: 'Píldora / Medicamento', category: 'health_sports', tags: ['pastilla', 'medicamento', 'farmacia', 'remedio'], icon: getIcon('Pill') },
  { id: 'cross', name: 'Cruz Médica / Primeros Auxilios', category: 'health_sports', tags: ['cruz roja', 'hospital', 'urgencias'], icon: getIcon('Cross') },
  { id: 'stethoscope', name: 'Estetoscopio Médico', category: 'health_sports', tags: ['medico', 'doctor', 'consulta'], icon: getIcon('Stethoscope') },
  { id: 'syringe', name: 'Jeringuilla / Vacuna', category: 'health_sports', tags: ['vacuna', 'inyeccion', 'inmunidad'], icon: getIcon('Syringe') },
  { id: 'dumbbell', name: 'Mancuerna / Gimnasio', category: 'health_sports', tags: ['gimnasio', 'fitness', 'pesas', 'ejercicio'], icon: getIcon('Dumbbell') },
  { id: 'bike', name: 'Bicicleta / Ciclismo', category: 'health_sports', tags: ['bicicleta', 'ciclismo', 'deporte', 'pedalear'], icon: getIcon('Bike') },
  { id: 'footprints', name: 'Huellas / Pasos', category: 'health_sports', tags: ['pasos', 'caminar', 'huellas', 'rastro'], icon: getIcon('Footprints') },
  { id: 'coffee', name: 'Taza de Café / Pausa', category: 'health_sports', tags: ['cafe', 'desayuno', 'descanso', 'pausa', 'energia'], icon: getIcon('Coffee') },
  { id: 'cup-soda', name: 'Bebida Refrescante', category: 'health_sports', tags: ['refresco', 'bebida', 'soda'], icon: getIcon('CupSoda') },
  { id: 'wine', name: 'Copa de Vino / Brindis', category: 'health_sports', tags: ['vino', 'brindis', 'celebracion'], icon: getIcon('Wine') },
  { id: 'beer', name: 'Cerveza', category: 'health_sports', tags: ['cerveza', 'afterwork', 'fiesta'], icon: getIcon('Beer') },
  { id: 'apple', name: 'Manzana / Dieta Saludable', category: 'health_sports', tags: ['manzana', 'fruta', 'nutricion', 'saludable'], icon: getIcon('Apple') },
  { id: 'cake', name: 'Pastel / Cumpleaños', category: 'health_sports', tags: ['tarta', 'pastel', 'cumpleanos', 'fiesta'], icon: getIcon('Cake') },
  { id: 'gift', name: 'Caja de Regalo', category: 'health_sports', tags: ['regalo', 'obsequio', 'sorpresa', 'presente'], icon: getIcon('Gift') },
  { id: 'party-popper', name: 'Cañón de Confeti / Celebración', category: 'health_sports', tags: ['fiesta', 'confeti', 'celebracion', 'exito'], icon: getIcon('PartyPopper') },
  { id: 'bed', name: 'Cama / Descanso', category: 'health_sports', tags: ['cama', 'dormir', 'hotel', 'descanso'], icon: getIcon('Bed') },

  // ==========================================
  // 12. SÍMBOLOS, FORMAS & EMOCIONES (45 icons)
  // ==========================================
  { id: 'smile', name: 'Carita Sonriente / Feliz', category: 'emojis_symbols', tags: ['feliz', 'sonrisa', 'alegria', 'positivo', 'smile'], icon: getIcon('Smile') },
  { id: 'frown', name: 'Carita Triste / Descontento', category: 'emojis_symbols', tags: ['triste', 'disgusto', 'negativo', 'frown'], icon: getIcon('Frown') },
  { id: 'meh', name: 'Carita Neutral', category: 'emojis_symbols', tags: ['neutral', 'indiferente', 'regular'], icon: getIcon('Meh') },
  { id: 'laugh', name: 'Risa / Diversión', category: 'emojis_symbols', tags: ['risa', 'carcajada', 'humor'], icon: getIcon('Laugh') },
  { id: 'star', name: 'Estrella Dorada / Favorito', category: 'emojis_symbols', tags: ['estrella', 'favorito', 'calificacion', 'top', 'star'], icon: getIcon('Star') },
  { id: 'star-half', name: 'Media Estrella', category: 'emojis_symbols', tags: ['media estrella', 'puntuacion'], icon: getIcon('StarHalf') },
  { id: 'crown', name: 'Corona de Rey / Premium', category: 'emojis_symbols', tags: ['corona', 'vip', 'premium', 'lujo', 'rey'], icon: getIcon('Crown') },
  { id: 'gem', name: 'Diamante / Joya', category: 'emojis_symbols', tags: ['diamante', 'gema', 'valioso', 'joya'], icon: getIcon('Gem') },
  { id: 'diamond', name: 'Rombo / Diamante', category: 'emojis_symbols', tags: ['rombo', 'naipe', 'figura'], icon: getIcon('Diamond') },
  { id: 'circle', name: 'Círculo Geométrico', category: 'emojis_symbols', tags: ['circulo', 'redondo'], icon: getIcon('Circle') },
  { id: 'triangle', name: 'Triángulo', category: 'emojis_symbols', tags: ['triangulo', 'forma'], icon: getIcon('Triangle') },
  { id: 'hexagon', name: 'Hexágono', category: 'emojis_symbols', tags: ['hexagono', 'panal'], icon: getIcon('Hexagon') },
  { id: 'octagon', name: 'Octágono', category: 'emojis_symbols', tags: ['octagono', 'forma'], icon: getIcon('Octagon') },
  { id: 'pentagon', name: 'Pentágono', category: 'emojis_symbols', tags: ['pentagono', 'forma'], icon: getIcon('Pentagon') },
  { id: 'clover', name: 'Trébol de 4 Hojas / Suerte', category: 'emojis_symbols', tags: ['trebol', 'suerte', 'fortuna'], icon: getIcon('Clover') },
  { id: 'skull', name: 'Calavera / Peligro Mortal', category: 'emojis_symbols', tags: ['calavera', 'muerte', 'veneno', 'critico'], icon: getIcon('Skull') },
  { id: 'ghost', name: 'Fantasma', category: 'emojis_symbols', tags: ['fantasma', 'misterio', 'halloween'], icon: getIcon('Ghost') },
  { id: 'infinity', name: 'Infinito', category: 'emojis_symbols', tags: ['infinito', 'eterno', 'sin fin', 'loop'], icon: getIcon('Infinity') },
  { id: 'sparkles-alt', name: 'Destellos Mágicos', category: 'emojis_symbols', tags: ['estrellas', 'magico', 'especial'], icon: getIcon('Sparkles') },
];

export const TOTAL_VECTOR_ICONS_COUNT = VECTOR_ICON_PACK.length;

// Fast lookup map by ID
const ICONS_BY_ID = new Map<string, VectorIconItem>();
VECTOR_ICON_PACK.forEach(item => {
  ICONS_BY_ID.set(item.id, item);
});

/**
 * Searches vector icons by keyword (in name, ID or tags) and optional category.
 */
export function searchVectorIcons(query: string, category?: VectorIconCategory | 'all'): VectorIconItem[] {
  const cleanQuery = query.toLowerCase().trim();
  
  return VECTOR_ICON_PACK.filter(item => {
    if (category && category !== 'all' && item.category !== category) {
      return false;
    }
    if (!cleanQuery) return true;

    if (item.id.toLowerCase().includes(cleanQuery)) return true;
    if (item.name.toLowerCase().includes(cleanQuery)) return true;
    if (item.tags.some(t => t.toLowerCase().includes(cleanQuery))) return true;
    return false;
  });
}

/**
 * Gets a specific vector icon component or fallback.
 */
export function getVectorIconItem(iconId: string): VectorIconItem | undefined {
  return ICONS_BY_ID.get(iconId);
}
\\n
