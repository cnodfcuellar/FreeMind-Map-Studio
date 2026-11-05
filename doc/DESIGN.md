# DESIGN.md — Sistema de diseño de FreeMind Map Studio

Guía de referencia para que cualquier implementación futura conserve el estilo del proyecto.
Todos los valores están verificados del código (`src/index.css`, `src/utils/themes.ts`, átomos, moléculas, organismos).
Stack: Tailwind CSS v4 (`@import "tailwindcss"`, sin `tailwind.config`, sin tokens custom de radio/sombra/espaciado — solo defaults de Tailwind).

---

## 1. Fundamentos

### Tipografía
- Global (`index.css:5`, `index.html`): `font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- Google Fonts: `Plus Jakarta Sans 400;500;600;700` + `JetBrains Mono 400;500` (mono solo para valores técnicos: hex, porcentajes, errores).
- Los 8 temas usan `fontFamily: 'Plus Jakarta Sans'`.
- `theme-color: #3b82f6`. `body`: `bg-slate-50 text-slate-900 antialiased overflow-hidden select-none`.

### Escala de texto del proyecto
- `text-[9.5px]`–`text-[11px]`: micro-labels, badges de nodo, contadores, tooltips de valor.
- `text-xs`: texto estándar de paneles, barras, botones (`md`).
- `text-sm` / `text-base`: botones grandes, títulos de modal (`text-lg font-bold tracking-tight`).
- Presentación: título `text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight`.
- Pesos: labels `font-semibold`, valores `font-bold` o `font-mono`, títulos `font-bold tracking-tight`, tabs `uppercase tracking-wider text-[11px]`.

### Radios (regla general)
- Controles pequeños (chips, tags, contadores): `rounded-md` / `rounded-full` (píldoras: progreso, contadores, badges de conteo).
- Botones/inputs: `rounded-lg` (`sm/md`), `rounded-xl` (`md/lg`, cards de opción, inputs con icono).
- Contenedores (modales, paneles, minimapa, tooltips): `rounded-2xl`.
- Nodos: `bubble` 24px raíz / 16px; `pill`/`circle` 9999px; `oval` 50%; `square/rectangle` 0px; `fork` sin fondo ni radio (solo `border-bottom 2.5px`, siempre visible).
- Hexágono: contenido ceñido al polígono (texto al 68% centrado, imágenes topadas a 96px fijos, tags/enlace/nota acotados; la caja se deriva del contenido acotado y crece con él, +1 fila si hay tags).

### Sombras
- Controles: `shadow-2xs` (cards de opción, inputs, tags) y `shadow-xs` (botones primarios, toolbar buttons, fold buttons).
- Flotantes: `shadow-lg` (ZoomControls), `shadow-xl` (ToolPanel lateral, Outline), `shadow-2xl` (modales, dropdowns, popovers, tooltips).
- Canvas: nodo normal `shadow-xs`, `hover:shadow-md`; seleccionado `shadow-md`; forma `bubble` inline `0 4px 14px -2px rgba(0,0,0,0.10)`.
- **Sistema Modular de Sombras (Switch ON/OFF granular)**:
  * **Texto (`textShadow`)**: ToolPanel > Texto. Presets `soft` (`0 1px 3px rgba(0,0,0,0.65)`), `medium`, `deep`, `glow` (`#38bdf8`), slider de blur y color.
  * **Imagen adjunta (`imageShadow`)**: ToolPanel > Texto > Imagen. CSS `filter: drop-shadow(...)` contorneando siluetas transparentes PNG.
  * **Contorno del Nodo (`nodeShadow`)**: ToolPanel > Estilos > Bordes y Contorno. `box-shadow` en nodos estándar curvos y `filter: drop-shadow(...)` en siluetas poligonales (`hexagon`, `arrow`, `star`). Presets: `Suave` (`0 3px 8px`), `Media` (`0 6px 14px`), `3D` (`0 10px 24px 2px`), `Glow` (`0 0 16px #38bdf8`), sliders de Blur (1-40px), OffsetY (0-30px) y selector de color.
  * **Nubes Envolventes (`cloudShadow`)**: ToolPanel > Nube > Borde y Sombra. Silueta sólida `<path>` subyacente con `filter: drop-shadow(...)` para efecto de "Isla Conceptual" transparente sin filtrado interior. Presets: `Suave` (`0 2px 8px`), `Isla 3D` (`0 8px 20px`), `Profunda` (`0 14px 28px`), `Glow` (`0 0 16px`), sliders de Opacidad (5-100%), Blur (2-30px), OffsetY (0-20px) y color.
  * **Aristas del Árbol (`edgeShadow`)**: Dual: Global en ToolPanel > Mapa > Aristas Globales (`mindMap.edgeShadow`) y Local en ToolPanel > Estilos > Aristas y Propagación (`selectedNode.edgeShadow` con propagación a hijos/hermanos). Presets: `Suave` (`0 2px 4px`), `3D` (`0 4px 8px`), `Glow` (`0 0 6px [colorRama]`), sliders de Blur (1-20px), OffsetY (0-16px) y selector de color.
  * **Conectores Libres (`connector.shadow`)**: ConectorModal y MindMapCanvas. Filtro `drop-shadow(...)` perimetral sobre trazo y flechas del conector. Presets: `soft` (`0 2px 4px rgba(0,0,0,0.20)`), `deep` (`0 4px 10px rgba(0,0,0,0.35)`), `glow` (`0 0 8px [color]`), sliders de Blur (1-20px), OffsetY (0-16px) y selector de color.

### Scrollbars y utilidades globales (`index.css`)
- Scrollbar `6px`; track transparente; thumb `rgba(148,163,184,.4)` radius `4px`; hover `rgba(100,116,139,.6)`.
- `.bg-grid-dots`: `radial-gradient(rgba(148,163,184,.35) 1px, transparent 1px)` tamaño `24px`.
- `.bg-grid-dots-dark`: `rgba(100,116,139,.4)`, `24px`.
- `.bg-grid-lines`: `32px` + `linear-gradient(to right/bottom, rgba(226,232,240,.7) 1px, transparent)`.
- `.mind-node`: `transition: transform .15s cubic-bezier(0.4,0,0.2,1), box-shadow .15s ease, border-color .15s ease`.
- `.node-selected`: `outline: 2px solid #2563eb; outline-offset: 2px`.
- `.canvas-container`: `touch-action: none; user-select: none`.

---

## 2. Temas de mapa (8, en `src/utils/themes.ts`)

Estructura `MindMapTheme`: background+pattern, rootBg/Text, nodeBg/Text/Border, branchColors, edgeStyle, fontFamily.

| Tema | Fondo canvas | Nodo raíz | Nodo normal | Ramas |
|---|---|---|---|---|
| `default` Clásico Azul | `#f8fafc`, dots `#94a3b8`/24/0.45 | `#2563eb` / `#ffffff` | `#fff` / `#1e293b` / borde `#cbd5e1` | 7: `#3b82f6,#10b981,#8b5cf6,#f59e0b,#ec4899,#06b6d4,#14b8a6`, bezier |
| `rainbow` | `#fff`, squares `#e2e8f0`/28/0.6 | `#0f172a` / `#fff` | `#fff` / `#0f172a` / `#e2e8f0` | 8: `#ef4444,#f97316,#f59e0b,#10b981,#06b6d4,#3b82f6,#8b5cf6,#d946ef` |
| `dark` | `#0f172a`, dots `#475569`/24/0.5 | `#3b82f6` / `#fff` | `#1e293b` / `#f1f5f9` / `#334155` | 6 colores |
| `forest` | `#f0fdf4`, dots `#86efac`/24/0.55 | `#047857` | `#fff` / `#064e3b` / `#a7f3d0` | verdes |
| `sunset` | `#fffbeb`, triangles `#fed7aa`/32/0.6 | `#ea580c` | `#fff` / `#431407` / `#fed7aa` | cálidos |
| `minimal` | `#fafafa`, none `#e4e4e7`/24/0.4 | `#18181b` | grises, edge `linear`, 4 ramas grises | grises |
| `blueprint` | `#0a2540`, squares `#0284c7`/28/0.4 | `#0284c7` | `#0f3863` / `#f0f9ff` / `#0369a1`, edge `sharp` | técnicos |
| `honeycomb` | `#fffdf5`, hexagons `#fde68a`/32/0.7 | `#d97706` | `#fff` / `#78350f` / `#fde68a` | dorados |

## 3. Fondos de lienzo (12 presets, `BACKGROUND_PRESET_THEMES`)

Formato: fondo / patrón / color / tamaño / opacidad. Categorías: light, dark, paper, technical, creative.

- `bg-clean-white`: `#fff`, none, `#cbd5e1`/24/.3
- `bg-dot-grid-slate`: `#fafaf9`, dots, `#78716c`/24/.4
- `bg-square-grid`: `#f8fafc`, squares, `#94a3b8`/24/.45
- `bg-blueprint-pro`: `#0c2d48`, squares, `#38bdf8`/28/.35
- `bg-honeycomb-gold`: `#fffdf5`, hexagons, `#d97706`/32/.4
- `bg-triangular-mesh`: `#f1f5f9`, triangles, `#64748b`/32/.35
- `bg-lined-paper`: `#fafaf9`, lines, `#94a3b8`/24/.45
- `bg-dark-matrix-dots`: `#0f172a`, dots, `#475569`/24/.6
- `bg-dark-honeycomb`: `#090d16`, hexagons, `#06b6d4`/36/.35
- `bg-dark-isometric`: `#111827`, triangles, `#8b5cf6`/36/.35
- `bg-graphite-lines`: `#18181b`, lines, `#3f3f46`/28/.6
- `bg-mint-breeze`: `#f0fdf4`, dots, `#22c55e`/24/.45

---

## 4. Átomos (contrato visual)

### Button (`atoms/Button.tsx`)
- Base: `inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer disabled:opacity-45 disabled:pointer-events-none`.
- Tamaños: `xs: px-2 py-0.5 text-xs rounded` · `sm: px-2.5 py-1 text-xs rounded-lg` · `md: px-3.5 py-1.5 text-sm rounded-xl` · `lg: px-4 py-2 text-base rounded-xl`.
- Variantes: `primary: bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm border-blue-500/30` · `secondary` (default): `bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80`, dark `bg-slate-800` · `ghost: bg-transparent hover:bg-slate-100` · `danger: bg-rose-600 hover:bg-rose-700 text-white` · `outline: border-slate-300 hover:bg-slate-50` · `surface: bg-white border-slate-200 shadow-sm`.
- Loading: spinner `animate-spin h-4 w-4`.

### IconButton
- Default `ghost/md/rounded-lg`. Tamaños `xs: w-6 h-6` · `sm: w-7 h-7` · `md: w-8 h-8` · `lg: w-10 h-10`. Radios `md/lg/xl/full`.
- `ghost(active: bg-blue-50 text-blue-600)` · `primary: bg-blue-600 text-white` · `secondary: bg-slate-100 dark:bg-slate-800` · `danger: hover:bg-rose-50 hover:text-rose-600` · `surface: bg-white border shadow-xs` · `dark: bg-slate-800/90 border-slate-700/80`. `disabled:opacity-40`.

### Badge
- `inline-flex items-center select-none`, siempre con borde. Tamaños `xs: px-1.5 text-[10px] rounded` · `sm: px-2 py-0.5 text-xs rounded-md font-medium` · `md: px-2.5 py-1 rounded-lg font-semibold`.
- 7 pasteles: `blue/emerald/amber/rose/purple/indigo-50 text-700 border-200` (dark: `950/60`) + `slate-100`. Botón quitar: `w-3 h-3 hover:opacity-75`.

### Input / SearchInput
- Wrapper `w-full flex-col gap-1`; label `text-xs font-semibold`; campo `w-full rounded-xl bg-white dark:bg-slate-900 border text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`; con iconos `pl-8/pr-8`, icono `absolute left/right-2.5 text-slate-400`; error `border-rose-400` + mensaje `text-[11px] text-rose-500`; densidades `sm: py-1 text-xs / md: py-1.5 text-sm / lg: py-2.5`; disabled `opacity-50 bg-slate-50`.
- `SearchInput` = Input `sm` + icono `Search w-3.5` + `Badge blue xs` con conteo.

### Modal estándar (`ModalBackdrop` + `ModalHeader`)

> Contrato funcional de los **7 modales concretos** (contenido, campos, gotchas): **§8.5**.
- Backdrop: `fixed inset-0 z-50 p-4 bg-slate-950/60 backdrop-blur-xs`.
- Card: `w-full bg-[var(--sp-bg)] rounded-2xl shadow-2xl border border-slate-200/80 max-h-[90vh]` + `dark:bg-slate-900 dark:border-slate-800` **solo si `!forceLight`** (`ModalBackdrop.tsx:52`); con `forceLight` inyecta `style {'--sp-bg': '#ffffff', '--sp-bg2': '#f8fafc'}` (:53) — fondo SIEMPRE claro.
- Header (`ModalHeader`): `px-6 py-4 border-b border-slate-100 bg-[var(--sp-bg2)]` + `dark:border-slate-800/80 dark:bg-slate-900/50` solo si `!forceLight` (`ModalHeader.tsx:24`); icono `w-10 h-10 rounded-xl bg-blue-50 border-blue-100`; título `text-lg font-bold tracking-tight`; subtítulo `text-xs`; cierre con `IconButton ghost`.
- Anchos por modal: default `xl` · `ConnectorModal md` · `ExportImportModal xl` · `ShortcutsModal / SavedMapsModal lg` · `TemplatesModal 4xl` · `IconPackModal 5xl h-[90vh]`.
- Excepción de armonía: `TemplatesModal` es SIEMPRE claro (`forceLight` en `ModalBackdrop`+`ModalHeader`; cero `dark:` en su contenido y datos) aunque el SO esté en oscuro.
- Modal de detalle en presentación: `fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4` > card `w-full max-w-xl rounded-2xl border p-6 shadow-2xl max-h-[85vh] overflow-y-auto`.

### Toggles, Slider, ColorPicker
- `ToggleButton: flex gap-1 px-2.5 py-1.5 rounded-lg text-xs`; activo `bg-blue-600 text-white`, inactivo `bg-white border-slate-200 hover:bg-slate-50`.
- `ToggleButtonGroup`: contenedor `flex rounded-lg border bg-white p-0.5 gap-0.5 shadow-2xs`; item `flex-1 rounded-md sm:py-1 text-[10.5px] / md:py-1.5 text-xs`; seleccionado `bg-blue-100 text-blue-700 font-semibold`.
- Slider: `space-y-1.5`; valor `font-semibold text-blue-600 bg-blue-50 px-1.5 rounded text-[11px]`; range `w-full h-1.5 bg-slate-200 rounded-lg accent-blue-600`; reset `text-[10px] hover:underline`.
### ColorPicker y sección de color (`atoms/ColorPicker.tsx:30-76`)
- Contenedor `space-y-1.5`; deshabilitado `opacity-50 pointer-events-none`.
- Cabecera `flex items-center justify-between text-xs`: label `font-medium text-slate-700` + caja preview `flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs` con input nativo `type="color"` (`w-4 h-4 rounded border-0 cursor-pointer p-0 bg-transparent`) y valor `text-[10px] font-mono uppercase text-slate-500` (hex o `Auto` si `undefined` = color del tema).
- Reset: solo si hay `onClear` y hay valor (`ColorPicker.tsx:45`); `text-[10px] text-slate-400 hover:text-slate-600 hover:underline`, vuelve a automático (`onChange(undefined)`).
- Grid presets `grid grid-cols-8 gap-1 pt-0.5`; swatch `w-full aspect-square rounded-md border transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xs`; seleccionado `border-blue-600 ring-2 ring-blue-400 ring-offset-1`, resto `border-slate-200/80 hover:border-slate-400`.
- Presets fijos (`DEFAULT_PRESETS`, 16): clara `#ffffff #f8fafc #eff6ff #f0fdf4 #fefce8 #fff7ed #faf5ff #ecfeff` + intensa `#2563eb #059669 #d97706 #dc2626 #7c3aed #0891b2 #475569 #0f172a`.
- Guard obligatorio: el `value` del input nativo debe ser hex de 7 chars o revienta — el componente ya lo protege con fallback a `defaultColor` (`ColorPicker.tsx:37`). No lo quites.
- **Semántica de "Auto" (lo que faltaba):** `value === undefined` = color **fijo** heredado del tema en tiempo de render — verificado en `NodeComponent.tsx:82-84`: `textColor = isRoot ? (node.textColor || theme.rootText) : (node.textColor || theme.nodeText)`. Mismo patrón para el resto de colores de nodo (`bodyColor`, `borderColor`, …): `node.X || tema.X`.
- **Solo el botón Reset vuelve a Auto**: ni un swatch ni el input nativo pueden deshacer un color fijo — el nativo siempre muestra un hex concreto (`defaultColor`, por defecto `#ffffff`, cuando es Auto; puede NO coincidir con el color efectivo del tema, que el cuadrito no refleja).
- Swatch seleccionado: comparación **insensible a mayúsculas** (`value.toLowerCase() === color.toLowerCase()`). Clic en swatch = color fijo inmediato (misma regla de edición sin debounce).
- Props `presets` (override de los 16) y `defaultColor` existen pero **ningún caller las usa** hoy: siempre defaults. `disabled` → `opacity-50 pointer-events-none`.
- Usos en `FormatTab`: "Color de Fondo", "Color Inicial/Final" (degradado), "Color del Borde", "Color de la Arista", "Color del Fondo Base / Trazo de Trama". Selector de tipo de fondo (`FormatTab.tsx:154-179`): grid `grid-cols-5 gap-1.5`, botón `flex flex-col items-center p-2 rounded-xl border`, sel `border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs`; iconos Sólido (cuadro `bg-blue-500`), Degradado (`bg-gradient-to-br from-blue-500 to-purple-600`), Trama (`Sparkles`), Imagen (`Layers`), Transp. (cuadro `border-dashed`).

