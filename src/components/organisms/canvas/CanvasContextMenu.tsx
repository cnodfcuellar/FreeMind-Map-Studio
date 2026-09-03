import React from 'react';
import {
  Plus,
  FolderPlus,
  Edit2,
  Copy,
  Scissors,
  Clipboard,
  Link,
  Cloud,
  GitFork,
  MoveHorizontal,
  Trash2,
} from 'lucide-react';
import { MindMap } from '../../../types/mindmap';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
}

export interface CanvasContextMenuProps {
  contextMenu: ContextMenuState;
  mindMap: MindMap;
  onClose: () => void;
  onAddChildNode: (nodeId: string) => void;
  onAddSiblingNode: (nodeId: string) => void;
  onStartEditing: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onCopyNode: (nodeId: string) => void;
  onCutNode: (nodeId: string) => void;
  onPasteNode: (nodeId: string) => void;
  onOpenConnectorModal: (nodeId: string) => void;
  onToggleCloud: (nodeId: string) => void;
  onApplyStyleToChildren?: (nodeId: string) => void;
  onApplyStyleToSiblings?: (nodeId: string) => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  contextMenu,
  mindMap,
  onClose,
  onAddChildNode,
  onAddSiblingNode,
  onStartEditing,
  onDeleteNode,
  onCopyNode,
  onCutNode,
  onPasteNode,
  onOpenConnectorModal,
  onToggleCloud,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  if (!contextMenu.visible) return null;

  return (
    <div
      style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
      className="fixed z-50 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xl py-1.5 min-w-56 max-h-[calc(100vh-24px)] overflow-y-auto text-xs text-slate-700 font-medium animate-in fade-in zoom-in-95 duration-100 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {contextMenu.nodeId ? (
        <>
          <button
            type="button"
            onClick={() => {
              onAddChildNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Agregar Nodo Hijo
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Tab
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddSiblingNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" /> Agregar Nodo Hermano
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Enter
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onStartEditing(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Editar Texto
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              F2
            </kbd>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onCopyNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-slate-500" /> Copiar Rama
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Ctrl+C
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onCutNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-slate-500" /> Cortar Rama
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Ctrl+X
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              onPasteNode(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5 text-slate-500" /> Pegar como Hijo
            </span>
            <kbd className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              Ctrl+V
            </kbd>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onOpenConnectorModal(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Link className="w-3.5 h-3.5 text-cyan-600" /> Crear Conector a otro nodo
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleCloud(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-500" /> Alternar Nube de Rama
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={() => {
              onApplyStyleToChildren?.(contextMenu.nodeId!);
              onClose();
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <GitFork className="w-3.5 h-3.5 text-blue-600" /> Aplicar Estilo a Hijos
          </button>

          {contextMenu.nodeId !== mindMap.rootId && (
            <button
              type="button"
              onClick={() => {
                onApplyStyleToSiblings?.(contextMenu.nodeId!);
                onClose();
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <MoveHorizontal className="w-3.5 h-3.5 text-indigo-600" /> Aplicar Estilo a Hermanos
            </button>
          )}

          {contextMenu.nodeId !== mindMap.rootId && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  onDeleteNode(contextMenu.nodeId!);
                  onClose();
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar Nodo
                </span>
                <kbd className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono">
                  Supr
                </kbd>
              </button>
            </>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            onAddChildNode(mindMap.rootId);
            onClose();
          }}
          className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" /> Agregar Rama Principal
        </button>
      )}
    </div>
  );
};
