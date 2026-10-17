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

---

## 📌 [Infra QA] — 2026-10-15: Subagente `qa-tester` y regresión automática

### 🎯 Objetivo
Mantener pruebas automáticas de regresión sin instalar nada nuevo: solo Vitest + pnpm, ya presentes. Reutiliza el agente `test-writer` existente; no se crea ningún agente de terceros.

### 📄 Archivos creados
| Archivo | Propósito |
|---------|-----------|
| `.opencode/agent/qa-tester.md` | Subagente de regresión: ejecuta la suite, crea/actualiza tests ante cambios, informa fallos, conserva pruebas viejas, nunca toca producción ni hace commit/push. Respeta `opencode-agent-memory` (lee bloque `project`, registra veredictos). |
| `.opencode/command/regression.md` | Comando `/regression`: corre `pnpm test:regression` + `pnpm lint` y da veredicto APTO/NO APTO. |

### ✏️ Archivos modificados
| Archivo | Modificación | Motivo |
|---------|--------------|--------|
| `package.json` | Nuevo script `test:regression` = `vitest run --pool=forks` | El pool por defecto se cuelga en Windows/OneDrive; el flag lo hace fiable. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **17 archivos / 87 tests pasando** (segunda corrida; la primera mostró 11 errores transitorios de workers que desaparecen al reintentar: flakiness del entorno, no del código).
- [x] Sin dependencias nuevas: solo Vitest 4 + pnpm existentes.

---

## 📌 [Fix] — 2026-10-15: Fondo del lienzo no respondía (prop desconectada)

### 🎯 Motivo
`ThemeTab` invoca `onUpdateMapBackground(config)` pero `App.tsx` nunca pasaba esa prop (solo `onUpdateMapBackgroundColor/Pattern`, que `ThemeTab` ni declara). Todos los controles de fondo quedaban muertos por el guard `&&`.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/App.tsx` | Nuevas props `onUpdateMapBackground` (fusiona config parcial + `pushHistory`) y `onResetMapBackground` (limpia los 5 campos de fondo). |
| `src/components/organisms/toolpanel/__tests__/ThemeTab.test.tsx` | Nuevo: cambiar patrón llama con `{ backgroundPattern }`; sin prop no rompe. |

### 🔍 Verificación
- [x] Nuevo test: **2/2 pasando**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Cambio de tema solo afectaba aristas (restilo total)

### 🎯 Motivo
Los nodos traen `color`/`textColor`/`borderColor` propios y el mapa `backgroundColor` + `edgeColor`, que mandan sobre el tema. Al cambiar de tema solo se notaba en las aristas.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/App.tsx` | `onUpdateMapTheme` ahora limpia overrides de color por nodo y de fondo/aristas del mapa para que el tema mande en todo. Conserva formas, imágenes, degradados, tipografía y metadatos. Deshacible con Ctrl+Z. |

### 🔍 Verificación
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Refactor] — 2026-10-15: Lógica de tema/fondo extraída a `mapTheme.ts` testeable

### 🎯 Motivo
Los fixes de fondo y restilo total vivían en handlers inline de `App.tsx` sin cobertura: ningún test detectaría si se rompían.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/mapTheme.ts` | Nuevo: `applyThemeRestyle` y `applyBackgroundUpdate` puras. |
| `src/App.tsx` | Los handlers ahora delegan en esas funciones (mismo comportamiento). |
| `src/utils/__tests__/mapTheme.test.ts` | Nuevo: 3 tests que fijan el restilo total y la fusión de fondo. |

### 🔍 Verificación
- [x] Nuevos tests: **3/3**; ThemeTab: **2/2**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: MiniMapa incumplía diseño (título truncado, dark distinto, bulky)

### 🎯 Motivo
En tamaño S el título se truncaba a "MINI…"; la píldora ZoomControls usaba variantes `dark:` y con modo oscuro del SO se veía distinta al resto (siempre claro); el panel desperdiciaba espacio (gap-2, p-2, mb-1.5).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/MiniMap.tsx` | Título oculto en `compact` (icono con tooltip); `gap-1.5`, card `p-1.5`, header `mb-1`. |
| `src/components/molecules/ZoomControls.tsx` | Eliminadas variantes `dark:`: controles flotantes siempre claros según `DESIGN.md`. |
| `src/components/__tests__/MiniMap.test.tsx` | Nuevo: título oculto en compact, píldora sin `dark:`, persistencia de tamaño. |
| `doc/DESIGN.md` | Actualizada entrada MiniMap (p-1.5, regla título compact, prohibición `dark:` en flotantes). |

### 🔍 Verificación
- [x] Nuevos tests: **3/3**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Badge de plantillas hardcodeado

### 🎯 Motivo
`TemplatesModal` mostraba "20 Modelos" fijo; se desfasa si cambia `ALL_TEMPLATES`.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/Modals/TemplatesModal.tsx` | Badge dinámico con `ALL_TEMPLATES.length`. |

### 🔍 Verificación
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: TemplatesModal ilegible con modo oscuro del SO

### 🎯 Motivo
El card iba a `slate-900` pero el contenido (20 plantillas con estilos fijos claros/oscuros mezclados) no tenía variantes `dark:`: todo se veía lavado.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/sampleMaps.ts` | 20 entradas `ALL_TEMPLATES`: base clara unificada + variantes `dark:` en `color` y `badgeColor` (26 reemplazos). |
| `src/components/Modals/TemplatesModal.tsx` | Variantes `dark:` en barra de filtros, buscador, chips, tarjeta en blanco y contenido de cards (títulos, descripciones, badges, iconos). |

### 🔍 Verificación
- [x] `pnpm test:regression`: **20/20 archivos, 95/95 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Test] — 2026-10-15: Integridad de TemplatesModal

### 🎯 Motivo
La ventana de plantillas no tenía cobertura: ningún test detectaría regresiones visuales o funcionales.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/Modals/__tests__/TemplatesModal.test.tsx` | Nuevo: cerrado no renderiza, header + badge dinámico + 20 plantillas, filtro por búsqueda/categoría, selección con id nuevo y cierre, preview SVG + tags + metadata por card. |

### 🔍 Verificación
- [x] Nuevos tests: **5/5**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Feature] — 2026-10-15: Relación 4:3 por defecto en nodos

### 🎯 Motivo
Instaurar proporción 4:3 en el tamaño por defecto de los nodos.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/layoutEngine.ts` | `estimateNodeSize` ajusta a 4:3 exacto en formas de caja (bubble/rectangle/sin forma). Excluye square/circle (1:1), pill/oval, fork y SVG. Solo crece; con ambas dimensiones personalizadas manda el usuario. |
| `src/utils/__tests__/layoutExtra.test.ts` | Nuevos tests: 4:3 en caja, exclusiones, custom parcial/total. |
| `doc/DESIGN.md` | Regla documentada en §6 Nodos. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **21/21 archivos, 103/103 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: 4:3 compacto (nodos ceñidos, no inflados)

### 🎯 Motivo
El 4:3 por crecimiento dejaba nodos grandes y vacíos en relación al contenido.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/layoutEngine.ts` | `estimateNodeSize` extrae el núcleo a función interna con `forcedWidth`; en auto total deriva un ancho objetivo de igual área en 4:3 y re-envuelve el texto (compacidad). Ancho o alto solo: el otro acompaña. |
| `src/utils/__tests__/layoutExtra.test.ts` | Nuevo test de compacidad (texto corto ceñido en 4:3). |
| `doc/DESIGN.md` | Regla §6 actualizada a 4:3 compacto. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **21/21 archivos, 104/104 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: MiniMapa más abajo (`bottom-2`)

### 🎯 Motivo
El conjunto minimapa + controles quedaba alto; se baja pegándolo al borde inferior.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/MiniMap.tsx` | Contenedor `bottom-5` → `bottom-2`. |
| `doc/DESIGN.md` | Posición actualizada. |

### 🔍 Verificación
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Horquilla sin fondo (solo subrayado)

### 🎯 Motivo
La forma `fork` heredaba el relleno de fondo; debe ser solo línea estilo Freeplane.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/molecules/node/NodeBackgroundRenderer.tsx` | `fork` fuerza fondo transparente (conserva `borderBottom`). |
| `src/components/molecules/node/__tests__/NodeBackgroundRenderer.test.ts` | Aserciones de transparencia en `fork`. |
| `doc/DESIGN.md` | Regla actualizada. |

### 🔍 Verificación
- [x] Tests `NodeBackgroundRenderer`: **8/8**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Horquilla recupera su subrayado

### 🎯 Motivo
Al quitar el fondo, la línea inferior también desaparecía cuando `borderWidth` era 0 (heredaba el apagado del borde de caja).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/molecules/node/NodeBackgroundRenderer.tsx` | El subrayado `fork` es independiente: siempre visible, 2.5px por defecto. |
| `src/components/molecules/node/__tests__/NodeBackgroundRenderer.test.ts` | Expectativa actualizada (borde 0 → línea 2.5px). |

### 🔍 Verificación
- [x] Tests: **8/8**. `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Visibilidad global no hacía nada (prop desconectada)

### 🎯 Motivo
El menú Ojo abría pero `App.tsx` no pasaba `onToggleGlobalVisibility`: los 5 toggles eran no-op por el `?.`.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/App.tsx` | Nueva prop `onToggleGlobalVisibility`: alterna la clave con `pushHistory` (deshacible). |
| `src/components/__tests__/ToolBar.test.tsx` | Nuevo: toggle llama con la clave; badge Visible/Oculto según el mapa. |

