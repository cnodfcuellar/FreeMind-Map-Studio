import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCurrentMap,
  saveCurrentMap,
  getSavedMapsIndex,
  updateSavedMapsIndex,
  loadMapById,
  deleteMapById,
} from '../storage';
import { BLANK_MAP, TUTORIAL_MAP } from '../sampleMaps';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('loadCurrentMap vacío devuelve TUTORIAL_MAP', () => {
    expect(loadCurrentMap().id).toBe(TUTORIAL_MAP.id);
  });

  it('loadCurrentMap rechaza JSON inválido o sin rootId/nodes', () => {
    localStorage.setItem('freemind_current_map_v1', 'no-json{{{');
    expect(loadCurrentMap().id).toBe(TUTORIAL_MAP.id);
    localStorage.setItem('freemind_current_map_v1', JSON.stringify({ id: 'x' }));
    expect(loadCurrentMap().id).toBe(TUTORIAL_MAP.id);
  });

  it('saveCurrentMap persiste y redirige ids tutorial al TUTORIAL actual', () => {
    saveCurrentMap({ ...BLANK_MAP, id: 'map-tutorial-v1' });
    expect(loadCurrentMap().id).toBe(TUTORIAL_MAP.id);
    saveCurrentMap(BLANK_MAP);
    const loaded = loadCurrentMap();
    expect(loaded.id).toBe('map-new');
    expect(loaded.nodes['root'].text).toBe('Idea Central');
  });

  it('getSavedMapsIndex por defecto contiene el tutorial', () => {
    const idx = getSavedMapsIndex();
    expect(idx.length).toBe(1);
    expect(idx[0].id).toBe(TUTORIAL_MAP.id);
    expect(idx[0].nodeCount).toBe(Object.keys(TUTORIAL_MAP.nodes).length);
  });

  it('updateSavedMapsIndex inserta al frente y actualiza existentes', () => {
    updateSavedMapsIndex(BLANK_MAP);
    let idx = getSavedMapsIndex();
    expect(idx[0].id).toBe('map-new');
    expect(idx[0].nodeCount).toBe(3);
    updateSavedMapsIndex({ ...BLANK_MAP, title: 'Renombrado' });
    idx = getSavedMapsIndex();
    expect(idx.filter((m) => m.id === 'map-new').length).toBe(1);
    expect(idx[0].title).toBe('Renombrado');
  });

  it('loadMapById/deleteMapById round-trip', () => {
    expect(loadMapById('map-new')).toBeNull();
    updateSavedMapsIndex(BLANK_MAP);
    expect(loadMapById('map-new')?.title).toBe('Nuevo Mapa Mental');
    deleteMapById('map-new');
    expect(loadMapById('map-new')).toBeNull();
    expect(getSavedMapsIndex().some((m) => m.id === 'map-new')).toBe(false);
  });
});
