import { MindMap } from '../types/mindmap';
import { TUTORIAL_MAP } from './sampleMaps';

const CURRENT_MAP_KEY = 'freemind_current_map_v1';
const SAVED_MAPS_INDEX_KEY = 'freemind_saved_maps_index_v1';

export interface SavedMapMeta {
  id: string;
  title: string;
  updatedAt: number;
  nodeCount: number;
}

export function loadCurrentMap(): MindMap {
  try {
    const saved = localStorage.getItem(CURRENT_MAP_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rootId && parsed.nodes) {
        // If it's the tutorial map, return the updated TUTORIAL_MAP definition
        if (parsed.id === 'map-tutorial-freeplane' || parsed.id === 'map-tutorial-v1') {
          return TUTORIAL_MAP;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading current map from localStorage:', err);
  }
  return TUTORIAL_MAP;
}

export function saveCurrentMap(map: MindMap): void {
  try {
    localStorage.setItem(CURRENT_MAP_KEY, JSON.stringify(map));
    updateSavedMapsIndex(map);
  } catch (err) {
    console.error('Error saving current map to localStorage:', err);
  }
}

export function getSavedMapsIndex(): SavedMapMeta[] {
  try {
    const raw = localStorage.getItem(SAVED_MAPS_INDEX_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading maps index:', err);
  }
  return [
    {
      id: TUTORIAL_MAP.id,
      title: TUTORIAL_MAP.title,
      updatedAt: TUTORIAL_MAP.updatedAt,
      nodeCount: Object.keys(TUTORIAL_MAP.nodes).length,
    }
  ];
}

export function updateSavedMapsIndex(map: MindMap): void {
  try {
    const list = getSavedMapsIndex();
    const existingIdx = list.findIndex(m => m.id === map.id);
    const meta: SavedMapMeta = {
      id: map.id,
      title: map.title,
      updatedAt: Date.now(),
      nodeCount: Object.keys(map.nodes).length,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = meta;
    } else {
      list.unshift(meta);
    }

    localStorage.setItem(SAVED_MAPS_INDEX_KEY, JSON.stringify(list));
    // Also save the specific map in individual slot
    localStorage.setItem(`freemind_map_${map.id}`, JSON.stringify(map));
  } catch (err) {
    console.error('Error updating maps index:', err);
  }
}

export function loadMapById(id: string): MindMap | null {
  try {
    const raw = localStorage.getItem(`freemind_map_${id}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error loading map ${id}:`, err);
  }
  return null;
}

export function deleteMapById(id: string): void {
  try {
    localStorage.removeItem(`freemind_map_${id}`);
    const list = getSavedMapsIndex().filter(m => m.id !== id);
    localStorage.setItem(SAVED_MAPS_INDEX_KEY, JSON.stringify(list));
  } catch (err) {
    console.error(`Error deleting map ${id}:`, err);
  }
}
