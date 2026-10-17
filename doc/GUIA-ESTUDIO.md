# 📘 GUÍA DE ESTUDIO COMPLETA — FreeMind Map Studio

> Capacitación de programadores novatos: qué hace cada parte y cada función, con código comentado.
> Orden: fundamentos → estado → persistencia/temas → layout → conversores → iconos → componentes → lienzo/presentación.

---

# 📘 Guía de Estudio — FreeMind Map Studio (Parte 1: Fundamentos y Tipos)

> Guía para programadores novatos. Lee en orden: cada archivo se explica
> antes de mostrar su código, función por función.

---

## 1. ¿Qué es este proyecto?

**FreeMind Map Studio** es un editor de mapas mentales que funciona 100%
en el navegador, sin servidores ni internet. Todo se guarda en
`localStorage` (un almacén clave→valor que el navegador guarda en tu disco).

**Tecnologías (el vocabulario mínimo):**

| Tecnología | Qué es (analogía) |
|---|---|
| React 19 | Biblioteca para construir la interfaz con piezas reutilizables llamadas *componentes*. Cada componente es una función que devuelve lo que se ve en pantalla. |
| TypeScript 5.8 | JavaScript con *tipos*: describes qué forma tienen los datos (`string`, `number`, objetos) y el editor te avisa de errores antes de ejecutar. |
| Vite 6 | Herramienta que arranca el servidor de desarrollo y empaqueta la app para producción. |
| Tailwind CSS v4 | Estilos con clases utilitarias en el HTML (`bg-blue-600`, `rounded-xl`) en vez de archivos CSS separados. |
| Zustand 5 | Cajón central donde vive el estado (los datos) de la app. Cualquier componente puede leerlo y pedir cambios. |
| Vitest 4 | Corredor de pruebas: ejecuta archivos `.test.ts` que comprueban que las funciones hacen lo esperado. |

**Comandos (siempre con `pnpm`, nunca `npm`):**

```bash
pnpm install   # descarga las dependencias (solo la primera vez)
pnpm dev       # arranca en http://localhost:3000
pnpm lint      # revisa tipos con tsc --noEmit (debe salir exit 0)
pnpm test      # corre todos los tests (en Windows: pnpm test:regression)
pnpm build     # genera la versión optimizada en dist/
```

---

## 2. Punto de entrada: `index.html` → `src/main.tsx`

El navegador abre `index.html`, que tiene un `<div id="root">` vacío y carga
`/src/main.tsx`. Ese archivo "planta" la aplicación React dentro del div:

```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- `createRoot(...).render(...)`: le dice a React "dibuja `<App/>` aquí".
- `StrictMode`: modo de ayuda en desarrollo que detecta malas prácticas.
- `import './index.css'`: carga Tailwind + utilidades globales.

`src/App.tsx` es el **orquestador**: lee el store Zustand, calcula el tema
y el filtro, y reparte todo en el template `MainEditorLayout`
(menuBar, toolBar, filterBar, canvas, toolPanel, outlineView, statusBar,
presentationOverlay, modals). Su estado local solo guarda qué modales
están abiertos y qué `presentationType` (`'classic' | 'dynamic' |
'elaborate'`) está activo.

---

## 3. Los tipos: `src/types/mindmap.ts` (el diccionario del proyecto)

> Regla de oro: **todos los tipos viven aquí**. Si necesitas la forma de
> un dato, impórtala de este archivo; jamás la redefinas en otro lado.

```ts
export type NodeShape =
  | 'bubble'      // caja redondeada (la forma por defecto)
  | 'fork'        // solo subrayado, estilo Freeplane clásico
  | 'rectangle'   // bordes rectos
  | 'square'      // 1:1 simétrico
  | 'oval'        // elipse
  | 'circle'      // círculo perfecto
  | 'hexagon'     // polígono SVG de 6 lados
  | 'pill'        // cápsula totalmente redondeada
  | 'arrow'       // flecha de flujo
  | 'star';       // estrella de 5 puntas

export type EdgeStyle = 'bezier' | 'linear' | 'sharp' | 'horizontal' | 'hidden';
// bezier = curva suave (defecto) · linear = recta · sharp = ángulos en L
// horizontal = sale horizontal y baja · hidden = sin línea

export type EdgeProfile = 'uniform' | 'tapered' | 'spindle' | 'hourglass';
// Perfil de GROSOR de la arista: uniforme, cónica, huso o reloj de arena.

export type LayoutType =
  | 'standard'             // bifurcado clásico izq/der
  | 'balanced-horizontal'  // reparte arriba/abajo de forma codiciosa
  | 'left' | 'right'       // todo a un lado (+X / -X)
  | 'top' | 'bottom'       // todo arriba/abajo (+Y / -Y)
  | 'tree-down'            // organigrama descendente
  | 'radial'               // anillos concéntricos por ángulo
  | 'circular';            // hijos en el perímetro de la raíz

export type NodeSide = 'left' | 'right' | 'root' | 'bottom' | 'top' | 'radial' | 'circular';

export type CloudShape =
  | 'arc' | 'rectangle' | 'round-rectangle' | 'star'
  | 'cloud-scallop' | 'bubble' | 'hexagon' | 'oval';
// Formas de la nube que envuelve visualmente un sub-árbol.
```

### `NodeCloud` — la nube de agrupación

```ts
export interface NodeCloud {
  enabled: boolean;      // ¿se dibuja o no?
  color: string;         // color base
  shape: CloudShape;     // una de las 8 de arriba
  opacity?: number;      // 0 a 1 (el ? = opcional)
  bgType?: 'color' | 'gradient' | 'pattern' | 'image';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: NodeGradientDirection;
  cloudPattern?: NodePatternStyle;   // trama dentro de la nube
  cloudPatternColor?: string;
  cloudPatternSize?: number;
  cloudPatternOpacity?: number;
  bgImageUrl?: string;               // imagen de fondo recortada a la nube
  bgImageMode?: NodeBgImageMode;
  bgImageOpacity?: number;
  paddingX?: number;  // margen extra horizontal (UI: slider -50 a +200, CloudsTab)
  paddingY?: number;  // margen extra vertical
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  shadow?: boolean;
}
```

### `MindNode` — el nodo (la pieza central de todo)

```ts
export interface MindNode {
  id: string;                 // identificador único, ej. 'node-1718...'
  text: string;               // título visible
  parentId: string | null;    // id del padre; null = es la raíz
  children: string[];         // ids de hijos EN ORDEN (el orden importa)
  folded?: boolean;           // true = rama plegada (hijos ocultos)
  side?: NodeSide;            // a qué lado cae respecto a su padre

  // Estilo visual (todo opcional: si falta, manda el tema)
  shape?: NodeShape;
  customWidth?: number;       // 0/vacío = automático al contenido
  customHeight?: number;
  color?: string;             // fondo (si falta: color del tema)
  bgType?: NodeBackgroundType; // 'color' | 'transparent' | 'gradient' | 'pattern' | 'image'
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: NodeGradientDirection; // 'to-r' | 'to-b' | 'to-br' | 'radial'
  nodePattern?: NodePatternStyle;            // 7 tramas
  nodePatternColor?: string;
  nodePatternSize?: number;
  nodePatternOpacity?: number;
  bgImageUrl?: string;        // fondo con imagen (URL o DataURL)
  bgImageMode?: NodeBgImageMode; // 'fit' | 'cover' | 'contain' | 'tile'
  bgImageOpacity?: number;
  borderColor?: string;
  borderWidth?: number;       // 0–8px
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // Imagen de CONTENIDO (distinta del fondo): foto dentro del nodo
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'between' | 'background' | 'fit';

  // Tipografía del título
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Cuerpo (subtexto bajo el título, con su propia tipografía)
  body?: string;
  bodyFontSize?: number;
  bodyBold?: boolean;
  bodyItalic?: boolean;
  bodyColor?: string;
  bodyFontFamily?: string;
  bodyAlign?: 'left' | 'center' | 'right';

  // Arista propia hacia sus hijos (si falta, manda la del mapa)
  edgeColor?: string;
  edgeStyle?: EdgeStyle;
  edgeWidth?: number;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile;

  // Metadatos
  icons?: string[];        // ids de iconos (iconMap / vectorIconPack)
  iconPosition?: 'left' | 'top';
  iconColor?: string;
  iconSize?: number;
  tags?: string[];         // etiquetas para filtrar
  progress?: number;       // 0 a 100
  progressPosition?: 'left' | 'top';
  link?: string;           // URL, mailto: o #nodeId
  note?: string;           // nota Markdown enriquecida
  showNoteInline?: boolean; // true = nota visible bajo el cuerpo (sin tooltip)
  details?: string;

  // Interruptores "ojo": ocultan partes en el lienzo sin borrarlas
  hideBody?: boolean;
  hideImage?: boolean;
  hideTags?: boolean;
  hideIcons?: boolean;
  hideLink?: boolean;
  hideProgress?: boolean;

  // Nodo libre flotante (post-it): ignora el layout automático
  isFreeFloating?: boolean;
  freePosition?: { x: number; y: number };

