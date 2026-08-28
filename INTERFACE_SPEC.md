# Especificacion Tecnica y Diseno de la Interfaz

**Aplicacion:** FreeMind Map Studio  
**Tipo:** Editor de Mapas Mentales Portable y Offline (Estilo Freeplane / Mindomo)  
**Resolucion Base:** 1920 x 1080 px (Diseno adaptativo desde 1024px hasta 4K)  
**Ultima actualizacion:** 2026-08-25  

---

## 1. Mapa Global de la Pantalla (Layout Principal)

```text
+--------------------------------------------------------------------------------------------------------------------------+
| [1] BARRA DE MENU SUPERIOR (MenuBar)                                                                    [Altura: 48px]   |
| [Logo + Titulo Editable]  [Archivo] [Editar] [Insertar] [Formato] [Ver] [Ayuda]   [Guardado] [Esquema] [Prop] [F5-Pres]  |
+--------------------------------------------------------------------------------------------------------------------------+
| [2] BARRA DE HERRAMIENTAS RAPIDAS (ToolBar)                                                             [Altura: 44px]   |
| [+Hijo] [+Hermano] [Cortar] [Pegar] | [Forma] [Color] [Nube] [Relacion] | [Deshacer] [Rehacer] | [-100%+][Full] | [Filtro] |
+--------------------------------------------------------------------------------------------------------------------------+
| [3] BARRA DE FILTRO / BUSQUEDA (FilterBar -- Ctrl+F)                                                    [Altura: 40px]   |
| [Buscar texto...]  [Tags]  [Progreso]  [Icono]  [Limpiar Filtros]                                    (Coincidencias: 8/32)|
+--------------------------------------------------------------------------------------------------------------------------+
|                                                                                            |                             |
|                                                                                            | [5] PANEL LATERAL DERECHO   |
|                                                                                            |     (ToolPanel Inspector)   |
|                                  [4] LIENZO INFINITO SVG/HTML                              |     [Ancho: 340px - 380px]  |
|                                      (MindMapCanvas)                                       |                             |
|                                                                                            | [ Texto | Estilo | Meta ]   |
|               +------------------+         +------------------+                            | [Titulo del Nodo]          |
|               |  Rama Izquierda  |<------- |   NODO CENTRAL   | -------> +------------+  | [Cuerpo / Subtexto]        |
|               |  (Bubble / Pill) |         |   (Root Bubble)  |          | Rama Decha |  | [Formas y Geometria]       |
|               +------------------+         +------------------+          +------------+  | [Fondo y Colores]          |
|                                                     |                                     | [Contornos y Bordes]       |
|                                                     v                                     | [Imagenes]                 |
|                                            +------------------+                           | [Aristas / Conexiones]     |
|                                            | Sub-Rama Fork    |                           | [Nube Agrupacion]          |
|                                            | (Underline)      |                           | [Metadatos y Notas]        |
|                                            +------------------+                           |                             |
|                                                                                            |                             |
| +------------------------------------+                                                     |                             |
| | [6] MINIMAPA RADAR (MiniMap)       |                                                     |                             |
| | [ S(160px) M(220px) L(300px) ]     |                                                     |                             |
| +------------------------------------+                                                     |                             |
+--------------------------------------------------------------------------------------------------------------------------+
| [7] BARRA DE ESTADO INFERIOR (StatusBar)                                                                [Altura: 24px]   |
| Nodos totales: 28 | Seleccionado: "Atajos" (ID: sc-1) | Zoom: 100% | Posicion: (0, 0) | Modo: Listo                      |
+--------------------------------------------------------------------------------------------------------------------------+
```

---

## 2. Desglose de Medidas y Componentes

| Componente UI | Tipo / Posicion | Ancho | Alto | Z-Index |
| :--- | :--- | :--- | :--- | :--- |
| **MenuBar** | Fijo Superior | `100vw` | `48px` | `z-40` |
| **ToolBar** | Fijo bajo MenuBar | `100vw` | `44px` | `z-30` |
| **FilterBar** | Plegable (Ctrl+F) | `100vw` | `40px` | `z-25` |
| **Canvas Central** | Flexible, pan infinito | `calc(100vw - 350px)` | `calc(100vh - 116px)` | `z-0` |
| **ToolPanel (Inspector)** | Panel Lateral Derecho | `350px` (Movil: `100vw`) | `calc(100vh - 92px)` | `z-30` |
| **OutlineView** | Panel Lateral Izq / Modal | `340px-420px` | `calc(100vh - 92px)` | `z-30` |
| **MiniMap** | Flotante Inferior Izq | `S:160px / M:220px / L:300px` | `100-190px` | `z-20` |
| **Modales** | Ventana emergente centrada | `520px-780px` | Auto (Max 85vh) | `z-50` |
| **Modo Presentacion** | Pantalla Completa | `100vw` | `100vh` | `z-50` |

