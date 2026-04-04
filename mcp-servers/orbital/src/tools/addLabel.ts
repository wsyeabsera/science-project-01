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
