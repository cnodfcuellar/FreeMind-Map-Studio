# FreeMind Map Studio — Arquitectura Completa del Proyecto

**Version:** 2.2  **Fecha:** 2026-08-29  
**Stack:** React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Zustand 5  
**Gestor de paquetes:** pnpm  
**Persistencia:** localStorage (sin backend, 100% offline)  
**Patron de arquitectura:** Atomic Design + Store centralizado (Zustand)

---

## 1. Vision General

FreeMind Map Studio es una aplicacion de mapas mentales completamente offline que corre en el navegador sin ningun servidor. El estado completo se gestiona mediante un store reactivo global (Zustand) y se persiste en `localStorage` automaticamente en cada cambio.

```
USUARIO
  │
  ▼
App.tsx  (orquestador, delegador de composicion)
  │           │               │              │
  ▼           ▼               ▼              ▼
MenuBar   MindMapCanvas   ToolPanel   PresentationMode
ToolBar   (lienzo SVG)    (inspector) (slides 100vh)
FilterBar    │                │
StatusBar    ▼                ▼
         NodeComponent   6 Tabs (Organismos)
         MiniMap              │
                              ▼
                      Moleculas + Atomos
```

### 1.1. Diagrama de Capas (Atomic Design)

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGINA (App.tsx)                                               │
│  Orquestador: compone organismos, gestiona modales y foco       │
├─────────────────────────────────────────────────────────────────┤
│  ORGANISMOS (componentes de pagina completa)                    │
│  MenuBar · ToolBar · FilterBar · MindMapCanvas · OutlineView    │
│  ToolPanel · PresentationMode · StatusBar · MiniMap · Modals/   │
│  ├── organisms/toolpanel/  (6 tabs especializados)              │
│  │   ├── ContentTab · FormatTab · NotesTab                      │
│  │   └── IconsTab · CloudsTab · ThemeTab                        │
│  ├── organisms/canvas/     (CanvasContextMenu, ZoomControls)    │
│  └── organisms/presentation/ (controles + 7 temas visuales)     │
├─────────────────────────────────────────────────────────────────┤
│  MOLECULAS (combinaciones reutilizables)                        │
│  FontFormatToolbar · ShapeSelector · TagManager                 │
├─────────────────────────────────────────────────────────────────┤
│  ATOMOS (elementos UI primitivos)                               │
│  CollapsibleSection · ColorPicker · SliderInput                 │
│  ToggleButton · ToggleButtonGroup                              │
├─────────────────────────────────────────────────────────────────┤
│  HOOKS (logica reutilizable y store)                            │
│  useMindMapStore · useSearchFilter · useKeyboardShortcuts       │
├─────────────────────────────────────────────────────────────────┤
│  UTILS (funciones puras, sin estado)                            │
│  layoutEngine · themes · storage · freeplaneConverter           │
│  htmlExporter · connectorUtils · markdownRenderer               │
│  iconMap · vectorIconPack · sampleMaps · additionalTemplates    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Datos (Zustand — Reactivo Unidireccional)

```
Store Global (useMindMapStore — Zustand)
  [mindMap: MindMap]          -- unica fuente de verdad del mapa
  [historyPast: MindMap[]]    -- pila undo (max 40)
  [historyFuture: MindMap[]]  -- pila redo
  [selectedNodeId: string]    -- nodo actualmente seleccionado
  [editingNodeId: string]     -- nodo en modo edicion de texto
  [focusTarget: {...} | null] -- senal de auto-zoom y centrado de nodo
  [isPresentationMode: bool]  -- activa overlay de presentacion
  [isOutlineOpen: bool]       -- panel esquema izquierdo
  [isOutlineFullscreen: bool] -- esquema en pantalla completa
  [isToolPanelOpen: bool]     -- panel propiedades derecho
  [isFilterBarOpen: bool]     -- barra de busqueda
  [clipboard: {...}]          -- portapapeles de nodo/subtree
  [filterOptions: {...}]      -- criterios de filtrado activos

Flujo de mutacion:
  Componente --> store.pushHistory(current) + store.setMindMap(nuevo)
                 --> subscripcion Zustand --> React re-render
                 --> useEffect --> saveCurrentMap() --> localStorage
```

### 2.1. Propagacion de Estilos y de Iconos

El store desacopla deliberadamente la propagacion de estilo general de la de iconos:

1. **`handleApplyStyleToChildren / handleApplyStyleToSiblings`**:
   - Propaga exclusivamente el `extractNodeStyleBundle` (forma, colores de fondo, degradados, tramas, imagen de fondo, bordes, aristas, tipografia de titulo y cuerpo).
2. **`handleApplyIconsToChildren / handleApplyIconsToSiblings`**:
   - Propaga exclusivamente el `iconBundle` (`icons`, `iconColor`, `iconSize`, `iconPosition`), sin alterar fondos, bordes ni geometrias de los nodos.

---

## 3. Modelo de Datos (`types/mindmap.ts`)

### 3.1. `MindNode` (Nodo del Mapa Mental)

```typescript
export interface MindNode {
  id: string;
  text: string;
  parentId: string | null;
  children: string[];
  folded?: boolean;
  side?: NodeSide; // 'left' | 'right' | 'root' | 'bottom' | 'top' | 'radial' | 'circular'
  
  // Geometria y Formas (10 opciones)
  shape?: NodeShape; // 'bubble' | 'fork' | 'rectangle' | 'square' | 'oval' | 'circle' | 'hexagon' | 'pill' | 'arrow' | 'star'
  customWidth?: number;
  customHeight?: number;
  
  // Fondo y Relleno
  color?: string; // Color solido o base
  bgType?: NodeBackgroundType; // 'color' | 'transparent' | 'gradient' | 'pattern' | 'image'
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: NodeGradientDirection; // 'to-r' | 'to-b' | 'to-br' | 'radial'
  nodePattern?: NodePatternStyle; // 'dots' | 'lines' | 'squares' | 'stripes' | 'triangles' | 'hexagons' | 'cross'
  nodePatternColor?: string;
  nodePatternSize?: number;
  nodePatternOpacity?: number;

  // Imagen de Fondo del Nodo
  bgImageUrl?: string;
  bgImageMode?: NodeBgImageMode; // 'fit' | 'cover' | 'contain' | 'tile'
  bgImageOpacity?: number;

  // Bordes
  borderColor?: string;
  borderWidth?: number;
  borderDash?: 'solid' | 'dashed' | 'dotted';
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // Imagen Adjunta de Contenido
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'between' | 'background' | 'fit';

  // Tipografia de Titulo
  textColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Tipografia de Cuerpo (Body)
  body?: string;
  bodyFontSize?: number;
  bodyBold?: boolean;
  bodyItalic?: boolean;
  bodyColor?: string;
  bodyFontFamily?: string;
  bodyAlign?: 'left' | 'center' | 'right';
  
  // Aristas hacia hijos
  edgeColor?: string;
  edgeStyle?: EdgeStyle; // 'bezier' | 'linear' | 'sharp' | 'horizontal' | 'hidden'
  edgeWidth?: number;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeProfile?: EdgeProfile; // 'uniform' | 'tapered' | 'spindle' | 'hourglass'
  
  // Iconos y Enriquecimiento
  icons?: string[];
  iconPosition?: 'left' | 'top';
  iconColor?: string; // Tinte de color SVG para iconos vectoriales
  iconSize?: number;  // Escala en px (10px a 36px)
  tags?: string[];
  progress?: number;  // 0 a 100
  progressPosition?: 'left' | 'top';
  link?: string;
  note?: string;      // Markdown extenso
  details?: string;

  // Visibilidad de elementos (Ojos)
  hideBody?: boolean;
  hideImage?: boolean;
  hideTags?: boolean;
  hideIcons?: boolean;
  hideLink?: boolean;
  hideProgress?: boolean;
  
  // Nube / Agrupador
  cloud?: NodeCloud;
}
```

