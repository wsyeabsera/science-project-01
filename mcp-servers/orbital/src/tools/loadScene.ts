import { z } from "zod";
import { broadcast } from "../ws/server.js";
import { applyScene, applyBody } from "../state.js";
import { SCENE_BODIES } from "../scenes.js";

export const loadSceneName = "load_scene";

export const loadSceneSchema = z.object({
  id: z.enum(["solar-system", "earth-moon", "custom"]),
});

export function loadScene(input: z.infer<typeof loadSceneSchema>): string {
  applyScene(input.id);
  broadcast("load_scene", { id: input.id });

  const bodies = SCENE_BODIES[input.id] ?? [];
  for (const body of bodies) {
    applyBody(body);
    broadcast("set_body", body);
  }

  return `Scene "${input.id}" loaded — ${bodies.length} bodies broadcast to sim.`;
}
