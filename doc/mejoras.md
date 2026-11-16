# 🚀 Registro de Mejoras y Hoja de Ruta (Roadmap) — FreeMind Map Studio

Este documento recopila las optimizaciones técnicas, mejoras visuales y nuevas funcionalidades desarrolladas, así como el plan de trabajo modular para las siguientes etapas del proyecto.

---

## 📌 1. Mejoras Recientes Implementadas (Fase Actual)

### 1.1. ⚡ Renderizado Nítido y Anti-Desenfoque en Presentaciones Dinámicas
* **Problema resuelto:** En árboles de gran tamaño, al volar la cámara en modo presentación dinámica (estilo Mindomo) o elaborada (estilo Prezi), los nodos se apreciaban borrosos ("como una captura de pantalla a la que se le hace zoom").
* **Causa técnica:** La presencia permanente de la clase `will-change-transform` y la función `translate3d(x, y, 0)` forzaban a Chromium a congelar un bitmap de baja resolución en la GPU y escalarlo en vez de re-rasterizar vectorialmente.
* **Solución aplicada:**
  - Estado dinámico `isCameraFlying`: la aceleración por hardware (`will-change: transform`) solo se activa durante los 750ms del vuelo cinemático.
  - Al aterrizar en el marco (`onTransitionEnd` / 780ms), `willChange` conmuta a `'auto'`, forzando a Chromium a descartar el bitmap temporal y re-dibujar las fuentes y SVG con nitidez nativa 1:1.
  - Migración a coordenadas 2D `translate(x, y)` para preservar el *subpixel antialiasing* del sistema operativo.
  - Inyección de `shapeRendering: geometricPrecision` en la capa de aristas SVG.

---

### 1.2. 🎛️ Sistema Modular de Sombras con Botones Switch (ON/OFF)
Arquitectura modular donde cada objeto posee su propio subpanel e interruptor dedicado (`Switch.tsx`), **desactivado por defecto** para garantizar cero costo de GPU en mapas clásicos.

#### ✅ Objeto #1: Sombra en Texto de Nodos (Completado)
* **Ubicación:** ToolPanel > Pestaña **Texto** (`ContentTab.tsx`), sección *"Título del Nodo"*.
* **Características:**
  - 🔘 **Switch principal:** `Sombra de Texto [ OFF / ON ]`.
  - **4 Presets rápidos:**
    - `Suave`: `0px 1px 3px rgba(0,0,0,0.65)` (ideal para notas estándar).
    - `Media`: `0px 1px 4px rgba(0,0,0,0.75)` (mayor definición).
    - `Fuerte`: `0px 2px 6px rgba(0,0,0,0.85)` (relieve tipográfico marcado).
    - `Glow`: `0 0 8px #38bdf8` con núcleo luminoso blanco (efecto neón para modo oscuro).
  - **Slider de Desenfoque:** Ajuste fino de 1px a 16px.
  - **ColorPicker:** Color personalizado de sombra.
  - **Sub-switch secundario:** Opción de propagar la sombra al cuerpo / subtexto del nodo.
* **Rendimiento:** Propiedad nativa CSS `text-shadow` ultra-ligera en el motor tipográfico.

#### ✅ Objeto #2: Sombra en Imágenes Adjuntas (Completado)
* **Ubicación:** ToolPanel > Pestaña **Texto** (`ContentTab.tsx`), sección *"Imagen Adjunta"*.
* **Características:**
  - 🔘 **Switch principal:** `Sombra en Imagen [ OFF / ON ]`.
  - **Técnica CSS:** Utiliza `filter: drop-shadow(...)`, lo que permite que **imágenes PNG transparentes o ilustraciones sin fondo reciban la sombra contorneando su silueta real**, además de imágenes rectangulares con bordes redondeados.
  - **4 Presets rápidos:** `[ Suave ]`, `[ Media ]`, `[ 3D ]` y `[ Glow ]`.
  - **Slider de Desenfoque:** Ajuste de 2px a 24px.
  - **ColorPicker:** Sombra oscura o halo de color temático.
  - **Soporte multi-posición:** Compatible con las 6 posiciones de imagen del nodo (`top`, `fit`, `left`, `between`, `right` y `bottom`).

