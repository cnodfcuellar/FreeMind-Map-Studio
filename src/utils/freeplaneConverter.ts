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

export { exportToStandaloneHTML } from './htmlExporter';

export function escapeXML(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