---

## 3. Estructura y Opciones de Cada Menu Superior

### 3.1. Menu Archivo
- Nuevo Mapa (Ctrl + Alt + N)
- Abrir / Importar... (Ctrl + O): Freeplane .mm XML, Respaldo JSON, Esquema Markdown
- Guardar ahora (Ctrl + S)
- Mis Mapas Guardados
- Plantillas Predefinidas (Alt + T)
- Exportar Mapa como... (Ctrl + E): .mm XML, .html autonomo, .svg, .png, .md, .json
- Imprimir / Guardar PDF (Ctrl + P)

### 3.2. Menu Editar
- Deshacer (Ctrl + Z) / Rehacer (Ctrl + Y)
- Cortar, Copiar, Pegar rama (Ctrl+X/C/V)
- Eliminar Nodo y Sub-ramas (Supr / Backspace)
- Editar Texto del Nodo (F2 / Doble Clic)
- Editar Cuerpo (Alt + B)
- Buscar y Reemplazar (Ctrl + F)
- Seleccionar Todos (Ctrl + A)

### 3.3. Menu Insertar
- Nuevo Nodo Hijo (Tab / Insert)
- Nuevo Nodo Hermano (Enter)
- Nuevo Hermano Superior (Shift + Enter)
- Nota Markdown (Alt + N)
- Enlace Web URL (Alt + K)
- Barra de Progreso (Alt + Shift + P)
- Iconos / Banderas (Alt + I)
- Etiquetas / Tags (Alt + G)
- Imagen Adjunta al Nodo
- Conector Flotante (Alt + C)
- Nube de Agrupacion (Alt + W)

### 3.4. Menu Formato

Temas Visuales Predefinidos (9 temas):
- Clasico Azul (default), Arcoiris Vibrante (rainbow), Modo Oscuro (dark)
- Bosque Esmeralda (forest), Atardecer Calido (sunset), Minimalista Mono (minimal)
- Plano Tecnico Blueprint, Panal Creativo (honeycomb)

Forma del Nodo (10 formas): bubble, fork, rectangle, square, oval, circle, pill, hexagon, arrow, star

Tipografia, Paleta de Color, Restablecer Formato

### 3.5. Menu Ver
- Centrar Vista en Nodo Raiz (Espacio / Home)
- Ajustar Todo al Lienzo (Ctrl + 0)
- Aumentar / Reducir Zoom (Ctrl+Plus / Ctrl+Minus)
- Panel de Esquema (Alt + O)
- Panel de Propiedades (Alt + P)
- Mostrar / Ocultar MiniMapa: S(160px), M(220px), L(300px)
- Plegar / Desplegar Todas las Ramas
- Pantalla Completa (Alt + Enter)
- Modo Presentacion Clasica (F5)

---

## 4. Anatomia Visual de un Nodo en el Lienzo

```text
    +---------------------------------------------------------------------------+
    |                                NODO BURBUJA                               |
    |  +---------------------------------------------------------------------+  |
    |  | [icono][bandera][nota]  TITULO PRINCIPAL (16px bold)  [85%][link]   |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  [Imagen adjunta: top / bottom / background / fit]                  |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  Cuerpo / Explicacion del nodo:                                     |  |
    |  |  "Detalle descriptivo en tipografia regular de 11px..."             |  |
    |  | ------------------------------------------------------------------- |  |
    |  |  [tag: Tutorial]  [tag: Productividad]                              |  |
    |  +---------------------------------------------------------------------+  |
    |                                   |                                       |
    |                       [+ 3] (Plegar / Desplegar)                          |
    +-----------------------------------|---------------------------------------+
                                        v
                            (Linea Bezier SVG al Hijo)
```

Variantes Geometricas (10 formas):
1. bubble   - caja con esquinas redondeadas modernas y fondo solido/degradado/trama
2. fork     - linea de subrayado inferior estilo Freeplane clasico
3. rectangle- bordes rectos estructurados para procesos y diagramas tecnicos
4. square   - proporcion 1:1 simetrica para tarjetas y bloques
5. oval     - curvatura eliptica armonica para conceptos principales
6. circle   - circulo simetrico con texto centrado y soporte degradados radiales
7. pill     - bordes 100% redondeados para etiquetas compactas
8. hexagon  - poligono SVG de 6 caras con contorno dinamico
9. arrow    - poligono SVG con punta triangular para flujos y procesos
10. star    - poligono SVG de 5 puntas estilizado

