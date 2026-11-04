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

---

## 📚 [Docs] — 2026-10-17: DESIGN §10 — re-auditoría de los 3 modos de presentación (referencias y datos)

### 🎯 Motivo
El usuario señaló que la documentación de los modos de presentación "no está bien documentada". Se re-auditó **§10 completa del `DESIGN.md`** (wiring + §10.1 clásica + §10.2 dinámica + §10.3 elaborate) leyendo los 11 ficheros implicados (~4.900 líneas). El **contenido funcional** (descripciones, teclados, parámetros, gotchas) era correcto en su práctica totalidad; los errores estaban en **referencias de línea desfasadas** (el código había cambiado tras la última sincronización), un recuento de líneas obsoleto, una ruta incompleta y 2 imprecisiones menores.

### ✏️ Cambios
| Zona | Corrección |
|------|------------|
| §10 Wiring | Referencias de `App.tsx` **todas desfasadas** → renumeradas: estado `:101→:100`, MenuBar `:180-189→:176-185`, ToolBar `:284-293→:278-287`, dinámica `:459→:421`, slot clásica `:630-641→:593-604`, elaborate `:643-649→:606-612`, gotcha `(App:180-188,279-287)→(App:176-185, 278-287)`; `MindMapCanvas:1536→:1543` (guard del MiniMap); ruta completa de `MainEditorLayout` (`components/templates/`) — sus líneas 39-65 ✓ eran correctas. |
| §10.1 Clásica | Recuento **1492 → 1607 líneas** (`PresentationMode.tsx`); `App:634-638→:597-601` (`onEditNode`). Internas verificadas correctas: temas `:54-159`, modal `:712-1002`, radar `:915`, Space `:530`, themeId `:308`. |
| §10.2 Dinámica | 13 referencias de `MindMapCanvas.tsx` renumeradas: slides `:182-186→:188-193`, update `:206→:211`, undo/redo `:193-232→:201-244` (**+ dato nuevo: profundidad máx. 25**, `slice(-25)`), teclado `:345-387→:352-389`, drag `:471+→:478+`, cursor `:860-862→:867-869`, salto a marco existente `:1403-1407→:1410-1414`, cámara **`(:878)→(:269-307)` + transición `:885`**, atenuación `:1366→:1373-1382` (**+ valor real: opacity 0.18, transición 400ms**), capa de marcos `:1485-1499→:1492-1503` (**+ nombre real: componente `CanvasDrawingOverlay`**), wiring del HUD `:1500-1533→:1506-1540`. **Imprecisión corregida**: el atajo `N` (:380-382) *no* depende del contenido — alterna el estado siempre; lo que no se renderiza es el cajón sin contenido (IIFE :323-340). |
| §10.3 Elaborate | `App:647→:610` (`setMindMap` sin `pushHistory`); escala de tarjetas de nota preciseada (×0.95 espiral/pila/matriz, ×0.9 randómico, ×0.8-1.1 constelación — antes decía ×0.95 genérico). Verificadas correctas: teclado `:182-226`, imports muertos `:14-23`, `SlideDetailModal:30-39`, y **todos** los parámetros del generador (0.48 rad/+180, escala mín 0.85, semilla 42, r=1200/1950, 880×580, offsets ×16/×14). |

### 🔍 Verificación
- [x] Recuentos de línea reales por `Get-Content .Count` (PresentationMode 1607, HUD 489, Elaborate 786, Card 373, Modal 277, generators 212/495, MindMapCanvas 1584, App 700, shortcuts 221).
- [x] Ficheros leídos **enteros**: `CanvasPresentationHUD.tsx`, `ElaboratePresentationSystem.tsx`, `SpatialSlideCardComponent.tsx`, `SlideDetailModal.tsx`, `presentationGenerator.ts`, `spatialPresentationGenerator.ts` — descripciones feature-a-feature contrastadas (top bars, pill, filmstrip, spotlight z-60/opacity 0.2, trayectoria Q con gradiente, patrones size 24/opacity 0.45, handles de transformación, 8 temas del modal, sliders -180..180 y 0.5-2.5/0.05).
- [x] `MainEditorLayout.tsx` localizado en `src/components/templates/` (no `src/templates/`).
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).

---

## 📚 [Docs] — 2026-10-17: DESIGN §9 — auditoría del Panel de Esquema (OutlineView)

### 🎯 Motivo
El usuario preguntó si el "panel de esquema o outliner" estaba bien documentado. Se auditaron las secciones de `DESIGN.md` sobre `OutlineView` (estilos `:465` + contrato funcional `:467-474`) contra el fichero completo `src/components/OutlineView.tsx` (463 líneas). El **contenido funcional era correcto** (cabecera, búsqueda, fila, edición en línea, recursión, gotchas a-d); se corrigieron 3 desajustes y se añadieron 2 matices omitidos.

### ✏️ Cambios
| Archivo | Modificación |
|---------|--------------|
| `doc/DESIGN.md` §9 (estilos) | Hover de fila `hover:bg-slate-50` → **`hover:bg-[var(--sp-hover)]`** (`OutlineView.tsx:156`, token de UI tras claro/oscuro/sepia); + `font-medium shadow-2xs` en el estado seleccionado; ref del `aside` `:345-350` → `:344-350`. |
| `doc/DESIGN.md` §9 (contrato) | Recuento **464 → 463 líneas**; ref de la búsqueda `:102-123` → **`:101-122`** (useMemo `matchedNodeIds`); + aclaración de que **la selección tiene prioridad** sobre el resaltado de búsqueda y que la fila de input se pinta con `showSearch || searchQuery`; ref del chequeo de plegado `:335` → **`:334`**; título: la raíz **siempre** `font-bold text-[13px]` y defaults YIQ precisados (`#1e293b` slate-800 / `#0f172a` slate-900 en raíz); **gotcha nuevo (e)**: sin resultados el árbol queda **completamente vacío** (la raíz no entra al set si nada matchea, no hay mensaje de "sin coincidencias"). |

### 🔍 Verificación
- [x] `OutlineView.tsx` leído completo (463 l.): clases de `aside` (:344-349), header (:352-426), búsqueda (:101-122), fila (:148-331), edición (:213-233), recursión (:334-338), footer (:457-460) cotejadas una a una.
- [x] Props interface sin `onUpdateBody` → gotcha (a) confirmado vigente.
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).

---

## 📚 [Docs] — 2026-10-17: DESIGN §10.1 — presentación clásica auditada y ampliada (UI de header/footer)

### 🎯 Motivo
El usuario preguntó qué decía `DESIGN.md` sobre la presentación clásica y, al compararlo con capturas reales, la sección §10.1 resultó **incompleta** (no describía el header derecho ni el footer) y con **2 errores**. Auditoría de `PresentationMode.tsx` completo (1607 líneas).

### ✏️ Cambios
| Zona | Corrección |
|------|------------|
| §10.1 Errores | (1) **Radar minimapa**: decía "esquina inferior" → real **centro superior** (`fixed top-2 left-1/2 -translate-x-1/2 z-40`, `:1430-1432`) — el doc había copiado el label del modal, que a su vez **miente** (gotcha nuevo). (2) Icono de **"Volver"**: decía `CornerLeftUp` → real **`CornerUpLeft`** (`:668`); `CornerLeftUp` es el del botón "Inicio: padre" del footer (`:1376`). |
| §10.1 Header | **Nuevo detalle**: 2 clusters — izquierda (badge "Modo Presentación Clásica" `Sparkles` + badge de fase con icono `BookOpen`/`FileText`/`GitBranch` y paginación "(Parte X/Y)") y derecha (Volver, **"Editar"** `SlidersHorizontal` con estado activo, **contador `n / total`** `font-mono hidden sm:inline`, `X` salir). |
| §10.1 Footer | **Nuevo bloque completo**: cluster izq. *Anterior* + *Inicio: {padre}*; centro **dots clicables** por slide (activo `w-6`, salto directo); cluster der. *Siguiente Tema* (púrpura) + *Siguiente* (azul). |
| §10.1 Render por fases | **Nuevo bullet**: `body` (breadcrumb clicable, grid imagen 5/7 col, escalas de título, chips progreso/tags), `notes` (barra de contexto + `MarkdownView isDark`), `children` (grid 3 col, chip "Nota adjunta", bloque de **conectores máx. 3** `slice(0,3)` que saltan al destino). |
| §10.1 Nav + gotchas | Nav ampliada (`Backspace` con condición `(altKey || !shiftKey)`, `E`, guard INPUT/TEXTAREA, dots). **Gotchas nuevos**: (a) `onUpdateNode` es prop muerta (App la pasa en `:602`, el componente no la desestructura); (b) 4 imports muertos (`ArrowUpRight`, `MapPin`, `Eye`, `EyeOff`); (c) label "MiniMapa en Esquina Inferior" engañoso; (d) `getContrastSafeColor` whitelist fija de 6+6 hex. |

### 🔍 Verificación
- [x] Fichero leído **entero** (1607 l.): header `:613-709`, modal `:712-1002`, main `:1004-1346`, footer `:1349-1428`, radar `:1430-1604`, teclado `:517-548`, generación de slides `:361-437`.
- [x] Iconos confirmados por grep (`CornerUpLeft`=2 usos, `CornerLeftUp`=2, etc.); prop muerta confirmada leyendo `App:594-603` y la desestructuración `:302-306`.
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).

---

## 📚 [Docs] — 2026-10-17: DESIGN §10.3 — presentación elaborate auditada y ampliada (top bar + bottom HUD)

### 🎯 Motivo
El usuario preguntó qué decía `DESIGN.md` sobre la presentación **elaborate** y, al compararlo con capturas reales, §10.3 resultó **incompleta**: no describía el top bar completo ni el bottom HUD, y llamaba "idénticos a §10.2" unos controles que no lo son. Auditoría de `ElaboratePresentationSystem.tsx` (786 l.) + `SlideDetailModal.tsx` (header/footer).

