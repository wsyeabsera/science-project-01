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
