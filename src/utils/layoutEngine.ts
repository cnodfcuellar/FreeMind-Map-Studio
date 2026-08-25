import { MindMap, MindNode, CalculatedNodeLayout, NodeSide, EdgeProfile } from '../types/mindmap';

const HORIZONTAL_GAP = 54;
const VERTICAL_GAP = 14;
const ROOT_HORIZONTAL_GAP = 68;

// Estimation of node size based on text and components
export function estimateNodeSize(node: MindNode): { width: number; height: number } {
  const isRoot = !node.parentId;
  const fontSize = node.fontSize || (isRoot ? 16 : 14);
  
  // Base padding
  const paddingX = isRoot ? 24 : 14;
  const paddingY = isRoot ? 12 : 8;
  
  // Extra width for icons, progress, badges
  let extraWidth = 0;
  if (node.icons && node.icons.length > 0) {
    extraWidth += node.icons.length * 20 + 6;
  }
  if (node.progress !== undefined) {
    extraWidth += 24;
  }
  if (node.link) {
    extraWidth += 18;
  }
  if (node.note) {
    extraWidth += 18;
  }

  // Node Image dimensions
  let imageExtraHeight = 0;
  let imageMinWidth = 0;
  if (node.imageUrl) {
    if (node.imagePosition === 'background') {
      imageMinWidth = 70;
      imageExtraHeight = 20;
    } else {
      const imgW = node.imageWidth || 120;
      const imgH = node.imageHeight || 80;
      imageExtraHeight = imgH + 8;
      imageMinWidth = imgW;
    }
  }

  // Tags are rendered in the bottom row of the node
  let extraHeight = 0;
  let tagMinWidth = 0;
  if (node.tags && node.tags.length > 0) {
    extraHeight += 22; // Tag bar height + top border/margin
    tagMinWidth = Math.min(node.tags.reduce((acc, t) => acc + t.length * 7 + 16, 0), 280);
  }
  
  const charWidth = fontSize * 0.58;
  const lines = (node.text || ' ').split('\n');

  // Check if there is a specified custom width or symmetrical 1:1 shape
  let customW = node.customWidth;
  if (node.shape === 'square' || node.shape === 'circle') {
    customW = Math.max(node.customWidth || 0, node.customHeight || 0);
  }

  let titleWidth = 0;
  let titleHeight = 0;

  if (customW && customW > 0) {
    // Width is constrained by user slider: wrap lines according to available width
    const availTextWidth = Math.max(customW - (paddingX * 2 + extraWidth), 30);
    const charsPerLine = Math.max(Math.floor(availTextWidth / charWidth), 1);
    let wrappedTitleLines = 0;
    for (const l of lines) {
      wrappedTitleLines += Math.max(Math.ceil((l.length || 1) / charsPerLine), 1);
    }
    titleWidth = availTextWidth;
    titleHeight = wrappedTitleLines * (fontSize * 1.38);
  } else {
    // Width is unconstrained / auto
    const maxLineLength = Math.max(...lines.map(l => l.length), 1);
    titleWidth = Math.min(Math.max(maxLineLength * charWidth, 40), 400);
    titleHeight = lines.length * (fontSize * 1.35);
  }

  // Body text dimensions
  let bodyWidth = 0;
  let bodyHeight = 0;
  if (node.body && node.body.trim().length > 0) {
    const bodyFontSize = node.bodyFontSize || (isRoot ? 13 : 12);
    const bodyLines = node.body.split('\n');
    const bodyCharWidth = bodyFontSize * 0.56;

    if (customW && customW > 0) {
      const availBodyWidth = Math.max(customW - (paddingX * 2), 30);
      const bodyCharsPerLine = Math.max(Math.floor(availBodyWidth / bodyCharWidth), 1);
      let wrappedBodyLines = 0;
      for (const bl of bodyLines) {
        wrappedBodyLines += Math.max(Math.ceil((bl.length || 1) / bodyCharsPerLine), 1);
      }
      bodyWidth = availBodyWidth;
      bodyHeight = wrappedBodyLines * (bodyFontSize * 1.4) + 6;
    } else {
      const maxBodyLineLength = Math.max(...bodyLines.map(l => l.length), 1);
      bodyWidth = Math.min(Math.max(maxBodyLineLength * bodyCharWidth, 40), 420);
      bodyHeight = bodyLines.length * (bodyFontSize * 1.4) + 6;
    }
  }
  
  const contentWidth = Math.max(titleWidth, bodyWidth);
  const contentHeight = titleHeight + bodyHeight;

  let width = Math.round(Math.max(contentWidth + paddingX * 2 + extraWidth, tagMinWidth + paddingX * 2, imageMinWidth + paddingX * 2));
  let height = Math.round(Math.max(contentHeight + paddingY * 2 + extraHeight + imageExtraHeight, (isRoot ? 48 : 34) + extraHeight + imageExtraHeight));

  // Custom User-Defined Width and Height
  if (node.customWidth && node.customWidth > 0) {
    width = Math.max(width, node.customWidth);
  }
  if (node.customHeight && node.customHeight > 0) {
    height = Math.max(height, node.customHeight);
  }

  // Shape specific dimensions adjustments
  if (node.shape === 'square' || node.shape === 'circle') {
    const dim = Math.max(width, height, node.customWidth || 0, node.customHeight || 0, 48);
    width = dim;
    height = dim;
  } else if (node.shape === 'star') {
    const baseW = Math.max(width + 48, 100);
    width = node.customWidth || baseW;
    // Double default star height so it's upright and tall rather than flat
    height = node.customHeight || Math.round(Math.max(height * 2.2, width * 0.95, 96));
  } else if (node.shape === 'hexagon') {
    width = node.customWidth || (width + 48);
    height = node.customHeight || Math.max(height, 42);
  } else if (node.shape === 'arrow') {
    width = node.customWidth || (width + 52);
    height = node.customHeight || Math.max(height, 42);
  }
  
  return { width, height };
}

// ----------------------------------------------------
// 1. HORIZONTAL SUBTREE METRICS (Standard, Left, Right)
// ----------------------------------------------------
interface SubTreeLayout {
  id: string;
  width: number;
  height: number;
  subtreeHeight: number;
  childrenLayouts: SubTreeLayout[];
}

export function nodeOrDescendantHasCloud(nodeId: string, nodes: Record<string, MindNode>): boolean {
  const node = nodes[nodeId];
  if (!node) return false;
  if (node.cloud?.enabled) return true;
  if (node.children && !node.folded) {
    for (const cid of node.children) {
      if (nodeOrDescendantHasCloud(cid, nodes)) return true;
    }
  }
  return false;
}

