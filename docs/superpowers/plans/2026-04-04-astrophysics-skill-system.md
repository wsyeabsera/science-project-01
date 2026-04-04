# Astrophysics Skill System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete skill system for the astrophysics playground — CLAUDE.md autonomy contract, 5 personal skills, expanded orbital MCP server tools, and a self-improvement feedback loop.

**Architecture:** Personal skills in `~/.claude/skills/`, project autonomy rules in `CLAUDE.md` at repo root, new MCP tools in `mcp-servers/orbital/src/tools/`, shared in-memory state store at `mcp-servers/orbital/src/state.ts`, feedback logs at `logs/`.

**Tech Stack:** Markdown (skills), TypeScript + Zod (MCP tools), Vitest (tests), WebSocket broadcast (sim control).

---

## File Map

| File | Responsibility |
|---|---|
| `CLAUDE.md` | Autonomy contract — what Claude can do without asking, review loop, design standards |
| `logs/skill-feedback.jsonl` | Structured event log — errors, gaps, improvements, successes |
| `logs/gaps.md` | Human-readable gap tracker with seen-count |
| `~/.claude/skills/scene-builder/SKILL.md` | Three.js patterns, texture sources, aesthetic standards |
| `~/.claude/skills/visual-reviewer/SKILL.md` | Chrome MCP review loop, evaluation checklist |
| `~/.claude/skills/orbital-mechanics/SKILL.md` | Planet data, Kepler formulas, scale conventions |
| `~/.claude/skills/scene-scripter/SKILL.md` | MCP tool reference, example scripts |
| `~/.claude/skills/skill-refiner/SKILL.md` | Meta-skill that maintains all other skills |
| `mcp-servers/orbital/src/types.ts` | Shared types: Body, SimState, WsMessage, CameraState, Label |
| `mcp-servers/orbital/src/state.ts` | In-memory sim state store (pure functions) |
| `mcp-servers/orbital/src/state.test.ts` | Unit tests for state store |
| `mcp-servers/orbital/src/tools/loadScene.ts` | MCP tool: load a named scene |
| `mcp-servers/orbital/src/tools/listScenes.ts` | MCP tool: list available scenes (replaces listPages) |
| `mcp-servers/orbital/src/tools/setBody.ts` | MCP tool: create/update a celestial body |
| `mcp-servers/orbital/src/tools/controlSim.ts` | MCP tool: play/pause/reset/set time scale |
| `mcp-servers/orbital/src/tools/getSimState.ts` | MCP tool: query full sim state |
| `mcp-servers/orbital/src/tools/setCamera.ts` | MCP tool: point camera at a body |
| `mcp-servers/orbital/src/tools/addLabel.ts` | MCP tool: attach educational overlay |
| `mcp-servers/orbital/src/index.ts` | Register all tools, start WS server (modify existing) |
| `apps/sim/src/ws/bridge.ts` | Handle new WS message types from MCP server (modify existing) |

---

## Task 1: CLAUDE.md + logging infrastructure

**Files:**
- Create: `CLAUDE.md`
- Create: `logs/gaps.md`
- Create: `logs/skill-feedback.jsonl`

- [ ] **Step 1: Create `CLAUDE.md` at repo root**

```markdown
# Astrophysics Playground — Claude Instructions

## Project Layout

- `apps/studio/` → scene designer → http://localhost:5173
- `apps/sim/` → live simulation → http://localhost:5174
- `packages/ui/` → shared Three.js + Cesium components
- `mcp-servers/orbital/` → MCP server + WebSocket on :8080
- `logs/` → session feedback log + gap tracker

Package manager: pnpm. Run from repo root:
- Per-workspace: `pnpm --filter @astrophysics-playground/sim dev`
- All workspaces: `turbo run dev`

## Autonomy — Act Without Asking

Do all of these without asking for permission:
- Edit, create, delete any file in the monorepo
- Run `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm type-check`, `pnpm test`
- Call any orbital MCP tool (load_scene, set_body, control_sim, get_sim_state, set_camera, add_label, list_components, list_scenes)
- Navigate Chrome MCP to any localhost URL
- Take screenshots via Chrome MCP
- Update skill files in `~/.claude/skills/` when you learn something new
- Append to `logs/skill-feedback.jsonl`
- Commit with descriptive messages

## Visual Review — Mandatory After Every Visual Change

After any change to a component, scene, shader, or Three.js code:

1. `mcp__chrome-devtools__navigate_page` → http://localhost:5174
2. `mcp__chrome-devtools__wait_for` → `{ selector: 'canvas', timeout: 5000 }`
3. Wait 3 seconds (textures load async — do not skip this)
4. `mcp__chrome-devtools__take_screenshot`
5. Evaluate against visual standards (visual-reviewer skill)
6. `mcp__chrome-devtools__get_console_message` → check for errors
7. If anything fails: fix silently, restart from step 1
8. Only declare done when all checks pass

Never say "looks good" based on code alone. Always screenshot.

## Stop and Ask Only For

- Design decisions with no clear better answer (ring shadow rendering approach, which moons to show)
- Changes to the MCP server's public API shape (tool names, parameter schemas)
- Scientific accuracy tradeoffs (Keplerian approximation vs full n-body)

Everything else: decide and do.

## Design Standards (Always Apply)

- Space background: `#000005` (never pure `#000000`, never grey)
- Sun: always the brightest object, always has bloom (UnrealBloomPass strength ≥ 1.5)
- Planet sizes: exaggerated ×500 for visibility, but proportional to each other
- Orbit paths: faint white ellipses, opacity 0.2, never solid lines
- Labels: white `#ffffff`, 12px sans-serif, always visible, never overlapping
- Camera: OrbitControls with damping (dampingFactor 0.05), always enabled
- Ambient light: intensity 0.02 — space is almost completely dark

## Self-Improvement — Mandatory After Every Session

After any session where you built, reviewed, debugged, or scripted anything:

1. Append at least one entry to `logs/skill-feedback.jsonl`:
   ```json
   {"ts":"<ISO timestamp>","type":"error|gap|improvement|success","skill":"<skill-name or null>","issue":"<what happened>","resolution":"<how it was fixed or pending>","skill_updated":true|false}
   ```
2. If you fixed a bug not covered by a skill → update the skill file immediately, set `skill_updated: true`
3. If a gap appears for the second time → extend a skill or create a new one in `~/.claude/skills/`
4. Commit skill updates: `chore(skills): <what changed and why>`

## Scale Conventions (Always Use These Numbers)

