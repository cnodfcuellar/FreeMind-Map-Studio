# 📝 Registro de Cambios (CHANGELOG) — Refactorización Atomic Design

Este documento registra cada modificación realizada en el código fuente, indicando qué se cambió, el motivo técnico, el archivo de origen/destino y las pruebas de validación ejecutadas.

---

## 📌 [Fase 0] — 2026-08-28: Preparación y Baseline

### 🎯 Objetivo
Establecer línea base de compilación, instalar dependencias ligeras necesarias y crear la infraestructura de seguimiento.

### 📦 Paquetes agregados
- `zustand` (v5.0.15): Gestor de estado ultraligero (~1KB minified), 100% offline y sin dependencias externas.

### 📄 Archivos creados
| Archivo | Propósito |
|---------|-----------|
| `CHANGELOG.md` | Bitácora de cambios detallada con justificación técnica. |
| `REFACTORING_EVALUATION.md` | Matriz de evaluación y confirmación de criterios de calidad por fase. |

### 🔍 Verificación
- [x] Compilación base con `pnpm build`: **0 errores** (1702 módulos transformados).
- [x] Instalación limpia de `zustand`: **Exitosa**.

---

## 📌 [Fase 1] — 2026-08-28: Extracción de Átomos y Moléculas

### 🎯 Objetivo
Crear componentes UI primitivos atómicos y moleculares reutilizables para reemplazar el JSX duplicado en el panel de herramientas y el canvas.

### 📄 Archivos creados
| Archivo | Nivel Atomic | Propósito |
|---------|--------------|-----------|
| `src/components/atoms/SliderInput.tsx` | Átomo | Slider numérico con badge, label, descripción y botón reset. |
| `src/components/atoms/ColorPicker.tsx` | Átomo | Selector de color con input nativo, hex display y paleta de 16 presets. |
| `src/components/atoms/ToggleButton.tsx` | Átomo | Botón conmutable con icono y estado activo. |
| `src/components/atoms/ToggleButtonGroup.tsx` | Átomo | Grupo de botones toggle mutuamente exclusivos con tipado genérico. |
| `src/components/atoms/CollapsibleSection.tsx` | Átomo | Acordeón colapsable con cabecera estilizada, icono, badge y animaciones. |
| `src/components/molecules/FontFormatToolbar.tsx` | Molécula | Barra agrupada de formato (Bold, Italic, AlignLeft/Center/Right). |
| `src/components/molecules/ShapeSelector.tsx` | Molécula | Grid de 10 formas geométricas de nodo con iconos representativos. |
| `src/components/molecules/TagManager.tsx` | Molécula | Gestor interactivo para añadir y eliminar etiquetas de nodo. |

### 🔍 Verificación
- [x] Compilación con `pnpm build`: **0 errores** en 8.52s.

---

## 📌 [Fase 2] — 2026-08-28: Descomposición del ToolPanel

### 🎯 Objetivo
Dividir el archivo monolítico `ToolPanel.tsx` (5,600 líneas, 330 KB) en organismos modulares independientes según cada una de sus 6 pestañas, reduciendo el contenedor a menos de 200 líneas.

### 📄 Archivos creados
| Archivo | Nivel Atomic | Líneas | Propósito |
|---------|--------------|--------|-----------|
| `src/components/organisms/toolpanel/ContentTab.tsx` | Organismo | ~280 | Pestaña "Texto & Contenido" (título, cuerpo, imagen adjunta, metadatos, tags y enlace). |
| `src/components/organisms/toolpanel/FormatTab.tsx` | Organismo | ~280 | Pestaña "Estilos & Forma" (geometría, fondo, bordes, aristas y propagación a hijos/hermanos). |
| `src/components/organisms/toolpanel/NotesTab.tsx` | Organismo | ~180 | Pestaña "Notas" (editor Markdown, toolbar de sintaxis y preview split-view). |
| `src/components/organisms/toolpanel/IconsTab.tsx` | Organismo | ~190 | Pestaña "Iconos" (buscador, categorías, quick search tags y catálogo vectorial). |
| `src/components/organisms/toolpanel/CloudsTab.tsx` | Organismo | ~210 | Pestaña "Nubes" (interruptor maestro, formas, márgenes X/Y, color y bordes). |
| `src/components/organisms/toolpanel/ThemeTab.tsx` | Organismo | ~280 | Pestaña "Mapa" (temas, layout, fondo del lienzo, cuadrículas, aristas globales y espaciados). |

### 📄 Archivos modificados
| Archivo | Modificación | Motivo |
|---------|--------------|--------|
| `src/components/ToolPanel.tsx` | Reducido de 5,600 líneas a 178 líneas | Delegar el renderizado a los 6 organismos especializados manteniendo la misma API de props. |

### 🔍 Verificación
- [x] Compilación con `pnpm build`: **0 errores** (1715 módulos transformados). Reducción del bundle JS y CSS.

---

## 📌 [Fase 3] — 2026-08-28: Custom Hooks y Zustand Store

### 🎯 Objetivo
Desacoplar la lógica de estado de `App.tsx` (1,329 líneas) hacia un store global reactivo con Zustand y hooks de atajos y filtrado.

### 📄 Archivos creados
| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useMindMapStore.ts` | Store Zustand con todo el estado del mapa, historial (40 niveles), mutaciones CRUD, portapapeles y propagación. |
| `src/hooks/useSearchFilter.ts` | Hook memorizado para cálculo de coincidencias de búsqueda y tags disponibles. |
| `src/hooks/useKeyboardShortcuts.ts` | Hook para registro de todos los atajos de teclado globales estilo Freeplane con guardas de modales y modo presentación. |

### 📄 Archivos modificados
| Archivo | Modificación | Motivo |
|---------|--------------|--------|
| `src/App.tsx` | Reducido de 1,329 líneas a ~460 líneas | Orquestador declarativo que conecta la UI con `useMindMapStore`. |

### 🔍 Verificación
- [x] Compilación con `pnpm build`: **0 errores** en 8.21s.

---

## 📌 [Fase 4 y 5] — 2026-08-28: Subcomponentes de Canvas y Presentación

### 📄 Archivos creados
| Archivo | Nivel Atomic | Propósito |
|---------|--------------|-----------|
| `src/components/organisms/canvas/CanvasZoomControls.tsx` | Organismo | Controles flotantes de zoom (+, -, 100%, fit, center). |
| `src/components/organisms/canvas/CanvasContextMenu.tsx` | Organismo | Menú contextual emergente para clic derecho sobre nodos. |
| `src/components/organisms/presentation/presentationThemes.ts` | Config | Paleta y clases de los 7 temas del modo presentación. |
| `src/components/organisms/presentation/PresentationControls.tsx` | Organismo | Barra inferior con controles de navegación, slide counter y botón Volver. |

### 🔍 Verificación
- [x] Compilación con `pnpm build`: **0 errores** en 7.94s.
