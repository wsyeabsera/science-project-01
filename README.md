# Astrophysics Playground

A personal monorepo for learning and experimenting with astrophysics simulations.

## Architecture

```
astrophysics-playground/
├── apps/
│   ├── studio/        Figma-like scene & component designer   :5173
│   └── sim/           Live physics simulation viewer          :5174
├── packages/
│   └── ui/            Shared Three.js + Resium components
└── mcp-servers/
    └── orbital/       Remote MCP server — exposes UI component
                       catalogue and scene pages; bridges to sim
                       over WebSocket on :8080
```

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo 2, pnpm 9 workspaces |
| Apps | Vite 5, React 18, TypeScript 5.4 |
| 3D rendering | Three.js, @react-three/fiber, @react-three/drei |
| Globe/geo | Cesium, Resium |
| State | Zustand 4 |
| MCP server | Node.js, @modelcontextprotocol/sdk, ws |
| UI lib bundler | tsup (ESM + CJS + .d.ts) |

## Data Flow

```
[Claude / AI client]
       │  MCP stdio
       ▼
[orbital MCP server]  ──── WebSocket :8080 ────▶  [apps/sim]
       │                                               │
       │  list_components / list_pages                 │ renders bodies
       ▼                                               ▼
  returns JSON                                  Three.js Canvas
```

The `orbital` MCP server exposes two tools:

- **`list_components`** — returns the catalogue of UI components in `packages/ui`
- **`list_pages`** — returns the available simulation scenes in `apps/sim`

It also runs a WebSocket server on `:8080`. The `apps/sim` app connects on startup and listens for `bodies`, `playback`, and `tick` messages to drive the live simulation.

## Getting Started

```bash
# 1. Install dependencies (pnpm workspaces)
pnpm install

# 2. Build shared packages first
pnpm build --filter=@astrophysics-playground/ui

# 3. Run everything in dev mode
pnpm dev

# Apps:
#   Studio  → http://localhost:5173
#   Sim     → http://localhost:5174
#   MCP WS  → ws://localhost:8080
```

## Workspace Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start all apps in parallel (Turborepo) |
| `pnpm build` | Build all packages in dependency order |
| `pnpm type-check` | TypeScript check across the whole repo |
| `pnpm clean` | Remove all `dist/` and `.turbo/` artifacts |