### ✏️ Cambios
| Zona | Corrección |
|------|------------|
| §10.3 Top bar | **Nuevo bullet** (`:384-504`): badge gradiente "Presentación Elaborada (Prezi Espacial)", título del mapa, **mode switcher "Editor del Lienzo" (indigo) ↔ "Presentar (F5)" (emerald)** (`:396-421`), grupo derecho **solo en editor** ("Acomodar:" `hidden md:flex` + "Nueva Tarjeta", `:425-494`) y `X` "Salir al Mapa Mental (ESC)" (`:496-502`); default `isPresenterMode=false` (`:51`). |
| §10.3 Bottom HUD | **Nuevo bullet** (`:668-769`): línea de progreso gradiente violeta→azul con glow (`:670-677`); filmstrip default `true` (`:54`) con chips activo `bg-blue-600/30`, badge `#orden`, título `max-w-[130px]` y clic `setSelectedSlideId`+`flyCameraToSlide`; barra `h-12` con **contador `n / total` + `• título`** (`:711-715`), *Anterior* **con wrap**, **`Compass` conmutador** "Volver al foco" ↔ "Vista Panorámica (O)" (`:730-745`), *Siguiente* gradiente azul→índigo **con wrap** (`:747-757`) y **toggle filmstrip `Layers`** (`:761-767`). |
| §10.3 Imprecisión | Se corrige **"controles idénticos a §10.2"** → elaborate **no tiene botón de Notas (N)**; solo Previo/Compass/Siguiente + toggle filmstrip. |
| §10.3 Presentador + Editor | Añadido: en presentador **se ocultan** zoom flotantes (`:640`) y controles de editor del top bar; "Nueva Tarjeta"/"Acomodar:" aclarados como **controles del top bar, solo editor**. |
| §10.3 SlideDetailModal | Ampliado: overlay `backdrop-blur-md` + card `max-h-[90vh]` (`:67-69`), **header** con badge `Slide #{order}` + h2 fijo "Editar Diapositiva (Estilo Clásico)" + `X` (`:73-86`), footer "Cancelar"/"Guardar Cambios" (`:263,271`), refs de "Vista Previa" (`:138`), "Rotación Espacial" (`:226`), "Escala de Tarjeta" (`:240`); 🐛 nuevo: **`contentAlign` por defecto del modal = `'left'`** (`:37`), no `'center'`. |
| §10.3 Cámara | Ampliado: botones flotantes **solo `!isPresenterMode`** (`:640-664`) con clamps exactos (`Math.min(z*1.2, 3.0)` / `Math.max(z*0.8, 0.15)`). |

### 🔍 Verificación
- [x] `ElaboratePresentationSystem.tsx` leído en zonas clave: top bar `:376-504`, zoom/flotantes `:637-664`, bottom HUD `:665-771`; estado `:40-68` (grep `isFilmstripOpen` default `true`).
- [x] `SlideDetailModal.tsx` leído `:55-99` (overlay/header) + refs grep de sliders y footer (`:138,226,240,263,271`).
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).

---

## 📚 [Docs] — 2026-10-17: DESIGN §10.2 — presentación dinámica completada (capa de marcos + correcciones)

### 🎯 Motivo
Tras revisar las capturas del usuario del modo dinámico, §10.2 presentó lagunas: el componente `CanvasDrawingOverlay` (justo lo que se ve en el editor de marcos) estaba apenas mencionado, el **orden del pill de herramientas estaba invertido** respecto al DOM real y faltaban los tooltips/tooltips del HUD. Auditoría de `CanvasDrawingOverlay.tsx` (94 líneas, leído completo) + grep de tooltips en `CanvasPresentationHUD.tsx`.

### ✏️ Cambios
| Zona | Corrección |
|------|------------|
| §10.2 Capa de marcos | **Nuevo bullet completo**: rectángulos `rounded-3xl border-2` — seleccionado `border-blue-400 bg-blue-500/10` + glow + z-30, resto `border-dashed border-slate-500/40 bg-slate-800/5` z-15; todo `pointer-events-none` (**nodos siempre clicables**); **badge "Slide {order}" escalonado** (`16 + ((order−1)%4)×32` px) clicable para enfocar (ignorado en modo dibujar), con `• {título}` si está activo o hay ≤8 marcos; **caja en curso** "Nuevo marco (W × H)" con icono `Crop` (`:41-91`). |
| §10.2 Orden pill | **Corregido**: el doc listaba navigate → pick_nodes → draw_frame; el orden DOM real es **"1. Seleccionar Nodo" (:209) → "2. Dibujar Recuadro" (:220) → "Navegar / Mover" (:231)** (coincide con las capturas), precedido del label **"Crear marco:"** (`:200`). |
| §10.2 Top bar | Añadidos los tooltips reales: "Deshacer (Ctrl+Z)"/"Rehacer (Ctrl+Y / Ctrl+Shift+Z)", "Empezar desde cero (Eliminar todos los marcos)" (`:160`), "Generar marcos según la jerarquía" + label "Auto-generar" `hidden sm:inline` (`:175-179`), "Salir de la presentación (ESC)" (`:188`). |
| §10.2 Bottom HUD | Añadidos tooltips: "Anterior (← o Retroceso)" (`:435`), **"Vista General (O / Home)" ↔ "Volver al foco"** (`:444`), "Siguiente (→ o Espacio)" (`:455`), "Notas del Orador (N)" (`:468`), "Tira de Diapositivas" (`:479`); X staged con title "Deseleccionar todos" (`:295`). |
| §10.2 Banner | Texto completo del estado vacío (`:313-315`) con las instrucciones de "1. Seleccionar Nodos" / "2. Dibujar Recuadro". |
| §10.2 Teclado | El final del bullet ahora referencia el nuevo "Capa de marcos del editor" en vez del componente suelto. |

### 🔍 Verificación
- [x] `CanvasDrawingOverlay.tsx` leído **entero** (94 líneas).
- [x] Tooltips y orden del pill verificados por grep en `CanvasPresentationHUD.tsx` (`:114-479`).
- [x] Sin cambios de código → sin lint/tests (regresión vigente: 131/131).

---

## 📚 [Docs] — 2026-10-17: Barrido de sincronización — TODA la documentación contra el código

### 🎯 Motivo
Tras las auditorías de hoy (§9 OutlineView, §10.1/§10.2/§10.3 presentaciones), el usuario pidió **actualizar toda la documentación**. Los otros 4 docs (`README.md`, `PROJECT_ARCHITECTURE.md`, `GUIA-ESTUDIO.md`, `INTERFACE_SPEC.md`) y `AGENTS.md` arrastraban afirmaciones ya corregidas o falsas (ComingSoonModal, exportación PNG/SVG inventada, atajos `Ctrl+0`/`Ctrl+E` ficticios, StatusBar hardcodeado, conteo de tests de hace semanas). Regresión ejecutada para confirmar el conteo real.

### ✏️ Cambios por fichero
| Fichero | Correcciones |
|---------|--------------|
| `README.md` | Badge de tests **87/87 → 131/131** · árbol sin `ComingSoonModal` · **tabla de exportación sin `.svg`/`.png`** (no existen; añadido aviso "usar Imprimir/PDF del HTML") · bloque de búsqueda reducido a lo real (texto **título+notas**, tags exactos, progreso — **sin** icono/ancestros/enlaces) · conectores: flecha **siempre `end`** (sin selector) · imagen adjunta: posiciones reales y ancho **60–500px** · tamaño 0–500/0–300 (0 = auto) · filmstrip sin "ordenamiento" (no existe) · **atajos ficticios `Ctrl+0` y `Ctrl+E` eliminados**, F5 = alternar · "Exportación a 6 formatos" → 4. |
| `doc/PROJECT_ARCHITECTURE.md` | StatusBar **ya no hardcodeado** (real vía `onViewportChange`, fix 2026-10-17) · modales **7 → 6** · **§5 Clásica**: el generador `presentationGenerator.ts` es de la **dinámica** (la clásica genera slides en el componente) · HTML: `print/PNG` → "Imprimir/PDF" (`window.print`) · borrada la línea **"SVG/PNG: caja exacta"** (no hay tal export) · Cookbook marcos: colores **indigo → blue reales** · Cookbook tema clásico: forma real de `PresentationThemeConfig` (13 campos) · hooks: sin `Ctrl+0` (ficticio) y `useSearchFilter` **sin** ancestros/descendientes · nota 5173 obsoleta retirada. |
| `doc/GUIA-ESTUDIO.md` | MenuBar props sin `onShowComingSoon` · StatusBar: nota "zoom=100/0,0 pendiente cablear" → **cableado real** · **"Los 7 modales" → "Los 6 modales"** sin la excepción de banner de ComingSoon · su entrada sustituida por nota de eliminación. |
| `doc/INTERFACE_SPEC.md` | Diagrama ASCII: "(Zoom y Posicion son fijos… hardcodeados)" → **valores reales** (fix 2026-10-17). |
| `AGENTS.md` | Nota obsoleta "README's 5173 reference is stale" retirada (el README ya dice :3000). |

### 🔍 Verificación
- [x] `pnpm test:regression`: **131/131 tests en 29 archivos** (badge y contadores del README ajustados al resultado real).
- [x] Hechos verificados en código antes de escribir: `useKeyboardShortcuts.ts` completo (sin `Ctrl+0`/`Ctrl+E`), `useSearchFilter.ts` (solo text+note/tag/minProgress), `PresentationThemeConfig` (`PresentationMode.tsx:33-48`), `StatusBar.tsx` con `positionX/Y` reales, sin exportadores PNG/SVG en `src/utils` (solo `window.print` en `htmlExporter.ts`).
- [x] Grep final en los 7 `.md`: los únicos "ComingSoon"/"87 tests"/"Ctrl+0" restantes son menciones **históricas correctas** (CHANGELOG, §8.5.7, notas "eliminado 2026-10-17").
- [x] Sin cambios de código → sin lint (la suite completa ya corrió: 131/131).

