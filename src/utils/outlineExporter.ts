import { MindMap, MindNode } from '../types/mindmap';

export type MarkdownMode = 'headers' | 'bullets' | 'tasks';

export interface MarkdownExportOptions {
  mode?: MarkdownMode;
  includeNotes?: boolean;
  includeBody?: boolean;
  includeLinks?: boolean;
  includeTags?: boolean;
  includeProgress?: boolean;
  includeMetadata?: boolean;
  includeConnectors?: boolean;
}

/**
 * Escapes characters for XML generation (OPML)
 */
function escapeXML(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exports a mindmap into clean, structured Markdown suitable for Obsidian, Notion, Logseq, or GitHub.
 */
export function exportToMarkdown(
  mindMap: MindMap,
  options: MarkdownExportOptions = {}
): string {
  const {
    mode = 'bullets',
    includeNotes = true,
    includeBody = true,
    includeLinks = true,
    includeTags = true,
    includeProgress = true,
    includeMetadata = true,
    includeConnectors = true,
  } = options;

  const rootNode = mindMap.nodes[mindMap.rootId];
  if (!rootNode) return '';

  const lines: string[] = [];

  // Frontmatter / Metadata
  if (includeMetadata) {
    lines.push('---');
    lines.push(`title: "${mindMap.title.replace(/"/g, '\\"')}"`);
    lines.push(`date: ${new Date(mindMap.createdAt || Date.now()).toISOString().split('T')[0]}`);
    if (mindMap.themeId) {
      lines.push(`theme: ${mindMap.themeId}`);
    }
    lines.push(`nodes_count: ${Object.keys(mindMap.nodes).length}`);
    lines.push('generator: FreeMind Map Studio');
    lines.push('---');
    lines.push('');
  }

  // Título Principal
  lines.push(`# ${rootNode.text}`);
  lines.push('');

  // Cuerpo / Nota del nodo raíz
  if (includeBody && rootNode.body) {
    lines.push(rootNode.body);
    lines.push('');
  }
  if (includeNotes && rootNode.note) {
    lines.push('> ' + rootNode.note.replace(/\n/g, '\n> '));
    lines.push('');
  }

  // Recorrido recursivo del árbol
  function renderNodeRecursive(nodeId: string, depth: number) {
    const node = mindMap.nodes[nodeId];
    if (!node) return;

    let prefix = '';
    const cleanText = node.text.replace(/\n/g, ' ').trim();

    if (mode === 'headers') {
      // Estilo encabezados: ## Nivel 2, ### Nivel 3, etc.
      const headerLevel = Math.min(6, depth + 1);
      prefix = '#'.repeat(headerLevel) + ' ';
    } else if (mode === 'tasks') {
      // Estilo checklist: - [ ] o - [x]
      const indent = '  '.repeat(depth - 1);
      const isCompleted = (node.progress ?? 0) >= 100;
      prefix = `${indent}- [${isCompleted ? 'x' : ' '}] `;
    } else {
      // Estilo viñetas estándar: - **texto**
      const indent = '  '.repeat(depth - 1);
      prefix = `${indent}- `;
    }

    let nodeLine = prefix;
    if (mode === 'bullets') {
      nodeLine += `**${cleanText}**`;
    } else {
      nodeLine += cleanText;
    }

    // Progreso
    if (includeProgress && node.progress !== undefined && mode !== 'tasks') {
      nodeLine += ` \`[${node.progress}%]\``;
    }

    // Enlace
    if (includeLinks && node.link) {
      nodeLine += ` ([Enlace](${node.link}))`;
    }

    // Etiquetas
    if (includeTags && node.tags && node.tags.length > 0) {
      nodeLine += ` ${node.tags.map((t) => `#${t.replace(/\s+/g, '-')}`).join(' ')}`;
    }

    lines.push(nodeLine);

    // Contenido adicional: Cuerpo descriptivo
    const indentSpace = mode === 'headers' ? '' : '  '.repeat(depth);
    if (includeBody && node.body) {
      const formattedBody = node.body
        .split('\n')
        .map((l) => (indentSpace ? `${indentSpace}${l}` : l))
        .join('\n');
      lines.push(formattedBody);
    }

    // Contenido adicional: Nota en bloque de cita
    if (includeNotes && node.note) {
      const notePrefix = indentSpace ? `${indentSpace}> ` : '> ';
      const formattedNote = node.note.replace(/\n/g, `\n${notePrefix}`);
      lines.push(`${notePrefix}${formattedNote}`);
    }

    // Separación si es modo encabezados
    if (mode === 'headers') {
      lines.push('');
    }

    // Hijos
    if (node.children && node.children.length > 0) {
      node.children.forEach((childId) => {
        renderNodeRecursive(childId, depth + 1);
      });
    }
  }

  // Renderizar ramas desde la raíz
  if (rootNode.children && rootNode.children.length > 0) {
    rootNode.children.forEach((childId) => {
      renderNodeRecursive(childId, 1);
    });
  }

  // Sección opcional de relaciones y conectores libres
  if (includeConnectors && mindMap.connectors && mindMap.connectors.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('## Relaciones y Conexiones Libres');
    lines.push('');
    lines.push('| Origen | Destino | Etiqueta / Tipo |');
    lines.push('| :--- | :--- | :--- |');

    mindMap.connectors.forEach((conn) => {
      const fromId = conn.fromId || conn.fromNodeId || '';
      const toId = conn.toId || conn.toNodeId || '';
      const source = mindMap.nodes[fromId]?.text.replace(/\n/g, ' ') || fromId;
      const target = mindMap.nodes[toId]?.text.replace(/\n/g, ' ') || toId;
      const label = conn.label ? conn.label.replace(/\|/g, '\\|') : (conn.style || 'Conexión');
      lines.push(`| **${source}** | **${target}** | ${label} |`);
    });
  }

  return lines.join('\n') + '\n';
}

/**
 * Exports a mindmap to standard OPML 2.0 (Outline Processor Markup Language)
 * Interoperable with OmniOutliner, Workflowy, MindNode, Scrivener, Dynalist, etc.
 */
export function exportToOPML(mindMap: MindMap): string {
  const rootNode = mindMap.nodes[mindMap.rootId];
  if (!rootNode) return '';

  const dateCreated = new Date(mindMap.createdAt || Date.now()).toUTCString();
  const dateModified = new Date(mindMap.updatedAt || Date.now()).toUTCString();

  const xmlLines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    '  <head>',
    `    <title>${escapeXML(mindMap.title)}</title>`,
    `    <dateCreated>${dateCreated}</dateCreated>`,
    `    <dateModified>${dateModified}</dateModified>`,
    '    <ownerName>FreeMind Map Studio</ownerName>',
    '  </head>',
    '  <body>',
  ];

  function renderOutlineNode(nodeId: string, indent: string) {
    const node = mindMap.nodes[nodeId];
    if (!node) return;

    const attrs: string[] = [`text="${escapeXML(node.text.replace(/\n/g, ' '))}"`];

    if (node.body) {
      attrs.push(`_description="${escapeXML(node.body)}"`);
    }
    if (node.note) {
      attrs.push(`_note="${escapeXML(node.note)}"`);
    }
    if (node.link) {
      attrs.push(`type="link" url="${escapeXML(node.link)}"`);
    }
    if (node.progress !== undefined) {
      attrs.push(`_status="${node.progress >= 100 ? 'checked' : 'unchecked'}"`);
      attrs.push(`_progress="${node.progress}"`);
    }
    if (node.tags && node.tags.length > 0) {
      attrs.push(`category="${escapeXML(node.tags.join(','))}"`);
    }

    const hasChildren = node.children && node.children.length > 0;

    if (!hasChildren) {
      xmlLines.push(`${indent}<outline ${attrs.join(' ')} />`);
    } else {
      xmlLines.push(`${indent}<outline ${attrs.join(' ')}>`);
      node.children.forEach((childId) => {
        renderOutlineNode(childId, indent + '  ');
      });
      xmlLines.push(`${indent}</outline>`);
    }
  }

  // Renderizar la raíz y sus descendientes
  renderOutlineNode(rootNode.id, '    ');

  xmlLines.push('  </body>');
  xmlLines.push('</opml>');

  return xmlLines.join('\n');
}
