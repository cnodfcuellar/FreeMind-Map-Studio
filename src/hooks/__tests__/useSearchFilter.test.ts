import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchFilter } from '../useSearchFilter';
import { BLANK_MAP } from '../../utils/sampleMaps';
import { FilterOptions } from '../../types/mindmap';

const base: FilterOptions = { query: '', showAncestors: true, showDescendants: true };

describe('useSearchFilter', () => {
  it('sin filtros devuelve undefined', () => {
    const { result } = renderHook(() => useSearchFilter(structuredClone(BLANK_MAP), base));
    expect(result.current.searchMatches).toBeUndefined();
  });

  it('match por texto case-insensitive en título', () => {
    const { result } = renderHook(() =>
      useSearchFilter(structuredClone(BLANK_MAP), { ...base, query: 'rama principal 1' })
    );
    expect(result.current.searchMatches).toContain('node-1');
    expect(result.current.searchMatches).not.toContain('node-2');
  });

  it('match también en notas', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-2'].note = 'palabra secreta xyz';
    const { result } = renderHook(() => useSearchFilter(map, { ...base, query: 'XYZ' }));
    expect(result.current.searchMatches).toContain('node-2');
  });

  it('filtro por tag exacto', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].tags = ['urgente'];
    const { result } = renderHook(() => useSearchFilter(map, { ...base, tag: 'urgente' }));
    expect(result.current.searchMatches).toContain('node-1');
    expect(result.current.searchMatches).not.toContain('node-2');
  });

  it('filtro por progreso mínimo excluye sin progreso', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].progress = 80;
    const { result } = renderHook(() => useSearchFilter(map, { ...base, minProgress: 50 }));
    expect(result.current.searchMatches).toContain('node-1');
    expect(result.current.searchMatches).not.toContain('node-2');
    expect(result.current.searchMatches).not.toContain('root');
  });

  it('availableTags recoge tags únicos del mapa', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].tags = ['a', 'b'];
    map.nodes['node-2'].tags = ['b', 'c'];
    const { result } = renderHook(() => useSearchFilter(map, base));
    expect(result.current.availableTags.sort()).toEqual(['a', 'b', 'c']);
  });
});
