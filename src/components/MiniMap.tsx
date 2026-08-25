import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { MindMap, CalculatedNodeLayout, MindMapTheme } from '../types/mindmap';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  ChevronDown,
} from 'lucide-react';

export type MiniMapSize = 'compact' | 'medium' | 'large';

interface MiniMapProps {
  mindMap: MindMap;
  layoutMap: Map<string, CalculatedNodeLayout>;
  theme: MindMapTheme;
  pan: { x: number; y: number };
  zoom: number;
  containerWidth: number;
  containerHeight: number;
  selectedNodeId: string | null;
  showMiniMap: boolean;
  onPanChange: (newPan: { x: number; y: number }) => void;
  onSelectNode?: (id: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  onToggleMiniMap: () => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  mindMap,
  layoutMap,
  theme,
  pan,
  zoom,
  containerWidth,
  containerHeight,
  selectedNodeId,
  showMiniMap,
  onPanChange,
  onSelectNode,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onToggleMiniMap,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);

  // Size option for minimap: 'compact' (Pequeño), 'medium' (Mediano), 'large' (Grande)
  const [size, setSize] = useState<MiniMapSize>(() => {
    try {
      const saved = localStorage.getItem('mindmap_minimap_size');
      if (saved === 'compact' || saved === 'medium' || saved === 'large') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'compact';
  });

  const handleSizeChange = (newSize: MiniMapSize) => {
    setSize(newSize);
    try {
      localStorage.setItem('mindmap_minimap_size', newSize);
    } catch {
      // ignore
    }
  };

  // Dimensions based on size choice
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'compact':
        return {
          cardWidth: 'w-44',
          svgHeight: 'h-24',
          label: 'S',
        };
      case 'large':
        return {
          cardWidth: 'w-72',
          svgHeight: 'h-44',
          label: 'L',
        };
      case 'medium':
      default:
        return {
          cardWidth: 'w-56',
          svgHeight: 'h-32',
          label: 'M',
        };
    }
  }, [size]);

  // Compute bounding box encompassing all nodes + current viewport
  const { viewBox, bounds, viewportRect } = useMemo(() => {
    if (layoutMap.size === 0 || containerWidth <= 0 || containerHeight <= 0) {
      return {
        viewBox: '-400 -300 800 600',
        bounds: { minX: -400, maxX: 400, minY: -300, maxY: 300 },
        viewportRect: { x: 0, y: 0, width: 100, height: 100 },
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    (Array.from(layoutMap.values()) as CalculatedNodeLayout[]).forEach((l) => {
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x + l.width);
      minY = Math.min(minY, l.y);
      maxY = Math.max(maxY, l.y + l.height);
    });

    // Current viewport in map space
    const vpX = (0 - pan.x) / zoom;
    const vpY = (0 - pan.y) / zoom;
    const vpW = containerWidth / zoom;
    const vpH = containerHeight / zoom;

    // Expand bounds to include both nodes and current viewport
    const totalMinX = Math.min(minX - 60, vpX - 40);
    const totalMaxX = Math.max(maxX + 60, vpX + vpW + 40);
    const totalMinY = Math.min(minY - 60, vpY - 40);
    const totalMaxY = Math.max(maxY + 60, vpY + vpH + 40);

    const width = totalMaxX - totalMinX;
    const height = totalMaxY - totalMinY;

    return {
      viewBox: `${totalMinX} ${totalMinY} ${width} ${height}`,
      bounds: { minX: totalMinX, maxX: totalMaxX, minY: totalMinY, maxY: totalMaxY },
      viewportRect: { x: vpX, y: vpY, width: vpW, height: vpH },
    };
  }, [layoutMap, containerWidth, containerHeight, pan, zoom]);

  // Convert client coordinates from mouse event to map space coordinates
  const getMapCoordinatesFromEvent = useCallback(
    (e: React.MouseEvent<SVGSVGElement | HTMLDivElement>) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const normX = Math.max(0, Math.min(1, clickX / rect.width));
      const normY = Math.max(0, Math.min(1, clickY / rect.height));

      const mapWidth = bounds.maxX - bounds.minX;
      const mapHeight = bounds.maxY - bounds.minY;

      const mapX = bounds.minX + normX * mapWidth;
      const mapY = bounds.minY + normY * mapHeight;

      return { mapX, mapY };
    },
    [bounds]
  );

  // Center canvas pan on clicked map point
  const handleMiniMapClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const coords = getMapCoordinatesFromEvent(e);
      if (!coords) return;

      const newPanX = containerWidth / 2 - coords.mapX * zoom;
      const newPanY = containerHeight / 2 - coords.mapY * zoom;

      onPanChange({ x: newPanX, y: newPanY });
    },
    [getMapCoordinatesFromEvent, containerWidth, containerHeight, zoom, onPanChange]
  );

  // Start dragging viewport on minimap
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingViewport(true);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDraggingViewport) return;
      const coords = getMapCoordinatesFromEvent(e);
      if (!coords) return;

      const newPanX = containerWidth / 2 - coords.mapX * zoom;
      const newPanY = containerHeight / 2 - coords.mapY * zoom;

      onPanChange({ x: newPanX, y: newPanY });
    },
    [isDraggingViewport, getMapCoordinatesFromEvent, containerWidth, containerHeight, zoom, onPanChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingViewport(false);
  }, []);

  return (
    <div
      className="absolute bottom-5 right-5 z-40 flex flex-col items-end gap-2 select-none pointer-events-auto"
      onMouseUp={handleMouseUp}
    >
      {/* MiniMap Canvas Card (Toggleable) */}
      {showMiniMap && layoutMap.size > 0 && (
        <div
          className={`bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl ${sizeConfig.cardWidth} flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 py-0.5 mb-1.5 text-slate-500 gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider truncate">
                MiniMapa
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Size Selector (S / M / L) */}
              <div
                className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-[9px] font-bold font-mono"
                title="Tamaño del MiniMapa"
              >
                {(['compact', 'medium', 'large'] as MiniMapSize[]).map((s) => {
                  const label = s === 'compact' ? 'S' : s === 'medium' ? 'M' : 'L';
                  const isCurrent = size === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleSizeChange(s)}
                      title={`Tamaño ${s === 'compact' ? 'Pequeño' : s === 'medium' ? 'Mediano' : 'Grande'}`}
                      className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white text-blue-600 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Minimize / Close */}
              <button
                onClick={onToggleMiniMap}
                title="Minimizar MiniMapa"
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map View Area */}
          <div
            className={`relative w-full ${sizeConfig.svgHeight} bg-slate-50/80 rounded-xl border border-slate-200/80 overflow-hidden shadow-inner cursor-crosshair transition-all duration-200`}
          >
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              onClick={handleMiniMapClick}
              onMouseMove={handleMouseMove}
            >
              {/* Background fill */}
              <rect
                x={bounds.minX}
                y={bounds.minY}
                width={bounds.maxX - bounds.minX}
                height={bounds.maxY - bounds.minY}
                fill={mindMap.backgroundColor || theme.background || '#f8fafc'}
              />

              {/* Connecting Tree Edges */}
              <g id="minimap-edges">
                {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
                  const childNode = mindMap.nodes[childLayout.id];
                  if (!childNode || !childNode.parentId) return null;

                  const parentLayout = layoutMap.get(childNode.parentId);
                  if (!parentLayout) return null;

                  const x1 = parentLayout.x + parentLayout.width / 2;
                  const y1 = parentLayout.y + parentLayout.height / 2;
                  const x2 = childLayout.x + childLayout.width / 2;
                  const y2 = childLayout.y + childLayout.height / 2;

                  const branchColor =
                    childNode.edgeColor ||
                    theme.branchColors[childLayout.branchIndex % theme.branchColors.length] ||
                    '#3b82f6';

                  return (
                    <line
                      key={`mm-edge-${childNode.parentId}-${childNode.id}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={branchColor}
                      strokeWidth={childLayout.depth === 1 ? 3 : 1.5}
                      strokeOpacity="0.75"
                    />
                  );
                })}
              </g>

              {/* Nodes */}
              <g id="minimap-nodes">
                {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((l) => {
                  const node = mindMap.nodes[l.id];
                  const isSelected = selectedNodeId === l.id;
                  const isRoot = l.depth === 0;

                  const nodeColor =
                    node?.color ||
                    (isRoot
                      ? theme.rootBackground || '#2563eb'
                      : theme.branchColors[l.branchIndex % theme.branchColors.length] || '#64748b');

                  return (
                    <g
                      key={`mm-node-${l.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectNode) onSelectNode(l.id);
                        // Center on node
                        const newPanX = containerWidth / 2 - (l.x + l.width / 2) * zoom;
                        const newPanY = containerHeight / 2 - (l.y + l.height / 2) * zoom;
                        onPanChange({ x: newPanX, y: newPanY });
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x={l.x}
                        y={l.y}
                        width={l.width}
                        height={l.height}
                        rx={isRoot ? 8 : 4}
                        fill={nodeColor}
                        stroke={isSelected ? '#3b82f6' : isRoot ? '#1d4ed8' : '#ffffff'}
                        strokeWidth={isSelected ? 4 : 1.5}
                      />
                    </g>
                  );
                })}
              </g>

              {/* Viewport Indicator Rectangle (Current Visible Frame on Screen) */}
              <rect
                x={viewportRect.x}
                y={viewportRect.y}
                width={viewportRect.width}
                height={viewportRect.height}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                rx="4"
                className="cursor-move hover:fill-blue-500/25 transition-colors"
                onMouseDown={handleViewportMouseDown}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Zoom Controls HUD (Placed UNDER the minimap) */}
      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-200 shadow-xl text-slate-700">
        {/* Toggle MiniMap Button */}
        <button
          title={showMiniMap ? 'Ocultar MiniMapa' : 'Mostrar MiniMapa'}
          onClick={onToggleMiniMap}
          className={`p-1.5 rounded-xl transition-colors ${
            showMiniMap ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        {/* Zoom Out (-) */}
        <button
          title="Alejar Zoom (-)"
          onClick={onZoomOut}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom Percentage (Click to Reset 100%) */}
        <button
          title="Restablecer al 100%"
          onClick={onResetZoom}
          className="text-xs font-bold px-1.5 py-1 hover:bg-slate-100 rounded-lg min-w-12 text-center font-mono text-slate-800 transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom In (+) */}
        <button
          title="Acercar Zoom (+)"
          onClick={onZoomIn}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        {/* Center / Fit all */}
        <button
          title="Ajustar y Centrar todo el mapa"
          onClick={onFitView}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 hover:text-blue-600 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
