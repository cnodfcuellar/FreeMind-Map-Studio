import { useEffect } from 'react';
import { useMindMapStore } from './useMindMapStore';

interface UseKeyboardShortcutsProps {
  isAnyModalOpen: boolean;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts({ isAnyModalOpen, onCloseModals }: UseKeyboardShortcutsProps) {
  const {
    mindMap,
    selectedNodeId,
    isPresentationMode,
    setIsPresentationMode,
    setSelectedNodeId,
    setEditingNodeId,
    setIsOutlineOpen,
    setIsToolPanelOpen,
    setIsFilterBarOpen,
    handleUndo,
    handleRedo,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
    handleAddChild,
    handleAddSibling,
    handleToggleFold,
    handleDeleteNode,
  } = useMindMapStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (isTyping) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
          setEditingNodeId(null);
        }
        return;
      }

      // Modals Open Guard
      if (isAnyModalOpen) {
        if (e.key === 'Escape') {
          onCloseModals();
        }
        return;
      }

      // Presentation Mode toggle (F5)
      if (e.key === 'F5') {
        e.preventDefault();
        setIsPresentationMode((p) => !p);
        return;
      }

      // Presentation Mode active guard
      if (isPresentationMode) return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Copy / Cut / Paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyNode();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCutNode();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteNode();
        return;
      }

      // Search & Filter (Ctrl + F)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFilterBarOpen((f) => !f);
        return;
      }

      // Outline Side Panel Toggle (Alt + O)
      if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsOutlineOpen((o) => !o);
        return;
      }

      // ToolPanel Toggle (Alt + P)
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsToolPanelOpen((t) => !t);
        return;
      }

      // Add Child (Tab / Insert)
      if (e.key === 'Tab' || e.key === 'Insert') {
        e.preventDefault();
        handleAddChild();
        return;
      }

      // Add Sibling (Enter)
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSibling();
        return;
      }

      // Edit Text (F2)
      if (e.key === 'F2') {
        e.preventDefault();
        if (selectedNodeId) {
          setEditingNodeId(selectedNodeId);
        }
        return;
      }

      // Fold / Unfold (Space)
      if (e.key === ' ') {
        e.preventDefault();
        handleToggleFold();
        return;
      }

      // Delete Node (Delete / Backspace)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteNode();
        return;
      }

      // Escape -> Select Root
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodeId(mindMap.rootId);
        return;
      }

      // Arrow Keys Navigation
      if (selectedNodeId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const curr = mindMap.nodes[selectedNodeId];
        if (!curr) return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          if (curr.parentId) {
            const parent = mindMap.nodes[curr.parentId];
            if (parent && parent.children) {
              const idx = parent.children.indexOf(curr.id);
              if (e.key === 'ArrowUp' && idx > 0) {
                setSelectedNodeId(parent.children[idx - 1]);
              } else if (e.key === 'ArrowDown' && idx < parent.children.length - 1) {
                setSelectedNodeId(parent.children[idx + 1]);
              }
            }
          }
        } else if (e.key === 'ArrowRight') {
          if (curr.id === mindMap.rootId) {
            const rightChild = curr.children.find((cid) => mindMap.nodes[cid]?.side === 'right');
            if (rightChild) setSelectedNodeId(rightChild);
          } else if (curr.side === 'right' && !curr.folded && curr.children.length > 0) {
            setSelectedNodeId(curr.children[0]);
          } else if (curr.side === 'left' && curr.parentId) {
            setSelectedNodeId(curr.parentId);
          }
        } else if (e.key === 'ArrowLeft') {
          if (curr.id === mindMap.rootId) {
            const leftChild = curr.children.find((cid) => mindMap.nodes[cid]?.side === 'left');
            if (leftChild) setSelectedNodeId(leftChild);
          } else if (curr.side === 'left' && !curr.folded && curr.children.length > 0) {
            setSelectedNodeId(curr.children[0]);
          } else if (curr.side === 'right' && curr.parentId) {
            setSelectedNodeId(curr.parentId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeId,
    mindMap,
    isPresentationMode,
    isAnyModalOpen,
    onCloseModals,
    handleAddChild,
    handleAddSibling,
    handleDeleteNode,
    handleToggleFold,
    handleUndo,
    handleRedo,
    handleCopyNode,
    handleCutNode,
    handlePasteNode,
    setIsPresentationMode,
    setEditingNodeId,
    setIsOutlineOpen,
    setIsToolPanelOpen,
    setIsFilterBarOpen,
    setSelectedNodeId,
  ]);
}
