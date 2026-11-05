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

## 💡 2. Otras Mejoras Planificadas para el Editor

1. **Paleta de Comandos Rápida (`Ctrl + K` / `Cmd + K`)**:
   - Acceso instantáneo por teclado a todas las acciones: cambiar tema, alternar sombras, buscar nodos, exportar o cambiar layouts.
2. **Exportación Mejorada a PDF Vectorial**:
   - Renderizado directo a PDF con paginación inteligente de mapas gigantes.
3. **Historial Visual de Versiones**:
   - Visualización gráfica de los 40 pasos del historial de `undo/redo` con miniaturas de restauración.
4. **Filtros Avanzados por Metadatos**:
   - Filtrar el mapa por fecha de modificación, porcentaje de avance (`progress`) o combinación booleana de `#tags`.

---

## 📊 3. Estado de Calidad Actual

* **TypeScript (`pnpm lint`):** 0 errores.
* **Cobertura de Pruebas (`pnpm test:regression`):** 34 archivos pasados, **179/179 tests exitosos (100%)**.
* **Compilación de Producción (`pnpm build`):** Exitosa con Vite.
* **Servidor Dev:** Operativo en `http://localhost:3000/`.

