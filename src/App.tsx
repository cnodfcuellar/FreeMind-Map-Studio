import React, { useMemo, useState, useEffect } from 'react';
import {
  MindNode,
  NodeShape,
  EdgeStyle,
  EdgeBorderStyle,
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
import { ToolPanel } from './components/organisms/toolpanel/ToolPanel';
import { OutlineView } from './components/OutlineView';
import { PresentationMode } from './components/organisms/presentation/PresentationMode';
import { StatusBar } from './components/StatusBar';

// Modales (Organisms)
import { ExportImportModal } from './components/Modals/ExportImportModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { SavedMapsModal } from './components/Modals/SavedMapsModal';
import { ConnectorModal } from './components/Modals/ConnectorModal';
import { IconPackModal } from './components/Modals/IconPackModal';
import { CommandPaletteModal } from './components/Modals/CommandPaletteModal';
import { PdfExportModal } from './components/Modals/PdfExportModal';
import { HistoryTimelineModal } from './components/Modals/HistoryTimelineModal';
import { ImageExportModal } from './components/Modals/ImageExportModal';
import { ElaboratePresentationSystem } from './components/organisms/presentation/ElaboratePresentationSystem';

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
    handleJumpToHistory,
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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isImageExportModalOpen, setIsImageExportModalOpen] = useState(false);
  const [imageExportInitialTab, setImageExportInitialTab] = useState<'image' | 'outline'>('image');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [connectorSourceId, setConnectorSourceId] = useState<string | null>(null);
  const [editingConnector, setEditingConnector] = useState<Connector | null>(null);
  const [presentationType, setPresentationType] = useState<'classic' | 'dynamic' | 'elaborate'>('dynamic');
  const [viewport, setViewport] = useState<{ zoom: number; x: number; y: number }>({ zoom: 1, x: 0, y: 0 });

  // Tema de interfaz claro/oscuro/sepia (persistido, aplicado a <html>)
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => loadUiTheme());
  useEffect(() => {
    applyUiTheme(uiTheme);
  }, [uiTheme]);

  const isAnyModalOpen = Boolean(
    isExportModalOpen ||
      isPdfModalOpen ||
      isImageExportModalOpen ||
      isHistoryModalOpen ||
      isShortcutsModalOpen ||
      isTemplatesModalOpen ||
      isSavedMapsModalOpen ||
      isIconPackModalOpen ||
      isCommandPaletteOpen ||
      connectorSourceId ||
      editingConnector
  );

  const handleCloseModals = () => {
    setIsExportModalOpen(false);
    setIsPdfModalOpen(false);
    setIsImageExportModalOpen(false);
    setIsHistoryModalOpen(false);
    setIsShortcutsModalOpen(false);
    setIsTemplatesModalOpen(false);
    setIsSavedMapsModalOpen(false);
    setIsIconPackModalOpen(false);
    setIsCommandPaletteOpen(false);
    setConnectorSourceId(null);
    setEditingConnector(null);
  };

  // Atajos de teclado globales
  useKeyboardShortcuts({
    isAnyModalOpen,
    onCloseModals: handleCloseModals,
    onToggleCommandPalette: () => setIsCommandPaletteOpen((prev) => !prev),
    onOpenHistoryTimeline: () => setIsHistoryModalOpen(true),
  });

  // Tema activo y Filtro
  const currentTheme = useMemo(() => {
    return THEMES[mindMap.themeId] || THEMES.default;
  }, [mindMap.themeId]);

  const { searchMatches, availableTags } = useSearchFilter(mindMap, filterOptions);
  const selectedNode = selectedNodeId ? mindMap.nodes[selectedNodeId] || null : null;

  const handleResetNodeFormat = () => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        shape: 'bubble',
        color: undefined,
        textColor: undefined,
        borderColor: undefined,
        borderWidth: undefined,
        borderDash: undefined,
        borderStyle: undefined,
        bgType: undefined,
        gradientColor1: undefined,
        gradientColor2: undefined,
        gradientDirection: undefined,
        nodePattern: undefined,
        nodePatternColor: undefined,
        nodePatternSize: undefined,
        nodePatternOpacity: undefined,
        nodeShadow: false,
        nodeShadowPreset: undefined,
        nodeShadowBlur: undefined,
        nodeShadowOffsetY: undefined,
        nodeShadowColor: undefined,
        textShadow: false,
        textShadowPreset: undefined,
        textShadowColor: undefined,
        textShadowBlur: undefined,
        textShadowOffsetX: undefined,
        textShadowOffsetY: undefined,
        applyTextShadowToBody: undefined,
        imageShadow: undefined,
        imageShadowPreset: undefined,
        imageShadowBlur: undefined,
        imageShadowColor: undefined,
        edgeShadow: undefined,
        edgeShadowPreset: undefined,
        edgeShadowBlur: undefined,
        edgeShadowOffsetY: undefined,
        edgeShadowColor: undefined,
        tailLength: undefined,
        tailWidth: undefined,
        tailSide: undefined,
        tailOffset: undefined,
        tailStyle: undefined,
        bodyFontSize: 13,
        bodyBold: false,
        bodyItalic: false,
        bodyColor: undefined,
        bodyAlign: 'left',
      });
    }
  };

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
          onOpenPdfModal={() => setIsPdfModalOpen(true)}
          onOpenImageModal={(tab) => {
            setImageExportInitialTab(tab || 'image');
            setIsImageExportModalOpen(true);
          }}
          onOpenImportModal={() => setIsExportModalOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenHistoryTimeline={() => setIsHistoryModalOpen(true)}
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
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
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
          onResetFormat={handleResetNodeFormat}
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
          onOpenHistoryTimeline={() => setIsHistoryModalOpen(true)}
          historyCount={historyPast.length + historyFuture.length}
          onAddChild={() => handleAddChild()}
          onAddSibling={() => handleAddSibling()}
          onDeleteNode={() => handleDeleteNode()}
          onToggleOutline={() => setIsOutlineOpen((o) => !o)}
          onToggleToolPanel={() => setIsToolPanelOpen((t) => !t)}
          onToggleFilterBar={() => setIsFilterBarOpen((f) => !f)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
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
              onEditConnector={(conn) => setEditingConnector(conn)}
              onDeleteConnector={(connectorId) => {
                pushHistory(mindMap);
                setMindMap((m) => ({
                  ...m,
                  connectors: (m.connectors || []).filter((c) => c.id !== connectorId),
                  updatedAt: Date.now(),
                }));
              }}
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
          isOpen={isToolPanelOpen}
          onClose={() => setIsToolPanelOpen(false)}
          onOpenConnectorModal={(fromId) => setConnectorSourceId(fromId || mindMap.rootId)}
          onEditConnector={(conn) => setEditingConnector(conn)}
          onOpenIconPackModal={() => setIsIconPackModalOpen(true)}
        />
      }
      statusBar={
        <StatusBar
          zoom={Math.round(viewport.zoom * 100)}
          positionX={Math.round(viewport.x)}
          positionY={Math.round(viewport.y)}
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
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenImageModal={(tab) => {
              setImageExportInitialTab(tab || 'image');
              setIsImageExportModalOpen(true);
            }}
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
            connectorToEdit={editingConnector}
            isOpen={Boolean(connectorSourceId || editingConnector)}
            onClose={() => {
              setConnectorSourceId(null);
              setEditingConnector(null);
            }}
            onSaveConnector={(conn: Connector) => {
              pushHistory(mindMap);
              setMindMap((m) => {
                const existing = m.connectors || [];
                const isExisting = existing.some((c) => c.id === conn.id);
                return {
                  ...m,
                  connectors: isExisting
                    ? existing.map((c) => (c.id === conn.id ? conn : c))
                    : [...existing, conn],
                  updatedAt: Date.now(),
                };
              });
            }}
            onDeleteConnector={(connectorId: string) => {
              pushHistory(mindMap);
              setMindMap((m) => ({
                ...m,
                connectors: (m.connectors || []).filter((c) => c.id !== connectorId),
                updatedAt: Date.now(),
              }));
            }}
          />

          <CommandPaletteModal
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            mindMap={mindMap}
            selectedNodeId={selectedNodeId}
            onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
            onFocusNode={(nodeId) => setFocusTarget({ nodeId, timestamp: Date.now() })}
            onAddChild={() => handleAddChild()}
            onAddSibling={() => handleAddSibling()}
            onDeleteNode={() => handleDeleteNode()}
            onToggleFold={() => handleToggleFold()}
            onFoldAll={handleFoldAll}
            onUnfoldAll={handleUnfoldAll}
            onEditNode={(nodeId) => {
              if (nodeId) setSelectedNodeId(nodeId);
              setEditingNodeId(nodeId || selectedNodeId || mindMap.rootId);
            }}
            onToggleOutline={() => setIsOutlineOpen((o) => !o)}
            onToggleToolPanel={() => setIsToolPanelOpen((t) => !t)}
            onToggleFilterBar={() => setIsFilterBarOpen((f) => !f)}
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
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenHistoryTimeline={() => setIsHistoryModalOpen(true)}
            canUndo={historyPast.length > 0}
            canRedo={historyFuture.length > 0}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onOpenSavedMaps={() => setIsSavedMapsModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenImageModal={(tab) => {
              setImageExportInitialTab(tab || 'image');
              setIsImageExportModalOpen(true);
            }}
            onOpenImportModal={() => setIsExportModalOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
            onOpenConnectorModal={() => setConnectorSourceId(selectedNodeId || mindMap.rootId)}
            onOpenIconPackModal={() => setIsIconPackModalOpen(true)}
            onUpdateMapTheme={(themeId) => {
              pushHistory(mindMap);
              setMindMap((m) => ({ ...m, themeId, updatedAt: Date.now() }));
            }}
            onUpdateMapLayout={(layout) => {
              pushHistory(mindMap);
              setMindMap((m) => ({ ...m, layout, updatedAt: Date.now() }));
            }}
            onChangeShape={(shape) => {
              if (selectedNode) updateNode(selectedNode.id, { shape });
            }}
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
            onToggleFullscreen={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            onResetFormat={handleResetNodeFormat}
            uiTheme={uiTheme}
            onChangeUiTheme={(theme) => setUiTheme(theme)}
            onToggleGlobalVisibility={(key) => {
              pushHistory(mindMap);
              setMindMap((m) => ({ ...m, [key]: !m[key], updatedAt: Date.now() }));
            }}
            onToggleNodeShadow={() => {
              if (selectedNodeId) {
                const curr = mindMap.nodes[selectedNodeId];
                const next = !curr.nodeShadow;
                updateNode(selectedNodeId, {
                  nodeShadow: next,
                  nodeShadowPreset: next ? curr.nodeShadowPreset || 'soft' : undefined,
                });
              }
            }}
            onToggleEdgeShadow={() => {
              pushHistory(mindMap);
              setMindMap((m) => ({
                ...m,
                edgeShadow: !m.edgeShadow,
                edgeShadowPreset: !m.edgeShadow ? m.edgeShadowPreset || 'soft' : undefined,
                updatedAt: Date.now(),
              }));
            }}
            onSaveMap={() => saveCurrentMap(mindMap)}
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
            onCopyNode={handleCopyNode}
            onCutNode={handleCutNode}
            onPasteNode={handlePasteNode}
            onRandomizeColors={handleRandomizeEdgeColors}
            onApplyStyleToChildren={() => selectedNodeId && handleApplyStyleToChildren(selectedNodeId)}
            onApplyStyleToSiblings={() => selectedNodeId && handleApplyStyleToSiblings(selectedNodeId)}
          />

          <PdfExportModal
            mindMap={mindMap}
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
          />

          <ImageExportModal
            mindMap={mindMap}
            isOpen={isImageExportModalOpen}
            onClose={() => setIsImageExportModalOpen(false)}
            initialTab={imageExportInitialTab}
          />

          <HistoryTimelineModal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            historyPast={historyPast}
            historyFuture={historyFuture}
            currentMindMap={mindMap}
            onJumpToHistory={handleJumpToHistory}
          />
        </>
      }
    />
  </ErrorBoundary>
);
}