### Contenedores
- `CollapsibleSection: bg-slate-50/80 border rounded-2xl shadow-2xs`; header `px-3.5 py-3 hover:bg-slate-100/70`; icono `w-6 h-6 rounded-lg bg-blue-100`; título `text-xs font-semibold`; cuerpo `px-3.5 pb-3.5 space-y-2.5 border-t`. Chevron `ChevronDown w-4 h-4` rotando `-rotate-90` (plegado) → `rotate-0` (abierto), `duration-200`; el cuerpo se monta con `animate-in fade-in duration-150`.
- **Patrón de pestaña con ≥2 secciones plegables**: barra superior `flex justify-between pb-0.5` = label `text-[10.5px] font-bold text-[var(--sp-muted)] uppercase tracking-wider` + enlaces "Desplegar todo" (`text-blue-600 font-semibold`) `|` "Plegar todo" (`text-slate-500 font-medium`), ambos `text-[10.5px] hover:underline`. Estado en `sectionsOpen: Record<string, boolean>` por pestaña + `handleExpandAll(expand)` que fija todas a `expand`. Implementado en `ContentTab` (4 secciones), `FormatTab` (4), `ThemeTab` (5) y `CloudsTab` (3, dentro del bloque `isCloudEnabled`). `IconsTab` (1 sección) y `NotesTab` (textarea) no lo llevan.
- `ErrorBoundary`: card `bg-white border rounded-2xl shadow-xl max-w-md p-6 text-center`; icono `w-12 h-12 rounded-2xl bg-amber-50 border-amber-200`; bloque error `p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] max-h-24`.

---

## 5. Moléculas

- `ZoomControls`: píldora `flex gap-1 p-1 bg-[var(--sp-bg)] backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg shadow-slate-900/5 select-none`; divisor `w-[1px] h-4 bg-slate-200`; porcentaje `px-2 text-xs font-bold font-mono hover:text-blue-600`. Fondo por token (siempre "claro" pero con tinte del tema UI, §9).
- `HistoryControls`: `flex gap-0.5` (deshacer/rehacer con atajos visibles).
- `FontFormatToolbar`: 2 grupos `flex rounded-lg border bg-white shadow-2xs`; botón `p-1.5 w-3.5`, activo `bg-blue-100 text-blue-700`; separador `border-l`.
- `ShapeSelector`: `grid-cols-5 gap-1.5`; botón `p-2 rounded-xl border` con `title` = nombre y label `text-[10px] truncate`; seleccionado `border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs`, base `bg-white hover:bg-slate-50`. 10 shapes (Burbuja/Horquilla/Rectángulo/Cuadrado/Óvalo/Círculo/Píldora/Hexágono/Flecha/Estrella) — contrato funcional en §8.
- `TagManager`: input `flex-1 border rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500` + añadir `p-1.5 bg-blue-600 rounded-lg text-white`; chip `bg-blue-50 border-blue-200/60 px-2 rounded-md text-[11px] font-medium`, X `hover:text-red-500`.
- Sub-moléculas de nodo (`molecules/node/`): `NodeHeaderRow` (título `leading-snug break-words whitespace-pre-wrap select-text`, `14px`/raíz `16px`; cuerpo `mt-1 pt-0.5 border-t border-black/5`, `12/13px`; edición `w-full bg-white text-sm rounded px-1.5 py-0.5 border border-blue-500 outline-none resize-none`), `NodeBadgesBar` (tags `flex flex-wrap justify-center gap-1 mt-1 pt-1 border-t border-black/10`, tag `text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700`), `NodeActionButtons` (plus `w-5 h-5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700`, posicionado `-left-3/-right-3 -top-2.5`), `NodeBackgroundRenderer` (SVG de hexágono/estrella/cola de burbuja).

---

## 6. Nodos (`NodeComponent.tsx`)

- Base: `absolute select-none flex flex-col justify-center transition-all duration-150 group cursor-pointer`, posición/tamaño inline (`left/top/width/minHeight`).
- Relación **4:3 como guía, ceñido al contenido** (`estimateNodeSize`): en formas de caja (`bubble`, `rectangle`, sin forma) se calcula el tamaño natural, se deriva un ancho objetivo de igual área en 4:3 (entre 80 y 420px) y se re-envuelve el texto. Cuadrados/círculos automáticos usan el lado MÍNIMO que encaja (búsqueda binaria), no el máximo. La altura resultante es la natural: el nodo se ajusta a su forma sin huecos. Excluye `pill`/`oval` (intrínsecas), `fork` (línea) y SVG (`hexagon`/`arrow`/`star`). Con ancho y alto personalizados manda el usuario.
- Normal: `px-2 py-1 shadow-xs` + burbuja `padding 10px/5px` (ceñido); SVG y `fork`: `px-0 py-0 shadow-none`.
- Seleccionado: `ring-3 ring-blue-500 ring-offset-2 ring-offset-slate-50 shadow-md z-30` (SVG/fork solo `z-30`; fork suma `drop-shadow(0 2px 4px rgba(59,130,246,0.8))`); no seleccionado `z-10 hover:shadow-md`.
- Coincidencia de búsqueda (`isMatch`): `ring-2 ring-amber-400 bg-amber-50/90`.
- Staged presentación (`isStaged`): `ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_35px_rgba(59,130,246,0.9)] scale-[1.03] z-50 animate-pulse` + badge `absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white shadow-xl border-2 border-white animate-bounce z-50` con `Check w-3.5 h-3.5 stroke-[3]`.
- Cola de burbuja: `absolute top-1/2 -translate-y-1/2 w-12px h-16px z-0 left:-10px / right:-10px`.
- Imagen: contenedor `w-full flex justify-center mb-1.5 overflow-hidden rounded-lg`; `img rounded-lg object-contain pointer-events-none shadow-2xs`, ancho `140px` (top/between/bottom) o `100px` (left/right).
- Progreso: `px-1.5 py-0.5 rounded-full border border-slate-300/80 bg-slate-100/90 text-[9.5px] font-bold text-slate-700 shadow-2xs`.
- Drag: `GripVertical w-3.5 h-3.5 cursor-grab text-slate-400 hover:text-slate-700 -ml-1.5 mt-0.5`.
- Enlace: `inline-flex gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-[11px] font-semibold truncate shadow-2xs`.
- Nota inline: `mt-2 p-2.5 rounded-lg text-xs shadow-2xs border-t`; clara `border-amber-500/20 bg-amber-50/70 text-slate-800`, oscura `border-white/20 bg-black/35 text-slate-100 backdrop-blur-xs`.
- Tooltip: `absolute left-1/2 -translate-x-1/2 min-w-[200px] max-w-[340px] sm:max-w-[420px] bg-slate-900/95 p-3.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md z-50`.
- Fold: `absolute rounded-full z-20 shadow-xs -left-2.5/-right-2.5 top-1/2 -translate-y-1/2`; plegado `min-w-5 h-5 px-1 bg-amber-50 text-amber-800 border-2 border-amber-500`, abierto `w-4.5 h-4.5 bg-white border border-slate-300 hover:bg-indigo-600 hover:text-white`.

**Funcional** (verificado en `NodeComponent.tsx`, 211 líneas):

- **Composición**: el nodo es un contenedor que ensambla 5 moléculas de `molecules/node/` — `NodeSvgPolygonBackground` (hexagon/arrow/star), `NodeBubbleTail` (cola de burbuja con anatomía personalizable: longitud, ancho base, lado cardinal, desplazamiento y estilo recta/curva/pensamiento), `NodeHeaderRow` (imagen/iconos/título/cuerpo/edición), `NodeBadgesBar` (imagen lateral/inferior, nota, enlace, tags, tooltip) y `NodeActionButtons` (fold + "añadir hijo" `+`). El estilo de forma sale de `getNodeShapeStyles(node, theme, branchColor, isRoot)`. Si `node.nodeShadow` está activo, `NodeBubbleTail` hereda idéntico filtro de sombra para una silueta perfectamente integrada.
- **Visibilidad efectiva**: cada elemento combina el flag del nodo **OR** el global del mapa — `hideBody|hideAllBodies`, `hideImage|hideAllImages`, `hideTags|hideAllTags`, `hideIcons|hideAllIcons`, `hideLink|hideAllLinks` y `hideProgress` (solo del nodo). Texto: `node.textColor || (raíz ? theme.rootText : theme.nodeText)`; fuente `node.fontFamily || theme.fontFamily`; fondo oscuro vía `isDarkNodeBackground`.
- **Interacción**: clic → `stopPropagation` + `onSelect`; doble clic → edición; hover local (`isHovered`) para acciones. `isMatch` (búsqueda): las formas SVG reciben `brightness-125`, el resto `ring-2 ring-amber-400 bg-amber-50/90`. `isStaged` (editor de marcos dinámico) manda sobre selección. Hexágono limita contenido a `68%` y media a `96px`.
- **Edición inline**: `NodeHeaderRow` renderiza un `textarea` controlado por `editText` (estado de `NodeComponent`); confirmar (blur/Enter) → `onTextChange(node.id, editText)`; cancelar (`Esc`) → `setEditText(node.text)`.
- 🐛→✅ **Bug corregido 2026-10-17**: `editText` se inicializa **una sola vez** con `useState(node.text)` (`NodeComponent.tsx:66`) y **no se sincronizaba** al entrar en edición; como los nodos usan `key={node.id}` (`MindMapCanvas:1379`) **no se remontan**, si `node.text` cambió por fuera (edición desde el OutlineView, undo/redo, plantilla, pegar) el textarea mostraba el texto **del montaje** y **confirmar sin teclear revertía el texto**. Fix: `useEffect` que hace `setEditText(node.text)` al activarse `isEditing` (`NodeComponent.tsx:70-74`). Tests: `__tests__/NodeComponent.test.tsx` (2 tests de regresión vía `Enter`).
- 🐛 Cosmético: `const shape = node.shape || (isRoot ? 'rounded' : 'rounded')` — ternario redundante (ambas ramas `'rounded'`, `NodeComponent.tsx:77`).

---

## 7. Barras y layout general

### Layout (`templates/MainEditorLayout.tsx`, `App`)
- Raíz: `flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-900 select-none`; centro `flex-1 flex overflow-hidden relative`; canvas `flex-1 relative overflow-hidden flex flex-col`.
- Slots: menuBar / toolBar / filterBar / canvas / toolPanel / outlineView / statusBar / presentationOverlay / modals. En presentación se ocultan barras.

### MenuBar (`h-10 bg-[var(--chrome-bar)] text-white`)
- `header h-10 bg-[var(--chrome-bar)] text-white px-3 flex items-center justify-between z-50 relative shrink-0 select-none border-b border-slate-800 text-xs`. Fondo por token (claro/oscuro `#0f172a`, sepia `#433422`, `index.css:10,35`).
- Botón `px-2.5 py-1 rounded-md text-slate-300 hover:bg-slate-800`; abierto `bg-slate-800 text-blue-400 font-semibold`.
- Dropdown `absolute top-full left-0 mt-1 w-56/w-52 bg-[var(--sp-bg)] text-[var(--sp-text)] rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50` (son 6, `MenuBar.tsx:158,213,253,312,430,495`; **solo el de Archivo** añade `animate-in fade-in zoom-in-95 duration-100`, los otros 5 se pintan sin animación).
- Título editable `bg-slate-800 border border-blue-500 rounded px-2 py-0.5 text-xs text-white text-center`.
- Badge offline `px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[11px]`.

### Contrato funcional de MenuBar (6 menús + título + indicadores)

Verificado en `MenuBar.tsx` completo (558 líneas).

- **Estado**: `openMenu: string | null` (toggle por clic en el botón del menú), cierre con click-outside (`mousedown` en `document` comprobando el `menuRef` del `<header>`).
- **Menús** (dropdown `bg-[var(--sp-bg)] text-[var(--sp-text)]`; hovers fijos `hover:bg-blue-50 hover:text-blue-600`, salvo la fila "Modo Oscuro" con `hover:bg-slate-800 hover:text-white`):
  1. **Archivo** (w-56): *Nuevo Mapa* · *Plantillas de Ejemplo* · *Mis Mapas Guardados* ─ *Guardar Ahora* `Ctrl+S` ─ **Exportar (.mm / HTML)** (azul `font-semibold`; etiqueta corregida 2026-10-17 — antes decía ".mm / HTML / PNG" sin existir PNG) · *Importar Freeplane (.mm)*.
  2. **Editar** (w-52): *Deshacer* `Ctrl+Z` (disabled sin `canUndo`) · *Rehacer* `Ctrl+Y` (disabled sin `canRedo`) ─ *Eliminar Rama* `Supr` (rojo; **no se deshabilita en la raíz** — el veto está en el store).
  3. **Insertar** (w-56): *Nodo Hijo* `Tab` · *Nodo Hermano* `Enter` ─ *Conector de Relación* · *Nube de Rama* ─ *Pack Iconos Vectoriales* + badge `500+` (solo si `onOpenIconPack`).
  4. **Formato** (w-56): bloque "TEMAS VISUALES" con **solo 5 de los 8 temas** — Clásico Freeplane (`default`), Bosque Esmeralda (`forest`), Arcoiris Vibrante (`rainbow`, dot degradado), Atardecer Cálido (`sunset`), Modo Oscuro (`dark`) —; bloque "FORMA DEL NODO" con las **10 formas** (previews con divs/iconos Lucide, **sin `disabled`**: sin nodo, `App:227-229` hace no-op silencioso); *Restablecer Formato* (rojo, `Eraser`).
     - **🐛→✅ Bug corregido 2026-10-17**: estos 2 items enviaban `'purple'`/`'warm'` (**ids inexistentes** en `THEMES`: `default rainbow dark forest sunset minimal blueprint honeycomb`) → clic sin efecto visual (fallback `THEMES[themeId] || THEMES.default`, `App:135`) + `themeId` inválido persistido en el mapa. Fix: `MenuBar.tsx` ahora mapea a `rainbow` (item renombrado "Creativo Púrpura" → **"Arcoiris Vibrante"**) y `sunset` (etiqueta "Atardecer Cálido" ya coincidía). Tests: `__tests__/MenuBar.test.tsx` (2 tests que exigen ids ∈ `THEMES` y la ausencia del label viejo). Siguen sin acceso por menú: `minimal`, `blueprint`, `honeycomb` (solo en ThemeTab).
  5. **Ver** (w-56): *Panel Lateral de Esquema* `Alt+O` · *Presentación Clásica* [badge verde **"Activo"**] · *Presentación Dinámica (Lienzo)* `F5` · *Presentación Elaborada (Espacial)* [badge verde **"Activo"**] ─ *Desplegar Todo el Mapa* · *Plegar Todas las Ramas* ─ *Pantalla Completa* `F11`.
     - **Gotcha**: los badges "Activo" son **estáticos** (siempre visibles en Clásico y Elaborado; no reflejan el modo en curso; el Dinámico muestra el kbd `F5`). Las 3 presentaciones arrancan directo (`App:176-185`).
  6. **Ayuda** (w-56): *Atajos de Teclado* `?` → ShortcutsModal · *Guía Tutorial Freeplane* → **el mismo modal** que "Plantillas de Ejemplo" (`onOpenTemplates`).
- **Centro — título editable**: doble clic → `input`; confirma con Enter o blur, aplica `trim()`, **título vacío = no cambia** (`handleTitleSubmit`); tooltip "Doble clic para cambiar el título del mapa".
- **Derecha**: badge **"100% Offline"** (punto `bg-emerald-400 animate-pulse`, texto oculto < `md`) + botón de **ciclar tema UI** Sol/Luna/Café (solo si `onCycleTheme`; ver §7 "Temas de interfaz UI").
- **Props muertas**: ✅ `isOutlineMode` y `onShowComingSoon` **eliminadas** el 2026-10-17 (la segunda era el único escritor de `comingSoonModalData` → con ella y el `ComingSoonModal` borrados, ya no queda rastro del modal huérfano, §8.5.7).

### ToolBar (`h-11 bg-[var(--chrome-toolbar)]`)
- `h-11 bg-[var(--chrome-toolbar)] border-b border-slate-200 px-2 sm:px-3 flex items-center justify-between gap-1 sm:gap-2 z-40 shrink-0 select-none relative`. Fondo por token (claro `#ffffff`, oscuro `#1e293b`, sepia `#efe3c8`, `index.css:11,23,36`).
- Botón `p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 min-w-[30px] min-h-[30px]`.
- Acción primaria (Hijo) `px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs`.
- Export `px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs shadow-xs`.
- Popovers de acción `absolute right-0 top-full mt-1.5 w-64/w-72 bg-[var(--sp-pop)] backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none` (`ToolBar.tsx:407,526`); menú móvil "Más" `w-52 bg-[var(--sp-bg)] text-slate-800 rounded-xl shadow-xl py-1.5` (:285); separador `w-px h-5 bg-slate-200` (×4).

### Contrato funcional de ToolBar

Verificado en `ToolBar.tsx` completo (643 líneas).

