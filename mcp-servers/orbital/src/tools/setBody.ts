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
  broadcast("set_body", body);
  return `Body "${input.name}" (id: ${input.id}) set at position [${input.position.join(", ")}].`;
}
