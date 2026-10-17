import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBar } from '../StatusBar';

describe('StatusBar (regresión del zoom/posición hardcodeado)', () => {
  it('muestra el zoom y la posición REALES provistos por el viewport', () => {
    render(
      <StatusBar
        totalNodes={12}
        selectedNodeText="Raíz"
        selectedNodeId="root"
        zoom={137}
        positionX={-210}
        positionY={84}
        mode="Editando"
      />
    );

    // Antes: App pasaba zoom={100} positionX={0} positionY={0} fijos sin importar el estado real
    expect(screen.getByText(/137%/)).toBeDefined();
    expect(screen.getByText(/\(X: -210, Y: 84\)/)).toBeDefined();
    expect(screen.getByText(/Editando/)).toBeDefined();
  });

  it('usa los defaults solo cuando no se pasan zoom/posición', () => {
    render(
      <StatusBar totalNodes={3} selectedNodeText={null} selectedNodeId={null} />
    );
    expect(screen.getByText(/100%/)).toBeDefined();
    expect(screen.getByText(/\(X: 0, Y: 0\)/)).toBeDefined();
    expect(screen.getByText(/Listo/)).toBeDefined();
  });

  it('muestra nodos totales y nodo seleccionado', () => {
    render(
      <StatusBar
        totalNodes={42}
        selectedNodeText="Idea"
        selectedNodeId="n-1"
        zoom={100}
        positionX={0}
        positionY={0}
        mode="Listo"
      />
    );
    expect(screen.getByText(/42/)).toBeDefined();
    expect(screen.getByText(/"Idea"/)).toBeDefined();
    expect(screen.getByText(/n-1/)).toBeDefined();
  });
});