- 1 AU = 100 Three.js units
- Planet radii: real_km × 0.5 / 6371 (Earth radius = 0.5 units, Jupiter = 5.47 units)
- Sun radius: 10 Three.js units
- Default time scale: 1 sim-second = 1 Earth day
```

- [ ] **Step 2: Create `logs/gaps.md`**

```markdown
# Skill Gaps Tracker

Gaps are missing guidance that no skill provided. When a gap is seen twice, add it to a skill or create a new one.

## Open Gaps

_None yet. Append here when you encounter missing guidance._

<!-- Format:
### [YYYY-MM-DD] <short description>
Needed: <what guidance was missing>
Seen: 1x — monitor.
-->

## Resolved Gaps

_Gaps that were added to a skill._
```

- [ ] **Step 3: Create `logs/skill-feedback.jsonl`** (empty file to establish the path)

```
```

_(Empty file — Claude will append entries during sessions.)_

- [ ] **Step 4: Add `logs/` to `.gitignore` exemptions**

Check `.gitignore` exists at repo root. Ensure it does NOT ignore `logs/` — we want the log tracked. Add a comment:

```
# logs/ is intentionally tracked — skill feedback feeds self-improvement
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md logs/gaps.md logs/skill-feedback.jsonl .gitignore
git commit -m "feat: add CLAUDE.md autonomy contract and skill feedback log infrastructure"
```

---

## Task 2: `scene-builder` skill

**Files:**
- Create: `~/.claude/skills/scene-builder/SKILL.md`

- [ ] **Step 1: Create the skill directory and file**

```bash
mkdir -p ~/.claude/skills/scene-builder
```

- [ ] **Step 2: Write `~/.claude/skills/scene-builder/SKILL.md`**

```markdown
---
name: scene-builder
description: Use when building or modifying any 3D astrophysics environment — Three.js scenes, planet rendering, star fields, atmosphere shaders, bloom, orbit paths, lighting, camera. Includes texture sources and aesthetic standards for space environments.
---

# Scene Builder

## When to Use

Load this skill any time you are creating or modifying a Three.js scene, a planet component, star field, atmosphere shader, bloom effect, orbit path, or camera rig for the astrophysics playground.

## Cesium vs Three.js

- **Solar system / AU-scale scenes:** use pure Three.js — Cesium adds no value at these distances
- **Earth-centric scenes (terrain, realistic globe):** use Resium `<Viewer>` as base, overlay a Three.js canvas on top sharing `requestAnimationFrame`

## Three.js Patterns

### Planet (PBR materials)
```tsx
import * as THREE from 'three';

function makePlanet(radius: number, textures: {
  map: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
}) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      roughnessMap: textures.roughnessMap,
      roughness: 1,
      metalness: 0,
    })
  );
}
```

### Atmosphere (Fresnel rim glow)
```tsx
function makeAtmosphere(radius: number, color: THREE.ColorRepresentation) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.05, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(color) } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(color, intensity);
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
  );
}
```

### Star Field (20k stars)
```tsx
function makeStarField(count = 20000): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 4000;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 0.5, color: '#ffffff', sizeAttenuation: true })
  );
}
```

### Bloom Post-Processing
```tsx
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

function makeBloomComposer(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,   // strength — never go below 1.0 for space scenes
    0.4,   // radius
    0.85   // threshold
  ));
  return composer;
}
// In render loop: composer.render() NOT renderer.render()
```

### Sun (emissive mesh + point light)
```tsx
function makeSun(): { mesh: THREE.Mesh; light: THREE.PointLight } {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshStandardMaterial({ emissive: 0xfff4e0, emissiveIntensity: 2, color: 0x000000 })
  );
  const light = new THREE.PointLight(0xfff4e0, 2.0, 0, 0.5);
  return { mesh, light }; // add both to scene at position (0, 0, 0)
}
```

### Orbit Path (faint ellipse)
```tsx
function makeOrbitPath(semiMajorAxis: number, eccentricity: number): THREE.LineLoop {
  const semiMinor = semiMajorAxis * Math.sqrt(1 - eccentricity ** 2);
  const curve = new THREE.EllipseCurve(0, 0, semiMajorAxis, semiMinor);
  const points = curve.getPoints(128).map(p => new THREE.Vector3(p.x, 0, p.y));
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.2 })
  );
}
// semiMajorAxis in Three.js units (AU × 100)
```

### Camera Controls
```tsx
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function makeControls(camera: THREE.Camera, domElement: HTMLElement): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 20;
  controls.maxDistance = 5000;
  return controls;
}
// In render loop: controls.update()
```

## Texture Sources (Free, High Quality)

- **All planets 2K–8K PBR sets:** https://www.solarsystemscope.com/textures/
- **Earth day/night 4K–8K:** https://visibleearth.nasa.gov
- **NASA 3D models + surface maps:** https://nasa3d.arc.nasa.gov
- **Ephemeris data:** https://ssd.jpl.nasa.gov/horizons/

Load with THREE.TextureLoader. Cache loaded textures — don't reload the same URL.

## Aesthetic Standards (Non-Negotiable)

| Rule | Value |
|---|---|
| Background | `#000005` scene.background color |
| Sun | Always brightest, bloom always on |
| Ambient light | intensity 0.02 |
| Planet radii | Use orbital-mechanics skill scale conventions |
| Orbit paths | opacity 0.2, transparent: true, never solid |
| Labels | white #ffffff, 12px, always visible |
| Camera damping | dampingFactor 0.05, always enabled |
```

- [ ] **Step 3: Verify skill is discoverable**

```bash
ls ~/.claude/skills/scene-builder/
# Expected: SKILL.md
head -5 ~/.claude/skills/scene-builder/SKILL.md
# Expected: frontmatter with name and description
```

- [ ] **Step 4: Commit (note: skill lives in home dir, commit a pointer in the project)**

```bash
# Log that we created the skill
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","type":"success","skill":"scene-builder","issue":null,"resolution":"Skill created and verified discoverable","skill_updated":false}' >> logs/skill-feedback.jsonl
git add logs/skill-feedback.jsonl
git commit -m "feat(skills): add scene-builder skill with Three.js patterns and texture sources"
```

---

## Task 3: `visual-reviewer` skill

**Files:**
- Create: `~/.claude/skills/visual-reviewer/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/visual-reviewer
```

- [ ] **Step 2: Write `~/.claude/skills/visual-reviewer/SKILL.md`**

```markdown
---
name: visual-reviewer
description: Use after any visual change to the simulation or a 3D component. Defines the Chrome MCP review loop — navigate, screenshot, evaluate against checklist, iterate until passing.
---

# Visual Reviewer

