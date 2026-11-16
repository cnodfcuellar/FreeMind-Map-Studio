import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageExportModal } from '../ImageExportModal';
import { BLANK_MAP } from '../../../utils/sampleMaps';

describe('ImageExportModal', () => {
  it('renderiza pestañas de imagen y esquema', () => {
    render(
      <ImageExportModal
        mindMap={BLANK_MAP}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Imagen en Alta Resolución/)).toBeDefined();
    expect(screen.getByText(/Esquemas & Notas/)).toBeDefined();
    expect(screen.getByText('Resolución / Nitidez')).toBeDefined();
    expect(screen.getByText('Fondo de la Imagen')).toBeDefined();
  });

  it('permite alternar formatos de imagen (PNG, JPEG, SVG) y resoluciones (1x, 2x, 4x)', () => {
    render(
      <ImageExportModal
        mindMap={BLANK_MAP}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Cambiar a JPEG
    fireEvent.click(screen.getByText('JPEG'));
    expect(screen.getByText(/Descargar JPEG/)).toBeDefined();

    // Cambiar a SVG
    fireEvent.click(screen.getByText('SVG'));
    expect(screen.getByText(/Descargar SVG/)).toBeDefined();

    // Volver a PNG y cambiar a 4x Ultra
    fireEvent.click(screen.getByText('PNG'));
    fireEvent.click(screen.getByText('4x Ultra'));
    expect(screen.getByText(/Descargar PNG \(4x\)/)).toBeDefined();
  });

  it('permite conmutar a la pestaña de esquemas y muestra previsualización de texto', () => {
    render(
      <ImageExportModal
        mindMap={BLANK_MAP}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Conmutar pestaña a esquemas
    fireEvent.click(screen.getByText(/Esquemas & Notas/));

    expect(screen.getByText('Estilo de Esquema')).toBeDefined();
    expect(screen.getByText(/Encabezados #/)).toBeDefined();
    expect(screen.getByText(/Viñetas -/)).toBeDefined();
    expect(screen.getByText(/Checklist \[ \]/)).toBeDefined();
    expect(screen.getByText(/OPML 2.0/)).toBeDefined();

    // Cambiar a OPML
    fireEvent.click(screen.getByText(/OPML 2.0/));
    expect(screen.getByText(/Descargar Archivo \.opml/)).toBeDefined();
  });
});
