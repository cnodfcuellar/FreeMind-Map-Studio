import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArrowQualitiesControl } from '../ArrowQualitiesControl';
import { MindNode } from '../../../types/mindmap';
import { DEFAULT_ARROW_TIP_RATIO } from '../../../utils/arrowShapeUtils';

const createNode = (overrides?: Partial<MindNode>): MindNode => ({
  id: 'node-arrow-1',
  text: 'Arrow Test',
  parentId: null,
  children: [],
  shape: 'arrow',
  ...overrides,
});

describe('ArrowQualitiesControl', () => {
  it('renderiza título, badge 1 Clic, presets de dirección y toggle de auto-orientación', () => {
    const node = createNode();
    const onUpdateNode = vi.fn();
    render(<ArrowQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    expect(screen.getByText('Cualidades de la Flecha')).toBeDefined();
    expect(screen.getByText('1 Clic')).toBeDefined();
    expect(screen.getByTestId('preset-arrow-right')).toBeDefined();
    expect(screen.getByTestId('preset-arrow-left')).toBeDefined();
    expect(screen.getByTestId('preset-arrow-up')).toBeDefined();
    expect(screen.getByTestId('preset-arrow-down')).toBeDefined();
    expect(screen.getByTestId('toggle-arrow-auto-orient')).toBeDefined();
    expect(screen.getByTestId('toggle-arrow-calibration')).toBeDefined();
  });

  it('aplica dirección izquierda al pulsar en ← Izq.', () => {
    const node = createNode({ arrowDirection: 'right' });
    const onUpdateNode = vi.fn();
    render(<ArrowQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('preset-arrow-left'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowDirection: 'left',
      arrowAutoOrient: false,
    });
  });

  it('aplica dirección arriba al pulsar en ↑ Arriba', () => {
    const node = createNode({ arrowDirection: 'right' });
    const onUpdateNode = vi.fn();
    render(<ArrowQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('preset-arrow-up'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowDirection: 'up',
      arrowAutoOrient: false,
    });
  });

  it('permite alternar el switch de auto-orientación según rama', () => {
    const node = createNode({ arrowAutoOrient: false });
    const onUpdateNode = vi.fn();
    render(<ArrowQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('toggle-arrow-auto-orient'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowAutoOrient: true,
    });
  });

  it('despliega el acordeón de calibración y permite elegir cola plana y doble punta', () => {
    const node = createNode();
    const onUpdateNode = vi.fn();
    render(<ArrowQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    // Desplegar acordeón
    fireEvent.click(screen.getByTestId('toggle-arrow-calibration'));

    // Seleccionar cola plana
    fireEvent.click(screen.getByTestId('tail-style-flat'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowTailStyle: 'flat',
      arrowBidirectional: false,
    });

    // Seleccionar doble punta
    fireEvent.click(screen.getByTestId('tail-style-bidirectional'));
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowTailStyle: 'notch',
      arrowBidirectional: true,
    });
  });

  it('permite cambiar y restablecer la proporción de punta', () => {
    const node = createNode({ arrowTipRatio: 0.25 });
    const onUpdateNode = vi.fn();
    render(<ArrowQualitiesControl node={node} onUpdateNode={onUpdateNode} />);

    fireEvent.click(screen.getByTestId('toggle-arrow-calibration'));

    const slider = screen.getByTestId('slider-arrow-tip-ratio');
    fireEvent.change(slider, { target: { value: '40' } });
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowTipRatio: 0.4,
    });

    const resetBtn = screen.getByTestId('btn-reset-arrow-tip');
    fireEvent.click(resetBtn);
    expect(onUpdateNode).toHaveBeenCalledWith('node-arrow-1', {
      arrowTipRatio: DEFAULT_ARROW_TIP_RATIO,
    });
  });
});
