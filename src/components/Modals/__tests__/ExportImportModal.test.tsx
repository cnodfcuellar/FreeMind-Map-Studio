import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportImportModal } from '../ExportImportModal';
import { BLANK_MAP } from '../../../utils/sampleMaps';
import { MindMap } from '../../../types/mindmap';

describe('ExportImportModal', () => {
  const sampleMap: MindMap = {
    ...BLANK_MAP,
    title: 'Mapa de Prueba para Exportación',
    nodes: {
      root: {
        id: 'root',
        parentId: null,
        text: 'Nodo Raíz',
        children: ['child-1'],
      },
      'child-1': {
        id: 'child-1',
        parentId: 'root',
        text: 'Rama Hijo',
        children: [],
      },
    },
  };

  const defaultProps = {
    mindMap: sampleMap,
    isOpen: true,
    onClose: vi.fn(),
    onImportMap: vi.fn(),
    onOpenPdfModal: vi.fn(),
    onOpenImageModal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el modal cuando isOpen es true con todas las opciones de exportación', () => {
    render(<ExportImportModal {...defaultProps} />);

    expect(screen.getByText('Exportar e Importar Mapas Mentales')).toBeInTheDocument();
    expect(screen.getByText('Formato Freeplane / FreeMind (.mm)')).toBeInTheDocument();
    expect(screen.getByText('HTML Portable (Autónomo & Offline)')).toBeInTheDocument();
    expect(screen.getByText('Esquema Markdown (.md)')).toBeInTheDocument();
    expect(screen.getByText('Copia Completa JSON (.json)')).toBeInTheDocument();
    expect(screen.getByText('Documento PDF Vectorial & Mosaico')).toBeInTheDocument();
    expect(screen.getByText('Imagen en Alta Resolución (PNG / JPEG)')).toBeInTheDocument();
  });

  it('permite cambiar a la pestaña de Importar Archivo', () => {
    render(<ExportImportModal {...defaultProps} />);

    const importTab = screen.getByText('Importar Archivo');
    fireEvent.click(importTab);

    expect(screen.getByText('Arrastra o selecciona un archivo .mm o .json')).toBeInTheDocument();
  });

  it('abre los modales especializados de PDF e Imagen HD al hacer clic en sus botones', () => {
    render(<ExportImportModal {...defaultProps} />);

    const pdfBtn = screen.getByText('Configurar PDF...');
    fireEvent.click(pdfBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(defaultProps.onOpenPdfModal).toHaveBeenCalled();

    const imageBtn = screen.getByText('Configurar Imagen...');
    fireEvent.click(imageBtn);
    expect(defaultProps.onOpenImageModal).toHaveBeenCalledWith('image');
  });

  it('permite descargar Markdown y OPML directamente', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');

    render(<ExportImportModal {...defaultProps} />);

    const mdBtn = screen.getByText('Descargar .md');
    fireEvent.click(mdBtn);
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    const opmlBtn = screen.getByText('OPML');
    fireEvent.click(opmlBtn);
    expect(appendSpy).toHaveBeenCalled();
  });
});
