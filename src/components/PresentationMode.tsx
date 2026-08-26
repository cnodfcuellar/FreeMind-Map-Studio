import React, { useState, useEffect, useMemo } from 'react';
import { MindMap, MindNode, Connector } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import { MarkdownView } from '../utils/markdownRenderer';
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Sparkles,
  SlidersHorizontal,
  Check,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  GitBranch,
  Network,
  Type,
  Maximize2,
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
    bgClass: 'bg-slate-950/95',
    textClass: 'text-white',
    accentClass: 'text-blue-400',
    cardBgClass: 'bg-slate-900/90',
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
    cardBgClass: 'bg-[#1e0d3d]/90',
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
    cardBgClass: 'bg-[#102347]/90',
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
    cardBgClass: 'bg-[#0b2f22]/90',
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
    cardBgClass: 'bg-[#3b1523]/90',
    cardBorderClass: 'border-rose-900/60',
    previewColor: '#881337',
    badgeBg: 'bg-orange-950/80 border-orange-800/60 text-orange-300',
  },
  {
    id: 'light-clean',
    name: 'Luz Minimalista',
    bgClass: 'bg-slate-50',
    textClass: 'text-slate-900',
    accentClass: 'text-blue-600',
    cardBgClass: 'bg-white',
    cardBorderClass: 'border-slate-200',
    previewColor: '#f8fafc',
    badgeBg: 'bg-blue-100 border-blue-300 text-blue-800',
  },
];

