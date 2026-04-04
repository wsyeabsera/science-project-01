# Astrophysics Playground — Skill System Design

**Date:** 2026-04-04
**Status:** Approved

## Goal

Build a powerful Claude skill system for the astrophysics playground project — analogous to superpowers but domain-specific. Enables Claude to autonomously build, visually review, and iterate on 3D astrophysics environments (starting with the solar system) with minimal interruptions, using the orbital MCP server and Chrome MCP for a complete build→review→iterate loop.

## Problem

The user is not a 3D designer and lacks expertise in Three.js/Cesium aesthetics. Without injected domain knowledge and a self-reviewing loop, Claude produces generic-looking scenes and interrupts constantly for permission. The solution is a skill system that gives Claude design taste, physics accuracy, visual self-evaluation ability, and clear autonomy rules.

---

## Architecture: Approach C

Three interlocking layers:

```
CLAUDE.md                  — autonomy rules, project conventions (always present)
Skills (×4)                — domain knowledge, loads on demand
orbital MCP server tools   — programmatic sim control
Chrome MCP                 — visual review loop
```

---

## Layer 1: CLAUDE.md (project root)

The autonomy contract. Tells Claude how to behave project-wide without being asked.

**Auto-proceed without asking:**
- Edit, create, delete files anywhere in the monorepo
- Install packages via pnpm
- Start/restart dev servers
- Call any orbital MCP tool
- Take screenshots and navigate Chrome MCP
- Run build, lint, type-check commands

**Always do after any visual change (no exceptions):**
1. Navigate Chrome MCP to `http://localhost:5174`
2. Take a screenshot
3. Evaluate against the visual standards defined in `scene-builder` skill
4. Fix any failures
5. Re-screenshot until passing
6. Only then declare the task done

**Stop and ask only for:**
- Genuine design forks with no clear better answer (e.g. "should rings cast shadows on the planet?")
- Decisions that change the scientific accuracy tradeoff (approximate vs exact)
- Anything that affects the MCP server's public API shape

**Project context:**
- Monorepo root: this directory
- Studio: `apps/studio/` → `http://localhost:5173`
- Sim: `apps/sim/` → `http://localhost:5174`
- Shared components: `packages/ui/`
- MCP server: `mcp-servers/orbital/` → WebSocket on `:8080`
- Package manager: pnpm. Run commands from repo root with `--filter` or `turbo run`.

**Design standards (always apply):**
- Space is dark: background `#000005`, not black
- Sun is always the brightest object in the scene
- Planet sizes use physically correct relative ratios (not equal sizes)
- Orbit paths are faint semi-transparent ellipses, not solid lines
- Educational labels are always visible but never cluttered
- Controls must be intuitive: orbit drag, scroll zoom, click to focus

---

## Layer 2: Skills

### `scene-builder`

**Trigger:** any task involving building or modifying a 3D environment

**Contents:**

*Three.js patterns:*
- PBR planet: `MeshStandardMaterial` with `map` (albedo), `normalMap`, `roughnessMap`, `metalnessMap`
- Atmosphere: custom `ShaderMaterial` with Fresnel rim glow, additive blending
- Star field: `Points` geometry, 10k–50k stars, randomized sizes via `PointsMaterial.sizeAttenuation`
- Sun: `PointLight` at origin + `AdditiveBlending` sprite for glow + `LensFlare` post-process
- Bloom: `UnrealBloomPass` via `EffectComposer`, threshold 0.8, strength 1.5 for sun/glow objects
- Orbit paths: `EllipseCurve` → `BufferGeometry` → `LineLoop`, `opacity: 0.2`, `transparent: true`
- Camera: `OrbitControls` with `enableDamping: true`, `dampingFactor: 0.05`

*Cesium integration:*
- Use Resium `Viewer` for Earth-centric scenes (realistic terrain, atmosphere, day/night)
- For solar system scale: pure Three.js (Cesium is overkill at AU scales)
- Overlay Three.js canvas on Cesium Viewer using `scene.canvas` and a shared `requestAnimationFrame` loop