function calculateSubTreeMetrics(
  nodeId: string,
  nodes: Record<string, MindNode>,
  verticalGap: number = VERTICAL_GAP
): SubTreeLayout {
  const node = nodes[nodeId];
  if (!node) {
    return { id: nodeId, width: 60, height: 30, subtreeHeight: 30, childrenLayouts: [] };
  }

  const { width, height } = estimateNodeSize(node);
  const hasCloud = Boolean(node.cloud?.enabled);
  const cloudPad = hasCloud ? 36 : 0;

  if (node.folded || !node.children || node.children.length === 0) {
    return {
      id: nodeId,
      width: width + cloudPad,
      height: height + cloudPad,
      subtreeHeight: height + cloudPad,
      childrenLayouts: [],
    };
  }

  const childrenLayouts = node.children
    .filter(childId => Boolean(nodes[childId]))
    .map(childId => calculateSubTreeMetrics(childId, nodes, verticalGap));

  let totalChildrenHeight = 0;
  for (let i = 0; i < childrenLayouts.length; i++) {
    totalChildrenHeight += childrenLayouts[i].subtreeHeight;
    if (i < childrenLayouts.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? verticalGap + 36
        : (currHasCloud || nextHasCloud)
        ? verticalGap + 24
        : verticalGap;
      totalChildrenHeight += gap;
    }
  }

  const subtreeHeight = Math.max(height + cloudPad, totalChildrenHeight + cloudPad);

  return {
    id: nodeId,
    width: width + cloudPad,
    height: height + cloudPad,
    subtreeHeight,
    childrenLayouts,
  };
}

// ----------------------------------------------------
// 2. VERTICAL SUBTREE METRICS (Top, Bottom, Balanced-Horizontal)
// ----------------------------------------------------
interface SubTreeVerticalLayout {
  id: string;
  width: number;
  height: number;
  subtreeWidth: number;
  childrenLayouts: SubTreeVerticalLayout[];
}

