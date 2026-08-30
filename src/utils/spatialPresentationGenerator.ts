import { MindMap, SpatialSlideCard } from '../types/mindmap';

export type SpatialArrangementType = 'spiral' | 'constellation' | 'grid' | 'random' | 'stacked';

/**
 * Generates an intelligent array of SpatialSlideCard items from the current MindMap.
 * Supports multiple cinematic spatial layouts:
 * - 'spiral': Progressive spiral with elegant rotation increments.
 * - 'constellation': Giant central root and orbit branches with radial rotations.
 * - 'grid': Clean structured matrix.
 * - 'random': Artistic scattered arrangement with random positions, rotations and tilts.
 * - 'stacked': Cards stacked on top of each other (deck of cards / flashcards style) with slight offset and rotation.
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

  // Helper to extract exact visual styles from a node matching the map
  const extractNodeStyle = (nodeId: string, isRoot: boolean) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return { themeId: mindMap.themeId };

    return {
      themeId: mindMap.themeId,
      backgroundColor: node.color,
      textColor: node.textColor,
      borderColor: node.borderColor,
      borderWidth: node.borderWidth,
      contentAlign: isRoot ? ('center' as const) : ('left' as const),
      bgType: node.bgType,
      gradientColor1: node.gradientColor1,
      gradientColor2: node.gradientColor2,
      gradientDirection: node.gradientDirection,
      pattern: node.nodePattern,
      patternColor: node.nodePatternColor,
      patternSize: node.nodePatternSize,
      patternOpacity: node.nodePatternOpacity,
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
        style: extractNodeStyle(nodeId, isRoot),
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
            ...extractNodeStyle(nodeId, false),
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
        style: extractNodeStyle(rootNode.id, true),
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
          style: { ...extractNodeStyle(rootNode.id, false), borderColor: '#f59e0b' },
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
          style: extractNodeStyle(mainId, false),
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
            style: { ...extractNodeStyle(mainId, false), borderColor: '#f59e0b' },
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
            style: extractNodeStyle(subId, false),
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
              style: { ...extractNodeStyle(subId, false), borderColor: '#f59e0b' },
            });
          }
        }
      });
    });
  } else if (arrangement === 'random') {
    // Artistic Scattered / Organic Random arrangement
    const spreadRadius = 1400;
    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const angle = (idx / Math.max(1, orderedNodeIds.length)) * Math.PI * 2 + (pseudoRandom() - 0.5) * 0.8;
      const distance = isRoot ? 0 : 350 + pseudoRandom() * spreadRadius;

      const x = isRoot ? 0 : Math.round(Math.cos(angle) * distance);
      const y = isRoot ? 0 : Math.round(Math.sin(angle) * distance);
      const rot = isRoot ? 0 : Math.round((pseudoRandom() - 0.5) * 60);
      const scale = isRoot ? 1.3 : 0.85 + pseudoRandom() * 0.35;

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
        style: extractNodeStyle(nodeId, isRoot),
      });

      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: x - (cardWidth * 0.9 * scale) / 2 + 80,
            y: y - (cardHeight * 0.9 * scale) / 2 + 60,
            width: cardWidth,
            height: cardHeight,
            scale: scale * 0.9,
            rotation: (rot + 12) % 360,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: { ...extractNodeStyle(nodeId, false), borderColor: '#f59e0b' },
        });
      }
    });
  } else if (arrangement === 'stacked') {
    // Stacked Cards / Deck of Cards Style
    const baseOffsetX = 0;
    const baseOffsetY = 0;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
      const offsetX = isRoot ? 0 : ((idx % 7) - 3) * 16;
      const offsetY = isRoot ? 0 : ((idx % 5) - 2) * 14;
      const rot = isRoot ? 0 : ((idx % 9) - 4) * 3.5;
      const scale = isRoot ? 1.2 : 1.0;

      slides.push({
        id: `spatial-${nodeId}-${idx}`,
        order: orderCounter++,
        title: content.titleText,
        isNoteSlide: false,
        spatial: {
          x: baseOffsetX + offsetX - (cardWidth * scale) / 2,
          y: baseOffsetY + offsetY - (cardHeight * scale) / 2,
          width: cardWidth,
          height: cardHeight,
          scale,
          rotation: rot,
        },
        content,
        style: extractNodeStyle(nodeId, isRoot),
      });

      if (content.notesMarkdown && content.notesMarkdown.trim().length > 0) {
        slides.push({
          id: `spatial-note-${nodeId}-${idx}`,
          order: orderCounter++,
          title: `📝 Nota: ${content.titleText}`,
          isNoteSlide: true,
          spatial: {
            x: baseOffsetX + offsetX + 25 - (cardWidth * 0.95 * scale) / 2,
            y: baseOffsetY + offsetY + 25 - (cardHeight * 0.95 * scale) / 2,
            width: cardWidth,
            height: cardHeight,
            scale: scale * 0.95,
            rotation: (rot + 5) % 360,
          },
          content: {
            nodeId: content.nodeId,
            titleText: `Nota: ${content.titleText}`,
            notesMarkdown: content.notesMarkdown,
            icons: ['file-text'],
          },
          style: { ...extractNodeStyle(nodeId, false), borderColor: '#f59e0b' },
        });
      }
    });
  } else {
    // Standard Grid / Matrix
    const cols = 3;
    const gapX = 880;
    const gapY = 580;

    orderedNodeIds.forEach((nodeId, idx) => {
      const content = extractNodeContent(nodeId);
      if (!content) return;

      const isRoot = idx === 0;
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
        style: extractNodeStyle(nodeId, isRoot),
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
          style: { ...extractNodeStyle(nodeId, false), borderColor: '#f59e0b' },
        });
      }
    });
  }

  return slides;
}
