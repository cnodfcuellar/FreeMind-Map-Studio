# Especificación Técnica y Diseño ASCII de la Interfaz

**Aplicación:** FreeMind Map Studio  
**Tipo:** Editor de Mapas Mentales Portable & Offline (Estilo Freeplane / Mindomo)  
**Resolución Base:** 1920 × 1080 px (Diseño adaptativo desde 1024px hasta 4K)

---

## 1. Mapa Global de la Pantalla (Layout Principal)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| [1] BARRA DE MENÚ SUPERIOR (MenuBar)                                                                   [Altura: 48px]   |
| [🧠 Logo + Título Editable]  [Archivo] [Editar] [Insertar] [Formato] [Ver] [Ayuda]   [● Guardado] [Esquema] [Prop] [▶ F5]  |
+-------------------------------------------------------------------------------------------------------------------------+
| [2] BARRA DE HERRAMIENTAS RÁPIDAS (ToolBar)                                                            [Altura: 44px]   |
| [+ Hijo] [+ Hermano] [✂️] [📋] | [Forma ▾] [Color ▾] [☁ Nube] [🔗 Relación] | [↺ Deshacer] [↻] | [🔍 - 100% + ⛶] | [Filtro]  |
+-------------------------------------------------------------------------------------------------------------------------+
| [3] BARRA DE FILTRO / BÚSQUEDA (FilterBar - Desplegable con Ctrl+F)                                    [Altura: 40px]   |
| [🔍 Buscar texto...]  [🏷️ Tags ▾]  [📊 Progreso ▾]  [🚩 Icono ▾]  [✕ Limpiar Filtros]                  (Coincidencias: 8/32)  |
+-------------------------------------------------------------------------------------------------------------------------+
|                                                                                           |                             |
|                                                                                           | [5] PANEL LATERAL DERECHO   |
|                                                                                           |     (ToolPanel Inspector)   |
|                                                                                           |                             |
|                                 [4] LIENZO INFINITO SVG/HTML                              |     [Ancho: 340px - 380px]  |
|                                     (MindMapCanvas)                                       |                             |
|                                                                                           | +-------------------------+ |
|                                 (Área dinámica: 100% × 100%)                              | | Pestañas:               | |
|                                                                                           | | [Texto] [Estilo] [Meta] | |
|               +------------------+         +------------------+                           | +-------------------------+ |
|               |  Rama Izquierda  |<------- |   NODO CENTRAL   | -------> +--------------+ | | TÍTULO DEL NODO         | |
|               |  (Bubble / Pill) |         |   (Root Bubble)  |          | Rama Derecha | | | [ Input de texto     ] | |
|               +------------------+         +------------------+          +--------------+ | |                         | |
|                                                     |                                     | | CUERPO / SUBTEXTO       | |
|                                                     v                                     | | [ Explicación...      ] | |
|                                            +------------------+                           | |                         | |
|                                            | Sub-Rama Fork    |                           | | FORMA Y BORDES          | |
|                                            | (Underline)      |                           | | [ ⬭ Burbuja ][ ─ Fork ] | |
|                                            +------------------+                           | | [ ▭ Rect   ][ ⬡ Hex  ] | |
|                                                                                           | |                         | |
|                                                                                           | | COLORES Y TIPOGRAFÍA    | |
|                                                                                           | | [ Fondo ][ Texto ][ Borde] |
|                                                                                           | |                         | |
|                                                                                           | | METADATOS & NOTAS MD    | |
|                                                                                           | | [ Notas 📄 ][ Enlace 🔗 ] |
|                                                                                           | | [ Progreso 0-100% 📊   ] |
| +------------------------------------+                                                    | | [ Tags 🏷️ ][ Iconos ⭐ ] |
| | [6] MINIMAPA RADAR (MiniMap)       |                                                    | +-------------------------+ |
| | [Ancho: 160/220/300px | Alto: ~60%]|                                                    |                             |
| | [ [S] [M] [L]  (Cámara activa ▢) ] |                                                    |                             |
| +------------------------------------+                                                    |                             |
+-------------------------------------------------------------------------------------------------------------------------+
| [7] BARRA DE ESTADO INFERIOR (StatusBar)                                                               [Altura: 24px]   |
| Nodos totales: 28 | Seleccionado: "Atajos de Teclado" (ID: sc-1) | Zoom: 100% | Posición: (X: 0, Y: 0) | Modo: Listo     |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 2. Desglose Detallado de Medidas y Coordenadas

