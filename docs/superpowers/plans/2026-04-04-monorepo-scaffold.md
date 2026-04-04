# Astrophysics Playground — Monorepo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the complete `astrophysics-playground` monorepo with all config files, package.jsons, tsconfigs, Turborepo pipeline, and minimal source stubs so every workspace is wired and ready to develop.

**Architecture:** Turborepo monorepo with pnpm workspaces. `packages/ui` is a shared library consumed by both Vite+React apps. The `mcp-servers/orbital` Node.js process bridges to `apps/sim` over a raw WebSocket. No installation — only file structure.

**Tech Stack:** Turborepo 2, pnpm 9 workspaces, Vite 5, React 18, TypeScript 5.4, Three.js, Resium/Cesium, Zustand 4, tsup 8, @modelcontextprotocol/sdk 1, ws 8.

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Root workspace definition, turbo scripts, shared devDeps |
| `pnpm-workspace.yaml` | Lists workspace globs for pnpm |
| `turbo.json` | Pipeline: build, dev, lint, type-check, clean |
| `tsconfig.base.json` | Shared TS compiler options extended by every package |
| `.gitignore` | Root ignores (node_modules, dist, .turbo, .env) |
| `README.md` | Architecture overview (replaces placeholder) |
| `packages/ui/package.json` | UI lib: three, resium, cesium, @react-three/fiber deps |
| `packages/ui/tsconfig.json` | Extends base, emits to dist |
| `packages/ui/tsup.config.ts` | Bundles ESM+CJS with .d.ts, externalises peers |
| `packages/ui/src/index.ts` | Barrel exports for all shared components |
| `packages/ui/src/three/StarField.tsx` | Minimal Three.js stub component |
| `packages/ui/src/cesium/GlobeViewer.tsx` | Minimal Resium stub component |
| `apps/studio/package.json` | Vite React app, depends on @astrophysics-playground/ui |
| `apps/studio/tsconfig.json` | Extends base, noEmit (Vite handles transpile) |
| `apps/studio/vite.config.ts` | React plugin, port 5173 |
| `apps/studio/index.html` | Vite HTML entry |
| `apps/studio/src/main.tsx` | React root mount |
| `apps/studio/src/App.tsx` | Root component stub |
| `apps/studio/src/store/index.ts` | Zustand scene store (canvas layers, selected node) |
| `apps/sim/package.json` | Vite React app + ws proxy, depends on ui |
| `apps/sim/tsconfig.json` | Same pattern as studio |
| `apps/sim/vite.config.ts` | React plugin, port 5174, WS proxy → :8080 |
| `apps/sim/index.html` | Vite HTML entry |
| `apps/sim/src/main.tsx` | React root mount |
| `apps/sim/src/App.tsx` | Root component stub |
| `apps/sim/src/store/index.ts` | Zustand sim store (bodies, time, playback state) |
| `apps/sim/src/ws/bridge.ts` | WebSocket client connecting to orbital MCP server |
| `mcp-servers/orbital/package.json` | Node MCP server: @modelcontextprotocol/sdk, ws, zod |
| `mcp-servers/orbital/tsconfig.json` | Extends base, NodeNext module, emits to dist |
| `mcp-servers/orbital/src/index.ts` | MCP Server entry + registers tools |
| `mcp-servers/orbital/src/ws/server.ts` | ws.WebSocketServer on port 8080 |
| `mcp-servers/orbital/src/tools/listComponents.ts` | MCP tool: returns ui component list |
| `mcp-servers/orbital/src/tools/listPages.ts` | MCP tool: returns sim scene pages |

---

## Task 1: Root monorepo config

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Modify: `.gitignore` (create if absent)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "astrophysics-playground",
  "version": "0.0.1",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

- [ ] **Step 2: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "mcp-servers/*"
```

- [ ] **Step 3: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules/
dist/
.turbo/
.env
.env.local
*.local
```

- [ ] **Step 6: Verify structure**

