import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryTimelineModal } from '../HistoryTimelineModal';
import { MindMap } from '../../../types/mindmap';
import { BLANK_MAP } from '../../../utils/sampleMaps';

describe('HistoryTimelineModal component', () => {
  const baseMap: MindMap = {
    ...BLANK_MAP,
    id: 'test-map-timeline',
    title: 'Mapa para Historial',
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        text: 'Idea Central',
        parentId: null,
        children: ['n1'],
        side: 'root',
      },
      n1: {
        id: 'n1',
        text: 'Subnodo 1',
        parentId: 'root',
        children: [],
        side: 'right',
      },
    },
    connectors: [],
  };

  const pastMap0: MindMap = {
    ...baseMap,
    title: 'Mapa Versión Inicial',
    nodes: {
      root: { id: 'root', text: 'Idea Central', parentId: null, children: [], side: 'root' },
    },
  };

  const futureMap0: MindMap = {
    ...baseMap,
    title: 'Mapa Futuro',
    nodes: {
      ...baseMap.nodes,
      n2: { id: 'n2', text: 'Subnodo 2', parentId: 'root', children: [], side: 'left' },
    },
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    historyPast: [pastMap0],
    historyFuture: [futureMap0],
    currentMindMap: baseMap,
    onJumpToHistory: vi.fn(),
    onSaveAsNewMap: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<HistoryTimelineModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza cabecera, buscador, filtros y entradas de la timeline', () => {
    render(<HistoryTimelineModal {...defaultProps} />);
    expect(screen.getByText('Línea de Tiempo del Historial')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar por texto/i)).toBeInTheDocument();

    // Filtros: Todos (3), Pasados (1), Futuros (1)
    expect(screen.getByText(/Todos \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasados \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Futuros \(1\)/i)).toBeInTheDocument();

    // Versión actual visible
    expect(screen.getAllByText(/ACTUAL/i).length).toBeGreaterThanOrEqual(1);
  });

  it('permite filtrar por texto de búsqueda', () => {
    render(<HistoryTimelineModal {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Buscar por texto/i);

    fireEvent.change(searchInput, { target: { value: 'Inicial' } });
    // Debería mostrar la versión inicial
    expect(screen.getAllByText(/Punto de partida/i).length).toBeGreaterThanOrEqual(1);
  });

  it('permite alternar entre pestañas de filtro Pasados y Futuros', () => {
    render(<HistoryTimelineModal {...defaultProps} />);
    const pastBtn = screen.getByText(/Pasados \(1\)/i);
    fireEvent.click(pastBtn);

    // Debe mostrar punto de partida
    expect(screen.getAllByText(/Punto de partida/i).length).toBeGreaterThanOrEqual(1);

    const futureBtn = screen.getByText(/Futuros \(1\)/i);
    fireEvent.click(futureBtn);
    expect(screen.getByText(/Rehecho/i)).toBeInTheDocument();
  });

  it('al seleccionar una versión pasada y hacer clic en Restaurar se llama onJumpToHistory', () => {
    render(<HistoryTimelineModal {...defaultProps} />);

    // Hacemos clic en el paso "Punto de partida" (índice 0)
    const step0 = screen.getAllByText(/Punto de partida/i)[0];
    fireEvent.click(step0);

    const restoreBtn = screen.getByText('Restaurar a esta Versión').closest('button')!;
    expect(restoreBtn).not.toBeDisabled();
    fireEvent.click(restoreBtn);

    expect(defaultProps.onJumpToHistory).toHaveBeenCalledWith(0);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('permite guardar una copia independiente como nuevo mapa', () => {
    render(<HistoryTimelineModal {...defaultProps} />);

    const forkBtn = screen.getByRole('button', { name: /Guardar Copia como Nuevo Mapa/i });
    fireEvent.click(forkBtn);

    expect(defaultProps.onSaveAsNewMap).toHaveBeenCalled();
    expect(screen.getByText(/¡Versión guardada como/i)).toBeInTheDocument();
  });

  it('cierra el modal al pulsar la tecla Escape', () => {
    render(<HistoryTimelineModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