---

## 🔍 [Docs] — 2026-10-17: Auditoría de la pestaña "Iconos" (§8 IconsTab) contra código

### 🎯 Motivo
El usuario preguntó qué decía `doc/DESIGN.md` de la pestaña Iconos y pidió proceder a la auditoría (patrón pregunta → auditoría → docs). Contrato §8 líneas 370-383 revisado punto por punto contra el código real.

### 🔎 Auditoría (leídos completos: `src/components/organisms/toolpanel/IconsTab.tsx` 1-314, `useMindMapStore.ts:590-664`, grep de `App.tsx`)
**✅ Correcto — todo lo demás coincide al detalle:**
- 314 líneas exactas · 1 `CollapsibleSection` abierta por defecto (`isStyleSectionOpen`), sin barra Desplegar/Plegar · badge dot `w-3.5 h-3.5` solo con `iconColor`.
- `ColorPicker` "Tinte del Icono" con Reset → `undefined` · paleta Sugeridos: **7** dots `w-4.5 h-4.5` con los hex exactos, **sin ring**, enlace "Original" (`ml-auto`) solo si hay color.
- Slider "Tamaño del Icono" `iconSize || 14`, **10-36 step 1**, badge `{n}px` / `"14px (Estándar)"`, Reset → `undefined`.
- Propagación `grid-cols-2` → store: bundle `icons` (clon o `[]`) + `iconColor/iconSize/iconPosition` en `useMindMapStore.ts:600-605`/`645-650` ✓ (refs exactas); guardas verificadas: hijos recursivo con veto sin hijos; hermanos veto raíz/padre ≤1 hijo; `pushHistory` + `saveCurrentMap`.
- "Iconos Asignados" solo con `icons.length > 0`, "Quitar todos" → `icons: []` (no `undefined`) ✓, chips `bg-white border-blue-200` + `renderNodeIcon(id,'w-3.5 h-3.5',iconColor)` + `X`.
- Buscador `pl-8.5` con placeholder `Buscar entre {TOTAL_VECTOR_ICONS_COUNT}+ iconos...` y `searchVectorIcons` en `useMemo` · categorías `overflow-x-auto` con `CATEGORY_EMOJIS` de **13** entradas y fallback `•` · **8** quick tags (labels y queries exactos) · grid `grid-cols-6 max-h-[300px]` con `slice(0,120)` y activo `bg-blue-600 … ring-2 ring-blue-400 scale-105` · botón "Ver Galería Completa de Iconos" `w-full border-blue-200`.

**❌ 2 desfases corregidos (solo refs de línea de `App.tsx`, desplazadas por los cambios de hoy):**
| Cita | Decía | Ahora |
|------|-------|-------|
| Cableado propagación | `App.tsx:486-487` | **`App.tsx:449-450`** |
| Cableado IconPackModal | `App.tsx:614` | **`App.tsx:577`** |

**➕ Precisión añadida:** los botones de propagación son **condicionales** (`{onApply… && …}`, solo si prop), como ya documenta el botón de galería.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/DESIGN.md` §8 (líneas 378 y 383) | Refs `App.tsx` actualizadas a `:449-450` y `:577` + nota "solo si prop" en los botones de propagación. |

### 🔍 Verificación
- [x] `IconsTab.tsx` leído completo (314 líneas = las que cita el doc).
- [x] `useMindMapStore.ts:590-664` — bundle y guardas coinciden con lo escrito.
- [x] Grep `App.tsx`: `onApplyIconsToChildren/Siblings` en `:449-450`, `onOpenIconPackModal` en `:577` (un solo punto de cableado cada uno).
- [x] `INTERFACE_SPEC.md` §5.4 y `PROJECT_ARCHITECTURE.md` (IconsTab) revisados: **sin refs obsoletas**, no requieren cambio.
- [x] Sin cambios de código → sin lint/tests.

---

## 🔍 [Docs] — 2026-10-17: Corrección — el layout SÍ tiene UI (§10.5 contradecía §8 y el código)

### 🎯 Motivo
Al responder "qué dice DESIGN sobre la pestaña Mapa" (§8 ThemeTab, 5 secciones, 2026-10-17) se detectó una **contradicción interna** del propio `doc/DESIGN.md`: §8 punto 2 documenta la sección "Diseño del Árbol (Layout)" con los 9 layouts y `onUpdateMapLayout`, mientras §10.5 afirmaba *"no existe UI para cambiar el layout — nunca la hubo"* y que solo cambiaba por plantillas/importación/JSON. El usuario aprobó proceder.

### 🔎 Auditoría (grep en `src`)
- `onUpdateMapLayout` **cableado de punta a punta**: `App.tsx:456` (handler `onUpdateMapLayout={(layout: LayoutType) => …}`) → `ToolPanel.tsx:37,240` → `ThemeTab.tsx:36,76,208-214` (LAYOUT_OPTIONS :59-69, botones con `onClick={() => onUpdateMapLayout(opt.id)}`).
- Tests que lo ejercitan: `organisms/toolpanel/__tests__/ThemeTab.test.tsx` y `__tests__/ToolPanel.test.tsx`.
- **Causa raíz del error**: el grep original de la auditoría §10.5 (entrada CHANGELOG previa) solo buscaba `onChangeLayout` — la **prop muerta del ToolBar**, eliminada 2026-10-17 — y no `onUpdateMapLayout`. `INTERFACE_SPEC.md` §5.6 sí lo documenta correctamente ("Layout: 9 algoritmos con iconos").
- Barrido en los 7 `.md`: el único claim falso era `DESIGN.md:574`; las menciones del CHANGELOG histórico se conservan como registro, y `INTERFACE_SPEC:550` (sin UI para **nodos libres**) es correcto y distinto.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/DESIGN.md` §10.5 | Gotcha "no existe UI para cambiar el layout" → **✅ Gotcha corregido**: el layout sí tiene UI (ThemeTab "Diseño del Árbol", 9 botones, `onUpdateMapLayout` App:456 → ToolPanel:37,240 → ThemeTab:36,76,208-214 + tests); lo inexistente es el selector en el ToolBar (`onChangeLayout`, prop muerta); se conserva la nota de que plantillas/importación `.mm`/JSON también lo cambian.

### 🔍 Verificación
- [x] Grep `onUpdateMapLayout|LAYOUT_OPTIONS` en `src/` → 11 coincidencias entre App, ToolPanel, ThemeTab y 2 ficheros de tests.
- [x] §8 (ThemeTab punto 2) y §10.5 ahora coherentes entre sí y con `INTERFACE_SPEC` §5.6.
- [x] Sin cambios de código → sin lint/tests.

---

## 📚 [Docs] — 2026-10-17: Barrido de sincronización doc↔código (refs de línea y recuentos obsoletos)

### 🎯 Motivo
Segundo barrido completo del día. Los fixes de hoy (eliminación de `ComingSoonModal`, limpieza de props muertas en MenuBar/ToolBar, fix de Zoom/Posición en StatusBar con `onViewportChange`, etc.) **encogieron/desplazaron** `App.tsx` (740+ → **700 líneas**) y otros ficheros, dejando obsoletas decenas de referencias de línea y varios recuentos citados en la documentación. El usuario pidió "actualiza toda la documentación".