## The Review Loop (Mandatory — Run Every Time, No Exceptions)

```
1. mcp__chrome-devtools__navigate_page → http://localhost:5174
2. mcp__chrome-devtools__wait_for → { selector: 'canvas', timeout: 5000 }
3. Wait 3 seconds (Three.js texture loads are async — never skip this)
4. mcp__chrome-devtools__take_screenshot
5. Evaluate screenshot against visual checklist below
6. mcp__chrome-devtools__get_console_message → scan for errors
7. If any check fails → fix code → go to step 1
8. If all pass → log success, declare done
```

## Visual Checklist (All Must Pass)

Screenshot checks:
- [ ] Background is near-black (not white, not grey, not bright)
- [ ] At least one glowing bright object visible (sun with bloom/glow)
- [ ] At least one planet visible with surface texture (not flat solid color)
- [ ] Orbit paths visible as faint curves (not absent, not solid thick lines)
- [ ] Labels present and readable (white text on dark)
- [ ] Scene has depth — objects at clearly different distances
- [ ] No UI chrome bleeding over the Three.js canvas

Console checks (from get_console_message):
- [ ] No `THREE.WebGLRenderer: Context Lost`
- [ ] No `Failed to load resource` (broken URL → fix the URL)
- [ ] No uncaught runtime errors

Canvas checks:
- [ ] Canvas element is non-zero size (WebGL initialized)
- [ ] Frame is not all-black with no shapes (camera or scene issue)

## Fix Silently (No Need to Ask)

| Problem | Fix |
|---|---|
| Broken texture URL | Find working URL from scene-builder skill, update |
| Wrong background color | Set `scene.background = new THREE.Color(0x000005)` |
| Missing bloom | Add UnrealBloomPass (see scene-builder skill) |
| All-black canvas | Check `renderer.setSize`, camera near/far, `scene.add()` calls |
| Console error | Fix the error |
| Labels missing | Add CSS2DRenderer or HTML overlay |
| Flat-colored planets | Load texture from solarsystemscope.com (see scene-builder skill) |

## Ask Before Fixing

Only stop and ask when there is a genuine design question:
- "Should the planet rotate on its own axis?"
- "Which moons should be visible?"
- "Day-side or night-side facing camera?"

## After Every Successful Review

Append to `logs/skill-feedback.jsonl`:
```json
{"ts":"<ISO>","type":"success","skill":"visual-reviewer","issue":null,"resolution":"All checklist items passed on screenshot review","skill_updated":false}
```

## After Fixing a Bug Not in scene-builder Skill

1. Add the fix to `~/.claude/skills/scene-builder/SKILL.md` in the relevant section
2. Log it:
```json
{"ts":"<ISO>","type":"error","skill":"scene-builder","issue":"<what was wrong>","resolution":"<what fixed it>","skill_updated":true}
```
```

- [ ] **Step 3: Verify**

```bash
ls ~/.claude/skills/visual-reviewer/
# Expected: SKILL.md
```

- [ ] **Step 4: Commit log entry**

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","type":"success","skill":"visual-reviewer","issue":null,"resolution":"Skill created","skill_updated":false}' >> logs/skill-feedback.jsonl
git add logs/skill-feedback.jsonl
git commit -m "feat(skills): add visual-reviewer skill with Chrome MCP review loop"
```

---

## Task 4: `orbital-mechanics` skill

**Files:**
- Create: `~/.claude/skills/orbital-mechanics/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/orbital-mechanics
```

- [ ] **Step 2: Write `~/.claude/skills/orbital-mechanics/SKILL.md`**

```markdown
---
name: orbital-mechanics
description: Use when scripting planet positions, computing orbital parameters, setting velocities, or doing any physics calculation for solar system bodies.
---

# Orbital Mechanics

## Scale Conventions (Always Use These)

| Quantity | Convention |
|---|---|
| Distance | 1 AU = 100 Three.js units |
| Planet radii | real_km × 0.5 / 6371 (Earth = 0.5 units radius) |
| Sun radius | 10 Three.js units |
| Time | 1 sim-second = 1 Earth day (default, configurable via timeScale) |

## Solar System Data (J2000 Epoch)

| Body | Semi-major (AU) | Period (days) | Eccentricity | Mass (kg) | Radius (km) |
|---|---|---|---|---|---|
| Mercury | 0.387 | 87.97 | 0.206 | 3.30e23 | 2,440 |
| Venus | 0.723 | 224.70 | 0.007 | 4.87e24 | 6,052 |
| Earth | 1.000 | 365.25 | 0.017 | 5.97e24 | 6,371 |
| Mars | 1.524 | 686.97 | 0.093 | 6.42e23 | 3,390 |
| Jupiter | 5.203 | 4332.59 | 0.049 | 1.90e27 | 69,911 |
| Saturn | 9.537 | 10759.22 | 0.057 | 5.68e26 | 58,232 |
| Uranus | 19.191 | 30688.50 | 0.046 | 8.68e25 | 25,362 |
| Neptune | 30.069 | 60195.00 | 0.010 | 1.02e26 | 24,622 |

## Planet Colors (hex, use as fallback before textures load)

Mercury: `#b5b5b5` | Venus: `#e8cda0` | Earth: `#2b6cb0` | Mars: `#c1440e`
Jupiter: `#c88b3a` | Saturn: `#e4d191` | Uranus: `#7de8e8` | Neptune: `#3f54ba`

## Position from Orbital Elements

```typescript
/** Solve Kepler's equation M = E - e·sin(E) via Newton-Raphson */
function eccentricAnomaly(M: number, e: number, tol = 1e-8): number {
  let E = M;
  for (let i = 0; i < 100; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

/** Returns [x, 0, z] position in Three.js units (xz plane = ecliptic) */
function planetPosition(
  semiMajorAU: number,
  eccentricity: number,
  periodDays: number,
  daysSinceJ2000: number
): [number, number, number] {
  const M = ((2 * Math.PI * daysSinceJ2000) / periodDays) % (2 * Math.PI);
  const E = eccentricAnomaly(M, eccentricity);
  const xAU = semiMajorAU * (Math.cos(E) - eccentricity);
  const zAU = semiMajorAU * Math.sqrt(1 - eccentricity ** 2) * Math.sin(E);
  return [xAU * 100, 0, zAU * 100]; // convert AU → Three.js units
}

/** Days elapsed since J2000.0 (2000-01-01 12:00 UTC) */
function daysSinceJ2000(date = new Date()): number {
  return (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86_400_000;
}
```

## Planet Radius in Three.js Units

