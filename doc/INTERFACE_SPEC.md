# Especificacion Tecnica y Diseno de la Interfaz

**Aplicacion:** FreeMind Map Studio  
**Tipo:** Editor de Mapas Mentales Portable y Offline (Estilo Freeplane / Mindomo)  
**Resolucion Base:** 1920 x 1080 px (Diseno adaptativo desde 1024px hasta 4K)  
**Ultima actualizacion:** 2026-08-28  
**Arquitectura:** Atomic Design + Zustand (Store Centralizado)

---

## 1. Mapa Global de la Pantalla (Layout Principal)

```text
+--------------------------------------------------------------------------------------------------------------------------+
| [1] BARRA DE MENU SUPERIOR (MenuBar)                                                                    [Altura: 40px]    |
| [Logo + Titulo Editable]  [Archivo] [Editar] [Insertar] [Formato] [Ver] [Ayuda]   [100% Offline] [Tema UI (Sol/Luna/Cafe)]  |
+--------------------------------------------------------------------------------------------------------------------------+
| [2] BARRA DE HERRAMIENTAS RAPIDAS (ToolBar)                                                             [Altura: 44px]   |
| [Desh] [Redo] | [+Hijo] [+Hermano] [Elim] [Plegar] | [B/I] [Forma] | [Conector] [Nube] [Iconos] || [Filtro] [Vista] [Esquema] [Presentar] [Exportar] [Prop] |
+--------------------------------------------------------------------------------------------------------------------------+
| [3] BARRA DE FILTRO / BUSQUEDA (FilterBar -- Ctrl+F)                                                    [Altura: 40px]   |
| [Buscar texto...]  [Tags]  [Progreso]  [Limpiar filtros] [X]                                    (Contador: "8 coincidencias")|
+--------------------------------------------------------------------------------------------------------------------------+
|                                                                                            |                             |
|                                                                                            | [5] PANEL LATERAL DERECHO   |
|                                                                                            |     (ToolPanel Inspector)   |
|                                  [4] LIENZO INFINITO SVG/HTML                              |     [Ancho: 340px - 380px]  |
|                                      (MindMapCanvas)                                       |                             |
|                                                                                            | 6 Tabs (grid 6 columnas):   |
|               +------------------+         +------------------+                            | [Contenido|Formato|Notas]   |
|               |  Rama Izquierda  |<------- |   NODO CENTRAL   | -------> +------------+  | [Iconos|Nubes|Tema]        |
|               |  (Bubble / Pill) |         |   (Root Bubble)  |          | Rama Decha |  |                             |
|               +------------------+         +------------------+          +------------+  | Cada tab es un organismo   |
|                                                     |                                     | independiente               |
|                                                     v                                     |                             |
|                                            +------------------+                           |                             |
|                                            | Sub-Rama Fork    |                           |                             |
|                                            | (Underline)      |                           |                             |
|                                            +------------------+                           |                             |
|                                                                                            |                             |
| +------------------------------------+                                                     |                             |
| | [6] MINIMAPA RADAR (MiniMap)       |                                                     |                             |
| | (en la app: esquina inferior       |                                                     |                             |
| |  DERECHA del lienzo, no izquierda) |                                                     |                             |
| | [ S(176px) M(224px) L(288px) ]     |                                                     |                             |
| +------------------------------------+                                                     |                             |
+--------------------------------------------------------------------------------------------------------------------------+
| [7] BARRA DE ESTADO INFERIOR (StatusBar)                                                                [Altura: 24px]   |
| Nodos totales: 28 | Seleccionado: "Atajos" (ID: node-1) | Zoom: 100% | Posicion: (0, 0) | Modo: Listo               |
|                          (Zoom y Posicion son fijos en la app actual: App.tsx pasa 100 / 0,0 hardcodeados)            |
+--------------------------------------------------------------------------------------------------------------------------+
```

---

## 2. Desglose de Medidas y Componentes

| Componente UI | Tipo / Posicion | Ancho | Alto | Z-Index |
| :--- | :--- | :--- | :--- | :--- |
| **MenuBar** | Fijo Superior | `100vw` | `40px` (`h-10`) | `z-50` |
| **ToolBar** | Fijo bajo MenuBar | `100vw` | `44px` (`h-11`) | `z-40` |
| **FilterBar** | Plegable (Ctrl+F) | `100vw` | `40px` | `z-30` |
| **Canvas Central** | Flexible, pan infinito | `calc(100vw - 350px)` | `calc(100vh - 116px)` | `z-0` |
| **ToolPanel (Inspector)** | Panel Lateral Derecho | `336px` (`w-84`; Movil: `100vw`) | `calc(100vh - 92px)` | `z-10` |
| **OutlineView** | Panel Lateral Izq / Modal | `320px` (`w-80`, `md:w-88` = 352px) | `calc(100vh - 92px)` | `z-20` (fullscreen `z-30`) |
| **MiniMap** | Flotante Inferior **Derecha** (`bottom-2 right-5`) | `S:176px / M:224px / L:288px` | `96 / 128 / 176px` | `z-40` |
| **Modales** | Ventana emergente centrada | `520px-780px` | Auto (Max 85vh) | `z-50` |
| **Modo Presentacion** | Pantalla Completa | `100vw` | `100vh` | `z-50` |

---

## 3. Estructura y Opciones de Cada Menu Superior

Actualizado 2026-10-17 (fuente: `MenuBar.tsx` 562 lineas). Contrato visual y gotchas: `doc/DESIGN.md` §7.

### 3.1. Menu Archivo (dropdown w-56)
- Nuevo Mapa — reemplaza por `BLANK_MAP` con id/fechas nuevas y selecciona la raiz; **sin dialogo de confirmacion** (`App:159-168`)
- Plantillas de Ejemplo — abre `TemplatesModal`
- Mis Mapas Guardados — abre `SavedMapsModal`
- ---
- Guardar Ahora — `saveCurrentMap(mindMap)` (el hint `Ctrl+S` que muestra **no esta implementado**, ver 3.6)
- ---
- **Exportar (.mm / HTML)** (azul, destacado) — abre `ExportImportModal` (etiqueta corregida 2026-10-17: antes prometía "/ PNG" inexistente)
- Importar Freeplane (.mm) — abre **el mismo** `ExportImportModal` (`App:172-173`; ninguno preselecciona pestana)
  - **Gotcha**: ✅ rotulo PNG **corregido** 2026-10-17 (sigue **sin existir** exportacion de imagenes: solo mm/html/md/json; el subtitulo del modal todavia menciona "imagenes"); la pestana por defecto es Exportar y **persiste** entre aperturas. Contenido funcional de los 6 modales (el 7º, `ComingSoonModal`, fue **eliminado**): `doc/DESIGN.md` §8.5.

