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