---

## 5. Panel Inspector de Propiedades (ToolPanel -- 350px)

Panel derecho en acordeon colapsable con 9 secciones y pestanas (Contenido / Estilo / Metadatos):

1. TITULO Y TEXTO PRINCIPAL: input, fuente, tamano, negrita, cursiva, alineacion, color texto
2. CUERPO / SUBTEXTO: textarea, fuente, tamano, color de cuerpo
3. FORMAS Y GEOMETRIA: 10 botones de forma, deslizador ancho (50-500px), alto (30-300px), boton "Auto"
4. FONDO DEL NODO: 4 modos
   - color: Selector RGB/Hex + paleta rapida de 6 colores + boton "Por defecto"
   - transparent: Sin relleno, solo borde visible
   - gradient: Color1 + Color2, 4 direcciones, 6 presets (Ocean/Sunset/Emerald/Neon/Indigo/Carbon)
   - pattern: 7 estilos (dots/lines/squares/stripes/triangles/hexagons/cross), tamano 8-36px, opacidad 10-100%
5. CONTORNOS Y BORDES: grosor (0/1/2/3.5/5px + deslizador), estilo (solid/dashed/dotted), color
6. IMAGENES:
   - Imagen de contenido (imageUrl): posicion top/bottom/left/right/between/background/fit, escala 60-300px
   - Imagen de fondo (bgImageUrl): modo fit/cover/contain/tile, control opacidad
7. ARISTAS / CONEXIONES: estilo bezier/linear/sharp/horizontal/hidden, perfil uniform/tapered/spindle/hourglass, grosor, color, trama
8. NUBE DE AGRUPACION: on/off, forma arc/rect/round-rect/star, color RGBA
9. METADATOS Y NOTAS: progreso 0-100%, iconos, tags, URL, nota Markdown

Botones globales: "Desplegar todo" / "Plegar todo". Badge de estado en cada seccion.

---

## 6. Modo Presentacion Clasica

Vista pantalla completa (100vw x 100vh, z-50, overflow-hidden).
Convierte el mapa mental en diapositivas secuenciales con 3 FASES POR NODO
y AUTO-PAGINACION SIN BARRAS DE DESPLAZAMIENTO.

### 6.1. Estructura Secuencial por Nodo

Para cada nodo en orden de profundidad:

    FASE 1: Tema Principal (siempre presente)
        |
        v
    FASE 2: Notas (si hay notas y estan habilitadas)
        |
        v
    FASE 3: Subtemas / Hijos (si hay hijos y esta habilitado)
        |
        v
    (Proximo Nodo)

FASE 1 -- TEMA PRINCIPAL:
- Imagen adjunta del nodo SIEMPRE visible si existe (responsive 2-col con texto si hay ambos)
- Titulo en grande (h1, 3xl-6xl segun espacio disponible)
- Texto del cuerpo: auto-paginado si es extenso
- Badge: iconos, progreso, tags del nodo
- Si el cuerpo es muy largo: "Tema Principal (Parte 1 de N)"

FASE 2 -- NOTAS:
- Cabecera: miniatura de imagen (si existe) + titulo del nodo
- Contenido Markdown renderizado completo
- Auto-paginado: "Notas del Tema (Parte 1 de N)" si el texto no cabe en una sola pantalla

FASE 3 -- SUBTEMAS:
- Grid de tarjetas (maximo 6 por diapositiva), cada tarjeta es clickeable
- Cada tarjeta: icono, titulo, cuerpo del hijo, tags
- Si hay mas de 6 hijos: "Subtemas (parte 1 de N)"
- Seccion de conectores cruzados al final (si esta habilitado)

### 6.2. Auto-Paginacion sin Scrollbars

Tipo de Contenido        | Limite por Diapositiva          | Comportamiento
------------------------ | ------------------------------- | -----------------------------------------------
Cuerpo del nodo          | ~4-6 parrafos / ~280-450 chars  | "Tema Principal (Parte X de N)"
Notas Markdown           | ~9 lineas / ~550 chars          | "Notas (Parte X de N)"
Subtemas / Hijos         | Maximo 6 tarjetas por slide     | "Subtemas (X-Y de N)"
Imagen del nodo          | Siempre visible en Fase 1       | Miniatura en cabecera de Fases 2 y 3

