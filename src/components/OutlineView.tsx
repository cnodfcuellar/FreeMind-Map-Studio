import React, { useState, useMemo } from 'react';
import { MindMap, MindNode } from '../types/mindmap';
import { renderNodeIcon } from '../utils/iconMap';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Search,
  X,
  Maximize2,
  Minimize2,
  FolderOpen,
  FolderClosed,
  ChevronsDownUp,
  ChevronsUpDown,
  PanelLeftClose,
  Tag,
} from 'lucide-react';

// Utility to ensure optimal contrast against the outline panel's white/light background
function getReadableOutlineTextColor(customColor?: string, defaultColor: string = '#1e293b'): string {
  if (!customColor) return defaultColor;

  const clean = customColor.trim().toLowerCase();
  // Handle white or near-white CSS strings
  if (
    clean === '#fff' ||
    clean === '#ffffff' ||
    clean === 'white' ||
    clean.startsWith('rgba(255, 255, 255') ||
    clean.startsWith('rgba(255,255,255') ||
    clean.startsWith('rgb(255, 255, 255') ||
    clean.startsWith('rgb(255,255,255')
  ) {
    return defaultColor;
  }

  // Check luminance for hex colors
  const hex = clean.replace('#', '');
  if (hex.length === 6 || hex.length === 3) {
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      // YIQ perceptual brightness calculation
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      // If the color is too light for a light panel background (brightness > 180), fallback to high-contrast dark color
      if (yiq > 180) {
        return defaultColor;
      }
    }
  }

  return customColor;
}

interface OutlineViewProps {
  mindMap: MindMap;
  selectedNodeId: string | null;
  isOpen: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onSelectNode: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateBody?: (id: string, body?: string) => void;
  onAddChild: (parentId: string) => void;
  onAddSibling: (siblingId: string) => void;
  onDeleteNode: (id: string) => void;
  onToggleFold: (id: string) => void;
  onFoldAll?: () => void;
  onUnfoldAll?: () => void;
  onClose: () => void;
}