Run: `ls -1 /*.json pnpm-workspace.yaml .gitignore` (relative to repo root)
Expected: `package.json`, `turbo.json`, `tsconfig.base.json`, `pnpm-workspace.yaml`, `.gitignore` all present.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml turbo.json tsconfig.base.json .gitignore
git commit -m "chore: add root monorepo config (turbo, pnpm workspaces, tsconfig base)"
```

---

## Task 2: packages/ui — shared Three.js + Resium component library

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/tsup.config.ts`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/three/StarField.tsx`
- Create: `packages/ui/src/cesium/GlobeViewer.tsx`

- [ ] **Step 1: Write `packages/ui/package.json`**

```json
{
  "name": "@astrophysics-playground/ui",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "tsc --noEmit",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "three": "^0.164.0",
    "@react-three/fiber": "^8.16.0",
    "@react-three/drei": "^9.105.0",
    "resium": "^1.17.0",
    "cesium": "^1.116.0"
  },
  "devDependencies": {
    "@types/three": "^0.164.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.4.0",
    "tsup": "^8.0.0"
  }
}
```

- [ ] **Step 2: Write `packages/ui/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false,
    "composite": true,
    "allowImportingTsExtensions": false
  },
  "include": ["src"]
}
```

Note: `allowImportingTsExtensions` must be false when `noEmit` is false (tsup emits).

- [ ] **Step 3: Write `packages/ui/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "three", "cesium"],
  treeshake: true,
});
```

- [ ] **Step 4: Write `packages/ui/src/three/StarField.tsx`**

```tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarFieldProps {
  count?: number;
}

export function StarField({ count = 5000 }: StarFieldProps) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  }

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" />
    </points>
  );
}
```

- [ ] **Step 5: Write `packages/ui/src/cesium/GlobeViewer.tsx`**

```tsx
import { Viewer } from "resium";
import { Ion } from "cesium";

interface GlobeViewerProps {
  cesiumIonToken?: string;
}

export function GlobeViewer({ cesiumIonToken }: GlobeViewerProps) {
  if (cesiumIonToken) {
    Ion.defaultAccessToken = cesiumIonToken;
  }

  return (
    <Viewer
      full
      timeline={false}
      animation={false}
      homeButton={false}
      sceneModePicker={false}
    />
  );
}
```

- [ ] **Step 6: Write `packages/ui/src/index.ts`**

```ts
// Three.js components
export { StarField } from "./three/StarField";

// Cesium / Resium components
export { GlobeViewer } from "./cesium/GlobeViewer";
```

- [ ] **Step 7: Commit**

```bash
git add packages/
git commit -m "chore: scaffold packages/ui with Three.js StarField and Resium GlobeViewer stubs"
```

---

## Task 3: apps/studio — Figma-like scene designer

**Files:**
- Create: `apps/studio/package.json`
- Create: `apps/studio/tsconfig.json`
- Create: `apps/studio/vite.config.ts`
- Create: `apps/studio/index.html`
- Create: `apps/studio/src/main.tsx`
- Create: `apps/studio/src/App.tsx`
- Create: `apps/studio/src/store/index.ts`

- [ ] **Step 1: Write `apps/studio/package.json`**

```json
{
  "name": "@astrophysics-playground/studio",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "type-check": "tsc --noEmit",
    "preview": "vite preview",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@astrophysics-playground/ui": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 2: Write `apps/studio/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "composite": false
  },
  "include": ["src"],
  "references": [{ "path": "../../packages/ui" }]
}
```

- [ ] **Step 3: Write `apps/studio/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

- [ ] **Step 4: Write `apps/studio/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Astrophysics Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `apps/studio/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Write `apps/studio/src/store/index.ts`**

```ts
import { create } from "zustand";

export type ComponentNode = {
  id: string;
  type: "starfield" | "globe" | "orbit";
  label: string;
};

type StudioStore = {
  nodes: ComponentNode[];
  selectedId: string | null;
  addNode: (node: ComponentNode) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
};

export const useStudioStore = create<StudioStore>((set) => ({
  nodes: [],
  selectedId: null,
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (id) =>
    set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),
  selectNode: (id) => set({ selectedId: id }),
}));
```

- [ ] **Step 7: Write `apps/studio/src/App.tsx`**

```tsx
import { useStudioStore } from "./store";

export default function App() {
  const { nodes, selectedId, selectNode } = useStudioStore();

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "monospace" }}>
      <aside style={{ width: 240, borderRight: "1px solid #333", padding: 16 }}>
        <h2>Scene</h2>
        {nodes.length === 0 && <p style={{ color: "#666" }}>No nodes yet.</p>}
        {nodes.map((n) => (
          <div
            key={n.id}
            onClick={() => selectNode(n.id)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: selectedId === n.id ? "#1a1aff22" : "transparent",
            }}
          >
            {n.label}
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Canvas — drag components from the panel to build scenes.</p>
      </main>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add apps/studio/
git commit -m "chore: scaffold apps/studio Vite+React app with Zustand scene store"
```

---

## Task 4: apps/sim — live physics simulation viewer

