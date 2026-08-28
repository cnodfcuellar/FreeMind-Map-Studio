# FreeMind Map Studio — Arquitectura Completa del Proyecto

**Version:** 1.0  **Fecha:** 2026-08-25  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4  
**Gestor de paquetes:** pnpm  
**Persistencia:** localStorage (sin backend)

---

## 1. Vision General

FreeMind Map Studio es una aplicacion de mapas mentales completamente offline que corre
en el navegador sin ningun servidor. El estado completo del mapa se serializa como JSON
y se persiste en `localStorage` automaticamente en cada cambio.

```
USUARIO
  |
  v
App.tsx  (orquestador, fuente de verdad de TODOS los datos)
  |           |               |              |
  v           v               v              v
MenuBar   MindMapCanvas   ToolPanel   PresentationMode
ToolBar   (lienzo SVG)    (inspector) (slides 100vh)
FilterBar    |
StatusBar    v
         NodeComponent (cada nodo)
         MiniMap        (radar flotante)
```

---

## 2. Flujo de Datos (Unidireccional)

```
Estado global (App.tsx)
  [mindMap: MindMap]          -- unica fuente de verdad del mapa
  [historyPast: MindMap[]]    -- pila undo (max 40)
  [historyFuture: MindMap[]]  -- pila redo
  [selectedNodeId: string]    -- nodo actualmente seleccionado
  [editingNodeId: string]     -- nodo en modo edicion de texto
  [isPresentationMode: bool]  -- activa overlay de presentacion
  [isOutlineOpen: bool]       -- panel esquema izquierdo
  [isToolPanelOpen: bool]     -- panel propiedades derecho
  [isFilterBarOpen: bool]     -- barra de busqueda
  [clipboard: {...}]          -- portapapeles de nodo/subtree
  [filterOptions: {...}]      -- criterios de filtrado activos
  [comingSoonModalData]       -- datos para modal 'Proximamente'

Mutaciones --> pushHistory(current) + setMindMap(nuevo_estado)
              --> useEffect() --> saveCurrentMap() --> localStorage
```

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

## 4. Componentes Principales

### 4.1. App.tsx (Orquestador Principal)

Es el componente raiz. Contiene TODA la logica de negocio y el estado global.
Ningun componente hijo modifica el estado directamente; siempre invocan callbacks.

Responsabilidades:
- Inicializar el mapa desde localStorage (`loadCurrentMap()`)
- Gestionar el historial undo/redo (pila de 40 estados `MindMap`)
- Proveer TODOS los handlers de mutacion de nodos y del mapa
- Registrar los atajos de teclado globales (addEventListener)
- Calcular `searchMatches` y `availableTags` para el filtrado
- Orquestar la apertura/cierre de todos los modales y paneles
- Auto-guardar en localStorage en cada cambio via useEffect
- Renderizar el arbol de componentes completo

Handlers implementados en App.tsx:
  handleAddChild()       -- Tab / Insert
  handleAddSibling()     -- Enter
  handleDeleteNode()     -- Supr / Backspace
  handleToggleFold()     -- Espacio
  handleFoldAll()        -- Menu Ver
  handleUnfoldAll()      -- Menu Ver
  handleReparentNode()   -- Drag and Drop (con proteccion anti-ciclo)
  handleCopyNode()       -- Ctrl+C
  handleCutNode()        -- Ctrl+X
  handlePasteNode()      -- Ctrl+V (clona el subtree con nuevos IDs)
  handleUndo()           -- Ctrl+Z
  handleRedo()           -- Ctrl+Y
  updateNode()           -- Actualiza propiedades parciales de un nodo
  handleUpdateNodeText() -- Edicion de texto en linea

### 4.2. MindMapCanvas.tsx (Lienzo SVG/HTML Infinito)

El lienzo es una capa HTML con un contenedor SVG incrustado para las aristas.
Implementa pan y zoom via transformaciones CSS (translate + scale).

Mecanismos internos:
- Estado de pan: {x, y} + isPanning (MouseDown/Move/Up)
- Estado de zoom: numero (rueda del raton o botones)
- Drag and Drop de nodos: draggedNodeId + dragOverNodeId
- ContextMenu: visible | x | y | nodeId (clic derecho)
- Calcula el layout llamando a computeMindMapLayout() de layoutEngine.ts
- Renderiza aristas en SVG (generateEdgePath / generateRibbonEdgePath)
- Renderiza nubes en SVG (computeCloudBounds)
- Renderiza conectores cruzados en SVG (calculateConnectorGeometry)
- Renderiza cada nodo como NodeComponent
- Integra el MiniMap como componente flotante

