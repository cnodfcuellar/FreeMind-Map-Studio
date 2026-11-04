# 🌳 Árbol de Características — FreeMind Map Studio

> **Actualizado**: 2026-10-17 · **Estado**: verificado contra el código real de `src/` (auditorías de DESIGN §6-§10 del mismo día; controles de nodos y ZoomContr
ols leídos directamente de `NodeActionButtons.tsx` y `ZoomControls.tsx`).
> Un *feature tree* es la descomposición jerárquica de todo lo que el producto ofrece: raíz = producto, primer nivel = áreas/módulos, hojas = capacidades atómicas y verificables.

Este documento recoge **2 árboles complementarios**:

| Árbol | Eje | Sirve para |
|---|---|---|
| **§1 Funcional** | Qué hace el producto (dominio) | Requisitos, roadmap, scope, onboarding de producto |
| **§2 Por interfaz** | Cada superficie y **cada control con qué botón y qué hace** | Wireframes, tests de UI, onboarding de uso, QA por control |

---

## 1. Árbol funcional (por capacidades)

```
FreeMind Map Studio (editor de mapas mentales 100% offline)
│
├── 🗂 Edición de nodos
│   ├── CRUD: hijo (Tab/Insert), hermano (Enter), borrar rama (Supr, veto en raíz)
│   ├── Reordenar: arrastrar para republicar (guarda anti-ciclo)
│   ├── Portapapeles: copiar/cortar/pegar rama (IDs nuevos al pegar)
│   ├── Fold/plegar por nodo + desplegar/plegar todo
│   ├── Edición inline de texto (F2/doble clic) + resincronización de texto externo
│   └── Metadatos: tags, progreso 0-100, nota Markdown, enlace web, imagen adjunta (6 posiciones, 60-500px)
│
├── 🎨 Formato y estilo
│   ├── 10 formas de nodo (bubble, fork, rectangle, square, oval, circle, pill, hexagon, arrow, star)
│   ├── Fondo: sólido / degradado / trama (7) / imagen / transparente
│   ├── Bordes: color, grosor, estilo (sólido/guiones/puntos)
│   ├── Aristas: 4 formas, 4 perfiles de grosor (ribbon), color por nodo/mapa, grosor, dash
│   ├── Propagación de estilo a hijos (recursivo) y hermanos
│   ├── 520+ iconos vectoriales (pack en grid, buscador, categorías, galería completa)
│   └── Nubes de agrupación (8 formas, relleno, borde) sobre nodo + descendientes
│
├── 🗺 Lienzo y organización
│   ├── 9 layouts (estándar, balanceado, derecha, izquierda, arriba, abajo, árbol, radial, circular)
│   ├── 8 temas de mapa + 12 fondos de lienzo + patrones de cuadrícula (6)
│   ├── Espaciado horizontal/vertical ajustable; zoom + pan; colisiones resueltas
│   ├── MiniMap arrastrable + ZoomControls
│   ├── Menú contextual en nodo y en fondo
│   ├── Vista Esquema (Outline): búsqueda interna, edición en línea, recursión con fold
│   └── Filtro global: texto (título+notas), tags exactos, progreso mínimo
│
├── 🎬 Presentaciones (3 modos)
│   ├── Clásica: slides por fase (tema/notas/subtemas), paginación, 8 temas, radar minimapa
│   ├── Dinámica: marcos sobre el lienzo (selección de nodo/dibujo libre), editor+play,
│   │   filmstrip, notas del orador, auto-generación por jerarquía, undo propio
│   └── Elaborada (espacial estilo Prezi): tarjetas 720×440, cámara pan/zoom/rotación,
│       5 estrategias de acomodo, editor de tarjeta, presentador con spotlight
│
├── 💾 Persistencia y archivos
│   ├── Mapa actual + índice de mapas guardados (localStorage automático)
│   ├── ~20 plantillas + mapa en blanco (galería con preview en vivo)
│   ├── Exportar: Freeplane .mm, HTML portable autocontenido, Markdown, JSON
│   └── Importar: .mm (Freeplane) y .json
│
└── 🖥 Interfaz
    ├── 3 temas de UI (claro/oscuro/sepia) por tokens, persistidos
    ├── 6 pestañas de inspector (Texto, Estilos, Notas, Iconos, Nubes, Mapa)
    ├── Atajos de teclado globales (Ctrl+Z/Y, F5, F2, Ctrl+F, Alt+O/P…)
    └── 100% offline, sin backend, responsive mínimo (sm:/md:)
```

---

## 2. Árbol por interfaz (control a control)

Cada hoja = un control real: **nombre → qué hace**. Los atajos entre paréntesis son los que el código implementa (lista canónica en `INTERFACE_SPEC.md` §3.6).

