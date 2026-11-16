import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfExportModal } from '../PdfExportModal';
import { BLANK_MAP } from '../../../utils/sampleMaps';
import * as pdfExporter from '../../../utils/pdfExporter';

describe('PdfExportModal', () => {
  const sampleMap = {
    ...BLANK_MAP,
    title: 'Mapa de Prueba PDF',
    nodes: {
      root: {
        id: 'root',
        text: 'Nodo Central',
        parentId: null,
        children: ['n1'],
      },
      n1: {
        id: 'n1',
        text: 'Subnodo A',
        parentId: 'root',
        children: [],
      },
    },
  };

  const defaultProps = {
    mindMap: sampleMap,
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(<PdfExportModal {...defaultProps} isOpen={false} />);
    expect(container.textContent).toBe('');
  });

  it('renderiza título, tamaños de papel, orientaciones y simulación de hoja', () => {
    render(<PdfExportModal {...defaultProps} />);

    expect(screen.getByText('Exportar a PDF Vectorial e Impresión Profesional')).toBeDefined();
    expect(screen.getByText('A4 Estándar')).toBeDefined();
    expect(screen.getByText('A3 Mediano')).toBeDefined();
    expect(screen.getByText('Carta (Letter)')).toBeDefined();
    expect(screen.getByText('Horizontal (Apaisado)')).toBeDefined();
    expect(screen.getByText('Vertical (Retrato)')).toBeDefined();
    expect(screen.getByText('Simulación de Hoja de Impresión')).toBeDefined();
  });

  it('permite cambiar tamaño de papel y orientación', () => {
    render(<PdfExportModal {...defaultProps} />);

    const a3Btn = screen.getByText('A3 Mediano').closest('button') as HTMLElement;
    fireEvent.click(a3Btn);

    expect(screen.getAllByText(/420 × 297 mm/).length).toBeGreaterThanOrEqual(1);

    const portraitBtn = screen.getByText('Vertical (Retrato)').closest('button') as HTMLElement;
    fireEvent.click(portraitBtn);

    expect(screen.getAllByText(/297 × 420 mm/).length).toBeGreaterThanOrEqual(1);
  });

  it('permite seleccionar modo Mosaico 2x2 y muestra 4 páginas en la vista previa', () => {
    render(<PdfExportModal {...defaultProps} />);

    const mosaicBtn = screen.getByText('Mosaico 2×2 (Cuadrícula)').closest('button') as HTMLElement;
    fireEvent.click(mosaicBtn);

    expect(screen.getByText(/4 Páginas/)).toBeDefined();
    expect(screen.getByText('Pág. 1')).toBeDefined();
    expect(screen.getByText('Pág. 2')).toBeDefined();
    expect(screen.getByText('Pág. 3')).toBeDefined();
    expect(screen.getByText('Pág. 4')).toBeDefined();
  });

  it('ejecuta triggerBrowserPdfPrint al hacer clic en Imprimir / Guardar como PDF', () => {
    const printSpy = vi.spyOn(pdfExporter, 'triggerBrowserPdfPrint').mockImplementation(() => {});
    render(<PdfExportModal {...defaultProps} />);

    const printBtn = screen.getByText('Imprimir / Guardar como PDF Vectorial').closest('button') as HTMLElement;
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(printSpy.mock.calls[0][0]).toBe(sampleMap);
  });

  it('ejecuta downloadVectorSvg al hacer clic en Descargar SVG Vectorial', () => {
    const downloadSpy = vi.spyOn(pdfExporter, 'downloadVectorSvg').mockImplementation(() => {});
    render(<PdfExportModal {...defaultProps} />);

    const svgBtn = screen.getByText('Descargar SVG Vectorial (.svg)').closest('button') as HTMLElement;
    fireEvent.click(svgBtn);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy.mock.calls[0][0]).toBe(sampleMap);
  });

  it('llama a onClose al hacer clic en Cancelar', () => {
    render(<PdfExportModal {...defaultProps} />);

    const cancelBtn = screen.getByText('Cancelar').closest('button') as HTMLElement;
    fireEvent.click(cancelBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('permite cambiar margen de hoja y muestra opciones de margen', () => {
    render(<PdfExportModal {...defaultProps} />);

    expect(screen.getByText('Mínimo (4 mm)')).toBeDefined();
    expect(screen.getByText('Estándar (8 mm)')).toBeDefined();

    const minMarginBtn = screen.getByText('Mínimo (4 mm)').closest('button') as HTMLElement;
    fireEvent.click(minMarginBtn);

    expect(screen.getByText('4 mm')).toBeDefined();
  });

  it('muestra botón de orientación Auto y permite alternar a Auto', () => {
    render(<PdfExportModal {...defaultProps} />);

    const autoBtn = screen.getByText('Auto').closest('button') as HTMLElement;
    expect(autoBtn).toBeDefined();

    const portraitBtn = screen.getByText('Vertical (Retrato)').closest('button') as HTMLElement;
    fireEvent.click(portraitBtn);

    fireEvent.click(autoBtn);
    expect(screen.getByText(/detectado/i)).toBeDefined();
  });
});