| Componente UI | Posición / Tipo | Ancho (Width) | Alto (Height) | Padding / Gap | Z-Index |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MenuBar** | Fijo Superior | `100vw` (100%) | `48px` | `px-4 py-1.5` / Gap `8px` | `z-40` |
| **ToolBar** | Fijo bajo MenuBar | `100vw` (100%) | `44px` | `px-4 py-1` / Gap `6px` | `z-30` |
| **FilterBar** | Plegable (Ctrl+F) | `100vw` (100%) | `40px` | `px-4 py-1` / Gap `8px` | `z-25` |
| **Canvas Central** | Flexible | `calc(100vw - PanelWidth)` | `calc(100vh - 116px)` | `p-0` (Scroll & Pan infinito) | `z-0` |
| **ToolPanel (Inspector)** | Panel Lateral Derecho | `350px` (Móvil: `100vw`) | `calc(100vh - 92px)` | `p-4` / Gap `12px` | `z-30` |
| **OutlineView** | Panel Lateral Izq / Modal | `340px` - `420px` | `calc(100vh - 92px)` | `p-4` / Gap `8px` | `z-30` |
| **MiniMap** | Flotante Inferior Izq | `S: 160px / M: 220px / L: 300px` | `S: 100px / M: 140px / L: 190px` | `p-2` / Margen `16px` | `z-20` |
| **Modales Centrales** | Ventana emergente | `520px` - `780px` | Auto (Max `85vh`) | `p-6` / Centrado | `z-50` |
| **Modo Presentación** | Pantalla Completa | `100vw` | `100vh` | `p-8` | `z-50` |

---

## 3. Estructura y Opciones de Cada Menú Superior

```text
+----------------------------------------------------------------------------------------------------------------------+
| [🧠 FreeMind Studio]  [Archivo ▾]  [Editar ▾]  [Insertar ▾]  [Formato ▾]  [Ver ▾]  [Ayuda ▾]     [● 100% Guardado]     |
+----------------------------------------------------------------------------------------------------------------------+
```

### 3.1. Menú [Archivo] (File)
```text
+----------------------------------------------------+
| 📄 Nuevo Mapa                    (Ctrl + Alt + N)  |
| 📂 Abrir / Importar...           (Ctrl + O)        |
|    ├── Archivo Freeplane (.mm XML)                 |
|    ├── Respaldo JSON (.json)                       |
|    └── Esquema Markdown (.md)                      |
| -------------------------------------------------- |
| 💾 Guardar ahora                 (Ctrl + S)        |
| 📁 Mis Mapas Guardados           (Alt + M)         |
| 📋 Plantillas Predefinidas...    (Alt + T)         |
| -------------------------------------------------- |
| 📤 Exportar Mapa como...         (Ctrl + E)        |
|    ├── Freeplane / FreeMind (.mm XML)              |
|    ├── Página HTML Autónoma (.html)                |
|    ├── Imagen Vectorial SVG (.svg)                 |
|    ├── Imagen Alta Resolución PNG (.png)           |
|    ├── Documento Markdown (.md)                    |
|    └── Copia de Seguridad JSON (.json)             |
| -------------------------------------------------- |
| 🖨️ Imprimir / Guardar PDF        (Ctrl + P)        |
+----------------------------------------------------+
```

### 3.2. Menú [Editar] (Edit)
```text
+----------------------------------------------------+
| ↺ Deshacer                       (Ctrl + Z)        |
| ↻ Rehacer                        (Ctrl + Y / ⇧+Z)  |
| -------------------------------------------------- |
| ✂️ Cortar Rama                   (Ctrl + X)        |
| 📋 Copiar Rama                   (Ctrl + C)        |
| 📥 Pegar como Hijo               (Ctrl + V)        |
| 🗑️ Eliminar Nodo y Sub-ramas     (Supr / Backspace)|
| -------------------------------------------------- |
| ✏️ Editar Texto del Nodo         (F2 / Doble Clic) |
| 📑 Editar Explicación / Cuerpo   (Alt + B)         |
| 🔍 Buscar y Reemplazar           (Ctrl + F)        |
| 🔲 Seleccionar Todos los Nodos   (Ctrl + A)        |
+----------------------------------------------------+
```

### 3.3. Menú [Insertar] (Insert)
```text
+----------------------------------------------------+
| ➕ Nuevo Nodo Hijo               (Tab / Insert)    |
| ➕ Nuevo Nodo Hermano            (Enter)           |
| ➕ Nuevo Hermano Superior        (Shift + Enter)   |
| -------------------------------------------------- |
| 📄 Nota Markdown al Nodo         (Alt + N)         |
| 🔗 Enlace Web (URL)              (Alt + K)         |
| 📊 Barra de Progreso (0-100%)    (Alt + Shift + P) |
| ⭐ Iconos / Banderas             (Alt + I)         |
| 🏷️ Etiquetas / Tags             (Alt + G)         |
| -------------------------------------------------- |
| 🔗 Conector Flotante a otro nodo (Alt + C)         |
| ☁️ Nube de Agrupación Visual     (Alt + W)         |
+----------------------------------------------------+
```

