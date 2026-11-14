import { useMemo } from 'react';
import { MindMap, MindNode, FilterOptions } from '../types/mindmap';

/**
 * Determina si hay algún filtro activo aplicado en FilterOptions.
 */
export function isFilterActive(filterOptions: FilterOptions): boolean {
  if (filterOptions.query && filterOptions.query.trim().length > 0) return true;
  if (filterOptions.tag) return true;
  if (filterOptions.tags && filterOptions.tags.length > 0) return true;
  if (filterOptions.icon) return true;
  if (filterOptions.progressMode && filterOptions.progressMode !== 'all') return true;
  if (filterOptions.minProgress !== undefined) return true;
  if (filterOptions.maxProgress !== undefined) return true;
  if (filterOptions.hasNote) return true;
  if (filterOptions.hasLink) return true;
  if (filterOptions.hasImage) return true;
  if (filterOptions.hasCloud) return true;
  if (filterOptions.hasIcon) return true;
  if (filterOptions.dateFilter && filterOptions.dateFilter !== 'all') return true;
  return false;
}

export function useSearchFilter(mindMap: MindMap, filterOptions: FilterOptions) {
  // Compute Search Matches
  const searchMatches = useMemo(() => {
    if (!isFilterActive(filterOptions)) {
      return undefined;
    }

    const matches = new Set<string>();
    const q = filterOptions.query ? filterOptions.query.toLowerCase().trim() : '';
    const now = Date.now();

    (Object.values(mindMap.nodes || {}) as MindNode[]).forEach((n) => {
      let isMatch = true;

      // 1. Text Query (título, nota markdown, cuerpo/subtexto o etiquetas)
      if (q) {
        const textMatch = n.text?.toLowerCase().includes(q);
        const bodyMatch = n.body?.toLowerCase().includes(q);
        const noteMatch = n.note?.toLowerCase().includes(q);
        const tagMatch = n.tags?.some((t) => t.toLowerCase().includes(q));
        if (!textMatch && !bodyMatch && !noteMatch && !tagMatch) {
          isMatch = false;
        }
      }

      // 2. Tag Filter (individual o múltiple con lógica AND / OR)
      if (filterOptions.tag && (!n.tags || !n.tags.includes(filterOptions.tag))) {
        isMatch = false;
      }
      if (filterOptions.tags && filterOptions.tags.length > 0) {
        const mode = filterOptions.tagsMatchMode || 'AND';
        if (mode === 'AND') {
          const hasAll = filterOptions.tags.every((t) => n.tags?.includes(t));
          if (!hasAll) isMatch = false;
        } else {
          const hasAny = filterOptions.tags.some((t) => n.tags?.includes(t));
          if (!hasAny) isMatch = false;
        }
      }

      // 3. Progreso
      if (filterOptions.progressMode && filterOptions.progressMode !== 'all') {
        if (filterOptions.progressMode === 'unstarted') {
          if (n.progress !== 0) isMatch = false;
        } else if (filterOptions.progressMode === 'in_progress') {
          if (n.progress === undefined || n.progress <= 0 || n.progress >= 100) isMatch = false;
        } else if (filterOptions.progressMode === 'completed') {
          if (n.progress !== 100) isMatch = false;
        }
      }

      if (
        filterOptions.minProgress !== undefined &&
        (n.progress === undefined || n.progress < filterOptions.minProgress)
      ) {
        isMatch = false;
      }

      if (
        filterOptions.maxProgress !== undefined &&
        (n.progress === undefined || n.progress > filterOptions.maxProgress)
      ) {
        isMatch = false;
      }

      // 4. Presencia de Contenido y Metadatos
      if (filterOptions.hasNote && !n.note && !n.body) {
        isMatch = false;
      }
      if (filterOptions.hasLink && !n.link) {
        isMatch = false;
      }
      if (filterOptions.hasImage && !n.imageUrl) {
        isMatch = false;
      }
      if (filterOptions.hasCloud && !n.cloud?.enabled) {
        isMatch = false;
      }
      if (filterOptions.hasIcon && (!n.icons || n.icons.length === 0)) {
        isMatch = false;
      }
      if (filterOptions.icon && (!n.icons || !n.icons.includes(filterOptions.icon))) {
        isMatch = false;
      }

      // 5. Filtro por Fecha (creación o modificación)
      if (filterOptions.dateFilter && filterOptions.dateFilter !== 'all') {
        let nodeTimestamp = n.updatedAt || n.createdAt;
        if (!nodeTimestamp && n.id.startsWith('node-')) {
          const parsed = parseInt(n.id.replace('node-', ''), 10);
          if (!isNaN(parsed) && parsed > 1600000000000) {
            nodeTimestamp = parsed;
          }
        }

        if (!nodeTimestamp) {
          isMatch = false;
        } else {
          const diffMs = now - nodeTimestamp;
          if (filterOptions.dateFilter === 'today' && diffMs > 24 * 60 * 60 * 1000) {
            isMatch = false;
          } else if (filterOptions.dateFilter === 'week' && diffMs > 7 * 24 * 60 * 60 * 1000) {
            isMatch = false;
          } else if (filterOptions.dateFilter === 'month' && diffMs > 30 * 24 * 60 * 60 * 1000) {
            isMatch = false;
          }
        }
      }

      if (isMatch) {
        matches.add(n.id);
      }
    });

    // Inclusión opcional de ancestros contextuales
    if (filterOptions.includeAncestors) {
      const ancestorsToAdd: string[] = [];
      matches.forEach((nodeId) => {
        let curr = mindMap.nodes[nodeId];
        while (curr && curr.parentId) {
          ancestorsToAdd.push(curr.parentId);
          curr = mindMap.nodes[curr.parentId];
        }
      });
      ancestorsToAdd.forEach((id) => matches.add(id));
    }

    // Inclusión opcional de descendientes
    if (filterOptions.includeDescendants) {
      const descendantsToAdd: string[] = [];
      const addChildren = (nodeId: string) => {
        const node = mindMap.nodes[nodeId];
        if (!node || !node.children) return;
        node.children.forEach((childId) => {
          descendantsToAdd.push(childId);
          addChildren(childId);
        });
      };
      matches.forEach((nodeId) => {
        addChildren(nodeId);
      });
      descendantsToAdd.forEach((id) => matches.add(id));
    }

    return matches;
  }, [mindMap.nodes, filterOptions]);

  // Available Tags in Map
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    (Object.values(mindMap.nodes || {}) as MindNode[]).forEach((n) => {
      n.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [mindMap.nodes]);

  return {
    searchMatches,
    availableTags,
  };
}