### 🔎 Auditoría (lectura directa, sin suposiciones)
- Recuentos reales por `Get-Content .Count` de los 40 ficheros citados en los docs (componentes, modales, hooks, utils, tipos).
- Cada ref de línea dudosa verificada por `grep`/`read` del fichero actual: `App.tsx` completo por tramos (MenuBar :155-256, ToolBar :258-313, FilterBar/Outline :315-348, canvas :349-438, ToolPanel :439-578, StatusBar/presentación/modales :580-693), `MindMapCanvas` (teclado :352-394, menú contextual :640-673 + wrapper :876, cadena de aristas :1265-1281, isHighlighted :1373, marco-existente :1410-1414, DrawingOverlay :1492-1503, HUD :1508/1538, MiniMap :1544), `NodeComponent` (:66/:70-74/:77), `ToolBar` (:192/:285/:407/:526), `MenuBar` (6 dropdowns :158-495), `ToolPanel` (:63-71/:234-266), `layoutEngine` (:1378/:1450), `ShapeSelector` (ruta real `molecules/` + 123 l.).
- Hallazgos: 34 refs/valores desfasados en DESIGN, 5 recuentos en GUIA-ESTUDIO, 5 en INTERFACE_SPEC, 1 comentario de código obsoleto. `README.md` y `PROJECT_ARCHITECTURE.md` **sin desfases** (ya correctos tras el barrido de la mañana). Coherencia interna: §7/§8/§10 del DESIGN ahora citan rangos que existen (antes había citas hasta `:736` en un fichero de 700).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/DESIGN.md` (34 refs) | **Recuentos**: NodeComponent 203→**211**, MenuBar 562→**558**, ToolBar 659→**643**, TemplatesModal 606→**607**, IconPackModal 370→**395**, layoutEngine ~1900→**1940**. **App.tsx** (tras reflow): no-op formas :232-234→**:227-229**, fallback temas :138→**:135**, arranque presentaciones :180-189→**:176-185**, onClearFilter :360-362→**:323-325**, bloque ThemeTab :488-598→**:440-578** (ToolPanel :234-255→**:234-266**), Reset bg :562-573→**:525-536**, onUpdateMapBackground :552-561→**:515-524**, adaptador espaciado :590-598→**:553-561**, ShortcutsModal :191→**:186**, ConnectorModal :435/:201,297→**:397/:196,289**, import :681-685→**:637-641**, plantillas :696-700→**:652-656**, loadMap :707-711→**:663-667**, onNewMap :712-721→**:668-677**, submit conector :729-736→**:685-692**, montaje :724-737→**:680-693**, hooks :131-134→**:128-131**. **MindMapCanvas**: key :1372→**:1379**, teclado :345-387/:352-389→**:352-394**, menú contextual :633-677→**:640-673**, wrapper onContextMenu :869→**:876**, cadena aristas :1258-1274→**:1265-1281** y color :1270→**:1277**. **NodeComponent**: useEffect :67-73→**:70-74**, ternario :69→**:77**. **ToolBar**: popover :423,542→**:407,526**, móvil :301→**:285**, grupo negrita :208→**:192**. **MenuBar dropdowns**: :162,217,257,316,434,499→**:158,213,253,312,430,495** + aclaración de que **solo el menú Archivo** tiene `animate-in` (los otros 5 dropdowns se pintan sin animación). |
| `doc/GUIA-ESTUDIO.md` (5) | Recuentos: layoutEngine 1861→**1940**, ToolBar 659→**643**, ToolPanel 262→**272**, NodeComponent 199→**211**, MindMapCanvas 1577→**1584**. |
| `doc/INTERFACE_SPEC.md` (5) | Fuente MenuBar 562→**558**; `App:159-168`→**:155-164** (Nuevo Mapa), `App:172-173`→**:169** (Importar), `App:634-638`→**:597-601** (Editar en Lienzo); ruta y contenido de `ShapeSelector` verificados correctos (`molecules/`, 123 l.). |
| `src/components/ToolPanel.tsx` | Comentario interno del adaptador de espaciado: ref `App.tsx:590` → **`App.tsx:553`** (solo comentario, sin cambio de comportamiento). |

### 🔍 Verificación
- [x] `pnpm lint` (tsc --noEmit) tras tocar ToolPanel.tsx → exit 0.
- [x] Cada valor/referencia citada releída del código; DESIGN §7/§8/§9/§10 interno coherente y con `INTERFACE_SPEC`/`GUIA-ESTUDIO`.
- [x] `README.md` y `PROJECT_ARCHITECTURE.md`: grep sin números obsoletos (ya sincronizados en el barrido matinal).

---

## 📚 [Docs] — 2026-10-17: Nuevo `doc/FEATURE_TREE.md` (árbol de características funcional + por interfaz)

### 🎯 Motivo
El usuario preguntó qué es un árbol de características y pidió dos para FreeMind Map Studio: uno **funcional** (capacidades del producto) y otro **basado en la interfaz** (superficie por superficie). Después ordenó añadir ambos a la documentación.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/FEATURE_TREE.md` | **Nuevo**. Intro (qué es un feature tree, eje de cada árbol), **§1 árbol funcional** (ediciones/estilo/lienzo/presentaciones/persistencia/interfaz con hojas atómicas verificadas), **§2 árbol por interfaz** (MenuBar → ToolBar → FilterBar → Lienzo → Outline → ToolPanel 6 tabs → StatusBar → 6 modales → overlays de presentación → capa global de atajos), **§3 cómo usarlo** (roadmap con tags, mapeo funcional↔interfaz, aviso de sincronización). |
| `README.md` | `doc/FEATURE_TREE.md` añadido al árbol de ficheros y a la lista "Documentación Técnica Detallada". |

### 🔍 Verificación
- [x] Hojas de ambos árboles contrastadas con las auditorías del propio día (DESIGN §6-§10, INTERFACE_SPEC): 10 formas, 9 layouts, 8 temas, 3 presentaciones, 6 modales, 4 formatos de export, 520+ iconos, etc.
- [x] Sin cambios de código.

---

## 📚 [Docs] — 2026-10-17: `FEATURE_TREE.md` §2 ampliado a nivel de control (qué botón y qué hace)

### 🎯 Motivo
El usuario pidió detallar más el árbol por interfaz: "termina con el control a manipulas, qué botones tiene y qué hace".

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/FEATURE_TREE.md` | §2 reescrito **control a control** por superficie: MenuBar (6 menús con cada item y su accion), ToolBar (cada boton, disabled/visibilidad responsive, popovers Vista/Presentar), FilterBar (input/selects/contador), Lienzo (clic/doble clic/hover/drag de nodos, menu contextual 11 items, MiniMap, ZoomControls con sus 5 botones), HUD de presentacion dinamica (top bar, pill, staged, filmstrip), OutlineView (cabecera, fila, footer), ToolPanel 6 pestanas (cada slider/colorpicker/toggle con rango), StatusBar, 6 modales (cada campo/boton), presentacion Clasica (header/slide/footer/opciones) y Elaborada (camara, transformaciones de tarjeta, editor), y capa global de atajos. Marcados como decorativos los hints de atajos no implementados (Ctrl+S, Ctrl+0/Ctrl+-/+). §3 con nuevo punto "QA por control" y "Honestidad de hints". |
| `README.md` | (sin cambios nuevos; los 2 enlaces de la entrada anterior siguen vigentes) |

### 🔍 Verificación
- [x] Controles de nodo y de ZoomControls leidos directamente de `src/components/molecules/node/NodeActionButtons.tsx` y `src/components/molecules/ZoomControls.tsx` antes de escribirlos (nodo hover = plegar + añadir hijo, sin borrar; ZoomControls = Compass MiniMap, ZoomOut, % reset, ZoomIn, Maximize2 ajustar).
- [x] Resto de hojas tomadas de las auditorias del propio dia (DESIGN §7/§8/§8.5/§9/§10, INTERFACE_SPEC).
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Nueva hoja de medidas `doc/MEASURES.md` (áreas grandes de la interfaz)

### 🎯 Motivo
El usuario pidió crear un documento de medidas donde se documenta cada medida de las opciones de la interfaz, empezando **solo por las áreas grandes**.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/MEASURES.md` | **Nuevo**. Hoja de medidas de las áreas grandes, cada una verificada leyendo las clases Tailwind de `src/`: §1 estructura raíz (MainEditorLayout `h-screen w-screen`), §2 zona de trabajo (fila `flex-1`), §3 MenuBar (h-10/40px, dropdowns w-56/w-52), §4 ToolBar (h-11/44px, botones 30x30), §5 Outline (w-80 320px / md:w-88 352px / flex-1 maximizado), §6 ToolPanel (w-84 336px, grid 6 pestañas de 56px), §7 FilterBar (h-10, max-w-3xl/max-w-xs), §8 StatusBar (h-6/24px, texto 10-12px), §9 controles flotantes (MiniMap S/M/L = w-44/w-56/w-72 con svg h-24/h-32/h-44, ZoomControls). Resúmenes de alturas (columna) y anchos (fila). Convención de medida (1 unidad = 4px) y aviso de fase 2 (controles internos). |
| `README.md` | `doc/MEASURES.md` añadido al árbol de ficheros y a la lista "Documentación Técnica Detallada". |

### 🔍 Verificación
- [x] Cada medida leída del código: MainEditorLayout.tsx:37/48/53, MenuBar.tsx:137/158/213, ToolBar.tsx:124/133/147, OutlineView.tsx:347-348, ToolPanel.tsx:92/109, FilterBar.tsx:33/34/41, StatusBar.tsx:23, MiniMap.tsx:208/82-89/95-96, ZoomControls.tsx:30-77.
- [x] Conversión Tailwind→px con base 4px (w-80=320, w-84=336, w-88=352, w-44=176, w-56=224, w-72=288, h-24=96, h-32=128, h-44=176).
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: SVG de medidas de las áreas grandes (`img/medidas-areas.svg`)

### 🎯 Motivo
El usuario pidió crear un SVG con las medidas de las áreas segun `doc/MEASURES.md`.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-areas.svg` | **Nuevo**. Wireframe a escala 1:1 (1px = 1px) del MainEditorLayout con cotas en ámbar: alturas apiladas MenuBar 40 + ToolBar 44 + FilterBar 40 + zona de trabajo (flex-1) + StatusBar 24 = 100vh; anchos horizontales Outline 320 (352 en md) + Canvas flex-1 + ToolPanel 336 = 100vw; grid de 6 pestañas de 56px del ToolPanel; MiniMap/ZoomControls flotantes con tamaños S/M/L. Nota lateral aclarando que el Canvas es relativo al viewport. |
| `doc/MEASURES.md` | Insertada la imagen del diagrama bajo la introducción (antes de §1). |

### 🔍 Verificación
- [x] SVG valido renderizado sin errores.
- [x] Cotas contrastadas con las clases Tailwind de MainEditorLayout.tsx:37-62, ToolPanel.tsx:109, MiniMap.tsx:82-96.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas detalladas del MenuBar (fase 2, por área)

### 🎯 Motivo
El usuario dio comienzo a la fase 2 de la hoja de medidas (controles internos), área por área, empezando **solo por el MenuBar**: detallar cada control y su medida, añadirlo a `doc/MEASURES.md` y crear su propio SVG.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-menubar.svg` | **Nuevo**. SVG a escala 1:1 del MenuBar con cotas: barra h-10 (40px), padding px-3 (12px), gap-2 (8px), botones de menú (px-2.5/py-1 → 10px/4px) con su ancho real por label (Archivo 56, Editar 52, Insertar 58, Formato 58, Ver 42, Ayuda 50), los 6 dropdowns (Archivo/Insertar/Formato/Ver/Ayuda w-56 = 224px, Editar w-52 = 208px) con sus ítems, título central (max-w-sm 384px), badge offline y botón de tema. Nota responsive. |
| `doc/MEASURES.md` | §3 ampliada a "MenuBar — detallada": 3.1 contenedor raíz, 3.2 marca + botones de menú con ancho por label, 3.3 dropdowns (anchos, ítems, medidas base de ítem/encabezado/badge), 3.4 título editable, 3.5 badge offline + tema UI. Insertada la imagen del SVG bajo el encabezado. |