### 3.4. Menú [Formato] (Format)
```text
+----------------------------------------------------+
| 🎨 Temas Visuales Predefinidos                     |
|    ├── 🔵 Clásico Freeplane (Default Blue)         |
|    ├── 🌲 Bosque Esmeralda (Forest Green)          |
|    ├── 🟣 Creativo Púrpura (Purple Violet)         |
|    ├── 🌅 Atardecer Cálido (Warm Amber)            |
|    └── 🌑 Modo Oscuro Cyberpunk (Dark Contrast)    |
| -------------------------------------------------- |
| ⬭ Forma del Nodo                                   |
|    ├── 🫧 Burbuja Redondeada (Bubble)              |
|    ├── ─ Horquilla Clásica (Fork / Underline)      |
|    ├── ▭ Rectángulo Estructurado (Rectangle)       |
|    ├── ⬡ Hexágono de Hito (Hexagon)               |
|    ├── ⬯ Óvalo Elíptico (Oval)                    |
|    └── 💊 Cápsula / Píldora (Pill)                 |
| -------------------------------------------------- |
| 🔤 Tipografía y Tamaño (12px, 14px, 16px, 18px...) |
| 🎨 Paleta de Color de Fondo, Texto y Borde         |
| 🧹 Restablecer Formato al Predeterminado           |
+----------------------------------------------------+
```

### 3.5. Menú [Ver] (View)
```text
+----------------------------------------------------+
| 🎯 Centrar Vista en Nodo Raíz    (Espacio / Home)  |
| ⛶ Ajustar Todo el Mapa al Lienzo (Ctrl + 0)        |
| ➕ Aumentar Zoom (Zoom In)       (Ctrl + +)        |
| ➖ Reducir Zoom (Zoom Out)       (Ctrl + -)        |
| -------------------------------------------------- |
| 📑 Panel de Esquema (Outline)    (Alt + O)         |
| 🛠️ Panel de Propiedades         (Alt + P)         |
| 🗺️ Mostrar / Ocultar MiniMapa    (Alt + M)         |
|    ├── Tamaño Pequeño (S - 160px)                  |
|    ├── Tamaño Mediano (M - 220px)                  |
|    └── Tamaño Grande  (L - 300px)                  |
| -------------------------------------------------- |
| 🖥️ Modo Presentación Pantalla    (F5)              |
+----------------------------------------------------+
```

---

## 4. Anatomía Visual de un Nodo en el Lienzo (NodeComponent)

```text
    +---------------------------------------------------------------------------+
    |                                NODO BURBUJA                               |
    |  +---------------------------------------------------------------------+  |
    |  | [⭐] [🚩] [📄]  TÍTULO PRINCIPAL EN NEGRITA (16px)     [85% 📊] [🔗] |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  Cuerpo / Explicación del nodo:                                     |  |
    |  |  "Detalle descriptivo en tipografía regular de 11px con color       |  |
    |  |   secundario perfectamente contrastado."                            |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  🏷️ [Tutorial]  🏷️ [Productividad]                                  |  |
    |  +---------------------------------------------------------------------+  |
    |                                   |                                       |
    |                       [+ 3] (Botón Plegar / Desplegar)                    |
    +-----------------------------------|---------------------------------------+
                                        v
                            (Línea Bezier SVG al Hijo)
```

### Variantes Geométricas de Nodos:
```text
  1. BURBUJA (Bubble)           2. HORQUILLA (Fork)          3. PÍLDORA (Pill)
  .-----------------------.     Texto del nodo subrayado     (-----------------------)
  |  Texto del Nodo       |     ========================     (  Texto en Cápsula     )
  '-----------------------'                                  (-----------------------)

  4. RECTÁNGULO (Rect)          5. HEXÁGONO (Hexagon)        6. ÓVALO (Oval)
  +-----------------------+          /\                      .-----------------------.
  |  Texto Estructurado   |     /--'    '--\                /                         \
  +-----------------------+     \--.    .--/                \                         /
                                     \/                      '-----------------------'
```

---

## 5. Panel Inspector de Propiedades (ToolPanel - Ancho 350px)

