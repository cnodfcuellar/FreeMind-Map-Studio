import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NodeForkHooks } from '../NodeForkHooks';
import { MindNode, MindMapTheme } from '../../../../types/mindmap';

describe('NodeForkHooks', () => {
  const mockTheme: MindMapTheme = {
    id: 'default',
    name: 'Clásico Azul',
    background: '#f8fafc',
    rootBg: '#2563eb',
    rootText: '#ffffff',
    nodeBg: '#ffffff',
    nodeText: '#1e293b',
    nodeBorder: '#3b82f6',
    branchColors: ['#3b82f6'],
    edgeStyle: 'bezier',
    fontFamily: 'Plus Jakarta Sans',
  };

  const mockLayout = {
    width: 120,
    height: 40,
    side: 'right' as const,
  };

  const createForkNode = (overrides?: Partial<MindNode>): MindNode => ({
    id: 'fork-node-1',
    parentId: null,
    children: [],
    text: 'Idea Fork',
    shape: 'fork',
    ...overrides,
  });

  it('no renderiza nada si shape no es fork', () => {
    const { container } = render(
      <NodeForkHooks
        node={{ id: '1', parentId: null, children: [], text: 'Bubble', shape: 'bubble' }}
        layout={mockLayout}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza SVG con ganchos a 90° por defecto (both)', () => {
    const node = createForkNode();
    const { container } = render(
      <NodeForkHooks
        node={node}
        layout={mockLayout}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    const path = container.querySelector('path');
    expect(path).toBeDefined();
    const d = path?.getAttribute('d') || '';
    // Debe empezar en x=0, bajar a yBase, recorrer a w, y subir a yTop
    expect(d).toContain('M 0');
    expect(d).toContain('L 120');
  });

  it('dibuja línea horizontal pura si forkHooks es none', () => {
    const node = createForkNode({ forkHooks: 'none' });
    const { container } = render(
      <NodeForkHooks
        node={node}
        layout={mockLayout}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );

    const path = container.querySelector('path');
    const d = path?.getAttribute('d') || '';
    // M 0 yBase L 120 yBase
    expect(d).toBe('M 0 38.75 L 120 38.75');
  });

  it('soporta estilo de esquina redondeada (rounded) con curvas Q', () => {
    const node = createForkNode({ forkCornerStyle: 'rounded', forkHooks: 'both' });
    const { container } = render(
      <NodeForkHooks
        node={node}
        layout={mockLayout}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );

    const path = container.querySelector('path');
    const d = path?.getAttribute('d') || '';
    expect(d).toContain('Q');
  });

  it('soporta estilo de esquina en bisel a 45° (bevel)', () => {
    const node = createForkNode({ forkCornerStyle: 'bevel', forkHooks: 'both' });
    const { container } = render(
      <NodeForkHooks
        node={node}
        layout={mockLayout}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );

    const path = container.querySelector('path');
    const d = path?.getAttribute('d') || '';
    expect(d).toContain('L 3.6');
  });

  it('distingue lado del padre e hijos según layout.side', () => {
    // Nodo a la derecha: padre es izquierda (x=0)
    const nodeParentOnly = createForkNode({ forkHooks: 'parent' });
    const { container: rightSide } = render(
      <NodeForkHooks
        node={nodeParentOnly}
        layout={{ ...mockLayout, side: 'right' }}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );

    const pathRight = rightSide.querySelector('path')?.getAttribute('d') || '';
    // Tiene gancho a la izquierda pero termina plano en la derecha
    expect(pathRight).toContain('L 120 38.75');

    // Nodo a la izquierda: padre es derecha (x=120)
    const { container: leftSide } = render(
      <NodeForkHooks
        node={nodeParentOnly}
        layout={{ ...mockLayout, side: 'left' }}
        theme={mockTheme}
        branchColor="#3b82f6"
      />
    );
    const pathLeft = leftSide.querySelector('path')?.getAttribute('d') || '';
    // Empieza plano en x=0 y sube a la derecha
    expect(pathLeft.startsWith('M 0 38.75')).toBe(true);
  });
});