### 🔍 Verificación
- [x] Cada medida leída directamente de MenuBar.tsx:137-556 (h-10, px-3, gap-2, px-2.5/py-1 de los botones, w-56/w-52 de los dropdowns, max-w-sm del título, text-[11px]/text-[10px] responsive).
- [x] SVG valido renderizado sin errores.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas detalladas del ToolBar (fase 2, área 2)

### 🎯 Motivo
Segunda área de la fase 2 (controles internos por área), tras el MenuBar: detallar el ToolBar, añadirlo a `doc/MEASURES.md` y crear su propio SVG.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-toolbar.svg` | **Nuevo**. SVG a escala 1:1 del ToolBar con cotas: barra h-11 (44px), px-2/px-3, gap-1/gap-2, botones de icono 30x30 (p-1.5, icono 16px), botones con texto ~26px, select Forma (tope 105px), separadores w-px h-5, popover Vista (w-64=256px), popover Presentar (w-72=288px), menú movil Más (w-52=208px), grupo derecho (Buscar/Vista/Esquema/Presentar/Exportar/Panel). Nota responsive. |
| `doc/MEASURES.md` | §4 ampliada a "ToolBar — detallada": 4.1 raíz, 4.2 botones de icono (30x30, icono 16/14px), 4.3 botones con texto, 4.4 separadores, 4.5 select Forma, 4.6 popovers (Visibilidad 256px, Presentación 288px), 4.7 menú movil Más, 4.8 visibilidad responsive. Insertada la imagen bajo el encabezado. |

### 🔍 Verificación
- [x] Cada medida leida directamente de ToolBar.tsx:124-640 (h-11, px-2/sm:px-3, gap-1/sm:gap-2, min-w/min-h 30px, w-64/w-72/w-52 de los flotantes, max-w-[105px] del select).
- [x] SVG valido renderizado sin errores.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Corregido bug XML en los 3 SVG de medidas (comentarios con guion doble)

### 🎯 Motivo
El usuario reporto "no puedo ver el svg". Causa: los SVG usaban comentarios decorativos tipo <!-- ==== ... ==== -->, y el doble guion (--) dentro de un comentario es ilegal en XML. Como SVG es XML (no HTML), el navegador detenia el render en el primer error y solo se veia la cabecera.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-toolbar.svg` | 12 comentarios decorativos reescritos sin guiones dobles (BARRA, GRUPO IZQUIERDO/DERECHO, COTA ALTURA, DESGLOSE icono/select, POPOVER Visibilidad/Presentar, MENÚ MÓVIL, DERECHA, NOTA RESPONSIVE). |
| `doc/img/medidas-menubar.svg` | 7 comentarios decorativos reescritos (BARRA, COTA ALTURA, DESGLOSE boton/dropdown/centro, COTA ANCHO TOTAL, NOTA RESPONSIVE). |
| `doc/img/medidas-areas.svg` | 6 bloques multilínea con ==== reescritos a comentarios de una línea (ZONA DEL WIREFRAME, ZONA DE TRABAJO, COTAS VERTICALES, COTA TOTAL VERTICAL, COTAS HORIZONTALES, COTA TOTAL HORIZONTAL). |

### 🔍 Verificación
- [x] Validación XML con .NET XmlDocument: los 3 ficheros dan "OK" (well-formed).
- [x] Render visual confirmado en navegador via servidor (:3000/@fs): los 3 SVG dibujan completo, sin la caja roja de error.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-07-18: Ajuste del SVG de medidas del ToolBar para reflejar la app real

### 🎯 Motivo
El usuario senalo que su captura real del ToolBar mostraba un grupo derecho distinto al de mi diagrama: faltaba el boton "Presentar" en la barra ilustrativa y el orden no coincidia. Su captura es la fuente de verdad.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-toolbar.svg` | En la barra ilustrativa superior se completo el grupo derecho con el orden real de la app (Buscar, Vista, Esquema, Presentar, Exportar, Panel); antes "Presentar" era un rect de ancho 0 y faltaban Exportar y Panel. Se ensancho el lienzo (viewBox y fondo a 1460) para que quepa el grupo completo. La seccion detallada inferior ya era correcta y no cambio. |

### 🔍 Verificación
- [x] Orden del grupo derecho confirmado contra el codigo (ToolBar.tsx: Esquema :506, Presentar :509-523, Exportar :619, Panel :629-637).
- [x] Validacion XML (.NET): OK. Render visual en navegador: la barra muestra los 6 controles del grupo derecho en el orden de la app.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas detalladas del FilterBar (fase 2, area 3)

### 🎯 Motivo
Tercera area de la fase 2 (controles internos por area), tras MenuBar y ToolBar: detallar el FilterBar, añadirlo a doc/MEASURES.md y crear su propio SVG.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-filterbar.svg` | **Nuevo**. SVG a escala 1:1 del FilterBar con cotas: barra h-10 (40px), px-4 (16px), gap-3 (12px), input query (flex-1, tope max-w-xs 320px, alto 28px), select etiquetas y select progreso (px-2 py-1, alto 28px), badge contador (px-2 py-0.5, text-[11px]), grupo derecho (gap-2 8px, link Limpiar + botón cerrar p-1 icono 16px). Nota de comportamiento (sin media queries, return null si isOpen=false). |
| `doc/MEASURES.md` | §7 ampliada a "FilterBar — detallada": 7.1 raíz, 7.2 grupo izquierdo (input, selects, badge), 7.3 grupo derecho, 7.4 comportamiento. Insertada la imagen bajo el encabezado. |

### 🔍 Verificación
- [x] Cada medida leida directamente de FilterBar.tsx:33-117 (h-10, px-4, flex-1 max-w-3xl, gap-3, max-w-xs, px-2.5/py-1, px-2/py-1, px-2/py-0.5, p-1).
- [x] SVG validado (.NET XmlDocument): OK. Render visual en navegador: correcto, 57 KB.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas detalladas del StatusBar (fase 2, area 4)

### 🎯 Motivo
Cuarta area de la fase 2 (controles internos por area), tras MenuBar, ToolBar y FilterBar: detallar el StatusBar, añadirlo a doc/MEASURES.md y crear su propio SVG.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-statusbar.svg` | **Nuevo**. SVG a escala 1:1 del StatusBar con cotas: barra h-6 (24px), px-3 (12px), gap-4 (16px), 5 segmentos (Nodos totales y Seleccionado siempre visibles; Zoom/Posición/Modo con hidden sm:block) separados por w-px h-3 (1x12px), tipografía y color, bloques de estructura y responsive. |
| `doc/MEASURES.md` | §8 ampliada a "StatusBar — detallada": 8.1 raíz (24px, borde superior, z-30), 8.2 tabla de los 5 segmentos con visibilidad y límites (Seleccionado max-w 200px → 448px), 8.3 tipografía/color. Insertada la imagen bajo el encabezado. |

### 🔍 Verificación
- [x] Cada medida leida directamente de StatusBar.tsx:23-49 (h-6, px-3, gap-4, text-[10px] sm:text-xs, max-w-[200px] sm:max-w-md, w-px h-3, hidden sm:block).
- [x] Validacion XML (.NET) de los 5 SVG: OK. Pestaña cargada sin error (la ventana del navegador estaba oculta, no se pudo capturar screenshot).
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas detalladas del OutlineView (fase 2, area 5)

### 🎯 Motivo
Quinta area de la fase 2: detallar el OutlineView (Panel de Esquema) con sus subsecciones, añadirlo a doc/MEASURES.md y crear su propio SVG. El usuario aporto una captura real del panel que confirmo la estructura (cabecera con badge de contador, fila raiz con tags, footer con atajos).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-outline.svg` | **Nuevo**. SVG con el panel real a escala 1:1 (320x560: cabecera ~50px, buscador ~40px, lista flex-1, footer ~30px) + cotas verticales y de ancho; detalles ampliados: cabecera (icono 24px, 5 botones de accion p-1.5), fila de nodo (indentacion depth*18+10, chevron 14, bullet 8, badge progreso 9px, tags 9px, hover 12px) con sus 3 estados, buscador y footer; notas de arbol/recursion/edicion/estados. |
| `doc/MEASURES.md` | §5 ampliada a "OutlineView — detallada": 5.1 aside (w-80/88, fullscreen flex-1 z-30, return null), 5.2 cabecera (~50px, 5 botones), 5.3 buscador condicional (~40px), 5.4 lista (indentacion, fila completa con 11 elementos medidos + 3 estados), 5.5 footer (~30px). Insertada la imagen bajo el encabezado. |

### 🔍 Verificación
- [x] Cada medida leida directamente de OutlineView.tsx:344-461 (y filas :148-331); estructura contrastada con la captura del usuario.
- [x] Validacion XML (.NET): OK. Render visual capturado tras corregir dos solapes de texto (notas buscador/footer y cotas de indentacion).
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas detalladas del MiniMap + ZoomControls (fase 2, area 9)

