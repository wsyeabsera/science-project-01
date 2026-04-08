import { create } from "zustand";

type VisibilityStore = {
  orbitPaths: boolean;
  labels: boolean;
  asteroidBelt: boolean;
  setOrbitPaths: (v: boolean) => void;
  setLabels: (v: boolean) => void;
  setAsteroidBelt: (v: boolean) => void;
};

export const useVisibilityStore = create<VisibilityStore>((set) => ({
  orbitPaths: true,
  labels: true,
  asteroidBelt: true,
  setOrbitPaths: (v) => set({ orbitPaths: v }),
  setLabels: (v) => set({ labels: v }),
  setAsteroidBelt: (v) => set({ asteroidBelt: v }),
}));
