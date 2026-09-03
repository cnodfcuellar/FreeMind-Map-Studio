import React from 'react';
import { SlideFrame } from '../../../types/mindmap';
import { Crop } from 'lucide-react';

export interface CanvasDrawingOverlayProps {
  slides: SlideFrame[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  editorTool: 'navigate' | 'pick_nodes' | 'draw_frame';
  isDrawingFrame: boolean;
  drawStart: { x: number; y: number } | null;
  drawCurrent: { x: number; y: number } | null;
}

export const CanvasDrawingOverlay: React.FC<CanvasDrawingOverlayProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  editorTool,
  isDrawingFrame,
  drawStart,
  drawCurrent,
}) => {
  return (
    <div id="canvas-drawing-overlay-plane" className="absolute inset-0 pointer-events-none">
      {/* Existing Slide Frames (pointer-events-none so nodes underneath are ALWAYS clickable) */}
      {slides.map((slide, idx) => {
        const isSelected = idx === currentSlideIndex;
        // Stagger badge horizontal offset so duplicate/close bounds don't stack directly over each other
        const badgeLeftOffset = 16 + ((slide.order - 1) % 4) * 32;

        return (
          <div
            key={`editor-frame-${slide.id}`}
            style={{
              transform: `translate3d(${slide.bounds.x}px, ${slide.bounds.y}px, 0)`,
              width: slide.bounds.width,
              height: slide.bounds.height,
              zIndex: isSelected ? 30 : 15,
            }}
            className={`absolute top-0 left-0 rounded-3xl border-2 transition-all select-none pointer-events-none ${
              isSelected
                ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_35px_rgba(59,130,246,0.3)] ring-2 ring-blue-400/50'
                : 'border-dashed border-slate-500/40 bg-slate-800/5'
            }`}
          >
            {/* Slide Order Badge (Clickable to select this frame without blocking nodes) */}
            <div
              style={{ left: `${badgeLeftOffset}px` }}
              onClick={(e) => {
                if (editorTool === 'draw_frame') return;
                e.stopPropagation();
                onSelectSlide(idx);
              }}
              title={`Marco ${slide.order}: ${slide.title} (Clic para enfocar)`}
              className={`absolute -top-3.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-md flex items-center gap-1 transition-all ${
                editorTool === 'draw_frame'
                  ? 'pointer-events-none'
                  : 'pointer-events-auto cursor-pointer hover:scale-105 active:scale-95'
              } ${
                isSelected
                  ? 'bg-blue-600 text-white scale-105 ring-2 ring-white/60 z-40'
                  : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 z-20'
              }`}
            >
              <span>Slide {slide.order}</span>
              {(isSelected || slides.length <= 8) && (
                <span className="opacity-80 max-w-[140px] truncate">• {slide.title}</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Drawn Box in Progress */}
      {editorTool === 'draw_frame' && isDrawingFrame && drawStart && drawCurrent && (
        <div
          style={{
            transform: `translate3d(${Math.min(drawStart.x, drawCurrent.x)}px, ${Math.min(drawStart.y, drawCurrent.y)}px, 0)`,
            width: Math.abs(drawCurrent.x - drawStart.x),
            height: Math.abs(drawCurrent.y - drawStart.y),
            zIndex: 40,
          }}
          className="absolute top-0 left-0 rounded-2xl border-2 border-blue-400 bg-blue-500/20 pointer-events-none border-dashed shadow-[0_0_25px_rgba(59,130,246,0.4)]"
        >
          <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] shadow-lg flex items-center gap-1">
            <Crop className="w-3 h-3" />
            <span>Nuevo marco ({Math.round(Math.abs(drawCurrent.x - drawStart.x))} × {Math.round(Math.abs(drawCurrent.y - drawStart.y))})</span>
          </div>
        </div>
      )}
    </div>
  );
};