interface PresentationModeProps {
  mindMap: MindMap;
  onClose: () => void;
  onEditNode?: (nodeId: string) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  mindMap,
  onClose,
  onEditNode,
  onUpdateNode,
}) => {
  // Collect all slides (nodes in depth-first order)
  const slides = useMemo(() => {
    const list: MindNode[] = [];
    function traverse(nodeId: string) {
      const node = mindMap.nodes[nodeId];
      if (!node) return;
      list.push(node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    }
    traverse(mindMap.rootId);
    return list;
  }, [mindMap]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Presentation customization options
  const [themeId, setThemeId] = useState<string>('dark-studio');
  const [showNotes, setShowNotes] = useState<boolean>(true);
  const [imageSize, setImageSize] = useState<'small' | 'medium' | 'large' | 'hidden'>('medium');
  const [showChildrenCards, setShowChildrenCards] = useState<boolean>(true);
  const [showConnectorsCards, setShowConnectorsCards] = useState<boolean>(true);
  const [contentAlign, setContentAlign] = useState<'center' | 'left'>('center');
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'compact'>('normal');

  const currentTheme = useMemo(() => {
    return PRESENTATION_THEMES.find((t) => t.id === themeId) || PRESENTATION_THEMES[0];
  }, [themeId]);

  const isLight = themeId === 'light-clean';
  const currentNode = slides[currentIndex] || slides[0];

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
    const idx = slides.findIndex((s) => s.id === nodeId);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
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
  }, [currentIndex, slides.length, isConfigOpen]);

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

  // Find child nodes
  const childNodes = useMemo(() => {
    if (!currentNode.children || currentNode.children.length === 0) return [];
    return currentNode.children
      .map((id) => mindMap.nodes[id])
      .filter((n): n is MindNode => Boolean(n));
  }, [currentNode.children, mindMap.nodes]);

  // Image dimension styling
  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small':
        return 'max-w-[160px] max-h-[120px]';
      case 'large':
        return 'max-w-[560px] max-h-[380px]';
      case 'medium':
      default:
        return 'max-w-[320px] max-h-[220px]';
    }
  };

  // Font size styling
  const getHeadingSizeClass = () => {
    switch (fontSizeScale) {
      case 'large':
        return 'text-4xl md:text-6xl';
      case 'compact':
        return 'text-2xl md:text-4xl';
      case 'normal':
      default:
        return 'text-3xl md:text-5xl';
    }
  };

  return (
    <div
      className={`fixed inset-0 ${currentTheme.bgClass} ${currentTheme.textClass} backdrop-blur-xl z-50 flex flex-col justify-between p-6 sm:p-8 select-none animate-in fade-in duration-200 overflow-y-auto transition-colors`}
    >
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-center justify-between gap-3 w-full shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs border ${currentTheme.badgeBg}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Modo Presentación Clásica
          </div>
          <span className="text-xs opacity-60 font-mono hidden sm:inline truncate max-w-xs">
            {mindMap.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* EDIT & CONFIGURE PRESENTATION BUTTON (Editar) */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              isConfigOpen
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : isLight
                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
            title="Editar tema, visualización de notas, imágenes y tarjetas de hijos/conectores (Tecla E)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Editar Presentación</span>
          </button>

          {/* Slide Indicator */}
          <span
            className={`text-xs font-mono px-3 py-1.5 rounded-xl border hidden sm:inline ${
              isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Diapositiva {currentIndex + 1} de {slides.length}
          </span>

          {/* Exit Presentation */}
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Salir de la presentación (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. CUSTOMIZATION SETTINGS MODAL / DRAWER (Al pulsar Editar) */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Opciones del Modo Presentación</h3>
                  <p className="text-[11px] opacity-60">Personaliza el tema, notas, imágenes y tarjetas</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-slate-800/40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. SELECTOR DE TEMAS */}
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
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
                          ? 'border-blue-500 ring-2 ring-blue-400/50 scale-102 font-bold'
                          : 'border-slate-700/60 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: th.previewColor }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                        style={{ backgroundColor: th.previewColor }}
                      />
                      <span className="text-[11px] truncate text-white drop-shadow-xs">{th.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. MOSTRAR / OCULTAR NOTAS */}
            <div className="space-y-2 pt-2 border-t border-slate-700/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold block">Notas del Presentador</span>
                    <span className="text-[10.5px] opacity-60 block">
                      Muestra la caja de notas formateadas con Markdown
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
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* C. TAMAÑO DE IMÁGENES */}
            <div className="space-y-2 pt-2 border-t border-slate-700/40">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
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
                        ? 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
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
            <div className="space-y-2 pt-2 border-t border-slate-700/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-semibold block">Sub-Nodos Hijos como Cards</span>
                    <span className="text-[10.5px] opacity-60 block">
                      Renderiza los subtemas hijos como tarjetas interactivas
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
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* E. MOSTRAR CONEXIONES CRUZADAS COMO CARDS */}
            <div className="space-y-2 pt-2 border-t border-slate-700/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-pink-400" />
                  <div>
                    <span className="text-xs font-semibold block">Conexiones Cruzadas como Cards</span>
                    <span className="text-[10.5px] opacity-60 block">
                      Muestra enlaces entre nodos con acceso directo
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
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* F. ALINEACIÓN Y TAMAÑO DE TEXTO */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Alineación del Contenido</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setContentAlign('center')}
                    className={`py-1 rounded-lg text-xs flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                      contentAlign === 'center'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <AlignCenter className="w-3 h-3" /> Centro
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentAlign('left')}
                    className={`py-1 rounded-lg text-xs flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                      contentAlign === 'left'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <AlignLeft className="w-3 h-3" /> Izquierda
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1.5">Escala de Título</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/60">
                  {(['compact', 'normal', 'large'] as const).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontSizeScale(scale)}
                      className={`py-1 rounded-lg text-xs capitalize font-semibold transition-all cursor-pointer ${
                        fontSizeScale === scale
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {scale === 'compact' ? 'Compact' : scale === 'normal' ? 'Normal' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/40">
              <button
                type="button"
                onClick={() => {
                  if (onEditNode) onEditNode(currentNode.id);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Editar Mapa Completo</span>
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

      {/* 3. MAIN SLIDE CONTENT SPOTLIGHT */}
      <div
        className={`max-w-4xl mx-auto w-full py-6 sm:py-10 flex flex-col justify-center flex-1 transition-all ${
          contentAlign === 'center' ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        {/* Parent Breadcrumb if not root */}
        {parentNode && (
          <div className="text-sm font-medium opacity-60 mb-3 flex items-center gap-2">
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
          <div className="flex items-center gap-2 mb-4">
            {currentNode.icons.map((ic, i) => (
              <span key={i} className="scale-125">
                {renderNodeIcon(ic)}
              </span>
            ))}
          </div>
        )}

        {/* Image Attachment (Respects Image Size Setting) */}
        {currentNode.imageUrl && imageSize !== 'hidden' && (
          <div className="my-4 flex justify-center overflow-hidden rounded-2xl shadow-xl border border-white/10">
            <img
              src={currentNode.imageUrl}
              alt=""
              className={`rounded-2xl object-contain pointer-events-none transition-all ${getImageDimensions()}`}
            />
          </div>
        )}

        {/* Main Node Title Heading */}
        <h1
          style={{
            color: currentNode.textColor || undefined,
          }}
          className={`${getHeadingSizeClass()} font-bold tracking-tight mb-3 leading-tight whitespace-pre-wrap ${
            isRoot ? currentTheme.accentClass : ''
          }`}
        >
          {currentNode.text}
        </h1>

        {/* Node Body / Subtitle */}
        {currentNode.body && (
          <div
            style={{
              color: currentNode.bodyColor || undefined,
              fontWeight: currentNode.bodyBold ? 'bold' : 'normal',
              fontStyle: currentNode.bodyItalic ? 'italic' : 'normal',
            }}
            className="text-lg md:text-xl max-w-2xl mb-5 opacity-85 font-normal whitespace-pre-wrap leading-relaxed"
          >
            {currentNode.body}
          </div>
        )}

        {/* Progress and Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {currentNode.progress !== undefined && (
            <span className="px-3 py-1 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold">
              Progreso: {currentNode.progress}%
            </span>
          )}
          {currentNode.tags?.map((t) => (
            <span
              key={t}
              className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${
                isLight ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Presenter Notes (Respects showNotes Setting) */}
        {showNotes && currentNode.note && (
          <div
            className={`w-full max-w-2xl rounded-2xl p-5 text-left text-sm leading-relaxed shadow-xl border mb-6 ${currentTheme.cardBgClass} ${currentTheme.cardBorderClass}`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Notas del Presentador (Markdown)</span>
            </div>
            <MarkdownView content={currentNode.note} isDark={!isLight} />
          </div>
        )}

        {/* Child Nodes as Cards (Respects showChildrenCards Setting) */}
        {showChildrenCards && childNodes.length > 0 && (
          <div className="w-full max-w-3xl mb-6 text-left">
            <div className="flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-wider mb-2.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>Subtemas / Nodos Hijos ({childNodes.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {childNodes.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleJumpToNode(child.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-lg ${currentTheme.cardBgClass} ${currentTheme.cardBorderClass} hover:border-blue-500`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {child.icons && child.icons.length > 0 ? (
                      <span className="shrink-0">{renderNodeIcon(child.icons[0])}</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">
                      {child.text}
                    </h4>
                  </div>
                  {child.body && (
                    <p className="text-[11px] opacity-60 line-clamp-2 leading-relaxed">
                      {child.body}
                    </p>
                  )}
                  {child.note && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-2">
                      <FileText className="w-3 h-3" /> Nota adjunta
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross Connectors as Cards (Respects showConnectorsCards Setting) */}
        {showConnectorsCards && relatedConnectors.length > 0 && (
          <div className="w-full max-w-3xl mb-4 text-left">
            <div className="flex items-center gap-2 text-xs font-bold opacity-60 uppercase tracking-wider mb-2.5">
              <Network className="w-3.5 h-3.5 text-pink-400" />
              <span>Conexiones y Enlaces Cruzados ({relatedConnectors.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedConnectors.map((conn) => {
                const isSource = conn.fromNodeId === currentNode.id;
                const targetId = isSource ? conn.toNodeId : conn.fromNodeId;
                const targetNode = mindMap.nodes[targetId];
                if (!targetNode) return null;

                return (
                  <div
                    key={conn.id}
                    onClick={() => handleJumpToNode(targetId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group hover:scale-102 hover:shadow-lg flex items-center justify-between gap-3 ${currentTheme.cardBgClass} ${currentTheme.cardBorderClass} hover:border-pink-500`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-pink-400 mb-0.5">
                        <span>{isSource ? 'Conecta hacia ➔' : 'Recibe de ⬅'}</span>
                        {conn.label && <span className="opacity-80 italic truncate">"{conn.label}"</span>}
                      </div>
                      <h4 className="text-xs font-bold truncate group-hover:text-pink-300 transition-colors">
                        {targetNode.text}
                      </h4>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM NAVIGATION BAR */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full shrink-0">
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
            isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs px-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-blue-500'
                  : isLight
                  ? 'w-2 bg-slate-300 hover:bg-slate-400'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          disabled={currentIndex === slides.length - 1}
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg shadow-blue-900/40 cursor-pointer"
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
