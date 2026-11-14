import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MindMap, HistoryTimelineEntry, HistoryActionCategory } from '../../types/mindmap';
import { buildHistoryTimeline, formatHistoryTimestamp } from '../../utils/historyDiff';
import { updateSavedMapsIndex } from '../../utils/storage';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';
import {
  History,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Palette,
  GitBranch,
  Cloud,
  Share2,
  Layers,
  Sparkles,
  Search,
  Copy,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface HistoryTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyPast: MindMap[];
  historyFuture: MindMap[];
  currentMindMap: MindMap;
  onJumpToHistory: (index: number) => void;
  onSaveAsNewMap?: (map: MindMap) => void;
}

const getCategoryIcon = (category: HistoryActionCategory) => {
  switch (category) {
    case 'initial':
      return <Sparkles className="w-4 h-4 text-blue-500" />;
    case 'node-add':
      return <Plus className="w-4 h-4 text-emerald-500" />;
    case 'node-delete':
      return <Trash2 className="w-4 h-4 text-rose-500" />;
    case 'node-text':
      return <Edit3 className="w-4 h-4 text-sky-500" />;
    case 'node-style':
      return <Palette className="w-4 h-4 text-purple-500" />;
    case 'node-move':
      return <GitBranch className="w-4 h-4 text-amber-500" />;
    case 'cloud':
      return <Cloud className="w-4 h-4 text-cyan-500" />;
    case 'connector':
      return <Share2 className="w-4 h-4 text-pink-500" />;
    case 'theme':
    case 'layout':
    case 'bulk':
      return <Layers className="w-4 h-4 text-indigo-500" />;
    default:
      return <RotateCcw className="w-4 h-4 text-slate-500" />;
  }
};

const getCategoryBg = (category: HistoryActionCategory) => {
  switch (category) {
    case 'initial':
      return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300';
    case 'node-add':
      return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300';
    case 'node-delete':
      return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300';
    case 'node-text':
      return 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300';
    case 'node-style':
      return 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300';
    case 'node-move':
      return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300';
    case 'cloud':
      return 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300';
    case 'connector':
      return 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300';
    case 'theme':
    case 'layout':
    case 'bulk':
      return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300';
    default:
      return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
  }
};

