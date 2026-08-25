import React, { useState, useMemo } from 'react';
import { MindMap } from '../../types/mindmap';
import { ALL_TEMPLATES, BLANK_MAP } from '../../utils/sampleMaps';
import {
  X,
  Sparkles,
  Search,
  BookOpen,
  Target,
  Server,
  Lightbulb,
  Building2,
  CheckSquare,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Rocket,
  Plus,
  ArrowRight,
  Sliders,
  Palette,
  GitBranch,
  Tag,
} from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MindMap) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags across all templates
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    ALL_TEMPLATES.forEach((tmpl) => {
      tmpl.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, []);

  if (!isOpen) return null;

  const CATEGORIES = ['Todas', 'Destacada', 'Estrategia', 'Tecnología', 'Gestión', 'Creatividad', 'Educación'];

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case 'tutorial':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'okr-strategy':
        return <Target className="w-5 h-5 text-amber-600" />;
      case 'cloud-arch':
        return <Server className="w-5 h-5 text-sky-400" />;
      case 'brainstorming':
        return <Lightbulb className="w-5 h-5 text-pink-600" />;
      case 'org-chart':
        return <Building2 className="w-5 h-5 text-zinc-700" />;
      case 'agile-sprint':
        return <CheckSquare className="w-5 h-5 text-emerald-600" />;
      case 'study-exam':
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'marketing-funnel':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'decision-tree':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'product-gtm':
        return <Rocket className="w-5 h-5 text-teal-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  const filteredTemplates = ALL_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'Todas' || tmpl.category === selectedCategory;
    const matchesTag = !selectedTag || (tmpl.tags && tmpl.tags.includes(selectedTag));
    const matchesSearch =
      searchQuery.trim() === '' ||
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tmpl.themeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.layoutLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTag && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
                Galería de Plantillas y Ejemplos
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  10 Modelos
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Mapas preconfigurados con etiquetas de nodo, estilos de enlace, perfiles de grosor y paletas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col gap-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-0.5 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por plantilla, etiqueta (#)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick Tag Filtering Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-[11px]">
            <span className="flex items-center gap-1 text-slate-400 font-semibold shrink-0 mr-1">
              <Tag className="w-3 h-3 text-slate-400" />
              Tags:
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 transition-colors shrink-0 cursor-pointer"
              >
                Limpiar (#{selectedTag}) ×
              </button>
            )}
            {allUniqueTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid Container */}
        <div className="p-6 overflow-y-auto max-h-[58vh] space-y-4">
          {/* Blank Map Quick Action */}
          <div
            onClick={() => {
              onSelectTemplate({
                ...BLANK_MAP,
                id: `map-${Date.now()}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
              onClose();
            }}
            className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 bg-slate-50/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 group-hover:text-blue-600 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors">
                  Comenzar con Mapa en Blanco
                </h4>
                <p className="text-[11px] text-slate-500">
                  Lienzo limpio desde una idea central para estructurar libremente tus pensamientos
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
              Crear <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Grid of 10 Distinct Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate({
                    ...tmpl.map,
                    id: `map-${Date.now()}`,
                    updatedAt: Date.now(),
                  });
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between group ${tmpl.color}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0 border border-slate-100">
                        {getTemplateIcon(tmpl.id)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {tmpl.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${tmpl.badgeColor}`}>
                          {tmpl.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5 line-clamp-2">
                    {tmpl.desc}
                  </p>

                  {/* Template Tags Display */}
                  {tmpl.tags && tmpl.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mb-3">
                      {tmpl.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(selectedTag === tag ? null : tag);
                          }}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                            selectedTag === tag
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/90 text-blue-700 border border-blue-200/80 hover:bg-blue-100/80'
                          }`}
                          title={`Filtrar por etiqueta #${tag}`}
                        >
                          <Tag className="w-2.5 h-2.5 opacity-70" />
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadata badges for visual differentiation */}
                <div className="pt-2.5 border-t border-slate-200/60 mt-auto flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                    <Palette className="w-3 h-3 text-slate-400" />
                    {tmpl.themeName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                    <GitBranch className="w-3 h-3 text-slate-400" />
                    {tmpl.layoutLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    {tmpl.edgeDesc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron plantillas con el criterio especificado.
              {(selectedTag || searchQuery) && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                      setSelectedCategory('Todas');
                    }}
                    className="px-3 py-1 bg-blue-50 text-blue-600 font-semibold rounded-md hover:bg-blue-100 text-xs"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Selecciona cualquier plantilla para cargar su contenido y configuración visual completa.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

