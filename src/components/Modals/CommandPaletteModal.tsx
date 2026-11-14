import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MindMap,
  NodeShape,
  LayoutType,
} from '../../types/mindmap';
import { THEMES } from '../../utils/themes';
import { UiTheme } from '../../utils/uiTheme';
import { ModalBackdrop } from '../atoms/ModalBackdrop';
import {
  Command,
  Search,
  X,
  Plus,
  FolderPlus,
  Trash2,
  Edit3,
  ListTree,
  Sliders,
  Presentation,
  Palette,
  LayoutTemplate,
  Cloud,
  Link,
  Save,
  FolderOpen,
  FileDown,
  FileUp,
  Maximize,
  HelpCircle,
  Undo2,
  Redo2,
  Copy,
  Scissors,
  ClipboardPaste,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Eye,
  FileText,
  RotateCcw,
  History,
  Printer,
  Zap,
  CornerDownLeft,
  Tag,
  Circle,
  Square,
  Hexagon,
  ArrowRight,
  Star,
  Check,
} from 'lucide-react';

export type CommandCategory =
  | 'todos'
  | 'acciones'
  | 'nodos'
  | 'temas'
  | 'layouts'
  | 'formas'
  | 'sombras'
  | 'vistas'
  | 'archivo'
  | 'historial';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: CommandCategory;
  categoryLabel: string;
  icon: React.ReactNode;
  shortcut?: string;
  badge?: string;
  keywords?: string[];
  disabled?: boolean;
  action: () => void;
}

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mindMap: MindMap;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDeleteNode: () => void;
  onToggleFold: () => void;
  onFoldAll: () => void;
  onUnfoldAll: () => void;
  onEditNode: (nodeId?: string) => void;
  onToggleOutline: () => void;
  onToggleToolPanel: () => void;
  onToggleFilterBar: () => void;
  onStartPresentation: (mode?: 'classic' | 'dynamic' | 'elaborate') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenHistoryTimeline?: () => void;
  onOpenTemplates: () => void;
  onOpenSavedMaps: () => void;
  onOpenExportModal: () => void;
  onOpenPdfModal?: () => void;
  onOpenImportModal: () => void;
  onOpenShortcuts: () => void;
  onOpenConnectorModal: () => void;
  onOpenIconPackModal?: () => void;
  onUpdateMapTheme: (themeId: string) => void;
  onUpdateMapLayout: (layout: LayoutType) => void;
  onChangeShape?: (shape: NodeShape) => void;
  onToggleCloud?: () => void;
  onToggleFullscreen?: () => void;
  onResetFormat?: () => void;
  uiTheme?: UiTheme;
  onChangeUiTheme?: (theme: UiTheme) => void;
  onToggleGlobalVisibility?: (key: 'hideAllBodies' | 'hideAllImages' | 'hideAllTags' | 'hideAllIcons' | 'hideAllLinks') => void;
  onToggleNodeShadow?: () => void;
  onToggleEdgeShadow?: () => void;
  onSaveMap?: () => void;
  onNewMap?: () => void;
  onCopyNode?: () => void;
  onCutNode?: () => void;
  onPasteNode?: () => void;
  onRandomizeColors?: () => void;
  onApplyStyleToChildren?: () => void;
  onApplyStyleToSiblings?: () => void;
}