### 3.2. `MindMap` (Estructura Global del Mapa)

```typescript
export interface MindMap {
  id: string;
  title: string;
  rootId: string;
  nodes: Record<string, MindNode>;
  layout: LayoutType;
  themeId: string;
  
  // Fondo Global del Lienzo
  backgroundColor?: string;
  backgroundPattern?: BackgroundPatternStyle; // 'none' | 'dots' | 'lines' | 'squares' | 'triangles' | 'hexagons'
  backgroundPatternColor?: string;
  backgroundPatternSize?: number;
  backgroundPatternOpacity?: number;

  // Aristas Globales
  edgeStyle?: EdgeStyle;
  edgeProfile?: EdgeProfile;
  edgeWidth?: number;
  edgeDash?: 'solid' | 'dashed' | 'dotted';
  edgeColor?: string;

  // Espaciados
  horizontalGap?: number;
  verticalGap?: number;

  // Conectores cruzados
  connectors?: Connector[];

  createdAt: number;
  updatedAt: number;
}
```

---

## 4. Componentes y Arquitectura UI

### 4.1. `NodeComponent.tsx` (Renderizado de Nodos)

- **Forma Burbuja (`bubble`)**:
  - Incorpora una cola/punta triangular exterior SVG (`12x16px`) que apunta directamente hacia el lateral de su rama de conexion (`side === 'left'` o `'right'`).
  - Mantiene el contenido interno (imagenes, titulo, cuerpo, tags, links) perfectamente centrado y contenido sin recortes ni desbordamientos.
- **Forma Horquilla (`fork`)**:
  - Mantiene su linea base de apoyo tradicional de Freeplane respetando plenamente los fondos personalizados del nodo (color, degradado, trama o imagen de fondo), sin forzar transparencias indeseadas.
- **Formas Poligonales SVG**:
  - Hexagonos, flechas de direccion y estrellas de 5 puntas renderizadas con SVG vectorial nítido.
- **Iconos Vectoriales con Tinte y Escala**:
  - `renderNodeIcon(iconId, className, node.iconColor, node.iconSize)` aplica estilos CSS en tiempo real (`color`, `width`, `height`).
- **Fondos Desacoplados**:
  - Capa inferior de imagen de fondo (`bgImageUrl`) independiente de la imagen adjunta de contenido (`imageUrl`).

### 4.2. `MindMapCanvas.tsx` (Lienzo Infinito SVG/HTML)

- Pan y Zoom continuos con aceleracion por hardware (`translate3d`, `scale`).
- **Auto-Zoom al Enfocar**: Recibe `focusTarget: { nodeId, timestamp }` y traslada el centro de la camara sobre el nodo seleccionado con un nivel de zoom cercano (`~1.15x`).
- Renderizado de aristas curvas, ahusadas (*tapered*), de huso (*spindle*) o reloj de arena (*hourglass*).
- Renderizado de nubes poligonales y festoneadas con borde personalizable.
- Gestion de arrastre (Drag & Drop) para reordenar y re-emparentar ramas.

### 4.3. `OutlineView.tsx` (Panel de Esquema)

- Vista estructurada en arbol de texto editable con atajos rapidos.
- Al hacer clic en cualquier fila de nodo, emite una senal `setFocusTarget` que enfoca y hace zoom inmediatamente en el lienzo sobre dicho nodo.
- Soporta busqueda, filtrado de texto, plegado/desplegado y modo pantalla completa.

### 4.4. `ToolPanel.tsx` y los 6 Tabs Organismos

1. **`ContentTab.tsx`**:
   - Titulo, cuerpo de texto (`body`), tipografia independiente, alineacion, imagen adjunta de contenido y toggle de visibilidad (ojos).
2. **`FormatTab.tsx`**:
   - Selector de 10 formas, fondos solidos/degradados/tramas/imagen de fondo, bordes con tarjetas visuales de 3 estilos (`solid`, `dashed`, `dotted`), aristas individuales y propagacion de estilo a hijos/hermanos.
3. **`NotesTab.tsx`**:
   - Editor Markdown enriquecido, enlace externo/interno, barra de progreso interactiva (0% a 100%).
4. **`IconsTab.tsx`**:
   - Seccion plegable **"Color y Tamaño de Iconos"** (`CollapsibleSection`).
   - Selector de color (`ColorPicker`) con paleta de colores sugeridos.
   - Deslizador de tamaño (`SliderInput`) de `10px` a `36px`.
   - Botones de **"Copiar a Hijos"** y **"Copiar a Hermanos"** aislados exclusivamente para la configuracion de iconos.
   - Buscador rapido y galeria de categorias con mas de 500 iconos vectoriales Lucide.
5. **`CloudsTab.tsx`**:
   - Nubes de agrupacion con selector de 8 formas, fondos avanzados y tarjetas visuales de 3 columnas para estilo de borde.
6. **`ThemeTab.tsx`**:
   - Temas visuales globales, algoritmos de diseño (*Layout*), aristas globales y seccion **"Fondo del Lienzo"** con tarjetas visuales de 6 patrones de rejilla (*Liso, Puntos, Líneas, Cuadros, Triángulos, Panal*), selector de color del trazo del patron, tamaño y opacidad.

---

## 5. Utilidades del Sistema (`src/utils/`)

| Archivo | Responsabilidad |
| :--- | :--- |
| **`layoutEngine.ts`** | Calculo matematico de coordenadas de nodos, arboles bilaterales, radiales y verticales, curvas de conexion y nubes. |
| **`iconMap.tsx`** | Mapeo de identificadores a iconos vectoriales con soporte dinamico de `customColor` y `customSize`. |
| **`vectorIconPack.tsx`** | Repositorio de mas de 500 iconos clasificados en 20 categorias con indexacion y busqueda. |
| **`freeplaneConverter.ts`** | Parser y serializador bidireccional XML compatible con Freeplane / FreeMind (`.mm`). |
| **`htmlExporter.ts`** | Generador de archivo HTML autonomo 100% portable con visor interactivo embebido. |
| **`connectorUtils.ts`** | Geometria de lineas de conexion cruzada con control interactivo de curvatura y flechas. |
| **`storage.ts`** | Capa de persistencia local en `localStorage` con indexacion de mapas guardados. |
| **`sampleMaps.ts` & `additionalTemplates.ts`** | Catalogo completo de plantillas tematicas actualizadas con todas las funciones visuales activas. |

---

## 6. Atajos de Teclado Globales

- **`Tab` / `Insert`**: Crear nuevo nodo hijo.
- **`Enter`**: Crear nuevo nodo hermano.
- **`F2` / `Doble Clic`**: Editar texto del nodo.
- **`Espacio`**: Plegar / Desplegar rama.
- **`Delete` / `Backspace`**: Eliminar nodo seleccionado.
- **`Ctrl + Z` / `Ctrl + Y`**: Deshacer / Rehacer historial.
- **`Ctrl + C` / `Ctrl + X` / `Ctrl + V`**: Copiar / Cortar / Pegar ramas completas.
- **`Alt + O`**: Alternar panel de Esquema (*Outline*).
- **`Alt + P`**: Alternar panel de Propiedades (*ToolPanel*).
- **`Ctrl + F`**: Barra de busqueda y filtrado interactivo.
- **`F5`**: Iniciar Modo Presentacion en pantalla completa.
- **`Ctrl + +` / `Ctrl + -` / `Ctrl + 0`**: Zoom In / Zoom Out / Ajustar vista al 100%.

---

## 3. Estructura de Datos Clave