```typescript
function threeRadius(realRadiusKm: number): number {
  return (realRadiusKm * 0.5) / 6371; // Earth = 0.5 units
}
// Examples: Mercury=0.19, Venus=0.47, Earth=0.50, Mars=0.27,
//           Jupiter=5.49, Saturn=4.57, Uranus=2.00, Neptune=1.93
```

## Saturn Ring Dimensions (Three.js units, after scale)

Inner radius: 4.57 × 1.24 = 5.67 | Outer radius: 4.57 × 2.27 = 10.37
Texture: use B-ring texture from solarsystemscope.com
```

- [ ] **Step 3: Verify**

```bash
ls ~/.claude/skills/orbital-mechanics/
```

- [ ] **Step 4: Commit log entry**

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","type":"success","skill":"orbital-mechanics","issue":null,"resolution":"Skill created with planet data and Kepler solver","skill_updated":false}' >> logs/skill-feedback.jsonl
git add logs/skill-feedback.jsonl
git commit -m "feat(skills): add orbital-mechanics skill with real planet data and Kepler equations"
```

---

## Task 5: `scene-scripter` skill

**Files:**
- Create: `~/.claude/skills/scene-scripter/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/scene-scripter
```

- [ ] **Step 2: Write `~/.claude/skills/scene-scripter/SKILL.md`**

```markdown
---
name: scene-scripter
description: Use when controlling the simulation programmatically via the orbital MCP server — loading scenes, setting celestial body parameters, controlling playback, moving the camera, adding educational labels.
---

# Scene Scripter

## MCP Tool Reference

### load_scene
Resets all bodies and loads a named scene template.
```json
{ "id": "solar-system" }
```
Valid ids: `"solar-system"`, `"earth-moon"`, `"custom"`

### set_body
Create or update a celestial body. Calling with an existing `id` updates it in place.
```json
{
  "id": "earth",
  "name": "Earth",
  "mass": 5.97e24,
  "radius": 0.5,
  "position": [100, 0, 0],
  "velocity": [0, 0, 0],
  "texture": "earth",
  "color": "#2b6cb0",
  "rings": null
}
```
`texture`: preset name (`"earth"`, `"mars"`, `"jupiter"`, `"saturn"`, `"venus"`, `"mercury"`, `"uranus"`, `"neptune"`) or full URL to a texture image.
`rings`: `null` or `{ "innerRadius": 5.67, "outerRadius": 10.37, "texture": "<url>" }`

### control_sim
```json
{ "action": "play", "timeScale": 86400 }
```
`action`: `"play"` | `"pause"` | `"stop"` | `"reset"`
`timeScale`: seconds of sim time per real second (1 = real time, 86400 = 1 day/sec, 0 = frozen)

### get_sim_state
No parameters. Returns current full state:
```json
{
  "bodies": [{ "id": "earth", "name": "Earth", "position": [100,0,0], "..." }],
  "labels": [{ "bodyId": "earth", "text": "Earth\n1 AU from Sun", "style": "default" }],
  "playback": "playing",
  "simTime": 12345.6,
  "timeScale": 86400,
  "scene": "solar-system",
  "camera": { "target": "earth", "distance": 200, "azimuth": 0, "elevation": 15 }
}
```

### set_camera
```json
{ "target": "jupiter", "distance": 300, "azimuth": 45, "elevation": 20 }
```
`target`: must be a body `id` that was set via `set_body`.
`azimuth`: degrees around the target (0 = front, 90 = right side).
`elevation`: degrees above equatorial plane (0 = side-on, 90 = top-down, 15 = typical cinematic).

### add_label
```json
{ "bodyId": "jupiter", "text": "Jupiter\n318× Earth mass\n79 moons", "style": "highlight" }
```
`style`: `"default"` (white) | `"highlight"` (gold) | `"warning"` (red)
`\n` in text creates line breaks in the overlay.

### list_scenes
No parameters. Returns all available scene ids and titles.

### list_components
No parameters. Returns all UI components in `packages/ui`.

## Scripting Pattern

Always follow this order:
1. `load_scene` — reset state and set context
2. `set_body` × N — place all bodies
3. `add_label` × N — attach educational text
4. `set_camera` — frame the interesting part
5. `control_sim` — set time scale and start

Then trigger visual review (visual-reviewer skill).

## Example: Solar System at Today's Real Positions

```
1. load_scene { id: "solar-system" }
2. set_body { id: "sun", name: "Sun", mass: 1.99e30, radius: 10, position: [0,0,0], velocity: [0,0,0], texture: "sun", color: "#fff4e0" }
3. For each planet, compute position using orbital-mechanics skill formulas (daysSinceJ2000 = today)
4. set_body for each planet with real mass, computed position, texture preset
5. add_label each planet: name + mass in Earth masses + number of moons
6. set_camera { target: "sun", distance: 800, elevation: 25 }
7. control_sim { action: "play", timeScale: 86400 }
```

## Example: Jupiter at Opposition (Closest Approach)

Opposition = Earth and Jupiter on the same side of the Sun, aligned.

```
1. load_scene { id: "solar-system" }
2. set_body sun at [0,0,0]
3. set_body earth at [100, 0, 0]  ← 1 AU on +x axis
4. set_body jupiter at [620, 0, 0]  ← 5.203 AU + 1 AU buffer on same side (520+100)
5. add_label { bodyId: "jupiter", text: "Jupiter at Opposition\nClosest to Earth\n~628 million km", style: "highlight" }
6. add_label { bodyId: "earth", text: "Earth", style: "default" }
7. set_camera { target: "jupiter", distance: 400, elevation: 15 }
8. control_sim { action: "play", timeScale: 86400 }
```

## Example: Gravitational Slingshot Concept

```
1. load_scene { id: "custom" }
2. set_body jupiter at [0,0,0] (stationary, large mass anchor)
3. set_body probe at [-400, 0, 200] with velocity [2, 0, -0.5] (incoming trajectory)
4. add_label { bodyId: "jupiter", text: "Jupiter\nGravity Assist", style: "highlight" }
5. add_label { bodyId: "probe", text: "Spacecraft\nSpeed increases as it\nswings around Jupiter", style: "default" }
6. set_camera { target: "jupiter", distance: 600, elevation: 30 }
7. control_sim { action: "play", timeScale: 100 }
```
```

- [ ] **Step 3: Verify**

```bash
ls ~/.claude/skills/scene-scripter/
```

