import { MindMap, CalculatedNodeLayout, NodeShape } from '../types/mindmap';
import { THEMES } from './themes';
import { computeMindMapLayout, generateEdgePath, generateRibbonEdgePath } from './layoutEngine';
import { computeBubbleTailGeometry } from './bubbleTailUtils';
import { computeArrowPolygonPoints } from './arrowShapeUtils';
import {
  isSquareRotated,
  computeRectangleSvgPath,
  computeRhombusSvgPath,
} from './rectangleCornerUtils';

export type PdfPaperSize = 'A4' | 'A3' | 'A2' | 'Letter' | 'Legal' | 'Tabloid' | 'Poster';
export type PdfOrientation = 'auto' | 'landscape' | 'portrait';
export type PdfPaginationMode = 'single' | 'grid-2x1' | 'grid-2x2' | 'grid-3x2' | 'grid-3x3';

export interface PdfExportOptions {
  paperSize: PdfPaperSize;
  orientation: PdfOrientation;
  paginationMode: PdfPaginationMode;
  includeBackground: boolean;
  includeHeaderFooter: boolean;
  includeCropMarks: boolean;
  authorName?: string;
  marginMm?: number;
}

export interface PaperDimensions {
  widthMm: number;
  heightMm: number;
}

export const PAPER_SIZES_MM: Record<PdfPaperSize, PaperDimensions> = {
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  A2: { widthMm: 420, heightMm: 594 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
  Legal: { widthMm: 215.9, heightMm: 355.6 },
  Tabloid: { widthMm: 279.4, heightMm: 431.8 },
  Poster: { widthMm: 500, heightMm: 500 }, // Scaled dynamically if Poster
};

export interface MapBoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface PageTile {
  pageNumber: number;
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  viewBox: string;
  label: string;
}

export interface PaginationGridResult {
  totalPages: number;
  cols: number;
  rows: number;
  tiles: PageTile[];
  paperWidthMm: number;
  paperHeightMm: number;
  effectiveOrientation: 'landscape' | 'portrait';
}

function escapeXML(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Computes the exact bounding box of the entire mindmap layout including padding
 */
export function computeMapBoundingBox(
  mindMap: MindMap,
  padding: number = 24
): { box: MapBoundingBox; layoutMap: Map<string, CalculatedNodeLayout>; nodesList: CalculatedNodeLayout[] } {
  const layoutMap = computeMindMapLayout(mindMap, { x: 0, y: 0 });
  const nodesList = Array.from(layoutMap.values());

  if (nodesList.length === 0) {
    return {
      box: {
        minX: -200,
        minY: -150,
        maxX: 200,
        maxY: 150,
        width: 400,
        height: 300,
        centerX: 0,
        centerY: 0,
      },
      layoutMap,
      nodesList,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodesList.forEach((layout) => {
    minX = Math.min(minX, layout.x);
    maxX = Math.max(maxX, layout.x + layout.width);
    minY = Math.min(minY, layout.y);
    maxY = Math.max(maxY, layout.y + layout.height);
  });

  // Account for connectors bounds
  if (mindMap.connectors && mindMap.connectors.length > 0) {
    mindMap.connectors.forEach((conn) => {
      const from = layoutMap.get(conn.fromNodeId);
      const to = layoutMap.get(conn.toNodeId);
      if (from && to) {
        minX = Math.min(minX, from.x, to.x);
        maxX = Math.max(maxX, from.x + from.width, to.x + to.width);
        minY = Math.min(minY, from.y, to.y);
        maxY = Math.max(maxY, from.y + from.height, to.y + to.height);
      }
    });
  }

  // Account for cloud bounds if present
  nodesList.forEach((layout) => {
    const node = mindMap.nodes[layout.id];
    if (node?.cloud?.enabled) {
      const padX = node.cloud.paddingX || 24;
      const padY = node.cloud.paddingY || 16;
      minX = Math.min(minX, layout.x - padX);
      maxX = Math.max(maxX, layout.x + layout.width + padX);
      minY = Math.min(minY, layout.y - padY);
      maxY = Math.max(maxY, layout.y + layout.height + padY);
    }
  });

  const w = Math.max(200, maxX - minX + padding * 2);
  const h = Math.max(150, maxY - minY + padding * 2);
  const vx = minX - padding;
  const vy = minY - padding;

  return {
    box: {
      minX: vx,
      minY: vy,
      maxX: vx + w,
      maxY: vy + h,
      width: w,
      height: h,
      centerX: vx + w / 2,
      centerY: vy + h / 2,
    },
    layoutMap,
    nodesList,
  };
}

/**
 * Resolves effective paper orientation ('landscape' vs 'portrait') based on user choice or aspect ratio
 */
export function resolveEffectiveOrientation(
  box: MapBoundingBox,
  requestedOrientation: PdfOrientation
): 'landscape' | 'portrait' {
  if (requestedOrientation === 'landscape' || requestedOrientation === 'portrait') {
    return requestedOrientation;
  }
  // 'auto' mode: match paper orientation to map dimensions
  return box.width >= box.height ? 'landscape' : 'portrait';
}

/**
 * Calculates page grid tiles for single-page or multi-page poster printing
 */
export function calculatePaginationGrid(
  mindMap: MindMap,
  options: PdfExportOptions
): PaginationGridResult {
  const { box } = computeMapBoundingBox(mindMap, 24);
  const effectiveOrientation = resolveEffectiveOrientation(box, options.orientation);
  const baseDim = PAPER_SIZES_MM[options.paperSize] || PAPER_SIZES_MM.A4;

  let paperWidthMm = effectiveOrientation === 'landscape'
    ? Math.max(baseDim.widthMm, baseDim.heightMm)
    : Math.min(baseDim.widthMm, baseDim.heightMm);

  let paperHeightMm = effectiveOrientation === 'landscape'
    ? Math.min(baseDim.widthMm, baseDim.heightMm)
    : Math.max(baseDim.widthMm, baseDim.heightMm);

  if (options.paperSize === 'Poster') {
    // Continuous aspect-ratio fitting
    const mapRatio = box.width / Math.max(1, box.height);
    if (effectiveOrientation === 'landscape') {
      paperWidthMm = 600;
      paperHeightMm = Math.max(100, Math.round(600 / mapRatio));
    } else {
      paperHeightMm = 600;
      paperWidthMm = Math.max(100, Math.round(600 * mapRatio));
    }
  }

  let cols = 1;
  let rows = 1;

  if (options.paginationMode === 'grid-2x1') {
    cols = 2;
    rows = 1;
  } else if (options.paginationMode === 'grid-2x2') {
    cols = 2;
    rows = 2;
  } else if (options.paginationMode === 'grid-3x2') {
    cols = 3;
    rows = 2;
  } else if (options.paginationMode === 'grid-3x3') {
    cols = 3;
    rows = 3;
  }

  const totalPages = cols * rows;
  const tiles: PageTile[] = [];

  const tileWidth = box.width / cols;
  const tileHeight = box.height / rows;

  let pageNum = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileX = box.minX + c * tileWidth;
      const tileY = box.minY + r * tileHeight;
      const tileBox = `${tileX} ${tileY} ${tileWidth} ${tileHeight}`;

      tiles.push({
        pageNumber: pageNum,
        row: r + 1,
        col: c + 1,
        totalRows: rows,
        totalCols: cols,
        viewBox: tileBox,
        label: totalPages === 1
          ? '1 Sola Hoja (Ajuste Óptimo)'
          : `Hoja ${pageNum} de ${totalPages} (Fila ${r + 1}, Col. ${c + 1})`,
      });
      pageNum++;
    }
  }

  return {
    totalPages,
    cols,
    rows,
    tiles,
    paperWidthMm,
    paperHeightMm,
    effectiveOrientation,
  };
}

/**
 * Estimates width of characters for SVG text wrapping based on Plus Jakarta Sans proportions
 */
export function estimateSvgCharWidth(char: string, fontSize: number): number {
  if (char === ' ' || char === '\t') return fontSize * 0.28;
  if ('.,:;!|iIl\'`'.includes(char)) return fontSize * 0.28;
  if ('frtj()[]{}*"-'.includes(char)) return fontSize * 0.38;
  if ('mwMW@%#&'.includes(char)) return fontSize * 0.85;
  if (char >= 'A' && char <= 'Z') return fontSize * 0.68;
  if (char >= '0' && char <= '9') return fontSize * 0.58;
  return fontSize * 0.52;
}

export function measureSvgTextWidth(text: string, fontSize: number): number {
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    w += estimateSvgCharWidth(text[i], fontSize);
  }
  return w;
}

/**
 * Wraps text into lines that strictly fit within maxWidth.
 * Respects explicit newlines and breaks long words if necessary.
 */
export function wrapSvgTextLines(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text || text.trim().length === 0) return [''];

  const paragraphs = text.split('\n');
  const allLines: string[] = [];

  for (const para of paragraphs) {
    if (para.trim().length === 0) {
      allLines.push('');
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = '';
    let currentLineWidth = 0;

    for (const word of words) {
      const wordWidth = measureSvgTextWidth(word, fontSize);
      const spaceWidth = estimateSvgCharWidth(' ', fontSize);

      if (!currentLine) {
        if (wordWidth > maxWidth) {
          // Break overly long single word into character chunks
          let chunk = '';
          let chunkW = 0;
          for (const char of word) {
            const charW = estimateSvgCharWidth(char, fontSize);
            if (chunkW + charW > maxWidth && chunk.length > 0) {
              allLines.push(chunk);
              chunk = char;
              chunkW = charW;
            } else {
              chunk += char;
              chunkW += charW;
            }
          }
          if (chunk) {
            currentLine = chunk;
            currentLineWidth = chunkW;
          }
        } else {
          currentLine = word;
          currentLineWidth = wordWidth;
        }
      } else {
        if (currentLineWidth + spaceWidth + wordWidth <= maxWidth) {
          currentLine += ' ' + word;
          currentLineWidth += spaceWidth + wordWidth;
        } else {
          allLines.push(currentLine);
          if (wordWidth > maxWidth) {
            let chunk = '';
            let chunkW = 0;
            for (const char of word) {
              const charW = estimateSvgCharWidth(char, fontSize);
              if (chunkW + charW > maxWidth && chunk.length > 0) {
                allLines.push(chunk);
                chunk = char;
                chunkW = charW;
              } else {
                chunk += char;
                chunkW += charW;
              }
            }
            currentLine = chunk;
            currentLineWidth = chunkW;
          } else {
            currentLine = word;
            currentLineWidth = wordWidth;
          }
        }
      }
    }

    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines.length > 0 ? allLines : [''];
}

/**
 * Generates high-definition vector SVG representation of the mindmap
 */
export function generateMindMapVectorSvg(
  mindMap: MindMap,
  customViewBox?: string,
  options?: Partial<PdfExportOptions>
): string {
  const { box, layoutMap, nodesList } = computeMapBoundingBox(mindMap, 24);
  const theme = THEMES[mindMap.themeId] || THEMES.default;
  const viewBox = customViewBox || `${box.minX} ${box.minY} ${box.width} ${box.height}`;

  const parts: string[] = [];
  const includeBg = options?.includeBackground ?? true;
  const bgColor = includeBg ? (theme.background || '#ffffff') : '#ffffff';

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="background-color: ${bgColor}; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;">`
  );

  // Defs & Filters (Shadows & Gradients)
  parts.push(`<defs>`);
  parts.push(`
    <filter id="pdf-node-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.18)" />
    </filter>
    <filter id="pdf-edge-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.22)" />
    </filter>
    <filter id="pdf-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#38bdf8" flood-opacity="0.7" />
    </filter>
  `);
  parts.push(`</defs>`);

  // 1. Clouds Layer
  parts.push(`<g id="pdf-clouds">`);
  nodesList.forEach((layout) => {
    const node = mindMap.nodes[layout.id];
    if (node?.cloud?.enabled) {
      const padX = node.cloud.paddingX || 24;
      const padY = node.cloud.paddingY || 16;
      const cloudX = layout.x - padX;
      const cloudY = layout.y - padY;
      const cloudW = layout.width + padX * 2;
      const cloudH = layout.height + padY * 2;
      const color = node.cloud.color || '#3b82f6';
      const opacity = node.cloud.opacity ?? 0.08;

      parts.push(
        `<rect x="${cloudX}" y="${cloudY}" width="${cloudW}" height="${cloudH}" rx="24" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 4" />`
      );
    }
  });
  parts.push(`</g>`);

  // 2. Branches / Edges Layer
  parts.push(`<g id="pdf-edges">`);
  nodesList.forEach((childLayout) => {
    const childNode = mindMap.nodes[childLayout.id];
    if (!childNode || !childNode.parentId) return;

    const parentLayout = layoutMap.get(childNode.parentId);
    if (!parentLayout) return;

    const edgeStyle = childNode.edgeStyle || mindMap.edgeStyle || theme.edgeStyle || 'bezier';
    if (edgeStyle === 'hidden') return;

    const branchColor =
      childNode.edgeColor ||
      mindMap.edgeColor ||
      theme.branchColors[childLayout.branchIndex % theme.branchColors.length] ||
      '#3b82f6';

    const defaultWidth = childLayout.depth === 1 ? 2.5 : 1.75;
    const edgeWidth = childNode.edgeWidth || mindMap.edgeWidth || defaultWidth;
    const effectiveDash = childNode.edgeBorderStyle || childNode.edgeDash || mindMap.edgeBorderStyle || mindMap.edgeDash || 'solid';
    const effectiveProfile = childNode.edgeProfile || mindMap.edgeProfile || 'uniform';

    const hasEdgeShadow = childNode.edgeShadow ?? mindMap.edgeShadow ?? false;
    const shadowAttr = hasEdgeShadow ? 'filter="url(#pdf-edge-shadow)"' : '';

    let dashAttr = '';
    if (effectiveDash === 'dashed') {
      dashAttr = 'stroke-dasharray="8 6"';
    } else if (effectiveDash === 'dotted') {
      dashAttr = 'stroke-dasharray="2 4" stroke-linecap="round"';
    }

    // Ribbon path if variable profile is active and style is solid
    if (effectiveProfile !== 'uniform' && effectiveDash === 'solid') {
      const ribbonPath = generateRibbonEdgePath(
        parentLayout,
        childLayout,
        edgeStyle,
        childNode.shape || 'bubble',
        effectiveProfile,
        edgeWidth
      );
      if (ribbonPath) {
        parts.push(
          `<path d="${ribbonPath}" fill="${branchColor}" fill-opacity="0.95" ${shadowAttr} />`
        );
        return;
      }
    }

    const pathD = generateEdgePath(parentLayout, childLayout, edgeStyle, childNode.shape || 'bubble');
    if (pathD) {
      parts.push(
        `<path d="${pathD}" fill="none" stroke="${branchColor}" stroke-width="${edgeWidth}" stroke-linecap="round" stroke-linejoin="round" ${dashAttr} ${shadowAttr} />`
      );
    }
  });
  parts.push(`</g>`);

  // 3. Connectors Layer (Cross-links)
  if (mindMap.connectors && mindMap.connectors.length > 0) {
    parts.push(`<g id="pdf-connectors">`);
    mindMap.connectors.forEach((conn) => {
      const from = layoutMap.get(conn.fromNodeId);
      const to = layoutMap.get(conn.toNodeId);
      if (!from || !to) return;

      const fromX = from.x + from.width / 2;
      const fromY = from.y + from.height / 2;
      const toX = to.x + to.width / 2;
      const toY = to.y + to.height / 2;
      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2 - 30;

      const strokeColor = conn.color || '#06b6d4';
      const strokeWidth = conn.width || 2;
      const dash = conn.style === 'dashed' ? 'stroke-dasharray="6 4"' : conn.style === 'dotted' ? 'stroke-dasharray="2 3"' : '';

      parts.push(
        `<path d="M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${dash} />`
      );

      if (conn.label) {
        parts.push(
          `<rect x="${midX - 35}" y="${midY - 10}" width="70" height="20" rx="6" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`
        );
        parts.push(
          `<text x="${midX}" y="${midY + 4}" font-size="10" font-weight="600" fill="${strokeColor}" text-anchor="middle">${escapeXML(conn.label)}</text>`
        );
      }
    });
    parts.push(`</g>`);
  }

  // 4. Nodes Layer
  parts.push(`<g id="pdf-nodes">`);
  nodesList.forEach((layout) => {
    const node = mindMap.nodes[layout.id];
    if (!node) return;

    const isRoot = layout.id === mindMap.rootId;
    const shape = node.shape || (isRoot ? 'rectangle' : 'bubble');

    const bgColor =
      node.color ||
      (isRoot
        ? theme.rootBg || '#2563eb'
        : layout.depth === 1
        ? '#ffffff'
        : '#ffffff');

    const textColor =
      node.textColor ||
      (isRoot ? theme.rootText || '#ffffff' : theme.nodeText || '#1e293b');

    const borderColor =
      node.borderColor ||
      (isRoot ? 'transparent' : theme.branchColors[layout.branchIndex % theme.branchColors.length] || '#cbd5e1');

    const borderWidth = node.borderWidth !== undefined ? node.borderWidth : (isRoot ? 0 : 1.5);
    const hasShadow = node.nodeShadow ?? (isRoot ? true : false);
    const shadowAttr = hasShadow ? 'filter="url(#pdf-node-shadow)"' : '';

    // Render Shape Geometry
    if (shape === 'bubble') {
      const radius = 14;
      parts.push(
        `<rect x="${layout.x}" y="${layout.y}" width="${layout.width}" height="${layout.height}" rx="${radius}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
      );

      // Render bubble tail
      if (layout.depth > 0 && node.tailLength !== 0) {
        const tailGeo = computeBubbleTailGeometry({ node, layoutSide: layout.side });
        if (tailGeo.thoughtCircles) {
          tailGeo.thoughtCircles.forEach((tc) => {
            parts.push(
              `<circle cx="${tc.cx}" cy="${tc.cy}" r="${tc.r}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />`
            );
          });
        } else if (tailGeo.pathD) {
          parts.push(
            `<path d="${tailGeo.pathD}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" stroke-linejoin="round" />`
          );
        }
      }
    } else if (shape === 'pill') {
      const radius = Math.min(layout.width, layout.height) / 2;
      parts.push(
        `<rect x="${layout.x}" y="${layout.y}" width="${layout.width}" height="${layout.height}" rx="${radius}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
      );
    } else if (shape === 'circle') {
      const cx = layout.x + layout.width / 2;
      const cy = layout.y + layout.height / 2;
      const r = Math.min(layout.width, layout.height) / 2;
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
      );
    } else if (shape === 'oval') {
      const cx = layout.x + layout.width / 2;
      const cy = layout.y + layout.height / 2;
      const rx = Math.max(10, layout.width / 2 - borderWidth / 2);
      const ry = Math.max(10, layout.height / 2 - borderWidth / 2);
      parts.push(
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
      );
    } else if (shape === 'square') {
      if (isSquareRotated(node)) {
        const pathD = computeRhombusSvgPath(layout.width, layout.height, node, borderWidth);
        parts.push(
          `<g transform="translate(${layout.x}, ${layout.y})"><path d="${pathD}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} /></g>`
        );
      } else {
        const side = Math.min(layout.width, layout.height);
        const ox = layout.x + (layout.width - side) / 2;
        const oy = layout.y + (layout.height - side) / 2;
        parts.push(
          `<rect x="${ox}" y="${oy}" width="${side}" height="${side}" rx="8" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
        );
      }
    } else if (shape === 'hexagon') {
      const w = layout.width;
      const h = layout.height;
      const inset = Math.min(w * 0.28, Math.max(28, h * 0.58));
      const pad = Math.max(borderWidth / 2, 1);
      const p1 = `${layout.x + inset},${layout.y + pad}`;
      const p2 = `${layout.x + w - inset},${layout.y + pad}`;
      const p3 = `${layout.x + w - pad},${layout.y + h / 2}`;
      const p4 = `${layout.x + w - inset},${layout.y + h - pad}`;
      const p5 = `${layout.x + inset},${layout.y + h - pad}`;
      const p6 = `${layout.x + pad},${layout.y + h / 2}`;
      parts.push(
        `<polygon points="${p1} ${p2} ${p3} ${p4} ${p5} ${p6}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
      );
    } else if (shape === 'arrow') {
      const points = computeArrowPolygonPoints(layout.width, layout.height, node, borderWidth);
      parts.push(
        `<g transform="translate(${layout.x}, ${layout.y})"><polygon points="${points}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} /></g>`
      );
    } else if (shape === 'star') {
      const pad = Math.max(borderWidth / 2, 1);
      const cx = layout.x + layout.width / 2;
      const cy = layout.y + layout.height / 2;
      const Rx = Math.max((layout.width - 2 * pad) / 2, 10);
      const Ry = Math.max((layout.height - 2 * pad) / 2, 10);
      const rx = Rx * 0.44;
      const ry = Ry * 0.44;
      const starPts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const rCurrX = i % 2 === 0 ? Rx : rx;
        const rCurrY = i % 2 === 0 ? Ry : ry;
        starPts.push(`${(cx + rCurrX * Math.cos(angle)).toFixed(1)},${(cy + rCurrY * Math.sin(angle)).toFixed(1)}`);
      }
      parts.push(
        `<polygon points="${starPts.join(' ')}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} />`
      );
    } else if (shape === 'fork') {
      // Underline classic style
      const lineY = layout.y + layout.height - 2;
      parts.push(
        `<line x1="${layout.x}" y1="${lineY}" x2="${layout.x + layout.width}" y2="${lineY}" stroke="${borderColor}" stroke-width="2.5" />`
      );
      // Hook accents on ends
      parts.push(
        `<line x1="${layout.x}" y1="${lineY - 6}" x2="${layout.x}" y2="${lineY}" stroke="${borderColor}" stroke-width="2.5" stroke-linecap="round" />`
      );
      parts.push(
        `<line x1="${layout.x + layout.width}" y1="${lineY - 6}" x2="${layout.x + layout.width}" y2="${lineY}" stroke="${borderColor}" stroke-width="2.5" stroke-linecap="round" />`
      );
    } else {
      // Default rounded / rectangle (respecting corner styles)
      const pathD = computeRectangleSvgPath(layout.width, layout.height, node, borderWidth);
      parts.push(
        `<g transform="translate(${layout.x}, ${layout.y})"><path d="${pathD}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${shadowAttr} /></g>`
      );
    }

    // Node Typography / Text Wrapping & Alignment
    let textMaxWidth = Math.max(30, layout.width - 24);
    if (shape === 'hexagon') {
      textMaxWidth = Math.max(30, layout.width * 0.68);
    } else if (shape === 'circle') {
      textMaxWidth = Math.max(30, layout.width * 0.72);
    } else if (shape === 'oval') {
      textMaxWidth = Math.max(30, layout.width * 0.75);
    } else if (shape === 'pill') {
      textMaxWidth = Math.max(30, layout.width - layout.height * 0.5);
    } else if (shape === 'square' && isSquareRotated(node)) {
      textMaxWidth = Math.max(30, layout.width * 0.65);
    } else if (shape === 'star') {
      textMaxWidth = Math.max(30, layout.width * 0.55);
    } else if (shape === 'arrow') {
      textMaxWidth = Math.max(30, layout.width * 0.65);
    } else if (shape === 'fork') {
      textMaxWidth = Math.max(30, layout.width - 16);
    }

    const fontSize = node.fontSize || (isRoot ? 16 : 13);
    const fontWeight = isRoot || node.bold ? '700' : '500';
    const fontStyle = node.italic ? 'italic' : 'normal';
    const fontFamily = node.fontFamily || theme.fontFamily || "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    const textAlign = node.textAlign || 'center';

    const titleLines = wrapSvgTextLines(node.text || 'Sin título', textMaxWidth, fontSize);
    const titleLineHeight = Math.round(fontSize * 1.34);
    const titleTotalHeight = (titleLines.length - 1) * titleLineHeight + fontSize;

    let bodyLines: string[] = [];
    let bodyFontSize = 11;
    let bodyLineHeight = 15;
    let bodyTotalHeight = 0;
    const hasVisibleBody = Boolean(node.body && !node.hideBody);

    if (hasVisibleBody) {
      bodyFontSize = node.bodyFontSize || 11;
      bodyLineHeight = Math.round(bodyFontSize * 1.36);
      bodyLines = wrapSvgTextLines(node.body!, textMaxWidth, bodyFontSize);
      bodyTotalHeight = (bodyLines.length - 1) * bodyLineHeight + bodyFontSize;
    }

    const hasVisibleTags = Boolean(!node.hideTags && node.tags && node.tags.length > 0);
    const tagsReservedHeight = hasVisibleTags ? 18 : 0;

    const gapBetween = hasVisibleBody ? 6 : 0;
    const combinedContentHeight = titleTotalHeight + gapBetween + bodyTotalHeight + tagsReservedHeight;

    // Anchor & X position
    let anchor = 'middle';
    let textX = layout.x + layout.width / 2;
    if (textAlign === 'left') {
      anchor = 'start';
      textX = layout.x + (layout.width - textMaxWidth) / 2;
    } else if (textAlign === 'right') {
      anchor = 'end';
      textX = layout.x + layout.width - (layout.width - textMaxWidth) / 2;
    }

    // Baseline Y calculation
    let firstLineBaselineY: number;
    if (shape === 'fork') {
      firstLineBaselineY = layout.y + layout.height - (combinedContentHeight - titleTotalHeight) - 8;
    } else {
      const centerY = layout.y + (layout.height - tagsReservedHeight) / 2;
      firstLineBaselineY = Math.round(centerY - (titleTotalHeight + gapBetween + bodyTotalHeight) / 2 + fontSize * 0.8);
    }

    // Title lines
    const titleTspans = titleLines.map((line, idx) => {
      const dy = idx === 0 ? 0 : titleLineHeight;
      return `<tspan x="${textX}" dy="${dy}">${escapeXML(line)}</tspan>`;
    });

    parts.push(
      `<text x="${textX}" y="${firstLineBaselineY}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${textColor}" text-anchor="${anchor}">${titleTspans.join('')}</text>`
    );

    // Body lines
    if (hasVisibleBody && bodyLines.length > 0) {
      const bodyStartY = firstLineBaselineY + (titleLines.length - 1) * titleLineHeight + gapBetween + bodyFontSize * 0.85;
      const bodyTspans = bodyLines.map((line, idx) => {
        const dy = idx === 0 ? 0 : bodyLineHeight;
        return `<tspan x="${textX}" dy="${dy}">${escapeXML(line)}</tspan>`;
      });
      parts.push(
        `<text x="${textX}" y="${bodyStartY}" font-family="${fontFamily}" font-size="${bodyFontSize}" font-weight="400" fill="${textColor}" opacity="0.82" text-anchor="${anchor}">${bodyTspans.join('')}</text>`
      );
    }

    // Tags rendering
    if (hasVisibleTags && node.tags) {
      const tagY = layout.y + layout.height - 18;
      const tagHeight = 14;
      const tagBg = isRoot ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.06)';
      const tagTextColor = isRoot ? '#ffffff' : textColor;
      
      const tagPills: { label: string; w: number }[] = node.tags.map(t => ({
        label: `#${t}`,
        w: Math.min(80, Math.round(t.length * 5.6 + 12)),
      }));
      const totalTagsW = tagPills.reduce((acc, p) => acc + p.w + 4, -4);
      let tagStartX = layout.x + Math.max(6, (layout.width - totalTagsW) / 2);

      tagPills.forEach(p => {
        if (tagStartX + p.w <= layout.x + layout.width - 6) {
          parts.push(
            `<rect x="${tagStartX}" y="${tagY}" width="${p.w}" height="${tagHeight}" rx="4" fill="${tagBg}" />`
          );
          parts.push(
            `<text x="${tagStartX + p.w / 2}" y="${tagY + 10.5}" font-family="${fontFamily}" font-size="8.5" font-weight="600" fill="${tagTextColor}" text-anchor="middle" opacity="0.9">${escapeXML(p.label)}</text>`
          );
          tagStartX += p.w + 4;
        }
      });
    }
  });
  parts.push(`</g>`);

  parts.push(`</svg>`);
  return parts.join('\n');
}

