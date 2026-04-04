export interface Body {
  id: string;
  name: string;
  mass: number; // kg
  radius: number; // Three.js units
  position: [number, number, number]; // Three.js units
  velocity: [number, number, number]; // units/sim-second
  texture: string; // preset name or URL
  color: string; // hex fallback
  rings?: {
    innerRadius: number;
    outerRadius: number;
    texture: string;
  } | null;
}

export interface Label {
  bodyId: string;
  text: string;
  style: "default" | "highlight" | "warning";
}

export interface CameraState {
  target: string; // body id
  distance: number;
  azimuth: number; // degrees
  elevation: number; // degrees
}

export interface SimState {
  bodies: Body[];
  labels: Label[];
  playback: "playing" | "paused" | "stopped";
  simTime: number; // seconds since scene start
  timeScale: number; // sim-seconds per real second
  scene: string | null;
  camera: CameraState | null;
}

export type WsMessage =
  | { type: "load_scene"; payload: { id: string } }
  | { type: "set_body"; payload: Body }
  | { type: "control_sim"; payload: { action: "play" | "pause" | "stop" | "reset"; timeScale?: number } }
  | { type: "set_camera"; payload: CameraState }
  | { type: "add_label"; payload: Label };
