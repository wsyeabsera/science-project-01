import { z } from "zod";

export const listPagesName = "list_pages";

export const listPagesSchema = z.object({});

export type ListPagesResult = {
  pages: Array<{ id: string; title: string; route: string }>;
};

export function listPages(): ListPagesResult {
  return {
    pages: [
      { id: "solar-system", title: "Solar System", route: "/" },
      { id: "earth-moon", title: "Earth–Moon System", route: "/earth-moon" },
      { id: "custom", title: "Custom Simulation", route: "/custom" },
    ],
  };
}