### 🎯 Motivo
Sexta y ultima area de la fase 2: detallar los controles flotantes del lienzo (tarjeta MiniMap y fila ZoomControls), añadirlos a doc/MEASURES.md y crear su SVG. Cierra la fase 2: ya estan detalladas MenuBar, ToolBar, FilterBar, StatusBar, OutlineView y MiniMap/ZoomControls.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-minimap.svg` | **Nuevo**. SVG con las 3 tarjetas S/M/L a escala 1:1 (176/224/288px de ancho, altos 132/164/212) con cotas, el HUD ZoomControls a 1:1 (256x36) y paneles de detalle: cabecera (Compass 14px, selector SML text-[9px], boton plegar), interior del SVG (minimos de nodos 50x30/36x20/24x16, rx 8/6/4, bordes, punto de plegado r=4, rect de viewport sky punteado), desglose de ZoomControls (IconButton sm 28x28, alto total 36px, separadores 1x16) e interaccion/estados. |
| `doc/MEASURES.md` | §9 ampliada a "Controles flotantes del lienzo (MiniMap + ZoomControls) — detallada": 9.1 contenedor raiz (bottom-2 right-5, gap-1.5, z-40), 9.2 tabla de tamaños con alto total, 9.3 cabecera y estilo (glassmorphism, localStorage), 9.4 interior del SVG (viewBox, minimos, strokes, aristas, viewport), 9.5 interaccion, 9.6 ZoomControls. Insertada la imagen bajo el encabezado. |

### 🔍 Verificación
- [x] Cada medida leida directamente de MiniMap.tsx:206-463, ZoomControls.tsx:29-78 e IconButton.tsx:25-37 (size sm = w-7 h-7).
- [x] Correccion respecto a la version anterior: el alto real de ZoomControls es 36px (28 + p-1), no ~28px.
- [x] Validacion XML (.NET): OK (7/7 SVG). Render visual capturado sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas del ToolPanel contenedor (fase 2, area 6.0)

### 🎯 Motivo
El ToolPanel son 7 ficheros (~2.600 lineas): el usuario senalo que detallarlo de golpe seria mala idea. Se acordó dividirlo en 7 sub-areas (6.0 contenedor + una por pestaña, de menor a mayor lineas). Esta entrada documenta §6.0 (ToolPanel.tsx).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-toolpanel.svg` | **Nuevo**. SVG con el panel real a escala 1:1 (336x560: cabecera ~44px, barra de 6 pestañas ~46px, contenido flex-1 con estado vacio) + cotas; detalles: cabecera (Sliders 16px, X 16px p-1), barra grid-cols-6 (celdas 56px, activa border-b-2, iconos 14px), area de contenido (p-4, space-y-5, py-12 en vacio) y panel de estados/cableado (sin media queries, ThemeTab sin nodo, adaptador onUpdateMapGaps). |
| `doc/MEASURES.md` | §6 ampliada a "ToolPanel — detallada" con §6.0.1 (aside + cabecera), §6.0.2 (barra de pestañas) y §6.0.3 (contenido y estados), imagen enlazada y nota del plan de sub-areas §6.1-§6.6 (Contenido, Formato, Notas, Iconos, Nubes, Mapa). |

### 🔍 Verificación
- [x] Cada medida leida directamente de ToolPanel.tsx:85-272 (w-84, px-4 py-3, grid-cols-6, py-2 px-1, w-3.5 h-3.5, border-b-2, p-4, space-y-5, py-12).
- [x] Validacion XML (.NET): OK (8/8 SVG). Render visual capturado sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas de la pestana Notas (fase 2, area 6.3)

### 🎯 Motivo
Primera pestana del ToolPanel documentada tras el acuerdo de dividirlo en 7 sub-areas: NotesTab (216 lineas), la mas pequena. Quedan §6.1 Contenido, §6.2 Formato, §6.4 Iconos, §6.5 Nubes y §6.6 Mapa.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-notes-tab.svg` | **Nuevo**. SVG con la pila real a escala 1:1 (304px utiles: cabecera ~30px, toolbar ~28px, textarea split ~141px, preview 120px, gaps 12px) + cotas; detalles: cabecera (toggle amber ON/gris OFF px-2 py-1, segmentado 3 botones p-1.5), toolbar Markdown (10 botones p-1 icono 14px + 3 separadores, handleInsertMarkdown), editor/preview (rows 12/6, p-3 font-mono, min-h 120 max-h 350) y modos de vista. |
| `doc/MEASURES.md` | §6.3 anadida tras §6.0: 6.3.1 cabecera (~30px, toggle showNoteInline, segmentado Edit3/Columns/Eye), 6.3.2 toolbar Markdown (solo edit/split, 10 botones, grupos), 6.3.3 editor y vista previa (textarea rows 12/6, preview min-h 120/max-h 350, MarkdownView), 6.3.4 modos de vista (viewMode default preview). Imagen enlazada. |

### 🔍 Verificación
- [x] Cada medida leida directamente de NotesTab.tsx:26-224 (space-y-3, px-2 py-1, p-1.5, p-1 icono 14px, rows 12/6, p-3, min-h-[120px] max-h-[350px]).
- [x] Validacion XML (.NET): OK (9/9 SVG). Render visual capturado sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas de la pestana Nubes (fase 2, area 6.5)

### 🎯 Motivo
Segunda pestana del ToolPanel documentada (de menor a mayor): CloudsTab (288 lineas). Documenta tambien los atomos compartidos CollapsibleSection, SliderInput y ColorPicker, que reutilizaran las demas pestanas.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-clouds-tab.svg` | **Nuevo**. SVG con la pila real a escala 1:1 (304px: interruptor maestro ~54px, barra plegar, seccion Forma abierta con grid 4x2 de 8 formas ~64x48 y 2 sliders, Relleno y Borde cerradas) + cotas; detalles del interruptor (toggle 36x20 knob 16), CollapsibleSection (header px-3.5 py-3, icono 24, chevron 16), atomos SliderInput/ColorPicker (range 6px, presets grid-cols-8) y contenido de las 3 secciones (rangos, defaults). |
| `doc/MEASURES.md` | §6.5 anadida tras §6.3: 6.5.1 interruptor maestro (toggle h-5 w-9, defaults cloud), 6.5.2 barra y secciones (estado inicial solo Forma, grids y rangos), 6.5.3 atomos de control (SliderInput/ColorPicker medidos para reutilizar). Imagen enlazada. |

### 🔍 Verificación
- [x] Cada medida leida directamente de CloudsTab.tsx:35-288, CollapsibleSection.tsx:28-73, SliderInput.tsx:29-57 y ColorPicker.tsx:30-75.
- [x] Corregido un typo en el path del marker de cotas del SVG antes de validar.
- [x] Validacion XML (.NET): OK (10/10 SVG). Render visual capturado sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: §6.5 Nubes completada (correccion tras feedback del usuario)

### 🎯 Motivo
El usuario senalo que el SVG de la pestana Nubes estaba incompleto: solo dibujaba Relleno y Borde como cabeceras cerradas, pero en la app real aparecen desplegados con todos sus controles (presets de color, sliders con badge, estilo de linea).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-clouds-tab.svg` | Reescrito. Ahora las 3 secciones estan EXPANDIDAS a escala 1:1: Relleno (Color de Nube con valor RGBA(168,255,247,0.08), 16 presets en 2 filas de 8 ~31px, Opacidad 8%) y Borde (Color #38B2F6, Grosor 1.5px, Estilo de Linea con 3 botones ~88x48 y muestra w-8 border-t-2). viewBox ampliado a 1400x1060, cotas por seccion (281/201/275). |
| `doc/MEASURES.md` | §6.5.3 corregida: el ColorPicker muestra el color COMPLETO del nodo (hex o rgba con alfa), no solo hex. Anadida nota con los valores reales de la captura del usuario y la observacion de que bgType no tiene selector en la pestana. |

### 🔍 Verificación
- [x] Contraste directo con la captura del usuario (secciones desplegadas, valores RGBA/#38B2F6/1.5px/8%, Guiones seleccionado).
- [x] Validacion XML (.NET): OK (10/10 SVG). Render visual capturado sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas de la pestana Iconos (fase 2, area 6.4)

### 🎯 Motivo
Tercera pestana del ToolPanel documentada: IconsTab (314 lineas), la que integra el pack VECTOR_ICON_PACK (520+). Dibujada en estado real (seccion de estilo desplegada por defecto, como en la app).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-icons-tab.svg` | **Nuevo**. SVG a escala 1:1 (304px): seccion Estilo desplegada ~303px (ColorPicker Tinte con Reset, paleta rapida de 7 circulos 18px, slider Tamaño 10..36 badge "14px (Estandard)", Propagacion Copiar a Hijos/Hermanos grid-cols-2) + card Iconos Asignados ~62px con chips, buscador ~36px, 13 chips de categoria, 8 quick tags, grid 6 columnas celda ~44px con 24 iconos (uno seleccionado) y boton Galleria; cotas por bloque. |
| `doc/MEASURES.md` | §6.4 insertada entre §6.3 y §6.5: 6.4.1 seccion Estilo (badge de color, paleta 7 colores, slider con badge especial, propagacion condicional), 6.4.2 Iconos Asignados (chips 14px + X 12px), 6.4.3 buscador/categorias/tags (13 + 8 chips), 6.4.4 grid (celda 44px, slice 0..120, estados) y estado del nodo. Imagen enlazada. |

### 🔍 Verificación
- [x] Cada medida leida directamente de IconsTab.tsx:51-314 (w-4.5 h-4.5, pl-8.5 pr-3 py-2, px-2.5 py-1, grid-cols-6, max-h-[300px], slice(0,120)).
- [x] Validacion XML (.NET): OK (11/11 SVG). Render visual capturado sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: Medidas de la pestana Contenido (fase 2, area 6.1)

