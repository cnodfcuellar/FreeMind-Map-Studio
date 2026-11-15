import { create } from 'zustand';
import {
  MindMap,
  MindNode,
  Connector,
  EdgeStyle,
  EdgeBorderStyle,
  EdgeProfile,
  LayoutType,
  BackgroundPatternStyle,
  FilterOptions,
} from '../types/mindmap';
import { BLANK_MAP, TUTORIAL_MAP } from '../utils/sampleMaps';
import { loadCurrentMap, saveCurrentMap } from '../utils/storage';
import { applyThemeRestyle, applyBackgroundUpdate } from '../utils/mapTheme';

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
  handleJumpToHistory: (targetIndex: number) => void;

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

  // Mutaciones Globales del Mapa y Conexiones (Fase 1: Desacoplamiento)
  updateMapTheme: (themeId: string) => void;
  updateMapLayout: (layout: LayoutType) => void;
  updateMapEdgeStyle: (edgeStyle: EdgeStyle) => void;
  updateMapEdgeWidth: (width: number) => void;
  updateMapEdgeProfile: (profile: EdgeProfile) => void;
  updateMapEdgeColor: (color?: string) => void;
  updateMapEdgeDash: (dash: EdgeBorderStyle) => void;
  updateMapEdgeShadow: (updates: {
    edgeShadow?: boolean;
    edgeShadowPreset?: 'soft' | 'deep' | 'glow';
    edgeShadowBlur?: number;
    edgeShadowOffsetY?: number;
    edgeShadowColor?: string;
  }) => void;
  updateMapBackgroundColor: (backgroundColor?: string) => void;
  updateMapBackground: (config: {
    backgroundColor?: string;
    backgroundPattern?: BackgroundPatternStyle;
    backgroundPatternColor?: string;
    backgroundPatternSize?: number;
    backgroundPatternOpacity?: number;
  }) => void;
  resetMapBackground: () => void;
  updateMapBackgroundPattern: (patternConfig: {
    pattern?: BackgroundPatternStyle;
    patternColor?: string;
    patternSize?: number;
    patternOpacity?: number;
  }) => void;
  updateMapSpacing: (horizontalGap: number, verticalGap: number) => void;
  updateMapVisibility: (visibility: {
    hideAllBodies?: boolean;
    hideAllImages?: boolean;
    hideAllTags?: boolean;
    hideAllIcons?: boolean;
    hideAllLinks?: boolean;
    showAllNotesInline?: boolean;
  }) => void;
  deleteConnector: (connectorId: string) => void;
  updateConnector: (connectorId: string, updates: Partial<Connector>) => void;
  applyEdgeStyleToAllNodes: (edgeStyle: EdgeStyle) => void;
  applyEdgeProfileToAllNodes: (edgeProfile: EdgeProfile) => void;
}

