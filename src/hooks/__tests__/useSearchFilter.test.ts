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

  it('soporta multi-tag con modos AND y OR', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].tags = ['urgente', 'frontend'];
    map.nodes['node-2'].tags = ['urgente', 'backend'];

    // Modo AND: debe coincidir solo node-1
    const { result: resAnd } = renderHook(() =>
      useSearchFilter(map, { ...base, tags: ['urgente', 'frontend'], tagsMatchMode: 'AND' })
    );
    expect(resAnd.current.searchMatches).toContain('node-1');
    expect(resAnd.current.searchMatches).not.toContain('node-2');

    // Modo OR: deben coincidir node-1 y node-2
    const { result: resOr } = renderHook(() =>
      useSearchFilter(map, { ...base, tags: ['frontend', 'backend'], tagsMatchMode: 'OR' })
    );
    expect(resOr.current.searchMatches).toContain('node-1');
    expect(resOr.current.searchMatches).toContain('node-2');
  });

  it('soporta filtros por modos de progreso: unstarted, in_progress, completed', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].progress = 0;
    map.nodes['node-2'].progress = 50;

    const { result: resUnstarted } = renderHook(() =>
      useSearchFilter(map, { ...base, progressMode: 'unstarted' })
    );
    expect(resUnstarted.current.searchMatches).toContain('node-1');
    expect(resUnstarted.current.searchMatches).not.toContain('node-2');

    const { result: resInProgress } = renderHook(() =>
      useSearchFilter(map, { ...base, progressMode: 'in_progress' })
    );
    expect(resInProgress.current.searchMatches).toContain('node-2');
    expect(resInProgress.current.searchMatches).not.toContain('node-1');
  });

  it('soporta filtros de presencia de contenido: hasNote, hasLink, hasImage, hasCloud, hasIcon', () => {
    const map = structuredClone(BLANK_MAP);
    delete map.nodes['root'].body;
    delete map.nodes['node-1'].body;
    delete map.nodes['node-2'].body;

    map.nodes['node-1'].note = 'Nota importante';
    map.nodes['node-2'].link = 'https://example.com';

    const { result: resNote } = renderHook(() =>
      useSearchFilter(map, { ...base, hasNote: true })
    );
    expect(resNote.current.searchMatches).toContain('node-1');
    expect(resNote.current.searchMatches).not.toContain('node-2');

    const { result: resLink } = renderHook(() =>
      useSearchFilter(map, { ...base, hasLink: true })
    );
    expect(resLink.current.searchMatches).toContain('node-2');
    expect(resLink.current.searchMatches).not.toContain('node-1');
  });

  it('soporta inclusión de ancestros contextuales con includeAncestors', () => {
    const map = structuredClone(BLANK_MAP);
    map.nodes['node-1'].progress = 100;

    const { result } = renderHook(() =>
      useSearchFilter(map, { ...base, minProgress: 100, includeAncestors: true })
    );
    expect(result.current.searchMatches).toContain('node-1');
    expect(result.current.searchMatches).toContain('root');
  });
});
