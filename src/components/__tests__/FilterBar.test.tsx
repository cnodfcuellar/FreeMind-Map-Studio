import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../FilterBar';
import { FilterOptions } from '../../types/mindmap';

describe('FilterBar component', () => {
  const defaultFilterOptions: FilterOptions = {
    query: '',
    showAncestors: true,
    showDescendants: true,
  };

  const defaultProps = {
    filterOptions: defaultFilterOptions,
    availableTags: ['urgente', 'diseño', 'backend'],
    matchCount: 0,
    isOpen: true,
    onClose: vi.fn(),
    onUpdateFilter: vi.fn(),
    onClearFilter: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(<FilterBar {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza buscador, selector de tags y selector de progreso cuando está abierto', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Buscar por texto/i)).toBeInTheDocument();
    expect(screen.getAllByRole('combobox').length).toBe(2);
    expect(screen.getByText('+ Metadatos')).toBeInTheDocument();
  });

  it('permite escribir en el buscador y llama a onUpdateFilter', () => {
    render(<FilterBar {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Buscar por texto/i);
    fireEvent.change(input, { target: { value: 'estrategia' } });
    expect(defaultProps.onUpdateFilter).toHaveBeenCalledWith({ query: 'estrategia' });
  });

  it('permite filtrar por etiquetas disponibles', () => {
    render(<FilterBar {...defaultProps} />);
    const tagSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(tagSelect, { target: { value: 'urgente' } });
    expect(defaultProps.onUpdateFilter).toHaveBeenCalledWith({ tag: 'urgente' });
  });

  it('permite filtrar por estado de progreso', () => {
    render(<FilterBar {...defaultProps} />);
    const progressSelect = screen.getAllByRole('combobox')[1];

    fireEvent.change(progressSelect, { target: { value: 'completed' } });
    expect(defaultProps.onUpdateFilter).toHaveBeenCalledWith({
      progressMode: 'completed',
      minProgress: undefined,
    });

    fireEvent.change(progressSelect, { target: { value: '50' } });
    expect(defaultProps.onUpdateFilter).toHaveBeenCalledWith({
      progressMode: undefined,
      minProgress: 50,
    });
  });

  it('alterna panel de opciones avanzadas y permite filtrar por contenido', () => {
    render(<FilterBar {...defaultProps} />);
    const advancedBtn = screen.getByText('+ Metadatos');
    fireEvent.click(advancedBtn);

    // Aparecen los botones de contenido
    const noteBtn = screen.getByText('Con Notas');
    const linkBtn = screen.getByText('Con Enlaces');
    const imageBtn = screen.getByText('Con Imágenes');
    const cloudBtn = screen.getByText('En Nube');
    const iconBtn = screen.getByText('Con Iconos');
    const ancestorBtn = screen.getByText('Árbol Contextual');

    expect(noteBtn).toBeInTheDocument();
    expect(linkBtn).toBeInTheDocument();

    fireEvent.click(noteBtn);
    expect(defaultProps.onUpdateFilter).toHaveBeenCalledWith({ hasNote: true });

    fireEvent.click(ancestorBtn);
    expect(defaultProps.onUpdateFilter).toHaveBeenCalledWith({ includeAncestors: true });
  });

  it('muestra el contador de coincidencias y botón de limpiar cuando hay filtro activo', () => {
    render(
      <FilterBar
        {...defaultProps}
        filterOptions={{ ...defaultFilterOptions, query: 'test' }}
        matchCount={3}
      />
    );

    expect(screen.getByText(/3 coincidencias/i)).toBeInTheDocument();
    const clearBtn = screen.getByText(/Limpiar filtros/i);
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(defaultProps.onClearFilter).toHaveBeenCalledTimes(1);
  });

  it('llama a onClose al presionar el botón de cierre', () => {
    render(<FilterBar {...defaultProps} />);
    const closeBtn = screen.getByTitle(/Cerrar barra de filtros/i);
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
