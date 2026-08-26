import React, { useState, useMemo, useRef } from 'react';
import {
  MindNode,
  NodeShape,
  EdgeStyle,
  EdgeProfile,
  LayoutType,
  MindMapTheme,
  MindMap,
  Connector,
  BackgroundPatternStyle,
  NodeBackgroundType,
  NodeGradientDirection,
  NodePatternStyle,
  NodeBgImageMode,
} from '../types/mindmap';
import { AVAILABLE_ICONS, renderNodeIcon } from '../utils/iconMap';
import {
  VECTOR_ICON_PACK,
  VECTOR_ICON_CATEGORIES,
  VectorIconCategory,
  searchVectorIcons,
  TOTAL_VECTOR_ICONS_COUNT,
} from '../utils/vectorIconPack';
import { THEMES, BACKGROUND_PRESET_THEMES, BackgroundPresetTheme } from '../utils/themes';
import { MarkdownView } from '../utils/markdownRenderer';
import {
  Palette,
  FileText,
  Smile,
  Cloud,
  Sliders,
  X,
  Bold,
  Italic,
  Type,
  ExternalLink,
  Plus,
  Trash2,
  Layers,
  ChevronRight,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GitFork,
  Link as LinkIcon,
  Share2,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MoveHorizontal,
  MoveVertical,
  Network,
  CircleDot,
  Compass,
  LayoutGrid,
  Search,
  Maximize2,
  Grid,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Minus,
  Paintbrush,
  SlidersHorizontal,
  Star,
  Upload,
  Image as ImageIcon,
  Eye,
  Edit3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Heading1,
  Heading2,
  Columns,
} from 'lucide-react';

interface ToolPanelProps {
  selectedNode: MindNode | null;
  currentTheme: MindMapTheme;
  layout: LayoutType;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
  onUpdateMapTheme: (themeId: string) => void;
  onUpdateMapLayout: (layout: LayoutType) => void;
  
  // Link & Connection types customization
  mindMap?: MindMap;
  onUpdateMapEdgeStyle?: (edgeStyle: EdgeStyle) => void;
  onUpdateMapEdgeProfile?: (edgeProfile: EdgeProfile) => void;
  onUpdateMapEdgeWidth?: (width: number) => void;
  onUpdateMapEdgeColor?: (color: string | undefined) => void;
  onUpdateMapEdgeDash?: (dash: 'solid' | 'dashed' | 'dotted') => void;
  onApplyEdgeStyleToAllNodes?: (edgeStyle: EdgeStyle) => void;
  onApplyEdgeProfileToAllNodes?: (edgeProfile: EdgeProfile) => void;
  onOpenConnectorModal?: (fromId?: string) => void;
  onDeleteConnector?: (connectorId: string) => void;
  onUpdateConnector?: (connectorId: string, updates: Partial<Connector>) => void;
  onUpdateMapGaps?: (gaps: { horizontal?: number; vertical?: number }) => void;
  onOpenIconPackModal?: () => void;
  onUpdateMapBackground?: (config: {
    backgroundColor?: string;
    backgroundPattern?: BackgroundPatternStyle;
    backgroundPatternColor?: string;
    backgroundPatternSize?: number;
    backgroundPatternOpacity?: number;
  }) => void;
  onResetMapBackground?: () => void;
}

type TabType = 'content' | 'format' | 'notes' | 'icons' | 'clouds' | 'theme';

const COLOR_PRESETS = [
  '#ffffff', '#f8fafc', '#eff6ff', '#f0fdf4', '#fefce8', '#fff7ed', '#faf5ff', '#ecfeff',
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#475569', '#0f172a'
];

const TEXT_COLOR_PRESETS = [
  '#0f172a', '#1e40af', '#166534', '#9a3412', '#6b21a8', '#991b1b', '#ffffff', '#475569'
];

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

