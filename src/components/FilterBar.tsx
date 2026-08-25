import React from 'react';
import { FilterOptions } from '../types/mindmap';
import { Search, X, Tag, CheckSquare, Sparkles } from 'lucide-react';

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
  if (!isOpen) return null;

  const isFiltering =
    Boolean(filterOptions.query) ||
    Boolean(filterOptions.tag) ||
    Boolean(filterOptions.icon) ||
    filterOptions.minProgress !== undefined;

  return (
    <div className="h-10 bg-slate-900 text-white px-4 flex items-center justify-between z-30 relative shrink-0 text-xs shadow-md border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 select-none">
      <div className="flex items-center gap-3 flex-1 max-w-3xl">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>Filtro Rápido:</span>
        </div>

        {/* Text Query Input */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={filterOptions.query}
            onChange={(e) => onUpdateFilter({ query: e.target.value })}
            placeholder="Buscar por texto en nodos..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500"
          />
          {filterOptions.query && (
            <button
              onClick={() => onUpdateFilter({ query: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <select
            value={filterOptions.tag || ''}
            onChange={(e) => onUpdateFilter({ tag: e.target.value || undefined })}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
          >
            <option value="">Todas las Etiquetas</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        )}

        {/* Progress Filter */}
        <select
          value={filterOptions.minProgress === undefined ? '' : String(filterOptions.minProgress)}
          onChange={(e) =>
            onUpdateFilter({
              minProgress: e.target.value === '' ? undefined : parseInt(e.target.value, 10),
            })
          }
          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-blue-500"
        >
          <option value="">Cualquier Progreso</option>
          <option value="100">Solo 100% Completados</option>
          <option value="50">Progreso &ge; 50%</option>
          <option value="0">Con Progreso Activo</option>
        </select>

        {/* Results Counter */}
        {isFiltering && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{matchCount} {matchCount === 1 ? 'coincidencia' : 'coincidencias'}</span>
          </div>
        )}
      </div>

      {/* Clear & Close */}
      <div className="flex items-center gap-2">
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
          className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
