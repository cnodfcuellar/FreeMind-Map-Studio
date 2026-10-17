import { MindMap, MindNode } from '../types/mindmap';

/**
 * Restilo total al cambiar de tema: limpia los overrides de color por nodo
 * y de fondo/aristas del mapa para que el tema mande en todo.
 * Conserva formas, imágenes, degradados, tipografía y metadatos.
 */
export function applyThemeRestyle(map: MindMap, themeId: string): MindMap {
  const clearedNodes: Record<string, MindNode> = {};
  Object.entries(map.nodes).forEach(([id, node]) => {
    const { color, textColor, borderColor, ...rest } = node;
    clearedNodes[id] = rest as MindNode;
  });
  return {
    ...map,
    themeId,
    nodes: clearedNodes,
    backgroundColor: undefined,
    backgroundPattern: undefined,
    backgroundPatternColor: undefined,
    backgroundPatternSize: undefined,
    backgroundPatternOpacity: undefined,
    edgeColor: undefined,
    updatedAt: Date.now(),
  };
}

/**
 * Fusiona un cambio parcial de fondo del lienzo sobre el mapa.
 */
export function applyBackgroundUpdate(
  map: MindMap,
  config: Pick<
    MindMap,
    | 'backgroundColor'
    | 'backgroundPattern'
    | 'backgroundPatternColor'
    | 'backgroundPatternSize'
    | 'backgroundPatternOpacity'
  >
): MindMap {
  return { ...map, ...config, updatedAt: Date.now() };
}