- [ ] **Step 4: Commit log entry**

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","type":"success","skill":"scene-scripter","issue":null,"resolution":"Skill created with full MCP tool reference and 3 example scripts","skill_updated":false}' >> logs/skill-feedback.jsonl
git add logs/skill-feedback.jsonl
git commit -m "feat(skills): add scene-scripter skill with MCP tool reference and example scripts"
```

---

## Task 6: `skill-refiner` skill

**Files:**
- Create: `~/.claude/skills/skill-refiner/SKILL.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p ~/.claude/skills/skill-refiner
```

- [ ] **Step 2: Write `~/.claude/skills/skill-refiner/SKILL.md`**

```markdown
---
name: skill-refiner
description: Use when asked to "refine skills", "review what we've learned", or "improve the skill system". Also load automatically after 5+ new entries appear in logs/skill-feedback.jsonl since last refinement.
---

# Skill Refiner

## When to Run

- User says: "refine skills", "improve skills", "review learnings", "what have we learned"
- Automatically: count entries in `logs/skill-feedback.jsonl` — if 5+ new entries since last refinement commit, run this skill

## The Refinement Process

```
1. Read logs/skill-feedback.jsonl (all entries)
2. Read logs/gaps.md
3. Collect: unresolved errors, improvements, gaps seen 2+ times
4. For each actionable finding:
   a. Find the relevant skill (or create a new one)
   b. Add/fix the relevant section
   c. Set "resolved": true in the jsonl entry
5. For resolved gaps in gaps.md: move from "Open" to "Resolved" section
6. Commit all skill changes: "chore(skills): autonomous refinement — <date> — <N changes>"
7. Print summary: one line per skill updated
```

## Skill File Locations

```
~/.claude/skills/scene-builder/SKILL.md
~/.claude/skills/visual-reviewer/SKILL.md
~/.claude/skills/orbital-mechanics/SKILL.md
~/.claude/skills/scene-scripter/SKILL.md
~/.claude/skills/skill-refiner/SKILL.md   ← this file
```

## Creating a New Skill

When a gap doesn't fit in any existing skill, create a new one:

```bash
mkdir -p ~/.claude/skills/<kebab-name>
```

```markdown
---
name: <kebab-name>
description: Use when <specific triggering conditions — start with "Use when">
---

# <Title>

## Overview
<Core principle in 1-2 sentences>

## <Relevant content sections>
```

Good new skill candidates: `cesium-three-integration`, `saturn-rings`, `n-body-physics`, `educational-ui-overlays`, `animation-choreography`.

## Updating an Existing Skill

Add new content to the most relevant section. Never delete working patterns — mark them deprecated if superseded:

```markdown
### Old Pattern (deprecated — use New Pattern below)
...

### New Pattern
...
```

## Marking Log Entries Resolved

In `logs/skill-feedback.jsonl`, add `"resolved": true` to processed entries. Never delete entries — the history is valuable for understanding how the system evolved.

## Commit Message Format

```
chore(skills): autonomous refinement — <YYYY-MM-DD>

- scene-builder: added ring shadow casting pattern
- visual-reviewer: increased wait time to 3s for texture loads
- orbital-mechanics: added moon data for Jupiter's Galilean moons
```
```

- [ ] **Step 3: Verify all 5 skills are present**

```bash
ls ~/.claude/skills/
# Expected: scene-builder/  visual-reviewer/  orbital-mechanics/  scene-scripter/  skill-refiner/
```

- [ ] **Step 4: Commit**

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","type":"success","skill":"skill-refiner","issue":null,"resolution":"All 5 skills created and verified","skill_updated":false}' >> logs/skill-feedback.jsonl
git add logs/skill-feedback.jsonl
git commit -m "feat(skills): add skill-refiner meta-skill — skill system complete"
```

---

## Task 7: MCP server — types + state store + test setup

**Files:**
- Create: `mcp-servers/orbital/src/types.ts`
- Create: `mcp-servers/orbital/src/state.ts`
- Create: `mcp-servers/orbital/src/state.test.ts`
- Modify: `mcp-servers/orbital/package.json` (add vitest)

- [ ] **Step 1: Add vitest to `mcp-servers/orbital/package.json`**

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
    "test": "vitest run",
    "test:watch": "vitest",
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
    "tsx": "^4.7.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install vitest**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp install
```

Expected: vitest appears in `mcp-servers/orbital/node_modules/.bin/vitest`

- [ ] **Step 3: Write `mcp-servers/orbital/src/types.ts`**

```typescript
export interface Body {
  id: string;
  name: string;
  mass: number; // kg
  radius: number; // Three.js units
  position: [number, number, number]; // Three.js units
  velocity: [number, number, number]; // units/sim-second
  texture: string; // preset name or URL
  color: string; // hex fallback
  rings?: {
    innerRadius: number;
    outerRadius: number;
    texture: string;
  } | null;
}

export interface Label {
  bodyId: string;
  text: string;
  style: "default" | "highlight" | "warning";
}

export interface CameraState {
  target: string; // body id
  distance: number;
  azimuth: number; // degrees
  elevation: number; // degrees
}

export interface SimState {
  bodies: Body[];
  labels: Label[];
  playback: "playing" | "paused" | "stopped";
  simTime: number; // seconds since scene start
  timeScale: number; // sim-seconds per real second
  scene: string | null;
  camera: CameraState | null;
}

export type WsMessage =
  | { type: "load_scene"; payload: { id: string } }
  | { type: "set_body"; payload: Body }
  | { type: "control_sim"; payload: { action: "play" | "pause" | "stop" | "reset"; timeScale?: number } }
  | { type: "set_camera"; payload: CameraState }
  | { type: "add_label"; payload: Label };
```

- [ ] **Step 4: Write failing tests in `mcp-servers/orbital/src/state.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  getState,
  applyScene,
  applyBody,
  applyControl,
  applyCamera,
  applyLabel,
} from "./state.js";

