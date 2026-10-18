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
│   │   ├── Título — [textarea] edita el título · [FontFormatToolbar: negrita/cursiva/3 alineaciones] ·
│   │   │     [ColorPicker color del texto con Reset] · [Slider tamaño de fuente 10-36px]
│   │   ├── Cuerpo — [ojo] oculta/muestra el cuerpo en el lienzo · [textarea] · formato cuerpo · color · tamaño 9-24px
│   │   ├── Imagen — [input URL] · [Upload] subir archivo local (dataURL) · [Trash2] eliminar ·
│   │   │     [6 posiciones: Arriba/Entre texto/Abajo/Izquierda/Derecha/Ajustar] · [Slider ancho 60-500px]
│   │   └── Metadatos — [TagManager: input + Enter/Plus para añadir, X de chip para quitar] · [input enlace web] ·
│   │         [Slider progreso 0-100 (step 5) con Reset] · [ojo de tags/enlace/progreso/iconos según exista]
│   │
│   ├── 🎨 Estilos
│   │   ├── Forma — [ShapeSelector: 10 botones de forma] · [Slider Ancho personalizado 0-500 (0=auto)] · [Slider Alto 0-300]
│   │   ├── Fondo — [selector de tipo: Sólido/Degradado/Trama/Imagen/Transparente] + controles según tipo:
│   │   │     Sólido [ColorPicker con Reset] · Degradado [2 ColorPicker + dirección en 4] ·
│   │   │     Trama [7 estilos + color base + color trazo + tamaño 8-40 + opacidad] ·
│   │   │     Imagen [URL + subir + ajuste Expandir/Completa/Repetir + preview] · Transp. (sin controles)
│   │   ├── Borde — [ColorPicker color con Reset] · [Slider grosor 0-8px] · [3 estilos de línea con preview]
│   │   └── Arista — [4 formas de conexión con SVG] · [ColorPicker color de arista con Reset] ·
│   │         [Aplicar a Hijos] [azul] · [Aplicar a Hermanos] [gris] (solo si existen hermanos)
│   │
│   ├── 📒 Notas
│   │   ├── [toggle "Mostrar en Nodo"] → la nota se renderiza bajo el cuerpo en el lienzo (desactiva tooltips)
│   │   ├── [vistas Edit3/Columns/Eye] → editor / dividida / preview (default preview; se reinicia al salir de la pestaña)
│   │   ├── [toolbar Markdown: 9 botones] negrita · cursiva · H1 · H2 · lista · numerada · checklist · código · cita
│   │   └── [textarea #node-note-textarea] + [preview Markdown] en vivo
│   │
│   ├── 😊 Iconos
│   │   ├── Tinte — [ColorPicker con Reset] · [7 dots sugeridos] · [enlace "Original"] → iconColor del nodo
│   │   ├── [Slider tamaño 10-36px] → iconSize (Reset = 14 estándar)
│   │   ├── [Copiar a Hijos] / [Copiar a Hermanos] → propagan iconos + color + tamaño + posición
│   │   ├── Iconos Asignados — chips con [X] · [Quitar todos] → vacía el array de iconos
│   │   ├── [input Buscar] entre los 520+ iconos · [chips de categoría] · [8 quick tags]
│   │   ├── grid de hasta 120 iconos — [clic] añade/quita del nodo (activo = azul)
│   │   └── [Ver Galería Completa de Iconos] → abre el modal Pack de Iconos
│   │
│   ├── ☁️ Nubes (solo con la nube activa)
│   │   ├── [interruptor maestro] → ON = nube por defecto / OFF = borra la nube y su estilo
│   │   ├── Forma y Márgenes — [8 formas] · [Slider margen horizontal -50..200] · [Slider margen vertical -50..200]
│   │   ├── Relleno — [ColorPicker color de nube] · [Slider opacidad 0-100%]
│   │   └── Borde — [ColorPicker color] · [Slider grosor 0-6] · [3 estilos de línea] (el título promete "Sombra" pero no hay control)
│   │
│   └── 🗺 Mapa (única pestaña que no requiere nodo seleccionado)
│       ├── Temas del Mapa — [8 tarjetas] con dots de la paleta → restyle del mapa completo
│       ├── Diseño del Árbol — [9 botones de layout] Estándar/Balanceado/Derecha/Izquierda/Arriba/Abajo/Árbol/Radial/Circular
│       ├── Fondo del Lienzo — [ColorPicker con Reset] · [6 patrones de cuadrícula] · [Color del trazo] ·
│       │     [Slider tamaño 12-64px] · [Slider opacidad 5-100%]
│       ├── Aristas Globales — [4 formas de conexión] · [4 perfiles de grosor] · [Multicolor] (activo = sin color fijo) ·
│       │     [Randomizar] [Dices] · [ColorPicker uniforme + 8 sugeridos] · [3 estilos de línea] · [Slider grosor 1-8px]
│       └── Espaciado — [Slider Separación Horizontal 20-150] · [Slider Separación Vertical 4-60]
│
├── ⌨️ StatusBar (pie de pantalla)
│   └── Nodos totales · Seleccionado ("texto" + ID) · Zoom % (real, desde el viewport) ·
│         Posición (X, Y) (real) · Modo ("Editando"/"Listo")
│
├── 🪟 Modales (6; siempre montados, se abren/cierran por isOpen y su estado interno persiste)
│   ├── 📤 Exportar / Importar — pestañas [Exportar]/[Importar]
│   │     Exportar: [tarjeta Freeplane .mm] · [HTML Portable] · [Markdown] · [JSON] → descarga el archivo
│   │     Importar: [seleccionar archivo .mm/.json] → valida y reemplaza el mapa; error = banner (no se auto-limpia)
│   ├── ⌨️ Atajos de Teclado — lista estática de 16 filas kbd en 6 grupos (solo lectura)
│   ├── 🧩 Plantillas — [buscador] · [7 categorías] · [chips de tag con "Limpiar"] ·
│   │     cards ([clic] carga la plantilla; la primera es "Mapa en Blanco") · [Restablecer Filtros] · [Cerrar]
│   ├── 💾 Mapas Guardados — [Crear Nuevo] · filas de mapas ([clic] carga ese mapa; "(Actual)" marca el activo;
│   │     [Eliminar] con confirm() nativo, oculto en la fila actual) · estado vacío amable
│   ├── 🔗 Crear Conector — [select Destino (obligatorio)] · [input Etiqueta] · [Forma: Curva/Bézier/Recta/Ortogonal] ·
│   │     [Capa: Encima/Debajo] · [Slider Curvatura -200..200 (oculto si Recta)] · [Slider Opacidad] ·
│   │     [Estilo: Sólido/Guiones/Puntos] · [Color] · [Crear Conector]/[Cancelar]
│   └── 🖼 Pack de Iconos — sidebar [12 categorías con conteo] · [buscador] · [8 quick tags] · grid completo ·
│         [clic en tile] añade/quita del nodo (o solo previsualiza sin nodo) · inspector con preview · [Copiar ID] · [Listo]
│
├── 🎬 Presentación Clásica (overlay a pantalla completa; slide actual en el centro)
│   ├── Header — badge "Modo Presentación Clásica" · badge de fase con "(Parte X/Y)" ·
│   │     [Volver] (solo con historial de saltos; Backspace) · [Editar] [E] abre el modal de opciones ·
│   │     contador "i / N" · [X] salir (Esc)
│   ├── Slide — breadcrumb del padre ([clic] salta) · imagen · cuerpo (progreso/tags como chips);
│   │     en fase notas: Markdown; en fase hijos: tarjetas de subtema [clic] = saltar + conectores relacionales (máx 3)
│   ├── Footer — [Anterior] · [Inicio: padre] · dots clicables por slide · [Siguiente Tema] · [Siguiente]
│   └── Modal de opciones [E] — tema (8) · notas ON/OFF · tamaño de imagen (4) · tarjetas de hijos ·
│         conectores cruzados · radar minimapa · alineación · escala de título · [Editar en Lienzo] / [Aplicar y Ver Diapositiva]
│
├── 🎬 Presentación Elaborada (overlay espacial tipo Prezi)
│   ├── Top bar — badge gradiente + título · [Editor del Lienzo] ↔ [Presentar (F5)] ·
│   │     [Acomodar:] Espiral/Constelación/Matriz/Randómico/En Pila (regenera el tablero) · [Nueva Tarjeta] · [X] salir (Esc)
│   ├── Cámara — [rueda del ratón] zoom · [ZoomIn]/[ZoomOut] flotantes (solo editor) · [Compass] "Ver todo el tablero (O)"
│   ├── Tarjeta hover — [Editar] (doble clic también) · [Duplicar] (+80,+80) · [Eliminar]
│   ├── Transformar tarjeta — [knob superior] rotar · [pill inferior] mover · [4 esquinas] escalar (0.4-3.0)
│   ├── HUD inferior — barra de progreso · filmstrip ([clic] vuela a la tarjeta) · [Anterior]/[Siguiente] (con wrap) ·
│   │     [Layers] oculta/muestra el filmstrip
│   ├── Presentador — spotlight sobre la tarjeta activa + trayectoria de vuelo SVG entre tarjetas
│   └── Editor de tarjeta (modal) — título · cuerpo · notas con preview en vivo · imagen · alineación ·
│         tema (8) · [Slider rotación -180..180] · [Slider escala 0.5-2.5] · [Guardar Cambios]/[Cancelar]
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
