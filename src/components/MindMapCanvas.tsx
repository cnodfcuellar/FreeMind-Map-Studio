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
  Sparkles,
  GitFork,
  MoveHorizontal,
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
  focusTarget?: { nodeId: string; timestamp: number } | null;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
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
  focusTarget,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
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

  // Center and Zoom on a specific target node (e.g. from Outline Panel click)
  useEffect(() => {
    if (!focusTarget || !containerRef.current) return;
    const layout = layoutMap.get(focusTarget.nodeId);
    if (!layout) return;

    const rect = containerRef.current.getBoundingClientRect();
    const nodeCenterX = layout.x + layout.width / 2;
    const nodeCenterY = layout.y + layout.height / 2;

    // Smooth target zoom (1.1x to 1.25x for close inspection, or maintain at least 1.05)
    const targetZoom = Math.max(zoom, 1.15);

    setZoom(targetZoom);
    setPan({
      x: rect.width / 2 - nodeCenterX * targetZoom,
      y: rect.height / 2 - nodeCenterY * targetZoom,
    });
  }, [focusTarget, layoutMap]);

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

            {/* Pattern 5: Hexagons (Malla hexagonal regular en panal de abejas completo) */}
            {effectivePattern === 'hexagons' && (() => {
              const R = effectivePatternSize;
              const W = Number((R * 1.7320508).toFixed(2));
              const H = Number((R * 3).toFixed(2));
              const W2 = Number((W / 2).toFixed(2));
              const r05 = Number((R * 0.5).toFixed(2));
              const r10 = Number((R * 1.0).toFixed(2));
              const d = `M 0,0 v ${r05} l ${W2},${r05} v ${r10} l -${W2},${r05} v ${r05} M ${W},0 v ${r05} l -${W2},${r05} v ${r10} l ${W2},${r05} v ${r05}`;
              return (
                <pattern
                  id="canvas-bg-pattern"
                  width={W}
                  height={H}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={d}
                    fill="none"
                    stroke={effectivePatternColor}
                    strokeWidth="1.2"
                    strokeOpacity={effectivePatternOpacity}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </pattern>
              );
            })()}
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
            {/* Filter for cloud drop shadow */}
            <filter id="cloud-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>

            {(Object.values(mindMap.nodes) as MindNode[])
              .filter(node => Boolean(node.cloud?.enabled))
              .map(node => ({
                node,
                bounds: computeCloudBounds(node.id, mindMap.nodes, layoutMap),
              }))
              .filter((item): item is { node: MindNode; bounds: NonNullable<ReturnType<typeof computeCloudBounds>> } => Boolean(item.bounds))
              .sort((a, b) => (b.bounds.width * b.bounds.height) - (a.bounds.width * a.bounds.height))
              .map(({ node, bounds }) => {
                const cloud = node.cloud!;
                const shape = cloud.shape || 'cloud-scallop';
                // Extract clean hex/rgb color if it was stored as rgba string
                let rawColor = cloud.color || '#3b82f6';
                let calculatedOpacity = cloud.opacity !== undefined ? cloud.opacity : 0.08;
                if (rawColor.startsWith('rgba')) {
                  const match = rawColor.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
                  if (match) {
                    rawColor = `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
                    if (cloud.opacity === undefined) {
                      calculatedOpacity = Math.min(0.12, parseFloat(match[4]));
                    }
                  }
                }
                const opacity = calculatedOpacity;
                const bgType = cloud.bgType || 'color';

                const strokeColor = cloud.borderColor || rawColor || '#3b82f6';
                const strokeWidth = cloud.borderWidth !== undefined ? cloud.borderWidth : 1.5;
                const strokeDash = cloud.borderDash || 'dashed';
                const strokeDasharray =
                  strokeDash === 'dashed'
                    ? '8 5'
                    : strokeDash === 'dotted'
                    ? '2 4'
                    : undefined;

                // Fill color or SVG definitions
                let fillVal = rawColor;
                const gradId = `cloud-grad-${node.id}`;
                const patternId = `cloud-pat-${node.id}`;
                const clipId = `cloud-clip-${node.id}`;

                if (bgType === 'gradient') {
                  fillVal = `url(#${gradId})`;
                } else if (bgType === 'pattern') {
                  fillVal = `url(#${patternId})`;
                }

                // Path generators for 8 geometric shapes
                const x = bounds.x;
                const y = bounds.y;
                const w = bounds.width;
                const h = bounds.height;
                const cx = x + w / 2;
                const cy = y + h / 2;

                let shapePath = '';
                if (shape === 'rectangle') {
                  shapePath = `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
                } else if (shape === 'round-rectangle') {
                  const r = Math.min(24, Math.min(w, h) / 4);
                  shapePath = `M ${x + r} ${y} h ${w - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
                } else if (shape === 'arc') {
                  const r = Math.min(36, Math.min(w, h) / 3);
                  shapePath = `M ${x + r} ${y} h ${w - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${h - 2 * r} a ${r} ${r} 0 0 1 ${-r} ${r} h ${-(w - 2 * r)} a ${r} ${r} 0 0 1 ${-r} ${-r} v ${-(h - 2 * r)} a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
                } else if (shape === 'bubble') {
                  // Globo de diálogo estilo cómic orgánico ultra-redondeado con cola prominente
                  const r = Math.min(w / 2, h / 2, 48);
                  const tailW = Math.max(32, Math.min(56, w * 0.25));
                  const tailH = Math.max(28, Math.min(48, h * 0.35));
                  const tailBaseX = x + Math.max(r, Math.min(w * 0.25, 60));
                  const tailTipX = tailBaseX - 22;
                  const tailTipY = y + h + tailH;

                  shapePath = `
                    M ${x + r} ${y}
                    h ${w - 2 * r}
                    a ${r} ${r} 0 0 1 ${r} ${r}
                    v ${h - 2 * r}
                    a ${r} ${r} 0 0 1 ${-r} ${r}
                    H ${tailBaseX + tailW}
                    L ${tailTipX} ${tailTipY}
                    L ${tailBaseX} ${y + h}
                    H ${x + r}
                    a ${r} ${r} 0 0 1 ${-r} ${-r}
                    v ${-(h - 2 * r)}
                    a ${r} ${r} 0 0 1 ${r} ${-r}
                    Z
                  `.replace(/\s+/g, ' ').trim();
                } else if (shape === 'oval') {
                  const rx = w / 2;
                  const ry = h / 2;
                  shapePath = `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
                } else if (shape === 'hexagon') {
                  const cut = Math.min(32, w / 5);
                  shapePath = `M ${x + cut} ${y} L ${x + w - cut} ${y} L ${x + w} ${cy} L ${x + w - cut} ${y + h} L ${x + cut} ${y + h} L ${x} ${cy} Z`;
                } else if (shape === 'star') {
                  const pts: string[] = [];
                  const numPoints = 12;
                  const rxOuter = w / 2;
                  const ryOuter = h / 2;
                  const rxInner = rxOuter * 0.88;
                  const ryInner = ryOuter * 0.88;
                  for (let p = 0; p < numPoints * 2; p++) {
                    const angle = (p * Math.PI) / numPoints - Math.PI / 2;
                    const rxVal = p % 2 === 0 ? rxOuter : rxInner;
                    const ryVal = p % 2 === 0 ? ryOuter : ryInner;
                    pts.push(`${cx + rxVal * Math.cos(angle)},${cy + ryVal * Math.sin(angle)}`);
                  }
                  shapePath = `M ${pts.join(' L ')} Z`;
                } else {
                  // shape === 'cloud-scallop' (Festoneado de nubes con arcos esponjosos)
                  const step = Math.max(28, Math.min(44, (w + h) / 16));
                  const nx = Math.max(2, Math.round(w / step));
                  const ny = Math.max(2, Math.round(h / step));
                  const stepX = w / nx;
                  const stepY = h / ny;

                  const scallops: string[] = [`M ${x} ${y + stepY / 2}`];
                  // Top edge
                  for (let i = 0; i < nx; i++) {
                    const x1 = x + i * stepX;
                    const x2 = x + (i + 1) * stepX;
                    scallops.push(`Q ${x1 + stepX / 2} ${y - stepX * 0.28}, ${x2} ${y}`);
                  }
                  // Right edge
                  for (let i = 0; i < ny; i++) {
                    const y1 = y + i * stepY;
                    const y2 = y + (i + 1) * stepY;
                    scallops.push(`Q ${x + w + stepY * 0.28} ${y1 + stepY / 2}, ${x + w} ${y2}`);
                  }
                  // Bottom edge
                  for (let i = 0; i < nx; i++) {
                    const x1 = x + w - i * stepX;
                    const x2 = x + w - (i + 1) * stepX;
                    scallops.push(`Q ${x1 - stepX / 2} ${y + h + stepX * 0.28}, ${x2} ${y + h}`);
                  }
                  // Left edge
                  for (let i = 0; i < ny; i++) {
                    const y1 = y + h - i * stepY;
                    const y2 = y + h - (i + 1) * stepY;
                    scallops.push(`Q ${x - stepY * 0.28} ${y1 - stepY / 2}, ${x} ${y2}`);
                  }
                  shapePath = `${scallops.join(' ')} Z`;
                }

                return (
                  <g key={`cloud-group-${node.id}`} filter={cloud.shadow ? 'url(#cloud-drop-shadow)' : undefined}>
                    <defs>
                      {/* Gradient def */}
                      {bgType === 'gradient' && (
                        <linearGradient
                          id={gradId}
                          x1={cloud.gradientDirection === 'to-r' ? '0%' : cloud.gradientDirection === 'to-b' ? '0%' : '0%'}
                          y1={cloud.gradientDirection === 'to-r' ? '0%' : cloud.gradientDirection === 'to-b' ? '0%' : '0%'}
                          x2={cloud.gradientDirection === 'to-r' ? '100%' : cloud.gradientDirection === 'to-b' ? '0%' : '100%'}
                          y2={cloud.gradientDirection === 'to-r' ? '0%' : cloud.gradientDirection === 'to-b' ? '100%' : '100%'}
                        >
                          <stop offset="0%" stopColor={cloud.gradientColor1 || cloud.color || '#3b82f6'} />
                          <stop offset="100%" stopColor={cloud.gradientColor2 || '#8b5cf6'} />
                        </linearGradient>
                      )}

                      {/* Pattern def */}
                      {bgType === 'pattern' && (
                        <pattern
                          id={patternId}
                          width={cloud.cloudPatternSize || 16}
                          height={cloud.cloudPatternSize || 16}
                          patternUnits="userSpaceOnUse"
                        >
                          {(cloud.cloudPattern === 'dots' || !cloud.cloudPattern) && (
                            <circle
                              cx={(cloud.cloudPatternSize || 16) / 2}
                              cy={(cloud.cloudPatternSize || 16) / 2}
                              r={Math.max(2, (cloud.cloudPatternSize || 16) / 8)}
                              fill={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              fillOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'lines' && (
                            <line
                              x1="0"
                              y1={(cloud.cloudPatternSize || 16) / 2}
                              x2={cloud.cloudPatternSize || 16}
                              y2={(cloud.cloudPatternSize || 16) / 2}
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.5"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'stripes' && (
                            <path
                              d={`M 0 0 L ${cloud.cloudPatternSize || 16} ${cloud.cloudPatternSize || 16} M 0 ${cloud.cloudPatternSize || 16} L ${cloud.cloudPatternSize || 16} 0`}
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.5"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'squares' && (
                            <rect
                              x="0"
                              y="0"
                              width={cloud.cloudPatternSize || 16}
                              height={cloud.cloudPatternSize || 16}
                              fill="none"
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.2"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'triangles' && (
                            <polygon
                              points={`0,${cloud.cloudPatternSize || 16} ${(cloud.cloudPatternSize || 16) / 2},0 ${cloud.cloudPatternSize || 16},${cloud.cloudPatternSize || 16}`}
                              fill="none"
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'hexagons' && (
                            <polygon
                              points={`
                                ${(cloud.cloudPatternSize || 16) * 0.25},0 
                                ${(cloud.cloudPatternSize || 16) * 0.75},0 
                                ${cloud.cloudPatternSize || 16},${(cloud.cloudPatternSize || 16) * 0.5} 
                                ${(cloud.cloudPatternSize || 16) * 0.75},${cloud.cloudPatternSize || 16} 
                                ${(cloud.cloudPatternSize || 16) * 0.25},${cloud.cloudPatternSize || 16} 
                                0,${(cloud.cloudPatternSize || 16) * 0.5}
                              `.replace(/\s+/g, ' ').trim()}
                              fill="none"
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                          {cloud.cloudPattern === 'cross' && (
                            <path
                              d={`M ${(cloud.cloudPatternSize || 16) / 2} 0 v ${cloud.cloudPatternSize || 16} M 0 ${(cloud.cloudPatternSize || 16) / 2} h ${cloud.cloudPatternSize || 16}`}
                              stroke={cloud.cloudPatternColor || cloud.color || '#3b82f6'}
                              strokeWidth="1.5"
                              strokeOpacity={cloud.cloudPatternOpacity ?? 0.8}
                            />
                          )}
                        </pattern>
                      )}

                      {/* ClipPath for Cloud Image background */}
                      <clipPath id={clipId}>
                        <path d={shapePath} />
                      </clipPath>
                    </defs>

                    {/* Base Background Tint Layer */}
                    <path
                      d={shapePath}
                      fill={bgType === 'pattern' ? (cloud.color || '#3b82f6') : (bgType === 'image' ? (cloud.color || '#3b82f6') : fillVal)}
                      fillOpacity={bgType === 'pattern' ? Math.max(0.04, opacity * 0.5) : opacity}
                    />

                    {/* Pattern Overlay Layer when bgType is pattern */}
                    {bgType === 'pattern' && (
                      <path
                        d={shapePath}
                        fill={`url(#${patternId})`}
                        fillOpacity={1}
                      />
                    )}

                    {/* Stroke Outline & Dropshadow */}
                    <path
                      d={shapePath}
                      fill="none"
                      stroke={strokeWidth > 0 ? strokeColor : 'none'}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Image Background clipped to cloud shape */}
                    {bgType === 'image' && cloud.bgImageUrl && (
                      <image
                        href={cloud.bgImageUrl}
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        preserveAspectRatio={
                          cloud.bgImageMode === 'contain'
                            ? 'xMidYMid meet'
                            : cloud.bgImageMode === 'tile'
                            ? 'none'
                            : 'xMidYMid slice'
                        }
                        opacity={opacity}
                        clipPath={`url(#${clipId})`}
                      />
                    )}
                  </g>
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
                  showAllNotesInline: mindMap.showAllNotesInline,
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

              <div className="my-1 border-t border-slate-100" />

              {/* Style propagation actions */}
              <button
                onClick={() => {
                  onApplyStyleToChildren?.(contextMenu.nodeId!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <GitFork className="w-3.5 h-3.5 text-blue-600" /> Aplicar Estilo a Hijos
              </button>

              {contextMenu.nodeId !== mindMap.rootId && (
                <button
                  onClick={() => {
                    onApplyStyleToSiblings?.(contextMenu.nodeId!);
                    setContextMenu((prev) => ({ ...prev, visible: false }));
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <MoveHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Aplicar Estilo a Hermanos
                </button>
              )}

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