### 3.1. MindMap (mapa completo)
```typescript
interface MindMap {
  id: string                    // identificador unico
  title: string                 // titulo editable del mapa
  rootId: string                // ID del nodo raiz
  nodes: Record<string, MindNode> // TODOS los nodos indexados por ID
  connectors: Connector[]       // conectores cruzados flotantes
  layout: LayoutType            // algoritmo de layout activo
  themeId: string               // tema visual activo

  // Fondo del lienzo (sobreescribe el tema si se configura)
  backgroundColor?: string
  backgroundPattern?: BackgroundPatternStyle
  backgroundPatternColor?: string
  backgroundPatternSize?: number
  backgroundPatternOpacity?: number

  // Aristas globales del mapa (overrideable por nodo)
  edgeStyle?: EdgeStyle         // bezier | linear | sharp | horizontal | hidden
  edgeWidth?: number
  edgeColor?: string
  edgeDash?: solid | dashed | dotted
  edgeProfile?: EdgeProfile     // uniform | tapered | spindle | hourglass
  horizontalGap?: number        // espacio horizontal entre niveles
  verticalGap?: number          // espacio vertical entre hermanos

  createdAt: number             // timestamp
  updatedAt: number             // timestamp (auto-actualizado en cada cambio)
}
```

### 3.2. MindNode (nodo individual)
```typescript
interface MindNode {
  // Estructura del arbol
  id: string
  text: string                  // titulo/texto principal
  parentId: string | null       // null solo en el nodo raiz
  children: string[]            // IDs de los hijos en orden
  folded?: boolean              // true = hijos ocultos en el lienzo
  side?: NodeSide               // left | right | root | bottom | top | radial | circular

  // Apariencia / Forma
  shape?: NodeShape             // bubble | fork | rectangle | square | oval | circle | pill | hexagon | arrow | star
  customWidth?: number          // ancho fijo (50-500px, 0 = auto)
  customHeight?: number         // alto fijo (30-300px, 0 = auto)

  // Fondo del nodo (4 modos)
  color?: string                // color solido o acento
  bgType?: NodeBackgroundType   // color | transparent | gradient | pattern | image
  gradientColor1?: string
  gradientColor2?: string
  gradientDirection?: to-r | to-b | to-br | radial
  nodePattern?: NodePatternStyle  // dots | lines | squares | stripes | triangles | hexagons | cross
  nodePatternColor?: string
  nodePatternSize?: number
  nodePatternOpacity?: number

  // Imagen de fondo interno del nodo
  bgImageUrl?: string
  bgImageMode?: fit | cover | contain | tile
  bgImageOpacity?: number

  // Bordes y contornos
  borderColor?: string
  borderWidth?: number          // 0-8px
  borderDash?: solid | dashed | dotted
  borderStyle?: solid | dashed | dotted

  // Imagen de contenido adjunta al nodo
  imageUrl?: string
  imageWidth?: number           // 60-300px
  imageHeight?: number
  imagePosition?: top | bottom | left | right | between | background | fit

  // Tipografia del titulo
  textColor?: string
  fontSize?: number
  bold?: boolean
  italic?: boolean
  fontFamily?: string
  textAlign?: left | center | right

  // Tipografia del cuerpo (subtexto)
  body?: string                 // texto adicional del nodo
  bodyFontSize?: number
  bodyBold?: boolean
  bodyItalic?: boolean
  bodyColor?: string
  bodyFontFamily?: string
  bodyAlign?: left | center | right

  // Aristas de este nodo (override del mapa)
  edgeColor?: string
  edgeStyle?: EdgeStyle
  edgeWidth?: number
  edgeDash?: solid | dashed | dotted
  edgeProfile?: EdgeProfile

  // Metadatos
  icons?: string[]              // IDs de iconos del iconMap
  tags?: string[]               // etiquetas de texto libre
  progress?: number             // 0-100 (barra de progreso)
  link?: string                 // URL, mailto: o #nodeId
  note?: string                 // nota en Markdown
  details?: string              // detalles adicionales

  // Nodo libre (Post-it)
  isFreeFloating?: boolean      // true = posicion manual en el lienzo
  freePosition?: {x: number, y: number}

  // Nube de agrupacion
  cloud?: NodeCloud             // {enabled, color, shape}
}
```

### 3.3. Connector (conector cruzado flotante)
```typescript
interface Connector {
  id: string
  fromId: string                // nodo de origen
  toId: string                  // nodo de destino
  label?: string                // etiqueta de texto flotante
  color?: string
  style?: solid | dashed | dotted
  arrow?: start | end | both | none
  curvature?: number
  shape?: curved | bezier | straight | step
  width?: number
  controlPoint?: {x: number, y: number}  // punto Bezier ajustable
  layer?: above | below         // si se dibuja encima o debajo de los nodos
  opacity?: number
}
```

---

## 4. Arquitectura de Componentes (Atomic Design)

### 4.1. Atomos (`src/components/atoms/`)

Componentes UI primitivos, sin logica de negocio, 100% reutilizables:

| Atomo | Archivo | Responsabilidad |
|:------|:--------|:----------------|
| `CollapsibleSection` | CollapsibleSection.tsx | Seccion con cabecera clickeable que expande/colapsa contenido hijo |
| `ColorPicker` | ColorPicker.tsx | Input de color con campo hex y paleta rapida de presets |
| `SliderInput` | SliderInput.tsx | Slider numerico con input editable y rango configurable |
| `ToggleButton` | ToggleButton.tsx | Boton binario on/off con estado visual activo |
| `ToggleButtonGroup` | ToggleButtonGroup.tsx | Grupo exclusivo de ToggleButtons (solo uno activo a la vez) |

### 4.2. Moleculas (`src/components/molecules/`)

Combinaciones de atomos que forman controles especificos del dominio:

| Molecula | Archivo | Composicion |
|:---------|:--------|:------------|
| `FontFormatToolbar` | FontFormatToolbar.tsx | ToggleButtons de bold/italic + selector de fuente + slider de tamano + ColorPicker |
| `ShapeSelector` | ShapeSelector.tsx | Grid de ToggleButtons con preview visual de las 10 formas geometricas |
| `TagManager` | TagManager.tsx | Lista de chips con X para eliminar + input con Enter para agregar nuevos tags |

### 4.3. Organismos (`src/components/organisms/`)

Componentes complejos que componen secciones funcionales completas:

#### 4.3.1. Organismos del ToolPanel (`organisms/toolpanel/`)

El ToolPanel se dividio en 6 pestanas-organismo independientes:

| Tab | Archivo | Contenido |
|:----|:--------|:----------|
| `ContentTab` | ContentTab.tsx | Titulo, cuerpo, tipografia titulo, tipografia cuerpo |
| `FormatTab` | FormatTab.tsx | Forma, geometria, fondo (4 modos), contornos/bordes, imagenes, aristas |
| `NotesTab` | NotesTab.tsx | Nota Markdown con preview, enlace URL, progreso |
| `IconsTab` | IconsTab.tsx | Grid de iconos toggle + boton abrir IconPackModal |
| `CloudsTab` | CloudsTab.tsx | Toggle nube on/off, forma, color RGBA |
| `ThemeTab` | ThemeTab.tsx | Tema del mapa (9), layout (9), fondo lienzo (12), aristas globales, espaciado |

#### 4.3.2. Organismos del Canvas (`organisms/canvas/`)

| Componente | Archivo | Responsabilidad |
|:-----------|:--------|:----------------|
| `CanvasContextMenu` | CanvasContextMenu.tsx | Menu contextual (clic derecho) con opciones de nodo |
| `CanvasZoomControls` | CanvasZoomControls.tsx | Controles de zoom (+, -, porcentaje, ajustar, fullscreen) |

#### 4.3.3. Organismos de Presentacion (`organisms/presentation/`)

| Componente | Archivo | Responsabilidad |
|:-----------|:--------|:----------------|
| `PresentationControls` | PresentationControls.tsx | Barra superior + modal de opciones de presentacion |
| `presentationThemes` | presentationThemes.ts | Definicion de los 7 temas de presentacion (datos, no componente) |

### 4.4. Paginas / Componentes de Alto Nivel (`src/components/`)

