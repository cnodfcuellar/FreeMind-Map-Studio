import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MiniMap } from '../MiniMap';
import { computeMindMapLayout } from '../../utils/layoutEngine';
import { BLANK_MAP } from '../../utils/sampleMaps';
import { THEMES } from '../../utils/themes';

const baseProps = {
  mindMap: structuredClone(BLANK_MAP),
  layoutMap: computeMindMapLayout(structuredClone(BLANK_MAP)),
  theme: THEMES.default,
  pan: { x: 0, y: 0 },
  zoom: 1,
  containerWidth: 1200,
  containerHeight: 800,
  selectedNodeId: 'root' as string | null,
  showMiniMap: true,
  onPanChange: () => {},
  onZoomIn: () => {},
  onZoomOut: () => {},
  onResetZoom: () => {},
  onFitView: () => {},
  onToggleMiniMap: () => {},
};

describe('MiniMap', () => {
  it('en compact oculta el título y conserva el icono con tooltip', () => {
    localStorage.setItem('mindmap_minimap_size', 'compact');
    const { container } = render(<MiniMap {...baseProps} />);
    expect(screen.queryByText('MiniMapa')).toBeNull();
    expect(container.querySelector('[title="MiniMapa"]')).toBeDefined();
    localStorage.removeItem('mindmap_minimap_size');
  });

  it('la píldora de zoom usa el token de superficie (sin variantes dark)', () => {
    const { container } = render(<MiniMap {...baseProps} />);
    const pill = container.querySelector('.rounded-2xl.shadow-lg');
    expect(pill?.className).toContain('bg-[var(--sp-bg)]');
    expect(pill?.className).not.toContain('dark:');
  });

  it('cambiar tamaño persiste en localStorage', () => {
    render(<MiniMap {...baseProps} />);
    fireEvent.click(screen.getByTitle('Tamaño Grande'));
    expect(localStorage.getItem('mindmap_minimap_size')).toBe('large');
    localStorage.removeItem('mindmap_minimap_size');
  });
});