### 🔍 Verificación
- [x] Nuevos tests: **2/2**. `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Nodos más ceñidos (menos relleno interno)

### 🎯 Motivo
Exceso de espacio libre dentro de los nodos entre texto y borde.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/molecules/node/NodeBackgroundRenderer.tsx` | Burbuja `padding` 16/8px → 10/5px. |
| `src/components/NodeComponent.tsx` | Base `px-3 py-1.5` → `px-2 py-1`. |
| `src/utils/layoutEngine.ts` | Padding de medición acompaña (24/14→16/10, 12/8→8/6) para no romper el 4:3. |
| `doc/DESIGN.md` | Valores actualizados. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **22/22 archivos, 106/106 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Nodos ceñidos al contenido (4:3 como guía)

### 🎯 Motivo
El 4:3 exacto forzado dejaba huecos: los nodos no se ajustaban a su forma y contenido.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/layoutEngine.ts` | El 4:3 pasa a guía de envoltura (ancho objetivo 80–420px, re-wrap, altura natural). Sin crecimiento forzado; nodos ceñidos. |
| `src/utils/__tests__/layoutExtra.test.ts` | Tests de guía + compacidad actualizados. |
| `doc/DESIGN.md` | Regla §6 actualizada. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **22/22 archivos, 106/106 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Test] — 2026-10-15: Integridad de carga completa (`App.test.tsx`)

### 🎯 Motivo
No existía prueba de que la UI cargue completa: zonas, estados iniciales y nodos.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/App.test.tsx` | Nuevo: 3 tests (zonas principales, outline/filterbar cerrados, nodos en `#nodes-layer`). |

### 🔍 Verificación
- [x] Nuevos tests: **3/3**. `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: TemplatesModal siempre clara (forceLight)

### 🎯 Motivo
Con el SO en oscuro la ventana se veía lavada (card oscura + contenido claro). Por armonía visual queda fijada en claro.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/atoms/ModalBackdrop.tsx` | Nueva prop `forceLight` (omite `dark:` del card). |
| `src/components/molecules/ModalHeader.tsx` | Nueva prop `forceLight` (omite `dark:` de fondo, título, subtítulo e icono). |
| `src/components/Modals/TemplatesModal.tsx` | Usa `forceLight` + contenido 100% claro (0 `dark:`). |
| `src/utils/sampleMaps.ts` | Revertidos los `dark:` de las 20 plantillas (39 líneas). |
| `doc/DESIGN.md` | Excepción documentada. |

### 🔍 Verificación
- [x] Tests TemplatesModal + Átomos: **10/10**. `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Cuadrados ceñidos (lado mínimo que encaja)

### 🎯 Motivo
`square`/`circle` tomaban el lado máximo del contenido y quedaban cajas enormes con hueco.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/layoutEngine.ts` | Cuadrado automático = lado MÍNIMO que encaja vía búsqueda binaria del ancho (re-envolviendo texto). `forcedWidth` ahora sí alimenta la rama square/circle. |
| `src/utils/__tests__/layoutExtra.test.ts` | Aserción de compacidad del cuadrado. |
| `doc/DESIGN.md` | Regla actualizada. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **23/23 archivos, 109/109 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Hexágono respeta el polígono (contenido ceñido)

### 🎯 Motivo
En `hexagon` el texto e imágenes invadían las puntas del polígono.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/molecules/node/NodeHeaderRow.tsx` | Nueva prop `contentMaxWidth`; hexágono centra texto/iconos y acota columna e imágenes al 68%. |
| `src/components/NodeComponent.tsx` | Pasa `contentMaxWidth='68%'` en hexágono. |
| `src/utils/layoutEngine.ts` | Hexágono auto envuelve al 72% del objetivo 4:3 para que la medición coincida. |
| `src/utils/__tests__/layoutExtra.test.ts` | Test: hexágono más angosto que burbuja con igual contenido. |
| `doc/DESIGN.md` | Regla de hexágono documentada. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **23/23 archivos, 110/110 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Hexágono acota imágenes, tags y enlaces

### 🎯 Motivo
Texto ya ceñido, pero imagen superior y etiquetas invadían los vértices.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/molecules/node/NodeHeaderRow.tsx` | Nueva prop `mediaMaxWidth` (tope 96px en hexágono para top/left/between). |
| `src/components/molecules/node/NodeBadgesBar.tsx` | Props `contentMaxWidth`/`mediaMaxWidth` (tags, enlace, nota, imágenes right/bottom). |
| `src/components/NodeComponent.tsx` | Pasa 68%/96px en hexágono a ambas sub-moléculas. |
| `src/utils/layoutEngine.ts` | Medición topa imagen a 96px en hexágono (coherente con el dibujo). |
| `src/utils/__tests__/layoutExtra.test.ts` | Test del tope de imagen. |
| `doc/DESIGN.md` | Regla ampliada. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **23/23 archivos, 111/111 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Hexágono con mucho contenido crece en vez de desbordar

### 🎯 Motivo
Con imagen + texto + tags, el contenido aún sobresalía del polígono.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/layoutEngine.ts` | La caja del hexágono se deriva del contenido acotado (`ancho ≥ objetivo/0.68`); +22px si hay tags (columna angosta). |
| `src/utils/__tests__/layoutExtra.test.ts` | Test: más contenido = caja más grande. |
| `doc/DESIGN.md` | Regla actualizada. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **23/23 archivos, 111/111 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Docs] — 2026-10-15: Registro pendiente (documentación y activos previos)

### 🎯 Motivo
Estos cambios se hicieron sin su entrada correspondiente. Se registran ahora sin excepción.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/PROJECT_ARCHITECTURE.md` | Reescrito a v4.0 verificada contra código (8 temas, IDs reales de layout, acciones `handle*`, suite 22 tests) + §11 GitHub qué subir/no subir + wireframes. |
| `doc/DESIGN.md` | Nuevo: sistema de diseño verificado (tokens, componentes, 10 reglas). |
| `doc/GUIA-ESTUDIO.md` | Nuevo: guía de estudio en 9 partes con código comentado para novatos. |
| `doc/img/` | Nuevos SVG: `areas-proyecto`, `wireframe-interfaz`, `wireframe-areas`, `layouts`, `ejemplo-color`, `diseno-ui`, `diseno-resumen`. |
| `README.md` | Datos corregidos (8 temas, 22→87+ tests, puerto 3000, docs existentes) + wireframes + badge dinámico. |
| `AGENTS.md` | Nuevo y reglas globales (pnpm obligatorio, docs inmediata, sin auto-commit, `.py/`, `.opencode/agent/`, español). |
| `opencode.json` | Nuevo: plugin `opencode-agent-memory@0.3.0` para el proyecto. |
| `.opencode/memory/project.md` | Nuevo: memory bank del proyecto. |

### 🔍 Verificación
- [x] Archivos verificados en disco.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Feature] — 2026-10-15: Icono de 3 temas UI al final del MenuBar

### 🎯 Motivo
Cambiar el tema de la interfaz (claro/oscuro/sepia) sin pasar por menús.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/utils/uiTheme.ts` | Nuevo: ciclo claro→oscuro→sepia, inicial (guardado o SO), aplicar en `<html>` + persistir. |
| `src/components/MenuBar.tsx` | Botón final tras badge Offline (Sol/Luna/Café) con `uiTheme`/`onCycleTheme`. |
| `src/App.tsx` | Estado `uiTheme` + efecto de aplicación + cableado. |
| `src/index.css` | `dark:` por clase + tokens `--chrome-bar/--chrome-toolbar` (sepia incluido). |
| `src/components/ToolBar.tsx`, `FilterBar.tsx`, `StatusBar.tsx` | Fondos por tokens. |
| `src/utils/__tests__/uiTheme.test.ts`, `src/components/__tests__/MenuBar.test.tsx` | Nuevos: 5 tests. |
| `doc/DESIGN.md` | Sección de temas UI. |

### 🔍 Verificación
- [x] Nuevos tests: **5/5**. `pnpm lint`: **exit 0**. `pnpm build`: **ok** (CSS con `.dark` por clase y tokens sepia verificado en `dist/`).

---

## 📌 [Feature] — 2026-10-15: Sepia en paneles, minimapa, menús y ventanas

### 🎯 Motivo
El tema sepia solo teñía las 4 barras; esquema, propiedades, minimapa, menús y modales no cambiaban.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/index.css` | Tokens `--sp-bg/bg2/hover/glass/pop` (claros + sepia). |
| `src/components/ToolPanel.tsx`, `OutlineView.tsx` | Superficies por tokens. |
| `src/components/MiniMap.tsx`, `molecules/ZoomControls.tsx` | Cristal y píldora por tokens (sin `dark:`, sepia los tiñe). |
| `src/components/MenuBar.tsx` | 6 dropdowns por token. |
| `src/components/ToolBar.tsx` | 3 popovers por token. |
| `src/components/atoms/ModalBackdrop.tsx`, `molecules/ModalHeader.tsx` | Cards/headers por tokens (respeta `forceLight` vía override de vars). |
| `src/components/Modals/IconPackModal.tsx` | Sidebar y main por tokens. |
| `src/components/__tests__/MiniMap.test.tsx` | Expectativa actualizada al token. |
| `src/components/Modals/__tests__/TemplatesModal.test.tsx` | Timeout 20s al test pesado (flakiness de entorno, pasa aislado). |
| `doc/DESIGN.md` | Alcance sepia documentado. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **25/25 archivos, 116/116 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Tema oscuro sí aplica a paneles y ventanas