Interacciones del lienzo:
  Clic en nodo       --> seleccionar nodo (setSelectedNodeId)
  Doble clic en nodo --> iniciar edicion de texto (setEditingNodeId)
  Clic derecho nodo  --> mostrar menu contextual
  Clic en lienzo     --> deseleccionar (setSelectedNodeId(null))
  Arrastrar lienzo   --> pan (sin nodo seleccionado)
  Arrastrar nodo     --> Drag and Drop reparenting
  Rueda del raton    --> zoom in/out

Menu contextual (clic derecho):
  Editar texto
  Agregar hijo
  Agregar hermano
  Copiar, Cortar, Pegar
  Crear Conector
  Activar/Desactivar Nube
  Eliminar nodo

### 4.3. NodeComponent.tsx (Renderizado de un Nodo)

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

### 4.4. ToolPanel.tsx (Panel Inspector Derecho -- 350px)

Panel lateral derecho con 9 secciones en acordeon.
Tiene dos grandes bloques: 'Propiedades del Mapa' y 'Propiedades del Nodo'.

Propiedades del MAPA (configuracion global):
  - Tema visual: selector de 9 temas (cambia toda la paleta de colores)
  - Layout: selector de 9 algoritmos de disposicion
  - Fondo del lienzo: 12 presets + color personalizado + patron personalizado
  - Aristas globales: estilo, perfil, grosor, color, patron de linea
  - Espaciado: horizontal gap y vertical gap entre nodos
  - Botones: 'Aplicar a todos los nodos' (propaga la arista global a cada nodo)

Propiedades del NODO seleccionado:
  Seccion 1 -- Titulo y Texto:
    textarea para el texto principal
    Fuente, tamano (8-32px), negrita, cursiva, alineacion, color

  Seccion 2 -- Cuerpo / Subtexto:
    textarea para el body
    Fuente, tamano (8-24px), negrita, cursiva, alineacion, color

  Seccion 3 -- Forma y Geometria:
    10 botones de forma con preview visual
    Deslizador de ancho (50-500px) con boton 'Auto'
    Deslizador de alto (30-300px) con boton 'Auto'
    (Para square/circle el deslizador es unico y actualiza ambas dimensiones)

  Seccion 4 -- Fondo del Nodo:
    Radio buttons: Color Solido / Transparente / Degradado / Trama

    Modo COLOR SOLIDO:
      Selector de color (input type=color + texto hex)
      Paleta rapida con 6 colores predefinidos del tema
      Boton 'Por defecto' (elimina la sobreescritura)

    Modo TRANSPARENTE:
      Sin controles adicionales. El nodo no tiene relleno.

    Modo DEGRADADO:
      Selectores de Color 1 y Color 2
      4 botones de direccion: Horizontal / Vertical / Diagonal / Radial
      6 presets de degradados: Ocean / Sunset / Emerald / Neon / Indigo / Carbon

    Modo TRAMA:
      7 botones de patron: dots / lines / squares / stripes / triangles / hexagons / cross
      Color de la trama (selector)
      Tamano del patron (deslizador 8-36px)
      Opacidad del patron (deslizador 10-100%)

  Seccion 5 -- Contornos y Bordes:
    5 botones de grosor predefinido: 0 / 1 / 2 / 3.5 / 5px
    Deslizador continuo de grosor (0-8px)
    3 botones de estilo: solid / dashed / dotted
    Selector de color de borde
    Checkbox 'Auto (color de rama)' -- hereda el color de la rama del tema

  Seccion 6 -- Imagenes:
    Imagen de Contenido (imageUrl):
      Campo de URL o subida de imagen
      6 posiciones: Arriba / Abajo / Izquierda / Derecha / Entre titulo y cuerpo / Fondo
      Deslizador de escala (60-300px)
      Boton Eliminar imagen

    Imagen de Fondo (bgImageUrl):
      Campo de URL
      4 modos: fit / cover / contain / tile
      Deslizador de opacidad
      Boton Eliminar

  Seccion 7 -- Aristas del Nodo (override individual):
    5 estilos: bezier / linear / sharp / horizontal / hidden
    4 perfiles: uniform / tapered / spindle / hourglass
    Deslizador de grosor
    Selector de color
    3 patrones de linea: solid / dashed / dotted
    Boton 'Heredar del mapa' (elimina el override del nodo)

  Seccion 8 -- Nube de Agrupacion:
    Toggle ON/OFF
    4 formas: arc / rectangle / round-rectangle / star
    Selector de color RGBA

  Seccion 9 -- Metadatos y Notas:
    Barra de progreso: deslizador 0-100 + input numerico
    Iconos: grid de iconos del IconPack (toggle individual)
    Tags: chips con boton X + campo 'Anadir tag' (Enter para confirmar)
    Enlace URL: campo de texto libre
    Nota Markdown: textarea con preview en Markdown