  cloud?: NodeCloud;       // agrupación visual (ver arriba)
}
```

### `Connector` — flecha flotante entre dos nodos cualesquiera

```ts
export interface Connector {
  id: string;
  fromId: string;   // origen
  toId: string;     // destino
  fromNodeId?: string; // alias legacy (importaciones viejas)
  toNodeId?: string;
  label?: string;   // etiqueta en el punto medio
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  arrow?: 'start' | 'end' | 'both' | 'none'; // puntas de flecha
  curvature?: number;  // -50 por defecto; + controlPoint manual
  shape?: 'curved' | 'bezier' | 'straight' | 'step';
  width?: number;
  controlPoint?: { x: number; y: number }; // arrastrable en el lienzo
  layer?: 'above' | 'below'; // ¿encima o debajo de los nodos?
  opacity?: number;
}
```

### `MindMap` — el documento completo

```ts
export interface MindMap {
  id: string;
  title: string;
  rootId: string;              // id del nodo raíz
  nodes: Record<string, MindNode>; // TODOS los nodos por id (acceso O(1))
  connectors: Connector[];
  layout: LayoutType;
  themeId: string;             // clave de THEMES (themes.ts)
  // Fondo del lienzo (si se define, pisa al del tema):
  backgroundColor?: string;
  backgroundPattern?: BackgroundPatternStyle; // 'none'|'dots'|'lines'|'squares'|'triangles'|'hexagons'
  backgroundPatternColor?: string;
  backgroundPatternSize?: number;
  backgroundPatternOpacity?: number;
  // Aristas globales (pisan a las de cada nodo si existen):
  edgeStyle?: EdgeStyle;
  edgeWidth?: number;
  edgeColor?: string;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile;
  horizontalGap?: number;  // separación por defecto 54
  verticalGap?: number;    // separación por defecto 14
  // Modo enfoque: oculta categorías enteras sin borrarlas
  hideAllBodies?: boolean;
  hideAllImages?: boolean;
  hideAllTags?: boolean;
  hideAllIcons?: boolean;
  hideAllLinks?: boolean;
  showAllNotesInline?: boolean;
  presentationSlides?: SlideFrame[];      // presentación dinámica
  elaborateSlides?: SpatialSlideCard[];   // presentación 3D
  createdAt: number;
  updatedAt: number;
}
```

> 💡 **Idea clave para novatos:** el mapa es un *árbol guardado como
> diccionario*. Cada nodo sabe quién es su padre (`parentId`) y quiénes
> sus hijos (`children`). Para dibujar, el motor recorre desde `rootId`.
> Los `slides` de presentación viven DENTRO del mapa: se guardan solos.

---

*Continúa en Parte 2: el store Zustand (estado, historial, portapapeles).*


# 📘 Guía de Estudio — Parte 2: Estado global con Zustand

## 1. ¿Qué es Zustand y por qué un store?

Imagina que cada componente guardara su propia copia del mapa: al editar
un nodo, el lienzo, el esquema y el inspector se desincronizarían. Zustand
resuelve esto con **una sola fuente de verdad**: un objeto `mindMap` que
vive en `src/hooks/useMindMapStore.ts`. Los componentes se *suscriben*
(`const store = useMindMapStore()`) y React los re-dibuja cuando cambia.

**Regla de oro: inmutabilidad.** Nunca se modifica el mapa existente; cada
acción crea un objeto NUEVO (`{...mindMap, nodes: {...}}`). Así el historial
de deshacer funciona guardando fotos pasadas, y React detecta cambios
comparando referencias (rápido).

```ts
import { create } from 'zustand';
import { MindMap, MindNode, Connector, EdgeStyle, EdgeProfile,
  LayoutType, BackgroundPatternStyle, FilterOptions } from '../types/mindmap';
import { BLANK_MAP, TUTORIAL_MAP } from '../utils/sampleMaps';
import { loadCurrentMap, saveCurrentMap } from '../utils/storage';

interface MindMapStore {
  mindMap: MindMap;                    // el documento (única verdad)
  historyPast: MindMap[];              // pila deshacer (máx 41 fotos)
  historyFuture: MindMap[];            // pila rehacer
  selectedNodeId: string | null;       // nodo con anillo azul
  editingNodeId: string | null;        // nodo con textarea abierto
  focusTarget: { nodeId: string; timestamp: number } | null; // "vuela" la cámara ahí
  isOutlineOpen: boolean;              // panel esquema visible
  isOutlineFullscreen: boolean;        // esquema a pantalla completa
  isPresentationMode: boolean;         // presentación activa
  isToolPanelOpen: boolean;            // inspector visible (default true)
  isFilterBarOpen: boolean;            // barra Ctrl+F visible
  filterOptions: FilterOptions;        // { query, showAncestors, showDescendants, ... }
  clipboard: {                         // portapapeles interno
    node: MindNode;                    // raíz copiada
    subNodes: Record<string, MindNode>; // subárbol completo
    isCut: boolean;
  } | null;

  // Setters: aceptan valor directo O función actualizadora
  setMindMap: (mapOrUpdater: MindMap | ((prev: MindMap) => MindMap)) => void;
  setSelectedNodeId: (id: string | null) => void;
  // ... (setEditingNodeId, setFocusTarget, setIsOutlineOpen, etc. igual)
  setFilterOptions: (optionsOrUpdater: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void;

  pushHistory: (map: MindMap) => void; // foto al pasado + limpia futuro
  handleUndo: () => void;
  handleRedo: () => void;

  updateNode: (nodeId: string, updates: Partial<MindNode>) => void; // fusión parcial
  handleAddChild: (parentId?: string) => void;    // Tab: balancea left/right en raíz,
                                                  // id `node-Date.now()`, unfold + select + edit
  handleAddSibling: (siblingId?: string) => void; // Enter: inserta tras el índice,
                                                  // hereda side/shape (en raíz delega a hijo)
  handleDeleteNode: (nodeIdToDelete?: string) => void; // borra subárbol+conectores, VETO a raíz
  handleToggleFold: (nodeId?: string) => void;    // pliega solo si tiene hijos
  handleFoldAll: () => void;      // pliega todo MENOS la raíz
  handleUnfoldAll: () => void;
  handleReparentNode: (draggedId: string, targetParentId: string) => void;
  //   drag&drop con guard anti-ciclo isDescendant + veto a raíz;
  //   al soltar en raíz conserva side, si no hereda el del destino
  handleCopyNode: (nodeId?: string) => void;  // foto del subárbol al clipboard
  handleCutNode: (nodeId?: string) => void;   // = copy + delete (isCut queda false: copia y borra)
  handlePasteNode: (targetParentId?: string) => void; // clona con IDs `node-Date-rand`,
                                                      // side = destino, selecciona el clon
  handleApplyStyleToChildren: (nodeId?: string) => void; // cascada recursiva
  handleApplyStyleToSiblings: (nodeId?: string) => void; // solo hermanos (no a sí mismo)
  handleApplyIconsToChildren?: (nodeId?: string) => void; // SOLO iconos/color/tamaño
  handleApplyIconsToSiblings?: (nodeId?: string) => void;
  handleRandomizeEdgeColors: () => void; // 24 colores vibrantes, raíz sin color
}
```

### Detalles que debes notar (trampas típicas)

- `pushHistory` guarda `[...past.slice(-40), current]` → tope real de **41** fotos. Cada mutación llama primero a `pushHistory(mindMap)` y limpia `future`.
- `handleUndo` mueve `present` a `future` y restaura la última de `past`; `handleRedo` al revés. Ambas auto-guardan en `localStorage`.
- `updateNode` IGNORA silenciosamente ids inexistentes (`if (!existing) return`).
- `handleAddChild` usa `Date.now()` como id: dos clics en el mismo milisegundo colisionarían (en la práctica no ocurre por el ritmo humano).
- `handleCutNode` = copiar + borrar (el clipboard queda con `isCut: false` aunque se llame "cut").
- `handleFoldAll` excluye la raíz a propósito (plegarla vaciaría el lienzo).
- `handleReparentNode` rechaza: soltarse sobre sí mismo, mover la raíz, y soltar un nodo dentro de su propio descendiente (evita ciclos infinitos).
- `handleRandomizeEdgeColors` mezcla la paleta con `sort(() => Math.random() - 0.5)` y deja la raíz sin color + `edgeColor: undefined` global (activa modo multicolor).

```ts
// Arranca cargando lo guardado (o el tutorial si no hay nada válido)
export const useMindMapStore = create<MindMapStore>((set, get) => {
  const initialMap = loadCurrentMap();
  return {
    mindMap: initialMap,
    historyPast: [],
    historyFuture: [],
    selectedNodeId: initialMap.rootId,
    editingNodeId: null,
    focusTarget: null,
    isOutlineOpen: false,
    isOutlineFullscreen: false,
    isPresentationMode: false,
    isToolPanelOpen: true,
    isFilterBarOpen: false,
    filterOptions: { query: '', showAncestors: true, showDescendants: true },
    clipboard: null,
    // ... todas las acciones de arriba viven aquí dentro
  };
});
```

> 💡 `set` escribe estado, `get` lo lee. Las acciones se llaman como
> `useMindMapStore.getState().handleAddChild('root')` (así lo hacen los tests).

---

## 2. `useSearchFilter.ts` — filtro acumulativo (completo, 51 líneas)

```ts
import { useMemo } from 'react';
import { MindMap, MindNode, FilterOptions } from '../types/mindmap';

export function useSearchFilter(mindMap: MindMap, filterOptions: FilterOptions) {
  // useMemo = "recalcula solo si cambian estas dependencias"
  const searchMatches = useMemo(() => {
    // Sin filtros activos devuelve undefined (= "todo visible")
    if (!filterOptions.query && !filterOptions.tag && filterOptions.minProgress === undefined) {
      return undefined;
    }
    const matches = new Set<string>();           // Set evita duplicados
    const q = filterOptions.query.toLowerCase().trim();
    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      let isMatch = true;                        // parte optimista, cada filtro puede vetar
      if (q && !n.text.toLowerCase().includes(q) && !(n.note && n.note.toLowerCase().includes(q))) {
        isMatch = false;                         // busca en título Y en nota
      }
      if (filterOptions.tag && (!n.tags || !n.tags.includes(filterOptions.tag))) {
        isMatch = false;                         // tag debe coincidir EXACTO
      }
      if (filterOptions.minProgress !== undefined &&
        (n.progress === undefined || n.progress < filterOptions.minProgress)) {
        isMatch = false;                         // sin progreso = excluido
      }
      if (isMatch) matches.add(n.id);
    });
    return matches;
  }, [mindMap.nodes, filterOptions]);

  // Tags existentes en todo el mapa (para el desplegable del FilterBar)
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    (Object.values(mindMap.nodes) as MindNode[]).forEach((n) => {
      n.tags?.forEach((t) => set.add(t));         // ?. = "si existe, hazlo"
    });
    return Array.from(set);
  }, [mindMap.nodes]);

  return { searchMatches, availableTags };
}
```

> ⚠️ Quirk real: aunque `FilterOptions` declara `icon`, `hasNote`,
> `hasLink`, `showAncestors/Descendants`, este hook **solo aplica**
> texto, tag y progreso. Lo demás lo resuelven la UI o queda pendiente.

---

## 3. `useKeyboardShortcuts.ts` — un solo oyente global

Recibe `{ isAnyModalOpen, onCloseModals }` y lee el store directamente.
Registra UN `window.addEventListener('keydown', ...)` en un `useEffect`
(y lo limpia al desmontar). Orden de guardas:

1. **Escribiendo** (foco en `INPUT`/`TEXTAREA`): ignora todo salvo `Escape` (desenfoca + cierra edición).
2. **Modal abierto**: ignora todo salvo `Escape` (cierra modales).
3. **F5**: alterna presentación. **En presentación**: ignora el resto.
4. Después: `Ctrl+Z/Y` (undo/redo), `Ctrl+C/X/V`, `Ctrl+F`, `Alt+O/P`, `Tab/Insert` (hijo), `Enter` (hermano), `F2` (editar), `Espacio` (fold), `Supr/Backspace` (borrar), `Escape` (selecciona raíz), flechas (navegan por `side`: en raíz buscan hijo del lado; si no, suben al padre o bajan al primer hijo).

> 💡 Por qué importa el orden: si no existiera la guarda 1, pulsar
> `Tab` dentro de un campo crearía nodos mientras escribes.

---

*Continúa en Parte 3: persistencia, temas y motores (storage, themes, mapTheme, layoutEngine).*


# 📘 Guía de Estudio — Parte 3a: Persistencia y temas

## 1. `src/utils/storage.ts` (completo, 106 líneas)

Puerta de entrada/salida a `localStorage`. Tres claves y nada más:

```ts
import { MindMap } from '../types/mindmap';
import { TUTORIAL_MAP } from './sampleMaps';