### 🎯 Motivo
Esquema, propiedades, minimapa, menús y ventanas nunca tuvieron modo oscuro (eran siempre claros); el tema oscuro apenas cambiaba nada.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/index.css` | Valores oscuros para `--sp-*` + `--sp-text/muted/border/input`. |
| `src/components/ToolPanel.tsx`, `OutlineView.tsx`, `MiniMap.tsx` | Superficies y textos clave por tokens. |
| `src/components/MenuBar.tsx`, `ToolBar.tsx` | Textos de dropdowns/popovers por token. |
| `src/components/Modals/IconPackModal.tsx` | Sidebar, buscador, grid y textos por tokens. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **25/25 archivos, 116/116 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: ToolBar sí cambia en tema oscuro

### 🎯 Motivo
La barra era blanca fija (`--chrome-toolbar` sin valor oscuro) y sus botones slate.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/index.css` | `--chrome-toolbar: #1e293b` en oscuro. |
| `src/components/ToolBar.tsx` | 13 botones a `text-[var(--sp-text)]` + hover por token; select de forma por tokens. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **25/25 archivos, 116/116 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Fix] — 2026-10-15: Textos opacos del inspector en oscuro

### 🎯 Motivo
Tabs inactivas (`slate-600`) y encabezados de sección (`slate-400`) fijos, ilegibles sobre fondo oscuro.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/ToolPanel.tsx` | 6 tabs inactivas a `text-[var(--sp-muted)]` + hover por token. |
| `ContentTab.tsx`, `FormatTab.tsx`, `ThemeTab.tsx` | Encabezados de sección a `text-[var(--sp-muted)]`. |

### 🔍 Verificación
- [x] `pnpm test:regression`: **116/116 tests**.
- [x] `pnpm lint`: **exit 0**.

---

## 📌 [Docs+Fix] — 2026-10-16: Patrón plegar/desplegar en pestañas + CloudsTab

### 🎯 Motivo
Las pestañas con ≥2 secciones plegables deben tener barra "Desplegar todo | Plegar todo"; CloudsTab (3 secciones) la incumplía y el patrón no estaba documentado.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/organisms/toolpanel/CloudsTab.tsx` | Barra "Formato de la Nube" + `handleExpandAll` (shape/fill/border), dentro del bloque `isCloudEnabled`. |
| `doc/DESIGN.md` §4 | Patrón documentado: barra con label uppercase + enlaces, estado `sectionsOpen: Record<string, boolean>`, `handleExpandAll`; ChevronDown rotación y montaje animado del cuerpo. |
| `doc/DESIGN.md` §8 | Conteo de secciones plegables por pestaña y quién lleva la barra. |

### 🔍 Verificación
- [x] `pnpm lint`: **exit 0**.
- [x] `pnpm test:regression`: **25/25 archivos, 116/116 tests**.

---

## 📌 [Docs] — 2026-10-16: Contrato funcional de paneles de texto en DESIGN.md

### 🎯 Motivo
DESIGN.md solo describía el look de inputs/textarea; no documentaba el comportamiento de ContentTab (edición inmediata de título/cuerpo/imagen/metadatos) ni NotesTab (editor Markdown con toolbar, 3 vistas e inserción en cursor).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nueva subsección "Contrato funcional de los paneles de texto": regla común (controlado, `onUpdateNode` directo, sin debounce/Aplicar, `''`→`undefined`), 4 secciones de ContentTab con campos/acciones/badges/rangos, y NotesTab (toggle `showNoteInline`, 3 modos de vista default preview, toolbar markdown con inserción en cursor, gotcha de citas sin `<blockquote>`). |

### 🔍 Verificación
- [x] Verificado contra `ContentTab.tsx` y `NotesTab.tsx` (lectura directa).

---

## 📌 [Docs] — 2026-10-16: Detalle de paneles de texto + semántica "Auto" del ColorPicker

### 🎯 Motivo
Faltaba documentar (a) qué significa realmente "Auto" en la selección de color (resolución por tema) y (b) el detalle fino de ContentTab/NotesTab (acciones ojo, badges, rangos, FileReader, toolbar markdown).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §4 | ColorPicker: semántica "Auto" (`node.X || theme.X`, verificado `NodeComponent.tsx:82-84`), solo Reset vuelve a Auto, comparación insensible a mayúsculas, props `presets`/`defaultColor` sin uso actual. |
| `doc/DESIGN.md` §8 | ContentTab expandido: badges/acciones ojo con sus clases, `FileReader` de imagen (re-selección de archivo), grid de 6 posiciones con labels, rangos y defaults de sliders, bloques de Metadatos. NotesTab: clases del toggle amber, 9 botones de toolbar con sus prefixes, filas por modo, estados de preview. |

### 🔍 Verificación
- [x] Verificado contra `ColorPicker.tsx`, `NodeComponent.tsx`, `SliderInput.tsx`, `FontFormatToolbar.tsx`, `ContentTab.tsx`, `NotesTab.tsx`.

---

## 📌 [Docs] — 2026-10-16: §8 Metadatos — ojos condicionales y detalles de TagManager

### 🎯 Motivo
El contrato de "Metadatos y Visibilidad" omitía condiciones de renderizado (ojos/bloques que solo aparecen si hay valor) y el comportamiento real de `TagManager` (dedupe case-sensitive, Enter/Plus, botón deshabilitado, sin estado vacío).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Bullet 4 (Metadatos): primer bloque sin `border-t` (otros tres con `pt-2 border-t`); ojos solo si existe el valor (`tags.length>0`, `link`, `progress!==undefined`) y bloque Iconos solo con `icons.length>0`; botón galería solo si se pasa `onOpenIconPackModal`; TagManager: placeholder "Añadir etiqueta...", alta con Enter/Plus (deshabilitado si vacío), `trim()` + dedupe exacto case-sensitive, chips azules con X hover rojo, sin estado vacío de texto. |

### 🔍 Verificación
- [x] Verificado contra `TagManager.tsx` (líneas 17-71) y `ContentTab.tsx` (líneas 441, 461).
- [x] Corregido un dato inventado durante la redacción: no existe el texto "Sin etiquetas asignadas".

---

## 📌 [Docs] — 2026-10-17: Contrato funcional de "Forma y Geometría" (FormatTab §8)

### 🎯 Motivo
La pestaña Estilos no tenía contrato documentado (solo el look de `ShapeSelector` en §5): faltaban header/badge, los 10 shapes con sus iconos y los sliders Ancho/Alto personalizado (rangos, "Automático", 0 = auto).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nueva subsección "Contrato funcional de Forma y Geometría": header (icono `Square`, badge `capitalize` = ID crudo en inglés — gotcha Bubble/Burbuja documentado), `ShapeSelector` (10 shapes en orden, iconos propios/Lucide, `title`, `currentShape` def `'bubble'`, clic = `onUpdateNode` inmediato), bloque dimensiones `pt-2 border-t` con `SliderInput` Ancho (0–500 step 10) y Alto (0–300 step 5), badge "Automático" vía prop `badge`, `onChange` borra el valor al llegar a 0 (`w > 0 ? w : undefined`), enlace con §6 sizing. |
| `doc/DESIGN.md` §5 | `ShapeSelector` ampliado: `title` = nombre, label `truncate`, 10 shapes + puntero a §8. |

### 🔍 Verificación
- [x] Verificado contra `FormatTab.tsx:97-141` y `ShapeSelector.tsx:1-123` (lectura directa).

---

## 📌 [Docs] — 2026-10-17: Contrato funcional "Fondo y Relleno" + sincronización de TODA la documentación

