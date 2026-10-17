import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { TemplatesModal } from '../TemplatesModal';
import { ALL_TEMPLATES } from '../../../utils/sampleMaps';

describe('TemplatesModal integridad', () => {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    onSelectTemplate: vi.fn(),
  };

  it('no renderiza nada si está cerrado', () => {
    const { container } = render(<TemplatesModal {...props} isOpen={false} />);
    expect(container.textContent).toBe('');
  });

  it('muestra header, badge dinámico y todas las plantillas', () => {
    render(<TemplatesModal {...props} />);
    expect(screen.getByText('Galería de Plantillas y Ejemplos')).toBeDefined();
    expect(screen.getByText(`${ALL_TEMPLATES.length} Modelos`)).toBeDefined();
    expect(screen.getByText('Comenzar con Mapa en Blanco')).toBeDefined();
    for (const t of ALL_TEMPLATES) {
      expect(screen.getByText(t.title)).toBeDefined();
    }
  }, 20000);

  it('filtra por búsqueda y por categoría', () => {
    render(<TemplatesModal {...props} />);
    const input = screen.getByPlaceholderText(/Buscar por plantilla/);
    fireEvent.change(input, { target: { value: 'xyz-sin-coincidencias' } });
    expect(screen.getByText(/No se encontraron plantillas/)).toBeDefined();
    fireEvent.change(input, { target: { value: '' } });
    const catBtn = screen.getAllByText('Estrategia').find((el) => el.tagName === 'BUTTON') as HTMLElement;
    fireEvent.click(catBtn);
    expect(screen.queryByText('Comenzar con Mapa en Blanco')).toBeDefined();
  });

  it('seleccionar plantilla llama onSelectTemplate con id nuevo y cierra', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<TemplatesModal isOpen={true} onClose={onClose} onSelectTemplate={onSelect} />);
    const card = screen.getByText(ALL_TEMPLATES[0].title).closest('div[class*="cursor-pointer"]') as HTMLElement;
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].id).toMatch(/^map-/);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cada card tiene preview SVG, tags y metadata (tema/layout)', () => {
    const t = ALL_TEMPLATES[0];
    const { container } = render(<TemplatesModal {...props} />);
    const previews = container.querySelectorAll('svg');
    expect(previews.length).toBeGreaterThan(ALL_TEMPLATES.length);
    const titleEl = screen.getByText(t.title);
    const card = titleEl.closest('div.p-4') as HTMLElement;
    const scope = within(card);
    expect(scope.getByText(t.themeName)).toBeDefined();
    expect(scope.getByText(t.layoutLabel)).toBeDefined();
    for (const tag of t.tags ?? []) {
      expect(scope.getByText(`#${tag}`)).toBeDefined();
    }
  });
});