### 🎯 Motivo
Cuarta pestana del ToolPanel documentada: ContentTab (455 lineas), la pestana principal de edicion de texto del nodo. Dibujada en estado real (solo «Titulo del Nodo» desplegado por defecto, como en la app).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-content-tab.svg` | **Nuevo**. SVG a escala 1:1 (304px): barra «SECCIONES DE CONTENIDO» ~16px + seccion Titulo del Nodo desplegada ~303px (textarea rows-2, FontFormatToolbar con grupos Negrita/Cursiva e Izquierda/Centro/Derecha ~28px, ColorPicker Color del Texto con 16 presets, slider Tamano de Fuente 10..36px badge 14px) + 3 secciones cerradas ~53px c/u (Cuerpo con badge Activo, Imagen con badge Activa, Metadatos); cotas por bloque. viewBox 1400x1052. |
| `doc/MEASURES.md` | §6.1 insertada entre §6.0.3 y §6.3: 6.1.1 Titulo del Nodo (badge fontSize, textarea rows-2, molecules FontFormatToolbar y ColorPicker), 6.1.2 Cuerpo (action/badge condicionales a body, textarea rows-3, slider 9..24), 6.1.3 Imagen (URL + Upload FileReader dataURL + Trash2, grid-cols-3 de 6 posiciones, slider Ancho 60..500 sin onReset), 6.1.4 Metadatos (TagManager, Enlace, Progreso badge «Sin asignar», Iconos (n), Galeria). Imagen enlazada. |
| `D:\Temp\opencode\validate-svg.ps1` | Validador ampliado con el nuevo SVG (lista de 12). |

### 🔍 Verificación
- [x] Cada medida leida directamente de ContentTab.tsx:36-476, FontFormatToolbar.tsx:22-78 y TagManager.tsx:32-72 (rows-2/rows-3, p-1.5, px-2.5 py-1.5, grid-cols-3, 60..500 step 10, 0..100 step 5, 9..24).
- [x] Validacion XML (.NET): OK (12/12 SVG). Render visual capturado dos veces (corregido borde inferior de la caja 5) sin solapes.
- [x] Sin cambios de codigo.

---

## 📚 [Docs] — 2026-10-17: §6.1 Contenido rehecho con las 4 secciones desplegadas (feedback del usuario)

### 🎯 Motivo
El usuario pidio que la pestana Contenido se documentara con TODOS los paneles desplegados (no solo «Titulo del Nodo», el default) y aporto dos capturas reales de la app con valores concretos.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-content-tab.svg` | Reescrito (viewBox 1400x1570): las 4 secciones EXPANDIDAS a 1:1 con los valores reales de las capturas — Titulo ~301px (badge 18px, «FreeMind Map Studio», #FFFFFF, toolbar B activo, slider 18px + Reset) · Cuerpo ~311px (badge Activo, textarea rows-3 de 3 lineas, #8BEAFE, 12px + Reset, toolbar B inactivo) · Imagen ~279px (dataURL, Upload blue 36x36 + Trash red 36x36, grid de 6 posiciones con «Arriba» seleccionado, Ancho 64px sin Reset) · Metadatos ~419px (TagManager con 3 tags en 2 filas, Enlace sin toggle por link indefinido, Progreso «Sin asignar» + Reset, Iconos (2) Visibles, boton «Abrir Galleria de Iconos»). Cota por seccion + 6 cajas de medidas en la columna derecha; nota final corregida tras recorte en el primer render. |
| `doc/MEASURES.md` | §6.1: anadida nota con el criterio del SVG (4 desplegadas por peticion del usuario, default real = solo Titulo) y los valores reales de las capturas + altos expandidos. |

### 🔍 Verificación
- [x] Valores contrastados con las 2 capturas del usuario (18px, #FFFFFF, #8BEAFE, 12px, Arriba, 64px, Sin asignar, 3 tags, Iconos (2)).
- [x] Texto del boton de galeria confirmado en ContentTab.tsx:469 («Abrir Galleria de Iconos»).
- [x] Validacion XML (.NET): OK (12/12 SVG). Render visual capturado dos veces (recorte inferior corregido) sin solapes.
- [x] Sin cambios de codigo.

---

## 📏 [Docs] — 2026-10-17: §6.2 Pestaña Formato — SVG 1:1 con las 4 secciones desplegadas

### 🎯 Motivo
Continuar la fase 2 de `doc/MEASURES.md` (detalle de cada área con SVG propio a escala 1:1), siguiendo el criterio ya cerrado con el usuario de «todo desplegado».

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-format-tab.svg` | Nuevo (viewBox 1400x1800, XML 13/13): pila de la pestaña Formato a 1:1 (304px) con las 4 secciones EXPANDIDAS y valores reales — Barra «FORMATO VISUAL DEL NODO» (~16px) · S1 Forma y Geometría ~299px (badge «Bubble», ShapeSelector 2x5 con «Burbuja» seleccionado, sliders Ancho `0..500`/Alto `0..300` con badge «Automático» + Reset + description) · S2 Fondo y Relleno ~226px con `bgType='color'` (grid de 5 tipos con «Sólido» seleccionado, ColorPicker #3B82F6 + 16 presets) · S3 Bordes y Contorno ~290px (CP del borde, Grosor «1px», 3 botones de estilo con «Sólido» seleccionado) · S4 Aristas y Propagación ~324px (4 formas de conexión con «Curva», Color de la Arista «Auto», «Aplicar a Hijos/Hermanos»). 6 cajas de medidas en la columna derecha (barra/estado, una por sección, notas) + cotas por sección. |
| `doc/MEASURES.md` | Nueva sección **§6.2 Pestaña Formato** (6.2.1-6.2.4) insertada entre §6.1 y §6.3: estado local, barra, nota del SVG (criterio «todo desplegado», variante `bgType='color'` dibujada por ser default; gradient/pattern/image documentados en 6.2.2), tabla de Forma, variantes de Fondo, tablas de Bordes y Aristas, y aviso de imports sin uso (`ToggleButtonGroup`, `RotateCcw`, `SlidersHorizontal`, `ChevronDown`, `ImageIcon`). |
| `D:\Temp\opencode\validate-svg.ps1` | Añadido `medidas-format-tab.svg` a la lista (13 ficheros). |

### 🔍 Verificación
- [x] Líneas de código contrastadas con `FormatTab.tsx` (estado 49-54, barra 74-95, S1 98-142, S2 145-383 con variantes 181/190/231/289, S3 386-436, S4 439-537) y `ShapeSelector.tsx` (grid 101, label 117).
- [x] Validación XML (.NET): OK (13/13 SVG). Render visual capturado (314 KB) sin solapes ni recortes; pestañas `/@fs/` cerradas.
- [x] Sin cambios de codigo.

---

## 📏 [Docs] — 2026-10-17: §6.2 — panel «Fondo y Relleno con Trama» anadido al SVG (captura del usuario)

### 🎯 Motivo
El usuario aporto una captura real de la pestaña Formato con el tipo de fondo «Trama» (`bgType='pattern'`) activo y pidio anadir ese panel al documento.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-format-tab.svg` | Ampliado a viewBox 1400x2200: nuevo bloque inferior izquierdo «Variante Trama (bgType='pattern') — estado real» con la seccion «Fondo y Relleno» EXPANDIDA a 1:1 (559px, cota propia) — selector de tipo con «Trama» activo · «Estilo de Trama» con las 7 opciones en 2 filas (4.ª celda vacia, ninguna activa) · Color del Fondo Base #1D4ED8 + Reset · Color del Trazo #475569 + Reset CON anillo en el preset de la fila 2 · Tamaño del patrón 16px (knob 25%, sin Reset) · Opacidad del trazo 40% (knob 33%, sin Reset) · width-cota + nota inferior. Labels de tipo corregidos en AMBAS rejillas a como renderiza la app («Degra…», «Ima…», «Tran…» por `truncate`). Caja nueva en la columna derecha («Sección 2 variante Trama», 14 lineas de medidas: altos, variantes de knob, diferencia vs variante color, radios excluyentes). |
| `doc/MEASURES.md` | §6.2.2: anotado el truncado real de los labels del selector de tipo + blockquote nuevo que describe el estado dibujado de la variante Trama (valores reales, cota 559px, caja de referencia). |

### 🔍 Verificación
- [x] Valores contrastados con la captura del usuario: #1D4ED8 · #475569 (con anillo) · 16px · 40% · «Trama» activo · ningún estilo de trama seleccionado · labels truncados.
- [x] Codigo revisado (FormatTab:231-287, PATTERN_OPTIONS:33-41) para ranges, defaults y ausencia de `onReset`.
- [x] Validacion XML (.NET): OK (13/13 SVG).
- [x] Verificacion por DOM (browser.evaluate): 190 textos, 0 desbordes de columna, 0 fuera de lienzo.
- [x] Render visual capturado (408 KB): sin solapes ni recortes; pestañas /@fs/ cerradas.
- [x] Sin cambios de codigo.

---

## 📏 [Docs] — 2026-10-17: §6.6 Pestaña Mapa — SVG 1:1 rehecho contra el código real (ThemeTab)

### 🎯 Motivo
Completar §6.6 de doc/MEASURES.md. El SVG previo doc/img/medidas-theme-tab.svg era INVÁLIDO: dibujaba secciones fantasma («Fondos preestablecidos», «Conectores Personalizados») que no existen, fruto de lecturas corruptas de ThemeTab.tsx (el usuario lo detecto con capturas reales). Se rehizo entero contra el código real releído y se midio la barra en la app viva.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| doc/img/medidas-theme-tab.svg | Reescrito de 0 (viewBox 1400x2300, XML 14/14): pila real de la pestaña Mapa a 1:1 (304px) con barra + las 5 secciones REALES desplegadas — Barra «CONFIGURACIÓN GLOBAL DEL MAPA» 30px (medido en la app: titulo envuelto a 2 lineas, no 17px) · S1 Temas del Mapa 328px (8 tarjetas 134x58 con nombre+Check+dots, badge «Clásico Azul», «Plano Técnico Blu…» truncado) · S2 Diseño del Árbol 237px (9 layouts 88x51 con iconos lucide, «Estándar» activo) · S3 Fondo del Lienzo 505px (CP+Reset #F8FAFC, 6 patrones 88x55 con «Puntos» activo, CP trazo #94A3B8 sin Reset, sliders 24px/40%) · S4 Aristas Globales 540px (Curva+Cónica+Sólido activos, Multicolor/Randomizar, CP «AUTO», 8 dots Sugeridos, grosor 3.5px) · S5 Espaciado 140px (58px/14px). Pila total 1850px con cotas. 6 cajas de medidas (15+9+16+16+6+10 lineas) incluyendo nota ámbar de «props muertas» de conectores e imports sin uso. |
| doc/MEASURES.md | Nueva sección **§6.6 Pestaña Mapa (ThemeTab)** (6.6.1-6.6.4) insertada entre §6.5 y §7: barra global (30px reales), estado por defecto (solo Temas abierto), tabla de las 5 secciones con alturas y contenido, tabla de estado dibujado con la procedencia de cada valor, y aviso del SVG previo inválido + imports lucide sin uso (Link, ToggleButtonGroup). |
| D:\Temp\opencode\validate-svg.ps1 | Ya incluia medidas-theme-tab.svg (lista de 14 ficheros); sin cambios. |

### 🔍 Verificación
- [x] ThemeTab.tsx releido integro por trozos (623 lineas): barra 123-144, sectionsOpen 92-98, LAYOUT_OPTIONS 59-69, S1 147-197, S2 200-227, S3 230-373, S4 376-589, S5 592-620; atomos CollapsibleSection/ColorPicker/SliderInput; THEMES reales en `themes.ts:15-152`.
- [x] Barra medida en la app viva (browser.evaluate): rowH=30, titleH=28 (span de 202px comprimido a ~173px, envuelve a 2 lineas) — corrige el dato previo de 17px y la pila (1837 → 1850).
- [x] Validacion XML (.NET): OK (14/14 SVG) tras corregir `&&` sin escapar y el `</svg>` duplicado.
- [x] Verificacion por DOM (browser.evaluate): 169 textos, 0 desbordes de lienzo; render visual capturado sin solapes; pestanas /@fs/ y de la app cerradas.
- [x] Sin cambios de codigo.

---

## 📏 [Docs] — 2026-10-19: §10 Modo Presentación Clásica — Medidas detalladas y diagrama SVG 1:1

### 🎯 Motivo
Documentar exhaustivamente las dimensiones, disposición y anatomía del Modo Presentación Clásica (`PresentationMode.tsx`), que no contaba con hoja de medidas ni diagrama arquitectónico.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-presentation-classic.svg` | Nuevo (viewBox 1380×960, XML validado): wireframe a escala 1:1 de pantalla completa (100vw × 100vh) mostrando Header h-10 (40px) con badges y controles · Radar MiniMapa superior translúcido (w-52..w-80 × h-14..h-18) con resalte pulsante del nodo activo · Canvas central max-w-6xl (1152px) · Footer h-12 (48px) con paginador de dots y navegación de temas · Fila inferior con el detalle de las 3 Fases Automáticas de cada nodo (Fase 1 Spotlight con imagen fija, Fase 2 Notas Markdown paginadas, Fase 3 Subtemas y conectores) · Columna derecha con resumen exhaustivo de cotas, modal de configuración (Tecla E) y tabla de atajos de teclado. |
| `doc/MEASURES.md` | Nueva sección **§10. Modo Presentación Clásica (`PresentationMode`)** insertada antes del resumen general: §10.1 Contenedor raíz y overlay de pantalla completa · §10.2 Header superior · §10.3 Radar MiniMapa superior · §10.4 Zona central de diapositiva y desglose de las 3 Fases automáticas sin scrollbars · §10.5 Footer de navegación · §10.6 Modal de configuración (Tecla E) · §10.7 Atajos de teclado soportados. |

### 🔍 Verificación
- [x] Líneas de código contrastadas directamente con `src/components/PresentationMode.tsx` (overlay 610, header 613-709, radar minimap 1430-1604, layout central 1004-1346, footer 1348-1428, config modal 712-1002, shortcuts 505-548).
- [x] Validación XML (.NET): Exitosa (`XML OK`).

---

## 📏 [Docs] — 2026-10-19: §11 Modo Presentación Elaborada (Prezi Espacial) — Medidas detalladas y diagrama SVG 1:1

### 🎯 Motivo
Documentar exhaustivamente las dimensiones, disposición espacial y anatomía del sistema de Presentación Elaborada (`ElaboratePresentationSystem.tsx`, `SpatialSlideCardComponent.tsx`, `SlideDetailModal.tsx` y `spatialPresentationGenerator.ts`), que no contaba con hoja de medidas ni diagrama arquitectónico.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-presentation-elaborate.svg` | Nuevo (viewBox 1380×960, XML validado): wireframe a escala 1:1 de pantalla completa mostrando Top HUD Bar h-14 (56px) con selector de modo Editor/Presentar y acomodo · Lienzo infinito 2.5D con trayectoria Prezi en gradiente púrpura/azul/rosa · Tarjetas Espaciales base 720×440px con manillas interactivas (rotación superior -top-10 con tirador 32×32, botón mover inferior -bottom-4, y tiradores de esquina 20×20) · Controles flotantes de navegación rápida (zoom y vista panorámica) · Filmstrip inferior con barra de progreso h-1, tira de miniaturas con badges y footer h-12 con botones de vuelo cinemático · Fila inferior con el desglose de los 5 patrones de acomodo espacial (Espiral, Constelación, Matriz, Randómico y Mazo de cartas) · Columna derecha con resumen exhaustivo de cotas, modal de diseño de diapositiva (`SlideDetailModal`, 768px) y tabla de atajos de teclado. |
| `doc/MEASURES.md` | Nueva sección **§11. Modo Presentación Elaborada (Prezi Espacial)** insertada antes del resumen general: §11.1 Contenedor raíz y lienzo infinito 2.5D · §11.2 Top HUD bar (56px) · §11.3 Tarjetas espaciales (720×440px) y manillas de transformación · §11.4 Controles flotantes y Tira de miniaturas (Filmstrip HUD) · §11.5 Modal de edición de diapositiva (`SlideDetailModal`) · §11.6 Atajos de teclado soportados. |

### 🔍 Verificación
- [x] Líneas de código contrastadas directamente con `src/components/Presentation/ElaboratePresentationSystem.tsx`, `SpatialSlideCardComponent.tsx`, `SlideDetailModal.tsx` y `spatialPresentationGenerator.ts`.
- [x] Validación XML (.NET): Exitosa (`XML OK`).

---

## 📏 [Docs] — 2026-10-19: §12 Modo Presentación Dinámica (Canvas HUD & SlideFrames) — Medidas detalladas y diagrama SVG 1:1

### 🎯 Motivo
Completar la trilogía de modos de presentación en `doc/MEASURES.md`. Documentar las dimensiones, comportamiento y arquitectura visual del Modo Dinámico (`CanvasPresentationHUD.tsx`, `CanvasDrawingOverlay.tsx` y la lógica de foco/paneo en `MindMapCanvas.tsx`), que no contaba con hoja de medidas ni diagrama arquitectónico.

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/img/medidas-presentation-dynamic.svg` | Nuevo (viewBox 1380×960, XML validado): wireframe a escala 1:1 de pantalla completa mostrando Top Presentation Bar h-14 (56px) con conmutador Editor de Marcos / Presentar (F5), historial Undo/Redo y auto-generador · Píldora flotante de herramientas del editor (top-16, 510×34px) con botones de selección de nodos, recuadro y navegación · Lienzo mental real con atenuación dinámica (opacity 0.25) · Marcos de diapositiva (`SlideFrame`) con badges interactivos flotantes (-top-3.5) · Cajón flotante de notas del orador (`w-84..w-96`, top-20 right-6, borde ámbar) · Barra inferior de navegación h-12 con línea de progreso h-1 y filmstrip de miniaturas · Fila inferior con el desglose de los 2 modos (Play cinemático vs Editor de marcos) y el drawer de notas Markdown · Columna derecha con resumen exhaustivo de cotas y tabla de atajos de teclado. |
| `doc/MEASURES.md` | Nueva sección **§12. Modo Presentación Dinámica (Canvas HUD & SlideFrames)** insertada antes del resumen general: §12.1 Contenedor raíz y visualización sobre el lienzo real · §12.2 Top Presentation Bar (56px) · §12.3 Píldora flotante de herramientas · §12.4 Capa de marcos de diapositiva (`SlideFrame`) · §12.5 Cajón flotante de notas del orador · §12.6 Barra inferior y Filmstrip (HUD) · §12.7 Atajos de teclado soportados. |

### 🔍 Verificación
- [x] Líneas de código contrastadas directamente con `src/components/organisms/canvas/CanvasPresentationHUD.tsx`, `src/components/organisms/canvas/CanvasDrawingOverlay.tsx` y `src/components/MindMapCanvas.tsx`.
- [x] Validación XML (.NET): Exitosa (`XML OK`).

---

## 🌳 [Docs] — 2026-10-19: Actualización exhaustiva de `doc/FEATURE_TREE.md` (§2 Árbol por interfaz)

### 🎯 Motivo
Hacer justicia al objetivo del *Feature Tree*: documentar la acción técnica exacta que dispara cada control, detallando las dependencias y bifurcaciones de estado contextuales (los controles cambian según la opción activa: e.g. fondo sólido vs degradado vs trama vs imagen, recta vs curva en conectores, nube activa vs inactiva, herramientas de marcos).

### ✏️ Cambios
| Fichero | Qué cambió |
|---------|-----------|
| `doc/FEATURE_TREE.md` | Actualizado §2 con las mutaciones de store y bifurcaciones de estado exactas en: **ToolPanel** (Texto con subida de imagen y tags, Estilos con desglose exhaustivo de los 5 tipos de `bgType`, bordes y propagación recursiva a hijos/hermanos, Notas Markdown, Iconos, Nubes con condicional `cloud.enabled` y Mapa global), **Modales** (Exportar e Importar con validaciones y DOMParser, Conector con condicional de curvatura para rectas vs curvas, Plantillas, Mapas Guardados y Pack de Iconos) y **Presentaciones** (Clásica con `jumpHistory` y fases, Elaborada Prezi con matriz inversa y generadores espaciales, y Dinámica con `editorTool` y `SlideFrame`). |

### 🔍 Verificación
- [x] Controles y llamadas a `updateNode` / `setMindMap` / `pushHistory` contrastados directamente con el código fuente en `src/components/organisms/toolpanel/`, `src/components/Modals/` y `src/components/Presentation/`.
- [x] Sin cambios de código.




