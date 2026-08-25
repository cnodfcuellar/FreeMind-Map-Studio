import React, { useState, useMemo } from 'react';
import {
  VECTOR_ICON_PACK,
  VECTOR_ICON_CATEGORIES,
  VectorIconCategory,
  searchVectorIcons,
  VectorIconItem,
  TOTAL_VECTOR_ICONS_COUNT,
} from '../../utils/vectorIconPack';
import {
  X,
  Search,
  Check,
  Copy,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Info,
} from 'lucide-react';

interface IconPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNodeId: string | null;
  selectedNodeText?: string;
  currentNodeIcons?: string[];
  onToggleIcon: (iconId: string) => void;
}

export const IconPackModal: React.FC<IconPackModalProps> = ({
  isOpen,
  onClose,
  selectedNodeId,
  selectedNodeText,
  currentNodeIcons = [],
  onToggleIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<VectorIconCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewIcon, setPreviewIcon] = useState<VectorIconItem | null>(null);

  // Filtered list
  const filteredIcons = useMemo(() => {
    return searchVectorIcons(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  if (!isOpen) return null;

  const handleCopySvgCode = (icon: VectorIconItem) => {
    // Generate clean SVG markup for clipboard
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n  <!-- ${icon.name} (${icon.id}) -->\n</svg>`;
    navigator.clipboard.writeText(svgString);
    setCopiedId(icon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Pack de 500+ Iconos Vectoriales SVG
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {TOTAL_VECTOR_ICONS_COUNT} Iconos Gratis
                </span>
              </div>
              <p className="text-xs text-slate-500">
                100% vectoriales, libre uso (MIT), ultraligeros y escalables para nodos y mapas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Node Status Bar */}
        {selectedNodeId && (
          <div className="bg-blue-50/90 border-b border-blue-100 px-6 py-2 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold">Nodo seleccionado:</span>
              <span className="truncate max-w-xs bg-white/80 px-2 py-0.5 rounded border border-blue-200 text-slate-800 font-medium">
                {selectedNodeText || selectedNodeId}
              </span>
              <span className="text-blue-600">({currentNodeIcons.length} iconos activos)</span>
            </div>
            <span className="text-[11px] text-blue-700">
              Haz clic en cualquier icono para añadirlo o quitarlo del nodo.
            </span>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre 500+ iconos por nombre, concepto (ej: dinero, cpu, correo, exito, estrella)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span>Todos los Iconos</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-700/50 text-[10px]">
                {TOTAL_VECTOR_ICONS_COUNT}
              </span>
            </button>
            {VECTOR_ICON_CATEGORIES.map((cat) => {
              const count = VECTOR_ICON_PACK.filter((i) => i.category === cat.id).length;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                  title={cat.description}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 min-h-[350px]">
          {filteredIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No se encontraron iconos</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                No hay coincidencias para "{searchQuery}". Intenta con sinónimos o borra el filtro.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100"
              >
                Mostrar todos los 500+ iconos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.icon;
                const isSelectedOnNode = currentNodeIcons.includes(icon.id);
                const isCurrentPreview = previewIcon?.id === icon.id;

                return (
                  <div
                    key={icon.id}
                    onClick={() => {
                      setPreviewIcon(icon);
                      if (selectedNodeId) {
                        onToggleIcon(icon.id);
                      }
                    }}
                    onMouseEnter={() => setPreviewIcon(icon)}
                    className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer select-none text-center ${
                      isSelectedOnNode
                        ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400'
                        : isCurrentPreview
                        ? 'bg-white border-slate-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Active checkmark */}
                    {isSelectedOnNode && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-2xs">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}

                    {/* SVG Icon Container */}
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-transform group-hover:scale-110 mb-1.5 ${
                        isSelectedOnNode ? 'text-blue-600' : 'text-slate-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Icon Name */}
                    <span className="text-[11px] font-medium text-slate-700 truncate w-full px-1">
                      {icon.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono truncate w-full">
                      {icon.id}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Inspector and Quick Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {previewIcon ? (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                {React.createElement(previewIcon.icon, { className: 'w-6 h-6' })}
              </div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {previewIcon.name}
                  </span>
                  <code className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {previewIcon.id}
                  </code>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-md">
                  Etiquetas: {previewIcon.tags.join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500" />
              <span>
                Pasa el cursor o pulsa sobre un icono para ver detalles o aplicarlo al mapa.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            {previewIcon && (
              <button
                onClick={() => handleCopySvgCode(previewIcon)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                title="Copiar referencia SVG"
              >
                {copiedId === previewIcon.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar ID
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
