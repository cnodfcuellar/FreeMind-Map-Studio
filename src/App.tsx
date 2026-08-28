import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MindMap,
  MindNode,
  NodeShape,
  EdgeStyle,
  EdgeProfile,
  LayoutType,
  FilterOptions,
  Connector,
  BackgroundPatternStyle,
} from './types/mindmap';
import { THEMES } from './utils/themes';
import { TUTORIAL_MAP, BLANK_MAP } from './utils/sampleMaps';
import { loadCurrentMap, saveCurrentMap } from './utils/storage';
import { ListTree, Sliders } from 'lucide-react';

// Components
import { MenuBar } from './components/MenuBar';
import { ToolBar } from './components/ToolBar';
import { FilterBar } from './components/FilterBar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { ToolPanel } from './components/ToolPanel';
import { OutlineView } from './components/OutlineView';
import { PresentationMode } from './components/PresentationMode';
import { StatusBar } from './components/StatusBar';

// Modals
import { ExportImportModal } from './components/Modals/ExportImportModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { TemplatesModal } from './components/Modals/TemplatesModal';
import { SavedMapsModal } from './components/Modals/SavedMapsModal';
import { ConnectorModal } from './components/Modals/ConnectorModal';
import { IconPackModal } from './components/Modals/IconPackModal';
import { ComingSoonModal, ComingSoonModalData } from './components/Modals/ComingSoonModal';

