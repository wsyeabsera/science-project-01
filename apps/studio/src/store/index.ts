import { create } from "zustand";

export type ComponentNode = {
  id: string;
  type: "starfield" | "globe" | "orbit";
  label: string;
};

type StudioStore = {
  nodes: ComponentNode[];
  selectedId: string | null;
  addNode: (node: ComponentNode) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
};

export const useStudioStore = create<StudioStore>((set) => ({
  nodes: [],
  selectedId: null,
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (id) =>
    set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),
  selectNode: (id) => set({ selectedId: id }),
}));
