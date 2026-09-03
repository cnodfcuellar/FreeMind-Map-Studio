import React from 'react';
import { MindNode } from '../../../types/mindmap';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

export interface NodeActionButtonsProps {
  node: MindNode;
  side?: string;
  hasChildren: boolean;
  branchColor?: string;
  isHovered: boolean;
  isEditing: boolean;
  onToggleFold: (id: string, e: React.MouseEvent) => void;
  onAddChild: (parentId: string) => void;
}

export const NodeActionButtons: React.FC<NodeActionButtonsProps> = ({
  node,
  side,
  hasChildren,
  branchColor,
  isHovered,
  isEditing,
  onToggleFold,
  onAddChild,
}) => {
  return (
    <>
      {/* Folding / Unfolding Toggle Badge */}
      {hasChildren && (
        <button
          type="button"
          title={
            node.folded
              ? `Desplegar ${node.children.length} sub-nodos (Espacio)`
              : 'Plegar rama (Espacio)'
          }
          onClick={(e) => onToggleFold(node.id, e)}
          style={{
            borderColor: node.folded ? '#f59e0b' : branchColor || '#94a3b8',
          }}
          className={`absolute flex items-center justify-center rounded-full transition-all z-20 shadow-xs cursor-pointer ${
            node.folded
              ? 'min-w-5 h-5 px-1 bg-amber-50 text-amber-800 border-2 border-amber-500 font-bold hover:bg-amber-100 hover:scale-105'
              : 'w-4.5 h-4.5 bg-white text-slate-600 border border-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
          } ${
            side === 'left'
              ? '-left-2.5 top-1/2 -translate-y-1/2'
              : '-right-2.5 top-1/2 -translate-y-1/2'
          }`}
        >
          {node.folded ? (
            <span className="flex items-center gap-0.5 text-[10px] leading-none">
              {side === 'left' ? (
                <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              )}
              <span className="text-[9px] font-bold font-mono">{node.children.length}</span>
            </span>
          ) : (
            <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
          )}
        </button>
      )}

      {/* Quick Add Child Button on Hover (Placed Higher Up to avoid collision) */}
      {isHovered && !isEditing && (
        <button
          type="button"
          title="Agregar nodo hijo (Tab)"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          className={`absolute flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-20 cursor-pointer ${
            side === 'left' ? '-left-3 -top-2.5' : '-right-3 -top-2.5'
          }`}
        >
          <Plus className="w-3 h-3 stroke-[2.5]" />
        </button>
      )}
    </>
  );
};