- **Grupo izquierdo** (historial + nodo): *Deshacer* `Ctrl+Z` / *Rehacer* `Ctrl+Y` (disabled `!canUndo/!canRedo`) ─ **Hijo** `Tab|Insert` (primario `bg-blue-50`) · **Hermano** `Enter` · *Eliminar* `Supr` (disabled sin nodo **o nodo raíz** `parentId === null`) · *Plegar/Desplegar* `Espacio` (disabled sin hijos; icono `Maximize2` si `folded`, si no `Minimize2`) ─ *Negrita*/*Cursiva* (grupo `hidden sm:flex`, toggle según `bold`/`italic`) · select de **Forma** (`hidden sm:block`, **solo 6 de 10 formas**: bubble/fork/rectangle/oval/hexagon/pill) ─ *Conector* (`hidden md:flex`, abajo de `lg` queda icono solo) · *Nube* (hidden < md; ámbar `bg-amber-100 text-amber-800` si `cloud.enabled`) · **Iconos SVG** badge `500+` → IconPackModal.
  - **🐛→✅ Bug corregido 2026-10-17**: el grupo usaba `hidden xs:flex`, pero **no existe el breakpoint `xs`** (cero `--breakpoint-xs` en `index.css`) → `xs:flex` no generaba CSS y **Negrita/Cursiva nunca se veía**. Fix: `hidden sm:flex` (`ToolBar.tsx:192`), coherente con el select de Forma (`hidden sm:block`; por debajo de `sm` siguen disponibles en el menú móvil "Más"). Test: `__tests__/ToolBar.test.tsx` (assert de clase, regresión).
  - **Gotcha select 6 vs 10**: el select de escritorio expone **6 formas**; las 10 completas están en el menú móvil "Más", en MenuBar → Formato y en FormatTab.
- **Menú móvil "Más"** (`md:hidden`, popover `w-52`, cierra al elegir): label "Formato & Enlaces" · select con las **10 formas** · *Negrita*/*Cursiva* · *Crear Conector flotante* · *Alternar Nube de agrupación* (mismos handlers, `disabled` sin nodo).
- **Grupo derecho**: *Buscar y Filtrar* `Ctrl+F` (toggle FilterBar; activo `bg-blue-100 text-blue-700`) · **ojo "Vista"** → popover `w-64` "Visibilidad Global (Modo Enfoque)" con **5 filas conmutables** — `hideAllBodies` Cuerpos/Explicación (`FileText` verde), `hideAllImages` Imágenes adjuntas (`ImageIcon` violeta), `hideAllTags` Etiquetas #Tags (`Tag` ámbar), `hideAllIcons` Iconos temáticos (`Sparkles` azul), `hideAllLinks` Insignias de enlace (`Link` cian — cada una con badge `Oculto` (rosa) / `Visible` (verde) — el botón ámbar con `EyeOff` si **algún** flag activo (`hasAnyHiddenGlobal`), si no `Eye` · **Esquema** `Alt+O` (indigo; activo `bg-indigo-100`) · **Presentar** → popover `w-72` "Tipos de Presentación" + chip `F5` con **3 tarjetas** (Clásico `Presentation` / Elaborado (Espacial Prezi) `Map` / Dinámico (Estilo Mindomo) `Zap`; icono-cuadrático + descripción + **badge verde "Activo" estático**, siempre presente, no refleja estado) · **Exportar** (azul primario, oculta su label < `sm`) ─ *Panel de Propiedades* `Alt+P` (toggle, activo `bg-blue-100 text-blue-700`).
- **3 popovers** cierran con click-outside (`mousedown` + refs), mismo patrón que MenuBar.
- **Props muertas (15)**: ✅ **eliminadas** el 2026-10-17 — `isOutlineOpen`, `onSave`, `onOpenTemplates`, `onOpenSavedMaps`, `onChangeLayout`, `onChangeTheme`, `onChangeColor`, `onChangeEdgeStyle`, `onChangeEdgeProfile`, `onChangeEdgeWidth`, `onChangeEdgeColor`, `onChangeEdgeDash`, `onResetEdges`, `onOpenIconPack`, `onShowComingSoon` se declaraban en la interfaz sin uso en JSX; se borraron de `ToolBarProps` y de los args que `App` inyectaba. `onChangeShape`, `onOpenExportModal`, `onOpenConnectorModal`, `onToggleCloud`, `onOpenIconPackModal` **sí se usan y se conservan**.

### FilterBar / StatusBar (fondo por token `bg-[var(--chrome-bar)]`)
- FilterBar `h-10 bg-[var(--chrome-bar)] text-white px-4 flex items-center justify-between z-30 relative shrink-0 text-xs shadow-md border-b border-slate-800 animate-in slide-in-from-top-2 duration-150 select-none`; input `bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-blue-500`; contador `px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-[11px]`.
- StatusBar `h-6 bg-[var(--chrome-bar)] text-slate-400 px-3 flex items-center gap-4 z-30 shrink-0 select-none border-t border-slate-800 text-[10px] sm:text-xs`; valores `text-slate-200`; separador `w-px h-3 bg-slate-700`.
- Ambas siguen el tema UI (claro/oscuro `#0f172a`, sepia `#433422`); su contenido interno mantiene clases slate fijas (legibles sobre los 3 fondos).

### Contrato funcional de FilterBar y StatusBar

- **FilterBar** (`FilterBar.tsx`, 119 líneas): `return null` si `!isOpen` (toggle: icono Search del ToolBar o `Ctrl+F`). **Izquierda** (`flex-1 max-w-3xl`): label "Filtro Rápido:" + **input de texto** (`query`, placeholder "Buscar por texto en nodos...", `×` de limpieza cuando hay valor) + **select de etiquetas** (solo si `availableTags.length > 0`; opción "Todas las Etiquetas" → `tag: undefined`, resto `#{tag}`) + **select de progreso** (`minProgress`: `''` Cualquier Progreso / `100` "Solo 100% Completados" / `50` "Progreso ≥ 50%" / `0` "Con Progreso Activo" → `undefined` con `''`) + **contador** `"{n} coincidencia|coincidencias"` con `Sparkles` (solo si `isFiltering`). **Derecha**: enlace *"Limpiar filtros"* (solo si `isFiltering`) + `X` de cierre.
  - `isFiltering` = `query ∥ tag ∥ icon ∥ minProgress !== undefined` (`FilterBar.tsx:26-30`).
  - **Gotcha de limpieza**: `App:323-325` implementa `onClearFilter` con **reemplazo total** del estado (`setFilterOptions({ query: '', showAncestors: true, showDescendants: true })`) — de paso limpia `tag`/`minProgress`, pero **reintroduce `showAncestors/showDescendants`**.
  - **Gotcha campo muerto**: `filterOptions.icon` cuenta para `isFiltering` pero **no tiene control en la UI** y **`useSearchFilter` lo ignora** (solo aplica `query`, `tag`, `minProgress`, `useSearchFilter.ts:7-26`).
  - Importa `Tag`/`CheckSquare` sin usar (no hay ESLint que lo note; `pnpm lint` solo es `tsc`).
- **StatusBar** (`StatusBar.tsx`, 51 líneas): 4 datos con separadores `w-px h-3 bg-slate-700` — *Nodos totales* · *Seleccionado:* `"texto"` + `(ID: …)` ("Ninguno" sin selección) · *Zoom* · *Posición* `(X, Y)` · *Modo* — estos 3 últimos ocultos < `sm`.
  - ✅ **Zoom/Posición cableados 2026-10-17**: `MindMapCanvas` expone `onViewportChange` (nuevo prop) que reporta `{zoom, x, y}` en un `useEffect` sobre `[zoom, pan.x, pan.y]`; `App` los guarda en `viewport` y el StatusBar muestra `Math.round(zoom*100)` y las coordenadas reales (antes: `zoom={100}`, `positionX/Y={0}` hardcodeados → siempre 100 % y (0,0)). Test: `__tests__/StatusBar.test.tsx` (3 tests). *Modo* sigue siendo real (`'Editando' | 'Listo'` según `editingNodeId`).

### Temas de interfaz UI (`claro`/`oscuro`/`sepia`, `src/utils/uiTheme.ts`)
- Botón al final del MenuBar (tras el badge Offline): Sol/Luna/Café, cicla los 3 y persiste en `freemind_ui_theme_v1`. Se aplica en `<html>`: `data-theme` + clase `.dark` (solo en oscuro).
- `dark:` por **clase** (`@custom-variant` en `index.css`), no por SO: sin elección guardada se hereda `prefers-color-scheme`.
- Barras por tokens: `bg-[var(--chrome-bar)]` (Menu/Filter/Status) y `bg-[var(--chrome-toolbar)]` (ToolBar); sepia = `#433422` / `#efe3c8`. El contenido del mapa NO cambia (lo mandan los 8 temas de mapa).
- Sepia en superficies (`--sp-bg/bg2/hover/glass/pop`): ToolPanel, OutlineView, MiniMap, ZoomControls, dropdowns de MenuBar, popovers de ToolBar, cards y headers de modales (respeta `forceLight`). Textos e iconos se conservan (legibles sobre sepia).
- Oscuro con valores propios (`--sp-bg #0f172a`, `--sp-text #e2e8f0`, etc.): los paneles que nunca tuvieron `dark:` (ToolPanel, OutlineView, MiniMap) ahora sí oscurecen; textos clave migran a `text-[var(--sp-text)]`.

---

## 8. ToolPanel (`aside w-84`)

- `aside w-84 bg-[var(--sp-bg)] border-l border-[var(--sp-border)] shadow-xl flex flex-col z-10 h-full overflow-hidden`.
- Header `px-4 py-3 border-b border-slate-100 bg-[var(--sp-bg2)]`, `h2 font-semibold text-sm text-[var(--sp-text)]` + icono `Sliders w-4 h-4 text-blue-600`; cierre `X` `p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60`.
- Tabs `grid grid-cols-6 border-b border-slate-200 bg-[var(--sp-bg2)] text-[11px] font-medium divide-x divide-slate-200/60`; botón `flex flex-col items-center justify-center py-2 px-1` con icono Lucide `w-3.5 h-3.5 mb-0.5` + label `truncate w-full text-center`; activa `bg-white text-blue-600 font-semibold border-b-2 border-blue-600 shadow-2xs`, resto `text-[var(--sp-muted)] hover:bg-[var(--sp-hover)] hover:text-[var(--sp-text)]`.
- Contenido `flex-1 overflow-y-auto p-4 space-y-5 text-xs text-[var(--sp-text)]`; sin nodo seleccionado (salvo tab `theme`) muestra placeholder "Ningún nodo seleccionado".
- Grid de opciones `grid grid-cols-3/4/5 gap-1.5`; botón `flex flex-col items-center p-2 rounded-xl border`: sel `border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs`, base `border-slate-200 bg-white text-slate-600 hover:bg-slate-50`.
- Inputs `w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 shadow-2xs`.
- Tarjetas de tema `grid grid-cols-2 gap-2`; card `p-2.5 rounded-xl border`, sel `border-blue-600 bg-blue-50/70 ring-1 ring-blue-500`; dots `w-3.5 h-3.5 rounded-full border border-slate-300`.
- 6 pestañas → delegan a `organisms/toolpanel/*`. Icono Lucide, etiqueta visible y tooltip (`title`), verificados en `ToolPanel.tsx`:

| Tab (interno) | Icono | Etiqueta visible | Tooltip |
|---|---|---|---|
| `content` | `Type` | Texto | Texto & Contenido |
| `format` | `Palette` | Estilos | Estilos & Forma |
| `notes` | `FileText` | Notas | Notas Markdown |
| `icons` | `Smile` | Iconos | Iconos |
| `clouds` | `Cloud` | Nubes | Nubes de agrupación |
| `theme` | `Layers` | Mapa | Configuración del Mapa |

Cada pestaña con ≥2 secciones plegables encabeza su contenido con la barra "Desplegar todo | Plegar todo" (patrón documentado en §4, `Contenedores`): label `uppercase` a la izquierda, enlaces a la derecha. Secciones plegables por pestaña: `content` 4 (Título/Cuerpo/Imagen/Metadatos), `format` 4 (Forma/Fondo/Borde/Arista), `theme` 5 (Tema/Layout/Fondo/Conexiones/Separaciones), `clouds` 3 (Forma/Relleno/Borde, solo visibles con la nube activa), `icons` 1, `notes` 0 (textarea plano).

### Contrato funcional de los paneles de texto (ContentTab y NotesTab)

- **Regla común:** todos los campos son **controlados** — cada `onChange` llama directo a `onUpdateNode(nodeId, updates)`. Sin estado local duplicado, sin botón "Aplicar", sin debounce: el nodo en el lienzo se actualiza en vivo. Vaciar un campo opcional = escribir `undefined` (`body`, `imageUrl`, `link`, colores con `onReset`/`onClear`).

- **ContentTab (4 secciones, verificadas en `ContentTab.tsx`):**
  1. *"Título del Nodo" / "Texto principal y tipografía"* — icono `Type`, badge del header = `{fontSize || 14}px`. `textarea rows=2` (`text`, placeholder "Escribe el título...", `resize-y`) + bloque inferior `pt-1 border-t` con: `FontFormatToolbar` (2 grupos: toggles Negrita/Cursiva con activo `bg-blue-100 text-blue-700 font-bold`, alineación Izquierda/Centro/Derecha — sin justificado —, `align` default `left`, escribe `textAlign`), `ColorPicker` "Color del Texto" (`textColor`, `onClear` → `undefined` = Auto/tema) y `SliderInput` "Tamaño de Fuente" (`fontSize` 10–36px, def 14, `onReset` → `undefined` = hereda).
  2. *"Cuerpo / Subtexto" / "Descripción adicional del nodo"* — icono `FileText`, acción `Eye`/`EyeOff` en el header (`hideBody`; activo `bg-amber-100 text-amber-700`), badge "Activo" (`emerald`) / "Oculto" (`amber`). `textarea rows=3` (`body`, vacío → `undefined`). El bloque de formato solo se monta si hay cuerpo: `FontFormatToolbar` (`bodyBold/bodyItalic/bodyAlign`), `ColorPicker` "Color del Cuerpo" (`bodyColor`) y `SliderInput` "Tamaño del Cuerpo" (`bodyFontSize` 9–24px, def 12).
  3. *"Imagen Adjunta" / "Ilustración dentro del nodo"* — icono `ImageIcon`, acción ojo (`hideImage`), badge "Activa" (`blue`) / "Oculta" (`amber`). Fila: input URL (`imageUrl`) + `Upload` (label con `<input type="file" accept="image/*">` oculto → `FileReader.readAsDataURL` → `imageUrl` como dataURL + `imagePosition: 'top'` si no tenía; tras leer resetea `e.target.value=''` para permitir re-seleccionar el mismo archivo) + `Trash2` (limpia `imageUrl/imagePosition/imageWidth/imageHeight`). Si hay imagen: label "Posición de Imagen" + grid `grid-cols-3` de 6 opciones (`top` Arriba / `between` Entre texto / `bottom` Abajo / `left` Izquierda / `right` Derecha / `fit` Ajustar, default `top`) + `SliderInput` "Ancho de imagen" (`imageWidth` 60–500px step 10, def 140, sin reset).
  4. *"Metadatos y Visibilidad" / "Tags, enlace, progreso e iconos"* — icono `SlidersHorizontal`, 4 bloques con label `text-[11px] font-semibold text-slate-700` (el primero, Tags, **sin** `border-t`; los otros tres con `pt-2 border-t border-slate-200/80`). Cada bloque tiene **ojo de visibilidad propio** (activo = oculto: `bg-amber-100 text-amber-700` + texto "Oculto"/"Visible"), y **el ojo solo se renderiza si el valor existe** (tags solo con `tags.length > 0`, link solo si `link`, progreso solo si `progress !== undefined`; el bloque de Iconos entero solo con `icons.length > 0`):
     - *Etiquetas (Tags)*: `TagManager` (chips + input + botón `Plus`) — añade/quita de `tags`. Input placeholder **"Añadir etiqueta..."**, añade con **Enter** o `Plus` (deshabilitado si el input está vacío), aplica **`trim()`** y **deduplicación exacta case-sensitive** ("js" ≠ "JS"). Chips `bg-blue-50 text-blue-700 border-blue-200/60` con `X` (`onRemoveTag`, hover rojo); **sin tags la fila de chips no se pinta** (`tags.length > 0 &&`, sin estado vacío de texto).
     - *Enlace Web*: icono `LinkIcon` + input (`link`, placeholder "https://ejemplo.com").
     - *Barra de Progreso*: `SliderInput` 0–100 step 5 (`progress`, `badge` = `{n}%` o "Sin asignar", `onReset` → `undefined`).
     - *Iconos (n)* + botón "Abrir Galería de Iconos" (`w-full bg-blue-50 text-blue-700 border-blue-200/80 rounded-xl`, llama `onOpenIconPackModal`; **solo se renderiza si se pasa esa prop**).