describe("sim state store", () => {
  beforeEach(() => {
    applyControl("reset");
  });

  it("starts with empty bodies and stopped playback", () => {
    const s = getState();
    expect(s.bodies).toEqual([]);
    expect(s.playback).toBe("stopped");
    expect(s.scene).toBeNull();
  });

  it("applyScene clears bodies and sets scene id", () => {
    applyBody({ id: "earth", name: "Earth", mass: 5.97e24, radius: 0.5, position: [100, 0, 0], velocity: [0, 0, 0], texture: "earth", color: "#2b6cb0" });
    applyScene("solar-system");
    const s = getState();
    expect(s.bodies).toEqual([]);
    expect(s.scene).toBe("solar-system");
    expect(s.playback).toBe("stopped");
  });

  it("applyBody adds a new body", () => {
    applyBody({ id: "mars", name: "Mars", mass: 6.42e23, radius: 0.27, position: [152, 0, 0], velocity: [0, 0, 0], texture: "mars", color: "#c1440e" });
    expect(getState().bodies).toHaveLength(1);
    expect(getState().bodies[0].id).toBe("mars");
  });

  it("applyBody updates an existing body", () => {
    const base = { id: "mars", name: "Mars", mass: 6.42e23, radius: 0.27, position: [152, 0, 0] as [number, number, number], velocity: [0, 0, 0] as [number, number, number], texture: "mars", color: "#c1440e" };
    applyBody(base);
    applyBody({ ...base, position: [200, 0, 0] });
    expect(getState().bodies).toHaveLength(1);
    expect(getState().bodies[0].position).toEqual([200, 0, 0]);
  });

  it("applyControl sets playback and timeScale", () => {
    applyControl("play", 86400);
    const s = getState();
    expect(s.playback).toBe("playing");
    expect(s.timeScale).toBe(86400);
  });

  it("applyControl reset clears bodies and resets time", () => {
    applyBody({ id: "sun", name: "Sun", mass: 1.99e30, radius: 10, position: [0, 0, 0], velocity: [0, 0, 0], texture: "sun", color: "#fff4e0" });
    applyControl("reset");
    const s = getState();
    expect(s.bodies).toEqual([]);
    expect(s.simTime).toBe(0);
    expect(s.playback).toBe("stopped");
  });

  it("applyCamera sets camera state", () => {
    applyCamera({ target: "jupiter", distance: 300, azimuth: 45, elevation: 20 });
    expect(getState().camera).toEqual({ target: "jupiter", distance: 300, azimuth: 45, elevation: 20 });
  });

  it("applyLabel adds a new label", () => {
    applyLabel({ bodyId: "jupiter", text: "Jupiter\n318x Earth", style: "highlight" });
    expect(getState().labels).toHaveLength(1);
    expect(getState().labels[0].style).toBe("highlight");
  });

  it("applyLabel updates existing label for same bodyId", () => {
    applyLabel({ bodyId: "earth", text: "Earth", style: "default" });
    applyLabel({ bodyId: "earth", text: "Earth\n1 AU", style: "highlight" });
    expect(getState().labels).toHaveLength(1);
    expect(getState().labels[0].text).toBe("Earth\n1 AU");
  });

  it("getState returns a copy — mutating it does not affect store", () => {
    applyBody({ id: "venus", name: "Venus", mass: 4.87e24, radius: 0.47, position: [72, 0, 0], velocity: [0, 0, 0], texture: "venus", color: "#e8cda0" });
    const s = getState();
    s.bodies.push({ id: "fake", name: "Fake", mass: 0, radius: 0, position: [0, 0, 0], velocity: [0, 0, 0], texture: "", color: "" });
    expect(getState().bodies).toHaveLength(1); // store unchanged
  });
});
```

- [ ] **Step 5: Run tests — expect all to FAIL**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp test
```

Expected: all tests fail with `Cannot find module './state.js'`

- [ ] **Step 6: Write `mcp-servers/orbital/src/state.ts`**

```typescript
import type { Body, Label, CameraState, SimState } from "./types.js";

const INITIAL: SimState = {
  bodies: [],
  labels: [],
  playback: "stopped",
  simTime: 0,
  timeScale: 1,
  scene: null,
  camera: null,
};

let state: SimState = { ...INITIAL };

export function getState(): SimState {
  return {
    ...state,
    bodies: [...state.bodies],
    labels: [...state.labels],
  };
}

export function applyScene(id: string): void {
  state = { ...INITIAL, scene: id };
}

export function applyBody(body: Body): void {
  const idx = state.bodies.findIndex((b) => b.id === body.id);
  if (idx >= 0) {
    const updated = [...state.bodies];
    updated[idx] = body;
    state = { ...state, bodies: updated };
  } else {
    state = { ...state, bodies: [...state.bodies, body] };
  }
}

export function applyControl(action: string, timeScale?: number): void {
  if (action === "reset") {
    state = { ...INITIAL };
    return;
  }
  state = {
    ...state,
    playback: action as SimState["playback"],
    ...(timeScale !== undefined ? { timeScale } : {}),
  };
}

export function applyCamera(camera: CameraState): void {
  state = { ...state, camera };
}

export function applyLabel(label: Label): void {
  const idx = state.labels.findIndex((l) => l.bodyId === label.bodyId);
  if (idx >= 0) {
    const updated = [...state.labels];
    updated[idx] = label;
    state = { ...state, labels: updated };
  } else {
    state = { ...state, labels: [...state.labels, label] };
  }
}
```

- [ ] **Step 7: Run tests — expect all to PASS**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp test
```

Expected: `11 tests passed`

- [ ] **Step 8: Commit**

```bash
git add mcp-servers/orbital/
git commit -m "feat(mcp): add shared types, state store, and vitest suite"
```

---

## Task 8: MCP tools — `load_scene` + `list_scenes`

**Files:**
- Create: `mcp-servers/orbital/src/tools/loadScene.ts`
- Create: `mcp-servers/orbital/src/tools/listScenes.ts`

- [ ] **Step 1: Write `mcp-servers/orbital/src/tools/loadScene.ts`**

```typescript
import { z } from "zod";
import { broadcast } from "../ws/server.js";
import { applyScene } from "../state.js";

export const loadSceneName = "load_scene";

export const loadSceneSchema = z.object({
  id: z.enum(["solar-system", "earth-moon", "custom"]),
});

export function loadScene(input: z.infer<typeof loadSceneSchema>): string {
  applyScene(input.id);
  broadcast({ type: "load_scene", payload: { id: input.id } });
  return `Scene "${input.id}" loaded and broadcast to sim.`;
}
```

- [ ] **Step 2: Write `mcp-servers/orbital/src/tools/listScenes.ts`**

```typescript
import { z } from "zod";

export const listScenesName = "list_scenes";

export const listScenesSchema = z.object({});

export type ListScenesResult = {
  scenes: Array<{ id: string; title: string; description: string }>;
};

