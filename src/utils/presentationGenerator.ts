import { MindMap, CalculatedNodeLayout, SlideFrame } from '../types/mindmap';

/**
 * Automatically computes an intelligent presentation storyboard for a given MindMap and its layout.
 * Sequence:
 * 1. Overview (Full MindMap)
 * 2. Root Node Introduction
 * 3. Each main branch tree with its sub-branches in hierarchical order.
 */
export function generateDefaultPresentationSlides(
  mindMap: MindMap,
  layoutMap: Map<string, CalculatedNodeLayout>
): SlideFrame[] {
  const slides: SlideFrame[] = [];
  if (!mindMap.rootId || !layoutMap.has(mindMap.rootId)) {
    return slides;
  }

  // 1. Calculate Entire Map Overview Bounds
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  layoutMap.forEach((l) => {
    minX = Math.min(minX, l.bounds.minX);
    minY = Math.min(minY, l.bounds.minY);
    maxX = Math.max(maxX, l.bounds.maxX);
    maxY = Math.max(maxY, l.bounds.maxY);
  });

  const overviewPadding = 120;
  const overviewBounds = {
    x: minX - overviewPadding,
    y: minY - overviewPadding,
    width: Math.max(400, maxX - minX + overviewPadding * 2),
    height: Math.max(300, maxY - minY + overviewPadding * 2),
  };

  // Slide 1: General Overview
  slides.push({
    id: 'slide-overview',
    order: 1,
    title: `🗺️ Visión General: ${mindMap.title || 'Mapa Mental'}`,
    type: 'overview',
    bounds: overviewBounds,
    showNotes: false,
    color: '#3b82f6',
  });

  // Slide 2: Root Node
  const rootNode = mindMap.nodes[mindMap.rootId];
  const rootLayout = layoutMap.get(mindMap.rootId)!;
  const rootPadding = 24;
  slides.push({
    id: 'slide-root',
    order: 2,
    title: `🎯 ${rootNode.text || 'Tema Central'}`,
    type: 'node',
    nodeId: rootNode.id,
    bounds: {
      x: rootLayout.x - rootPadding,
      y: rootLayout.y - rootPadding,
      width: rootLayout.width + rootPadding * 2,
      height: rootLayout.height + rootPadding * 2,
    },
    showNotes: Boolean(rootNode.note),
    color: rootNode.color || '#2563eb',
  });

  // 3. Helper to recursively collect branch bounds
  const getSubtreeBounds = (nodeId: string): { minX: number; minY: number; maxX: number; maxY: number } => {
    const l = layoutMap.get(nodeId);
    if (!l) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    let sMinX = l.bounds.minX;
    let sMinY = l.bounds.minY;
    let sMaxX = l.bounds.maxX;
    let sMaxY = l.bounds.maxY;

    const n = mindMap.nodes[nodeId];
    if (n && n.children) {
      n.children.forEach((cId) => {
        const cBounds = getSubtreeBounds(cId);
        sMinX = Math.min(sMinX, cBounds.minX);
        sMinY = Math.min(sMinY, cBounds.minY);
        sMaxX = Math.max(sMaxX, cBounds.maxX);
        sMaxY = Math.max(sMaxY, cBounds.maxY);
      });
    }

    return { minX: sMinX, minY: sMinY, maxX: sMaxX, maxY: sMaxY };
  };

  // 4. Iterate main branches & major sub-branches
  let currentOrder = 3;
  if (rootNode.children && rootNode.children.length > 0) {
    rootNode.children.forEach((mainChildId) => {
      const mainNode = mindMap.nodes[mainChildId];
      if (!mainNode || !layoutMap.has(mainChildId)) return;

      const branchBounds = getSubtreeBounds(mainChildId);
      const bPadding = 32;

      // Add main branch full frame
      slides.push({
        id: `slide-branch-${mainChildId}`,
        order: currentOrder++,
        title: `📌 ${mainNode.text || 'Rama Principal'}`,
        type: 'branch',
        nodeId: mainChildId,
        bounds: {
          x: branchBounds.minX - bPadding,
          y: branchBounds.minY - bPadding,
          width: Math.max(200, branchBounds.maxX - branchBounds.minX + bPadding * 2),
          height: Math.max(140, branchBounds.maxY - branchBounds.minY + bPadding * 2),
        },
        showNotes: Boolean(mainNode.note),
        color: mainNode.color || '#3b82f6',
      });

      // Add individual focused slide for sub-children if they have rich content (notes, children, etc.)
      if (mainNode.children && mainNode.children.length > 0) {
        mainNode.children.forEach((subChildId) => {
          const subNode = mindMap.nodes[subChildId];
          const subLayout = layoutMap.get(subChildId);
          if (!subNode || !subLayout) return;

          const subTreeBounds = getSubtreeBounds(subChildId);
          const subPadding = 24;

          slides.push({
            id: `slide-sub-${subChildId}`,
            order: currentOrder++,
            title: `• ${subNode.text || 'Detalle'}`,
            type: subNode.children && subNode.children.length > 0 ? 'branch' : 'node',
            nodeId: subChildId,
            bounds: {
              x: subTreeBounds.minX - subPadding,
              y: subTreeBounds.minY - subPadding,
              width: Math.max(160, subTreeBounds.maxX - subTreeBounds.minX + subPadding * 2),
              height: Math.max(100, subTreeBounds.maxY - subTreeBounds.minY + subPadding * 2),
            },
            showNotes: Boolean(subNode.note),
            color: subNode.color || mainNode.color || '#6366f1',
          });
        });
      }
    });
  }

  return slides;
}