| Componente | Archivo | Tamaño | Responsabilidad |
|:-----------|:--------|:-------|:----------------|
| `MenuBar` | MenuBar.tsx | ~26KB | Barra de menu superior con dropdowns (Archivo/Editar/Insertar/Formato/Ver/Ayuda) |
| `ToolBar` | ToolBar.tsx | ~29KB | Herramientas rapidas: edicion de arbol, tipografia, forma, historia, zoom, paneles |
| `FilterBar` | FilterBar.tsx | ~4KB | Barra de busqueda colapsable con filtros acumulativos (texto, tag, progreso) |
| `MindMapCanvas` | MindMapCanvas.tsx | ~55KB | Lienzo infinito con pan/zoom, drag&drop, SVG aristas/nubes/conectores, MiniMap |
| `NodeComponent` | NodeComponent.tsx | ~32KB | Renderizado visual de cada nodo (10 formas, fondo, imagen, tags, edicion inline) |
| `ToolPanel` | ToolPanel.tsx | ~10KB | Contenedor de tabs: delega renderizado a los 6 organismos del toolpanel |
| `PresentationMode` | PresentationMode.tsx | ~52KB | Overlay fullscreen: 3 fases por nodo, auto-paginacion, 7 temas, jump history |
| `OutlineView` | OutlineView.tsx | ~17KB | Vista de esquema en arbol (panel izquierdo), edicion inline, plegar/desplegar |
| `MiniMap` | MiniMap.tsx | ~18KB | Minimapa radar flotante en 3 tamanos (S/M/L) |
| `StatusBar` | StatusBar.tsx | ~2KB | Barra de estado inferior (nodos, seleccion, zoom, posicion, modo) |

### 4.5. Modales (`src/components/Modals/`)

| Modal | Archivo | Funcion |
|:------|:--------|:--------|
| `ExportImportModal` | ExportImportModal.tsx | Exportar (6 formatos) / Importar (2 formatos) |
| `TemplatesModal` | TemplatesModal.tsx | Galeria de plantillas predefinidas con ilustraciones SVG |
| `SavedMapsModal` | SavedMapsModal.tsx | Listar, cargar, eliminar mapas guardados en localStorage |
| `ConnectorModal` | ConnectorModal.tsx | Crear/editar conector cruzado entre nodos |
| `IconPackModal` | IconPackModal.tsx | Galeria de iconos vectoriales por categorias |
| `ShortcutsModal` | ShortcutsModal.tsx | Referencia de atajos de teclado (solo lectura) |
| `ComingSoonModal` | ComingSoonModal.tsx | Aviso "Proximamente" para modos elaborado/dinamico |

---

## 5. Hooks Personalizados (`src/hooks/`)

### 5.1. useMindMapStore.ts (Store Zustand — 582 lineas)

Store centralizado que contiene TODA la logica de negocio de la aplicacion.

**Estado gestionado:**
- `mindMap` — objeto MindMap completo (fuente de verdad)
- `historyPast` / `historyFuture` — pilas de undo/redo (max 40)
- `selectedNodeId` / `editingNodeId` — seleccion y edicion activa
- `isOutlineOpen` / `isOutlineFullscreen` — panel de esquema
- `isPresentationMode` — modo presentacion
- `isToolPanelOpen` / `isFilterBarOpen` — paneles laterales
- `filterOptions` — criterios de filtrado activos
- `clipboard` — portapapeles de nodo/subtree (copy/cut)

**Acciones implementadas:**
```typescript
// Setters de estado
setMindMap(mapOrUpdater)
setSelectedNodeId(id)
setEditingNodeId(id)
setIsOutlineOpen(open)
setIsPresentationMode(mode)
setIsToolPanelOpen(open)
setIsFilterBarOpen(open)
setFilterOptions(optionsOrUpdater)

// Historial
pushHistory(map)     // guarda estado actual antes de mutacion
handleUndo()         // retrocede un estado
handleRedo()         // avanza un estado

// CRUD de nodos
updateNode(nodeId, updates)         // Partial<MindNode>
handleAddChild(parentId?)           // Tab / Insert
handleAddSibling(siblingId?)        // Enter
handleDeleteNode(nodeIdToDelete?)   // Supr / Backspace
handleToggleFold(nodeId?)           // Espacio
handleFoldAll()                     // Plegar todo el arbol
handleUnfoldAll()                   // Desplegar todo el arbol
handleReparentNode(draggedId, targetParentId)  // Drag & Drop

// Portapapeles
handleCopyNode(nodeId?)             // Ctrl+C
handleCutNode(nodeId?)              // Ctrl+X
handlePasteNode(targetParentId?)    // Ctrl+V (clona con nuevos IDs)

// Propagacion de estilos
handleApplyStyleToChildren(nodeId?) // Aplica estilo a hijos directos
handleApplyStyleToSiblings(nodeId?) // Aplica estilo a hermanos
```

**Inicializacion:** Al crear el store, carga el mapa de localStorage via `loadCurrentMap()`.
Si no existe, carga `TUTORIAL_MAP` como mapa de bienvenida.

**Auto-guardado:** Cada vez que `setMindMap` es invocado, un subscriber persiste en localStorage.

### 5.2. useSearchFilter.ts (52 lineas)

Hook puro que calcula filtros de busqueda reactivamente:

- **Input:** `mindMap`, `filterOptions`
- **Output:** `{ searchMatches: Set<string>, availableTags: string[] }`
- Usa `useMemo` para recalcular solo cuando cambian los datos
- Filtra por: texto (titulo + nota), tag, progreso minimo

### 5.3. useKeyboardShortcuts.ts (222 lineas)

Hook que registra los atajos de teclado globales:

- Se conecta directamente al store Zustand via `useMindMapStore()`
- Registra un `addEventListener('keydown')` en `useEffect`
- Se deshabilita cuando: hay un input activo, modal abierto, o modo presentacion
- Recibe `isAnyModalOpen` y `onCloseModals` como props

---

## 6. Componentes Principales (Detalle)

### 6.1. App.tsx (Orquestador / Pagina)

Componente raiz que actua como compositor:

Responsabilidades (v2 — reducidas respecto a v1):
- Consumir el store Zustand via `useMindMapStore()`
- Gestionar estado local de modales (isExportModalOpen, etc.)
- Instanciar `useKeyboardShortcuts()` y `useSearchFilter()`
- Calcular `currentTheme` y `selectedNode` como derivados
- Componer el arbol de componentes (layout, paneles, modales)

Lo que ya NO hace (delegado al store Zustand):
- Definir handlers de mutacion de nodos
- Gestionar historial undo/redo manualmente
- Contener la logica de portapapeles
- Auto-guardar en localStorage

### 6.2. MindMapCanvas.tsx (Lienzo SVG/HTML Infinito)

El lienzo es una capa HTML con un contenedor SVG incrustado para las aristas.
Implementa pan y zoom via transformaciones CSS (translate + scale).

Mecanismos internos:
- Estado de pan: {x, y} + isPanning (MouseDown/Move/Up)
- Estado de zoom: numero (rueda del raton o botones)
- Drag and Drop de nodos: draggedNodeId + dragOverNodeId
- ContextMenu: visible | x | y | nodeId (clic derecho) → CanvasContextMenu organismo
- Calcula el layout llamando a computeMindMapLayout() de layoutEngine.ts
- Renderiza aristas en SVG (generateEdgePath / generateRibbonEdgePath)
- Renderiza nubes en SVG (computeCloudBounds)
- Renderiza conectores cruzados en SVG (calculateConnectorGeometry)
- Renderiza cada nodo como NodeComponent
- Integra el MiniMap como componente flotante
- Utiliza CanvasZoomControls como organismo para controles de zoom

