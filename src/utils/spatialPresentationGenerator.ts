import { MindMap, SpatialSlideCard } from '../types/mindmap';

export type SpatialArrangementType = 'spiral' | 'constellation' | 'timeline' | 'grid';

/**
 * Generates an intelligent array of SpatialSlideCard items from the current MindMap.
 * Supports multiple cinematic spatial layouts:
 * - 'spiral': Progressive spiral with elegant rotation increments (0°, 15°, 30°, ...).
 * - 'constellation': Giant central root and orbit branches with radial rotations.
 * - 'timeline': Linear horizontal journey.
 * - 'grid': Clean structured matrix.
 */
export function generateDefaultSpatialSlides(
  mindMap: MindMap,
  arrangement: SpatialArrangementType = 'spiral'
): SpatialSlideCard[] {
  const slides: SpatialSlideCard[] = [];
  if (!mindMap.rootId || !mindMap.nodes[mindMap.rootId]) {
    return slides;
  }

  const rootNode = mindMap.nodes[mindMap.rootId];

  // Helper to extract clean content from a node
  const extractNodeContent = (nodeId: string) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return null;

    const subItems = (node.children || [])
      .map((cId) => mindMap.nodes[cId])
      .filter(Boolean)
      .map((c) => ({
        id: c.id,
        text: c.text,
        color: c.color,
      }));

    return {
      nodeId: node.id,
      titleText: node.text || 'Sin Título',
      bodyText: node.body,
      notesMarkdown: node.note,
      imageUrl: node.imageUrl,
      imageSize: 'medium' as const,
      icons: node.icons,
      tags: node.tags,
      progress: node.progress,
      subItems: subItems.length > 0 ? subItems : undefined,
    };
  };

  // Collect ordered nodes (Root first, then recursive traversal of main branches & children)
  const orderedNodeIds: string[] = [rootNode.id];
  const traverse = (nodeId: string) => {
    const n = mindMap.nodes[nodeId];
    if (!n || !n.children) return;
    n.children.forEach((cId) => {
      orderedNodeIds.push(cId);
      traverse(cId);
    });
  };
  traverse(rootNode.id);

  const cardWidth = 720;
  const cardHeight = 440;
  let orderCounter = 1;

  // Generate spatial coordinates based on arrangement
  if (arrangement === 'spiral') {
    // Elegant Fibonacci / Archimedean spiral
    let currentAngle = 0;
    let currentRadius = 0;
    const angleStep = 0.48; // in radians
    const radiusGrowth = 180;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const x = isRoot ? 0 : Math.round(Math.cos(currentAngle) * currentRadius);
      const y = isRoot ? 0 : Math.round(Math.sin(currentAngle) * currentRadius);
      const rot = isRoot ? 0 : Math.round(((currentAngle * 180) / Math.PI) * 0.45) % 360;
      const scale = isRoot ? 1.3 : Math.max(0.85, 1.05 - idx * 0.015);

      // Main Node Slide
      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: x - (cardWidth * scale) / 2,
          y: y - (cardHeight * scale) / 2,
          width: cardWidth,
          height: cardHeight,
          scale,
          rotation: rot,
        },
        content,
        style: {
          themeId: mindMap.themeId,
          contentAlign: isRoot ? 'center' : 'left',
        },
      });

      // Dedicated Note Slide if node has notes
      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        const noteAngle = currentAngle + 0.22;
        const noteRadius = currentRadius + 140;
        const noteX = Math.round(Math.cos(noteAngle) * noteRadius);
        const noteY = Math.round(Math.sin(noteAngle) * noteRadius);
        const noteRot = (rot + 8) % 360;

        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: noteX - (cardWidth * 0.95 * scale) / 2,
            y: noteY - (cardHeight * 0.95 * scale) / 2,
            width: cardWidth,
            height: cardHeight,
            scale: scale * 0.95,
            rotation: noteRot,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: {
            themeId: mindMap.themeId,
            contentAlign: 'left',
            borderColor: '#f59e0b',
            borderWidth: 2,
          },
        });
      }

      currentAngle += angleStep;
      currentRadius += radiusGrowth;
    });
  } else if (arrangement === 'constellation') {
    // Root in center, main branches orbiting with direct radial angles
    const rootContent = extractNodeContent(rootNode.id);
    if (rootContent) {
      slides.push({
        id: `spatial-${rootNode.id}-0`,
        order: orderCounter++,
        title: rootContent.titleText,
        isNoteSlide: false,
        spatial: {
          x: -cardWidth * 0.7,
          y: -cardHeight * 0.7,
          width: cardWidth,
          height: cardHeight,
          scale: 1.4,
          rotation: 0,
        },
        content: rootContent,
        style: { themeId: mindMap.themeId, contentAlign: 'center' },
      });

      if (rootContent.notesMarkdown && rootContent.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${rootNode.id}-0`,
          order: orderCounter++,
          title: `📝 Nota: ${rootContent.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: -cardWidth * 0.5 + 400,
            y: -cardHeight * 0.5 + 200,
            width: cardWidth,
            height: cardHeight,
            scale: 1.1,
            rotation: 12,
          },
          content: {
            nodeId: rootContent.nodeId,
            titleText: `Nota: ${rootContent.titleText}`,
            notesMarkdown: rootContent.notesMarkdown,
            icons: ['file-text'],
          },
          style: { themeId: mindMap.themeId, contentAlign: 'left', borderColor: '#f59e0b' },
        });
      }
    }

    const mainChildren = rootNode.children || [];
    const orbitRadius = 1200;

    mainChildren.forEach((mainId, mainIdx) => {
      const angle = (mainIdx / Math.max(1, mainChildren.length)) * Math.PI * 2;
      const branchX = Math.round(Math.cos(angle) * orbitRadius);
      const branchY = Math.round(Math.sin(angle) * orbitRadius);
      const branchRot = Math.round((angle * 180) / Math.PI) - 90;

      const mainContent = extractNodeContent(mainId);
      if (mainContent) {
        slides.push({
          id: `spatial-${mainId}-${orderCounter}`,
          order: orderCounter++,
          title: mainContent.titleText,
          isNoteSlide: false,
          spatial: {
            x: branchX - cardWidth / 2,
            y: branchY - cardHeight / 2,
            width: cardWidth,
            height: cardHeight,
            scale: 1.0,
            rotation: branchRot,
          },
          content: mainContent,
          style: { themeId: mindMap.themeId, contentAlign: 'left' },
        });

        if (mainContent.notesMarkdown && mainContent.notesMarkdown.trim().length > 0) {
          slides.push({
            id: `spatial-note-${mainId}-${orderCounter}`,
            order: orderCounter++,
            title: `📝 Nota: ${mainContent.titleText}`,
            isNoteSlide: true,
            spatial: {
              x: branchX - cardWidth / 2 + 120,
              y: branchY - cardHeight / 2 + 80,
              width: cardWidth,
              height: cardHeight,
              scale: 0.9,
              rotation: branchRot + 10,
            },
            content: {
              nodeId: mainContent.nodeId,
              titleText: `Nota: ${mainContent.titleText}`,
              notesMarkdown: mainContent.notesMarkdown,
              icons: ['file-text'],
            },
            style: { themeId: mindMap.themeId, contentAlign: 'left', borderColor: '#f59e0b' },
          });
        }
      }

      // Orbit sub-children further outward
      const subChildren = mindMap.nodes[mainId]?.children || [];
      subChildren.forEach((subId, subIdx) => {
        const subAngle = angle + (subIdx - (subChildren.length - 1) / 2) * 0.22;
        const subRadius = orbitRadius + 750;
        const subX = Math.round(Math.cos(subAngle) * subRadius);
        const subY = Math.round(Math.sin(subAngle) * subRadius);

        const subContent = extractNodeContent(subId);
        if (subContent) {
          slides.push({
            id: `spatial-${subId}-${orderCounter}`,
            order: orderCounter++,
            title: subContent.titleText,
            isNoteSlide: false,
            spatial: {
              x: subX - (cardWidth * 0.85) / 2,
              y: subY - (cardHeight * 0.85) / 2,
              width: cardWidth,
              height: cardHeight,
              scale: 0.85,
              rotation: Math.round((subAngle * 180) / Math.PI) - 90,
            },
            content: subContent,
            style: { themeId: mindMap.themeId, contentAlign: 'left' },
          });

          if (subContent.notesMarkdown && subContent.notesMarkdown.trim().length > 0) {
            slides.push({
              id: `spatial-note-${subId}-${orderCounter}`,
              order: orderCounter++,
              title: `📝 Nota: ${subContent.titleText}`,
              isNoteSlide: true,
              spatial: {
                x: subX - (cardWidth * 0.8) / 2 + 60,
                y: subY - (cardHeight * 0.8) / 2 + 50,
                width: cardWidth,
                height: cardHeight,
                scale: 0.8,
                rotation: Math.round((subAngle * 180) / Math.PI) - 80,
              },
              content: {
                nodeId: subContent.nodeId,
                titleText: `Nota: ${subContent.titleText}`,
                notesMarkdown: subContent.notesMarkdown,
                icons: ['file-text'],
              },
              style: { themeId: mindMap.themeId, contentAlign: 'left', borderColor: '#f59e0b' },
            });
          }
        }
      });
    });
  } else {
    // Standard Grid / Matrix
    const cols = 3;
    const gapX = 880;
    const gapY = 580;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const col = idx % cols;
      const row = Math.floor(idx / cols);

      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: col * gapX,
          y: row * gapY,
          width: cardWidth,
          height: cardHeight,
          scale: 1.0,
          rotation: (idx % 2 === 1 ? 4 : -4) * (idx % 3),
        },
        content,
        style: { themeId: mindMap.themeId, contentAlign: 'left' },
      });

      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: col * gapX + 60,
            y: row * gapY + 50,
            width: cardWidth,
            height: cardHeight,
            scale: 0.95,
            rotation: ((idx % 2 === 1 ? 4 : -4) * (idx % 3)) + 6,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: { themeId: mindMap.themeId, contentAlign: 'left', borderColor: '#f59e0b' },
        });
      }
    });
  }

  return slides;
}