*Texture sources (free, high quality):*
- NASA Visible Earth: `https://visibleearth.nasa.gov` — Earth day/night, 4K–8K
- Solar System Scope: `https://www.solarsystemscope.com/textures/` — all planets, 2K–8K PBR sets
- NASA 3D Resources: `https://nasa3d.arc.nasa.gov` — spacecraft models, surface maps
- JPL Horizons: `https://ssd.jpl.nasa.gov/horizons/` — real ephemeris data

*Aesthetic guide:*
- Background: `#000005` with a subtle blue-black gradient toward galactic plane
- Sun color: `#FFF4E0`, intensity 2.0, with orange corona ring sprite
- Labels: white `#FFFFFF`, small sans-serif, connected to body by a faint line, fade at distance
- Interaction feedback: subtle highlight ring on hover/click, camera smoothly dollies in
- Time display: always show current sim date + time-scale multiplier in top-left HUD

### `visual-reviewer`

**Trigger:** after any visual change is made to the sim or a component

**The review loop (mandatory, always run in full):**

```
1. mcp__chrome-devtools__navigate_page → http://localhost:5174
2. Wait 2s for Three.js to render (mcp__chrome-devtools__wait_for)
3. mcp__chrome-devtools__take_screenshot
4. Evaluate against checklist below
5. If any item fails → fix code → go to step 1
6. If all pass → done
```

**Visual evaluation checklist (all must pass):**
- [ ] Background is dark (near-black), not white or grey
- [ ] Sun is visibly the brightest object with glow/bloom
- [ ] At least one planet is visible with surface texture (not plain color)
- [ ] Orbit paths are visible as faint ellipses
- [ ] Labels are readable (white text, not overlapping)
- [ ] Scene has depth — objects at different distances, not flat
- [ ] No obvious console errors (check via `mcp__chrome-devtools__get_console_message`)
- [ ] Camera controls respond (orbit, zoom work)
- [ ] Frame rate appears smooth (no visible stuttering artifacts in screenshot)

**When to iterate vs. ask:**
- Rendering bug, missing texture, wrong color → fix silently
- Scene looks technically correct but aesthetically flat → apply scene-builder patterns silently
- Fundamental artistic direction question → ask user

### `orbital-mechanics`

**Trigger:** any task involving planet positions, velocities, orbital parameters, or time-based simulation

**Real solar system data (J2000 epoch, use as defaults):**

| Body | Semi-major axis (AU) | Orbital period (days) | Mass (kg) | Radius (km) | Texture color hint |
|---|---|---|---|---|---|
| Mercury | 0.387 | 87.97 | 3.30e23 | 2,440 | grey, heavily cratered |
| Venus | 0.723 | 224.70 | 4.87e24 | 6,052 | pale yellow, thick clouds |
| Earth | 1.000 | 365.25 | 5.97e24 | 6,371 | blue-green, white clouds |
| Mars | 1.524 | 686.97 | 6.42e23 | 3,390 | red-orange, polar ice caps |
| Jupiter | 5.203 | 4,332.59 | 1.90e27 | 69,911 | orange-brown banded |
| Saturn | 9.537 | 10,759.22 | 5.68e26 | 58,232 | pale gold, ring system |
| Uranus | 19.191 | 30,688.50 | 8.68e25 | 25,362 | pale cyan |
| Neptune | 30.069 | 60,195.00 | 1.02e26 | 24,622 | deep blue |

**Kepler's laws — apply directly:**
- Position from mean anomaly: use iterative Newton-Raphson to solve Kepler's equation `M = E - e·sin(E)`
- Cartesian from orbital elements: standard rotation matrices (Ω, i, ω)
- For display purposes at 1x scale: 1 AU = 100 Three.js units

**Scale conventions for the sim:**
- Distance: 1 AU = 100 units (preserves relative distances)
- Planet radii: exaggerated ×500 for visibility (real scale makes planets invisible at solar system scale)
- Sun radius: 10 units (exaggerated, but smaller than planets relative to real ratio for aesthetics)
- Time: 1 sim-second = configurable (default: 1 Earth day)

### `scene-scripter`

