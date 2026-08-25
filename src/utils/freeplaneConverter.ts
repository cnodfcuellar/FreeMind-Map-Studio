import { MindMap, MindNode, NodeShape } from '../types/mindmap';

// Export to Freeplane / FreeMind .mm XML format
export function exportToFreeplaneXML(mindMap: MindMap): string {
  const rootNode = mindMap.nodes[mindMap.rootId];
  if (!rootNode) return '<map version="freeplane 1.7.0"></map>';

  function nodeToXML(nodeId: string, depth: number = 1): string {
    const node = mindMap.nodes[nodeId];
    if (!node) return '';

    const indent = '  '.repeat(depth);
    const escapedText = escapeXML(node.text || '');
    const id = node.id.startsWith('ID_') ? node.id : `ID_${node.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    
    let attrs = `TEXT="${escapedText}" ID="${id}"`;
    
    if (node.body) {
      attrs += ` BODY="${escapeXML(node.body)}"`;
      if (node.bodyBold) attrs += ` BODY_BOLD="true"`;
      if (node.bodyItalic) attrs += ` BODY_ITALIC="true"`;
      if (node.bodyFontSize) attrs += ` BODY_SIZE="${node.bodyFontSize}"`;
      if (node.bodyColor) attrs += ` BODY_COLOR="${node.bodyColor}"`;
      if (node.bodyAlign) attrs += ` BODY_ALIGN="${node.bodyAlign}"`;
    }
    
    if (node.side && node.side !== 'root') {
      attrs += ` POSITION="${node.side}"`;
    }
    if (node.color) {
      attrs += ` BACKGROUND_COLOR="${node.color}"`;
    }
    if (node.textColor) {
      attrs += ` COLOR="${node.textColor}"`;
    }
    if (node.shape) {
      attrs += ` STYLE="${node.shape}"`;
    }
    if (node.link) {
      attrs += ` LINK="${escapeXML(node.link)}"`;
    }
    if (node.folded) {
      attrs += ` FOLDED="true"`;
    }

    let childrenXML = '';
    
    // Font details
    if (node.fontSize || node.bold || node.italic) {
      const bold = node.bold ? ' BOLD="true"' : '';
      const italic = node.italic ? ' ITALIC="true"' : '';
      const size = node.fontSize ? ` SIZE="${node.fontSize}"` : '';
      childrenXML += `\n${indent}  <font${size}${bold}${italic}/>`;
    }

    // Icons
    if (node.icons && node.icons.length > 0) {
      node.icons.forEach(ic => {
        childrenXML += `\n${indent}  <icon BUILTIN="${escapeXML(ic)}"/>`;
      });
    }

    // Cloud
    if (node.cloud?.enabled) {
      childrenXML += `\n${indent}  <cloud COLOR="${node.cloud.color}" SHAPE="${node.cloud.shape}"/>`;
    }

    // Note / Hook
    if (node.note) {
      childrenXML += `\n${indent}  <hook NAME="accessories/plugins/NodeNote.properties">\n${indent}    <text>${escapeXML(node.note)}</text>\n${indent}  </hook>`;
    }

    // Children nodes
    if (node.children && node.children.length > 0) {
      node.children.forEach(childId => {
        childrenXML += '\n' + nodeToXML(childId, depth + 1);
      });
    }

    if (childrenXML) {
      return `${indent}<node ${attrs}>${childrenXML}\n${indent}</node>`;
    } else {
      return `${indent}<node ${attrs}/>`;
    }
  }

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<map version="freeplane 1.7.0">
  <!-- Exported from FreeMind Map Studio (Offline & Portable) -->
${nodeToXML(mindMap.rootId, 1)}
</map>`;

  return xmlContent;
}

// Import from Freeplane / FreeMind .mm XML format
export function importFromFreeplaneXML(xmlString: string): MindMap {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  
  const rootElement = doc.querySelector('map > node') || doc.querySelector('node');
  if (!rootElement) {
    throw new Error('No se encontró un nodo raíz válido en el archivo .mm XML.');
  }

  const nodes: Record<string, MindNode> = {};
  let idCounter = 1;

  function parseNode(element: Element, parentId: string | null = null, sideHint?: 'left' | 'right'): string {
    const rawId = element.getAttribute('ID') || `node_${idCounter++}`;
    const text = element.getAttribute('TEXT') || element.getAttribute('text') || 'Nodo';
    const body = element.getAttribute('BODY') || element.getAttribute('body') || undefined;
    const bodyBold = element.getAttribute('BODY_BOLD') === 'true';
    const bodyItalic = element.getAttribute('BODY_ITALIC') === 'true';
    const bodyFontSize = element.getAttribute('BODY_SIZE') ? parseInt(element.getAttribute('BODY_SIZE')!, 10) : undefined;
    const bodyColor = element.getAttribute('BODY_COLOR') || undefined;
    const bodyAlign = (element.getAttribute('BODY_ALIGN') as any) || undefined;

    const position = element.getAttribute('POSITION') || element.getAttribute('position') || sideHint;
    const bgColor = element.getAttribute('BACKGROUND_COLOR') || element.getAttribute('background_color');
    const color = element.getAttribute('COLOR') || element.getAttribute('color');
    const style = element.getAttribute('STYLE') || element.getAttribute('style');
    const link = element.getAttribute('LINK') || element.getAttribute('link');
    const folded = element.getAttribute('FOLDED') === 'true';

    // Parse font
    const fontEl = element.querySelector(':scope > font');
    const bold = fontEl?.getAttribute('BOLD') === 'true';
    const italic = fontEl?.getAttribute('ITALIC') === 'true';
    const fontSize = fontEl?.getAttribute('SIZE') ? parseInt(fontEl.getAttribute('SIZE')!, 10) : undefined;

    // Parse icons
    const iconEls = element.querySelectorAll(':scope > icon');
    const icons: string[] = [];
    iconEls.forEach(ic => {
      const builtin = ic.getAttribute('BUILTIN') || ic.getAttribute('builtin');
      if (builtin) icons.push(builtin);
    });

    // Parse cloud
    const cloudEl = element.querySelector(':scope > cloud');
    const cloud = cloudEl ? {
      enabled: true,
      color: cloudEl.getAttribute('COLOR') || 'rgba(59, 130, 246, 0.1)',
      shape: (cloudEl.getAttribute('SHAPE') || 'round-rectangle') as any,
    } : undefined;

    // Parse note
    const noteEl = element.querySelector(':scope > hook[NAME*="NodeNote"] > text, :scope > hook > text');
    const note = noteEl?.textContent || undefined;

    const childElements = Array.from(element.querySelectorAll(':scope > node'));
    const childrenIds: string[] = [];

    const nodeSide = parentId === null ? 'root' : (position === 'left' ? 'left' : 'right');

    const mindNode: MindNode = {
      id: rawId,
      text,
      body,
      bodyBold: bodyBold || undefined,
      bodyItalic: bodyItalic || undefined,
      bodyFontSize,
      bodyColor,
      bodyAlign,
      parentId,
      children: [],
      side: nodeSide,
      folded,
      color: bgColor || undefined,
      textColor: color || undefined,
      shape: (style as NodeShape) || 'bubble',
      bold,
      italic,
      fontSize,
      icons: icons.length > 0 ? icons : undefined,
      cloud,
      link: link || undefined,
      note: note || undefined,
    };

    nodes[rawId] = mindNode;

    childElements.forEach(childEl => {
      const childId = parseNode(childEl, rawId, nodeSide === 'root' ? undefined : nodeSide);
      childrenIds.push(childId);
    });

    mindNode.children = childrenIds;
    return rawId;
  }

  const rootId = parseNode(rootElement, null);

  return {
    id: `map-${Date.now()}`,
    title: nodes[rootId]?.text.split('\n')[0] || 'Mapa Importado',
    rootId,
    nodes,
    connectors: [],
    layout: 'standard',
    themeId: 'default',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Export to Markdown Outline
export function exportToMarkdown(mindMap: MindMap): string {
  const rootNode = mindMap.nodes[mindMap.rootId];
  if (!rootNode) return '';

  let md = `# ${rootNode.text}\n\n`;
  if (rootNode.note) {
    md += `> ${rootNode.note.replace(/\n/g, '\n> ')}\n\n`;
  }

  function appendBranch(nodeId: string, depth: number) {
    const node = mindMap.nodes[nodeId];
    if (!node) return;

    const indent = '  '.repeat(depth - 1);
    let line = `${indent}- **${node.text.replace(/\n/g, ' ')}**`;
    
    if (node.progress !== undefined) {
      line += ` [${node.progress}%]`;
    }
    if (node.link) {
      line += ` ([Enlace](${node.link}))`;
    }
    if (node.tags && node.tags.length > 0) {
      line += ` ${node.tags.map(t => `#${t}`).join(' ')}`;
    }
    md += line + '\n';

    if (node.note) {
      md += `${indent}  > ${node.note.replace(/\n/g, `\n${indent}  > `)}\n`;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(childId => {
        appendBranch(childId, depth + 1);
      });
    }
  }

  rootNode.children.forEach(childId => {
    appendBranch(childId, 1);
  });

  return md;
}

// Generate a Single-File Standalone Portable HTML Viewer
export function exportToStandaloneHTML(mindMap: MindMap): string {
  const jsonMap = JSON.stringify(mindMap);
  const title = escapeXML(mindMap.title || 'Mapa Mental');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - FreeMind Map Portable</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; overflow: hidden; height: 100vh; width: 100vw; display: flex; flex-direction: column; }
    header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
    h1 { font-size: 16px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 11px; background: #eff6ff; color: #2563eb; padding: 3px 8px; border-radius: 999px; font-weight: 500; }
    .controls { display: flex; gap: 8px; align-items: center; }
    button { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
    button:hover { background: #e2e8f0; }
    button.primary { background: #2563eb; color: white; border-color: #1d4ed8; }
    button.primary:hover { background: #1d4ed8; }
    #canvas-container { flex: 1; position: relative; overflow: hidden; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 24px 24px; cursor: grab; }
    #canvas-container:active { cursor: grabbing; }
    #viewport { position: absolute; transform-origin: 0 0; }
    svg#edges-layer { position: absolute; top: 0; left: 0; pointer-events: none; }
    .node-el { position: absolute; padding: 8px 14px; border-radius: 10px; background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.06); font-size: 14px; font-weight: 500; cursor: pointer; user-select: none; transition: transform 0.1s ease; max-width: 320px; word-break: break-word; display: flex; flex-direction: column; justify-content: center; }
    .node-el:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); transform: scale(1.02); }
    .node-root { background: #2563eb; color: white; font-size: 16px; font-weight: 700; border: none; padding: 12px 20px; border-radius: 14px; }
    .node-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.08); }
    .tag-badge { font-size: 10px; background: rgba(0,0,0,0.07); color: inherit; padding: 2px 6px; border-radius: 4px; font-weight: 500; }
    .fold-btn { position: absolute; width: 18px; height: 18px; background: #ffffff; border: 1px solid #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #475569; cursor: pointer; z-index: 5; }
    .fold-btn:hover { background: #3b82f6; color: white; border-color: #2563eb; }
    .note-drawer { position: fixed; right: 0; top: 50px; bottom: 0; width: 320px; background: white; border-left: 1px solid #e2e8f0; padding: 20px; box-shadow: -4px 0 16px rgba(0,0,0,0.08); display: none; z-index: 20; overflow-y: auto; }
    .note-drawer.open { display: block; }
    .note-drawer h3 { font-size: 15px; margin-bottom: 12px; }
    .note-drawer p { font-size: 13px; line-height: 1.6; color: #475569; white-space: pre-wrap; }
    .close-btn { float: right; cursor: pointer; font-size: 18px; font-weight: bold; }
  </style>
</head>
<body>
  <header>
    <h1>🧠 ${title} <span class="badge">Offline & Portable</span></h1>
    <div class="controls">
      <button onclick="resetZoom()">Centrar (100%)</button>
      <button onclick="zoomIn()">Zoom +</button>
      <button onclick="zoomOut()">Zoom -</button>
      <button class="primary" onclick="window.print()">Imprimir / PDF</button>
    </div>
  </header>

  <div id="canvas-container">
    <div id="viewport">
      <svg id="edges-layer" width="8000" height="8000"></svg>
      <div id="nodes-layer"></div>
    </div>
  </div>

  <div id="note-drawer" class="note-drawer">
    <span class="close-btn" onclick="closeNote()">×</span>
    <h3 id="note-title">Nota del Nodo</h3>
    <div id="note-content"></div>
  </div>

  <script>
    const mapData = ${jsonMap};
    let zoom = 1;
    let panX = window.innerWidth / 2;
    let panY = window.innerHeight / 2;
    let isDragging = false;
    let startX, startY;

    const viewport = document.getElementById('viewport');
    const container = document.getElementById('canvas-container');
    const edgesSvg = document.getElementById('edges-layer');
    const nodesLayer = document.getElementById('nodes-layer');

    function updateTransform() {
      viewport.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${zoom})\`;
    }

    container.addEventListener('mousedown', (e) => {
      if (e.target.closest('.node-el') || e.target.closest('.fold-btn')) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      zoom = Math.max(0.2, Math.min(2.5, zoom * zoomFactor));
      updateTransform();
    }, { passive: false });

    function zoomIn() { zoom = Math.min(2.5, zoom * 1.2); updateTransform(); }
    function zoomOut() { zoom = Math.max(0.2, zoom / 1.2); updateTransform(); }
    function resetZoom() { zoom = 1; panX = window.innerWidth / 2; panY = window.innerHeight / 2; updateTransform(); }

    function toggleFold(nodeId) {
      if (mapData.nodes[nodeId]) {
        mapData.nodes[nodeId].folded = !mapData.nodes[nodeId].folded;
        renderMap();
      }
    }

    function showNote(nodeId) {
      const node = mapData.nodes[nodeId];
      if (node && node.note) {
        document.getElementById('note-title').textContent = node.text.split('\\n')[0];
        document.getElementById('note-content').textContent = node.note;
        document.getElementById('note-drawer').classList.add('open');
      }
    }

    function closeNote() {
      document.getElementById('note-drawer').classList.remove('open');
    }

    // Simple layout calculation for the standalone runner
    function calculateSubTree(id) {
      const node = mapData.nodes[id];
      if (!node) return { width: 100, height: 40, subHeight: 40, children: [] };
      const lines = (node.text || ' ').split('\\n');
      const maxLen = Math.max(...lines.map(l => l.length), 1);
      const w = Math.min(Math.max(maxLen * 8.5 + 30, 80), 320);
      const h = Math.max(lines.length * 20 + 20, 36);

      if (node.folded || !node.children || node.children.length === 0) {
        return { id, width: w, height: h, subHeight: h, children: [] };
      }

      const cLayouts = node.children.map(cid => calculateSubTree(cid));
      const totalH = cLayouts.reduce((acc, c) => acc + c.subHeight, 0) + (cLayouts.length - 1) * 12;
      return { id, width: w, height: h, subHeight: Math.max(h, totalH), children: cLayouts };
    }

    function renderMap() {
      nodesLayer.innerHTML = '';
      edgesSvg.innerHTML = '';

      const root = mapData.nodes[mapData.rootId];
      if (!root) return;

      const rootMetrics = calculateSubTree(root.id);
      const rootX = -rootMetrics.width / 2;
      const rootY = -rootMetrics.height / 2;

      renderNodeDOM(root.id, rootX, rootY, rootMetrics.width, rootMetrics.height, true);

      if (root.folded || !root.children) return;

      const rightChildren = [];
      const leftChildren = [];
      root.children.forEach((cid, i) => {
        const cNode = mapData.nodes[cid];
        if (cNode?.side === 'left') leftChildren.push(cid);
        else if (cNode?.side === 'right') rightChildren.push(cid);
        else if (i % 2 === 0) rightChildren.push(cid);
        else leftChildren.push(cid);
      });

      function layoutSide(cIds, side) {
        const mList = cIds.map(cid => calculateSubTree(cid));
        const totalH = mList.reduce((acc, m) => acc + m.subHeight, 0) + (mList.length - 1) * 12;
        let curY = rootY + rootMetrics.height / 2 - totalH / 2;

        mList.forEach(m => {
          const nodeY = curY + m.subHeight / 2 - m.height / 2;
          const nodeX = side === 'right' ? rootX + rootMetrics.width + 60 : rootX - m.width - 60;

          renderNodeDOM(m.id, nodeX, nodeY, m.width, m.height, false);
          drawEdge(rootX, rootY, rootMetrics.width, rootMetrics.height, nodeX, nodeY, m.width, m.height, side);

          if (!mapData.nodes[m.id].folded && m.children.length > 0) {
            renderBranch(m.children, nodeX, nodeY, m.width, m.height, side);
          }
          curY += m.subHeight + 12;
        });
      }

      function renderBranch(childrenM, pX, pY, pW, pH, side) {
        const totalH = childrenM.reduce((acc, m) => acc + m.subHeight, 0) + (childrenM.length - 1) * 12;
        let curY = pY + pH / 2 - totalH / 2;

        childrenM.forEach(m => {
          const nodeY = curY + m.subHeight / 2 - m.height / 2;
          const nodeX = side === 'right' ? pX + pW + 50 : pX - m.width - 50;

          renderNodeDOM(m.id, nodeX, nodeY, m.width, m.height, false);
          drawEdge(pX, pY, pW, pH, nodeX, nodeY, m.width, m.height, side);

          if (!mapData.nodes[m.id].folded && m.children.length > 0) {
            renderBranch(m.children, nodeX, nodeY, m.width, m.height, side);
          }
          curY += m.subHeight + 12;
        });
      }

      layoutSide(rightChildren, 'right');
      layoutSide(leftChildren, 'left');
    }

    function renderNodeDOM(id, x, y, w, h, isRoot) {
      const node = mapData.nodes[id];
      const div = document.createElement('div');
      div.className = 'node-el' + (isRoot ? ' node-root' : '');
      div.style.left = x + 'px';
      div.style.top = y + 'px';
      div.style.width = w + 'px';
      div.style.height = h + 'px';
      if (node.color && !isRoot) div.style.backgroundColor = node.color;
      if (node.textColor && !isRoot) div.style.color = node.textColor;
      if (node.bold) div.style.fontWeight = 'bold';

      let textDiv = document.createElement('div');
      let content = node.text;
      if (node.note) {
        content += ' 📝';
        div.onclick = () => showNote(id);
      }
      textDiv.textContent = content;
      div.appendChild(textDiv);

      if (node.body) {
        let bodyDiv = document.createElement('div');
        bodyDiv.style.fontSize = (node.bodyFontSize || 12) + 'px';
        bodyDiv.style.opacity = '0.85';
        bodyDiv.style.marginTop = '2px';
        if (node.bodyBold) bodyDiv.style.fontWeight = 'bold';
        if (node.bodyItalic) bodyDiv.style.fontStyle = 'italic';
        if (node.bodyColor) bodyDiv.style.color = node.bodyColor;
        if (node.bodyAlign) bodyDiv.style.textAlign = node.bodyAlign;
        bodyDiv.textContent = node.body;
        div.appendChild(bodyDiv);
      }

      if (node.tags && node.tags.length > 0) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'node-tags';
        node.tags.forEach(t => {
          const tSpan = document.createElement('span');
          tSpan.className = 'tag-badge';
          tSpan.textContent = '#' + t;
          tagsDiv.appendChild(tSpan);
        });
        div.appendChild(tagsDiv);
      }

      nodesLayer.appendChild(div);

      if (node.children && node.children.length > 0 && !isRoot) {
        const foldBtn = document.createElement('div');
        foldBtn.className = 'fold-btn';
        foldBtn.textContent = node.folded ? '+' : '−';
        const side = node.side || 'right';
        foldBtn.style.left = (side === 'right' ? x + w - 8 : x - 10) + 'px';
        foldBtn.style.top = (y + h / 2 - 9) + 'px';
        foldBtn.onclick = (e) => { e.stopPropagation(); toggleFold(id); };
        nodesLayer.appendChild(foldBtn);
      }
    }

    function drawEdge(x1, y1, w1, h1, x2, y2, w2, h2, side) {
      const startX = side === 'right' ? x1 + w1 : x1;
      const startY = y1 + h1 / 2;
      const endX = side === 'right' ? x2 : x2 + w2;
      const endY = y2 + h2 / 2;
      const dx = Math.abs(endX - startX);
      const cx1 = side === 'right' ? startX + dx * 0.45 : startX - dx * 0.45;
      const cx2 = side === 'right' ? endX - dx * 0.45 : endX + dx * 0.45;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', \`M \${startX} \${startY} C \${cx1} \${startY}, \${cx2} \${endY}, \${endX} \${endY}\`);
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      edgesSvg.appendChild(path);
    }

    renderMap();
    updateTransform();
  </script>
</body>
</html>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
