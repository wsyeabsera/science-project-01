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
