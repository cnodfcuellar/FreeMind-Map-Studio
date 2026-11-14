import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { CommandPaletteModal } from '../CommandPaletteModal';
import { BLANK_MAP } from '../../../utils/sampleMaps';
import { MindMap } from '../../../types/mindmap';

describe('CommandPaletteModal', () => {
  const defaultMap: MindMap = {
    ...BLANK_MAP,
    title: 'Mapa de Prueba',
    nodes: {
      root: {
        id: 'root',
        text: 'Idea Principal',
        parentId: null,
        children: ['node-1', 'node-2'],
      },
      'node-1': {
        id: 'node-1',
        text: 'Arquitectura del Sistema',
        parentId: 'root',
        children: [],
        tags: ['backend', 'urgente'],
      },
      'node-2': {
        id: 'node-2',
        text: 'Diseño de Interfaz',
        parentId: 'root',
        children: [],
        tags: ['frontend'],
      },
    },
  };

  const createProps = (overrides = {}) => ({
    isOpen: true,
    onClose: vi.fn(),
    mindMap: defaultMap,
    selectedNodeId: 'node-1',
    onSelectNode: vi.fn(),
    onFocusNode: vi.fn(),
    onAddChild: vi.fn(),
    onAddSibling: vi.fn(),
    onDeleteNode: vi.fn(),
    onToggleFold: vi.fn(),
    onFoldAll: vi.fn(),
    onUnfoldAll: vi.fn(),
    onEditNode: vi.fn(),
    onToggleOutline: vi.fn(),
    onToggleToolPanel: vi.fn(),
    onToggleFilterBar: vi.fn(),
    onStartPresentation: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    canUndo: true,
    canRedo: false,
    onOpenTemplates: vi.fn(),
    onOpenSavedMaps: vi.fn(),
    onOpenExportModal: vi.fn(),
    onOpenImportModal: vi.fn(),
    onOpenShortcuts: vi.fn(),
    onOpenConnectorModal: vi.fn(),
    onOpenIconPackModal: vi.fn(),
    onUpdateMapTheme: vi.fn(),
    onUpdateMapLayout: vi.fn(),
    onChangeShape: vi.fn(),
    onToggleCloud: vi.fn(),
    onToggleFullscreen: vi.fn(),
    onResetFormat: vi.fn(),
    uiTheme: 'claro' as const,
    onChangeUiTheme: vi.fn(),
    onToggleGlobalVisibility: vi.fn(),
    onToggleNodeShadow: vi.fn(),
    onToggleEdgeShadow: vi.fn(),
    onSaveMap: vi.fn(),
    onNewMap: vi.fn(),
    onCopyNode: vi.fn(),
    onCutNode: vi.fn(),
    onPasteNode: vi.fn(),
    onRandomizeColors: vi.fn(),
    onApplyStyleToChildren: vi.fn(),
    onApplyStyleToSiblings: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada si isOpen es false', () => {
    const props = createProps({ isOpen: false });
    const { container } = render(<CommandPaletteModal {...props} />);
    expect(container.textContent).toBe('');
  });

  it('renderiza buscador, pestañas de categoría y comandos iniciales cuando está abierto', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    expect(screen.getByPlaceholderText(/Escribe un comando o busca nodos/i)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Todos' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Acciones' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Nodos' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Temas' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Diseño' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Formas' })).toBeDefined();

    // Verificamos presencia de acciones clave
    expect(screen.getByText('Añadir Nodo Hijo')).toBeDefined();
    expect(screen.getByText('Añadir Nodo Hermano')).toBeDefined();
    expect(screen.getByText('Arquitectura del Sistema')).toBeDefined();
  });

  it('filtra comandos en tiempo real por búsqueda de texto', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: 'sombra' } });

    expect(screen.getByText('Alternar Sombra del Contorno del Nodo')).toBeDefined();
    expect(screen.getByText('Alternar Sombra Global de Aristas')).toBeDefined();
    expect(screen.queryByText('Añadir Nodo Hermano')).toBeNull();
  });

  it('encuentra nodos del mapa y al seleccionarlos llama a onSelectNode y onFocusNode', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: 'Arquitectura' } });

    const nodeItem = screen.getByText('Arquitectura del Sistema');
    expect(nodeItem).toBeDefined();

    fireEvent.click(nodeItem);

    expect(props.onSelectNode).toHaveBeenCalledWith('node-1');
    expect(props.onFocusNode).toHaveBeenCalledWith('node-1');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('permite filtrar por categorías al hacer clic en los botones de categoría', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const temasTab = screen.getByRole('button', { name: 'Temas' });
    fireEvent.click(temasTab);

    expect(screen.getByText('Tema del Mapa: Clásico Azul')).toBeDefined();
    expect(screen.queryByText('Añadir Nodo Hijo')).toBeNull();

    const formasTab = screen.getByRole('button', { name: 'Formas' });
    fireEvent.click(formasTab);

    expect(screen.getByText('Forma: Bocadillo de Diálogo (Bubble)')).toBeDefined();
    expect(screen.getByText('Forma: Hexágono SVG')).toBeDefined();
  });

  it('navegación con teclado: ArrowDown, ArrowUp y Enter ejecuta el comando activo', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: 'hijo' } });

    // ArrowDown y Enter
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(props.onAddChild).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('soporta prefijo ">" para filtrar exclusivamente acciones', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: '> presentación' } });

    expect(screen.getByText('Iniciar Presentación Dinámica (Vuelo Cinemático)')).toBeDefined();
    expect(screen.queryByText('Arquitectura del Sistema')).toBeNull();
  });

  it('soporta prefijo "@" para buscar exclusivamente nodos del mapa', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: '@' } });

    expect(screen.getByText('Arquitectura del Sistema')).toBeDefined();
    expect(screen.getByText('Diseño de Interfaz')).toBeDefined();
    expect(screen.queryByText('Añadir Nodo Hijo')).toBeNull();
  });

  it('muestra estado vacío cuando no hay resultados coincidentes', () => {
    const props = createProps();
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: 'consulta-que-no-existe-12345' } });

    expect(screen.getByText('No se encontraron comandos ni nodos')).toBeDefined();
  });

  it('respeta comandos deshabilitados como Redo cuando canRedo es false', () => {
    const props = createProps({ canRedo: false });
    render(<CommandPaletteModal {...props} />);

    const input = screen.getByPlaceholderText(/Escribe un comando o busca nodos/i);
    fireEvent.change(input, { target: { value: 'Rehacer' } });

    const redoBtn = screen.getByText('Rehacer Acción Deshecha').closest('button') as HTMLButtonElement;
    expect(redoBtn.disabled).toBe(true);

    fireEvent.click(redoBtn);
    expect(props.onRedo).not.toHaveBeenCalled();
  });
});
