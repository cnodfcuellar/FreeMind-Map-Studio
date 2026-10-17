import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
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
    isPresentationMode: false,
    isFilterBarOpen: false,
  });
}

function press(key: string, init: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
}

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    resetStore();
    document.body.innerHTML = '';
  });

  function mount(modal = false) {
    return renderHook(() =>
      useKeyboardShortcuts({ isAnyModalOpen: modal, onCloseModals: vi.fn() })
    );
  }

  it('Tab crea hijo, Enter hermano, Supr borra', () => {
    mount();
    press('Tab');
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(3);
    press('Enter');
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(4);
    press('Delete');
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(3);
  });

  it('Ctrl+Z deshace y Ctrl+Y rehace', () => {
    mount();
    press('Tab');
    press('z', { ctrlKey: true });
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(2);
    press('y', { ctrlKey: true });
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(3);
  });

  it('Ctrl+F alterna filterbar, F2 edita, Escape selecciona raíz', () => {
    mount();
    press('f', { ctrlKey: true });
    expect(useMindMapStore.getState().isFilterBarOpen).toBe(true);
    press('F2');
    expect(useMindMapStore.getState().editingNodeId).toBe('root');
    useMindMapStore.getState().setSelectedNodeId('node-1');
    press('Escape');
    expect(useMindMapStore.getState().selectedNodeId).toBe('root');
  });

  it('ignora atajos escribiendo en input (salvo Escape que desenfoca)', () => {
    mount();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    press('Tab');
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(2);
    press('Escape');
    expect(document.activeElement).toBe(document.body);
  });

  it('con modal abierto ignora todo salvo Escape→onCloseModals', () => {
    const onClose = vi.fn();
    renderHook(() => useKeyboardShortcuts({ isAnyModalOpen: true, onCloseModals: onClose }));
    press('Tab');
    expect(useMindMapStore.getState().mindMap.nodes['root'].children.length).toBe(2);
    press('Escape');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('flechas navegan entre hermanos y por side', () => {
    mount();
    act(() => {
      useMindMapStore.getState().setSelectedNodeId('node-1');
    });
    act(() => {
      press('ArrowDown');
    });
    expect(useMindMapStore.getState().selectedNodeId).toBe('node-2');
    act(() => {
      press('ArrowUp');
    });
    expect(useMindMapStore.getState().selectedNodeId).toBe('node-1');
    act(() => {
      useMindMapStore.getState().setSelectedNodeId('root');
    });
    act(() => {
      press('ArrowRight');
    });
    expect(useMindMapStore.getState().selectedNodeId).toBe('node-1');
  });
});
