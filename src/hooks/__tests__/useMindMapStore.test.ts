import { describe, it, expect, beforeEach } from 'vitest';
import { useMindMapStore } from '../useMindMapStore';
import { BLANK_MAP } from '../../utils/sampleMaps';

function resetStore() {
  localStorage.clear();
  useMindMapStore.setState({
    mindMap: structuredClone(BLANK_MAP),
    historyPast: [],
    historyFuture: [],
    selectedNodeId: 'root',
    editingNodeId: null,
    focusTarget: null,
    clipboard: null,
  });
}

function state() {
  return useMindMapStore.getState();
}

describe('useMindMapStore', () => {
  beforeEach(resetStore);

  it('inicia con BLANK_MAP y raíz seleccionada', () => {
    const s = state();
    expect(s.mindMap.rootId).toBe('root');
    expect(s.selectedNodeId).toBe('root');
    expect(s.historyPast).toEqual([]);
  });

  it('handleAddChild crea hijo con id nuevo, unfold y selección', () => {
    state().handleAddChild('root');
    const s = state();
    const root = s.mindMap.nodes['root'];
    expect(root.children.length).toBe(3);
    const newId = root.children[2];
    const child = s.mindMap.nodes[newId];
    expect(child.parentId).toBe('root');
    expect(child.text).toBe('Nueva Idea');
    expect(root.folded).toBe(false);
    expect(s.selectedNodeId).toBe(newId);
    expect(s.editingNodeId).toBe(newId);
  });

  it('handleAddChild en raíz balancea left/right', () => {
    // root tiene node-1 (right) y node-2 (left): 1-1 → toca 'right'
    state().handleAddChild('root');
    const s = state();
    const newId = s.mindMap.nodes['root'].children[2];
    expect(s.mindMap.nodes[newId].side).toBe('right');
  });

  it('handleAddSibling inserta tras el hermano y hereda side/shape', () => {
    state().handleAddSibling('node-1');
    const s = state();
    const root = s.mindMap.nodes['root'];
    expect(root.children.length).toBe(3);
    expect(root.children[1]).not.toBe('node-1');
    const sib = s.mindMap.nodes[root.children[1]];
    expect(sib.side).toBe('right');
    expect(sib.parentId).toBe('root');
  });

  it('handleAddSibling en raíz delega a hijo', () => {
    state().handleAddSibling('root');
    expect(state().mindMap.nodes['root'].children.length).toBe(3);
  });

  it('handleDeleteNode borra subárbol y selecciona al padre', () => {
    state().handleAddChild('node-1');
    const childId = state().mindMap.nodes['node-1'].children[0];
    state().handleDeleteNode('node-1');
    const s = state();
    expect(s.mindMap.nodes['node-1']).toBeUndefined();
    expect(s.mindMap.nodes[childId]).toBeUndefined();
    expect(s.mindMap.nodes['root'].children).not.toContain('node-1');
    expect(s.selectedNodeId).toBe('root');
  });

  it('handleDeleteNode veta la raíz', () => {
    state().handleDeleteNode('root');
    expect(state().mindMap.nodes['root']).toBeDefined();
    expect(state().historyPast.length).toBe(0);
  });

  it('handleToggleFold pliega y despliega solo con hijos', () => {
    state().handleToggleFold('root');
    expect(state().mindMap.nodes['root'].folded).toBe(true);
    state().handleToggleFold('root');
    expect(state().mindMap.nodes['root'].folded).toBe(false);
    // sin hijos no hace nada ni push
    const past = state().historyPast.length;
    state().handleToggleFold('node-1');
    expect(state().historyPast.length).toBe(past);
  });

  it('handleFoldAll/handleUnfoldAll (raíz excluida del fold)', () => {
    state().handleAddChild('node-1');
    state().handleFoldAll();
    const s = state();
    expect(s.mindMap.nodes['root'].folded).toBeFalsy();
    expect(s.mindMap.nodes['node-1'].folded).toBe(true);
    state().handleUnfoldAll();
    expect(state().mindMap.nodes['node-1'].folded).toBe(false);
  });

  it('handleReparentNode mueve y veta raíz y ciclos', () => {
    state().handleAddChild('node-1');
    const grand = state().mindMap.nodes['node-1'].children[0];
    // ciclo: node-1 dentro de su nieto → no-op
    state().handleReparentNode('node-1', grand);
    expect(state().mindMap.nodes['node-1'].parentId).toBe('root');
    // raíz no se mueve
    state().handleReparentNode('root', 'node-2');
    expect(state().mindMap.nodes['root'].parentId).toBeNull();
    // válido
    state().handleReparentNode(grand, 'node-2');
    const s = state();
    expect(s.mindMap.nodes[grand].parentId).toBe('node-2');
    expect(s.mindMap.nodes['node-1'].children).not.toContain(grand);
  });

  it('copy/paste clona con IDs nuevos y side del destino', () => {
    state().handleCopyNode('node-1');
    expect(state().clipboard?.isCut).toBe(false);
    state().handlePasteNode('node-2');
    const s = state();
    const dest = s.mindMap.nodes['node-2'];
    expect(dest.children.length).toBe(1);
    const cloneId = dest.children[0];
    expect(cloneId).not.toBe('node-1');
    expect(s.mindMap.nodes[cloneId].side).toBe('left');
    expect(s.selectedNodeId).toBe(cloneId);
  });

  it('cut copia al portapapeles y elimina el original', () => {
    state().handleCutNode('node-1');
    const s = state();
    expect(s.mindMap.nodes['node-1']).toBeUndefined();
    expect(s.clipboard?.node.id).toBe('node-1');
    expect(s.clipboard?.subNodes['node-1']).toBeDefined();
    state().handlePasteNode('root');
    expect(state().mindMap.nodes['root'].children.length).toBe(2);
  });

  it('undo/redo restauran y future se limpia al mutar', () => {
    state().handleAddChild('root');
    expect(state().mindMap.nodes['root'].children.length).toBe(3);
    state().handleUndo();
    expect(state().mindMap.nodes['root'].children.length).toBe(2);
    state().handleRedo();
    expect(state().mindMap.nodes['root'].children.length).toBe(3);
    state().handleUndo();
    state().updateNode('node-1', { text: 'cambio' });
    expect(state().historyFuture).toEqual([]);
  });

  it('pushHistory topa en 41 snapshots', () => {
    const s = state();
    for (let i = 0; i < 45; i++) s.pushHistory(s.mindMap);
    expect(state().historyPast.length).toBe(41);
  });

  it('updateNode fusiona sin tocar history si el nodo no existe', () => {
    state().updateNode('node-1', { text: 'Editado', bold: true });
    const n = state().mindMap.nodes['node-1'];
    expect(n.text).toBe('Editado');
    expect(n.bold).toBe(true);
    expect(n.side).toBe('right');
    const past = state().historyPast.length;
    state().updateNode('fantasma', { text: 'x' });
    expect(state().historyPast.length).toBe(past);
  });

  it('applyStyleToChildren propaga estilo sin tocar texto', () => {
    state().updateNode('root', { color: '#ff0000', shape: 'pill' });
    state().handleApplyStyleToChildren('root');
    const s = state();
    expect(s.mindMap.nodes['node-1'].color).toBe('#ff0000');
    expect(s.mindMap.nodes['node-1'].shape).toBe('pill');
    expect(s.mindMap.nodes['node-1'].text).toBe('Rama Principal 1');
  });
});