/**
 * Builds print-ready HTML with @page rules, vector tiles, cut marks, and metadata
 */
export function generatePrintHtml(mindMap: MindMap, options: PdfExportOptions): string {
  const grid = calculatePaginationGrid(mindMap, options);
  const title = escapeXML(mindMap.title || 'Mapa Mental');
  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const theme = THEMES[mindMap.themeId] || THEMES.default;
  const bgColor = options.includeBackground ? (theme.background || '#ffffff') : '#ffffff';

  // Standard @page size rule:
  // For standard paper sizes: size: a4 landscape; or size: letter portrait;
  // For custom or poster: size: <width>mm <height>mm; (WITHOUT orientation suffix to prevent CSS syntax error)
  const stdSize = options.paperSize.toLowerCase();
  let pageSizeCss = '';
  if (['a4', 'a3', 'letter', 'legal'].includes(stdSize)) {
    pageSizeCss = `${stdSize} ${grid.effectiveOrientation}`;
  } else {
    pageSizeCss = `${grid.paperWidthMm}mm ${grid.paperHeightMm}mm`;
  }

  const marginMm = options.marginMm ?? 6;

  const parts: string[] = [];

  parts.push(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title} - Impresión PDF</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: ${pageSizeCss};
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-sheet {
      width: ${grid.paperWidthMm}mm;
      height: ${grid.paperHeightMm}mm;
      position: relative;
      background: ${bgColor};
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      display: flex;
      flex-direction: column;
      margin: 16px auto;
      padding: ${marginMm}mm;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
      box-sizing: border-box;
    }
    .page-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    @media print {
      html, body {
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: ${bgColor} !important;
        overflow: hidden !important;
      }
      .page-sheet {
        margin: 0 !important;
        box-shadow: none !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        padding: ${marginMm}mm !important;
        box-sizing: border-box !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .page-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .no-print {
        display: none !important;
      }
    }
    .sheet-header {
      padding: 4px 8px;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.7);
      flex-shrink: 0;
      margin-bottom: 4px;
      border-radius: 4px;
    }
    .sheet-body {
      flex: 1 1 0% !important;
      min-height: 0 !important;
      width: 100% !important;
      height: 100% !important;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sheet-body svg {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      display: block;
      object-fit: contain;
    }
    .sheet-footer {
      padding: 4px 8px;
      border-top: 1px solid rgba(0,0,0,0.08);
      font-size: 8.5px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      background: rgba(255,255,255,0.7);
      flex-shrink: 0;
      margin-top: 4px;
      border-radius: 4px;
    }
    /* Corner Cut Marks */
    .cut-mark {
      position: absolute;
      width: 15mm;
      height: 15mm;
      pointer-events: none;
      z-index: 100;
    }
    .cut-mark-tl { top: 0; left: 0; border-right: 1px dashed #94a3b8; border-bottom: 1px dashed #94a3b8; }
    .cut-mark-tr { top: 0; right: 0; border-left: 1px dashed #94a3b8; border-bottom: 1px dashed #94a3b8; }
    .cut-mark-bl { bottom: 0; left: 0; border-right: 1px dashed #94a3b8; border-top: 1px dashed #94a3b8; }
    .cut-mark-br { bottom: 0; right: 0; border-left: 1px dashed #94a3b8; border-top: 1px dashed #94a3b8; }
  </style>
</head>
<body>
`);

  // Build each Page Sheet
  grid.tiles.forEach((tile) => {
    parts.push(`<div class="page-sheet">`);

    // Header
    if (options.includeHeaderFooter) {
      parts.push(`
        <div class="sheet-header">
          <span><strong>${title}</strong> • FreeMind Map Studio</span>
          <span>${tile.label}</span>
        </div>
      `);
    }

    // Body with Vector SVG
    parts.push(`<div class="sheet-body">`);
    const tileSvg = generateMindMapVectorSvg(mindMap, tile.viewBox, options);
    parts.push(tileSvg);

    // Optional Cut Marks for Multi-page Tiling
    if (options.includeCropMarks && grid.totalPages > 1) {
      parts.push(`<div class="cut-mark cut-mark-tl"></div>`);
      parts.push(`<div class="cut-mark cut-mark-tr"></div>`);
      parts.push(`<div class="cut-mark cut-mark-bl"></div>`);
      parts.push(`<div class="cut-mark cut-mark-br"></div>`);
    }
    parts.push(`</div>`); // close .sheet-body

    // Footer
    if (options.includeHeaderFooter) {
      parts.push(`
        <div class="sheet-footer">
          <span>Generado el ${dateStr} ${options.authorName ? `• Autor: ${escapeXML(options.authorName)}` : ''}</span>
          <span>Calidad Vectorial 100% Nítida • Resolución Infinita</span>
        </div>
      `);
    }

    parts.push(`</div>`); // close .page-sheet
  });

  parts.push(`
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`);

  return parts.join('\n');
}

/**
 * Triggers native browser print dialog configured for 100% Vector PDF export
 */
export function triggerBrowserPdfPrint(mindMap: MindMap, options: PdfExportOptions): void {
  const html = generatePrintHtml(mindMap, options);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback: hidden iframe print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 500);
    }
  }
}

/**
 * Direct file download helper
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads standalone vector SVG file
 */
export function downloadVectorSvg(mindMap: MindMap, options?: Partial<PdfExportOptions>): void {
  const svg = generateMindMapVectorSvg(mindMap, undefined, options);
  const safeTitle = mindMap.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mapa_mental';
  downloadFile(svg, `${safeTitle}_vector.svg`, 'image/svg+xml');
}