### 🎯 Motivo
El panel "Fondo y Relleno" (FormatTab sección 2) no tenía contrato funcional; además, `INTERFACE_SPEC.md` y `PROJECT_ARCHITECTURE.md` estaban desincronizados del código real (rangos de sliders inexistentes, modos de fondo incompletos, notas en pestañas equivocadas).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nueva subsección "Contrato funcional de Fondo y Relleno": header sin badge, derivación de `bgType` (`bgType \|\| (bgImageUrl ? 'image' : 'color')`), y los 5 tipos con sus campos/defaults/gotchas — Sólido (onClear borra color+bgType), Degradado (defaults #3b82f6/#1d4ed8 sin Reset + gotcha fallback render #8b5cf6), Trama (7 estilos con glyphs, `color` compartido, opacidad guardada como decimal), Imagen (FileReader incondicional, Trash deja bgType, 3 modos con doble label, `'fit'` oculto en panel ≡ contain), Transp. |
| `doc/INTERFACE_SPEC.md` §5.2 | FormatTab reescrito: sliders 0–500/0–300 con badge "Automático", 5 tipos de fondo (no 4), sin presets de degradado ni checkbox "Auto" de borde, aristas = 4 botones + color + Aplicar a Hijos/Hermanos (perfiles/grosor → ThemeTab), imágenes con rangos reales. |
| `doc/INTERFACE_SPEC.md` §5.3 | NotesTab corregido: editor Markdown 3 vistas; progreso/enlace → ContentTab Metadatos. |
| `doc/INTERFACE_SPEC.md` §10.2–10.4 | Rangos y modos corregidos (pattern 8–40px, 5 bgType, gradient sin presets, imagen cover/contain/tile sin opacidad, posiciones reales). |
| `doc/PROJECT_ARCHITECTURE.md` §2.2 | Resumen de pestañas sincronizado: ContentTab con Metadatos y 6 posiciones, FormatTab con 5 bgType y aristas 4 botones (perfiles = mapa), NotesTab sin progreso. |

### 🔍 Verificación
- [x] Verificado contra `FormatTab.tsx` (completo, líneas 33–540), `ContentTab.tsx:260–330`, `NodeBackgroundRenderer.tsx:40–177`, `types/mindmap.ts:72–113`.
- [x] Gotchas documentados con su línea de código: derivación bgType, fallback #8b5cf6, `'fit'` oculto, opacidad decimal.

---

## 📌 [Docs] — 2026-10-17: Contrato funcional de "Bordes y Contorno" (FormatTab sección 3)

### 🎯 Motivo
La tercera sección de la pestaña Estilos no tenía contrato funcional en DESIGN.md; faltaban la semántica de Auto del borde (color de rama), el comportamiento del slider (0 no borra, step 1 con gotcha decimal) y la doble escritura borderDash/borderStyle.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nueva subsección "Contrato funcional de Bordes y Contorno": header `Sparkles` sin badge, ColorPicker `borderColor` con Reset + cadena de render (`node.borderWidth ? branchColor : transparent` en raíz), Slider 0–8px sin badge/reset (value `?? 1`, 0 deja `borderWidth: 0` fijo ≠ Forma, gotcha decimal con step 1), Estilo de Línea con preview `border-t-2` y **doble escritura `borderDash`+`borderStyle`** (selección lee solo `borderDash`; render acepta ambos). Nota: sin presets de grosor ni checkbox "Auto" (specs viejos eran falsos). |

### 🔍 Verificación
- [x] Verificado contra `FormatTab.tsx:385-436` y `NodeBackgroundRenderer.tsx:190-194`.
- [x] `INTERFACE_SPEC.md` y `GUIA-ESTUDIO.md` ya estaban sincronizados (corregido en la entrada anterior / tipos correctos en líneas 172-175).

---

## 📌 [Docs] — 2026-10-17: Contrato funcional de "Aristas y Propagación" (FormatTab sección 4)

### 🎯 Motivo
Última sección de la pestaña Estilos sin contrato funcional: faltaban los 4 botones con sus SVGs, la cadena de herencia de color/estilo de arista (nodo→mapa→tema) y el alcance exacto de la propagación de estilo (qué campos copia y sus guardas).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nueva subsección "Contrato funcional de Aristas y Propagación": header `Network` sin badge, "Forma de la Conexión" (4 SVGs inline, `'hidden'` no ofrecido aquí), ColorPicker `edgeColor` con cadena de 3 niveles (nodo→mapa→rama), cadena completa estilo/perfil/grosor, y "Propagación de Estilo" (26 campos de `extractNodeStyleBundle`, lo que NO copia, guardas de store: subárbol recursivo vs hermanos directos, no-op en raíz/padre ≤1 hijo, `pushHistory`+`saveCurrentMap`). |
| `doc/INTERFACE_SPEC.md` §5.2 | Bloque de aristas ampliado: alcance de la propagación y cadena de render node→map→theme. |

### 🔍 Verificación
- [x] Verificado contra `FormatTab.tsx:438-540`, `useMindMapStore.ts:79-108` (bundle) y `519-588` (guardas), `MindMapCanvas.tsx:1258-1274` (herencia).
- [x] `GUIA-ESTUDIO.md:374-375` y `PROJECT_ARCHITECTURE.md` ya correctos (sin cambios).
- [x] Pestaña Estilos (FormatTab) queda 100% documentada: 4/4 secciones con contrato funcional en §8.

---

## 📌 [Docs] — 2026-10-17: Ampliación del contrato de NotesTab (pestaña Notas)

### 🎯 Motivo
El contrato de NotesTab existía pero con huecos verificados contra el código: clases del header (uppercase explica el "NOTA MARKDOWN" en mayúsculas), icono/tooltips del toggle, persistencia de viewMode, placeholders de la toolbar, la excepción `''` vs `undefined` y el import muerto.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Bloque NotesTab ampliado: header con `border-b` + label **`uppercase tracking-wider`** (por eso se ve "NOTA MARKDOWN"), toggle con icono `LayoutList` + tooltips exactos + estilo inactivo, grupo de vistas con `title`s e inactivo, **`viewMode` local que reinicia en `preview` al reentrar** (`ToolPanel.tsx:216`), placeholders fijos de los 9 botones + **gotcha de sufijo** (H1/H2/listas/cita solo prefijo), card del preview completa, **excepción `note: ''` ≠ `undefined`** (`NotesTab.tsx:203`), e inconsistencia actual `MessageSquareOff` importado sin usar (línea 18). |
| `doc/INTERFACE_SPEC.md` §5.3 | Resumen actualizado: uppercase, reset de viewMode, sufijos y excepción `''`. |

### 🔍 Verificación
- [x] Verificado contra `NotesTab.tsx` completo (1-224) y `ToolPanel.tsx:199-234` (montaje condicional).
- [x] `GUIA-ESTUDIO.md:216-217` (tipos `note`/`showNoteInline`) y `PROJECT_ARCHITECTURE.md` ya correctos (sin cambios).
- [x] Solo documentación → sin impacto en lint/tests.

---

## 📌 [Docs] — 2026-10-17: Sincronización de DESIGN.md con el sistema de tokens UI (§5/§7/§9/§11)

### 🎯 Motivo
Al implementar los temas Claro/Oscuro/Sepia se tokenizaron barras, controles flotantes, OutlineView y modales, pero DESIGN.md seguía describiendo las clases anteriores (`bg-slate-900`, `bg-white`...) — el doc se contradecía a sí mismo (§7/§11 vs §7 "Temas de interfaz") y guiaría a implementar fondos fijos que rompen sepia/oscuro.

### ✏️ Cambios (solo `doc/DESIGN.md`; CERO cambios de código)
| Sección | Sincronización |
|---------|----------------|
| §5 `ZoomControls` | `bg-white/95` → `bg-[var(--sp-bg)]` + `border-slate-200/90` + `shadow-slate-900/5 select-none` (`ZoomControls.tsx:30`). |
| §7 MenuBar | Header `bg-slate-900` → `bg-[var(--chrome-bar)]` (+`select-none`); dropdowns `bg-white text-slate-800` → `bg-[var(--sp-bg)] text-[var(--sp-text)]` (6 dropdowns, `MenuBar.tsx:141,162...`). |
| §7 ToolBar | `bg-white` → `bg-[var(--chrome-toolbar)]` (+`gap-1 sm:gap-2 select-none relative`); popovers `bg-white/95` → `bg-[var(--sp-pop)]` con animate-in (`:423,542`) y menú móvil "Más" `w-52 bg-[var(--sp-bg)]` (`:301`). |
| §7 FilterBar/StatusBar | Ambas `bg-slate-900` → `bg-[var(--chrome-bar)]` (`FilterBar.tsx:33`, `StatusBar.tsx:23`) + nota de contenido slate fijo legible. |
| §9 MiniMap | `bg rgba(255,255,255,0.65)` hardcodeado → `var(--sp-glass, rgba(255,255,255,0.65))` con valores reales por tema; sombra de 2 capas; título `text-[var(--sp-text)]` (`MiniMap.tsx:215-228`). |
| §9 OutlineView | `bg-white`/`bg-slate-50/90`/`50/80` → `bg-[var(--sp-bg)]`/`bg-[var(--sp-bg2)]`, borde `var(--sp-border)`, ternario fullscreen (`OutlineView.tsx:345-353,458`). |
| §3 modales | `ModalBackdrop` card `bg-white` → `bg-[var(--sp-bg)]` con `forceLight` inyectando `--sp-bg: #ffffff` (`:52-53`); `ModalHeader` `bg-slate-50/50` → `bg-[var(--sp-bg2)]` (`:24`). |
| §11 regla 3 | Reescrita: "**Tema UI por tokens, no clases fijas**" — tokens `--chrome-*`/`--sp-*` + `data-theme`/`.dark`, prohibido `bg-slate-900`/`bg-white` fijos en barras/paneles/controles; excepción MiniMap/ZoomControls siempre claros vía tokens. |

### 🔍 Verificación
- [x] Cada valor leído del código: `index.css:8-47` (valores de tokens por tema), `MenuBar.tsx`, `ToolBar.tsx:301,423,542`, `FilterBar.tsx:33`, `StatusBar.tsx:23`, `ZoomControls.tsx:30`, `MiniMap.tsx:208-235`, `OutlineView.tsx:344-359`, `ModalBackdrop.tsx:52-53`, `ModalHeader.tsx:24`.
- [x] Verificados como CORRECTOS (sin cambio): Input/Button/IconButton/ToggleButton(ToggleGroup)/CollapsibleSection/ErrorBoundary/Tooltip siguen `bg-white ... dark:` por prefijo; body `bg-slate-50` (`index.html:13`); raíz layout `bg-slate-100` (`MainEditorLayout.tsx:37`).
- [x] Sin cambios de código → sin impacto en lint/tests.

---

## 📌 [Docs] — 2026-10-17: Contrato funcional de ThemeTab ("Tema del Mapa", 5 secciones)

### 🎯 Motivo
Última pestaña grande de §8 sin contrato. Al verificarla aparecieron 3 huecos de wiring y datos inventados en specs viejos (9 temas, 12 presets, "Aplicar a todos" cableado).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nuevo contrato "Tema del Mapa": única pestaña sin nodo seleccionado; orden/estado de secciones; los 8 temas con dots, los 9 layouts con sus iconos y transformaciones, Fondo del Lienzo (cadena `mindMap \|\| theme \|\| literal`, 6 patrones = tipo completo, opacidad decimal), Aristas Globales (4 SVG + 4 perfiles con glyphs, Multicolor/Randomizar/Sugeridos de 8, edgeDash solo vs doble del nodo, grosor 1–8 def 2.5 que explica el 2.5px del slider de bordes) y Espaciado (rangos 20–150/4–60 def 54/14). **Gotchas documentados**: `onApplyEdge*ToAllNodes` no cableado (solo efecto mapa), **sliders de Espaciado = no-op** (`onUpdateMapGaps` sin pasar + `onUpdateMapSpacing` declarado sin usar), props muertas (`onOpenConnectorModal/onDeleteConnector/onUpdateConnector`), import `BACKGROUND_PRESET_THEMES` muerto, props muertas en ToolPanel (`onUpdateMapBackgroundColor/Pattern/Spacing/Visibility`). |
| `doc/INTERFACE_SPEC.md` §5.6 | Reescrito: 8 temas (no 9), sin "12 presets" (inexistente), Multicolor/Randomizar/Sugeridos, gotchas de wiring y espaciado no-op. |
| `doc/PROJECT_ARCHITECTURE.md` §2.2 | "12 fondos" → "6 patrones + color" con nota de los 2 huecos de wiring. |

### 🔍 Verificación
- [x] `ThemeTab.tsx` leído completo (1-623); `ToolPanel.tsx:63-71,235-255`; `App.tsx:488-598`; `types/mindmap.ts:187-193,240-241`; `index.css` no aplica.
- [x] `GUIA-ESTUDIO.md` ya correcto (tipos `edgeDash`/gaps con defaults 54/14).
- [x] §8 queda con TODAS las pestañas del ToolPanel documentadas menos CloudsTab e IconsTab.

---

## 🔧 [Fix] — 2026-10-17: Cablear "Espaciado del Mapa" (ThemeTab) — sliders que no guardaban

### 🎯 Motivo
Los sliders "Separación Horizontal/Vertical" del ThemeTab eran **no-op**: ThemeTab llama a `onUpdateMapGaps`, que App nunca pasa; y el handler que App sí pasa (`onUpdateMapSpacing(h,v)` con `pushHistory`) estaba declarado en ToolPanel sin usarse. Descubierto durante la documentación del contrato de ThemeTab.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/ToolPanel.tsx` | Adaptador en el paso de props a ThemeTab: `onUpdateMapGaps = props.onUpdateMapGaps ?? ((gaps) => props.onUpdateMapSpacing?.(gaps.horizontal ?? mindMap.horizontalGap ?? 54, gaps.vertical ?? mindMap.verticalGap ?? 14))`. Reutiliza el handler existente en App (`App.tsx:590-598`) — sin tocar App ni el store. |
| `src/components/__tests__/ToolPanel.test.tsx` | Nuevo (4 tests): slider horizontal → `onUpdateMapSpacing(100, 14)`; slider vertical → `(54, 30)`; prop directa `onUpdateMapGaps` tiene prioridad; guard `?.` sin handler no rompe. |
| `doc/DESIGN.md` §8 | Gotcha "no-op" del punto 5 reescrito como cableado con fecha; props muertas de ToolPanel actualizadas (`onUpdateMapSpacing` deja de ser muerta). |
| `doc/INTERFACE_SPEC.md` §5.6 / `doc/PROJECT_ARCHITECTURE.md` §2.2 | Secciones de espaciado sincronizadas con el fix. |

### 🔍 Verificación
- [x] `pnpm lint` exit 0.
- [x] Tests dirigidos: 6/6 (ToolPanel 4 + ThemeTab 2).
- [x] `pnpm test:regression`: **26 archivos / 120 tests, todos pasando** (antes 25/116).

---

## 📌 [Docs] — 2026-10-17: Contratos de CloudsTab e IconsTab — §8 ToolPanel COMPLETO

### 🎯 Motivo
Cerraron los dos últimos huecos de §8. Al verificarlos aparecieron: 4 formas de nube inventadas en el spec viejo (eran 8), campos fantasma de nube (gradient/pattern/image se renderizan pero no se editan), "Sombra" sin control, y el tope de 120 iconos del grid.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §8 | Nuevo contrato "Nubes": switch maestro (apagar borra `cloud` completo, defaults al encender), 8 formas con sus iconos, márgenes -50–200 (gotcha: tipo dice -100–+300), opacidad decimal def 8, borde def `dashed` (≠ nodo `solid`, solo `borderDash`), sección "Borde y Sombra" **sin control de `shadow`**, y campos fantasma gradient/pattern/image (solo render, `MindMapCanvas.tsx:969-1228`). Nuevo contrato "Iconos": 1 sección con badge-dot, tinte + 7 Sugeridos sin ring + "Original", tamaño 10–36 con badge "14px (Estándar)", "Copiar a Hijos/Hermanos" (4 campos copiados + guardas), "Iconos Asignados" con "Quitar todos" → `icons: []` (excepción `undefined`), buscador/categorías/8 quick tags y **grid con tope `slice(0, 120)`**. |
| `doc/INTERFACE_SPEC.md` §5.4/§5.5 | Reescritos: Iconos (antes 3 líneas vagas) y Nubes (decía "4 ToggleButtons" y "ColorPicker RGBA" — falsos). |
| `doc/PROJECT_ARCHITECTURE.md` §2.2 | Resúmenes de IconsTab/CloudsTab con datos reales y gotchas. |
| `doc/GUIA-ESTUDIO.md` | Comentario de `paddingX` corregido al rango real del slider (-50..200). |

### 🔍 Verificación
- [x] `CloudsTab.tsx` (1-288) e `IconsTab.tsx` (1-314) leídos completos; `useMindMapStore.ts:590-671` (bundle de iconos + guardas); `App.tsx:486-487,614` (props cableadas); `types/mindmap.ts:48-70`.
- [x] Sin cambios de código → sin impacto en lint/tests (la suite quedó en 120/120 tras el fix anterior).
- [x] §8 queda **100% completo**: ContentTab, NotesTab, FormatTab (4), ThemeTab (5), CloudsTab (3), IconsTab.

---

## 📌 [Docs] — 2026-10-17: Grupo 1 — contratos funcionales de las barras + menú contextual

### 🎯 Motivo
El usuario señaló: "hay muchas cosas que no están documentadas". `DESIGN.md` §7/§9 solo tenían el contrato **visual** (clases CSS) de las barras; la superficie funcional (menús, popovers, filtros, clic derecho) no estaba en ningún doc, y `INTERFACE_SPEC` §1-§3 tenía datos inventados. Fuentes leídas completas: `MenuBar.tsx` (562), `ToolBar.tsx` (659), `FilterBar.tsx` (119), `StatusBar.tsx` (51), `CanvasContextMenu.tsx` (250), `useKeyboardShortcuts.ts` (221), `MindMapCanvas.tsx:345-387,633-677`, `App.tsx:159-217,353-363,618-626`.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §7 | +3 contratos funcionales: **MenuBar** (6 menús con sus 40 items y atajos reales, título editable doble-clic con `trim()`, badge Offline, ciclo de tema UI, props muertas), **ToolBar** (grupo izquierdo/derecho, menú móvil "Más", popovers "Vista" de 5 flags `hideAll*` y "Presentar" de 3 modos, 15 props muertas), **FilterBar/StatusBar** (selects reales, `isFiltering`, gotchas de limpieza y de datos). |
| `doc/DESIGN.md` §9 | +contrato del **menú contextual**: apertura/clamp 240×360, 11 items en 5 grupos con kbd, item de fondo, y gotcha de fondo siempre blanco (sin tokens `--sp-*`). |
| `doc/INTERFACE_SPEC.md` | §1 ASCII: MenuBar `40px` (decía 48), ToolBar con botones reales (decía Cortar/Pegar/Color/zoom), FilterBar sin control `[Icono]`, MiniMap **inferior derecha** S176/M224/L288 (decía izquierda 160/220/300), StatusBar con nota de zoom fijo. §2 tabla: z-index reales (MenuBar `z-50`, ToolBar `z-40`, FilterBar `z-30`, ToolPanel `336px z-10`, OutlineView `320/352px z-20`, MiniMap `z-40`). **§3 reescrito entero**: los menús reales (el viejo inventaba `Ctrl+Alt+N`, `Ctrl+O/E/P`, `Alt+B/N/K/G/I/C/W`, "9 temas", y un menú Ver con zoom/MiniMap/centrado inexistentes) + nueva **§3.6 tabla de atajos reales vs hints decorativos**. |
| `doc/PROJECT_ARCHITECTURE.md` §2.4 | ContextMenu sin el "formas" que no tiene; StatusBar con `zoom/posición` hardcodeados; MiniMap `bottom-2 right-5` (decía `bottom-5`). |

### 🐛 Gotchas/bugs descubiertos (documentados, SIN tocar código)
1. **MenuBar → Formato → temas `'purple'` y `'warm'` no existen** en `THEMES` → los 2 items no cambian el tema (fallback a default) pero **escriben un `themeId` inválido en el mapa** (`MenuBar.tsx:331,337`, `App:138,228-231`).
2. **ToolBar: breakpoint `xs` no definido** → el grupo **Negrita/Cursiva nunca se muestra** en ningún tamaño (`ToolBar.tsx:208`, cero `--breakpoint-xs` en `index.css`).
3. **`ComingSoonModal` es huérfano**: su único escritor es `onShowComingSoon`, prop que MenuBar/ToolBar reciben pero **nunca invocan** → el modal no puede abrirse (`App:190,655-657`).
4. Select de forma: escritorio **6 formas** vs móvil/MenuBar/FormatTab **10**.
5. **`filterOptions.icon`**: cuenta para `isFiltering` pero no hay UI que lo ponga y `useSearchFilter` lo ignora; `onClearFilter` reemplaza el estado entero (reintroduce `showAncestors/showDescendants`).
6. **StatusBar `Zoom`/`Posición` siempre 100 % y (0,0)** (`App:622-624` hardcodeado).
7. Badges **"Activo" estáticos** en los menús de presentación (no reflejan el modo); hints **`Ctrl+S` y `?` sin handler**; "Pegar como Hijo" del menú contextual sin `disabled` con portapapeles vacío.
8. Props muertas: MenuBar (`isOutlineMode`, `onShowComingSoon`) + ToolBar (15 declaradas, 1 de ellas destructurada sin uso).

### 🔍 Verificación
- [x] Cada cifra/item citado contra lectura directa de las fuentes (rutas/lineas arriba).
- [x] Sin cambios de código → suite intacta: `pnpm lint` 0 y 120/120 de la tanda anterior.
- [x] `DESIGN.md` §7/§9 ahora cubren contrato visual **y** funcional de: MenuBar, ToolBar, FilterBar, StatusBar, menú contextual.

---

## 🔧 [Fix] — 2026-10-17: 2 bugs de la revisión de barras — temas rotos en MenuBar y Negrita/Cursiva invisible

### 🎯 Motivo
Descubiertos al documentar el grupo 1 (barras): (1) el menú Formato pasaba ids de tema inexistentes (`'purple'`/`'warm'`), sin efecto visual y con `themeId` inválido persistido; (2) el grupo Negrita/Cursiva del ToolBar usaba un breakpoint `xs` que no existe, así que nunca se mostraba. Aprobados con "ok" del usuario.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/MenuBar.tsx` | En "Temas Visuales": `onChangeTheme?.('purple')` → `'rainbow'` (label "Creativo Púrpura" → **"Arcoiris Vibrante"**, dot degradado `from-red-500 via-amber-400 to-blue-500`) y `'warm'` → `'sunset'` (label "Atardecer Cálido" ya coincide). |
| `src/components/ToolBar.tsx` | Grupo de tipografía: `hidden xs:flex` → `hidden sm:flex` (breakpoint `xs` no existe en `index.css`; `sm` es coherente con el select de Forma). |
| `src/components/__tests__/MenuBar.test.tsx` | +2 tests: los 5 items de tema emiten ids ∈ `THEMES` (loop sobre pares label→id) y el menú ya no contiene "Creativo Púrpura". |
| `src/components/__tests__/ToolBar.test.tsx` | +1 test: la clase del grupo contiene `hidden sm:flex` y **no** `xs:`. |
| `doc/DESIGN.md` §7 | Los 2 gotchas marcados 🐛→✅ con descripción del fix y tests; item renombrado en el contrato. |
| `doc/INTERFACE_SPEC.md` §3.4 | Lista de temas real + nota de fix. |

### 🔍 Verificación
- [x] `pnpm lint` exit 0.
- [x] Tests dirigidos: 7/7 (MenuBar 4 + ToolBar 3).
- [x] `pnpm test:regression`: **26 archivos / 123 tests, todos en verde** (antes 120).
- [x] No quedan ids fuera de `THEMES` en el menú (test automático).

---

## 📚 [Docs] — 2026-10-17: DESIGN §8.5 — contrato funcional de los 7 modales (grupo 2)

### 🎯 Motivo
Continuar la sincronización doc↔código con el grupo 2 acordado: verificar línea a línea los 7 ficheros de `src/components/Modals/` y dejar su contrato (contenido, campos, defaults, wiring, gotchas) reflejado en el contrato canónico.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` | Nueva sección **§8.5 "Modales (7, contrato funcional)"**: tabla resumen (líneas + orígenes de apertura) y 7 subsecciones (§8.5.1–7) con contrato entero de `ExportImportModal` (4 formatos de export, import JSON/XML, persistencia de `activeTab`/`importError`), `ShortcutsModal` (16 filas, `sc.cat` muerto, 15/16 verificados vs `useKeyboardShortcuts`, faltan `Ctrl+Shift+Z`/`Backspace`/teclas de presentación), `TemplatesModal` (7 categorías hardcodeadas, `TemplateMapPreview` en vivo, `forceLight`, filtros persistentes), `SavedMapsModal` (recarga al abrir, `confirm()` nativo, veto de borrado del actual), `ConnectorModal` (defaults: curvatura -50/-200..200, estilo dashed, color #3b82f6; `arrow`/`width` fijos sin UI; estado no se resetea), `IconPackModal` (sidebar 12 grupos hardcodeados, grid 3→10 sin slice, "Copiar ID" copia stub SVG sin paths, imports muertos X/Plus/Trash2/Download) y `ComingSoonModal` (huérfano confirmado + `onStartClassic` que App no pasa). Cross-links desde §4 "Modal estándar" y del gotcha de MenuBar (`onShowComingSoon`) a §8.5.7. Gotcha nuevo: **3 etiquetas prometen imágenes inexistentes** (menú "Exportar (.mm / HTML / PNG)", ToolBar "Imágenes", subtítulo del modal) — `MenuBar.tsx:194`, `ToolBar.tsx:635`. |
| `doc/INTERFACE_SPEC.md` §3.1 | Nota de gotcha: rotulo PNG sin export de imagenes + pestana persistente + puntero a `DESIGN.md` §8.5. |

### 🔍 Verificación
- [x] Cada valor citado leído directamente de los 7 `Modals/*.tsx` (293/65/606/131/216/370/146 lineas) + wiring confirmado en `App.tsx:679-737`.
- [x] Labels PNG/Imágenes confirmados en `MenuBar.tsx:194` y `ToolBar.tsx:635`.
- [x] Sin cambios de código → sin necesidad de lint/tests (última corrida: 123/123 en verde).

---

## 📚 [Docs] — 2026-10-17: DESIGN §10 reescrito — los 3 modos de presentación (grupo 3)

### 🎯 Motivo
Continuar la sincronización doc↔código con el grupo 3 acordado: documentar la presentación dinámica (HUD sobre el lienzo) y la elaborate (Prezi espacial), que hasta ahora solo estaban descritas a medias (§10 solo cubría la clásica).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §10 | Reescrito como **"Presentación (3 modos)"**: nuevo bloque de **wiring** (`presentationType` local en App:101 default `dynamic`; F5 solo hace toggle de `isPresentationMode` sin cambiar el modo; `MainEditorLayout` oculta el chrome y pinta `presentationOverlay` solo en presentación; la dinámica se activa dentro de `MindMapCanvas` vía `App:459`) y 3 subsecciones: **§10.1 Clásica** (conservada tal cual), **§10.2 Dinámica** (`CanvasPresentationHUD` 489 líneas: editor/presentar, 3 herramientas de marco con auto-frames por nodo pad 28 y marcos `custom_area` pad 30, notas con prioridad nodo→marco→nodeIds, filmstrip con borrado, teclado completo incl. `E`, persistencia en `presentationSlides` con undo/redo local propio; generador `presentationGenerator.ts`: overview/raíz/ramas 2 niveles + slides de nota) y **§10.3 Elaborada** (`ElaboratePresentationSystem` 786 + tarjeta 373 + `SlideDetailModal` 277 + generador 495: cámara pan/zoom/rotación con vuelos `750ms cubic-bezier`, transformaciones drag/rotate/resize con compensación de rotación, 5 estrategias de acomodo — spiral/constellation/grid/random(semilla 42 determinista)/stacked — todas a 720×440, tarjetas con gradientes/patrones SVG incl. hexágonos, presentador con trayectoria de vuelo y spotlight). |
| `doc/DESIGN.md` §10 (gotchas) | **Sin `pushHistory`** en elaborate (`App:647`) y sin undo propio · **Constelación solo cubre 2 niveles** (descendientes profundos sin tarjeta) · hooks de `SlideDetailModal` tras `if (!isOpen) return null` (rules-of-hooks latente) · teclado elaborate sin guard de INPUT/TEXTAREA · `ComingSoonModal.onStartClassic` no fuerza `presentationType='classic'` (`App:658`) · botón de notas dinámico depende solo de `activeNode.note` · imports muertos `RotateCcw/Trash2/Maximize2/Palette/FileText` en `ElaboratePresentationSystem.tsx`. |

### 🔍 Verificación
- [x] Lectura directa de los 6 ficheros (HUD 489, Elaborate 786, tarjeta 373, SlideDetailModal 277, generador espacial 495, generador clásico 212) + wiring en `App.tsx` y `MindMapCanvas.tsx`.
- [x] Teclas y clamps citados comprobados uno a uno en el código.
- [x] Sin cambios de código → sin lint/tests (última corrida: 123/123 en verde).

---

## 📚 [Docs] — 2026-10-17: INTERFACE_SPEC §6 corregido — presentación clásica real (y bug de Espacio hallado)

### 🎯 Motivo
Al documentar el grupo 3 se verificó `PresentationMode.tsx` (1492 líneas) y se detectaron reclamos ficticios/obsoletos en el §6 de INTERFACE_SPEC, además de un bug real de teclado.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/INTERFACE_SPEC.md` §6.3-6.6 | **§6.3**: no existe organismo `PresentationControls` (controles inline en `PresentationMode.tsx`); Volver usa pila `jumpHistory`. **§6.4**: opciones reales = **8** (faltaba "Radar Mini-Mapa" ON/OFF, `:915`); "Editar en Lienzo" real = cierra presentación + selecciona nodo + abre ToolPanel (`App:634-638`); "Aplicar y Ver Diapositiva" solo cierra. **§6.5**: los 7 temas ficticios (dark-studio, midnight-oled, cyberpunk-purple...) **no existen** → tabla real de **8** `PRESENTATION_THEMES` inline (`PresentationMode.tsx:54-159`): Clásico Azul/Arcoíris Vibrante/Modo Oscuro/Bosque Esmeralda/Atardecer Cálido/Minimalista Mono/Plano Técnico Blueprint/Panal Creativo. **§6.6**: atajos verificados uno a uno; documentado el bug de Espacio. |
| `doc/DESIGN.md` §10.1 | + bloque **"Funcional"** de la clásica: 3 fases por nodo, auto-paginación sin scrollbars (límites 6/450 chars cuerpo, 9/550 notas), tarjetas de hijos máx. 6, saltos con `jumpHistory` + "Volver"/Backspace, radar minimapa, modal de Opciones (8 opciones, tecla E, footer Editar en Lienzo/Aplicar), navegación acotada sin wrap; 🐛 **bug documentado: `e.key === 'Space'` (`PresentationMode.tsx:530`) — Espacio no avanza en la clásica** (en dinámica/elaborate funciona). |
| `doc/INTERFACE_SPEC.md` §6.6 / árbol | Nota del bug + corrección "7 temas" → "8 temas inline" en el árbol de ficheros. |

### 🔍 Verificación
- [x] `PRESENTATION_THEMES` (8 entradas) leídas completas en `PresentationMode.tsx:54-159`.
- [x] Opciones (:308-315, :915), footer (:979-999) y teclado (:517-548) verificados directamente.
- [x] Confirmado por grep que no existen `PresentationControls` ni `presentationThemes.ts`.
- [x] Sin cambios de código → sin lint/tests (última corrida: 123/123 en verde). **Bug Espacio pendiente de decisión del usuario.**

---

## 📚 [Docs] — 2026-10-17: DESIGN §6 + §9 — contrato funcional del nodo y del OutlineView (grupo 4)

### 🎯 Motivo
Grupo 4 acordado: dejar de lado lo ya cubierto (§5 moléculas y el contrato visual del nodo/outline) y verificar línea a línea `NodeComponent.tsx` (203) y `OutlineView.tsx` (464) para documentar su comportamiento y gotchas.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §6 | + bloque **"Funcional"** del nodo: composición por 5 moléculas (`NodeSvgPolygonBackground`, `NodeBubbleTail`, `NodeHeaderRow`, `NodeBadgesBar`, `NodeActionButtons`), visibilidad efectiva nodo-OR-global (`hide*`/`hideAll*`), flujo de edición inline, `isMatch`/`isStaged`, límites del hexágono (68%/96px). 🐛 **Bug nuevo**: `editText = useState(node.text)` sin sincronizar (`NodeComponent.tsx:66`) + `key={node.id}` sin remontado (`MindMapCanvas:1372`) → **editar tras un cambio de texto externo (outline, undo, plantilla) revierte el texto al valor del montaje** al confirmar sin teclear. Fix mínimo propuesto: `setEditText(node.text)` al entrar en edición. Cosmético: ternario redundante `isRoot ? 'rounded' : 'rounded'` (:69). |
| `doc/DESIGN.md` §9 | Nueva subsección **"Contrato funcional de OutlineView"**: 5 acciones de cabecera, búsqueda interna por substring (text/body/tags + ancestros, distinta del filtro global), fila con indent/bullet/progreso/tags/indicadores, edición en línea en vivo (Enter=hermano, Tab=hijo, Esc), veto de borrado en raíz por UI, recursión con `folded`. 🐛 Gotchas: **`onUpdateBody` fantasma** (declarada :68, pasada por `App:377`, nunca usada — body solo lectura), **la búsqueda no despliega ramas plegadas**, hint "#etiqueta" engañoso (tags sin `#`), edición sin debounce. |

### 🔍 Verificación
- [x] Ambos ficheros leídos enteros; `NodeHeaderRow.tsx` inspeccionado para confirmar que el `textarea` usa `editText` y solo lo resincroniza al cancelar (:66).
- [x] `key={node.id}` confirmado en `MindMapCanvas:1372` (sin remontado → bug de texto desfasado real).
- [x] Sin cambios de código → sin lint/tests (última corrida: 123/123 en verde). **Bug editText pendiente de decisión del usuario.**

---

## 🔧 [Fix] — 2026-10-17: editText desfasado + Espacio muerto en presentación clásica (bugs 1 y 2)

### 🎯 Motivo
Los dos primeros bugs detectados en los grupos 3-4, aprobados por el usuario: (1) editar un nodo tras un cambio externo de texto revierte el texto al valor del montaje; (2) la tecla Espacio no avanzaba diapositivas en la presentación clásica (los otros dos modos sí).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/NodeComponent.tsx` | Nuevo `useEffect` ([isEditing]) que hace `setEditText(node.text)` al entrar en edición (:70-73): el textarea siempre parte del texto **actual** del nodo aunque el componente no se remonte (`key={node.id}`). |
| `src/components/PresentationMode.tsx` | Handler de teclado (:530): `e.key === 'Space'` → `e.key === ' '` (el valor real de `KeyboardEvent.key` al pulsar Espacio). |
| `src/components/__tests__/NodeComponent.test.tsx` | Nuevo (2 tests de regresión): al entrar en edición el textarea muestra el texto actual y `Enter` confirma el valor actual (no el del montaje); escribir y `Enter` envía lo tecleado. |
| `src/components/__tests__/PresentationMode.test.tsx` | Nuevo (3 tests de regresión): Espacio (`' '`) avanza diapositiva, Enter avanza y ← retrocede, Esc cierra vía `onClose`. |
| `doc/DESIGN.md` §6 / §10.1 | Bugs marcados 🐛→✅ con fix, líneas y tests. |
| `doc/INTERFACE_SPEC.md` §6.6 | Fila "Espacio": "NO funciona (bug)" → "Corregido 2026-10-17". |

### 🔍 Verificación
- [x] `pnpm lint` (tsc --noEmit): **exit 0**.
- [x] Tests dirigidos: **5/5** en verde (NodeComponent 2 + PresentationMode 3).
- [x] Regresión completa `pnpm test:regression`: **128/128 en 28 archivos** (antes 123/126: +2 archivos, +5 tests).
- [x] Tests escritos para fallar antes del fix (el de editText exige `getByDisplayValue('Cambiado por fuera')`; el de Espacio exigía avanzar con `' '`).

---

## 📚 [Docs] — 2026-10-17: DESIGN §10.5 — atajos de teclado y layouts del lienzo (grupo 5)

### 🎯 Motivo
Grupo 5 acordado (cierre de la sincronización doc↔código por grupos): documentar en DESIGN la superficie de atajos y layouts **enlazando** INTERFACE_SPEC (sin duplicar la tabla canónica §3.6) y el nuevo hallazgo: no existe UI para cambiar el layout.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §10.5 | Nueva sección **"Atajos de teclado y layouts del lienzo"**: atajos (hook `useKeyboardShortcuts` 221 líneas, guardas en orden: escribiendo→solo Esc, modal→solo Esc, F5 toggle de presentación, en presentación el resto inactivo con navegación propia en §10.1/§10.2/§10.3; hints decorativos Ctrl+S y `?` punteados a INTERFACE_SPEC §3.6) + layouts (9 ids de `LayoutType` `types/mindmap.ts:17-26`; motor `computeMindMapLayout` en `layoutEngine.ts` 1940 líneas con `resolveLayoutCollisions` `MAX_PASSES=32` :1378 y `cloudGap=16` :1450; gaps por defecto 54/14/68 :3-5 con override `horizontalGap`/`verticalGap`; `cloudPad=36` :338/:410 y freePosition fallback :595). 🐛 **Gotcha nuevo**: no existe UI para cambiar el layout — la única mención es la prop muerta `onChangeLayout` (`ToolBar.tsx:66`); hoy solo cambia por plantillas, importación `.mm` o JSON directo. |

### 🔍 Verificación
- [x] Todos los valores citados leídos del código: `LayoutType` (9 ids), `MAX_PASSES=32`, `cloudGap=16`, `cloudPad=36`, gaps 54/14/68, 1940 líneas de layoutEngine.
- [x] `onChangeLayout` confirmado por grep como única mención (ToolBar:66, sin uso).
- [x] Sin cambios de código en esta entrada → sin lint/tests adicionales (regresión previa: 128/128).

---

## 🔧 [Fix] — 2026-10-17: ComingSoonModal huérfano eliminado + StatusBar con zoom real + limpieza de props muertas (bugs 3 y 4)

### 🎯 Motivo
Bugs 3 y 4 aprobados: (3) `ComingSoonModal` era **inalcanzable** (`onShowComingSoon` nunca se invocaba) y su contenido ("Próximamente" los modos dinámico/elaborate) era **factualmente obsoleto** — esos modos ya existen y son seleccionables → **se elimina** en vez de cablear (cablear botones de export de imagen a un modal de "presentación próxima" habría sido incorrecto); (4) el StatusBar mostraba `zoom=100`/posición `(0,0)` **hardcodeados** sin importar el estado real del lienzo, y había **17 props muertas** repartidas en ToolBar (15), MenuBar (2) y OutlineView (1: `onUpdateBody`).

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `src/components/Modals/ComingSoonModal.tsx` | **Eliminado** (146 líneas). |
| `src/App.tsx` | Quita import, estado `comingSoonModalData`, referencia en `isAnyModalOpen`, `setComingSoonModalData(null)` en `handleCloseModals`, JSX del modal y `onShowComingSoon` de MenuBar. Nuevos `viewport` state + `onViewportChange={setViewport}` en `MindMapCanvas` y StatusBar con `zoom={Math.round(viewport.zoom*100)}` / `positionX/Y={Math.round(...)}` reales (antes `100`/`0`/`0`). Quita `isOutlineMode` (MenuBar), las 15 props muertas de ToolBar y `onUpdateBody` (OutlineView) de los call-sites. |
| `src/components/MenuBar.tsx` | Quita props `isOutlineMode` y `onShowComingSoon`. Etiqueta de menú Archivo: "Exportar (.mm / HTML / PNG)" → **"Exportar (.mm / HTML)"** (prometía PNG inexistente). |
| `src/components/ToolBar.tsx` | Quita de `ToolBarProps` 15 props muertas: `isOutlineOpen`, `onSave`, `onOpenTemplates`, `onOpenSavedMaps`, `onChangeLayout`, `onChangeTheme`, `onChangeColor`, `onChangeEdgeStyle`, `onChangeEdgeProfile`, `onChangeEdgeWidth`, `onChangeEdgeColor`, `onChangeEdgeDash`, `onResetEdges`, `onOpenIconPack`, `onShowComingSoon`. `title` del botón Exportar: "…HTML Portable / Imágenes" → **"…HTML Portable"**. |
| `src/components/MindMapCanvas.tsx` | Nuevo prop opcional `onViewportChange?: ({zoom,x,y}) => void` + `useEffect` sobre `[zoom, pan.x, pan.y]` que reporta el viewport al padre (para el StatusBar). |
| `src/components/OutlineView.tsx` | Quita prop fantasma `onUpdateBody`. |
| `src/components/__tests__/StatusBar.test.tsx` | Nuevo (3 tests): muestra zoom/posición **reales** provistos (137 %, (−210,84)), defaults solo sin props, nodos/selección. |
| `src/components/__tests__/MenuBar.test.tsx` | Quita `isOutlineMode` del fixture. |
| `doc/DESIGN.md` | §8.5 modales **7→6**; §8.5.7 → "✅ eliminado (histórico)"; §7 MenuBar/ToolBar props muertas → ✅; §7 StatusBar → ✅ zoom/posición cableados; §9 OutlineView → ✅ `onUpdateBody` eliminada; §10 → ✅ gotcha `onStartClassic` resuelto; gotcha §10.5 layouts ajustado (la prop ya no existe); líneas 27/105 sin la excepción `rounded-3xl` del modal borrado. |
| `doc/INTERFACE_SPEC.md` §3.1 / árbol / §9 | Etiqueta PNG corregida + gotcha actualizado (el subtítulo "…e imágenes" del modal **sigue**); `ComingSoonModal.tsx` fuera del árbol; **§9 reescrito** como "resumen verificado" — borrados los atajos ficticios (`Shift+Enter`, `Ctrl+E`, `Ctrl+0`, `Alt+Enter`, "F5 = clásica") y añadidas guardas + `Esc` + `Ctrl+Shift+Z`, con cross-ref a §3.6 (canónico) y DESIGN §10.2/§10.3. |

### 🔍 Verificación
- [x] `pnpm lint` (tsc --noEmit): **exit 0** tras todas las ediciones.
- [x] Tests dirigidos (StatusBar/MenuBar/ToolBar): **10/10**.
- [x] Regresión completa `pnpm test:regression`: **131/131 en 29 archivos** (antes 128/28: +1 archivo, +3 tests).
- [x] Grep final: sin rastros de `ComingSoon`/`comingSoon` en `src/App.tsx` ni en el árbol de componentes.
- [x] Queda **1 gotcha menor documentado** (no fixeado): el **subtítulo** del `ExportImportModal` aún menciona "…e imágenes" (texto interno del modal).

---

## 📚 [Docs] — 2026-10-17: INTERFACE_SPEC §11/§12 — árbol de componentes y ficheros reconstruido desde el disco

### 🎯 Motivo
El árbol de arquitectura del spec estaba **desfasado del código real**: listaba 3 ficheros **fantasma** (`presentation/PresentationControls.tsx`, `presentation/presentationThemes.ts`, `canvas/CanvasZoomControls.tsx` — ninguno existe; los controles de presentación son inline en `PresentationMode.tsx` y el zoom real es `molecules/ZoomControls.tsx`) y omitía **~20 ficheros reales** (subgrupo `molecules/node/`, carpeta `Presentation/` completa, `templates/MainEditorLayout`, 6 átomos, 4 moléculas, 3 organismos de canvas y 4 utils). Además, la sección §10.7 decía "9 temas" cuando hay **8**.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/INTERFACE_SPEC.md` §11 | Diagrama Atomic Design reconstruido: organismos de página con **líneas reales**, organismos internos corregidos (`canvas/` con sus 4 ficheros reales; `Presentation/` (elaborate) con sus 3; `templates/MainEditorLayout`), moléculas completadas (7 + subgrupo `node/` con sus 4), átomos completados (11: +Badge/Button/IconButton/Input/ModalBackdrop/ErrorBoundary), utils completados (+mapTheme/uiTheme/presentationGenerator/spatialPresentationGenerator). Cabecera de nota explicando las correcciones. |
| `doc/INTERFACE_SPEC.md` §12 | Árbol de ficheros **reconstruido desde el disco** con nº de líneas reales de cada fichero (700 App, 1584 MindMapCanvas, 1607 PresentationMode…), las 6 carpetas nuevas (`atoms/` ×11, `molecules/` ×7 + `node/` ×4, `organisms/canvas/` ×4, `organisms/Presentation/` ×3, `templates/`, `Modals/` ×6), `test/setup.ts`, los 4 utils que faltaban y el recuento de **tests: 29 suites / 131 tests**. Se eliminan los 3 ficheros fantasma. |
| `doc/INTERFACE_SPEC.md` §10.7 | Encabezado "9 temas globales" → **"8 temas globales"** + nota de corrección (`THEMES` en `themes.ts:15-135`). |

### 🔍 Verificación
- [x] Árbol reconstruido con `Get-ChildItem -Recurse` (excluyendo tests) + recuento de líneas real por fichero.
- [x] Los 3 ficheros fantasma confirmados ** inexistentes** por listing y grep previos (§6 y §6.5 del propio spec ya lo advertían).
- [x] **8 temas** y **12 fondos** (`BACKGROUND_PRESET_THEMES`) verificados leyendo `themes.ts`; los 8 fondos (`background:`) de la tabla §10.7 cotejados uno a uno con el código (#f8fafc, #ffffff, #0f172a, #f0fdf4, #fffbeb, #fafafa, #0a2540, #fffdf5).
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).

---

## 📚 [Docs] — 2026-10-17: INTERFACE_SPEC §10 — catálogo de funciones verificado subsección a subsección

### 🎯 Motivo
Última sección grande del spec sin sincronizar:§10 (Catálogo de Funciones Avanzadas, 12 subsecciones) contenía datos inventados o imprecisos (exportaciones inexistentes, filtros no implementados, propagación mal descrita). Se verificó **cada dato contra el código**.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/INTERFACE_SPEC.md` §10.1 | Orden corregido para coincidir con `NodeShape` (`types/mindmap.ts:1-11`): **hexagon antes que pill** (el spec los tenía invertidos); nota del límite 68% del hexágono. |
| `doc/INTERFACE_SPEC.md` §10.8 | Reescrito: el hook `useSearchFilter` (51 l.) **solo implementa 3 filtros** — Texto (`query` sobre **text+note, NO body**; el spec decía "titulo, cuerpo y notas"), Tags (exacto) y Progreso (`minProgress`). Los campos `icon`, `hasNote`, `hasLink`, `showAncestors`, `showDescendants` existen en `FilterOptions` (`types:340-349`) pero **el hook los ignora**; los dos últimos se resetean en `App:324`/`store:128-129` sin usarse. + `availableTags`. |
| `doc/INTERFACE_SPEC.md` §10.10 | Reescrito: el spec viejo listaba **.svg y .png que no existen** → formatos reales = **4** (`.mm`, `.html` portable, `.md`, `.json`; `ExportImportModal.tsx:49-69`) + import real `accept=".mm,.json,.xml"` (:276) con fallback XML. |
| `doc/INTERFACE_SPEC.md` §10.11 | Añadido gotcha: `isFreeFloating`+`freePosition` (`types:161-162`, `layoutEngine:593`, fallback canvasCenter +200/−150) **no tiene UI** — solo alcanzable vía plantillas/importación/JSON. |
| `doc/INTERFACE_SPEC.md` §10.12 | Corregido: la propagación a hijos es **recursiva** (`applyRecursively`, `store:532-541`), **no "hijos directos"**; hermanos excluye el nodo fuente y veta raíz/padre con 1 hijo; **bundle exacto de 25 campos** (`extractNodeStyleBundle`, `store:79-109`) listado campo a campo; explícito lo que **no** se propaga (cuerpo, nota, tags, iconos, imágenes, progreso, enlace, nube, plegado). |
| `doc/INTERFACE_SPEC.md` §10.2-§10.7, §10.9 | Verificados **sin cambios** (ya correctos): 500/10 y 300/5 (FormatTab:120-134); bgType 5 modos con defaults exactos (16 presets ColorPicker:13-16, Color2 panel #1d4ed8/FormatTab:199 vs render #8b5cf6/NodeBackgroundRenderer:51, patrón 8-40 def 16 y 10-100% def 40 decimal/FormatTab:269-285, sin `fit` en panel/FormatTab:358-360); imagen 60-500 def 140/ContentTab:329-332; 5 aristas + 4 perfiles/`types:13-15`; 12 fondos y 8 temas; historial 40/`store:159`. |

### 🔍 Verificación
- [x] Cada cifra leída del código: `NodeShape` (10), sliders y defaults (FormatTab/ContentTab), `DEFAULT_PRESETS` (16), gradientes (FormatTab:194-210 + NodeBackgroundRenderer:50-51), tipos de arista/perfil (`types:13-15`), `BACKGROUND_PRESET_THEMES` (12), `THEMES` (8), `slice(-40)`.
- [x] §10.8: hook leído entero (51 l.) — solo `query`/`tag`/`minProgress` en el `useMemo`.
- [x] §10.10: export/import reales verificados por grep en `ExportImportModal.tsx` (sin rastro de svg/png).
- [x] §10.11: grep de setters de `isFreeFloating` → 0 en componentes.
- [x] §10.12: `extractNodeStyleBundle` (:79-109) y ambos handlers (:519-588) leídos completos.
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).