Interacciones del lienzo:
  Clic en nodo       --> seleccionar nodo (setSelectedNodeId)
  Doble clic en nodo --> iniciar edicion de texto (setEditingNodeId)
  Clic derecho nodo  --> mostrar menu contextual (CanvasContextMenu)
  Clic en lienzo     --> deseleccionar (setSelectedNodeId(null))
  Arrastrar lienzo   --> pan (sin nodo seleccionado)
  Arrastrar nodo     --> Drag and Drop reparenting
  Rueda del raton    --> zoom in/out

### 6.3. NodeComponent.tsx (Renderizado de un Nodo)

Renderiza visualmente cada nodo segun sus propiedades.
El padre (MindMapCanvas) le pasa la posicion/tamano calculados por layoutEngine.

Elementos que renderiza:
  - Geometria de la forma (bubble/fork/rectangle/square/oval/circle/pill/hexagon/arrow/star)
    * bubble/pill/rectangle/square/oval/circle: <div> con CSS (border-radius, clip-path)
    * hexagon/arrow/star: <svg> con polygon points calculados dinamicamente
  - Imagen de fondo (bgImageUrl): <img> con opacity como layer inferior
  - Patron de fondo (nodePattern): SVG data URI renderizado via CSS background
  - Degradado (gradient): gradiente CSS lineal o radial
  - Iconos: fila de iconos renderizados por iconMap / vectorIconPack
  - Texto del titulo (con bold, italic, fuente, color, alineacion)
  - Imagen de contenido (imageUrl): <img> en posicion configurada
  - Texto del cuerpo (body): subtexto secundario con su tipografia
  - Barra de progreso: si progress >= 0
  - Tags: chips de color al pie del nodo
  - Badge de enlace: si hay link configurado
  - Indicador de nota: si hay note (icono de nota)
  - Boton plegar/desplegar: '+N' si el nodo tiene hijos y esta plegado
  - Resaltado de busqueda: si el nodo esta en searchMatches
  - Input de edicion inline: cuando editingNodeId === node.id

### 6.4. ToolPanel.tsx (Panel Inspector Derecho — Contenedor de Tabs)

Componente contenedor que orquesta 6 pestanas-organismo.
Cada tab es un componente independiente que recibe las props necesarias.

Pestanas (navegacion grid 6 columnas):
1. **Contenido** (ContentTab) — Titulo, cuerpo, tipografia
2. **Formato** (FormatTab) — Forma, fondo, bordes, imagenes, aristas
3. **Notas** (NotesTab) — Nota Markdown, enlace, progreso
4. **Iconos** (IconsTab) — Grid de iconos + boton pack completo
5. **Nubes** (CloudsTab) — Toggle nube, forma, color
6. **Tema** (ThemeTab) — Tema del mapa, layout, fondo lienzo, aristas globales

### 6.5. PresentationMode.tsx (Modo Presentacion Clasica)

Overlay de pantalla completa (fixed inset-0, z-50) que reemplaza visualmente
toda la interfaz. NO modifica el mapa; es solo lectura.

Utiliza organismos extraidos:
- `PresentationControls` — barra superior y modal de opciones
- `presentationThemes` — definiciones de los 7 temas

Estado interno del componente:
  themeId: string               -- tema de presentacion activo ('dark-studio')
  showNotes: boolean            -- incluir diapositivas de notas (true)
  imageSize: small|medium|large|hidden  -- tamano de imagenes adjuntas ('medium')
  showChildrenCards: boolean    -- incluir diapositivas de subtemas (true)
  showConnectorsCards: boolean  -- mostrar conectores en slides de subtemas (true)
  contentAlign: center|left     -- alineacion del contenido ('center')
  fontSizeScale: compact|normal|large  -- escala del titulo ('normal')
  currentIndex: number          -- indice de la diapositiva activa
  isConfigOpen: boolean         -- modal de configuracion abierto
  jumpHistory: number[]         -- pila de indices de origen (Volver)

Generacion de slides (useMemo re-calcula cuando cambia mindMap u opciones):
  Algoritmo traverse() recorre el arbol en profundidad (DFS) y por cada nodo genera:

  FASE 1: body
    splitBodyTextIntoSlideChunks(node.body, hasImage)
      Si NO hay imagen: maximo 6 lineas / 450 chars por chunk
      Si HAY imagen:    maximo 4 lineas / 280 chars por chunk
      Resultado: 1..N slides tipo body con bodySubset

  FASE 2: notes (solo si showNotes=true y node.note existe)
    splitMarkdownIntoSlideChunks(node.note)
      Maximo 9 lineas / 550 chars por chunk
      Resultado: 1..N slides tipo notes con noteSubset

  FASE 3: children (solo si showChildrenCards=true y children.length > 0)
    Lotes de 6 hijos por slide
    Resultado: ceil(N/6) slides tipo children con childrenSubset: string[]

  Luego traverse() desciende recursivamente a cada hijo.

Navegacion:
  handleNext()       -- avanza currentIndex++ (tope en slides.length-1)
  handlePrev()       -- retrocede currentIndex-- (tope en 0)
  handleJumpToNode() -- salta al primer slide 'body' del nodo clicado.
                        Guarda currentIndex en jumpHistory (push)
  handleReturnJump() -- regresa al ultimo jumpHistory (pop) via Backspace

### 6.6. OutlineView.tsx (Vista de Esquema — Panel Izquierdo)

Panel lateral izquierdo que muestra el mapa como arbol de texto.
Puede estar en modo panel lateral o modo pantalla completa (fullscreen).

Funciones:
  Seleccionar nodo    --> hace scroll en el lienzo al nodo
  Doble clic          --> editar texto del nodo inline
  Boton + Hijo        --> handleAddChild(nodeId)
  Boton + Hermano     --> handleAddSibling(nodeId)
  Boton X Eliminar    --> handleDeleteNode(nodeId)
  Toggle Plegar       --> handleToggleFold(nodeId)
  Plegar todo / Desplegar todo

### 6.7. MenuBar.tsx (Barra de Menu Superior — 48px)

Menus desplegables implementados con estado local (openMenu).
Cierra el menu al hacer clic fuera (useEffect con mousedown listener).

Menu [Archivo]:
  Nuevo Mapa         -- crea BLANK_MAP con nuevo timestamp
  Abrir / Importar   -- abre ExportImportModal
  Guardar ahora      -- saveCurrentMap() a localStorage
  Mis Mapas Guardados-- abre SavedMapsModal
  Plantillas         -- abre TemplatesModal
  Exportar           -- abre ExportImportModal
  Imprimir PDF       -- window.print()

Menu [Editar]:
  Deshacer / Rehacer
  Cortar / Copiar / Pegar
  Eliminar Nodo
  Editar Texto (F2)
  Buscar (Ctrl+F)

Menu [Insertar]:
  Nuevo Hijo / Hermano
  Notas, Enlace, Progreso, Iconos, Tags, Imagen, Conector, Nube

Menu [Formato]:
  Temas: 9 temas visuales (cambia mindMap.themeId)
  Formas: 10 formas (cambia selectedNode.shape)
  Restablecer Formato: elimina sobreescrituras de estilo del nodo

Menu [Ver]:
  Centrar / Ajustar / Zoom
  Panel Esquema (Alt+O)
  Panel Propiedades (Alt+P)
  MiniMapa (Alt+M)
  Plegar todo / Desplegar todo
  Pantalla Completa (requestFullscreen)
  Presentacion (F5)

Titulo del mapa: editable inline (doble clic sobre el titulo activa un input)

### 6.8. ToolBar.tsx (Barra de Herramientas — 44px)

Accesos directos graficos a las operaciones mas frecuentes.
Los botones reflejan el estado del nodo seleccionado (negrita activa = boton resaltado).

Grupos:
  Edicion de arbol: +Hijo / +Hermano / Eliminar / Plegar
  Tipografia: Negrita / Cursiva (aplica al titulo del nodo seleccionado)
  Forma rapida: selector de forma via dropdown
  Decoracion: Nube / Conector
  Historia: Deshacer / Rehacer
  Vista: Zoom -, porcentaje, Zoom +, Ajustar, Pantalla completa
  Paneles: Toggle esquema / Toggle panel propiedades / Toggle filtro
  Exportar: boton directo
  Presentacion: boton F5

