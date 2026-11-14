import React, { useState } from 'react';
import { FilterOptions, ProgressFilterMode, DateFilterMode, TagsMatchMode } from '../types/mindmap';
import { isFilterActive } from '../hooks/useSearchFilter';
import {
  Search,
  X,
  Tag,
  Sparkles,
  FileText,
  Link,
  Image as ImageIcon,
  Cloud,
  Star,
  Calendar,
  SlidersHorizontal,
  GitBranch,
} from 'lucide-react';

interface FilterBarProps {
  filterOptions: FilterOptions;
  availableTags: string[];
  matchCount: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateFilter: (updates: Partial<FilterOptions>) => void;
  onClearFilter: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  availableTags,
  matchCount,
  isOpen,
  onClose,
  onUpdateFilter,
  onClearFilter,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const isFiltering = isFilterActive(filterOptions);

  return (
    <div className="bg-[var(--chrome-bar)] text-white px-4 py-1.5 z-30 relative shrink-0 text-xs shadow-md border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 select-none flex flex-col gap-1.5">
      {/* Primera Fila: Búsqueda, Tags, Progreso, Coincidencias y Acciones */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-4xl flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold shrink-0">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Filtro:</span>
          </div>

          {/* Text Query Input */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <input
              type="text"
              value={filterOptions.query}
              onChange={(e) => onUpdateFilter({ query: e.target.value })}
              placeholder="Buscar por texto, notas, #tags..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500"
            />
            {filterOptions.query && (
              <button
                onClick={() => onUpdateFilter({ query: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Limpiar texto"
              >
                ×
              </button>
            )}
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <select
                value={filterOptions.tag || ''}
                onChange={(e) => onUpdateFilter({ tag: e.target.value || undefined })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500 max-w-[140px] truncate"
              >
                <option value="">Todas las Etiquetas</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Progress Filter */}
          <select
            value={
              filterOptions.progressMode
                ? filterOptions.progressMode
                : filterOptions.minProgress !== undefined
                ? String(filterOptions.minProgress)
                : ''
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onUpdateFilter({ progressMode: undefined, minProgress: undefined });
              } else if (val === 'unstarted' || val === 'in_progress' || val === 'completed') {
                onUpdateFilter({ progressMode: val as ProgressFilterMode, minProgress: undefined });
              } else {
                onUpdateFilter({ progressMode: undefined, minProgress: parseInt(val, 10) });
              }
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500 shrink-0"
          >
            <option value="">Cualquier Progreso</option>
            <option value="unstarted">Sin Iniciar (0%)</option>
            <option value="in_progress">En Curso (1% - 99%)</option>
            <option value="completed">Completado (100%)</option>
            <option value="25">Progreso &ge; 25%</option>
            <option value="50">Progreso &ge; 50%</option>
            <option value="75">Progreso &ge; 75%</option>
          </select>

          {/* Botón para alternar Opciones Avanzadas */}
          <button
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors shrink-0 ${
              showAdvanced ||
              filterOptions.hasNote ||
              filterOptions.hasLink ||
              filterOptions.hasImage ||
              filterOptions.hasCloud ||
              filterOptions.hasIcon ||
              filterOptions.dateFilter ||
              filterOptions.includeAncestors
                ? 'bg-blue-900/50 border-blue-600 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Mostrar más filtros de metadatos"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{showAdvanced ? 'Menos filtros' : '+ Metadatos'}</span>
          </button>

          {/* Results Counter */}
          {isFiltering && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-[11px] font-medium shrink-0 animate-in fade-in">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{matchCount} {matchCount === 1 ? 'coincidencia' : 'coincidencias'}</span>
            </div>
          )}
        </div>

        {/* Clear & Close */}
        <div className="flex items-center gap-2 shrink-0">
          {isFiltering && (
            <button
              onClick={onClearFilter}
              className="text-xs text-slate-400 hover:text-white underline font-medium"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={onClose}
            title="Cerrar barra de filtros (Esc)"
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segunda Fila (Opciones Avanzadas de Metadatos Expandibles) */}
      {showAdvanced && (
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap animate-in fade-in slide-in-from-top-1 text-[11px]">
          {/* Pills de Presencia de Contenido */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium mr-1">Contenido:</span>

            {/* Has Note */}
            <button
              onClick={() => onUpdateFilter({ hasNote: !filterOptions.hasNote })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                filterOptions.hasNote
                  ? 'bg-indigo-600 border-indigo-500 text-white font-medium shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Con Notas</span>
            </button>

            {/* Has Link */}
            <button
              onClick={() => onUpdateFilter({ hasLink: !filterOptions.hasLink })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                filterOptions.hasLink
                  ? 'bg-sky-600 border-sky-500 text-white font-medium shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link className="w-3 h-3" />
              <span>Con Enlaces</span>
            </button>

            {/* Has Image */}
            <button
              onClick={() => onUpdateFilter({ hasImage: !filterOptions.hasImage })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                filterOptions.hasImage
                  ? 'bg-purple-600 border-purple-500 text-white font-medium shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Con Imágenes</span>
            </button>

            {/* Has Cloud */}
            <button
              onClick={() => onUpdateFilter({ hasCloud: !filterOptions.hasCloud })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                filterOptions.hasCloud
                  ? 'bg-cyan-600 border-cyan-500 text-white font-medium shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cloud className="w-3 h-3" />
              <span>En Nube</span>
            </button>

            {/* Has Icon */}
            <button
              onClick={() => onUpdateFilter({ hasIcon: !filterOptions.hasIcon })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                filterOptions.hasIcon
                  ? 'bg-amber-600 border-amber-500 text-white font-medium shadow-xs'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3 h-3" />
              <span>Con Iconos</span>
            </button>
          </div>

          {/* Filtros de Fecha y Contexto Jerárquico */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Filter */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <select
                value={filterOptions.dateFilter || 'all'}
                onChange={(e) =>
                  onUpdateFilter({
                    dateFilter: (e.target.value as DateFilterMode) === 'all' ? undefined : (e.target.value as DateFilterMode),
                  })
                }
                className="bg-slate-800 border border-slate-700 rounded-md px-1.5 py-0.5 text-[11px] text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="all">Cualquier Fecha</option>
                <option value="today">Modificados Hoy</option>
                <option value="week">Últimos 7 días</option>
                <option value="month">Último Mes</option>
              </select>
            </div>

            {/* Include Ancestors Context */}
            <button
              onClick={() => onUpdateFilter({ includeAncestors: !filterOptions.includeAncestors })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${
                filterOptions.includeAncestors
                  ? 'bg-emerald-600 border-emerald-500 text-white font-medium'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
              title="Mantiene visible el camino de ramas padre hasta la raíz para situar cada resultado"
            >
              <GitBranch className="w-3 h-3" />
              <span>Árbol Contextual</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
