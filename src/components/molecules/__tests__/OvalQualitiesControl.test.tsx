import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OvalQualitiesControl } from '../OvalQualitiesControl';
import { MindNode } from '../../../types/mindmap';

const createNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-1',
  text: 'Test Node',
  parentId: null,
  children: [],
  shape: 'oval',
  ...overrides,
});

describe('OvalQualitiesControl', () => {
  it('renderiza título, badge 1 Clic, presets de orientación y switch de texto', () => {
    const node = createNode();
    const onUpdateNode = vi.fn();
    render(<OvalQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    expect(screen.getByText('Cualidades del Óvalo (Elipse)')).toBeDefined();
    expect(screen.getByText('1 Clic')).toBeDefined();
    expect(screen.getByTestId('preset-oval-horizontal')).toBeDefined();
    expect(screen.getByTestId('preset-oval-tilted')).toBeDefined();
    expect(screen.getByTestId('preset-oval-vertical')).toBeDefined();
    expect(screen.getByText('Texto siempre horizontal')).toBeDefined();
  });

  it('aplica preset inclinado (15°) al pulsar en Inclinado', () => {
    const node = createNode({ ovalRotation: 0 });
    const onUpdateNode = vi.fn();
    render(<OvalQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('preset-oval-tilted'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      ovalRotation: 15,
      ovalPreset: 'tilted',
      ovalKeepTextHorizontal: true,
    });
  });

  it('aplica preset vertical (90°) al pulsar en Vertical', () => {
    const node = createNode({ ovalRotation: 0 });
    const onUpdateNode = vi.fn();
    render(<OvalQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('preset-oval-vertical'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      ovalRotation: 90,
      ovalPreset: 'vertical',
      ovalKeepTextHorizontal: true,
    });
  });

  it('permite alternar el toggle de texto horizontal', () => {
    const node = createNode({ ovalKeepTextHorizontal: true });
    const onUpdateNode = vi.fn();
    render(<OvalQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('toggle-keep-text-horizontal'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      ovalKeepTextHorizontal: false,
    });
  });

  it('despliega calibración avanzada para ajustar ángulo fino y esbeltez', () => {
    const node = createNode({ ovalRotation: 15 });
    const onUpdateNode = vi.fn();
    render(<OvalQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    // Abrir acordeón
    fireEvent.click(screen.getByTestId('toggle-advanced-oval'));

    expect(screen.getByTestId('oval-angle-slider')).toBeDefined();
    expect(screen.getByTestId('oval-angle-badge').textContent).toBe('15°');

    // Botón + aumenta 5°
    fireEvent.click(screen.getByTestId('angle-increment'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      ovalRotation: 20,
      ovalPreset: undefined,
    });

    // Seleccionar proporción esbelta
    fireEvent.click(screen.getByTestId('oval-ratio-slender'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-1', {
      ovalRatio: 'slender',
    });
  });
});