#### ✅ Objeto #3: Sombra del Contorno / Tarjeta del Nodo (Completado)
* **Ubicación:** ToolPanel > Pestaña **Estilos** (`FormatTab.tsx`), sección *"Bordes y Contorno"*.
* **Características:**
  - 🔘 **Switch principal:** `Sombra del Contorno [ OFF / ON ]`.
  - **Doble motor de renderizado inteligente:**
    - Formas estándar (`rounded`, `bubble`, `square`, `pill`, `circle`, `oval`): Utiliza `box-shadow` optimizado para bordes CSS curvos.
    - Formas poligonales SVG (`hexagon`, `arrow`, `star`): Utiliza `filter: drop-shadow(...)`, proyectando la sombra sobre el contorno geométrico exacto del polígono sin recortarlo.
  - **4 Presets rápidos:**
    - `Suave`: `0 3px 8px rgba(0,0,0,0.12)` (elevación sutil de tarjeta).
    - `Media`: `0 6px 14px rgba(0,0,0,0.22)` (separación de plano evidente).
    - `3D`: `0 10px 24px 2px rgba(0,0,0,0.35)` (relieve tridimensional fuerte).
    - `Glow`: `0 0 16px #38bdf8` (resplandor cian para mapas oscuros o nodos destacados).
  - **Sliders de precisión:**
    - Slider de Desenfoque (`Blur`): 1px a 40px.
    - Slider de Desplazamiento Vertical (`OffsetY`): 0px a 30px.
  - **ColorPicker:** Selector de color de sombra con botón de restablecimiento.

#### ✅ Objeto #4: Sombra en Nubes Envolventes (Completado)
* **Ubicación:** ToolPanel > Pestaña **Nube** (`CloudsTab.tsx`), sección *"Bordes y Contorno"*.
* **Características:**
  - 🔘 **Switch principal:** `Sombra Envolvente [ OFF / ON ]`.
  - **Efecto Isla Conceptual con Silueta Sólida Dedicada:** Sombra proyectada mediante una capa de silueta sólida `<path>` renderizada inmediatamente detrás del tinte de la nube con `filter: blur(...)` y `opacity` configurable. Resuelve el problema donde el 8% de opacidad (`0.08`) del tinte de la nube diluía la sombra haciéndola casi invisible.
  - **4 Presets rápidos:**
    - `Suave`: opacidad `22%`, blur `14px`, offset Y `4px` (agrupación visual tenue).
    - `Isla 3D`: opacidad `40%`, blur `24px`, offset Y `10px` (elevación marcada sobre el lienzo).
    - `Profunda`: opacidad `60%`, blur `36px`, offset Y `16px` (máxima presencia y relieve).
    - `Glow`: opacidad `70%`, blur `18px`, offset Y `0px` (halo de resplandor neón).
  - **Sliders de precisión:**
    - Slider de **Intensidad de Sombra (`Opacity`):** `10%` a `95%` (ajuste directo de notoriedad).
    - Slider de **Desenfoque (`Blur`):** `4px` a `48px`.
    - Slider de **Desplazamiento Vertical (`OffsetY`):** `0px` a `30px`.
  - **ColorPicker:** Sombra temática o neutra oscura con selector dinámico.

---

#### ✅ Objeto #5: Sombra en Aristas del Árbol (Completado - Dual Global y Local)
* **Ubicación:**
  - **Nivel Global:** ToolPanel > Pestaña **Mapa** (`ThemeTab.tsx`), sección *"Aristas Globales"*.
  - **Nivel Local del Nodo:** ToolPanel > Pestaña **Estilos** (`FormatTab.tsx`), sección *"Aristas y Propagación"* (con botones *"Aplicar a Hijos"* y *"Aplicar a Hermanos"*).
