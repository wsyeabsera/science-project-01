import { create } from "zustand";

export type Body = {
  id: string;
  name: string;
  mass: number; // kg
  position: [number, number, number]; // meters from barycenter
  velocity: [number, number, number]; // m/s
};

export type PlaybackState = "playing" | "paused" | "stopped";

type SimStore = {
  bodies: Body[];
  playback: PlaybackState;
  simTime: number; // seconds since epoch
  setBodies: (bodies: Body[]) => void;
  setPlayback: (state: PlaybackState) => void;
  tickTime: (deltaSeconds: number) => void;
};

export const useSimStore = create<SimStore>((set) => ({
  bodies: [],
  playback: "stopped",
  simTime: 0,
  setBodies: (bodies) => set({ bodies }),
  setPlayback: (playback) => set({ playback }),
  tickTime: (deltaSeconds) =>
    set((s) => ({ simTime: s.simTime + deltaSeconds })),
}));
