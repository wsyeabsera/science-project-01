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