* **Características:**
  - 🔘 **Switch principal:** `Sombra de Aristas Global [ OFF / ON ]` y `Sombra de la Rama [ OFF / ON ]`.
  - **Jerarquía inteligente:** La arista del nodo puede sobreescribir la regla global (o desactivarse selectivamente), y hereda automáticamente la del mapa si no se especifica.
  - **3 Presets rápidos:**
    - `Suave`: `0 2px 4px rgba(0,0,0,0.20)` (relieve sutil que despega las ramas del fondo).
    - `3D`: `0 4px 8px rgba(0,0,0,0.35)` (profundidad marcada estilo ramas suspendidas).
    - `Glow`: `0 0 6px [colorRama]` (resplandor neón adaptativo: cada rama brilla con su propio color en mapas multicolor).
  - **Sliders de precisión:**
    - Slider de **Desenfoque (`Blur`):** `1px` a `20px`.
    - Slider de **Desplazamiento Vertical (`OffsetY`):** `0px` a `16px`.
  - **ColorPicker:** Color personalizado o modo adaptativo automático.

#### ✅ Objeto #6: Sombra en Conectores Libres / Relaciones (Completado)
* **Ubicación:** Modal de Edición de Conector (`ConnectorModal.tsx`), sección *"Sombra Flotante"*.
* **Características:**
  - 🔘 **Switch principal:** `Sombra Flotante [ OFF / ON ]`.
  - Proyecta relieve o resplandor neón tanto en la curva transversal SVG como en las flechas y el badge central con etiqueta.
  - **3 Presets rápidos:** `[ Suave ]`, `[ Profunda ]` y `[ Glow ]` (halo dinámico según el color del conector).
  - **Sliders de precisión:** Desenfoque (1-20px) y Desplazamiento Y (0-16px).
  - **ColorPicker:** Sombra temática o neutra.

---

