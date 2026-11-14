import { describe, it, expect } from 'vitest';
import { describeMapDiff, buildHistoryTimeline, formatHistoryTimestamp } from '../historyDiff';
import { BLANK_MAP } from '../sampleMaps';
import { MindMap, MindNode } from '../../types/mindmap';

describe('historyDiff utility', () => {
  const baseMap: MindMap = {
    ...BLANK_MAP,
    id: 'test-map-1',
    title: 'Mapa de Prueba',
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        text: 'Idea Central',
        parentId: null,
        children: ['n1'],
        side: 'root',
      },
      n1: {
        id: 'n1',
        text: 'Subrama 1',
        parentId: 'root',
        children: [],
        side: 'right',
      },
    },
    connectors: [],
  };

  it('describeMapDiff detecta estado inicial cuando prevMap es null', () => {
    const res = describeMapDiff(null, baseMap);
    expect(res.category).toBe('initial');
    expect(res.summary).toContain('Estado inicial');
    expect(res.details).toContain('2 nodos');
  });

  it('describeMapDiff detecta cambio de tema y layout', () => {
    const themeChanged: MindMap = { ...baseMap, themeId: 'dark' };
    const themeRes = describeMapDiff(baseMap, themeChanged);
    expect(themeRes.category).toBe('theme');
    expect(themeRes.summary).toContain('dark');

    const layoutChanged: MindMap = { ...baseMap, layout: 'tree-down' };
    const layoutRes = describeMapDiff(baseMap, layoutChanged);
    expect(layoutRes.category).toBe('layout');
    expect(layoutRes.summary).toContain('tree-down');
  });

  it('describeMapDiff detecta adición de un nodo y múltiples nodos', () => {
    const withNewNode: MindMap = {
      ...baseMap,
      nodes: {
        ...baseMap.nodes,
        n2: {
          id: 'n2',
          text: 'Objetivos Q4',
          parentId: 'root',
          children: [],
          side: 'right',
        },
      },
    };
    const res1 = describeMapDiff(baseMap, withNewNode);
    expect(res1.category).toBe('node-add');
    expect(res1.summary).toContain('Objetivos Q4');

    const withMultipleNodes: MindMap = {
      ...withNewNode,
      nodes: {
        ...withNewNode.nodes,
        n3: { id: 'n3', text: 'Extra 1', parentId: 'root', children: [], side: 'left' },
      },
    };
    const res2 = describeMapDiff(baseMap, withMultipleNodes);
    expect(res2.category).toBe('bulk');
    expect(res2.summary).toContain('2 nodos agregados');
  });

  it('describeMapDiff detecta eliminación de nodo', () => {
    const withoutN1: MindMap = {
      ...baseMap,
      nodes: {
        root: { ...baseMap.nodes.root, children: [] },
      },
    };
    const res = describeMapDiff(baseMap, withoutN1);
    expect(res.category).toBe('node-delete');
    expect(res.summary).toContain('Subrama 1');
  });

  it('describeMapDiff detecta edición de texto y de nota/cuerpo', () => {
    const textChanged: MindMap = {
      ...baseMap,
      nodes: {
        ...baseMap.nodes,
        n1: { ...baseMap.nodes.n1, text: 'Plan Estratégico' },
      },
    };
    const resText = describeMapDiff(baseMap, textChanged);
    expect(resText.category).toBe('node-text');
    expect(resText.summary).toContain('Plan Estratégico');

    const bodyChanged: MindMap = {
      ...baseMap,
      nodes: {
        ...baseMap.nodes,
        n1: { ...baseMap.nodes.n1, body: 'Detalles explicativos' },
      },
    };
    const resBody = describeMapDiff(baseMap, bodyChanged);
    expect(resBody.category).toBe('node-text');
    expect(resBody.summary).toContain('Nota añadida');
  });

  it('describeMapDiff detecta cambios de estilo, forma y sombra', () => {
    const shapeChanged: MindMap = {
      ...baseMap,
      nodes: {
        ...baseMap.nodes,
        n1: { ...baseMap.nodes.n1, shape: 'bubble', tailLength: 14 },
      },
    };
    const resShape = describeMapDiff(baseMap, shapeChanged);
    expect(resShape.category).toBe('node-style');
    expect(resShape.summary).toContain('bubble');

    const shadowChanged: MindMap = {
      ...baseMap,
      nodes: {
        ...baseMap.nodes,
        n1: { ...baseMap.nodes.n1, nodeShadow: true, nodeShadowPreset: 'deep' },
      },
    };
    const resShadow = describeMapDiff(baseMap, shadowChanged);
    expect(resShadow.category).toBe('node-style');
    expect(resShadow.summary).toContain('Sombra');
  });

  it('describeMapDiff detecta conectores libres añadidos o eliminados', () => {
    const withConn: MindMap = {
      ...baseMap,
      connectors: [
        {
          id: 'c1',
          fromId: 'root',
          toId: 'n1',
          color: '#ef4444',
          label: 'Dependencia',
          style: 'solid',
        },
      ],
    };
    const resConn = describeMapDiff(baseMap, withConn);
    expect(resConn.category).toBe('connector');
    expect(resConn.summary).toContain('Conector libre añadido');

    const resRemoved = describeMapDiff(withConn, baseMap);
    expect(resRemoved.category).toBe('connector');
    expect(resRemoved.summary).toContain('Conector libre eliminado');
  });

  it('buildHistoryTimeline arma la lista completa con pasado, presente y futuro', () => {
    const step0: MindMap = { ...baseMap, title: 'Paso 0' };
    const step1: MindMap = { ...baseMap, title: 'Paso 1' };
    const present: MindMap = { ...baseMap, title: 'Presente' };
    const future0: MindMap = { ...baseMap, title: 'Futuro 0' };

    const timeline = buildHistoryTimeline([step0, step1], present, [future0]);
    expect(timeline.length).toBe(4);

    expect(timeline[0].isPast).toBe(true);
    expect(timeline[0].isCurrent).toBe(false);
    expect(timeline[0].title).toBe('Punto de partida');

    expect(timeline[1].isPast).toBe(true);
    expect(timeline[1].title).toBe('Paso #2');

    expect(timeline[2].isCurrent).toBe(true);
    expect(timeline[2].isPast).toBe(false);
    expect(timeline[2].isFuture).toBe(false);
    expect(timeline[2].title).toBe('📍 Versión Actual');

    expect(timeline[3].isFuture).toBe(true);
    expect(timeline[3].isCurrent).toBe(false);
    expect(timeline[3].title).toBe('Paso #4');
  });

  it('formatHistoryTimestamp formatea correctamente segundos, minutos y horas', () => {
    const now = Date.now();
    expect(formatHistoryTimestamp(now - 1000)).toBe('Justo ahora');
    expect(formatHistoryTimestamp(now - 25000)).toBe('Hace 25s');
    expect(formatHistoryTimestamp(now - 120000)).toBe('Hace 2 min');
    expect(formatHistoryTimestamp(now - 7200000)).toBe('Hace 2 h');
  });
});
