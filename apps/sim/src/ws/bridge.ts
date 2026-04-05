import { io, type Socket } from "socket.io-client";
import { useSimStore } from "../store/index.js";
import type { Body, Label, CameraState } from "../../../../mcp-servers/orbital/src/types.js";

export type { Body, Label, CameraState };

let socket: Socket | null = null;

export function connectBridge(serverUrl = "http://localhost:8080"): () => void {
  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
  });

  socket.on("connect", () => {
    console.log("[bridge] connected to orbital MCP server", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[bridge] disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[bridge] connection error:", err.message);
  });

  const store = () => useSimStore.getState();

  socket.on("load_scene", (payload: { id: string }) => {
    store().loadScene(payload.id);
  });

  socket.on("set_body", (payload: Body) => {
    store().setBody(payload);
  });

  socket.on("control_sim", (payload: { action: "play" | "pause" | "stop" | "reset"; timeScale?: number }) => {
    const playbackMap: Record<string, "playing" | "paused" | "stopped"> = {
      play: "playing",
      pause: "paused",
      stop: "stopped",
      reset: "stopped",
    };
    store().setPlayback(playbackMap[payload.action] ?? "stopped");
    if (payload.timeScale !== undefined) store().setTimeScale(payload.timeScale);
    if (payload.action === "reset") store().reset();
  });

  socket.on("set_camera", (payload: CameraState) => {
    store().setCamera(payload);
  });

  socket.on("add_label", (payload: Label) => {
    store().addLabel(payload);
  });

  return () => {
    socket?.disconnect();
    socket = null;
  };
}

export function sendBridgeMessage(event: string, payload: unknown): void {
  if (!socket?.connected) {
    console.warn("[bridge] socket not connected, dropping:", event);
    return;
  }
  socket.emit(event, payload);
}