- **NotesTab (editor Markdown, sin `CollapsibleSection`; verificado en `NotesTab.tsx` completo):**
  - **Header** (`flex items-center justify-between pb-1 border-b border-slate-200 gap-2 flex-wrap`): label "Nota Markdown" con **`uppercase tracking-wider`** (`text-[10.5px] font-bold text-slate-400 uppercase tracking-wider`, `NotesTab.tsx:54`) → **se ve en MAYÚSCULAS** ("NOTA MARKDOWN"). A la derecha, 2 controles:
    - **Toggle `showNoteInline`** — icono **`LayoutList`**, texto `"Mostrar en Nodo"` (inactivo) / `"Debajo del Cuerpo ✓"` (activo `bg-amber-500 text-white border-amber-600 shadow-amber-500/20`; inactivo `bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200`); `title` exacto: *"Nota visible debajo del cuerpo en el lienzo (Tooltips desactivados)"* activo / *"Mostrar nota debajo del cuerpo del nodo (Desactiva tooltips)"* inactivo. En el lienzo la nota pasa a renderizarse bajo el cuerpo y se desactivan tooltips (§1, `showNoteInline`).
    - **Grupo de 3 vistas** (contenedor `rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs`), en orden `Edit3` (edit, `title` "Solo editor") → `Columns` (split, "Vista dividida") → `Eye` (preview, "Solo vista previa"); activo `bg-blue-100 text-blue-700 font-semibold`, inactivo `text-slate-500 hover:text-slate-800`. **`viewMode` es `useState` local, default `'preview'`** — como `ToolPanel` solo monta `<NotesTab>` con `activeTab === 'notes'` (`ToolPanel.tsx:216`), **cada salida y reentrada a la pestaña reinicia la vista en "preview"** (no persiste).
  - **Toolbar Markdown** (visible en `edit`/`split`): 9 botones `p-1 rounded text-slate-600 hover:bg-slate-200/80 cursor-pointer` en `bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-2xs` con separadores `|` (`text-slate-300`). Cada botón llama `handleInsertMarkdown(prefix, suffix, placeholder)` con **placeholder fijo**: Negrita (`**`·`negrita`), Cursiva (`*`·`cursiva`) | H1 (`# `·`Encabezado 1`), H2 (`## `·`Encabezado 2`) | Lista (`- `·`Elemento`), Numerada (`1. `·`Elemento`), Checklist (`- [ ] `·`Tarea`) | Código (`` ` ``·`código`), Cita (`> `·`Cita`). **Gotcha de sufijo**: H1, H2, Lista, Numerada, Checklist y Cita pasan **solo prefijo** (`suffix=''` — no envuelven selección); solo Negrita/Cursiva/Código envuelven (`prefix`+`suffix`). `handleInsertMarkdown`: inserta en `selectionStart/End` del `textarea#node-note-textarea` (o al final, con `\n` de separador, si no lo encuentra), envuelve o usa el placeholder, y re-selecciona lo insertado tras re-enfocar (`setTimeout 0`).
  - `textarea id="node-note-textarea"` (`note`), `rows=6` en split / `12` en edit, `font-mono leading-relaxed resize-y`, placeholder "Escribe notas en formato Markdown aquí...". Preview vía `MarkdownView` (card `bg-white border rounded-xl p-3 min-h-[120px] max-h-[350px] overflow-y-auto`); vacío = "Sin notas aún. Cambia al modo editor para escribir." (itálica, centrada, `py-6`). `MarkdownView` solo se monta en `preview`/`split`.
  - **Excepción a la regla común de arriba**: escribir en el textarea guarda **`''`** (no `undefined` — `note: e.target.value`, `NotesTab.tsx:203`); funciona porque el preview comprueba truthiness (`selectedNode.note ?`), pero es el único campo que no sigue el patrón "vaciar = `undefined`".
  - Gotcha: `>` (cita) **no genera `<blockquote>`** en `renderMarkdownToHTML` — verificado; no prometer citas en preview.
  - Inconsistencia actual: `MessageSquareOff` **se importa y no se usa** (`NotesTab.tsx:18`, import muerto) — no tocar sin decisión explícita.

### Contrato funcional de "Forma y Geometría" (FormatTab, sección 1)

Verificado en `FormatTab.tsx:97-141` y `ShapeSelector.tsx`.

- **Header de la sección**: icono `Square`, título "Forma y Geometría" / subtítulo "Geometría exterior y dimensiones", y badge `capitalize` = `{selectedNode.shape || 'Burbuja'}` (`FormatTab.tsx:105-107`). **Gotcha:** el badge muestra el **ID crudo en inglés** ("Bubble", "Pill", "Hexagon", "Fork"…), mientras que los botones del selector muestran el nombre español ("Burbuja", "Píldora", "Horquilla"…) — inconsistencia actual, no "corregirla" sin decisión explícita.
- **`ShapeSelector`** (`currentShape` default `'bubble'`; clic → `onUpdateNode(id, { shape })` inmediato, sin debounce): `grid grid-cols-5 gap-1.5` con los 10 shapes en orden fijo — `bubble` Burbuja (SVG path MessageSquare), `fork` Horquilla (barra `h-0.5`), `rectangle` Rectángulo (`w-5 h-3.5 border-2`), `square` Cuadrado (`w-4 h-4 border-2`), `oval` Óvalo (`w-5 h-3 rounded-[50%]`), `circle` Círculo (`w-4 h-4 rounded-full`), `pill` Píldora (`w-5 h-2.5 rounded-full`), `hexagon` Hexágono (Lucide `Hexagon`), `arrow` Flecha (Lucide `ArrowRight`), `star` Estrella (Lucide `Star`). Botón: `p-2 rounded-xl border` con `title` = nombre y label `text-[10px] truncate`; seleccionado `border-blue-600 bg-blue-50/80 text-blue-700 font-semibold shadow-2xs`.
- **Bloque de dimensiones** (`pt-2 border-t border-slate-200/80 space-y-3`), dos `SliderInput`:
  1. *"Ancho personalizado"* — `customWidth` **0–500 step 10**, `unit="px"`; `badge` = `{n}px` si hay valor o **"Automático"** si es 0/`undefined` (prop `badge` de `SliderInput` para no mostrar "0px"); `onChange` escribe `w > 0 ? w : undefined` — **llegar a 0 borra el valor** (= auto) —; `onReset` → `undefined`; `description` "0 = Ajuste automático al contenido".
  2. *"Alto personalizado"* — `customHeight` **0–300 step 5**, idéntico patrón (`h > 0 ? h : undefined`).
- **Enlace con §6 (sizing):** `undefined`/0 en ambos → `estimateNodeSize` calcula el tamaño (caja 4:3 o lado mínimo en square/circle); cualquier valor >0 **manda el usuario** sobre el cálculo (§6: "Con ancho y alto personalizados manda el usuario"). `onUpdateNode` directo: la regla común de edición en vivo de este §8 aplica aquí también.

### Contrato funcional de "Fondo y Relleno" (FormatTab, sección 2)

Verificado en `FormatTab.tsx:144-383` y render en `NodeBackgroundRenderer.tsx:40-177`.

- **Header**: icono `Paintbrush`, "Fondo y Relleno" / "Color, degradado, trama o imagen" — **sin badge** (a diferencia de Forma).
- **Selector de tipo** (§4): `grid grid-cols-5` — Sólido (`color`), Degradado (`gradient`), Trama (`pattern`), Imagen (`image`), Transp. (`transparent`). Clic escribe solo `bgType`. **Derivación**: `bgType = node.bgType || (node.bgImageUrl ? 'image' : 'color')` (`FormatTab.tsx:69`, idéntica en `NodeBackgroundRenderer.tsx:40`) — un nodo con imagen de fondo sin `bgType` se muestra como Imagen. **No hay forma de volver a "sin tipo"**: todos los tipos escriben un valor; el Reset de Sólido es la única salida parcial.
- **Controles por tipo** (solo se monta el bloque del tipo activo):
  1. **Sólido** — `ColorPicker` "Color de Fondo" sobre `color`: `onChange` escribe `{ color, bgType: 'color' }` y `onClear` escribe `{ color: undefined, bgType: undefined }` → **único tipo donde limpiar cambia el tipo activo** (vuelve a Sólido con Auto).
  2. **Degradado** — 2 `ColorPicker` **sin `onClear`** (nunca muestran Reset ni "Auto"; siempre hay default): "Color Inicial" `gradientColor1 || '#3b82f6'`, "Color Final" `gradientColor2 || '#1d4ed8'`. Dirección: label "Dirección del Degradado" + `grid grid-cols-4` (`to-r` Horizontal `ArrowRight` / `to-b` Vertical `ArrowDown` / `to-br` Diagonal `ArrowDownRight` / `radial` Radial `Disc`), default `to-r` → `gradientDirection`. **Gotcha de render**: el lienzo cae a `#3b82f6`/`#8b5cf6` si los campos son `undefined` (`NodeBackgroundRenderer.tsx:50-51`) — el fallback final del lienzo (`#8b5cf6`) **no coincide** con el default del panel (`#1d4ed8`) si el usuario nunca tocó el color final.
  3. **Trama** — label "Estilo de Trama" + `grid grid-cols-4` con **7 estilos** (`PATTERN_OPTIONS`, `FormatTab.tsx:33-41`) → `nodePattern`: `dots` Puntos `:::` · `lines` Líneas `≡` · `stripes` Rayas `///` · `squares` Cuadros `⊞` · `triangles` Triángulos `▲` · `hexagons` Panal `⬡` · `cross` Cruces `✚` (glyphs de texto, no iconos Lucide). Luego `grid-cols-1 gap-2.5 pt-1` con 2 `ColorPicker` **con Reset**: "Color del Fondo Base" = **mismo campo `color` que Sólido** (compartido) y "Color del Trazo de Trama" `nodePatternColor || '#475569'`. `SliderInput` "Tamaño del patrón" **8–40px def 16** (`nodePatternSize`, sin reset) y "Opacidad del trazo" **10–100% def 40** → **se guarda como decimal**: `nodePatternOpacity: op / 100`, display `Math.round(x * 100)` (`FormatTab.tsx:278-285`); render usa `nodePatternOpacity ?? 0.4` y `Math.max(0.04, opacity * 0.5)` para la capa base.
  4. **Imagen** — fila `gap-1.5`: input `bgImageUrl` (`flex-1 min-w-0`, placeholder "URL de imagen (https://...)") + `Upload` (label `bg-blue-50 border-blue-200/80` con `<input type="file" accept="image/*">` oculto → `FileReader.readAsDataURL` → `{ bgImageUrl: dataURL, bgType: 'image' }`; `e.target.value = ''` **incondicional**, aunque el lector falle) + `Trash2` **solo si hay `bgImageUrl`** (`title` "Eliminar imagen de fondo", limpia `bgImageUrl` **pero deja `bgType`**). Si hay imagen: preview `h-24` (`object-cover` + overlay `bg-black/20` + chip "Vista previa" `bg-black/60`). Label "Modo de Ajuste" + `grid grid-cols-3` con **doble línea** (nombre bold `text-xs` arriba + alias `text-[10px]` abajo): `cover` **Expandir/Cubrir** · `contain` **Completa/Contener** · `tile` **Repetir/Mosaico**, default `cover` → `bgImageMode`. **Gotcha**: el tipo `NodeBgImageMode` admite un 4º valor `'fit'` (`mindmap.ts:75`) que **el panel no ofrece**; en render `'fit'` ≡ `'contain'` (`NodeBackgroundRenderer.tsx:161`) — no eliminarlo del tipo sin revisar `freeplaneConverter`.
  5. **Transp.** — solo escribe `bgType: 'transparent'`; sin controles extra (el color base `color` sigue aplicable desde Sólido/Trama).

### Contrato funcional de "Bordes y Contorno" (FormatTab, sección 3)

Verificado en `FormatTab.tsx:385-436` y render en `NodeBackgroundRenderer.tsx:190-194`.

- **Header**: icono `Sparkles` (mismo icono que la opción "Trama" del selector de fondo), "Bordes y Contorno" / "Grosor, color y estilo de línea" — **sin badge**.
- **"Color del Borde"** — `ColorPicker` sobre `borderColor` **con Reset** (`onClear` → `undefined`). Semántica de Auto (enlaza con §4): el borde automático **de un nodo normal es el color de su rama** — `borderColor = node.borderColor || (isRoot ? (node.borderWidth ? branchColor : 'transparent') : branchColor || theme.nodeBorder)`; la raíz **sin grosor** queda `transparent`, con grosor toma el color de rama.
- **"Grosor del borde"** — `SliderInput` `borderWidth` **0–8px, step 1 (default de `SliderInput`), sin `badge`, sin `onReset`**: `value` = `borderWidth !== undefined ? borderWidth : 1` (muestra 1 si nunca se tocó), `onChange` escribe el número **tal cual, incluido 0**. **Diferencia con §8 Forma**: aquí 0 **no borra** el valor — deja `borderWidth: 0` fijo (nodo sin borde visible), y no hay atajo de vuelta al estado "sin tocar" salvo Reset manual del dato. **Gotcha decimal**: si `borderWidth` llega de otro origen con decimal (p. ej. 2.5 desde ThemeTab/mapa), el slider lo **muestra** pero al arrastrar salta a enteros (step 1).
- **"Estilo de Línea"** — label `text-[11px] font-semibold text-slate-600 block` + `grid grid-cols-3 gap-1.5` con **preview de línea real** (`w-8 border-t-2 border-{solid|dashed|dotted} border-current my-1`): `solid` Sólido / `dashed` Guiones / `dotted` Puntos, default `solid`. **Gotcha doble escritura**: el clic escribe **`borderDash` y `borderStyle` a la vez** (`{ borderDash: dash.id, borderStyle: dash.id }`, `FormatTab.tsx:422` — duplicado legacy), pero la selección del panel se lee **solo de `borderDash`** (`|| 'solid'`); el render acepta ambos (`node.borderDash || node.borderStyle || 'solid'`, `NodeBackgroundRenderer.tsx:190`). No eliminar un campo sin revisar el otro.
- El panel **no ofrece** presets de grosor ni checkbox "Auto (color de rama)" (specs viejos lo decían; era falso).

### Contrato funcional de "Aristas y Propagación" (FormatTab, sección 4)

Verificado en `FormatTab.tsx:438-540`, `useMindMapStore.ts:79-108,519-588` y render `MindMapCanvas.tsx:1263-1281`.

- **Header**: icono `Network`, "Aristas y Propagación" / "Estilo de línea hacia los hijos" — **sin badge**.
- **"Forma de la Conexión"** — label `text-[11px] font-semibold text-slate-600 block` + `grid grid-cols-4 gap-1.5` con **SVG inline propio por opción** (no Lucide): `bezier` **Curva** (path `M4 18 C10 18, 14 6, 20 6`) / `linear` **Recta** (línea) / `sharp` **Escuadra** (polyline `4,18 4,6 20,6`) / `horizontal` **Horiz.** (step `H4 18 H12 V6 H20`). Clic escribe **solo `edgeStyle`**; selección `edgeStyle || 'bezier'`. **Gotcha**: `'hidden'` existe en el tipo `EdgeStyle` pero **esta sección no lo ofrece** (solo ThemeTab a nivel mapa).
- **"Color de la Arista"** — `ColorPicker` sobre `edgeColor` **con Reset** (`onClear` → `undefined`). Cadena de render de **3 niveles** (`MindMapCanvas.tsx:1277`): `edgeColor || mindMap.edgeColor || colorDeRama` — el Auto del nodo **hereda primero del color de arista del mapa**, después del color de rama (no directamente del tema).
- **Cadena completa del estilo de línea** (3 niveles, `MindMapCanvas.tsx:1265-1281`): estilo `node.edgeStyle || map.edgeStyle || theme.edgeStyle || 'bezier'`; perfil `node.edgeProfile || map.edgeProfile || 'uniform'`; grosor `node.edgeWidth || map.edgeWidth || defaultWidth`. Perfil y grosor **no se editan aquí** (§11: son de mapa en ThemeTab).
- **"Propagación de Estilo"** (`pt-2 border-t border-slate-200/80 space-y-2`, label block) — `grid grid-cols-2 gap-1.5` con 2 botones (`text-[11px] font-semibold py-1.5 px-2 rounded-lg`): **"Aplicar a Hijos"** (`bg-blue-50 text-blue-700 border-blue-200`, hover `blue-100`) → `onApplyStyleToChildren(id)` y **"Aplicar a Hermanos"** (`bg-slate-100 text-slate-700 border-slate-200`, hover `slate-200`) → `onApplyStyleToSiblings(id)`; **solo se montan si se pasan las props**.
  - **Qué copian** (`extractNodeStyleBundle`, `useMindMapStore.ts:79-108` — 26 campos): forma (`shape`), bloque de fondo completo (`color bgType gradientColor1/2 gradientDirection nodePattern nodePatternColor nodePatternSize nodePatternOpacity`), bordes (`borderColor borderWidth borderDash borderStyle`), texto (`textColor fontSize bold italic fontFamily textAlign`), aristas (`edgeColor edgeStyle edgeWidth edgeDash edgeProfile`) y dimensiones (`customWidth customHeight`). **NO copia** `body`, imagen, tags, link, progreso, iconos ni notas.
  - **Guardas del store** (no visibles en el panel): *Hijos* no-op si el nodo no tiene hijos; *Hermanos* no-op si es la raíz, si no tiene padre o si el padre tiene **≤1 hijo**. Hijos = **recursivo sobre todo el subárbol**; Hermanos = solo los hermanos **directos** (no sus hijos). Ambos `pushHistory` + `saveCurrentMap`.

### Contrato funcional de "Tema del Mapa" (ThemeTab, 5 secciones)

Verificado en `ThemeTab.tsx` completo (623 líneas), `ToolPanel.tsx:234-266` y `App.tsx:440-578`.

- **Nota previa**: única pestaña que **no exige nodo seleccionado** (`ToolPanel.tsx:234`: se monta con `activeTab === 'theme'` sin `&& selectedNode`) — configura el **mapa**, no un nodo. Barra "Configuración Global del Mapa" + Desplegar/Plegar todo (§4). `sectionsOpen` por defecto: **solo `theme` abierto**; orden en DOM: Temas → Layout → Fondo → Aristas → Espaciado.
- **Props muertas (inconsistencia actual)**: `onOpenConnectorModal`, `onDeleteConnector` y `onUpdateConnector` se declaran y desestructuran (`ThemeTab.tsx:46-48,86-88`) pero **no se usan en ningún punto del JSX**; el import `BACKGROUND_PRESET_THEMES`/`BackgroundPresetTheme` (:11) **tampoco se usa** — no existe ningún selector de "12 presets de fondo" en la app (specs viejos lo inventaban).
1. **"Temas del Mapa"** (icono `Palette`, badge azul `rounded-full` = `currentTheme.name`) — `grid grid-cols-2 gap-2` con las **8 tarjetas** de `Object.values(THEMES)`: nombre (`text-xs truncate`) + `Check` si seleccionada, dot de nodo raíz (`rootBg`, `w-3.5 h-3.5 rounded-full border-slate-300`, `title` "Nodo raíz") y **solo los 4 primeros** `branchColors` (`w-2.5 h-2.5`); seleccionada `border-blue-600 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500`. Clic → `onUpdateMapTheme(id)` (paleta completa: fondos, ramas, bordes; §2).
2. **"Diseño del Árbol (Layout)"** (icono `Network`) — `grid grid-cols-3 gap-1.5` con los **9 layouts** (`LAYOUT_OPTIONS`, `ThemeTab.tsx:59-69`): `standard` Estándar (GitFork) · `balanced-horizontal` Balanceado (MoveHorizontal) · `right` Derecha (LayoutGrid) · `left` Izquierda (LayoutGrid `scale-x-[-1]`) · `top` Arriba (`-rotate-90`) · `bottom` Abajo (`rotate-90`) · `tree-down` Árbol ↓ (Network) · `radial` Radial ● (CircleDot) · `circular` Circular ○ (Compass). Clic → `onUpdateMapLayout`; seleccionado `border-blue-600 bg-blue-50 text-blue-700`.
3. **"Fondo del Lienzo"** (icono `Layers`) — `ColorPicker` "Color de Fondo del Lienzo" (`backgroundColor`) **con Reset** → `onResetMapBackground` que limpia **los 5 campos** de fondo (`App.tsx:525-536`). **Cadena de defaults** (`ThemeTab.tsx:114-118`): `mindMap?.x || currentTheme.x || literal` → color `#f8fafc`, patrón `dots`, trazo `#94a3b8`, tamaño `24`, opacidad `0.45` (esta con `??`). Label "Patrón de Cuadrícula" + `grid grid-cols-3` con los **6 valores del tipo `BackgroundPatternStyle`** (`mindmap.ts:187-193` — el panel ofrece exactamente el tipo, sin gotcha de sobra): `none` Liso / `dots` Puntos / `lines` Líneas / `squares` Cuadros / `triangles` Triángulos (SVG) / `hexagons` Panal (SVG). Si el patrón ≠ `none` se montan: `ColorPicker` "Color del Trazo del Patrón" **sin `onClear`**, `SliderInput` "Tamaño del Patrón" **12–64px step 2** y "Opacidad del Patrón" **5–100%** → **se guarda como decimal** (`op/100`, display `×100` — mismo patrón que la Trama de nodos). `onUpdateMapBackground` escribe con `pushHistory` + `applyBackgroundUpdate` (`App.tsx:515-524`).
4. **"Aristas Globales"** (icono `GitFork`) — 4 bloques:
   - *"Forma de Conexión Global"* `grid grid-cols-4` con los **mismos 4 SVG** que §8 "Aristas y Propagación" (bezier Curva/linear Recta/sharp Escuadra/horizontal Horiz.). Selección `mindMap?.edgeStyle || currentTheme.edgeStyle || 'bezier'`. **Gotcha de wiring**: el clic **prefiere** `onApplyEdgeStyleToAllNodes` (propagar a todos los nodos) pero **App no pasa esa prop** → en la app real cae siempre al fallback `onUpdateMapEdgeStyle` (solo nivel mapa, sin propagación).
   - *"Perfil de Grosor (Ribbon)"* `grid grid-cols-4` con glyphs: `uniform` Uniforme `═` · `tapered` Cónica `◣` · `spindle` Huso `◆` · `hourglass` Reloj `⧖`. Selección `mindMap?.edgeProfile || 'uniform'` — **sin fallback a `currentTheme`**, a diferencia del estilo. Mismo gotcha: `onApplyEdgeProfileToAllNodes` tampoco se pasa → fallback `onUpdateMapEdgeProfile`.
   - Bloque `pt-2 border-t border-slate-200/80`: fila "Color de Aristas" con botón **"Multicolor"** (`Sparkles`; **activo** = `edgeColor` sin definir → gradiente `from-blue-500 via-purple-500 to-pink-500`, escribe `edgeColor: undefined`, `title` "Cada rama principal tiene su propio color del tema"; inactivo slate) + botón **"Randomizar"** (`Dices`, indigo, `hover:scale-105 active:scale-95`, solo si prop — **sí se pasa** → store `handleRandomizeEdgeColors`, paleta de 24). `ColorPicker` "Color Uniforme de Ramas" (`mindMap?.edgeColor`, con Reset → `undefined`) + paleta **"Sugeridos:"** de 8 en `overflow-x-auto` (dots `w-4.5 h-4.5 rounded-full`, `ring-2 ring-blue-500 ring-offset-1` si coincide): `#3b82f6` Azul · `#8b5cf6` Púrpura · `#10b981` Verde · `#f59e0b` Ámbar · `#ef4444` Rojo · `#ec4899` Rosa · `#475569` Pizarra · `#0f172a` Oscuro.
   - Bloque `pt-2 border-t`: "Estilo de Línea Global" `grid grid-cols-3` con preview `border-t-2` — `solid` Sólido / `dashed` Guiones / `dotted` Puntos; selección `mindMap?.edgeDash || 'solid'` → `onUpdateMapEdgeDash`. **Diferencia con el nodo** (§8 Bordes): aquí escribe **solo `edgeDash`** (campo propio de mapa), no la doble escritura `borderDash`+`borderStyle`.
   - `SliderInput` "Grosor de Aristas Global": `mindMap?.edgeWidth || 2.5`, **1–8px step 0.5** → `onUpdateMapEdgeWidth`. (Este `2.5` es el default que luego aparece crudo en el slider de "Grosor del borde" del nodo, §8 Bordes.)
5. **"Espaciado del Mapa"** (icono `MoveHorizontal`) — 2 `SliderInput`: "Separación Horizontal" `horizontalGap ?? 54` **20–150 step 2** y "Separación Vertical" `verticalGap ?? 14` **4–60 step 2** (`mindmap.ts:240-241`) → `onUpdateMapGaps({ horizontal, vertical })`. **Cableado (fix 2026-10-17)**: App no pasa `onUpdateMapGaps` directamente, así que ToolPanel incluye un **adaptador** — si la prop directa no viene, llama a `props.onUpdateMapSpacing(h, v)` (que App sí inyecta con `pushHistory`, `App.tsx:553-561`) completando el gap faltante con el valor actual del mapa (`?? 54` / `?? 14`). Antes de esta fecha ambos sliders eran no-op. Cubierto por `__tests__/ToolPanel.test.tsx` (4 tests).
- **Props muertas en ToolPanel** (relacionadas): `onUpdateMapBackgroundColor`, `onUpdateMapBackgroundPattern` y `onUpdateMapVisibility` se reciben de `App` pero **no se reenvían a ningún hijo** (`ToolPanel.tsx:63-71`, sin uso). **`onUpdateMapSpacing` ya no es muerta**: la consume el adaptador de `onUpdateMapGaps` (fix 2026-10-17, ver punto 5).

### Contrato funcional de "Nubes" (CloudsTab, 3 secciones)

Verificado en `CloudsTab.tsx` completo (288 líneas).

- **Props mínimas**: solo `selectedNode` + `onUpdateNode` — todo se edita dentro del objeto `node.cloud` (no hay acciones de store dedicadas; CloudsTab es el **único escritor** de `cloud:` en la app).
- **Interruptor maestro** (siempre visible): card `p-3 bg-blue-50/80 border-blue-200/80 rounded-2xl` con icono `Cloud`, "Nube de Agrupación" / "Envuelve visualmente este nodo y sus descendientes" + switch `h-5 w-9 rounded-full` (`bg-blue-600` activo / `bg-slate-300`; knob `h-4 w-4 translate-x-4/0`). `handleToggleCloud`: **apagar = `cloud: undefined`** (borra el objeto completo — se pierde el estilo al reactivar); **encender** = objeto por defecto `{ enabled, color: '#3b82f6', shape: 'cloud-scallop', opacity: 0.08, bgType: 'color', borderColor: '#3b82f6', borderWidth: 1.5, borderDash: 'dashed', shadow: true }`.
- Las 3 secciones **solo se montan con la nube activa** (`isCloudEnabled`, wrapper `animate-in fade-in`), precedidas de la barra "Formato de la Nube" + Desplegar/Plegar todo (§4). `sectionsOpen`: solo `shape` abierto. `updateCloudProps(updates)` **fuerza `enabled: true`** en cada escritura (defensivo).
1. **"Forma y Márgenes"** (icono `Square`) — `grid grid-cols-4` con los **8 `CLOUD_SHAPES`** (`CloudsTab.tsx:24-33`): `cloud-scallop` Nube (`Cloud`) · `arc` Arco (`Circle`) · `round-rectangle` Redondeado (`Square rounded-md`) · `rectangle` Rectángulo (`Square`) · `bubble` Burbuja (`MessageSquare`) · `oval` Óvalo (`Circle scale-x-125`) · `hexagon` Hexágono · `star` Estrella; label `text-[9.5px]`, selección `shape || 'cloud-scallop'`. Tras `pt-2 border-t`: 2 `SliderInput` **-50–200 step 5** con `onReset` — "Margen Horizontal Extra" `paddingX || 0` y "Margen Vertical Extra" `paddingY || 0`. **Gotcha**: el comentario del tipo dice "-100 a +300 px" (`mindmap.ts:62-63`) pero el slider solo permite -50–200.
2. **"Relleno de la Nube"** (icono `Paintbrush`) — `ColorPicker` "Color de Nube" (`cloud.color || '#3b82f6'`) **sin `onClear`** + `SliderInput` "Opacidad de Fondo" **0–100% def 8** → **guardada en decimal** (`op/100`, display `×100` — mismo patrón que Trama de nodos y patrón de lienzo), sin reset.
3. **"Borde y Sombra"** (icono `Sparkles`) — `ColorPicker` "Color de Borde" (`borderColor || '#3b82f6'`, sin `onClear`) + `SliderInput` "Grosor de Borde" `borderWidth ?? 1.5` **0–6 step 0.5** sin reset + "Estilo de Línea" `grid-cols-3` con preview `border-t-2` (Sólido/Guiones/Puntos), default **`dashed`** (≠ nodo: allí es `solid`), escribe **solo `borderDash`** (sin la doble escritura del nodo). **Gotcha de título**: la sección promete "Sombra" pero **no existe control de `shadow`** — se fija `true` al crear la nube y no se puede editar ni apagar desde la UI.
- **Gotcha grande**: `NodeCloud` admite `bgType` gradient/pattern/image (+ `gradientColor1/2`, `cloudPattern*`, `bgImageUrl/Mode/Opacity`, `mindmap.ts:48-59`) y **el lienzo los renderiza** (`MindMapCanvas.tsx:969-1228`), pero este panel solo escribe `bgType: 'color'` y nunca expone esos campos — son **campos fantasma**, alcanzables solo por importación.

### Contrato funcional de "Iconos" (IconsTab, 1 sección)

Verificado en `IconsTab.tsx` completo (314 líneas) y `useMindMapStore.ts:590-671`.

- **1 sola `CollapsibleSection`** — "Color y Tamaño de Iconos" / "Personalizar tinte, escala y propagación" (icono `Palette`, abierto por defecto vía estado local `isStyleSectionOpen`; **sin barra Desplegar/Plegar todo**, §4). **Badge del header**: dot `w-3.5 h-3.5 rounded-full` con el `iconColor` actual si existe (sin color, sin badge).
  1. `ColorPicker` "Tinte del Icono" (`iconColor`, con Reset → `undefined`).
  2. Paleta **"Sugeridos:"** de **7** dots `w-4.5 h-4.5` (**sin ring de selección**, a diferencia de la paleta de aristas de ThemeTab): `#ef4444` Rojo · `#f59e0b` Ámbar · `#10b981` Verde · `#3b82f6` Azul · `#8b5cf6` Púrpura · `#ec4899` Rosa · `#475569` Pizarra; más enlace **"Original"** (`ml-auto`, solo si `iconColor`) → `iconColor: undefined`.
  3. `SliderInput` "Tamaño del Icono": `iconSize || 14`, **10–36px step 1**, `badge` personalizado (`{n}px` o **"14px (Estándar)"**), `onReset` → `undefined`.
  4. "Propagación de Iconos" (`text-[10.5px]`) `grid grid-cols-2`: **"Copiar a Hijos"** (azul) / **"Copiar a Hermanos"** (gris) — botones **solo si prop** (`{onApply… && …}`) → store `handleApplyIconsToChildren/Siblings` (**sí cableados**, `App.tsx:449-450`). **Qué copian** (`useMindMapStore.ts:600-605,645-650`): `icons` (clon del array, `[]` si no tenía), `iconColor`, `iconSize`, `iconPosition`; mismas guardas que §8 "Aristas y Propagación" (hijos recursivo sobre el subárbol; hermanos directos con veto raíz/padre ≤1 hijo; `pushHistory` + `saveCurrentMap`).
- **"Iconos Asignados"** (solo si `icons.length > 0`, card `bg-blue-50/60 border-blue-200/80`): título + acción **"Quitar todos"** → `icons: []` (**array vacío, no `undefined`** — excepción al patrón "vaciar = `undefined`", como la nota en NotesTab); chips `bg-white border-blue-200` con `renderNodeIcon(id, 'w-3.5 h-3.5', iconColor)` + `X` → quita ese icono (`handleRemoveIcon`).
- **Buscador**: input `pl-8.5` con `Search` y placeholder `Buscar entre {TOTAL_VECTOR_ICONS_COUNT}+ iconos...` + `X` de limpiar (solo si hay query); `searchQuery` es estado local, filtrado vía `searchVectorIcons(query, category)` en `useMemo`.
- **Categorías**: chips en `overflow-x-auto` — "🌟 Todos" + `VECTOR_ICON_CATEGORIES` con emoji de `CATEGORY_EMOJIS` (mapa de 13 entradas; fallback `•`); activo `bg-blue-600 text-white`.
- **Quick tags**: 8 chips `rounded-full bg-slate-100` que fijan la query (🎯 Prioridad, ✓ Check, ⚠ Alerta, ★ Estrella, 👤 Usuario, ➔ Flecha, 💰 Dinero, 📁 Archivo).
- **Grid**: `grid-cols-6 max-h-[300px] overflow-y-auto bg-slate-50/60` con **`filteredIcons.slice(0, 120)`** — **máximo 120 iconos pintados**; el pack completo vive en `IconPackModal` vía el botón inferior **"Ver Galería Completa de Iconos"** (`w-full border-blue-200`, solo si prop — sí cableada, `App.tsx:577`). Toggle del grid: clic añade/quita de `icons` (`handleToggleIcon`); activo `bg-blue-600 text-white ring-2 ring-blue-400 scale-105`.

---

## 8.5. Modales (6, contrato funcional)

Los 6 ficheros de `src/components/Modals/` (antes 7; se **eliminó `ComingSoonModal`** el 2026-10-17, ver §10 y §8.5.7 histórico) se verifican línea a línea. Patrón común: `ModalBackdrop` (+ `ModalHeader`); **todos se montan siempre** en `App.tsx` y se abren/cierran por `isOpen` → **el estado interno (`useState`) persiste entre aperturas** (la excepción: `SavedMapsModal` recarga su lista con `useEffect` en cada apertura). Excepción `forceLight`: `TemplatesModal` (siempre tema claro).

| Modal | Líneas | Se abre desde |
|---|---|---|
| `ExportImportModal` | 293 | Menú Archivo → Exportar/Importar; ToolBar "Exportar" (3 variantes) |
| `ShortcutsModal` | 65 | Menú Ayuda → Atajos de Teclado; App:186 |
| `TemplatesModal` | 607 | Menú Archivo → Plantillas; Ayuda → Guía Tutorial |
| `SavedMapsModal` | 131 | Menú Archivo → Mis Mapas Guardados |
| `ConnectorModal` | 216 | Menú Insertar → Conector; ToolBar/menú móvil "Conector"; menú contextual "Crear Conector…" (`App:397`); `onOpenConnectorModal()` sin args → `selectedNodeId || rootId` (`App:196,289`) |
| `IconPackModal` | 395 | ToolBar "Iconos SVG"; Insertar → "Pack Iconos Vectoriales"; ContentTab "Abrir Galería"; IconsTab "Ver Galería Completa" |

### 8.5.1. `ExportImportModal` — pestañas Exportar / Importar

- Estado: `activeTab` (default `'export'`, **persiste** entre aperturas), `importError`.
- **Exportar — 4 tarjetas** (todas descarga vía Blob + `URL.createObjectURL` + `a.click()`; nombre = título saneado `[^a-zA-Z0-9_-]`→`_`, fallback `mapa_mental`):
  1. **Freeplane** (ámbar, "100% Compatible") → `exportToFreeplaneXML`, `application/xml`, ext `.mm`.
  2. **HTML Portable** (azul, "Recomendado") → `exportToStandaloneHTML`, ext `_portable.html`.
  3. **Markdown** (pizarra, ".md") → `exportToMarkdown`.
  4. **JSON** (índigo, "Respaldo 100%") → `JSON.stringify(mindMap, null, 2)`.
- **Importar**: `<input accept=".mm,.json,.xml">` (el texto solo menciona .mm/.json). Si es JSON y `parsed.rootId && parsed.nodes` → importa tal cual; si no → `importFromFreeplaneXML` (XML); `catch` → banner de error `importError` (**no se limpia al elegir otro archivo**; solo se sustituye con otro error o al cerrarse el modal).
- Tras importar, `App:637-641` → `pushHistory` + `setMindMap` + selecciona raíz.
- **🐛 Gotchas**: (a) ✅ **Etiqueta PNG corregida 2026-10-17**: el menú Archivo y el `title` del ToolBar prometían "PNG"/"Imágenes" inexistentes → ahora dicen "Exportar (.mm / HTML)" y "Exportar archivo .mm / HTML Portable" (el **subtítulo del modal** "…e imágenes" **sigue** prometiendo imágenes — queda); **no hay exportación a PNG/SVG** (solo mm/html/md/json); (b) dice "Arrastra o selecciona un archivo" pero **no hay handler `onDrop`** (solo clic).

### 8.5.2. `ShortcutsModal` — lista estática de 16 atajos

- 16 filas `kbd` + descripción (Tab/Insert, Enter, **Shift+Enter**, F2/Doble Clic, Supr/Delete, Espacio, flechas, Escape, Ctrl+Z/Y, Ctrl+C/X/V, Ctrl+F, Alt+O, Alt+P, F5, F11), agrupadas en 6 campos `cat` (Nodos/Edición/Navegación/Historial/Portapapeles/Vistas) que **no se pintan en el JSX** (`sc.cat` muerto).
- Verificación vs `useKeyboardShortcuts.ts`: 15/16 correctos. "Shift + Enter = salto de línea" **no tiene handler propio** — es el comportamiento nativo del `textarea` (el hook se salta los atajos mientras `isTyping`).
- **Faltan en la lista**: `Ctrl+Shift+Z` (rehacer), `Backspace` (borrar, junto a Supr), y **todas las teclas de presentación** (→/Espacio/Enter/←/Backspace/O/N/E/Esc, `MindMapCanvas.tsx:352-394`). F11 lo aporta el navegador.

### 8.5.3. `TemplatesModal` — galería de plantillas

- `forceLight` en backdrop y header (la card-preview fuerza fondos `bg-white`/`slate` con dark-cards explícitos). Badge `{ALL_TEMPLATES.length} Modelos`.
- **Filtros**: 7 categorías **hardcodeadas** (Todas/Destacada/Estrategia/Tecnología/Gestión/Creatividad/Educación); búsqueda case-insensitive sobre `title/desc/tags/themeName/layoutLabel`; chips de tags (unión ordenada de `ALL_TEMPLATES[*].tags`) con botón "Limpiar (#tag) ×". Estado de filtros **persiste** entre aperturas.
- **Card "Mapa en Blanco"** (primera): `BLANK_MAP` + `id map-Date.now` + `createdAt/updatedAt Date.now()`.
- **Card de plantilla**: `onClick` → `onSelectTemplate` (todo el card; los chips de tag hacen `stopPropagation`); ilustración = `root.imageUrl` o `getTemplateIllustration(id)` (switch de ~20 ids → `TEMPLATE_SVGS`, default `mindMapHub`); badge de categoría con `tmpl.badgeColor`; **`TemplateMapPreview`** (SVG en vivo que ejecuta `computeMindMapLayout` real: aristas bezier por lado, formas circle/oval/hexagon/pill/fork/bubble, colores del tema, `stroke #fff` en profundidad 0-1, badge "Vista Previa" en hover); descripción `line-clamp-2`; badges de metadata: tema (`Palette`), layout (`GitBranch`), aristas (`Sliders` — `layoutLabel` + `edgeDesc`).
- Grid `grid-cols-1 md:grid-cols-2` (comentario "Grid of 20" hardcodeado); estado vacío con "Restablecer Filtros"; footer con Cerrar.
- Selección → `App:652-656` `pushHistory` + `setMindMap(tmpl)` + selecciona su raíz.
- Test existente: `Modals/__tests__/TemplatesModal.test.tsx` (flakiness posible, timeout 20 s).

### 8.5.4. `SavedMapsModal` — biblioteca de mapas

- Recarga `getSavedMapsIndex()` en `useEffect(isOpen)`; header con contador + botón **"Crear Nuevo"** (`onNewMap` + cierra).
- Fila: título + sufijo **"(Actual)"** si `id === currentMapId`, `updatedAt.toLocaleString()`, `nodeCount || 1` nodos; clic en fila → `loadMapById` → `App:663-667` `pushHistory` + `setMindMap` + selecciona raíz.
- **Eliminar**: solo en filas que **no** son la actual, con **`confirm()` nativo del navegador** (no hay modal propio); tras borrar refresca la lista (`deleteMapById` + `setMapsList`). Estado vacío: "No tienes mapas guardados todavía."
- `onNewMap` (`App:668-677`): `pushHistory` + `BLANK_MAP` con id/fechas nuevas + selecciona `'root'`.
- Sin renombrar ni reordenar (el índice lo ordena `storage.ts`).

### 8.5.5. `ConnectorModal` — crear conector

- `if (!fromNode) return null` **antes** del backdrop: sin nodo origen no pinta nada (cerrarlo = `setConnectorSourceId(null)`).
- Candidatos a destino: **todos los nodos salvo el origen** (incluye raíz y descendientes — no hay anti-ciclo: es un conector visual, no jerárquico).
- Campos y defaults: **Destino** (select `required`, placeholder "Selecciona el nodo destino") · **Etiqueta** (texto, `trim() || undefined`) · rejilla 2 col: **Forma** (curved/bezier/straight/step → "Curva Orgánica/Bézier Suave/Línea Recta/Ortogonal") + **Capa** (above/below) · **Curvatura** slider **-200..200 step 5** en px (default **-50**, **oculto si `shape === 'straight'`**) · **Opacidad** slider 0.1..1 step 0.05 (default 1, muestra %) · rejilla 2 col: **Estilo** (solid/dashed/**dotted**, default **`dashed`**) + **Color** (input nativo + hex, default `#3b82f6`).
- Submit (disabled sin destino) → `{ id: conn-Date.now, arrow: 'end', width: 2, ...}`; `App:685-692` `pushHistory` + push en `mindMap.connectors`.
- **🐛 Gotchas**: (a) **`arrow` y `width` son fijos** en el modelo pero **no tienen UI**; (b) el componente **siempre está montado** (`App:680-693`): destino/etiqueta/estilo elegidos **persisten** y reaparecen rellenados al crear un segundo conector.

### 8.5.6. `IconPackModal` — galería completa (500+ iconos)

- `if (!isOpen) return null`; header badge `{TOTAL_VECTOR_ICONS_COUNT} Iconos`; barra de estado solo si `selectedNodeId` (texto del nodo + "(n iconos activos)" + hint, oculto `<sm`).
- **Sidebar** `w-56 sm:w-64` "Categorías": etiqueta **"12 grupos" hardcodeada**; "Todos los Iconos" con total + 12 botones con emoji (`CATEGORY_EMOJIS`) y **conteo en vivo** (`VECTOR_ICON_PACK.filter(...)` por render).
- **Main**: buscador con `autoFocus` (nombre/tag/id, `X` de limpiar) + chip contador; **8 quick tags** (mismos que IconsTab pero con distinto estilo **y toggle**: `searchQuery === st.query ? '' : st.query`); header de categoría (emoji + nombre + descripción, `hidden md:grid`) + "N mostrados"; grid **`grid-cols-3 sm:4 md:6 lg:8 xl:10`** (sin `slice` → pinta todo el pack); estado vacío con "Mostrar todos los 500+ iconos".
- **Tile**: clic → `setPreviewIcon` + **si hay `selectedNodeId` hace `onToggleIcon`** (añade/quita del nodo; sin selección solo previsualiza) · `onMouseEnter` → preview · badge `Check` si el icono está en el nodo · nombre + id.
- **Footer**: inspector (preview grande, nombre, `id` en código, "Etiquetas: …") o texto de ayuda; botones **"Copiar ID"** + "Listo".
- **🐛 Gotchas**: (a) **"Copiar ID" no copia el id ni el path real** — `handleCopySvgCode` copia un *stub* `<svg …><!-- nombre (id) --></svg>` **sin geometría** (título "Copiar referencia SVG"); (b) imports muertos: `X, Plus, Trash2, Download`; (c) textos "500+ iconos" hardcodeados en varios sitios vs `TOTAL_VECTOR_ICONS_COUNT`.

### 8.5.7. `ComingSoonModal` — ✅ eliminado (2026-10-17)

- **Historial**: el modal era **huérfano** — `onShowComingSoon` (único escritor de `comingSoonModalData`) **nadie lo invocaba** (MenuBar/ToolBar lo recibían como prop y no lo usaban); `onStartClassic` que **App no pasaba**; y su contenido ("Próximamente" los modos elaborate/dynamic) era **factualmente obsoleto** porque los 3 modos de presentación ya existen y son seleccionables (§10). 
- **Acción**: se **borró** `src/components/Modals/ComingSoonModal.tsx` y todo su cableado (`comingSoonModalData`, `onShowComingSoon` en MenuBar/ToolBar, el JSX en `App`, la referencia en `isAnyModalOpen`). Quedan **6 modales**.

---

## 9. Canvas, MiniMap, Outline

- Canvas: `#canvas-background relative flex-1 w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing`; viewport `#canvas-viewport absolute top-0 left-0 w-full h-full pointer-events-none` (`translate` 2D + escala; `will-change: transform` solo activo durante el vuelo de cámara `isCameraFlying` de 750ms y conmutado a `auto` al aterrizar para preservar nitidez vectorial nativa sin congelar texturas GPU en árboles grandes); SVG `absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none` con `shapeRendering: geometricPrecision`.
- MiniMap: `absolute bottom-2 right-5 z-40 flex flex-col items-end gap-1.5 select-none pointer-events-auto`; card `backdrop-blur-md hover:bg-white/90 p-1.5 rounded-2xl` tamaños `S w-44 h-24 / M w-56 h-32 / L w-72 h-44`, fondo `var(--sp-glass, rgba(255,255,255,0.65))` (token con fallback; real: claro `rgba(255,255,255,.65)` / oscuro `rgba(15,23,42,.65)` / sepia `rgba(247,239,220,.65)`, `index.css:15,27,40`), borde `rgba(226,232,240,0.85)`, sombra `0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)`, `opacity-85 hover:opacity-100`; título `text-[11px] font-bold text-[var(--sp-text)] uppercase tracking-wider` (oculto en `compact`, queda el icono Compass con tooltip); viewport `fill rgba(56,189,248,0.2) stroke #38bdf8 width 3 dash 6 3 rx 6`; nodos `rx 8/6/4 stroke #fff` (sel `#fbbf24`).
- ZoomControls y MiniMap son SIEMPRE claros (`bg-[var(--sp-bg)]`, cristal `var(--sp-glass)`): prohibidas las variantes `dark:` en controles flotantes; en sepia toman el tinte sepia del token.
- OutlineView: `aside` con ternario — fullscreen `flex-1 z-30` / normal `w-80 md:w-88 border-r border-[var(--sp-border)] shadow-xl z-20 shrink-0` — + base `bg-[var(--sp-bg)] flex flex-col h-full overflow-hidden transition-all select-none` (`OutlineView.tsx:344-350`); header `px-3.5 py-2.5 border-b border-slate-100 bg-[var(--sp-bg2)]`; fila `flex items-start gap-1.5 py-1.5 pr-2.5 border-l-2`, sel `bg-blue-50/90 border-blue-600 text-blue-950 font-medium shadow-2xs`, hover `hover:bg-[var(--sp-hover)]` (token, no `slate-50`); bullet `w-2 h-2 rounded-full`, raíz `ring-2 ring-blue-300`; footer `px-3 py-2 border-t border-slate-100 bg-[var(--sp-bg2)] text-[10px] text-slate-400`.

### Contrato funcional de OutlineView (`OutlineView.tsx`, 463 líneas)

- **Cabecera**: "Panel de Esquema" + badge con el **total de nodos** (`Object.keys`) + subtítulo "Jerarquía y vista outline"; 5 acciones: **Buscar** (toggle; al ocultar limpia la query), **Desplegar todas** (`FolderOpen` → `onUnfoldAll`), **Plegar todas** (`FolderClosed` → `onFoldAll`), **Maximizar/Reducir** (`Maximize2`/`Minimize2` → `onToggleFullscreen`) y **Ocular** (`PanelLeftClose`, hint "Alt+O").
- **Búsqueda interna** (no confundir con el FilterBar global `useSearchFilter`): case-insensitive por **substring** en `text`, `body` y `tags` (useMemo `matchedNodeIds`, `OutlineView.tsx:101-122`); añade los **ancestros** al set para conservar el camino jerárquico; filtra el renderizado (los no matcheados devuelven `null`) y resalta la fila match con `bg-amber-50/80 border-amber-400` — **la selección tiene prioridad** sobre el resaltado de búsqueda (el ternario evalúa `isSelected` primero). Fila de input `Filtrar por texto o #etiqueta...` con `X` de limpiar (la fila se pinta mientras `showSearch || searchQuery`).
- **Fila por nodo**: indent `depth*18+10`, chevron de plegado (solo con hijos; `folded` → `ChevronRight`), bullet del color del nodo (`node.color || #2563eb` raíz / `#64748b`, raíz con `ring-2 ring-blue-300`), iconos, badge de progreso (100% en verde esmeralda), título (la raíz **siempre** `font-bold text-[13px]`; en el resto bold/italic del nodo, color legible vía YIQ `getReadableOutlineTextColor` — colores claros caen al default `#1e293b` slate-800 / `#0f172a` slate-900 en raíz), subcuerpo `truncate` 11px, chips de tags `#tag`, indicadores de nota (`FileText`) y enlace (`ExternalLink` abre en nueva pestaña sin propagar), y acciones hover: **`+` hijo** y **`Trash2`** (oculto en la raíz, el veto es de UI).
- **Edición en línea**: doble clic → `input` **controlado por `node.text`** (cada tecla llama `onUpdateText` al store en vivo); `Enter` → cerrar + **añadir hermano**, `Tab` → cerrar + **añadir hijo**, `Esc` → cerrar, blur → cerrar.
- **Recursión**: los hijos se pintan solo si `!node.folded`; footer "Tab: hijo • Enter: hermano" / "Doble clic: editar".
- 🐛 **Gotchas**: (a) ✅ **`onUpdateBody` era prop fantasma** → **eliminada** el 2026-10-17 de la interfaz de `OutlineView` y de `App` (el body es solo lectura en el esquema); (b) **la búsqueda no despliega ramas plegadas**: un match dentro de una rama `folded` **no aparece** (el chequeo de plegado `OutlineView.tsx:334` corta antes de filtrar); (c) el hint "#etiqueta" es engañoso: los tags **no contienen `#`**, así que escribir "#fin" no matchea el tag "fin" (sí texto literal con #); (d) al editar, cada pulsación es un update al store (sin debounce propio); (e) **sin resultados el árbol queda vacío** (si nada matchea, ni siquiera la raíz entra al set — no hay mensaje de "sin coincidencias").

### Menú contextual del lienzo (clic derecho, `canvas/CanvasContextMenu.tsx`)

Verificado en `CanvasContextMenu.tsx` completo (250 líneas) + `MindMapCanvas.tsx:640-673`.

- **Apertura**: handler único `onContextMenu` en el wrapper del canvas (`MindMapCanvas.tsx:876`) — `preventDefault`, detecta el nodo con `target.closest('[id^="node-"]')` y, si lo hay, **lo selecciona**; posiciona con clamp al viewport (tamaño estimado **240×360 px**, margen 12 px: si se sale por la derecha/abajo, re-ancla). Estado `ContextMenuState { visible, x, y, nodeId }`, `fixed z-50`. Se cierra con cualquier click de ventana (`window click`) o al ejecutar cualquier item (`onClose()`).
- **Estilo (⚠️ siempre blanco)**: `bg-white/98 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-2xl py-1.5 min-w-56 max-h-[calc(100vh-24px)] overflow-y-auto text-xs text-slate-700 font-medium animate-in fade-in zoom-in-95 duration-100` — **no usa tokens `--sp-*`**: en tema oscuro/sepia **no se oscurece** (a diferencia de los dropdowns de MenuBar y los popovers de ToolBar). `onClick` con `stopPropagation`. Items hover `hover:bg-blue-50 hover:text-blue-600`, `kbd` de atajo a la derecha.
- **Con nodo — 11 items en 5 grupos** (separadores `my-1 border-t border-slate-100`):
  1. *Agregar Nodo Hijo* `Tab` (`Plus` azul) · *Agregar Nodo Hermano* `Enter` (`FolderPlus` verde) · *Editar Texto* `F2` (`Edit2` índigo)
  2. *Copiar Rama* `Ctrl+C` · *Cortar Rama* `Ctrl+X` · *Pegar como Hijo* `Ctrl+V` — **sin `disabled` aunque el portapapeles esté vacío** (el guard está en el store)
  3. *Crear Conector a otro nodo* (`Link` cian) · *Alternar Nube de Rama* (`Cloud` ámbar)
  4. *Aplicar Estilo a Hijos* (`GitFork`) · *Aplicar Estilo a Hermanos* (`MoveHorizontal`, **oculto en la raíz**, `nodeId !== rootId`)
  5. *Eliminar Nodo* `Supr` (rojo, **oculto en la raíz**)
- **Sin nodo (clic derecho en el fondo del lienzo)**: item único *Agregar Rama Principal* → `onAddChildNode(rootId)` (añade un hijo a la raíz, no edita la raíz).

---

## 10. Presentación (3 modos)

**Wiring** (verificado `App.tsx:100,176-185,278-287,421,591-613` + `components/templates/MainEditorLayout.tsx:39-65`; re-auditado 2026-10-17):

- `presentationType` es estado **local de App** (`useState<'classic' | 'dynamic' | 'elaborate'>('dynamic')`, `App:100`); `isPresentationMode` vive en el store Zustand.
- Lanzamiento: MenuBar y ToolBar llaman `onStartPresentation(mode)` (`App:176-185` y `:278-287`) = `setPresentationType(mode)` + `setIsPresentationMode(true)`. **F5** (`useKeyboardShortcuts.ts:53-55`, desde el store) solo hace **toggle** de `isPresentationMode` **sin tocar `presentationType`** → reabre el último modo elegido (default `dynamic`).
- `MainEditorLayout` oculta MenuBar/ToolBar/FilterBar/StatusBar/Outline/ToolPanel con `!isPresentationMode` y pinta `presentationOverlay` solo en presentación (:39-65). En ese slot: `PresentationMode` si `presentationType==='classic'` (`App:593-604`) o `ElaboratePresentationSystem` si `'elaborate'` (`App:606-612`). La dinámica **no usa el slot**: se activa dentro de `MindMapCanvas` (`isPresentationMode && presentationType === 'dynamic'`, `App:421`) y pinta su HUD interno; MiniMap/ZoomControls se ocultan (`MindMapCanvas:1543`).
- ✅ **Gotcha resuelto 2026-10-17**: el `ComingSoonModal.onStartClassic` (que abría el modo actual sin forzar `classic`) **ya no existe** — el modal y todo su cableado se eliminaron (§8.5.7). El arranque de presentación es siempre vía `onStartPresentation(mode)` en MenuBar/ToolBar, que sí fija `presentationType` antes de `setIsPresentationMode(true)` (`App:176-185, 278-287`).

### 10.1. Clásica (`PresentationMode`, 8 temas de slide)

- Contenedor `fixed inset-0 h-screen w-screen overflow-hidden z-50 flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200`, fondo/texto por `style` del tema activo (`:604-611`).
- **Header** (`h-10 flex items-center justify-between`, `:613-709`) en 2 clusters:
  - **Izquierda**: badge **"Modo Presentación Clásica"** (`Sparkles`; `px-3 py-1 rounded-full text-xs font-semibold shadow-2xs border` + `badgeBg` del tema, `:615-619`) + **badge de fase** `px-2.5 py-0.5 rounded-lg border text-xs font-bold` con icono y paginación "(Parte X/Y)": body → `BookOpen` **"Tema Principal"** (`bg-blue-50 border-blue-200 text-blue-700`), notes → `FileText` **"Notas del Tema"** (`amber`), children → `GitBranch` **"Subtemas"** (`cyan`) — variantes dark `bg-*-950/80` (`:622-653`).
  - **Derecha**: **"Volver"** (solo si `jumpHistory.length > 0`; icono **`CornerUpLeft`** — no `CornerLeftUp` — ámbar, `title` "…(Tecla Backspace)", `:658-671`) · **"Editar"** (`SlidersHorizontal`, alterna el modal, tecla `E`; abierto `bg-blue-600 text-white ring-2 ring-blue-400`, `:674-687`) · contador **`{currentIndex+1} / {slides.length}`** (`text-xs font-mono px-3 py-1.5 rounded-xl border`, **`hidden sm:inline`**, `:690-696`) · **`X`** salir (`title` "Salir de la presentación (Esc)", `:699-707`).
- **Main** `flex-1 min-h-0 w-full max-w-6xl mx-auto flex items-center justify-center p-2 sm:p-4`; imagen `overflow-hidden rounded-2xl shadow-2xl border` (`max-h-60 max-w-[420px]` medium).
- **Footer** (`max-w-4xl mx-auto w-full h-12`, `:1349-1428`) en 3 clusters:
  - **Izquierda**: *"Anterior"* (`ChevronLeft`, label `hidden sm:inline`, disabled en la slide 1) · *"Inicio: {padre}"* (`CornerLeftUp`, azul, **solo si `!isRoot`**, → `handleGoToParent`, `:1366-1381`).
  - **Centro**: **dots clicables por slide** (`slides.map` `:1386-1399`: activo `w-6 bg-blue-500`, resto `w-2`, salto directo con `setCurrentIndex(idx)`, contenedor `max-w-xs overflow-hidden`).
  - **Derecha**: **"Siguiente Tema"** (`ChevronsRight`, púrpura, → `handleGoToNextTopic`, disabled en la última) · **"Siguiente"** (`ChevronRight`, azul primario `bg-blue-600`, label `hidden sm:inline`).
- Temas (fondo / texto / acento): default `#f8fafc/#0f172a/#2563eb` · rainbow `#fff/#0f172a/#3b82f6` · dark `#0f172a/#f8fafc/#38bdf8` · forest `#f0fdf4/#064e3b/#059669` · sunset `#fffbeb/#431407/#ea580c` · minimal `#fafafa/#18181b/#27272a` · blueprint `#0a2540/#f0f9ff/#38bdf8` · honeycomb `#fffdf5/#78350f/#d97706`.

**Funcional** (verificado en `PresentationMode.tsx`, 1607 líneas):

- Genera `PresentationSlide[]` recorriendo el árbol en pre-order; **3 fases por nodo**: `body` (siempre) → `notes` (si `showNotes` y hay nota) → `children` (si `showChildrenCards` y hay hijos, **máx. 6 tarjetas** por slide con `MAX_CHILDREN_PER_SLIDE`, auto-paginado "(Parte X/Y)"). **Auto-paginación sin scrollbars**: cuerpo ~6 líneas/450 chars (con imagen 4/280) y notas 9 líneas/550 chars vía `splitBodyTextIntoSlideChunks`/`splitMarkdownIntoSlideChunks`; contraste de texto garantizado por `getContrastSafeColor`.
- **Render por fases** (JSX `:1004-1346`): `body` → **breadcrumb del padre clicable** (texto + "→", salta con `handleJumpToNode`), iconos `scale-125`, **layout en grid 12 cols** si hay imagen + cuerpo (imagen `md:col-span-5` / texto `md:col-span-7`) o en columna, `h1` con `getHeadingSizeClass()` (`text-3xl sm:text-5xl md:text-6xl` normal · `text-4xl/6xl/7xl` large · `text-2xl sm:text-4xl` compact — `:592-602`) y color raíz = `currentTheme.accentClass`, cuerpo `getContrastSafeColor` con bold/italic del nodo, chips de **progreso** ("Progreso: n%", azul) y **tags** `#t`. `notes` → barra de contexto (miniatura `w-9 h-9`, primer icono, título truncado, badge amber "Notas (X de Y)" / "Notas del Tema") + card con `MarkdownView isDark`. `children` → barra "Exploración de Subtemas" + badge "Subtemas (a-b de n)", **grid `grid-cols-1 sm:2 md:3 gap-3.5`** de tarjetas clicables (icono o punto azul, cuerpo `line-clamp-2`, chip "Nota adjunta") y, si `showConnectorsCards`, bloque **"Enlaces y Conectores (n)"** con **`relatedConnectors.slice(0, 3)`** (máx. 3) — tarjetas "Hacia ➔"/"Desde ⬅" que saltan al nodo destino (`:1294-1343`).
- **Saltos entre nodos**: clic en tarjeta de subtema/conector → `handleJumpToNode` (preferencia a la slide `phase:'body'` del nodo) con **pila `jumpHistory`** y botón **"Volver"** (solo visible si hay historial; también **`Backspace`** con la condición `(altKey || !shiftKey)`, `:524`); `handleGoToParent` salta al padre y `handleGoToNextTopic` (`:489-514`) salta al **siguiente hermano** o, si no hay, a la próxima slide `body` de un nodo distinto (fallback `handleNext`).
- **Radar minimapa** (`showMiniMap`): **centro SUPERIOR** (`fixed top-2 left-1/2 -translate-x-1/2 z-40`, `:1430-1432`) — ⚠️ **el label del toggle en el modal dice "MiniMapa en Esquina Inferior"** (`:905`), es engañoso; card translúcida (`bg-white/50 opacity-80` claro / `bg-black/45 opacity-75` oscuro, `backdrop-blur-md`), SVG con **`computeMindMapLayout`** (estado local del modo, no confundir con el MiniMap del editor): aristas bezier `strokeOpacity 0.4`, nodos con tamaños mínimos por profundidad (40/28/20 × 22/16/12), nodo actual con **doble halo `animate-ping`/`animate-pulse`** + pin rojo + relleno blanco, **clic en cualquier nodo salta** (`handleJumpToNode`), y chip con el título del nodo activo (`:1594-1600`).
- **Modal "Opciones del Modo Presentación"** (tecla **`E`** o botón `SlidersHorizontal` de la barra; `PresentationMode.tsx:712-1002`): 8 opciones en estado local — tema (los **8** `PRESENTATION_THEMES` definidos **inline** en `PresentationMode.tsx:54-159`, mismos ids/nombres que §2: Clásico Azul, Arcoíris Vibrante, Modo Oscuro, Bosque Esmeralda, Atardecer Cálido, Minimalista Mono, Plano Técnico Blueprint, Panal Creativo — **no existe `presentationThemes.ts`**), notas ON/OFF, tamaño de imágenes (small/medium/large/**hidden**), tarjetas de hijos ON/OFF, conexiones cruzadas ON/OFF, **radar minimapa** ON/OFF (:915), alineación centro/izquierda, escala de título compact/normal/large. Footer: **"Editar en Lienzo"** → `onEditNode` (cierra la presentación, selecciona el nodo y abre el ToolPanel, `App:597-601`) y "Aplicar y Ver Diapositiva" (solo cierra). El `themeId` inicial se toma de `mindMap.themeId` al montar (:308).
- Navegación: `→`/`Enter` siguiente, `←` anterior, **`Backspace`** → "Volver" (con historial), **`E`** alterna el modal, `Esc` (modal→cierra modal; si no→sale); **acotada, sin wrap** (`handleNext/Prev` acotan en `:453-463`); guard de `INPUT`/`TEXTAREA` (`:520-522`) y los **dots del footer** permiten salto directo a cualquier slide.
- 🐛 **Gotchas**: (a) **`onUpdateNode` es prop muerta** — se declara en la interfaz (`:180`) y **App la pasa** (`App:602`), pero el componente **no la desestructura** (`:302-306`) ni la usa; (b) **4 imports muertos**: `ArrowUpRight` (:21), `MapPin`, `Eye`, `EyeOff` (:25-27); (c) el **label "MiniMapa en Esquina Inferior"** del modal no coincide con la posición real (centro superior, ver arriba); (d) `getContrastSafeColor` (`:268-300`) solo whitelist-ea **6 hex claros y 6 oscuros** fijos — cualquier otro color "medio" pasa tal cual y puede quedar con poco contraste.
- 🐛→✅ **Bug corregido 2026-10-17**: **Espacio no avanzaba** en la clásica — el handler comparaba `e.key === 'Space'` (`PresentationMode.tsx:530`) pero el valor real de `KeyboardEvent.key` es `' '`; en dinámica (§10.2) y elaborate (§10.3) ya estaba correcto. Fix: `'Space'` → `' '`. Test: `__tests__/PresentationMode.test.tsx` (Espacio, Enter, ←, Esc).

### 10.2. Dinámica (HUD de marcos sobre el lienzo, `canvas/CanvasPresentationHUD.tsx`)

Verificado en `CanvasPresentationHUD.tsx` (489 líneas) + wiring en `MindMapCanvas.tsx` (1506-1540).

- **Marcos**: `slides = mindMap.presentationSlides ?? generateDefaultPresentationSlides(map, layoutMap)` (`MindMapCanvas:188-193`); cada edición → `onUpdateMindMap({...mindMap, presentationSlides})` (:211) — **persisten en el mapa**. Undo/Redo **propios** con `undoStack`/`redoStack` locales (:201-244, profundidad máx. **25** con `slice(-25)` en `updateSlides`; botones del HUD y `Ctrl+Z`/`Ctrl+Shift+Z`/`Ctrl+Y`) — **no** pasan por el historial del store.
- **Generador** (`utils/presentationGenerator.ts`, 212 líneas): overview `🗺️ Visión General` (bounds del mapa + pad 120) → raíz `🎯` (pad 24) → por cada rama principal `📌` (bounds del **subárbol** + pad 32) → sus hijos `•` (pad 24, `type: 'branch'|'node'`, color fallback `#6366f1`); **solo 2 niveles** de profundidad. Cada nodo visitado por el generador (raíz, rama e hijo) con nota inserta de inmediato una slide `📝 Nota:` (`type:'note'`, `#f59e0b`, `showNotes:true`).
- **Top bar** `h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800`: badge "Presentación Dinámica" (azul) + título del mapa; **Mode Switcher** "Editor de Marcos" (azul) / "Presentar (F5)" (emerald); a la derecha (solo editor): Undo/Redo (disabled con stacks vacíos; titles `"Deshacer (Ctrl+Z)"` / `"Rehacer (Ctrl+Y / Ctrl+Shift+Z)"`), **"Empezar de Cero"** (rojo: borra todos los marcos + índice + staged, **sin confirmación**; title "Empezar desde cero (Eliminar todos los marcos)", `:160`), **"Auto-generar"** (vuelve a ejecutar el generador; title "Generar marcos según la jerarquía"; label `hidden sm:inline`, `:175-179`) y `X` "Salir (ESC)" (title "Salir de la presentación (ESC)", `:188`).
- **Pill de herramientas** (editor, `top-16`) precedido del label **"Crear marco:"** (`:200`) y en **orden DOM** — ⚠️ antes el doc los listaba al revés: `pick_nodes` **"1. Seleccionar Nodo (Crear Marco)"** (azul + hint pulsante "Haz clic en cualquier nodo para crear un marco automáticamente") → `draw_frame` **"2. Dibujar Recuadro"** (indigo; arrastre sobre el lienzo, `MindMapCanvas:478+`; cursor crosshair :867-869) → `navigate` **"Navegar / Mover"** (emerald) (`:200-234`). Clic en nodo con `pick_nodes` → crea marco `slide-node-{id}-{ts}` `type:'node'` pad 28 (`color: node.color || '#3b82f6'`, `showNotes: Boolean(note)`); **si ya existe** un marco `type:'node'` de ese nodo, **navega al existente** (:1410-1414). Selección múltiple staged → contador "N seleccionados" + **"Crear Marco"** (`type:'custom_area'`, id `slide-custom-{ts}`, bounds min/max + pad 30, mín. 160×100, `color:'#3b82f6'`) + `X` vaciar (`title` "Deseleccionar todos", `:295`). Banner vacío (`top-28`): h4 **"Lienzo en Blanco (0 marcos)"** + texto "Haz clic en los nodos con **1. Seleccionar Nodos** para agruparlos o arrastra sobre el lienzo con **2. Dibujar Recuadro** para crear tu primera diapositiva" (`:313-315`).
- **Notas del orador**: cajón flotante `top-20 right-6 sm:right-10 w-84 sm:w-96 max-h-[70vh]` (borde amber, glow) con `MarkdownView isDark`; prioridad del contenido: nota del **nodo activo** → del `nodeId` del marco → primer `nodeIds` con nota (IIFE `:323-340`, sin contenido no se renderiza). El botón `FileText` **solo se pinta si `activeNode?.note`** (:464); el atajo `N` (:380-382) alterna el estado del cajón aunque el cajón no se pinte sin contenido.
- **Bottom HUD**: línea de progreso azul con glow; **filmstrip** horizontal (chips `#orden` + título truncado 130px; en editor y con `>1` marcos, `Trash2` en hover elimina y renumera); barra `h-12`: contador `N / M` + título del marco activo · `Anterior` (←/Retroceso; title "Anterior (← o Retroceso)", `:435`) · **Overview** `Compass` (O/Home, alterna; `title` **"Vista General (O / Home)"** ↔ **"Volver al foco"**, `:444`) · **Siguiente** (azul, →/Espacio; title "Siguiente (→ o Espacio)", `:455`) · grupo derecha: Notas (title "Notas del Orador (N)", `:468`) + toggle filmstrip (`Layers`, title "Tira de Diapositivas", `:479`).
- **Capa de marcos del editor** (`canvas/CanvasDrawingOverlay.tsx`, 94 líneas; montada solo en editor, `MindMapCanvas:1492-1503`; raíz `#canvas-drawing-overlay-plane absolute inset-0 pointer-events-none`): por cada slide pinta un rectángulo `absolute rounded-3xl border-2` posicionado con `translate3d(bounds)` — **seleccionado** (`z-30`): `border-blue-400 bg-blue-500/10 shadow-[0_0_35px_rgba(59,130,246,0.3)] ring-2 ring-blue-400/50`; **resto** (`z-15`): `border-dashed border-slate-500/40 bg-slate-800/5` (`:41-45`). Todo el rect es `pointer-events-none` → **los nodos debajo siempre son clicables**. **Badge "Slide {order}"** (`-top-3.5 px-2.5 py-0.5 rounded-full text-[10px]`, `:48-70`): offset horizontal **escalonado** `16 + ((order−1)%4)×32` px (marcos cercanos no solapan badges); **clic = enfocar ese marco** (`onSelectSlide`, `pointer-events-auto` + `hover:scale-105`), pero **`pointer-events-none` en modo dibujar** (no interfiere con el arrastre, `:51,57-59`); añade `• {title}` (`max-w-[140px] truncate`) si el marco está seleccionado **o** hay **≤8 marcos** (`:67-69`); badge activo `bg-blue-600 scale-105 ring-2 ring-white/60 z-40`, resto `bg-slate-800/90 border-slate-700 z-20`. **Caja en curso** (solo `draw_frame` mientras se arrastra, `:76-91`): rect `rounded-2xl border-2 border-blue-400 border-dashed bg-blue-500/20` con glow, esquina = mínimos de start/current y badge `Crop` **"Nuevo marco (W × H)"** en vivo (`Math.round(|Δx|×|Δy|)`).
- **Teclado en presentación** (`MindMapCanvas:352-394`, inactivo en INPUT/TEXTAREA): `Ctrl+Z`/`Ctrl+Shift+Z`/`Ctrl+Y` (marcos), `→`/`Espacio`/`Enter` siguiente, `←`/`Retroceso` anterior, `O`/`Home` overview, `N` notas, **`E` alterna editor/play**, `Esc` sale. Cámara: `flyCameraToBounds` al cambiar de slide (:269-307) con transición `750ms cubic-bezier(0.25,1,0.5,1)` (:885); los nodos fuera del marco activo se atenúan (`isHighlighted` :1373-1382: opacity 0.18, transición 400ms); la **capa de marcos** solo se pinta en editor (:1492-1503) — contrato visual en el bullet **"Capa de marcos del editor"** de arriba.

### 10.3. Elaborada (Prezi espacial, `components/Presentation/`)

4 ficheros: `ElaboratePresentationSystem.tsx` (786), `SpatialSlideCardComponent.tsx` (373), `SlideDetailModal.tsx` (277) y `utils/spatialPresentationGenerator.ts` (495).

- **Persistencia**: `slides = mindMap.elaborateSlides ?? generateDefaultSpatialSlides(map, 'spiral')` (estado local; `saveSlides` → `onUpdateMindMap` con `elaborateSlides`). 🐛 **Gotcha**: `App:610` hace `setMindMap` **directo (sin `pushHistory`)** y el sistema **no tiene undo propio** — a diferencia de la dinámica (§10.2), editar tarjetas no es deshacible.
- **Top bar** (`h-14 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800`, `:384-504`) en 3 zonas: **izquierda** badge gradiente **"Presentación Elaborada (Prezi Espacial)"** (`from-purple-600 to-indigo-600` + `Sparkles`) y **título del mapa** (`text-sm truncate max-w-xs sm:max-w-md`); **centro** mode switcher (`bg-slate-800/80 rounded-xl border`) **"Editor del Lienzo"** (`Sliders`, activo `bg-indigo-600`) ↔ **"Presentar (F5)"** (`Play fill-current`, activo `bg-emerald-600`), ambos resetean `isOverviewActive` (`:396-421`); **derecha**: **solo en editor** (`!isPresenterMode`, `:425-494`) **"Acomodar:"** (`hidden md:flex`, 5 estrategias) + **"Nueva Tarjeta"** (azul `bg-blue-600 active:scale-95`), y **siempre** el **`X` "Salir al Mapa Mental (ESC)"** (`:496-502`). Estado: `isPresenterMode` **default `false`** (`:51`).
- **Cámara** (`camPan`, `camZoom` inicial 0.65, `camRotation`): wheel ×1.1/0.9 (clamp 0.15–3.0, desactivado en presentador), botones flotantes `bottom-20 left-4` (**solo `!isPresenterMode`**, `:640-664`) — ZoomIn `Math.min(z*1.2, 3.0)` / ZoomOut `Math.max(z*0.8, 0.15)` / `Compass` "Ver todo el tablero (O)"; viewport `translate3d + scale + rotate` con transición `750ms cubic-bezier(0.25,1,0.5,1)` (sin transición mientras se arrastra). `flyCameraToSlide`: zoom para ajustar 82%/78% del viewport (clamp 0.25–2.5) con **rotación inversa** de la tarjeta; `flyToOverview`: bbox global + pad 180 (clamp 0.15–1.2, rotación 0).
- **Teclado global** (:182-226; **sin guard de INPUT/TEXTAREA**, con guard `editingCardId`): `F5` alterna presentador, `Esc` (presentador→editor; editor→salir), `→`/`Espacio`/`PageDown` y `←`/`Retroceso`/`PageUp` (con wrap), `O`/`Home` overview.
- **Editor**: pan con clic izq/medio en el fondo; transformaciones por tarjeta arrastrando los handles: **rotar** (knob superior `RotateCw`, grados normalizados 0-360 con +90), **mover** (pill inferior "Mover (x, y) • N°") y **escalar** (4 esquinas, factor 0.4–3.0 a 2 decimales) — todo compensando la rotación de cámara; se persiste en `mouseup`. Hover de tarjeta: **Editar** (doble clic también → `SlideDetailModal`), **Duplicar** (+80,+80, inserta tras la original) y **Eliminar**; **"Nueva Tarjeta"** (top bar, solo editor) crea `spatial-custom-{ts}` 720×440 a `x+800` y abre su editor. **"Acomodar:"** (top bar, solo editor, `hidden md:flex`): **Espiral / Constelación / Matriz / Randómico / En Pila (Mazo)** — regeneran todo el tablero (`saveSlides` + índice 0 + overview).
- **Presentador**: spotlight (activa z-60 opaca con glow `rgba(59,130,246,.5)` + ring blue-400, resto `opacity 0.2` z-10); **trayectoria de vuelo** SVG con curvas Q (punto medio -80) y gradiente `#8b5cf6 → #3b82f6 → #ec4899` (stroke 4, dash 8 8, glow violeta); en presentador **se ocultan** los botones de zoom flotantes (`:640`) y los controles de editor del top bar (`:425-494`).
- **Bottom HUD común** (`:668-769`, `bg-slate-900/95 backdrop-blur-md border-t border-slate-800`) en 3 filas: (1) **línea de progreso** `h-1` `from-purple-500 to-blue-500` con glow `shadow-[0_0_10px_rgba(139,92,246,0.8)]` (`width` % de la slide activa, `:670-677`); (2) **filmstrip** (`isFilmstripOpen` **default `true`**, `:54`) **abierto por defecto en ambos modos** con chips `rounded-xl border` (activo `bg-blue-600/30 border-blue-500 text-white font-bold shadow-md`, resto `bg-slate-800/60 border-slate-700/60`) = badge `#orden` + `title` `max-w-[130px] truncate` (**sin `Trash2`**), el clic hace `setSelectedSlideId` + `flyCameraToSlide` (`:680-707`); (3) **barra `h-12`** en 3 grupos: **izquierda** contador **`{i+1} / {total}`** (`font-mono text-white`) + `• {título del slide}` (`hidden sm:inline`, `:711-715`) · **centro** *"Anterior"* (`ChevronLeft`, **con wrap** `prev>0 ? prev-1 : len-1`), **`Compass` conmutador de overview** (activo `bg-blue-600 text-white`; `title` alterna **"Volver al foco" ↔ "Vista Panorámica (O)"**, `:730-745`) y **"Siguiente"** (`bg-gradient-to-r from-blue-600 to-indigo-600`, **con wrap** `prev<len-1 ? prev+1 : 0`, `:747-757`) · **derecha** **toggle de filmstrip `Layers`** ("Mostrar/Ocultar Tira de Diapositivas", `:761-767`). ⚠️ A diferencia de §10.2, **no hay botón de Notas (N)**.
- **Tarjeta** (`SpatialSlideCardComponent`): `absolute rounded-3xl p-6`, transform `translate3d+rotate+scale` (origen centro); fondo = tema del mapa (raíz = `order===1`: contenido centrado, borde `#2563eb` 3px) o `card.style`: **gradiente** (radial/to-r/to-b/to-br, fallback color2 `#1e293b`) o **patrón** CSS/SVG data-URI (dots/squares/stripes/**hexagons**; size 24, opacidad 0.45, color `#94a3b8`, helper hex→rgba); cabecera badge `#orden` + tags (`slice(0,2)`); cuerpo: imagen opcional (`max-h-40`), iconos (`renderNodeIcon`), título `text-2xl font-black`, `bodyText`, `subItems` en rejilla 2 col **`slice(0,6)`** con punto de color; slide `isNoteSlide` → cabecera amber "Nota Detallada" + `MarkdownView isDark` (max-h 320); pie "Nota del Orador (Ver diapositiva siguiente)" si hay `notesMarkdown`.
- **Editor de detalle** (`SlideDetailModal`): overlay `fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-in fade-in` (`:67`); card `bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl animate-in zoom-in-95` (`:69`); **header** (`:73-86`) con badge **`Slide #{order}`** (`bg-blue-600 rounded-full font-extrabold text-xs`) + h2 fijo **"Editar Diapositiva (Estilo Clásico)"** + botón `X`; formulario scrollable (`p-6 overflow-y-auto space-y-5`): título, cuerpo, **notas markdown con vista previa en vivo** ("Vista Previa:", `:138`), URL de imagen, alineación izquierda/centro, los **8 temas** (grid con dot `rootBg`), **"Rotación Espacial"** (slider -180..180, `:226`) y **"Escala de Tarjeta"** (0.5–2.5 step 0.05, `:240`); footer **"Cancelar" / "Guardar Cambios"** (`:263,271`). 🐛 Nota: el `contentAlign` por defecto del modal es **`'left'`** (`card.style?.contentAlign || 'left'`, `:37`). "Guardar Cambios" sincroniza `title` + `content.titleText` y vacía a `undefined` lo que quede en blanco. 🐛 Gotcha: los `useState` están **después de** `if (!isOpen) return null` (:30-39) — violación latente de rules-of-hooks, inocua hoy porque solo monta con `editingCardId` (la capa modal bloquea el acceso directo a otras tarjetas).
- **Generador** (`spatialPresentationGenerator.ts`): todas las estrategias generan tarjetas de **720×440**; por cada nodo con nota añade además una tarjeta `📝 Nota:` (`isNoteSlide`, borde `#f59e0b`, escala ~×0.95 — varía por estrategia: ×0.95 en espiral/pila/matriz, ×0.9 en randómico y ×0.8-1.1 en constelación —, icono `file-text`); `content` se copia del nodo (título `|| 'Sin Título'`/cuerpo/nota/imagen `imageSize:'medium'` fijo/`icons`/`tags`/`progress`/`subItems` = hijos directos id/text/color) y `style` copia color/borde/gradiente/patrón del nodo (`contentAlign:'center'` solo en raíz):
  - **Espiral** (default): recorrido DFS completo **sin límite de nodos**, paso 0.48 rad, radio +180/tarjeta, raíz escala 1.3 en el origen, resto con rotación creciente ×0.45 y escala `1.05 − idx×0.015` (mín 0.85).
  - **Constelación**: raíz central escala 1.4; **solo 2 niveles**: ramas principales en órbita r=1200 (rotación radial −90°) y subramas en r=1950 con ángulo ±0.22 por índice — 🐛 **los descendientes más profundos no reciben tarjeta**.
  - **Matriz**: 3 columnas, separación 880×580, rotación alternante `±4°×(idx%3)`.
  - **Randómico**: **determinista** (LCG con semilla 42 — siempre el mismo "aleatorio"), distancia 350–1750, rotación ±30°, escala 0.85–1.2.
  - **En Pila (Mazo)**: offsets cíclicos `(idx%7−3)×16`, `(idx%5−2)×14`, rotación hasta ±14°, raíz 1.2.
- 🐛 Imports muertos en `ElaboratePresentationSystem.tsx`: `RotateCcw, Trash2, Maximize2, Palette, FileText` (:14-23).

---

## 10.5. Atajos de teclado y layouts del lienzo

**Atajos** (no se duplica la tabla canónica: la lista completa y verificada está en `INTERFACE_SPEC.md` §3.6):

- Hook `useKeyboardShortcuts` (`src/hooks/`, 221 líneas) enganchado en `App:128-131`, **directo al store Zustand**.
- Guardas en orden: escribiendo en `INPUT`/`TEXTAREA` → **solo `Esc`** (blur + sale de edición); modal abierto → **solo `Esc`** (`onCloseModals`); **`F5`** → toggle de `isPresentationMode` (se evalúa antes de la guarda de presentación); **en presentación** el resto de atajos queda inactivo — la navegación propia vive en cada modo: clásica §10.1 (Espacio/Enter/←, `E`, `Backspace`), dinámica §10.2 (`→`/`Espacio`/`Enter`, `O`, `N`, `E`), elaborate §10.3 (`PageUp`/`PageDown`, `O`).
- Hints decorativos sin handler (`Ctrl+S`, `?`) y atajos inexistentes del spec viejo: listados en `INTERFACE_SPEC` §3.6.

**Layouts del lienzo** (9 ids, `LayoutType` en `types/mindmap.ts:17-26`): `standard`, `balanced-horizontal`, `left`, `right`, `top`, `bottom`, `tree-down`, `radial`, `circular` — nombres amables en `INTERFACE_SPEC` §8.

- Motor: `computeMindMapLayout(map, canvasCenter)` en `utils/layoutEngine.ts` (1940 líneas): `estimateNodeSize` (§6) + colocación según lado/layout + **`resolveLayoutCollisions` con `MAX_PASSES = 32`** (:1378) que además empuja nodos fuera de nubes (`cloudGap = 16`, :1450).
- Gaps por defecto: `HORIZONTAL_GAP = 54`, `VERTICAL_GAP = 14`, `ROOT_HORIZONTAL_GAP = 68` (:3-5), sobrescribibles por mapa (`mindMap.horizontalGap`/`verticalGap`, sección §8 "Espaciado del Mapa").
- Nubes: el tamaño del nodo se infla con `cloudPad = 36` (:338,410) y el gap hacia hijos también suma 36. Nodos `isFreeFloating` usan su `freePosition` (fallback `canvasCenter +200/−150`, :595).
- ✅ **Gotcha corregido 2026-10-17 (el layout SÍ tiene UI)**: la sección **"Diseño del Árbol (Layout)"** de la pestaña **Mapa** (ThemeTab, §8 punto 2) ofrece los **9 layouts** con `onUpdateMapLayout` **cableado de punta a punta** (`App.tsx:456` → `ToolPanel.tsx:37,240` → `ThemeTab.tsx:36,76,208-214`; tests `ThemeTab.test.tsx` y `ToolPanel.test.tsx`). La afirmación previa de esta sección ("no existe UI para cambiar el layout — nunca la hubo") era **falsa**: el grep original solo buscaba `onChangeLayout` (la prop muerta del ToolBar, §7) y no `onUpdateMapLayout`. Lo que **no existe** es un selector de layout en el **ToolBar**. Además del panel, el layout también cambia vía plantillas, importación `.mm` o edición directa del JSON en `localStorage`.

---

## 11. Reglas para futuras implementaciones

1. **Reutiliza átomos.** Nada de botones/inputs/badges/modales ad-hoc: `Button` (6 variantes, 4 tamaños), `IconButton`, `Badge` (7 pasteles), `Input`, `ModalBackdrop+ModalHeader`. Un modal nuevo = `ModalBackdrop` + card `rounded-2xl shadow-2xl` + `maxWidth` según contenido (md contenido simple, xl formularios, 4xl–5xl galerías).
2. **Azul = primario/activo.** `blue-600` acción principal, `blue-50/100` estado activo/seleccionado, `blue-500` focos (`focus:border-blue-500`, `focus:ring-blue-500/20`). Peligro `rose-600`, éxito/offline `emerald`, avisos/notas `amber`, info secundaria `cyan/indigo`.
3. **Tema UI por tokens, no clases fijas.** Claro/oscuro/sepia se gobiernan con tokens (`--chrome-bar`/`--chrome-toolbar` en las 4 barras; `--sp-bg/bg2/hover/glass/pop/text/muted/border/input` en superficies) aplicados en `<html>` vía `data-theme` + clase `.dark` (solo oscuro) — §7 "Temas de interfaz UI". La variante `dark:` existe por clase (`@custom-variant` en `index.css`), no por SO, y se usa como complemento puntual. **NO escribas fondos fijos (`bg-slate-900`, `bg-white`) en MenuBar/ToolBar/FilterBar/StatusBar/ToolPanel/OutlineView/MiniMap/ZoomControls** — rompen sepia y oscuro. Excepción: MiniMap y ZoomControls son siempre "claros" pero vía tokens (§9).
4. **Densidad compacta.** Paneles `text-xs`, micro-datos `text-[10px]–[11px]` (mono para valores), `space-y-2.5`–`space-y-5` en secciones, `p-2`–`p-4` en cards. No uses `text-base` fuera de botones `lg` o slides.
5. **Iconos Lucide, no emojis.** Iconos `w-3.5 h-3.5` en botones, `w-10 h-10 rounded-xl` en headers de modal. Color de icono `text-slate-400`, hover al color del contexto.
6. **Los nodos mandan.** Cualquier cambio en `NodeComponent` debe respetar: estados (normal / hover / seleccionado `ring-3 blue-500` / match `amber` / staged presentación), formas inline por `shape`, y no romper `NodeBackgroundRenderer` (SVG) ni la edición inline (`border-blue-500`).
7. **Canvas por capas.** Nuevo overlay del canvas = capa absoluta `pointer-events-none` salvo controles interactivos, `z-40` HUD / `z-50` menús, y respeta el viewport `translate3d+scale`.
8. **Temas por tokens, no hardcode.** Colores de mapa desde `THEMES`/`BACKGROUND_PRESET_THEMES` en `themes.ts`; fondos con patrón vía clases `.bg-grid-*` o presets. No inventes paletas fuera del sistema.
9. **Transiciones cortas.** Interacciones `duration-150` (`transition-all`), nodos con la curva de `index.css`, viewport de presentación `750ms cubic-bezier(0.25,1,0.5,1)`. Nada de animaciones largas salvo `animate-pulse/bounce` en staged.
10. **Responsive mínimo.** Barras con `sm:` (`px-2 sm:px-3`, textos `text-[10px] sm:text-xs`); tooltips con `max-w` escalado; modales `p-4` + `max-h-[90vh] overflow-y-auto`.