### 3.2. Menu Editar (w-52)
- Deshacer (Ctrl+Z) — disabled sin historial
- Rehacer (Ctrl+Y) — disabled sin historial
- ---
- Eliminar Rama (Supr) — rojo; **no se deshabilita en la raiz** (el veto lo hace el store)

> No contiene Cortar/Copiar/Pegar (estan en el menu contextual y en `Ctrl+X/C/V`), F2, buscar/reemplazar ni "seleccionar todos" (no existen).

### 3.3. Menu Insertar (w-56)
- Nodo Hijo (Tab) · Nodo Hermano (Enter)
- ---
- Conector de Relacion · Nube de Rama
- ---
- Pack Iconos Vectoriales + badge `500+` (solo si se pasa `onOpenIconPack`)

> Nota, enlace, progreso, tags, imagen e iconos individuales **no estan en este menu**: se editan en el ToolPanel (ContentTab/NotesTab/IconsTab).

### 3.4. Menu Formato (w-56)
- Bloque "TEMAS VISUALES" — **solo 5 de los 8 temas**: Clasico Freeplane (`default`), Bosque Esmeralda (`forest`), Arcoiris Vibrante (`rainbow`), Atardecer Calido (`sunset`), Modo Oscuro (`dark`).
  - **Fix 2026-10-17**: antes estos 2 items enviaban `'purple'`/`'warm'` (ids inexistentes) → clic sin efecto visual (`|| THEMES.default`) que ademas escribia un `themeId` invalido en el mapa; ahora son `rainbow`/`sunset` (tests en `MenuBar.test.tsx`). Sin acceso por menu (solo ThemeTab): `minimal`, `blueprint`, `honeycomb`.
- Bloque "FORMA DEL NODO" — las **10 formas** con previews; sin `disabled` (sin seleccion es no-op silencioso)
- ---
- Restablecer Formato (rojo) — `onResetFormat` (bubble + colores/tipografia a `undefined`)

> Tipografia y paleta de color **no** estan en este menu (viven en FormatTab/ContentTab).

### 3.5. Menu Ver (w-56)
- Panel Lateral de Esquema (Alt+O)
- Presentacion Clasica [badge verde "Activo"]
- Presentacion Dinamica (Lienzo) (hint `F5`)
- Presentacion Elaborada (Espacial) [badge verde "Activo"]
- ---
- Desplegar Todo el Mapa · Plegar Todas las Ramas
- ---
- Pantalla Completa (F11)

> Los badges **"Activo" son estaticos** (no reflejan el modo en curso). **No** contiene: centrar vista, zoom, ajustar al lienzo ni mostrar/ocultar MiniMapa (esos controles no existen como menu).

### 3.6. Atajos de teclado REALES vs hints decorativos

**Implementados** (`useKeyboardShortcuts.ts`, 221 lineas, `window keydown`):

| Tecla | Accion |
| --- | --- |
| `F5` | alterna modo presentacion (funciona tambien dentro de el) |
| `Ctrl/Cmd+Z` | deshacer (`Ctrl+Shift+Z` tambien rehace) |
| `Ctrl/Cmd+Y` | rehacer |
| `Ctrl/Cmd+C / X / V` | copiar / cortar / pegar rama |
| `Ctrl/Cmd+F` | abre/cierra FilterBar |
| `Alt+O` / `Alt+P` | OutlineView / ToolPanel |
| `Tab` o `Insert` | agregar hijo |
| `Enter` | agregar hermano |
| `F2` | editar texto del nodo |
| `Espacio` | plegar/desplegar rama |
| `Supr` / `Retroceso` | eliminar nodo |
| `Esc` | selecciona raiz (o cierra modal / sale de edicion de texto) |
| `↑ ↓` | hermanos; `→ ←` navega por lado (raiz → primer hijo del lado) |

**Guardas**: escribiendo en `INPUT/TEXTAREA` → solo `Esc` reacciona; modal abierto → solo `Esc`; en presentacion → solo `F5` (la navegacion de slides vive aparte: `→/Espacio/Enter` siguiente, `←/Backspace` anterior, `O/Home` overview, `N` notas, `E` play/editor, `Esc` sale — `MindMapCanvas.tsx:345-387`).

**Hints mostrados en la UI sin handler**: `Ctrl+S` ("Guardar Ahora" del menu Archivo) y `?` ("Atajos de Teclado" de Ayuda). `F11` lo maneja el navegador. **No existen** (aunque el spec viejo los listaba): `Ctrl+Alt+N`, `Ctrl+O`, `Ctrl+E`, `Ctrl+P` (imprimir), `Alt+B`, `Ctrl+A`, `Shift+Enter`, `Alt+N/K/G/I/C/W`, `Ctrl+0`, `Ctrl+ +/-`, `Alt+Enter`, `Alt+T`, `Home` (fuera de presentacion).

---

## 4. Anatomia Visual de un Nodo en el Lienzo

```text
    +---------------------------------------------------------------------------+
    |                                NODO BURBUJA                               |
    |  +---------------------------------------------------------------------+  |
    |  | [icono][bandera][nota]  TITULO PRINCIPAL (16px bold)  [85%][link]   |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  [Imagen adjunta: top / bottom / background / fit]                  |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  Cuerpo / Explicacion del nodo:                                     |  |
    |  |  "Detalle descriptivo en tipografia regular de 11px..."             |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  [tag: Tutorial]  [tag: Productividad]                              |  |
    |  +---------------------------------------------------------------------+  |
    |                                   |                                       |
    |                       [+ 3] (Plegar / Desplegar)                          |
    +-----------------------------------|---------------------------------------+
                                        v
                            (Linea Bezier SVG al Hijo)
```