### 4.5. PresentationMode.tsx (Modo Presentacion Clasica)

Overlay de pantalla completa (fixed inset-0, z-50) que reemplaza visualmente
toda la interfaz. NO modifica el mapa; es solo lectura.

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

Renderizado por fase:
  body:     imagen (siempre si imageUrl existe) + titulo grande + body text + metadata
  notes:    cabecera (miniatura + titulo) + Markdown renderizado
  children: grid de tarjetas 2x3 (max 6) clicables + conectores cruzados

### 4.6. OutlineView.tsx (Vista de Esquema -- Panel Izquierdo)

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

### 4.7. MenuBar.tsx (Barra de Menu Superior -- 48px)

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

### 4.8. ToolBar.tsx (Barra de Herramientas -- 44px)

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

### 4.9. FilterBar.tsx (Barra de Filtro -- 40px, colapsable)

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

El calculo de coincidencias es un useMemo en App.tsx que devuelve un Set<string>.
El lienzo recibe este Set y lo pasa a NodeComponent para resaltar nodos.

### 4.10. MiniMap.tsx (Minimapa Radar Flotante)

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

### 4.11. StatusBar.tsx (Barra de Estado -- 24px)

Barra informativa fija en la parte inferior.
Muestra:
  Nodos totales en el mapa
  Nodo seleccionado (texto + ID)
  Zoom actual
  Posicion de pan (X, Y)
  Modo actual: 'Listo' | 'Editando'

---

## 5. Modales

### 5.1. ExportImportModal.tsx

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

### 5.2. TemplatesModal.tsx

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

### 5.3. SavedMapsModal.tsx

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

### 5.4. ConnectorModal.tsx

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

### 5.5. IconPackModal.tsx

Galeria de iconos vectoriales con categorias.
Permite togglear iconos en el nodo seleccionado.
Los iconos se almacenan como string[] en node.icons.
Renderizados por iconMap.tsx y vectorIconPack.tsx.

### 5.6. ShortcutsModal.tsx

Referencia rapida de todos los atajos de teclado.
Solo lectura, sin interaccion.

### 5.7. ComingSoonModal.tsx

Se muestra cuando el usuario elige 'Modo Elaborado' o 'Modo Dinamico'.
Muestra un mensaje de proximamente con animacion.
Ofrece boton 'Iniciar Modo Clasico' como alternativa.

---

## 6. Utilidades (utils/)

### 6.1. layoutEngine.ts (Motor de Layout -- 1779 lineas)

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

### 6.2. markdownRenderer.tsx

Renderiza texto Markdown como HTML usando un parser personalizado (sin librerias externas).
Soporta: # encabezados, **negrita**, *cursiva*, `codigo`, > citas, - listas, --- separadores.
El componente <MarkdownView> acepta prop isDark para adaptar los colores al tema.

### 6.3. connectorUtils.ts

calculateConnectorGeometry(from, to, connector):  Calcula los puntos de anclaje de un
conector cruzado considerando los bordes del nodo (no atraviesa el interior del nodo).
Devuelve: { startX, startY, endX, endY, controlX, controlY }

### 6.4. freeplaneConverter.ts

importFromFreeplaneXML(xmlString):  Parsea XML .mm de Freeplane y construye un MindMap.
  Lee: <node TEXT>, <richcontent TYPE='NOTE'>, <attribute NAME VALUE>, <icon BUILTIN>
  Mapea colores y formas de Freeplane a los tipos internos.

exportToFreeplaneXML(mindMap):  Serializa MindMap a formato .mm XML compatible con Freeplane 1.x.

### 6.5. htmlExporter.ts (71KB)

Genera un archivo .html completamente autonomo que contiene:
  - El mapa mental como datos JSON embebidos
  - Un mini-renderizador SVG/HTML en JavaScript vanilla incrustado
  - Estilos CSS embebidos
  - Sin dependencias externas (puede abrirse offline)

### 6.6. themes.ts

THEMES: Record<string, MindMapTheme>  -- 9 temas del mapa
  Cada tema define: background, rootBg, rootText, nodeBg, nodeText,
  nodeBorder, branchColors (7 colores de ramas), edgeStyle, fontFamily

BACKGROUND_PRESET_THEMES: BackgroundPresetTheme[]  -- 12 fondos de lienzo
  Cada preset define: backgroundColor, pattern, patternColor, patternSize, patternOpacity

### 6.7. iconMap.tsx

Mapeo de string de icono (por ejemplo 'star', 'flag', 'check') a
componente React (emoji o SVG de lucide-react).
Usado por NodeComponent y PresentationMode.

### 6.8. vectorIconPack.tsx (63KB)