const CATEGORY_TABS: { id: CommandCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'acciones', label: 'Acciones' },
  { id: 'nodos', label: 'Nodos' },
  { id: 'temas', label: 'Temas' },
  { id: 'layouts', label: 'Diseño' },
  { id: 'formas', label: 'Formas' },
  { id: 'sombras', label: 'Sombras' },
  { id: 'vistas', label: 'Vistas' },
  { id: 'archivo', label: 'Archivo' },
];

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  mindMap,
  selectedNodeId,
  onSelectNode,
  onFocusNode,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onToggleFold,
  onFoldAll,
  onUnfoldAll,
  onEditNode,
  onToggleOutline,
  onToggleToolPanel,
  onToggleFilterBar,
  onStartPresentation,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenHistoryTimeline,
  onOpenTemplates,
  onOpenSavedMaps,
  onOpenExportModal,
  onOpenPdfModal,
  onOpenImportModal,
  onOpenShortcuts,
  onOpenConnectorModal,
  onOpenIconPackModal,
  onUpdateMapTheme,
  onUpdateMapLayout,
  onChangeShape,
  onToggleCloud,
  onToggleFullscreen,
  onResetFormat,
  uiTheme,
  onChangeUiTheme,
  onToggleGlobalVisibility,
  onToggleNodeShadow,
  onToggleEdgeShadow,
  onSaveMap,
  onNewMap,
  onCopyNode,
  onCutNode,
  onPasteNode,
  onRandomizeColors,
  onApplyStyleToChildren,
  onApplyStyleToSiblings,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory>('todos');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedCategory('todos');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Construct Map Nodes as searchable commands
  const nodeCommands = useMemo<CommandItem[]>(() => {
    if (!mindMap?.nodes) return [];
    const list = Object.values(mindMap.nodes);
    return list.map((node) => {
      const isRoot = node.id === mindMap.rootId;
      const parent = node.parentId ? mindMap.nodes[node.parentId] : null;
      const childCount = node.children?.length || 0;
      const tagsText = (node.tags || []).map((t) => `#${t}`).join(' ');

      return {
        id: `node-${node.id}`,
        title: node.text?.trim() || (isRoot ? 'Nodo Raíz' : 'Nodo sin título'),
        description: isRoot
          ? `Nodo Central Raíz • ${childCount} ramas principales`
          : `Padre: "${parent?.text || 'Raíz'}" ${childCount > 0 ? `• ${childCount} hijos` : ''} ${tagsText ? `• ${tagsText}` : ''}`,
        category: 'nodos',
        categoryLabel: 'Nodos',
        icon: <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: isRoot ? 'Raíz' : node.tags && node.tags.length > 0 ? `#${node.tags[0]}` : undefined,
        keywords: [
          node.text || '',
          node.note || '',
          ...(node.tags || []),
          node.id,
          isRoot ? 'raiz central root' : '',
        ],
        action: () => {
          onSelectNode(node.id);
          onFocusNode(node.id);
        },
      };
    });
  }, [mindMap, onSelectNode, onFocusNode]);

  // Static commands
  const staticCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // 1. Acciones Rápidas
      {
        id: 'action-add-child',
        title: 'Añadir Nodo Hijo',
        description: 'Crea una nueva rama descendiente del nodo seleccionado',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        shortcut: 'Tab',
        keywords: ['hijo', 'nueva', 'rama', 'insertar', 'child'],
        action: onAddChild,
      },
      {
        id: 'action-add-sibling',
        title: 'Añadir Nodo Hermano',
        description: 'Crea un nuevo nodo al mismo nivel de jerarquía',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <FolderPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        shortcut: 'Enter',
        keywords: ['hermano', 'nivel', 'sibling'],
        action: onAddSibling,
      },
      {
        id: 'action-edit-text',
        title: 'Editar Texto del Nodo',
        description: 'Abre el editor de texto en el nodo seleccionado',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        shortcut: 'F2',
        keywords: ['editar', 'escribir', 'texto', 'renombrar', 'edit'],
        action: () => onEditNode(selectedNodeId || undefined),
      },
      {
        id: 'action-toggle-fold',
        title: 'Plegar / Desplegar Rama',
        description: 'Oculta o expande las ramas del nodo seleccionado',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        shortcut: 'Espacio',
        keywords: ['plegar', 'desplegar', 'colapsar', 'expandir', 'fold', 'unfold'],
        action: onToggleFold,
      },
      {
        id: 'action-delete-node',
        title: 'Eliminar Nodo Seleccionado',
        description: 'Borra el nodo y toda su descendencia',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        shortcut: 'Supr',
        keywords: ['borrar', 'eliminar', 'suprimir', 'quitar', 'delete'],
        action: onDeleteNode,
      },
      {
        id: 'action-copy-node',
        title: 'Copiar Rama del Nodo',
        description: 'Copia el nodo y sus subramas al portapapeles',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        shortcut: 'Ctrl+C',
        keywords: ['copiar', 'copy', 'portapapeles'],
        action: () => onCopyNode?.(),
      },
      {
        id: 'action-cut-node',
        title: 'Cortar Rama del Nodo',
        description: 'Corta el nodo para moverlo a otra ubicación',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Scissors className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        shortcut: 'Ctrl+X',
        keywords: ['cortar', 'cut'],
        action: () => onCutNode?.(),
      },
      {
        id: 'action-paste-node',
        title: 'Pegar Rama del Portapapeles',
        description: 'Pega la rama copiada debajo del nodo seleccionado',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <ClipboardPaste className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        shortcut: 'Ctrl+V',
        keywords: ['pegar', 'paste'],
        action: () => onPasteNode?.(),
      },
      {
        id: 'action-connector',
        title: 'Crear Conector Flotante / Relación',
        description: 'Abre el diseñador de arcos y flechas entre nodos',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Link className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        keywords: ['conector', 'relacion', 'flecha', 'enlace', 'arco', 'linea'],
        action: onOpenConnectorModal,
      },
      {
        id: 'action-cloud',
        title: 'Alternar Nube Envolvente',
        description: 'Activa o desactiva la isla visual sobre el nodo y sus ramas',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Cloud className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
        keywords: ['nube', 'isla', 'grupo', 'agrupacion', 'cloud'],
        action: () => onToggleCloud?.(),
      },
      {
        id: 'action-icons',
        title: 'Abrir Galería de Iconos',
        description: 'Añadir o gestionar emoticonos e insignias en el nodo',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
        keywords: ['icono', 'emoticono', 'emoji', 'badge', 'pack'],
        action: () => onOpenIconPackModal?.(),
      },
      {
        id: 'action-reset-format',
        title: 'Restablecer Formato del Nodo',
        description: 'Vuelve al estilo base limpio eliminando bordes y sombras personalizados',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
        keywords: ['limpiar', 'restablecer', 'formato', 'estilo', 'reset'],
        action: () => onResetFormat?.(),
      },
      {
        id: 'action-randomize-colors',
        title: 'Colores Aleatorios en Ramas',
        description: 'Asigna colores vibrantes automáticos a cada rama principal',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Palette className="w-4 h-4 text-pink-500 dark:text-pink-400" />,
        keywords: ['aleatorio', 'random', 'colores', 'vibrante', 'multicolor'],
        action: () => onRandomizeColors?.(),
      },
      {
        id: 'action-propagate-children',
        title: 'Aplicar Estilo a Todos los Hijos',
        description: 'Propaga forma, colores, bordes y sombras a toda la subrama',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
        keywords: ['propagar', 'hijos', 'estilo', 'heredar'],
        action: () => onApplyStyleToChildren?.(),
      },
      {
        id: 'action-propagate-siblings',
        title: 'Aplicar Estilo a Todos los Hermanos',
        description: 'Propaga el estilo del nodo a sus hermanos del mismo nivel',
        category: 'acciones',
        categoryLabel: 'Acciones',
        icon: <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
        keywords: ['propagar', 'hermanos', 'estilo', 'nivel'],
        action: () => onApplyStyleToSiblings?.(),
      },

      // 2. Formas Geométricas del Nodo
      {
        id: 'shape-bubble',
        title: 'Forma: Bocadillo de Diálogo (Bubble)',
        description: 'Tarjeta con colita anatómica orientable hacia el padre',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <MessageSquareIcon className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
        keywords: ['forma', 'bocadillo', 'bubble', 'dialogo', 'comic'],
        action: () => onChangeShape?.('bubble'),
      },
      {
        id: 'shape-rounded',
        title: 'Forma: Rectángulo Redondeado',
        description: 'Tarjeta moderna con esquinas suaves curvadas',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Square className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        keywords: ['forma', 'redondeado', 'rounded', 'tarjeta'],
        action: () => onChangeShape?.('rectangle'),
      },
      {
        id: 'shape-pill',
        title: 'Forma: Píldora (Cápsula)',
        description: 'Bordes completamente redondeados tipo píldora',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Circle className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        keywords: ['forma', 'pildora', 'capsula', 'pill'],
        action: () => onChangeShape?.('pill'),
      },
      {
        id: 'shape-circle',
        title: 'Forma: Círculo Perfecto',
        description: 'Geometría circular centrada',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Circle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        keywords: ['forma', 'circulo', 'redondo', 'circle'],
        action: () => onChangeShape?.('circle'),
      },
      {
        id: 'shape-oval',
        title: 'Forma: Óvalo Suave',
        description: 'Elipse horizontal estilizada para títulos amplios',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Circle className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        keywords: ['forma', 'ovalo', 'elipse', 'oval'],
        action: () => onChangeShape?.('oval'),
      },
      {
        id: 'shape-hexagon',
        title: 'Forma: Hexágono SVG',
        description: 'Polígono simétrico en punta con relieve angular',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Hexagon className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        keywords: ['forma', 'hexagono', 'poligono', 'hexagon'],
        action: () => onChangeShape?.('hexagon'),
      },
      {
        id: 'shape-arrow',
        title: 'Forma: Flecha Direccional SVG',
        description: 'Puntero direccional para flujos secuenciales',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <ArrowRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        keywords: ['forma', 'flecha', 'arrow', 'flujo'],
        action: () => onChangeShape?.('arrow'),
      },
      {
        id: 'shape-star',
        title: 'Forma: Estrella SVG',
        description: 'Polígono estrellado para ideas centrales o destacadas',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />,
        keywords: ['forma', 'estrella', 'star', 'destacado'],
        action: () => onChangeShape?.('star'),
      },
      {
        id: 'shape-fork',
        title: 'Forma: Subrayado Libre (Fork)',
        description: 'Estilo clásico Freeplane sin caja cerrada ni contenedor',
        category: 'formas',
        categoryLabel: 'Formas',
        icon: <Zap className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
        keywords: ['forma', 'subrayado', 'fork', 'linea', 'clasico'],
        action: () => onChangeShape?.('fork'),
      },

      // 3. Sombras y Efectos
      {
        id: 'shadow-node-toggle',
        title: 'Alternar Sombra del Contorno del Nodo',
        description: 'Activa o desactiva la sombra exterior de la tarjeta o polígono',
        category: 'sombras',
        categoryLabel: 'Sombras',
        icon: <Zap className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
        keywords: ['sombra', 'nodo', 'contorno', 'caja', 'box-shadow', 'drop-shadow'],
        action: () => onToggleNodeShadow?.(),
      },
      {
        id: 'shadow-edge-toggle',
        title: 'Alternar Sombra Global de Aristas',
        description: 'Activa o desactiva el relieve tridimensional en todas las ramas',
        category: 'sombras',
        categoryLabel: 'Sombras',
        icon: <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
        keywords: ['sombra', 'aristas', 'ramas', 'lineas', 'edge-shadow'],
        action: () => onToggleEdgeShadow?.(),
      },

      // 4. Diseños y Layouts
      {
        id: 'layout-standard',
        title: 'Diseño: Estándar Bilateral',
        description: 'Ramas equilibradas automáticamente a izquierda y derecha',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        keywords: ['layout', 'distribucion', 'bilateral', 'estandar', 'horizontal'],
        action: () => onUpdateMapLayout('standard'),
      },
      {
        id: 'layout-balanced',
        title: 'Diseño: Equilibrado Horizontal',
        description: 'Balanceo dinámico por masa de nodos a ambos lados',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
        keywords: ['layout', 'distribucion', 'equilibrado', 'balanceado'],
        action: () => onUpdateMapLayout('balanced-horizontal'),
      },
      {
        id: 'layout-right',
        title: 'Diseño: Árbol Derecho (Right)',
        description: 'Todas las ramas se expanden exclusivamente a la derecha',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        keywords: ['layout', 'derecha', 'arbol', 'right'],
        action: () => onUpdateMapLayout('right'),
      },
      {
        id: 'layout-left',
        title: 'Diseño: Árbol Izquierdo (Left)',
        description: 'Todas las ramas se expanden exclusivamente a la izquierda',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
        keywords: ['layout', 'izquierda', 'arbol', 'left'],
        action: () => onUpdateMapLayout('left'),
      },
      {
        id: 'layout-tree-down',
        title: 'Diseño: Organigrama Descendente (Top-Down)',
        description: 'Jerarquía vertical de arriba hacia abajo para organigramas',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        keywords: ['layout', 'organigrama', 'descendente', 'vertical', 'top-down', 'arbol'],
        action: () => onUpdateMapLayout('tree-down'),
      },
      {
        id: 'layout-top',
        title: 'Diseño: Árbol Ascendente (Top)',
        description: 'Ramas expandidas hacia arriba',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
        keywords: ['layout', 'ascendente', 'arriba', 'top'],
        action: () => onUpdateMapLayout('top'),
      },
      {
        id: 'layout-radial',
        title: 'Diseño: Radial 360°',
        description: 'Distribución circular centrada en todos los ángulos',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        keywords: ['layout', 'radial', 'circular', '360', 'redondo'],
        action: () => onUpdateMapLayout('radial'),
      },
      {
        id: 'layout-circular',
        title: 'Diseño: Anillo Circular',
        description: 'Nodos dispuestos en órbitas concéntricas limpias',
        category: 'layouts',
        categoryLabel: 'Diseño',
        icon: <LayoutTemplate className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
        keywords: ['layout', 'circular', 'orbita', 'anillo'],
        action: () => onUpdateMapLayout('circular'),
      },

      // 5. Vistas, Paneles y Enfoque
      {
        id: 'view-presentation-dynamic',
        title: 'Iniciar Presentación Dinámica (Vuelo Cinemático)',
        description: 'Vuelo cinemático fluido con enfoque 1:1 ultra-nítido',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Presentation className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        shortcut: 'F5',
        keywords: ['presentar', 'presentacion', 'f5', 'diapositivas', 'vuelo', 'animacion'],
        action: () => onStartPresentation('dynamic'),
      },
      {
        id: 'view-presentation-classic',
        title: 'Iniciar Presentación Clásica',
        description: 'Diapositivas ordenadas con navegación secuencial',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Presentation className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        keywords: ['presentacion', 'clasica', 'slides'],
        action: () => onStartPresentation('classic'),
      },
      {
        id: 'view-presentation-elaborate',
        title: 'Iniciar Presentación Elaborada (Prezi Espacial)',
        description: 'Navegación espacial por marcos y transiciones libres',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Presentation className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
        keywords: ['presentacion', 'prezi', 'elaborada', 'espacial'],
        action: () => onStartPresentation('elaborate'),
      },
      {
        id: 'view-toggle-outline',
        title: 'Alternar Panel de Esquema (Outline)',
        description: 'Muestra u oculta el árbol de esquema jerárquico lateral',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <ListTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        shortcut: 'Alt+O',
        keywords: ['esquema', 'outline', 'arbol', 'panel', 'lateral'],
        action: onToggleOutline,
      },
      {
        id: 'view-toggle-toolpanel',
        title: 'Alternar Panel de Propiedades y Formato',
        description: 'Abre o cierra el panel lateral derecho de personalización',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        shortcut: 'Alt+P',
        keywords: ['propiedades', 'formato', 'herramientas', 'panel', 'toolpanel'],
        action: onToggleToolPanel,
      },
      {
        id: 'view-toggle-filterbar',
        title: 'Alternar Barra de Búsqueda y Filtros',
        description: 'Busca nodos y filtra por #etiquetas o estados',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Search className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
        shortcut: 'Ctrl+F',
        keywords: ['buscar', 'filtrar', 'search', 'filter', 'tags'],
        action: onToggleFilterBar,
      },
      {
        id: 'view-toggle-fullscreen',
        title: 'Alternar Pantalla Completa',
        description: 'Maximiza el lienzo a toda la pantalla del monitor',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Maximize className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        shortcut: 'F11',
        keywords: ['pantalla', 'completa', 'fullscreen', 'maximizar'],
        action: () => onToggleFullscreen?.(),
      },
      {
        id: 'view-fold-all',
        title: 'Plegar Todas las Ramas del Mapa',
        description: 'Colapsa todos los nodos mostrando solo la raíz',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Zap className="w-4 h-4 text-purple-500 dark:text-purple-400" />,
        keywords: ['plegar', 'colapsar', 'todo', 'ramas'],
        action: onFoldAll,
      },
      {
        id: 'view-unfold-all',
        title: 'Desplegar Todas las Ramas del Mapa',
        description: 'Expande completamente todo el mapa mental',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        keywords: ['desplegar', 'expandir', 'todo', 'ramas'],
        action: onUnfoldAll,
      },
      {
        id: 'view-toggle-bodies',
        title: 'Modo Enfoque: Ocultar / Mostrar Cuerpos de Texto',
        description: 'Alterna la visibilidad global de las explicaciones detalladas',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        keywords: ['enfoque', 'cuerpos', 'texto', 'notas', 'visibilidad'],
        action: () => onToggleGlobalVisibility?.('hideAllBodies'),
      },
      {
        id: 'view-toggle-images',
        title: 'Modo Enfoque: Ocultar / Mostrar Imágenes Adjuntas',
        description: 'Alterna la visibilidad global de las fotos e ilustraciones',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        keywords: ['enfoque', 'imagenes', 'fotos', 'visibilidad'],
        action: () => onToggleGlobalVisibility?.('hideAllImages'),
      },
      {
        id: 'view-toggle-tags',
        title: 'Modo Enfoque: Ocultar / Mostrar Etiquetas #Tags',
        description: 'Alterna la visibilidad de los chips de etiquetas en nodos',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        keywords: ['enfoque', 'tags', 'etiquetas', 'visibilidad'],
        action: () => onToggleGlobalVisibility?.('hideAllTags'),
      },
      {
        id: 'view-toggle-icons',
        title: 'Modo Enfoque: Ocultar / Mostrar Iconos de Nodos',
        description: 'Alterna la visibilidad de los emoticonos e insignias',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        keywords: ['enfoque', 'iconos', 'emojis', 'visibilidad'],
        action: () => onToggleGlobalVisibility?.('hideAllIcons'),
      },
      {
        id: 'view-toggle-links',
        title: 'Modo Enfoque: Ocultar / Mostrar Insignias de Enlaces',
        description: 'Alterna la visibilidad de los accesos directos a URLs',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Link className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
        keywords: ['enfoque', 'enlaces', 'links', 'visibilidad'],
        action: () => onToggleGlobalVisibility?.('hideAllLinks'),
      },

      // 6. Tema de la Interfaz (UI Theme)
      {
        id: 'ui-theme-claro',
        title: 'Tema de Interfaz: Claro',
        description: 'Fondo blanco puro y controles nítidos de alto contraste',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Sun className="w-4 h-4 text-amber-500" />,
        badge: uiTheme === 'claro' ? 'Activo' : undefined,
        keywords: ['ui', 'interfaz', 'claro', 'light'],
        action: () => onChangeUiTheme?.('claro'),
      },
      {
        id: 'ui-theme-oscuro',
        title: 'Tema de Interfaz: Modo Oscuro',
        description: 'Gris pizarra y tonos nocturnos para descanso visual',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Moon className="w-4 h-4 text-indigo-400" />,
        badge: uiTheme === 'oscuro' ? 'Activo' : undefined,
        keywords: ['ui', 'interfaz', 'oscuro', 'dark'],
        action: () => onChangeUiTheme?.('oscuro'),
      },
      {
        id: 'ui-theme-sepia',
        title: 'Tema de Interfaz: Sepia Cálido',
        description: 'Tonos apergaminados y cálidos para lectura relajada',
        category: 'vistas',
        categoryLabel: 'Vistas',
        icon: <Coffee className="w-4 h-4 text-amber-700 dark:text-amber-500" />,
        badge: uiTheme === 'sepia' ? 'Activo' : undefined,
        keywords: ['ui', 'interfaz', 'sepia', 'papel', 'calido'],
        action: () => onChangeUiTheme?.('sepia'),
      },

      // 7. Archivo, Guardado y Exportación
      {
        id: 'file-save',
        title: 'Guardar Mapa Actual en el Navegador',
        description: 'Almacena una copia permanente en el almacenamiento local',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        shortcut: 'Ctrl+S',
        keywords: ['guardar', 'save', 'almacenar', 'localstorage'],
        action: () => onSaveMap?.(),
      },
      {
        id: 'file-saved-maps',
        title: 'Administrador de Mapas Guardados',
        description: 'Explora, abre o renombra tus mapas mentales guardados',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        keywords: ['abrir', 'mapas', 'guardados', 'gestor', 'recientes'],
        action: onOpenSavedMaps,
      },
      {
        id: 'file-templates',
        title: 'Galería de Plantillas de Mapas',
        description: 'Comienza desde modelos profesionales prediseñados',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
        keywords: ['plantillas', 'templates', 'modelos', 'ejemplos'],
        action: onOpenTemplates,
      },
      {
        id: 'file-pdf-export',
        title: 'Exportar a PDF Vectorial (Póster / Mosaico)',
        description: 'Impresión vectorial de alta resolución en A4, A3, Letter o mosaico multipágina',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        keywords: ['pdf', 'imprimir', 'vectorial', 'poster', 'mosaico', 'impresion', 'print'],
        action: () => onOpenPdfModal?.(),
      },
      {
        id: 'file-export',
        title: 'Exportar Mapa (HTML, Freeplane .mm, PNG, SVG)',
        description: 'Descarga tu mapa como archivo interactivo o vectorial',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        keywords: ['exportar', 'html', 'freeplane', 'freemind', 'png', 'svg', 'mm', 'descargar'],
        action: onOpenExportModal,
      },
      {
        id: 'file-import',
        title: 'Importar Archivo Freeplane / Freemind (.mm)',
        description: 'Carga un mapa existente desde tu computadora',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <FileUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        keywords: ['importar', 'cargar', 'abrir', 'archivo', 'mm', 'xml'],
        action: onOpenImportModal,
      },
      {
        id: 'file-shortcuts',
        title: 'Ver Todos los Atajos de Teclado',
        description: 'Guía de referencia rápida de teclas de acceso rápido',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <HelpCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
        shortcut: '?',
        keywords: ['atajos', 'teclado', 'shortcuts', 'ayuda', 'help'],
        action: onOpenShortcuts,
      },
      {
        id: 'file-new',
        title: 'Crear Nuevo Mapa en Blanco',
        description: 'Comienza un nuevo mapa mental desde cero',
        category: 'archivo',
        categoryLabel: 'Archivo',
        icon: <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        keywords: ['nuevo', 'mapa', 'blanco', 'limpio', 'new'],
        action: () => onNewMap?.(),
      },

      // 8. Historial
      {
        id: 'history-undo',
        title: 'Deshacer Última Acción',
        description: 'Revierte el último cambio realizado en el mapa',
        category: 'historial',
        categoryLabel: 'Historial',
        icon: <Undo2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        shortcut: 'Ctrl+Z',
        disabled: !canUndo,
        keywords: ['deshacer', 'undo', 'revertir', 'atras'],
        action: onUndo,
      },
      {
        id: 'history-redo',
        title: 'Rehacer Acción Deshecha',
        description: 'Vuelve a aplicar el cambio revertido',
        category: 'historial',
        categoryLabel: 'Historial',
        icon: <Redo2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
        shortcut: 'Ctrl+Y',
        disabled: !canRedo,
        keywords: ['rehacer', 'redo', 'adelante'],
        action: onRedo,
      },
      {
        id: 'history-timeline',
        title: 'Línea de Tiempo del Historial de Versiones',
        description: 'Explora y restaura cualquiera de los 40 niveles de cambios del mapa',
        category: 'historial',
        categoryLabel: 'Historial',
        icon: <History className="w-4 h-4 text-indigo-500" />,
        shortcut: 'Ctrl+Shift+H',
        keywords: ['historial', 'versiones', 'timeline', 'cambios', 'restaurar', 'tiempo', 'undo', 'redo'],
        action: () => onOpenHistoryTimeline?.(),
      },
    ];

    // Append all map themes
    Object.values(THEMES).forEach((t) => {
      list.push({
        id: `theme-${t.id}`,
        title: `Tema del Mapa: ${t.name}`,
        description: `Fondo ${t.background} • Acento principal ${t.branchColors[0]}`,
        category: 'temas',
        categoryLabel: 'Temas',
        icon: (
          <span
            className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"
            style={{ backgroundColor: t.branchColors[0] || t.rootBg }}
          />
        ),
        badge: mindMap?.themeId === t.id ? 'Activo' : undefined,
        keywords: ['tema', 'color', 'estilo', 'paleta', t.name.toLowerCase(), t.id],
        action: () => onUpdateMapTheme(t.id),
      });
    });

    return list;
  }, [
    selectedNodeId,
    mindMap,
    canUndo,
    canRedo,
    uiTheme,
    onAddChild,
    onAddSibling,
    onEditNode,
    onToggleFold,
    onDeleteNode,
    onCopyNode,
    onCutNode,
    onPasteNode,
    onOpenConnectorModal,
    onToggleCloud,
    onOpenIconPackModal,
    onResetFormat,
    onRandomizeColors,
    onApplyStyleToChildren,
    onApplyStyleToSiblings,
    onChangeShape,
    onToggleNodeShadow,
    onToggleEdgeShadow,
    onUpdateMapLayout,
    onStartPresentation,
    onToggleOutline,
    onToggleToolPanel,
    onToggleFilterBar,
    onToggleFullscreen,
    onFoldAll,
    onUnfoldAll,
    onToggleGlobalVisibility,
    onChangeUiTheme,
    onSaveMap,
    onOpenSavedMaps,
    onOpenTemplates,
    onOpenExportModal,
    onOpenPdfModal,
    onOpenImportModal,
    onOpenShortcuts,
    onNewMap,
    onUndo,
    onRedo,
    onUpdateMapTheme,
  ]);

  // Combine and filter commands based on query and selected category
  const filteredCommands = useMemo<CommandItem[]>(() => {
    let cleanQuery = query.trim().toLowerCase();
    let isCommandOnly = false;
    let isNodeOnly = false;

    // Special prefix syntax support:
    // ">" filters all commands/actions (excludes map nodes)
    // "@" filters map nodes only
    // "#" filters by tags or text
    if (cleanQuery.startsWith('>')) {
      isCommandOnly = true;
      cleanQuery = cleanQuery.substring(1).trim();
    } else if (cleanQuery.startsWith('@')) {
      isNodeOnly = true;
      cleanQuery = cleanQuery.substring(1).trim();
    }

    const all = [...nodeCommands, ...staticCommands];

    return all.filter((cmd) => {
      // Prefix filter check
      if (isCommandOnly && cmd.category === 'nodos') {
        return false;
      }
      if (isNodeOnly && cmd.category !== 'nodos') {
        return false;
      }
      if (selectedCategory !== 'todos' && cmd.category !== selectedCategory) {
        return false;
      }

      if (!cleanQuery) return true;

      // Fuzzy / keyword match
      const titleMatch = cmd.title.toLowerCase().includes(cleanQuery);
      const descMatch = cmd.description ? cmd.description.toLowerCase().includes(cleanQuery) : false;
      const catMatch = cmd.categoryLabel.toLowerCase().includes(cleanQuery);
      const keywordMatch = cmd.keywords
        ? cmd.keywords.some((k) => k.toLowerCase().includes(cleanQuery))
        : false;

      return titleMatch || descMatch || catMatch || keywordMatch;
    });
  }, [nodeCommands, staticCommands, query, selectedCategory]);

  // Auto-scroll the active item into view
  useEffect(() => {
    if (filteredCommands.length > 0 && selectedIndex >= 0) {
      const activeEl = rowRefs.current[selectedIndex];
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredCommands.length]);

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Keyboard navigation inside the palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current && !current.disabled) {
        current.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleExecuteCommand = (cmd: CommandItem) => {
    if (cmd.disabled) return;
    cmd.action();
    onClose();
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="2xl" className="overflow-hidden">
      <div className="flex flex-col h-[560px] max-h-[85vh] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 select-none">
        {/* Spotlight Search Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <Command className="w-5 h-5" />
          </div>
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-0 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un comando o busca nodos... (ej. tema, hijo, sombra, #tag)"
              className="w-full pl-7 pr-7 py-1 text-sm bg-transparent outline-none font-medium placeholder:text-slate-400 placeholder:font-normal"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Category Pills Bar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs bg-slate-50/30 dark:bg-slate-900/30">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 focus:outline-none"
        >
          {filteredCommands.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
              <Sparkles className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                No se encontraron comandos ni nodos
              </p>
              <p className="text-xs mt-1 text-slate-400">
                Prueba con términos como <span className="font-mono text-blue-500">hijo</span>,{' '}
                <span className="font-mono text-blue-500">tema</span>,{' '}
                <span className="font-mono text-blue-500">sombra</span>, o el texto de un nodo del mapa.
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  ref={(el) => {
                    rowRefs.current[idx] = el;
                  }}
                  onClick={() => handleExecuteCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  disabled={cmd.disabled}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                  } ${cmd.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected
                              ? 'text-blue-900 dark:text-blue-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {cmd.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden md:inline">
                      {cmd.categoryLabel}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 rounded">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Status & Keyboard Navigation Guide */}
        <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">↵</kbd>
              <span>Ejecutar</span>
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">ESC</kbd>
              <span>Cerrar</span>
            </span>
          </div>
          <div className="font-medium text-[11px] text-slate-400">
            {filteredCommands.length} {filteredCommands.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
};

// Simple MessageSquareIcon helper
const MessageSquareIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
