import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { MindMap, CalculatedNodeLayout, MindMapTheme } from '../types/mindmap';
import { ZoomControls } from './molecules/ZoomControls';
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
      {/* MiniMap Canvas Card (Toggleable & Ultra-Crystal Glassmorphism) */}
      {showMiniMap && layoutMap.size > 0 && (
        <div
          style={{
            borderColor: 'rgba(226, 232, 240, 0.85)',
            borderWidth: '1px',
            borderStyle: 'solid',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          }}
          className={`backdrop-blur-md hover:bg-white/90 p-2 rounded-2xl ${sizeConfig.cardWidth} flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 group opacity-85 hover:opacity-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1 py-0.5 mb-1.5 text-slate-500 gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider truncate">
                MiniMapa
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Size Selector (S / M / L) */}
              <div
                style={{
                  borderColor: 'rgba(226, 232, 240, 0.9)',
                  backgroundColor: 'rgba(241, 245, 249, 0.8)',
                }}
                className="flex items-center p-0.5 rounded-lg border text-[9px] font-bold font-mono"
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
                          : 'text-slate-600 hover:text-slate-900'
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
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map View Area */}
          <div
            style={{
              borderColor: 'rgba(226, 232, 240, 0.85)',
              backgroundColor: 'rgba(248, 250, 252, 0.65)',
            }}
            className={`relative w-full ${sizeConfig.svgHeight} rounded-xl border overflow-hidden shadow-inner cursor-crosshair transition-all duration-200`}
          >
            <svg
              ref={svgRef}
              className="w-full h-full"
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              onClick={handleMiniMapClick}
              onMouseMove={handleMouseMove}
            >
              {/* Radar Background fill */}
              <rect
                x={bounds.minX}
                y={bounds.minY}
                width={bounds.maxX - bounds.minX}
                height={bounds.maxY - bounds.minY}
                fill="#0f172a"
              />

              {/* Connecting Tree Edges */}
              <g id="minimap-edges">
                {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
                  const childNode = mindMap.nodes[childLayout.id];
                  if (!childNode || !childNode.parentId) return null;

                  const parentLayout = layoutMap.get(childNode.parentId);
                  if (!parentLayout) return null;

                  const branchColor =
                    childNode.edgeColor ||
                    theme.branchColors[childLayout.branchIndex % theme.branchColors.length] ||
                    '#38bdf8';

                  // Calculate anchor points based on node side for organic curved paths
                  let pathData = '';
                  if (childLayout.side === 'left') {
                    const startX = parentLayout.x;
                    const startY = parentLayout.y + parentLayout.height / 2;
                    const endX = childLayout.x + childLayout.width;
                    const endY = childLayout.y + childLayout.height / 2;
                    const midX = (startX + endX) / 2;
                    pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                  } else if (childLayout.side === 'bottom') {
                    const startX = parentLayout.x + parentLayout.width / 2;
                    const startY = parentLayout.y + parentLayout.height;
                    const endX = childLayout.x + childLayout.width / 2;
                    const endY = childLayout.y;
                    const midY = (startY + endY) / 2;
                    pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                  } else if (childLayout.side === 'top') {
                    const startX = parentLayout.x + parentLayout.width / 2;
                    const startY = parentLayout.y;
                    const endX = childLayout.x + childLayout.width / 2;
                    const endY = childLayout.y + childLayout.height;
                    const midY = (startY + endY) / 2;
                    pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                  } else {
                    // Standard right-side branch, root, radial or circular
                    const startX = parentLayout.x + parentLayout.width;
                    const startY = parentLayout.y + parentLayout.height / 2;
                    const endX = childLayout.x;
                    const endY = childLayout.y + childLayout.height / 2;
                    const midX = (startX + endX) / 2;
                    pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                  }

                  return (
                    <path
                      key={`mm-edge-${childNode.parentId}-${childNode.id}`}
                      d={pathData}
                      fill="none"
                      stroke={branchColor}
                      strokeWidth={childLayout.depth === 1 ? 3 : 2}
                      strokeOpacity={childLayout.depth === 1 ? 0.95 : 0.75}
                      strokeLinecap="round"
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

                  // Minimum legible width & height for child nodes
                  const minW = isRoot ? 50 : l.depth === 1 ? 36 : 24;
                  const minH = isRoot ? 30 : l.depth === 1 ? 20 : 16;
                  const renderW = Math.max(l.width, minW);
                  const renderH = Math.max(l.height, minH);
                  const renderX = l.x - (renderW - l.width) / 2;
                  const renderY = l.y - (renderH - l.height) / 2;

                  const branchColor = theme.branchColors[l.branchIndex % theme.branchColors.length] || '#38bdf8';

                  // Always vibrant, solid color fill
                  let nodeFill = node?.color;
                  if (!nodeFill || nodeFill === '#ffffff' || nodeFill === '#f8fafc') {
                    if (isRoot) {
                      nodeFill = '#3b82f6';
                    } else {
                      nodeFill = branchColor;
                    }
                  }

                  // Border stroke for crisp radar look
                  const nodeStroke = isSelected
                    ? '#fbbf24'
                    : '#ffffff';

                  const strokeW = isSelected ? 4 : isRoot ? 3 : 2;

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
                      className="cursor-pointer group"
                    >
                      <rect
                        x={renderX}
                        y={renderY}
                        width={renderW}
                        height={renderH}
                        rx={isRoot ? 8 : l.depth === 1 ? 6 : 4}
                        fill={nodeFill}
                        stroke={nodeStroke}
                        strokeWidth={strokeW}
                      />
                      {/* Highlight dot if node has folded children */}
                      {node?.folded && node?.children && node.children.length > 0 && (
                        <circle
                          cx={renderX + renderW - 2}
                          cy={renderY + 2}
                          r={4}
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      )}
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
                fill="rgba(56, 189, 248, 0.2)"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6 3"
                rx="6"
                className="cursor-move hover:fill-sky-400/30 transition-colors"
                onMouseDown={handleViewportMouseDown}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Zoom Controls HUD (Placed UNDER the minimap) */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
        onFitToScreen={onFitView}
        onToggleMiniMap={onToggleMiniMap}
        showMiniMap={showMiniMap}
      />
    </div>
  );
};

