import { create } from "zustand";
import type { Body, Label, CameraState } from "../../../../mcp-servers/orbital/src/types.js";

export type { Body, Label, CameraState };

export type PlaybackState = "playing" | "paused" | "stopped";

type SimStore = {
  bodies: Body[];
  labels: Label[];
  camera: CameraState | null;
  playback: PlaybackState;
  timeScale: number;
  simTime: number;
  scene: string | null;
  // Actions
  loadScene: (id: string) => void;
  setBody: (body: Body) => void;
  setPlayback: (state: PlaybackState) => void;
  setTimeScale: (scale: number) => void;
  setCamera: (camera: CameraState) => void;
  addLabel: (label: Label) => void;
  tickTime: (deltaSeconds: number) => void;
  reset: () => void;
};

const INITIAL = {
  bodies: [] as Body[],
  labels: [] as Label[],
  camera: null as CameraState | null,
  playback: "stopped" as PlaybackState,
  timeScale: 1,
  simTime: 0,
  scene: null as string | null,
};

export const useSimStore = create<SimStore>((set) => ({
  ...INITIAL,

  loadScene: (id) => set({ ...INITIAL, scene: id }),

  setBody: (body) =>
    set((s) => {
      const idx = s.bodies.findIndex((b) => b.id === body.id);
      const bodies = idx >= 0
        ? s.bodies.map((b, i) => (i === idx ? body : b))
        : [...s.bodies, body];
      return { bodies };
    }),

  setPlayback: (playback) => set({ playback }),

  setTimeScale: (timeScale) => set({ timeScale }),

  setCamera: (camera) => set({ camera }),

  addLabel: (label) =>
    set((s) => {
      const idx = s.labels.findIndex((l) => l.bodyId === label.bodyId);
      const labels = idx >= 0
        ? s.labels.map((l, i) => (i === idx ? label : l))
        : [...s.labels, label];
      return { labels };
    }),

  tickTime: (deltaSeconds) =>
    set((s) => ({ simTime: s.simTime + deltaSeconds })),

  reset: () => set(INITIAL),
}));
