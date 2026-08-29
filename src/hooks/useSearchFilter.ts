import { useMemo } from 'react';
import { MindMap, MindNode, FilterOptions } from '../types/mindmap';

export function useSearchFilter(mindMap: MindMap, filterOptions: FilterOptions) {
  // Compute Search Matches
  const searchMatches = useMemo(() => {
    if (!filterOptions.query && !filterOptions.tag && filterOptions.minProgress === undefined) {
      return undefined;
    }

    const matches = new Set<string>();
    const q = filterOptions.query.toLowerCase().trim();

    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      let isMatch = true;

      if (q && !n.text.toLowerCase().includes(q) && !(n.note && n.note.toLowerCase().includes(q))) {
        isMatch = false;
      }
      if (filterOptions.tag && (!n.tags || !n.tags.includes(filterOptions.tag))) {
        isMatch = false;
      }
      if (
        filterOptions.minProgress !== undefined &&
        (n.progress === undefined || n.progress < filterOptions.minProgress)
      ) {
        isMatch = false;
      }

      if (isMatch) {
        matches.add(n.id);
      }
    });

    return matches;
  }, [mindMap.nodes, filterOptions]);

  // Available Tags in Map
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      n.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [mindMap.nodes]);

  return {
    searchMatches,
    availableTags,
  };
}
