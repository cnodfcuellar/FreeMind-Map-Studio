import React, { useMemo, useState } from 'react';
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
import { ComingSoonModal, ComingSoonModalData } from './components/Modals/ComingSoonModal';
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
  const [comingSoonModalData, setComingSoonModalData] = useState<ComingSoonModalData | null>(null);

  const isAnyModalOpen = Boolean(
    isExportModalOpen ||
      isShortcutsModalOpen ||
      isTemplatesModalOpen ||
      isSavedMapsModalOpen ||
      isIconPackModalOpen ||
      connectorSourceId ||
      comingSoonModalData
  );

  const handleCloseModals = () => {
    setIsExportModalOpen(false);
    setIsShortcutsModalOpen(false);
    setIsTemplatesModalOpen(false);
    setIsSavedMapsModalOpen(false);
    setIsIconPackModalOpen(false);
    setConnectorSourceId(null);
    setComingSoonModalData(null);
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
          isOutlineMode={isOutlineOpen}
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
          onShowComingSoon={(data) => setComingSoonModalData(data)}
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
          isOutlineOpen={isOutlineOpen}
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
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onOpenSavedMaps={() => setIsSavedMapsModalOpen(true)}
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
          onChangeLayout={(layout: LayoutType) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, layout, updatedAt: Date.now() }));
          }}
          onChangeTheme={(themeId) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, themeId, updatedAt: Date.now() }));
          }}
          onChangeShape={(shape: NodeShape) => {
            if (selectedNode) updateNode(selectedNode.id, { shape });
          }}
          onChangeColor={(color) => {
            if (selectedNode) updateNode(selectedNode.id, { color, bgType: 'color' });
          }}
          onChangeEdgeStyle={(edgeStyle: EdgeStyle) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, edgeStyle, updatedAt: Date.now() }));
          }}
          onChangeEdgeProfile={(edgeProfile: EdgeProfile) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, edgeProfile, updatedAt: Date.now() }));
          }}
          onChangeEdgeWidth={(edgeWidth: number) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, edgeWidth, updatedAt: Date.now() }));
          }}
          onChangeEdgeColor={(edgeColor: string) => {
            pushHistory(mindMap);
            setMindMap((m) => ({ ...m, edgeColor, updatedAt: Date.now() }));
          }}
          onOpenIconPack={() => setIsIconPackModalOpen(true)}
          onSave={() => saveCurrentMap(mindMap)}
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
          onUpdateBody={(id, body) => updateNode(id, { body })}
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
            setMindMap((m) => ({ ...m, themeId, updatedAt: Date.now() }));
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
          zoom={100}
          positionX={0}
          positionY={0}
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
          <ComingSoonModal
            isOpen={Boolean(comingSoonModalData)}
            data={comingSoonModalData}
            onClose={() => setComingSoonModalData(null)}
            onStartClassic={() => setIsPresentationMode(true)}
          />

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

