import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from './App';
import { useMindMapStore } from './hooks/useMindMapStore';
import { BLANK_MAP } from './utils/sampleMaps';

function resetStore() {
  localStorage.clear();
  useMindMapStore.setState({
    mindMap: structuredClone(BLANK_MAP),
    historyPast: [],
    historyFuture: [],
    selectedNodeId: 'root',
    editingNodeId: null,
    focusTarget: null,
    clipboard: null,
    isOutlineOpen: false,
    isOutlineFullscreen: false,
    isPresentationMode: false,
    isToolPanelOpen: true,
    isFilterBarOpen: false,
  });
}

describe('App carga completa de la UI', () => {
  beforeEach(resetStore);

  it('renderiza todas las zonas principales al cargar', () => {
    localStorage.setItem('mindmap_minimap_size', 'medium');
    const { container } = render(<App />);
    // MenuBar: marca + menús
    expect(screen.getByText('FreeMind Map Studio')).toBeDefined();
    expect(screen.getByText('Archivo')).toBeDefined();
    // ToolBar: acciones rápidas
    expect(screen.getByTitle(/Agregar Nodo Hijo/)).toBeDefined();
    // Canvas con sus capas
    expect(container.querySelector('#canvas-background')).toBeDefined();
    expect(container.querySelector('#canvas-viewport')).toBeDefined();
    // ToolPanel abierto por defecto
    expect(screen.getByText('Panel de Propiedades')).toBeDefined();
    // StatusBar con métricas
    expect(screen.getByText(/Nodos totales:/)).toBeDefined();
    // MiniMapa visible
    expect(screen.getByText('MiniMapa')).toBeDefined();
  });

  it('respeta el estado inicial: outline y filterbar cerrados', () => {
    render(<App />);
    expect(screen.queryByText('Panel de Esquema')).toBeNull();
    expect(screen.queryByPlaceholderText(/Buscar por texto/)).toBeNull();
  });

  it('muestra los nodos del mapa en el lienzo', () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('#nodes-layer') as HTMLElement;
    const scope = within(canvas);
    expect(scope.getByText('Idea Central')).toBeDefined();
    expect(scope.getByText('Rama Principal 1')).toBeDefined();
    expect(scope.getByText('Rama Principal 2')).toBeDefined();
  });
});
