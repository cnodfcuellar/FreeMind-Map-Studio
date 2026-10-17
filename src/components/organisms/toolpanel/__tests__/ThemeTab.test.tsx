import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeTab } from '../ThemeTab';
import { THEMES } from '../../../../utils/themes';
import { BLANK_MAP } from '../../../../utils/sampleMaps';

describe('ThemeTab fondo del lienzo', () => {
  const baseProps = {
    currentTheme: THEMES.default,
    layout: BLANK_MAP.layout,
    mindMap: structuredClone(BLANK_MAP),
  } as const;

  it('cambiar patrón llama a onUpdateMapBackground con el id', () => {
    const onUpdateMapBackground = vi.fn();
    render(<ThemeTab {...baseProps} onUpdateMapTheme={vi.fn()} onUpdateMapLayout={vi.fn()} onUpdateMapBackground={onUpdateMapBackground} />);
    fireEvent.click(screen.getByText('Fondo del Lienzo'));
    fireEvent.click(screen.getByText('Panal'));
    expect(onUpdateMapBackground).toHaveBeenCalledWith({ backgroundPattern: 'hexagons' });
  });

  it('sin onUpdateMapBackground los controles no rompen (guard &&)', () => {
    render(<ThemeTab {...baseProps} onUpdateMapTheme={vi.fn()} onUpdateMapLayout={vi.fn()} />);
    expect(screen.getByText('Fondo del Lienzo')).toBeDefined();
  });
});
