import { z } from "zod";

export const listComponentsName = "list_components";

export const listComponentsSchema = z.object({});

export type ListComponentsResult = {
  components: Array<{ name: string; package: string; description: string }>;
};

export function listComponents(): ListComponentsResult {
  return {
    components: [
      {
        name: "StarField",
        package: "@astrophysics-playground/ui",
        description: "Animated 3D star field using Three.js Points.",
      },
      {
        name: "GlobeViewer",
        package: "@astrophysics-playground/ui",
        description: "Interactive Cesium globe via Resium.",
      },
    ],
  };
}
