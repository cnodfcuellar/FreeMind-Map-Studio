import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolPanel } from '../ToolPanel';
import { THEMES } from '../../utils/themes';
import { BLANK_MAP } from '../../utils/sampleMaps';
import type { MindNode } from '../../types/mindmap';

/**
 * Regresión del cableado de "Espaciado del Mapa" (ThemeTab):
 * App no pasa onUpdateMapGaps, así que ToolPanel adapta ese callback a
 * onUpdateMapSpacing(h, v) que App sí inyecta (ToolPanel.tsx, adaptador).
 */
describe('ToolPanel: onUpdateMapGaps → onUpdateMapSpacing', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    currentTheme: THEMES.default,
    layout: BLANK_MAP.layout,
    mindMap: structuredClone(BLANK_MAP),
    onUpdateMapTheme: vi.fn(),
    onUpdateMapLayout: vi.fn(),
    // Requeridos por el tipo pero no usados en la pestaña "Mapa":
    selectedNode: undefined as unknown as MindNode,
    onUpdateNode: vi.fn(),
  };

  const openEspaciado = (container: HTMLElement) => {
    fireEvent.click(screen.getByTitle('Configuración del Mapa'));
    fireEvent.click(screen.getByText('Espaciado del Mapa'));
    const sliders = container.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBe(2);
    return sliders;
  };

  it('el slider de Separación Horizontal llama a onUpdateMapSpacing con el valor y el gap vertical del mapa', () => {
    const onUpdateMapSpacing = vi.fn();
    const { container } = render(<ToolPanel {...baseProps} onUpdateMapSpacing={onUpdateMapSpacing} />);
    const sliders = openEspaciado(container);
    fireEvent.change(sliders[0], { target: { value: '100' } });
    expect(onUpdateMapSpacing).toHaveBeenCalledWith(100, 14);
  });

  it('el slider de Separación Vertical llama a onUpdateMapSpacing con el gap horizontal del mapa', () => {
    const onUpdateMapSpacing = vi.fn();
    const { container } = render(<ToolPanel {...baseProps} onUpdateMapSpacing={onUpdateMapSpacing} />);
    const sliders = openEspaciado(container);
    fireEvent.change(sliders[1], { target: { value: '30' } });
    expect(onUpdateMapSpacing).toHaveBeenCalledWith(54, 30);
  });

  it('una prop onUpdateMapGaps directa tiene prioridad sobre el adaptador', () => {
    const onUpdateMapGaps = vi.fn();
    const onUpdateMapSpacing = vi.fn();
    const { container } = render(
      <ToolPanel {...baseProps} onUpdateMapGaps={onUpdateMapGaps} onUpdateMapSpacing={onUpdateMapSpacing} />
    );
    const sliders = openEspaciado(container);
    fireEvent.change(sliders[0], { target: { value: '80' } });
    expect(onUpdateMapGaps).toHaveBeenCalledWith({ horizontal: 80 });
    expect(onUpdateMapSpacing).not.toHaveBeenCalled();
  });

  it('sin onUpdateMapSpacing los sliders no rompen (guard ?.)', () => {
    const { container } = render(<ToolPanel {...baseProps} />);
    const sliders = openEspaciado(container);
    fireEvent.change(sliders[0], { target: { value: '90' } });
    expect(screen.getByText('Separación Horizontal')).toBeDefined();
  });
});
