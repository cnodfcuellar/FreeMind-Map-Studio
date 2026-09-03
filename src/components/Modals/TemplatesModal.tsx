import React, { useState, useMemo } from 'react';
import { MindMap, CalculatedNodeLayout } from '../../types/mindmap';
import { ALL_TEMPLATES, BLANK_MAP } from '../../utils/sampleMaps';
import { computeMindMapLayout } from '../../utils/layoutEngine';
import { THEMES } from '../../utils/themes';
import { TEMPLATE_SVGS } from '../../utils/templateIllustrations';
import {
  X,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Sliders,
  Palette,
  GitBranch,
  Tag,
  Eye,
} from 'lucide-react';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import { ModalHeader } from '../molecules/ModalHeader';
import { Button } from '../atoms/Button';


interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MindMap) => void;
}

/**
 * Component that computes the real mindmap layout and renders a sharp mini SVG diagram
 */
const TemplateMapPreview: React.FC<{ map: MindMap; height?: number }> = ({ map, height = 110 }) => {
  const theme = THEMES[map.themeId] || THEMES.default;

  const { viewBox, layoutMap, nodesList } = useMemo(() => {
    const computed = computeMindMapLayout(map, { x: 0, y: 0 });
    const nodes = Array.from(computed.values()) as CalculatedNodeLayout[];

    if (nodes.length === 0) {
      return {
        viewBox: '-150 -100 300 200',
        layoutMap: computed,
        nodesList: [],
      };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((l) => {
      minX = Math.min(minX, l.x);
      maxX = Math.max(maxX, l.x + l.width);
      minY = Math.min(minY, l.y);
      maxY = Math.max(maxY, l.y + l.height);
    });

    const pad = 24;
    const w = Math.max(120, maxX - minX + pad * 2);
    const h = Math.max(80, maxY - minY + pad * 2);
    const vx = minX - pad;
    const vy = minY - pad;

    return {
      viewBox: `${vx} ${vy} ${w} ${h}`,
      layoutMap: computed,
      nodesList: nodes,
    };
  }, [map]);

  const isDark = theme.id === 'dark' || theme.id === 'blueprint' || map.backgroundColor === '#0f172a';
  const bgColor = map.backgroundColor || theme.background || (isDark ? '#0f172a' : '#f8fafc');

  return (
    <div
      className="w-full relative rounded-lg overflow-hidden border border-slate-200/80 shadow-2xs group-hover:border-blue-400 transition-colors"
      style={{ height: `${height}px`, backgroundColor: bgColor }}
    >
      <svg
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Branches / Edges */}
        <g id="preview-edges">
          {nodesList.map((childLayout) => {
            const childNode = map.nodes[childLayout.id];
            if (!childNode || !childNode.parentId) return null;

            const parentLayout = layoutMap.get(childNode.parentId);
            if (!parentLayout) return null;

            const branchColor =
              childNode.edgeColor ||
              theme.branchColors[childLayout.branchIndex % theme.branchColors.length] ||
              '#3b82f6';

            let pathData = '';
            if (childLayout.side === 'left') {
              const startX = parentLayout.x;
              const startY = parentLayout.y + parentLayout.height / 2;
              const endX = childLayout.x + childLayout.width;
              const endY = childLayout.y + childLayout.height / 2;
              const midX = (startX + endX) / 2;
              pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
            } else if (childLayout.side === 'bottom') {
              const startX = parentLayout.x + parentLayout.width / 2;
              const startY = parentLayout.y + parentLayout.height;
              const endX = childLayout.x + childLayout.width / 2;
              const endY = childLayout.y;
              const midY = (startY + endY) / 2;
              pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
            } else if (childLayout.side === 'top') {
              const startX = parentLayout.x + parentLayout.width / 2;
              const startY = parentLayout.y;
              const endX = childLayout.x + childLayout.width / 2;
              const endY = childLayout.y + childLayout.height;
              const midY = (startY + endY) / 2;
              pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
            } else {
              const startX = parentLayout.x + parentLayout.width;
              const startY = parentLayout.y + parentLayout.height / 2;
              const endX = childLayout.x;
              const endY = childLayout.y + childLayout.height / 2;
              const midX = (startX + endX) / 2;
              pathData = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
            }

            return (
              <path
                key={`preview-edge-${childNode.parentId}-${childNode.id}`}
                d={pathData}
                fill="none"
                stroke={branchColor}
                strokeWidth={childLayout.depth === 1 ? 3 : 2}
                strokeOpacity={0.85}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g id="preview-nodes">
          {nodesList.map((l) => {
            const node = map.nodes[l.id];
            const isRoot = l.depth === 0;
            const branchColor = theme.branchColors[l.branchIndex % theme.branchColors.length] || '#3b82f6';

            let nodeFill = node?.color;
            if (!nodeFill) {
              if (isRoot) {
                nodeFill = theme.rootBg || '#2563eb';
              } else if (l.depth === 1) {
                nodeFill = branchColor;
              } else {
                nodeFill = theme.nodeBg || '#ffffff';
              }
            }

            const strokeColor = isRoot ? '#ffffff' : l.depth === 1 ? '#ffffff' : branchColor;
            const strokeW = isRoot ? 2.5 : 1.5;
            const shape = node?.shape || (isRoot ? 'bubble' : 'bubble');

            if (shape === 'circle') {
              const r = Math.min(l.width, l.height) / 2;
              return (
                <g key={`preview-node-${l.id}`}>
                  <circle
                    cx={l.x + l.width / 2}
                    cy={l.y + l.height / 2}
                    r={r}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'oval') {
              return (
                <g key={`preview-node-${l.id}`}>
                  <ellipse
                    cx={l.x + l.width / 2}
                    cy={l.y + l.height / 2}
                    rx={l.width / 2}
                    ry={l.height / 2}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'hexagon') {
              const x = l.x;
              const y = l.y;
              const w = l.width;
              const h = l.height;
              const cut = Math.min(w * 0.18, 12);
              const points = `${x + cut},${y} ${x + w - cut},${y} ${x + w},${y + h / 2} ${x + w - cut},${y + h} ${x + cut},${y + h} ${x},${y + h / 2}`;
              return (
                <g key={`preview-node-${l.id}`}>
                  <polygon
                    points={points}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'pill') {
              const r = l.height / 2;
              return (
                <g key={`preview-node-${l.id}`}>
                  <rect
                    x={l.x}
                    y={l.y}
                    width={l.width}
                    height={l.height}
                    rx={r}
                    fill={nodeFill}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                  />
                </g>
              );
            }

            if (shape === 'fork') {
              return (
                <g key={`preview-node-${l.id}`}>
                  <line
                    x1={l.x}
                    y1={l.y + l.height}
                    x2={l.x + l.width}
                    y2={l.y + l.height}
                    stroke={strokeColor}
                    strokeWidth={strokeW * 2}
                    strokeLinecap="round"
                  />
                </g>
              );
            }

            // Default Bubble / Rectangle / Star / Square / Arrow
            return (
              <g key={`preview-node-${l.id}`}>
                <rect
                  x={l.x}
                  y={l.y}
                  width={l.width}
                  height={l.height}
                  rx={isRoot ? 8 : shape === 'square' ? 2 : shape === 'rectangle' ? 3 : 6}
                  fill={nodeFill}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Eye Badge */}
      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[9px] font-semibold text-white/90 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="w-2.5 h-2.5" />
        Vista Previa
      </div>
    </div>
  );
};

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

  const getTemplateIllustration = (id: string): string => {
    switch (id) {
      case 'tutorial':
        return TEMPLATE_SVGS.brainAi;
      case 'okr-strategy':
        return TEMPLATE_SVGS.strategyChess;
      case 'cloud-arch':
        return TEMPLATE_SVGS.cloudInfra;
      case 'brainstorming':
        return TEMPLATE_SVGS.ideaBulb;
      case 'org-chart':
        return TEMPLATE_SVGS.teamCollab;
      case 'agile-sprint':
        return TEMPLATE_SVGS.agileKanban;
      case 'study-exam':
        return TEMPLATE_SVGS.educationCap;
      case 'marketing-funnel':
        return TEMPLATE_SVGS.marketingTarget;
      case 'decision-tree':
        return TEMPLATE_SVGS.workflowGear;
      case 'product-gtm':
        return TEMPLATE_SVGS.rocketLaunch;
      case 'ai-roadmap':
        return TEMPLATE_SVGS.aiRobot;
      case 'swot-matrix':
        return TEMPLATE_SVGS.swotMatrix;
      case 'cybersecurity-framework':
        return TEMPLATE_SVGS.securityShield;
      case 'customer-journey':
        return TEMPLATE_SVGS.customerJourney;
      case 'startup-pitch':
        return TEMPLATE_SVGS.pitchDeck;
      case 'fullstack-roadmap':
        return TEMPLATE_SVGS.codeDev;
      case 'financial-budget':
        return TEMPLATE_SVGS.financeGrowth;
      case 'design-system':
        return TEMPLATE_SVGS.designPalette;
      case 'content-creator':
        return TEMPLATE_SVGS.podcastMic;
      case 'health-wellness':
        return TEMPLATE_SVGS.healthHeart;
      default:
        return TEMPLATE_SVGS.mindMapHub;
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
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <ModalHeader
        title="Galería de Plantillas y Ejemplos"
        subtitle="Mapas preconfigurados con etiquetas de nodo, estilos de enlace, perfiles de grosor y paletas"
        icon={<Sparkles className="w-5 h-5 text-blue-600" />}
        badge={
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
            20 Modelos
          </span>
        }
        onClose={onClose}
      />

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
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={TEMPLATE_SVGS.mindMapHub}
                  alt="Mapa en Blanco"
                  className="w-full h-full object-contain pointer-events-none"
                />
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
            <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-all shrink-0">
              Crear <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Grid of 20 Distinct Templates with Live Map Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => {
              const illustrationUrl = tmpl.map.nodes[tmpl.map.rootId]?.imageUrl || getTemplateIllustration(tmpl.id);

              return (
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
                  className={`p-4 rounded-2xl border cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex flex-col justify-between group ${tmpl.color}`}
                >
                  <div>
                    {/* Header: Illustration + Title + Category */}
                    <div className="flex items-start gap-3 mb-2.5">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0 border border-slate-200/80 p-1 overflow-hidden group-hover:scale-105 transition-transform">
                        <img
                          src={illustrationUrl}
                          alt={tmpl.title}
                          className="w-full h-full object-contain pointer-events-none"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {tmpl.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${tmpl.badgeColor}`}>
                          {tmpl.category}
                        </span>
                      </div>
                    </div>

                    {/* Live Mind Map Visual Diagram Preview */}
                    <div className="mb-2.5">
                      <TemplateMapPreview map={tmpl.map} height={105} />
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
              );
            })}
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
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Selecciona cualquier plantilla para cargar su contenido y configuración visual completa.</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
    </ModalBackdrop>
  );
};


