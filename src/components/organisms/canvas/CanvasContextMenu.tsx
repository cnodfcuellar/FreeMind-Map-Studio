import React from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Link as LinkIcon,
  Cloud,
  Copy,
  Scissors,
  Clipboard,
  Sparkles,
  GitFork,
  MoveHorizontal,
} from 'lucide-react';

interface CanvasContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  hasClipboard: boolean;
  isRoot: boolean;
  onClose: () => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCloud: () => void;
  onOpenConnectorModal: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onApplyStyleToChildren?: () => void;
  onApplyStyleToSiblings?: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  visible,
  x,
  y,
  nodeId,
  hasClipboard,
  isRoot,
  onClose,
  onAddChild,
  onAddSibling,
  onEdit,
  onDelete,
  onToggleCloud,
  onOpenConnectorModal,
  onCopy,
  onCut,
  onPaste,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  if (!visible || !nodeId) return null;

  return (
    <div
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 min-w-[210px] text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Operaciones de Nodo
      </div>

      <button
        type="button"
        onClick={() => {
          onAddChild();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5 text-blue-600" />
        <span>Añadir Hijo (Tab)</span>
      </button>

      {!isRoot && (
        <button
          type="button"
          onClick={() => {
            onAddSibling();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
          <span>Añadir Hermano (Enter)</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
        <span>Editar Texto (F2)</span>
      </button>

      <div className="h-[1px] bg-slate-100 my-1" />

      <button
        type="button"
        onClick={() => {
          onCopy();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <Copy className="w-3.5 h-3.5 text-slate-500" />
        <span>Copiar Rama (Ctrl+C)</span>
      </button>

      {!isRoot && (
        <button
          type="button"
          onClick={() => {
            onCut();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <Scissors className="w-3.5 h-3.5 text-slate-500" />
          <span>Cortar Rama (Ctrl+X)</span>
        </button>
      )}

      {hasClipboard && (
        <button
          type="button"
          onClick={() => {
            onPaste();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <Clipboard className="w-3.5 h-3.5 text-blue-600" />
          <span>Pegar aquí (Ctrl+V)</span>
        </button>
      )}

      <div className="h-[1px] bg-slate-100 my-1" />

      <button
        type="button"
        onClick={() => {
          onOpenConnectorModal();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left cursor-pointer"
      >
        <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
        <span>Conectar con otro nodo...</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onToggleCloud();
          onClose();
        }}
        className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
      >
        <Cloud className="w-3.5 h-3.5 text-blue-500" />
        <span>Alternar Nube</span>
      </button>

      {onApplyStyleToChildren && (
        <button
          type="button"
          onClick={() => {
            onApplyStyleToChildren();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Propagar estilo a hijos</span>
        </button>
      )}

      {onApplyStyleToSiblings && !isRoot && (
        <button
          type="button"
          onClick={() => {
            onApplyStyleToSiblings();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Propagar estilo a hermanos</span>
        </button>
      )}

      {!isRoot && (
        <>
          <div className="h-[1px] bg-slate-100 my-1" />
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Nodo (Supr)</span>
          </button>
        </>
      )}
    </div>
  );
};
