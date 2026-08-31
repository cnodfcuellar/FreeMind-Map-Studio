# 🏗️ Plan de Refactorización — FreeMind Map Studio (Atomic Design)

## Contexto y Problema

El proyecto FreeMind Map Studio es una aplicación web React con **~1.09 MB de código fuente** que funciona correctamente pero presenta una deuda técnica severa debido a archivos monolíticos:

| Archivo | Líneas | Tamaño | Problema |
|---------|--------|--------|----------|
| [ToolPanel.tsx](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/src/components/ToolPanel.tsx) | 5,600 | 330 KB | **6 pestañas (content/format/notes/icons/clouds/theme)** en un solo archivo |
| [App.tsx](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/src/App.tsx) | 1,329 | 46 KB | "God Component" — estado global, handlers, teclado, render en uno |
| [MindMapCanvas.tsx](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/src/components/MindMapCanvas.tsx) | 1,366 | 55 KB | Pan/Zoom, SVG edges, Drag&Drop, menú contextual, MiniMap |
| [PresentationMode.tsx](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/src/components/PresentationMode.tsx) | 1,214 | 52 KB | 7 temas, generador de slides, paginación, modal config |
| [layoutEngine.ts](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/src/utils/layoutEngine.ts) | 1,835 | 65 KB | 9 algoritmos de layout, edge paths, cloud bounds |
| [NodeComponent.tsx](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/src/components/NodeComponent.tsx) | 839 | 32 KB | 10 formas, fondos, imágenes, tags, edición inline |

**Objetivo:** Refactorizar aplicando **Atomic Design** sin perder funcionalidades, estilos, opciones ni elementos.

---

## Principios de Atomic Design Aplicados

