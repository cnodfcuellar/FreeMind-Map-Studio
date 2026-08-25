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
  LayoutGrid,
} from 'lucide-react';

const CATEGORY_EMOJIS: Record<string, string> = {
  all: '🌟',
  priority_status: '🎯',
  business_finance: '💼',
  tech_code: '💻',
  communication: '💬',
  design_media: '🎨',
  education_science: '🎓',
  navigation_maps: '🧭',
  documents_files: '📁',
  nature_weather: '☀️',
  tools_security: '🛡️',
  health_sports: '🏃',
  emojis_symbols: '✨',
};

const QUICK_SEARCH_TAGS = [
  { label: '🎯 Prioridad', query: 'prioridad' },
  { label: '✓ Check', query: 'check' },
  { label: '⚠ Alerta', query: 'alerta' },
  { label: '★ Estrella', query: 'estrella' },
  { label: '👤 Usuario', query: 'usuario' },
  { label: '➔ Flecha', query: 'flecha' },
  { label: '💰 Dinero', query: 'dinero' },
  { label: '📁 Archivo', query: 'archivo' },
];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Explorador de Iconos SVG Vectoriales
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
                  {TOTAL_VECTOR_ICONS_COUNT} Iconos
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                100% vectoriales, libre uso (MIT), ultraligeros y escalables para nodos y mapas mentales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Node Status Bar */}
        {selectedNodeId && (
          <div className="bg-blue-50/90 border-b border-blue-100 px-5 py-1.5 flex items-center justify-between text-xs text-blue-900 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold">Nodo seleccionado:</span>
              <span className="truncate max-w-xs bg-white/80 px-2 py-0.5 rounded border border-blue-200 text-slate-800 font-medium text-[11px]">
                {selectedNodeText || selectedNodeId}
              </span>
              <span className="text-blue-600 font-mono text-[11px]">({currentNodeIcons.length} iconos activos)</span>
            </div>
            <span className="text-[11px] text-blue-700 hidden sm:inline">
              Haz clic en cualquier icono para añadirlo o quitarlo del nodo.
            </span>
          </div>
        )}

        {/* Main Body (Left Category Panel + Right Content Area) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Categories Sidebar */}
          <aside className="w-56 sm:w-64 bg-slate-50/80 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-2.5 space-y-1 select-none">
            <div className="px-2 py-1.5 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                <span>Categorías</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">12 grupos</span>
            </div>

            {/* "All" Category Button */}
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-sm">🌟</span>
                <span className="truncate">Todos los Iconos</span>
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ml-1.5 ${
                  activeCategory === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {TOTAL_VECTOR_ICONS_COUNT}
              </span>
            </button>

            {/* 12 Categories List */}
            {VECTOR_ICON_CATEGORIES.map((cat) => {
              const count = VECTOR_ICON_PACK.filter((i) => i.category === cat.id).length;
              const isSelected = activeCategory === cat.id;
              const emoji = CATEGORY_EMOJIS[cat.id] || '📁';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200/70'
                  }`}
                  title={cat.description}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{emoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 ml-1.5 ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
            {/* Top Search Bar & Suggestions */}
            <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, tag o ID (ej: dinero, cpu, correo, exito, estrella)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shrink-0 font-mono">
                  {filteredIcons.length} {filteredIcons.length === 1 ? 'icono' : 'iconos'}
                </div>
              </div>

              {/* Quick Search Tag Suggestions */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Sugerencias:</span>
                {QUICK_SEARCH_TAGS.map((st) => (
                  <button
                    key={st.query}
                    type="button"
                    onClick={() => setSearchQuery(searchQuery === st.query ? '' : st.query)}
                    className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      searchQuery === st.query
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Category Header in Main Area */}
            <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <span className="text-sm">{CATEGORY_EMOJIS[activeCategory] || '📁'}</span>
                <span>
                  {activeCategory === 'all'
                    ? 'Todos los Iconos Vectoriales'
                    : VECTOR_ICON_CATEGORIES.find((c) => c.id === activeCategory)?.name}
                </span>
                {activeCategory !== 'all' && (
                  <span className="text-[11px] font-normal text-slate-500 hidden md:inline">
                    — {VECTOR_ICON_CATEGORIES.find((c) => c.id === activeCategory)?.description}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {filteredIcons.length} mostrados
              </span>
            </div>

            {/* Icon Grid Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 min-h-[300px]">
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
                    className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    Mostrar todos los 500+ iconos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
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
                            ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400 scale-102'
                            : isCurrentPreview
                            ? 'bg-white border-slate-400 shadow-xs ring-1 ring-slate-300'
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
                            isSelectedOnNode ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Icon Name */}
                        <span className="text-[10.5px] font-medium text-slate-700 truncate w-full px-1 leading-tight">
                          {icon.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono truncate w-full mt-0.5">
                          {icon.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
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
