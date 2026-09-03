import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Compass } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';

export interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen?: () => void;
  onToggleMiniMap?: () => void;
  showMiniMap?: boolean;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onToggleMiniMap,
  showMiniMap,
  className = '',
}) => {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div
      className={`flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-lg shadow-slate-900/5 select-none ${className}`}
    >
      {onToggleMiniMap && (
        <>
          <IconButton
            icon={<Compass className="w-4 h-4" />}
            tooltip={showMiniMap ? 'Ocultar MiniMapa' : 'Mostrar MiniMapa'}
            onClick={onToggleMiniMap}
            size="sm"
            rounded="xl"
            className={showMiniMap ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold' : 'text-slate-600'}
          />
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 my-auto mx-0.5" />
        </>
      )}

      <IconButton
        icon={<ZoomOut className="w-3.5 h-3.5" />}
        tooltip="Reducir zoom (Ctrl + -)"
        onClick={onZoomOut}
        size="sm"
        rounded="xl"
      />
      <button
        type="button"
        onClick={onResetZoom}
        title="Restablecer zoom al 100% (Ctrl + 0)"
        className="px-2 py-0.5 text-xs font-bold font-mono text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800 rounded-lg transition-colors tabular-nums cursor-pointer"
      >
        {zoomPercentage}%
      </button>
      <IconButton
        icon={<ZoomIn className="w-3.5 h-3.5" />}
        tooltip="Aumentar zoom (Ctrl + +)"
        onClick={onZoomIn}
        size="sm"
        rounded="xl"
      />
      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 my-auto mx-0.5" />
      {onFitToScreen && (
        <IconButton
          icon={<Maximize2 className="w-3.5 h-3.5" />}
          tooltip="Ajustar y centrar todo el mapa"
          onClick={onFitToScreen}
          size="sm"
          rounded="xl"
        />
      )}
    </div>
  );
};