**Files:**
- Create: `apps/sim/package.json`
- Create: `apps/sim/tsconfig.json`
- Create: `apps/sim/vite.config.ts`
- Create: `apps/sim/index.html`
- Create: `apps/sim/src/main.tsx`
- Create: `apps/sim/src/App.tsx`
- Create: `apps/sim/src/store/index.ts`
- Create: `apps/sim/src/ws/bridge.ts`

- [ ] **Step 1: Write `apps/sim/package.json`**

```json
{
  "name": "@astrophysics-playground/sim",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "type-check": "tsc --noEmit",
    "preview": "vite preview",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@astrophysics-playground/ui": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 2: Write `apps/sim/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "composite": false
  },
  "include": ["src"],
  "references": [{ "path": "../../packages/ui" }]
}
```

- [ ] **Step 3: Write `apps/sim/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ""),
      },
    },
  },
});
```

- [ ] **Step 4: Write `apps/sim/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Astrophysics Sim</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `apps/sim/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Write `apps/sim/src/store/index.ts`**

```ts
import { create } from "zustand";

export type Body = {
  id: string;
  name: string;
  mass: number; // kg
  position: [number, number, number]; // meters from barycenter
  velocity: [number, number, number]; // m/s
};

export type PlaybackState = "playing" | "paused" | "stopped";

type SimStore = {
  bodies: Body[];
  playback: PlaybackState;
  simTime: number; // seconds since epoch
  setBodies: (bodies: Body[]) => void;
  setPlayback: (state: PlaybackState) => void;
  tickTime: (deltaSeconds: number) => void;
};

export const useSimStore = create<SimStore>((set) => ({
  bodies: [],
  playback: "stopped",
  simTime: 0,
  setBodies: (bodies) => set({ bodies }),
  setPlayback: (playback) => set({ playback }),
  tickTime: (deltaSeconds) =>
    set((s) => ({ simTime: s.simTime + deltaSeconds })),
}));
```

- [ ] **Step 7: Write `apps/sim/src/ws/bridge.ts`**

```ts
import { useSimStore } from "../store";

export type BridgeMessage =
  | { type: "bodies"; payload: Parameters<ReturnType<typeof useSimStore.getState>["setBodies"]>[0] }
  | { type: "playback"; payload: ReturnType<typeof useSimStore.getState>["playback"] }
  | { type: "tick"; payload: { deltaSeconds: number } };

let socket: WebSocket | null = null;

export function connectBridge(wsUrl = "ws://localhost:8080"): () => void {
  socket = new WebSocket(wsUrl);

  socket.onmessage = (event: MessageEvent<string>) => {
    let msg: BridgeMessage;
    try {
      msg = JSON.parse(event.data) as BridgeMessage;
    } catch {
      console.warn("[bridge] bad message", event.data);
      return;
    }

    const store = useSimStore.getState();
    if (msg.type === "bodies") store.setBodies(msg.payload);
    else if (msg.type === "playback") store.setPlayback(msg.payload);
    else if (msg.type === "tick") store.tickTime(msg.payload.deltaSeconds);
  };

  socket.onerror = (e) => console.error("[bridge] error", e);

  return () => {
    socket?.close();
    socket = null;
  };
}

export function sendBridgeMessage(msg: BridgeMessage): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("[bridge] socket not open");
    return;
  }
  socket.send(JSON.stringify(msg));
}
```

- [ ] **Step 8: Write `apps/sim/src/App.tsx`**

```tsx
import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { StarField } from "@astrophysics-playground/ui";
import { connectBridge } from "./ws/bridge";
import { useSimStore } from "./store";