### 6.3. Barra Superior del Modo Presentacion

    [Logo Presentacion] [Badge Fase] [<-- Volver*] [Editar] [N/Total] [X Cerrar]

Badge de Fase (color segun tipo):
- Azul        -> Tema Principal
- Ambar       -> Notas del Tema
- Cian/Verde  -> Subtemas

Boton Volver: SOLO visible si se salto de nodo por clic en tarjeta.
Al pulsarlo regresa al slide de origen. Soporta multiples saltos en pila (jumpHistory stack).
Activable tambien con tecla Backspace.

Boton Editar: abre modal de opciones (tecla E).

### 6.4. Modal de Opciones de Presentacion

Opciones configurables en tiempo real:
- TEMA DE PRESENTACION: 7 temas visuales
- NOTAS DEL PRESENTADOR: ON/OFF
- TAMANO DE IMAGENES ADJUNTAS: Pequenya / Mediana / Grande / Ocultar
- DIAPOSITIVAS DE SUB-NODOS HIJOS: ON/OFF
- CONEXIONES CRUZADAS: ON/OFF
- ALINEACION DE CONTENIDO: Centro / Izquierda
- ESCALA DEL TITULO: Compact / Normal / Grande

Botones: "Editar en Lienzo" y "Aplicar y Ver Diapositiva"

### 6.5. Temas Disponibles para Presentacion (7 temas)

ID               | Nombre            | Fondo   | Acento
---------------- | ----------------- | ------- | -------
dark-studio      | Estudio Oscuro    | #0f172a | Azul
midnight-oled    | Medianoche OLED   | #000000 | Cian
cyberpunk-purple | Cyberpunk Neon    | #120726 | Rosa
navy-executive   | Azul Ejecutivo    | #09152b | Ambar
emerald-forest   | Esmeralda Natural | #051c14 | Verde
sunset-warm      | Atardecer Calido  | #210c14 | Naranja
light-clean      | Luz Minimalista   | #f8fafc | Azul600

### 6.6. Atajos de Teclado en el Modo Presentacion

Tecla                    | Accion
------------------------ | ------------------------------------------
Flecha Derecha / Espacio | Siguiente diapositiva
Flecha Izquierda         | Diapositiva anterior
Backspace                | Regresar al punto de salto
E                        | Abrir / cerrar modal de opciones
Esc                      | Cerrar modal / Salir de la presentacion
Clic en Card de Subtema  | Saltar a la diapositiva de ese nodo

---

## 7. Conectores Flotantes y Nubes

Conector (tipo Connector):
- Estilos de flecha: none, start, end, both
- Forma de trazo: curved, bezier, straight, step
- Patron de linea: solid, dashed, dotted
- Capas: above / below de los nodos
- Propiedades: opacidad, color, grosor, etiqueta de texto flotante
- Punto de control Bezier ajustable manualmente

Nubes de Agrupacion (tipo NodeCloud):
- Formas: arc, rectangle, round-rectangle, star
- Color RGBA personalizable
- Activable/desactivable por nodo

---

## 8. Tipos de Layout del Lienzo

ID                  | Nombre                | Descripcion
------------------- | --------------------- | --------------------------------------------------
standard            | Estandar Bifurcado    | Ramas distribuidas izq/der del raiz
balanced-horizontal | Horizontal Balanceado | Raiz a la izquierda, ramas a la derecha
left                | Solo Izquierda        | Todas las ramas hacia la izquierda
right               | Solo Derecha          | Todas las ramas hacia la derecha
top                 | Solo Arriba           | Arbol hacia arriba
bottom              | Solo Abajo            | Arbol hacia abajo
tree-down           | Arbol Vertical        | Raiz arriba, hijos abajo jerarquicamente
radial              | Radial                | Ramas en circulo alrededor del raiz
circular            | Circular              | Disposicion circular equilibrada

---

## 9. Atajos Globales de Teclado

