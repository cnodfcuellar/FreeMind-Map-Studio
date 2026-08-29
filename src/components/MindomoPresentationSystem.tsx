import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MindMap, MindNode, SlideFrame, CalculatedNodeLayout, Connector } from '../types/mindmap';
import {
  computeMindMapLayout,
  computeCloudBounds,
  generateEdgePath,
  generateRibbonEdgePath,
} from '../utils/layoutEngine';
import { generateDefaultPresentationSlides } from '../utils/presentationGenerator';
import { THEMES } from '../utils/themes';
import { NodeComponent } from './NodeComponent';
import { MarkdownView } from '../utils/markdownRenderer';
import {
  Play,
  Plus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Compass,
  X,
  Sliders,
  Move,
  Layers,
  ArrowRight,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Square,
  MousePointer,
  CheckSquare,
  PlusSquare,
  Crop,
  Undo2,
  Redo2,
} from 'lucide-react';

interface MindomoPresentationSystemProps {
  mindMap: MindMap;
  onUpdateMindMap: (updated: MindMap) => void;
  onClose: () => void;
  initialMode?: 'editor' | 'play';
}

export const MindomoPresentationSystem: React.FC<MindomoPresentationSystemProps> = ({
  mindMap,
  onUpdateMindMap,
  onClose,
  initialMode = 'editor',
}) => {
  // Mode: 'editor' (Frame Studio) or 'play' (Cinema Presentation)
  const [mode, setMode] = useState<'editor' | 'play'>(initialMode);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [autoPlayIntervalSec, setAutoPlayIntervalSec] = useState<number>(5);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(true);
  const [isOverviewActive, setIsOverviewActive] = useState<boolean>(false);
  const [isFilmstripOpen, setIsFilmstripOpen] = useState<boolean>(true);

  // Editor interactive tools: 'navigate' | 'pick_nodes' | 'draw_frame'
  const [editorTool, setEditorTool] = useState<'navigate' | 'pick_nodes' | 'draw_frame'>('pick_nodes');
  const [stagedNodeIds, setStagedNodeIds] = useState<Set<string>>(new Set());
  const [isDrawingFrame, setIsDrawingFrame] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Layout calculations
  const layoutMap = useMemo(() => {
    return computeMindMapLayout(mindMap, { x: 0, y: 0 });
  }, [mindMap]);

  // Slides state (From mindMap or generated default)
  const [slides, setSlides] = useState<SlideFrame[]>(() => {
    if (mindMap.presentationSlides && mindMap.presentationSlides.length > 0) {
      return mindMap.presentationSlides;
    }
    return generateDefaultPresentationSlides(mindMap, layoutMap);
  });

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<SlideFrame[][]>([]);
  const [redoStack, setRedoStack] = useState<SlideFrame[][]>([]);

  // Keep mindMap in sync when slides are modified (pushing to undo stack)
  const updateSlides = useCallback(
    (newSlides: SlideFrame[], addToHistory: boolean = true) => {
      if (addToHistory) {
        setUndoStack((prev) => [...prev.slice(-25), slides]);
        setRedoStack([]);
      }
      setSlides(newSlides);
      onUpdateMindMap({
        ...mindMap,
        presentationSlides: newSlides,
      });
    },
    [mindMap, onUpdateMindMap, slides]
  );

  // Undo Action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    setRedoStack((prev) => [...prev, slides]);
    setUndoStack(newUndo);
    setSlides(previous);
    onUpdateMindMap({
      ...mindMap,
      presentationSlides: previous,
    });
    if (currentSlideIndex >= previous.length) {
      setCurrentSlideIndex(Math.max(0, previous.length - 1));
    }
  }, [undoStack, redoStack, slides, mindMap, onUpdateMindMap, currentSlideIndex]);

  // Redo Action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    setUndoStack((prev) => [...prev, slides]);
    setRedoStack(newRedo);
    setSlides(next);
    onUpdateMindMap({
      ...mindMap,
      presentationSlides: next,
    });
    if (currentSlideIndex >= next.length) {
      setCurrentSlideIndex(Math.max(0, next.length - 1));
    }
  }, [redoStack, undoStack, slides, mindMap, onUpdateMindMap, currentSlideIndex]);

  // Viewport / Camera Transform & Panning
  const [camera, setCamera] = useState<{ panX: number; panY: number; zoom: number }>({
    panX: 0,
    panY: 0,
    zoom: 1,
  });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const viewportContainerRef = useRef<HTMLDivElement>(null);

  // Current active slide
  const activeSlide = slides[currentSlideIndex] || slides[0];
  const activeNode = activeSlide?.nodeId ? mindMap.nodes[activeSlide.nodeId] : null;

  // Overview bounds of entire map
  const overviewBounds = useMemo(() => {
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

    if (minX === Infinity) {
      return { x: -300, y: -200, width: 600, height: 400 };
    }

    const pad = 120;
    return {
      x: minX - pad,
      y: minY - pad,
      width: Math.max(500, maxX - minX + pad * 2),
      height: Math.max(350, maxY - minY + pad * 2),
    };
  }, [layoutMap]);

  // Compute camera flight parameters to frame target bounds perfectly on screen
  const flyCameraToBounds = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }, smooth: boolean = true) => {
      if (!viewportContainerRef.current) return;
      const vw = viewportContainerRef.current.clientWidth || window.innerWidth;
      const vh = viewportContainerRef.current.clientHeight || window.innerHeight;

      // Adjust ratio to allow the node/branch to occupy the full prominent frame with tight margin
      const scaleX = (vw * 0.92) / bounds.width;
      const scaleY = (vh * 0.88) / bounds.height;
      const targetZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 3.2);

      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      const targetPanX = vw / 2 - centerX * targetZoom;
      const targetPanY = vh / 2 - centerY * targetZoom;

      setCamera({
        panX: targetPanX,
        panY: targetPanY,
        zoom: targetZoom,
      });
    },
    []
  );

  // Focus active slide
  useEffect(() => {
    if (isOverviewActive) {
      flyCameraToBounds(overviewBounds, true);
    } else if (activeSlide) {
      flyCameraToBounds(activeSlide.bounds, true);
    }
  }, [currentSlideIndex, activeSlide, isOverviewActive, overviewBounds, flyCameraToBounds]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (isOverviewActive) {
        flyCameraToBounds(overviewBounds, false);
      } else if (activeSlide) {
        flyCameraToBounds(activeSlide.bounds, false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSlide, isOverviewActive, overviewBounds, flyCameraToBounds]);

  // Next / Prev navigation
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      // Undo / Redo shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
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
        setMode((m) => (m === 'play' ? 'editor' : 'play'));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide, handleToggleOverview, handleUndo, handleRedo, onClose]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlayingAuto || mode !== 'play') return;
    const interval = setInterval(() => {
      handleNextSlide();
    }, autoPlayIntervalSec * 1000);
    return () => clearInterval(interval);
  }, [isPlayingAuto, autoPlayIntervalSec, mode, handleNextSlide]);

  // Frame Auto-Generator Action
  const handleRegenerateAutoSlides = () => {
    const autoSlides = generateDefaultPresentationSlides(mindMap, layoutMap);
    updateSlides(autoSlides);
    setCurrentSlideIndex(0);
    setIsOverviewActive(false);
  };

  // Start from scratch: Clears all frames and creates only the initial Overview/Root slide
  const handleClearAndStartFromScratch = () => {
    const rootNode = mindMap.nodes[mindMap.rootId];
    const rootLayout = layoutMap.get(mindMap.rootId);
    const pad = 100;
    const initialSlide: SlideFrame = rootLayout
      ? {
          id: 'slide-root-initial',
          order: 1,
          title: `🎯 ${rootNode?.text || 'Inicio'}`,
          type: 'node',
          nodeId: mindMap.rootId,
          bounds: {
            x: rootLayout.x - pad,
            y: rootLayout.y - pad,
            width: rootLayout.width + pad * 2,
            height: rootLayout.height + pad * 2,
          },
          showNotes: Boolean(rootNode?.note),
          color: rootNode?.color || '#2563eb',
        }
      : {
          id: 'slide-overview-initial',
          order: 1,
          title: `🗺️ ${mindMap.title || 'Inicio'}`,
          type: 'overview',
          bounds: overviewBounds,
          showNotes: false,
          color: '#3b82f6',
        };

    updateSlides([initialSlide]);
    setCurrentSlideIndex(0);
    setIsOverviewActive(false);
  };

  // Add custom frame from selected node
  const handleAddSlideFromSelectedNode = (nodeId: string, includeChildren: boolean = true) => {
    const l = layoutMap.get(nodeId);
    const n = mindMap.nodes[nodeId];
    if (!l || !n) return;

    // Helper to calculate exact branch subtree bounds if node has children
    let minX = l.x;
    let maxX = l.x + l.width;
    let minY = l.y;
    let maxY = l.y + l.height;

    if (includeChildren && n.children && n.children.length > 0) {
      const collect = (cid: string) => {
        const cl = layoutMap.get(cid);
        const cn = mindMap.nodes[cid];
        if (cl) {
          minX = Math.min(minX, cl.x);
          maxX = Math.max(maxX, cl.x + cl.width);
          minY = Math.min(minY, cl.y);
          maxY = Math.max(maxY, cl.y + cl.height);
        }
        if (cn?.children) {
          cn.children.forEach(collect);
        }
      };
      n.children.forEach(collect);
    }

    const pad = 24;
    const newSlide: SlideFrame = {
      id: `slide-custom-${nodeId}-${Date.now()}`,
      order: slides.length + 1,
      title: n.text || 'Nuevo Marco',
      type: includeChildren && n.children && n.children.length > 0 ? 'branch' : 'node',
      nodeId: n.id,
      bounds: {
        x: minX - pad,
        y: minY - pad,
        width: Math.max(160, maxX - minX + pad * 2),
        height: Math.max(100, maxY - minY + pad * 2),
      },
      showNotes: Boolean(n.note),
      color: n.color || '#3b82f6',
    };

    const updated = [...slides, newSlide];
    updateSlides(updated);
    setCurrentSlideIndex(updated.length - 1);
    setIsOverviewActive(false);
  };

  // Create a customized frame from explicitly staged/selected nodes (Estilo Mindomo)
  const handleCreateFrameFromStagedNodes = () => {
    if (stagedNodeIds.size === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const selectedIds = Array.from(stagedNodeIds);
    let primaryTitle = 'Marco Personalizado';

    selectedIds.forEach((nid, idx) => {
      const l = layoutMap.get(nid);
      const n = mindMap.nodes[nid];
      if (l) {
        minX = Math.min(minX, l.x);
        maxX = Math.max(maxX, l.x + l.width);
        minY = Math.min(minY, l.y);
        maxY = Math.max(maxY, l.y + l.height);
        if (idx === 0 && n?.text) {
          primaryTitle = n.text;
        }
      }
    });

    if (minX === Infinity) return;

    const pad = 24;
    const newSlide: SlideFrame = {
      id: `slide-custom-staged-${Date.now()}`,
      order: slides.length + 1,
      title: primaryTitle,
      type: 'custom_area',
      nodeIds: selectedIds,
      nodeId: selectedIds[0],
      bounds: {
        x: minX - pad,
        y: minY - pad,
        width: Math.max(160, maxX - minX + pad * 2),
        height: Math.max(100, maxY - minY + pad * 2),
      },
      showNotes: selectedIds.some((id) => Boolean(mindMap.nodes[id]?.note)),
      color: '#3b82f6',
    };

    const updated = [...slides, newSlide];
    updateSlides(updated);
    setCurrentSlideIndex(updated.length - 1);
    setIsOverviewActive(false);
    setStagedNodeIds(new Set());
  };

  // Create a frame directly from a manually drawn box on the canvas
  const handleCreateFrameFromDrawnBox = (box: { x: number; y: number; width: number; height: number }) => {
    if (box.width < 40 || box.height < 40) return;

    // Find all nodes that intersect or are inside this drawn box
    const containedNodeIds: string[] = [];
    layoutMap.forEach((l, nid) => {
      const nRight = l.x + l.width;
      const nBottom = l.y + l.height;
      const bRight = box.x + box.width;
      const bBottom = box.y + box.height;

      // Intersect test
      if (l.x < bRight && nRight > box.x && l.y < bBottom && nBottom > box.y) {
        containedNodeIds.push(nid);
      }
    });

    const firstNode = containedNodeIds.length > 0 ? mindMap.nodes[containedNodeIds[0]] : null;
    const title = firstNode?.text || `Marco Libre ${slides.length + 1}`;

    const newSlide: SlideFrame = {
      id: `slide-drawn-${Date.now()}`,
      order: slides.length + 1,
      title,
      type: 'custom_area',
      nodeIds: containedNodeIds,
      nodeId: containedNodeIds[0],
      bounds: box,
      showNotes: containedNodeIds.some((id) => Boolean(mindMap.nodes[id]?.note)),
      color: '#8b5cf6',
    };

    const updated = [...slides, newSlide];
    updateSlides(updated);
    setCurrentSlideIndex(updated.length - 1);
    setIsOverviewActive(false);
  };

  // Delete slide
  const handleDeleteSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    const updated = slides.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    updateSlides(updated);
    if (currentSlideIndex >= updated.length) {
      setCurrentSlideIndex(updated.length - 1);
    }
  };

  // Move slide up / down in filmstrip
  const handleMoveSlide = (fromIndex: number, toIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (toIndex < 0 || toIndex >= slides.length) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const updated = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateSlides(updated);
    setCurrentSlideIndex(toIndex);
  };

  // Node highlighting in presentation mode
  const activeHighlightedNodeIds = useMemo(() => {
    if (isOverviewActive || !activeSlide) {
      return new Set(Object.keys(mindMap.nodes));
    }
    const set = new Set<string>();

    // 1. If explicit nodeIds list is defined by the user for this slide
    if (activeSlide.nodeIds && activeSlide.nodeIds.length > 0) {
      activeSlide.nodeIds.forEach((id) => set.add(id));
    }

    // 2. Main target node
    if (activeSlide.nodeId) {
      set.add(activeSlide.nodeId);
      // If branch type, highlight all descendants
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
  }, [activeSlide, isOverviewActive, mindMap.nodes]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white select-none flex flex-col overflow-hidden font-sans">
      {/* 1. TOP HEADER HUD */}
      <div className="h-14 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-xl border border-blue-500/30 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Presentación Dinámica</span>
          </div>

          <span className="text-sm font-semibold text-slate-300 truncate max-w-[260px] sm:max-w-md">
            {mindMap.title}
          </span>
        </div>

        {/* Center Mode Switcher (Editor vs Presentar) */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-bold">
          <button
            onClick={() => setMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Editor de Marcos</span>
          </button>
          <button
            onClick={() => setMode('play')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'play' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Presentar (F5)</span>
          </button>
        </div>

        {/* Right Exit / Options */}
        <div className="flex items-center gap-2">
          {mode === 'editor' && (
            <>
              {/* Deshacer / Rehacer */}
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 mr-1">
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  title="Deshacer (Ctrl+Z)"
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Rehacer (Ctrl+Y / Ctrl+Shift+Z)"
                  className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleClearAndStartFromScratch}
                title="Borrar todos los marcos existentes y empezar a crearlos desde cero manualmente"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold transition-colors cursor-pointer border border-red-800/60"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Empezar de Cero</span>
              </button>

              <button
                onClick={handleRegenerateAutoSlides}
                title="Generar marcos automáticamente según la jerarquía del mapa mental"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Auto-generar</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            title="Salir de la presentación (ESC)"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 1.5. EDITOR FLOATING TOOLBAR (Estilo Mindomo) */}
      {mode === 'editor' && (
        <div className="h-11 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-30 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold mr-1">Modo de Creación:</span>

            <button
              onClick={() => setEditorTool('pick_nodes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                editorTool === 'pick_nodes'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>1. Seleccionar Nodos</span>
            </button>

            <button
              onClick={() => setEditorTool('draw_frame')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                editorTool === 'draw_frame'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>2. Dibujar Recuadro</span>
            </button>

            <button
              onClick={() => setEditorTool('navigate')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                editorTool === 'navigate'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Navegar / Mover</span>
            </button>
          </div>

          {/* Staged Nodes Action: Crear marco con los nodos seleccionados */}
          {stagedNodeIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {stagedNodeIds.size} nodos seleccionados
              </span>
              <button
                onClick={handleCreateFrameFromStagedNodes}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:brightness-110 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Marco con Selección</span>
              </button>
              <button
                onClick={() => setStagedNodeIds(new Set())}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                title="Desmarcar selección"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. MAIN CINEMA CANVAS VIEWPORT */}
      <div
        ref={viewportContainerRef}
        onWheel={(e) => {
          if (mode === 'editor' && editorTool === 'navigate') {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
            const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.15), 4.0);

            const rect = viewportContainerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const newPanX = mouseX - (mouseX - camera.panX) * (newZoom / camera.zoom);
            const newPanY = mouseY - (mouseY - camera.panY) * (newZoom / camera.zoom);

            setCamera({
              panX: newPanX,
              panY: newPanY,
              zoom: newZoom,
            });
          }
        }}
        onMouseDown={(e) => {
          if (mode === 'editor') {
            if (editorTool === 'draw_frame') {
              const rect = viewportContainerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const screenX = e.clientX - rect.left;
              const screenY = e.clientY - rect.top;
              const worldX = (screenX - camera.panX) / camera.zoom;
              const worldY = (screenY - camera.panY) / camera.zoom;
              setIsDrawingFrame(true);
              setDrawStart({ x: worldX, y: worldY });
              setDrawCurrent({ x: worldX, y: worldY });
            } else if (editorTool === 'navigate' || e.button === 1 || e.altKey) {
              setIsPanning(true);
              setPanStart({ x: e.clientX - camera.panX, y: e.clientY - camera.panY });
            }
          }
        }}
        onMouseMove={(e) => {
          if (mode === 'editor') {
            if (editorTool === 'draw_frame' && isDrawingFrame) {
              const rect = viewportContainerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const screenX = e.clientX - rect.left;
              const screenY = e.clientY - rect.top;
              const worldX = (screenX - camera.panX) / camera.zoom;
              const worldY = (screenY - camera.panY) / camera.zoom;
              setDrawCurrent({ x: worldX, y: worldY });
            } else if (isPanning) {
              setCamera((prev) => ({
                ...prev,
                panX: e.clientX - panStart.x,
                panY: e.clientY - panStart.y,
              }));
            }
          }
        }}
        onMouseUp={() => {
          if (isPanning) {
            setIsPanning(false);
          }
          if (mode === 'editor' && editorTool === 'draw_frame' && isDrawingFrame && drawStart && drawCurrent) {
            const minX = Math.min(drawStart.x, drawCurrent.x);
            const minY = Math.min(drawStart.y, drawCurrent.y);
            const w = Math.abs(drawCurrent.x - drawStart.x);
            const h = Math.abs(drawCurrent.y - drawStart.y);

            setIsDrawingFrame(false);
            setDrawStart(null);
            setDrawCurrent(null);

            if (w > 50 && h > 40) {
              handleCreateFrameFromDrawnBox({ x: minX, y: minY, width: w, height: h });
            }
          }
        }}
        onMouseLeave={() => {
          setIsPanning(false);
          setIsDrawingFrame(false);
        }}
        className={`relative flex-1 bg-slate-950 overflow-hidden select-none ${
          editorTool === 'draw_frame' && mode === 'editor'
            ? 'cursor-crosshair'
            : isPanning
            ? 'cursor-grabbing'
            : editorTool === 'navigate'
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        {/* World Transform Layer (Vuelo de Cámara) */}
        <div
          style={{
            transform: `translate3d(${camera.panX}px, ${camera.panY}px, 0) scale(${camera.zoom})`,
            transformOrigin: '0 0',
            transition: isDrawingFrame || isPanning ? 'none' : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          className="absolute top-0 left-0 will-change-transform"
        >
          {/* Canvas SVG Layer (Clouds & Real Edges) */}
          <svg
            className="overflow-visible absolute top-0 left-0 pointer-events-none"
            style={{ width: 1, height: 1 }}
          >
            {/* Filter for cloud drop shadow */}
            <filter id="pres-cloud-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.15" />
            </filter>

            {/* 1. Clouds Layer */}
            {(Object.values(mindMap.nodes) as MindNode[])
              .filter((node) => Boolean(node.cloud?.enabled))
              .map((node) => ({
                node,
                bounds: computeCloudBounds(node.id, mindMap.nodes, layoutMap),
              }))
              .filter(
                (item): item is { node: MindNode; bounds: NonNullable<ReturnType<typeof computeCloudBounds>> } =>
                  Boolean(item.bounds)
              )
              .sort((a, b) => b.bounds.width * b.bounds.height - a.bounds.width * a.bounds.height)
              .map(({ node, bounds }) => {
                const cloud = node.cloud!;
                const isHighlighted = isOverviewActive || activeHighlightedNodeIds.has(node.id);
                const x = bounds.x;
                const y = bounds.y;
                const w = bounds.width;
                const h = bounds.height;
                const r = Math.min(24, Math.min(w, h) / 4);
                const shapePath = `M ${x + r} ${y} h ${w - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;

                return (
                  <g
                    key={`pres-cloud-${node.id}`}
                    filter={cloud.shadow ? 'url(#pres-cloud-drop-shadow)' : undefined}
                    opacity={isHighlighted ? 1 : 0.15}
                    className="transition-opacity duration-500"
                  >
                    <path
                      d={shapePath}
                      fill={cloud.color || '#3b82f6'}
                      fillOpacity={cloud.opacity || 0.12}
                      stroke={cloud.borderColor || cloud.color || '#3b82f6'}
                      strokeWidth={cloud.borderWidth || 1.5}
                      strokeDasharray={cloud.borderDash === 'dashed' ? '8 5' : undefined}
                    />
                  </g>
                );
              })}

            {/* 2. Hierarchical Tree Edges Layer */}
            {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
              const childNode = mindMap.nodes[childLayout.id];
              if (!childNode || !childNode.parentId || !layoutMap.has(childNode.parentId)) {
                return null;
              }
              const parentLayout = layoutMap.get(childNode.parentId)!;
              const isHighlighted =
                isOverviewActive ||
                (activeHighlightedNodeIds.has(childNode.id) && activeHighlightedNodeIds.has(childNode.parentId));

              const theme = THEMES[mindMap.themeId || 'default'] || THEMES.default;
              const branchColors = theme.branchColors || THEMES.default.branchColors;
              const branchColor = branchColors[childLayout.branchIndex % branchColors.length] || '#38bdf8';
              const color = childNode.edgeColor || mindMap.edgeColor || branchColor;

              const effectiveStyle = childNode.edgeStyle || mindMap.edgeStyle || 'bezier';
              const edgePath = generateEdgePath(parentLayout, childLayout, effectiveStyle, childNode.shape);
              if (!edgePath) return null;

              const defaultWidth = childLayout.depth === 1 ? 2.5 : 1.75;
              const width = childNode.edgeWidth || mindMap.edgeWidth || defaultWidth;

              return (
                <path
                  key={`pres-edge-${childNode.id}`}
                  d={edgePath}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHighlighted ? width * 1.3 : width}
                  strokeOpacity={isHighlighted ? 0.95 : 0.15}
                  strokeDasharray={childNode.edgeDash === 'dashed' ? '8 5' : undefined}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Render All Real Nodes using NodeComponent */}
          <div id="pres-nodes-layer" className="absolute top-0 left-0 pointer-events-auto">
            {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((layout) => {
              const node = mindMap.nodes[layout.id];
              if (!node) return null;
              const isHighlighted = isOverviewActive || activeHighlightedNodeIds.has(node.id);
              const isTargetNode = activeSlide?.nodeId === node.id;
              const theme = THEMES[mindMap.themeId || 'default'] || THEMES.default;
              const branchColors = theme.branchColors || THEMES.default.branchColors;
              const branchColor = branchColors[layout.branchIndex % branchColors.length] || '#38bdf8';

              return (
                <div
                  key={`pres-node-wrapper-${node.id}`}
                  style={{
                    opacity: isHighlighted ? 1 : 0.18,
                    filter: isHighlighted ? 'none' : 'blur(1px)',
                    transition: 'opacity 500ms ease, filter 500ms ease',
                  }}
                  className={`transition-all duration-500 ${
                    isTargetNode ? 'scale-105 z-20 shadow-[0_0_25px_rgba(59,130,246,0.5)]' : ''
                  }`}
                >
                  <NodeComponent
                    node={node}
                    layout={layout}
                    isSelected={isTargetNode}
                    isEditing={false}
                    theme={theme}
                    branchColor={branchColor}
                    globalVisibility={{
                      hideAllBodies: mindMap.hideAllBodies,
                      hideAllImages: mindMap.hideAllImages,
                      hideAllTags: mindMap.hideAllTags,
                      hideAllIcons: mindMap.hideAllIcons,
                      hideAllLinks: mindMap.hideAllLinks,
                      showAllNotesInline: mindMap.showAllNotesInline,
                    }}
                    onSelect={() => {
                      if (mode === 'editor') {
                        if (editorTool === 'pick_nodes') {
                          // Toggle node in staged multi-selection
                          setStagedNodeIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(node.id)) {
                              next.delete(node.id);
                            } else {
                              next.add(node.id);
                            }
                            return next;
                          });
                        } else {
                          // Navigate / Focus existing or add individual
                          const existingIdx = slides.findIndex((s) => s.nodeId === node.id);
                          if (existingIdx !== -1) {
                            setCurrentSlideIndex(existingIdx);
                            setIsOverviewActive(false);
                          } else {
                            handleAddSlideFromSelectedNode(node.id, false);
                          }
                        }
                      }
                    }}
                    onDoubleClick={() => {}}
                    onTextChange={() => {}}
                    onFinishEditing={() => {}}
                    onToggleFold={() => {}}
                    onAddChild={() => {}}
                    onOpenNote={() => setShowNotesDrawer(true)}
                    onDragStart={() => {}}
                    onDropOnNode={() => {}}
                  />
                  {/* Staged Checkmark Badge in Editor Pick Mode */}
                  {mode === 'editor' && editorTool === 'pick_nodes' && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setStagedNodeIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(node.id)) next.delete(node.id);
                          else next.add(node.id);
                          return next;
                        });
                      }}
                      style={{
                        transform: `translate3d(${layout.x + layout.width - 10}px, ${layout.y - 10}px, 0)`,
                      }}
                      className={`absolute top-0 left-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all z-30 shadow-md ${
                        stagedNodeIds.has(node.id)
                          ? 'bg-blue-600 border-white text-white scale-110'
                          : 'bg-slate-900/80 border-slate-500 text-transparent hover:border-blue-400 hover:text-blue-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Render Drawn Box in progress */}
          {mode === 'editor' && editorTool === 'draw_frame' && isDrawingFrame && drawStart && drawCurrent && (
            <div
              style={{
                transform: `translate3d(${Math.min(drawStart.x, drawCurrent.x)}px, ${Math.min(drawStart.y, drawCurrent.y)}px, 0)`,
                width: Math.abs(drawCurrent.x - drawStart.x),
                height: Math.abs(drawCurrent.y - drawStart.y),
              }}
              className="absolute top-0 left-0 rounded-2xl border-2 border-indigo-400 bg-indigo-500/20 pointer-events-none z-40 border-dashed"
            />
          )}

          {/* Render Slide Frames in Editor Mode */}
          {mode === 'editor' && (
            <div className="pointer-events-auto">
              {slides.map((slide, idx) => {
                const isSelected = idx === currentSlideIndex;
                return (
                  <div
                    key={`editor-frame-${slide.id}`}
                    onClick={() => setCurrentSlideIndex(idx)}
                    style={{
                      transform: `translate3d(${slide.bounds.x}px, ${slide.bounds.y}px, 0)`,
                      width: slide.bounds.width,
                      height: slide.bounds.height,
                    }}
                    className={`absolute top-0 left-0 rounded-3xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.3)] ring-2 ring-blue-400/50'
                        : 'border-dashed border-slate-600/60 bg-slate-800/5 hover:border-slate-400 hover:bg-slate-800/20'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-md flex items-center gap-1">
                      <span>Slide {slide.order}</span>
                      <span className="opacity-75">• {slide.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. FLOATING PRESENTER NOTES DRAWER */}
        {showNotesDrawer && activeNode?.note && (
          <div className="absolute top-4 right-4 z-40 w-80 sm:w-96 max-h-[70vh] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-4 flex flex-col text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <FileText className="w-4 h-4" />
                <span>Notas del Orador ({activeNode.text})</span>
              </div>
              <button
                onClick={() => setShowNotesDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-y-auto pr-1 text-xs space-y-2 leading-relaxed">
              <MarkdownView markdown={activeNode.note} isDark={true} />
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM FILMSTRIP & CONTROLS HUD */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex flex-col z-30 shrink-0">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 relative">
          <div
            style={{
              width: `${((currentSlideIndex + 1) / Math.max(1, slides.length)) * 100}%`,
            }}
            className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          />
        </div>

        {/* Filmstrip Strip */}
        {isFilmstripOpen && (
          <div className="px-4 py-2 overflow-x-auto flex items-center gap-2 border-b border-slate-800/80 scrollbar-thin">
            {mode === 'editor' && (
              <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-700/60">
                <span className="text-[11px] font-semibold text-blue-400">
                  💡 Haz clic en cualquier nodo para agregarlo como nuevo marco
                </span>
              </div>
            )}

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

                  {mode === 'editor' && slides.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSlide(idx, e)}
                      title="Eliminar este marco"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 text-red-400 rounded transition-opacity"
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
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <span className="opacity-50">|</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{activeSlide?.title}</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevSlide}
              title="Diapositiva Anterior (← o Espacio)"
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleOverview}
              title={isOverviewActive ? 'Volver al foco' : 'Vista General del Mapa (O / Home)'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isOverviewActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextSlide}
              title="Siguiente Diapositiva (→ o Espacio)"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-md cursor-pointer active:scale-95"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Extra Tools */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {activeNode?.note && (
              <button
                onClick={() => setShowNotesDrawer((prev) => !prev)}
                title="Mostrar/Ocultar Notas del Orador (N)"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showNotesDrawer ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsFilmstripOpen((prev) => !prev)}
              title="Alternar Tira de Diapositivas"
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
