# AGENTS.md — FreeMind Map Studio

Offline mindmap editor. React 19 + TS 5.8 + Vite 6 + Tailwind v4 + Zustand 5. No router, no backend, no DB. Persistence is `localStorage` only.

## Commands (pnpm mandatory)

- ALWAYS use `pnpm` — never `npm`/`yarn`. Ask first if no pnpm alternative exists.
- `pnpm dev` → http://localhost:3000 (`package.json` pins `--port=3000 --host=0.0.0.0`; README's 5173 reference is stale).
- `pnpm lint` = `tsc --noEmit` (typecheck only; no ESLint config).
- `pnpm test` = `vitest run`; single file: `pnpm vitest run src/utils/__tests__/<name>.test.ts`.
- On Windows, `pnpm test` (default pool) can hang on OneDrive paths → use `pnpm test:regression` (`vitest run --pool=forks`), the reliable full pass.
- `pnpm build` / `pnpm preview`.
- `pnpm clean` = `rm -rf dist server.js` → fails on Windows PowerShell; delete `dist/` (and `server.js`) manually.

## Global rules (user-mandated)

- **Docs on every change:** after any code change, IMMEDIATELY update `doc/CHANGELOG.md` (motivo + qué cambió) and pertinent docs (`doc/`, `doc/img/`, `doc/DESIGN.md`). Don't batch.
- **No auto-commit:** NEVER run `git commit`/`git push` unprompted. Accumulate and WAIT for "respalda"/"guarda"/"haz un commit".
- **Python scripts:** new `.py` files live in `.py/` (run from there). Exception: root `enrich_shapes.py` predates this — don't move without asking.
- **Agent instructions:** new base instructions go in `.opencode/agent/` (existing: `test-writer.md`, `qa-tester.md`; commands in `.opencode/command/`: `cover.md`, `regression.md`). Do NOT move `doc/DESIGN.md` — README and `PROJECT_ARCHITECTURE.md` link to its path.
- **Language:** always respond in Spanish.

## Entrypoints

`index.html` → `src/main.tsx` → `src/App.tsx` (orchestrator; wraps store + `ErrorBoundary`).

## Architecture (Atomic Design, strict)

- `src/types/mindmap.ts` — centralized types (`MindMap`, `MindNode`, `SlideFrame`, …). Import from here; don't redefine.
- `src/hooks/` — business logic: `useMindMapStore.ts` (Zustand CRUD, 40-step immutable undo/redo, clipboard clones with new IDs on paste, persistence), `useSearchFilter.ts`, `useKeyboardShortcuts.ts`.
- `src/components/atoms/` → `molecules/` (`node/` subgroup) → `organisms/` (`canvas/`, `toolpanel/`, `presentation/`) + top-level organisms (`MenuBar`, `ToolBar`, `MindMapCanvas`, `ToolPanel`, …) → `templates/MainEditorLayout.tsx`.
- `src/components/Modals/` — all modals share `ModalBackdrop` + `ModalHeader`.
- `src/utils/` — pure logic: `layoutEngine.ts` (9 layouts), `themes.ts` (8 map themes + 12 canvas backgrounds), `mapTheme.ts` (`applyThemeRestyle`/`applyBackgroundUpdate`, used by `App`), `freeplaneConverter.ts` (`.mm` XML), `htmlExporter.ts` (self-contained HTML), `storage.ts` (localStorage keys below), `uiTheme.ts` (UI theme claro/oscuro/sepia).
- Tests colocated in `__tests__/`; Vitest `globals:true`, `jsdom`, setup `src/test/setup.ts` (matchMedia + ResizeObserver). To cover a module follow `.opencode/agent/test-writer.md` (or `/cover`).

## Quirks / gotchas

- Import alias `@/*` → repo root (`./`), NOT `src/` (`tsconfig.json`, `vite.config.ts`).
- Tailwind v4 via `@tailwindcss/vite`; styles in `src/index.css`. No `tailwind.config`.
- Do NOT touch the `DISABLE_HMR` block in `vite.config.ts:21-27` (AI Studio disables watch/HMR during agent edits).
- `allowImportingTsExtensions: true` + `isolatedModules`; keep `import type` where type-only.
- localStorage keys: `freemind_current_map_v1`, `freemind_saved_maps_index_v1`, `freemind_map_{id}`. Re-parent must keep anti-cycle guard (`isDescendant`); paste must clone subtree with new IDs.
- Env (`GEMINI_API_KEY`, `APP_URL`) injected at runtime by AI Studio (see `.env.example`); never commit `.env`. `express`/`@google/genai` are for that hosted path — don't add a local server.
- UI theme (claro/oscuro/sepia) ≠ map themes (8). Governed by `src/utils/uiTheme.ts`; applied to `<html>` via `data-theme` + `.dark` class (only oscuro); persisted `freemind_ui_theme_v1`. `dark:` is by **class** (`@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`), not media query; sepia uses `--sp-*`/`--chrome-*` tokens. MiniMap/ZoomControls stay "always light" but follow tokens; `TemplatesModal` uses `forceLight` on `ModalBackdrop`/`ModalHeader`.
- No CI workflows, no cursor/claude rules. OpenCode plugin: `opencode.json` loads `opencode-agent-memory@0.3.0`; project memory `.opencode/memory/project.md` is auto-gitignored (`*`).
- Visual contract (node 4:3 wrap guide, square/circle min side, hexagon content caps, fork underline, floating controls) lives in `doc/DESIGN.md` — consult before touching node rendering.
- Full architecture + extension guides: `doc/PROJECT_ARCHITECTURE.md`. Study guide: `doc/GUIA-ESTUDIO.md`.