const extractNodeStyleBundle = (sourceNode: MindNode): Partial<MindNode> => {
  return {
    shape: sourceNode.shape,
    tailLength: sourceNode.tailLength,
    tailWidth: sourceNode.tailWidth,
    tailSide: sourceNode.tailSide,
    tailOffset: sourceNode.tailOffset,
    tailStyle: sourceNode.tailStyle,
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
    borderGap: sourceNode.borderGap,
    borderColorInner: sourceNode.borderColorInner,
    borderColorOuter: sourceNode.borderColorOuter,
    borderDashLength: sourceNode.borderDashLength,
    borderDashSpace: sourceNode.borderDashSpace,
    borderDotShape: sourceNode.borderDotShape,
    borderDotSpacing: sourceNode.borderDotSpacing,
    borderZigzagHeight: sourceNode.borderZigzagHeight,
    borderZigzagFreq: sourceNode.borderZigzagFreq,
    borderWaveHeight: sourceNode.borderWaveHeight,
    borderWaveWidth: sourceNode.borderWaveWidth,
    nodeShadow: sourceNode.nodeShadow,
    nodeShadowPreset: sourceNode.nodeShadowPreset,
    nodeShadowBlur: sourceNode.nodeShadowBlur,
    nodeShadowOffsetY: sourceNode.nodeShadowOffsetY,
    nodeShadowColor: sourceNode.nodeShadowColor,
    textShadow: sourceNode.textShadow,
    textShadowPreset: sourceNode.textShadowPreset,
    textShadowColor: sourceNode.textShadowColor,
    textShadowBlur: sourceNode.textShadowBlur,
    textShadowOffsetX: sourceNode.textShadowOffsetX,
    textShadowOffsetY: sourceNode.textShadowOffsetY,
    applyTextShadowToBody: sourceNode.applyTextShadowToBody,
    imageShadow: sourceNode.imageShadow,
    imageShadowPreset: sourceNode.imageShadowPreset,
    imageShadowBlur: sourceNode.imageShadowBlur,
    imageShadowColor: sourceNode.imageShadowColor,
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
    edgeBorderStyle: sourceNode.edgeBorderStyle,
    edgeBorderGap: sourceNode.edgeBorderGap,
    edgeDashLength: sourceNode.edgeDashLength,
    edgeDashSpace: sourceNode.edgeDashSpace,
    edgeDotShape: sourceNode.edgeDotShape,
    edgeDotSpacing: sourceNode.edgeDotSpacing,
    edgeZigzagHeight: sourceNode.edgeZigzagHeight,
    edgeZigzagFreq: sourceNode.edgeZigzagFreq,
    edgeWaveHeight: sourceNode.edgeWaveHeight,
    edgeWaveWidth: sourceNode.edgeWaveWidth,
    edgeProfile: sourceNode.edgeProfile,
    edgeShadow: sourceNode.edgeShadow,
    edgeShadowPreset: sourceNode.edgeShadowPreset,
    edgeShadowBlur: sourceNode.edgeShadowBlur,
    edgeShadowOffsetY: sourceNode.edgeShadowOffsetY,
    edgeShadowColor: sourceNode.edgeShadowColor,
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

    handleJumpToHistory: (targetIndex: number) => {
      const { historyPast, historyFuture, mindMap, selectedNodeId } = get();
      const allMaps = [...historyPast, mindMap, ...historyFuture];
      if (targetIndex < 0 || targetIndex >= allMaps.length) return;
      const currentIdx = historyPast.length;
      if (targetIndex === currentIdx) return;

      const targetMap = allMaps[targetIndex];
      const newPast = allMaps.slice(0, targetIndex);
      const newFuture = allMaps.slice(targetIndex + 1);

      let newSelectedId = selectedNodeId;
      if (!newSelectedId || !targetMap.nodes[newSelectedId]) {
        newSelectedId = targetMap.rootId;
      }

      set({
        mindMap: targetMap,
        historyPast: newPast,
        historyFuture: newFuture,
        selectedNodeId: newSelectedId,
        editingNodeId: null,
      });
      saveCurrentMap(targetMap);
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

    updateMapTheme: (themeId: string) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap = applyThemeRestyle(mindMap, themeId);
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapLayout: (layout: LayoutType) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = { ...mindMap, layout, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapEdgeStyle: (edgeStyle: EdgeStyle) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes: Record<string, MindNode> = {};
      Object.entries(mindMap.nodes).forEach(([id, node]) => {
        updatedNodes[id] = { ...node, edgeStyle: undefined };
      });
      const nextMap: MindMap = { ...mindMap, edgeStyle, nodes: updatedNodes, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapEdgeWidth: (edgeWidth: number) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes: Record<string, MindNode> = {};
      Object.entries(mindMap.nodes).forEach(([id, node]) => {
        updatedNodes[id] = { ...node, edgeWidth: undefined };
      });
      const nextMap: MindMap = { ...mindMap, edgeWidth, nodes: updatedNodes, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapEdgeProfile: (edgeProfile: EdgeProfile) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes: Record<string, MindNode> = {};
      Object.entries(mindMap.nodes).forEach(([id, node]) => {
        updatedNodes[id] = { ...node, edgeProfile: undefined };
      });
      const nextMap: MindMap = { ...mindMap, edgeProfile, nodes: updatedNodes, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapEdgeColor: (edgeColor?: string) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes: Record<string, MindNode> = {};
      Object.entries(mindMap.nodes).forEach(([id, node]) => {
        updatedNodes[id] = { ...node, edgeColor: undefined };
      });
      const nextMap: MindMap = { ...mindMap, edgeColor, nodes: updatedNodes, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapEdgeDash: (edgeDash: EdgeBorderStyle) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const updatedNodes: Record<string, MindNode> = {};
      Object.entries(mindMap.nodes).forEach(([id, node]) => {
        updatedNodes[id] = { ...node, edgeDash: undefined, edgeBorderStyle: undefined };
      });
      const nextMap: MindMap = {
        ...mindMap,
        edgeDash,
        edgeBorderStyle: edgeDash,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapEdgeShadow: (updates) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = { ...mindMap, ...updates, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapBackgroundColor: (backgroundColor?: string) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = { ...mindMap, backgroundColor, updatedAt: Date.now() };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapBackground: (config) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap = applyBackgroundUpdate(mindMap, config);
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    resetMapBackground: () => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = {
        ...mindMap,
        backgroundColor: undefined,
        backgroundPattern: undefined,
        backgroundPatternColor: undefined,
        backgroundPatternSize: undefined,
        backgroundPatternOpacity: undefined,
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapBackgroundPattern: (patternConfig) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = {
        ...mindMap,
        backgroundPattern: patternConfig.pattern,
        backgroundPatternColor: patternConfig.patternColor,
        backgroundPatternSize: patternConfig.patternSize,
        backgroundPatternOpacity: patternConfig.patternOpacity,
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapSpacing: (horizontalGap: number, verticalGap: number) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = {
        ...mindMap,
        horizontalGap,
        verticalGap,
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateMapVisibility: (visibility) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = {
        ...mindMap,
        ...visibility,
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    deleteConnector: (connectorId: string) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = {
        ...mindMap,
        connectors: (mindMap.connectors || []).filter((c) => c.id !== connectorId),
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    updateConnector: (connectorId: string, updates: Partial<Connector>) => {
      const { mindMap, pushHistory } = get();
      pushHistory(mindMap);
      const nextMap: MindMap = {
        ...mindMap,
        connectors: (mindMap.connectors || []).map((c) =>
          c.id === connectorId ? { ...c, ...updates } : c
        ),
        updatedAt: Date.now(),
      };
      saveCurrentMap(nextMap);
      set({ mindMap: nextMap });
    },

    applyEdgeStyleToAllNodes: (edgeStyle: EdgeStyle) => {
      get().updateMapEdgeStyle(edgeStyle);
    },

    applyEdgeProfileToAllNodes: (edgeProfile: EdgeProfile) => {
      get().updateMapEdgeProfile(edgeProfile);
    },
  };
});