Pack premium de iconos vectoriales SVG organizados por categorias.
Categorias: Negocios, Tecnologia, Educacion, Salud, Arte, etc.
Usado por IconPackModal.tsx.

### 6.9. sampleMaps.ts + additionalTemplates.ts

Datos estaticos de mapas predefinidos listos para usar.
  TUTORIAL_MAP:  mapa de bienvenida con todas las caracteristicas demostradas
  BLANK_MAP:     mapa vacio con solo el nodo raiz
  additionalTemplates.ts: coleccion de mas de 20 plantillas tematicas

### 6.10. storage.ts

loadCurrentMap():         Lee 'freemind_current_map_v1' de localStorage.
                          Si el mapa guardado es el tutorial, devuelve TUTORIAL_MAP actualizado.
saveCurrentMap(map):      Escribe el mapa activo + actualiza el indice.
getSavedMapsIndex():      Lee la lista de metadatos de todos los mapas.
updateSavedMapsIndex():   Actualiza el indice + guarda el mapa en su propia key.
loadMapById(id):          Lee un mapa especifico por su ID.
deleteMapById(id):        Elimina el mapa y lo quita del indice.

---

## 7. Sistema de Temas (Temas del Mapa)

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

## 8. Sistema de Layout

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

## 9. Persistencia y Almacenamiento

La aplicacion NO tiene backend. TODO se guarda en localStorage del navegador.

Claves localStorage:
  freemind_current_map_v1        -- JSON del mapa activo (auto-guardado)
  freemind_saved_maps_index_v1   -- JSON[] de metadatos de todos los mapas
  freemind_map_{id}              -- JSON del mapa {id} (guardado explicitamente)

Auto-guardado:
  useEffect([mindMap]) en App.tsx llama a saveCurrentMap(mindMap)
  en cada cambio del estado del mapa.

Ciclo de vida de un mapa:
  1. Primera visita: se carga TUTORIAL_MAP
  2. Cambios del usuario: se guarda en 'freemind_current_map_v1' automaticamente
  3. El usuario puede guardar explicitamente (Ctrl+S) --> updateSavedMapsIndex()
  4. El usuario puede abrir un mapa guardado --> loadMapById(id)
  5. El usuario puede importar un .mm o .json --> setMindMap(imported)

---

## 10. Historial Undo/Redo

Implementado como dos arrays de estado en App.tsx:
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

## 11. Atajos de Teclado Completos

Manejados por un useEffect con window.addEventListener('keydown') en App.tsx.
El handler se deshabilita cuando: hay un input activo, hay un modal abierto,
o el modo presentacion esta activo.

Atajos del lienzo principal:
  Tab / Insert          Crear nodo hijo del seleccionado
  Enter                 Crear nodo hermano despues del seleccionado
  Shift+Enter           (no documentado en codigo actual)
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

## 12. Diagrama de Flujo de un Cambio Tipico

Ejemplo: Usuario pulsa Tab para anadir un nodo hijo.

```
1. window keydown listener en App.tsx detecta 'Tab'
2. handleAddChild() se ejecuta:
   a. pushHistory(mindMap)  -- guarda el estado actual en historyPast
   b. Genera nuevo ID: 'node-{Date.now()}'
   c. Determina side del nuevo nodo (hereda del padre)
   d. Crea newNode: {id, text:'Nueva Idea', parentId, children:[], side, shape:'bubble'}
   e. setMindMap(prev => {...prev, nodes: {...prev.nodes, [parentId]: padreConNuevoHijo, [newId]: newNode}})
   f. setSelectedNodeId(newId)
   g. setEditingNodeId(newId)  -- abre el input de texto inline
3. React re-renderiza:
   a. App.tsx: nuevo estado propagado a todos los hijos
   b. useEffect([mindMap]) dispara saveCurrentMap() --> localStorage
   c. MindMapCanvas: computeMindMapLayout() recalcula posiciones
   d. NodeComponent del nuevo nodo se renderiza con input activo
   e. MiniMap se actualiza
   f. StatusBar muestra nuevo total de nodos
```

---

## 13. Tecnologias y Dependencias

Produccion:
  react@18              Framework UI
  react-dom@18          DOM renderer
  lucide-react          Iconos SVG vectoriales

Desarrollo:
  typescript            Tipado estatico
  vite                  Bundler y servidor de desarrollo
  tailwindcss@4         Utilidades CSS
  @vitejs/plugin-react  Plugin Vite para React

Sin dependencias para:
  Markdown parsing      (parser propio en markdownRenderer.tsx)
  Layout engine         (implementacion propia en layoutEngine.ts)
  Exportacion HTML      (generacion de strings en htmlExporter.ts)
  Persistencia          (localStorage nativo)
  Importacion Freeplane (DOMParser nativo del navegador)