### 1.3. 💬 Anatomía Configurable de la Colita de Bocadillo (`NodeBubbleTail`) (Completado)
* **Diagrama de Especificación:** [📄 `doc/img/propuesta-anatomia-colita-burbuja.svg`](file:///d:/admin/OneDrive/Documents/IA-code/FreeplaneWeb/Freemind/doc/img/propuesta-anatomia-colita-burbuja.svg)
* **Ubicación:** ToolPanel > Pestaña **Estilos** (`FormatTab.tsx`), dentro de *"Forma y Geometría"* al seleccionar la forma `bubble`.
* **4 Cualidades Anatómicas Totalmente Configurables:**
  1. **Tamaño y Longitud de la Colita (`tailLength`):**
     - Rango de `0px` a `32px` (`0px` = sin colita, convirtiendo el bocadillo en una tarjeta redondeada limpia).
     - Presets rápidos: `Ninguna (0px)`, `Corta (6px)`, `Media (12px estándar)`, `Larga (20px)`.
     - Ancho de la base (`tailWidth`): `6px` a `30px` (amplitud en la unión con el nodo).
  2. **Lado de Salida / Orientación Cardinal (`tailSide`):**
     - Botones segmentados: `Auto (Padre)`, `↓ Abajo`, `↑ Arriba`, `← Izq`, `→ Der`.
     - En modo automático apunta orgánicamente hacia el nodo padre según el cuadrante del lienzo.
  3. **Posición en el Borde (`tailOffset`):**
     - Rango de `15%` a `85%` a lo largo de la cara del nodo.
     - Presets rápidos: `Inicio (20%)`, `Centro (50%)`, `Fin (80%)`.
  4. **Estilo Anatómico (`tailStyle`):**
     - `▲ Recta / Clásica`: Pico triangular simétrico para diálogos formales.
     - `~ Curva / Dinámica`: Arco Bézier arqueado estilo cómic.
     - `○ Nube / Pensamiento`: Tres círculos decrecientes para reflexiones e ideas.
* **Integración con Sombras:** Si el nodo tiene activa la sombra (`nodeShadow`), la colita hereda idéntico filtro `drop-shadow(...)` para una integración visual perfecta.
* **Propagación en Árbol:** Soporta *"Aplicar a Hijos"* y *"Aplicar a Hermanos"*.

---

### 1.4. ⌨️ Paleta de Comandos Rápida (`Ctrl + K` / `Cmd + K`) (Completado)
* **Ubicación:** Accesible globalmente mediante el atajo de teclado `Ctrl + K` (Windows/Linux) o `Cmd + K` (macOS), así como mediante el botón interactivo con pill `⌘K` en la `ToolBar` y en el menú *"Ver"* de `MenuBar`.
* **Capacidades Principales:**
  - **Buscador Universal de Nodos en Tiempo Real:** Indexa de inmediato todos los nodos del mapa mental por título, cuerpo/nota explicativa o `#etiquetas`. Al seleccionar un nodo, el lienzo ejecuta un vuelo cinemático suave y centra la cámara sobre el nodo (`focusTarget`) seleccionándolo automáticamente.
  - **Ejecución Instantánea de Comandos y Atajos:** Acceso directo a acciones de nodo (`Tab` para hijo, `Enter` para hermano, `F2` para editar texto, `Espacio` para plegar/desplegar, `Supr` para borrar, copiar/pegar rama, crear conectores flotantes, alternar nubes, selector de iconos, reseteo de formato y propagación de estilos).
  - **Selector Rápido de Temas y Diseños:** Aplicación inmediata de los 8 temas del mapa (Clásico Azul, Arcoíris, Modo Oscuro, Bosque, etc.) y los 9 layouts de distribución (bilateral, equilibrado, árbol derecho/izquierdo, organigrama descendente/ascendente, radial 360° y circular).
  - **Conmutación Rápida de Formas y Sombras:** Alternar formas de nodo (bocadillo, rectángulo, píldora, círculo, óvalo, hexágono, flecha, estrella, fork) y sombras en vivo.
  - **Vistas y Modos de Presentación:** Lanzar presentación dinámica (`F5`), clásica o elaborada espacial; alternar panel de esquema (`Alt+O`), propiedades (`Alt+P`) o barra de filtros (`Ctrl+F`).
  - **Gestión de Archivos y UI:** Guardar mapa, ver mapas guardados, plantillas, exportar, atajos de teclado y alternar tema de interfaz (claro, oscuro, sepia).
* **Navegación Fluida por Teclado:**
  - Flechas `↑` y `↓` para recorrer resultados con desplazamiento automático a la fila activa (`scrollIntoView`).
  - `↵ Enter` para ejecutar el comando seleccionado y cerrar la paleta.
  - `ESC` para cerrar instantáneamente.
  - Pestañas de categoría (`Todos`, `Acciones`, `Nodos`, `Temas`, `Diseño`, `Formas`, `Sombras`, `Vistas`, `Archivo`).
  - Sintaxis de prefijos: `>` para buscar únicamente acciones/comandos (excluyendo nodos) y `@` para buscar exclusivamente nodos del mapa.

---

---

### 1.5. 🖨️ Exportación Mejorada a PDF Vectorial e Impresión Profesional (Completado)
* **Ubicación:** Menú *"Archivo"* > *"Exportar PDF Vectorial..."*, acceso destacado en `ExportImportModal.tsx`, comando en `CommandPaletteModal.tsx` (`Ctrl+K`) y modal dedicado `PdfExportModal.tsx`.
* **Capacidades Principales:**
  - **Calidad Vectorial Pura 100% Nítida:** Genera documentos PDF a partir de SVG nativo compilado con directivas `@page`. Los textos son seleccionables y buscables, las líneas y curvas Bézier no se pixelan y se preservan todas las formas de nodo, colitas de bocadillos, sombras y conectores libres.
  - **Formatos de Papel Estándar e Internacionales:** Soporta A4, A3, A2, Carta (Letter), Oficio (Legal), Tabloide y formato Póster Continuo.
  - **Orientación:** Conmutador inmediato entre Horizontal (*Landscape*) y Vertical (*Portrait*).
  - **Modos de Paginación Avanzada:**
    - `1 Sola Hoja (Póster completo)`: Ajuste automático de escala para encajar el mapa íntegro en una página con márgenes simétricos.
    - `Mosaicos Inteligentes (2×1, 2×2, 3×2, 3×3)`: Para mapas de gran tamaño, divide el mapa en una matriz de hojas (2, 4, 6 o 9 páginas) con marcas de corte en las esquinas (*crop marks*) y líneas guía de solapamiento de 15mm para imprimir y armar un mural en pared.
  - **Opciones de Acabado para Imprenta:**
    - Alternar fondo de lienzo o fondo blanco puro para ahorro de tinta en impresoras de oficina.
    - Encabezado y pie técnico con título, fecha, autor y numeración de página.
  - **Simulación Visual de la Hoja:** Vista previa interactiva con el aspect ratio real del papel seleccionado y división en cuadrícula en tiempo real.
  - **Doble Salida:** Impresión/guardado directo en PDF mediante el motor nativo del navegador y descarga directa del archivo vectorial `.svg`.

---

### 1.6. ⏳ Historial Visual de Versiones (Undo / Redo Timeline) (Completado)
* **Ubicación:** Botón dedicado con contador dinámico en `ToolBar`, menú *"Editar"* > *"Historial de Cambios..."* (`Ctrl+Shift+H`), comando en `CommandPaletteModal.tsx` (`Ctrl+K`) y modal dedicado `HistoryTimelineModal.tsx`.
* **Capacidades Principales:**
  - **Línea de Tiempo Cronológica Completa (40+ pasos):** Muestra todos los estados disponibles en una sola vista vertical conectada: snapshots pasados (`historyPast`), versión activa actual (`📍 Versión Actual`) y pasos futuros rehechos (`historyFuture`).
  - **Motor de Diferencias Semánticas Inteligente (`src/utils/historyDiff.ts`):** Compara automáticamente dos estados consecutivos del mapa y explica detalladamente la acción efectuada:
    - Nodos agregados o eliminados (con mención del título y nodo padre).
    - Edición de texto y notas/cuerpos (`"Antes" → "Ahora"`).
    - Reparenting y reubicación de ramas.
    - Plegado y desplegado de ramas.
    - Cambios de estilo, color, formas geométricas o anatomía de colitas de bocadillos.
    - Cambios en nubes envolventes y sombras.
    - Conectores libres y relaciones añadidas o removidas.
    - Cambios en el tema cromático (`themeId`) o distribución del mapa (`layout`).
  - **Restauración No Destructiva e Instantánea:** Salto a cualquier versión (`handleJumpToHistory`). Al regresar a una versión pasada, no se descarta el trabajo posterior, sino que se desplaza a la pila de rehacer.
  - **Guardar Copia como Nuevo Mapa:** Permite duplicar o bifurcar cualquier snapshot del historial como un mapa mental independiente en la biblioteca local sin alterar el mapa activo.
  - **Panel de Inspección y Previsualización Esquemática:** Despliega métricas precisas (nodos, conectores, nubes, tema, distribución y fecha/hora con timestamps relativos como *"Hace 2 min"*), tarjeta con la explicación del cambio y un mini-árbol esquemático con las ramas principales y sus colores de acento.
  - **Búsqueda y Filtros de Timeline:** Buscador en vivo para localizar cambios por texto de nodo o acción, y botones segmentados `[ Todos ]`, `[ Pasados ]` y `[ Futuros ]`.
  - **Navegación 100% por Teclado:** Flechas `↑` y `↓` para recorrer versiones, `Enter` para restaurar y `Esc` para salir.

---

### 1.7. 🔍 Filtros Avanzados por Metadatos y Spotlight en el Lienzo (Completado)
* **Ubicación:** Barra superior de búsqueda y filtrado (`FilterBar.tsx`), accesible mediante `Ctrl + F`, botón interactivo en `ToolBar` y comando en `CommandPaletteModal.tsx`.
* **Capacidades Principales:**
  - **Búsqueda Textual Exhaustiva:** Búsqueda en vivo sobre títulos de nodo, notas enriquecidas (`note`), cuerpo/subtexto descriptivo (`body`) y `#etiquetas`.
  - **Multi-Tags con Lógica Booleana:** Selector de etiquetas con soporte para combinaciones lógicas `AND` (debe contener todas las etiquetas especificadas) y `OR` (al menos una de ellas).
  - **Filtros de Progreso Multinivel:**
    - Presets semánticos: `Sin Iniciar (0%)`, `En Curso (1% - 99%)` y `Completado (100%)`.
    - Umbrales porcentuales mínimos: `Progreso ≥ 25%`, `Progreso ≥ 50%` y `Progreso ≥ 75%`.
  - **Filtros por Presencia de Metadatos y Contenido:** Panel desplegable `[+ Metadatos]` con botones interactivos:
    - 📝 **Con Notas:** Nodos con texto explicativo o notas extensas en Markdown.
    - 🔗 **Con Enlaces:** Nodos con URLs o hipervínculos externos.
    - 🖼️ **Con Imágenes:** Nodos con imágenes o ilustraciones adjuntas.
    - ☁️ **En Nube:** Nodos agrupados dentro de una nube conceptual envolvente.
    - ⭐ **Con Iconos:** Nodos con insignias o iconos vectoriales asignados.
  - **Filtros Temporales por Fecha:** Filtrado de nodos creados o editados hoy (`today`), en los últimos 7 días (`week`) o en el último mes (`month`).
  - **Árbol Contextual Jerárquico (`includeAncestors`):** Conmutador para mantener visibles todos los nodos padre hasta la raíz, permitiendo situar exactamente en qué rama se encuentra cada coincidencia sin ver nodos flotantes aislados.
  - **Efecto Visual Spotlight en el Lienzo (`MindMapCanvas.tsx`):**
    - Los nodos que coinciden directamente se iluminan y destacan con un anillo resplandeciente ámbar.
    - Los nodos no coincidentes y sus líneas conectoras se atenúan suavemente al 20% de opacidad (`opacity: 0.22`), creando un efecto de enfoque profesional.

---

### 1.8. 🖼️ Exportación de Imágenes HD (PNG/JPEG/SVG en 1x/2x/4x) y Esquemas Estructurados (Markdown / OPML 2.0) (Completado)
* **Ubicación:** Menú *"Archivo"* > *"Exportar Imagen HD (PNG / JPG)..."*, *"Exportar Esquema (Markdown / OPML)..."*, modal `ExportImportModal.tsx`, comando en `CommandPaletteModal.tsx` (`Ctrl+K`) y modal interactivo dedicado `ImageExportModal.tsx`.
* **Capacidades Principales:**
  - **Rasterización Vectorial a Canvas de Alta Definición:**
    - Genera imágenes a partir de SVG vectorial nativo sin pixelación.
    - **Resoluciones escaladas:** `1x` (Web/Email), `2x Retina HD` (PowerPoint, Keynote, pantallas de alta densidad) y `4x Ultra HD 4K` (murales e impresiones de gran escala).
    - **Modos de fondo:** `Transparente` (para insertar siluetas limpias sobre diapositivas oscuras o documentos), `Lienzo del Mapa` (color temático o degradado activo) y `Blanco Puro`.
    - **Copiado Directo al Portapapeles:** Botón integrado para copiar PNG nativo con `ClipboardItem` y pegarlo al instante con `Ctrl+V` en Word, PowerPoint, Notion o Slack sin necesidad de descargar archivos temporales.
  - **Esquemas Estructurados Multiformato:**
    - **Markdown Jerárquico (# Encabezados):** Convierte el árbol en encabezados `#`, `##`, `###` para generar documentos navegables en Notion, Obsidian y Logseq.
    - **Markdown en Viñetas (- Listas):** Resumen jerárquico anidado en texto plano.
    - **Listas de Tareas (- [ ] Checklist):** Transforma el progreso porcentual del mapa en checklists ejecutables (`[x]` para 100%, `[ ]` para tareas pendientes).
    - **Estándar OPML 2.0:** Genera XML OPML interoperable con OmniOutliner, Workflowy, MindNode, Dynalist y Scrivener.
    - **Inclusión granular:** Selector de notas (`> quote`), cuerpos descriptivos, enlaces, etiquetas `#tags`, metadatos y tabla de relaciones libres.
    - Visor de código en tiempo real con botón *"Copiar Texto"* y descarga de archivo `.md` / `.opml`.

---

## 📊 2. Estado de Calidad Actual

* **TypeScript (`pnpm lint`):** 0 errores (`tsc --noEmit`).
* **Cobertura de Pruebas (`pnpm test:regression`):** **57 suites pasadas, 379/379 tests exitosos (100%)**.
* **Compilación de Producción (`pnpm build`):** Exitosa con Vite en 6.76s (0 errores).
* **Servidor Dev:** Operativo en `http://localhost:3000/`.

