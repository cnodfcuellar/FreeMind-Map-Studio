import { MindMap, MindNode, HistoryActionCategory, HistoryTimelineEntry } from '../types/mindmap';

export interface MapDiffResult {
  summary: string;
  details: string;
  category: HistoryActionCategory;
}

/**
 * Compara dos mapas mentales consecutivos y produce una descripción
 * concisa, humana e intuitiva de la modificación realizada.
 */
export function describeMapDiff(prevMap: MindMap | null, currentMap: MindMap): MapDiffResult {
  if (!prevMap) {
    const count = Object.keys(currentMap.nodes || {}).length;
    return {
      summary: 'Estado inicial del mapa',
      details: `Punto de partida con ${count} nodo${count === 1 ? '' : 's'}`,
      category: 'initial',
    };
  }

  // 1. Detección de cambios de Tema o Layout
  if (prevMap.themeId !== currentMap.themeId) {
    return {
      summary: `Tema cambiado a "${currentMap.themeId || 'Por defecto'}"`,
      details: 'Se actualizó la paleta cromática global del mapa mental',
      category: 'theme',
    };
  }

  if (prevMap.layout !== currentMap.layout) {
    return {
      summary: `Diseño cambiado a "${currentMap.layout || 'standard'}"`,
      details: 'Se modificó la distribución estructural de las ramas del mapa',
      category: 'layout',
    };
  }

  // 2. Detección de Nodos Añadidos o Eliminados
  const prevNodeIds = Object.keys(prevMap.nodes || {});
  const currNodeIds = Object.keys(currentMap.nodes || {});

  const addedIds = currNodeIds.filter((id) => !prevMap.nodes[id]);
  const deletedIds = prevNodeIds.filter((id) => !currentMap.nodes[id]);

  if (addedIds.length > 1) {
    return {
      summary: `${addedIds.length} nodos agregados`,
      details: `Se incorporaron ${addedIds.length} ramas o elementos nuevos al mapa`,
      category: 'bulk',
    };
  }

  if (addedIds.length === 1) {
    const added = currentMap.nodes[addedIds[0]];
    const parent = added.parentId ? currentMap.nodes[added.parentId] : null;
    const parentText = parent?.text ? `bajo "${parent.text.slice(0, 24)}"` : 'en la raíz';
    return {
      summary: `Nodo añadido: "${added.text?.slice(0, 30) || 'Sin título'}"`,
      details: `Añadido ${parentText}`,
      category: 'node-add',
    };
  }

  if (deletedIds.length > 1) {
    return {
      summary: `${deletedIds.length} nodos eliminados`,
      details: `Se eliminaron ${deletedIds.length} nodos y sus sub-ramas`,
      category: 'bulk',
    };
  }

  if (deletedIds.length === 1) {
    const deleted = prevMap.nodes[deletedIds[0]];
    return {
      summary: `Nodo eliminado: "${deleted?.text?.slice(0, 30) || 'Sin título'}"`,
      details: 'Se quitó el nodo seleccionado del mapa mental',
      category: 'node-delete',
    };
  }

  // 3. Modificaciones internas en nodos existentes
  for (const id of currNodeIds) {
    const pNode = prevMap.nodes[id];
    const cNode = currentMap.nodes[id];
    if (!pNode || !cNode) continue;

    // Texto del título
    if (pNode.text !== cNode.text) {
      const oldTxt = pNode.text?.slice(0, 20) || 'vacío';
      const newTxt = cNode.text?.slice(0, 20) || 'vacío';
      return {
        summary: `Texto editado: "${newTxt}"`,
        details: `Antes: "${oldTxt}" → Ahora: "${newTxt}"`,
        category: 'node-text',
      };
    }

    // Nota o cuerpo
    if (pNode.body !== cNode.body) {
      const hasNote = Boolean(cNode.body);
      return {
        summary: hasNote ? `Nota añadida en "${cNode.text?.slice(0, 20)}"` : `Nota quitada en "${cNode.text?.slice(0, 20)}"`,
        details: hasNote ? 'Se editó la descripción o nota extensa del nodo' : 'Se borró la nota del nodo',
        category: 'node-text',
      };
    }

    // Cambio de padre o lado (Reparenting / Mover rama)
    if (pNode.parentId !== cNode.parentId || pNode.side !== cNode.side) {
      return {
        summary: `Nodo reubicado: "${cNode.text?.slice(0, 24)}"`,
        details: 'Cambio de jerarquía, orden o lado en el árbol',
        category: 'node-move',
      };
    }

    // Plegado / Desplegado
    if (pNode.folded !== cNode.folded) {
      return {
        summary: `Rama "${cNode.text?.slice(0, 20)}" ${cNode.folded ? 'plegada' : 'desplegada'}`,
        details: cNode.folded ? 'Ocultando sub-ramas hijas' : 'Mostrando sub-ramas hijas',
        category: 'other',
      };
    }

    // Nube envolvente
    const pCloud = pNode.cloud?.enabled;
    const cCloud = cNode.cloud?.enabled;
    if (pCloud !== cCloud || JSON.stringify(pNode.cloud) !== JSON.stringify(cNode.cloud)) {
      return {
        summary: `Nube envolvente ${cCloud ? 'activada' : 'desactivada'} en "${cNode.text?.slice(0, 20)}"`,
        details: 'Se actualizaron las propiedades de la nube conceptual',
        category: 'cloud',
      };
    }

    // Sombra del nodo
    if (
      pNode.nodeShadow !== cNode.nodeShadow ||
      pNode.nodeShadowPreset !== cNode.nodeShadowPreset ||
      pNode.textShadow !== cNode.textShadow ||
      pNode.imageShadow !== cNode.imageShadow ||
      pNode.edgeShadow !== cNode.edgeShadow
    ) {
      return {
        summary: `Sombra modificada en "${cNode.text?.slice(0, 20)}"`,
        details: 'Ajuste de sombra de contorno, texto, imagen o arista',
        category: 'node-style',
      };
    }

    // Forma o geometría de colita
    if (
      pNode.shape !== cNode.shape ||
      pNode.tailLength !== cNode.tailLength ||
      pNode.tailWidth !== cNode.tailWidth ||
      pNode.tailSide !== cNode.tailSide ||
      pNode.tailStyle !== cNode.tailStyle
    ) {
      return {
        summary: `Forma cambiada a "${cNode.shape || 'rounded'}"`,
        details: `Geometría modificada en el nodo "${cNode.text?.slice(0, 20)}"`,
        category: 'node-style',
      };
    }

    // Color, borde o fondo
    if (
      pNode.color !== cNode.color ||
      pNode.borderColor !== cNode.borderColor ||
      pNode.borderWidth !== cNode.borderWidth ||
      pNode.bgType !== cNode.bgType
    ) {
      return {
        summary: `Color/Estilo modificado en "${cNode.text?.slice(0, 20)}"`,
        details: 'Ajuste de color de relleno, borde o degradado',
        category: 'node-style',
      };
    }

    // Iconos o progreso
    if (
      JSON.stringify(pNode.icons) !== JSON.stringify(cNode.icons) ||
      pNode.progress !== cNode.progress
    ) {
      return {
        summary: `Iconos o progreso en "${cNode.text?.slice(0, 20)}"`,
        details: 'Se agregaron iconos o se actualizó el avance',
        category: 'other',
      };
    }
  }

  // 4. Conectores flotantes
  const pConns = prevMap.connectors?.length || 0;
  const cConns = currentMap.connectors?.length || 0;
  if (pConns !== cConns) {
    return {
      summary: cConns > pConns ? 'Conector libre añadido' : 'Conector libre eliminado',
      details: `${cConns} conectores de relación en el mapa mental`,
      category: 'connector',
    };
  }

  // 5. Visibilidad global
  if (
    prevMap.hideAllBodies !== currentMap.hideAllBodies ||
    prevMap.hideAllImages !== currentMap.hideAllImages ||
    prevMap.hideAllTags !== currentMap.hideAllTags ||
    prevMap.hideAllIcons !== currentMap.hideAllIcons ||
    prevMap.hideAllLinks !== currentMap.hideAllLinks
  ) {
    return {
      summary: 'Visibilidad global alternada',
      details: 'Ocultar / mostrar elementos secundarios en todo el mapa',
      category: 'other',
    };
  }

  // Fallback genérico
  return {
    summary: 'Modificación del mapa mental',
    details: 'Se actualizaron propiedades generales o nodos',
    category: 'other',
  };
}

