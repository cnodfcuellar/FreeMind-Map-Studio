import React, { useState, useRef, useEffect } from 'react';
import { MindNode, NodeShape, MindMap } from '../types/mindmap';
import {
  Plus,
  FolderPlus,
  Trash2,
  Minimize2,
  Maximize2,
  Bold,
  Italic,
  Undo2,
  Redo2,
  Sliders,
  ListTree,
  Presentation,
  Search,
  Link,
  Cloud,
  FileDown,
  MoreHorizontal,
  ChevronDown,
  Map,
  Zap,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText,
  Tag,
} from 'lucide-react';

interface ToolBarProps {
  selectedNode: MindNode | null;
  canUndo: boolean;
  canRedo: boolean;
  isOutlineMode: boolean;
  isFilterBarOpen: boolean;
  isToolPanelOpen: boolean;
  mindMap?: MindMap;
  onToggleGlobalVisibility?: (key: 'hideAllBodies' | 'hideAllImages' | 'hideAllTags' | 'hideAllIcons' | 'hideAllLinks') => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDeleteNode: () => void;
  onToggleFold: () => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onChangeShape: (shape: NodeShape) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleOutline: () => void;
  onStartPresentation: (mode?: 'classic' | 'dynamic') => void;
  onShowComingSoon?: (data: { title: string; subtitle: string; mode: 'elaborate' | 'dynamic' }) => void;
  onToggleFilterBar: () => void;
  onToggleToolPanel: () => void;
  onOpenConnectorModal: () => void;
  onToggleCloud: () => void;
  onOpenExportModal: () => void;
  onOpenIconPackModal?: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  selectedNode,
  canUndo,
  canRedo,
  isOutlineMode,
  isFilterBarOpen,
  isToolPanelOpen,
  mindMap,
  onToggleGlobalVisibility,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleFold,
  onToggleBold,
  onToggleItalic,
  onChangeShape,
  onUndo,
  onRedo,
  onToggleOutline,
  onStartPresentation,
  onShowComingSoon,
  onToggleFilterBar,
  onToggleToolPanel,
  onOpenConnectorModal,
  onToggleCloud,
  onOpenExportModal,
  onOpenIconPackModal,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPresentationMenuOpen, setIsPresentationMenuOpen] = useState(false);
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const presentationMenuRef = useRef<HTMLDivElement>(null);
  const visibilityMenuRef = useRef<HTMLDivElement>(null);

  const hasAnyHiddenGlobal = Boolean(
    mindMap?.hideAllBodies ||
    mindMap?.hideAllImages ||
    mindMap?.hideAllTags ||
    mindMap?.hideAllIcons ||
    mindMap?.hideAllLinks
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (presentationMenuRef.current && !presentationMenuRef.current.contains(e.target as Node)) {
        setIsPresentationMenuOpen(false);
      }
      if (visibilityMenuRef.current && !visibilityMenuRef.current.contains(e.target as Node)) {
        setIsVisibilityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-11 bg-white border-b border-slate-200 px-2 sm:px-3 flex items-center justify-between gap-1 sm:gap-2 z-40 shrink-0 select-none relative">
      {/* Left group: Node Actions & History */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            title="Deshacer (Ctrl+Z)"
            disabled={!canUndo}
            onClick={onUndo}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            title="Rehacer (Ctrl+Y)"
            disabled={!canRedo}
            onClick={onRedo}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Add Child */}
        <button
          title="Agregar Nodo Hijo (Tab o Insert)"
          onClick={onAddChild}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hijo</span>
        </button>

        {/* Add Sibling */}
        <button
          title="Agregar Nodo Hermano (Enter)"
          onClick={onAddSibling}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors shrink-0"
        >
          <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Hermano</span>
        </button>

        {/* Delete */}
        <button
          title="Eliminar Nodo Seleccionado (Supr / Delete)"
          disabled={!selectedNode || selectedNode.parentId === null}
          onClick={onDeleteNode}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Fold / Unfold */}
        <button
          title="Plegar / Desplegar Rama (Espacio)"
          disabled={!selectedNode || !selectedNode.children || selectedNode.children.length === 0}
          onClick={onToggleFold}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0"
        >
          {selectedNode?.folded ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Typography Quick Formats (visible from sm and up) */}
        <div className="hidden xs:flex items-center gap-0.5">
          <button
            title="Negrita (Bold)"
            disabled={!selectedNode}
            onClick={onToggleBold}
            className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center ${
              selectedNode?.bold ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
            } disabled:opacity-30 disabled:hover:bg-transparent`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            title="Cursiva (Italic)"
            disabled={!selectedNode}
            onClick={onToggleItalic}
            className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center ${
              selectedNode?.italic ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
            } disabled:opacity-30 disabled:hover:bg-transparent`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shape Selector (Responsive compact width on smaller screens) */}
        <div className="hidden sm:block">
          <select
            disabled={!selectedNode}
            value={selectedNode?.shape || 'bubble'}
            onChange={(e) => onChangeShape(e.target.value as NodeShape)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium outline-none focus:border-blue-500 disabled:opacity-35 max-w-[105px] md:max-w-none truncate"
          >
            <option value="bubble">Burbuja</option>
            <option value="fork">Horquilla</option>
            <option value="rectangle">Rectángulo</option>
            <option value="oval">Óvalo</option>
            <option value="hexagon">Hexágono</option>
            <option value="pill">Cápsula</option>
          </select>
        </div>

        <div className="hidden md:block w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* Connector (Desktop & Tablets) */}
        <button
          title="Crear Conector / Relación entre 2 nodos"
          disabled={!selectedNode}
          onClick={onOpenConnectorModal}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs disabled:opacity-35 shrink-0"
        >
          <Link className="w-3.5 h-3.5 text-cyan-600" />
          <span className="hidden lg:inline">Conector</span>
        </button>

        {/* Cloud (Desktop & Tablets) */}
        <button
          title="Alternar Nube de Rama"
          disabled={!selectedNode}
          onClick={onToggleCloud}
          className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium text-xs transition-colors ${
            selectedNode?.cloud?.enabled ? 'bg-amber-100 text-amber-800' : 'text-slate-700 hover:bg-slate-100'
          } disabled:opacity-35 shrink-0`}
        >
          <Cloud className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden lg:inline">Nube</span>
        </button>

        {/* 500+ Vector Icons Pack Trigger */}
        {onOpenIconPackModal && (
          <button
            title="Abrir pack de 500+ iconos vectoriales SVG para nodos"
            onClick={onOpenIconPackModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-xs transition-colors shrink-0"
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center text-blue-600 font-bold text-xs">★</span>
            <span className="hidden lg:inline">Iconos SVG</span>
            <span className="hidden xl:inline px-1 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold">500+</span>
          </button>
        )}

        {/* Mobile "More Options" Menu Popover (for small screens) */}
        <div className="relative md:hidden shrink-0" ref={moreMenuRef}>
          <button
            title="Más opciones de nodo"
            onClick={() => setIsMoreMenuOpen((o) => !o)}
            className={`p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center ${
              isMoreMenuOpen ? 'bg-slate-100 text-blue-600' : ''
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Formato & Enlaces
              </div>

              {/* Mobile Shape selector */}
              <div className="px-3 py-1.5 flex items-center justify-between">
                <span className="text-slate-600">Forma:</span>
                <select
                  disabled={!selectedNode}
                  value={selectedNode?.shape || 'bubble'}
                  onChange={(e) => {
                    onChangeShape(e.target.value as NodeShape);
                    setIsMoreMenuOpen(false);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 outline-none"
                >
                  <option value="bubble">Burbuja</option>
                  <option value="fork">Horquilla</option>
                  <option value="rectangle">Rectángulo</option>
                  <option value="square">Cuadrada</option>
                  <option value="oval">Óvalo</option>
                  <option value="circle">Circular</option>
                  <option value="pill">Cápsula</option>
                  <option value="hexagon">Hexágono</option>
                  <option value="arrow">Flecha</option>
                  <option value="star">Estrella</option>
                </select>
              </div>

              <div className="my-1 border-t border-slate-100" />

              {/* Bold / Italic */}
              <div className="px-3 py-1 flex items-center justify-around gap-1">
                <button
                  disabled={!selectedNode}
                  onClick={() => {
                    onToggleBold();
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex-1 py-1 rounded text-center border ${
                    selectedNode?.bold ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Negrita
                </button>
                <button
                  disabled={!selectedNode}
                  onClick={() => {
                    onToggleItalic();
                    setIsMoreMenuOpen(false);
                  }}
                  className={`flex-1 py-1 rounded text-center border italic ${
                    selectedNode?.italic ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Cursiva
                </button>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <button
                disabled={!selectedNode}
                onClick={() => {
                  onOpenConnectorModal();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                <Link className="w-3.5 h-3.5 text-cyan-600" />
                <span>Crear Conector flotante</span>
              </button>

              <button
                disabled={!selectedNode}
                onClick={() => {
                  onToggleCloud();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 disabled:opacity-40"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-500" />
                <span>Alternar Nube de agrupación</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right group: Modes & Panels */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Search & Filter */}
        <button
          title="Buscar y Filtrar (Ctrl+F)"
          onClick={onToggleFilterBar}
          className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0 ${
            isFilterBarOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Focus / Element Visibility (Eye Dropdown) */}
        <div className="relative shrink-0" ref={visibilityMenuRef}>
          <button
            title="Visibilidad de elementos y modo enfoque (Ocultar/Mostrar imágenes, cuerpo, tags)"
            onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
              isVisibilityMenuOpen
                ? 'bg-amber-100 text-amber-800 shadow-2xs'
                : hasAnyHiddenGlobal
                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {hasAnyHiddenGlobal ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
            <span className="hidden lg:inline">Vista</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isVisibilityMenuOpen ? 'rotate-180 text-amber-600' : ''}`} />
          </button>

          {isVisibilityMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Visibilidad Global (Modo Enfoque)
                </span>
              </div>

              {/* 1. Toggle Bodies */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllBodies')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Cuerpos / Explicación</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllBodies ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {mindMap?.hideAllBodies ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 2. Toggle Images */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllImages')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  <span>Imágenes adjuntas</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllImages ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {mindMap?.hideAllImages ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 3. Toggle Tags */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllTags')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Etiquetas (#Tags)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllTags ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {mindMap?.hideAllTags ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 4. Toggle Icons */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllIcons')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Iconos temáticos</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllIcons ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {mindMap?.hideAllIcons ? 'Oculto' : 'Visible'}
                </span>
              </button>

              {/* 5. Toggle Links */}
              <button
                onClick={() => onToggleGlobalVisibility?.('hideAllLinks')}
                className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Link className="w-4 h-4 text-cyan-600" />
                  <span>Insignias de enlace</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  mindMap?.hideAllLinks ? 'bg-rose-100 text-rose-700' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  {mindMap?.hideAllLinks ? 'Oculto' : 'Visible'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Outline View Toggle */}
        <button
          title="Mostrar / Ocultar panel lateral de esquema (Alt+O)"
          onClick={onToggleOutline}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 ${
            isOutlineMode ? 'bg-indigo-100 text-indigo-700 font-bold shadow-2xs' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ListTree className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Esquema</span>
        </button>

        {/* Presentation Mode Dropdown */}
        <div className="relative shrink-0" ref={presentationMenuRef}>
          <button
            title="Modos de Presentación (F5)"
            onClick={() => setIsPresentationMenuOpen(!isPresentationMenuOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
              isPresentationMenuOpen
                ? 'bg-purple-100 text-purple-800 shadow-2xs'
                : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden lg:inline">Presentar</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isPresentationMenuOpen ? 'rotate-180 text-purple-600' : ''}`} />
          </button>

          {isPresentationMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
              <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tipos de Presentación
                </span>
                <span className="text-[9px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-semibold">
                  F5
                </span>
              </div>

              {/* 1. Clásico */}
              <button
                onClick={() => {
                  setIsPresentationMenuOpen(false);
                  onStartPresentation('classic');
                }}
                className="w-full p-2 rounded-xl text-left hover:bg-purple-50 group flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Presentation className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-purple-900">
                      Clásico
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Diapositivas paso a paso por nodos y notas
                  </p>
                </div>
              </button>

              {/* 2. Elaborado */}
              <button
                onClick={() => {
                  setIsPresentationMenuOpen(false);
                  onShowComingSoon?.({
                    title: 'Modo Elaborado',
                    subtitle: 'Recorrido Interactivo Guiado por el Mapa',
                    mode: 'elaborate',
                  });
                }}
                className="w-full p-2 rounded-xl text-left hover:bg-blue-50 group flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Map className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">
                      Elaborado
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">
                      Próximamente
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Cámara guiada con zoom y foco en ramas
                  </p>
                </div>
              </button>

              {/* 3. Dinámico (Mindomo Canvas Zoom & Frame Studio) */}
              <button
                onClick={() => {
                  setIsPresentationMenuOpen(false);
                  onStartPresentation('dynamic');
                }}
                className="w-full p-2 rounded-xl text-left hover:bg-pink-50 group flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-800 group-hover:text-pink-900">
                      Dinámico (Estilo Mindomo)
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Vuelo de cámara sobre el lienzo con editor de marcos y foco Spotlight
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export / Portable HTML */}
        <button
          title="Exportar archivo .mm / HTML Portable / Imágenes"
          onClick={onOpenExportModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs shadow-xs transition-colors shrink-0"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-0.5 sm:mx-1 shrink-0" />

        {/* Toggle Tool Panel */}
        <button
          title="Alternar Panel de Propiedades (Alt+P)"
          onClick={onToggleToolPanel}
          className={`p-1.5 rounded-lg transition-colors min-w-[30px] min-h-[30px] flex items-center justify-center shrink-0 ${
            isToolPanelOpen ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

