import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface PresentationControlsProps {
  currentSlideIndex: number;
  totalSlides: number;
  hasJumpHistory: boolean;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onJumpBack: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({
  currentSlideIndex,
  totalSlides,
  hasJumpHistory,
  onPrevSlide,
  onNextSlide,
  onJumpBack,
  onOpenSettings,
  onClose,
}) => {
  return (
    <footer className="shrink-0 px-8 py-3.5 flex items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-md z-20 select-none">
      {/* Botón Salir y Configuración */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Salir (Esc)</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Opciones de tema y presentación"
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {hasJumpHistory && (
          <button
            type="button"
            onClick={onJumpBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold transition-all cursor-pointer shadow-md animate-pulse"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            <span>Volver (⌫)</span>
          </button>
        )}
      </div>

      {/* Indicador de diapositiva actual */}
      <div className="text-xs font-semibold text-white/80">
        Diapositiva <span className="text-white font-bold">{currentSlideIndex + 1}</span> de{' '}
        <span className="text-white font-bold">{totalSlides}</span>
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPrevSlide}
          disabled={currentSlideIndex === 0}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors cursor-pointer"
          title="Anterior (←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onNextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold transition-colors cursor-pointer shadow-md"
          title="Siguiente (→ o Espacio)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};