export const OutlineView: React.FC<OutlineViewProps> = ({
  mindMap,
  selectedNodeId,
  isOpen,
  isFullscreen = false,
  onToggleFullscreen,
  onSelectNode,
  onUpdateText,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleFold,
  onFoldAll,
  onUnfoldAll,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const rootNode = mindMap.nodes[mindMap.rootId];
  const totalNodesCount = useMemo(() => Object.keys(mindMap.nodes).length, [mindMap.nodes]);

  // Compute matched node IDs if search query exists
  const matchedNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const set = new Set<string>();

    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      const matchText = n.text?.toLowerCase().includes(query);
      const matchBody = n.body?.toLowerCase().includes(query);
      const matchTags = n.tags?.some((t) => t.toLowerCase().includes(query));
      if (matchText || matchBody || matchTags) {
        set.add(n.id);
        // Add ancestors so hierarchy path remains visible
        let curr = n.parentId;
        while (curr) {
          set.add(curr);
          curr = mindMap.nodes[curr]?.parentId;
        }
      }
    });

    return set;
  }, [mindMap.nodes, searchQuery]);

  if (!isOpen || !rootNode) return null;

  const renderOutlineNode = (nodeId: string, depth: number = 0) => {
    const node = mindMap.nodes[nodeId];
    if (!node) return null;

    // Filter by search query if active
    if (matchedNodeIds && !matchedNodeIds.has(node.id)) {
      return null;
    }

    const isSelected = selectedNodeId === node.id;
    const isEditing = editingId === node.id;
    const isRoot = node.id === mindMap.rootId;
    const hasChildren = node.children && node.children.length > 0;
    const isSearchMatch =
      searchQuery.trim() &&
      (node.text?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        node.body?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        node.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase().trim())));

    return (
      <div key={node.id} className="flex flex-col">
        {/* Node Line Row */}
        <div
          style={{ paddingLeft: `${depth * 18 + 10}px` }}
          onClick={() => onSelectNode(node.id)}
          className={`flex items-start gap-1.5 py-1.5 pr-2.5 border-l-2 transition-all cursor-pointer group text-xs ${
            isSelected
              ? 'bg-blue-50/90 border-blue-600 text-blue-950 font-medium shadow-2xs'
              : isSearchMatch
              ? 'bg-amber-50/80 border-amber-400 text-slate-800'
              : 'border-transparent hover:bg-slate-50 text-slate-700'
          }`}
        >
          {/* Fold/Unfold Arrow */}
          <div className="pt-0.5 shrink-0">
            {hasChildren ? (
              <button
                title={node.folded ? 'Desplegar rama' : 'Plegar rama'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFold(node.id);
                }}
                className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
              >
                {node.folded ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block" />
            )}
          </div>

          {/* Node Bullet / Dot */}
          <div className="pt-1.5 shrink-0">
            <span
              style={{ backgroundColor: node.color || (isRoot ? '#2563eb' : '#64748b') }}
              className={`w-2 h-2 rounded-full block ${isRoot ? 'ring-2 ring-blue-300' : ''}`}
            />
          </div>

          {/* Icons */}
          {node.icons && node.icons.length > 0 && (
            <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
              {node.icons.map((ic, i) => (
                <span key={i} className="text-xs">{renderNodeIcon(ic)}</span>
              ))}
            </div>
          )}

          {/* Progress badge */}
          {node.progress !== undefined && (
            <span
              className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 mt-0.5 ${
                node.progress === 100
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {node.progress}%
            </span>
          )}

          {/* Text Content / In-place Input */}
          <div className="flex-1 min-w-0 pr-1">
            {isEditing ? (
              <input
                type="text"
                autoFocus
                value={node.text}
                onChange={(e) => onUpdateText(node.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingId(null);
                    onAddSibling(node.id);
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    setEditingId(null);
                    onAddChild(node.id);
                  } else if (e.key === 'Escape') {
                    setEditingId(null);
                  }
                }}
                className="w-full bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-900 outline-none font-medium shadow-2xs"
              />
            ) : (
              <div className="flex flex-col">
                <span
                  onDoubleClick={() => setEditingId(node.id)}
                  title="Doble clic para editar título"
                  style={{
                    color: getReadableOutlineTextColor(
                      node.textColor,
                      isRoot ? '#0f172a' : isSelected ? '#1e3a8a' : '#1e293b'
                    ),
                    fontWeight: node.bold || isRoot ? 'bold' : 'normal',
                    fontStyle: node.italic ? 'italic' : 'normal',
                  }}
                  className={`leading-tight block break-words ${
                    isRoot ? 'font-bold text-[13px]' : 'text-xs'
                  }`}
                >
                  {node.text}
                </span>

                {/* Subtext Body */}
                {node.body && (
                  <span
                    style={{
                      color: getReadableOutlineTextColor(node.bodyColor, '#64748b'),
                      fontWeight: node.bodyBold ? 'bold' : 'normal',
                      fontStyle: node.bodyItalic ? 'italic' : 'normal',
                    }}
                    className="text-[11px] block truncate mt-0.5 leading-snug"
                  >
                    {node.body}
                  </span>
                )}

                {/* Tags */}
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Note / Link indicators */}
          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            {node.note && (
              <span title="Tiene nota">
                <FileText className="w-3 h-3 text-slate-400" />
              </span>
            )}
            {node.link && (
              <a
                href={node.link}
                target="_blank"
                rel="noreferrer"
                title={`Enlace: ${node.link}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Hover Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
            <button
              title="Agregar nodo hijo (Tab)"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id);
              }}
              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 rounded"
            >
              <Plus className="w-3 h-3" />
            </button>
            {!isRoot && (
              <button
                title="Eliminar nodo (Supr)"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
                className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Render Children Recursively if not folded */}
        {!node.folded && hasChildren && (
          <div className="flex flex-col">
            {node.children.map((childId) => renderOutlineNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`${
        isFullscreen
          ? 'flex-1 z-30'
          : 'w-80 md:w-88 border-r border-slate-200 shadow-xl z-20 shrink-0'
      } bg-white flex flex-col h-full overflow-hidden transition-all select-none`}
    >
      {/* Outline Panel Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-xs text-slate-800">Panel de Esquema</h2>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200/70 text-[10px] font-semibold text-slate-600">
                {totalNodesCount}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Jerarquía y vista outline</p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-1">
          {/* Toggle search */}
          <button
            title="Buscar en esquema"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              showSearch || searchQuery ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Unfold All */}
          {onUnfoldAll && (
            <button
              title="Desplegar todas las ramas"
              onClick={onUnfoldAll}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fold All */}
          {onFoldAll && (
            <button
              title="Plegar todas las ramas"
              onClick={onFoldAll}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <FolderClosed className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Fullscreen / Side Panel */}
          {onToggleFullscreen && (
            <button
              title={isFullscreen ? 'Reducir a panel lateral' : 'Maximizar esquema a pantalla completa'}
              onClick={onToggleFullscreen}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close / Hide Side Panel */}
          <button
            title="Ocultar panel lateral (Alt+O)"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Search Input (when search active) */}
      {(showSearch || searchQuery) && (
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Filtrar por texto o #etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Outline Tree List Content */}
      <div className="flex-1 overflow-y-auto py-2.5 space-y-0.5">
        {renderOutlineNode(mindMap.rootId, 0)}
      </div>

      {/* Outline Footer Helper */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Tab: hijo • Enter: hermano</span>
        <span>Doble clic: editar</span>
      </div>
    </aside>
  );
};