Atajo de Teclado          | Accion en la Interfaz
------------------------- | -------------------------------------------------
Tab / Insert              | Crear nuevo nodo Hijo
Enter                     | Crear nuevo nodo Hermano al mismo nivel
Shift + Enter             | Crear nodo hermano en posicion superior
Espacio                   | Plegar / desplegar rama seleccionada
F2 / Doble Clic           | Entrar en modo edicion de texto
Flechas Arriba/Abajo/Izq/Der | Navegar seleccion entre nodos
Ctrl + C / X / V          | Copiar, cortar, pegar ramas completas
Supr / Backspace          | Eliminar el nodo y todas sus sub-ramas
Alt + O                   | Abrir / Cerrar panel de Esquema
Alt + P                   | Abrir / Cerrar panel de Propiedades
Ctrl + F                  | Abrir barra de Busqueda y Filtro
F5                        | Iniciar Modo Presentacion Clasica
Ctrl + E                  | Abrir modal de Exportacion e Importacion
Ctrl + Z / Ctrl + Y       | Deshacer / Rehacer cambios
Ctrl + 0                  | Ajustar todo el mapa al lienzo
Alt + Enter               | Pantalla completa

---

## 10. Catalogo de Funciones Avanzadas

### 10.1. Formas Geometricas de Nodos (10 tipos)
1. bubble    - Caja redondeada moderna con fondo solido, degradado o trama
2. fork      - Linea de subrayado inferior estilo Freeplane clasico
3. rectangle - Bordes rectos para procesos y diagramas tecnicos
4. square    - Proporcion 1:1 simetrica para tarjetas y bloques
5. oval      - Curvatura eliptica armonica para conceptos principales
6. circle    - Simetrico con texto centrado y soporte degradados radiales
7. pill      - Bordes 100% redondeados para etiquetas compactas
8. hexagon   - Poligono SVG de 6 caras con contorno dinamico
9. arrow     - Poligono SVG con punta triangular para flujos y procesos
10. star     - Poligono SVG de 5 puntas estilizado

### 10.2. Dimensiones y Auto-Ajuste
- customWidth: deslizador 50px a 500px
- customHeight: deslizador 30px a 300px
- Para square/circle: un solo deslizador actualiza ambas dimensiones
- Boton "Automatico": restablece dimensionamiento por contenido
- Texto envuelto automaticamente sin desbordamiento (break-words, hyphens)

### 10.3. Modos de Fondo del Nodo (4 tipos)
1. color: Selector RGB/Hex + paleta rapida + boton "Por defecto"
2. transparent: Sin relleno, solo borde visible
3. gradient: Color1 + Color2, 4 direcciones, 6 presets (Ocean/Sunset/Emerald/Neon/Indigo/Carbon)
4. pattern: 7 estilos (dots/lines/squares/stripes/triangles/hexagons/cross), tamano 8-36px, opacidad 10-100%

### 10.4. Imagenes en el Nodo (2 tipos)
- imageUrl: posicion top/bottom/left/right/between/background/fit, escala 60-300px
- bgImageUrl: modo fit/cover/contain/tile, control de opacidad

### 10.5. Tipos de Aristas
- bezier    - Curva Bezier suave (defecto)
- linear    - Linea recta directa
- sharp     - Angulos rectos en L
- horizontal- Sale horizontalmente y baja
- hidden    - Sin linea de conexion

Perfiles: uniform, tapered (conico), spindle (huso), hourglass (reloj de arena)

### 10.6. Temas del Lienzo (12 fondos de lienzo disponibles)

ID                   | Nombre                   | Categoria
-------------------- | ------------------------ | ---------
bg-clean-white       | Lienzo Puro (Liso)       | Claro
bg-dot-grid-slate    | Cuaderno de Puntos       | Papel
bg-square-grid       | Papel Milimetrado        | Tecnico
bg-blueprint-pro     | Blueprint Tecnico        | Tecnico
bg-honeycomb-gold    | Panal Hexagonal          | Creativo
bg-triangular-mesh   | Malla Triangular         | Creativo
bg-lined-paper       | Rayas de Cuaderno        | Papel
bg-dark-matrix-dots  | Pizarra Oscura Puntos    | Oscuro
bg-dark-honeycomb    | Cyber Panal Oscuro       | Oscuro
bg-dark-isometric    | Malla Neon Triangular    | Oscuro
bg-graphite-lines    | Grafito con Rayas        | Oscuro
bg-mint-breeze       | Brisa de Menta (Puntos)  | Claro

### 10.7. Temas de Mapa (9 temas globales)

ID        | Nombre               | Fondo   | Tipo
--------- | -------------------- | ------- | ------
default   | Clasico Azul         | #f8fafc | Claro
rainbow   | Arcoiris Vibrante    | #ffffff | Claro
dark      | Modo Oscuro          | #0f172a | Oscuro
forest    | Bosque Esmeralda     | #f0fdf4 | Claro
sunset    | Atardecer Calido     | #fffbeb | Claro
minimal   | Minimalista Mono     | #fafafa | Claro
blueprint | Plano Tecnico        | #0a2540 | Oscuro
honeycomb | Panal Creativo       | #fffdf5 | Claro

