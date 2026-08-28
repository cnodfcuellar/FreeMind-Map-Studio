import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  MindMap,
  MindNode,
  CalculatedNodeLayout,
  MindMapTheme,
  Connector,
} from '../types/mindmap';
import {
  computeMindMapLayout,
  generateEdgePath,
  generateRibbonEdgePath,
  computeCloudBounds,
} from '../utils/layoutEngine';
import { NodeComponent } from './NodeComponent';
import { MiniMap } from './MiniMap';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Link,
  Cloud,
  CheckSquare,
  Copy,
  Scissors,
  Clipboard,
} from 'lucide-react';
import { calculateConnectorGeometry } from '../utils/connectorUtils';

interface MindMapCanvasProps {
  mindMap: MindMap;
  theme: MindMapTheme;
  selectedNodeId: string | null;
  editingNodeId: string | null;
  searchMatches?: Set<string>;
  onSelectNode: (id: string | null) => void;
  onStartEditing: (id: string) => void;
  onFinishEditing: () => void;
  onUpdateNodeText: (id: string, text: string) => void;
  onAddChildNode: (parentId: string) => void;
  onAddSiblingNode: (siblingId: string) => void;
  onDeleteNode: (id: string) => void;
  onToggleFoldNode: (id: string) => void;
  onReparentNode: (draggedId: string, targetParentId: string) => void;
  onOpenNotePanel: (id: string) => void;
  onOpenConnectorModal: (fromId: string) => void;
  onToggleCloud: (nodeId: string) => void;
  onCopyNode: (id: string) => void;
  onCutNode: (id: string) => void;
  onPasteNode: (targetParentId: string) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<Connector>) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  mindMap,
  theme,
  selectedNodeId,
  editingNodeId,
  searchMatches,
  onSelectNode,
  onStartEditing,
  onFinishEditing,
  onUpdateNodeText,
  onAddChildNode,
  onAddSiblingNode,
  onDeleteNode,
  onToggleFoldNode,
  onReparentNode,
  onOpenNotePanel,
  onOpenConnectorModal,
  onToggleCloud,
  onCopyNode,
  onCutNode,
  onPasteNode,
  onUpdateConnector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drag & Drop Node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);

  // Connector Interactive State
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [hoveredConnectorId, setHoveredConnectorId] = useState<string | null>(null);
  const [draggingConnectorId, setDraggingConnectorId] = useState<string | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: null,
  });

  // Mini-map toggle
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  // Container dimensions for responsive minimap calculations
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Center canvas on initial load
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    }
  }, []);

  // Compute Layout of all nodes
  const layoutMap = React.useMemo(() => {
    return computeMindMapLayout(mindMap, { x: 0, y: 0 });
  }, [mindMap]);

  // Fit View / Center Function
  const handleFitView = useCallback(() => {
    if (!containerRef.current || layoutMap.size === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
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

    const mapWidth = maxX - minX + 160;
    const mapHeight = maxY - minY + 160;

    const scaleX = rect.width / mapWidth;
    const scaleY = rect.height / mapHeight;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.35), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - centerX * newZoom,
      y: rect.height / 2 - centerY * newZoom,
    });
  }, [layoutMap]);

  // Handle Pan & Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target === containerRef.current || (e.target as HTMLElement).id === 'svg-edges-layer' || (e.target as HTMLElement).id === 'canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
      setSelectedConnectorId(null);
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingConnectorId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;
      if (onUpdateConnector) {
        onUpdateConnector(draggingConnectorId, {
          controlPoint: { x: Math.round(canvasX), y: Math.round(canvasY) },
        });
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    if (draggedNodeId) {
      // Find element under cursor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = el?.closest('[id^="node-"]');
      if (nodeEl) {
        const id = nodeEl.id.replace('node-', '');
        if (id !== draggedNodeId) {
          setDragOverNodeId(id);
          return;
        }
      }
      setDragOverNodeId(null);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    if (draggingConnectorId) {
      setDraggingConnectorId(null);
    }

    if (draggedNodeId && dragOverNodeId && draggedNodeId !== dragOverNodeId) {
      onReparentNode(draggedNodeId, dragOverNodeId);
    }
    setDraggedNodeId(null);
    setDragOverNodeId(null);
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 2.5);

    // Zoom towards mouse pointer
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Right Click Context Menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const nodeEl = target.closest('[id^="node-"]');
    const nodeId = nodeEl ? nodeEl.id.replace('node-', '') : null;

    if (nodeId) {
      onSelectNode(nodeId);
    }

    // Auto-adjust position so menu never gets cut off at bottom or right screen edges
    const estimatedMenuWidth = 240;
    const estimatedMenuHeight = 360;
    const padding = 12;

    let posX = e.clientX;
    let posY = e.clientY;

    if (posX + estimatedMenuWidth > window.innerWidth - padding) {
      posX = Math.max(padding, window.innerWidth - estimatedMenuWidth - padding);
    }

    if (posY + estimatedMenuHeight > window.innerHeight - padding) {
      // Shift upwards above click position or clamp to bottom edge
      posY = Math.max(padding, window.innerHeight - estimatedMenuHeight - padding);
    }

    setContextMenu({
      visible: true,
      x: posX,
      y: posY,
      nodeId,
    });
  };

  // Close context menu on global click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.visible) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  // Determine Branch Color for an edge
  const getBranchColor = (childLayout: CalculatedNodeLayout): string => {
    const colors = theme.branchColors;
    return colors[childLayout.branchIndex % colors.length] || '#3b82f6';
  };

  // Background style values (override from mindMap if set, else from theme)
  const effectiveBgColor = mindMap.backgroundColor || theme.background || '#f8fafc';
  const effectivePattern = mindMap.backgroundPattern || theme.backgroundPattern || 'dots';
  const effectivePatternColor = mindMap.backgroundPatternColor || theme.backgroundPatternColor || '#94a3b8';
  const effectivePatternSize = mindMap.backgroundPatternSize || theme.backgroundPatternSize || 24;
  const effectivePatternOpacity = mindMap.backgroundPatternOpacity ?? theme.backgroundPatternOpacity ?? 0.45;

  // Triangular & Hexagonal geometry calculations
  const triangleW = effectivePatternSize;
  const triangleH = effectivePatternSize * 1.7320508;
  const triangleH2 = triangleH / 2;
  const triangleW2 = triangleW / 2;

  const hexW = effectivePatternSize;
  const hexH = effectivePatternSize * 1.7320508;
  const hexW2 = hexW / 2;
  const hexH6 = effectivePatternSize * 0.28867513;
  const hexH2 = effectivePatternSize * 0.8660254;
  const hexH3 = effectivePatternSize * 1.1547005;

  const renderConnector = (conn: Connector, isTopLayer = false) => {
    const fromLayout = layoutMap.get(conn.fromId);
    const toLayout = layoutMap.get(conn.toId);
    if (!fromLayout || !toLayout) return null;

    const x1 = fromLayout.x + fromLayout.width / 2;
    const y1 = fromLayout.y + fromLayout.height / 2;
    const x2 = toLayout.x + toLayout.width / 2;
    const y2 = toLayout.y + toLayout.height / 2;

    const geom = calculateConnectorGeometry(x1, y1, x2, y2, conn);
    const isHovered = hoveredConnectorId === conn.id;
    const isSelected = selectedConnectorId === conn.id;
    const isDraggingThis = draggingConnectorId === conn.id;
    const showHandle = isHovered || isSelected || isDraggingThis;

    const strokeColor = conn.color || '#3b82f6';
    const strokeWidth = conn.width || 2;
    const opacity = conn.opacity !== undefined ? conn.opacity : 1;

    const connectorDash =
      conn.style === 'dashed'
        ? '8 6'
        : conn.style === 'dotted'
        ? '2 5'
        : undefined;

    const arrowMode = conn.arrow || 'end';
    const hasEndArrow = arrowMode === 'end' || arrowMode === 'both';
    const hasStartArrow = arrowMode === 'start' || arrowMode === 'both';

    const endMarkerUrl = isTopLayer ? 'url(#top-connector-arrow-end)' : 'url(#connector-arrow-end)';
    const startMarkerUrl = isTopLayer ? 'url(#top-connector-arrow-start)' : 'url(#connector-arrow-start)';

    return (
      <g
        key={conn.id}
        className="cursor-pointer pointer-events-auto"
        onMouseEnter={() => setHoveredConnectorId(conn.id)}
        onMouseLeave={() => {
          if (!isDraggingThis) setHoveredConnectorId(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedConnectorId(conn.id);
        }}
      >
        {/* Broad invisible hit area for easy click/hover */}
        <path
          d={geom.pathD}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
        />

        {/* Highlight halo when selected or hovered */}
        {(isSelected || isHovered) && (
          <path
            d={geom.pathD}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 5}
            strokeOpacity="0.25"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Main Connector Path */}
        <path
          d={geom.pathD}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          opacity={opacity}
          strokeDasharray={connectorDash}
          strokeLinecap="round"
          fill="none"
          markerEnd={hasEndArrow ? endMarkerUrl : undefined}
          markerStart={hasStartArrow ? startMarkerUrl : undefined}
        />

        {/* Text Label with readable background halo */}
        {conn.label && (
          <text
            x={geom.labelX}
            y={geom.labelY}
            textAnchor="middle"
            opacity={opacity}
            className="text-xs font-semibold fill-slate-800 select-none pointer-events-none"
            style={{
              fontSize: '11px',
              paintOrder: 'stroke fill',
              stroke: '#ffffff',
              strokeWidth: '4px',
              strokeLinejoin: 'round',
            }}
          >
            {conn.label}
          </text>
        )}

        {/* Interactive Control Point Guide and Handle */}
        {showHandle && (
          <g className="cursor-grab active:cursor-grabbing">
            {/* Dashed guide line from midpoint to control point */}
            <line
              x1={geom.midX}
              y1={geom.midY}
              x2={geom.cpX}
              y2={geom.cpY}
              stroke={strokeColor}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />

            {/* Control Point Circle Handle */}
            <circle
              cx={geom.cpX}
              cy={geom.cpY}
              r={isDraggingThis ? 8 : 6}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2.5"
              className="transition-transform hover:scale-125 shadow-md"
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggingConnectorId(conn.id);
                setSelectedConnectorId(conn.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onUpdateConnector) {
                  onUpdateConnector(conn.id, {
                    controlPoint: undefined,
                    curvature: -50,
                  });
                }
              }}
            >
              <title>Arrastra para curvar o doble clic para restablecer</title>
            </circle>
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      id="canvas-background"
      style={{ backgroundColor: effectiveBgColor }}
      className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    >
      {/* Viewport Transform Container */}
      <div
        id="canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        {/* SVG Rendering Layer for Background Patterns, Edges, Clouds and Connectors */}
        <svg
          id="svg-edges-layer"
          className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Arrowhead marker for connectors (End) */}
            <marker
              id="connector-arrow-end"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="context-stroke" />
            </marker>

            {/* Arrowhead marker for connectors (Start) */}
            <marker
              id="connector-arrow-start"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="context-stroke" />
            </marker>

            {/* Fallback marker */}
            <marker
              id="connector-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
            </marker>

            {/* Pattern 1: Dots (Puntos) */}
            {effectivePattern === 'dots' && (
              <pattern
                id="canvas-bg-pattern"
                width={effectivePatternSize}
                height={effectivePatternSize}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx={effectivePatternSize / 2}
                  cy={effectivePatternSize / 2}
                  r={1.5}
                  fill={effectivePatternColor}
                  fillOpacity={effectivePatternOpacity}
                />
              </pattern>
            )}

            {/* Pattern 2: Lines (Líneas horizontales) */}
            {effectivePattern === 'lines' && (
              <pattern
                id="canvas-bg-pattern"
                width={effectivePatternSize}
                height={effectivePatternSize}
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1={effectivePatternSize}
                  x2={effectivePatternSize}
                  y2={effectivePatternSize}
                  stroke={effectivePatternColor}
                  strokeWidth="1"
                  strokeOpacity={effectivePatternOpacity}
                />
              </pattern>
            )}

            {/* Pattern 3: Squares (Cuadrados / Cuadrícula) */}
            {effectivePattern === 'squares' && (
              <pattern
                id="canvas-bg-pattern"
                width={effectivePatternSize}
                height={effectivePatternSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${effectivePatternSize} 0 L 0 0 0 ${effectivePatternSize}`}
                  fill="none"
                  stroke={effectivePatternColor}
                  strokeWidth="1"
                  strokeOpacity={effectivePatternOpacity}
                />
              </pattern>
            )}

            {/* Pattern 4: Triangles (Malla isométrica regular de triángulos equiláteros) */}
            {effectivePattern === 'triangles' && (
              <pattern
                id="canvas-bg-pattern"
                width={triangleW}
                height={triangleH}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M 0 0 L ${triangleW} 0 M 0 ${triangleH2} L ${triangleW} ${triangleH2} M 0 0 L ${triangleW} ${triangleH} M ${triangleW2} 0 L ${triangleW} ${triangleH2} M 0 ${triangleH2} L ${triangleW2} ${triangleH} M ${triangleW} 0 L 0 ${triangleH} M ${triangleW2} 0 L 0 ${triangleH2} M ${triangleW} ${triangleH2} L ${triangleW2} ${triangleH}`}
                  fill="none"
                  stroke={effectivePatternColor}
                  strokeWidth="1"
                  strokeOpacity={effectivePatternOpacity}
                />
              </pattern>
            )}

            {/* Pattern 5: Hexagons (Malla hexagonal regular en panal de abejas) */}
            {effectivePattern === 'hexagons' && (
              <pattern
                id="canvas-bg-pattern"
                width={hexW}
                height={hexH}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${hexW2} 0 L 0 ${hexH6} L 0 ${hexH2} L ${hexW2} ${hexH3} L ${hexW2} ${hexH} M ${hexW2} 0 L ${hexW} ${hexH6} L ${hexW} ${hexH2} L ${hexW2} ${hexH3}`}
                  fill="none"
                  stroke={effectivePatternColor}
                  strokeWidth="1"
                  strokeOpacity={effectivePatternOpacity}
                />
              </pattern>
            )}
          </defs>

          {/* Group 0: Dynamic Background Pattern Plane */}
          {effectivePattern !== 'none' && (
            <rect
              id="canvas-pattern-plane"
              x="-200000"
              y="-200000"
              width="400000"
              height="400000"
              fill="url(#canvas-bg-pattern)"
            />
          )}

          {/* Group 1: Clouds (rendered behind edges and nodes, outer clouds first) */}
          <g id="clouds-group">
            {(Object.values(mindMap.nodes) as MindNode[])
              .filter(node => Boolean(node.cloud?.enabled))
              .map(node => ({
                node,
                bounds: computeCloudBounds(node.id, mindMap.nodes, layoutMap),
              }))
              .filter((item): item is { node: MindNode; bounds: NonNullable<ReturnType<typeof computeCloudBounds>> } => Boolean(item.bounds))
              .sort((a, b) => (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height))
              .map(({ node, bounds }) => {
                const cloudColor = node.cloud?.color || 'rgba(59, 130, 246, 0.08)';
                let strokeColor = '#93c5fd';
                if (cloudColor.startsWith('rgba')) {
                  strokeColor = cloudColor.replace(/[\d.]+\)$/, '0.45)');
                } else if (cloudColor.startsWith('rgb')) {
                  strokeColor = cloudColor.replace('rgb', 'rgba').replace(')', ', 0.45)');
                } else if (cloudColor.startsWith('#')) {
                  strokeColor = cloudColor;
                }

                const shape = node.cloud?.shape || 'round-rectangle';
                const cornerRadius = shape === 'rectangle' ? 8 : shape === 'arc' ? 32 : 20;

                return (
                  <rect
                    key={`cloud-${node.id}`}
                    x={bounds.x}
                    y={bounds.y}
                    width={bounds.width}
                    height={bounds.height}
                    rx={cornerRadius}
                    ry={cornerRadius}
                    fill={cloudColor}
                    stroke={strokeColor}
                    strokeWidth="1.75"
                    strokeDasharray={shape === 'arc' ? '6 4' : '4 3'}
                  />
                );
              })}
          </g>

          {/* Group 2: Hierarchical Tree Edges */}
          <g id="tree-edges-group">
            {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((childLayout) => {
              const childNode = mindMap.nodes[childLayout.id];
              if (!childNode || !childNode.parentId) return null;

              const parentLayout = layoutMap.get(childNode.parentId);
              if (!parentLayout) return null;

              const effectiveStyle = childNode.edgeStyle || mindMap.edgeStyle || theme.edgeStyle || 'bezier';
              if (effectiveStyle === 'hidden') return null;

              const edgePath = generateEdgePath(
                parentLayout,
                childLayout,
                effectiveStyle,
                childNode.shape
              );

              if (!edgePath) return null;

              const color = childNode.edgeColor || mindMap.edgeColor || getBranchColor(childLayout);
              const defaultWidth = childLayout.depth === 1 ? 2.5 : 1.75;
              const width = childNode.edgeWidth || mindMap.edgeWidth || defaultWidth;
              const effectiveDash = childNode.edgeDash || mindMap.edgeDash || 'solid';
              const effectiveProfile = childNode.edgeProfile || mindMap.edgeProfile || 'uniform';

              // Calculate stroke dash pattern with proper, legible spacing
              const strokeDasharray =
                effectiveDash === 'dashed'
                  ? `${Math.max(10, width * 3.5)} ${Math.max(7, width * 2.5)}`
                  : effectiveDash === 'dotted'
                  ? `0.1 ${Math.max(8, width * 3.0)}`
                  : undefined;

              // If a variable-width profile is active, render dynamic filled ribbon
              if (effectiveProfile !== 'uniform') {
                const ribbonPath = generateRibbonEdgePath(
                  parentLayout,
                  childLayout,
                  effectiveStyle,
                  childNode.shape,
                  effectiveProfile,
                  width
                );
                if (ribbonPath) {
                  // If solid, render opaque filled ribbon
                  if (effectiveDash === 'solid') {
                    return (
                      <path
                        key={`edge-${childNode.parentId}-${childNode.id}`}
                        d={ribbonPath}
                        fill={color}
                        fillOpacity={0.92}
                        stroke={color}
                        strokeWidth={0.5}
                        strokeLinejoin="round"
                      />
                    );
                  }

                  // If dashed or dotted with variable thickness profile, render both profile silhouette and dashed spine
                  return (
                    <g key={`edge-group-${childNode.parentId}-${childNode.id}`}>
                      <path
                        d={ribbonPath}
                        fill={color}
                        fillOpacity={0.18}
                        stroke={color}
                        strokeWidth={0.5}
                        strokeOpacity={0.4}
                        strokeLinejoin="round"
                      />
                      <path
                        d={edgePath}
                        stroke={color}
                        strokeWidth={width}
                        strokeDasharray={strokeDasharray}
                        fill="none"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                }
              }

              return (
                <path
                  key={`edge-${childNode.parentId}-${childNode.id}`}
                  d={edgePath}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={strokeDasharray}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Group 3: Custom Connectors / Relations rendered BEHIND nodes (layer === 'below') */}
          <g id="connectors-below-group">
            {mindMap.connectors?.filter(c => c.layer === 'below').map(conn => renderConnector(conn, false))}
          </g>
        </svg>

        {/* Nodes Layer (DOM elements for crisp typography and events) */}
        <div id="nodes-layer" className="absolute top-0 left-0 pointer-events-auto">
          {(Array.from(layoutMap.values()) as CalculatedNodeLayout[]).map((layout) => {
            const node = mindMap.nodes[layout.id];
            if (!node) return null;

            const isSelected = selectedNodeId === node.id;
            const isEditing = editingNodeId === node.id;
            const isMatch = searchMatches ? searchMatches.has(node.id) : false;
            const branchColor = getBranchColor(layout);

            return (
              <NodeComponent
                key={node.id}
                node={node}
                layout={layout}
                isSelected={isSelected}
                isEditing={isEditing}
                theme={theme}
                branchColor={branchColor}
                isMatch={isMatch}
                globalVisibility={{
                  hideAllBodies: mindMap.hideAllBodies,
                  hideAllImages: mindMap.hideAllImages,
                  hideAllTags: mindMap.hideAllTags,
                  hideAllIcons: mindMap.hideAllIcons,
                  hideAllLinks: mindMap.hideAllLinks,
                }}
                onSelect={(id) => onSelectNode(id)}
                onDoubleClick={(id) => onStartEditing(id)}
                onTextChange={onUpdateNodeText}
                onFinishEditing={onFinishEditing}
                onToggleFold={onToggleFoldNode}
                onAddChild={onAddChildNode}
                onOpenNote={onOpenNotePanel}
                onDragStart={(id) => setDraggedNodeId(id)}
                onDropOnNode={onReparentNode}
              />
            );
          })}
        </div>

        {/* Top SVG Layer for Connectors rendered ABOVE nodes (layer !== 'below') */}
        <svg
          id="svg-top-connectors-layer"
          className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
          style={{ overflow: 'visible', zIndex: 20 }}
        >
          <defs>
            <marker
              id="top-connector-arrow-end"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="context-stroke" />
            </marker>
            <marker
              id="top-connector-arrow-start"
              viewBox="0 0 10 10"
              refX="2"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 8 1.5 L 0 5 L 8 8.5 z" fill="context-stroke" />
            </marker>
          </defs>
          <g id="connectors-above-group">
            {mindMap.connectors?.filter(c => c.layer !== 'below').map(conn => renderConnector(conn, true))}
          </g>
        </svg>
      </div>

      {/* Interactive Mini-Map & Zoom Controls */}
      <MiniMap
        mindMap={mindMap}
        layoutMap={layoutMap}
        theme={theme}
        pan={pan}
        zoom={zoom}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        selectedNodeId={selectedNodeId}
        showMiniMap={showMiniMap}
        onPanChange={setPan}
        onSelectNode={onSelectNode}
        onZoomIn={() => setZoom((z) => Math.min(2.5, z * 1.15))}
        onZoomOut={() => setZoom((z) => Math.max(0.2, z / 1.15))}
        onResetZoom={() => setZoom(1)}
        onFitView={handleFitView}
        onToggleMiniMap={() => setShowMiniMap((s) => !s)}
      />

      {/* Right Click Context Menu (Freeplane inspired) */}
      {contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xl py-1.5 min-w-56 max-h-[calc(100vh-24px)] overflow-y-auto text-xs text-slate-700 font-medium animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.nodeId ? (
            <>
              <button
                onClick={() => {
                  onAddChildNode(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-blue-600" /> Agregar Nodo Hijo
                </span>
                <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  Tab
                </kbd>
              </button>

              <button
                onClick={() => {
                  onAddSiblingNode(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-emerald-600" /> Agregar Nodo Hermano
                </span>
                <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  Enter
                </kbd>
              </button>

              <button
                onClick={() => {
                  onStartEditing(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Editar Texto
                </span>
                <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  F2
                </kbd>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  onCopyNode(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Copiar Rama
                </span>
                <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  Ctrl+C
                </kbd>
              </button>

              <button
                onClick={() => {
                  onCutNode(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5 text-slate-500" /> Cortar Rama
                </span>
                <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  Ctrl+X
                </kbd>
              </button>

              <button
                onClick={() => {
                  onPasteNode(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Clipboard className="w-3.5 h-3.5 text-slate-500" /> Pegar como Hijo
                </span>
                <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                  Ctrl+V
                </kbd>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  onOpenConnectorModal(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Link className="w-3.5 h-3.5 text-cyan-600" /> Crear Conector a otro nodo
              </button>

              <button
                onClick={() => {
                  onToggleCloud(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-500" /> Alternar Nube de Rama
              </button>

              {contextMenu.nodeId !== mindMap.rootId && (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      onDeleteNode(contextMenu.nodeId!);
                      setContextMenu((prev) => ({ ...prev, visible: false }));
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar Nodo
                    </span>
                    <kbd className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono">
                      Supr
                    </kbd>
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                onAddChildNode(mindMap.rootId);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Agregar Rama Principal
            </button>
          )}
        </div>
      )}
    </div>
  );
};
