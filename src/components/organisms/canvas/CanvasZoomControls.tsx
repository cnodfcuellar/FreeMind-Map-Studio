import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
} from 'lucide-react';

interface CanvasZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onCenterView: () => void;
}

export const CanvasZoomControls: React.FC<CanvasZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onCenterView,
}) => {
  return (
    <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl p-1.5 shadow-lg select-none">
      <button
        type="button"
        onClick={onZoomOut}
        title="Reducir zoom"
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span className="text-xs font-semibold text-slate-700 min-w-[42px] text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={onZoomIn}
        title="Aumentar zoom"
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

      <button
        type="button"
        onClick={onFitView}
        title="Ajustar mapa al lienzo"
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onCenterView}
        title="Centrar en el nodo raíz"
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <Compass className="w-4 h-4" />
      </button>
    </div>
  );
};