### 10.8. Filtrado y Busqueda (FilterBar)

Filtros acumulativos disponibles:
- Texto: busqueda en titulo, cuerpo y notas del nodo
- Tags: filtrar por etiqueta especifica
- Progreso: rango 0-100%
- Icono: filtrar por tipo de icono asignado
- Tiene Nota: solo nodos con nota Markdown
- Tiene Enlace: solo nodos con URL
- Mostrar Ancestros: incluye ruta completa al nodo encontrado
- Mostrar Descendientes: incluye sub-arbol del nodo encontrado

### 10.9. Historial de Deshacer / Rehacer
- Profundidad de historial: 40 estados
- Cada mutacion (anadir, borrar, mover, editar, formatear) es una entrada independiente
- Ctrl+Z (deshacer) / Ctrl+Y (rehacer)

### 10.10. Exportacion e Importacion

Exportar a:
- .mm        Freeplane XML (compatible con Freeplane 1.x)
- .html      Pagina web autonoma con mapa interactivo embebido
- .svg       Vector escalable
- .png       Imagen alta resolucion
- .md        Documento Markdown con jerarquia de encabezados
- .json      Respaldo completo del estado interno

Importar desde:
- .mm        Freeplane XML
- .json      Respaldo FreeMind Studio

### 10.11. Nodos Libres (Free Floating / Post-it)
- isFreeFloating: true
- Posicionamiento libre por coordenadas x,y independiente del layout automatico
- Ideal para notas adicionales o etiquetas visuales en el lienzo

---

## 11. Arquitectura de Archivos del Proyecto

```
src/
|-- App.tsx                       Orquestador principal + logica de estado global
|-- index.css                     Estilos globales
|-- main.tsx                      Punto de entrada React
|-- types/
|   +-- mindmap.ts                Tipos TypeScript: MindNode, MindMap, Connector, etc.
|-- components/
|   |-- MenuBar.tsx               Barra de menu superior
|   |-- ToolBar.tsx               Barra de herramientas rapidas
|   |-- FilterBar.tsx             Barra de busqueda y filtros colapsable
|   |-- MindMapCanvas.tsx         Lienzo SVG/HTML infinito con pan/zoom
|   |-- NodeComponent.tsx         Renderizado de cada nodo (todas las formas)
|   |-- ToolPanel.tsx             Panel inspector lateral derecho 350px
|   |-- OutlineView.tsx           Vista de esquema en arbol (panel izquierdo)
|   |-- PresentationMode.tsx      Modo presentacion clasica: 3 fases, auto-paginacion,
|   |                             jump history stack, 7 temas, opciones configurables
|   |-- MiniMap.tsx               Minimapa radar flotante
|   |-- StatusBar.tsx             Barra de estado inferior
|   +-- Modals/
|       |-- ExportImportModal.tsx    Exportar / Importar mapas
|       |-- ShortcutsModal.tsx       Referencia de atajos de teclado
|       |-- TemplatesModal.tsx       Plantillas predefinidas
|       |-- SavedMapsModal.tsx       Mis mapas guardados en localStorage
|       |-- ConnectorModal.tsx       Crear/editar conectores flotantes
|       |-- IconPackModal.tsx        Paquete de iconos vectoriales premium
|       +-- ComingSoonModal.tsx      Modal Proximamente para modos elaborado/dinamico
+-- utils/
    |-- themes.ts                 9 temas de mapa + 12 fondos de lienzo
    |-- iconMap.tsx               Mapeo string de icono a componente SVG/Emoji
    |-- vectorIconPack.tsx        Pack de iconos vectoriales premium
    |-- markdownRenderer.tsx      Renderer Markdown adaptativo claro/oscuro
    |-- layoutEngine.ts           Motor de layout automatico (9 algoritmos)
    |-- connectorUtils.ts         Calcular rutas de conectores Bezier
    |-- freeplaneConverter.ts     Parser e importer de archivos .mm Freeplane
    |-- htmlExporter.ts           Exportador a HTML autonomo
    |-- storage.ts                Persistencia en localStorage
    |-- sampleMaps.ts             Mapa tutorial + mapa en blanco
    |-- additionalTemplates.ts    Plantillas adicionales predefinidas
    +-- templateIllustrations.ts  Ilustraciones SVG para las plantillas
```
