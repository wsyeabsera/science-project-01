import { z } from "zod";
import { getState } from "../state.js";

export const getSimStateName = "get_sim_state";

export const getSimStateSchema = z.object({});

export function getSimState(): string {
  return JSON.stringify(getState(), null, 2);
}