export default function App() {
  // MindMap State & History
  const [mindMap, setMindMap] = useState<MindMap>(() => loadCurrentMap());
  const [historyPast, setHistoryPast] = useState<MindMap[]>([]);
  const [historyFuture, setHistoryFuture] = useState<MindMap[]>([]);

  // Selection & Mode State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(mindMap.rootId);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(false);
  const [isOutlineFullscreen, setIsOutlineFullscreen] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isToolPanelOpen, setIsToolPanelOpen] = useState<boolean>(true);
  const [isFilterBarOpen, setIsFilterBarOpen] = useState<boolean>(false);
  const [comingSoonModalData, setComingSoonModalData] = useState<ComingSoonModalData | null>(null);

  // Filter State
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    query: '',
    showAncestors: true,
    showDescendants: true,
  });

  // Clipboard State (for Copy/Cut/Paste subtree)
  const [clipboard, setClipboard] = useState<{ node: MindNode; subNodes: Record<string, MindNode>; isCut: boolean } | null>(null);

  // Modals State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isSavedMapsModalOpen, setIsSavedMapsModalOpen] = useState(false);
  const [isIconPackModalOpen, setIsIconPackModalOpen] = useState(false);
  const [connectorSourceId, setConnectorSourceId] = useState<string | null>(null);

  // Auto-Save whenever mindMap changes
  useEffect(() => {
    saveCurrentMap(mindMap);
  }, [mindMap]);

  // Current Active Theme
  const currentTheme = useMemo(() => {
    return THEMES[mindMap.themeId] || THEMES.default;
  }, [mindMap.themeId]);

  // Push state to Undo History
  const pushHistory = useCallback((current: MindMap) => {
    setHistoryPast((past) => [...past.slice(-40), current]);
    setHistoryFuture([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    setHistoryFuture((future) => [mindMap, ...future]);
    setHistoryPast(newPast);
    setMindMap(previous);
  }, [historyPast, mindMap]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast((past) => [...past, mindMap]);
    setHistoryFuture(newFuture);
    setMindMap(next);
  }, [historyFuture, mindMap]);

  // Node Mutations
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<MindNode>) => {
      setMindMap((prev) => {
        const existing = prev.nodes[nodeId];
        if (!existing) return prev;

        pushHistory(prev);

        return {
          ...prev,
          updatedAt: Date.now(),
          nodes: {
            ...prev.nodes,
            [nodeId]: {
              ...existing,
              ...updates,
            },
          },
        };
      });
    },
    [pushHistory]
  );

  const handleUpdateNodeText = useCallback(
    (id: string, text: string) => {
      updateNode(id, { text });
    },
    [updateNode]
  );

  // Add Child Node (Tab / Insert)
  const handleAddChild = useCallback(
    (parentId?: string) => {
      const targetParentId = parentId || selectedNodeId || mindMap.rootId;
      const targetParent = mindMap.nodes[targetParentId];
      if (!targetParent) return;

      pushHistory(mindMap);

      const newId = `node-${Date.now()}`;
      const isParentRoot = targetParent.id === mindMap.rootId;

      // Determine side if parent is root
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

      setMindMap((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        nodes: {
          ...prev.nodes,
          [targetParentId]: {
            ...targetParent,
            folded: false,
            children: [...targetParent.children, newId],
          },
          [newId]: newNode,
        },
      }));

      setSelectedNodeId(newId);
      setEditingNodeId(newId);
    },
    [selectedNodeId, mindMap, pushHistory]
  );

  // Add Sibling Node (Enter)
  const handleAddSibling = useCallback(
    (siblingId?: string) => {
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

      setMindMap((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        nodes: {
          ...prev.nodes,
          [parentNode.id]: {
            ...parentNode,
            children: newChildren,
          },
          [newId]: newNode,
        },
      }));

      setSelectedNodeId(newId);
      setEditingNodeId(newId);
    },
    [selectedNodeId, mindMap, pushHistory, handleAddChild]
  );

  // Delete Node (Delete / Backspace)
  const handleDeleteNode = useCallback(
    (nodeIdToDelete?: string) => {
      const targetId = nodeIdToDelete || selectedNodeId;
      if (!targetId || targetId === mindMap.rootId) return;

      const nodeToDelete = mindMap.nodes[targetId];
      if (!nodeToDelete || !nodeToDelete.parentId) return;

      const parentNode = mindMap.nodes[nodeToDelete.parentId];
      if (!parentNode) return;

      pushHistory(mindMap);

      // Collect all descendant IDs
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

      // Remove from parent's children array
      remainingNodes[parentNode.id] = {
        ...parentNode,
        children: parentNode.children.filter((id) => id !== targetId),
      };

      // Also clean up any connectors attached to deleted nodes
      const remainingConnectors = mindMap.connectors.filter(
        (c) => !idsToDelete.has(c.fromId) && !idsToDelete.has(c.toId)
      );

      setMindMap((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        nodes: remainingNodes,
        connectors: remainingConnectors,
      }));

      setSelectedNodeId(parentNode.id);
    },
    [selectedNodeId, mindMap, pushHistory]
  );

  // Fold / Unfold Branch (Space)
  const handleToggleFold = useCallback(
    (nodeId?: string) => {
      const targetId = nodeId || selectedNodeId;
      if (!targetId) return;
      const node = mindMap.nodes[targetId];
      if (!node || !node.children || node.children.length === 0) return;

      updateNode(targetId, { folded: !node.folded });
    },
    [selectedNodeId, mindMap, updateNode]
  );

  const handleFoldAll = useCallback(() => {
    pushHistory(mindMap);
    const updatedNodes = { ...mindMap.nodes };
    Object.keys(updatedNodes).forEach((id) => {
      if (id !== mindMap.rootId && updatedNodes[id].children.length > 0) {
        updatedNodes[id] = { ...updatedNodes[id], folded: true };
      }
    });
    setMindMap((m) => ({ ...m, nodes: updatedNodes, updatedAt: Date.now() }));
  }, [mindMap, pushHistory]);

  const handleUnfoldAll = useCallback(() => {
    pushHistory(mindMap);
    const updatedNodes = { ...mindMap.nodes };
    Object.keys(updatedNodes).forEach((id) => {
      updatedNodes[id] = { ...updatedNodes[id], folded: false };
    });
    setMindMap((m) => ({ ...m, nodes: updatedNodes, updatedAt: Date.now() }));
  }, [mindMap, pushHistory]);

  // Reparent / Drag and Drop Node
  const handleReparentNode = useCallback(
    (draggedId: string, targetParentId: string) => {
      if (draggedId === targetParentId || draggedId === mindMap.rootId) return;

      const draggedNode = mindMap.nodes[draggedId];
      const targetParent = mindMap.nodes[targetParentId];
      if (!draggedNode || !targetParent || !draggedNode.parentId) return;

      // Prevent dragging a parent inside its own descendant
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

      setMindMap((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        nodes: {
          ...prev.nodes,
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
      }));
    },
    [mindMap, pushHistory]
  );

  // Copy / Cut / Paste Subtrees
  const handleCopyNode = useCallback(
    (nodeId?: string) => {
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

      setClipboard({ node, subNodes, isCut: false });
    },
    [selectedNodeId, mindMap]
  );

  const handleCutNode = useCallback(
    (nodeId?: string) => {
      const targetId = nodeId || selectedNodeId;
      if (!targetId || targetId === mindMap.rootId) return;

      handleCopyNode(targetId);
      handleDeleteNode(targetId);
    },
    [selectedNodeId, mindMap.rootId, handleCopyNode, handleDeleteNode]
  );

  const handlePasteNode = useCallback(
    (targetParentId?: string) => {
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

      setMindMap((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        nodes: {
          ...prev.nodes,
          ...newSubNodes,
          [targetId]: {
            ...targetParent,
            children: [...targetParent.children, rootClonedId],
          },
        },
      }));

      setSelectedNodeId(rootClonedId);
    },
    [clipboard, selectedNodeId, mindMap, pushHistory]
  );

  // Helper to extract visual style bundle from a node
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

  // Apply style to all children & descendants of a node
  const handleApplyStyleToChildren = useCallback(
    (nodeId?: string) => {
      const targetId = nodeId || selectedNodeId;
      if (!targetId) return;

      const sourceNode = mindMap.nodes[targetId];
      if (!sourceNode || !sourceNode.children || sourceNode.children.length === 0) return;

      pushHistory(mindMap);
      const styleBundle = extractNodeStyleBundle(sourceNode);

      const updatedNodes = { ...mindMap.nodes };

      // Recursive helper to update all subchildren
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

      setMindMap((prev) => ({
        ...prev,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      }));
    },
    [selectedNodeId, mindMap, pushHistory]
  );

  // Apply style to all siblings of a node (same hierarchical parent)
  const handleApplyStyleToSiblings = useCallback(
    (nodeId?: string) => {
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

      setMindMap((prev) => ({
        ...prev,
        nodes: updatedNodes,
        updatedAt: Date.now(),
      }));
    },
    [selectedNodeId, mindMap, pushHistory]
  );

  // Global Keyboard Shortcuts (Freeplane style)
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
      if (
        isExportModalOpen ||
        isShortcutsModalOpen ||
        isTemplatesModalOpen ||
        isSavedMapsModalOpen ||
        connectorSourceId
      ) {
        if (e.key === 'Escape') {
          setIsExportModalOpen(false);
          setIsShortcutsModalOpen(false);
          setIsTemplatesModalOpen(false);
          setIsSavedMapsModalOpen(false);
          setConnectorSourceId(null);
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
    isExportModalOpen,
    isShortcutsModalOpen,
    isTemplatesModalOpen,
    isSavedMapsModalOpen,
    connectorSourceId,
    handleAddChild,
    handleAddSibling,
    handleDeleteNode,
    handleToggleFold,
    handleUndo,
    handleRedo,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
  ]);

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
      if (filterOptions.minProgress !== undefined && (n.progress === undefined || n.progress < filterOptions.minProgress)) {
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

  // Selected Node Object
  const selectedNode = selectedNodeId ? mindMap.nodes[selectedNodeId] || null : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      {/* 1. Menu Bar */}
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
        onStartPresentation={() => setIsPresentationMode(true)}
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
        onTitleChange={(newTitle) => setMindMap((m) => ({ ...m, title: newTitle, updatedAt: Date.now() }))}
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
              backgroundColor: undefined,
              textColor: undefined,
              borderColor: undefined,
              borderWidth: undefined,
              edgeStyle: undefined,
              edgeWidth: undefined,
              edgeColor: undefined,
              edgeDash: undefined,
              edgeProfile: undefined
            });
          }
        }}
      />

      {/* 2. Tool Bar */}
      <ToolBar
        selectedNode={selectedNode}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        isOutlineMode={isOutlineOpen}
        isFilterBarOpen={isFilterBarOpen}
        isToolPanelOpen={isToolPanelOpen}
        mindMap={mindMap}
        onToggleGlobalVisibility={(key) => {
          pushHistory(mindMap);
          setMindMap((m) => ({
            ...m,
            [key]: !m[key],
            updatedAt: Date.now(),
          }));
        }}
        onAddChild={() => handleAddChild()}
        onAddSibling={() => handleAddSibling()}
        onDeleteNode={() => handleDeleteNode()}
        onToggleFold={() => handleToggleFold()}
        onToggleBold={() => selectedNode && updateNode(selectedNode.id, { bold: !selectedNode.bold })}
        onToggleItalic={() => selectedNode && updateNode(selectedNode.id, { italic: !selectedNode.italic })}
        onChangeShape={(shape: NodeShape) => selectedNode && updateNode(selectedNode.id, { shape })}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleOutline={() => setIsOutlineOpen((o) => !o)}
        onStartPresentation={() => setIsPresentationMode(true)}
        onShowComingSoon={(data) => setComingSoonModalData(data)}
        onToggleFilterBar={() => setIsFilterBarOpen((f) => !f)}
        onToggleToolPanel={() => setIsToolPanelOpen((t) => !t)}
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
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenIconPackModal={() => setIsIconPackModalOpen(true)}
      />

      {/* 3. Filter Bar */}
      <FilterBar
        filterOptions={filterOptions}
        availableTags={availableTags}
        matchCount={searchMatches ? searchMatches.size : 0}
        isOpen={isFilterBarOpen}
        onClose={() => setIsFilterBarOpen(false)}
        onUpdateFilter={(up) => setFilterOptions((f) => ({ ...f, ...up }))}
        onClearFilter={() => setFilterOptions({ query: '', showAncestors: true, showDescendants: true })}
      />

      {/* 4. Main Workspace (Canvas with Side Outline & ToolPanel) */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Outline Side Panel (can be hidden or shown) */}
        {isOutlineOpen && (
          <OutlineView
            mindMap={mindMap}
            selectedNodeId={selectedNodeId}
            isOpen={isOutlineOpen}
            isFullscreen={isOutlineFullscreen}
            onToggleFullscreen={() => setIsOutlineFullscreen((f) => !f)}
            onSelectNode={(id) => setSelectedNodeId(id)}
            onUpdateText={handleUpdateNodeText}
            onUpdateBody={(id, body) => updateNode(id, { body })}
            onAddChild={(pid) => handleAddChild(pid)}
            onAddSibling={(sid) => handleAddSibling(sid)}
            onDeleteNode={(nid) => handleDeleteNode(nid)}
            onToggleFold={(fid) => handleToggleFold(fid)}
            onFoldAll={handleFoldAll}
            onUnfoldAll={handleUnfoldAll}
            onClose={() => setIsOutlineOpen(false)}
          />
        )}

        {/* Floating Quick-Reveal Button when Outline Side Panel is hidden */}
        {!isOutlineOpen && !isOutlineFullscreen && (
          <button
            onClick={() => setIsOutlineOpen(true)}
            title="Mostrar panel lateral de esquema (Alt+O)"
            className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-md text-slate-700 hover:text-indigo-600 hover:border-indigo-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <ListTree className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>Esquema</span>
          </button>
        )}

        {/* Floating Quick-Reveal Button when Properties Panel is hidden */}
        {!isToolPanelOpen && !isOutlineFullscreen && (
          <button
            onClick={() => setIsToolPanelOpen(true)}
            title="Mostrar panel de propiedades (Alt+P)"
            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl shadow-md text-slate-700 hover:text-blue-600 hover:border-blue-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Propiedades</span>
          </button>
        )}

        {/* Main Canvas (visible unless Outline is in full-screen mode) */}
        {!isOutlineFullscreen && (
          <MindMapCanvas
            mindMap={mindMap}
            theme={currentTheme}
            selectedNodeId={selectedNodeId}
            editingNodeId={editingNodeId}
            searchMatches={searchMatches}
            onSelectNode={(id) => setSelectedNodeId(id)}
            onStartEditing={(id) => setEditingNodeId(id)}
            onFinishEditing={() => setEditingNodeId(null)}
            onUpdateNodeText={handleUpdateNodeText}
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

        {/* Properties / Inspector ToolPanel */}
        <ToolPanel
          selectedNode={selectedNode}
          currentTheme={currentTheme}
          layout={mindMap.layout}
          isOpen={isToolPanelOpen}
          onClose={() => setIsToolPanelOpen(false)}
          onUpdateNode={updateNode}
          onApplyStyleToChildren={handleApplyStyleToChildren}
          onApplyStyleToSiblings={handleApplyStyleToSiblings}
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
                updatedNodes[id] = { ...(node as MindNode), edgeStyle: undefined };
              });
              return { ...m, edgeStyle, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeProfile={(edgeProfile: EdgeProfile) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...(node as MindNode), edgeProfile: undefined };
              });
              return { ...m, edgeProfile, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeWidth={(edgeWidth: number) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...(node as MindNode), edgeWidth: undefined };
              });
              return { ...m, edgeWidth, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeColor={(edgeColor: string | undefined) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...(node as MindNode), edgeColor: undefined };
              });
              return { ...m, edgeColor, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onUpdateMapEdgeDash={(edgeDash: 'solid' | 'dashed' | 'dotted') => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...(node as MindNode), edgeDash: undefined };
              });
              return { ...m, edgeDash, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onApplyEdgeStyleToAllNodes={(edgeStyle: EdgeStyle) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...(node as MindNode), edgeStyle };
              });
              return { ...m, edgeStyle, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onApplyEdgeProfileToAllNodes={(edgeProfile: EdgeProfile) => {
            pushHistory(mindMap);
            setMindMap((m) => {
              const updatedNodes: Record<string, MindNode> = {};
              Object.entries(m.nodes).forEach(([id, node]) => {
                updatedNodes[id] = { ...(node as MindNode), edgeProfile };
              });
              return { ...m, edgeProfile, nodes: updatedNodes, updatedAt: Date.now() };
            });
          }}
          onOpenConnectorModal={(fromId?: string) => {
            setConnectorSourceId(fromId || selectedNodeId || mindMap.rootId);
          }}
          onDeleteConnector={(connectorId: string) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              connectors: (m.connectors || []).filter((c) => c.id !== connectorId),
              updatedAt: Date.now(),
            }));
          }}
          onUpdateConnector={(connectorId: string, updates: Partial<Connector>) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              connectors: (m.connectors || []).map((c) =>
                c.id === connectorId ? { ...c, ...updates } : c
              ),
              updatedAt: Date.now(),
            }));
          }}
          onUpdateMapGaps={(gaps: { horizontal?: number; vertical?: number }) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              horizontalGap: gaps.horizontal !== undefined ? gaps.horizontal : m.horizontalGap,
              verticalGap: gaps.vertical !== undefined ? gaps.vertical : m.verticalGap,
              updatedAt: Date.now(),
            }));
          }}
          onUpdateMapBackground={(config: {
            backgroundColor?: string;
            backgroundPattern?: BackgroundPatternStyle;
            backgroundPatternColor?: string;
            backgroundPatternSize?: number;
            backgroundPatternOpacity?: number;
          }) => {
            pushHistory(mindMap);
            setMindMap((m) => ({
              ...m,
              ...config,
              updatedAt: Date.now(),
            }));
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
          onOpenIconPackModal={() => setIsIconPackModalOpen(true)}
        />
      </main>

      {/* 5. Presentation Mode Overlay */}
      {isPresentationMode && (
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

      {/* 5b. Presentation Coming Soon Modal */}
      <ComingSoonModal
        isOpen={Boolean(comingSoonModalData)}
        data={comingSoonModalData}
        onClose={() => setComingSoonModalData(null)}
        onStartClassic={() => setIsPresentationMode(true)}
      />

      {/* 6. Modals */}
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

      {/* 7. Status Bar */}
      <StatusBar
        totalNodes={Object.keys(mindMap.nodes).length}
        selectedNodeText={selectedNode?.text || null}
        selectedNodeId={selectedNodeId}
        zoom={100}
        positionX={0}
        positionY={0}
        mode={editingNodeId ? 'Editando' : 'Listo'}
      />
    </div>
  );
}