### 6.9. FilterBar.tsx (Barra de Filtro — 40px, colapsable)

Se activa con Ctrl+F o el boton de filtro en ToolBar.
Todos los filtros son acumulativos (AND logico).

Controles:
  Campo de busqueda de texto (busca en titulo y nota del nodo)
  Selector de Tag (dropdown con los tags presentes en el mapa)
  Selector de Progreso minimo (0-100)
  Selector de Icono (dropdown con iconos presentes)
  Toggle 'Mostrar Ancestros': muestra los nodos padres del resultado
  Toggle 'Mostrar Descendientes': muestra los hijos del resultado
  Boton Limpiar Filtros
  Contador de coincidencias: 'N coincidencias'

El calculo de coincidencias se realiza en `useSearchFilter` hook.
El lienzo recibe el Set resultante y lo pasa a NodeComponent para resaltar nodos.

### 6.10. MiniMap.tsx (Minimapa Radar Flotante)

Flotante en la esquina inferior izquierda del lienzo.
Muestra una representacion a escala de todos los nodos del mapa.

Tamanos:
  S: 160px ancho
  M: 220px ancho
  L: 300px ancho

Interaccion:
  Clic en el minimapa --> mueve el pan del lienzo al punto clicado
  Rectangulo de camara activa: representa la porcion del lienzo visible
  Botones S/M/L: cambian el tamano del minimapa

### 6.11. StatusBar.tsx (Barra de Estado — 24px)

Barra informativa fija en la parte inferior.
Muestra:
  Nodos totales en el mapa
  Nodo seleccionado (texto + ID)
  Zoom actual
  Posicion de pan (X, Y)
  Modo actual: 'Listo' | 'Editando'

---

## 7. Modales

### 7.1. ExportImportModal.tsx

Exportar (6 formatos):
  .mm XML     -- serializa el MindMap al formato XML de Freeplane
               -- funcion: freeplaneConverter.ts exportToFreeplaneXML()
  .html       -- genera HTML autonomo con mapa interactivo embebido
               -- funcion: htmlExporter.ts exportToHTML()
  .svg        -- captura el SVG del lienzo y descarga
  .png        -- usa html2canvas para capturar el lienzo
  .md         -- serializa el arbol como encabezados Markdown jerarquicos
  .json       -- JSON.stringify(mindMap) completo

Importar (2 formatos):
  .mm XML     -- parsea XML de Freeplane via DOMParser
               -- funcion: freeplaneConverter.ts importFromFreeplaneXML()
  .json       -- JSON.parse() del respaldo FreeMind Studio

### 7.2. TemplatesModal.tsx

Galeria de plantillas predefinidas con ilustraciones SVG.
Carga los datos de utils/sampleMaps.ts y utils/additionalTemplates.ts.
Al seleccionar, carga la plantilla como nuevo mapa (pushHistory + setMindMap).

Plantillas disponibles (de sampleMaps.ts + additionalTemplates.ts):
  - Tutorial Freemind Studio (mapa de bienvenida con todas las funciones)
  - Mapa en Blanco
  - Planificacion de Proyectos
  - Lluvia de Ideas (Brainstorming)
  - Analisis FODA (SWOT)
  - Mapa de Conocimiento
  - Organigrama
  - Plan de Estudios
  - Roadmap de Producto
  - Y muchas mas en additionalTemplates.ts (72KB de datos)

### 7.3. SavedMapsModal.tsx

Lista de mapas guardados en localStorage.
Muestra: titulo, fecha de actualizacion, numero de nodos.

Operaciones:
  Cargar mapa      -- pushHistory + setMindMap(loaded)
  Eliminar mapa    -- deleteMapById() + actualiza indice
  Nuevo mapa       -- BLANK_MAP con nuevo ID

Persistencia:
  Key principal: 'freemind_current_map_v1' -- mapa activo
  Key de indice:  'freemind_saved_maps_index_v1' -- lista de metadatos
  Keys por mapa:  'freemind_map_{id}' -- JSON completo de cada mapa

### 7.4. ConnectorModal.tsx

Crea un nuevo Connector entre dos nodos.
Se abre desde: menu contextual | Menu Insertar | boton en ToolBar.

Opciones configurables al crear:
  Nodo de destino: selector de todos los nodos del mapa
  Etiqueta de texto
  Color
  Estilo de linea: solid / dashed / dotted
  Flecha: none / start / end / both
  Forma: curved / bezier / straight / step
  Grosor
  Capa: above / below

### 7.5. IconPackModal.tsx

Galeria de iconos vectoriales con categorias.
Permite togglear iconos en el nodo seleccionado.
Los iconos se almacenan como string[] en node.icons.
Renderizados por iconMap.tsx y vectorIconPack.tsx.

### 7.6. ShortcutsModal.tsx

Referencia rapida de todos los atajos de teclado.
Solo lectura, sin interaccion.

### 7.7. ComingSoonModal.tsx

Se muestra cuando el usuario elige 'Modo Elaborado' o 'Modo Dinamico'.
Muestra un mensaje de proximamente con animacion.
Ofrece boton 'Iniciar Modo Clasico' como alternativa.

---

## 8. Utilidades (utils/)

### 8.1. layoutEngine.ts (Motor de Layout — ~1779 lineas)

Nucleo del posicionamiento de nodos. Exporta:

estimateNodeSize(node):          Calcula el tamano de un nodo basado en:
  - Longitud del texto (charWidth * fontSize * 0.58)
  - Icono, progreso, enlace, nota (extra width)
  - Imagen adjunta (posicion determina extra height/width)
  - Tags (extra height + minWidth)
  - Cuerpo (body) del nodo
  - customWidth / customHeight (sobreescribe calculo automatico)
  - shape === square|circle: usa el max de ambas dimensiones

computeMindMapLayout(mindMap):   Algoritmo principal. Devuelve Record<string, CalculatedNodeLayout>.
  Selecciona el algoritmo segun mindMap.layout:
    standard            -- distribucion bifurcada clasica Freeplane
    balanced-horizontal -- arbol horizontal con raiz a la izquierda
    left                -- todas las ramas a la izquierda
    right               -- todas las ramas a la derecha
    top                 -- arbol hacia arriba
    bottom              -- arbol hacia abajo
    tree-down           -- arbol vertical con raiz arriba
    radial              -- ramas en circulo alrededor del raiz
    circular            -- disposicion circular

  Tiene en cuenta: nodos plegados (folded=true los excluye del layout),
  customWidth/Height, gaps globales (horizontalGap, verticalGap).

generateEdgePath(from, to, side, style):  Genera el path SVG de una arista del arbol.
  Estilos: bezier | linear | sharp | horizontal | hidden

generateRibbonEdgePath(from, to, side, profile, width):  Genera ribbon SVG (perfil especial).
  Perfiles: tapered | spindle | hourglass

computeCloudBounds(nodeIds, layouts):  Calcula el bounding box de una nube de agrupacion.

### 8.2. markdownRenderer.tsx

Renderiza texto Markdown como HTML usando un parser personalizado (sin librerias externas).
Soporta: # encabezados, **negrita**, *cursiva*, `codigo`, > citas, - listas, --- separadores.
El componente <MarkdownView> acepta prop isDark para adaptar los colores al tema.

### 8.3. connectorUtils.ts

calculateConnectorGeometry(from, to, connector):  Calcula los puntos de anclaje de un
conector cruzado considerando los bordes del nodo (no atraviesa el interior del nodo).
Devuelve: { startX, startY, endX, endY, controlX, controlY }

### 8.4. freeplaneConverter.ts

