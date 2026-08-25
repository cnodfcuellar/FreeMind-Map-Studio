import React from 'react';

interface StatusBarProps {
  totalNodes: number;
  selectedNodeText: string | null;
  selectedNodeId: string | null;
  zoom?: number;
  positionX?: number;
  positionY?: number;
  mode?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalNodes,
  selectedNodeText,
  selectedNodeId,
  zoom = 100,
  positionX = 0,
  positionY = 0,
  mode = 'Listo',
}) => {
  return (
    <div className="h-6 bg-slate-900 text-slate-400 px-3 flex items-center gap-4 z-30 shrink-0 select-none border-t border-slate-800 text-[10px] sm:text-xs">
      <div>
        Nodos totales: <span className="text-slate-200">{totalNodes}</span>
      </div>
      <div className="w-px h-3 bg-slate-700" />
      <div className="truncate max-w-[200px] sm:max-w-md">
        Seleccionado:{' '}
        <span className="text-slate-200">
          {selectedNodeText ? `"${selectedNodeText}"` : 'Ninguno'}
        </span>{' '}
        {selectedNodeId && (
          <span className="text-slate-500">(ID: {selectedNodeId})</span>
        )}
      </div>
      <div className="w-px h-3 bg-slate-700 hidden sm:block" />
      <div className="hidden sm:block">
        Zoom: <span className="text-slate-200">{zoom}%</span>
      </div>
      <div className="w-px h-3 bg-slate-700 hidden sm:block" />
      <div className="hidden sm:block">
        Posición: <span className="text-slate-200">(X: {positionX}, Y: {positionY})</span>
      </div>
      <div className="w-px h-3 bg-slate-700 hidden sm:block" />
      <div className="hidden sm:block">
        Modo: <span className="text-slate-200">{mode}</span>
      </div>
    </div>
  );
};