export function listScenes(): ListScenesResult {
  return {
    scenes: [
      {
        id: "solar-system",
        title: "Solar System",
        description: "All 8 planets orbiting the Sun. Start here for the full overview.",
      },
      {
        id: "earth-moon",
        title: "Earth–Moon System",
        description: "Earth and Moon in close detail. Good for tidal mechanics.",
      },
      {
        id: "custom",
        title: "Custom Simulation",
        description: "Blank scene. Use set_body to place any bodies you want.",
      },
    ],
  };
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add mcp-servers/orbital/src/tools/loadScene.ts mcp-servers/orbital/src/tools/listScenes.ts
git commit -m "feat(mcp): add load_scene and list_scenes tools"
```

---

## Task 9: MCP tools — `set_body` + `control_sim`

**Files:**
- Create: `mcp-servers/orbital/src/tools/setBody.ts`
- Create: `mcp-servers/orbital/src/tools/controlSim.ts`

- [ ] **Step 1: Write `mcp-servers/orbital/src/tools/setBody.ts`**

```typescript
import { z } from "zod";
import { broadcast } from "../ws/server.js";
import { applyBody } from "../state.js";
import type { Body } from "../types.js";

export const setBodyName = "set_body";

export const setBodySchema = z.object({
  id: z.string(),
  name: z.string(),
  mass: z.number().positive(),
  radius: z.number().positive(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  velocity: z.tuple([z.number(), z.number(), z.number()]),
  texture: z.string(),
  color: z.string(),
  rings: z.object({
    innerRadius: z.number().positive(),
    outerRadius: z.number().positive(),
    texture: z.string(),
  }).nullable().optional(),
});

export function setBody(input: z.infer<typeof setBodySchema>): string {
  const body: Body = {
    ...input,
    rings: input.rings ?? null,
  };
  applyBody(body);
  broadcast({ type: "set_body", payload: body });
  return `Body "${input.name}" (id: ${input.id}) set at position [${input.position.join(", ")}].`;
}
```

- [ ] **Step 2: Write `mcp-servers/orbital/src/tools/controlSim.ts`**

```typescript
import { z } from "zod";
import { broadcast } from "../ws/server.js";
import { applyControl } from "../state.js";

export const controlSimName = "control_sim";

export const controlSimSchema = z.object({
  action: z.enum(["play", "pause", "stop", "reset"]),
  timeScale: z.number().positive().optional(),
});

export function controlSim(input: z.infer<typeof controlSimSchema>): string {
  applyControl(input.action, input.timeScale);
  broadcast({ type: "control_sim", payload: input });
  const scale = input.timeScale ? ` at ${input.timeScale}x time scale` : "";
  return `Simulation ${input.action}${scale}.`;
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add mcp-servers/orbital/src/tools/setBody.ts mcp-servers/orbital/src/tools/controlSim.ts
git commit -m "feat(mcp): add set_body and control_sim tools"
```

---

## Task 10: MCP tools — `get_sim_state` + `set_camera` + `add_label`

**Files:**
- Create: `mcp-servers/orbital/src/tools/getSimState.ts`
- Create: `mcp-servers/orbital/src/tools/setCamera.ts`
- Create: `mcp-servers/orbital/src/tools/addLabel.ts`

- [ ] **Step 1: Write `mcp-servers/orbital/src/tools/getSimState.ts`**

```typescript
import { z } from "zod";
import { getState } from "../state.js";

export const getSimStateName = "get_sim_state";

export const getSimStateSchema = z.object({});

export function getSimState(): string {
  return JSON.stringify(getState(), null, 2);
}
```

- [ ] **Step 2: Write `mcp-servers/orbital/src/tools/setCamera.ts`**

```typescript
import { z } from "zod";
import { broadcast } from "../ws/server.js";
import { applyCamera } from "../state.js";
import type { CameraState } from "../types.js";

export const setCameraName = "set_camera";

export const setCameraSchema = z.object({
  target: z.string(),
  distance: z.number().positive(),
  azimuth: z.number().default(0),
  elevation: z.number().min(-90).max(90).default(15),
});

export function setCamera(input: z.infer<typeof setCameraSchema>): string {
  const camera: CameraState = {
    target: input.target,
    distance: input.distance,
    azimuth: input.azimuth,
    elevation: input.elevation,
  };
  applyCamera(camera);
  broadcast({ type: "set_camera", payload: camera });
  return `Camera aimed at "${input.target}" at distance ${input.distance}, elevation ${input.elevation}°.`;
}
```

- [ ] **Step 3: Write `mcp-servers/orbital/src/tools/addLabel.ts`**

```typescript
import { z } from "zod";
import { broadcast } from "../ws/server.js";
import { applyLabel } from "../state.js";
import type { Label } from "../types.js";

export const addLabelName = "add_label";

export const addLabelSchema = z.object({
  bodyId: z.string(),
  text: z.string(),
  style: z.enum(["default", "highlight", "warning"]).default("default"),
});

export function addLabel(input: z.infer<typeof addLabelSchema>): string {
  const label: Label = {
    bodyId: input.bodyId,
    text: input.text,
    style: input.style,
  };
  applyLabel(label);
  broadcast({ type: "add_label", payload: label });
  return `Label added to body "${input.bodyId}".`;
}
```

- [ ] **Step 4: Type-check**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp type-check
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add mcp-servers/orbital/src/tools/getSimState.ts mcp-servers/orbital/src/tools/setCamera.ts mcp-servers/orbital/src/tools/addLabel.ts
git commit -m "feat(mcp): add get_sim_state, set_camera, and add_label tools"
```

---

## Task 11: Wire all tools into `index.ts`

**Files:**
- Modify: `mcp-servers/orbital/src/index.ts`

- [ ] **Step 1: Replace `mcp-servers/orbital/src/index.ts`**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startWsServer } from "./ws/server.js";

// Existing tools
import { listComponentsName, listComponentsSchema, listComponents } from "./tools/listComponents.js";

// New tools
import { loadSceneName, loadSceneSchema, loadScene } from "./tools/loadScene.js";
import { listScenesName, listScenesSchema, listScenes } from "./tools/listScenes.js";
import { setBodyName, setBodySchema, setBody } from "./tools/setBody.js";
import { controlSimName, controlSimSchema, controlSim } from "./tools/controlSim.js";
import { getSimStateName, getSimStateSchema, getSimState } from "./tools/getSimState.js";
import { setCameraName, setCameraSchema, setCamera } from "./tools/setCamera.js";
import { addLabelName, addLabelSchema, addLabel } from "./tools/addLabel.js";

const server = new McpServer({ name: "orbital", version: "0.1.0" });

// Catalogue tools
server.tool(listComponentsName, listComponentsSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listComponents(), null, 2) }],
}));

server.tool(listScenesName, listScenesSchema.shape, () => ({
  content: [{ type: "text", text: JSON.stringify(listScenes(), null, 2) }],
}));

// Scene control tools
server.tool(loadSceneName, loadSceneSchema.shape, ({ id }) => ({
  content: [{ type: "text", text: loadScene({ id }) }],
}));