importFromFreeplaneXML(xmlString):  Parsea XML .mm de Freeplane y construye un MindMap.
  Lee: <node TEXT>, <richcontent TYPE='NOTE'>, <attribute NAME VALUE>, <icon BUILTIN>
  Mapea colores y formas de Freeplane a los tipos internos.

exportToFreeplaneXML(mindMap):  Serializa MindMap a formato .mm XML compatible con Freeplane 1.x.

### 8.5. htmlExporter.ts (~72KB)

Genera un archivo .html completamente autonomo que contiene:
  - El mapa mental como datos JSON embebidos
  - Un mini-renderizador SVG/HTML en JavaScript vanilla incrustado
  - Estilos CSS embebidos
  - Sin dependencias externas (puede abrirse offline)

### 8.6. themes.ts

THEMES: Record<string, MindMapTheme>  -- 9 temas del mapa
  Cada tema define: background, rootBg, rootText, nodeBg, nodeText,
  nodeBorder, branchColors (7 colores de ramas), edgeStyle, fontFamily

BACKGROUND_PRESET_THEMES: BackgroundPresetTheme[]  -- 12 fondos de lienzo
  Cada preset define: backgroundColor, pattern, patternColor, patternSize, patternOpacity

### 8.7. iconMap.tsx

Mapeo de string de icono (por ejemplo 'star', 'flag', 'check') a
componente React (emoji o SVG de lucide-react).
Usado por NodeComponent y PresentationMode.

### 8.8. vectorIconPack.tsx (~64KB)

Pack premium de iconos vectoriales SVG organizados por categorias.
Categorias: Negocios, Tecnologia, Educacion, Salud, Arte, etc.
Usado por IconPackModal.tsx.

### 8.9. sampleMaps.ts + additionalTemplates.ts

Datos estaticos de mapas predefinidos listos para usar.
  TUTORIAL_MAP:  mapa de bienvenida con todas las caracteristicas demostradas
  BLANK_MAP:     mapa vacio con solo el nodo raiz
  additionalTemplates.ts: coleccion de mas de 20 plantillas tematicas

### 8.10. storage.ts

loadCurrentMap():         Lee 'freemind_current_map_v1' de localStorage.
                          Si el mapa guardado es el tutorial, devuelve TUTORIAL_MAP actualizado.
saveCurrentMap(map):      Escribe el mapa activo + actualiza el indice.
getSavedMapsIndex():      Lee la lista de metadatos de todos los mapas.
updateSavedMapsIndex():   Actualiza el indice + guarda el mapa en su propia key.
loadMapById(id):          Lee un mapa especifico por su ID.
deleteMapById(id):        Elimina el mapa y lo quita del indice.

---

## 9. Sistema de Temas (Temas del Mapa)

Un tema define la paleta de colores de TODO el mapa.
Se aplica en MindMapCanvas y NodeComponent.

Propiedades de un tema (MindMapTheme):
  background:    color de fondo del lienzo
  backgroundPattern: patron de fondo (dots/lines/squares/etc.)
  rootBg:        color de fondo del nodo raiz
  rootText:      color de texto del nodo raiz
  nodeBg:        color de fondo de los nodos normales
  nodeText:      color de texto de los nodos normales
  nodeBorder:    color de borde de los nodos normales
  branchColors:  array de 7 colores, uno por rama principal
  edgeStyle:     estilo de arista por defecto
  fontFamily:    fuente del tema (todos usan 'Plus Jakarta Sans')

Temas disponibles:
  default      Clasico Azul     -- fondo slate-50, raiz azul
  rainbow      Arcoiris         -- fondo blanco, 8 colores de rama
  dark         Modo Oscuro      -- fondo slate-900, nodos dark
  forest       Bosque Esmeralda -- fondo verde claro
  sunset       Atardecer Calido -- fondo amarillo claro, naranja
  minimal      Minimalista Mono -- fondo neutro, ramas grises
  blueprint    Plano Tecnico    -- fondo azul oscuro, nodos navy
  honeycomb    Panal Creativo   -- fondo crema, nodos blancos dorados

Los colores de rama se asignan automaticamente a las ramas del nivel 1
usando branchIndex % branchColors.length.
Los nodos de niveles mas profundos heredan el color de su rama raiz.

---

## 10. Sistema de Layout

El layout se recalcula en cada render de MindMapCanvas via useMemo.
Recibe el mapa completo y devuelve posiciones {x, y, width, height} por nodo.

Algoritmos:
  standard:            Layout bifurcado clasico.
    - Asigna side=right o side=left a las ramas del nivel 1 (balanceo automatico).
    - Las ramas derechas crecen hacia la derecha, las izquierdas hacia la izquierda.
    - Cada rama se posiciona verticalmente segun la suma de alturas de sus hermanos.

  balanced-horizontal: Similar a standard pero el raiz siempre queda a la izquierda.
  left, right:         Todas las ramas en una sola direccion.
  top, bottom:         Arbol vertical (raiz arriba o abajo).
  tree-down:           Arbol jerarquico clasico descendente.
  radial:              Las ramas del nivel 1 se distribuyen en angulos iguales
                       alrededor del raiz. Los hijos crecen radialmente.
  circular:            Disposicion en circulos concentricos.

Nodos libres (isFreeFloating=true):
  No participan en el calculo de layout.
  Usan su freePosition {x, y} directamente.

---

## 11. Persistencia y Almacenamiento

La aplicacion NO tiene backend. TODO se guarda en localStorage del navegador.

Claves localStorage:
  freemind_current_map_v1        -- JSON del mapa activo (auto-guardado)
  freemind_saved_maps_index_v1   -- JSON[] de metadatos de todos los mapas
  freemind_map_{id}              -- JSON del mapa {id} (guardado explicitamente)

Auto-guardado:
  El store Zustand (useMindMapStore) persiste el mapa automaticamente
  cada vez que setMindMap() es invocado via subscriber interno.

Ciclo de vida de un mapa:
  1. Primera visita: se carga TUTORIAL_MAP
  2. Cambios del usuario: se guarda en 'freemind_current_map_v1' automaticamente
  3. El usuario puede guardar explicitamente (Ctrl+S) --> updateSavedMapsIndex()
  4. El usuario puede abrir un mapa guardado --> loadMapById(id)
  5. El usuario puede importar un .mm o .json --> setMindMap(imported)

---

## 12. Historial Undo/Redo

Implementado dentro del store Zustand (useMindMapStore):
  historyPast:   MindMap[]  -- estados previos (max 40)
  historyFuture: MindMap[]  -- estados para rehacer

pushHistory(current): llamado ANTES de cada mutacion
  setHistoryPast(prev => [...prev.slice(-40), current])
  setHistoryFuture([])  -- limpiar futuros al hacer una accion nueva

handleUndo():
  Extrae el ultimo estado de historyPast
  Mueve mindMap actual a historyFuture
  Aplica el estado previo

handleRedo():
  Extrae el primer estado de historyFuture
  Mueve mindMap actual a historyPast
  Aplica el estado futuro

Operaciones que NO crean entrada en el historial:
  - Cambios de seleccion (selectedNodeId)
  - Cambios de vista (zoom, pan)
  - Apertura/cierre de paneles y modales

---

## 13. Atajos de Teclado Completos

Manejados por `useKeyboardShortcuts` hook, que se conecta al store Zustand.
El handler se deshabilita cuando: hay un input activo, hay un modal abierto,
o el modo presentacion esta activo.

