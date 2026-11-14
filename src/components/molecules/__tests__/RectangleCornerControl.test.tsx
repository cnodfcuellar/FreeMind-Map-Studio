import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RectangleCornerControl } from '../RectangleCornerControl';
import { MindNode } from '../../../types/mindmap';

const createNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-1',
  text: 'Test Node',
  parentId: null,
  children: [],
  shape: 'rectangle',
  ...overrides,
});

describe('RectangleCornerControl', () => {
  it('renderiza título del rectángulo, badge 1 Clic y los 4 tipos de esquina unificados', () => {
    const node = createNode({ shape: 'rectangle' });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    expect(screen.getByText('Cualidades del Rectángulo')).toBeDefined();
    expect(screen.getByText('1 Clic')).toBeDefined();
    expect(screen.getByTestId('corner-style-sharp')).toBeDefined();
    expect(screen.getByTestId('corner-style-rounded')).toBeDefined();
    expect(screen.getByTestId('corner-style-bevel')).toBeDefined();
    expect(screen.getByTestId('corner-style-concave')).toBeDefined();
  });

  it('renderiza título de Cuadrado cuando el nodo es cuadrado', () => {
    const node = createNode({ shape: 'square' });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    expect(screen.getByText('Cualidades del Cuadrado')).toBeDefined();
  });

  it('aplica esquina redonda (8px) al hacer clic en Redonda', () => {
    const node = createNode({ shape: 'rectangle', rectCornerStyle: 'sharp' });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('corner-style-rounded'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectCornerStyle: 'rounded',
      rectRadius: 8,
      rectPreset: 'smooth',
    });
  });

  it('aplica esquina bisel (6px) al hacer clic en Bisel', () => {
    const node = createNode({ shape: 'rectangle', rectCornerStyle: 'sharp' });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('corner-style-bevel'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectCornerStyle: 'bevel',
      rectRadius: 6,
      rectPreset: 'bevel',
    });
  });

  it('aplica esquina cóncava (10px) al hacer clic en Cóncava', () => {
    const node = createNode({ shape: 'rectangle', rectCornerStyle: 'sharp' });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('corner-style-concave'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectCornerStyle: 'concave',
      rectRadius: 10,
      rectPreset: undefined,
    });
  });

  it('aplica esquina recta (0px) al hacer clic en Recta', () => {
    const node = createNode({ shape: 'rectangle', rectCornerStyle: 'rounded', rectRadius: 8 });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('corner-style-sharp'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectCornerStyle: 'sharp',
      rectRadius: 0,
      rectPreset: 'sharp',
    });
  });

  it('despliega el acordeón de calibración avanzada y permite cambiar radio y asimetría', () => {
    const node = createNode({
      shape: 'rectangle',
      rectCornerStyle: 'rounded',
      rectRadius: 8,
      rectCornerTopLeft: true,
      rectCornerTopRight: true,
      rectCornerBottomRight: true,
      rectCornerBottomLeft: true,
    });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    // Inicialmente el slider no está en pantalla
    expect(screen.queryByTestId('radius-slider')).toBeNull();

    // Clic en acordeón para abrir
    fireEvent.click(screen.getByTestId('toggle-advanced-calibration'));
    expect(screen.getByTestId('radius-slider')).toBeDefined();
    expect(screen.getByTestId('radius-badge').textContent).toBe('8px');

    // Clic en botón +
    fireEvent.click(screen.getByTestId('radius-increment'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectRadius: 10,
      rectPreset: undefined,
    });

    // Clic en botón ⌜ Sup-Izq para alternar asimetría
    fireEvent.click(screen.getByTestId('toggle-corner-tl'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectCornerTopLeft: false,
      rectPreset: undefined,
    });
  });

  it('permite restablecer todas las esquinas con un clic', () => {
    const node = createNode({
      shape: 'rectangle',
      rectCornerStyle: 'rounded',
      rectRadius: 8,
      rectCornerTopRight: false,
    });
    const onUpdateNode = vi.fn();
    render(<RectangleCornerControl node={node} onUpdateNode={onUpdateNode} />);

    // Abrir acordeón
    fireEvent.click(screen.getByTestId('toggle-advanced-calibration'));

    // Botón de activar todas las esquinas
    const resetBtn = screen.getByTestId('reset-corners-btn');
    expect(resetBtn).toBeDefined();
    fireEvent.click(resetBtn);

    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      rectCornerTopLeft: true,
      rectCornerTopRight: true,
      rectCornerBottomRight: true,
      rectCornerBottomLeft: true,
      rectPreset: undefined,
    });
  });
});