function calculateSubTreeVerticalMetrics(
  nodeId: string,
  nodes: Record<string, MindNode>,
  horizontalGap: number = HORIZONTAL_GAP
): SubTreeVerticalLayout {
  const node = nodes[nodeId];
  if (!node) {
    return { id: nodeId, width: 60, height: 30, subtreeWidth: 60, childrenLayouts: [] };
  }

  const { width, height } = estimateNodeSize(node);
  const hasCloud = Boolean(node.cloud?.enabled);
  const cloudPad = hasCloud ? 36 : 0;

  if (node.folded || !node.children || node.children.length === 0) {
    return {
      id: nodeId,
      width: width + cloudPad,
      height: height + cloudPad,
      subtreeWidth: width + cloudPad,
      childrenLayouts: [],
    };
  }

  const childrenLayouts = node.children
    .filter(childId => Boolean(nodes[childId]))
    .map(childId => calculateSubTreeVerticalMetrics(childId, nodes, horizontalGap));

  let totalChildrenWidth = 0;
  for (let i = 0; i < childrenLayouts.length; i++) {
    totalChildrenWidth += childrenLayouts[i].subtreeWidth;
    if (i < childrenLayouts.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenLayouts[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? horizontalGap + 36
        : (currHasCloud || nextHasCloud)
        ? horizontalGap + 24
        : horizontalGap;
      totalChildrenWidth += gap;
    }
  }

  const subtreeWidth = Math.max(width + cloudPad, totalChildrenWidth + cloudPad);

  return {
    id: nodeId,
    width: width + cloudPad,
    height: height + cloudPad,
    subtreeWidth,
    childrenLayouts,
  };
}

// ----------------------------------------------------
// 3. MAIN COMPUTE LAYOUT FUNCTION
// ----------------------------------------------------
export function computeMindMapLayout(
  mindMap: MindMap,
  canvasCenter: { x: number; y: number } = { x: 0, y: 0 }
): Map<string, CalculatedNodeLayout> {
  const layoutMap = new Map<string, CalculatedNodeLayout>();
  const rootNode = mindMap.nodes[mindMap.rootId];
  
  if (!rootNode) return layoutMap;

  const hGap = mindMap.horizontalGap !== undefined ? mindMap.horizontalGap : HORIZONTAL_GAP;
  const vGap = mindMap.verticalGap !== undefined ? mindMap.verticalGap : VERTICAL_GAP;
  const rootHGap = Math.max(48, Math.round(hGap * 1.3));

  // Vertical layout specific gaps (generous vertical levels and sibling horizontal breathing room)
  const vertSiblingHGap = Math.max(20, Math.round(hGap * 0.9 + 10));
  const vertLevelVGap = Math.max(50, Math.round(vGap * 2.8 + 45));
  const vertRootVGap = Math.max(70, Math.round(vGap * 3.4 + 60));

  const rootSize = estimateNodeSize(rootNode);
  const rootLayout: CalculatedNodeLayout = {
    id: rootNode.id,
    x: canvasCenter.x - rootSize.width / 2,
    y: canvasCenter.y - rootSize.height / 2,
    width: rootSize.width,
    height: rootSize.height,
    side: 'root',
    depth: 0,
    branchIndex: 0,
    bounds: {
      minX: canvasCenter.x - rootSize.width / 2,
      maxX: canvasCenter.x + rootSize.width / 2,
      minY: canvasCenter.y - rootSize.height / 2,
      maxY: canvasCenter.y + rootSize.height / 2,
    },
  };
  layoutMap.set(rootNode.id, rootLayout);

  if (rootNode.folded || !rootNode.children || rootNode.children.length === 0) {
    return layoutMap;
  }

  const validChildren = rootNode.children.filter(id => Boolean(mindMap.nodes[id]));
  const layoutType = mindMap.layout || 'standard';

  // ------------------------------------------------------------------
  // MODE 1: RADIAL (Hijos agrupados alrededor de su propio padre local)
  // ------------------------------------------------------------------
  if (layoutType === 'radial') {
    layoutRadialTree(rootLayout, validChildren, mindMap.nodes, layoutMap, canvasCenter, hGap, vGap);
  }
  // ------------------------------------------------------------------
  // MODE 2: CIRCULAR CONCÉNTRICO (Capas concéntricas alrededor de la raíz)
  // ------------------------------------------------------------------
  else if (layoutType === 'circular') {
    layoutCircularTree(rootLayout, validChildren, mindMap.nodes, layoutMap, canvasCenter, hGap, vGap);
  }
  // ------------------------------------------------------------------
  // MODE 3: HACIA ABAJO (Organigrama descendente / Tree Down)
  // ------------------------------------------------------------------
  else if (layoutType === 'bottom' || layoutType === 'tree-down') {
    layoutVerticalBranch(validChildren, 'bottom', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
  }
  // ------------------------------------------------------------------
  // MODE 4: HACIA ARRIBA (Organigrama ascendente / Tree Up)
  // ------------------------------------------------------------------
  else if (layoutType === 'top') {
    layoutVerticalBranch(validChildren, 'top', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
  }
  // ------------------------------------------------------------------
  // MODE 5: EQUILIBRADO HORIZONTAL (Doble lado Arriba / Abajo)
  // ------------------------------------------------------------------
  else if (layoutType === 'balanced-horizontal') {
    const topChildren: string[] = [];
    const bottomChildren: string[] = [];

    validChildren.forEach((childId, idx) => {
      const child = mindMap.nodes[childId];
      if (child.side === 'top') {
        topChildren.push(childId);
      } else if (child.side === 'bottom') {
        bottomChildren.push(childId);
      } else {
        if (idx % 2 === 0) {
          bottomChildren.push(childId);
        } else {
          topChildren.push(childId);
        }
      }
    });

    layoutVerticalBranch(topChildren, 'top', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
    layoutVerticalBranch(bottomChildren, 'bottom', rootLayout, mindMap.nodes, layoutMap, vertRootVGap, vertSiblingHGap, vertLevelVGap);
  }
  // ------------------------------------------------------------------
  // MODE 6, 7 & 8: EQUILIBRADO VERTICAL (STANDARD), SOLO DERECHA, SOLO IZQUIERDA
  // ------------------------------------------------------------------
  else {
    let rightChildren: string[] = [];
    let leftChildren: string[] = [];

    if (layoutType === 'right') {
      rightChildren = validChildren;
    } else if (layoutType === 'left') {
      leftChildren = validChildren;
    } else {
      // Standard dual layout (Equilibrado vertical)
      validChildren.forEach((childId, idx) => {
        const child = mindMap.nodes[childId];
        if (child.side === 'left') {
          leftChildren.push(childId);
        } else if (child.side === 'right') {
          rightChildren.push(childId);
        } else {
          if (idx % 2 === 0) {
            rightChildren.push(childId);
          } else {
            leftChildren.push(childId);
          }
        }
      });
    }

    // Layout Right Subtrees
    layoutBranchSide(rightChildren, 'right', rootLayout, mindMap.nodes, layoutMap, rootHGap, hGap, vGap);

    // Layout Left Subtrees
    layoutBranchSide(leftChildren, 'left', rootLayout, mindMap.nodes, layoutMap, rootHGap, hGap, vGap);
  }

  // Layout any free floating nodes
  Object.values(mindMap.nodes).forEach(node => {
    if (node.isFreeFloating && !layoutMap.has(node.id)) {
      const size = estimateNodeSize(node);
      const pos = node.freePosition || { x: canvasCenter.x + 200, y: canvasCenter.y - 150 };
      layoutMap.set(node.id, {
        id: node.id,
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
        side: 'right',
        depth: 1,
        branchIndex: 99,
        bounds: { minX: pos.x, maxX: pos.x + size.width, minY: pos.y, maxY: pos.y + size.height }
      });
    }
  });

  // Universal collision resolution pass across all layout types
  resolveLayoutCollisions(layoutMap, mindMap, canvasCenter, layoutType, hGap, vGap);

  return layoutMap;
}

// ----------------------------------------------------
// HORIZONTAL BRANCH LAYOUT (Right / Left)
// ----------------------------------------------------
function layoutBranchSide(
  childIds: string[],
  side: 'right' | 'left',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  rootHorizontalGap: number,
  horizontalGap: number,
  verticalGap: number
) {
  if (childIds.length === 0) return;

  const metricsList = childIds.map(id => calculateSubTreeMetrics(id, nodes, verticalGap));
  
  let totalHeight = 0;
  for (let i = 0; i < metricsList.length; i++) {
    totalHeight += metricsList[i].subtreeHeight;
    if (i < metricsList.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(metricsList[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(metricsList[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? verticalGap + 36
        : (currHasCloud || nextHasCloud)
        ? verticalGap + 24
        : verticalGap;
      totalHeight += gap;
    }
  }

  let startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

  metricsList.forEach((metric, branchIdx) => {
    const node = nodes[metric.id];
    const nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraHGap = hasCloud ? 16 : 0;
    
    let nodeX = 0;
    if (side === 'right') {
      nodeX = parentLayout.x + parentLayout.width + rootHorizontalGap + extraHGap;
    } else {
      nodeX = parentLayout.x - metric.width - rootHorizontalGap - extraHGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: nodeX,
        maxX: nodeX + metric.width,
        minY: startY,
        maxY: startY + metric.subtreeHeight,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutDescendants(metric.childrenLayouts, side, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = metricsList[branchIdx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? verticalGap + 36
      : (currHasCloud || nextHasCloud)
      ? verticalGap + 24
      : verticalGap;
    startY += metric.subtreeHeight + gap;
  });
}

function layoutDescendants(
  childrenMetrics: SubTreeLayout[],
  side: 'right' | 'left',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  branchIdx: number,
  horizontalGap: number,
  verticalGap: number
) {
  let totalHeight = 0;
  for (let i = 0; i < childrenMetrics.length; i++) {
    totalHeight += childrenMetrics[i].subtreeHeight;
    if (i < childrenMetrics.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? verticalGap + 36
        : (currHasCloud || nextHasCloud)
        ? verticalGap + 24
        : verticalGap;
      totalHeight += gap;
    }
  }

  let startY = parentLayout.y + parentLayout.height / 2 - totalHeight / 2;

  childrenMetrics.forEach((metric, idx) => {
    const node = nodes[metric.id];
    const nodeY = startY + metric.subtreeHeight / 2 - metric.height / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraHGap = hasCloud ? 14 : 0;

    let nodeX = 0;
    if (side === 'right') {
      nodeX = parentLayout.x + parentLayout.width + horizontalGap + extraHGap;
    } else {
      nodeX = parentLayout.x - metric.width - horizontalGap - extraHGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: nodeX,
        maxX: nodeX + metric.width,
        minY: startY,
        maxY: startY + metric.subtreeHeight,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutDescendants(metric.childrenLayouts, side, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = childrenMetrics[idx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? verticalGap + 36
      : (currHasCloud || nextHasCloud)
      ? verticalGap + 24
      : verticalGap;
    startY += metric.subtreeHeight + gap;
  });
}

// ----------------------------------------------------
// VERTICAL BRANCH LAYOUT (Bottom / Top)
// ----------------------------------------------------
function layoutVerticalBranch(
  childIds: string[],
  direction: 'top' | 'bottom',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  rootVerticalGap: number,
  horizontalGap: number,
  verticalGap: number
) {
  if (childIds.length === 0) return;

  const metricsList = childIds.map(id => calculateSubTreeVerticalMetrics(id, nodes, horizontalGap));
  
  let totalWidth = 0;
  for (let i = 0; i < metricsList.length; i++) {
    totalWidth += metricsList[i].subtreeWidth;
    if (i < metricsList.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(metricsList[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(metricsList[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? horizontalGap + 36
        : (currHasCloud || nextHasCloud)
        ? horizontalGap + 24
        : horizontalGap;
      totalWidth += gap;
    }
  }

  let startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

  metricsList.forEach((metric, branchIdx) => {
    const node = nodes[metric.id];
    const nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraVGap = hasCloud ? 16 : 0;
    
    let nodeY = 0;
    if (direction === 'bottom') {
      nodeY = parentLayout.y + parentLayout.height + rootVerticalGap + extraVGap;
    } else {
      nodeY = parentLayout.y - metric.height - rootVerticalGap - extraVGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side: direction,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: startX,
        maxX: startX + metric.subtreeWidth,
        minY: nodeY,
        maxY: nodeY + metric.height,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutVerticalDescendants(metric.childrenLayouts, direction, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = metricsList[branchIdx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? horizontalGap + 36
      : (currHasCloud || nextHasCloud)
      ? horizontalGap + 24
      : horizontalGap;
    startX += metric.subtreeWidth + gap;
  });
}

function layoutVerticalDescendants(
  childrenMetrics: SubTreeVerticalLayout[],
  direction: 'top' | 'bottom',
  parentLayout: CalculatedNodeLayout,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  branchIdx: number,
  horizontalGap: number,
  verticalGap: number
) {
  let totalWidth = 0;
  for (let i = 0; i < childrenMetrics.length; i++) {
    totalWidth += childrenMetrics[i].subtreeWidth;
    if (i < childrenMetrics.length - 1) {
      const currHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i].id, nodes);
      const nextHasCloud = nodeOrDescendantHasCloud(childrenMetrics[i + 1].id, nodes);
      const gap = (currHasCloud && nextHasCloud)
        ? horizontalGap + 36
        : (currHasCloud || nextHasCloud)
        ? horizontalGap + 24
        : horizontalGap;
      totalWidth += gap;
    }
  }

  let startX = parentLayout.x + parentLayout.width / 2 - totalWidth / 2;

  childrenMetrics.forEach((metric, idx) => {
    const node = nodes[metric.id];
    const nodeX = startX + metric.subtreeWidth / 2 - metric.width / 2;
    const hasCloud = Boolean(node.cloud?.enabled);
    const extraVGap = hasCloud ? 14 : 0;

    let nodeY = 0;
    if (direction === 'bottom') {
      nodeY = parentLayout.y + parentLayout.height + verticalGap + extraVGap;
    } else {
      nodeY = parentLayout.y - metric.height - verticalGap - extraVGap;
    }

    const calculatedLayout: CalculatedNodeLayout = {
      id: metric.id,
      x: nodeX,
      y: nodeY,
      width: metric.width,
      height: metric.height,
      side: direction,
      depth: parentLayout.depth + 1,
      branchIndex: branchIdx,
      bounds: {
        minX: startX,
        maxX: startX + metric.subtreeWidth,
        minY: nodeY,
        maxY: nodeY + metric.height,
      },
    };

    layoutMap.set(metric.id, calculatedLayout);

    if (!node.folded && metric.childrenLayouts.length > 0) {
      layoutVerticalDescendants(metric.childrenLayouts, direction, calculatedLayout, nodes, layoutMap, branchIdx, horizontalGap, verticalGap);
    }

    const nextMetric = childrenMetrics[idx + 1];
    const currHasCloud = nodeOrDescendantHasCloud(metric.id, nodes);
    const nextHasCloud = nextMetric ? nodeOrDescendantHasCloud(nextMetric.id, nodes) : false;
    const gap = (currHasCloud && nextHasCloud)
      ? horizontalGap + 36
      : (currHasCloud || nextHasCloud)
      ? horizontalGap + 24
      : horizontalGap;
    startX += metric.subtreeWidth + gap;
  });
}

// ----------------------------------------------------
// 4. RADIAL LAYOUT (Distribución angular uniforme de 360° y expansión radial concéntrica)
// ----------------------------------------------------
function layoutRadialTree(
  rootLayout: CalculatedNodeLayout,
  rootChildren: string[],
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  canvasCenter: { x: number; y: number },
  horizontalGap: number,
  verticalGap: number
) {
  if (rootChildren.length === 0) return;

  const count = rootChildren.length;

  // Measure maximum child dimensions
  let maxChildW = 90;
  let maxChildH = 34;
  rootChildren.forEach(cid => {
    const node = nodes[cid];
    if (node) {
      const size = estimateNodeSize(node);
      maxChildW = Math.max(maxChildW, size.width);
      maxChildH = Math.max(maxChildH, size.height);
    }
  });

  // Calculate base radius for level 1 (root to children)
  const sectorSpan = (2 * Math.PI) / count;
  const chordRequired = Math.max(maxChildW, maxChildH) + verticalGap + 28;
  const chordRadius = chordRequired / (2 * Math.sin(Math.max(0.04, sectorSpan / 2)));
  const rootClearance = (rootLayout.width + maxChildW) / 2 + horizontalGap + 50;
  const baseRadius = Math.max(190, chordRadius, rootClearance);

  // Distribute 360 degrees UNIFORMLY among all root children starting from top (-PI/2)
  rootChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    const startAngle = -Math.PI / 2 + idx * sectorSpan;
    const endAngle = startAngle + sectorSpan;
    const midAngle = startAngle + sectorSpan / 2;

    const childSize = estimateNodeSize(childNode);
    const centerX = canvasCenter.x + baseRadius * Math.cos(midAngle);
    const centerY = canvasCenter.y + baseRadius * Math.sin(midAngle);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'radial',
      depth: 1,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutRadialSubtree(
        childId,
        childLayout,
        startAngle,
        endAngle,
        baseRadius,
        2,
        nodes,
        layoutMap,
        canvasCenter,
        horizontalGap,
        verticalGap
      );
    }
  });
}

function layoutRadialSubtree(
  parentId: string,
  parentLayout: CalculatedNodeLayout,
  startAngle: number,
  endAngle: number,
  parentRadius: number,
  depth: number,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  canvasCenter: { x: number; y: number },
  horizontalGap: number,
  verticalGap: number
) {
  const parentNode = nodes[parentId];
  if (!parentNode || parentNode.folded || !parentNode.children || parentNode.children.length === 0) return;

  const validChildren = parentNode.children.filter(id => Boolean(nodes[id]));
  if (validChildren.length === 0) return;

  const count = validChildren.length;

  let maxChildW = 90;
  let maxChildH = 34;
  validChildren.forEach(cid => {
    const node = nodes[cid];
    if (node) {
      const size = estimateNodeSize(node);
      maxChildW = Math.max(maxChildW, size.width);
      maxChildH = Math.max(maxChildH, size.height);
    }
  });

  const sectorSpan = endAngle - startAngle;
  const availableSpan = Math.min(sectorSpan * 0.92, Math.PI * 0.85);
  const stepDist = (parentLayout.width + maxChildW) / 2 + horizontalGap + 40;
  
  // Calculate minimum radius so that adjacent siblings at this level do not overlap
  const childSlice = availableSpan / count;
  const reqChord = maxChildH + verticalGap + 18;
  const minChordRadius = reqChord / (2 * Math.sin(Math.max(0.04, childSlice / 2)));
  const currentRadius = Math.max(parentRadius + stepDist, minChordRadius);

  const parentMidAngle = (startAngle + endAngle) / 2;

  validChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    let midAngle = parentMidAngle;
    let childStartAngle = startAngle;
    let childEndAngle = endAngle;

    if (count === 1) {
      midAngle = parentMidAngle;
      childStartAngle = parentMidAngle - sectorSpan / 2;
      childEndAngle = parentMidAngle + sectorSpan / 2;
    } else {
      midAngle = parentMidAngle - availableSpan / 2 + (idx + 0.5) * childSlice;
      childStartAngle = midAngle - childSlice / 2;
      childEndAngle = midAngle + childSlice / 2;
    }

    const childSize = estimateNodeSize(childNode);
    const centerX = canvasCenter.x + currentRadius * Math.cos(midAngle);
    const centerY = canvasCenter.y + currentRadius * Math.sin(midAngle);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'radial',
      depth,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutRadialSubtree(
        childId,
        childLayout,
        childStartAngle,
        childEndAngle,
        currentRadius,
        depth + 1,
        nodes,
        layoutMap,
        canvasCenter,
        horizontalGap,
        verticalGap
      );
    }
  });
}

// ----------------------------------------------------
// 5. CIRCULAR CONCENTRIC LAYOUT (Concéntrico por capas con partición angular)
// ----------------------------------------------------
function getSubtreeLeafWeight(nodeId: string, nodes: Record<string, MindNode>): number {
  const node = nodes[nodeId];
  if (!node || node.folded || !node.children || node.children.length === 0) {
    return 1;
  }
  const validChildren = node.children.filter(cid => Boolean(nodes[cid]));
  if (validChildren.length === 0) return 1;

  return validChildren.reduce((acc, cid) => acc + getSubtreeLeafWeight(cid, nodes), 0);
}

function layoutCircularTree(
  rootLayout: CalculatedNodeLayout,
  rootChildren: string[],
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  canvasCenter: { x: number; y: number },
  horizontalGap: number,
  verticalGap: number
) {
  if (rootChildren.length === 0) return;

  const count = rootChildren.length;
  
  // Calculate maximum dimensions
  let maxChildW = 100;
  let maxChildH = 36;
  rootChildren.forEach(cid => {
    const node = nodes[cid];
    if (node) {
      const size = estimateNodeSize(node);
      maxChildW = Math.max(maxChildW, size.width);
      maxChildH = Math.max(maxChildH, size.height);
    }
  });

  const sectorSpan = (2 * Math.PI) / count;
  const reqChord = Math.max(maxChildW, maxChildH) + verticalGap + 36;
  const chordRadius = reqChord / (2 * Math.sin(Math.max(0.04, sectorSpan / 2)));
  const rootClearanceRadius = (rootLayout.width + maxChildW) / 2 + horizontalGap + 80;
  const baseRadius = Math.max(280, chordRadius, rootClearanceRadius);
  const ringStep = Math.max(220, horizontalGap * 2.5 + 100);

  rootChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    const startA = -Math.PI / 2 + (2 * Math.PI * idx) / count;
    const endA = startA + sectorSpan;
    const midA = (startA + endA) / 2;

    const childSize = estimateNodeSize(childNode);

    const centerX = canvasCenter.x + baseRadius * Math.cos(midA);
    const centerY = canvasCenter.y + baseRadius * Math.sin(midA);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'circular',
      depth: 1,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutCircularDescendants(
        childId,
        childLayout,
        startA,
        endA,
        2,
        baseRadius + ringStep,
        ringStep,
        canvasCenter,
        nodes,
        layoutMap,
        horizontalGap,
        verticalGap
      );
    }
  });
}

function layoutCircularDescendants(
  parentId: string,
  parentLayout: CalculatedNodeLayout,
  startAngle: number,
  endAngle: number,
  depth: number,
  currentRadius: number,
  ringStep: number,
  canvasCenter: { x: number; y: number },
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>,
  horizontalGap: number,
  verticalGap: number
) {
  const parentNode = nodes[parentId];
  if (!parentNode || parentNode.folded || !parentNode.children || parentNode.children.length === 0) return;

  const validChildren = parentNode.children.filter(cid => Boolean(nodes[cid]));
  if (validChildren.length === 0) return;

  const weights = validChildren.map(cid => Math.max(1, getSubtreeLeafWeight(cid, nodes)));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;
  const totalSpan = endAngle - startAngle;

  let currA = startAngle;

  validChildren.forEach((childId, idx) => {
    const childNode = nodes[childId];
    if (!childNode) return;

    const weight = weights[idx];
    const arcSpan = (weight / totalWeight) * totalSpan;
    const subStart = currA;
    const subEnd = currA + arcSpan;
    const midA = (subStart + subEnd) / 2;

    const childSize = estimateNodeSize(childNode);

    // Guaranteed clearance on concentric ring
    const minChord = childSize.height + verticalGap + 24;
    const angleDelta = Math.max(0.03, arcSpan / 2);
    const chordClearance = minChord / (2 * Math.sin(angleDelta));
    const effectiveRadius = Math.max(currentRadius, chordClearance);

    const centerX = canvasCenter.x + effectiveRadius * Math.cos(midA);
    const centerY = canvasCenter.y + effectiveRadius * Math.sin(midA);

    const childX = centerX - childSize.width / 2;
    const childY = centerY - childSize.height / 2;

    const childLayout: CalculatedNodeLayout = {
      id: childId,
      x: childX,
      y: childY,
      width: childSize.width,
      height: childSize.height,
      side: 'circular',
      depth,
      branchIndex: idx,
      bounds: {
        minX: childX,
        maxX: childX + childSize.width,
        minY: childY,
        maxY: childY + childSize.height,
      },
    };

    layoutMap.set(childId, childLayout);

    if (!childNode.folded && childNode.children && childNode.children.length > 0) {
      layoutCircularDescendants(
        childId,
        childLayout,
        subStart,
        subEnd,
        depth + 1,
        effectiveRadius + ringStep,
        ringStep,
        canvasCenter,
        nodes,
        layoutMap,
        horizontalGap,
        verticalGap
      );
    }

    currA += arcSpan;
  });
}

// ----------------------------------------------------
// 6. UNIVERSAL COLLISION RESOLUTION PASS (Prevents overlaps across all layouts)
// ----------------------------------------------------
function shiftSubtree(
  nodeId: string,
  dx: number,
  dy: number,
  layoutMap: Map<string, CalculatedNodeLayout>,
  getDescendantIds: (id: string) => string[]
) {
  const allIds = [nodeId, ...getDescendantIds(nodeId)];
  for (const id of allIds) {
    const layout = layoutMap.get(id);
    if (layout) {
      layout.x += dx;
      layout.y += dy;
      layout.bounds.minX += dx;
      layout.bounds.maxX += dx;
      layout.bounds.minY += dy;
      layout.bounds.maxY += dy;
    }
  }
}

function resolveLayoutCollisions(
  layoutMap: Map<string, CalculatedNodeLayout>,
  mindMap: MindMap,
  canvasCenter: { x: number; y: number },
  layoutType: string,
  horizontalGap: number,
  verticalGap: number
) {
  const rootId = mindMap.rootId;
  const nodeIds = Array.from(layoutMap.keys()).filter(id => id !== rootId);
  if (nodeIds.length < 2) return;

  const minGapX = Math.max(20, Math.round(horizontalGap * 0.4));
  const minGapY = Math.max(16, Math.round(verticalGap * 0.7));

  // Build tree hierarchy map (nodeId -> all descendant IDs)
  const descendantsMap = new Map<string, string[]>();
  function getDescendantIds(id: string): string[] {
    if (descendantsMap.has(id)) return descendantsMap.get(id)!;
    const node = mindMap.nodes[id];
    let list: string[] = [];
    if (node && node.children) {
      for (const cid of node.children) {
        if (layoutMap.has(cid)) {
          list.push(cid);
          list = list.concat(getDescendantIds(cid));
        }
      }
    }
    descendantsMap.set(id, list);
    return list;
  }

  // Helper to check if childId is inside parentId's subtree
  function isDescendantOf(childId: string, parentId: string): boolean {
    const descs = getDescendantIds(parentId);
    return descs.includes(childId);
  }

  // Iterative relaxation passes
  const MAX_PASSES = 32;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let hasCollision = false;

    // Pass A: Node vs Node collisions
    for (let i = 0; i < nodeIds.length; i++) {
      const aId = nodeIds[i];
      const a = layoutMap.get(aId);
      if (!a) continue;
      const aCenter = { x: a.x + a.width / 2, y: a.y + a.height / 2 };

      for (let j = i + 1; j < nodeIds.length; j++) {
        const bId = nodeIds[j];
        const b = layoutMap.get(bId);
        if (!b) continue;
        const bCenter = { x: b.x + b.width / 2, y: b.y + b.height / 2 };

        // Check if bounding boxes with safety margins overlap
        const overlapX = (a.width / 2 + b.width / 2 + minGapX) - Math.abs(aCenter.x - bCenter.x);
        const overlapY = (a.height / 2 + b.height / 2 + minGapY) - Math.abs(aCenter.y - bCenter.y);

        if (overlapX > 0 && overlapY > 0) {
          hasCollision = true;

          // Determine direction of resolution based on layout type
          if (layoutType === 'standard' || layoutType === 'left' || layoutType === 'right') {
            // Horizontal trees: push apart along Y
            const pushY = (overlapY / 2) + 3;
            const sign = aCenter.y <= bCenter.y ? -1 : 1;
            shiftSubtree(a.id, 0, sign * pushY, layoutMap, getDescendantIds);
            shiftSubtree(b.id, 0, -sign * pushY, layoutMap, getDescendantIds);
          } else if (
            layoutType === 'top' ||
            layoutType === 'bottom' ||
            layoutType === 'balanced-horizontal' ||
            layoutType === 'tree-down'
          ) {
            // Vertical trees: push apart along X
            const pushX = (overlapX / 2) + 3;
            const sign = aCenter.x <= bCenter.x ? -1 : 1;
            shiftSubtree(a.id, sign * pushX, 0, layoutMap, getDescendantIds);
            shiftSubtree(b.id, -sign * pushX, 0, layoutMap, getDescendantIds);
          } else {
            // Radial & Circular: push outward away from canvas center and each other
            let dx = bCenter.x - aCenter.x;
            let dy = bCenter.y - aCenter.y;
            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
              dx = bCenter.x - canvasCenter.x || 1;
              dy = bCenter.y - canvasCenter.y || 1;
            }
            const dist = Math.hypot(dx, dy) || 1;
            const pushDist = Math.max(overlapX, overlapY) / 2 + 5;

            const nx = dx / dist;
            const ny = dy / dist;

            if (a.depth > b.depth) {
              shiftSubtree(a.id, -nx * pushDist * 1.5, -ny * pushDist * 1.5, layoutMap, getDescendantIds);
            } else if (b.depth > a.depth) {
              shiftSubtree(b.id, nx * pushDist * 1.5, ny * pushDist * 1.5, layoutMap, getDescendantIds);
            } else {
              shiftSubtree(a.id, -nx * pushDist, -ny * pushDist, layoutMap, getDescendantIds);
              shiftSubtree(b.id, nx * pushDist, ny * pushDist, layoutMap, getDescendantIds);
            }
          }
        }
      }
    }

    // Pass B: Cloud vs Node & Cloud vs Cloud collision resolution
    const cloudNodes = nodeIds.filter(id => Boolean(mindMap.nodes[id]?.cloud?.enabled));
    if (cloudNodes.length > 0) {
      const cloudGap = 16;
      for (const cId of cloudNodes) {
        const cBounds = computeCloudBounds(cId, mindMap.nodes, layoutMap);
        if (!cBounds) continue;
        const cCenter = { x: cBounds.x + cBounds.width / 2, y: cBounds.y + cBounds.height / 2 };

        // 1. Cloud vs external Nodes
        for (const nId of nodeIds) {
          if (nId === cId || isDescendantOf(nId, cId) || isDescendantOf(cId, nId)) continue;
          const nodeLayout = layoutMap.get(nId);
          if (!nodeLayout) continue;
          const nCenter = { x: nodeLayout.x + nodeLayout.width / 2, y: nodeLayout.y + nodeLayout.height / 2 };

          const overlapX = (cBounds.width / 2 + nodeLayout.width / 2 + cloudGap) - Math.abs(cCenter.x - nCenter.x);
          const overlapY = (cBounds.height / 2 + nodeLayout.height / 2 + cloudGap) - Math.abs(cCenter.y - nCenter.y);

          if (overlapX > 0 && overlapY > 0) {
            hasCollision = true;
            if (layoutType === 'standard' || layoutType === 'left' || layoutType === 'right') {
              const pushY = (overlapY / 2) + 4;
              const sign = cCenter.y <= nCenter.y ? -1 : 1;
              shiftSubtree(cId, 0, sign * pushY, layoutMap, getDescendantIds);
              shiftSubtree(nId, 0, -sign * pushY, layoutMap, getDescendantIds);
            } else if (
              layoutType === 'top' ||
              layoutType === 'bottom' ||
              layoutType === 'balanced-horizontal' ||
              layoutType === 'tree-down'
            ) {
              const pushX = (overlapX / 2) + 4;
              const sign = cCenter.x <= nCenter.x ? -1 : 1;
              shiftSubtree(cId, sign * pushX, 0, layoutMap, getDescendantIds);
              shiftSubtree(nId, -sign * pushX, 0, layoutMap, getDescendantIds);
            } else {
              const dx = nCenter.x - cCenter.x || 1;
              const dy = nCenter.y - cCenter.y || 1;
              const dist = Math.hypot(dx, dy) || 1;
              const pushDist = Math.max(overlapX, overlapY) / 2 + 6;
              shiftSubtree(cId, -(dx / dist) * pushDist, -(dy / dist) * pushDist, layoutMap, getDescendantIds);
              shiftSubtree(nId, (dx / dist) * pushDist, (dy / dist) * pushDist, layoutMap, getDescendantIds);
            }
          }
        }

        // 2. Cloud vs other Clouds
        for (const oId of cloudNodes) {
          if (oId === cId || isDescendantOf(oId, cId) || isDescendantOf(cId, oId)) continue;
          const oBounds = computeCloudBounds(oId, mindMap.nodes, layoutMap);
          if (!oBounds) continue;
          const oCenter = { x: oBounds.x + oBounds.width / 2, y: oBounds.y + oBounds.height / 2 };

          const overlapX = (cBounds.width / 2 + oBounds.width / 2 + cloudGap) - Math.abs(cCenter.x - oCenter.x);
          const overlapY = (cBounds.height / 2 + oBounds.height / 2 + cloudGap) - Math.abs(cCenter.y - oCenter.y);

          if (overlapX > 0 && overlapY > 0) {
            hasCollision = true;
            if (layoutType === 'standard' || layoutType === 'left' || layoutType === 'right') {
              const pushY = (overlapY / 2) + 4;
              const sign = cCenter.y <= oCenter.y ? -1 : 1;
              shiftSubtree(cId, 0, sign * pushY, layoutMap, getDescendantIds);
              shiftSubtree(oId, 0, -sign * pushY, layoutMap, getDescendantIds);
            } else if (
              layoutType === 'top' ||
              layoutType === 'bottom' ||
              layoutType === 'balanced-horizontal' ||
              layoutType === 'tree-down'
            ) {
              const pushX = (overlapX / 2) + 4;
              const sign = cCenter.x <= oCenter.x ? -1 : 1;
              shiftSubtree(cId, sign * pushX, 0, layoutMap, getDescendantIds);
              shiftSubtree(oId, -sign * pushX, 0, layoutMap, getDescendantIds);
            } else {
              const dx = oCenter.x - cCenter.x || 1;
              const dy = oCenter.y - cCenter.y || 1;
              const dist = Math.hypot(dx, dy) || 1;
              const pushDist = Math.max(overlapX, overlapY) / 2 + 6;
              shiftSubtree(cId, -(dx / dist) * pushDist, -(dy / dist) * pushDist, layoutMap, getDescendantIds);
              shiftSubtree(oId, (dx / dist) * pushDist, (dy / dist) * pushDist, layoutMap, getDescendantIds);
            }
          }
        }
      }
    }

    if (!hasCollision) break;
  }
}

// ----------------------------------------------------
// 6. 360° RAY & BOX INTERSECTION FOR RADIAL / CIRCULAR EDGES
// ----------------------------------------------------
function getBoxRayIntersection(
  box: { x: number; y: number; width: number; height: number },
  targetCenter: { x: number; y: number }
): { x: number; y: number } {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const dx = targetCenter.x - centerX;
  const dy = targetCenter.y - centerY;

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return { x: centerX, y: centerY };
  }

  const halfW = box.width / 2;
  const halfH = box.height / 2;

  if (Math.abs(dx) * halfH > Math.abs(dy) * halfW) {
    const signX = dx > 0 ? 1 : -1;
    const x = centerX + signX * halfW;
    const y = centerY + signX * halfW * (dy / dx);
    return { x, y };
  } else {
    const signY = dy > 0 ? 1 : -1;
    const y = centerY + signY * halfH;
    const x = centerX + signY * halfH * (dx / dy);
    return { x, y };
  }
}

// ----------------------------------------------------
// 7. EDGE PATH GENERATION
// ----------------------------------------------------
export function generateEdgePath(
  parentLayout: CalculatedNodeLayout,
  childLayout: CalculatedNodeLayout,
  edgeStyle: string = 'bezier',
  childShape: string = 'bubble'
): string {
  if (edgeStyle === 'hidden') return '';

  const parentCenterX = parentLayout.x + parentLayout.width / 2;
  const parentCenterY = parentLayout.y + parentLayout.height / 2;
  const childCenterX = childLayout.x + childLayout.width / 2;
  const childCenterY = childLayout.y + childLayout.height / 2;

  // Case A: Radial or Circular layout
  if (childLayout.side === 'radial' || childLayout.side === 'circular') {
    const start = getBoxRayIntersection(parentLayout, { x: childCenterX, y: childCenterY });
    const end = getBoxRayIntersection(childLayout, { x: parentCenterX, y: parentCenterY });

    if (edgeStyle === 'linear') {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    if (edgeStyle === 'sharp') {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }

    if (edgeStyle === 'horizontal') {
      const midX = (start.x + end.x) / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }

    // Default: Organic cubic bezier along vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const cx1 = start.x + dx * 0.4;
    const cy1 = start.y + dy * 0.4;
    const cx2 = start.x + dx * 0.6;
    const cy2 = start.y + dy * 0.6;

    return `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
  }

  // Case B: Vertical layout (top or bottom)
  if (childLayout.side === 'bottom') {
    const x1 = parentCenterX;
    const y1 = parentLayout.y + parentLayout.height;
    const x2 = childCenterX;
    let y2 = childLayout.y;
    if (childShape === 'fork') {
      y2 = childLayout.y + childLayout.height - 2;
    }

    if (edgeStyle === 'linear') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'sharp') {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'horizontal') {
      const stepY = y1 + Math.min(24, Math.abs(y2 - y1) * 0.4);
      return `M ${x1} ${y1} L ${x1} ${stepY} L ${x2} ${stepY} L ${x2} ${y2}`;
    }

    const dy = Math.max(Math.abs(y2 - y1), 20);
    const cy1 = y1 + dy * 0.45;
    const cy2 = y2 - dy * 0.45;
    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  }

  if (childLayout.side === 'top') {
    const x1 = parentCenterX;
    const y1 = parentLayout.y;
    const x2 = childCenterX;
    let y2 = childLayout.y + childLayout.height;
    if (childShape === 'fork') {
      y2 = childLayout.y + childLayout.height - 2;
    }

    if (edgeStyle === 'linear') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'sharp') {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
    }

    if (edgeStyle === 'horizontal') {
      const stepY = y1 - Math.min(24, Math.abs(y2 - y1) * 0.4);
      return `M ${x1} ${y1} L ${x1} ${stepY} L ${x2} ${stepY} L ${x2} ${y2}`;
    }

    const dy = Math.max(Math.abs(y2 - y1), 20);
    const cy1 = y1 - dy * 0.45;
    const cy2 = y2 + dy * 0.45;
    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  }

  // Case C: Standard Horizontal layout (right / left)
  const isRight =
    childLayout.side === 'right' ||
    (childLayout.side !== 'left' && childLayout.x >= parentLayout.x + parentLayout.width / 2);

  const x1 = isRight ? parentLayout.x + parentLayout.width : parentLayout.x;
  const y1 = parentLayout.y + parentLayout.height / 2;

  const x2 = isRight ? childLayout.x : childLayout.x + childLayout.width;
  let y2 = childLayout.y + childLayout.height / 2;

  if (childShape === 'fork') {
    y2 = childLayout.y + childLayout.height - 2;
  }

  if (edgeStyle === 'linear') {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (edgeStyle === 'sharp') {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  if (edgeStyle === 'horizontal') {
    const offset = isRight ? Math.min(28, Math.abs(x2 - x1) * 0.4) : -Math.min(28, Math.abs(x2 - x1) * 0.4);
    const midX = x1 + offset;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  // Default: Smooth organic Bezier curve (Freeplane & Mindomo style)
  const dx = Math.max(Math.abs(x2 - x1), 20);
  const cx1 = isRight ? x1 + dx * 0.45 : x1 - dx * 0.45;
  const cx2 = isRight ? x2 - dx * 0.45 : x2 + dx * 0.45;

  return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
}

// ----------------------------------------------------
// 8. VARIABLE-THICKNESS RIBBON EDGES
// ----------------------------------------------------
export function generateRibbonEdgePath(
  parentLayout: CalculatedNodeLayout,
  childLayout: CalculatedNodeLayout,
  edgeStyle: string = 'bezier',
  childShape: string = 'bubble',
  edgeProfile: EdgeProfile = 'uniform',
  baseWidth: number = 2.5
): string | null {
  if (!edgeProfile || edgeProfile === 'uniform' || edgeStyle === 'hidden') {
    return null;
  }

  const parentCenterX = parentLayout.x + parentLayout.width / 2;
  const parentCenterY = parentLayout.y + parentLayout.height / 2;
  const childCenterX = childLayout.x + childLayout.width / 2;
  const childCenterY = childLayout.y + childLayout.height / 2;

  let x1: number, y1: number, x2: number, y2: number;
  let cx1: number, cy1: number, cx2: number, cy2: number;

  if (childLayout.side === 'radial' || childLayout.side === 'circular') {
    const start = getBoxRayIntersection(parentLayout, { x: childCenterX, y: childCenterY });
    const end = getBoxRayIntersection(childLayout, { x: parentCenterX, y: parentCenterY });
    x1 = start.x;
    y1 = start.y;
    x2 = end.x;
    y2 = end.y;

    const dx = x2 - x1;
    const dy = y2 - y1;
    cx1 = x1 + dx * 0.4;
    cy1 = y1 + dy * 0.4;
    cx2 = x1 + dx * 0.6;
    cy2 = y1 + dy * 0.6;
  } else if (childLayout.side === 'bottom') {
    x1 = parentCenterX;
    y1 = parentLayout.y + parentLayout.height;
    x2 = childCenterX;
    y2 = childLayout.y;
    const dy = Math.max(Math.abs(y2 - y1), 20);
    cx1 = x1;
    cy1 = y1 + dy * 0.45;
    cx2 = x2;
    cy2 = y2 - dy * 0.45;
  } else if (childLayout.side === 'top') {
    x1 = parentCenterX;
    y1 = parentLayout.y;
    x2 = childCenterX;
    y2 = childLayout.y + childLayout.height;
    const dy = Math.max(Math.abs(y2 - y1), 20);
    cx1 = x1;
    cy1 = y1 - dy * 0.45;
    cx2 = x2;
    cy2 = y2 + dy * 0.45;
  } else {
    const isRight =
      childLayout.side === 'right' ||
      (childLayout.side !== 'left' && childLayout.x >= parentLayout.x + parentLayout.width / 2);

    x1 = isRight ? parentLayout.x + parentLayout.width : parentLayout.x;
    y1 = parentLayout.y + parentLayout.height / 2;
    x2 = isRight ? childLayout.x : childLayout.x + childLayout.width;
    y2 = childLayout.y + childLayout.height / 2;

    if (childShape === 'fork') {
      y2 = childLayout.y + childLayout.height - 2;
    }

    const dx = Math.max(Math.abs(x2 - x1), 20);
    cx1 = isRight ? x1 + dx * 0.45 : x1 - dx * 0.45;
    cx2 = isRight ? x2 - dx * 0.45 : x2 + dx * 0.45;
    cy1 = y1;
    cy2 = y2;
  }

  const effectiveBase = Math.max(2.2, baseWidth);
  const getWidthAtT = (t: number): number => {
    let factor = 1.0;
    if (edgeProfile === 'tapered') {
      factor = 0.35 + 2.65 * Math.pow(1 - t, 1.2);
    } else if (edgeProfile === 'spindle') {
      factor = 0.35 + 2.75 * Math.sin(Math.PI * t);
    } else if (edgeProfile === 'hourglass') {
      const centered = 2 * t - 1;
      factor = 0.45 + 2.55 * (centered * centered);
    }
    return Math.max(1.0, effectiveBase * factor);
  };

  const STEPS = 32;
  const topPoints: { x: number; y: number }[] = [];
  const bottomPoints: { x: number; y: number }[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    if (edgeStyle === 'linear') {
      px = (1 - t) * x1 + t * x2;
      py = (1 - t) * y1 + t * y2;
      tx = x2 - x1;
      ty = y2 - y1;
    } else if (edgeStyle === 'sharp') {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      if (t <= 0.5) {
        const subT = t / 0.5;
        px = (1 - subT) * x1 + subT * midX;
        py = y1;
        tx = midX - x1;
        ty = 0;
      } else {
        const subT = (t - 0.5) / 0.5;
        px = midX;
        py = (1 - subT) * y1 + subT * y2;
        tx = 0;
        ty = y2 - y1;
      }
    } else {
      const oneMinusT = 1 - t;
      const oneMinusT2 = oneMinusT * oneMinusT;
      const oneMinusT3 = oneMinusT2 * oneMinusT;
      const t2 = t * t;
      const t3 = t2 * t;

      px = oneMinusT3 * x1 + 3 * oneMinusT2 * t * cx1 + 3 * oneMinusT * t2 * cx2 + t3 * x2;
      py = oneMinusT3 * y1 + 3 * oneMinusT2 * t * cy1 + 3 * oneMinusT * t2 * cy2 + t3 * y2;

      tx = 3 * oneMinusT2 * (cx1 - x1) + 6 * oneMinusT * t * (cx2 - cx1) + 3 * t2 * (x2 - cx2);
      ty = 3 * oneMinusT2 * (cy1 - y1) + 6 * oneMinusT * t * (cy2 - cy1) + 3 * t2 * (y2 - cy2);
    }

    const len = Math.sqrt(tx * tx + ty * ty);
    let nx = 0;
    let ny = 1;
    if (len > 0.0001) {
      nx = -ty / len;
      ny = tx / len;
    }

    const halfW = getWidthAtT(t) / 2;

    topPoints.push({
      x: Number((px + nx * halfW).toFixed(2)),
      y: Number((py + ny * halfW).toFixed(2)),
    });
    bottomPoints.push({
      x: Number((px - nx * halfW).toFixed(2)),
      y: Number((py - ny * halfW).toFixed(2)),
    });
  }

  let pathStr = `M ${topPoints[0].x} ${topPoints[0].y}`;
  for (let i = 1; i < topPoints.length; i++) {
    pathStr += ` L ${topPoints[i].x} ${topPoints[i].y}`;
  }
  for (let i = bottomPoints.length - 1; i >= 0; i--) {
    pathStr += ` L ${bottomPoints[i].x} ${bottomPoints[i].y}`;
  }
  pathStr += ' Z';

  return pathStr;
}

// ----------------------------------------------------
// 9. CLOUD BOUNDS COMPUTATION
// ----------------------------------------------------
export function computeCloudBounds(
  nodeId: string,
  nodes: Record<string, MindNode>,
  layoutMap: Map<string, CalculatedNodeLayout>
): { x: number; y: number; width: number; height: number } | null {
  const node = nodes[nodeId];
  if (!node || !node.cloud?.enabled) return null;

  const nodeLayout = layoutMap.get(nodeId);
  if (!nodeLayout) return null;

  let minX = nodeLayout.x;
  let maxX = nodeLayout.x + nodeLayout.width;
  let minY = nodeLayout.y;
  let maxY = nodeLayout.y + nodeLayout.height;
  let maxChildCloudExtra = 0;

  function collectDescendantBounds(currentId: string) {
    const curr = nodes[currentId];
    if (!curr || curr.folded) return;
    curr.children.forEach(childId => {
      const childLayout = layoutMap.get(childId);
      if (childLayout) {
        minX = Math.min(minX, childLayout.x);
        maxX = Math.max(maxX, childLayout.x + childLayout.width);
        minY = Math.min(minY, childLayout.y);
        maxY = Math.max(maxY, childLayout.y + childLayout.height);

        const childNode = nodes[childId];
        if (childNode?.cloud?.enabled) {
          maxChildCloudExtra = Math.max(maxChildCloudExtra, 12);
        }
        collectDescendantBounds(childId);
      }
    });
  }

  collectDescendantBounds(nodeId);

  const basePadding = 18;
  const padding = basePadding + maxChildCloudExtra;
  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}
