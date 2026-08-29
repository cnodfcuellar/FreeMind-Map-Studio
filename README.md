<div align="center">

# 🧠 FreeMind Map Studio

**Editor de Mapas Mentales · 100% Offline · Directo en el Navegador**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-5-433D37?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

> Crea, organiza y presenta mapas mentales complejos con la velocidad del teclado,  
> sin instalar nada y sin conexión a internet.

</div>

---

## ✨ ¿Qué es FreeMind Map Studio?

FreeMind Map Studio es una **aplicación web de mapas mentales de nivel profesional** que corre completamente en el navegador. Sin servidores, sin cuentas, sin límites. Toda la información se guarda localmente en tu navegador con `localStorage`.

Inspirado en [Freeplane](https://www.freeplane.org/) y [Mindomo](https://www.mindomo.com/), combina potencia de edición con una experiencia de usuario moderna.

---

## 🗺️ Diagrama de la Aplicación

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                        FREEMIND MAP STUDIO — ARQUITECTURA                        ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  ┌─────────────────────────────────────────────────────────────────────────┐    ║
║  │  MENUBAR  [Archivo][Editar][Insertar][Formato][Ver][Ayuda]   [Título]   │    ║
║  ├─────────────────────────────────────────────────────────────────────────┤    ║
║  │  TOOLBAR  [+Hijo][+Herm][✂][📋] | [Forma][Nube][🔗] | [↺↻] | [Zoom]   │    ║
║  ├─────────────────────────────────────────────────────────────────────────┤    ║
║  │  FILTERBAR (Ctrl+F)  [🔍 Buscar...] [Tags] [Progreso] [✕ Limpiar]      │    ║
║  ╠══════════════════════════════════════════╦══════════════════════════════╣    ║
║  ║                                          ║  TOOLPANEL (Inspector)       ║    ║
║  ║      LIENZO INFINITO (MindMapCanvas)     ║  ┌──────────────────────┐   ║    ║
║  ║                                          ║  │ 📝 Contenido         │   ║    ║
║  ║    ╭──────────────────────╮              ║  │ 🎨 Formato           │   ║    ║
║  ║    │      NODO RAÍZ       │              ║  │ 📋 Notas             │   ║    ║
║  ║    │  (texto + imagen)    │              ║  │ 😀 Iconos            │   ║    ║
║  ║    ╰──────┬───────────────╯              ║  │ ☁️ Nubes             │   ║    ║
║  ║           │                             ║  │ 🎭 Tema              │   ║    ║
║  ║    ┌──────┴──────┐                      ║  └──────────────────────┘   ║    ║
║  ║    │             │                      ║                             ║    ║
║  ║  ╭───╮         ╭───╮                    ║  ┌──────────────────────┐   ║    ║
║  ║  │ A │         │ B │                    ║  │ ⚙️ Config del Mapa   │   ║    ║
║  ║  ╰───╯         ╰───╯                    ║  │   Tema / Layout      │   ║    ║
║  ║                                          ║  │   Fondo del lienzo   │   ║    ║
║  ║  [MINIMAP ▢]                             ║  └──────────────────────┘   ║    ║
║  ╚══════════════════════════════════════════╩══════════════════════════════╣    ║
║  │  STATUSBAR  Nodos: 28 | Selec.: "Raíz" | Zoom: 100% | Modo: Listo     │    ║
║  └─────────────────────────────────────────────────────────────────────────┘    ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🚀 Características Principales

### 🧩 Editor de Nodos Completo

| Propiedad | Opciones |
|-----------|---------|
| **Formas** | `bubble` `fork` `rectangle` `square` `oval` `circle` `pill` `hexagon` `arrow` `star` |
| **Fondo** | Color sólido · Transparente · Degradado (4 dir.) · Trama (7 estilos) · Imagen de fondo |
| **Tipografía** | Fuente · Tamaño · Negrita · Cursiva · Color · Alineación (para título y cuerpo por separado) |
| **Imagen adjunta** | Posición: arriba · abajo · izq · der · entre · fondo · ajustar · Escala 60–300px |
| **Bordes** | Grosor 0–8px · Sólido / Discontinuo / Punteado · Color personalizado o automático |
| **Tamaño** | Ancho 50–500px · Alto 30–300px · Modo automático |
| **Metadatos** | Progreso 0–100% · Iconos · Tags · URL · Nota Markdown |

### 🗂️ Gestión del Árbol

```
Operaciones sobre el árbol
├── Crear hijo (Tab / Insert)
├── Crear hermano (Enter)
├── Eliminar nodo + subtree (Supr / Backspace)
├── Plegar / Desplegar rama (Espacio)
├── Copiar subtree completo (Ctrl+C)
├── Cortar subtree (Ctrl+X)
├── Pegar como hijo (Ctrl+V)  ← clona con nuevos IDs
├── Drag & Drop para re-parentar
│   └── Protección anti-ciclo incluida
├── Aplicar estilo a hijos / hermanos
└── Historial Undo/Redo (Ctrl+Z/Y) ← 40 estados
```

### 🎨 Temas y Layouts

**9 Temas Visuales:**
```
  🔵 Clásico Azul     🌈 Arcoíris       🌑 Modo Oscuro
  🌲 Bosque Esmeralda  🌅 Atardecer      ⬜ Minimalista
  📐 Blueprint Técnico  🍯 Panal Creativo
```

**9 Algoritmos de Layout:**
```
  Standard (bifurcado)    Horizontal Balanceado    Solo Izquierda
  Solo Derecha            Solo Arriba              Solo Abajo
  Árbol Vertical          Radial ●                 Circular ○
```

**12 Fondos de Lienzo:**
```
  Lienzo Puro     Cuaderno de Puntos    Papel Milimetrado
  Blueprint Téc.  Panal Hexagonal       Malla Triangular
  Rayas Cuaderno  Pizarra Oscura        Cyber Panal
  Malla Neón      Grafito con Rayas     Brisa de Menta
```

### 🖥️ Modo Presentación Clásica

El modo presentación convierte el mapa en diapositivas sin scrollbars.

```
Para cada nodo, genera automáticamente:

 ┌─────────────────────────────────────┐
 │  FASE 1 — Tema Principal            │  ← Siempre presente
 │  🖼️ Imagen + Título + Cuerpo        │  ← Auto-paginado si es extenso
 └──────────────────┬──────────────────┘
                    │
 ┌──────────────────▼──────────────────┐
 │  FASE 2 — Notas del Presentador     │  ← Si el nodo tiene nota Markdown
 │  Markdown renderizado               │  ← Auto-paginado (~9 líneas/slide)
 └──────────────────┬──────────────────┘
                    │
 ┌──────────────────▼──────────────────┐
 │  FASE 3 — Subtemas / Hijos          │  ← Grid de tarjetas (máx. 6/slide)
 │  [Card A] [Card B] [Card C]         │  ← Click en card = salto directo
 │  [Card D] [Card E] [Card F]         │  ← Botón Volver (Backspace)
 └─────────────────────────────────────┘
```

**7 Temas de Presentación:** Estudio Oscuro · Medianoche OLED · Cyberpunk Neón · Azul Ejecutivo · Esmeralda · Atardecer · Luz Minimalista

### 🔗 Conectores Cruzados y Nubes

- Conectores flotantes entre cualquier par de nodos con: etiqueta · flecha (start/end/both/none) · estilo (bezier/curved/straight/step) · capa (above/below)
- Nubes de agrupación visual con 4 formas y color RGBA personalizable

### 🔍 Búsqueda y Filtrado

Filtros acumulativos en tiempo real:
- Texto libre (título + nota)
- Tags específicos
- Rango de progreso
- Tipo de icono
- Tiene nota / Tiene enlace
- Mostrar ancestros y/o descendientes del resultado

### 📤 Exportar e Importar

| Formato | Descripción |
|---------|-------------|
| `.mm` (Freeplane XML) | Compatible con Freeplane 1.x — importa y exporta |
| `.html` | Página web autónoma con mapa interactivo — **sin dependencias externas** |
| `.svg` | Vector escalable infinito |
| `.png` | Imagen de alta resolución |
| `.md` | Árbol como encabezados Markdown |
| `.json` | Respaldo completo del estado interno |

---

## 🏗️ Estructura del Código (Atomic Design + Zustand)

```
freemind-map-studio/
│
├── 📄 index.html                  # Punto de entrada HTML
├── 📦 package.json                # Dependencias (React 19, Vite 6, Tailwind 4, Zustand 5)
├── ⚙️ vite.config.ts              # Configuración Vite + plugin React
├── 🔷 tsconfig.json               # Configuración TypeScript estricto
│
├── 📂 src/
│   ├── 🎯 App.tsx                 # Orquestador — consume Zustand, compone organismos
│   │   ├── Consume useMindMapStore() (store global)
│   │   ├── Instancia useKeyboardShortcuts() y useSearchFilter()
│   │   ├── Gestión de modales (estado local)
│   │   └── Árbol de renderizado completo
│   │
│   ├── 🎨 index.css               # Estilos globales + Tailwind v4
│   ├── ⚛️ main.tsx                # ReactDOM.createRoot
│   │
│   ├── 📂 types/
│   │   └── 🔷 mindmap.ts          # TODOS los tipos TypeScript (MindMap, MindNode, etc.)
│   │
│   ├── 📂 hooks/                  # LÓGICA CENTRALIZADA
│   │   ├── 🧠 useMindMapStore.ts  # Store Zustand — toda la lógica de negocio (582 líneas)
│   │   │   ├── Estado: mindMap, history, selección, paneles, clipboard
│   │   │   ├── CRUD: addChild, addSibling, deleteNode, updateNode
│   │   │   ├── Undo/Redo: pushHistory, handleUndo, handleRedo
│   │   │   ├── Clipboard: copyNode, cutNode, pasteNode
│   │   │   ├── Propagación: applyStyleToChildren, applyStyleToSiblings
│   │   │   └── Auto-guardado en localStorage
│   │   ├── 🔍 useSearchFilter.ts  # Filtro reactivo (useMemo → Set<string>)
│   │   └── ⌨️ useKeyboardShortcuts.ts # Atajos globales (keydown listener)
│   │
│   ├── 📂 components/
│   │   │
│   │   │  ── ORGANISMOS DE PÁGINA ──
│   │   ├── 🖥️ MenuBar.tsx         # Barra de menú (Archivo/Editar/…) — ~26KB
│   │   ├── 🔧 ToolBar.tsx         # Herramientas rápidas — ~29KB
│   │   ├── 🔍 FilterBar.tsx       # Barra de búsqueda colapsable — ~4KB
│   │   ├── 🗺️ MindMapCanvas.tsx   # LIENZO infinito — ~55KB
│   │   ├── 🔵 NodeComponent.tsx   # Renderizado de cada nodo — ~32KB
│   │   ├── 🛠️ ToolPanel.tsx       # Contenedor de 6 tabs — ~10KB
│   │   ├── 🎬 PresentationMode.tsx # Presentación clásica — ~52KB
│   │   ├── 📋 OutlineView.tsx     # Vista esquema árbol — ~17KB
│   │   ├── 🗺️ MiniMap.tsx         # Minimapa radar flotante — ~18KB
│   │   ├── 📊 StatusBar.tsx       # Barra de estado inferior — ~2KB
│   │   │
│   │   │  ── ÁTOMOS (primitivos UI) ──
│   │   ├── 📂 atoms/
│   │   │   ├── CollapsibleSection.tsx    # Sección expandible/colapsable
│   │   │   ├── ColorPicker.tsx           # Selector de color + hex + presets
│   │   │   ├── SliderInput.tsx           # Slider numérico + input editable
│   │   │   ├── ToggleButton.tsx          # Botón binario on/off
│   │   │   └── ToggleButtonGroup.tsx     # Grupo exclusivo de toggles
│   │   │
│   │   │  ── MOLÉCULAS (combinaciones) ──
│   │   ├── 📂 molecules/
│   │   │   ├── FontFormatToolbar.tsx     # Bold/Italic + fuente + tamaño + color
│   │   │   ├── ShapeSelector.tsx         # Grid de 10 formas con preview
│   │   │   └── TagManager.tsx            # Chips + input agregar tag
│   │   │
│   │   │  ── ORGANISMOS (secciones complejas) ──
│   │   ├── 📂 organisms/
│   │   │   ├── 📂 toolpanel/            # Tabs del ToolPanel
│   │   │   │   ├── ContentTab.tsx        # Título, cuerpo, tipografía
│   │   │   │   ├── FormatTab.tsx         # Forma, fondo, bordes, imágenes, aristas
│   │   │   │   ├── NotesTab.tsx          # Notas Markdown, enlace, progreso
│   │   │   │   ├── IconsTab.tsx          # Grid de iconos toggle
│   │   │   │   ├── CloudsTab.tsx         # Nube on/off, forma, color
│   │   │   │   └── ThemeTab.tsx          # Tema, layout, fondo, aristas globales
│   │   │   ├── 📂 canvas/               # Sub-componentes del lienzo
│   │   │   │   ├── CanvasContextMenu.tsx # Menú clic derecho
│   │   │   │   └── CanvasZoomControls.tsx # Controles de zoom
│   │   │   └── 📂 presentation/         # Sub-componentes presentación
│   │   │       ├── PresentationControls.tsx # Barra superior + modal
│   │   │       └── presentationThemes.ts    # 7 temas de presentación
│   │   │
│   │   └── 📂 Modals/
│   │       ├── 📤 ExportImportModal.tsx  # 6 formatos export + 2 import
│   │       ├── ⌨️ ShortcutsModal.tsx     # Referencia de atajos
│   │       ├── 📐 TemplatesModal.tsx     # Galería de plantillas
│   │       ├── 💾 SavedMapsModal.tsx     # Mis mapas guardados
│   │       ├── 🔗 ConnectorModal.tsx     # Crear/editar conector
│   │       ├── ⭐ IconPackModal.tsx      # Galería de iconos vectoriales
│   │       └── 🚀 ComingSoonModal.tsx    # "Próximamente"
│   │
│   └── 📂 utils/
│       ├── ⚙️ layoutEngine.ts     # Motor de layout — 9 algoritmos, ~65KB
│       ├── 🎨 themes.ts           # 9 temas de mapa + 12 fondos de lienzo
│       ├── 📝 markdownRenderer.tsx # Parser Markdown propio (sin librerías)
│       ├── 🔗 connectorUtils.ts   # Geometría de conectores cruzados
│       ├── 📂 freeplaneConverter.ts # Import/Export Freeplane .mm XML
│       ├── 🌐 htmlExporter.ts     # Generador HTML autónomo — ~72KB
│       ├── 💾 storage.ts          # CRUD localStorage
│       ├── 🗺️ sampleMaps.ts       # Tutorial + Mapa en blanco — ~99KB
│       ├── 📐 additionalTemplates.ts # +20 plantillas temáticas — ~75KB
│       ├── 🖼️ templateIllustrations.ts # SVGs de preview de plantillas
│       ├── ⭐ iconMap.tsx          # String icono → componente React
│       └── 💎 vectorIconPack.tsx  # Pack de iconos premium — ~64KB
│
├── 📄 INTERFACE_SPEC.md           # Especificación técnica de la interfaz
├── 📄 PROJECT_ARCHITECTURE.md     # Arquitectura completa del proyecto
├── 📄 CHANGELOG.md                # Registro de cambios de refactorización
└── 📄 REFACTORING_EVALUATION.md   # Evaluación de fases de refactorización
```

---

## ⌨️ Atajos de Teclado

### Edición del Mapa

| Atajo | Acción |
|-------|--------|
| `Tab` / `Insert` | Crear nodo **hijo** |
| `Enter` | Crear nodo **hermano** |
| `F2` / Doble clic | Editar texto inline |
| `Espacio` | Plegar / Desplegar rama |
| `Supr` / `Backspace` | Eliminar nodo + subtree |
| `↑` `↓` `←` `→` | Navegar entre nodos |
| `Ctrl+C` / `X` / `V` | Copiar / Cortar / Pegar subtree |
| `Ctrl+Z` / `Y` | Deshacer / Rehacer (40 niveles) |
| `Escape` | Seleccionar nodo raíz |

### Vistas y Paneles

| Atajo | Acción |
|-------|--------|
| `Ctrl+F` | Abrir barra de búsqueda |
| `Alt+O` | Panel de Esquema |
| `Alt+P` | Panel de Propiedades |
| `Ctrl+0` | Ajustar mapa al lienzo |
| `F5` | Iniciar Presentación |
| `Ctrl+E` | Exportar / Importar |

### Modo Presentación

| Tecla | Acción |
|-------|--------|
| `→` / `Espacio` | Siguiente diapositiva |
| `←` | Diapositiva anterior |
| `Backspace` | **Volver** al origen del salto |
| `E` | Opciones de presentación |
| `Esc` | Salir |
| Clic en Card | Saltar a ese nodo |

---

## 🏃 Inicio Rápido

### Requisitos

- Node.js 18+ o Bun
- pnpm (recomendado) / npm / bun

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd freemind-map-studio

# Instalar dependencias
pnpm install

# Iniciar en modo desarrollo
pnpm dev
```

La app estará disponible en **http://localhost:3000**

### Build de Producción

```bash
pnpm build
pnpm preview
```

---

## 💾 Persistencia de Datos

Todos los datos se guardan localmente en `localStorage` del navegador:

```
localStorage
├── freemind_current_map_v1         ← Mapa activo (auto-guardado en cada cambio)
├── freemind_saved_maps_index_v1    ← Índice de todos los mapas guardados
└── freemind_map_{id}               ← JSON completo de cada mapa guardado
```

**Sin servidor. Sin cuenta. Sin límites.**

---

## 📐 Flujo de Datos (Zustand — Reactivo Unidireccional)

```
Usuario interactúa
       │
       ▼
  Store Zustand (useMindMapStore)
       │
       ├─► pushHistory(currentMap)   → historyPast[]  (Undo stack, max 40)
       │
       ├─► set({ mindMap: newState })  → Zustand notifica suscriptores
       │                                     │
       │                              Componentes suscritos re-renderizan
       │                              (MindMapCanvas, ToolPanel, StatusBar...)
       │                                     │
       │                              useMemo (layouts, filtros)
       │
       └─► Subscriber interno        → saveCurrentMap() → localStorage
```

---

## 🧱 Filosofía de Diseño

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRINCIPIOS DE IMPLEMENTACIÓN                   │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Sin backend          Todo en el navegador, 100% offline       │
│  ✅ Sin librerías extra  Markdown, layouts y export son propios  │
│  ✅ Atomic Design        Átomos → Moléculas → Organismos → Página │
│  ✅ Estado centralizado  Zustand como única fuente de verdad     │
│  ✅ Inmutabilidad        Cada cambio crea un nuevo objeto MindMap │
│  ✅ Tipado fuerte        TypeScript estricto en toda la base      │
│  ✅ Undo infinito        40 estados de historial en memoria      │
│  ✅ Auto-save            Cada cambio se persiste automáticamente │
│  ✅ Compatible Freeplane  Import/Export .mm XML nativo           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [`INTERFACE_SPEC.md`](INTERFACE_SPEC.md) | Especificación técnica completa de la interfaz |
| [`PROJECT_ARCHITECTURE.md`](PROJECT_ARCHITECTURE.md) | Arquitectura detallada del proyecto (componentes, datos, flujos) |
| [`CHANGELOG.md`](CHANGELOG.md) | Registro detallado de cambios de refactorización |
| [`REFACTORING_EVALUATION.md`](REFACTORING_EVALUATION.md) | Evaluación de calidad de cada fase |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama de feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: descripción del cambio'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

---

<div align="center">

**FreeMind Map Studio** — Hecho con ❤️ y React + Zustand

*Sin servidor. Sin cuenta. Solo creatividad.*

</div>
