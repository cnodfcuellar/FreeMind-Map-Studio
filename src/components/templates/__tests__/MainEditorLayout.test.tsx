import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MainEditorLayout } from '../MainEditorLayout';

describe('MainEditorLayout', () => {
  it('renders standard editor elements when not in presentation mode', () => {
    render(
      <MainEditorLayout
        menuBar={<div>Barra de Menú</div>}
        toolBar={<div>Barra de Herramientas</div>}
        canvas={<div>Lienzo del Mapa</div>}
        statusBar={<div>Barra de Estado</div>}
        isPresentationMode={false}
      />
    );

    expect(screen.getByText('Barra de Menú')).toBeInTheDocument();
    expect(screen.getByText('Barra de Herramientas')).toBeInTheDocument();
    expect(screen.getByText('Lienzo del Mapa')).toBeInTheDocument();
    expect(screen.getByText('Barra de Estado')).toBeInTheDocument();
  });

  it('hides top bars and renders presentation overlay when in presentation mode', () => {
    render(
      <MainEditorLayout
        menuBar={<div>Barra de Menú</div>}
        toolBar={<div>Barra de Herramientas</div>}
        canvas={<div>Lienzo del Mapa</div>}
        presentationOverlay={<div>Overlay de Presentación</div>}
        isPresentationMode={true}
      />
    );

    expect(screen.queryByText('Barra de Menú')).not.toBeInTheDocument();
    expect(screen.queryByText('Barra de Herramientas')).not.toBeInTheDocument();
    expect(screen.getByText('Overlay de Presentación')).toBeInTheDocument();
  });
});
