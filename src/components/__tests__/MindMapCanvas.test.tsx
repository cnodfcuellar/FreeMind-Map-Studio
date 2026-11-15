import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MindMapCanvas } from '../MindMapCanvas';
import { THEMES } from '../../utils/themes';
import { BLANK_MAP } from '../../utils/sampleMaps';
import type { MindMap } from '../../types/mindmap';

describe('MindMapCanvas Component Tests', () => {
  const defaultProps = {
    mindMap: structuredClone(BLANK_MAP),
    theme: THEMES.default,
    selectedNodeId: 'root',
    editingNodeId: null,
    searchMatches: new Set<string>(),
    onSelectNode: vi.fn(),
    onStartEditing: vi.fn(),
    onFinishEditing: vi.fn(),
    onUpdateNodeText: vi.fn(),
    onAddChildNode: vi.fn(),
    onAddSiblingNode: vi.fn(),
    onDeleteNode: vi.fn(),
    onToggleFoldNode: vi.fn(),
    onReparentNode: vi.fn(),
    onOpenNotePanel: vi.fn(),
    onOpenConnectorModal: vi.fn(),
    onToggleCloud: vi.fn(),
    onCopyNode: vi.fn(),
    onCutNode: vi.fn(),
    onPasteNode: vi.fn(),
    focusTarget: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente las capas SVG y los nodos del mapa', () => {
    const { container } = render(<MindMapCanvas {...defaultProps} />);
    expect(container.querySelector('#canvas-background')).toBeDefined();
    expect(container.querySelector('#canvas-viewport')).toBeDefined();
    expect(container.querySelector('#edges-layer')).toBeDefined();
    expect(container.querySelector('#nodes-layer')).toBeDefined();

    expect(screen.getByText('Idea Central')).toBeDefined();
    expect(screen.getByText('Rama Principal 1')).toBeDefined();
    expect(screen.getByText('Rama Principal 2')).toBeDefined();
  });

  it('hacer clic en un nodo secundario dispara onSelectNode con su id', () => {
    render(<MindMapCanvas {...defaultProps} />);
    const nodeEl = screen.getByText('Rama Principal 1');
    fireEvent.click(nodeEl);
    expect(defaultProps.onSelectNode).toHaveBeenCalledWith('node-1');
  });

  it('hacer doble clic en un nodo activa la edición con onStartEditing', () => {
    render(<MindMapCanvas {...defaultProps} />);
    const nodeEl = screen.getByText('Rama Principal 2');
    fireEvent.doubleClick(nodeEl);
    expect(defaultProps.onStartEditing).toHaveBeenCalledWith('node-2');
  });

  it('hacer clic (mouseDown) en el fondo del lienzo deselecciona el nodo activo', () => {
    const { container } = render(<MindMapCanvas {...defaultProps} />);
    const bg = container.querySelector('#canvas-background');
    expect(bg).not.toBeNull();
    if (bg) {
      fireEvent.mouseDown(bg, { button: 0 });
      expect(defaultProps.onSelectNode).toHaveBeenCalledWith(null);
    }
  });

  it('renderiza la capa de conectores cuando el mapa incluye conectores flotantes', () => {
    const mapWithConnector: MindMap = {
      ...defaultProps.mindMap,
      connectors: [
        {
          id: 'conn-1',
          fromId: 'node-1',
          toId: 'node-2',
          label: 'Relación de prueba',
        },
      ],
    };
    const { container } = render(<MindMapCanvas {...defaultProps} mindMap={mapWithConnector} />);
    expect(container.querySelector('#connectors-layer')).toBeDefined();
  });

  it('no renderiza los hijos de un nodo plegado (folded: true)', () => {
    const foldedMap: MindMap = {
      ...defaultProps.mindMap,
      nodes: {
        ...defaultProps.mindMap.nodes,
        'node-1': {
          ...defaultProps.mindMap.nodes['node-1'],
          folded: true,
          children: ['subnode-1'],
        },
        'subnode-1': {
          id: 'subnode-1',
          text: 'Subnodo Oculto',
          parentId: 'node-1',
          children: [],
        },
      },
    };
    render(<MindMapCanvas {...defaultProps} mindMap={foldedMap} />);
    expect(screen.getByText('Rama Principal 1')).toBeDefined();
    expect(screen.queryByText('Subnodo Oculto')).toBeNull();
  });

  it('renderiza el widget de MiniMapa en el lienzo', () => {
    localStorage.setItem('mindmap_minimap_size', 'medium');
    render(<MindMapCanvas {...defaultProps} />);
    expect(screen.getByTitle('MiniMapa')).toBeDefined();
    expect(screen.getByText('MiniMapa')).toBeDefined();
  });

  it('el clic derecho (contextMenu) sobre un nodo despliega el menú contextual', () => {
    render(<MindMapCanvas {...defaultProps} />);
    const nodeEl = screen.getByText('Rama Principal 1');
    fireEvent.contextMenu(nodeEl, { clientX: 300, clientY: 200 });
    expect(screen.getByText(/Agregar Nodo Hijo/)).toBeDefined();
    expect(screen.getByText(/Agregar Nodo Hermano/)).toBeDefined();
  });
});
