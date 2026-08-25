export type NodeShape =
  | 'bubble'
  | 'fork'
  | 'rectangle'
  | 'square'
  | 'oval'
  | 'circle'
  | 'hexagon'
  | 'pill'
  | 'arrow'
  | 'star';

export type EdgeStyle = 'bezier' | 'linear' | 'sharp' | 'horizontal' | 'hidden';

export type EdgeProfile = 'uniform' | 'tapered' | 'spindle' | 'hourglass';

export type LayoutType =
  | 'standard'
  | 'balanced-horizontal'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'tree-down'
  | 'radial'
  | 'circular';

export type NodeSide = 'left' | 'right' | 'root' | 'bottom' | 'top' | 'radial' | 'circular';

export type CloudShape = 'arc' | 'rectangle' | 'round-rectangle' | 'star';

export interface NodeCloud {
  enabled: boolean;
  color: string;
  shape: CloudShape;
}

export type NodeBackgroundType = 'color' | 'transparent' | 'gradient' | 'pattern';
export type NodeGradientDirection = 'to-r' | 'to-b' | 'to-br' | 'radial';
export type NodePatternStyle = 'dots' | 'lines' | 'squares' | 'stripes' | 'triangles' | 'hexagons' | 'cross';

export interface MindNode {
  id: string;
  text: string;
  parentId: string | null;
  children: string[];
  folded?: boolean;
  side?: NodeSide;
  
  // Visual Styles
  shape?: NodeShape;
  customWidth?: number;
  customHeight?: number;
  color?: string; // background fill or accent
  bgType?: NodeBackgroundType;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: NodeGradientDirection;
  nodePattern?: NodePatternStyle;
  nodePatternColor?: string;
  nodePatternSize?: number;
  nodePatternOpacity?: number;

  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // Node Image (JPG, PNG, SVG, WebP)
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePosition?: 'top' | 'bottom' | 'background' | 'fit';

  // Title Text & Typography
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Body Text & Typography (Cuerpo del nodo)
  body?: string;
  bodyFontSize?: number;
  bodyBold?: boolean;
  bodyItalic?: boolean;
  bodyColor?: string;
  bodyFontFamily?: string;
  bodyAlign?: 'left' | 'center' | 'right';
  
  // Edges
  edgeColor?: string;
  edgeStyle?: EdgeStyle;
  edgeWidth?: number;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile;
  
  // Metadata & Features
  icons?: string[];
  tags?: string[];
  progress?: number; // 0 to 100
  link?: string; // URL, mailto:, #nodeId
  note?: string; // Rich Markdown note
  details?: string; // Additional details
  
  // Free floating / Post-it
  isFreeFloating?: boolean;
  freePosition?: { x: number; y: number };
  
  // Groupings
  cloud?: NodeCloud;
}

export interface Connector {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  arrow?: 'start' | 'end' | 'both' | 'none';
  curvature?: number;
}

export type BackgroundPatternStyle =
  | 'none'
  | 'dots'
  | 'lines'
  | 'squares'
  | 'triangles'
  | 'hexagons';

export interface MapBackgroundConfig {
  color?: string;
  pattern?: BackgroundPatternStyle;
  patternColor?: string;
  patternSize?: number;
  patternOpacity?: number;
}

export interface MindMapTheme {
  id: string;
  name: string;
  background: string;
  backgroundPattern?: BackgroundPatternStyle;
  backgroundPatternColor?: string;
  backgroundPatternSize?: number;
  backgroundPatternOpacity?: number;
  rootBg: string;
  rootText: string;
  nodeBg: string;
  nodeText: string;
  nodeBorder: string;
  branchColors: string[];
  edgeStyle: EdgeStyle;
  fontFamily: string;
}

export interface MindMap {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindNode>;
  connectors: Connector[];
  layout: LayoutType;
  themeId: string;
  // Custom Background Properties (override theme background if set)
  backgroundColor?: string;
  backgroundPattern?: BackgroundPatternStyle;
  backgroundPatternColor?: string;
  backgroundPatternSize?: number;
  backgroundPatternOpacity?: number;
  edgeStyle?: EdgeStyle;
  edgeWidth?: number;
  edgeColor?: string;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile;
  horizontalGap?: number;
  verticalGap?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CalculatedNodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: NodeSide;
  depth: number;
  branchIndex: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface FilterOptions {
  query: string;
  tag?: string;
  icon?: string;
  hasNote?: boolean;
  hasLink?: boolean;
  minProgress?: number;
  showAncestors: boolean;
  showDescendants: boolean;
}

export interface HistoryState {
  past: MindMap[];
  present: MindMap;
  future: MindMap[];
}
