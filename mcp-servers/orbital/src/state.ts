import type { Body, Label, CameraState, SimState } from "./types.js";

const INITIAL: SimState = {
  bodies: [],
  labels: [],
  playback: "stopped",
  simTime: 0,
  timeScale: 1,
  scene: null,
  camera: null,
};

let state: SimState = { ...INITIAL };

export function getState(): SimState {
  return {
    ...state,
    bodies: [...state.bodies],
    labels: [...state.labels],
  };
}

export function applyScene(id: string): void {
  state = { ...INITIAL, scene: id };
}

export function applyBody(body: Body): void {
  const idx = state.bodies.findIndex((b) => b.id === body.id);
  if (idx >= 0) {
    const updated = [...state.bodies];
    updated[idx] = body;
    state = { ...state, bodies: updated };
  } else {
    state = { ...state, bodies: [...state.bodies, body] };
  }
}

const ACTION_TO_PLAYBACK: Record<string, SimState["playback"]> = {
  play: "playing",
  pause: "paused",
  stop: "stopped",
};

export function applyControl(action: string, timeScale?: number): void {
  if (action === "reset") {
    state = { ...INITIAL };
    return;
  }
  const playback = ACTION_TO_PLAYBACK[action] ?? (action as SimState["playback"]);
  state = {
    ...state,
    playback,
    ...(timeScale !== undefined ? { timeScale } : {}),
  };
}

export function applyCamera(camera: CameraState): void {
  state = { ...state, camera };
}

export function applyLabel(label: Label): void {
  const idx = state.labels.findIndex((l) => l.bodyId === label.bodyId);
  if (idx >= 0) {
    const updated = [...state.labels];
    updated[idx] = label;
    state = { ...state, labels: updated };
  } else {
    state = { ...state, labels: [...state.labels, label] };
  }
}
