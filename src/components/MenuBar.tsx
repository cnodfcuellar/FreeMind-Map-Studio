import React, { useState, useRef, useEffect } from 'react';
import { MindMap, NodeShape } from '../types/mindmap';
import {
  FileText,
  Save,
  FolderOpen,
  Plus,
  FileDown,
  FileUp,
  Undo2,
  Redo2,
  Trash2,
  ListTree,
  Presentation,
  HelpCircle,
  Sparkles,
  Maximize,
  LayoutTemplate,
  Cloud,
  Link,
  ChevronDown,
  Check,
  Palette,
  Circle,
  Square,
  Star,
  ArrowRight,
  Hexagon,
  Type,
  Eraser,
  Map,
  Zap,
} from 'lucide-react';

interface MenuBarProps {
  mindMap: MindMap;
  canUndo: boolean;
  canRedo: boolean;
  isOutlineMode: boolean;
  onNewMap: () => void;
  onOpenTemplates: () => void;
  onOpenSavedMaps: () => void;
  onSaveMap: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDeleteNode: () => void;
  onToggleOutline: () => void;
  onStartPresentation: (mode?: 'classic' | 'dynamic') => void;
  onShowComingSoon?: (data: { title: string; subtitle: string; mode: 'elaborate' | 'dynamic' }) => void;
  onOpenShortcuts: () => void;
  onToggleFullscreen: () => void;
  onFoldAll: () => void;
  onUnfoldAll: () => void;
  onOpenConnectorModal: () => void;
  onToggleCloud: () => void;
  onTitleChange: (newTitle: string) => void;
  onOpenIconPack?: () => void;
  onChangeTheme?: (themeId: string) => void;
  onChangeShape?: (shape: NodeShape) => void;
  onResetFormat?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  mindMap,
  canUndo,
  canRedo,
  isOutlineMode,
  onNewMap,
  onOpenTemplates,
  onOpenSavedMaps,
  onSaveMap,
  onOpenExportModal,
  onOpenImportModal,
  onUndo,
  onRedo,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleOutline,
  onStartPresentation,
  onShowComingSoon,
  onOpenShortcuts,
  onToggleFullscreen,
  onFoldAll,
  onUnfoldAll,
  onOpenConnectorModal,
  onToggleCloud,
  onTitleChange,
  onOpenIconPack,
  onChangeTheme,
  onChangeShape,
  onResetFormat,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(mindMap.title);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(mindMap.title);
  }, [mindMap.title]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <header
      ref={menuRef}
      className="h-10 bg-slate-900 text-white px-3 flex items-center justify-between z-50 relative shrink-0 select-none border-b border-slate-800 text-xs"
    >
      {/* Left: Brand & Dropdown Menus */}
      <div className="flex items-center gap-2">
        {/* Brand */}
        <div className="flex items-center gap-1.5 mr-2 font-bold text-slate-100 tracking-tight">
          <span className="text-base">🧠</span>
          <span className="hidden sm:inline font-bold">FreeMind Map Studio</span>
        </div>

        {/* ARCHIVO Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'file' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Archivo
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { onNewMap(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> Nuevo Mapa</span>
              </button>
              <button
                onClick={() => { onOpenTemplates(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" /> Plantillas de Ejemplo</span>
              </button>
              <button
                onClick={() => { onOpenSavedMaps(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5 text-amber-600" /> Mis Mapas Guardados</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onSaveMap(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5 text-emerald-600" /> Guardar Ahora</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+S</kbd>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onOpenExportModal(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between font-semibold text-blue-600 hover:bg-blue-50"
              >
                <span className="flex items-center gap-2"><FileDown className="w-3.5 h-3.5" /> Exportar (.mm / HTML / PNG)</span>
              </button>
              <button
                onClick={() => { onOpenImportModal(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><FileUp className="w-3.5 h-3.5 text-purple-600" /> Importar Freeplane (.mm)</span>
              </button>
            </div>
          )}
        </div>

        {/* EDITAR Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'edit' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Editar
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                disabled={!canUndo}
                onClick={() => { onUndo(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Undo2 className="w-3.5 h-3.5" /> Deshacer</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Z</kbd>
              </button>
              <button
                disabled={!canRedo}
                onClick={() => { onRedo(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
              >
                <span className="flex items-center gap-2"><Redo2 className="w-3.5 h-3.5" /> Rehacer</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Ctrl+Y</kbd>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onDeleteNode(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-red-600 hover:bg-red-50"
              >
                <span className="flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Eliminar Rama</span>
                <kbd className="text-[10px] text-red-400 font-mono">Supr</kbd>
              </button>
            </div>
          )}
        </div>

        {/* INSERTAR Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('insert')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'insert' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Insertar
          </button>
          {openMenu === 'insert' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => { onAddChild(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-blue-600" /> Nodo Hijo</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Tab</kbd>
              </button>
              <button
                onClick={() => { onAddSibling(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-emerald-600" /> Nodo Hermano</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Enter</kbd>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onOpenConnectorModal(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Link className="w-3.5 h-3.5 text-cyan-600" /> Conector de Relación
              </button>
              <button
                onClick={() => { onToggleCloud(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-500" /> Nube de Rama
              </button>
              {onOpenIconPack && (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { onOpenIconPack(); setOpenMenu(null); }}
                    className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Pack Iconos Vectoriales
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                      500+
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* FORMATO Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('format')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'format' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Formato
          </button>
          {openMenu === 'format' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temas Visuales</div>
              <button
                onClick={() => { onChangeTheme?.('default'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Clásico Freeplane
              </button>
              <button
                onClick={() => { onChangeTheme?.('forest'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Bosque Esmeralda
              </button>
              <button
                onClick={() => { onChangeTheme?.('purple'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-purple-500"></span> Creativo Púrpura
              </button>
              <button
                onClick={() => { onChangeTheme?.('warm'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> Atardecer Cálido
              </button>
              <button
                onClick={() => { onChangeTheme?.('dark'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-white"
              >
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600"></span> Modo Oscuro
              </button>

              <div className="my-1 border-t border-slate-100" />
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forma del Nodo</div>
              <button
                onClick={() => { onChangeShape?.('bubble'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="w-3.5 h-2.5 rounded-sm border border-slate-500 block" /> Burbuja
              </button>
              <button
                onClick={() => { onChangeShape?.('fork'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="text-slate-500 font-bold ml-1 text-xs">─</span> Horquilla
              </button>
              <button
                onClick={() => { onChangeShape?.('rectangle'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="w-3.5 h-2.5 border border-slate-500 rounded-[1px]" /> Rectángulo
              </button>
              <button
                onClick={() => { onChangeShape?.('square'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Square className="w-3.5 h-3.5 text-slate-500" /> Cuadrada
              </button>
              <button
                onClick={() => { onChangeShape?.('oval'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="w-4 h-2.5 border border-slate-500 rounded-full" /> Óvalo
              </button>
              <button
                onClick={() => { onChangeShape?.('circle'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Circle className="w-3.5 h-3.5 text-slate-500" /> Circular
              </button>
              <button
                onClick={() => { onChangeShape?.('pill'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <div className="w-4 h-2 border border-slate-500 rounded-full" /> Cápsula
              </button>
              <button
                onClick={() => { onChangeShape?.('hexagon'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Hexagon className="w-3.5 h-3.5 text-slate-500" /> Hexágono
              </button>
              <button
                onClick={() => { onChangeShape?.('arrow'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" /> Flecha
              </button>
              <button
                onClick={() => { onChangeShape?.('star'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Star className="w-3.5 h-3.5 text-slate-500" /> Estrella
              </button>

              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onResetFormat?.(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600 font-medium"
              >
                <Eraser className="w-3.5 h-3.5" /> Restablecer Formato
              </button>
            </div>
          )}
        </div>

        {/* VER Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'view' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Ver
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => { onToggleOutline(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><ListTree className="w-3.5 h-3.5 text-indigo-600" /> Panel Lateral de Esquema</span>
                <kbd className="text-[10px] text-slate-400 font-mono">Alt+O</kbd>
              </button>
              <button
                onClick={() => { onStartPresentation('classic'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                <span className="flex items-center gap-2"><Presentation className="w-3.5 h-3.5 text-purple-600" /> Presentación Clásica</span>
                <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">Activo</span>
              </button>
              <button
                onClick={() => { onStartPresentation('dynamic'); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-pink-50 hover:text-pink-600 cursor-pointer"
              >
                <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-pink-600" /> Presentación Dinámica (Lienzo)</span>
                <kbd className="text-[10px] text-slate-400 font-mono">F5</kbd>
              </button>
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onShowComingSoon?.({
                    title: 'Modo Elaborado',
                    subtitle: 'Recorrido Interactivo Guiado por el Mapa',
                    mode: 'elaborate',
                  });
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <span className="flex items-center gap-2"><Map className="w-3.5 h-3.5 text-blue-600" /> Presentación Elaborada</span>
                <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">Pronto</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onUnfoldAll(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>Desplegar Todo el Mapa</span>
              </button>
              <button
                onClick={() => { onFoldAll(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>Plegar Todas las Ramas</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => { onToggleFullscreen(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="flex items-center gap-2"><Maximize className="w-3.5 h-3.5" /> Pantalla Completa</span>
                <kbd className="text-[10px] text-slate-400 font-mono">F11</kbd>
              </button>
            </div>
          )}
        </div>

        {/* AYUDA Menu */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              openMenu === 'help' ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Ayuda
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => { onOpenShortcuts(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-50 hover:text-blue-600 font-medium"
              >
                <span className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Atajos de Teclado</span>
                <kbd className="text-[10px] text-slate-400 font-mono">?</kbd>
              </button>
              <button
                onClick={() => { onOpenTemplates(); setOpenMenu(null); }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Guía Tutorial Freeplane
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center: Editable Map Title */}
      <div className="flex-1 max-w-sm mx-4 text-center">
        {isEditingTitle ? (
          <input
            type="text"
            autoFocus
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            className="w-full bg-slate-800 border border-blue-500 rounded px-2 py-0.5 text-xs text-white font-medium text-center outline-none"
          />
        ) : (
          <div
            title="Doble clic para cambiar el título del mapa"
            onDoubleClick={() => setIsEditingTitle(true)}
            className="cursor-pointer hover:bg-slate-800/80 px-2 py-0.5 rounded text-xs font-semibold text-slate-200 truncate transition-colors"
          >
            {mindMap.title}
          </div>
        )}
      </div>

      {/* Right: Offline Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline">100% Offline</span>
        </div>
      </div>
    </header>
  );
};
