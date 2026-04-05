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
  broadcast("control_sim", input);
  const scale = input.timeScale ? ` at ${input.timeScale}x time scale` : "";
  return `Simulation ${input.action}${scale}.`;
}