Variantes Geometricas (10 formas):
1. bubble   - caja con esquinas redondeadas modernas y fondo solido/degradado/trama
2. fork     - linea de subrayado inferior estilo Freeplane clasico
3. rectangle- bordes rectos estructurados para procesos y diagramas tecnicos
4. square   - proporcion 1:1 simetrica para tarjetas y bloques
5. oval     - curvatura eliptica armonica para conceptos principales
6. circle   - circulo simetrico con texto centrado y soporte degradados radiales
7. pill     - bordes 100% redondeados para etiquetas compactas
8. hexagon  - poligono SVG de 6 caras con contorno dinamico
9. arrow    - poligono SVG con punta triangular para flujos y procesos
10. star    - poligono SVG de 5 puntas estilizado

---

## 5. Panel Inspector de Propiedades (ToolPanel — 6 Tabs Organismo)

Panel derecho con navegacion en grid de 6 columnas. Cada tab es un componente
organismo independiente, compuesto de moleculas y atomos reutilizables.

### 5.1. Tab "Contenido" (ContentTab)
Titulo y texto principal:
- Input de titulo con tipografia configurable
- FontFormatToolbar (molecula): Bold / Italic / Fuente / Tamano / Color
- Alineacion: izquierda / centro / derecha

Cuerpo / Subtexto:
- Textarea para el body
- FontFormatToolbar independiente para cuerpo
- Alineacion independiente

### 5.2. Tab "Formato" (FormatTab)
Fuente de verdad: `doc/DESIGN.md` §8 (contrato funcional). Resumen verificado 2026-10-17:

Forma y Geometria:
- ShapeSelector (molecula): grid-cols-5 de 10 formas con preview visual (nombre en espanol, tooltip)
- SliderInput (atomo): 'Ancho personalizado' customWidth 0-500px step 10, badge 'Automático' cuando 0/undefined (0 borra el valor)
- SliderInput (atomo): 'Alto personalizado' customHeight 0-300px step 5, mismo patron
- Dos sliders SIEMPRE independientes (no hay slider doble para square/circle)

