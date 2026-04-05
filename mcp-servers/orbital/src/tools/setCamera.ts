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
  broadcast("set_camera", camera);
  return `Camera aimed at "${input.target}" at distance ${input.distance}, elevation ${input.elevation}°.`;
}