const CURRENT_MAP_KEY = 'freemind_current_map_v1';       // mapa en edición
const SAVED_MAPS_INDEX_KEY = 'freemind_saved_maps_index_v1'; // galería

export interface SavedMapMeta {   // ficha resumida para la galería
  id: string;
  title: string;
  updatedAt: number;
  nodeCount: number;
}

// Lee el mapa activo. Valida que tenga rootId+nodes; si el id es de tutorial
// devuelve la definición ACTUAL del tutorial (no la guardada, que puede
// ser vieja). Ante cualquier error o vacío: TUTORIAL_MAP. Nunca lanza.
export function loadCurrentMap(): MindMap {
  try {
    const saved = localStorage.getItem(CURRENT_MAP_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rootId && parsed.nodes) {
        if (parsed.id === 'map-tutorial-freeplane' || parsed.id === 'map-tutorial-v1') {
          return TUTORIAL_MAP;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading current map from localStorage:', err);
  }
  return TUTORIAL_MAP;
}

// Guarda el mapa activo Y actualiza el índice/galería. Nunca lanza.
export function saveCurrentMap(map: MindMap): void {
  try {
    localStorage.setItem(CURRENT_MAP_KEY, JSON.stringify(map));
    updateSavedMapsIndex(map);
  } catch (err) {
    console.error('Error saving current map to localStorage:', err);
  }
}

// Índice de la galería. Si no hay nada, devuelve ficha del tutorial.
export function getSavedMapsIndex(): SavedMapMeta[] {
  try {
    const raw = localStorage.getItem(SAVED_MAPS_INDEX_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading maps index:', err);
  }
  return [{
    id: TUTORIAL_MAP.id,
    title: TUTORIAL_MAP.title,
    updatedAt: TUTORIAL_MAP.updatedAt,
    nodeCount: Object.keys(TUTORIAL_MAP.nodes).length,
  }];
}

// Inserta al frente (o actualiza si existe) + guarda copia individual
// en `freemind_map_{id}`. nodeCount = nº de nodos.
export function updateSavedMapsIndex(map: MindMap): void { /* ... */ }

// Lee/borra la copia individual. load devuelve null si no existe.
export function loadMapById(id: string): MindMap | null { /* ... */ }
export function deleteMapById(id: string): void { /* ... */ }
```

> 💡 Patrón defensivo: cada función envuelve todo en `try/catch`.
> `localStorage` puede fallar (modo privado, cuota llena, JSON corrupto)
> y la app debe seguir viva. En tests se limpia con
> `localStorage.clear()` en `beforeEach`.

---

## 2. `src/utils/themes.ts` — 8 temas + 12 fondos (estructura)

```ts
import { MindMapTheme, BackgroundPatternStyle, MapBackgroundConfig } from '../types/mindmap';

export interface BackgroundPresetTheme {
  id: string;               // 'bg-clean-white', 'bg-dot-grid-slate', ...
  name: string;             // 'Lienzo Puro (Liso)', 'Cuaderno de Puntos', ...
  category: 'light' | 'dark' | 'paper' | 'technical' | 'creative';
  backgroundColor: string;
  pattern: BackgroundPatternStyle;  // 'none'|'dots'|'lines'|'squares'|'triangles'|'hexagons'
  patternColor: string;
  patternSize: number;      // 24–36px
  patternOpacity: number;   // 0.3–0.6
  description: string;
}

export const THEMES: Record<string, MindMapTheme> = {
  default:   { id: 'default',   name: 'Clásico Azul', ... rootBg: '#2563eb', branchColors: [7 colores], edgeStyle: 'bezier', fontFamily: 'Plus Jakarta Sans' },
  rainbow:   { id: 'rainbow',   name: 'Arcoíris Vibrante', ... 8 branchColors },
  dark:      { id: 'dark',      ... rootBg: '#3b82f6', nodeBg: '#1e293b' },
  forest:    { id: 'forest',    ... rootBg: '#047857' },
  sunset:    { id: 'sunset',    ... rootBg: '#ea580c', pattern: 'triangles' },
  minimal:   { id: 'minimal',   ... rootBg: '#18181b', edgeStyle: 'linear', 4 ramas grises },
  blueprint: { id: 'blueprint', ... rootBg: '#0284c7', edgeStyle: 'sharp' },
  honeycomb: { id: 'honeycomb', ... rootBg: '#d97706', pattern: 'hexagons' },
};
// Cada tema define: background+pattern, rootBg/rootText,
// nodeBg/nodeText/nodeBorder, branchColors[], edgeStyle, fontFamily.

export const BACKGROUND_PRESET_THEMES: BackgroundPresetTheme[] = [
  // 12 entradas: bg-clean-white, bg-dot-grid-slate, bg-square-grid,
  // bg-blueprint-pro, bg-honeycomb-gold, bg-triangular-mesh,
  // bg-lined-paper, bg-dark-matrix-dots, bg-dark-honeycomb,
  // bg-dark-isometric, bg-graphite-lines, bg-mint-breeze
];
```

> 💡 Cómo se resuelve un color (orden de prioridad): **nodo** (`node.color`)
> → **mapa** (`mindMap.backgroundColor`) → **tema**. Por eso cambiar de
> tema no se notaba antes: los nodos traían color propio.

---

## 3. `src/utils/mapTheme.ts` (completo) — las dos operaciones del panel Mapa

```ts
import { MindMap, MindNode } from '../types/mindmap';

// Restilo total al cambiar de tema: borra los overrides de color por nodo
// (color, textColor, borderColor) y del mapa (fondo, patrón, edgeColor)
// para que el tema mande en todo. Conserva formas, imágenes, degradados,
// tipografía y metadatos. Es deshacible (App hace pushHistory antes).
export function applyThemeRestyle(map: MindMap, themeId: string): MindMap {
  const clearedNodes: Record<string, MindNode> = {};
  Object.entries(map.nodes).forEach(([id, node]) => {
    const { color, textColor, borderColor, ...rest } = node; // destructuring:
    clearedNodes[id] = rest as MindNode;  // separa 3 campos y conserva el resto
  });
  return {
    ...map,
    themeId,
    nodes: clearedNodes,
    backgroundColor: undefined,       // undefined = "usa el del tema"
    backgroundPattern: undefined,
    backgroundPatternColor: undefined,
    backgroundPatternSize: undefined,
    backgroundPatternOpacity: undefined,
    edgeColor: undefined,             // ramas vuelven a branchColors
    updatedAt: Date.now(),
  };
}

// Fusiona un cambio parcial de fondo (lo que llama ThemeTab).
export function applyBackgroundUpdate(
  map: MindMap,
  config: Pick<MindMap,
    | 'backgroundColor' | 'backgroundPattern' | 'backgroundPatternColor'
    | 'backgroundPatternSize' | 'backgroundPatternOpacity'>
): MindMap {
  return { ...map, ...config, updatedAt: Date.now() };
}
```

> 💡 `Pick<MindMap, ...>` = "un objeto con SOLO esas claves de MindMap".
> Truco reutilizable cuando una función acepta un subconjunto.

---

*Continúa en Parte 3b: el motor de layout (`layoutEngine.ts`) completo.*


# 📘 Guía de Estudio — Parte 3b: Motor de layout (completo)

## Qué hace este archivo

`src/utils/layoutEngine.ts` (1861 líneas) es matemática pura sin DOM:
dado un `MindMap`, devuelve `Map<id, CalculatedNodeLayout>` con `x, y,
width, height, side, depth, branchIndex, bounds` por nodo. Proceso:

1. **Medir** (`estimateNodeSize`): tamaño de cada caja según texto, fuente,
   iconos, badges, imagen, tags, notas y forma.
2. **Colocar** (`computeMindMapLayout`): según los 9 layouts, en 2 pasadas
   (métricas bottom-up + coordenadas top-down).
3. **Descolisionar** (`resolveLayoutCollisions`): 32 pases que empujan
   subárboles solapados (con margen extra si hay nubes).
4. **Dibujar aristas** (`generateEdgePath`, `generateRibbonEdgePath`) y
   **nubes** (`computeCloudBounds`).

```ts
import { MindMap, MindNode, CalculatedNodeLayout, NodeSide, EdgeProfile } from '../types/mindmap';

const HORIZONTAL_GAP = 54;   // separación base entre niveles (px)
const VERTICAL_GAP = 14;     // separación base entre hermanos (px)
const ROOT_HORIZONTAL_GAP = 68; // la raíz respira un poco más
```

### `estimateNodeSize(node, mapOptions?)` — medir una caja

```ts
export function estimateNodeSize(node, mapOptions?) {
  const isRoot = !node.parentId;
  const fontSize = node.fontSize || (isRoot ? 16 : 14);
  // Visibilidad efectiva: hide del nodo O global del mapa
  const isBodyHidden = node.hideBody || mapOptions?.hideAllBodies;
  // ... igual para imagen, tags, iconos, links (progreso solo tiene hide propio)

  const paddingX = isRoot ? 16 : 10;   // acompaña al padding visual (nodos ceñidos)
  const paddingY = isRoot ? 8 : 6;

  // Iconos/progreso arriba suman ALTO; a la izquierda suman ANCHO.
  // Link y nota suman ancho (hay badge). Imagen: según posición
  // (left/right ensanchan; top/bottom/between crecen en alto).
  // Tags: +22px alto y ancho mínimo por longitud. Link con badge: +24 alto.
  // (ver código fuente líneas 37-98 para los números exactos)

  const charWidth = fontSize * 0.58;   // aproximación monoespaciada
  const lines = (node.text || ' ').split('\n');

  let customW = node.customWidth;       // slider del inspector (0 = auto)
  if (node.shape === 'square' || node.shape === 'circle') {
    customW = Math.max(node.customWidth || 0, node.customHeight || 0); // 1:1
  }

  // Con ancho fijo: se ENVUELVE el texto (cuenta líneas resultantes).
  // Sin ancho fijo: ancho = línea más larga (topado a 400px).
  // El cuerpo igual con su fuente (tope 420px). La nota inline igual (tope 400/250px).

  // Mínimos: ancho une contenido/tags/link/imagen; alto une contenido con
  // mínimo raíz 48 / normal 34 + extras. customWidth/Height elevan el mínimo.

  // Ajustes por forma: fit = escala fija; square/circle = lado máximo (mín 48);
  // star = ancho +48 y alto x2.2 (vertical, no plana);
  // bubble = +36 ancho / +20 alto; hexagon = +48; arrow = +52.
  return { width, height };
}
```

> 💡 El 4:3 vive FUERA de esta función, en el envoltorio `estimateNodeSize`
> público (ver Parte 3a de la guía no—ver abajo): calcula el natural,
> deriva `targetW = clamp(sqrt(área·4/3), 80, 420)`, re-envuelve con ese
> ancho (`forcedWidth` → `customW`) y devuelve. Solo para caja
> (`bubble/rectangle/sin forma`); con ambas dimensiones personalizadas
> manda el usuario.

### Métricas bottom-up (2 familias de funciones hermanas)

```ts
// Rama HORIZONTAL (standard/left/right): calcula subtreeHeight =
// máx(alto propio, suma de alturas hijas + gaps). Plegado = hoja.
// +36px si la nube toca por ambos lados, +24 si por uno (cloudPad).
function calculateSubTreeMetrics(nodeId, nodes, verticalGap, mapOptions): SubTreeLayout
// Rama VERTICAL (top/bottom/balanced): espejo con subtreeWidth y horizontalGap.
function calculateSubTreeVerticalMetrics(...): SubTreeVerticalLayout
// ¿Algún descendiente (no plegado) tiene nube? → gaps extra.
export function nodeOrDescendantHasCloud(nodeId, nodes): boolean
```

### `computeMindMapLayout(mindMap, canvasCenter = {x:0,y:0})`

```ts
// 1. Raíz centrada en canvasCenter, side 'root', depth 0, branchIndex 0.
// 2. Si plegada o sin hijos: fin.
// 3. Despacha por mindMap.layout:
//    radial → layoutRadialTree (sectores 360° desde -90°, radio por cuerda)
//    circular → layoutCircularTree (anillos; anchas por peso de hojas)
//    bottom/tree-down → layoutVerticalBranch('bottom', ...)
//    top → layoutVerticalBranch('top', ...)
//    balanced-horizontal → reparte hijos top/bottom (alternando si no tienen side)
//    else standard/left/right → reparte left/right (alternando si no tienen side)
// 4. Nodos isFreeFloating no colocados: van a freePosition (o +200/-150).
// 5. resolveLayoutCollisions(...) universal. Devuelve el Map.
```

Detalles de colocación: `layoutBranchSide` centra el bloque hijas
verticalmente sobre el padre (`startY = centro - total/2`); cada rama
lleva `side`, `depth = padre+1`, `branchIndex` (índice entre hermanas →
color de rama) y `bounds` (caja del subárbol para nubes/cámara).
`layoutVerticalBranch` es el espejo en X. Radial/circular usan
`cos/sin` desde `canvasCenter` con radios mínimos por cuerda para no
solapar. Los descendientes heredan subsectores angulares (radial) o
anillos ponderados por hojas (circular, `getSubtreeLeafWeight`).

### Colisiones: `resolveLayoutCollisions` (32 pases)

```ts
// minGapX = hGap*0.4 (mín 20), minGapY = vGap*0.7 (mín 16).
// Pase A (nodo-nodo): si las cajas + márgenes solapan, empuja el SUBÁRBOL
//   entero (shiftSubtree mueve nodo + descendientes + sus bounds):
//   horizontal → en Y; vertical → en X; radial/circular → radialmente
//   (al más profundo se le empuja x1.5).
// Pase B (nubes, gap 16): nube↔nodos externos y nube↔nube, misma lógica
//   por ejes (se ignoran pares ancestro/descendiente).
// Si un pase no encuentra colisiones, termina antes.
```

### Aristas: `generateEdgePath` y `generateRibbonEdgePath`

```ts
// generateEdgePath(parent, child, edgeStyle, childShape): string (path SVG)
//  'hidden' → ''. fork → la arista nace abajo del todo (y+height-2).
//  radial/circular → intersección rayo-caja (getBoxRayIntersection) + curva;
//  bottom/top → vertical con codos; left/right → horizontal Bézier
//  (controles al 45%). Estilos: linear (L), sharp (L con punto medio),
//  horizontal (escalón), bezier (cúbica, defecto).
// generateRibbonEdgePath(...): null si uniform/hidden; si no, construye un
//  POLÍGONO de 32 segmentos siguiendo la curva con grosor variable:
//  tapered (grueso→fino), spindle (huso), hourglass (reloj). Devuelve path cerrado.
```

### Nubes: `computeCloudBounds(nodeId, nodes, layoutMap)`

```ts
// null si no hay nube activa o falta layout. Une la caja del nodo con la de
// TODOS los descendientes visibles (plegado corta la rama), +18px base
// (+12 si un hijo tiene nube), + paddingX/paddingY del usuario (mín 4).
// El canvas dibuja sobre estos bounds las 8 formas SVG.
```

---

*Continúa en Parte 4: conversores, exportadores, iconos y plantillas.*


# 📘 Guía de Estudio — Parte 4a: Conectores, conversores y Markdown

## 1. `src/utils/connectorUtils.ts` (completo, 100 líneas)

Geometría de las flechas flotantes entre dos nodos cualesquiera:

```ts
import { Connector } from '../types/mindmap';

export interface ConnectorGeometry {
  pathD: string;   // atributo 'd' del <path> SVG
  cpX: number; cpY: number;       // punto de control (arrastrable)
  midX: number; midY: number;     // punto medio (guía punteada)
  labelX: number; labelY: number; // posición de la etiqueta (-6px arriba)
}

export function calculateConnectorGeometry(fromX, fromY, toX, toY, conn): ConnectorGeometry {
  const midX = (fromX + toX) / 2, midY = (fromY + toY) / 2;
  const dx = toX - fromX, dy = toY - fromY;
  const dist = Math.hypot(dx, dy) || 1;   // || 1 evita dividir por cero
  const nx = -dy / dist, ny = dx / dist;  // vector NORMAL (perpendicular)
  const curvature = conn.curvature !== undefined ? conn.curvature : -50;
  // Punto de control: manual si el usuario lo arrastró, si no a 'curvature' px
  // en dirección normal (por eso -50 curva hacia un lado).
  let cpX, cpY;
  if (conn.controlPoint) { cpX = conn.controlPoint.x; cpY = conn.controlPoint.y; }
  else { cpX = midX + nx * curvature; cpY = midY + ny * curvature; }

  const shape = conn.shape || 'curved';
  switch (shape) {
    case 'straight': return recta M→L, etiqueta en medio -6;
    case 'step':     return ortogonal M→esquina→esquina→fin (usa cpX o midX);
    case 'bezier':   return cúbica con controles al 75% hacia cp; etiqueta en t=0.5
                      (fórmula 0.125·P0 + 0.375·C1 + 0.375·C2 + 0.125·P3);
    case 'curved':   return cuadrática M→Q(cp)→fin; etiqueta en t=0.5
                      (0.25·P0 + 0.5·CP + 0.25·P1) menos 6px;
  }
}
```

> 💡 El canvas dibuja ADEMÁS una copia invisible gruesa (`strokeWidth 20
> transparente`) para que sea fácil hacer clic, un halo al seleccionar,
> la guía punteada al punto de control y un círculo arrastrable (doble
> clic = restablecer a curvatura -50).

---

## 2. `src/utils/freeplaneConverter.ts` (completo, 264 líneas)

Habla el idioma de Freeplane: XML `.mm`.

```ts
import { MindMap, MindNode, NodeShape } from '../types/mindmap';

// EXPORTAR: árbol → XML. Cada nodo escribe atributos solo si existen:
// TEXT (escapado), ID (prefijo ID_ + solo [a-zA-Z0-9_]), BODY*,
// POSITION (side ≠ root), BACKGROUND_COLOR, COLOR, STYLE (forma),
// LINK, FOLDED. Hijos especiales: <font SIZE BOLD ITALIC/>,
// <icon BUILTIN/>, <cloud COLOR SHAPE/>, <hook NAME="...NodeNote..."><text>.
// Sin hijos especiales → nodo autocontenido <node .../>.
export function exportToFreeplaneXML(mindMap: MindMap): string {
  // ... recursión nodeToXML con indentación; cabecera freeplane 1.7.0
}

// IMPORTAR: XML → MindMap. DOMParser nativo (sin librerías).
// Lee TEXT/BODY*/POSITION (left?left:right — ¡los sides se pierden fuera
// de left/right!), colores, STYLE, LINK, FOLDED, <font>, <icon>,
// <cloud> (defecto round-rectangle), nota del <hook>, hijos recursivos
// con sideHint heredado. Genera id `map-Date.now()` y título del texto raíz.
export function importFromFreeplaneXML(xmlString: string): MindMap { /* ... */ }

// EXPORTAR Markdown: raíz como `# Título`, nota como cita `>`,
// ramas como `- **texto**` con [progreso%], ([Enlace](url)) y #tags,
// notas hijas como citas indentadas. Recursivo por children.
export function exportToMarkdown(mindMap: MindMap): string { /* ... */ }

// Re-exporta el HTML autónomo para que el modal importe de un solo sitio:
export { exportToStandaloneHTML } from './htmlExporter';

// Escapado XML (& < > " '). OJO: usa &apos; (htmlExporter usa &#39;
// en su copia local: dos funciones gemelas con historia distinta).
export function escapeXML(str: string): string { /* ... */ }
```

---

## 3. `src/utils/htmlExporter.ts` — el HTML portable (estructura, 2226 líneas)

Una sola función exportada + un `escapeXML` local:

```ts
export function exportToStandaloneHTML(mindMap: MindMap): string {
  const jsonMap = JSON.stringify(mindMap).replace(/<\/script>/gi, '<\\/script>');
  // ^ vital: si el JSON contuviera "</script>" rompería el HTML.
  const title = escapeXML(mindMap.title || 'Mapa Mental');
  const theme = THEMES[mindMap.themeId] || THEMES.default;
  // Construye el HTML por partes (array de strings) y lo une.
  // HEAD: <style> con header, badges, nodos + <link> Google Fonts
  //   (única dependencia externa: degrada sin conexión).
  // JAVASCRIPT embebido que REPLICA el motor: getSvgIcon,
  // formatTextWithLinks, renderMarkdown, estimateNodeSize,
  // calculateSubTreeMetrics(+Vertical), getBoxRayIntersection,
  // computeMindMapLayout + ramas (BranchSide/ChildrenSide/Vertical/
  // Radial(+Subtree)/Circular(+Subtree)), shiftSubtree,
  // resolveLayoutCollisions, generateEdgePath, renderMap
  // (expandDescendants), updateTransform, zoomBy, resetView,
  // fitToScreen, toggleFold(All), handleSearch, open/closeNoteDrawer,
  // exportCanvasPng. Es decir: el visor exportado ES la app en miniatura.
}
```

> 💡 Por eso el archivo es tan largo: duplica el layout en JS plano
> (sin React) para que el `.html` viva solo.

---

## 4. `src/utils/markdownRenderer.tsx` — Markdown propio (estructura completa)

Tres exports, cero dependencias:

- **`renderInlineMarkdown(text, isDark?)`**: tokeniza con una regex
  (`[t](url)` | `**b**` | `*i*` | `` `code` `` | `~~s~~`) y devuelve
  nodos React (`<a target=_blank>`, `<strong>`, `<em>`, `<code>`, `<span
  line-through>`). Lo no reconocido se deja como texto tal cual.
- **`MarkdownView({content|markdown, isDark?, className?})`**: parser por
  líneas con estados (`inCodeBlock`, listas con `flushList`): cercas
  ``` , `---`, `#`–`####` (azul/ámbar/verde/morado), citas `>` (solo en
  JSX; en HTML nunca salen porque el escape corre antes — quirk
  documentado y testeado), checklists `- [ ]/- [x]` (checkbox real),
  listas `-/*`, numeradas `1.` (número ámbar + contenido), párrafos.
- **`renderMarkdownToHTML(markdown)`**: versión string para el exportador
  (mismas reglas con estilos inline: h1 azul, h2 ámbar, code amarillo,
  links con ↗, `<br/>` por salto).

---

*Continúa en Parte 4b: iconos, generadores de presentación y plantillas.*


# 📘 Guía de Estudio — Parte 4b: Iconos, presentaciones y plantillas

## 1. Iconos: `iconMap.tsx` + `vectorIconPack.tsx`

```ts
// iconMap.tsx
export interface IconDefinition { id, name, category, icon, color? }
// AVAILABLE_ICONS: ~28 iconos curados (prioridades p1-p5, estados,
// marcadores, generales) con componentes lucide-react.
export function renderNodeIcon(iconId, className='w-3.5 h-3.5', customColor?, customSize?): React.ReactNode {
  // 1º busca en el pack de 500+ (getVectorIconItem)
  // 2º si no, en AVAILABLE_ICONS (con tinte/tamaño si se piden)
  // 3º si no, alias legacy (idea, flag-red, keyboard...)
  // 4º si no, muestra el id como texto (nunca rompe)
}
```

```tsx
// vectorIconPack.tsx (531 líneas)
export type VectorIconCategory = 'priority_status' | 'business_finance'
  | 'tech_code' | 'communication' | 'design_media' | 'education_science'
  | 'navigation_maps' | 'documents_files' | 'nature_weather'
  | 'tools_security' | 'health_sports' | 'emojis_symbols'; // 12 categorías
export const VECTOR_ICON_CATEGORIES: CategoryInfo[] = [/* 12 con nombre, icono y descripción */];
// getIcon(name): toma el componente de lucide-react o HelpCircle si no existe.
export const VECTOR_ICON_PACK: VectorIconItem[] = [/* 520+ { id, name, category, tags[], icon } */];
export const TOTAL_VECTOR_ICONS_COUNT = VECTOR_ICON_PACK.length;
export function searchVectorIcons(query, category?): VectorIconItem[] // filtra por texto+categoría
export function getVectorIconItem(iconId): VectorIconItem | undefined
```

> 💡 Patrón *fallback en cascada*: pack → curados → alias → texto.
> Los badges de prioridad p1-p9 son SVG generados por función
> (`createPriorityBadge`: círculo + número).

## 2. `presentationGenerator.ts` (completo, 212 líneas)

```ts
// Genera el storyboard por defecto de la presentación DINÁMICA (marcos).
// Necesita el layoutMap (usa bounds reales de cada subárbol).
export function generateDefaultPresentationSlides(mindMap, layoutMap): SlideFrame[] {
  // Sin raíz en el layout → [] (defensivo).
  // Slide 1 overview: une TODOS los bounds + pad 120 (mín 400x300).
  // Slide 2: nodo raíz con pad 24.
  // Si la raíz tiene nota: slide 'note' naranja (#f59e0b) justo después.
  // Por cada rama principal: slide 'branch' 📌 (subárbol + pad 32)
  //   + su nota si la hay + un slide por cada nieto ('branch' si tiene
  //   hijos, 'node' si no; pad 24). Orden creciente garantizado.
}
```

## 3. `spatialPresentationGenerator.ts` (completo, 495 líneas)

```ts
export type SpatialArrangementType = 'spiral' | 'constellation' | 'grid' | 'random' | 'stacked';
const cardWidth = 720, cardHeight = 440; // todas las tarjetas igual

export function generateDefaultSpatialSlides(mindMap, arrangement = 'spiral'): SpatialSlideCard[] {
  // Sin raíz válida → []. Recorre nodos en profundidad (raíz primero).
  // extractNodeContent: { nodeId, titleText ('Sin Título' si vacío),
  //   bodyText, notesMarkdown, imageUrl, imageSize 'medium', icons, tags,
  //   progress, subItems[id,text,color] }.
  // extractNodeStyle: copia color/tipografía/fondo del nodo + themeId.
  // Por NODO una tarjeta; si tiene nota, OTRA tarjeta isNoteSlide
  // (borde #f59e0b, icono file-text) al lado.
  // spiral: ángulo +0.48rad, radio +180 (raíz escala 1.3 en 0,0).
  // constellation: raíz gigante (escala 1.4) + ramas en órbita r=1200
  //   + nietos a r=1950. grid: matriz 3 col (880x580).
  // random: pseudoaleatorio con semilla 42 (¡determinista! siempre igual).
  // stacked: mazo con micro-offsets y rotaciones.
}
```

> 💡 La semilla fija en `random` es intencional: "aleatorio" pero
> reproducible (los tests lo agradecen).

## 4. Plantillas y datos: `sampleMaps.ts`, `additionalTemplates.ts`, `templateIllustrations.ts`

- **`sampleMaps.ts` (3879 líneas)**: `TUTORIAL_MAP` (guía con 6 conectores
  de ejemplo), 9 mapas locales (`OKR_STRATEGY`, `CLOUD_ARCH`,
  `BRAINSTORMING`, `ORG_CHART`, `AGILE_SPRINT`, `STUDY_EXAM`,
  `MARKETING_FUNNEL`, `DECISION_TREE`, `PRODUCT_GTM`), `BLANK_MAP`
  (raíz + 2 ramas), re-exporta los 10 de `additionalTemplates` y los une
  en `ALL_TEMPLATES` (~20 con `{map,id,title,category,desc,themeName,
  layoutLabel,edgeDesc,tags,color,badgeColor}`). Son *datos*, no lógica:
  se leen por estructura, no línea por línea.
- **`additionalTemplates.ts` (2528 líneas)**: 10 mapas temáticos
  (`AI_PRODUCT_ROADMAP` radial oscuro, `SWOT`, `CYBERSECURITY`, `CUSTOMER_
  JOURNEY`, `STARTUP_PITCH`, `FULLSTACK`, `FINANCIAL`, `DESIGN_SYSTEM`,
  `CONTENT_CREATOR`, `HEALTH_WELLNESS`), varios con conectores propios.
- **`templateIllustrations.ts` (464 líneas)**: `TEMPLATE_SVGS` con 32
  ilustraciones SVG 120x120 como DataURI (`toSvgDataUri` comprime
  espacios y codifica). Se usan en la galería y como imagen de nodo.
- **`enrich_shapes.py`** (raíz): script de mantenimiento que reescribe
  `shape:'bubble'` por formas variadas en `additionalTemplates.ts`
  (se ejecuta a mano, no en build).

---

*Continúa en Parte 5: átomos y moléculas (código completo).*


# 📘 Guía de Estudio — Parte 5: Átomos y moléculas (código completo)

> Los **átomos** son piezas tontas: reciben props y dibujan. Sin lógica
> de negocio. Si vas a crear un botón/input/modal, USA estos (regla 1
> de DESIGN.md). Las **moléculas** combinan átomos con una mini-función.

## Átomos

### `Button.tsx` — 6 variantes × 4 tamaños + loading

```tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'surface';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;   // muestra spinner y deshabilita
}
// secondary es el default. disabled/isLoading → opacity-45 sin eventos.
// isLoading dibuja un svg animate-spin (círculo + porción).
```

### `IconButton.tsx` — botón cuadrado compacto con tooltip

```tsx
// variant: primary|secondary|ghost(default)|danger|surface|dark
// size: xs 24px · sm 28px · md 32px · lg 40px
// rounded: md|lg|xl|full; active: estado "encendido" (azul suave en ghost)
// disabled → opacity-40. title + aria-label = tooltip/accesibilidad.
```

### `Badge.tsx` — píldora con borde siempre + X opcional

```tsx
// variant: blue|slate|emerald|amber|rose|purple|indigo (pasteles + dark)
// size xs/sm/md. onRemove dibuja una X que hace stopPropagation
// (para que quitar el badge no active el clic del padre).
```

### `Input.tsx` — campo con label, iconos, error y limpiar

```tsx
// forwardRef (permite .focus() desde fuera). size sm/md/lg.
// iconLeft/iconRight con padding pl-8/pr-8 automático.
// onClear + valor → botón X (solo con contenido y habilitado).
// error → borde rose + mensaje 11px; si no, helperText gris.
```

### `ModalBackdrop.tsx` — fondo + tarjeta (base de los 7 modales)

```tsx
// Props: isOpen, onClose, children, maxWidth sm|md|lg|xl(default)|2xl|3xl|4xl|5xl.
// Escape cierra (useEffect con cleanup). Clic fuera cierra,
// clic dentro NO (stopPropagation). Card: rounded-2xl shadow-2xl max-h-90vh.
```

### `SliderInput.tsx` — deslizador + badge numérico + Reset

```tsx
// Props: label, value, min, max, step=1, unit='px', onChange,
// onReset?, description?, badge? (si no, muestra `value+unit`).
// range h-1.5 accent-blue-600; badge azul mono 11px.
```

### `ColorPicker.tsx` — 16 presets + color nativo + Auto

```tsx
// Props: label, value?, onChange, onClear?, defaultColor '#ffffff',
// presets? (16 fijos: 8 claros + 8 intensos).
// Cabecera: label + cajita (input type=color 16px + hex mono o 'Auto').
// Reset SOLO si onClear && hay valor (vuelve a undefined = tema).
// Grid 8 columnas; seleccionada: borde azul + anillo; resto al hover.
// GUARD: el input nativo exige hex de 7 chars → fallback a defaultColor.
```

### `ToggleButton.tsx` / `ToggleButtonGroup.tsx`

```tsx
// ToggleButton({label, active, onClick, icon?}): activo = azul sólido.
// ToggleButtonGroup({options[{value,label,icon?}], value, onChange, size?}):
// excluyentes; seleccionado = azul claro. (OJO: NO usan checked/onChange
// booleano; la API real es label/active/onClick y options/value/onChange.)
```

### `CollapsibleSection.tsx` — acordeón con icono, badge y acción

```tsx
// Props: title, subtitle?, isOpen, onToggle, icon?, badge?, action?, children.
// Cabecera clicable + chevron que rota; cuerpo solo si isOpen.
```

### `ErrorBoundary.tsx` — red de seguridad (componente de CLASE)

```tsx
// Único componente de clase: los errores de render solo los atrapa
// getDerivedStateFromError + componentDidCatch. Muestra card con el mensaje
// y botones Reintentar (limpia estado) / Recargar (location.reload).
// Envuelve a TODA la App: nunca verás pantalla blanca.
```

## Moléculas

### `ModalHeader.tsx` — cabecera estándar de modal
Icono 40px azul + título `text-lg font-bold tracking-tight` + subtítulo
xs + badge opcional + cierre `IconButton ghost` ("Cerrar (Esc)").

### `SearchInput.tsx` — Input sm + lupa + Badge de conteo
`Badge blue xs` con "N coincidencias" solo si hay texto.

### `HistoryControls.tsx` — deshacer/rehacer
Dos `IconButton` con tooltips de atajos, deshabilitados sin pila.

### `ZoomControls.tsx` — píldora de zoom (SIEMPRE clara, sin `dark:`)
Compass (mostrar/ocultar MiniMapa) + divisor + − / % mono clicable
(reset 100%) / + / divisor + encuadrar. Card `bg-white/95 blur shadow-lg`.

### `FontFormatToolbar.tsx` — negrita/cursiva + alineación
Dos grupos con borde; activo = azul claro. Props: bold, italic, align + 3 callbacks.

### `ShapeSelector.tsx` — grid 5 col. de las 10 formas
`SHAPES[{id,name,icon}]`; seleccionada azul; `title={name}` (español:
'Estrella', 'Hexágono'...). Llama `onSelectShape(id)`.

### `TagManager.tsx` — etiquetas con anti-duplicados
Estado local `input`; `handleAdd` recorta y rechaza vacíos/duplicados;
Enter añade; botón + deshabilitado sin texto; chips azules con X
(`onRemoveTag`). Usado en ContentTab metadatos.

## Sub-moléculas del nodo (`molecules/node/`)

### `NodeBackgroundRenderer.tsx` — geometría y fondos del nodo
- `isDarkNodeBackground(color, isRoot)`: luminancia ITU-R BT.709 < 0.52
  (raíz sin color se asume oscura).
- `getNodeBackgroundStyles`: color/transparente/degradado (4 direcciones +
  radial)/trama (7 estilos CSS o SVG DataURI)/imagen (fit/cover/contain/tile).
- `getNodeShapeStyles`: bordes (raíz sin ancho → transparentes), y por forma:
  fork = SIN fondo + solo `borderBottom` (siempre visible, 2.5px defecto);
  bubble 24/16px + sombra; square/rectangle 0; circle/pill 9999px;
  oval 50%; hexagon/arrow/star = transparentes (las dibuja el SVG).
- `NodeSvgPolygonBackground`: polígonos calculados del layout + defs de
  degradado/trama/imagen + halo de selección que sigue la geometría.
- `NodeBubbleTail`: cola triangular 12x16 al lado del padre (se espeja
  con scaleX(-1) a la derecha) con línea que tapa la base.

### `NodeHeaderRow.tsx` — imagen + iconos + título/cuerpo editables
Imagen top/fit/left/between (140/100px); iconos y progreso arriba (o a la
izquierda si `*Position==='left'`); asa drag solo hover no-raíz; textarea
auto-focus+select, Enter confirma (Shift+Enter = salto de línea), Escape
revierte, blur confirma; título 14/16px y cuerpo 12/13px con sus
tipografías; `children` = hueco para notas inline.

### `NodeBadgesBar.tsx` — imagen right/bottom, nota, enlace, tags, tooltip
Icono nota (abre panel) / inline ámbar si `showNoteInline`; enlace con
badge prominente (URL recortada); tags centrados `#tag`; tooltip oscuro
(max 340/420px) solo con hover, sin editar, fuera de presentación.

### `NodeActionButtons.tsx` — fold y `+` flotantes
Píldora fold con conteo (plegado ámbar con chevrón por lado, abierto
blanco→índigo al hover) al costado del `side`; botón `+` azul solo en
hover, arriba del lado correspondiente.

---

*Continúa en Parte 6: barras, inspector y lienzo (código completo).*


# 📘 Guía de Estudio — Parte 6: Barras, inspector y paneles

## 1. `templates/MainEditorLayout.tsx` (completo, 71 líneas)

El "plano de la casa": recibe cada zona como *slot* (prop `ReactNode`) y
las coloca. En presentación oculta barras y paneles y muestra el overlay.

```tsx
export interface MainEditorLayoutProps {
  menuBar?: React.ReactNode;  // ? = opcional
  toolBar?: React.ReactNode;
  filterBar?: React.ReactNode;
  canvas: React.ReactNode;    // sin ? = OBLIGATORIO
  toolPanel?: React.ReactNode;
  outlineView?: React.ReactNode;
  statusBar?: React.ReactNode;
  modals?: React.ReactNode;
  presentationOverlay?: React.ReactNode;
  isPresentationMode?: boolean;
  isOutlineOpen?: boolean;
  isOutlineFullscreen?: boolean;
  isToolPanelOpen?: boolean;
  isFilterBarOpen?: boolean;
}
// Render: columna h-screen (menu, toolbar, filter si toca), centro flex
// (outline si abierto y no presentación, canvas siempre, toolpanel si
// abierto y no fullscreen ni presentación), status, overlay, modales.
```

> 💡 Patrón *slots*: el layout no sabe QUÉ dibuja cada zona, solo DÓNDE.
> `App.tsx` le pasa los componentes ya conectados al store.

## 2. `MenuBar.tsx` — menús oscuros + título editable (estructura completa)

- Props: `mindMap`, `canUndo/Redo`, callbacks `onNewMap/onOpenTemplates/
  onOpenSavedMaps/onSaveMap/onOpenExportModal/onOpenImportModal/onUndo/
  onRedo/onAddChild/onAddSibling/onDeleteNode/onToggleOutline/
  onStartPresentation(mode)/onShowComingSoon/onOpenShortcuts/
  onToggleFullscreen/onFoldAll/onUnfoldAll/onOpenConnectorModal/
  onToggleCloud/onTitleChange/onOpenIconPack/onChangeTheme/
  onChangeShape/onResetFormat`.
- Estado local: `openMenu` (un menú abierto a la vez) + edición de título
  (`isEditingTitle`, `titleInput` sincronizado con `mindMap.title`).
- Cierre al clic fuera: `useEffect` con listener `mousedown` + `ref` + cleanup.
- Zonas: marca 🧠 (solo nombre en `sm+`), 6 menús (Archivo/Editar/Insertar/
  Formato/Ver/Ayuda) con dropdowns `absolute w-52/56 rounded-xl shadow-2xl`
  e items con icono + `kbd` de atajo; título central editable (doble clic,
  Enter confirma, blur confirma, vacío = no cambia); badge `100% Offline`
  verde pulsante.
- ⚠️ Quirk: el menú Formato ofrece temas `purple` y `warm` que NO existen
  en `THEMES` → `App` cae a `default` y parece no hacer nada.

## 3. `ToolBar.tsx` — accesos rápidos (estructura completa, 659 líneas)

- Grupo izq: undo/redo (deshabilitados sin pila), Hijo (azul primario),
  Hermano, Borrar (vetado en raíz), fold, negrita/cursiva (responsive),
  select de forma compacto, Conector, Nube (ámbar si activa), Iconos SVG
  500+, menú "···" móvil con lo mismo dentro.
- Grupo der: buscar (Ctrl+F, azul si abierto), **Vista** (ojo: dropdown
  "Visibilidad Global" con 5 filas cuerpo/imágenes/tags/iconos/links y
  píldoras Visible/Oculto; botón ámbar si algo oculto), Esquema (índigo
  si abierto), Presentar (dropdown 3 modos con descripciones), Exportar
  (azul sólido), toggle ToolPanel.
- Todos los popovers cierran al clic fuera (refs + `mousedown`).
- ⚠️ Quirk corregido: el menú Vista llamaba a `onToggleGlobalVisibility?.`
  y `App` no la pasaba → ahora sí (alterna la clave con historial).

## 4. `FilterBar.tsx` (completo, 119 líneas) y `StatusBar.tsx` (51)

```tsx
// FilterBar: si !isOpen → null. isFiltering = query||tag||icon||minProgress.
// Input texto + select tags (solo si hay) + select progreso
// (vacío/100/≥50/con actividad) + contador azul + Limpiar + X.
// Todo oscuro: bg-slate-900, inputs bg-slate-800.
// StatusBar: solo lectura. Nodos totales | "Selec." + ID | Zoom% |
// Posición (X,Y) | Modo ('Editando' si editingNodeId si no 'Listo').
// Nota: App le pasa zoom=100 y posición 0,0 fijos (pendiente cablear).
```

## 5. `ToolPanel.tsx` (completo, 262 líneas) — inspector de 6 tabs

```tsx
export type TabType = 'content' | 'format' | 'notes' | 'icons' | 'clouds' | 'theme';
// Guarda ~30 callbacks opcionales (updateNode, propagaciones, bordes,
// fondo, gaps, visibilidad, conectores, icon pack...). Estado: activeTab
// (default 'content'). Si cerrado → null.
// aside w-84 + header ("Panel de Propiedades" + X) + grid-6 tabs
// (activa: blanca, texto azul, borde-b azul) + contenido p-4.
// Sin nodo y tab ≠ theme → mensaje "Ningún nodo seleccionado".
// Cada tab recibe SOLO lo que necesita (ContentTab ← updateNode, etc.).
```

## 6. `OutlineView.tsx` — esquema lateral con buscador propio

- `getReadableOutlineTextColor`: garantiza contraste YIQ (colores claros
  → `#1e293b`) sobre fondo blanco.
- Búsqueda local (texto+cuerpo+tags, con ancestros para no perder el hilo),
  edición inline (Enter=hermano, Tab=hijo, Escape=cancela), fold, hover con
  +/borrar (raíz sin borrar), pantalla completa, contador y footer de ayuda.
- Filas con indentación `depth*18+10px`, bullet del color del nodo (raíz
  con anillo), badges de progreso/nota/link.

## 7. `MiniMap.tsx` — radar con 3 tamaños persistidos

- Tamaño S/M/L en `localStorage` (`mindmap_minimap_size`): compact `w-44
  h-24`, medium `w-56 h-32`, large `w-72 h-44`.
- Calcula bounds de nodos + viewport (`(0-pan)/zoom`), clic/drag centra la
  cámara, nodos con mínimo legible y borde ámbar si seleccionados, punto
  rojo si plegados, viewport celeste punteado arrastrable.
- Card cristal SIEMPRE clara (sin `dark:`), título oculto en compact.
- Debajo: `ZoomControls`. Se oculta en presentación.

---

*Continúa en Parte 7: lienzo, nodos y presentaciones (guía completa).*


# 📘 Guía de Estudio — Parte 7: Lienzo, presentaciones, modales y tests

## 1. `NodeComponent.tsx` (completo, 199 líneas) — el nodo orquestador

```tsx
// Props: node, layout (x/y/w/h del motor), isSelected, isEditing, theme,
// branchColor, isMatch?, isPresentationMode?, isStaged?, globalVisibility?,
// y 11 callbacks (onSelect con evento, onDoubleClick, onTextChange,
// onFinishEditing, onToggleFold, onAddChild, onOpenNote, onDragStart,
// onDropOnNode).
// Lógica: isRoot = !parentId; shape default 'bubble' (el 'rounded' del
// código es legacy sin efecto); isSvgShape = hexagon/arrow/star.
// Visibilidad = nodo O global. Colores: raíz usa theme.root*, si no theme.node*.
// Render: div absolute en layout.x/y con shapeStyles + drop-shadow si fork
// seleccionado; clases por estado (staged > selected > hover; match ámbar);
// badge ✓ si staged; <NodeSvgPolygonBackground/> + <NodeBubbleTail/> +
// <NodeHeaderRow/> + <NodeBadgesBar/> + <NodeActionButtons/>.
// Clics con stopPropagation (no llegan al canvas); hover muestra drag y +.
```

## 2. `MindMapCanvas.tsx` (1577 líneas) — el corazón

- **Estados locales**: zoom/pan (+isPanning), presentación (presMode
  editor/play, slide actual, overview, filmstrip, herramientas
  navigate/pick_nodes/draw_frame, staged, dibujo, drag&drop, conectores
  hover/select/arrastre, menú contextual, minimapa, tamaño contenedor).
- **Memos**: `layoutMap` (motor), `slides` (del mapa o generadas),
  `activeSlide/Node`, `overviewBounds` (pad 80), nodos destacados
  (spotlight: fuera de foco → opacity 0.18).
- **Cámara**: `flyCameraToBounds` (zoom 0.35–3.2), `handleFitView`
  (0.35–1.25), foco a nodo (zoom mín 1.15), marco dibujado (mín 24px,
  guarda nodos encerrados como slide `custom_area`).
- **Eventos**: pan con botón izq. sobre fondo/SVG; wheel NATIVO no-pasivo
  (zoom al cursor 0.2–2.5, evita el error de passive listener); menú
  contextual con anti-recorte de bordes; teclado de presentación
  (→/Espacio/Enter, ←/Backspace, O/Home overview, N notas, E editor, Esc).
- **Capas**: fondo (`effectiveBg*` = mapa o tema) → viewport
  `translate3d+scale` (transición 750ms en presentación) → SVG
  (BackgroundLayer, nubes ordenadas por área con 8 formas + degradado/
  trama/imagen, aristas con perfiles ribbon, conectores below) → nodos DOM
  (tipografía nítida, spotlight) → SVG top (conectores above) →
  DrawingOverlay (solo editor) → HUD (si presentación) → MiniMap (si no
  presentación) → ContextMenu.
- **Conectores** (`renderConnector`): hit-area invisible 20px, halo,
  línea con markers SVG, etiqueta con halo blanco, handle arrastrable
  (doble clic = reset curvatura -50).
- Presentación propia con undo/redo de slides (25 pasos).

## 3. Presentaciones

- **`PresentationMode.tsx` (clásica)**: 8 temas espejo de THEMES;
  paginación sin scroll (cuerpo 4-6 líneas/280-450 chars, notas 9/550,
  hijos 6 por slide); fases body/notes/children; saltos con pila
  `jumpHistory` (Backspace vuelve); config (tema, notas, imagen S/M/L/
  ocultar, hijos, conectores, minimapa radar con halo, alineación,
  escala); navegación →/Espacio, ←, E, Esc.
- **`ElaboratePresentationSystem.tsx` (3D)**: cámara camPan/camZoom
  (0.65)/camRotation; vuelo con inversa de rotación; overview pad 180;
  arrastre/rotación/escala con compensación angular en listeners de
  `window` (escala 0.4–3.0); 5 reordenamientos; trayectoria SVG degradada;
  tarjetas duplicables; persiste en `elaborateSlides`.
- **`SpatialSlideCardComponent.tsx`**: tarjeta 720x440 con fondos ricos,
  spotlight en presenter (activa z-60, resto 0.2), handles de mover/rotar/
  4 esquinas, notas al pie, subitems máx 6.
- **`SlideDetailModal.tsx`**: editor oscuro de tarjeta (título, cuerpo,
  notas con preview, imagen, alineación, tema, rotación ±180, escala
  0.5–2.5) que guarda en la tarjeta.

## 4. Los 7 modales (`components/Modals/`)

Todos: `ModalBackdrop` + (`ModalHeader` menos ComingSoon que usa banner
propio) + footer con `Button`. Comportamientos:
- **ExportImportModal** (xl, 2 tabs): descarga por Blob+`<a>` (nombres
  sanitizados), importa `.mm/.json/.xml` con `FileReader` y mensaje de error.
- **TemplatesModal** (4xl): `TemplateMapPreview` calcula layout REAL por
  plantilla; categorías, tags, buscador; clic clona con `id map-Date.now()`.
- **SavedMapsModal** (lg): lee el índice al abrir, abre/borra (con
  `confirm`), badge (Actual).
- **ConnectorModal** (md): origen fijo, destino select (sin el origen),
  forma/capa/curvatura (oculta en recta)/opacidad/estilo/color; crea
  `conn-Date.now()` con flecha `end`.
- **IconPackModal** (5xl 90vh): sidebar 12 categorías con conteos,
  buscador + sugerencias, grid hasta 10 col, preview + copiar SVG/copiar ID,
  clic alterna icono del nodo.
- **ShortcutsModal** (lg): tabla de 16 atajos con `kbd`.
- **ComingSoonModal** (md, `rounded-3xl`): banner degradado por modo +
  lista de promesas + atajo al modo clásico.

## 5. Tests: cómo están organizados (22 archivos, 106+ tests)

```
src/**/__tests__/*.test.{ts,tsx}   ← junto al código que prueban
src/test/setup.ts                  ← polyfills matchMedia + ResizeObserver
```
- **Patrones**: `BLANK_MAP` como fixture + `structuredClone` (no compartir
  objetos entre tests); store reseteado con `setState` en `beforeEach` +
  `localStorage.clear()`; `renderHook` para hooks; eventos `window` con
  `act()` (si no, el efecto ve estado viejo); `getAllBy*` cuando hay
  duplicados; `within(nodo)` para acotar búsquedas.
- **Quirks con test**: tope 41 snapshots, fold excluye raíz, cut deja
  `isCut:false`, `> cita` no da blockquote, HTML exportado enlaza Google
  Fonts, pool `--pool=forks` en Windows.
- **Comando**: `pnpm test:regression` (suite) · `pnpm vitest run <ruta>`
  (uno) · `pnpm lint` (tipos). Veredicto APTO/NO APTO en
  `.opencode/command/regression.md`; generación en
  `.opencode/agent/test-writer.md`.

---

# 🎓 Cierre: mapa mental del proyecto (para recordar)

```
index.html → main.tsx → App → MainEditorLayout (slots)
  ├── MenuBar / ToolBar / FilterBar / StatusBar (shell)
  ├── MindMapCanvas → layoutEngine + NodeComponent (átomos→moléculas)
  ├── ToolPanel (6 tabs) + OutlineView + MiniMap
  ├── PresentationMode / Elaborate / CanvasPresentation (3 modos)
  └── Modales (7) + Store Zustand + localStorage
```

**Si solo recuerdas 5 cosas:** tipos centrales · store inmutable con
historial · layout en 2 pasadas + colisiones · overrides (nodo > mapa >
tema) · tests junto al código con fixtures clonados.