```
┌─────────────────────────────────────────────────────────────────────┐
│  Átomo      → Botones, inputs, sliders, color pickers, badges      │
│  Molécula   → Grupo de formato, selector de forma, barra de tags   │
│  Organismo  → Pestaña completa (ContentTab, FormatTab, CloudTab)   │
│  Template   → Layout de panel (tabs + contenido + header)          │
│  Página     → App.tsx (orquestador con hooks)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## User Review Required

> [!IMPORTANT]
> **Impacto en el rendimiento de desarrollo:** Durante la refactorización la app debe seguir funcionando en cada paso. Cada fase produce un entregable testeable.

> [!WARNING]
> **El ToolPanel.tsx (330 KB) se dividirá en ~40+ archivos.** Esto es necesario pero cambiará dramáticamente la estructura de directorios. ¿Estás de acuerdo con esta granularidad?

> [!IMPORTANT]
> **Sin nuevas dependencias.** No se añadirá ningún gestor de estado externo (Zustand, Redux, etc.). Se usarán **custom hooks** nativos de React y **Context API** donde sea necesario. ¿Es aceptable o prefieres añadir Zustand?

---

## Open Questions

1. ¿Deseas que el motor de layout (`layoutEngine.ts`) se divida por algoritmo (ej. `layouts/radial.ts`, `layouts/standard.ts`) o prefieres mantenerlo consolidado?
2. ¿Hay funcionalidades en desarrollo activo que podrían entrar en conflicto con la refactorización (branches paralelos)?
3. ¿Quieres que el `PresentationMode.tsx` se divida en subcomponentes o prefieres dejarlo como está por ahora?

---

## Propuesta de Estructura Final (Post-Refactorización)

```
src/
├── App.tsx                          ← Reducido a ~200 líneas (orquestador)
├── main.tsx
├── index.css
│
├── types/
│   └── mindmap.ts                   ← Sin cambios
│
├── hooks/                           ← [NEW] Custom Hooks extraídos de App.tsx
│   ├── useMindMapState.ts           ← Estado del mapa + CRUD de nodos
│   ├── useHistory.ts                ← Undo/Redo (pushHistory, handleUndo, handleRedo)
│   ├── useClipboard.ts              ← Copy/Cut/Paste subtrees
│   ├── useKeyboardShortcuts.ts      ← Listener global de teclado
│   ├── useNodeStylePropagation.ts   ← Aplicar estilo a hijos/hermanos
│   ├── useSearchFilter.ts           ← Filtro y búsqueda (searchMatches, availableTags)
│   └── useModalManager.ts           ← Estado de apertura/cierre de todos los modales
│
├── components/
│   ├── atoms/                       ← [NEW] Componentes atómicos reutilizables
│   │   ├── ColorPicker.tsx          ← Input de color con presets
│   │   ├── ColorPresetGrid.tsx      ← Grid de presets de color
│   │   ├── SliderInput.tsx          ← Slider con label y valor
│   │   ├── ToggleButton.tsx         ← Botón toggle (on/off)
│   │   ├── ToggleButtonGroup.tsx    ← Grupo de toggle buttons mutuamente exclusivos
│   │   ├── IconButton.tsx           ← Botón con icono
│   │   ├── TextInput.tsx            ← Input de texto estilizado
│   │   ├── TextareaInput.tsx        ← Textarea estilizado
│   │   ├── SelectDropdown.tsx       ← Select estilizado
│   │   ├── Badge.tsx                ← Badge/chip para tags
│   │   ├── Tooltip.tsx              ← Tooltip hover
│   │   └── SectionHeader.tsx        ← Header colapsable de sección
│   │
│   ├── molecules/                   ← [NEW] Combinaciones de átomos
│   │   ├── FontFormatToolbar.tsx    ← Bold/Italic/Alignment agrupados
│   │   ├── FontPicker.tsx           ← Font family + size + color
│   │   ├── ShapeSelector.tsx        ← Grid de selección de formas
│   │   ├── EdgeStyleSelector.tsx    ← Selector de estilo de arista
│   │   ├── EdgeProfileSelector.tsx  ← Selector de perfil de arista
│   │   ├── PatternSelector.tsx      ← Selector de patrón de relleno
│   │   ├── GradientPicker.tsx       ← Selector de gradiente (2 colores + dirección)
│   │   ├── ImageUploader.tsx        ← Upload + preview de imagen (URL/file)
│   │   ├── TagManager.tsx           ← Input para añadir/eliminar tags
│   │   ├── ProgressSlider.tsx       ← Slider de progreso 0-100%
│   │   ├── LinkInput.tsx            ← Input de URL con preview
│   │   ├── CollapsibleSection.tsx   ← Sección colapsable genérica (acordeón)
│   │   ├── BackgroundTypePicker.tsx ← Selector: color/transparente/gradiente/patrón
│   │   └── CloudShapeSelector.tsx   ← Grid de selección de forma de nube
│   │
│   ├── organisms/                   ← [NEW] Pestañas completas del ToolPanel
│   │   ├── toolpanel/
│   │   │   ├── ToolPanelHeader.tsx  ← Header con título y botón cerrar
│   │   │   ├── ToolPanelTabs.tsx    ← Barra de pestañas (content/format/notes/icons/clouds/theme)
│   │   │   ├── ContentTab.tsx       ← Pestaña "Texto & Contenido" (líneas 497–1254)
│   │   │   │   ├── TitleSection.tsx      ← Sección: Título del Nodo
│   │   │   │   ├── BodySection.tsx       ← Sección: Cuerpo / Subtexto
│   │   │   │   ├── ImageSection.tsx      ← Sección: Imagen adjunta
│   │   │   │   └── MetadataSection.tsx   ← Sección: Tags, Progreso, Link, Visibility
│   │   │   ├── FormatTab.tsx        ← Pestaña "Estilos & Forma" (líneas 1255–2417)
│   │   │   │   ├── ShapeFormatSection.tsx     ← Forma + dimensiones
│   │   │   │   ├── BackgroundFormatSection.tsx ← Fondo del nodo
│   │   │   │   ├── BorderFormatSection.tsx    ← Bordes y contorno
│   │   │   │   └── EdgeFormatSection.tsx      ← Aristas del nodo (override)
│   │   │   ├── NotesTab.tsx         ← Pestaña "Notas" (líneas 2418–2634)
│   │   │   ├── IconsTab.tsx         ← Pestaña "Iconos" (líneas 2635–2941)
│   │   │   ├── CloudsTab.tsx        ← Pestaña "Nubes" (líneas 2942–3716)
│   │   │   │   ├── CloudShapeSection.tsx
│   │   │   │   ├── CloudFillSection.tsx
│   │   │   │   └── CloudBorderSection.tsx
│   │   │   └── ThemeTab.tsx         ← Pestaña "Mapa" (líneas 3717–5600)
│   │   │       ├── BackgroundMapSection.tsx    ← Fondo del lienzo
│   │   │       ├── ThemeMapSection.tsx         ← Tema del mapa
│   │   │       ├── EdgeMapSection.tsx          ← Aristas globales
│   │   │       ├── ConnectorMapSection.tsx     ← Conectores cruzados
│   │   │       ├── GapsMapSection.tsx          ← Espaciado horizontal/vertical
│   │   │       └── LayoutMapSection.tsx        ← Algoritmo de layout
│   │   │
│   │   ├── canvas/                  ← [NEW] Subcomponentes del Canvas
│   │   │   ├── CanvasBackground.tsx       ← Fondo con patrón
│   │   │   ├── CanvasEdges.tsx            ← SVG de aristas del árbol
│   │   │   ├── CanvasRibbonEdges.tsx      ← SVG de aristas ribbon
│   │   │   ├── CanvasClouds.tsx           ← SVG de nubes
│   │   │   ├── CanvasConnectors.tsx       ← SVG de conectores cruzados
│   │   │   ├── CanvasContextMenu.tsx      ← Menú contextual (clic derecho)
│   │   │   └── CanvasZoomControls.tsx     ← Controles de zoom (+/−/fit/center)
│   │   │
│   │   └── presentation/           ← [NEW] Subcomponentes de Presentación
│   │       ├── PresentationSlide.tsx       ← Diapositiva individual
│   │       ├── PresentationControls.tsx    ← Controles de navegación
│   │       ├── PresentationConfig.tsx      ← Modal de configuración
│   │       └── presentationThemes.ts       ← Datos de los 7 temas
│   │
│   ├── templates/                   ← [NEW] Layouts/Templates
│   │   ├── AppLayout.tsx            ← Layout principal (MenuBar + Toolbar + Canvas + Panels)
│   │   └── ToolPanelLayout.tsx      ← Template del panel (header + tabs + contenido)
│   │
│   ├── MenuBar.tsx                  ← Se mantiene (25 KB, aceptable)
│   ├── ToolBar.tsx                  ← Se mantiene (29 KB, aceptable)
│   ├── ToolPanel.tsx                ← REEMPLAZADO por ToolPanelLayout + organismos
│   ├── MindMapCanvas.tsx            ← Reducido: delega a canvas/* subcomponentes
│   ├── NodeComponent.tsx            ← Se mantiene (32 KB, aceptable con mejoras menores)
│   ├── PresentationMode.tsx         ← Reducido: delega a presentation/* subcomponentes
│   ├── FilterBar.tsx                ← Se mantiene (4 KB, ok)
│   ├── MiniMap.tsx                  ← Se mantiene (18 KB, aceptable)
│   ├── OutlineView.tsx              ← Se mantiene (17 KB, aceptable)
│   ├── StatusBar.tsx                ← Se mantiene (2 KB, ok)
│   │
│   └── Modals/                      ← Se mantienen sin cambios
│       ├── ComingSoonModal.tsx
│       ├── ConnectorModal.tsx
│       ├── ExportImportModal.tsx
│       ├── IconPackModal.tsx
│       ├── SavedMapsModal.tsx
│       ├── ShortcutsModal.tsx
│       └── TemplatesModal.tsx
│
└── utils/                           ← Refactorización del motor de layout
    ├── layoutEngine.ts              ← Se mantiene (con posible split futuro)
    ├── layouts/                     ← [OPCIONAL] Split por algoritmo
    │   ├── standard.ts
    │   ├── radial.ts
    │   ├── circular.ts
    │   └── tree.ts
    ├── connectorUtils.ts
    ├── freeplaneConverter.ts
    ├── htmlExporter.ts
    ├── markdownRenderer.tsx
    ├── storage.ts
    ├── themes.ts
    ├── sampleMaps.ts
    ├── additionalTemplates.ts
    ├── templateIllustrations.ts
    ├── iconMap.tsx
    └── vectorIconPack.tsx
```

---

## Fases de Implementación

### 📋 FASE 0 — Preparación y Baseline (Pre-requisito)

**Objetivo:** Establecer una línea base de calidad antes de cualquier cambio.

#### Acciones:
1. **Crear snapshot de la app funcional** — Compilar (`vite build`) y verificar que no hay errores.
2. **Documentar los tests de referencia** — Capturar el comportamiento actual (funcionalidades, props).
3. **Crear la estructura de directorios vacía** (`hooks/`, `atoms/`, `molecules/`, `organisms/`, `templates/`).

#### Criterios de Evaluación:
| # | Criterio | Método de verificación |
|---|----------|----------------------|
| 0.1 | `npm run build` compila sin errores | Log de consola |
| 0.2 | `npm run dev` arranca sin errores | Servidor accesible en localhost:3000 |
| 0.3 | Directorios nuevos creados | `ls -R src/` |

---

### 📋 FASE 1 — Extracción de Átomos y Moléculas (UI Primitivos)

**Objetivo:** Extraer los componentes de UI repetidos en ToolPanel.tsx en componentes reutilizables.

> [!NOTE]
> Esta fase NO modifica el ToolPanel todavía. Solo crea los nuevos componentes y los exporta. El ToolPanel los usará en fases posteriores.

#### Archivos nuevos:
- **Átomos (13):** `ColorPicker`, `ColorPresetGrid`, `SliderInput`, `ToggleButton`, `ToggleButtonGroup`, `IconButton`, `TextInput`, `TextareaInput`, `SelectDropdown`, `Badge`, `Tooltip`, `SectionHeader`
- **Moléculas (14):** `FontFormatToolbar`, `FontPicker`, `ShapeSelector`, `EdgeStyleSelector`, `EdgeProfileSelector`, `PatternSelector`, `GradientPicker`, `ImageUploader`, `TagManager`, `ProgressSlider`, `LinkInput`, `CollapsibleSection`, `BackgroundTypePicker`, `CloudShapeSelector`

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 1.1 | Cada átomo/molécula exporta un componente React funcional | Revisión de imports |
| 1.2 | Cada componente acepta props tipadas con TypeScript | `npm run lint` sin errores |
| 1.3 | Los estilos son idénticos a los actuales en ToolPanel | Comparación visual pixel-a-pixel |
| 1.4 | `npm run build` sigue compilando sin errores | Log de consola |
| 1.5 | La app sigue funcionando idénticamente | Test manual en navegador |

---

### 📋 FASE 2 — Descomposición del ToolPanel en Organismos (Pestañas)

**Objetivo:** Dividir las 5,600 líneas de `ToolPanel.tsx` en 6 pestañas independientes + subsecciones.

#### Pasos detallados:

##### 2A — Extraer `ContentTab.tsx` (líneas 497–1254, ~757 líneas)
Subdivisión interna:
- `TitleSection.tsx` — Título del nodo + formato tipográfico
- `BodySection.tsx` — Cuerpo/subtexto + formato tipográfico
- `ImageSection.tsx` — Imagen de contenido + imagen de fondo
- `MetadataSection.tsx` — Tags, progreso, enlace, visibility toggles

##### 2B — Extraer `FormatTab.tsx` (líneas 1255–2417, ~1,162 líneas)
Subdivisión interna:
- `ShapeFormatSection.tsx` — Forma geométrica + dimensiones (width/height sliders)
- `BackgroundFormatSection.tsx` — Tipo de fondo (color/transparente/gradiente/patrón/imagen)
- `BorderFormatSection.tsx` — Color, grosor, estilo de borde
- `EdgeFormatSection.tsx` — Override de arista por nodo + botones "aplicar a hijos/hermanos"

##### 2C — Extraer `NotesTab.tsx` (líneas 2418–2634, ~216 líneas)
Componente autocontenido con el editor Markdown, toolbar de formateo y preview split-view.

##### 2D — Extraer `IconsTab.tsx` (líneas 2635–2941, ~306 líneas)
Componente con búsqueda, categorías, grid de iconos vectoriales y "quick search tags".

##### 2E — Extraer `CloudsTab.tsx` (líneas 2942–3716, ~774 líneas)
Subdivisión interna:
- `CloudShapeSection.tsx` — Forma + dimensiones (padding X/Y)
- `CloudFillSection.tsx` — Color/gradiente/patrón/imagen de fondo de la nube
- `CloudBorderSection.tsx` — Borde de la nube (color, grosor, estilo, sombra)

##### 2F — Extraer `ThemeTab.tsx` (líneas 3717–5600, ~1,883 líneas)
Subdivisión interna:
- `BackgroundMapSection.tsx` — Fondo del lienzo (presets + personalización)
- `ThemeMapSection.tsx` — Selector de tema
- `EdgeMapSection.tsx` — Aristas globales (estilo, perfil, grosor, color, dash)
- `ConnectorMapSection.tsx` — Lista de conectores + edición inline
- `GapsMapSection.tsx` — Espaciado horizontal/vertical
- `LayoutMapSection.tsx` — Algoritmo de layout

##### 2G — Crear `ToolPanelLayout.tsx` (Template)
Reemplazar el `ToolPanel.tsx` monolítico por un componente ligero (~100 líneas) que:
1. Renderiza el header (`ToolPanelHeader`)
2. Renderiza la barra de tabs (`ToolPanelTabs`)
3. Renderiza el contenido de la pestaña activa (switch/case a los organismos)

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 2.1 | `ToolPanel.tsx` original eliminado y reemplazado | Verificar que no existe el archivo de 5,600 líneas |
| 2.2 | Nuevo `ToolPanel.tsx` tiene < 200 líneas | `wc -l` |
| 2.3 | Cada pestaña extraída tiene < 400 líneas | `wc -l` en cada archivo |
| 2.4 | Las props de `ToolPanelProps` se mantienen idénticas | Diff de interface |
| 2.5 | Todas las funcionalidades de cada pestaña operan igual | Test manual sección por sección |
| 2.6 | `npm run build` compila sin errores | Log de consola |
| 2.7 | No hay regresión visual | Comparación visual en navegador |
| 2.8 | Los iconos de lucide-react se importan solo donde se usan | Grep de imports |

---

### 📋 FASE 3 — Extracción de Custom Hooks desde App.tsx

**Objetivo:** Reducir `App.tsx` de ~1,329 líneas a ~200–300 líneas extrayendo la lógica en hooks reutilizables.

#### Hooks a crear:

##### `useMindMapState.ts`
- Estado: `mindMap`, `setMindMap`
- Funciones: `updateNode`, `handleAddChild`, `handleAddSibling`, `handleDeleteNode`, `handleToggleFold`, `handleFoldAll`, `handleUnfoldAll`, `handleReparentNode`
- **Líneas fuente:** App.tsx L38–L371

##### `useHistory.ts`
- Estado: `historyPast`, `historyFuture`
- Funciones: `pushHistory`, `handleUndo`, `handleRedo`
- **Líneas fuente:** App.tsx L40–L105

##### `useClipboard.ts`
- Estado: `clipboard`
- Funciones: `handleCopyNode`, `handleCutNode`, `handlePasteNode`
- **Líneas fuente:** App.tsx L374–L457

##### `useNodeStylePropagation.ts`
- Funciones: `extractNodeStyleBundle`, `handleApplyStyleToChildren`, `handleApplyStyleToSiblings`
- **Líneas fuente:** App.tsx L459–L562

##### `useKeyboardShortcuts.ts`
- El `useEffect` con `addEventListener('keydown', ...)` completo
- **Líneas fuente:** App.tsx L564–L761

##### `useSearchFilter.ts`
- Estado: `filterOptions`
- Computed: `searchMatches`, `availableTags`
- **Líneas fuente:** App.tsx L53–L58, L763–L800

##### `useModalManager.ts`
- Estado: `isExportModalOpen`, `isShortcutsModalOpen`, `isTemplatesModalOpen`, `isSavedMapsModalOpen`, `isIconPackModalOpen`, `connectorSourceId`, `comingSoonModalData`
- **Líneas fuente:** App.tsx L63–L69

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 3.1 | `App.tsx` tiene < 350 líneas | `wc -l` |
| 3.2 | Cada hook tiene tipo de retorno bien definido | `npm run lint` |
| 3.3 | Undo/Redo sigue funcionando (40 estados) | Test: crear 5 nodos, Ctrl+Z×5, Ctrl+Y×5 |
| 3.4 | Copy/Cut/Paste sigue funcionando | Test: copiar subtree, pegar, verificar IDs únicos |
| 3.5 | Todos los atajos de teclado responden igual | Test de cada atajo documentado |
| 3.6 | Filtro de búsqueda funciona | Test: escribir texto, filtrar por tag, por progreso |
| 3.7 | Auto-guardado en localStorage sigue activo | Test: editar, refrescar, verificar persistencia |
| 3.8 | `npm run build` compila sin errores | Log de consola |

---

### 📋 FASE 4 — Descomposición del MindMapCanvas

**Objetivo:** Separar las responsabilidades del canvas en subcomponentes especializados.

#### Subcomponentes:
- `CanvasBackground.tsx` — Renderizado del fondo con patrón (SVG/CSS)
- `CanvasEdges.tsx` — SVG de todas las aristas del árbol (bezier/linear/sharp/horizontal)
- `CanvasRibbonEdges.tsx` — SVG de aristas con perfil ribbon (tapered/spindle/hourglass)
- `CanvasClouds.tsx` — SVG de nubes de agrupación
- `CanvasConnectors.tsx` — SVG de conectores cruzados flotantes
- `CanvasContextMenu.tsx` — Menú contextual (clic derecho)
- `CanvasZoomControls.tsx` — Botones de zoom (+/−/fit/center)

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 4.1 | `MindMapCanvas.tsx` tiene < 500 líneas | `wc -l` |
| 4.2 | Pan & Zoom siguen funcionando | Test: scroll, arrastrar lienzo |
| 4.3 | Drag & Drop de nodos funciona (con protección anti-ciclo) | Test: arrastrar nodo a otro padre |
| 4.4 | Menú contextual muestra todas las opciones | Test: clic derecho en nodo |
| 4.5 | Las aristas se renderizan correctamente en los 5 estilos | Test visual por estilo |
| 4.6 | Las nubes se renderizan correctamente | Test: activar nube en un nodo |
| 4.7 | Los conectores cruzados se renderizan | Test: crear conector entre 2 nodos |
| 4.8 | `npm run build` compila sin errores | Log de consola |

---

### 📋 FASE 5 — Refactorización del PresentationMode

**Objetivo:** Separar el modo presentación en subcomponentes manejables.

#### Subcomponentes:
- `presentationThemes.ts` — Datos de los 7 temas de presentación (extraer de PresentationMode.tsx L35–L115)
- `PresentationSlide.tsx` — Renderizado de una diapositiva individual (fase 1, 2 y 3)
- `PresentationControls.tsx` — Controles de navegación (anterior/siguiente/escape/volver)
- `PresentationConfig.tsx` — Modal de configuración (tema, layout, contraste)

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 5.1 | `PresentationMode.tsx` tiene < 400 líneas | `wc -l` |
| 5.2 | Los 7 temas de presentación se renderizan correctamente | Test visual por tema |
| 5.3 | La paginación automática de cuerpo extenso funciona | Test: nodo con texto largo |
| 5.4 | La paginación de notas Markdown funciona | Test: nodo con nota larga |
| 5.5 | Las 3 fases se generan en orden correcto | Test: nodo con cuerpo + nota + hijos |
| 5.6 | El jump history funciona (clic en card → backspace para volver) | Test manual |
| 5.7 | `npm run build` compila sin errores | Log de consola |

---

### 📋 FASE 6 — Integración de Moléculas en los Organismos

**Objetivo:** Reemplazar el JSX inline en los organismos (ContentTab, FormatTab, etc.) por las moléculas creadas en Fase 1.

#### Acciones:
1. Reemplazar los selectores de color inline por `<ColorPicker>` y `<ColorPresetGrid>`
2. Reemplazar los sliders inline por `<SliderInput>`
3. Reemplazar las barras de formato (Bold/Italic/Align) por `<FontFormatToolbar>`
4. Reemplazar los selectores de forma por `<ShapeSelector>`
5. Reemplazar las secciones colapsables genéricas por `<CollapsibleSection>`
6. Reemplazar los uploaders de imagen por `<ImageUploader>`
7. Reemplazar los gestores de tags por `<TagManager>`

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 6.1 | No hay JSX de color picker inline en ningún organismo | Grep por `<input type="color"` |
| 6.2 | No hay JSX de slider inline repetido | Grep por patrones de slider |
| 6.3 | Cada organismo importa al menos 3 moléculas/átomos | Revisión de imports |
| 6.4 | Las interacciones (onChange, onClick) siguen funcionando | Test manual completo |
| 6.5 | `npm run build` compila sin errores | Log de consola |

---

### 📋 FASE 7 — Auditoría Final y Pulido

**Objetivo:** Verificar que todo funciona correctamente, limpiar imports no usados y documentar.

#### Acciones:
1. Ejecutar `npm run lint` y corregir todos los errores
2. Eliminar imports no utilizados
3. Verificar que no queden archivos huérfanos
4. Actualizar `README.md` con la nueva estructura
5. Actualizar `PROJECT_ARCHITECTURE.md`
6. Crear el documento `CHANGELOG.md` con el registro completo de cambios

#### Criterios de Evaluación:
| # | Criterio | Método |
|---|----------|--------|
| 7.1 | `npm run lint` sin errores | Log de consola |
| 7.2 | `npm run build` sin errores ni warnings | Log de consola |
| 7.3 | Ningún archivo en `src/` supera 500 líneas | Script de verificación |
| 7.4 | Todas las funcionalidades del README funcionan | Test manual exhaustivo |
| 7.5 | `CHANGELOG.md` documenta cada cambio realizado | Revisión del documento |
| 7.6 | La app funciona idénticamente a la versión original | Comparación visual |

---

## Documento de Evaluación y Confirmación por Fase

Se creará un archivo `REFACTORING_EVALUATION.md` que se actualizará al completar cada fase:

```markdown
# Evaluación de Refactorización

## Fase X — [Nombre]
### Estado: ✅ COMPLETADA / 🔄 EN PROGRESO / ❌ FALLIDA

| # | Criterio | Resultado | Evidencia |
|---|----------|-----------|-----------|
| X.1 | [criterio] | ✅ PASS / ❌ FAIL | [evidencia] |
| X.2 | [criterio] | ✅ PASS / ❌ FAIL | [evidencia] |

### Incidencias encontradas:
- [ninguna / descripción del problema y cómo se resolvió]

### Aprobación: ✅ Aprobada para avanzar a Fase X+1
```

---

## Registro de Cambios (CHANGELOG)

Se creará un archivo `CHANGELOG.md` en la raíz del proyecto con el siguiente formato:

```markdown
# Registro de Cambios — Refactorización Atomic Design

## [Fase X] — YYYY-MM-DD

### Archivos creados:
| Archivo | Propósito | Líneas de origen |
|---------|-----------|-----------------|
| `src/hooks/useHistory.ts` | Hook de Undo/Redo | App.tsx L40–L105 |

### Archivos modificados:
| Archivo | Qué se cambió | Motivo |
|---------|---------------|--------|
| `src/App.tsx` | Eliminada lógica de Undo/Redo | Extraída a useHistory.ts |

### Archivos eliminados:
| Archivo | Motivo |
|---------|--------|
| — | — |

### Verificación:
- [x] Build exitoso
- [x] Lint sin errores
- [x] Test manual pasado
```

---

## Verificación Plan

### Automated Tests
- `npm run build` — Verifica que TypeScript compila sin errores después de cada fase
- `npm run lint` — Verifica que no hay errores de tipado (ejecutar con `tsc --noEmit`)

### Manual Verification
- Test funcional de cada feature mencionada en el README
- Comparación visual pixel-a-pixel de la interfaz antes/después
- Test de todos los atajos de teclado documentados
- Test de exportación/importación en todos los formatos (.mm, .html, .svg, .png, .md, .json)
- Test del modo presentación con los 7 temas
- Test de los 9 algoritmos de layout
- Test de los 12 fondos de lienzo

---

## Resumen de Impacto

| Métrica | Antes | Después |
|---------|-------|---------|
| Archivo más grande | 5,600 líneas (ToolPanel) | < 400 líneas |
| Archivos en `src/components/` | 17 | ~55 |
| Archivos en `src/hooks/` | 0 | 7 |
| Líneas de `App.tsx` | 1,329 | ~250 |
| Componentes reutilizables | 0 | ~27 (átomos + moléculas) |
| Tiempo estimado de ejecución | — | 6–8 horas |
