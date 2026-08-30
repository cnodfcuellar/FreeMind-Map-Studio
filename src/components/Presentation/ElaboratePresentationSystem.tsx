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
    if (mindMap.elaborateSlides && mindMap.elaborateSlides.length > 0) {
      return mindMap.elaborateSlides;
    }
    return generateDefaultSpatialSlides(mindMap, 'spiral');
  }, [mindMap]);

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
  const [transformStartPos, setTransformStartPos] = useState<{ mouseX: number; mouseY: number; cardX: number; cardY: number; cardRot: number; cardW: number; cardH: number } | null>(null);

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
      const cardW = card.spatial.width * cardScale;
      const cardH = card.spatial.height * cardScale;

      const targetZoom = Math.min(Math.max(Math.min((vw * 0.88) / cardW, (vh * 0.82) / cardH), 0.3), 2.5);
      const targetRot = -card.spatial.rotation; // Inverse rotation to align horizontally

      const centerX = card.spatial.x + cardW / 2;
      const centerY = card.spatial.y + cardH / 2;

      setCamZoom(targetZoom);
      setCamRotation(targetRot);
      setCamPan({
        x: vw / 2 - centerX * targetZoom,
        y: vh / 2 - centerY * targetZoom,
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

  // Board Mouse Drag (Pan the whole infinite board)
  const handleBoardMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    setIsPanningBoard(true);
    setBoardPanStart({ x: e.clientX - camPan.x, y: e.clientY - camPan.y });
    setSelectedSlideId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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

      const dx = (e.clientX - transformStartPos.mouseX) / camZoom;
      const dy = (e.clientY - transformStartPos.mouseY) / camZoom;

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
        const screenCardX = cardCenterX * camZoom + camPan.x;
        const screenCardY = cardCenterY * camZoom + camPan.y;

        const rad = Math.atan2(e.clientY - screenCardY, e.clientX - screenCardX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        deg = (deg + 360) % 360;

        const updated = slides.map((s) =>
          s.id === transformingCardId
            ? { ...s, spatial: { ...s.spatial, rotation: deg } }
            : s
        );
        setSlides(updated);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanningBoard(false);
    setBoardPanStart(null);
    if (transformingCardId) {
      saveSlides(slides);
      setTransformingCardId(null);
      setTransformMode(null);
      setTransformStartPos(null);
    }
  };

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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing bg-radial from-slate-900 via-slate-950 to-black"
      >
        {/* Spatial Camera Viewport with Inverse Prezi Matrix Transformation */}
        <div
          style={{
            transform: `translate3d(${camPan.x}px, ${camPan.y}px, 0) scale(${camZoom}) rotate(${camRotation}deg)`,
            transformOrigin: '0 0',
            transition: isPresenterMode && !isPanningBoard ? 'transform 850ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
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
                onSelect={() => {
                  setSelectedSlideId(card.id);
                  setCurrentSlideIndex(idx);
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
                  });
                }}
                onStartResize={(e) => {
                  e.stopPropagation();
                  setSelectedSlideId(card.id);
                  setTransformingCardId(card.id);
                  setTransformMode('resize');
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
                    if (isPresenterMode) {
                      flyCameraToSlide(s);
                    }
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