server.tool(setBodyName, setBodySchema.shape, (input) => ({
  content: [{ type: "text", text: setBody(input) }],
}));

server.tool(controlSimName, controlSimSchema.shape, (input) => ({
  content: [{ type: "text", text: controlSim(input) }],
}));

server.tool(getSimStateName, getSimStateSchema.shape, () => ({
  content: [{ type: "text", text: getSimState() }],
}));

server.tool(setCameraName, setCameraSchema.shape, (input) => ({
  content: [{ type: "text", text: setCamera(input) }],
}));

server.tool(addLabelName, addLabelSchema.shape, (input) => ({
  content: [{ type: "text", text: addLabel(input) }],
}));

startWsServer();

const transport = new StdioServerTransport();
await server.connect(transport);
console.log("[orbital-mcp] server ready — 8 tools registered");
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp type-check
```

Expected: no errors

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp test
```

Expected: 11 tests passed

- [ ] **Step 4: Commit**

```bash
git add mcp-servers/orbital/src/index.ts
git commit -m "feat(mcp): register all 8 MCP tools in server index"
```

---

## Task 12: Update `apps/sim` WebSocket bridge

**Files:**
- Modify: `apps/sim/src/ws/bridge.ts`

The sim's WebSocket client needs to handle all new message types broadcast by the MCP server.

- [ ] **Step 1: Replace `apps/sim/src/ws/bridge.ts`**

```typescript
import { useSimStore } from "../store/index.js";
import type { WsMessage } from "../../../../mcp-servers/orbital/src/types.js";

// Re-export WsMessage so App.tsx can use it if needed
export type { WsMessage };

let socket: WebSocket | null = null;

export function connectBridge(wsUrl = "ws://localhost:8080"): () => void {
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("[bridge] connected to orbital MCP server");
  };

  socket.onmessage = (event: MessageEvent<string>) => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(event.data) as WsMessage;
    } catch {
      console.warn("[bridge] unparseable message", event.data);
      return;
    }

    const store = useSimStore.getState();

    switch (msg.type) {
      case "load_scene":
        store.loadScene(msg.payload.id);
        break;
      case "set_body":
        store.setBody(msg.payload);
        break;
      case "control_sim":
        store.setPlayback(msg.payload.action === "reset" ? "stopped" : msg.payload.action as "playing" | "paused" | "stopped");
        if (msg.payload.timeScale !== undefined) store.setTimeScale(msg.payload.timeScale);
        if (msg.payload.action === "reset") store.reset();
        break;
      case "set_camera":
        store.setCamera(msg.payload);
        break;
      case "add_label":
        store.addLabel(msg.payload);
        break;
      default:
        console.warn("[bridge] unknown message type:", (msg as { type: string }).type);
    }
  };

  socket.onerror = (e) => console.error("[bridge] error", e);

  socket.onclose = () => {
    console.log("[bridge] disconnected");
    socket = null;
  };

  return () => {
    socket?.close();
    socket = null;
  };
}

export function sendBridgeMessage(msg: WsMessage): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("[bridge] socket not open, dropping message:", msg.type);
    return;
  }
  socket.send(JSON.stringify(msg));
}
```

- [ ] **Step 2: Update `apps/sim/src/store/index.ts`** to add the new actions the bridge calls

```typescript
import { create } from "zustand";
import type { Body, Label, CameraState } from "../../../../mcp-servers/orbital/src/types.js";

export type { Body, Label, CameraState };

export type PlaybackState = "playing" | "paused" | "stopped";

type SimStore = {
  bodies: Body[];
  labels: Label[];
  camera: CameraState | null;
  playback: PlaybackState;
  timeScale: number;
  simTime: number;
  scene: string | null;
  // Actions
  loadScene: (id: string) => void;
  setBody: (body: Body) => void;
  setPlayback: (state: PlaybackState) => void;
  setTimeScale: (scale: number) => void;
  setCamera: (camera: CameraState) => void;
  addLabel: (label: Label) => void;
  tickTime: (deltaSeconds: number) => void;
  reset: () => void;
};

const INITIAL = {
  bodies: [] as Body[],
  labels: [] as Label[],
  camera: null as CameraState | null,
  playback: "stopped" as PlaybackState,
  timeScale: 1,
  simTime: 0,
  scene: null as string | null,
};

export const useSimStore = create<SimStore>((set) => ({
  ...INITIAL,

  loadScene: (id) => set({ ...INITIAL, scene: id }),

  setBody: (body) =>
    set((s) => {
      const idx = s.bodies.findIndex((b) => b.id === body.id);
      const bodies = idx >= 0
        ? s.bodies.map((b, i) => (i === idx ? body : b))
        : [...s.bodies, body];
      return { bodies };
    }),

  setPlayback: (playback) => set({ playback }),

  setTimeScale: (timeScale) => set({ timeScale }),

  setCamera: (camera) => set({ camera }),

  addLabel: (label) =>
    set((s) => {
      const idx = s.labels.findIndex((l) => l.bodyId === label.bodyId);
      const labels = idx >= 0
        ? s.labels.map((l, i) => (i === idx ? label : l))
        : [...s.labels, label];
      return { labels };
    }),

  tickTime: (deltaSeconds) =>
    set((s) => ({ simTime: s.simTime + deltaSeconds })),

  reset: () => set(INITIAL),
}));
```

- [ ] **Step 3: Type-check the sim app**

```bash
pnpm --filter @astrophysics-playground/sim type-check
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/sim/src/ws/bridge.ts apps/sim/src/store/index.ts
git commit -m "feat(sim): update bridge and store to handle all MCP message types"
```

---

## Final Verification

- [ ] **Verify all skills present**

```bash
ls ~/.claude/skills/
# Expected: scene-builder/  visual-reviewer/  orbital-mechanics/  scene-scripter/  skill-refiner/
```

- [ ] **Verify all MCP tools registered**

```bash
grep "server.tool" mcp-servers/orbital/src/index.ts | wc -l
# Expected: 8
```

- [ ] **Run full MCP test suite**

```bash
pnpm --filter @astrophysics-playground/orbital-mcp test
# Expected: 11 passed
```

- [ ] **Verify CLAUDE.md at project root**

```bash
head -3 CLAUDE.md
# Expected: # Astrophysics Playground — Claude Instructions
```

- [ ] **Verify log files present**

```bash
ls logs/
# Expected: gaps.md  skill-feedback.jsonl
```

- [ ] **Final commit**

```bash
git add logs/
git commit -m "chore: final verification — astrophysics skill system complete"
```