export const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedNode,
  currentTheme,
  layout,
  isOpen,
  onClose,
  onUpdateNode,
  onUpdateMapTheme,
  onUpdateMapLayout,
  mindMap,
  onUpdateMapEdgeStyle,
  onUpdateMapEdgeProfile,
  onUpdateMapEdgeWidth,
  onUpdateMapEdgeColor,
  onUpdateMapEdgeDash,
  onApplyEdgeStyleToAllNodes,
  onApplyEdgeProfileToAllNodes,
  onOpenConnectorModal,
  onDeleteConnector,
  onUpdateConnector,
  onUpdateMapGaps,
  onOpenIconPackModal,
  onUpdateMapBackground,
  onResetMapBackground,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [newTagInput, setNewTagInput] = useState('');
  const [showAppliedToast, setShowAppliedToast] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [iconCategory, setIconCategory] = useState<VectorIconCategory | 'all'>('all');
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TOTAL_VECTOR_ICONS_COUNT };
    VECTOR_ICON_CATEGORIES.forEach(c => {
      counts[c.id] = VECTOR_ICON_PACK.filter(i => i.category === c.id).length;
    });
    return counts;
  }, []);

  const [bgCategoryFilter, setBgCategoryFilter] = useState<'all' | 'light' | 'dark' | 'paper' | 'technical' | 'creative'>('all');
  const [expandedConnectorId, setExpandedConnectorId] = useState<string | null>(null);
  const [mapSectionsOpen, setMapSectionsOpen] = useState<Record<string, boolean>>({
    background: false,
    theme: false,
    edges: false,
    nodeEdge: false,
    connectors: false,
    gaps: false,
    layout: false,
  });

  const filteredVectorIcons = useMemo(() => {
    return searchVectorIcons(iconSearchQuery, iconCategory);
  }, [iconSearchQuery, iconCategory]);

  const [notesViewMode, setNotesViewMode] = useState<'preview' | 'edit' | 'split'>('preview');

  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    if (!selectedNode) return;
    const currentNote = selectedNode.note || '';
    const textarea = document.getElementById('node-note-textarea') as HTMLTextAreaElement | null;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = currentNote.substring(start, end) || defaultPlaceholder;
      const replacement = prefix + selectedText + suffix;
      const newText = currentNote.substring(0, start) + replacement + currentNote.substring(end);
      onUpdateNode(selectedNode.id, { note: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }, 0);
    } else {
      onUpdateNode(selectedNode.id, { note: (currentNote ? currentNote + '\n' : '') + prefix + defaultPlaceholder + suffix });
    }
  };

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);

  const [formatSectionsOpen, setFormatSectionsOpen] = useState<Record<string, boolean>>({
    shape: true,
    background: true,
    border: true,
    edge: false,
  });

  const toggleFormatSection = (section: string) => {
    setFormatSectionsOpen(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleExpandAllFormatSections = (expand: boolean) => {
    setFormatSectionsOpen({
      shape: expand,
      background: expand,
      border: expand,
      edge: expand,
    });
  };

  const toggleMapSection = (section: string) => {
    setMapSectionsOpen(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleExpandAllMapSections = (expand: boolean) => {
    setMapSectionsOpen({
      background: expand,
      theme: expand,
      edges: expand,
      nodeEdge: expand,
      connectors: expand,
      gaps: expand,
      layout: expand,
    });
  };

  if (!isOpen) return null;

  const currentMapEdgeStyle: EdgeStyle = mindMap?.edgeStyle || currentTheme.edgeStyle || 'bezier';
  const currentMapEdgeProfile: EdgeProfile = mindMap?.edgeProfile || 'uniform';
  const currentMapEdgeWidth = mindMap?.edgeWidth || 2.5;
  const currentMapEdgeDash = mindMap?.edgeDash || 'solid';
  const currentMapEdgeColor = mindMap?.edgeColor;
  const currentHGap = mindMap?.horizontalGap !== undefined ? mindMap.horizontalGap : 54;
  const currentVGap = mindMap?.verticalGap !== undefined ? mindMap.verticalGap : 14;

  const currentBgColor = mindMap?.backgroundColor || currentTheme.background || '#f8fafc';
  const currentBgPattern: BackgroundPatternStyle = mindMap?.backgroundPattern || currentTheme.backgroundPattern || 'dots';
  const currentBgPatternColor = mindMap?.backgroundPatternColor || currentTheme.backgroundPatternColor || '#94a3b8';
  const currentBgPatternSize = mindMap?.backgroundPatternSize || currentTheme.backgroundPatternSize || 24;
  const currentBgPatternOpacity = mindMap?.backgroundPatternOpacity ?? currentTheme.backgroundPatternOpacity ?? 0.45;
  const hasCustomBackground = Boolean(
    mindMap?.backgroundColor ||
    mindMap?.backgroundPattern ||
    mindMap?.backgroundPatternColor ||
    mindMap?.backgroundPatternSize !== undefined ||
    mindMap?.backgroundPatternOpacity !== undefined
  );

  const handleApplyToAll = (style: EdgeStyle) => {
    if (onApplyEdgeStyleToAllNodes) {
      onApplyEdgeStyleToAllNodes(style);
      setShowAppliedToast(true);
      setTimeout(() => setShowAppliedToast(false), 2500);
    } else if (onUpdateMapEdgeStyle) {
      onUpdateMapEdgeStyle(style);
    }
  };

  const handleApplyProfileToAll = (profile: EdgeProfile) => {
    if (onApplyEdgeProfileToAllNodes) {
      onApplyEdgeProfileToAllNodes(profile);
      setShowAppliedToast(true);
      setTimeout(() => setShowAppliedToast(false), 2500);
    } else if (onUpdateMapEdgeProfile) {
      onUpdateMapEdgeProfile(profile);
    }
  };

  const handleShapeChange = (shape: NodeShape) => {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, { shape });
  };

  const handleAddTag = () => {
    if (!selectedNode || !newTagInput.trim()) return;
    const currentTags = selectedNode.tags || [];
    if (!currentTags.includes(newTagInput.trim())) {
      onUpdateNode(selectedNode.id, { tags: [...currentTags, newTagInput.trim()] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedNode || !selectedNode.tags) return;
    onUpdateNode(selectedNode.id, {
      tags: selectedNode.tags.filter(t => t !== tagToRemove),
    });
  };

  const handleToggleIcon = (iconId: string) => {
    if (!selectedNode) return;
    const currentIcons = selectedNode.icons || [];
    if (currentIcons.includes(iconId)) {
      onUpdateNode(selectedNode.id, {
        icons: currentIcons.filter(id => id !== iconId),
      });
    } else {
      onUpdateNode(selectedNode.id, {
        icons: [...currentIcons, iconId],
      });
    }
  };

  return (
    <aside className="w-84 bg-white border-l border-slate-200 shadow-xl flex flex-col z-10 h-full overflow-hidden transition-all select-none">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-sm text-slate-800">Panel de Propiedades</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type className="w-3.5 h-3.5" /> Texto & Contenido
        </button>
        <button
          onClick={() => setActiveTab('format')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'format'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Estilos & Forma
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Notas
        </button>
        <button
          onClick={() => setActiveTab('icons')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'icons'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smile className="w-3.5 h-3.5" /> Iconos
        </button>
        <button
          onClick={() => setActiveTab('clouds')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'clouds'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" /> Nubes
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'theme'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Mapa
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700">
        {!selectedNode && activeTab !== 'theme' ? (
          <div className="py-12 text-center text-slate-400">
            <p className="font-medium text-sm text-slate-600">Ningún nodo seleccionado</p>
            <p className="text-xs mt-1 text-slate-400">Haz clic en cualquier nodo para modificar sus propiedades.</p>
          </div>
        ) : (
          <>
            {/* CONTENT & TEXT TAB (Two Text Boxes: Título and Cuerpo, each with formatting) */}
            {activeTab === 'content' && selectedNode && (
              <div className="space-y-4">
                {/* 1. TÍTULO DEL NODO */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Título del Nodo
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">Texto principal</span>
                  </div>

                  {/* Title Textarea */}
                  <textarea
                    value={selectedNode.text}
                    onChange={(e) => onUpdateNode(selectedNode.id, { text: e.target.value })}
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 resize-y shadow-2xs"
                    placeholder="Escribe el título..."
                  />

                  {/* Title Formatting Controls */}
                  <div className="space-y-2 pt-1 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Formato del Título</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Bold / Italic */}
                      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <button
                          title="Negrita"
                          onClick={() => onUpdateNode(selectedNode.id, { bold: !selectedNode.bold })}
                          className={`p-1.5 transition-colors ${
                            selectedNode.bold ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Cursiva"
                          onClick={() => onUpdateNode(selectedNode.id, { italic: !selectedNode.italic })}
                          className={`p-1.5 transition-colors border-l border-slate-200 ${
                            selectedNode.italic ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Alignment */}
                      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <button
                          title="Alinear a la izquierda"
                          onClick={() => onUpdateNode(selectedNode.id, { textAlign: 'left' })}
                          className={`p-1.5 transition-colors ${
                            (selectedNode.textAlign || 'left') === 'left' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Alinear al centro"
                          onClick={() => onUpdateNode(selectedNode.id, { textAlign: 'center' })}
                          className={`p-1.5 transition-colors border-l border-slate-200 ${
                            selectedNode.textAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Alinear a la derecha"
                          onClick={() => onUpdateNode(selectedNode.id, { textAlign: 'right' })}
                          className={`p-1.5 transition-colors border-l border-slate-200 ${
                            selectedNode.textAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Font Size */}
                      <select
                        value={selectedNode.fontSize || 14}
                        onChange={(e) => onUpdateNode(selectedNode.id, { fontSize: parseInt(e.target.value, 10) })}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value={12}>12 px</option>
                        <option value={14}>14 px</option>
                        <option value={16}>16 px</option>
                        <option value={18}>18 px</option>
                        <option value={20}>20 px</option>
                        <option value={24}>24 px</option>
                      </select>
                    </div>

                    {/* Title Color */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Color:</span>
                      <input
                        type="color"
                        value={selectedNode.textColor || '#0f172a'}
                        onChange={(e) => onUpdateNode(selectedNode.id, { textColor: e.target.value })}
                        className="w-5 h-5 rounded border border-slate-200 cursor-pointer p-0 shadow-2xs"
                        title="Seleccionar color personalizado"
                      />
                      <div className="flex items-center gap-1 flex-1">
                        {TEXT_COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            style={{ backgroundColor: c }}
                            onClick={() => onUpdateNode(selectedNode.id, { textColor: c })}
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition-transform"
                            title={c}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => onUpdateNode(selectedNode.id, { textColor: undefined })}
                        className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. CUERPO DEL NODO */}
                <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Cuerpo del Nodo
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">Explicación del título</span>
                  </div>

                  {/* Body Textarea */}
                  <textarea
                    value={selectedNode.body || ''}
                    onChange={(e) => onUpdateNode(selectedNode.id, { body: e.target.value || undefined })}
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-normal text-slate-700 outline-none focus:border-blue-500 resize-y shadow-2xs"
                    placeholder="Escribe una pequeña explicación o detalle sobre el título del nodo..."
                  />

                  {/* Body Formatting Controls */}
                  <div className="space-y-2 pt-1 border-t border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Formato del Cuerpo</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Bold / Italic */}
                      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <button
                          title="Cuerpo en Negrita"
                          onClick={() => onUpdateNode(selectedNode.id, { bodyBold: !selectedNode.bodyBold })}
                          className={`p-1.5 transition-colors ${
                            selectedNode.bodyBold ? 'bg-emerald-100 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Cuerpo en Cursiva"
                          onClick={() => onUpdateNode(selectedNode.id, { bodyItalic: !selectedNode.bodyItalic })}
                          className={`p-1.5 transition-colors border-l border-slate-200 ${
                            selectedNode.bodyItalic ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Alignment */}
                      <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <button
                          title="Alinear cuerpo a la izquierda"
                          onClick={() => onUpdateNode(selectedNode.id, { bodyAlign: 'left' })}
                          className={`p-1.5 transition-colors ${
                            (selectedNode.bodyAlign || 'left') === 'left' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Alinear cuerpo al centro"
                          onClick={() => onUpdateNode(selectedNode.id, { bodyAlign: 'center' })}
                          className={`p-1.5 transition-colors border-l border-slate-200 ${
                            selectedNode.bodyAlign === 'center' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Alinear cuerpo a la derecha"
                          onClick={() => onUpdateNode(selectedNode.id, { bodyAlign: 'right' })}
                          className={`p-1.5 transition-colors border-l border-slate-200 ${
                            selectedNode.bodyAlign === 'right' ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Body Font Size */}
                      <select
                        value={selectedNode.bodyFontSize || 12}
                        onChange={(e) => onUpdateNode(selectedNode.id, { bodyFontSize: parseInt(e.target.value, 10) })}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium outline-none focus:border-blue-500 shadow-2xs"
                      >
                        <option value={10}>10 px</option>
                        <option value={11}>11 px</option>
                        <option value={12}>12 px</option>
                        <option value={13}>13 px</option>
                        <option value={14}>14 px</option>
                        <option value={16}>16 px</option>
                      </select>
                    </div>

                    {/* Body Color */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500">Color:</span>
                      <input
                        type="color"
                        value={selectedNode.bodyColor || '#475569'}
                        onChange={(e) => onUpdateNode(selectedNode.id, { bodyColor: e.target.value })}
                        className="w-5 h-5 rounded border border-slate-200 cursor-pointer p-0 shadow-2xs"
                        title="Seleccionar color personalizado del cuerpo"
                      />
                      <div className="flex items-center gap-1 flex-1">
                        {TEXT_COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            style={{ backgroundColor: c }}
                            onClick={() => onUpdateNode(selectedNode.id, { bodyColor: c })}
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition-transform"
                            title={c}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => onUpdateNode(selectedNode.id, { bodyColor: undefined })}
                        className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. IMAGEN DEL NODO (Insertar imagen JPG, PNG, SVG, WebP o URL) */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                  {/* Hidden File Input for Attached Content Image Upload */}
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        onUpdateNode(selectedNode.id, {
                          imageUrl: result,
                          imagePosition: selectedNode.imagePosition || 'top',
                          imageWidth: selectedNode.imageWidth || 140,
                        });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-800 text-xs block">
                          Imagen de Contenido del Nodo
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          Insertada en el cuerpo del nodo (arriba o abajo del texto)
                        </span>
                      </div>
                    </div>
                    {selectedNode.imageUrl && (
                      <span className="text-[9.5px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Adjunta
                      </span>
                    )}
                  </div>

                  {selectedNode.imageUrl ? (
                    <div className="space-y-3 pt-1 border-t border-slate-200/70">
                      {/* Preview card */}
                      <div className="relative rounded-xl border border-slate-200 bg-white p-2.5 flex items-center gap-3 shadow-2xs">
                        <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          <img
                            src={selectedNode.imageUrl}
                            alt="Imagen de contenido"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 block truncate">
                            Imagen de contenido
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            Posición: {
                              selectedNode.imagePosition === 'bottom' ? 'Debajo del texto' :
                              selectedNode.imagePosition === 'left' ? 'A la izquierda' :
                              selectedNode.imagePosition === 'right' ? 'A la derecha' :
                              selectedNode.imagePosition === 'between' ? 'Entre título y cuerpo' :
                              'Arriba del texto'
                            }
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateNode(selectedNode.id, { imageUrl: undefined })}
                            className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Quitar imagen de contenido
                          </button>
                        </div>
                      </div>

                      {/* Image Position Selector: Top, Bottom, Left, Right, Between */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Posición respecto al texto
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                          {[
                            { id: 'top', label: '⬆️ Arriba', tip: 'Sobre el título del nodo' },
                            { id: 'between', label: '↕️ Entre texto', tip: 'Entre el título y el cuerpo' },
                            { id: 'bottom', label: '⬇️ Abajo', tip: 'Bajo el cuerpo del nodo' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              title={pos.tip}
                              onClick={() => {
                                onUpdateNode(selectedNode.id, { imagePosition: pos.id as any });
                              }}
                              className={`py-1.5 px-1 rounded-lg border text-[10.5px] font-semibold transition-all cursor-pointer text-center truncate ${
                                (selectedNode.imagePosition || 'top') === pos.id
                                  ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'left', label: '⬅️ Izquierda', tip: 'Al lado izquierdo del texto' },
                            { id: 'right', label: '➡️ Derecha', tip: 'Al lado derecho del texto' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              title={pos.tip}
                              onClick={() => {
                                onUpdateNode(selectedNode.id, { imagePosition: pos.id as any });
                              }}
                              className={`py-1.5 px-1 rounded-lg border text-[10.5px] font-semibold transition-all cursor-pointer text-center truncate ${
                                selectedNode.imagePosition === pos.id
                                  ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Width Slider */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-600">
                            Ancho / Escala de la imagen
                          </span>
                          <span className="text-purple-700 font-mono font-bold text-[10.5px] bg-purple-50 px-1.5 py-0.2 rounded">
                            {selectedNode.imageWidth || 140}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="400"
                          step="10"
                          value={selectedNode.imageWidth || 140}
                          onChange={(e) => {
                            onUpdateNode(selectedNode.id, { imageWidth: Number(e.target.value) });
                          }}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex items-center justify-between text-[9px] text-slate-400 px-0.5 mt-0.5">
                          <span>Pequeña (60px)</span>
                          <span>Mediana (200px)</span>
                          <span>Grande (400px)</span>
                        </div>
                      </div>

                      {/* Change image button */}
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                        <span>Cambiar Imagen de Contenido...</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1 border-t border-slate-200/70">
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="w-full py-3 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50/90 rounded-2xl text-purple-700 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                          <Upload className="w-4 h-4" />
                        </div>
                        <span>Subir Imagen desde el equipo</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Archivos JPG, PNG, SVG o WebP
                        </span>
                      </button>

                      {/* URL input fallback */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <input
                          type="url"
                          placeholder="O pegar URL de imagen (Enter)..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-purple-500 shadow-2xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                onUpdateNode(selectedNode.id, {
                                  imageUrl: val,
                                  imagePosition: selectedNode.imagePosition || 'top',
                                  imageWidth: selectedNode.imageWidth || 140,
                                });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. METADATA: Enlace, Progreso y Etiquetas */}
                <div className="space-y-3 pt-2">
                  {/* Hyperlink */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Enlace Web o Correo</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={selectedNode.link || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { link: e.target.value || undefined })}
                        placeholder="https://ejemplo.com"
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                      />
                      {selectedNode.link && (
                        <a
                          href={selectedNode.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Progress Percentage */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Progreso de Tarea</label>
                    <div className="flex items-center gap-1.5">
                      {[undefined, 0, 25, 50, 75, 100].map((p) => (
                        <button
                          key={String(p)}
                          onClick={() => onUpdateNode(selectedNode.id, { progress: p })}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            selectedNode.progress === p
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {p === undefined ? '—' : `${p}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Etiquetas (#Tags en parte baja)</label>
                    <div className="flex items-center gap-1.5 mb-2">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Nueva etiqueta..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar
                      </button>
                    </div>

                    {selectedNode.tags && selectedNode.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedNode.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]"
                          >
                            #{t}
                            <button
                              onClick={() => handleRemoveTag(t)}
                              className="hover:text-red-500 ml-0.5"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT TAB (Estilos & Forma) */}
            {activeTab === 'format' && selectedNode && (
              <div className="space-y-3.5">
                {/* Global Collapsible Toolbar for Format Tab */}
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                    Secciones de Formato
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleExpandAllFormatSections(true)}
                      className="text-[10.5px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                    >
                      Desplegar todo
                    </button>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <button
                      type="button"
                      onClick={() => handleExpandAllFormatSections(false)}
                      className="text-[10.5px] text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer"
                    >
                      Plegar todo
                    </button>
                  </div>
                </div>

                {/* 1. SECCIÓN: FORMA Y DIMENSIONES DEL NODO */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => toggleFormatSection('shape')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Square className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Forma y Dimensiones del Nodo
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          10 estilos geométricos, ancho y alto
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full capitalize">
                        {selectedNode.shape || 'burbuja'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          formatSectionsOpen.shape ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {formatSectionsOpen.shape && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3.5 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {/* Grid de 10 Formas Geométricas */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-semibold text-slate-700 text-xs">Formas Geométricas (10 Estilos)</label>
                          <span className="text-[10px] text-slate-400 font-medium">Selecciona una</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { id: 'bubble', label: 'Burbuja', icon: <span className="w-4 h-2.5 rounded-sm border-2 border-current block" /> },
                            { id: 'fork', label: 'Horquilla', icon: <span className="w-4 h-0.5 border-b-2 border-current block mt-1" /> },
                            { id: 'rectangle', label: 'Rectángulo', icon: <span className="w-4 h-2.5 rounded-[1px] border-2 border-current block" /> },
                            { id: 'square', label: 'Cuadrada', icon: <Square className="w-3.5 h-3.5" /> },
                            { id: 'oval', label: 'Óvalo', icon: <span className="w-4 h-2.5 rounded-full border-2 border-current block" /> },
                            { id: 'circle', label: 'Circular', icon: <Circle className="w-3.5 h-3.5" /> },
                            { id: 'pill', label: 'Cápsula', icon: <span className="w-4 h-2 rounded-full border-2 border-current block" /> },
                            { id: 'hexagon', label: 'Hexágono', icon: <Hexagon className="w-3.5 h-3.5" /> },
                            { id: 'arrow', label: 'Flecha', icon: <ArrowRight className="w-3.5 h-3.5" /> },
                            { id: 'star', label: 'Estrella', icon: <Star className="w-3.5 h-3.5" /> },
                          ].map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleShapeChange(s.id as NodeShape)}
                              title={s.label}
                              className={`px-1 py-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                (selectedNode.shape || 'bubble') === s.id
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs font-bold'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <span className="flex items-center justify-center h-4">{s.icon}</span>
                              <span className="text-[9.5px] leading-tight truncate w-full text-center">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Deslizadores de Dimensión: Adaptados y Centrados */}
                      {(() => {
                        const is1to1Shape = selectedNode.shape === 'square' || selectedNode.shape === 'circle';
                        const shapeName = selectedNode.shape === 'square' ? 'Cuadrado' : selectedNode.shape === 'circle' ? 'Círculo' : 'la Forma';
                        const current1to1Size = Math.max(selectedNode.customWidth || 0, selectedNode.customHeight || 0);

                        return (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                                <MoveHorizontal className="w-3.5 h-3.5 text-blue-600" />
                                <span>Dimensiones de {shapeName}</span>
                              </div>
                              {(selectedNode.customWidth || selectedNode.customHeight) && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateNode(selectedNode.id, { customWidth: undefined, customHeight: undefined })}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
                                >
                                  Automático
                                </button>
                              )}
                            </div>

                            {/* CASE A: SQUARE OR CIRCLE (ONLY ONE SYNCHRONIZED SLIDER) */}
                            {is1to1Shape ? (
                              <div className="space-y-1.5 text-center">
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span className="font-semibold text-slate-700">
                                    Tamaño / Diámetro Simétrico (1:1)
                                  </span>
                                  <span className="text-blue-700 font-mono font-bold text-[10.5px] bg-blue-100/70 px-2 py-0.5 rounded">
                                    {current1to1Size > 0 ? `${current1to1Size} px` : 'Auto'}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="48"
                                  max="400"
                                  step="4"
                                  value={current1to1Size || 64}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    onUpdateNode(selectedNode.id, { customWidth: val, customHeight: val });
                                  }}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-medium px-1">
                                  <span>Compacto (48px)</span>
                                  <span className="text-slate-500 font-semibold">Proporción 1:1</span>
                                  <span>Grande (400px)</span>
                                </div>
                              </div>
                            ) : (
                              /* CASE B: ALL OTHER SHAPES (BOTH WIDTH AND HEIGHT SLIDERS) */
                              <div className="space-y-3">
                                {/* 1. Deslizador de Ancho */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                      <MoveHorizontal className="w-3 h-3 text-slate-400" /> Ancho de la forma
                                    </span>
                                    <span className="text-blue-700 font-mono font-bold text-[10.5px] bg-blue-100/70 px-2 py-0.5 rounded">
                                      {selectedNode.customWidth ? `${selectedNode.customWidth} px` : 'Auto'}
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="50"
                                    max="500"
                                    step="5"
                                    value={selectedNode.customWidth || 140}
                                    onChange={(e) => onUpdateNode(selectedNode.id, { customWidth: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                  />
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 px-0.5">
                                    <span>Compacto (50px)</span>
                                    <span>Medio (250px)</span>
                                    <span>Amplio (500px)</span>
                                  </div>
                                </div>

                                {/* 2. Deslizador de Alto */}
                                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                                      <MoveVertical className="w-3 h-3 text-slate-400" /> Alto de la forma
                                    </span>
                                    <span className="text-blue-700 font-mono font-bold text-[10.5px] bg-blue-100/70 px-2 py-0.5 rounded">
                                      {selectedNode.customHeight ? `${selectedNode.customHeight} px` : 'Auto'}
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="30"
                                    max="300"
                                    step="5"
                                    value={selectedNode.customHeight || 40}
                                    onChange={(e) => onUpdateNode(selectedNode.id, { customHeight: Number(e.target.value) })}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                  />
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 px-0.5">
                                    <span>Mínimo (30px)</span>
                                    <span>Medio (150px)</span>
                                    <span>Alto (300px)</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 2. SECCIÓN: FONDO DEL NODO */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => toggleFormatSection('background')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Paintbrush className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Fondo del Nodo
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          Color, transparente, degradado, patrón o imagen de fondo
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {selectedNode.bgType === 'transparent'
                          ? 'Transparente'
                          : selectedNode.bgType === 'gradient'
                          ? 'Degradado'
                          : selectedNode.bgType === 'pattern'
                          ? 'Patrón'
                          : selectedNode.bgType === 'image'
                          ? 'Imagen'
                          : 'Color'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          formatSectionsOpen.background ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Hidden File Input for Background Image Upload */}
                  <input
                    ref={bgImageFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        onUpdateNode(selectedNode.id, {
                          bgType: 'image',
                          bgImageUrl: result,
                          bgImageMode: selectedNode.bgImageMode || 'cover',
                        });
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />

                  {formatSectionsOpen.background && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3.5 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {/* Selector de Tipo de Fondo: 5 Opciones */}
                      <div className="grid grid-cols-5 gap-1">
                        {[
                          { id: 'color', label: 'Color', icon: '🎨' },
                          { id: 'transparent', label: 'Sin Color', icon: '🚫' },
                          { id: 'gradient', label: 'Degradado', icon: '🌈' },
                          { id: 'pattern', label: 'Patrón', icon: '▦' },
                          { id: 'image', label: 'Imagen', icon: '🖼️' },
                        ].map((bt) => {
                          const currentBgType = selectedNode.bgType || (selectedNode.bgImageUrl ? 'image' : 'color');
                          const isSelected = currentBgType === bt.id;
                          return (
                            <button
                              key={bt.id}
                              type="button"
                              onClick={() => {
                                onUpdateNode(selectedNode.id, {
                                  bgType: bt.id as NodeBackgroundType,
                                  ...(bt.id === 'gradient' && !selectedNode.gradientColor1
                                    ? {
                                        gradientColor1: selectedNode.color || '#3b82f6',
                                        gradientColor2: '#8b5cf6',
                                        gradientDirection: selectedNode.gradientDirection || 'to-br',
                                      }
                                    : {}),
                                  ...(bt.id === 'pattern' && !selectedNode.nodePattern
                                    ? {
                                        nodePattern: 'dots',
                                        nodePatternColor: '#475569',
                                        nodePatternSize: 16,
                                        nodePatternOpacity: 0.4,
                                      }
                                    : {}),
                                  ...(bt.id === 'image' && !selectedNode.bgImageMode
                                    ? {
                                        bgImageMode: 'fit',
                                      }
                                    : {}),
                                });
                              }}
                              className={`py-2 px-0.5 rounded-xl border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-xs block mb-0.5">{bt.icon}</span>
                              <span className="text-[9.5px] block leading-tight truncate">{bt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 1. OPCIÓN: SIN COLOR (TRANSPARENTE) */}
                      {selectedNode.bgType === 'transparent' && (
                        <div className="p-3 bg-white border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                          <p className="text-xs text-slate-500">
                            El nodo tiene fondo <span className="font-semibold text-slate-700">transparente</span>.
                          </p>
                        </div>
                      )}

                      {/* 2. OPCIÓN: COLOR SÓLIDO */}
                      {(!selectedNode.bgType || selectedNode.bgType === 'color') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={selectedNode.color || '#ffffff'}
                                onChange={(e) => onUpdateNode(selectedNode.id, { color: e.target.value })}
                                className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0"
                              />
                              <span className="text-[11px] font-mono text-slate-600">
                                {selectedNode.color || '#ffffff'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. OPCIÓN: DEGRADADO */}
                      {selectedNode.bgType === 'gradient' && (
                        <div className="space-y-3 pt-1 border-t border-slate-200/70">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="color"
                              value={selectedNode.gradientColor1 || selectedNode.color || '#3b82f6'}
                              onChange={(e) => onUpdateNode(selectedNode.id, { gradientColor1: e.target.value })}
                              className="w-full h-8 rounded-lg cursor-pointer"
                            />
                            <input
                              type="color"
                              value={selectedNode.gradientColor2 || '#8b5cf6'}
                              onChange={(e) => onUpdateNode(selectedNode.id, { gradientColor2: e.target.value })}
                              className="w-full h-8 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                              Dirección del Degradado
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                { id: 'to-r', label: 'Horizontal', icon: '➡️' },
                                { id: 'to-b', label: 'Vertical', icon: '⬇️' },
                                { id: 'to-br', label: 'Diagonal', icon: '↘️' },
                                { id: 'radial', label: 'Radial', icon: '🔘' },
                              ].map((dir) => {
                                const currentDir = selectedNode.gradientDirection || 'to-br';
                                const isSelected = currentDir === dir.id;
                                return (
                                  <button
                                    key={dir.id}
                                    type="button"
                                    onClick={() => onUpdateNode(selectedNode.id, { gradientDirection: dir.id as NodeGradientDirection })}
                                    className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="text-xs font-bold block">{dir.icon}</span>
                                    <span className="text-[9.5px] block leading-tight">{dir.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4. OPCIÓN: PATRÓN */}
                      {selectedNode.bgType === 'pattern' && (
                        <div className="space-y-3 pt-1 border-t border-slate-200/70">
                          <input
                            type="range"
                            min="8"
                            max="36"
                            step="2"
                            value={selectedNode.nodePatternSize || 16}
                            onChange={(e) => onUpdateNode(selectedNode.id, { nodePatternSize: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      )}

                      {/* 5. OPCIÓN: IMAGEN DE FONDO DEL NODO */}
                      {selectedNode.bgType === 'image' && (
                        <div className="space-y-3 pt-1 border-t border-slate-200/70">
                          {selectedNode.bgImageUrl ? (
                            <div className="space-y-3">
                              <div className="relative rounded-xl border border-slate-200 bg-white p-2.5 flex items-center gap-3 shadow-2xs">
                                <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                  <img
                                    src={selectedNode.bgImageUrl}
                                    alt="Fondo del nodo"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11px] font-bold text-slate-800 block truncate">
                                    Imagen de Fondo Activa
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateNode(selectedNode.id, { bgImageUrl: undefined, bgType: 'color' })}
                                    className="mt-1 inline-flex items-center gap-1 text-[10.5px] text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" /> Quitar imagen de fondo
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Ajuste del Fondo
                                </label>
                                <div className="grid grid-cols-4 gap-1">
                                  {[
                                    { id: 'fit', label: '🖼️ Ajustado', tip: 'El nodo toma la forma y proporción de la imagen de fondo' },
                                    { id: 'cover', label: '🎨 Cubrir', tip: 'Llena todo el fondo del nodo' },
                                    { id: 'contain', label: '📦 Contener', tip: 'Muestra la imagen completa sin recortar' },
                                    { id: 'tile', label: '🔲 Repetir', tip: 'Mosaico repetido' },
                                  ].map((mode) => (
                                    <button
                                      key={mode.id}
                                      type="button"
                                      onClick={() => {
                                        const newMode = mode.id as NodeBgImageMode;
                                        const scale = selectedNode.customWidth || 160;
                                        onUpdateNode(selectedNode.id, {
                                          bgImageMode: newMode,
                                          ...(newMode === 'fit' ? {
                                            customWidth: scale,
                                            customHeight: Math.round(scale * 0.75),
                                          } : {}),
                                        });
                                      }}
                                      className={`py-1.5 px-0.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer truncate ${
                                        (selectedNode.bgImageMode || 'fit') === mode.id
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                      }`}
                                    >
                                      {mode.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {selectedNode.bgImageMode === 'fit' && (
                                <div>
                                  <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="font-semibold text-slate-600">
                                      Tamaño Uniforme del Nodo
                                    </span>
                                    <span className="text-emerald-700 font-mono font-bold text-[10.5px] bg-emerald-50 px-1.5 py-0.2 rounded">
                                      {selectedNode.customWidth || 160}px
                                    </span>
                                  </div>
                                  <input
                                    type="range"
                                    min="60"
                                    max="400"
                                    step="10"
                                    value={selectedNode.customWidth || 160}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      onUpdateNode(selectedNode.id, {
                                        customWidth: val,
                                        customHeight: Math.round(val * 0.75),
                                      });
                                    }}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                  />
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => bgImageFileInputRef.current?.click()}
                                className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Cambiar Imagen de Fondo...</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => bgImageFileInputRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50/90 rounded-2xl text-emerald-700 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Subir Imagen de Fondo</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. SECCIÓN: CONTORNO Y BORDE DEL NODO */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => toggleFormatSection('border')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Square className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Contorno y Borde del Nodo
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          Grosor, trazo y color
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                        {selectedNode.borderWidth !== undefined ? `${selectedNode.borderWidth} px` : '1.5 px'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          formatSectionsOpen.border ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {formatSectionsOpen.border && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3.5 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {/* 1. Grosor de Línea (Grosor del Borde) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-700">Grosor de Línea</label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {selectedNode.borderWidth !== undefined ? `${selectedNode.borderWidth} px` : '1.5 px'}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: 'Fino', val: 1 },
                            { label: 'Estándar', val: 2 },
                            { label: 'Grueso', val: 3.5 },
                            { label: 'Extra', val: 5 },
                          ].map((gw) => {
                            const isSelected = (selectedNode.borderWidth !== undefined ? selectedNode.borderWidth : 1.5) === gw.val;
                            return (
                              <button
                                key={gw.val}
                                type="button"
                                onClick={() => onUpdateNode(selectedNode.id, { borderWidth: gw.val })}
                                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex justify-center items-center h-3 mb-1">
                                  <div
                                    style={{ height: `${Math.max(1, Math.min(gw.val, 4.5))}px` }}
                                    className={`w-8 rounded-full ${
                                      isSelected ? 'bg-blue-600' : 'bg-slate-400'
                                    }`}
                                  />
                                </div>
                                <span className="text-[10px] block leading-tight">{gw.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Sin Borde & Precision Slider Controls */}
                        <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => onUpdateNode(selectedNode.id, { borderWidth: 0 })}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                              selectedNode.borderWidth === 0
                                ? 'bg-red-50 border-red-300 text-red-700 font-semibold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Sin Borde (0px)
                          </button>
                          <div className="flex-1 flex items-center gap-1.5">
                            <input
                              type="range"
                              min="0"
                              max="8"
                              step="0.5"
                              value={selectedNode.borderWidth !== undefined ? selectedNode.borderWidth : 1.5}
                              onChange={(e) => onUpdateNode(selectedNode.id, { borderWidth: parseFloat(e.target.value) })}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Patrón de Trazo (Continuo, Discontinuo, Punteado) */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                          Patrón de Trazo
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'solid', label: 'Continuo', pattern: '━━━━━' },
                            { id: 'dashed', label: 'Discontinuo', pattern: '╍ ╍ ╍' },
                            { id: 'dotted', label: 'Punteado', pattern: '• • • •' },
                          ].map((pat) => {
                            const currentDash = selectedNode.borderDash || selectedNode.borderStyle || 'solid';
                            const isSelected = currentDash === pat.id;
                            return (
                              <button
                                key={pat.id}
                                type="button"
                                onClick={() => onUpdateNode(selectedNode.id, { borderDash: pat.id as any, borderStyle: pat.id as any })}
                                className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <div className="text-[12px] leading-none font-mono text-slate-600 mb-1 flex items-center justify-center">
                                  {pat.pattern}
                                </div>
                                <span className="text-[10px] block leading-tight">{pat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Color del Borde (Color de los Contornos) */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Color del Borde
                          </label>
                          <button
                            type="button"
                            onClick={() => onUpdateNode(selectedNode.id, { borderColor: undefined })}
                            className="text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-700 hover:bg-blue-200/70 transition-colors cursor-pointer"
                          >
                            Multicolor por Rama
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="color"
                            value={selectedNode.borderColor || '#3b82f6'}
                            onChange={(e) => onUpdateNode(selectedNode.id, { borderColor: e.target.value })}
                            className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0 shrink-0"
                          />
                          <span className="text-[11px] font-mono text-slate-600">
                            {selectedNode.borderColor || 'Auto (Color de rama)'}
                          </span>
                        </div>

                        {/* Color Swatches Grid */}
                        <div className="grid grid-cols-8 gap-1.5">
                          {[
                            '#3b82f6',
                            '#2563eb',
                            '#10b981',
                            '#059669',
                            '#f59e0b',
                            '#ea580c',
                            '#ef4444',
                            '#8b5cf6',
                            '#06b6d4',
                            '#475569',
                            '#0f172a',
                            '#64748b',
                            '#ec4899',
                            '#14b8a6',
                            '#6366f1',
                            '#000000',
                          ].map((c) => (
                            <button
                              key={c}
                              type="button"
                              style={{ backgroundColor: c }}
                              onClick={() => onUpdateNode(selectedNode.id, { borderColor: c })}
                              className={`w-6 h-6 rounded-full border border-black/10 shadow-2xs hover:scale-115 transition-transform cursor-pointer ${
                                selectedNode.borderColor === c ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. SECCIÓN: RAMA CONECTORA */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => toggleFormatSection('edge')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <GitFork className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Rama Conectora
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          Curva y estilo de línea hacia hijos
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full capitalize">
                        {selectedNode.edgeStyle || currentTheme.edgeStyle || 'Bézier'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          formatSectionsOpen.edge ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {formatSectionsOpen.edge && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-200/60 animate-in fade-in duration-150">
                      <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                        Estilo de Rama Conectora
                      </label>
                      <select
                        value={selectedNode.edgeStyle || currentTheme.edgeStyle || 'bezier'}
                        onChange={(e) => onUpdateNode(selectedNode.id, { edgeStyle: e.target.value as EdgeStyle })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                      >
                        <option value="bezier">Curva Suave (Bézier)</option>
                        <option value="linear">Línea Recta</option>
                        <option value="sharp">Escuadra / Ángulo Recto</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NOTES TAB WITH MARKDOWN VISION MODE */}
            {activeTab === 'notes' && selectedNode && (
              <div className="space-y-3">
                {/* Header with Mode Switcher */}
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nota del Nodo (Markdown)</span>
                  </label>
                  
                  {/* Mode Selector Tabs: Vision vs Edit vs Split */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setNotesViewMode('preview')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                        notesViewMode === 'preview'
                          ? 'bg-white text-blue-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Modo de Visión (Markdown renderizado)"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Visión</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotesViewMode('edit')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                        notesViewMode === 'edit'
                          ? 'bg-white text-blue-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Modo de Edición"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotesViewMode('split')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                        notesViewMode === 'split'
                          ? 'bg-white text-blue-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Modo Dividido"
                    >
                      <Columns className="w-3 h-3" />
                      <span>Dividido</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Quick Formatting Toolbar (Visible in Edit & Split modes) */}
                {(notesViewMode === 'edit' || notesViewMode === 'split') && (
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('**', '**', 'texto')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Negrita (**texto**)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('*', '*', 'texto')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Cursiva (*texto*)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('# ', '', 'Título 1')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer font-bold text-xs"
                      title="Título 1 (# Título)"
                    >
                      <Heading1 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('## ', '', 'Título 2')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer font-bold text-xs"
                      title="Título 2 (## Título)"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('- [ ] ', '', 'Tarea pendiente')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Lista de tareas (- [ ] Tarea)"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('- ', '', 'Elemento de lista')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Lista con viñetas (- Item)"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('1. ', '', 'Primer elemento')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Lista numerada (1. Item)"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('`', '`', 'código')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Código en línea (`código`)"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('> ', '', 'Cita importante')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Cita (> Cita)"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertMarkdown('[', '](https://ejemplo.com)', 'texto del enlace')}
                      className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 hover:text-blue-600 transition-all cursor-pointer"
                      title="Enlace ([texto](url))"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 1. VISION MODE (Rich Visual Render) */}
                {notesViewMode === 'preview' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 min-h-[220px] max-h-[360px] overflow-y-auto shadow-2xs">
                    {selectedNode.note && selectedNode.note.trim().length > 0 ? (
                      <MarkdownView content={selectedNode.note} isDark={false} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                        <FileText className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">No hay nota en este nodo</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Haz clic en "Editor" para escribir texto en formato Markdown.
                        </p>
                        <button
                          type="button"
                          onClick={() => setNotesViewMode('edit')}
                          className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                        >
                          Escribir Nota
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. EDIT MODE (Textarea Editor) */}
                {notesViewMode === 'edit' && (
                  <div className="space-y-1.5">
                    <textarea
                      id="node-note-textarea"
                      value={selectedNode.note || ''}
                      onChange={(e) => onUpdateNode(selectedNode.id, { note: e.target.value || undefined })}
                      rows={12}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 shadow-2xs resize-y leading-relaxed"
                      placeholder="# Título de nota&#10;&#10;Escribe notas detalladas con soporte de listas, negrita, código, tareas o enlaces..."
                    />
                  </div>
                )}

                {/* 3. SPLIT MODE (Side-by-side or Stacked) */}
                {notesViewMode === 'split' && (
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10.5px] font-semibold text-slate-500 block mb-1">Editor Markdown:</span>
                      <textarea
                        id="node-note-textarea"
                        value={selectedNode.note || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { note: e.target.value || undefined })}
                        rows={7}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-800 outline-none focus:border-blue-500 shadow-2xs resize-y"
                        placeholder="# Escribe aquí..."
                      />
                    </div>
                    <div>
                      <span className="text-[10.5px] font-semibold text-slate-500 block mb-1">Vista Previa en Vivo:</span>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[120px] max-h-[200px] overflow-y-auto shadow-2xs">
                        <MarkdownView content={selectedNode.note || ''} isDark={false} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Helper Tips */}
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Visualización Instantánea</span>
                  </div>
                  <p className="text-[10.5px] text-amber-700 leading-snug">
                    Las notas se muestran automáticamente en <strong>Modo Visión (Markdown renderizado)</strong> al pasar el ratón por encima de cualquier nodo en el lienzo.
                  </p>
                </div>
              </div>
            )}

            {/* ICONS TAB (Sistema de Categorización y Búsqueda Mejorado) */}
            {activeTab === 'icons' && selectedNode && (
              <div className="space-y-3.5">
                {/* 1. Active Icons on Selected Node */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-blue-600" />
                      <span>Iconos en este Nodo</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                        {selectedNode.icons?.length || 0}
                      </span>
                    </label>
                    {selectedNode.icons && selectedNode.icons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onUpdateNode(selectedNode.id, { icons: [] })}
                        className="text-[10px] text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
                      >
                        Quitar todos
                      </button>
                    )}
                  </div>

                  {selectedNode.icons && selectedNode.icons.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      {selectedNode.icons.map((icId) => (
                        <span
                          key={icId}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900 text-xs shadow-2xs group"
                        >
                          <span className="w-4 h-4 flex items-center justify-center">
                            {renderNodeIcon(icId, 'w-3.5 h-3.5 text-blue-600')}
                          </span>
                          <span className="text-[10.5px] font-mono font-medium">{icId}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleIcon(icId)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full w-3.5 h-3.5 flex items-center justify-center transition-colors cursor-pointer"
                            title="Quitar icono"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic bg-white p-2 rounded-xl border border-dashed border-slate-200 text-center">
                      Haz clic en cualquier icono de abajo para agregarlo al nodo.
                    </p>
                  )}
                </div>

                {/* 2. Open Full 520+ Icon Browser Button */}
                {onOpenIconPackModal && (
                  <button
                    type="button"
                    onClick={onOpenIconPackModal}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
                  >
                    <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Explorar Catálogo Completo (520+ Iconos)</span>
                    <Maximize2 className="w-3.5 h-3.5 opacity-80" />
                  </button>
                )}

                {/* 3. Real-time Search Box with Match Counter */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-blue-600" />
                      <span>Búsqueda Inteligente</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {filteredVectorIcons.length} {filteredVectorIcons.length === 1 ? 'icono' : 'iconos'}
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={iconSearchQuery}
                      onChange={(e) => setIconSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre, tag o ID (ej: check, alerta, user)..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 placeholder:text-slate-400 shadow-2xs"
                    />
                    {iconSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setIconSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs w-4 h-4 flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Quick Search Keyword Chips */}
                  <div>
                    <span className="text-[9.5px] text-slate-400 font-medium block mb-1">Sugerencias rápidas:</span>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_SEARCH_TAGS.map((st) => (
                        <button
                          key={st.query}
                          type="button"
                          onClick={() => setIconSearchQuery(iconSearchQuery === st.query ? '' : st.query)}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            iconSearchQuery === st.query
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Categorization System (Clear Dropdown + 12 Category Grid) */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Categorías (12 Colecciones)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryGrid(!showCategoryGrid)}
                      className="text-[10.5px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {showCategoryGrid ? 'Ocultar cuadrícula' : 'Ver cuadrícula (12)'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showCategoryGrid ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Primary Category Selector Dropdown */}
                  <select
                    value={iconCategory}
                    onChange={(e) => setIconCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                  >
                    <option value="all">🌟 Todas las Categorías ({TOTAL_VECTOR_ICONS_COUNT} iconos)</option>
                    {VECTOR_ICON_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {CATEGORY_EMOJIS[cat.id] || '📁'} {cat.name} ({categoryCounts[cat.id] || 0})
                      </option>
                    ))}
                  </select>

                  {/* Expandable 2-Column Category Grid with Icons & Counts */}
                  {showCategoryGrid && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/70 animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setIconCategory('all');
                          setShowCategoryGrid(false);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          iconCategory === 'all'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-400 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-base shrink-0">🌟</span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10.5px] block truncate font-medium">Todas</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{TOTAL_VECTOR_ICONS_COUNT} iconos</span>
                        </div>
                      </button>

                      {VECTOR_ICON_CATEGORIES.map((cat) => {
                        const isSelected = iconCategory === cat.id;
                        const emoji = CATEGORY_EMOJIS[cat.id] || '📁';
                        const count = categoryCounts[cat.id] || 0;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setIconCategory(cat.id);
                              setShowCategoryGrid(false);
                            }}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-400 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-base shrink-0">{emoji}</span>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] block truncate font-medium leading-tight">{cat.name}</span>
                              <span className="text-[9px] text-slate-400 block font-mono">{count} iconos</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Multi-line Wrap Quick Category Chips (Never Cut Off) */}
                  {!showCategoryGrid && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setIconCategory('all')}
                        className={`px-2 py-1 rounded-lg text-[10.5px] transition-all cursor-pointer font-medium ${
                          iconCategory === 'all'
                            ? 'bg-slate-900 text-white font-bold shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        🌟 Todos ({TOTAL_VECTOR_ICONS_COUNT})
                      </button>
                      {VECTOR_ICON_CATEGORIES.map((cat) => {
                        const isSelected = iconCategory === cat.id;
                        const emoji = CATEGORY_EMOJIS[cat.id] || '📁';
                        const shortName = cat.name.split('&')[0].trim();
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setIconCategory(cat.id)}
                            title={`${cat.name} (${categoryCounts[cat.id]} iconos)`}
                            className={`px-2 py-1 rounded-lg text-[10.5px] transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{shortName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 5. Icon Grid List */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-xs">
                      {iconCategory === 'all'
                        ? 'Todos los Iconos'
                        : `${CATEGORY_EMOJIS[iconCategory] || '📁'} ${VECTOR_ICON_CATEGORIES.find(c => c.id === iconCategory)?.name || 'Iconos'}`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {filteredVectorIcons.length} mostrados
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto pr-1">
                    {filteredVectorIcons.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <p className="text-xs">No se encontraron iconos para "{iconSearchQuery}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIconSearchQuery('');
                            setIconCategory('all');
                          }}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Limpiar búsqueda y filtros
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5">
                        {filteredVectorIcons.map((ic) => {
                          const IconComponent = ic.icon;
                          const isSelected = selectedNode.icons?.includes(ic.id);
                          return (
                            <button
                              key={ic.id}
                              type="button"
                              title={`${ic.name}\nID: ${ic.id}\nCategoría: ${ic.category}\nTags: ${ic.tags.join(', ')}`}
                              onClick={() => handleToggleIcon(ic.id)}
                              className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center group cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 shadow-2xs ring-2 ring-blue-500 scale-105'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">
                                  ✓
                                </span>
                              )}
                              <div className="w-5 h-5 flex items-center justify-center mb-1 text-slate-700 group-hover:text-blue-600 group-hover:scale-110 transition-transform">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span className="text-[9px] text-slate-600 truncate max-w-full font-medium leading-tight">
                                {ic.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CLOUDS TAB */}
            {activeTab === 'clouds' && selectedNode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Nube de Agrupación</label>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedNode.cloud?.enabled)}
                    onChange={(e) =>
                      onUpdateNode(selectedNode.id, {
                        cloud: e.target.checked
                          ? { enabled: true, color: 'rgba(59, 130, 246, 0.1)', shape: 'round-rectangle' }
                          : undefined,
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {selectedNode.cloud?.enabled && (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Color de la Nube</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          'rgba(59, 130, 246, 0.12)',
                          'rgba(34, 197, 94, 0.12)',
                          'rgba(245, 158, 11, 0.12)',
                          'rgba(236, 72, 153, 0.12)',
                          'rgba(168, 85, 247, 0.12)',
                          'rgba(6, 182, 212, 0.12)',
                          'rgba(239, 68, 68, 0.12)',
                          'rgba(100, 116, 139, 0.12)',
                        ].map((col) => (
                          <button
                            key={col}
                            style={{ backgroundColor: col }}
                            onClick={() =>
                              onUpdateNode(selectedNode.id, {
                                cloud: { ...selectedNode.cloud!, color: col },
                              })
                            }
                            className="h-8 rounded-lg border border-slate-300 shadow-2xs hover:scale-105 transition-transform"
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Forma de la Nube</label>
                      <select
                        value={selectedNode.cloud.shape || 'round-rectangle'}
                        onChange={(e) =>
                          onUpdateNode(selectedNode.id, {
                            cloud: { ...selectedNode.cloud!, shape: e.target.value as any },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                      >
                        <option value="round-rectangle">Rectángulo Redondeado</option>
                        <option value="arc">Burbuja Suave / Arco</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* THEME & MAP TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                {/* Global Expand / Collapse All Controls */}
                <div className="flex items-center justify-between px-1 text-slate-500">
                  <span className="text-[11px] font-medium text-slate-500">Ajustes Generales del Mapa</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleExpandAllMapSections(true)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                    >
                      Expandir todo
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleExpandAllMapSections(false)}
                      className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer font-medium"
                    >
                      Contraer todo
                    </button>
                  </div>
                </div>

                {/* 0. PANEL: TEMA VISUAL Y ESTILO DEL FONDO DEL LIENZO */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleMapSection('background')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Paintbrush className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Tema Visual y Fondo del Lienzo
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          Tramas geométricas, patrones y colores del lienzo
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Active Style Badge */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">
                        {currentBgPattern === 'none'
                          ? 'Liso'
                          : currentBgPattern === 'dots'
                          ? 'Puntos'
                          : currentBgPattern === 'lines'
                          ? 'Líneas'
                          : currentBgPattern === 'squares'
                          ? 'Cuadrícula'
                          : currentBgPattern === 'triangles'
                          ? 'Triángulos'
                          : 'Hexágonos'}
                      </span>
                      {hasCustomBackground && (
                        <button
                          type="button"
                          title="Restablecer fondo al tema predeterminado"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onResetMapBackground) onResetMapBackground();
                          }}
                          className="text-[10px] text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span className="hidden sm:inline">Restablecer</span>
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          mapSectionsOpen.background ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {mapSectionsOpen.background && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-4 border-t border-slate-200/60 animate-in fade-in duration-150">
                      
                      {/* 1. SELECCIÓN DE ESTILO DE TRAMA / PATRÓN */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-700 block">
                            Estilo de Trama del Fondo
                          </label>
                          <span className="text-[9.5px] text-slate-400 font-normal">
                            6 patrones vectoriales
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            {
                              id: 'none' as BackgroundPatternStyle,
                              name: 'Ninguno',
                              desc: 'Liso limpio',
                              icon: (
                                <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center text-slate-300">
                                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              ),
                            },
                            {
                              id: 'dots' as BackgroundPatternStyle,
                              name: 'Puntos',
                              desc: 'Dot grid',
                              icon: (
                                <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center p-1">
                                  <div className="grid grid-cols-3 gap-1">
                                    {[...Array(9)].map((_, i) => (
                                      <div key={i} className="w-1 h-1 rounded-full bg-slate-500" />
                                    ))}
                                  </div>
                                </div>
                              ),
                            },
                            {
                              id: 'lines' as BackgroundPatternStyle,
                              name: 'Líneas',
                              desc: 'Rayas horiz.',
                              icon: (
                                <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex flex-col justify-around p-1">
                                  <div className="w-full h-0.5 bg-slate-500 rounded-full" />
                                  <div className="w-full h-0.5 bg-slate-500 rounded-full" />
                                  <div className="w-full h-0.5 bg-slate-500 rounded-full" />
                                </div>
                              ),
                            },
                            {
                              id: 'squares' as BackgroundPatternStyle,
                              name: 'Cuadrados',
                              desc: 'Cuadrícula',
                              icon: (
                                <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center p-0.5">
                                  <div className="w-full h-full border border-slate-500 grid grid-cols-2 grid-rows-2">
                                    <div className="border-r border-b border-slate-500" />
                                    <div className="border-b border-slate-500" />
                                    <div className="border-r border-slate-500" />
                                    <div />
                                  </div>
                                </div>
                              ),
                            },
                            {
                              id: 'triangles' as BackgroundPatternStyle,
                              name: 'Triángulos',
                              desc: 'Malla isométrica',
                              icon: (
                                <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center p-0.5">
                                  <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <line x1="0" y1="4" x2="24" y2="4" />
                                    <line x1="0" y1="12" x2="24" y2="12" />
                                    <line x1="0" y1="20" x2="24" y2="20" />
                                    <line x1="0" y1="4" x2="24" y2="20" />
                                    <line x1="12" y1="4" x2="24" y2="12" />
                                    <line x1="0" y1="12" x2="12" y2="20" />
                                    <line x1="24" y1="4" x2="0" y2="20" />
                                    <line x1="12" y1="4" x2="0" y2="12" />
                                    <line x1="24" y1="12" x2="12" y2="20" />
                                  </svg>
                                </div>
                              ),
                            },
                            {
                              id: 'hexagons' as BackgroundPatternStyle,
                              name: 'Hexágonos',
                              desc: 'Panal de abeja',
                              icon: (
                                <div className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center p-0.5">
                                  <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                                    <path d="M6 1 L12 4.5 L12 11.5 L6 15 L0 11.5 L0 4.5 Z" />
                                    <path d="M18 1 L24 4.5 L24 11.5 L18 15 L12 11.5 L12 4.5 Z" />
                                    <path d="M12 11.5 L18 15 L18 22 L12 25.5 L6 22 L6 15 Z" />
                                  </svg>
                                </div>
                              ),
                            },
                          ].map((pat) => {
                            const isSelected = currentBgPattern === pat.id;
                            return (
                              <button
                                key={pat.id}
                                type="button"
                                onClick={() => {
                                  if (onUpdateMapBackground) {
                                    onUpdateMapBackground({ backgroundPattern: pat.id });
                                  }
                                }}
                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-between gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-bold shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                                }`}
                              >
                                <div className="flex justify-center my-0.5">{pat.icon}</div>
                                <div className="w-full">
                                  <div className="text-[11px] leading-tight flex items-center justify-center gap-0.5">
                                    <span>{pat.name}</span>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-purple-600 shrink-0" />}
                                  </div>
                                  <span className="text-[8.5px] text-slate-400 block font-normal">{pat.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. TEMAS PREDEFINIDOS DE FONDO (PRESETS) */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-700 block">
                            Temas Rápidos de Fondo
                          </label>
                          <span className="text-[9.5px] text-slate-400 font-normal">
                            Combinaciones listas
                          </span>
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-none text-[10px]">
                          {[
                            { id: 'all', label: 'Todos' },
                            { id: 'light', label: 'Claros' },
                            { id: 'paper', label: 'Papel' },
                            { id: 'technical', label: 'Técnicos' },
                            { id: 'dark', label: 'Oscuros' },
                            { id: 'creative', label: 'Creativos' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setBgCategoryFilter(cat.id as any)}
                              className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                                bgCategoryFilter === cat.id
                                  ? 'bg-purple-600 text-white font-medium shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-0.5">
                          {BACKGROUND_PRESET_THEMES
                            .filter((item) => bgCategoryFilter === 'all' || item.category === bgCategoryFilter)
                            .map((preset) => {
                              const isMatch =
                                currentBgColor.toLowerCase() === preset.backgroundColor.toLowerCase() &&
                                currentBgPattern === preset.pattern;

                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMapBackground) {
                                      onUpdateMapBackground({
                                        backgroundColor: preset.backgroundColor,
                                        backgroundPattern: preset.pattern,
                                        backgroundPatternColor: preset.patternColor,
                                        backgroundPatternSize: preset.patternSize,
                                        backgroundPatternOpacity: preset.patternOpacity,
                                      });
                                    }
                                  }}
                                  className={`p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer group ${
                                    isMatch
                                      ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/60 shadow-2xs'
                                      : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/90'
                                  }`}
                                >
                                  {/* Swatch Mini Canvas Preview */}
                                  <div
                                    style={{ backgroundColor: preset.backgroundColor }}
                                    className="w-full h-8 rounded-lg border border-slate-200/80 relative overflow-hidden flex items-center justify-center shadow-inner"
                                  >
                                    {preset.pattern === 'dots' && (
                                      <div
                                        className="absolute inset-0"
                                        style={{
                                          backgroundImage: `radial-gradient(${preset.patternColor} 1.5px, transparent 1.5px)`,
                                          backgroundSize: '8px 8px',
                                          opacity: preset.patternOpacity + 0.2,
                                        }}
                                      />
                                    )}
                                    {preset.pattern === 'lines' && (
                                      <div
                                        className="absolute inset-0"
                                        style={{
                                          backgroundImage: `linear-gradient(to bottom, ${preset.patternColor} 1px, transparent 1px)`,
                                          backgroundSize: '100% 7px',
                                          opacity: preset.patternOpacity + 0.2,
                                        }}
                                      />
                                    )}
                                    {preset.pattern === 'squares' && (
                                      <div
                                        className="absolute inset-0"
                                        style={{
                                          backgroundImage: `linear-gradient(to right, ${preset.patternColor} 1px, transparent 1px), linear-gradient(to bottom, ${preset.patternColor} 1px, transparent 1px)`,
                                          backgroundSize: '8px 8px',
                                          opacity: preset.patternOpacity + 0.2,
                                        }}
                                      />
                                    )}
                                    {preset.pattern === 'triangles' && (
                                      <div className="absolute inset-0 flex items-center justify-center opacity-60">
                                        <svg className="w-full h-full" viewBox="0 0 40 24" fill="none" stroke={preset.patternColor} strokeWidth="1">
                                          <line x1="0" y1="4" x2="40" y2="4" />
                                          <line x1="0" y1="12" x2="40" y2="12" />
                                          <line x1="0" y1="20" x2="40" y2="20" />
                                          <line x1="0" y1="4" x2="40" y2="20" />
                                          <line x1="20" y1="4" x2="40" y2="12" />
                                          <line x1="0" y1="12" x2="20" y2="20" />
                                          <line x1="40" y1="4" x2="0" y2="20" />
                                          <line x1="20" y1="4" x2="0" y2="12" />
                                          <line x1="40" y1="12" x2="20" y2="20" />
                                        </svg>
                                      </div>
                                    )}
                                    {preset.pattern === 'hexagons' && (
                                      <div className="absolute inset-0 flex items-center justify-center opacity-60">
                                        <svg className="w-full h-full" viewBox="0 0 40 24" fill="none" stroke={preset.patternColor} strokeWidth="1">
                                          <path d="M10 0 L20 4.5 L20 13.5 L10 18 L0 13.5 L0 4.5 Z" />
                                          <path d="M30 0 L40 4.5 L40 13.5 L30 18 L20 13.5 L20 4.5 Z" />
                                          <path d="M20 13.5 L30 18 L30 27 L20 31.5 L10 27 L10 18 Z" />
                                        </svg>
                                      </div>
                                    )}
                                    {isMatch && (
                                      <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center z-10 shadow-xs">
                                        <Check className="w-2.5 h-2.5" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="w-full min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-semibold text-[11px] text-slate-800 truncate">
                                        {preset.name}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-400 block truncate">
                                      {preset.description}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      {/* 3. COLOR DEL FONDO DEL LIENZO */}
                      <div className="pt-2 border-t border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-700">
                            Color de Fondo del Lienzo
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {currentBgColor}
                            </span>
                            <label className="relative cursor-pointer">
                              <input
                                type="color"
                                value={currentBgColor.startsWith('#') && currentBgColor.length === 7 ? currentBgColor : '#ffffff'}
                                onChange={(e) => {
                                  if (onUpdateMapBackground) {
                                    onUpdateMapBackground({ backgroundColor: e.target.value });
                                  }
                                }}
                                className="sr-only"
                              />
                              <div
                                style={{ backgroundColor: currentBgColor }}
                                className="w-5 h-5 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Palette swatches for background */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            '#ffffff', '#fafaf9', '#f8fafc', '#eff6ff', '#f0fdf4', '#fffbeb', '#faf5ff', '#ecfeff',
                            '#0a2540', '#0f172a', '#18181b', '#090d16', '#1e1b4b', '#14532d', '#451a03', '#000000'
                          ].map((bgc) => (
                            <button
                              key={bgc}
                              type="button"
                              style={{ backgroundColor: bgc }}
                              onClick={() => {
                                if (onUpdateMapBackground) {
                                  onUpdateMapBackground({ backgroundColor: bgc });
                                }
                              }}
                              className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer ${
                                currentBgColor.toLowerCase() === bgc.toLowerCase()
                                  ? 'ring-2 ring-purple-500 scale-110 border-white shadow-xs'
                                  : 'border-slate-300/80 hover:scale-105'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 4. COLOR DE LÍNEAS / PUNTOS / PATRÓN */}
                      {currentBgPattern !== 'none' && (
                        <div className="pt-2 border-t border-slate-200/70 space-y-2 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-700">
                              Color de {currentBgPattern === 'dots' ? 'Puntos' : 'Líneas / Trama'}
                            </label>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                {currentBgPatternColor}
                              </span>
                              <label className="relative cursor-pointer">
                                <input
                                  type="color"
                                  value={currentBgPatternColor.startsWith('#') && currentBgPatternColor.length === 7 ? currentBgPatternColor : '#94a3b8'}
                                  onChange={(e) => {
                                    if (onUpdateMapBackground) {
                                      onUpdateMapBackground({ backgroundPatternColor: e.target.value });
                                    }
                                  }}
                                  className="sr-only"
                                />
                                <div
                                  style={{ backgroundColor: currentBgPatternColor }}
                                  className="w-5 h-5 rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                                />
                              </label>
                            </div>
                          </div>

                          {/* Palette swatches for pattern */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                              '#94a3b8', '#cbd5e1', '#64748b', '#3b82f6', '#38bdf8', '#06b6d4',
                              '#10b981', '#22c55e', '#f59e0b', '#fbbf24', '#8b5cf6', '#a855f7',
                              '#ec4899', '#ffffff', '#475569', '#334155'
                            ].map((pc) => (
                              <button
                                key={pc}
                                type="button"
                                style={{ backgroundColor: pc }}
                                onClick={() => {
                                  if (onUpdateMapBackground) {
                                    onUpdateMapBackground({ backgroundPatternColor: pc });
                                  }
                                }}
                                className={`w-6 h-6 rounded-lg border transition-transform cursor-pointer ${
                                  currentBgPatternColor.toLowerCase() === pc.toLowerCase()
                                    ? 'ring-2 ring-purple-500 scale-110 border-white shadow-xs'
                                    : 'border-slate-300/80 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. TAMAÑO Y OPACIDAD DE LA TRAMA */}
                      {currentBgPattern !== 'none' && (
                        <div className="pt-2 border-t border-slate-200/70 space-y-3 animate-in fade-in duration-150">
                          {/* Pattern Size Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-slate-700">
                                Tamaño / Espaciado de Trama
                              </label>
                              <span className="text-[10px] font-medium text-slate-400">
                                {currentBgPatternSize} px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="14"
                              max="64"
                              step="2"
                              value={currentBgPatternSize}
                              onChange={(e) => {
                                if (onUpdateMapBackground) {
                                  onUpdateMapBackground({ backgroundPatternSize: Number(e.target.value) });
                                }
                              }}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                            />
                            <div className="flex items-center justify-between gap-1 pt-1">
                              {[
                                { label: 'Fino (18px)', val: 18 },
                                { label: 'Estándar (24px)', val: 24 },
                                { label: 'Medio (32px)', val: 32 },
                                { label: 'Grande (48px)', val: 48 },
                              ].map((sz) => (
                                <button
                                  key={sz.val}
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMapBackground) {
                                      onUpdateMapBackground({ backgroundPatternSize: sz.val });
                                    }
                                  }}
                                  className={`text-[9.5px] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                                    currentBgPatternSize === sz.val
                                      ? 'bg-purple-100 text-purple-700 font-bold border border-purple-200'
                                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {sz.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Pattern Opacity Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-slate-700">
                                Opacidad / Visibilidad de Trama
                              </label>
                              <span className="text-[10px] font-medium text-slate-400">
                                {Math.round(currentBgPatternOpacity * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={currentBgPatternOpacity}
                              onChange={(e) => {
                                if (onUpdateMapBackground) {
                                  onUpdateMapBackground({ backgroundPatternOpacity: Number(e.target.value) });
                                }
                              }}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                            />
                            <div className="flex items-center justify-between gap-1 pt-1">
                              {[
                                { label: 'Muy Sutil (20%)', val: 0.2 },
                                { label: 'Equilibrado (45%)', val: 0.45 },
                                { label: 'Marcado (75%)', val: 0.75 },
                                { label: 'Máximo (100%)', val: 1.0 },
                              ].map((op) => (
                                <button
                                  key={op.val}
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMapBackground) {
                                      onUpdateMapBackground({ backgroundPatternOpacity: op.val });
                                    }
                                  }}
                                  className={`text-[9.5px] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                                    Math.abs(currentBgPatternOpacity - op.val) < 0.05
                                      ? 'bg-purple-100 text-purple-700 font-bold border border-purple-200'
                                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {op.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 1. PANEL: TIPO DE ENLACES / CONEXIONES */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleMapSection('edges')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <GitFork className="w-3.5 h-3.5 rotate-90" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Tipo de Enlaces
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          Estilo de líneas y grosor de ramas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {showAppliedToast && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full animate-in fade-in">
                          <Check className="w-3 h-3" /> Aplicado
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          mapSectionsOpen.edges ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {mapSectionsOpen.edges && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3.5 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {/* Edge Style Selector Grid */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                          Forma de la Conexión
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            {
                              id: 'bezier' as EdgeStyle,
                              name: 'Curva Bézier',
                              desc: 'Suave & orgánica',
                              svg: (
                                <svg className="w-8 h-5 text-blue-500" viewBox="0 0 32 20" fill="none">
                                  <circle cx="4" cy="16" r="2.5" fill="currentColor" />
                                  <circle cx="28" cy="4" r="2.5" fill="currentColor" />
                                  <path d="M 4 16 C 16 16, 16 4, 28 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                            },
                            {
                              id: 'linear' as EdgeStyle,
                              name: 'Línea Recta',
                              desc: 'Conexión directa',
                              svg: (
                                <svg className="w-8 h-5 text-indigo-500" viewBox="0 0 32 20" fill="none">
                                  <circle cx="4" cy="16" r="2.5" fill="currentColor" />
                                  <circle cx="28" cy="4" r="2.5" fill="currentColor" />
                                  <path d="M 4 16 L 28 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ),
                            },
                            {
                              id: 'sharp' as EdgeStyle,
                              name: 'Ángulo Recto',
                              desc: 'Ortogonal 90°',
                              svg: (
                                <svg className="w-8 h-5 text-emerald-500" viewBox="0 0 32 20" fill="none">
                                  <circle cx="4" cy="16" r="2.5" fill="currentColor" />
                                  <circle cx="28" cy="4" r="2.5" fill="currentColor" />
                                  <path d="M 4 16 L 16 16 L 16 4 L 28 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),
                            },
                            {
                              id: 'horizontal' as EdgeStyle,
                              name: 'Escalón',
                              desc: 'Rama Freeplane',
                              svg: (
                                <svg className="w-8 h-5 text-amber-500" viewBox="0 0 32 20" fill="none">
                                  <circle cx="4" cy="16" r="2.5" fill="currentColor" />
                                  <circle cx="28" cy="4" r="2.5" fill="currentColor" />
                                  <path d="M 4 16 L 10 16 L 10 4 L 28 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ),
                            },
                          ].map((item) => {
                            const isSelected = currentMapEdgeStyle === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (onUpdateMapEdgeStyle) onUpdateMapEdgeStyle(item.id);
                                }}
                                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                                  isSelected
                                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold text-[11px]">{item.name}</span>
                                  {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-slate-400">{item.desc}</span>
                                  <div className="shrink-0">{item.svg}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Hidden / None option button */}
                        <button
                          onClick={() => {
                            if (onUpdateMapEdgeStyle) onUpdateMapEdgeStyle('hidden');
                          }}
                          className={`w-full mt-1.5 py-1.5 px-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                            currentMapEdgeStyle === 'hidden'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-[11px]">Ocultar todas las líneas (Sin enlaces)</span>
                          {currentMapEdgeStyle === 'hidden' && <Check className="w-3 h-3 text-blue-600" />}
                        </button>
                      </div>

                      {/* Perfil y Variación de Grosor (Principio, Medio y Fin) */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block">
                              Forma de Grosor (Principio, Medio y Fin)
                            </label>
                            <span className="text-[9.5px] text-slate-400 font-normal">
                              Variación del trazo en origen, centro y destino
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            {
                              id: 'uniform' as EdgeProfile,
                              name: 'Uniforme',
                              desc: 'Grosor continuo parejo',
                              svg: (
                                <svg className="w-9 h-4.5 text-blue-500" viewBox="0 0 36 18" fill="currentColor">
                                  <rect x="2" y="7" width="32" height="4" rx="2" />
                                </svg>
                              ),
                            },
                            {
                              id: 'tapered' as EdgeProfile,
                              name: 'Cónico (1 Punta)',
                              desc: 'Ancho en inicio, fino al fin',
                              svg: (
                                <svg className="w-9 h-4.5 text-indigo-500" viewBox="0 0 36 18" fill="currentColor">
                                  <path d="M 2 3 L 34 8.5 A 1 1 0 0 1 34 9.5 L 2 15 Z" />
                                </svg>
                              ),
                            },
                            {
                              id: 'spindle' as EdgeProfile,
                              name: 'Ancho al Medio',
                              desc: 'Fino en puntas, grueso al centro',
                              svg: (
                                <svg className="w-9 h-4.5 text-emerald-500" viewBox="0 0 36 18" fill="currentColor">
                                  <path d="M 2 9 C 12 2.5, 24 2.5, 34 9 C 24 15.5, 12 15.5, 2 9 Z" />
                                </svg>
                              ),
                            },
                            {
                              id: 'hourglass' as EdgeProfile,
                              name: 'Ancho en Puntas',
                              desc: 'Ancho en puntas, fino al centro',
                              svg: (
                                <svg className="w-9 h-4.5 text-purple-500" viewBox="0 0 36 18" fill="currentColor">
                                  <path d="M 2 3 C 14 7.5, 22 7.5, 34 3 L 34 15 C 22 10.5, 14 10.5, 2 15 Z" />
                                </svg>
                              ),
                            },
                          ].map((item) => {
                            const isSelected = currentMapEdgeProfile === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (onUpdateMapEdgeProfile) onUpdateMapEdgeProfile(item.id);
                                }}
                                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                                  isSelected
                                    ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold text-[11px]">{item.name}</span>
                                  {isSelected && <Check className="w-3 h-3 text-indigo-600 shrink-0" />}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] text-slate-400 leading-tight">{item.desc}</span>
                                  <div className="shrink-0 pl-1">{item.svg}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Edge Width (Grosor) */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-600">Grosor de Línea</label>
                          <span className="text-[10px] text-slate-400 font-medium">{currentMapEdgeWidth} px</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { label: 'Fino', val: 1.5 },
                            { label: 'Estándar', val: 2.5 },
                            { label: 'Grueso', val: 4 },
                            { label: 'Extra', val: 6 },
                          ].map((gw) => (
                            <button
                              key={gw.val}
                              onClick={() => {
                                if (onUpdateMapEdgeWidth) onUpdateMapEdgeWidth(gw.val);
                              }}
                              className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                                currentMapEdgeWidth === gw.val
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px]'
                              }`}
                            >
                              <div className="flex justify-center mb-1">
                                <div
                                  style={{ height: `${Math.min(gw.val, 4)}px` }}
                                  className={`w-6 rounded-full ${
                                    currentMapEdgeWidth === gw.val ? 'bg-blue-600' : 'bg-slate-400'
                                  }`}
                                />
                              </div>
                              <span className="text-[10px]">{gw.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Line Pattern / Dashing (Patrón de Trazo) */}
                      <div className="pt-2 border-t border-slate-200/70">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                          Patrón de Trazo
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'solid', label: 'Continuo', pattern: '━━━━━' },
                            { id: 'dashed', label: 'Discontinuo', pattern: '╍ ╍ ╍' },
                            { id: 'dotted', label: 'Punteado', pattern: '• • • •' },
                          ].map((pat) => (
                            <button
                              key={pat.id}
                              onClick={() => {
                                if (onUpdateMapEdgeDash) onUpdateMapEdgeDash(pat.id as any);
                              }}
                              className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                                currentMapEdgeDash === pat.id
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="text-[11px] leading-tight font-mono text-slate-500 mb-0.5">{pat.pattern}</div>
                              <span className="text-[10px]">{pat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Edge Color (Multicolor vs Custom Fixed Color) */}
                      <div className="pt-2 border-t border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-600">Color de los Enlaces</label>
                          <button
                            onClick={() => {
                              if (onUpdateMapEdgeColor) onUpdateMapEdgeColor(undefined);
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                              !currentMapEdgeColor
                                ? 'bg-blue-100 border-blue-200 text-blue-700 font-semibold'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            Multicolor por Rama
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            '#3b82f6', '#2563eb', '#10b981', '#059669',
                            '#f59e0b', '#ea580c', '#ef4444', '#8b5cf6',
                            '#06b6d4', '#475569', '#0f172a', '#64748b'
                          ].map((c) => (
                            <button
                              key={c}
                              style={{ backgroundColor: c }}
                              onClick={() => {
                                if (onUpdateMapEdgeColor) onUpdateMapEdgeColor(c);
                              }}
                              className={`w-6 h-6 rounded-full border transition-transform ${
                                currentMapEdgeColor === c
                                  ? 'ring-2 ring-blue-500 scale-110 border-white shadow-xs'
                                  : 'border-white hover:scale-105'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Apply to all button */}
                      <button
                        onClick={() => {
                          handleApplyToAll(currentMapEdgeStyle);
                          handleApplyProfileToAll(currentMapEdgeProfile);
                        }}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Aplicar estilo y perfil a todas las ramas</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. ENLACE DEL NODO SELECCIONADO (Si hay un nodo activo) */}
                {selectedNode && selectedNode.parentId !== null && (
                  <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl shadow-2xs overflow-hidden transition-all">
                    {/* Collapsible Header */}
                    <button
                      type="button"
                      onClick={() => toggleMapSection('nodeEdge')}
                      className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-blue-100/40 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-blue-200/70 text-blue-700 flex items-center justify-center shrink-0">
                          <Share2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 text-xs block truncate">
                            Enlace de este Nodo
                          </span>
                          <span className="text-[10px] text-blue-600/80 truncate block">
                            {selectedNode.text || 'Sin título'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(selectedNode.edgeStyle || selectedNode.edgeProfile || selectedNode.edgeColor || selectedNode.edgeWidth || selectedNode.edgeDash) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateNode(selectedNode.id, {
                                edgeStyle: undefined,
                                edgeProfile: undefined,
                                edgeColor: undefined,
                                edgeWidth: undefined,
                                edgeDash: undefined,
                              });
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Restablecer
                          </button>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                            mapSectionsOpen.nodeEdge ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      </div>
                    </button>

                    {/* Collapsible Body */}
                    {mapSectionsOpen.nodeEdge && (
                      <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-blue-200/50 animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={selectedNode.edgeStyle || ''}
                            onChange={(e) =>
                              onUpdateNode(selectedNode.id, {
                                edgeStyle: e.target.value ? (e.target.value as EdgeStyle) : undefined,
                              })
                            }
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="">Forma heredada</option>
                            <option value="bezier">Curva Bézier</option>
                            <option value="linear">Línea Recta</option>
                            <option value="sharp">Ángulo Recto</option>
                            <option value="horizontal">Escalón</option>
                            <option value="hidden">Oculto</option>
                          </select>

                          <select
                            value={selectedNode.edgeProfile || ''}
                            onChange={(e) =>
                              onUpdateNode(selectedNode.id, {
                                edgeProfile: e.target.value ? (e.target.value as EdgeProfile) : undefined,
                              })
                            }
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="">Grosor heredado</option>
                            <option value="uniform">Uniforme</option>
                            <option value="tapered">Cónico (Ancho inicio)</option>
                            <option value="spindle">Ancho al medio</option>
                            <option value="hourglass">Ancho en puntas</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={selectedNode.edgeDash || ''}
                            onChange={(e) =>
                              onUpdateNode(selectedNode.id, {
                                edgeDash: e.target.value ? (e.target.value as any) : undefined,
                              })
                            }
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="">Trazo heredado</option>
                            <option value="solid">Continuo</option>
                            <option value="dashed">Discontinuo</option>
                            <option value="dotted">Punteado</option>
                          </select>

                          <select
                            value={selectedNode.edgeWidth ? String(selectedNode.edgeWidth) : ''}
                            onChange={(e) =>
                              onUpdateNode(selectedNode.id, {
                                edgeWidth: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none focus:border-blue-500"
                          >
                            <option value="">Grosor base</option>
                            <option value="1.5">Fino (1.5 px)</option>
                            <option value="2.5">Estándar (2.5 px)</option>
                            <option value="4">Grueso (4.0 px)</option>
                            <option value="6">Extra (6.0 px)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CONECTORES FLOTANTES & RELACIONES */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleMapSection('connectors')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                        <LinkIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Conectores Cruzados
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          {mindMap?.connectors?.length || 0} relación(es) libre(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenConnectorModal) onOpenConnectorModal(selectedNode?.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Nuevo
                      </button>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          mapSectionsOpen.connectors ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {mapSectionsOpen.connectors && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {mindMap?.connectors && mindMap.connectors.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {mindMap.connectors.map((conn) => {
                            const fromNode = mindMap.nodes[conn.fromId];
                            const toNode = mindMap.nodes[conn.toId];
                            const isExpanded = expandedConnectorId === conn.id;
                            const currentCurvature = conn.curvature !== undefined ? conn.curvature : -50;
                            const currentShape = conn.shape || 'curved';
                            const currentStyle = conn.style || 'dashed';
                            const currentArrow = conn.arrow || 'end';
                            const currentWidth = conn.width || 2;
                            const currentColor = conn.color || '#3b82f6';

                            return (
                              <div
                                key={conn.id}
                                className={`rounded-xl border transition-all ${
                                  isExpanded
                                    ? 'bg-white border-cyan-400 ring-1 ring-cyan-200 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {/* Connector Item Header */}
                                <div
                                  onClick={() => setExpandedConnectorId(isExpanded ? null : conn.id)}
                                  className="flex items-center justify-between p-2.5 cursor-pointer select-none"
                                >
                                  <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
                                      <span className="truncate max-w-[85px]" title={fromNode?.text}>
                                        {fromNode?.text?.split('\n')[0] || 'Nodo'}
                                      </span>
                                      <ArrowRight className="w-3 h-3 text-cyan-600 shrink-0" />
                                      <span className="truncate max-w-[85px]" title={toNode?.text}>
                                        {toNode?.text?.split('\n')[0] || 'Nodo'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {conn.label ? (
                                        <span className="text-[10.5px] text-slate-500 truncate italic">
                                          "{conn.label}"
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">Sin etiqueta</span>
                                      )}
                                      <span className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500">
                                        {currentShape} • {currentCurvature}px
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <div
                                      style={{ backgroundColor: currentColor }}
                                      className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0 shadow-2xs"
                                    />
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180 text-cyan-600' : ''
                                      }`}
                                    />
                                    {onDeleteConnector && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteConnector(conn.id);
                                        }}
                                        title="Eliminar conector"
                                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Customization Controls */}
                                {isExpanded && onUpdateConnector && (
                                  <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-3 bg-slate-50/50 rounded-b-xl text-xs animate-in fade-in duration-100">
                                    {/* 1. Forma y Recorrido de la Línea */}
                                    <div>
                                      <label className="font-semibold text-slate-700 text-[11px] block mb-1.5">
                                        Forma del Recorrido
                                      </label>
                                      <div className="grid grid-cols-4 gap-1">
                                        {[
                                          { id: 'curved', label: 'Curva', symbol: '⌒' },
                                          { id: 'bezier', label: 'Bézier S', symbol: '∿' },
                                          { id: 'straight', label: 'Recta', symbol: '─' },
                                          { id: 'step', label: 'Escalón', symbol: '┐' },
                                        ].map((shp) => (
                                          <button
                                            key={shp.id}
                                            type="button"
                                            onClick={() => onUpdateConnector(conn.id, { shape: shp.id as any })}
                                            className={`py-1 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                              currentShape === shp.id
                                                ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-2xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                          >
                                            <span className="block text-xs font-mono">{shp.symbol}</span>
                                            <span className="text-[9.5px] block truncate">{shp.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 2. Curvatura y Desplazamiento */}
                                    {currentShape !== 'straight' && (
                                      <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="font-semibold text-slate-700">Curvatura / Arco:</span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 text-[10.5px]">
                                              {currentCurvature}px
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                onUpdateConnector(conn.id, {
                                                  curvature: -50,
                                                  controlPoint: undefined,
                                                })
                                              }
                                              className="text-[10px] text-cyan-600 hover:text-cyan-800 underline cursor-pointer"
                                              title="Restablecer arco por defecto"
                                            >
                                              Reset
                                            </button>
                                          </div>
                                        </div>
                                        <input
                                          type="range"
                                          min="-200"
                                          max="200"
                                          step="5"
                                          value={currentCurvature}
                                          onChange={(e) =>
                                            onUpdateConnector(conn.id, {
                                              curvature: Number(e.target.value),
                                              controlPoint: undefined,
                                            })
                                          }
                                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-400">
                                          <span>Arco invertido (-200)</span>
                                          <span>Recto (0)</span>
                                          <span>Arco directo (+200)</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* 3. Estilo de Línea & Grosor */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                                          Estilo de Trazo
                                        </label>
                                        <select
                                          value={currentStyle}
                                          onChange={(e) => onUpdateConnector(conn.id, { style: e.target.value as any })}
                                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 outline-none focus:border-cyan-500 shadow-2xs"
                                        >
                                          <option value="solid">Sólida (Solid)</option>
                                          <option value="dashed">Discontinua (Dashed)</option>
                                          <option value="dotted">Punteada (Dotted)</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                                          Grosor: {currentWidth}px
                                        </label>
                                        <div className="flex gap-1">
                                          {[1, 2, 3, 4, 5].map((w) => (
                                            <button
                                              key={w}
                                              type="button"
                                              onClick={() => onUpdateConnector(conn.id, { width: w })}
                                              className={`flex-1 py-1 rounded-lg border text-center text-xs font-semibold cursor-pointer ${
                                                currentWidth === w
                                                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                              }`}
                                            >
                                              {w}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 4. Flechas / Dirección */}
                                    <div>
                                      <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                                        Dirección de Flechas
                                      </label>
                                      <div className="grid grid-cols-4 gap-1">
                                        {[
                                          { id: 'end', label: '➔ Destino' },
                                          { id: 'start', label: '⬅ Origen' },
                                          { id: 'both', label: '↔ Ambas' },
                                          { id: 'none', label: '— Ninguna' },
                                        ].map((arr) => (
                                          <button
                                            key={arr.id}
                                            type="button"
                                            onClick={() => onUpdateConnector(conn.id, { arrow: arr.id as any })}
                                            className={`py-1 px-1 rounded-lg border text-center text-[10px] transition-all cursor-pointer ${
                                              currentArrow === arr.id
                                                ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-2xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                          >
                                            {arr.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 5. Capa de Visualización (Sobre los nodos vs Detrás de los nodos) */}
                                    <div>
                                      <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                                        Capa de Visualización
                                      </label>
                                      <div className="grid grid-cols-2 gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => onUpdateConnector(conn.id, { layer: 'above' })}
                                          className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                            conn.layer !== 'below'
                                              ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-2xs'
                                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>🔼</span>
                                          <span>Sobre los nodos</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => onUpdateConnector(conn.id, { layer: 'below' })}
                                          className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                            conn.layer === 'below'
                                              ? 'bg-cyan-600 text-white border-cyan-600 font-bold shadow-2xs'
                                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                          }`}
                                        >
                                          <span>🔽</span>
                                          <span>Detrás de los nodos</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* 6. Opacidad del Conector */}
                                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200">
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-semibold text-slate-700">Opacidad de la Línea:</span>
                                        <span className="font-mono text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 text-[10.5px]">
                                          {Math.round((conn.opacity !== undefined ? conn.opacity : 1) * 100)}%
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={Math.round((conn.opacity !== undefined ? conn.opacity : 1) * 100)}
                                        onChange={(e) =>
                                          onUpdateConnector(conn.id, {
                                            opacity: Number(e.target.value) / 100,
                                          })
                                        }
                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                      />
                                      <div className="flex justify-between text-[9px] text-slate-400">
                                        <span>Tenue (10%)</span>
                                        <span>Medio (50%)</span>
                                        <span>Opaco (100%)</span>
                                      </div>
                                    </div>

                                    {/* 7. Color & Etiqueta de la Relación */}
                                    <div className="space-y-2">
                                      <div>
                                        <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                                          Color del Conector
                                        </label>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'].map((c) => (
                                            <button
                                              key={c}
                                              type="button"
                                              onClick={() => onUpdateConnector(conn.id, { color: c })}
                                              style={{ backgroundColor: c }}
                                              className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                                                currentColor === c ? 'ring-2 ring-cyan-500 scale-110 border-white' : 'border-slate-300'
                                              }`}
                                            />
                                          ))}
                                          <input
                                            type="color"
                                            value={currentColor}
                                            onChange={(e) => onUpdateConnector(conn.id, { color: e.target.value })}
                                            className="w-5 h-5 rounded border border-slate-200 cursor-pointer p-0 shrink-0"
                                            title="Color personalizado"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="font-semibold text-slate-700 text-[11px] block mb-1">
                                          Texto / Etiqueta de Relación
                                        </label>
                                        <input
                                          type="text"
                                          value={conn.label || ''}
                                          onChange={(e) =>
                                            onUpdateConnector(conn.id, {
                                              label: e.target.value || undefined,
                                            })
                                          }
                                          placeholder="Ej: Depende de, Relacionado con..."
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-cyan-500 placeholder:text-slate-400 shadow-2xs"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                          <p className="text-[11px]">No hay conectores flotantes.</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Relaciona ideas entre diferentes ramas haciendo clic en "+ Nuevo".
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. SEPARACIÓN DE NODOS (HORIZONTAL Y VERTICAL) */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleMapSection('gaps')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Separación de Nodos
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          H: {currentHGap}px · V: {currentVGap}px
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {(currentHGap !== 54 || currentVGap !== 14) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateMapGaps?.({ horizontal: 54, vertical: 14 });
                          }}
                          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 font-medium px-2 py-0.5 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Restablecer espaciados por defecto (54px / 14px)"
                        >
                          <RotateCcw className="w-3 h-3" /> Restablecer
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          mapSectionsOpen.gaps ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {mapSectionsOpen.gaps && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-3.5 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {/* Horizontal Separation Slider & Number Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <MoveHorizontal className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[11px] font-semibold text-slate-700">Separación Horizontal</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="15"
                              max="250"
                              value={currentHGap}
                              onChange={(e) => {
                                const val = Math.max(10, Math.min(300, Number(e.target.value) || 20));
                                onUpdateMapGaps?.({ horizontal: val });
                              }}
                              className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs text-right font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-400 font-medium">px</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="20"
                            max="180"
                            step="2"
                            value={currentHGap}
                            onChange={(e) => onUpdateMapGaps?.({ horizontal: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[
                            { label: 'Compacto', val: 36 },
                            { label: 'Normal', val: 60 },
                            { label: 'Amplio', val: 96 },
                            { label: 'Extenso', val: 140 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => onUpdateMapGaps?.({ horizontal: preset.val })}
                              className={`text-[9.5px] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                                currentHGap === preset.val
                                  ? 'bg-blue-100 text-blue-700 font-bold border border-blue-200'
                                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Vertical Separation Slider & Number Input */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <MoveVertical className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[11px] font-semibold text-slate-700">Separación Vertical</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="4"
                              max="300"
                              value={currentVGap}
                              onChange={(e) => {
                                const val = Math.max(4, Math.min(300, Number(e.target.value) || 6));
                                onUpdateMapGaps?.({ vertical: val });
                              }}
                              className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs text-right font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400 font-medium">px</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="6"
                            max="180"
                            step="2"
                            value={currentVGap}
                            onChange={(e) => onUpdateMapGaps?.({ vertical: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          {[
                            { label: 'Compacto', val: 14 },
                            { label: 'Normal', val: 32 },
                            { label: 'Amplio', val: 64 },
                            { label: 'Extenso', val: 110 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => onUpdateMapGaps?.({ vertical: preset.val })}
                              className={`text-[9.5px] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                                currentVGap === preset.val
                                  ? 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-200'
                                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. TIPO DE DISTRIBUCIÓN DE LOS NODOS */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleMapSection('layout')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Distribución de Nodos
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          8 algoritmos de auto-distribución
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        8 Modos
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          mapSectionsOpen.layout ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {mapSectionsOpen.layout && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-slate-200/60 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          {
                            id: 'standard',
                            title: 'Equilibrado vertical (el actual)',
                            tag: 'Clásico Doble Lado',
                            desc: 'Ramas divididas a izquierda y derecha, apiladas verticalmente',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="8" width="6" height="8" rx="1.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M9 12H3m0 0v-3m0 3v3" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                                <path d="M15 12h6m0 0v-3m0 3v3" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'balanced-horizontal',
                            title: 'Equilibrado horizontal',
                            tag: 'Arriba y Abajo',
                            desc: 'Ramas divididas arriba y abajo, distribuidas horizontalmente',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="8" y="9" width="8" height="6" rx="1.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M12 9V3m0 0H9m3 0h3" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                                <path d="M12 15v6m0 0H9m3 0h3" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'left',
                            title: 'Hacia la izquierda',
                            tag: 'Solo Izquierda',
                            desc: 'Árbol unilateral con todas las ramas extendiéndose hacia la izquierda',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="15" y="8" width="6" height="8" rx="1.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M15 12H9m0 0v-5h-5m5 5v5h-5" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'right',
                            title: 'Hacia la derecha',
                            tag: 'Solo Derecha',
                            desc: 'Árbol unilateral con todas las ramas extendiéndose hacia la derecha',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="8" width="6" height="8" rx="1.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M9 12h6m0 0v-5h5m-5 5v5h5" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'top',
                            title: 'Hacia arriba',
                            tag: 'Jerarquía Ascendente',
                            desc: 'Nodo raíz en la base y ramas creciendo verticalmente hacia arriba',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="8" y="15" width="8" height="6" rx="1.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M12 15V9m0 0H6V4m6 5h6V4" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'bottom',
                            title: 'Hacia abajo',
                            tag: 'Organigrama Descendente',
                            desc: 'Nodo raíz arriba y ramas creciendo verticalmente hacia abajo (Top-Down)',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="8" y="3" width="8" height="6" rx="1.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M12 9v6m0 0H6v5m6-5h6v5" className={active ? 'stroke-blue-500' : 'stroke-slate-400'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'radial',
                            title: 'Radial (Por padre local)',
                            tag: 'Agrupación Local',
                            desc: 'Los nodos hijos se agrupan alrededor de su propio padre sin depender de la raíz',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <circle cx="5" cy="7" r="2" className={active ? 'fill-indigo-400 stroke-indigo-500' : 'fill-slate-300 stroke-slate-400'} />
                                <circle cx="19" cy="7" r="2" className={active ? 'fill-indigo-400 stroke-indigo-500' : 'fill-slate-300 stroke-slate-400'} />
                                <circle cx="12" cy="20" r="2" className={active ? 'fill-indigo-400 stroke-indigo-500' : 'fill-slate-300 stroke-slate-400'} />
                                <path d="M7 8.5L9.5 10.5M17 8.5L14.5 10.5M12 15.5V18" className={active ? 'stroke-blue-400' : 'stroke-slate-300'} />
                              </svg>
                            ),
                          },
                          {
                            id: 'circular',
                            title: 'Circular concéntrico',
                            tag: 'Por Capas',
                            desc: 'Círculo concéntrico a la raíz; los nietos completan el arco asignado a su padre',
                            renderIcon: (active: boolean) => (
                              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="2.5" className={active ? 'fill-blue-500 stroke-blue-600' : 'fill-slate-300 stroke-slate-400'} />
                                <circle cx="12" cy="12" r="6.5" className={active ? 'stroke-blue-400 stroke-dasharray-[2_2]' : 'stroke-slate-300 stroke-dasharray-[2_2]'} />
                                <circle cx="12" cy="12" r="10" className={active ? 'stroke-indigo-400 stroke-dasharray-[2_2]' : 'stroke-slate-200 stroke-dasharray-[2_2]'} />
                                <circle cx="12" cy="5.5" r="1.5" className={active ? 'fill-blue-600 stroke-blue-700' : 'fill-slate-400'} />
                                <circle cx="17.5" cy="15.5" r="1.5" className={active ? 'fill-blue-600 stroke-blue-700' : 'fill-slate-400'} />
                                <circle cx="6.5" cy="15.5" r="1.5" className={active ? 'fill-blue-600 stroke-blue-700' : 'fill-slate-400'} />
                              </svg>
                            ),
                          },
                        ].map((item) => {
                          const isSelected =
                            layout === item.id || (item.id === 'bottom' && layout === 'tree-down');
                          return (
                            <button
                              key={item.id}
                              onClick={() => onUpdateMapLayout(item.id as LayoutType)}
                              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-lg border shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-blue-100/70 border-blue-300 text-blue-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:text-slate-700 group-hover:bg-slate-100'
                                }`}
                              >
                                {item.renderIcon(isSelected)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span
                                    className={`text-xs font-semibold truncate ${
                                      isSelected ? 'text-blue-900' : 'text-slate-800'
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  <span
                                    className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md shrink-0 ${
                                      isSelected
                                        ? 'bg-blue-200/80 text-blue-800 font-semibold'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {item.tag}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  {item.desc}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 self-center">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. TEMA VISUAL */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
                  {/* Collapsible Header */}
                  <button
                    type="button"
                    onClick={() => toggleMapSection('theme')}
                    className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <label className="font-semibold text-slate-800 text-xs block truncate cursor-pointer">
                          Tema Visual del Mapa
                        </label>
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          {currentTheme.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex gap-1">
                        {currentTheme.branchColors.slice(0, 3).map((bc, i) => (
                          <div key={i} style={{ backgroundColor: bc }} className="w-2 h-2 rounded-full" />
                        ))}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          mapSectionsOpen.theme ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Body */}
                  {mapSectionsOpen.theme && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-slate-200/60 animate-in fade-in duration-150">
                      {Object.values(THEMES).map((thm) => (
                        <button
                          key={thm.id}
                          onClick={() => onUpdateMapTheme(thm.id)}
                          className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            currentTheme.id === thm.id
                              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              style={{ backgroundColor: thm.rootBg }}
                              className="w-4 h-4 rounded-full border border-slate-200"
                            />
                            <span className="font-medium text-slate-800 text-xs">{thm.name}</span>
                          </div>
                          <div className="flex gap-1">
                            {thm.branchColors.slice(0, 4).map((bc, i) => (
                              <div key={i} style={{ backgroundColor: bc }} className="w-2.5 h-2.5 rounded-full" />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
