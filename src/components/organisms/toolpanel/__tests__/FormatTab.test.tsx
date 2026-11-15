import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormatTab } from '../FormatTab';
import type { MindNode } from '../../../../types/mindmap';

const createMockNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-1',
  text: 'Nodo de Prueba',
  shape: 'bubble',
  color: '#3b82f6',
  parentId: null,
  children: [],
  ...overrides,
});

describe('FormatTab Component', () => {
  it('renderiza correctamente el encabezado y las 4 secciones modulares', () => {
    const node = createMockNode();
    const onUpdateNode = vi.fn();

    render(<FormatTab selectedNode={node} onUpdateNode={onUpdateNode} />);

    expect(screen.getByText('Formato Visual del Nodo')).toBeInTheDocument();
    expect(screen.getByText('Forma y Geometría')).toBeInTheDocument();
    expect(screen.getByText('Fondo y Relleno')).toBeInTheDocument();
    expect(screen.getByText('Bordes y Contorno')).toBeInTheDocument();
    expect(screen.getByText('Aristas y Propagación')).toBeInTheDocument();
  });

  it('permite plegar y desplegar todas las secciones con los botones globales', () => {
    const node = createMockNode();
    const onUpdateNode = vi.fn();

    render(<FormatTab selectedNode={node} onUpdateNode={onUpdateNode} />);

    const expandAllBtn = screen.getByText('Desplegar todo');
    fireEvent.click(expandAllBtn);

    // Fondo y Relleno debe estar visible ahora con sus opciones de tipo de fondo
    expect(screen.getByText('Color de Fondo')).toBeInTheDocument();

    const collapseAllBtn = screen.getByText('Plegar todo');
    fireEvent.click(collapseAllBtn);

    // Al estar todo plegado, los contenidos internos no deben mostrarse
    expect(screen.queryByText('Color de Fondo')).not.toBeInTheDocument();
  });

  it('llama a onUpdateNode al modificar dimensiones en Forma y Geometría', () => {
    const node = createMockNode({ customWidth: 120 });
    const onUpdateNode = vi.fn();

    render(<FormatTab selectedNode={node} onUpdateNode={onUpdateNode} />);

    const resetBtn = screen.getByText('Resetear a Auto');
    fireEvent.click(resetBtn);

    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      customWidth: undefined,
      customHeight: undefined,
    });
  });

  it('llama a onApplyStyleToChildren y onApplyStyleToSiblings en Aristas y Propagación', () => {
    const node = createMockNode();
    const onUpdateNode = vi.fn();
    const onApplyStyleToChildren = vi.fn();
    const onApplyStyleToSiblings = vi.fn();

    render(
      <FormatTab
        selectedNode={node}
        onUpdateNode={onUpdateNode}
        onApplyStyleToChildren={onApplyStyleToChildren}
        onApplyStyleToSiblings={onApplyStyleToSiblings}
      />
    );

    // Desplegar todo para ver los botones de propagación
    fireEvent.click(screen.getByText('Desplegar todo'));

    const childrenBtn = screen.getByText('Aplicar a Hijos');
    fireEvent.click(childrenBtn);
    expect(onApplyStyleToChildren).toHaveBeenCalledWith('node-1');

    const siblingsBtn = screen.getByText('Aplicar a Hermanos');
    fireEvent.click(siblingsBtn);
    expect(onApplyStyleToSiblings).toHaveBeenCalledWith('node-1');
  });
});