/**
 * Convierte el historial (past, present, future) en una lista completa
 * cronológica de Timeline Entries con sus diffs calculados.
 */
export function buildHistoryTimeline(
  past: MindMap[],
  present: MindMap,
  future: MindMap[]
): HistoryTimelineEntry[] {
  const allMaps = [...past, present, ...future];
  const currentIdx = past.length;

  return allMaps.map((map, idx) => {
    const isCurrent = idx === currentIdx;
    const isPast = idx < currentIdx;
    const isFuture = idx > currentIdx;
    const prevMap = idx > 0 ? allMaps[idx - 1] : null;

    const diff = describeMapDiff(prevMap, map);
    const nodeCount = Object.keys(map.nodes || {}).length;
    const connectorCount = map.connectors?.length || 0;
    const cloudCount = Object.values(map.nodes || {}).filter((n) => n.cloud?.enabled).length;

    let title = `Paso #${idx + 1}`;
    if (idx === 0) title = 'Punto de partida';
    if (isCurrent) title = '📍 Versión Actual';

    return {
      index: idx,
      isCurrent,
      isPast,
      isFuture,
      map,
      title,
      summary: diff.summary,
      details: diff.details,
      category: diff.category,
      timestamp: map.updatedAt || Date.now(),
      nodeCount,
      connectorCount,
      cloudCount,
    };
  });
}

/**
 * Formatea un timestamp unix a tiempo relativo amigable en español.
 */
export function formatHistoryTimestamp(timestamp: number): string {
  if (!timestamp) return 'Reciente';
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 5) return 'Justo ahora';
  if (diffSec < 60) return `Hace ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