export default function App() {
  const { bodies, playback, simTime } = useSimStore();

  useEffect(() => {
    const disconnect = connectBridge();
    return disconnect;
  }, []);

  return (
    <div style={{ height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [0, 0, 500], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <StarField count={8000} />
        {bodies.map((body) => (
          <mesh key={body.id} position={body.position}>
            <sphereGeometry args={[5, 16, 16]} />
            <meshStandardMaterial color="#4af" />
          </mesh>
        ))}
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#fff",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        <div>Status: {playback}</div>
        <div>T+{simTime.toFixed(1)}s</div>
        <div>Bodies: {bodies.length}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add apps/sim/
git commit -m "chore: scaffold apps/sim Vite+React viewer with Zustand store and WebSocket bridge"
```

---

## Task 5: mcp-servers/orbital — MCP server with WebSocket bridge

**Files:**
- Create: `mcp-servers/orbital/package.json`
- Create: `mcp-servers/orbital/tsconfig.json`
- Create: `mcp-servers/orbital/src/ws/server.ts`
- Create: `mcp-servers/orbital/src/tools/listComponents.ts`
- Create: `mcp-servers/orbital/src/tools/listPages.ts`
- Create: `mcp-servers/orbital/src/index.ts`

- [ ] **Step 1: Write `mcp-servers/orbital/package.json`**

```json
{
  "name": "@astrophysics-playground/orbital-mcp",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "ws": "^8.17.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/ws": "^8.5.0",
    "typescript": "^5.4.0",
    "tsx": "^4.7.0"
  }
}
```

- [ ] **Step 2: Write `mcp-servers/orbital/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false,
    "composite": false,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "allowImportingTsExtensions": false,
    "jsx": "preserve"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write `mcp-servers/orbital/src/ws/server.ts`**

```ts
import { WebSocketServer, WebSocket } from "ws";

const WS_PORT = 8080;

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function startWsServer(): WebSocketServer {
  wss = new WebSocketServer({ port: WS_PORT });

  wss.on("listening", () => {
    console.log(`[orbital-ws] listening on ws://localhost:${WS_PORT}`);
  });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`[orbital-ws] client connected (total: ${clients.size})`);

    ws.on("message", (data) => {
      console.log("[orbital-ws] message from sim:", data.toString());
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[orbital-ws] client disconnected (total: ${clients.size})`);
    });
  });

  return wss;
}

export function broadcast(message: unknown): void {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}
```

- [ ] **Step 4: Write `mcp-servers/orbital/src/tools/listComponents.ts`**

```ts
import { z } from "zod";

export const listComponentsName = "list_components";

export const listComponentsSchema = z.object({});

export type ListComponentsResult = {
  components: Array<{ name: string; package: string; description: string }>;
};

export function listComponents(): ListComponentsResult {
  return {
    components: [
      {
        name: "StarField",
        package: "@astrophysics-playground/ui",
        description: "Animated 3D star field using Three.js Points.",
      },
      {
        name: "GlobeViewer",
        package: "@astrophysics-playground/ui",
        description: "Interactive Cesium globe via Resium.",
      },
    ],
  };
}
```

- [ ] **Step 5: Write `mcp-servers/orbital/src/tools/listPages.ts`**

```ts
import { z } from "zod";

export const listPagesName = "list_pages";

export const listPagesSchema = z.object({});

export type ListPagesResult = {
  pages: Array<{ id: string; title: string; route: string }>;
};

export function listPages(): ListPagesResult {
  return {
    pages: [
      { id: "solar-system", title: "Solar System", route: "/" },
      { id: "earth-moon", title: "Earth–Moon System", route: "/earth-moon" },
      { id: "custom", title: "Custom Simulation", route: "/custom" },
    ],
  };
}
```

- [ ] **Step 6: Write `mcp-servers/orbital/src/index.ts`**

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  listComponentsName,
  listComponentsSchema,
  listComponents,
} from "./tools/listComponents.js";
import {
  listPagesName,
  listPagesSchema,
  listPages,
} from "./tools/listPages.js";
import { startWsServer } from "./ws/server.js";

const server = new McpServer({
  name: "orbital",
  version: "0.0.1",
});

server.tool(listComponentsName, listComponentsSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listComponents(), null, 2) }],
}));

server.tool(listPagesName, listPagesSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listPages(), null, 2) }],
}));

startWsServer();

const transport = new StdioServerTransport();
await server.connect(transport);
console.log("[orbital-mcp] server ready");
```

- [ ] **Step 7: Commit**

```bash
git add mcp-servers/orbital/
git commit -m "chore: scaffold mcp-servers/orbital MCP server with WebSocket bridge and list tools"
```

---

## Task 6: Root README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: write architecture README for astrophysics-playground monorepo"
```

---

## Final Verification

- [ ] **Verify workspace graph resolves**

Run: `cat turbo.json` — confirm tasks reference `^build` correctly.
Check `pnpm-workspace.yaml` lists `apps/*`, `packages/*`, `mcp-servers/*`.

- [ ] **Verify cross-workspace references**

`apps/studio/package.json` and `apps/sim/package.json` both list `"@astrophysics-playground/ui": "workspace:*"`.
`packages/ui/package.json` exports field points to `./dist/index.js`.

- [ ] **Verify MCP import paths use `.js` extensions**

`mcp-servers/orbital/src/index.ts` imports end in `.js` (required for NodeNext module resolution).

- [ ] **Final commit**

```bash
git add docs/
git commit -m "docs: add monorepo scaffold implementation plan"
```