Atajos del lienzo principal:
  Tab / Insert          Crear nodo hijo del seleccionado
  Enter                 Crear nodo hermano despues del seleccionado
  F2                    Iniciar edicion de texto inline
  Espacio               Plegar/desplegar rama del nodo seleccionado
  Supr / Backspace      Eliminar nodo y su subtree
  Esc                   Salir de edicion / seleccionar nodo raiz
  Flechas               Navegar entre nodos del arbol:
    ArrowUp/Down        Nodo anterior/siguiente en la misma rama
    ArrowRight          En nodo raiz: primer hijo derecho
                        En nodo right: primer hijo
                        En nodo left: nodo padre
    ArrowLeft           En nodo raiz: primer hijo izquierdo
                        En nodo left: primer hijo
                        En nodo right: nodo padre
  Ctrl+Z                Deshacer
  Ctrl+Y / Ctrl+Shift+Z Rehacer
  Ctrl+C                Copiar subtree
  Ctrl+X                Cortar subtree
  Ctrl+V                Pegar subtree como hijo del seleccionado
  Ctrl+F                Toggle barra de busqueda
  Alt+O                 Toggle panel de esquema
  Alt+P                 Toggle panel de propiedades
  F5                    Toggle modo presentacion

Atajos del modo presentacion (manejados en PresentationMode.tsx):
  ArrowRight / Espacio  Siguiente diapositiva
  ArrowLeft             Diapositiva anterior
  Backspace             Volver al punto de salto (jumpHistory.pop)
  E                     Toggle modal de configuracion
  Esc                   Cerrar modal de config / Salir de presentacion

---

## 14. Diagrama de Flujo de un Cambio Tipico

Ejemplo: Usuario pulsa Tab para anadir un nodo hijo.

```
1. useKeyboardShortcuts hook detecta 'Tab' via addEventListener('keydown')
2. Llama a store.handleAddChild():
   a. pushHistory(mindMap)  -- guarda el estado actual en historyPast
   b. Genera nuevo ID: 'node-{Date.now()}'
   c. Determina side del nuevo nodo (hereda del padre)
   d. Crea newNode: {id, text:'Nueva Idea', parentId, children:[], side, shape:'bubble'}
   e. set(state => ({mindMap: {..., nodes: {..., [parentId]: padreConNuevoHijo, [newId]: newNode}}}))
   f. setSelectedNodeId(newId)
   g. setEditingNodeId(newId)  -- abre el input de texto inline
3. Zustand notifica a los suscriptores:
   a. Todos los componentes que consumen useMindMapStore() se re-renderizan
   b. Subscriber de auto-guardado invoca saveCurrentMap() --> localStorage
   c. MindMapCanvas: computeMindMapLayout() recalcula posiciones
   d. NodeComponent del nuevo nodo se renderiza con input activo
   e. MiniMap se actualiza
   f. StatusBar muestra nuevo total de nodos
```

---

## 15. Tecnologias y Dependencias

Produccion:
  react@19              Framework UI
  react-dom@19          DOM renderer
  zustand@5             Estado global reactivo
  lucide-react          Iconos SVG vectoriales
  motion                Animaciones (micro-interacciones)
  canvas-confetti       Efectos de confeti
  @google/genai         Funciones IA opcionales

Desarrollo:
  typescript@5.8        Tipado estatico
  vite@6                Bundler y servidor de desarrollo
  tailwindcss@4         Utilidades CSS
  @vitejs/plugin-react  Plugin Vite para React
  @tailwindcss/vite     Plugin Tailwind para Vite

Sin dependencias para:
  Markdown parsing      (parser propio en markdownRenderer.tsx)
  Layout engine         (implementacion propia en layoutEngine.ts)
  Exportacion HTML      (generacion de strings en htmlExporter.ts)
  Persistencia          (localStorage nativo)
  Importacion Freeplane (DOMParser nativo del navegador)

---

## 16. Estructura de Archivos Completa

```
src/
├── App.tsx                              Pagina / Orquestador (Zustand consumer)
├── main.tsx                             ReactDOM.createRoot
├── index.css                            Estilos globales + Tailwind v4
│
├── types/
│   └── mindmap.ts                       Tipos TypeScript: MindMap, MindNode, Connector, etc.
│
├── hooks/
│   ├── useMindMapStore.ts               Store Zustand centralizado (582 lineas)
│   ├── useSearchFilter.ts               Hook de filtro/busqueda reactivo
│   └── useKeyboardShortcuts.ts          Hook de atajos de teclado globales
│
├── components/
│   ├── MenuBar.tsx                      Barra de menu superior (Archivo/Editar/...)
│   ├── ToolBar.tsx                      Barra de herramientas rapidas
│   ├── FilterBar.tsx                    Barra de busqueda colapsable
│   ├── MindMapCanvas.tsx                Lienzo SVG/HTML infinito con pan/zoom
│   ├── NodeComponent.tsx                Renderizado de cada nodo (10 formas)
│   ├── ToolPanel.tsx                    Contenedor de 6 tabs-organismo
│   ├── PresentationMode.tsx             Modo presentacion (3 fases, 7 temas)
│   ├── OutlineView.tsx                  Vista de esquema en arbol
│   ├── MiniMap.tsx                      Minimapa radar flotante
│   ├── StatusBar.tsx                    Barra de estado inferior
│   │
│   ├── atoms/                           ATOMOS (primitivos UI)
│   │   ├── CollapsibleSection.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── SliderInput.tsx
│   │   ├── ToggleButton.tsx
│   │   └── ToggleButtonGroup.tsx
│   │
│   ├── molecules/                       MOLECULAS (combinaciones reutilizables)
│   │   ├── FontFormatToolbar.tsx
│   │   ├── ShapeSelector.tsx
│   │   └── TagManager.tsx
│   │
│   ├── organisms/                       ORGANISMOS (secciones funcionales)
│   │   ├── toolpanel/                   Tabs del ToolPanel
│   │   │   ├── ContentTab.tsx           Titulo, cuerpo, tipografia
│   │   │   ├── FormatTab.tsx            Forma, fondo, bordes, imagenes, aristas
│   │   │   ├── NotesTab.tsx             Notas Markdown, enlace, progreso
│   │   │   ├── IconsTab.tsx             Grid de iconos toggle
│   │   │   ├── CloudsTab.tsx            Nube on/off, forma, color
│   │   │   └── ThemeTab.tsx             Tema, layout, fondo lienzo, aristas globales
│   │   ├── canvas/                      Sub-componentes del lienzo
│   │   │   ├── CanvasContextMenu.tsx    Menu contextual (clic derecho)
│   │   │   └── CanvasZoomControls.tsx   Controles de zoom
│   │   └── presentation/               Sub-componentes de presentacion
│   │       ├── PresentationControls.tsx Barra superior + modal opciones
│   │       └── presentationThemes.ts    Definicion de 7 temas
│   │
│   └── Modals/                          MODALES
│       ├── ExportImportModal.tsx         Exportar / Importar mapas
│       ├── ShortcutsModal.tsx            Referencia de atajos de teclado
│       ├── TemplatesModal.tsx            Plantillas predefinidas
│       ├── SavedMapsModal.tsx            Mis mapas guardados
│       ├── ConnectorModal.tsx            Crear/editar conector
│       ├── IconPackModal.tsx             Pack de iconos vectoriales
│       └── ComingSoonModal.tsx           Modal "Proximamente"
│
└── utils/                               UTILIDADES (funciones puras)
    ├── layoutEngine.ts                  Motor de layout (9 algoritmos, ~65KB)
    ├── themes.ts                        9 temas de mapa + 12 fondos de lienzo
    ├── markdownRenderer.tsx             Parser Markdown propio (sin librerias)
    ├── connectorUtils.ts                Geometria de conectores cruzados
    ├── freeplaneConverter.ts            Import/Export Freeplane .mm XML
    ├── htmlExporter.ts                  Generador HTML autonomo (~72KB)
    ├── storage.ts                       CRUD localStorage (mapa activo + indice)
    ├── sampleMaps.ts                    Tutorial + Mapa en blanco (~99KB)
    ├── additionalTemplates.ts           +20 plantillas tematicas (~75KB)
    ├── templateIllustrations.ts         SVGs de preview de plantillas
    ├── iconMap.tsx                       String icono -> componente React
    └── vectorIconPack.tsx               Pack de iconos premium (~64KB)
```