export const HistoryTimelineModal: React.FC<HistoryTimelineModalProps> = ({
  isOpen,
  onClose,
  historyPast,
  historyFuture,
  currentMindMap,
  onJumpToHistory,
  onSaveAsNewMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'past' | 'future'>('all');
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(-1);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Construir timeline completa a partir de pasado, presente y futuro
  const timelineEntries = useMemo(() => {
    if (!isOpen) return [];
    return buildHistoryTimeline(historyPast, currentMindMap, historyFuture);
  }, [isOpen, historyPast, currentMindMap, historyFuture]);

  // Índice actual en la timeline (corresponde a la longitud de historyPast)
  const currentTimelineIndex = historyPast.length;

  // Al abrir el modal, seleccionar por defecto el estado actual
  useEffect(() => {
    if (isOpen) {
      setSelectedEntryIndex(currentTimelineIndex);
      setSearchQuery('');
      setFilterType('all');
      setSaveSuccessMsg(null);
    }
  }, [isOpen, currentTimelineIndex]);

  // Filtrado de entradas
  const filteredEntries = useMemo(() => {
    return timelineEntries.filter((entry) => {
      if (filterType === 'past' && !entry.isPast && !entry.isCurrent) return false;
      if (filterType === 'future' && !entry.isFuture && !entry.isCurrent) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.summary.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.title.toLowerCase().includes(q) ||
        (entry.map.title || '').toLowerCase().includes(q)
      );
    });
  }, [timelineEntries, filterType, searchQuery]);

  // Entrada seleccionada para el panel de inspección
  const selectedEntry = useMemo(() => {
    return (
      timelineEntries.find((e) => e.index === selectedEntryIndex) ||
      timelineEntries[currentTimelineIndex] ||
      null
    );
  }, [timelineEntries, selectedEntryIndex, currentTimelineIndex]);

  // Navegación por teclado (Flecha arriba / abajo y Enter para restaurar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentFilteredPos = filteredEntries.findIndex((e) => e.index === selectedEntryIndex);
        if (currentFilteredPos < filteredEntries.length - 1) {
          setSelectedEntryIndex(filteredEntries[currentFilteredPos + 1].index);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentFilteredPos = filteredEntries.findIndex((e) => e.index === selectedEntryIndex);
        if (currentFilteredPos > 0) {
          setSelectedEntryIndex(filteredEntries[currentFilteredPos - 1].index);
        }
      } else if (e.key === 'Enter') {
        if (selectedEntry && !selectedEntry.isCurrent) {
          e.preventDefault();
          onJumpToHistory(selectedEntry.index);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredEntries, selectedEntryIndex, selectedEntry, onJumpToHistory, onClose]);

  if (!isOpen) return null;

  const handleRestore = (index: number) => {
    onJumpToHistory(index);
    onClose();
  };

  const handleForkMap = (entry: HistoryTimelineEntry) => {
    const forkId = `map-fork-${Date.now()}`;
    const forkTitle = `${entry.map.title || 'Mapa'} (Paso #${entry.index + 1})`;
    const forked: MindMap = {
      ...entry.map,
      id: forkId,
      title: forkTitle,
      updatedAt: Date.now(),
    };

    updateSavedMapsIndex(forked);
    onSaveAsNewMap?.(forked);
    setSaveSuccessMsg(`¡Versión guardada como "${forkTitle}" en tus mapas!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const rootNode = selectedEntry?.map.nodes[selectedEntry.map.rootId];
  const directChildren = rootNode?.children
    ?.map((cid) => selectedEntry?.map.nodes[cid])
    .filter(Boolean) || [];

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      <ModalHeader
        title="Línea de Tiempo del Historial"
        subtitle="Explora cronológicamente los 40 niveles de cambios, compara modificaciones y restaura cualquier versión con un clic"
        icon={<History className="w-5 h-5 text-indigo-500" />}
        onClose={onClose}
      />

      {/* Barra de Filtros y Búsqueda */}
      <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/40">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por texto, nodo o tipo de cambio..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Segmented Filter */}
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos ({timelineEntries.length})
          </button>
          <button
            onClick={() => setFilterType('past')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'past'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pasados ({historyPast.length})
          </button>
          <button
            onClick={() => setFilterType('future')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterType === 'future'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Futuros ({historyFuture.length})
          </button>
        </div>
      </div>

      {/* Mensaje de confirmación temporal */}
      {saveSuccessMsg && (
        <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            {saveSuccessMsg}
          </span>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Contenedor Principal: Timeline a la izquierda + Panel de Detalle a la derecha */}
      <div className="flex flex-col lg:flex-row h-[520px] overflow-hidden">
        {/* Columna Izquierda: Lista de Pasos de la Línea de Tiempo */}
        <div
          ref={listRef}
          className="w-full lg:w-3/5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-2.5"
        >
          {filteredEntries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
              <History className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-medium">No se encontraron versiones</p>
              <p className="text-xs mt-1">Prueba con otro término de búsqueda o cambia el filtro</p>
            </div>
          ) : (
            <div className="relative pl-3">
              {/* Línea vertical conectora continua */}
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none" />

              {filteredEntries.map((entry) => {
                const isSelected = selectedEntry?.index === entry.index;
                const categoryBg = getCategoryBg(entry.category);

                return (
                  <div
                    key={`timeline-step-${entry.index}`}
                    onClick={() => setSelectedEntryIndex(entry.index)}
                    className={`relative z-10 flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer mb-2.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                        : entry.isCurrent
                        ? 'border-emerald-400/80 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-500'
                        : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Icono de Categoría */}
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 shadow-xs ${categoryBg}`}
                    >
                      {getCategoryIcon(entry.category)}
                    </div>

                    {/* Contenido del paso */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {entry.title}
                          </span>
                          {entry.isCurrent && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white tracking-wide">
                              ACTUAL
                            </span>
                          )}
                          {entry.isFuture && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                              Rehecho
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatHistoryTimestamp(entry.timestamp)}
                        </span>
                      </div>

                      {/* Resumen humano */}
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                        {entry.summary}
                      </p>

                      {/* Subdetalle */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {entry.details}
                      </p>
                    </div>

                    {/* Botón rápido Restaurar en hover/focus */}
                    {!entry.isCurrent && (
                      <button
                        title="Restaurar a esta versión inmediatamente"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(entry.index);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60 text-indigo-600 dark:text-indigo-400 transition-all shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Panel de Inspección, Miniatura y Acciones */}
        <div className="w-full lg:w-2/5 p-5 overflow-y-auto bg-slate-50/40 dark:bg-slate-900/30 flex flex-col justify-between">
          {selectedEntry ? (
            <div className="space-y-4">
              {/* Cabecera del Snapshot */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Inspección de Versión
                  </span>
                  {selectedEntry.isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Versión Activa
                    </span>
                  ) : selectedEntry.isPast ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Paso anterior ({currentTimelineIndex - selectedEntry.index} cambios atrás)
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Paso futuro ({selectedEntry.index - currentTimelineIndex} pasos adelante)
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedEntry.map.title || 'Mapa Mental sin Título'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Registrado el {new Date(selectedEntry.timestamp).toLocaleDateString()} a las{' '}
                  {new Date(selectedEntry.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {/* Tarjeta de Modificación */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Cambio Realizado
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedEntry.summary}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedEntry.details}
                </p>
              </div>

              {/* Estadísticas de la versión */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                  <div className="text-base font-bold text-slate-800 dark:text-white">
                    {selectedEntry.nodeCount}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Nodos
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                  <div className="text-base font-bold text-slate-800 dark:text-white">
                    {selectedEntry.connectorCount}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Conectores
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                  <div className="text-base font-bold text-slate-800 dark:text-white">
                    {selectedEntry.cloudCount}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Nubes
                  </div>
                </div>
              </div>

              {/* Vista Esquemática Rápida del Árbol */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Estructura Principal
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tema: {selectedEntry.map.themeId || 'classic'}
                  </span>
                </div>

                {rootNode && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                    {/* Raíz */}
                    <div className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 font-semibold text-indigo-900 dark:text-indigo-200 truncate">
                      📍 {rootNode.text || 'Idea Central'}
                    </div>

                    {/* Primer nivel de hijos */}
                    <div className="pl-3 space-y-1">
                      {directChildren.slice(0, 5).map((child) => (
                        <div
                          key={child?.id}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 truncate flex items-center gap-1.5"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: child?.color || '#3b82f6' }}
                          />
                          <span className="truncate">{child?.text || 'Sub-rama'}</span>
                        </div>
                      ))}
                      {directChildren.length > 5 && (
                        <div className="text-[10px] text-slate-400 pl-2">
                          + {directChildren.length - 5} ramas más...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              Selecciona una versión para inspeccionar sus detalles
            </div>
          )}

          {/* Acciones del Panel Inferior */}
          {selectedEntry && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Button
                variant="primary"
                size="md"
                disabled={selectedEntry.isCurrent}
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={() => handleRestore(selectedEntry.index)}
                className="w-full justify-center"
              >
                {selectedEntry.isCurrent ? 'Versión Activa Actual' : 'Restaurar a esta Versión'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() => handleForkMap(selectedEntry)}
                className="w-full justify-center text-xs"
              >
                Guardar Copia como Nuevo Mapa...
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pie del Modal con resumen de navegación */}
      <div className="px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Usa <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">↑</kbd>{' '}
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">↓</kbd> para navegar
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Enter</kbd> para restaurar
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Esc</kbd> para salir
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </ModalBackdrop>
  );
};
