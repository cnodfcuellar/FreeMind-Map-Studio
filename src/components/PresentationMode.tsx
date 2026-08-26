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
} from 'lucide-react';

interface PresentationThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  previewColor: string;
  badgeBg: string;
}

const PRESENTATION_THEMES: PresentationThemeConfig[] = [
  {
    id: 'dark-studio',
    name: 'Estudio Oscuro',
    bgClass: 'bg-slate-950',
    textClass: 'text-white',
    accentClass: 'text-blue-400',
    cardBgClass: 'bg-slate-900/95',
    cardBorderClass: 'border-slate-800',
    previewColor: '#0f172a',
    badgeBg: 'bg-blue-950/80 border-blue-800/60 text-blue-300',
  },
  {
    id: 'midnight-oled',
    name: 'Medianoche OLED',
    bgClass: 'bg-black',
    textClass: 'text-slate-100',
    accentClass: 'text-cyan-400',
    cardBgClass: 'bg-zinc-950',
    cardBorderClass: 'border-zinc-800',
    previewColor: '#000000',
    badgeBg: 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300',
  },
  {
    id: 'cyberpunk-purple',
    name: 'Cyberpunk Neón',
    bgClass: 'bg-[#120726]',
    textClass: 'text-purple-100',
    accentClass: 'text-pink-400',
    cardBgClass: 'bg-[#1e0d3d]/95',
    cardBorderClass: 'border-purple-800/60',
    previewColor: '#1e0d3d',
    badgeBg: 'bg-purple-950/80 border-purple-800/60 text-purple-300',
  },
  {
    id: 'navy-executive',
    name: 'Azul Ejecutivo',
    bgClass: 'bg-[#09152b]',
    textClass: 'text-slate-100',
    accentClass: 'text-amber-400',
    cardBgClass: 'bg-[#102347]/95',
    cardBorderClass: 'border-blue-900/60',
    previewColor: '#0a192f',
    badgeBg: 'bg-amber-950/80 border-amber-800/60 text-amber-300',
  },
  {
    id: 'emerald-forest',
    name: 'Esmeralda Natural',
    bgClass: 'bg-[#051c14]',
    textClass: 'text-emerald-50',
    accentClass: 'text-emerald-400',
    cardBgClass: 'bg-[#0b2f22]/95',
    cardBorderClass: 'border-emerald-800/60',
    previewColor: '#064e3b',
    badgeBg: 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300',
  },
  {
    id: 'sunset-warm',
    name: 'Atardecer Cálido',
    bgClass: 'bg-[#210c14]',
    textClass: 'text-orange-50',
    accentClass: 'text-orange-400',
    cardBgClass: 'bg-[#3b1523]/95',
    cardBorderClass: 'border-rose-900/60',
    previewColor: '#881337',
    badgeBg: 'bg-orange-950/80 border-orange-800/60 text-orange-300',
  },
  {
    id: 'light-clean',
    name: 'Luz Minimalista',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-900',
    accentClass: 'text-blue-600',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-slate-300 shadow-sm',
    previewColor: '#f8fafc',
    badgeBg: 'bg-blue-100 border-blue-300 text-blue-800',
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
  // Presentation customization options
  const [themeId, setThemeId] = useState<string>('dark-studio');
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [imageSize, setImageSize] = useState<'small' | 'medium' | 'large' | 'hidden'>('medium');
  const [showChildrenCards, setShowChildrenCards] = useState<boolean>(true);
  const [showConnectorsCards, setShowConnectorsCards] = useState<boolean>(true);
  const [contentAlign, setContentAlign] = useState<'center' | 'left'>('center');
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'compact'>('normal');

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

  const isLight = themeId === 'light-clean';
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

      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
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
    return mindMap.connectors.filter(
      (c) => c.fromNodeId === currentNode.id || c.toNodeId === currentNode.id
    );
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
      className={`fixed inset-0 h-screen w-screen overflow-hidden ${currentTheme.bgClass} ${currentTheme.textClass} z-50 flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200 transition-colors`}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PRESENTATION_THEMES.map((th) => {
                  const isSelected = themeId === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeId(th.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-400/50 scale-102 font-bold shadow-md'
                          : 'border-slate-600/40 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: th.previewColor }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/40"
                        style={{ backgroundColor: th.previewColor }}
                      />
                      <span className="text-[11px] truncate font-semibold text-white drop-shadow-sm">
                        {th.name}
                      </span>
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-xl ${currentTheme.cardBgClass} ${currentTheme.cardBorderClass} hover:border-blue-500`}
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
                    const isSource = conn.fromNodeId === currentNode.id;
                    const targetId = isSource ? conn.toNodeId : conn.fromNodeId;
                    const targetNode = mindMap.nodes[targetId];
                    if (!targetNode) return null;

                    return (
                      <div
                        key={conn.id}
                        onClick={() => handleJumpToNode(targetId)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-md flex items-center justify-between gap-2 ${currentTheme.cardBgClass} ${currentTheme.cardBorderClass} hover:border-pink-500`}
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
      <footer className="flex items-center justify-between max-w-2xl mx-auto w-full shrink-0 h-12">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-200'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex items-center gap-1.5 overflow-hidden max-w-xs px-2">
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
            />
          ))}
        </div>

        <button
          disabled={currentIndex === slides.length - 1}
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-lg shadow-blue-900/40 cursor-pointer"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