```
Interfaz de FreeMind Map Studio
│
├── 🔝 MenuBar (barra superior; 6 botones de menú — clic abre/cierra, click-outside cierra)
│   │
│   ├── 📁 Archivo
│   │   ├── Nuevo Mapa → reemplaza por mapa en blanco (id/fechas nuevas, selecciona raíz; sin confirmación)
│   │   ├── Plantillas de Ejemplo → abre el modal Plantillas
│   │   ├── Mis Mapas Guardados → abre el modal Mapas Guardados
│   │   ├── ── Guardar Ahora [Ctrl+S hint] → guarda el mapa en localStorage (el atajo Ctrl+S NO está implementado; solo el clic)
│   │   ├── ── Exportar (.mm / HTML) → abre el modal Exportar/Importar
│   │   └── Importar Freeplane (.mm) → abre el MISMO modal (ninguna pestaña preseleccionada)
│   │
│   ├── ✏️ Editar
│   │   ├── Deshacer [Ctrl+Z] → retrocede 1 paso (deshabilitado sin historial)
│   │   ├── Rehacer [Ctrl+Y] → avanza 1 paso (deshabilitado sin historial)
│   │   └── ── Eliminar Rama [Supr] → borra el nodo y su subárbol (rojo; en la raíz el veto está en el store)
│   │
│   ├── ➕ Insertar
│   │   ├── Nodo Hijo [Tab] → añade hijo al seleccionado y entra en edición
│   │   ├── Nodo Hermano [Enter] → añade hermano (hereda lado/forma)
│   │   ├── ── Conector de Relación → abre el modal Conector con origen = nodo seleccionado
│   │   ├── Nube de Rama → activa nube por defecto en el nodo / la apaga si ya tiene
│   │   └── ── Pack Iconos Vectoriales [badge 500+] → abre el modal Pack de Iconos
│   │
│   ├── 🎨 Formato
│   │   ├── TEMAS VISUALES (5 de 8): Clásico Freeplane · Bosque Esmeralda · Arcoiris Vibrante ·
│   │   │   Atardecer Cálido · Modo Oscuro → restyle completo del mapa (colores, bordes, aristas)
│   │   ├── FORMA DEL NODO (10 formas con preview) → cambia la forma del nodo (sin nodo = no-op silencioso)
│   │   └── ── Restablecer Formato [rojo, Eraser] → resetea 19 campos del nodo a defaults del tema
│   │
│   ├── 👁 Ver
│   │   ├── Panel Lateral de Esquema [Alt+O] → alterna el panel Outline
│   │   ├── Presentación Clásica [badge "Activo" estático] → entra en modo clásico
│   │   ├── Presentación Dinámica (Lienzo) [F5 hint] → entra en modo dinámico
│   │   ├── Presentación Elaborada (Espacial) [badge "Activo" estático] → entra en modo elaborate
│   │   ├── ── Desplegar Todo el Mapa → unfold recursivo
│   │   ├── ── Plegar Todas las Ramas → fold recursivo
│   │   └── ── Pantalla Completa [F11 hint] → fullscreen del navegador
│   │
│   ├── ❓ Ayuda
│   │   ├── Atajos de Teclado [? hint] → abre el modal Atajos (el "?" solo funciona si no estás escribiendo)
│   │   └── Guía Tutorial Freeplane → abre el MISMO modal de Plantillas
│   │
│   ├── Centro: título del mapa editable — doble clic → input; Enter/blur confirma con trim(); vacío = no cambia
│   └── Derecha: badge "100% Offline" (punto verde pulsante) + botón tema UI → cicla Sol→Luna→Café (persiste)
│
├── 🧰 ToolBar (barra de herramientas, de izquierda a derecha)
│   ├── [Deshacer]/[Rehacer] → iconos con disabled según historial
│   ├── [Hijo] [Tab|Insert, primario azul] · [Hermano] [Enter] · [Eliminar] [Supr; disabled sin nodo o en raíz]
│   ├── [Plegar/Desplegar] [Espacio] → disabled sin hijos; icono Maximize2 si plegado / Minimize2 si abierto
│   ├── [Negrita]/[Cursiva] → toggles de formato (visibles ≥ sm; según el nodo)
│   ├── [select Forma] → 6 de 10 formas (visibles ≥ sm)
│   ├── [Conector] → abre modal Conector (visibles ≥ md; bajo lg solo icono)
│   ├── [Nube] → alterna nube; se pone ámbar si el nodo tiene nube activa (oculto < md)
│   ├── [Iconos SVG] [badge 500+] → abre el modal Pack de Iconos
│   ├── Menú móvil "Más" (oculto ≥ md): select con las 10 formas · Negrita/Cursiva · Crear Conector flotante · Alternar Nube
│   ├── [Buscar y Filtrar] [Ctrl+F] → alterna la FilterBar (activo = azul)
│   ├── [👁 Vista] → popover "Visibilidad Global (Modo Enfoque)" con 5 filas conmutables:
│   │     Cuerpos · Imágenes adjuntas · Etiquetas · Iconos temáticos · Insignias de enlace
│   │     (cada fila alterna ese flag global del mapa y muestra badge "Oculto"/"Visible"; el ojo usa EyeOff si algún flag está activo)
│   ├── [Esquema] [Alt+O, indigo] → alterna el panel Outline (activo = indigo-100)
│   ├── [Presentar] → popover "Tipos de Presentación" con 3 tarjetas (Clásico / Elaborado (Espacial Prezi) / Dinámico
│   │     (Estilo Mindomo)) → entra en el modo elegido (badge "Activo" es estático, no refleja el modo en curso)
│   ├── [Exportar] [azul primario] → abre el modal Exportar/Importar
│   └── [Panel de Propiedades] [Alt+P] → alterna el ToolPanel (activo = azul-100)
│
├── 🔍 FilterBar (barra bajo el ToolBar; solo visible con Ctrl+F u ojo Vista)
│   ├── [input "Buscar por texto en nodos..."] → filtra por query en título + notas (live, sin botón)
│   │     con [×] de limpieza cuando hay texto
│   ├── [select Etiquetas] (solo si el mapa tiene tags) → filtra por tag exacto ("Todas las Etiquetas" = sin filtro)
│   ├── [select Progreso] → Cualquier Progreso / Solo 100% / ≥ 50% / Con Progreso Activo
│   ├── [contador "n coincidencias"] → solo al filtrar (icono Sparkles)
│   ├── [Limpiar filtros] → restablece query/tags/progreso
│   └── [X] → cierra la FilterBar
│
├── 🖼 Lienzo (zona central)
│   ├── Nodo — [clic] selecciona · [doble clic] edita el texto inline (Enter confirma, Esc cancela)
│   ├── Nodo hover — [botón − o chevron] plega/despliega la rama · [+] "Agregar nodo hijo (Tab)"
│   ├── Nodo — [arrastrar] sobre otro nodo = republicar como hijo (guarda anti-ciclo; raíz no se mueve)
│   ├── Menú contextual de nodo (clic derecho; 11 items en 5 grupos):
│   │     Agregar Hijo [Tab] · Agregar Hermano [Enter] · Editar Texto [F2]
│   │     Copiar Rama [Ctrl+C] · Cortar Rama [Ctrl+X] · Pegar como Hijo [Ctrl+V]
│   │     Crear Conector a otro nodo · Alternar Nube de Rama
│   │     Aplicar Estilo a Hijos · Aplicar Estilo a Hermanos (oculto en raíz)
│   │     Eliminar Nodo [Supr] (oculto en raíz)
│   ├── Menú contextual de fondo — Agregar Rama Principal (añade un hijo a la raíz)
│   ├── Botones flotantes — [Esquema] (Alt+O) y [Propiedades] (Alt+P): aparecen cuando esos paneles están ocultos
│   ├── MiniMap (abajo a la derecha) — vista en miniatura; [clic en un punto] salta el lienzo ahí;
│   │     [arrastrar el rectángulo azul] mueve el viewport; se oculta en modo presentación dinámica
│   └── ZoomControls — [Compass] mostrar/ocultar MiniMapa (activo azul) · [ZoomOut (Ctrl+-)] ·
│         [% en mono] clic = restablecer zoom al 100% · [ZoomIn (Ctrl+ +)] · [Maximize2] "Ajustar y centrar todo el mapa"
│
├── 🎬 Modo Dinámica (HUD embebido sobre el lienzo; F5 o popover Presentar)
│   ├── Top bar — badge "Presentación Dinámica" + título del mapa
│   │   ├── [Editor de Marcos] ↔ [Presentar (F5)] → conmuta edición/play
│   │   ├── [Deshacer]/[Rehacer] de marcos (undo propio del modo, no del editor)
│   │   ├── [Empezar de Cero] [rojo] → borra todos los marcos + índice + staged (sin confirmación)
│   │   ├── [Auto-generar] → regenera marcos por jerarquía (overview, raíz, ramas, notas)
│   │   └── [X] Salir (ESC) → vuelve al editor del mapa
│   ├── Pill "Crear marco:" — [1. Seleccionar Nodo] clic en nodo crea marco (si ya tiene, navega al existente) ·
│   │     [2. Dibujar Recuadro] arrastre sobre el lienzo (crosshair; badge "Nuevo marco (W×H)" en vivo) ·
│   │     [Navegar / Mover] interacción normal
│   ├── Selección múltiple — contador "N seleccionados" + [Crear Marco] (área libre) + [X] vaciar selección
│   ├── Capa de marcos — badges "Slide n" [clic] = enfocar ese marco; título al seleccionar (≤8 marcos)
│   ├── [FileText] Notas del orador [N] → cajón con Markdown del nodo/marco activo (solo si hay nota)
│   └── HUD inferior — barra de progreso · filmstrip ([clic] salta al marco; Trash2 en hover lo borra) ·
│         [Anterior (←/Retroceso)] · [Overview (O/Home)] · [Siguiente (→/Espacio)] · [Notas (N)] · [Layers] oculta filmstrip
│
├── 📋 OutlineView (panel izquierdo; Alt+O)
│   ├── Cabecera — [Buscar] alterna el input (al ocultar limpia) · [FolderOpen] Desplegar todas ·
│   │     [FolderClosed] Plegar todas · [Maximize2/Minimize2] Maximizar/Reducir · [PanelLeftClose] Ocular
│   ├── [input "Filtrar por texto o #etiqueta..."] → búsqueda interna (título/cuerpo/tags) + resaltado ámbar + [X]
│   ├── Fila — [clic] selecciona · [doble clic] edita en vivo (Enter=hermano, Tab=hijo, Esc=cierra) ·
│   │     [chevron] pliega · [+] añade hijo · [Trash2] borra (oculto en la raíz) · [enlace] abre en nueva pestaña
│   └── Footer — atajos "Tab: hijo • Enter: hermano" / "Doble clic: editar"
│
├── 🧭 ToolPanel (panel derecho; Alt+P) — 6 pestañas (clic en la pestaña; secciones con Desplegar/Plegar todo)
│   │
│   ├── 📝 Texto
│   │   ├── Título — [textarea] → `updateNode({ text })` en tiempo real · [FontFormatToolbar] → `updateNode({ bold, italic, textAlign })` ·
│   │   │     [ColorPicker con Reset] → `updateNode({ textColor: color | undefined })` · [Slider fuente 10-36px] → `updateNode({ fontSize })`
│   │   ├── Cuerpo — [ojo] alterna visibilidad en lienzo `updateNode({ hideBody: !hideBody })` · [textarea] → `updateNode({ body })` ·
│   │   │     [FontFormatToolbar cuerpo] → `updateNode({ bodyBold, bodyItalic, bodyAlign })` · [ColorPicker cuerpo] → `updateNode({ bodyColor })` ·
│   │   │     [Slider tamaño cuerpo 9-24px] → `updateNode({ bodyFontSize })`
│   │   ├── Imagen adjunta —
│   │   │     ├── [input URL] → `updateNode({ imageUrl: url })`
│   │   │     ├── [Upload botón] → abre file picker nativo (`accept="image/*"`), lee con `FileReader` como DataURL y guarda `updateNode({ imageUrl: dataUrl })`
│   │   │     ├── [Trash2] → limpia `updateNode({ imageUrl: undefined, imagePosition: undefined, imageWidth: undefined })`
│   │   │     └── [Si imageUrl existe]:
│   │   │           ├── [6 botones de posición] → `updateNode({ imagePosition: 'top'|'above-text'|'below'|'left'|'right'|'fit' })`
│   │   │           └── [Slider ancho 60-500px, step 10] → `updateNode({ imageWidth })` (Reset = 200px)
│   │   └── Metadatos —
│   │         ├── [TagManager] → input texto + Enter/botón Plus añade tag a array; clic en [X] de chip lo remueve → `updateNode({ tags })`
│   │         ├── [input enlace web] → valida y actualiza `updateNode({ link: url })` (muestra icono ExternalLink en nodo)
│   │         ├── [Slider progreso 0-100, step 5] → `updateNode({ progress: val })` (Reset = undefined, oculta barra)
│   │         └── [Botones ojo de visibilidad local] → alternan flags por nodo (`hideTags`, `hideLink`, `hideProgress`, `hideIcons`)
│   │
│   ├── 🎨 Estilos
│   │   ├── Forma — [ShapeSelector: grid 2×5 con 10 formas geométricas] → `updateNode({ shape: id })` ·
│   │   │     [Slider Ancho 0-500px (0 = auto)] → `updateNode({ customWidth })` · [Slider Alto 0-300px] → `updateNode({ customHeight })`
│   │   ├── Fondo del Nodo — [Selector de tipo: 5 botones mutuamente exclusivos]:
│   │   │     ├── 1. Tipo Sólido (`bgType === 'color'`) →
│   │   │     │     [ColorPicker + 16 presets] → `updateNode({ color, bgType: 'color' })` · [Reset] → restaura a undefined (hereda del tema)
│   │   │     ├── 2. Tipo Degradado (`bgType === 'gradient'`) →
│   │   │     │     [ColorPicker Inicial] → `updateNode({ gradientColor1 })` · [ColorPicker Final] → `updateNode({ gradientColor2 })` ·
│   │   │     │     [Dirección: 4 botones] Horizontal (`to-r`) / Vertical (`to-b`) / Diagonal (`to-br`) / Radial (`radial`) → `updateNode({ gradientDirection })`
│   │   │     ├── 3. Tipo Trama (`bgType === 'pattern'`) →
│   │   │     │     [7 estilos de trama: puntos, líneas, rayas, cuadros, triángulos, hexágonos, cruces] → `updateNode({ nodePattern: id })` ·
│   │   │     │     [ColorPicker Fondo Base] → `updateNode({ color })` · [ColorPicker Trazo de Trama] → `updateNode({ nodePatternColor })` ·
│   │   │     │     [Slider tamaño patrón 8-40px] → `updateNode({ nodePatternSize })` · [Slider opacidad trazo 10-100%] → `updateNode({ nodePatternOpacity: val/100 })`
│   │   │     ├── 4. Tipo Imagen de Fondo (`bgType === 'image'`) →
│   │   │     │     [input URL / Upload DataURL] → `updateNode({ bgImageUrl })` ·
│   │   │     │     [Ajuste de imagen: 3 botones] Expandir (`cover`) / Completa (`contain`) / Repetir (`repeat`) → `updateNode({ bgImageMode })`
│   │   │     └── 5. Tipo Transparente (`bgType === 'transparent'`) → `updateNode({ bgType: 'transparent', color: 'transparent' })` (sin controles secundarios)
│   │   ├── Borde y Contorno — [ColorPicker color con Reset] → `updateNode({ borderColor })` ·
│   │   │     [Slider grosor 0-8px] → `updateNode({ borderWidth })` (0 = sin borde) ·
│   │   │     [3 botones de estilo de línea] Sólido (`solid`) / Guiones (`dashed`) / Puntos (`dotted`) → `updateNode({ borderDash })`
│   │   └── Arista y Propagación —
│   │         ├── [4 formas de conexión] Curva orgánica / Bézier / Línea Recta / Ortogonal → `updateNode({ edgeShape })`
│   │         ├── [ColorPicker color de arista] → `updateNode({ edgeColor })` (Reset = auto, hereda de rama)
│   │         ├── [Aplicar a Hijos (azul)] → propaga en cascada recursiva (DFS) forma, color, bordes y aristas a todos los descendientes en 1 paso de historial
│   │         └── [Aplicar a Hermanos (gris)] → propaga los mismos estilos a todos los nodos del mismo padre (deshabilitado si no hay hermanos)
│   │
│   ├── 📒 Notas
│   │   ├── [toggle "Mostrar en Nodo"] → alterna `updateNode({ showNoteInline: !showNoteInline })` (renderiza Markdown debajo del cuerpo en el lienzo)
│   │   ├── [vistas Edit3 / Columns / Eye] → cambia estado local entre Solo Editor / Vista Dividida / Solo Vista Previa (default: preview)
│   │   ├── [toolbar Markdown con 9 botones] → inserta sintaxis en la posición del cursor de `#node-note-textarea`:
│   │   │     Bold (`**texto**`), Italic (`*texto*`), H1 (`# `), H2 (`## `), Lista (`- `), Numerada (`1. `), Checkbox (`- [ ] `), Code (```), Cita (`> `)
│   │   └── [textarea] → onChange actualiza `updateNode({ note: text })` con sincronización instantánea al renderizador `MarkdownView`
│   │
│   ├── 😊 Iconos
│   │   ├── Tinte — [ColorPicker con Reset] + [7 presets] → `updateNode({ iconColor: hex | undefined })` (Original = undefined)
│   │   ├── [Slider tamaño 10-36px] → `updateNode({ iconSize: px })` (Reset = 14px estándar)
│   │   ├── [Copiar a Hijos] / [Copiar a Hermanos] → propaga array `icons`, `iconColor` e `iconSize` a descendientes / hermanos
│   │   ├── Asignados — chips con botón [X] remueve ese icono; botón [Quitar todos] → `updateNode({ icons: [] })`
│   │   ├── [input Buscar] filtra en tiempo real sobre 520+ iconos vectoriales · [chips de categoría] · [8 quick tags]
│   │   ├── Grid de catálogo (máx 120 renderizados) — [clic en icono]: si ya está en `icons` lo elimina; si no, lo añade al final del array
│   │   └── [Ver Galería Completa de Iconos] → abre el modal `IconPackModal`
│   │
│   ├── ☁️ Nubes de Agrupación
│   │   ├── [interruptor maestro] →
│   │   │     ├── Si está apagada (OFF) → clic crea objeto `cloud` con valores por defecto (scallop, #3b82f6, 8% opacidad, borde dashed) en `updateNode({ cloud: {...} })`
│   │   │     └── Si está encendida (ON) → clic elimina completamente la nube con `updateNode({ cloud: undefined })`
│   │   └── [Si la nube está activa (ON)]:
│   │         ├── Forma — [8 botones de forma] (cloud-scallop, cloud-bubble, cloud-wave, cloud-rect, oval, rounded, star, comic) → `updateCloudProps({ shape })`
│   │         ├── Márgenes — [Slider horizontal -50..200px] → `updateCloudProps({ paddingX })` · [Slider vertical -50..200px] → `updateCloudProps({ paddingY })`
│   │         ├── Relleno — [ColorPicker color de nube] → `updateCloudProps({ color })` · [Slider opacidad 0-100%] → `updateCloudProps({ opacity: val/100 })`
│   │         └── Borde — [ColorPicker borde] → `updateCloudProps({ borderColor })` · [Slider grosor 0-6px] → `updateCloudProps({ borderWidth })` ·
│   │               [3 estilos de trazo] Sólido / Guiones / Puntos → `updateCloudProps({ borderDash })`
│   │
│   └── 🗺 Mapa (Configuración global sin necesidad de nodo seleccionado)
│       ├── Temas del Mapa — [8 tarjetas de tema] → `setMindMap({ themeId })` + restyle completo del mapa
│       ├── Diseño del Árbol — [9 botones de layout] (estándar, balanceado, derecha, izquierda, arriba, abajo, árbol, radial, circular) → `setMindMap({ layout: id })`
│       ├── Fondo del Lienzo — [ColorPicker color base con Reset] → `setMindMap({ backgroundColor })` ·
│       │     [6 patrones de cuadrícula: ninguno, puntos, cuadrícula, cruz, líneas, isométrico] → `setMindMap({ backgroundPattern: id })` ·
│       │     [ColorPicker trazo de patrón] → `setMindMap({ backgroundPatternColor })` ·
│       │     [Slider tamaño patrón 12-64px] → `setMindMap({ backgroundPatternSize })` · [Slider opacidad 5-100%] → `setMindMap({ backgroundPatternOpacity })`
│       ├── Aristas Globales — [4 formas de conexión] → `setMindMap({ globalEdgeShape })` ·
│       │     [4 perfiles de grosor: cónica, ribbon, uniforme, fina] → `setMindMap({ globalEdgeProfile })` ·
│       │     [Multicolor toggle] → alterna `setMindMap({ globalEdgeMulticolor: !val })` (asigna paleta por rama) ·
│       │     [Randomizar (Dices)] → genera colores aleatorios por rama · [ColorPicker uniforme] → `setMindMap({ globalEdgeColor })` ·
│       │     [3 estilos de trazo: sólido/guiones/puntos] → `setMindMap({ globalEdgeDash })` · [Slider grosor 1-8px] → `setMindMap({ globalEdgeWidth })`
│       └── Espaciado del Árbol — [Slider separación horizontal 20-150px] → `setMindMap({ horizontalSpacing })` · [Slider separación vertical 4-60px] → `setMindMap({ verticalSpacing })`
│
├── ⌨️ StatusBar (pie de pantalla)
│   └── Nodos totales · Seleccionado ("texto" + ID) · Zoom % (real, desde el viewport) ·
│         Posición (X, Y) (real) · Modo ("Editando"/"Listo")
│
├── 🪟 Modales (6 modales montados; controlados por flag booleano con memoria interna)
│   ├── 📤 Exportar / Importar (`ExportImportModal`) —
│   │     ├── Pestaña Exportar:
│   │     │     ├── [Tarjeta Freeplane .mm] → `exportToFreeplaneXML(mindMap)` genera XML Freeplane, descarga `.mm`
│   │     │     ├── [Tarjeta HTML Portable] → genera HTML standalone con visor interactivo y CSS inline, descarga `.html`
│   │     │     ├── [Tarjeta Markdown] → serializa jerarquía con indentación `#` y listas `- `, descarga `.md`
│   │     │     └── [Tarjeta JSON] → `JSON.stringify(mindMap, null, 2)`, descarga `.json`
│   │     └── Pestaña Importar:
│   │           └── [input file accept=".mm,.json"] → lee archivo con `FileReader`:
│   │                 - Si es `.mm`: parsea XML con DOMParser, valida nodo raíz y estructura, reemplaza `mindMap` y selecciona raíz
│   │                 - Si es `.json`: valida esquema `MindMap` con guardas de integridad, reemplaza `mindMap`
│   │                 - Si falla: muestra banner de error rojo con descripción técnica (no rompe la app)
│   ├── ⌨️ Atajos de Teclado (`ShortcutsModal`) — tabla de 16 combinaciones de teclas clasificadas en 6 secciones (solo lectura)
│   ├── 🧩 Plantillas (`TemplatesModal`) —
│   │     ├── [Buscador] filtra por título y descripción · [7 chips de categoría] · [chips de tags con botón Limpiar]
│   │     └── Grid de tarjetas: [clic en tarjeta] pide confirmación o reemplaza directamente el mapa con la plantilla seleccionada (`pushHistory` + `setMindMap(templateMap)`)
│   ├── 💾 Mapas Guardados (`SavedMapsModal`) —
│   │     ├── [Crear Nuevo Mapa] → crea mapa en blanco con ID `map_${Date.now()}` y lo activa en el store
│   │     ├── Filas de mapas: [clic en fila] serializa el mapa actual en `localStorage`, carga el mapa seleccionado y cierra el modal
│   │     └── [Botón Eliminar (Trash2)] → `confirm()` nativo; si confirma, borra la clave `freemind_map_{id}` y actualiza el índice (oculto en el mapa activo)
│   ├── 🔗 Crear Conector (`ConnectorModal`) —
│   │     ├── [select Destino] (requerido, excluye el nodo de origen) · [input Etiqueta] (opcional)
│   │     ├── [select Forma: curved | bezier | straight | step]
│   │     │     ├── Si es 'straight': el slider de curvatura se **oculta completamente**
│   │     │     └── Si es 'curved' o 'bezier': muestra [Slider Curvatura -200..200]
│   │     ├── [select Capa: above (frente) | below (fondo)] · [Slider Opacidad 10-100%]
│   │     ├── [Estilo: sólido | guiones | puntos] · [ColorPicker color con Reset]
│   │     └── [Crear Conector (Submit)] → crea objeto en `mindMap.connectors`, añade a historial y cierra modal
│   └── 🖼 Pack de Iconos (`IconPackModal`) —
│         ├── Barra lateral: [12 categorías con conteo dinámico] · [buscador de texto] · [8 quick search tags]
│         ├── Grid interactivo: [clic en icono] alterna su presencia en `selectedNode.icons` en vivo
│         └── Inspector derecho: preview a 64px, nombre oficial, categoría, tags y botón [Copiar ID] al portapapeles
│
├── 🎬 Presentación Clásica (`PresentationMode`, overlay a pantalla completa)
│   ├── Header — badge de modo Sparkles · badge de fase dinámica:
│   │     - Fase 1 Tema Principal (azul) · Fase 2 Notas del Tema (ámbar) · Fase 3 Subtemas (cian)
│   │     [Volver (Return Jump)] → solo visible tras saltar a subtema/conector; desapila `jumpHistory` y regresa al nodo anterior (Backspace)
│   │     [Editar (E)] → abre modal de configuración de la presentación
│   │     Contador `{idx + 1} / {total}` · [X] Salir (Esc)
│   │   ├── Radar MiniMapa superior flotante (`top-2`, w-52..w-80) — SVG translúcido con doble halo pulsante (`ping` + `pulse`) y pin rojo en el nodo activo
│   │   ├── Slide central (`main max-w-6xl`) —
│   │   │     ├── Si Fase 'body': breadcrumb de ancestros (clic salta al padre), imagen fija (S:144, M:240, L:320px), título adaptativo (3xl..7xl), cuerpo paginado sin scroll, tags y progreso
│   │   │     ├── Si Fase 'notes': tarjeta `max-w-4xl rounded-2xl p-8` con render Markdown completo auto-paginado cada ~550 caracteres
│   │   │     └── Si Fase 'children': grid responsivo de 1 a 3 columnas con hasta 6 subtemas (clic en tarjeta salta a ese nodo registrando salto) + conectores cruzados
│   │   ├── Footer (`h-12`) — [Anterior] · [Inicio: Padre] (salta al padre directo) · dots clicables de diapositivas · [Siguiente Tema] (salta a la siguiente rama hermana) · [Siguiente]
│   │   └── Modal de opciones (Tecla E) — selector de 8 temas, switch de notas ON/OFF, selector tamaño de imagen (4), switch de tarjetas de hijos, conectores y minimapa, alineación y escala de fuente
│   │
│   ├── 🎬 Presentación Elaborada (`ElaboratePresentationSystem`, Prezi Espacial 2.5D)
│   │   ├── Top HUD Bar (`h-14`) — conmutador [Editor del Lienzo] ↔ [Presentar (F5)] ·
│   │   │     [Acomodar:] 5 botones de algoritmo (Espiral, Constelación, Matriz, Randómico, En Pila) → regenera coordenadas espaciales `(x, y, rot, scale)` de todas las tarjetas
│   │   │     [Nueva Tarjeta] → añade `SpatialSlideCard` personalizada de 720×440px y abre editor · [X] Salir (Esc)
│   │   ├── Lienzo Espacial Infinito — cámara cinemática Prezi con matriz inversa `translate3d + scale + rotate` (vuelo suave de 750ms `cubic-bezier(0.25, 1, 0.5, 1)`):
│   │   │     - Trayectoria de vuelo continua en arco SVG degradado púrpura/azul/rosa con patrón discontinuo
│   │   │     - Tarjetas espaciales 720×440px con spotlight (opacidad 1 en activa, 0.2 en inactivas)
│   │   │     - En modo Editor: manilla de rotación superior (`w-8 h-8` a `-top-10`), cápsula mover (`-bottom-4`) y 4 tiradores de redimensionamiento de esquinas
│   │   ├── Controles Flotantes (`bottom-20 left-4`) — [ZoomIn], [ZoomOut] y [Vista Panorámica (Compass / Tecla O)] (centra todo el tablero)
│   │   ├── Filmstrip & HUD Inferior — línea de progreso superior de 4px, tira horizontal de tarjetas con miniaturas y badge `#order`, y barra `h-12` con botones de vuelo cinemático
│   │   └── Modal de Detalle (`SlideDetailModal`, 768px) — doble clic en cualquier tarjeta abre diseñador completo con campos de título, subtítulo, notas Markdown, imagen y sliders de escala/rotación
│   │
│   ├── 🎬 Presentación Dinámica (`CanvasPresentationHUD` + `CanvasDrawingOverlay`)
│   │   ├── Top Presentation Bar (`h-14`) — conmutador [Editor de Marcos] ↔ [Presentar (F5)], historial [Deshacer]/[Rehacer] de marcos, botón [Empezar de Cero] y [Auto-generar] marcos por jerarquía
│   │   ├── Píldora Flotante de Herramientas (`top-16`, 510×34px) —
│   │   │     ├── [1. Seleccionar Nodos] → activa `editorTool = 'pick_nodes'`: clic en nodo lo añade a selección múltiple `stagedNodeIds`; botón [Crear Marco] agrupa los nodos seleccionados en un `SlideFrame`
│   │   │     ├── [2. Dibujar Recuadro] → activa `editorTool = 'draw_frame'`: arrastrar sobre el lienzo genera recuadro con dimensiones en tiempo real
│   │   │     └── [Navegar / Mover] → interacción normal de paneo del mapa
│   │   ├── Capa de Marcos (`SlideFrame` en lienzo real) — marcos rectangulares con bordes redondeados y badges superiores interactivos (clic enfoca la cámara sobre ese marco con zoom automático)
│   │   ├── Cajón de Notas del Orador (Drawer en `top-20 right-6`) — botón [FileText / Tecla N] despliega panel con render Markdown de la nota del nodo enfocado
│   │   └── HUD Inferior (`h-12`) — barra de progreso de 4px, tira filmstrip de marcos con botón de borrado en hover, contador y controles de foco cinemático (Anterior, Overview Tecla O, Siguiente)
│
│
└── ⌨️ Capa global de atajos (inactivos mientras escribes o con modal abierto; lista canónica en INTERFACE_SPEC §3.6)
      Ctrl+Z/Y deshacer/rehacer · Ctrl+C/X/V copiar/cortar/pegar rama · F2 editar · Tab/Insert hijo ·
      Enter hermano · Supr/Delete borrar · Espacio plegar · Ctrl+F filtrar · Alt+O esquema · Alt+P panel ·
      F5 alternar presentación · F11 pantalla completa · flechas navegar por lado · Esc → raíz/salir
```

---

## 3. Cómo usar estos árboles

- **Roadmap**: añadir hojas futuras con tags por nodo (`#MVP`, `#v2`, `#backlog`) — p. ej. exportación PNG (hoy no existe), colaboración, sync.
- **QA por control**: el §2 sirve como checklist de prueba manual: cada hoja es un control accionable con resultado observable.
- **Cobertura**: cada hoja debe ser verificable en el código; el detalle canónico (rangos de línea, gotchas) vive en `doc/DESIGN.md` §6-§10 y `doc/INTERFACE_SPEC.md`.
- **Mapeo funcional ↔ interfaz**: la mayoría de hojas del §1 viven en el ToolPanel (§2); las de organización en el lienzo/Outline; las de archivos en MenuBar + modales.
- **Honestidad de hints**: algunos hints de UI prometen atajos no implementados (Ctrl+S en "Guardar Ahora", Ctrl+0/Ctrl+-/+ en ZoomControls) — el §2 marca los que son solo decorativos.

> ⚠️ Mantener sincronizado: si añades una característica al código, actualiza el árbol correspondiente (y `doc/CHANGELOG.md`).