Fondo del Nodo (5 tipos via grid-cols-5, escribe bgType):
- COLOR SOLIDO: ColorPicker 'Color de Fondo' (16 presets + Reset; onClear borra color y bgType)
- DEGRADADO: 2 ColorPickers SIN Reset (defaults #3b82f6/#1d4ed8) + 4 botones de direccion (to-r/to-b/to-br/radial, def to-r). Sin presets.
- TRAMA: 7 botones de patron (Puntos/Lineas/Rayas/Cuadros/Triangulos/Panal/Cruces) + ColorPicker 'Fondo Base' (compartido con color) + ColorPicker 'Trazo' (#475569) + Slider tamano 8-40px def 16 + Slider opacidad 10-100% def 40 (se guarda como decimal 0.1-1)
- IMAGEN: input URL + Upload local (FileReader dataURL) + Trash (solo si hay imagen) + preview h-24 + 3 modos de ajuste (cover Expandir/contain Completa/tile Repetir, def cover)
- TRANSPARENTE: sin controles adicionales

Contornos y Bordes:
- ColorPicker 'Color del Borde' (con Reset -> hereda rama/tema)
- SliderInput grosor 0-8px def 1 (sin presets fijos, sin checkbox 'Auto')
- 3 botones de estilo con preview de linea: solid / dashed / dotted (escribe borderDash y borderStyle)

Imagenes (en ContentTab, no en FormatTab):
- Imagen de Contenido (imageUrl): URL + Upload dataURL + 6 posiciones (top/between/bottom/left/right/fit; 'background' existe en el tipo pero el panel NO lo ofrece) + SliderInput ancho 60-500px def 140 + Eliminar
- Imagen de Fondo (bgImageUrl): vive en FormatTab; URL + Upload + 3 modos (cover/contain/tile; el tipo admite ademas 'fit' ≡ contain) + Eliminar. Sin slider de opacidad.

Aristas del Nodo (override individual, seccion 'Aristas y Propagacion'):
- 4 botones de forma: bezier Curva / linear Recta / sharp Escuadra / horizontal Horiz. ('hidden' existe en el tipo EdgeStyle pero NO en el panel)
- ColorPicker 'Color de la Arista' (con Reset)
- Propagacion: boton 'Aplicar a Hijos' (recursivo en subarbol) + boton 'Aplicar a Hermanos' (solo directos; no-op en raiz o padre con <=1 hijo). Copia 26 campos via extractNodeStyleBundle (forma, fondo, bordes, texto, aristas, customWidth/Height); NO copia body/imagen/tags/link/progreso.
- NOTA: perfiles (uniform/tapered/spindle/hourglass) y grosor de arista NO estan aqui: son nivel de MAPA en ThemeTab. Cadena de render: node -> map -> theme ('bezier'/'uniform'/defaultWidth).

### 5.3. Tab "Notas" (NotesTab)
Actualizado 2026-10-17 (progreso y enlace NO viven aqui; migraron a ContentTab "Metadatos"):
- Header: label 'Nota Markdown' con CSS uppercase (se ve en MAYUSCULAS) + toggle 'Mostrar en Nodo'/'Debajo del Cuerpo ✓' (icono LayoutList, showNoteInline) + grupo de 3 vistas edit/split/preview (def preview)
- viewMode es estado local: al salir y volver a la pestaña vuelve a 'preview' (NotesTab solo monta con activeTab='notes', ToolPanel.tsx:216)
- Toolbar markdown de 9 botones (negrita/cursiva/H1/H2/lista/numerada/checklist/codigo/cita) con placeholders fijos; H1/H2/lista/numerada/checklist/cita insertan SOLO prefijo (sin sufijo)
- Textarea guarda '' al vaciar (no undefined: unica excepcion al patron 'vaciar = undefined')
- Preview via MarkdownView (max-h 350px). Gotcha: '>' no genera <blockquote>
- Progreso 0-100% y enlace URL: se editan en ContentTab > Metadatos y Visibilidad

### 5.4. Tab "Iconos" (IconsTab)
Actualizado 2026-10-17 (fuente: IconsTab.tsx 314 lineas):
- 1 CollapsibleSection 'Color y Tamano' (sin Desplegar/Plegar todo) con badge = dot de iconColor
- ColorPicker 'Tinte del Icono' (iconColor, con Reset) + 7 colores Sugeridos + enlace 'Original'
- SliderInput 'Tamano del Icono' 10-36px def 14 (badge '14px (Estándar)'; Reset -> undefined)
- Propagacion: 'Copiar a Hijos'/'Copiar a Hermanos' (cableados) -> copian icons/iconColor/iconSize/iconPosition
- 'Iconos Asignados' (solo si hay): 'Quitar todos' -> icons: [] (array vacio, no undefined) + chips con X
- Buscador (searchVectorIcons), categorias con emojis, 8 quick tags; grid-cols-6 con tope de 120 iconos
- Boton 'Ver Galeria Completa de Iconos' -> IconPackModal

### 5.5. Tab "Nubes" (CloudsTab)
Actualizado 2026-10-17 (fuente: CloudsTab.tsx 288 lineas; solo escribe node.cloud):
- Switch maestro ON/OFF (apagar borra cloud entero -> pierde estilo al reactivar; encender crea defaults #3b82f6/scallop/0.08/dashed)
- 8 formas (cloud-scallop arc round-rectangle rectangle bubble oval hexagon star) + 2 sliders de margen -50..200 step 5 (Reset)
- Relleno: ColorPicker color de nube (sin Reset) + Opacidad 0-100% def 8 (guardada en decimal)
- Borde: ColorPicker (sin Reset) + Grosor 0-6px step 0.5 def 1.5 + Estilo solid/dashed/dotted def 'dashed' (solo borderDash)
- Gotchas: seccion 'Borde y Sombra' sin control de shadow; bgType gradient/pattern/image se renderizan en lienzo pero el panel solo escribe 'color'

### 5.6. Tab "Tema" (ThemeTab — Config del Mapa)
Actualizado 2026-10-17 (unico tab sin nodo seleccionado; fuente: ThemeTab.tsx 623 lineas):
- Tema visual: 8 tarjetas (THEMES) con dot de raiz + 4 colores de rama; badge con nombre del tema
- Layout: 9 algoritmos (standard/balanceado/right/left/top/bottom/tree-down/radial/circular) con iconos
- Fondo del lienzo: ColorPicker + 6 patrones de cuadricula (none/dots/lines/squares/triangles/hexagons); si patron != none: color de trazo (sin reset) + tamano 12-64px step 2 + opacidad 5-100% (guardada como decimal). NO existe selector de '12 presets' (import BACKGROUND_PRESET_THEMES muerto)
- Aristas globales: 4 formas (mismos SVG que por nodo) + 4 perfiles (═◣◆⧖) + Multicolor/Randomizar + ColorPicker 'Color Uniforme' + 8 colores Sugeridos + Estilo de Linea (3) + Grosor 1-8px step 0.5 def 2.5. Gotcha: 'Aplicar a todos' (onApplyEdge*) NO esta cableado por App -> solo efecto mapa
- Espaciado: sliders Horizontal 20-150 def 54 / Vertical 4-60 def 14. Cableado 2026-10-17: ToolPanel adapta onUpdateMapGaps -> onUpdateMapSpacing(h,v) (gap faltante = valor del mapa); tests ToolPanel.test.tsx

---

## 6. Modo Presentacion Clasica

Vista pantalla completa (100vw x 100vh, z-50, overflow-hidden).
Convierte el mapa mental en diapositivas secuenciales con 3 FASES POR NODO
y AUTO-PAGINACION SIN BARRAS DE DESPLAZAMIENTO.

### 6.1. Estructura Secuencial por Nodo

Para cada nodo en orden de profundidad:

    FASE 1: Tema Principal (siempre presente)
        |
        v
    FASE 2: Notas (si hay notas y estan habilitadas)
        |
        v
    FASE 3: Subtemas / Hijos (si hay hijos y esta habilitado)
        |
        v
    (Proximo Nodo)

FASE 1 -- TEMA PRINCIPAL:
- Imagen adjunta del nodo SIEMPRE visible si existe (responsive 2-col con texto si hay ambos)
- Titulo en grande (h1, 3xl-6xl segun espacio disponible)
- Texto del cuerpo: auto-paginado si es extenso
- Badge: iconos, progreso, tags del nodo
- Si el cuerpo es muy largo: "Tema Principal (Parte 1 de N)"

FASE 2 -- NOTAS:
- Cabecera: miniatura de imagen (si existe) + titulo del nodo
- Contenido Markdown renderizado completo
- Auto-paginado: "Notas del Tema (Parte 1 de N)" si el texto no cabe en una sola pantalla

FASE 3 -- SUBTEMAS:
- Grid de tarjetas (maximo 6 por diapositiva), cada tarjeta es clickeable
- Cada tarjeta: icono, titulo, cuerpo del hijo, tags
- Si hay mas de 6 hijos: "Subtemas (parte 1 de N)"
- Seccion de conectores cruzados al final (si esta habilitado)

### 6.2. Auto-Paginacion sin Scrollbars

Tipo de Contenido        | Limite por Diapositiva          | Comportamiento
------------------------ | ------------------------------- | -----------------------------------------------
Cuerpo del nodo          | ~4-6 parrafos / ~280-450 chars  | "Tema Principal (Parte X de N)"
Notas Markdown           | ~9 lineas / ~550 chars          | "Notas (Parte X de N)"
Subtemas / Hijos         | Maximo 6 tarjetas por slide     | "Subtemas (X-Y de N)"
Imagen del nodo          | Siempre visible en Fase 1       | Miniatura en cabecera de Fases 2 y 3

### 6.3. Barra Superior del Modo Presentacion (inline en PresentationMode.tsx)

    [Badge Fase] ... [<-- Volver*] [Editar/Opciones] [N/Total] [X Cerrar]

- **Correccion 2026-10-17**: no existe ningun organismo `PresentationControls` — los controles viven **dentro de `PresentationMode.tsx`** (no hay fichero aparte).
Badge de Fase (color segun tipo):
- Azul        -> Tema Principal
- Ambar       -> Notas del Tema
- Cian/Verde  -> Subtemas

Boton Volver: SOLO visible si hay historial de saltos (`jumpHistory`). Al pulsarlo regresa al slide de origen. Soporta multiples saltos en pila (LIFO). Activable tambien con tecla Backspace.
Boton Editar/Opciones (`SlidersHorizontal`): abre el modal de opciones (tecla E).

### 6.4. Modal de Opciones de Presentacion (real, `PresentationMode.tsx:712-1002`)

8 opciones en estado local (verificadas en `:308-315`):
- TEMA DE PRESENTACION: **8 temas** (los `PRESENTATION_THEMES` definidos **inline** en `PresentationMode.tsx:54-159` — **no existe `presentationThemes.ts`**; mismos ids/nombres que los temas del mapa, ver 6.5)
- NOTAS DEL PRESENTADOR: ON/OFF
- TAMANO DE IMAGENES ADJUNTAS: Pequena / Mediana / Grande / **Ocultar** (hidden)
- DIAPOSITIVAS DE SUB-NODOS HIJOS: ON/OFF
- CONEXIONES CRUZADAS: ON/OFF
- **RADAR MINI-MAPA: ON/OFF** (`:915`) — el spec viejo lo omitia
- ALINEACION DE CONTENIDO: Centro / Izquierda
- ESCALA DEL TITULO: Compacta / Normal / Grande

Footer: **"Editar en Lienzo"** (real: `onEditNode` cierra la presentacion, selecciona el nodo y abre el ToolPanel — `App:634-638`) y **"Aplicar y Ver Diapositiva"** (solo cierra el modal).

### 6.5. Temas Disponibles para Presentacion (8 temas, inline)

Definidos en `PRESENTATION_THEMES` (`PresentationMode.tsx:54-159`), sincronizados con `THEMES` del mapa (`branchColors` compartidos). El spec viejo listaba 7 temas ficticios (dark-studio, midnight-oled, cyberpunk-purple...) que **no existen**.

ID       | Nombre                  | Fondo   | Claro
--------- | ----------------------- | ------- | -----
default  | Clasico Azul            | #f8fafc | si
rainbow  | Arcoiris Vibrante       | #ffffff | si
dark     | Modo Oscuro             | #0f172a | no
forest   | Bosque Esmeralda        | #f0fdf4 | si
sunset   | Atardecer Calido        | #fffbeb | si
minimal  | Minimalista Mono        | #fafafa | si
blueprint| Plano Tecnico Blueprint | #0a2540 | no
honeycomb| Panal Creativo          | #fffdf5 | si

### 6.6. Atajos de Teclado en el Modo Presentacion (verificados `:517-548`)

Tecla                    | Accion
------------------------ | ------------------------------------------
Flecha Derecha / Enter   | Siguiente diapositiva
**Espacio**              | **Corregido 2026-10-17**: no avanzaba (el handler comparaba `e.key === 'Space'`; el valor real es `' '`) — ahora avanza igual que en los modos dinamico y elaborate
Flecha Izquierda         | Diapositiva anterior
Backspace                | Regresar al punto de salto (pila jumpHistory)
E                        | Abrir / cerrar modal de opciones
Esc                      | Cerrar modal de opciones / Salir de la presentacion
Clic en Card de Subtema  | Saltar a la diapositiva de ese nodo (empuja en jumpHistory)

Sin wrap: al final/inicio la navegacion se detiene.

---

## 7. Conectores Flotantes y Nubes

Conector (tipo Connector):
- Estilos de flecha: none, start, end, both
- Forma de trazo: curved, bezier, straight, step
- Patron de linea: solid, dashed, dotted
- Capas: above / below de los nodos
- Propiedades: opacidad, color, grosor, etiqueta de texto flotante
- Punto de control Bezier ajustable manualmente

Nubes de Agrupacion (tipo NodeCloud):
- Formas: arc, rectangle, round-rectangle, star
- Color RGBA personalizable
- Activable/desactivable por nodo

---

## 8. Tipos de Layout del Lienzo

ID                  | Nombre                | Descripcion
------------------- | --------------------- | --------------------------------------------------
standard            | Estandar Bifurcado    | Ramas distribuidas izq/der del raiz
balanced-horizontal | Horizontal Balanceado | Raiz a la izquierda, ramas a la derecha
left                | Solo Izquierda        | Todas las ramas hacia la izquierda
right               | Solo Derecha          | Todas las ramas hacia la derecha
top                 | Solo Arriba           | Arbol hacia arriba
bottom              | Solo Abajo            | Arbol hacia abajo
tree-down           | Arbol Vertical        | Raiz arriba, hijos abajo jerarquicamente
radial              | Radial                | Ramas en circulo alrededor del raiz
circular            | Circular              | Disposicion circular equilibrada

---

## 9. Atajos Globales de Teclado (resumen verificado)

> Sincronizado 2026-10-17 con el hook real `useKeyboardShortcuts` (221 lineas, conectado al store Zustand). La tabla anterior contenia atajos ficticios (`Shift+Enter`, `Ctrl+E`, `Ctrl+0`, `Alt+Enter`) y describia mal `F5`; el detalle de cableado y guardas vive en **§3.6** (canonico) y `doc/DESIGN.md` §10.5.

Atajo de Teclado          | Accion en la Interfaz
------------------------- | -------------------------------------------------
Tab / Insert              | Crear nuevo nodo Hijo
Enter                     | Crear nuevo nodo Hermano al mismo nivel
Espacio                   | Plegar / desplegar rama seleccionada
F2                        | Entrar en modo edicion de texto (el doble clic vive en el nodo)
Flechas Arriba/Abajo      | Navegar seleccion entre hermanos
Flechas Izq/Der           | Navegar por lado (raiz → primer hijo del lado)
Ctrl + C / X / V          | Copiar, cortar, pegar ramas completas (el pegado clona con IDs nuevos)
Supr / Retroceso          | Eliminar el nodo y todas sus sub-ramas (veto en la raiz)
Ctrl + Z / Ctrl + Y       | Deshacer / Rehacer (`Ctrl+Shift+Z` tambien rehace)
Ctrl + F                  | Abrir / cerrar barra de Busqueda y Filtro
Alt + O                   | Abrir / Cerrar panel de Esquema
Alt + P                   | Abrir / Cerrar panel de Propiedades
F5                        | Alternar modo presentacion (con el modo ACTIVO, por defecto el dinamico — no fuerza la clasica)
Esc                       | Seleccionar raiz / cerrar modal / salir de edicion de texto

**Guardas** (en este orden): escribiendo en `INPUT`/`TEXTAREA` → solo `Esc`; modal abierto → solo `Esc`; en presentacion → solo `F5` (la navegacion de slides es de cada modo: §6.6 clasica; los modos dinamico y elaborate se documentan en `doc/DESIGN.md` §10.2 y §10.3).

**No existen** (hints decorativos sin handler: `Ctrl+S`, `?`; o ficticios del spec viejo): `Shift+Enter`, `Ctrl+E`, `Ctrl+0`, `Alt+Enter`, `Ctrl+P`, `Ctrl+O`, `Alt+B`, `Ctrl+A`, `Ctrl+/-`, `Alt+T`, `Ctrl+Alt+N`, `Alt+N/K/G/I/C/W`, `Home` (fuera de presentacion).

---

## 10. Catalogo de Funciones Avanzadas

### 10.1. Formas Geometricas de Nodos (10 tipos)

> Orden corregido 2026-10-17 para coincidir con `NodeShape` (`types/mindmap.ts:1-11`).

1. bubble    - Caja redondeada moderna con fondo solido, degradado o trama
2. fork      - Linea de subrayado inferior estilo Freeplane clasico
3. rectangle - Bordes rectos para procesos y diagramas tecnicos
4. square    - Proporcion 1:1 simetrica para tarjetas y bloques
5. oval      - Curvatura eliptica armonica para conceptos principales
6. circle    - Simetrico con texto centrado y soporte degradados radiales
7. hexagon   - Poligono SVG de 6 caras con contorno dinamico (contenido al 68%)
8. pill      - Bordes 100% redondeados para etiquetas compactas
9. arrow     - Poligono SVG con punta triangular para flujos y procesos
10. star     - Poligono SVG de 5 puntas estilizado

### 10.2. Dimensiones y Auto-Ajuste
- customWidth: deslizador 0-500px step 10 ('Automático' = undefined; 0 borra)
- customHeight: deslizador 0-300px step 5 (mismo patron)
- Los dos sliders son independientes (no hay slider doble para square/circle)
- Texto envuelto automaticamente sin desbordamiento (break-words, hyphens)

### 10.3. Modos de Fondo del Nodo (5 tipos: bgType)
1. color: ColorPicker con 16 presets + Reset (onClear borra color y bgType)
2. transparent: Sin relleno, solo borde visible (sin controles extra)
3. gradient: Color1 (#3b82f6) + Color2 (#1d4ed8 en panel; fallback de render #8b5cf6), 4 direcciones (to-r/to-b/to-br/radial). Sin presets.
4. pattern: 7 estilos (dots/lines/squares/stripes/triangles/hexagons/cross), tamano 8-40px def 16, opacidad 10-100% def 40 (guardada como decimal)
5. image: bgImageUrl (URL o dataURL) + modos cover/contain/tile def cover ('fit' existe en el tipo ≡ contain, no ofrecido en panel)

### 10.4. Imagenes en el Nodo (2 tipos)
- imageUrl (contenido): posiciones top/between/bottom/left/right/fit ('background' en el tipo pero no en panel), ancho 60-500px def 140
- bgImageUrl (fondo): modos cover/contain/tile. Sin control de opacidad en panel.

### 10.5. Tipos de Aristas
- bezier    - Curva Bezier suave (defecto)
- linear    - Linea recta directa
- sharp     - Angulos rectos en L
- horizontal- Sale horizontalmente y baja
- hidden    - Sin linea de conexion

Perfiles: uniform, tapered (conico), spindle (huso), hourglass (reloj de arena)

### 10.6. Temas del Lienzo (12 fondos de lienzo disponibles)

ID                   | Nombre                   | Categoria
-------------------- | ------------------------ | ---------
bg-clean-white       | Lienzo Puro (Liso)       | Claro
bg-dot-grid-slate    | Cuaderno de Puntos       | Papel
bg-square-grid       | Papel Milimetrado        | Tecnico
bg-blueprint-pro     | Blueprint Tecnico        | Tecnico
bg-honeycomb-gold    | Panal Hexagonal          | Creativo
bg-triangular-mesh   | Malla Triangular         | Creativo
bg-lined-paper       | Rayas de Cuaderno        | Papel
bg-dark-matrix-dots  | Pizarra Oscura Puntos    | Oscuro
bg-dark-honeycomb    | Cyber Panal Oscuro       | Oscuro
bg-dark-isometric    | Malla Neon Triangular    | Oscuro
bg-graphite-lines    | Grafito con Rayas        | Oscuro
bg-mint-breeze       | Brisa de Menta (Puntos)  | Claro

### 10.7. Temas de Mapa (8 temas globales)

> Recuento corregido 2026-10-17: son **8** (`THEMES` en `themes.ts:15-135`), no 9 como decía el spec viejo.

ID        | Nombre               | Fondo   | Tipo
--------- | -------------------- | ------- | ------
default   | Clasico Azul         | #f8fafc | Claro
rainbow   | Arcoiris Vibrante    | #ffffff | Claro
dark      | Modo Oscuro          | #0f172a | Oscuro
forest    | Bosque Esmeralda     | #f0fdf4 | Claro
sunset    | Atardecer Calido     | #fffbeb | Claro
minimal   | Minimalista Mono     | #fafafa | Claro
blueprint | Plano Tecnico        | #0a2540 | Oscuro
honeycomb | Panal Creativo       | #fffdf5 | Claro

### 10.8. Filtrado y Busqueda (useSearchFilter hook)

> Verificado 2026-10-17 contra `useSearchFilter.ts` (51 l.): el hook **solo implementa 3 filtros**. La interfaz `FilterOptions` (`types/mindmap.ts:340-349`) declara más campos, pero **el hook los ignora** (gotcha documentado: `filterOptions.icon` muerto, etc.).

**Implementados** (acumulativos, computados via `useMemo`; sin ninguno, `searchMatches` es `undefined` y no se filtra):
- **Texto** (`query`): substring lower-case sobre **`text` + `note`** del nodo — **no busca en `body`** (el spec viejo decía "titulo, cuerpo y notas").
- **Tags** (`tag`): coincidencia exacta en `n.tags`.
- **Progreso** (`minProgress`): `progress >= minProgress`.

**Declarados en `FilterOptions` pero NO implementados en el hook**: `icon`, `hasNote`, `hasLink`, `showAncestors`, `showDescendants` (los dos últimos se resetean a `true` en `App:324` y `store:128-129` pero nunca se usan para filtrar — un match no despliega ramas plegadas, ver §9 OutlineView).

El hook devuelve también `availableTags` (tags únicos del mapa, para el desplegable del FilterBar).

### 10.9. Historial de Deshacer / Rehacer
- Gestionado dentro del store Zustand (useMindMapStore)
- Profundidad de historial: 40 estados
- Cada mutacion (anadir, borrar, mover, editar, formatear) es una entrada independiente
- Ctrl+Z (deshacer) / Ctrl+Y (rehacer)

### 10.10. Exportacion e Importacion

> Corregido 2026-10-17 contra `ExportImportModal.tsx`: el spec viejo listaba `.svg` y `.png` que **no existen** (solo 4 formatos de export; el modal tampoco exporta imágenes — ver §8.5.1).

Exportar a (4 formatos, `ExportImportModal.tsx:49-69`):
- .mm        Freeplane XML (`exportToFreeplaneXML`, `application/xml`)
- .html      Pagina web autonoma con mapa embebido (`exportToStandaloneHTML`, `*_portable.html`)
- .md        Markdown con jerarquia de encabezados (`exportToMarkdown`)
- .json      Respaldo completo del estado interno (`JSON.stringify`)

**NO existe** export a .svg ni .png.

Importar desde (`accept=".mm,.json,.xml"`, :276):
- .json      Respaldo FreeMind Studio (si `parsed.rootId && parsed.nodes`)
- .mm / .xml Freeplane XML (fallback: `importFromFreeplaneXML`)

### 10.11. Nodos Libres (Free Floating / Post-it)
- `isFreeFloating: true` + `freePosition: {x, y}` (`types/mindmap.ts:161-162`)
- Posicionamiento libre por coordenadas x,y independiente del layout automatico (`layoutEngine.ts:593`; si falta `freePosition`, fallback a `canvasCenter` +200/−150)
- 🐛 **Gotcha**: **no existe UI** para crear/editar nodos libres (ningún setter de `isFreeFloating` en componentes; el soporte vive en el motor de layout y en tests — util solo vía importación/JSON o plantillas que los incluyan)

### 10.12. Propagacion de Estilos

> Corregido 2026-10-17: "hijos directos" era **incorrecto** — la propagación a hijos es **recursiva** (todo el subárbol, `applyRecursively` en `useMindMapStore.ts:532-541`).

- **A hijos**: el estilo del nodo fuente se aplica a **todos los descendientes** (recursivo, niveles profundos incluidos). Veto: no hace nada sin hijos.
- **A hermanos**: se aplica a **todos los hermanos** del nodo fuente (excluido el propio nodo fuente). Veto: raíz (`targetId === rootId`) y padres con un solo hijo.
- **Bundle propagado** (`extractNodeStyleBundle`, `useMindMapStore.ts:79-109`, 25 campos): forma, color/bgType + degradados (c1/c2/dirección) + tramas (estilo/color/tamaño/opacidad), bordes (color/ancho/dash/estilo), tipografía (color/tamaño/bold/italic/fuente/alineación), aristas (color/estilo/ancho/dash/perfil) y dimensiones (customWidth/customHeight).
- **NO se propagan**: cuerpo, nota, tags, iconos, imagen (ni `imageUrl` ni `bgImageUrl`), progreso, enlace, nube, plegado.

---

## 11. Arquitectura de Componentes (Atomic Design)

> Árbol corregido 2026-10-17 contra el código real: desaparecen los ficticios `PresentationControls.tsx`, `presentationThemes.ts` y `CanvasZoomControls.tsx`; se añaden los organismos reales (`Presentation/`, `canvas/` completo, `templates/MainEditorLayout`), el subgrupo `molecules/node/` y los átomos/moléculas que faltaban.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PAGINA: App.tsx (700 l. orquesta store+uiTheme, estado local de modales│
│         y presentationType; envuelve en ErrorBoundary + MainEditorLayout│
├────────────────────────────────────────────────────────────────────────┤
│ ORGANISMOS DE PAGINA:                                                  │
│   MenuBar(558) · ToolBar(643) · FilterBar(119) · MindMapCanvas(1584)   │
│   ToolPanel(272) · PresentationMode(1607) · OutlineView(463)           │
│   StatusBar(51) · MiniMap(466) · Modals/ (6)                           │
├────────────────────────────────────────────────────────────────────────┤
│ ORGANISMOS INTERNOS:                                                   │
│   toolpanel/ → ContentTab · FormatTab · NotesTab · IconsTab            │
│                CloudsTab · ThemeTab                                     │
│   canvas/   → CanvasBackgroundLayer · CanvasContextMenu                │
│               CanvasDrawingOverlay · CanvasPresentationHUD              │
│   Presentation/ (elaborate/Prezi) → ElaboratePresentationSystem         │
│               SpatialSlideCardComponent · SlideDetailModal              │
│   templates/ → MainEditorLayout (slot layout del editor)                │
├────────────────────────────────────────────────────────────────────────┤
│ MOLECULAS:                                                             │
│   FontFormatToolbar · ShapeSelector · TagManager · HistoryControls      │
│   ModalHeader · SearchInput · ZoomControls                              │
│   node/ (subgrupo del nodo): NodeHeaderRow · NodeBadgesBar              │
│          NodeActionButtons · NodeBackgroundRenderer                      │
├────────────────────────────────────────────────────────────────────────┤
│ ATOMOS:                                                                │
│   CollapsibleSection · ColorPicker · SliderInput                        │
│   ToggleButton · ToggleButtonGroup                                      │
│   Badge · Button · IconButton · Input · ModalBackdrop · ErrorBoundary   │
├────────────────────────────────────────────────────────────────────────┤
│ HOOKS:                                                                 │
│   useMindMapStore (Zustand, 716 l.) · useSearchFilter ·                │
│   useKeyboardShortcuts (221 l.)                                         │
├────────────────────────────────────────────────────────────────────────┤
│ UTILS:                                                                 │
│   layoutEngine · themes · mapTheme · uiTheme · storage ·                │
│   freeplaneConverter · htmlExporter · connectorUtils ·                  │
│   markdownRenderer · presentationGenerator ·                            │
│   spatialPresentationGenerator · iconMap · vectorIconPack ·             │
│   sampleMaps · additionalTemplates · templateIllustrations              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Arquitectura de Archivos del Proyecto

> Árbol reconstruido 2026-10-17 desde el disco (líneas reales entre paréntesis). Corrige los ficheros fantasma del spec anterior (`PresentationControls.tsx`, `presentationThemes.ts`, `CanvasZoomControls.tsx` — ninguno existe) y añade los ~20 ficheros que faltaban (`Presentation/`, `templates/`, subgrupo `molecules/node/`, 6 átomos, 4 utils). **Tests**: 29 suites / 131 tests en carpetas `__tests__/` (Vitest + jsdom, setup en `src/test/setup.ts`).

```
src/
├── App.tsx                              Pagina / orquestador (700 l.)
├── App.test.tsx                         Test de humo del orquestador
├── main.tsx                             ReactDOM.createRoot (10 l.)
├── index.css                            Estilos globales + Tailwind v4
│
├── types/
│   └── mindmap.ts                       Tipos: MindMap, MindNode, Connector, LayoutType… (355)
│
├── hooks/
│   ├── useMindMapStore.ts               Store Zustand centralizado, CRUD + undo/redo (716)
│   ├── useSearchFilter.ts               Hook de filtro/busqueda reactivo (51)
│   └── useKeyboardShortcuts.ts          Atajos globales con guardas (221)
│
├── components/
│   ├── MenuBar.tsx                      Barra de menu superior (558)
│   ├── ToolBar.tsx                      Barra de herramientas rapidas (643)
│   ├── FilterBar.tsx                    Barra de busqueda y filtros (119)
│   ├── MindMapCanvas.tsx                Lienzo SVG/HTML con pan/zoom + presentation dinamica (1584)
│   ├── NodeComponent.tsx                Renderizado de cada nodo (10 formas) (211)
│   ├── ToolPanel.tsx                    Contenedor de 6 tabs-organismo (272)
│   ├── PresentationMode.tsx             Presentacion clasica + 8 temas inline (1607)
│   ├── OutlineView.tsx                  Vista de esquema en arbol (463)
│   ├── MiniMap.tsx                      Minimapa radar flotante (466)
│   ├── StatusBar.tsx                    Barra de estado inferior (51)
│   │
│   ├── atoms/                           Primitivos UI reutilizables
│   │   ├── Badge.tsx (63)
│   │   ├── Button.tsx (67)
│   │   ├── CollapsibleSection.tsx (76)
│   │   ├── ColorPicker.tsx (78)
│   │   ├── ErrorBoundary.tsx (87)
│   │   ├── IconButton.tsx (72)
│   │   ├── Input.tsx (98)
│   │   ├── ModalBackdrop.tsx (60)        Backdrop+card de TODOS los modales
│   │   ├── SliderInput.tsx (60)
│   │   ├── ToggleButton.tsx (38)
│   │   └── ToggleButtonGroup.tsx (50)
│   │
│   ├── molecules/                       Combinaciones de atomos
│   │   ├── FontFormatToolbar.tsx (80)
│   │   ├── HistoryControls.tsx (40)
│   │   ├── ModalHeader.tsx (56)
│   │   ├── SearchInput.tsx (40)
│   │   ├── ShapeSelector.tsx (123)
│   │   ├── TagManager.tsx (74)
│   │   ├── ZoomControls.tsx (81)         Controles de zoom del lienzo
│   │   └── node/                        Subgrupo del nodo (moléculas internas)
│   │       ├── NodeHeaderRow.tsx (281)    texto/edicion inline (textarea)
│   │       ├── NodeBadgesBar.tsx (207)    progreso/iconos/tags
│   │       ├── NodeActionButtons.tsx (84) addChild/delete/fold
│   │       └── NodeBackgroundRenderer.tsx (636) SVG formas+gradientes+patrones
│   │
│   ├── organisms/                       Secciones funcionales complejas
│   │   ├── toolpanel/
│   │   │   ├── ContentTab.tsx (477)
│   │   │   ├── FormatTab.tsx (540)
│   │   │   ├── NotesTab.tsx (224)
│   │   │   ├── IconsTab.tsx (314)
│   │   │   ├── CloudsTab.tsx (288)
│   │   │   └── ThemeTab.tsx (623)
│   │   ├── canvas/
│   │   │   ├── CanvasBackgroundLayer.tsx (148)
│   │   │   ├── CanvasContextMenu.tsx (250)
│   │   │   ├── CanvasDrawingOverlay.tsx (94)
│   │   │   └── CanvasPresentationHUD.tsx (489)   Presentacion dinamica (Mindomo)
│   │   └── Presentation/                Presentacion elaborate (Prezi espacial)
│   │       ├── ElaboratePresentationSystem.tsx (786)
│   │       ├── SpatialSlideCardComponent.tsx (373)
│   │       └── SlideDetailModal.tsx (277)
│   │
│   ├── templates/
│   │   └── MainEditorLayout.tsx (71)    Layout de slots (menu/panel/canvas/status)
│   │
│   └── Modals/                          6 modales (el 7º ComingSoonModal eliminado 2026-10-17)
│       ├── ExportImportModal.tsx (293)
│       ├── ShortcutsModal.tsx (65)
│       ├── TemplatesModal.tsx (607)
│       ├── SavedMapsModal.tsx (131)
│       ├── ConnectorModal.tsx (216)
│       └── IconPackModal.tsx (395)
│
├── test/
│   └── setup.ts (25)                    Polyfilla matchMedia + ResizeObserver
│
└── utils/
    ├── layoutEngine.ts                  Motor de layout (9 algoritmos) (1940)
    ├── themes.ts                        8 temas de mapa + 12 fondos (291)
    ├── mapTheme.ts (43)                 applyThemeRestyle/applyBackgroundUpdate
    ├── uiTheme.ts (41)                  UI tema claro/oscuro/sepia
    ├── markdownRenderer.tsx             Parser Markdown propio (351)
    ├── connectorUtils.ts                Rutas Bezier de conectores (100)
    ├── freeplaneConverter.ts            Import/Export Freeplane .mm XML (264)
    ├── htmlExporter.ts                  Exportador HTML autonomo (2226)
    ├── storage.ts                       Persistencia en localStorage (106)
    ├── presentationGenerator.ts         Slides de la presentacion clasica (212)
    ├── spatialPresentationGenerator.ts  Slides espaciales elaborate (495)
    ├── sampleMaps.ts                    Tutorial + blanco (3879)
    ├── additionalTemplates.ts           Plantillas adicionales (2528)
    ├── templateIllustrations.ts         Ilustraciones SVG (464)
    ├── iconMap.tsx                      String icono -> componente React (140)
    └── vectorIconPack.tsx               Pack de iconos vectoriales (531)
```