```text
+-----------------------------------------------------------------------+
|  🛠️ PROPIEDADES DEL NODO                                        [✕]   |
+-----------------------------------------------------------------------+
|  [ 📝 Contenido ]   [ 🎨 Estilo & Forma ]   [ 📑 Metadatos & Enlaces ]|
+-----------------------------------------------------------------------+
|                                                                       |
|  [SECCIÓN 1: TÍTULO Y CUERPO]                                         |
|  Título Principal:                                                    |
|  +-----------------------------------------------------------------+  |
|  | Atajos de Teclado Rápidos                                       |  |
|  +-----------------------------------------------------------------+  |
|  Explicación / Cuerpo del Nodo:                                       |
|  +-----------------------------------------------------------------+  |
|  | Navegación ágil y creación a la velocidad del pensamiento sin    |  |
|  | depender del ratón.                                             |  |
|  +-----------------------------------------------------------------+  |
|  Tipografía Cuerpo:  [ Fuente: Sans ▾ ]  [ Tamaño: 11px ▾ ]  [ Cursiva]|
|                                                                       |
|  [SECCIÓN 2: FORMAS Y GEOMETRÍA]                                      |
|  +--------------+  +--------------+  +--------------+                 |
|  |  ⬭ Burbuja   |  |  ─ Fork      |  |  💊 Píldora  |                 |
|  +--------------+  +--------------+  +--------------+                 |
|  +--------------+  +--------------+  +--------------+                 |
|  |  ▭ Rect      |  |  ⬡ Hexágono  |  |  ⬯ Óvalo     |                 |
|  +--------------+  +--------------+  +--------------+                 |
|                                                                       |
|  [SECCIÓN 3: COLOR Y BORDES]                                          |
|  Fondo:   [ ⚪ #FFFFFF ] [ 🔵 #EFF6FF ] [ 🟢 #F0FDF4 ] [ 🟡 #FEFCE8 ]  |
|  Texto:   [ ⚫ #1E293B ] [ 🔵 #1E40AF ] [ 🟢 #166534 ] [ 🟣 #581C87 ]  |
|  Borde:   [ Grosor: 1.5px ▾ ]  [ Color: 🟦 #3B82F6 ]                  |
|                                                                       |
|  [SECCIÓN 4: METADATOS Y NOTAS]                                       |
|  Progreso de Tarea: [==== 85% ====]                                   |
|  Iconos: [ ⭐ Favorito ] [ 🚩 Urgente ] [ ⚡ Rápido ] [ 📄 Nota MD ]   |
|  Etiquetas (Tags): [ + Añadir tag... ]                                |
|  Enlace URL: [ https://ejemplo.com                             ]      |
|  Nota Markdown:                                                       |
|  +-----------------------------------------------------------------+  |
|  | ## Documentación detallada                                      |  |
|  | - Punto clave 1                                                 |  |
|  | - Punto clave 2                                                 |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

---

## 6. Diagrama de Conectores Flotantes y Nubes

```text
                    +-------------------+
  (Nube Translúcida |  Nodo Origen A    |
   rgba(59,130,246) |  (Área Comercial) |
                    +---------+---------+
                              |
                              | ~ ~ ~ ~ ~ ~ ~ ~ Conector Flotante Curvo (Bezier)
                              |                 Estilo: Punteado / Discontinuo
                              |                 Color: #3b82f6
                              |                 Etiqueta: "100% Compatible"
                              v
                    +-------------------+
                    |  Nodo Destino B   |
                    |  (Privacidad)     |
                    +-------------------+
```

---

## 7. Tabla Resumen de Atajos Globales de Teclado

| Atajo de Teclado | Acción en la Interfaz |
| :--- | :--- |
| <kbd>Tab</kbd> o <kbd>Insert</kbd> | Crear un nuevo nodo **Hijo** |
| <kbd>Enter</kbd> | Crear un nuevo nodo **Hermano** al mismo nivel |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | Crear un nodo hermano en posición superior |
| <kbd>Espacio</kbd> | Plegar o desplegar la rama del nodo seleccionado |
| <kbd>F2</kbd> o <kbd>Doble Clic</kbd> | Entrar en modo de edición rápida de texto |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> | Navegar la selección entre nodos del árbol |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>X</kbd> / <kbd>V</kbd> | Copiar, cortar y pegar ramas completas |
| <kbd>Supr</kbd> / <kbd>Backspace</kbd> | Eliminar el nodo y todas sus sub-ramas |
| <kbd>Alt</kbd> + <kbd>O</kbd> | Abrir / Cerrar el panel de **Esquema (Outline)** |
| <kbd>Alt</kbd> + <kbd>P</kbd> | Abrir / Cerrar el panel de **Propiedades** |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Abrir la barra de **Búsqueda y Filtro** |
| <kbd>F5</kbd> | Iniciar **Modo Presentación** en pantalla completa |
| <kbd>Ctrl</kbd> + <kbd>E</kbd> | Abrir modal de **Exportación e Importación** |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Deshacer / Rehacer cambios |