**Trigger:** controlling the sim programmatically, scripting specific scenarios, setting precise parameters

**MCP tool reference:**

```typescript
// Load a named scene
load_scene({ id: "solar-system" | "earth-moon" | "custom" })

// Set or update a celestial body
set_body({
  id: string,              // unique identifier
  name: string,            // display label
  mass: number,            // kg
  radius: number,          // Three.js units (after scale convention)
  position: [x, y, z],    // Three.js units
  velocity: [vx, vy, vz], // units/sim-second
  texture: string,         // URL or preset name e.g. "earth", "mars"
  color: string,           // fallback hex if no texture
  rings?: {
    innerRadius: number,
    outerRadius: number,
    texture: string
  }
})

// Control playback
control_sim({
  action: "play" | "pause" | "stop" | "reset",
  timeScale?: number       // 1 = real time, 100 = 100x, 86400 = 1 day/sec
})

// Query current state
get_sim_state()
// returns: { bodies: Body[], playback: string, simTime: number, timeScale: number }

// Move camera
set_camera({
  target: string,          // body id to focus on
  distance: number,        // units from target
  azimuth?: number,        // degrees
  elevation?: number       // degrees (0 = equatorial, 90 = polar)
})

// Add educational overlay
add_label({
  bodyId: string,
  text: string,            // e.g. "Jupiter\n318× Earth mass\n79 moons"
  style?: "default" | "highlight" | "warning"
})
```

**Example: Jupiter at opposition**
```
1. load_scene({ id: "solar-system" })
2. set_body({ id: "jupiter", ... position at opposition ... })
3. add_label({ bodyId: "jupiter", text: "Jupiter at Opposition\nClosest approach to Earth\n~628M km" })
4. set_camera({ target: "jupiter", distance: 200, elevation: 15 })
5. control_sim({ action: "play", timeScale: 86400 })
```

---

## Layer 3: Expanded MCP Server Tools

Beyond the scaffold's `list_components` / `list_pages`, the orbital MCP server exposes:

| Tool | Signature | Purpose |
|---|---|---|
| `load_scene` | `{ id: string }` | Load a named scene into sim via WebSocket |
| `set_body` | `Body` shape above | Create or update a celestial body |
| `control_sim` | `{ action, timeScale? }` | Play/pause/reset, set time scale |
| `get_sim_state` | `{}` | Query full sim state |
| `set_camera` | `{ target, distance, azimuth?, elevation? }` | Point camera |
| `add_label` | `{ bodyId, text, style? }` | Add educational overlay |
| `list_components` | `{}` | (existing) List UI components |
| `list_scenes` | `{}` | List available saved scenes |

All tools broadcast to the sim via the existing WebSocket server on `:8080`.

---

## File Layout

```
.claude/
  CLAUDE.md                          ← autonomy rules + project context

~/.claude/skills/                    ← personal skills directory
  scene-builder/
    SKILL.md                         ← Three.js patterns, textures, aesthetics
  visual-reviewer/
    SKILL.md                         ← Chrome MCP review loop + eval checklist
  orbital-mechanics/
    SKILL.md                         ← planet data, Kepler formulas, scale conventions
  scene-scripter/
    SKILL.md                         ← MCP tool reference + example scripts

mcp-servers/orbital/src/tools/       ← expanded MCP tools
  loadScene.ts
  setBody.ts
  controlSim.ts
  getSimState.ts
  setCamera.ts
  addLabel.ts
  listComponents.ts                  ← existing
  listPages.ts                       ← existing → rename to listScenes.ts
```

---

## Success Criteria

1. "Build the solar system" → Claude builds a beautiful, scientifically labeled scene, reviews it in Chrome, iterates until passing all checklist items, without asking permission once
2. "Show Jupiter at opposition" → Claude calls MCP tools, sets the scene, labels it educationally, opens Chrome to verify
3. Textures load from NASA/Solar System Scope URLs — no placeholder colors
4. All 8 planets visible with correct relative distances and exaggerated-but-proportional sizes
5. Orbit paths, sun glow, atmosphere shaders present in the first build
6. Chrome screenshot review catches and fixes at least one issue per build cycle
